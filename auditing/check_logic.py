import re
import logging
import math
from datetime import datetime
from typing import List, Dict, Any, Optional
from collections import Counter
from rag_system import FinancialRAGSystem  # Import from Delloite/rag_system.py

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class IntegratedFinancialAuditor:
    """Enhanced integrated financial auditor with comprehensive audit capabilities"""
    
    def __init__(self, rag_model_name: str = "llama3:8b"):
        try:
            self.rag_system = FinancialRAGSystem(model_name=rag_model_name)
            self.rag_available = True
        except Exception as e:
            logger.error(f"RAG system initialization failed: {e}")
            self.rag_system = None
            self.rag_available = False
        
        # Industry benchmarks (example values - should be updated with real data)
        self.industry_benchmarks = {
            'current_ratio': {'min': 1.0, 'max': 3.0, 'average': 1.5},
            'debt_ratio': {'min': 0.0, 'max': 0.8, 'average': 0.4},
            'gross_margin': {'min': 0.15, 'max': 0.6, 'average': 0.3},
            'net_margin': {'min': 0.05, 'max': 0.25, 'average': 0.1},
            'asset_turnover': {'min': 0.5, 'max': 3.0, 'average': 1.2},
            'roa': {'min': 0.02, 'max': 0.2, 'average': 0.08}
        }
        
        self.previous_year_data = {}  # To be populated for comparative analysis
    
    def parse_inr(self, value: str) -> float:
        """Helper function to parse INR values"""
        if value is None:
            return None
        return float(value.replace(',', '')) if value else 0.0
    
    def extract_financial_data(self, text: str) -> Dict[str, float]:
        """Extract comprehensive financial data from text"""
        financial_data = {}
        
        # Enhanced patterns for comprehensive data extraction
        patterns = {
            # Balance Sheet Items
            'assets': r'Total Assets: INR\s*([\d,]+)',
            'current_assets': r'Current Assets: INR\s*([\d,]+)',
            'non_current_assets': r'Non-Current Assets: INR\s*([\d,]+)',
            'liabilities': r'Total Liabilities: INR\s*([\d,]+)',
            'current_liabilities': r'Current Liabilities: INR\s*([\d,]+)',
            'non_current_liabilities': r'Non-Current Liabilities: INR\s*([\d,]+)',
            'equity': r'Total Equity: INR\s*([\d,]+)',
            'cash': r'Cash: INR\s*([\d,]+)',
            'receivables': r'Accounts Receivable: INR\s*([\d,]+)',
            'inventory': r'Inventory: INR\s*([\d,]+)',
            'ppe': r'Property, Plant & Equipment: INR\s*([\d,]+)',
            'accounts_payable': r'Accounts Payable: INR\s*([\d,]+)',
            'loan_payable': r'Loan Payable: (-?)INR\s*([\d,]+)',
            'retained_earnings': r'Retained Earnings:\s*(-?)INR\s*([\d,]+)',
            
            # Income Statement Items
            'revenue': r'Revenue: INR\s*([\d,]+)',
            'gross_profit': r'Gross Profit: INR\s*([\d,]+)',
            'operating_income': r'Operating Income: INR\s*([\d,]+)',
            'net_income': r'Net Income: INR\s*([\d,]+)',
            'expenses': r'Total Expenses: INR\s*([\d,]+)',
            'cost_of_goods_sold': r'Cost of Goods Sold: INR\s*([\d,]+)',
            'operating_expenses': r'Operating Expenses: INR\s*([\d,]+)',
            'interest_expense': r'Interest Expense: INR\s*([\d,]+)',
            'tax_expense': r'Tax Expense: INR\s*([\d,]+)',
            
            # Cash Flow Items
            'operating_cash_flow': r'Operating Cash Flow: INR\s*([\d,]+)',
            'investing_cash_flow': r'Investing Cash Flow: INR\s*([\d,]+)',
            'financing_cash_flow': r'Financing Cash Flow: INR\s*([\d,]+)',
            'net_cash_flow': r'Net Cash Flow: INR\s*([\d,]+)',
            
            # Ratios (if provided)
            'current_ratio': r'Current Ratio:\s*([\d.]+)',
            'debt_ratio': r'Debt Ratio:\s*([\d.]+)',
            'gross_margin': r'Gross Margin:\s*([\d.]+)%?',
            'net_margin': r'Net Margin:\s*([\d.]+)%?',
            'asset_turnover': r'Asset Turnover:\s*([\d.]+)',
            'roa': r'ROA:\s*([\d.]+)%?',
            'roe': r'ROE:\s*([\d.]+)%?'
        }
        
        # Extract all financial values
        for key, pattern in patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if key in ['loan_payable', 'retained_earnings']:
                    amount = self.parse_inr(match.group(2))
                    financial_data[key] = -amount if match.group(1) == '-' else amount
                elif key in ['gross_margin', 'net_margin', 'roa', 'roe']:
                    # Convert percentage to decimal
                    value = float(match.group(1))
                    financial_data[key] = value / 100 if value > 1 else value
                else:
                    financial_data[key] = self.parse_inr(match.group(1)) if key not in ['current_ratio', 'debt_ratio', 'asset_turnover'] else float(match.group(1))
        
        return financial_data
    
    def calculate_ratios(self, financial_data: Dict[str, float]) -> Dict[str, float]:
        """Calculate financial ratios from available data"""
        ratios = {}
        
        try:
            # Liquidity Ratios
            if 'current_assets' in financial_data and 'current_liabilities' in financial_data:
                if financial_data['current_liabilities'] > 0:
                    ratios['current_ratio'] = financial_data['current_assets'] / financial_data['current_liabilities']
            
            # Leverage Ratios
            if 'liabilities' in financial_data and 'assets' in financial_data:
                if financial_data['assets'] > 0:
                    ratios['debt_ratio'] = financial_data['liabilities'] / financial_data['assets']
            
            # Profitability Ratios
            if 'gross_profit' in financial_data and 'revenue' in financial_data:
                if financial_data['revenue'] > 0:
                    ratios['gross_margin'] = financial_data['gross_profit'] / financial_data['revenue']
            
            if 'net_income' in financial_data and 'revenue' in financial_data:
                if financial_data['revenue'] > 0:
                    ratios['net_margin'] = financial_data['net_income'] / financial_data['revenue']
            
            # Activity Ratios
            if 'revenue' in financial_data and 'assets' in financial_data:
                if financial_data['assets'] > 0:
                    ratios['asset_turnover'] = financial_data['revenue'] / financial_data['assets']
            
            # Return Ratios
            if 'net_income' in financial_data and 'assets' in financial_data:
                if financial_data['assets'] > 0:
                    ratios['roa'] = financial_data['net_income'] / financial_data['assets']
            
            if 'net_income' in financial_data and 'equity' in financial_data:
                if financial_data['equity'] > 0:
                    ratios['roe'] = financial_data['net_income'] / financial_data['equity']
        
        except Exception as e:
            logger.error(f"Error calculating ratios: {e}")
        
        return ratios
    
    def calculate_materiality(self, financial_data: Dict[str, float]) -> Dict[str, float]:
        """Calculate planning materiality thresholds"""
        materiality_calc = {}
        
        try:
            revenue = financial_data.get('revenue', 0)
            assets = financial_data.get('assets', 0)
            net_income = financial_data.get('net_income', 0)
            
            # Calculate materiality using multiple benchmarks
            materiality_options = []
            
            if revenue > 0:
                materiality_options.append(revenue * 0.05)  # 5% of revenue
            
            if assets > 0:
                materiality_options.append(assets * 0.01)   # 1% of assets
            
            if net_income > 0:
                materiality_options.append(net_income * 0.10)  # 10% of net income
            
            if materiality_options:
                planning_materiality = min(materiality_options)
                
                materiality_calc = {
                    'planning_materiality': planning_materiality,
                    'performance_materiality': planning_materiality * 0.75,
                    'trivial_threshold': planning_materiality * 0.05,
                    'clearly_trivial': planning_materiality * 0.03
                }
        
        except Exception as e:
            logger.error(f"Error calculating materiality: {e}")
        
        return materiality_calc
    
    def assess_audit_risk(self, financial_data: Dict[str, float], ratios: Dict[str, float]) -> Dict[str, Any]:
        """Assess inherent and control risk factors"""
        risk_factors = []
        risk_level = 'low'
        
        try:
            # Liquidity Risk
            current_ratio = ratios.get('current_ratio', 1.0)
            if current_ratio < 1.0:
                risk_factors.append("Liquidity concerns - current ratio below 1.0")
                risk_level = 'high'
            elif current_ratio < 1.2:
                risk_factors.append("Potential liquidity issues - current ratio below 1.2")
                risk_level = 'medium'
            
            # Leverage Risk
            debt_ratio = ratios.get('debt_ratio', 0.0)
            if debt_ratio > 0.8:
                risk_factors.append("High leverage ratio - debt exceeds 80% of assets")
                risk_level = 'high'
            elif debt_ratio > 0.6:
                risk_factors.append("Moderate leverage risk - debt exceeds 60% of assets")
                risk_level = 'medium'
            
            # Profitability Risk
            net_margin = ratios.get('net_margin', 0.0)
            if net_margin < 0:
                risk_factors.append("Negative profitability - company reporting losses")
                risk_level = 'high'
            elif net_margin < 0.05:
                risk_factors.append("Low profitability - net margin below 5%")
                risk_level = 'medium'
            
            # Going Concern Risk
            if financial_data.get('net_income', 0) < 0 and financial_data.get('operating_cash_flow', 0) < 0:
                risk_factors.append("Going concern issues - negative income and cash flow")
                risk_level = 'high'
            
            # Cash Flow Risk
            operating_cf = financial_data.get('operating_cash_flow', 0)
            net_income = financial_data.get('net_income', 0)
            if operating_cf < 0 and net_income > 0:
                risk_factors.append("Cash flow quality issues - positive income but negative operating cash flow")
                risk_level = 'high'
            
            # Update risk level based on number of factors
            if len(risk_factors) > 3:
                risk_level = 'high'
            elif len(risk_factors) > 1 and risk_level != 'high':
                risk_level = 'medium'
        
        except Exception as e:
            logger.error(f"Error assessing audit risk: {e}")
        
        return {
            'risk_level': risk_level,
            'risk_factors': risk_factors,
            'total_risk_factors': len(risk_factors)
        }
    
    def perform_analytical_procedures(self, financial_data: Dict[str, float], ratios: Dict[str, float]) -> List[Dict[str, Any]]:
        """Perform analytical procedures and variance analysis"""
        analytical_findings = []
        
        try:
            # Industry Benchmark Analysis
            for ratio_name, ratio_value in ratios.items():
                if ratio_name in self.industry_benchmarks:
                    benchmark = self.industry_benchmarks[ratio_name]
                    
                    if ratio_value < benchmark['min'] or ratio_value > benchmark['max']:
                        analytical_findings.append({
                            'type': 'industry_benchmark_variance',
                            'severity': 'medium',
                            'description': f"{ratio_name.replace('_', ' ').title()} ({ratio_value:.3f}) outside industry range ({benchmark['min']:.3f} - {benchmark['max']:.3f})",
                            'ratio': ratio_name,
                            'actual': ratio_value,
                            'benchmark_range': f"{benchmark['min']:.3f} - {benchmark['max']:.3f}",
                            'variance': abs(ratio_value - benchmark['average'])
                        })
            
            # Year-over-year variance analysis (if previous year data available)
            if self.previous_year_data:
                for key, current_value in financial_data.items():
                    if key in self.previous_year_data:
                        prior_value = self.previous_year_data[key]
                        if prior_value != 0:
                            variance_pct = abs((current_value - prior_value) / prior_value)
                            
                            if variance_pct > 0.10:  # 10% variance threshold
                                analytical_findings.append({
                                    'type': 'year_over_year_variance',
                                    'severity': 'medium' if variance_pct > 0.25 else 'low',
                                    'description': f"{key.replace('_', ' ').title()} variance: {variance_pct:.1%} change from prior year",
                                    'account': key,
                                    'current_value': current_value,
                                    'prior_value': prior_value,
                                    'variance_percentage': variance_pct
                                })
            
            # Reasonableness Tests
            # Test 1: Revenue vs Cash Flow relationship
            if 'revenue' in financial_data and 'operating_cash_flow' in financial_data:
                revenue = financial_data['revenue']
                ocf = financial_data['operating_cash_flow']
                
                if revenue > 0 and abs(ocf) / revenue > 0.5:  # Cash flow significantly different from revenue
                    analytical_findings.append({
                        'type': 'cash_flow_reasonableness',
                        'severity': 'medium',
                        'description': f"Operating cash flow ({ocf:,.0f}) significantly differs from revenue ({revenue:,.0f})",
                        'ratio': abs(ocf) / revenue if revenue > 0 else 0
                    })
            
            # Test 2: Gross Profit Margin Reasonableness
            if 'gross_margin' in ratios:
                gross_margin = ratios['gross_margin']
                if gross_margin < 0 or gross_margin > 0.8:
                    analytical_findings.append({
                        'type': 'gross_margin_reasonableness',
                        'severity': 'high' if gross_margin < 0 else 'medium',
                        'description': f"Gross margin ({gross_margin:.1%}) appears unreasonable",
                        'value': gross_margin
                    })
        
        except Exception as e:
            logger.error(f"Error in analytical procedures: {e}")
        
        return analytical_findings
    
    def benford_analysis(self, financial_data: Dict[str, float]) -> Dict[str, Any]:
        """Perform Benford's Law analysis for fraud detection"""
        try:
            # Extract first digits from financial amounts
            first_digits = []
            for value in financial_data.values():
                if value > 0:
                    first_digit = int(str(int(value))[0])
                    first_digits.append(first_digit)
            
            if len(first_digits) < 10:  # Need sufficient data
                return {'analysis': 'Insufficient data for Benford analysis', 'risk_level': 'low'}
            
            # Count occurrences of each digit
            digit_counts = Counter(first_digits)
            total_count = len(first_digits)
            
            # Expected Benford distribution
            benford_expected = {
                1: 0.301, 2: 0.176, 3: 0.125, 4: 0.097, 5: 0.079,
                6: 0.067, 7: 0.058, 8: 0.051, 9: 0.046
            }
            
            # Calculate chi-square statistic
            chi_square = 0
            for digit in range(1, 10):
                observed = digit_counts.get(digit, 0) / total_count
                expected = benford_expected[digit]
                chi_square += ((observed - expected) ** 2) / expected
            
            # Critical value for 8 degrees of freedom at 5% significance
            critical_value = 15.507
            
            risk_level = 'high' if chi_square > critical_value else 'low'
            
            return {
                'analysis': f"Benford analysis: Chi-square = {chi_square:.3f} (critical = {critical_value:.3f})",
                'risk_level': risk_level,
                'chi_square': chi_square,
                'potential_manipulation': chi_square > critical_value
            }
        
        except Exception as e:
            logger.error(f"Error in Benford analysis: {e}")
            return {'analysis': f"Benford analysis failed: {str(e)}", 'risk_level': 'low'}
    
    def check_compliance(self, financial_data: Dict[str, float]) -> List[Dict[str, Any]]:
        """Check compliance with accounting standards and regulations"""
        compliance_issues = []
        
        try:
            # Companies Act 2013 compliance checks
            
            # Check for negative equity (potential violation)
            if financial_data.get('equity', 0) < 0:
                compliance_issues.append({
                    'type': 'negative_equity',
                    'severity': 'high',
                    'description': 'Negative equity may indicate violation of Companies Act provisions',
                    'regulation': 'Companies Act 2013',
                    'value': financial_data.get('equity', 0)
                })
            
            # Check for excessive related party transactions (placeholder - would need actual data)
            # This is a conceptual check - in practice, you'd need specific related party data
            
            # Ind AS compliance checks
            
            # Check for proper classification of current vs non-current assets
            if 'current_assets' in financial_data and 'assets' in financial_data:
                current_assets = financial_data['current_assets']
                total_assets = financial_data['assets']
                
                if current_assets > total_assets:
                    compliance_issues.append({
                        'type': 'classification_error',
                        'severity': 'high',
                        'description': 'Current assets exceed total assets - classification error',
                        'regulation': 'Ind AS 1 - Presentation of Financial Statements'
                    })
            
            # Check for proper cash flow statement reconciliation
            if all(key in financial_data for key in ['operating_cash_flow', 'investing_cash_flow', 'financing_cash_flow', 'net_cash_flow']):
                calculated_net = financial_data['operating_cash_flow'] + financial_data['investing_cash_flow'] + financial_data['financing_cash_flow']
                reported_net = financial_data['net_cash_flow']
                
                if abs(calculated_net - reported_net) > 1000:  # Allow for rounding
                    compliance_issues.append({
                        'type': 'cash_flow_reconciliation',
                        'severity': 'medium',
                        'description': f"Cash flow statement doesn't reconcile: Calculated ({calculated_net:,.0f}) vs Reported ({reported_net:,.0f})",
                        'regulation': 'Ind AS 7 - Statement of Cash Flows'
                    })
            
            # Tax compliance indicators
            if 'tax_expense' in financial_data and 'net_income' in financial_data:
                if financial_data['net_income'] > 0 and financial_data['tax_expense'] <= 0:
                    compliance_issues.append({
                        'type': 'tax_compliance',
                        'severity': 'medium',
                        'description': 'Positive income but no tax expense recorded',
                        'regulation': 'Income Tax Act compliance'
                    })
        
        except Exception as e:
            logger.error(f"Error in compliance checking: {e}")
        
        return compliance_issues
    
    def generate_audit_workpaper(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate standardized audit documentation"""
        try:
            workpaper = {
                'workpaper_ref': f"WP-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
                'date_prepared': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'procedures_performed': [
                    "Balance sheet equation verification",
                    "Asset composition analysis",
                    "Account classification review",
                    "Analytical procedures",
                    "Risk assessment",
                    "Compliance checking",
                    "Materiality calculation",
                    "Benford's Law analysis"
                ],
                'findings_summary': {
                    'basic_inconsistencies': len(results.get('basic_inconsistencies', [])),
                    'analytical_findings': len(results.get('analytical_findings', [])),
                    'compliance_issues': len(results.get('compliance_issues', [])),
                    'total_findings': len(results.get('basic_inconsistencies', [])) + len(results.get('analytical_findings', [])) + len(results.get('compliance_issues', []))
                },
                'risk_assessment': results.get('risk_assessment', {}),
                'materiality': results.get('materiality', {}),
                'conclusion': self._generate_conclusion(results),
                'follow_up_required': self._identify_follow_up(results),
                'next_procedures': self._suggest_next_procedures(results)
            }
            
            return workpaper
        
        except Exception as e:
            logger.error(f"Error generating audit workpaper: {e}")
            return {'error': f"Workpaper generation failed: {str(e)}"}
    
    def _generate_conclusion(self, results: Dict[str, Any]) -> str:
        """Generate audit conclusion based on findings"""
        total_findings = len(results.get('basic_inconsistencies', [])) + len(results.get('analytical_findings', [])) + len(results.get('compliance_issues', []))
        risk_level = results.get('risk_assessment', {}).get('risk_level', 'low')
        
        if total_findings == 0:
            return "No significant inconsistencies or issues identified. Financial statements appear to be fairly presented."
        elif total_findings <= 3 and risk_level == 'low':
            return "Minor inconsistencies identified. Additional procedures recommended but no material issues noted."
        elif risk_level == 'medium':
            return "Moderate inconsistencies and risk factors identified. Significant additional audit procedures required."
        else:
            return "Material inconsistencies and high-risk factors identified. Extensive additional audit procedures required before opinion can be formed."
    
    def _identify_follow_up(self, results: Dict[str, Any]) -> List[str]:
        """Identify required follow-up procedures"""
        follow_up = []
        
        if results.get('basic_inconsistencies'):
            follow_up.append("Investigate and resolve basic inconsistencies")
        
        if results.get('risk_assessment', {}).get('risk_level') == 'high':
            follow_up.append("Perform additional risk assessment procedures")
        
        if results.get('compliance_issues'):
            follow_up.append("Review compliance with accounting standards")
        
        if results.get('benford_analysis', {}).get('potential_manipulation'):
            follow_up.append("Investigate potential data manipulation")
        
        return follow_up
    
    def _suggest_next_procedures(self, results: Dict[str, Any]) -> List[str]:
        """Suggest next audit procedures based on findings"""
        procedures = []
        
        # Standard procedures
        procedures.extend([
            "Perform detailed substantive testing of material account balances",
            "Test internal controls over financial reporting",
            "Review management representations and board minutes",
            "Perform subsequent events review"
        ])
        
        # Risk-based procedures
        if results.get('risk_assessment', {}).get('risk_level') == 'high':
            procedures.extend([
                "Perform extended analytical procedures",
                "Increase sample sizes for detailed testing",
                "Consider engaging specialists for complex areas"
            ])
        
        return procedures
    
    def detect_basic_inconsistencies(self, text: str, tables: list) -> List[Dict[str, Any]]:
        """Detect basic inconsistencies and return structured data"""
        inconsistencies = []
        
        try:
            financial_data = self.extract_financial_data(text)
            
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
            
            # Check 3: Current vs Non-current Assets
            if all(k in financial_data for k in ['current_assets', 'non_current_assets', 'assets']):
                total_calculated = financial_data['current_assets'] + financial_data['non_current_assets']
                if not abs(financial_data['assets'] - total_calculated) < 0.01:
                    inconsistencies.append({
                        'type': 'current_noncurrent_assets',
                        'severity': 'medium',
                        'description': f"Current + Non-current assets ({total_calculated:,.0f}) ≠ Total Assets ({financial_data['assets']:,.0f})",
                        'difference': financial_data['assets'] - total_calculated
                    })
            
            # Check 4: Current vs Non-current Liabilities
            if all(k in financial_data for k in ['current_liabilities', 'non_current_liabilities', 'liabilities']):
                total_calculated = financial_data['current_liabilities'] + financial_data['non_current_liabilities']
                if not abs(financial_data['liabilities'] - total_calculated) < 0.01:
                    inconsistencies.append({
                        'type': 'current_noncurrent_liabilities',
                        'severity': 'medium',
                        'description': f"Current + Non-current liabilities ({total_calculated:,.0f}) ≠ Total Liabilities ({financial_data['liabilities']:,.0f})",
                        'difference': financial_data['liabilities'] - total_calculated
                    })
            
            # Check 5: Misplaced Income Statement Items
            misplaced_items = []
            income_statement_items = ['revenue', 'expenses', 'cost_of_goods_sold', 'operating_expenses', 'net_income']
            for item in income_statement_items:
                if item in financial_data:
                    misplaced_items.append(item)
            
            if misplaced_items:
                inconsistencies.append({
                    'type': 'misplaced_accounts',
                    'severity': 'high',
                    'description': f"Income statement items found on balance sheet: {', '.join(misplaced_items)}",
                    'values': {k: financial_data[k] for k in misplaced_items}
                })
            
            # Check 6: Negative Balances Where Inappropriate
            negative_check_accounts = ['cash', 'receivables', 'inventory', 'ppe']
            for account in negative_check_accounts:
                if account in financial_data and financial_data[account] < 0:
                    inconsistencies.append({
                        'type': 'negative_balance',
                        'severity': 'high',
                        'description': f"Negative balance in {account.replace('_', ' ').title()}: {financial_data[account]:,.0f}",
                        'account': account,
                        'value': financial_data[account]
                    })
            
            # Store financial data for further analysis
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
                recommendations.append(f"{i}. Reconcile balance sheet equation - verify all account balances and postings")
            elif inc['type'] == 'asset_composition':
                recommendations.append(f"{i}. Verify individual asset accounts to reconcile with total assets")
            elif inc['type'] == 'misplaced_accounts':
                recommendations.append(f"{i}. Reclassify income statement items to proper financial statements")
            elif inc['type'] == 'negative_balance':
                recommendations.append(f"{i}. Investigate negative balance in {inc.get('account', 'account')} and determine cause")
            elif inc['type'] == 'current_noncurrent_assets':
                recommendations.append(f"{i}. Review current vs non-current asset classification")
            elif inc['type'] == 'current_noncurrent_liabilities':
                recommendations.append(f"{i}. Review current vs non-current liability classification")
            else:
                recommendations.append(f"{i}. Review and verify {inc['type'].replace('_', ' ')}")
        
        return "\n".join(recommendations)
    
    def comprehensive_audit(self, text: str, tables: list = None) -> Dict[str, Any]:
        """Perform comprehensive audit combining all analysis methods"""
        if tables is None:
            tables = []
        
        results = {}
        
        try:
            # Step 1: Extract financial data
            financial_data = self.extract_financial_data(text)
            results['financial_data'] = financial_data
            
            # Step 2: Calculate ratios
            calculated_ratios = self.calculate_ratios(financial_data)
            results['calculated_ratios'] = calculated_ratios
            
            # Step 3: Calculate materiality
            materiality = self.calculate_materiality(financial_data)
            results['materiality'] = materiality
            
            # Step 4: Detect basic inconsistencies
            basic_inconsistencies = self.detect_basic_inconsistencies(text, tables)
            results['basic_inconsistencies'] = basic_inconsistencies
            
            # Step 5: Perform analytical procedures
            analytical_findings = self.perform_analytical_procedures(financial_data, calculated_ratios)
            results['analytical_findings'] = analytical_findings
            
            # Step 6: Assess audit risk
            risk_assessment = self.assess_audit_risk(financial_data, calculated_ratios)
            results['risk_assessment'] = risk_assessment
            
            # Step 7: Check compliance
            compliance_issues = self.check_compliance(financial_data)
            results['compliance_issues'] = compliance_issues
            
            # Step 8: Benford analysis
            benford_analysis = self.benford_analysis(financial_data)
            results['benford_analysis'] = benford_analysis
            
            # Step 9: Enhance with RAG
            if not basic_inconsistencies:
                basic_inconsistencies = [{'type': 'no_issues', 'severity': 'info', 'description': 'No basic inconsistencies detected'}]
            
            enhanced_results = self.enhance_with_rag(text, basic_inconsistencies, tables)
            results.update(enhanced_results)
            
            # Step 10: Generate audit workpaper
            workpaper = self.generate_audit_workpaper(results)
            results['audit_workpaper'] = workpaper
            
            # Step 11: Generate executive summary
            results['executive_summary'] = self._generate_executive_summary(results)
            
        except Exception as e:
            logger.error(f"Error in comprehensive audit: {str(e)}")
            results['error'] = str(e)
        
        return results
    
    def _generate_executive_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate executive summary of audit findings"""
        try:
            summary = {
                'total_findings': len(results.get('basic_inconsistencies', [])) + 
                                len(results.get('analytical_findings', [])) + 
                                len(results.get('compliance_issues', [])),
                'risk_level': results.get('risk_assessment', {}).get('risk_level', 'unknown'),
                'material_issues': 0,
                'key_concerns': [],
                'priority_actions': []
            }
            
            # Count material issues
            materiality_threshold = results.get('materiality', {}).get('planning_materiality', 0)
            
            # Check for material basic inconsistencies
            for inc in results.get('basic_inconsistencies', []):
                if inc.get('severity') == 'high':
                    summary['material_issues'] += 1
                    summary['key_concerns'].append(inc['description'])
            
            # Check for material analytical findings
            for finding in results.get('analytical_findings', []):
                if finding.get('severity') == 'high':
                    summary['material_issues'] += 1
                    summary['key_concerns'].append(finding['description'])
            
            # Check for material compliance issues
            for issue in results.get('compliance_issues', []):
                if issue.get('severity') == 'high':
                    summary['material_issues'] += 1
                    summary['key_concerns'].append(issue['description'])
            
            # Generate priority actions
            if summary['risk_level'] == 'high':
                summary['priority_actions'].append("Immediate management attention required")
            
            if summary['material_issues'] > 0:
                summary['priority_actions'].append("Address material inconsistencies before finalizing statements")
            
            if results.get('benford_analysis', {}).get('potential_manipulation'):
                summary['priority_actions'].append("Investigate potential data manipulation")
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating executive summary: {e}")
            return {'error': f"Executive summary generation failed: {str(e)}"}

def check_inconsistencies(text: str, tables: list = None) -> Dict[str, Any]:
    """Main function for comprehensive inconsistency checking"""
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

def set_previous_year_data(auditor: IntegratedFinancialAuditor, previous_data: Dict[str, float]):
    """Set previous year data for comparative analysis"""
    auditor.previous_year_data = previous_data

def update_industry_benchmarks(auditor: IntegratedFinancialAuditor, benchmarks: Dict[str, Dict[str, float]]):
    """Update industry benchmarks for comparative analysis"""
    auditor.industry_benchmarks.update(benchmarks)

if __name__ == "__main__":
    # Enhanced sample test data
    sample_text = """Sample Company - Financial Statements (FY 2023)
    
BALANCE SHEET:
Total Assets: INR 1,500,000
Current Assets: INR 800,000
Non-Current Assets: INR 700,000
Total Liabilities: INR 600,000
Current Liabilities: INR 400,000
Non-Current Liabilities: INR 200,000
Total Equity: INR 700,000
Cash: INR 200,000
Accounts Receivable: INR 300,000
Inventory: INR 300,000
Property, Plant & Equipment: INR 700,000
Accounts Payable: INR 300,000
Loan Payable: INR 300,000
Retained Earnings: INR 200,000

INCOME STATEMENT:
Revenue: INR 2,000,000
Cost of Goods Sold: INR 1,200,000
Gross Profit: INR 800,000
Operating Expenses: INR 600,000
Operating Income: INR 200,000
Interest Expense: INR 50,000
Tax Expense: INR 45,000
Net Income: INR 105,000

CASH FLOW STATEMENT:
Operating Cash Flow: INR 150,000
Investing Cash Flow: INR -100,000
Financing Cash Flow: INR -25,000
Net Cash Flow: INR 25,000"""
    
    logger.info("Testing Enhanced Financial Audit System")
    logger.info("=" * 60)
    
    # Test comprehensive audit
    results = check_inconsistencies(sample_text, [])
    
    # Display results
    print(f"\n{'='*60}")
    print("COMPREHENSIVE AUDIT RESULTS")
    print(f"{'='*60}")
    
    print(f"\nENHANCED: {results.get('enhanced', False)}")
    print(f"RISK LEVEL: {results.get('risk_assessment', {}).get('risk_level', 'Unknown').upper()}")
    
    # Executive Summary
    exec_summary = results.get('executive_summary', {})
    print(f"\nEXECUTIVE SUMMARY:")
    print(f"- Total Findings: {exec_summary.get('total_findings', 0)}")
    print(f"- Material Issues: {exec_summary.get('material_issues', 0)}")
    print(f"- Risk Level: {exec_summary.get('risk_level', 'Unknown')}")
    
    # Basic Inconsistencies
    basic_issues = results.get('basic_inconsistencies', [])
    print(f"\nBASIC INCONSISTENCIES ({len(basic_issues)}):")
    for i, issue in enumerate(basic_issues[:5], 1):
        if isinstance(issue, dict):
            print(f"{i}. {issue.get('description', issue)}")
        else:
            print(f"{i}. {issue}")
    
    # Analytical Findings
    analytical = results.get('analytical_findings', [])
    print(f"\nANALYTICAL FINDINGS ({len(analytical)}):")
    for i, finding in enumerate(analytical[:5], 1):
        print(f"{i}. {finding.get('description', finding)}")
    
    # Compliance Issues
    compliance = results.get('compliance_issues', [])
    print(f"\nCOMPLIANCE ISSUES ({len(compliance)}):")
    for i, issue in enumerate(compliance[:5], 1):
        print(f"{i}. {issue.get('description', issue)}")
    
    # Risk Assessment
    risk_info = results.get('risk_assessment', {})
    print(f"\nRISK ASSESSMENT:")
    print(f"- Risk Level: {risk_info.get('risk_level', 'Unknown')}")
    print(f"- Risk Factors: {risk_info.get('total_risk_factors', 0)}")
    
    # Materiality
    materiality = results.get('materiality', {})
    print(f"\nMATERIALITY:")
    print(f"- Planning Materiality: INR {materiality.get('planning_materiality', 0):,.0f}")
    print(f"- Performance Materiality: INR {materiality.get('performance_materiality', 0):,.0f}")
    
    # Benford Analysis
    benford = results.get('benford_analysis', {})
    print(f"\nBENFORD ANALYSIS:")
    print(f"- {benford.get('analysis', 'Not available')}")
    print(f"- Potential Manipulation: {benford.get('potential_manipulation', False)}")
    
    print(f"\n{'='*60}")
    print("AUDIT COMPLETE")
    print(f"{'='*60}")