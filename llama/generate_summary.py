import logging
import ollama
from typing import Dict, Any

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def generate_audit_summary(text: str, inconsistencies_dict: Dict[str, Any], model_name: str = "llama3:8b") -> str:
    """
    Generate an AI-powered audit summary using the specified model.
    Falls back to a basic summary if the model fails.
    """
    try:
        # Check if Ollama is available and get models
        try:
            available_models = ollama.list()
            model_names = [model['name'] for model in available_models.get('models', [])]
            logger.info(f"Available models: {model_names}")
        except Exception as e:
            logger.error(f"Failed to get available models: {e}")
            raise ValueError(f"Ollama service not available: {e}")

        # Try different model name variations
        model_variants = [
            model_name,
            f"{model_name}:latest",
            "llama3:8b",
            "llama3:latest",
            "llama3.1:8b",
            "llama3.1:latest"
        ]
        
        selected_model = None
        for variant in model_variants:
            if variant in model_names:
                selected_model = variant
                break
        
        if not selected_model:
            logger.warning(f"None of the model variants found: {model_variants}")
            logger.warning(f"Available models: {model_names}")
            raise ValueError(f"No suitable model found. Available: {model_names}")

        # Extract inconsistencies
        basic_inconsistencies = inconsistencies_dict.get('basic_inconsistencies', [])
        rag_analysis = inconsistencies_dict.get('rag_analysis', '')
        recommendations = inconsistencies_dict.get('recommendations', '')
        error = inconsistencies_dict.get('error', '')
        
        # Prepare prompt
        prompt = f"""Generate a concise audit summary (150-200 words) for the following financial document analysis:
        
Document Text (excerpt): {text[:1000]}
Inconsistencies Found: {basic_inconsistencies}
RAG Analysis: {rag_analysis}
Recommendations: {recommendations}
Error (if any): {error}

Summary should highlight key findings, their implications, and recommended actions. Ensure professional tone."""
        
        logger.info(f"Generating AI audit summary with model: {selected_model}")
        
        # Call the model with error handling
        try:
            response = ollama.generate(
                model=selected_model,
                prompt=prompt,
                options={
                    'temperature': 0.3,
                    'num_predict': 300,  # Use num_predict instead of max_tokens
                    'top_p': 0.9
                }
            )
            
            summary = response['response'].strip()
            logger.info("AI audit summary generated successfully")
            
            return summary
            
        except Exception as model_error:  
            logger.error(f"Model generation failed: {model_error}")
            raise model_error
    
    except Exception as e:
        logger.error(f"Failed to generate AI audit summary: {str(e)}")
        
        # Enhanced fallback summary
        inconsistency_count = len(inconsistencies_dict.get('basic_inconsistencies', []))
        enhanced_status = inconsistencies_dict.get('enhanced', False)
        
        fallback_summary = f"""
AUDIT SUMMARY - AUTOMATED ANALYSIS

Total Inconsistencies: {inconsistency_count}
Analysis Status: {'Enhanced with RAG' if enhanced_status else 'Basic Analysis Only'}

Key Findings:
{chr(10).join(f'• {inc}' for inc in inconsistencies_dict.get('basic_inconsistencies', [])[:3])}

Critical Actions Required:
• Verify balance sheet equation compliance
• Review account classifications and mappings  
• Validate financial data accuracy and completeness
• Consider professional audit review for complex issues

System Note: AI-powered insights unavailable - {str(e)}
Recommendation: Manual review recommended for comprehensive analysis.
        """.strip()
        
        return fallback_summary

def test_ollama_connection():
    """Test function to verify Ollama connection"""
    try:
        models = ollama.list()
        logger.info("Ollama connection successful")
        logger.info(f"Available models: {[m['name'] for m in models.get('models', [])]}")
        return True
    except Exception as e:
        logger.error(f"Ollama connection failed: {e}")
        return False

if __name__ == "__main__":
    # Test Ollama connection first
    if test_ollama_connection():
        
        sample_text = """Sample Company - Balance Sheet (FY 2023)
Total Assets: INR 1,500,000
Liabilities: INR 600,000
Equity: INR 700,000"""
        
        sample_inconsistencies = {
            "basic_inconsistencies": ["Balance sheet equation violation: Assets (1,500,000) ≠ Liabilities (600,000) + Equity (700,000)"],
            "rag_analysis": "No additional analysis available",
            "recommendations": "Verify all account balances",
            "enhanced": False,
            "error": ""
        }
        
        logger.info("Testing audit summary generation")
        summary = generate_audit_summary(sample_text, sample_inconsistencies, model_name="llama3:8b")
        logger.info("Generated Summary:\n%s", summary)
    else:
        logger.error("Cannot test summary generation - Ollama not available")