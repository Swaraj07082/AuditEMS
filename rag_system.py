import logging
import ollama
import json
from typing import Dict, List, Any
from sentence_transformers import SentenceTransformer
import chromadb

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FinancialRAGSystem:
    def __init__(self, model_name: str = "llama3:8b"):
        self.model_name = model_name
        self.available_models = []
        self.selected_model = None
        self._initialize_model()

        # Initialize ChromaDB
        self.chroma_client = chromadb.Client()
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        self.collection = self.chroma_client.get_or_create_collection(name="financial_docs")

        # Knowledge base
        self.knowledge_base = {
            "balance_sheet_rules": [
                "Assets must equal Liabilities plus Equity",
                "All asset accounts should have positive balances unless specifically contra accounts",
                "Current assets should be listed before non-current assets",
                "Liabilities should be classified as current or non-current"
            ],
            "common_errors": [
                "Misclassification of income statement items on balance sheet",
                "Incorrect calculation of totals and subtotals",
                "Missing or incorrect account balances",
                "Improper presentation of negative balances"
            ],
            "audit_procedures": [
                "Verify mathematical accuracy of all calculations",
                "Confirm proper account classifications",
                "Review supporting documentation for significant balances",
                "Assess reasonableness of account balances"
            ]
        }

    def _initialize_model(self):
        try:
            available_models = ollama.list()
            self.available_models = [model['name'] for model in available_models.get('models', [])]
            logger.info(f"Available Ollama models: {self.available_models}")

            model_variants = [
                self.model_name,
                f"{self.model_name}:latest",
                "llama3:8b",
                "llama3:latest",
                "llama3.1:8b",
                "llama3.1:latest",
                "llama3.2:3b"
            ]
            for variant in model_variants:
                if variant in self.available_models:
                    self.selected_model = variant
                    logger.info(f"Selected model: {self.selected_model}")
                    break

            if not self.selected_model:
                raise ValueError("No suitable Ollama model found.")
        except Exception as e:
            logger.error(f"Model initialization failed: {e}")
            raise

    def call_llama3(self, prompt: str, temperature: float = 0.7, max_tokens: int = 500) -> str:
        if not self.selected_model:
            raise ValueError("No model available")

        try:
            response = ollama.generate(
                model=self.selected_model,
                prompt=prompt,
                options={
                    'temperature': temperature,
                    'num_predict': max_tokens,
                    'top_p': 0.9,
                    'stop': ['</response>', '\n\n---']
                }
            )
            return response['response'].strip()
        except Exception as e:
            logger.error(f"Llama3 call failed: {e}")
            raise

    def get_relevant_context(self, inconsistencies: List[str]) -> Dict[str, List[str]]:
        relevant_context = {
            "rules": [],
            "errors": [],
            "procedures": []
        }

        for inconsistency in inconsistencies:
            inconsistency_lower = inconsistency.lower()
            if any(k in inconsistency_lower for k in ['balance sheet', 'assets', 'liabilities', 'equity']):
                relevant_context["rules"].extend(self.knowledge_base["balance_sheet_rules"])
            if any(k in inconsistency_lower for k in ['mismatch', 'violation', 'misplaced']):
                relevant_context["errors"].extend(self.knowledge_base["common_errors"])
            relevant_context["procedures"].extend(self.knowledge_base["audit_procedures"])

        for key in relevant_context:
            relevant_context[key] = list(set(relevant_context[key]))
        return relevant_context

    def store_in_chroma(self, text: str, metadata: dict = None):
        """Embed and store a document chunk in ChromaDB"""
        embedding = self.embedding_model.encode(text).tolist()
        self.collection.add(
            documents=[text],
            embeddings=[embedding],
            ids=[f"doc_{str(hash(text))}"],
            metadatas=[metadata or {}]
        )

    def query_chroma(self, query: str, top_k: int = 3) -> List[str]:
        """Query ChromaDB for semantically similar chunks"""
        embedding = self.embedding_model.encode(query).tolist()
        result = self.collection.query(query_embeddings=[embedding], n_results=top_k)
        return result["documents"][0] if result.get("documents") else []

    def generate_rag_response(self, document_text: str, inconsistencies: List[str]) -> Dict[str, Any]:
        try:
            context = self.get_relevant_context(inconsistencies)
            retrieved_chunks = self.query_chroma(" ".join(inconsistencies))

            prompt = f"""You are a financial auditing expert. Analyze the following financial document and inconsistencies:

DOCUMENT EXCERPT:
{document_text[:1500]}

IDENTIFIED INCONSISTENCIES:
{chr(10).join(f'• {inc}' for inc in inconsistencies)}

RETRIEVED KNOWLEDGE:
{chr(10).join(f'• {chunk}' for chunk in retrieved_chunks)}

AUDITING CONTEXT:
Rules: {'; '.join(context['rules'][:3])}
Errors: {'; '.join(context['errors'][:3])}
Procedures: {'; '.join(context['procedures'][:3])}

Provide a comprehensive analysis that:
1. Explains the significance of each inconsistency
2. Identifies potential root causes
3. Assesses the impact on financial statement reliability
4. Suggests specific corrective actions

Keep response under 400 words and focus on practical audit insights."""

            enhanced_analysis = self.call_llama3(prompt, temperature=0.3, max_tokens=400)
            return {
                'response': enhanced_analysis,
                'context_sources': len(context['rules']) + len(context['errors']) + len(context['procedures']),
                'model_used': self.selected_model
            }

        except Exception as e:
            logger.error(f"RAG response generation failed: {e}")
            return {
                'response': f"Enhanced analysis unavailable: {str(e)}",
                'context_sources': 0,
                'model_used': None,
                'error': str(e)
            }

    def generate_recommendations(self, inconsistencies: List[str]) -> str:
        try:
            context = self.get_relevant_context(inconsistencies)
            prompt = f"""As a financial auditing expert, provide 5 specific, actionable audit recommendations for these inconsistencies:

INCONSISTENCIES:
{chr(10).join(f'• {inc}' for inc in inconsistencies)}

AUDIT CONTEXT:
{chr(10).join(f'• {proc}' for proc in context['procedures'][:5])}

Format your response as:
1. [Specific recommendation]
2. [Specific recommendation]
...

Focus on practical, implementable actions that address root causes."""

            recommendations = self.call_llama3(prompt, temperature=0.2, max_tokens=300)
            return recommendations

        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return self._generate_fallback_recommendations(inconsistencies)

    def _generate_fallback_recommendations(self, inconsistencies: List[str]) -> str:
        recommendations = []
        for i, inconsistency in enumerate(inconsistencies[:5], 1):
            if 'balance sheet equation' in inconsistency.lower():
                recommendations.append(f"{i}. Reconcile all balance sheet accounts to ensure mathematical accuracy")
            elif 'asset composition' in inconsistency.lower():
                recommendations.append(f"{i}. Verify individual asset account balances and reclassify if necessary")
            elif 'income statement' in inconsistency.lower():
                recommendations.append(f"{i}. Review account classifications and move income statement items to proper statements")
            elif 'negative' in inconsistency.lower():
                recommendations.append(f"{i}. Investigate and correct negative account balances")
            else:
                recommendations.append(f"{i}. Review and verify the accuracy of reported financial data")
        return "\n".join(recommendations) if recommendations else "No specific recommendations available"


# -------- Test Script --------
def test_rag_system():
    rag = FinancialRAGSystem()

    # Store context samples
    rag.store_in_chroma("Assets must always equal liabilities and equity in a balance sheet")
    rag.store_in_chroma("A negative asset balance must be reviewed, especially if it’s not a contra asset")
    rag.store_in_chroma("Misclassification of income leads to misleading profit metrics")

    sample_inconsistencies = [
        "Balance sheet equation violation: Assets (1,500,000) ≠ Liabilities (600,000) + Equity (700,000)",
        "Asset composition mismatch: Individual assets sum (1,400,000) ≠ Total Assets (1,500,000)"
    ]
    sample_text = """Sample Company - Balance Sheet (FY 2023)
Total Assets: INR 1,500,000
Liabilities: INR 600,000
Equity: INR 700,000"""

    result = rag.generate_rag_response(sample_text, sample_inconsistencies)
    print("🧠 RAG Analysis:\n", result['response'])
    print("🔎 Context Sources Used:", result['context_sources'])

    recs = rag.generate_recommendations(sample_inconsistencies)
    print("\n✅ Recommendations:\n", recs)

if __name__ == "__main__":
    test_rag_system()
