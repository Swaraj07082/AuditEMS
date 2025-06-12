import os
import logging
import sys
from flask import Flask, request, render_template
from werkzeug.utils import secure_filename
import pdfplumber  # Placeholder for PDF extraction
from llama.generate_summary import generate_audit_summary  # Updated import
from auditing.check_logic import check_inconsistencies  # Updated import

# Debug: Print module search path
logger = logging.getLogger(__name__)
logger.info("Python module search path: %s", sys.path)

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "Uploads")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'pdf'}

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_and_tables(file_path: str) -> tuple[str, list]:
    """
    Placeholder function to extract text and tables from a PDF.
    Replace with your actual implementation from extraction.pdf_extractor.
    """
    try:
        text = ""
        tables = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
                page_tables = page.extract_tables()
                if page_tables:
                    tables.extend(page_tables)
        return text, tables
    except Exception as e:
        logger.error("Error extracting text and tables: %s", str(e))
        raise

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            logger.warning("No file uploaded in request")
            return render_template('error.html', message="No file uploaded"), 400
        
        file = request.files['file']
        if file.filename == '':
            logger.warning("No file selected")
            return render_template('error.html', message="No file selected"), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            try:
                # Extract text and tables
                logger.info("Extracting text and tables from %s", file_path)
                text, tables = extract_text_and_tables(file_path)
                
                # Check for inconsistencies
                logger.info("Checking inconsistencies")
                inconsistencies_dict = check_inconsistencies(text, tables)
                
                # Generate summary
                logger.info("Generating audit summary")
                summary = generate_audit_summary(text, inconsistencies_dict, model_name="llama3:8b")
                
                # Render results
                return render_template(
                    'results.html',
                    text=text[:2000],  # Increased limit for display
                    inconsistencies=inconsistencies_dict.get('basic_inconsistencies', []),
                    rag_analysis=inconsistencies_dict.get('rag_analysis', ''),
                    recommendations=inconsistencies_dict.get('recommendations', ''),
                    enhanced=inconsistencies_dict.get('enhanced', False),
                    error=inconsistencies_dict.get('error', ''),
                    summary=summary
                )
            
            finally:
                # Clean up uploaded file
                try:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        logger.info("Removed uploaded file: %s", file_path)
                except Exception as e:
                    logger.error("Error removing file %s: %s", file_path, str(e))
        
        else:
            logger.warning("Invalid file type: %s", file.filename)
            return render_template('error.html', message="Only PDF files are allowed"), 400
    
    except Exception as e:
        logger.error("Error processing request: %s", str(e))
        return render_template('error.html', message=f"Error processing file: {str(e)}"), 500

if __name__ == "__main__":
    app.run(
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "False").lower() == "true"
    )