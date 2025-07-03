import os
import logging
import sys
import asyncio
from concurrent.futures import ThreadPoolExecutor
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import pdfplumber
from llama.generate_summary import generate_audit_summary
from auditing.check_logic import check_inconsistencies
from flask_cors import CORS
import redis
import hashlib
import json
import time

# Enhanced logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('audit_app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Configuration
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "Uploads")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'pdf'}

# Thread pool for async processing
executor = ThreadPoolExecutor(max_workers=4)

# Redis for caching (optional - comment out if not using Redis)
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    REDIS_AVAILABLE = True
    logger.info("Redis connection established")
except:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available - caching disabled")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_hash(file_path: str) -> str:
    """Generate hash for file caching"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def extract_text_and_tables(file_path: str) -> tuple[str, list]:
    """Optimized PDF extraction with better error handling"""
    try:
        text = ""
        tables = []
        
        with pdfplumber.open(file_path) as pdf:
            # Process pages in batches to reduce memory usage
            for page in pdf.pages:
                try:
                    # Extract text more efficiently
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                    
                    # Extract tables with settings optimized for financial data
                    page_tables = page.extract_tables(
                        table_settings={
                            "vertical_strategy": "lines",
                            "horizontal_strategy": "lines",
                            "min_words_vertical": 1,
                            "min_words_horizontal": 1
                        }
                    )
                    if page_tables:
                        tables.extend(page_tables)
                        
                except Exception as e:
                    logger.warning(f"Error processing page: {e}")
                    continue
                    
        return text, tables
        
    except Exception as e:
        logger.error(f"Error extracting text and tables: {e}")
        raise

def process_audit_analysis(text: str, tables: list, model_name: str = "llama3:8b") -> dict:
    """Process audit analysis with optimizations"""
    start_time = time.time()
    
    try:
        # Run inconsistency check and summary generation in parallel
        def run_inconsistency_check():
            return check_inconsistencies(text, tables)
        
        def run_summary_generation():
            return generate_audit_summary(text, {}, model_name=model_name)
        
        # Execute both tasks concurrently
        inconsistencies_future = executor.submit(run_inconsistency_check)
        
        # Get inconsistencies first
        inconsistencies_dict = inconsistencies_future.result()
        
        # Generate summary with inconsistencies context
        summary = generate_audit_summary(text, inconsistencies_dict, model_name=model_name)
        
        processing_time = time.time() - start_time
        logger.info(f"Analysis completed in {processing_time:.2f} seconds")
        
        return {
            "inconsistencies": inconsistencies_dict,
            "summary": summary,
            "processing_time": processing_time
        }
        
    except Exception as e:
        logger.error(f"Error in audit analysis: {e}")
        raise

@app.route('/upload', methods=['POST'])
def upload_file():
    """Optimized file upload with caching and async processing"""
    start_time = time.time()
    
    try:
        # Validate request
        if 'file' not in request.files:
            return jsonify({'error': "No file uploaded"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not (file and allowed_file(file.filename)):
            return jsonify({"error": "Only PDF files are allowed"}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # Check cache first
            file_hash = get_file_hash(file_path)
            cache_key = f"audit_result:{file_hash}"
            
            cached_result = None
            if REDIS_AVAILABLE:
                try:
                    cached_result = redis_client.get(cache_key)
                    if cached_result:
                        logger.info("Returning cached result")
                        cached_data = json.loads(cached_result)
                        cached_data['cached'] = True
                        return jsonify(cached_data), 200
                except Exception as e:
                    logger.warning(f"Cache read error: {e}")
            
            # Extract text and tables
            logger.info("Extracting text and tables...")
            text, tables = extract_text_and_tables(file_path)
            
            # Get model from request or use default
            model_name = request.form.get('model', 'llama3:8b')
            
            # Process analysis
            logger.info("Starting audit analysis...")
            analysis_result = process_audit_analysis(text, tables, model_name)
            
            # Prepare response
            response_data = {
                "text": text[:2000],  # First 2000 chars for preview
                "inconsistencies": analysis_result["inconsistencies"].get('basic_inconsistencies', []),
                "rag_analysis": analysis_result["inconsistencies"].get('rag_analysis', ''),
                "recommendations": analysis_result["inconsistencies"].get('recommendations', ''),
                "enhanced": analysis_result["inconsistencies"].get('enhanced', False),
                "error": analysis_result["inconsistencies"].get('error', ''),
                "summary": analysis_result["summary"],
                "filename": filename,
                "status": "success"
            }
            
            # Cache result
            if REDIS_AVAILABLE:
                try:
                    redis_client.setex(cache_key, 3600, json.dumps(response_data))  # Cache for 1 hour
                except Exception as e:
                    logger.warning(f"Cache write error: {e}")
            
            logger.info(f"Total processing time: {time.time() - start_time:.2f} seconds")
            return jsonify(response_data), 200
            
        finally:
            # Clean up uploaded file
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Removed uploaded file: {file_path}")
            except Exception as e:
                logger.error(f"Error removing file {file_path}: {e}")
    
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@app.route('/models', methods=['GET'])
def get_available_models():
    """Endpoint to get available Ollama models"""
    try:
        import subprocess
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True)
        models = []
        for line in result.stdout.split('\n')[1:]:  # Skip header
            if line.strip():
                model_name = line.split()[0]
                models.append(model_name)
        return jsonify({"models": models}), 200
    except Exception as e:
        logger.error(f"Error getting models: {e}")
        return jsonify({"error": "Could not retrieve models"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "redis_available": REDIS_AVAILABLE,
        "timestamp": time.time()
    }), 200

if __name__ == "__main__":
    app.run(
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "False").lower() == "true",
        threaded=True
    )
