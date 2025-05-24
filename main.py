import pdfplumber
import os
import json
import pandas as pd
import argparse
from datetime import datetime
import re
from tabulate import tabulate

def extract_pdf_pages(pdf_path, start_page, end_page, output_format='text'):
    """
    Extract text and tables from specified pages of a PDF file using pdfplumber
    """
    extracted_data = {}
    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            print(f"PDF has {total_pages} total pages")
            
            start_idx = max(0, start_page - 1)
            end_idx = min(total_pages - 1, end_page - 1)
            
            for page_num in range(start_idx, end_idx + 1):
                try:
                    page = pdf.pages[page_num]
                    # Extract text with layout preservation
                    text = page.extract_text(layout=True)
                    extracted_data[page_num + 1] = {'text': text.strip() if text else '', 'tables': []}
                    print(f"Extracted text from page {page_num + 1}: {'Yes' if text and len(text.strip()) > 0 else 'No'}")
                    
                    # Extract and store tables
                    tables = page.extract_tables()
                    if tables:
                        for table in tables:
                            # Clean table: replace None with '', preserve content
                            cleaned_table = [[str(cell) if cell else '' for cell in row] for row in table]
                            # Skip redundant header rows
                            if cleaned_table and cleaned_table[0][0].strip().lower() in ['audit team', 'site specific information', 'iso 9001', 'audit conclusion']:
                                cleaned_table = cleaned_table[1:] if len(cleaned_table) > 1 else cleaned_table
                            extracted_data[page_num + 1]['tables'].append(cleaned_table)
                        print(f"Extracted {len(tables)} table(s) from page {page_num + 1}")
                    else:
                        print(f"No tables extracted from page {page_num + 1}")
                    
                    # Debug: Print extracted content
                    print(f"\nDEBUG: Content of page {page_num + 1}:\n{'=' * 50}\nText:\n{extracted_data[page_num + 1]['text']}\nTables:\n{extracted_data[page_num + 1]['tables']}\n{'=' * 50}\n")
                
                except Exception as e:
                    print(f"Error processing page {page_num + 1}: {e}")
                    extracted_data[page_num + 1] = {'text': '', 'tables': []}
        
        print(f"DEBUG: Extracted pages: {list(extracted_data.keys())}")
        save_output(extracted_data, pdf_path, start_page, end_page, output_format)
        return extracted_data
    
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return {}

def save_output(data, pdf_path, start_page, end_page, output_format):
    """
    Save extracted data in specified format(s) with tabular formatting and PDF-like styling
    """
    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_base = f"{base_name}_pages_{start_page}-{end_page}_{timestamp}"
    
    formats_to_save = []
    if output_format.lower() == 'all':
        formats_to_save = ['text', 'json', 'csv', 'excel']
    else:
        formats_to_save = [output_format.lower()]
    
    for fmt in formats_to_save:
        try:
            if fmt == 'text':
                with open(f"{output_base}.txt", 'w', encoding='utf-8') as f:
                    for page_num in range(start_page, end_page + 1):
                        f.write(f"\n{'=' * 50}\nPAGE {page_num}\n{'=' * 50}\n\n")
                        page_data = data.get(page_num, {'text': '', 'tables': []})
                        # Write text with preserved spacing and simulated bold
                        f.write("Text Content:\n")
                        if page_data['text']:
                            text_lines = page_data['text'].split('\n')
                            for i, line in enumerate(text_lines):
                                # Simulate bold for headings
                                if any(keyword in line.lower() for keyword in ['audit team', 'audit conclusion', 'annex 1', 'audit summary', 'audit report', 'management service', 'site specific information', 'iso 9001', 'audit objectives']):
                                    f.write(f"**{line.strip()}**\n")
                                else:
                                    f.write(f"{line}\n")
                                # Reduce excessive empty lines
                                if i < len(text_lines) - 1 and line.strip() == '' and text_lines[i + 1].strip() == '':
                                    continue
                            f.write("\n")
                        else:
                            f.write("(No text content)\n\n")
                        # Write tables
                        f.write("Tables:\n")
                        if page_data['tables']:
                            for idx, table in enumerate(page_data['tables'], 1):
                                if table and any(cell.strip() for row in table for cell in row):
                                    # Calculate column widths safely
                                    try:
                                        col_count = max(len(row) for row in table)
                                        col_widths = []
                                        for i in range(col_count):
                                            max_width = max(len(str(row[i] if i < len(row) else '')) for row in table)
                                            col_widths.append(min(max_width + 2, 50))
                                        f.write(f"Table {idx}:\n")
                                        f.write(tabulate(table, headers='firstrow', tablefmt='fancy_grid', maxcolwidths=col_widths) + "\n\n")
                                    except Exception as e:
                                        f.write(f"Table {idx}: (Error rendering table: {e})\n\n")
                                else:
                                    f.write(f"Table {idx}: (Empty)\n\n")
                        else:
                            f.write("(No tables)\n\n")
                print(f"Saved text output to {output_base}.txt")
            
            elif fmt == 'json':
                json_data = {k: {'text': v['text'], 'tables': v['tables']} for k, v in data.items()}
                with open(f"{output_base}.json", 'w', encoding='utf-8') as f:
                    json.dump(json_data, f, indent=2, ensure_ascii=False)
                print(f"Saved JSON output to {output_base}.json")
            
            elif fmt == 'csv':
                rows = []
                for page_num in range(start_page, end_page + 1):
                    page_data = data.get(page_num, {'text': '', 'tables': []})
                    rows.append([page_num, page_data['text'], json.dumps(page_data['tables'])])
                df = pd.DataFrame(rows, columns=['Page', 'Text', 'Tables'])
                df.to_csv(f"{output_base}.csv", index=False, encoding='utf-8')
                print(f"Saved CSV output to {output_base}.csv")
            
            elif fmt == 'excel':
                rows = []
                for page_num in range(start_page, end_page + 1):
                    page_data = data.get(page_num, {'text': '', 'tables': []})
                    rows.append([page_num, page_data['text'], json.dumps(page_data['tables'])])
                df = pd.DataFrame(rows, columns=['Page', 'Text', 'Tables'])
                df.to_excel(f"{output_base}.xlsx", index=False)
                print(f"Saved Excel output to {output_base}.xlsx")
        
        except Exception as e:
            print(f"Error saving {fmt} output: {e}")

def extract_audit_findings(page_data):
    """
    Parse audit findings from the extracted text and tables
    """
    findings = {
        "nonconformities": [],
        "opportunities_for_improvement": [],
        "positive_aspects": [],
        "audit_details": {}
    }
    
    # Combine text and table data
    text = page_data['text']
    for table in page_data['tables']:
        table_text = "\n".join([" | ".join(cell for cell in row) for row in table])
        text += "\n" + table_text
    
    # Normalize text for regex (preserve newlines for table rows)
    text = re.sub(r'\s*\n\s*', '\n', text.strip())
    
    # Debug: Print raw text
    print(f"DEBUG: Raw text for parsing page {page_data.get('page_num', 'unknown')}:\n{text[:500]}...\n")
    
    # Parse audit team
    audit_team_match = re.search(r"Audit Team.*?\n\s*Function\s*\|?\s*Name\s*\|?\s*\n\s*Lead Auditor\s*\|?\s*([^\|\n]*?)(?:\s*\|?\s*Auditor\s*\|?\s*([^\|\n]*?))?(?:\n|$)", text, re.DOTALL | re.IGNORECASE)
    if audit_team_match:
        findings["audit_details"]["lead_auditor"] = audit_team_match.group(1).strip()
        if audit_team_match.group(2):
            findings["audit_details"]["auditor"] = audit_team_match.group(2).strip()
        print("DEBUG: Found audit team")
    else:
        print("DEBUG: No audit team match")
    
    # Parse nonconformities count
    nc_match = re.search(r"Type and number of audit findings.*?\n\s*(?:Major\s*nonconformities\s*\|?\s*(\d+).*?\n\s*Minor\s*nonconformities\s*\|?\s*(\d+).*?\n\s*Opportunities for\s*improvement\s*\|?\s*(\d+).*?\n\s*Positive aspects\s*\|?\s*(\d+))", text, re.DOTALL | re.IGNORECASE)
    if nc_match:
        findings["audit_details"]["major_nonconformities"] = int(nc_match.group(1))
        findings["audit_details"]["minor_nonconformities"] = int(nc_match.group(2))
        findings["audit_details"]["opportunities_for_improvement"] = int(nc_match.group(3))
        findings["audit_details"]["positive_aspects"] = int(nc_match.group(4))
        print("DEBUG: Found nonconformities count")
    else:
        print("DEBUG: No nonconformities count match")
    
    # Parse specific nonconformity details
    nc_details = re.findall(r"Clause\s*no\.\s*\|?\s*([^\|\n]*?)\s*\n\s*([^\|\n]*?)\s*\n\s*Finding:\s*([^\n]*?)\s*\n\s*Supporting audit evidence:\s*([^\n]*?)(?:\n\s*Clause no\.|\n\n|$)", text, re.DOTALL | re.IGNORECASE)
    for clause, process, finding, evidence in nc_details:
        findings["nonconformities"].append({
            "clause": clause.strip(),
            "process": process.strip(),
            "finding": finding.strip(),
            "evidence": evidence.strip()
        })
        print("DEBUG: Found nonconformity")
    if not nc_details:
        print("DEBUG: No nonconformity details match")
    
    # Parse opportunities for improvement and positive aspects
    opp_match = re.findall(r"Clause\s*no\.\s*\|?\s*([^\|\n]*?)\s*\n\s*([^\|\n]*?)\s*\n\s*(?:Finding|Description):\s*([^\n]*?)\s*\n\s*Type\s*\|?\s*(I|P)\s*(?:\n|$)", text, re.DOTALL | re.IGNORECASE)
    for clause, process, statement, type_ in opp_match:
        entry = {
            "clause": clause.strip(),
            "process": process.strip(),
            "statement": statement.strip()
        }
        if type_.upper() == "I":
            findings["opportunities_for_improvement"].append(entry)
            print("DEBUG: Found opportunity for improvement")
        elif type_.upper() == "P":
            findings["positive_aspects"].append(entry)
            print("DEBUG: Found positive aspect")
    if not opp_match:
        print("DEBUG: No opportunities/positive aspects match")
    
    return findings

def main():
    parser = argparse.ArgumentParser(description='Extract text from specific pages of a PDF file')
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('--start', type=int, default=11, help='Starting page number (default: 11)')
    parser.add_argument('--end', type=int, default=21, help='Ending page number (default: 21)')
    parser.add_argument('--format', choices=['text', 'json', 'csv', 'excel', 'all'], 
                       default='text', help='Output format (default: text)')
    parser.add_argument('--analyze', action='store_true', 
                       help='Attempt to analyze and structure audit findings')
    
    args = parser.parse_args()
    
    # Extract data from PDF
    extracted_data = extract_pdf_pages(args.pdf_path, args.start, args.end, args.format)
    
    if args.analyze and extracted_data:
        print("\nAnalyzing audit findings...")
        for page_num, page_data in extracted_data.items():
            page_data['page_num'] = page_num
            findings = extract_audit_findings(page_data)
            print(f"Page {page_num} findings: {json.dumps(findings, indent=2)}")

if __name__ == "__main__":
    main()