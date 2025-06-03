import pandas as pd
import re

def check_inconsistencies(text, tables):
    """
    Analyze extracted text and tables for financial inconsistencies.
    Args:
        text (str): Extracted text from the document.
        tables (list): List of pandas DataFrames from extracted tables.
    Returns:
        list: List of detected inconsistencies.
    """
    inconsistencies = []
    
    try:
        # Helper function to parse INR values
        def parse_inr(value):
            if value is None:
                return None
            # Remove commas and convert to float
            return float(value.replace(',', '')) if value else 0.0
        
        # Check 1: Balance Sheet Equation (Assets = Liabilities + Equity)
        assets = liabilities = equity = None
        asset_match = re.search(r'Total Assets: INR\s*([\d,]+)', text)
        liabilities_match = re.search(r'Liabilities: INR\s*([\d,]+)', text)
        equity_match = re.search(r'Equity: INR\s*([\d,]+)', text)
        
        if asset_match and liabilities_match and equity_match:
            assets = parse_inr(asset_match.group(1))
            liabilities = parse_inr(liabilities_match.group(1))
            equity = parse_inr(equity_match.group(1))
            if not abs(assets - (liabilities + equity)) < 0.01:
                inconsistencies.append(f"Balance sheet mismatch: Assets ({assets:,.0f}) ≠ Liabilities ({liabilities:,.0f}) + Equity ({equity:,.0f}) = {liabilities + equity:,.0f}")
        
        # Check 2: Asset Composition
        cash_match = re.search(r'Cash: INR\s*([\d,]+)', text)
        receivables_match = re.search(r'Accounts Receivable: INR\s*([\d,]+)', text)
        inventory_match = re.search(r'Inventory: INR\s*([\d,]+)', text)
        ppe_match = re.search(r'Property, Plant & Equipment: INR\s*([\d,]+)', text)
        
        cash = parse_inr(cash_match.group(1)) if cash_match else None
        receivables = parse_inr(receivables_match.group(1)) if receivables_match else None
        inventory = parse_inr(inventory_match.group(1)) if inventory_match else None
        ppe = parse_inr(ppe_match.group(1)) if ppe_match else None
        
        if all(v is not None for v in [cash, receivables, inventory, ppe, assets]):
            asset_sum = cash + receivables + inventory + ppe
            if not abs(assets - asset_sum) < 0.01:
                inconsistencies.append(f"Asset composition mismatch: Sum of individual assets ({asset_sum:,.0f}) ≠ Total Assets ({assets:,.0f})")
        
        # Check 3: Negative balances - Fixed regex pattern
        # Look for patterns like "Account Name: -INR amount"
        negative_matches = re.findall(r'([^:\n]+?):\s*-INR\s*([\d,]+(?:\.\d+)?)', text)
        for account, value in negative_matches:
            account = account.strip()
            parsed_value = parse_inr(value)
            # Check if it's an account that shouldn't typically be negative
            if any(keyword in account.lower() for keyword in ['cash', 'revenue', 'assets']):
                inconsistencies.append(f"Negative values detected in {account} (-INR {parsed_value:,.0f})")
            elif 'retained earnings' in account.lower():
                inconsistencies.append(f"Negative Retained Earnings detected (-INR {parsed_value:,.0f}) - indicates accumulated losses")
            elif 'loan payable' in account.lower():
                inconsistencies.append(f"Negative Loan Payable detected (-INR {parsed_value:,.0f}) - unusual, may indicate misclassification")
        
        # Check 4: Misplaced income statement items
        if re.search(r'\b(Revenue|Expenses)\b', text, re.IGNORECASE):
            inconsistencies.append("Revenue or Expenses detected on balance sheet, which typically belong on an income statement")
        
        # Check 5: Liabilities composition and validation
        accounts_payable_match = re.search(r'Accounts Payable: INR\s*([\d,]+)', text)
        loan_payable_match = re.search(r'Loan Payable: (-?)INR\s*([\d,]+)', text)
        
        accounts_payable = parse_inr(accounts_payable_match.group(1)) if accounts_payable_match else None
        
        # Handle loan payable - check if it has negative sign
        loan_payable = None
        if loan_payable_match:
            loan_amount = parse_inr(loan_payable_match.group(2))
            if loan_payable_match.group(1) == '-':
                loan_payable = -loan_amount  # Keep as negative if explicitly negative
            else:
                loan_payable = loan_amount
        
        # Check liabilities composition
        if accounts_payable is not None and loan_payable is not None and liabilities is not None:
            # For liability calculation, loan payable should be positive (it's a liability)
            loan_payable_for_calc = abs(loan_payable) if loan_payable < 0 else loan_payable
            liability_sum = accounts_payable + loan_payable_for_calc
            
            if not abs(liabilities - liability_sum) < 0.01:
                inconsistencies.append(f"Liabilities composition mismatch: Sum of liabilities ({liability_sum:,.0f}) ≠ Total Liabilities ({liabilities:,.0f})")
            
            # Check if accounts payable exceeds total liabilities (unusual)
            if accounts_payable > liabilities:
                inconsistencies.append(f"Accounts Payable ({accounts_payable:,.0f}) exceeds Total Liabilities ({liabilities:,.0f}), which is unusual")

        # Check if accounts payable is unusually high relative to assets
        if accounts_payable is not None and assets is not None and accounts_payable > 0.5 * assets:
            inconsistencies.append(f"Accounts Payable ({accounts_payable:,.0f}) is unusually high relative to Total Assets ({assets:,.0f})")        
        
        # Check 6: Net income analysis
        revenue_match = re.search(r'Revenue: INR\s*([\d,]+)', text)
        expenses_match = re.search(r'Expenses: INR\s*([\d,]+)', text)
        
        revenue = parse_inr(revenue_match.group(1)) if revenue_match else None
        expenses = parse_inr(expenses_match.group(1)) if expenses_match else None
        
        if revenue is not None and expenses is not None:
            net_income = revenue - expenses
            if net_income < 0:
                inconsistencies.append(f"Negative net income detected: Revenue ({revenue:,.0f}) - Expenses ({expenses:,.0f}) = {net_income:,.0f}")
        
        # Check 7: Consistency between negative retained earnings and net loss
        retained_earnings_match = re.search(r'Retained Earnings:\s*-INR\s*([\d,]+)', text)
        if retained_earnings_match and revenue is not None and expenses is not None and expenses > revenue:
            inconsistencies.append("Negative Retained Earnings is consistent with reported net loss")
        
        # Check 8: Table-based checks (if tables exist)
        for i, table in enumerate(tables):
            try:
                # Convert table to numeric where possible
                numeric_table = table.apply(pd.to_numeric, errors='coerce')
                
                # Check for negative values in inappropriate accounts
                for col in numeric_table.columns:
                    if any(keyword in str(col).lower() for keyword in ['cash', 'revenue']) and not 'retained' in str(col).lower():
                        negative_values = numeric_table[col] < 0
                        if negative_values.any():
                            inconsistencies.append(f"Negative values detected in table column '{col}'")
                
                # Check balance sheet equation in tables
                assets_col = liabilities_col = equity_col = None
                for col in numeric_table.columns:
                    col_lower = str(col).lower()
                    if 'asset' in col_lower and 'total' in col_lower:
                        assets_col = col
                    elif 'liabilit' in col_lower and 'total' in col_lower:
                        liabilities_col = col
                    elif 'equity' in col_lower and 'total' in col_lower:
                        equity_col = col
                
                if assets_col and liabilities_col and equity_col:
                    table_assets = numeric_table[assets_col].sum()
                    table_liabilities = numeric_table[liabilities_col].sum()
                    table_equity = numeric_table[equity_col].sum()
                    
                    if not abs(table_assets - (table_liabilities + table_equity)) < 0.01:
                        inconsistencies.append(f"Balance sheet mismatch in table {i+1}: Assets ({table_assets:,.0f}) ≠ Liabilities ({table_liabilities:,.0f}) + Equity ({table_equity:,.0f})")
                        
            except Exception as e:
                inconsistencies.append(f"Error processing table {i+1}: {str(e)}")
        
        # Check 9: Missing or zero values in tables
        for i, table in enumerate(tables):
            if table.empty:
                inconsistencies.append(f"Empty table {i+1} detected")
            elif table.isna().all().all():
                inconsistencies.append(f"Table {i+1} contains only missing values")
    
    except Exception as e:
        print(f"Error checking inconsistencies: {str(e)}")
        inconsistencies.append(f"Error during inconsistency checks: {str(e)}")
    
    return inconsistencies if inconsistencies else ["No inconsistencies detected"]

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
Loan Payable: -INR 100,000
Page 1 | Generated on 2025-05-31"""
    
    sample_table = pd.DataFrame({
        'Assets': [1500000, None],
        'Liabilities': [600000, None],
        'Equity': [700000, None],
        'Cash': [-500, 1000]
    })
    
    inconsistencies = check_inconsistencies(sample_text, [sample_table])
    print("Detected Inconsistencies:")
    for i, inconsistency in enumerate(inconsistencies, 1):
        print(f"{i}. {inconsistency}")