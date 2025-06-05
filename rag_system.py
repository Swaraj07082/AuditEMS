import os
import json
import numpy as np
from typing import List, Dict, Any, Optional
import pandas as pd
from dataclasses import dataclass
import requests
import sqlite3
from datetime import datetime
import logging

# Vector database imports
try:
    import chromadb
    from chromadb.config import Settings
except ImportError:
    print("ChromaDB not installed. Install with: pip install chromadb")

# Text processing imports
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("SentenceTransformers not installed. Install with: pip install sentence-transformers")

@dataclass
class FinancialDocument:
    """Structure for financial documents"""
    id: str
    content: str
    doc_type: str  # balance_sheet, income_statement, cash_flow
    company_name: str
    year: str
    metadata: Dict[str, Any]

class FinancialRAGSystem:
    """RAG system for financial audit using Llama3"""
    
    def __init__(self, 
                 ollama_base_url: str = "http://localhost:11434",
                 model_name: str = "llama3:8b",
                 embedding_model: str = "all-MiniLM-L6-v2"):
        
        self.ollama_url = ollama_base_url
        self.model_name = model_name
        self.embedding_model_name = embedding_model
        
        # Initialize embedding model
        try:
            self.embedding_model = SentenceTransformer(embedding_model)
        except Exception as e:
            print(f"Error loading embedding model: {e}")
            self.embedding_model = None
            
        # Initialize vector database
        self.setup_vector_db()
        
        # Initialize knowledge base
        self.setup_knowledge_base()
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def setup_vector_db(self):
        """Initialize ChromaDB for vector storage"""
        try:
            # Create ChromaDB client
            self.chroma_client = chromadb.PersistentClient(path="./financial_rag_db")
            
            # Create collections for different document types
            self.collections = {
                'financial_docs': self.chroma_client.get_or_create_collection(
                    name="financial_documents",
                    metadata={"description": "Financial statements and reports"}
                ),
                'audit_rules': self.chroma_client.get_or_create_collection(
                    name="audit_rules",
                    metadata={"description": "Accounting standards and audit rules"}
                ),
                'inconsistency_patterns': self.chroma_client.get_or_create_collection(
                    name="inconsistency_patterns",
                    metadata={"description": "Known financial inconsistency patterns"}
                )
            }
            
        except Exception as e:
            print(f"Error setting up vector database: {e}")
            self.collections = {}
    
    def setup_knowledge_base(self):
        """Initialize knowledge base with financial audit rules"""
        audit_rules = [
            {
                "rule": "Balance Sheet Equation",
                "content": "Assets must equal Liabilities plus Equity (A = L + E). Any deviation indicates fundamental accounting errors.",
                "category": "fundamental_equation"
            },
            {
                "rule": "Asset Classification",
                "content": "Current assets should be convertible to cash within one year. Non-current assets are long-term investments.",
                "category": "classification"
            },
            {
                "rule": "Liability Recognition",
                "content": "Liabilities represent obligations to pay. They should typically have positive balances. Negative liabilities may indicate errors.",
                "category": "liability_rules"
            },
            {
                "rule": "Retained Earnings",
                "content": "Retained earnings can be negative (accumulated deficit) if company has cumulative losses over time.",
                "category": "equity_rules"
            },
            {
                "rule": "Revenue Recognition",
                "content": "Revenue should be recognized when earned, not when cash is received. Revenue belongs on Income Statement, not Balance Sheet.",
                "category": "revenue_rules"
            },
            {
                "rule": "Expense Matching",
                "content": "Expenses should be matched with related revenues in the same period. Expenses belong on Income Statement.",
                "category": "expense_rules"
            }
        ]
        
        self.add_audit_rules(audit_rules)
    
    def add_financial_document(self, document: FinancialDocument):
        """Add financial document to vector database"""
        try:
            if not self.embedding_model or 'financial_docs' not in self.collections:
                return False
                
            # Create embeddings
            embedding = self.embedding_model.encode(document.content).tolist()
            
            # Add to ChromaDB
            self.collections['financial_docs'].add(
                embeddings=[embedding],
                documents=[document.content],
                metadatas=[{
                    'doc_type': document.doc_type,
                    'company_name': document.company_name,
                    'year': document.year,
                    **document.metadata
                }],
                ids=[document.id]
            )
            
            self.logger.info(f"Added document {document.id} to vector database")
            return True
            
        except Exception as e:
            self.logger.error(f"Error adding document: {e}")
            return False
    
    def add_audit_rules(self, rules: List[Dict]):
        """Add audit rules to knowledge base"""
        try:
            if not self.embedding_model or 'audit_rules' not in self.collections:
                return False
                
            for i, rule in enumerate(rules):
                embedding = self.embedding_model.encode(rule['content']).tolist()
                
                self.collections['audit_rules'].add(
                    embeddings=[embedding],
                    documents=[rule['content']],
                    metadatas=[{
                        'rule_name': rule['rule'],
                        'category': rule['category']
                    }],
                    ids=[f"rule_{i}_{rule['category']}"]
                )
                
            self.logger.info(f"Added {len(rules)} audit rules to knowledge base")
            return True
            
        except Exception as e:
            self.logger.error(f"Error adding audit rules: {e}")
            return False
    
    def retrieve_relevant_context(self, query: str, n_results: int = 5) -> Dict[str, List]:
        """Retrieve relevant context from vector database"""
        try:
            if not self.embedding_model:
                return {"documents": [], "metadatas": []}
                
            # Create query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Search across all collections
            all_results = {"documents": [], "metadatas": [], "sources": []}
            
            for collection_name, collection in self.collections.items():
                try:
                    results = collection.query(
                        query_embeddings=[query_embedding],
                        n_results=min(n_results, collection.count() if collection.count() > 0 else 1)
                    )
                    
                    if results['documents'] and results['documents'][0]:
                        all_results["documents"].extend(results['documents'][0])
                        all_results["metadatas"].extend(results['metadatas'][0])
                        all_results["sources"].extend([collection_name] * len(results['documents'][0]))
                        
                except Exception as e:
                    self.logger.warning(f"Error querying collection {collection_name}: {e}")
                    continue
            
            return all_results
            
        except Exception as e:
            self.logger.error(f"Error retrieving context: {e}")
            return {"documents": [], "metadatas": [], "sources": []}
    
    def call_llama3(self, prompt: str, temperature: float = 0.1) -> str:
        """Call Llama3 via Ollama API"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "top_p": 0.9,
                        "max_tokens": 2048
                    }
                },
                timeout=120
            )
            
            if response.status_code == 200:
                return response.json().get('response', '')
            else:
                self.logger.error(f"Ollama API error: {response.status_code}")
                return "Error: Unable to get response from Llama3"
                
        except Exception as e:
            self.logger.error(f"Error calling Llama3: {e}")
            return f"Error: {str(e)}"
    
    def generate_rag_response(self, 
                            financial_data: str, 
                            inconsistencies: List[str],
                            question: str = None) -> str:
        """Generate RAG-enhanced audit response"""
        
        # Create search query from inconsistencies and financial data
        search_query = f"financial audit inconsistencies balance sheet {' '.join(inconsistencies[:3])}"
        
        # Retrieve relevant context
        context = self.retrieve_relevant_context(search_query, n_results=5)
        
        # Build context string
        context_str = ""
        if context["documents"]:
            context_str = "\n\nRelevant Audit Knowledge:\n"
            for i, (doc, metadata, source) in enumerate(zip(context["documents"], 
                                                           context["metadatas"], 
                                                           context["sources"])):
                context_str += f"\n{i+1}. [{source}] {doc[:200]}...\n"
        
        # Create enhanced prompt
        prompt = f"""You are a financial audit expert analyzing a company's financial statements.

FINANCIAL DATA:
{financial_data}

DETECTED INCONSISTENCIES:
{chr(10).join(f'• {inc}' for inc in inconsistencies)}
{context_str}

TASK: Provide a comprehensive audit analysis that:
1. Explains each inconsistency in detail
2. Assesses the severity and potential impact
3. Suggests possible causes and corrections
4. Recommends next steps for the auditor
5. References relevant accounting standards where applicable

Focus on being precise, professional, and actionable. Use the provided audit knowledge to support your analysis.

AUDIT ANALYSIS:"""

        # Generate response using Llama3
        response = self.call_llama3(prompt, temperature=0.1)
        
        return response
    
    def process_financial_document_with_rag(self, 
                                          document_content: str,
                                          inconsistencies: List[str],
                                          doc_metadata: Dict = None) -> Dict[str, Any]:
        """Process financial document with RAG enhancement"""
        
        # Add document to vector database for future reference
        if doc_metadata:
            doc = FinancialDocument(
                id=f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                content=document_content,
                doc_type=doc_metadata.get('doc_type', 'unknown'),
                company_name=doc_metadata.get('company_name', 'Unknown'),
                year=doc_metadata.get('year', '2023'),
                metadata=doc_metadata
            )
            self.add_financial_document(doc)
        
        # Generate RAG-enhanced analysis
        rag_analysis = self.generate_rag_response(
            document_content, 
            inconsistencies
        )
        
        # Generate specific recommendations
        recommendation_prompt = f"""Based on these financial inconsistencies:
{chr(10).join(f'• {inc}' for inc in inconsistencies)}

Provide 5 specific, actionable recommendations for the auditor:"""
        
        recommendations = self.call_llama3(recommendation_prompt, temperature=0.2)
        
        return {
            "rag_analysis": rag_analysis,
            "recommendations": recommendations,
            "context_used": len(self.retrieve_relevant_context(
                f"audit inconsistencies {' '.join(inconsistencies[:2])}"
            )["documents"]),
            "timestamp": datetime.now().isoformat()
        }

# Example usage and integration
class EnhancedFinancialAuditor:
    """Enhanced financial auditor with RAG capabilities"""
    
    def __init__(self):
        self.rag_system = FinancialRAGSystem()
        
    def audit_with_rag(self, financial_text: str, detected_inconsistencies: List[str]) -> Dict:
        """Perform audit with RAG enhancement"""
        
        # Process with RAG
        rag_results = self.rag_system.process_financial_document_with_rag(
            document_content=financial_text,
            inconsistencies=detected_inconsistencies,
            doc_metadata={
                'doc_type': 'balance_sheet',
                'company_name': 'Sample Company',
                'year': '2023',
                'audit_date': datetime.now().isoformat()
            }
        )
        
        return {
            "original_inconsistencies": detected_inconsistencies,
            "rag_enhanced_analysis": rag_results["rag_analysis"],
            "recommendations": rag_results["recommendations"],
            "context_sources_used": rag_results["context_used"]
        }

# Example usage
if __name__ == "__main__":
    # Sample data from your current system
    sample_text = """Sample Company - Balance Sheet (FY 2023)
Total Assets: INR 1,500,000
Liabilities: INR 600,000
Equity: INR 700,000
Cash: INR 200,000
Accounts Receivable: INR 400,000
Inventory: INR 300,000
Property, Plant & Equipment: INR 500,000
Accounts Payable: INR 700,000
Revenue: INR 1,000,000
Expenses: INR 1,200,000
Retained Earnings: -INR 50,000
Loan Payable: -INR 100,000"""
    
    sample_inconsistencies = [
        "Balance sheet mismatch: Assets (1,500,000) ≠ Liabilities (600,000) + Equity (700,000) = 1,300,000",
        "Asset composition mismatch: Sum of individual assets (1,400,000) ≠ Total Assets (1,500,000)",
        "Liabilities composition mismatch: Sum of liabilities (800,000) ≠ Total Liabilities (600,000)",
        "Negative Retained Earnings detected (-INR 50,000) - indicates accumulated losses",
        "Revenue or Expenses detected on balance sheet, which typically belong on an income statement"
    ]
    
    # Initialize enhanced auditor
    auditor = EnhancedFinancialAuditor()
    
    # Perform RAG-enhanced audit
    results = auditor.audit_with_rag(sample_text, sample_inconsistencies)
    
    print("RAG-Enhanced Audit Results:")
    print("=" * 50)
    print(results["rag_enhanced_analysis"])
    print("\n" + "=" * 50)
    print("Recommendations:")
    print(results["recommendations"])