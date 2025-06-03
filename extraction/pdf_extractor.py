import pdfplumber
import pandas as pd
import os
from io import StringIO

def extract_text_and_tables(file_path):
    """
    Extract text and tables from a financial document (PDF or text file).
    Returns a tuple of (full_text, list_of_tables).
    """
    try:
        # Check file extension
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            full_text = ""
            tables = []
            
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    # Extract text
                    full_text += page.extract_text() or ""
                    
                    # Extract tables
                    page_tables = page.extract_tables()
                    for table in page_tables:
                        # Convert table to DataFrame
                        df = pd.DataFrame(table[1:], columns=table[0] if table else None)
                        tables.append(df)
            
            return full_text, tables
        
        elif file_extension == '.txt':
            with open(file_path, 'r', encoding='utf-8') as file:
                full_text = file.read()
            return full_text, []
        
        else:
            raise ValueError("Unsupported file format. Use PDF or TXT.")
    
    except Exception as e:
        print(f"Error extracting from {file_path}: {str(e)}")
        return "", []

if __name__ == "__main__":
    # Example usage
    file_path = "sample_financial_document.pdf"
    text, tables = extract_text_and_tables(file_path)
    print("Extracted Text:", text[:500])  # Print first 500 chars
    for i, table in enumerate(tables):
        print(f"Table {i+1}:\n", table)