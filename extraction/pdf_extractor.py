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






# import PyPDF2
# import fitz  # PyMuPDF
# import pandas as pd
# import camelot
# import tabula
# import logging
# from typing import Dict, List, Any, Optional, Tuple
# import io
# from PIL import Image
# import pdfplumber
# import re

# # Setup logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# class FinancialPDFExtractor:
#     """Extract text and tables from financial PDF documents"""
    
#     def __init__(self):
#         self.supported_formats = ['.pdf']
        
#     def extract_text_with_pdfplumber(self, pdf_file) -> str:
#         """Extract text using pdfplumber (most reliable for financial docs)"""
#         try:
#             text_content = ""
#             with pdfplumber.open(pdf_file) as pdf:
#                 for page in pdf.pages:
#                     page_text = page.extract_text()
#                     if page_text:
#                         text_content += page_text + "\n"
#             return text_content
#         except Exception as e:
#             logger.error(f"PDFPlumber extraction failed: {e}")
#             return ""
    
#     def extract_text_with_pymupdf(self, pdf_file) -> str:
#         """Fallback text extraction using PyMuPDF"""
#         try:
#             text_content = ""
#             pdf_document = fitz.open(stream=pdf_file.read(), filetype="pdf")
#             pdf_file.seek(0)  # Reset file pointer
            
#             for page_num in range(pdf_document.page_count):
#                 page = pdf_document[page_num]
#                 text_content += page.get_text() + "\n"
            
#             pdf_document.close()
#             return text_content
#         except Exception as e:
#             logger.error(f"PyMuPDF extraction failed: {e}")
#             return ""
    
#     def extract_tables_with_camelot(self, pdf_file) -> List[pd.DataFrame]:
#         """Extract tables using Camelot (best for structured tables)"""
#         try:
#             # Save uploaded file temporarily for camelot
#             import tempfile
#             import os
            
#             with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
#                 tmp_file.write(pdf_file.read())
#                 tmp_file_path = tmp_file.name
            
#             pdf_file.seek(0)  # Reset file pointer
            
#             # Extract tables
#             tables = camelot.read_pdf(tmp_file_path, pages='all', flavor='lattice')
            
#             # Clean up temporary file
#             os.unlink(tmp_file_path)
            
#             # Convert to list of DataFrames
#             extracted_tables = []
#             for table in tables:
#                 if not table.df.empty:
#                     # Clean the DataFrame
#                     df = table.df.copy()
#                     # Remove empty rows and columns
#                     df = df.dropna(how='all').dropna(axis=1, how='all')
#                     if not df.empty:
#                         extracted_tables.append(df)
            
#             return extracted_tables
            
#         except Exception as e:
#             logger.error(f"Camelot table extraction failed: {e}")
#             return []
    
#     def extract_tables_with_tabula(self, pdf_file) -> List[pd.DataFrame]:
#         """Fallback table extraction using Tabula"""
#         try:
#             import tempfile
#             import os
            
#             with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
#                 tmp_file.write(pdf_file.read())
#                 tmp_file_path = tmp_file.name
            
#             pdf_file.seek(0)  # Reset file pointer
            
#             # Extract tables
#             tables = tabula.read_pdf(tmp_file_path, pages='all', multiple_tables=True)
            
#             # Clean up temporary file
#             os.unlink(tmp_file_path)
            
#             # Filter and clean tables
#             extracted_tables = []
#             for table in tables:
#                 if isinstance(table, pd.DataFrame) and not table.empty:
#                     # Clean the DataFrame
#                     df = table.dropna(how='all').dropna(axis=1, how='all')
#                     if not df.empty:
#                         extracted_tables.append(df)
            
#             return extracted_tables
            
#         except Exception as e:
#             logger.error(f"Tabula table extraction failed: {e}")
#             return []
    
#     def detect_financial_sections(self, text: str) -> Dict[str, str]:
#         """Identify different financial statement sections"""
#         sections = {
#             'balance_sheet': '',
#             'income_statement': '',
#             'cash_flow': '',
#             'notes': ''
#         }
        
#         # Patterns for different sections
#         patterns = {
#             'balance_sheet': r'(?i)(balance\s+sheet|statement\s+of\s+financial\s+position|assets\s+and\s+liabilities)',
#             'income_statement': r'(?i)(income\s+statement|profit\s+and\s+loss|statement\s+of\s+comprehensive\s+income)',
#             'cash_flow': r'(?i)(cash\s+flow\s+statement|statement\s+of\s+cash\s+flows)',
#             'notes': r'(?i)(notes\s+to\s+financial\s+statements|notes\s+to\s+accounts)'
#         }
        
#         text_lines = text.split('\n')
#         current_section = None
        
#         for line in text_lines:
#             # Check if line indicates a new section
#             for section_name, pattern in patterns.items():
#                 if re.search(pattern, line):
#                     current_section = section_name
#                     break
            
#             # Add line to current section
#             if current_section:
#                 sections[current_section] += line + '\n'
        
#         return sections
    
#     def extract_financial_figures(self, text: str) -> Dict[str, Any]:
#         """Extract key financial figures and ratios"""
#         financial_data = {}
        
#         # Patterns for common financial items (INR focused)
#         patterns = {
#             'total_assets': r'Total\s+Assets?\s*:?\s*(?:INR\s*)?([0-9,]+(?:\.[0-9]+)?)',
#             'total_liabilities': r'Total\s+Liabilities?\s*:?\s*(?:INR\s*)?([0-9,]+(?:\.[0-9]+)?)',
#             'total_equity': r'(?:Total\s+)?(?:Shareholders?\s+)?Equity\s*:?\s*(?:INR\s*)?([0-9,]+(?:\.[0-9]+)?)',
#             'revenue': r'(?:Total\s+)?Revenue\s*:?\s*(?:INR\s*)?([0-9,]+(?:\.[0-9]+)?)',
#             'net_income': r'Net\s+(?:Income|Profit)\s*:?\s*(?:INR\s*)?([0-9,]+(?:\.[0-9]+)?)',
#             'cash': r'Cash\s+and\s+Cash\s+Equivalents?\s*:?\s*(?:INR\s*)?([0-9,]+(?:\.[0-9]+)?)',
#         }
        
#         for key, pattern in patterns.items():
#             match = re.search(pattern, text, re.IGNORECASE)
#             if match:
#                 try:
#                     financial_data[key] = float(match.group(1).replace(',', ''))
#                 except ValueError:
#                     logger.warning(f"Could not parse {key}: {match.group(1)}")
        
#         return financial_data
    
#     def process_pdf(self, pdf_file) -> Dict[str, Any]:
#         """Main method to process PDF and extract all relevant information"""
#         logger.info("Starting PDF processing...")
        
#         result = {
#             'text': '',
#             'tables': [],
#             'sections': {},
#             'financial_figures': {},
#             'metadata': {
#                 'extraction_method': '',
#                 'pages_processed': 0,
#                 'tables_found': 0,
#                 'extraction_success': False
#             }
#         }
        
#         try:
#             # Extract text (try pdfplumber first, then PyMuPDF)
#             text = self.extract_text_with_pdfplumber(pdf_file)
#             extraction_method = 'pdfplumber'
            
#             if not text.strip():
#                 logger.info("PDFPlumber failed, trying PyMuPDF...")
#                 text = self.extract_text_with_pymupdf(pdf_file)
#                 extraction_method = 'pymupdf'
            
#             if not text.strip():
#                 raise Exception("No text could be extracted from PDF")
            
#             result['text'] = text
#             result['metadata']['extraction_method'] = extraction_method
            
#             # Extract tables (try Camelot first, then Tabula)
#             tables = self.extract_tables_with_camelot(pdf_file)
#             table_method = 'camelot'
            
#             if not tables:
#                 logger.info("Camelot failed, trying Tabula...")
#                 tables = self.extract_tables_with_tabula(pdf_file)
#                 table_method = 'tabula'
            
#             # Convert DataFrames to dictionaries for JSON serialization
#             result['tables'] = [table.to_dict('records') for table in tables]
#             result['metadata']['tables_found'] = len(tables)
#             result['metadata']['table_extraction_method'] = table_method
            
#             # Identify financial sections
#             result['sections'] = self.detect_financial_sections(text)
            
#             # Extract financial figures
#             result['financial_figures'] = self.extract_financial_figures(text)
            
#             # Count pages (estimate from text)
#             result['metadata']['pages_processed'] = text.count('\f') + 1  # Form feed character typically indicates page break
#             result['metadata']['extraction_success'] = True
            
#             logger.info(f"PDF processing completed successfully - {result['metadata']['pages_processed']} pages, {len(tables)} tables")
            
#         except Exception as e:
#             logger.error(f"PDF processing failed: {e}")
#             result['metadata']['error'] = str(e)
#             result['metadata']['extraction_success'] = False
        
#         return result

# # Helper function for FastAPI integration
# def extract_from_pdf(pdf_file) -> Dict[str, Any]:
#     """Main function to be called from FastAPI"""
#     extractor = FinancialPDFExtractor()
#     return extractor.process_pdf(pdf_file)

# # Test function
# def test_pdf_extractor():
#     """Test the PDF extractor with a sample file"""
#     sample_pdf_path = "sample_financial_statement.pdf"  # Replace with actual path
    
#     try:
#         with open(sample_pdf_path, 'rb') as file:
#             extractor = FinancialPDFExtractor()
#             result = extractor.process_pdf(file)
            
#             print("=== PDF EXTRACTION RESULTS ===")
#             print(f"Extraction Success: {result['metadata']['extraction_success']}")
#             print(f"Pages Processed: {result['metadata']['pages_processed']}")
#             print(f"Tables Found: {result['metadata']['tables_found']}")
#             print(f"Text Length: {len(result['text'])} characters")
#             print(f"Financial Figures: {list(result['financial_figures'].keys())}")
#             print(f"Sections Identified: {list(result['sections'].keys())}")
            
#             # Show first 500 characters of extracted text
#             print("\n=== SAMPLE TEXT ===")
#             print(result['text'][:500] + "..." if len(result['text']) > 500 else result['text'])
            
#     except FileNotFoundError:
#         print(f"Test file {sample_pdf_path} not found. Please provide a valid PDF path for testing.")

# if __name__ == "__main__":
#     test_pdf_extractor()