import ollama

def generate_audit_summary(text, inconsistencies_dict):
    """
    Generate a human-readable summary of audit findings using LLaMA 3.
    Args:
        text (str): Extracted text from the financial document.
        inconsistencies_dict (dict): Dictionary containing inconsistencies, RAG analysis, and recommendations.
    Returns:
        str: Summary of audit findings.
    """
    try:
        # Check available models
        available_models = ollama.list().get('models', [])
        model_name = 'llama3:8b'
        if not any(model['name'] == model_name for model in available_models):
            raise ValueError(f"Model '{model_name}' not found. Available models: {[m['name'] for m in available_models]}")
        
        # Extract components from inconsistencies_dict
        basic_inconsistencies = inconsistencies_dict.get('basic_inconsistencies', ['None'])
        rag_analysis = inconsistencies_dict.get('rag_analysis', '')
        recommendations = inconsistencies_dict.get('recommendations', '')
        enhanced = inconsistencies_dict.get('enhanced', False)
        error = inconsistencies_dict.get('error', '')

        # Prepare prompt
        prompt = (
            "You are a financial auditor. Below is the extracted text from a financial document, "
            "detected inconsistencies, RAG-enhanced analysis, and recommendations. Provide a concise, "
            "professional summary of the findings, highlighting key issues and incorporating RAG analysis "
            "and recommendations. Keep the summary under 300 words.\n\n"
            f"Extracted Text (first 1000 chars):\n{text[:1000]}\n\n"
            f"Detected Inconsistencies:\n{'; '.join(basic_inconsistencies) if basic_inconsistencies else 'None'}\n\n"
            f"RAG-Enhanced Analysis:\n{rag_analysis if rag_analysis else 'Not available'}\n\n"
            f"Recommendations:\n{recommendations if recommendations else 'None provided'}\n\n"
            f"RAG Enhancement Status: {'Successful' if enhanced else 'Failed' + (f' due to: {error}' if error else '')}\n\n"
            "Summary:"
        )
        
        # Call LLaMA 3
        response = ollama.generate(model=model_name, prompt=prompt, options={'num_ctx': 4096})
        summary = response.get('response', 'No summary generated.')
        return summary.strip()
    
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return f"Error: Could not generate summary. Ensure Ollama server is running and model '{model_name}' is installed. ({str(e)})"