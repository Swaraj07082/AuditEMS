from flask import Flask, request, render_template, redirect, url_for
import os
from extraction.pdf_extractor import extract_text_and_tables
from auditing.check_logic import check_inconsistencies
from llama.generate_summary import generate_audit_summary

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "No file uploaded", 400
    
    file = request.files['file']
    if file.filename == '':
        return "No file selected", 400
    
    if file:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        
        # Extract text and tables
        text, tables = extract_text_and_tables(file_path)
        
        # Check for inconsistencies
        inconsistencies = check_inconsistencies(text, tables)
        
        # Generate summary
        summary = generate_audit_summary(text, inconsistencies)
        
        # Clean up uploaded file
        os.remove(file_path)
        
        return render_template('results.html', 
                             text=text[:1000],  # Limit text for display
                             inconsistencies=inconsistencies,
                             summary=summary)
    
    return "Error processing file", 500

if __name__ == '__main__':
    app.run(debug=True)