import ollama

def generate_audit_summary(text, inconsistencies):
    """
    Generate a human-readable summary of audit findings using LLaMA 3.
    Args:
        text (str): Extracted text from the financial document.
        inconsistencies (list): List of detected inconsistencies.
    Returns:
        str: Summary of audit findings.
    """
    try:
        # Check available models
        available_models = ollama.list().get('models', [])
        model_name = 'llama3:8b'
        if not any(model['name'] == model_name for model in available_models):
            raise ValueError(f"Model '{model_name}' not found. Available models: {[m['name'] for m in available_models]}")
        
        # Prepare prompt
        prompt = (
            "You are a financial auditor. Below is the extracted text from a financial document "
            "and detected inconsistencies. Provide a concise, professional summary of the findings, "
            "highlighting key issues and suggesting actions. Keep the summary under 300 words.\n\n"
            f"Extracted Text (first 1000 chars):\n{text[:1000]}\n\n"
            f"Detected Inconsistencies:\n{'; '.join(inconsistencies) if inconsistencies else 'None'}\n\n"
            "Summary:"
        )
        
        # Call LLaMA 3
        response = ollama.generate(model=model_name, prompt=prompt, options={'num_ctx': 4096})
        summary = response.get('response', 'No summary generated.')
        return summary.strip()
    
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return f"Error: Could not generate summary. Ensure Ollama server is running and model '{model_name}' is installed. ({str(e)})"

if __name__ == "__main__":
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
        "Balance sheet mismatch: Assets (1500000.0) ≠ Liabilities (600000.0) + Equity (700000.0)",
        "Asset composition mismatch: Sum of assets (1400000.0) ≠ Total Assets (1500000.0)",
        "Negative values detected in Retained Earnings (-INR 50,000)",
        "Negative values detected in Loan Payable (-INR 100,000)",
        "Revenue or Expenses detected on balance sheet, which typically belong on an income statement",
        "Negative Loan Payable is unusual and may indicate a misclassification or error",
        "Accounts Payable (700000.0) exceeds Total Liabilities (600000.0), which is unusual",
        "Negative net income detected: Expenses (1200000.0) exceed Revenue (1000000.0)",
        "Potential loss or deficit mentioned in text"
    ]
    summary = generate_audit_summary(sample_text, sample_inconsistencies)
    print("Audit Summary:", summary)