import re
import logging
from typing import List, Dict, Any
from rag_system import FinancialRAGSystem  # Import from Delloite/rag_system.py

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class IntegratedFinancialAuditor:
    """Integrated financial auditor that combines basic checks with RAG enhancement"""
    
    def __init__(self, rag_model_name: str = "llama3:8b"):
        try:
            self.rag_system = FinancialRAGSystem(model_name=rag_model_name)
            self.rag_available = True
        except Exception as e:
            logger.error(f"RAG system initialization failed: {e}")
            self.rag_system = None
            self.rag_available = False
        
    def parse_inr(self, value: str) -> float:
        """Helper function to parse INR values"""
        if value is None:
            return None
        return float(value.replace(',', '')) if value else 0.0
    
    def detect_basic_inconsistencies(self, text: str, tables: list) -> List[Dict[str, Any]]:
        """Detect basic inconsistencies and return structured data"""
        inconsistencies = []
        financial_data = {}
        
        try:
            # Extract financial values
            patterns = {
                'assets': r'Total Assets: INR\s*([\d,]+)',
                'liabilities': r'Liabilities: INR\s*([\d,]+)', 
                'equity': r'Equity: INR\s*([\d,]+)',
                'cash': r'Cash: INR\s*([\d,]+)',
                'receivables': r'Accounts Receivable: INR\s*([\d,]+)',
                'inventory': r'Inventory: INR\s*([\d,]+)',
                'ppe': r'Property, Plant & Equipment: INR\s*([\d,]+)',
                'accounts_payable': r'Accounts Payable: INR\s*([\d,]+)',
                'loan_payable': r'Loan Payable: (-?)INR\s*([\d,]+)',
                'revenue': r'Revenue: INR\s*([\d,]+)',
                'expenses': r'Expenses: INR\s*([\d,]+)',
                'retained_earnings': r'Retained Earnings:\s*(-?)INR\s*([\d,]+)'
            }
            
            # Extract all financial values
            for key, pattern in patterns.items():
                match = re.search(pattern, text)
                if match:
                    if key == 'loan_payable':
                        amount = self.parse_inr(match.group(2))
                        financial_data[key] = -amount if match.group(1) == '-' else amount
                    elif key == 'retained_earnings':
                        amount = self.parse_inr(match.group(2))
                        financial_data[key] = -amount if match.group(1) == '-' else amount
                    else:
                        financial_data[key] = self.parse_inr(match.group(1))
            
            # Check 1: Balance Sheet Equation
            if all(k in financial_data for k in ['assets', 'liabilities', 'equity']):
                assets = financial_data['assets']
                liabilities = financial_data['liabilities'] 
                equity = financial_data['equity']
                
                if not abs(assets - (liabilities + equity)) < 0.01:
                    inconsistencies.append({
                        'type': 'balance_sheet_equation',
                        'severity': 'high',
                        'description': f"Balance sheet equation violation: Assets ({assets:,.0f}) ≠ Liabilities ({liabilities:,.0f}) + Equity ({equity:,.0f})",
                        'values': {'assets': assets, 'liabilities': liabilities, 'equity': equity},
                        'difference': assets - (liabilities + equity)
                    })
            
            # Check 2: Asset Composition Mismatch
            if all(k in financial_data for k in ['cash', 'receivables', 'inventory', 'ppe', 'assets']):
                asset_sum = sum(financial_data[k] for k in ['cash', 'receivables', 'inventory', 'ppe'])
                if not abs(financial_data['assets'] - asset_sum) < 0.01:
                    inconsistencies.append({
                        'type': 'asset_composition',
                        'severity': 'medium',
                        'description': f"Asset composition mismatch: Individual assets sum ({asset_sum:,.0f}) ≠ Total Assets ({financial_data['assets']:,.0f})",
                        'values': {k: financial_data[k] for k in ['cash', 'receivables', 'inventory', 'ppe', 'assets']},
                        'difference': financial_data['assets'] - asset_sum
                    })
            
            # Check 3: Misplaced Income Statement Items
            misplaced_items = []
            if 'revenue' in financial_data:
                misplaced_items.append('revenue')
            if 'expenses' in financial_data:
                misplaced_items.append('expenses')
            if misplaced_items:
                inconsistencies.append({
                    'type': 'misplaced_accounts',
                    'severity': 'high',
                    'description': f"Income statement items found on balance sheet: {', '.join(misplaced_items)}",
                    'values': {k: financial_data[k] for k in misplaced_items}
                })
            
            # Store financial data for RAG context
            self.current_financial_data = financial_data
            
        except Exception as e:
            logger.error(f"Error during basic inconsistency detection: {e}")
            inconsistencies.append({
                'type': 'processing_error',
                'severity': 'high',
                'description': f"Error during basic inconsistency detection: {str(e)}",
                'error': str(e)
            })
        
        return inconsistencies
    
    def enhance_with_rag(self, text: str, basic_inconsistencies: List[Dict], tables: list) -> Dict[str, Any]:
        """Use RAG to enhance and expand inconsistency detection"""
        if not self.rag_available:
            logger.warning("RAG system not available")
            return {
                'basic_inconsistencies': [inc['description'] for inc in basic_inconsistencies],
                'rag_analysis': "RAG enhancement not available - using basic analysis only",
                'recommendations': self._generate_basic_recommendations(basic_inconsistencies),
                'context_sources': 0,
                'financial_data': getattr(self, 'current_financial_data', {}),
                'enhanced': False
            }
        
        try:
            # RAG enhancement logic
            basic_issues = [inc['description'] for inc in basic_inconsistencies]
            
            # Generate enhanced analysis
            enhanced_response = self.rag_system.generate_rag_response(text, basic_issues)
            
            # Generate recommendations
            recommendation_prompt = f"""Based on these inconsistencies: {basic_issues}
Provide 5 specific audit recommendations:"""
            
            recommendations = self.rag_system.call_llama3(recommendation_prompt, temperature=0.2)
            
            return {
                'basic_inconsistencies': [inc['description'] for inc in basic_inconsistencies],
                'rag_analysis': enhanced_response['response'],
                'recommendations': recommendations,
                'context_sources': enhanced_response['context_sources'],
                'financial_data': getattr(self, 'current_financial_data', {}),
                'enhanced': True
            }
        
        except Exception as e:
            logger.error(f"RAG enhancement failed: {str(e)}")
            return {
                'basic_inconsistencies': [inc['description'] for inc in basic_inconsistencies],
                'rag_analysis': f"RAG enhancement failed: {str(e)}",
                'recommendations': self._generate_basic_recommendations(basic_inconsistencies),
                'context_sources': 0,
                'financial_data': getattr(self, 'current_financial_data', {}),
                'enhanced': False,
                'error': str(e)
            }
    
    def _generate_basic_recommendations(self, inconsistencies: List[Dict]) -> str:
        """Generate basic recommendations when RAG is not available"""
        if not inconsistencies:
            return "No specific recommendations - financial statements appear consistent."
        
        recommendations = ["AUDIT RECOMMENDATIONS:\n"]
        
        for i, inc in enumerate(inconsistencies[:5], 1):
            if inc['type'] == 'balance_sheet_equation':
                recommendations.append(f"{i}. Reconcile balance sheet equation - verify all account balances")
            elif inc['type'] == 'asset_composition':
                recommendations.append(f"{i}. Verify individual asset accounts to reconcile total assets")
            elif inc['type'] == 'misplaced_accounts':
                recommendations.append(f"{i}. Reclassify income statement items to proper statements")
            elif inc['type'] == 'negative_balance':
                recommendations.append(f"{i}. Investigate negative balance in {inc.get('account', 'account')}")
            else:
                recommendations.append(f"{i}. Review and verify {inc['type'].replace('_', ' ')}")
        
        return "\n".join(recommendations)
    
    def comprehensive_audit(self, text: str, tables: list = None) -> Dict[str, Any]:
        """Perform comprehensive audit combining basic checks with RAG enhancement"""
        if tables is None:
            tables = []
            
        # Step 1: Detect basic inconsistencies
        basic_inconsistencies = self.detect_basic_inconsistencies(text, tables)
        
        if not basic_inconsistencies:
            basic_inconsistencies = [{'type': 'no_issues', 'severity': 'info', 'description': 'No basic inconsistencies detected'}]
        
        # Step 2: Enhance with RAG
        enhanced_results = self.enhance_with_rag(text, basic_inconsistencies, tables)
        
        return enhanced_results

def check_inconsistencies(text: str, tables: list = None) -> Dict[str, Any]:
    """Main function for inconsistency checking"""
    try:
        auditor = IntegratedFinancialAuditor()
        results = auditor.comprehensive_audit(text, tables)
        return results
        
    except Exception as e:
        logger.error(f"Error in integrated audit: {str(e)}")
        return {
            "basic_inconsistencies": [f"Failed audit check: {str(e)}"],
            "rag_analysis": "Analysis failed due to system error",
            "recommendations": "Please check system configuration and try again",
            "enhanced": False,
            "error": str(e)
        }

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
    
    logger.info("Testing Fixed Financial Audit System")
    logger.info("=" * 50)
    
    # Test inconsistency detection
    results = check_inconsistencies(sample_text, [])
    
    logger.info(f"Enhanced: {results['enhanced']}")
    logger.info(f"Basic Inconsistencies Found: {len(results['basic_inconsistencies'])}")
    
    for i, inc in enumerate(results['basic_inconsistencies'], 1):
        logger.info(f"{i}. {inc}")
    
    logger.info(f"\nRAG Analysis: {results['rag_analysis'][:200]}...")