import logging
import ollama
from typing import Dict, List, Any
import json

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FinancialRAGSystem:
    """Enhanced Financial RAG System with better error handling"""
    
    def __init__(self, model_name: str = "llama3:8b"):
        self.model_name = model_name
        self.available_models = []
        self.selected_model = None
        self._initialize_model()
        
        # Financial auditing knowledge base
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
        """Initialize and verify model availability"""
        try:
            available_models = ollama.list()
            self.available_models = [model['name'] for model in available_models.get('models', [])]
            logger.info(f"Available Ollama models: {self.available_models}")
            
            # Try different model variations
            model_variants = [
                self.model_name,
                f"{self.model_name}:latest",
                "llama3:8b",
                "llama3:latest", 
                "llama3.1:8b",
                "llama3.1:latest",
                "llama3.2:3b",
                "llama3.2:1b"
            ]
            
            for variant in model_variants:
                if variant in self.available_models:
                    self.selected_model = variant
                    logger.info(f"Selected model: {self.selected_model}")
                    break
            
            if not self.selected_model:
                raise ValueError(f"No suitable model found from {model_variants}")
                
        except Exception as e:
            logger.error(f"Model initialization failed: {e}")
            raise
    
    def call_llama3(self, prompt: str, temperature: float = 0.7, max_tokens: int = 500) -> str:
        """Call Llama3 model with proper error handling"""
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
        """Get relevant context from knowledge base"""
        relevant_context = {
            "rules": [],
            "errors": [],
            "procedures": []
        }
        
        # Match inconsistencies with knowledge base
        for inconsistency in inconsistencies:
            inconsistency_lower = inconsistency.lower()
            
            # Check for balance sheet related issues
            if any(keyword in inconsistency_lower for keyword in ['balance sheet', 'assets', 'liabilities', 'equity']):
                relevant_context["rules"].extend(self.knowledge_base["balance_sheet_rules"])
            
            # Check for common error patterns
            if any(keyword in inconsistency_lower for keyword in ['mismatch', 'violation', 'misplaced']):
                relevant_context["errors"].extend(self.knowledge_base["common_errors"])
            
            # Always include audit procedures
            relevant_context["procedures"].extend(self.knowledge_base["audit_procedures"])
        
        # Remove duplicates
        for key in relevant_context:
            relevant_context[key] = list(set(relevant_context[key]))
        
        return relevant_context
    
    def generate_rag_response(self, document_text: str, inconsistencies: List[str]) -> Dict[str, Any]:
        """Generate enhanced response using RAG"""
        try:
            # Get relevant context
            context = self.get_relevant_context(inconsistencies)
            
            # Prepare enhanced prompt
            prompt = f"""You are a financial auditing expert. Analyze the following financial document and inconsistencies:

DOCUMENT EXCERPT:
{document_text[:1500]}

IDENTIFIED INCONSISTENCIES:
{chr(10).join(f'• {inc}' for inc in inconsistencies)}

RELEVANT AUDITING CONTEXT:
Rules: {'; '.join(context['rules'][:3])}
Common Errors: {'; '.join(context['errors'][:3])}
Procedures: {'; '.join(context['procedures'][:3])}

Provide a comprehensive analysis that:
1. Explains the significance of each inconsistency
2. Identifies potential root causes
3. Assesses the impact on financial statement reliability
4. Suggests specific corrective actions

Keep response under 400 words and focus on practical audit insights."""

            # Generate response
            enhanced_analysis = self.call_llama3(prompt, temperature=0.3, max_tokens=400)
            
            return {
                'response': enhanced_analysis,
                'context_sources': len(context['rules']) + len(context['errors']) + len(context['procedures']),
                'model_used': self.selected_model
            }
            
        except Exception as e:
            logger.error(f"RAG response generation failed: {e}")
            return {
                'response': f"Enhanced analysis unavailable: {str(e)}. Basic inconsistency detection completed successfully.",
                'context_sources': 0,
                'model_used': None,
                'error': str(e)
            }
    
    def generate_recommendations(self, inconsistencies: List[str]) -> str:
        """Generate specific audit recommendations"""
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
        """Generate basic recommendations when AI fails"""
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

# Test function
def test_rag_system():
    """Test the RAG system functionality"""
    try:
        rag = FinancialRAGSystem()
        
        sample_inconsistencies = [
            "Balance sheet equation violation: Assets (1,500,000) ≠ Liabilities (600,000) + Equity (700,000)",
            "Asset composition mismatch: Individual assets sum (1,400,000) ≠ Total Assets (1,500,000)"
        ]
        
        sample_text = """Sample Company - Balance Sheet (FY 2023)
Total Assets: INR 1,500,000
Liabilities: INR 600,000
Equity: INR 700,000"""
        
        result = rag.generate_rag_response(sample_text, sample_inconsistencies)
        print("RAG Analysis:", result['response'])
        print("Context Sources:", result['context_sources'])
        
        recommendations = rag.generate_recommendations(sample_inconsistencies)
        print("Recommendations:", recommendations)
        
        return True
        
    except Exception as e:
        logger.error(f"RAG system test failed: {e}")
        return False

if __name__ == "__main__":
    test_rag_system()