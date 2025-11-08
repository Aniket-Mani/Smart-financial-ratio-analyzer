from typing import Dict, Optional, List
from ..config.ratios_config import get_ratio_formula, FINANCIAL_RATIOS_CONFIG
from ..utils.ratios_manager import get_merged_ratios_config, get_available_variables
from ..utils.formula_evaluator import evaluate_formula

class FinancialRatiosService:
    """Calculate financial ratios with multi-year support, custom ratios, and correct formulas"""
    
    def calculate_average(self, current_value: Optional[float], previous_value: Optional[float]) -> Optional[float]:
        """Calculate average of current and previous year values"""
        if current_value is not None and previous_value is not None:
            return (current_value + previous_value) / 2
        return current_value  # Fallback to current if previous not available
    
    def calculate_all_ratios(self, data: Dict, custom_ratios: Optional[List[Dict]] = None, dev_mode: bool = False) -> Dict:
        """Calculate all financial ratios from multi-year data, including custom ratios
        
        Args:
            data: Financial data dictionary
            custom_ratios: List of custom ratio configurations (optional)
            dev_mode: Whether to include custom ratios in calculation
        
        Returns:
            Dictionary with calculated ratios organized by category
        """
        # Extract current and previous year data
        current_year = data.get('current_year', data)  # Fallback to data itself if no multi-year structure
        previous_year = data.get('previous_year', {})
        
        # Calculate averages for balance sheet items
        avg_data = self._prepare_averaged_data(current_year, previous_year)
        
        # Get merged ratio configuration (base + custom if dev mode)
        ratios_config = get_merged_ratios_config(custom_ratios or [], dev_mode)
        
        # Calculate base ratios using existing methods
        ratios = {
            "liquidity": self.calculate_liquidity_ratios(current_year),  # Use current for liquidity
            "profitability": self.calculate_profitability_ratios(current_year, avg_data),
            "solvency": self.calculate_solvency_ratios(current_year, avg_data),
            "efficiency": self.calculate_efficiency_ratios(current_year, avg_data)
        }
        
        # Calculate custom ratios if dev mode is enabled
        if dev_mode and custom_ratios:
            print(f"[RATIOS SERVICE] Calculating {len(custom_ratios)} custom ratios")
            # Prepare flattened data for formula evaluation
            flattened_data = self._prepare_flattened_data(current_year, avg_data)
            
            print(f"[RATIOS SERVICE] Available data keys: {list(flattened_data.keys())}")
            
            # Calculate each custom ratio
            for custom_ratio in custom_ratios:
                category = custom_ratio.get('category', 'custom').lower()
                ratio_id = custom_ratio.get('id', custom_ratio.get('name', '').lower().replace(' ', '_'))
                
                print(f"[RATIOS SERVICE] Processing custom ratio: {custom_ratio.get('name')}")
                print(f"[RATIOS SERVICE] Category: {category}, ID: {ratio_id}")
                print(f"[RATIOS SERVICE] Formula: {custom_ratio['formula']}")
                
                # Ensure category exists
                if category not in ratios:
                    ratios[category] = {}
                
                # Evaluate the custom formula
                success, value, error = evaluate_formula(
                    custom_ratio['formula'],
                    flattened_data,
                    normalize_vars=True
                )
                
                print(f"[RATIOS SERVICE] Evaluation result - Success: {success}, Value: {value}, Error: {error}")
                
                # Build ratio result
                ratio_result = {
                    'formula': custom_ratio['formula'],
                    'interpretation': custom_ratio.get('interpretation', ''),
                    'unit': custom_ratio.get('unit', 'ratio'),
                    'is_custom': True
                }
                
                if success:
                    # Handle percentage conversion
                    if ratio_result['unit'] == '%':
                        value = value * 100 if value < 10 else value  # Auto-detect if already percentage
                    
                    ratio_result['value'] = round(value, 2)
                    ratio_result['data_quality'] = 'complete'
                else:
                    ratio_result['value'] = 'N/A'
                    ratio_result['data_quality'] = 'error'
                    ratio_result['error'] = error
                
                ratios[category][ratio_id] = ratio_result
                print(f"[RATIOS SERVICE] Added ratio to category '{category}' with id '{ratio_id}': {ratio_result}")
        
        print(f"[RATIOS SERVICE] Final ratios categories: {list(ratios.keys())}")
        for cat, cat_ratios in ratios.items():
            print(f"[RATIOS SERVICE] Category '{cat}' has {len(cat_ratios)} ratios: {list(cat_ratios.keys())}")
        
        return ratios
    
    def _prepare_flattened_data(self, current_year: Dict, avg_data: Dict) -> Dict:
        """Prepare a flat dictionary of all available data for formula evaluation
        
        Args:
            current_year: Current year financial data
            avg_data: Dictionary of averaged values
        
        Returns:
            Flattened dictionary with all financial metrics
        """
        flattened = {}
        
        # Add all averaged data
        flattened.update(avg_data)
        
        # Extract current year data
        current_assets = current_year.get('current_assets', {})
        flattened['current_assets'] = current_assets.get('total')
        flattened['inventories'] = current_assets.get('breakdown', {}).get('inventories')
        flattened['accounts_receivable'] = current_assets.get('breakdown', {}).get('accounts_receivable')
        flattened['cash'] = current_assets.get('breakdown', {}).get('cash')
        
        # Non-current assets
        non_current = current_year.get('non_current_assets', {})
        flattened['non_current_assets'] = non_current.get('total')
        flattened['fixed_assets'] = non_current.get('breakdown', {}).get('fixed_assets')
        
        # Liabilities
        current_liab = current_year.get('current_liabilities', {})
        flattened['current_liabilities'] = current_liab.get('total')
        
        non_current_liab = current_year.get('non_current_liabilities', {})
        flattened['non_current_liabilities'] = non_current_liab.get('total')
        
        # Debug: Check what we got for current_liabilities
        print(f"[FLATTEN DATA] current_liabilities raw: {current_liab}")
        print(f"[FLATTEN DATA] current_liabilities total: {flattened.get('current_liabilities')}")
        
        # Totals
        totals = current_year.get('totals', {})
        flattened['total_assets'] = totals.get('total_assets')
        flattened['total_liabilities'] = totals.get('total_liabilities')
        
        # Equity
        equity = current_year.get('equity', {})
        flattened['total_equity'] = equity.get('total')
        flattened['share_capital'] = equity.get('breakdown', {}).get('share_capital')
        flattened['retained_earnings'] = equity.get('breakdown', {}).get('retained_earnings')
        
        # Income statement
        income_stmt = current_year.get('income_statement', {})
        flattened['revenue'] = income_stmt.get('revenue')
        flattened['cost_of_goods_sold'] = income_stmt.get('cost_of_goods_sold')
        flattened['gross_profit'] = income_stmt.get('gross_profit')
        flattened['operating_expenses'] = income_stmt.get('operating_expenses')
        flattened['operating_income'] = income_stmt.get('operating_income')
        flattened['ebit'] = income_stmt.get('ebit')
        flattened['interest_expense'] = income_stmt.get('interest_expense')
        flattened['income_tax_expense'] = income_stmt.get('income_tax_expense')
        flattened['net_income'] = income_stmt.get('net_income')
        
        # Remove None values to avoid formula errors
        return {k: v for k, v in flattened.items() if v is not None}

    
    def _prepare_averaged_data(self, current: Dict, previous: Dict) -> Dict:
        """Prepare data with averaged balance sheet values"""
        avg_data = {}
        
        # Average total assets
        avg_data['avg_total_assets'] = self.calculate_average(
            current.get('totals', {}).get('total_assets'),
            previous.get('totals', {}).get('total_assets')
        )
        
        # Average total equity
        avg_data['avg_total_equity'] = self.calculate_average(
            current.get('equity', {}).get('total'),
            previous.get('equity', {}).get('total')
        )
        
        # Average fixed assets
        avg_data['avg_fixed_assets'] = self.calculate_average(
            current.get('non_current_assets', {}).get('breakdown', {}).get('fixed_assets'),
            previous.get('non_current_assets', {}).get('breakdown', {}).get('fixed_assets')
        )
        
        # Average inventory
        avg_data['avg_inventories'] = self.calculate_average(
            current.get('current_assets', {}).get('breakdown', {}).get('inventories'),
            previous.get('current_assets', {}).get('breakdown', {}).get('inventories')
        )
        
        # Average accounts receivable (debtors)
        avg_data['avg_accounts_receivable'] = self.calculate_average(
            current.get('current_assets', {}).get('breakdown', {}).get('accounts_receivable'),
            previous.get('current_assets', {}).get('breakdown', {}).get('accounts_receivable')
        )
        
        return avg_data
    
    def calculate_liquidity_ratios(self, data: Dict) -> Dict:
        """Calculate liquidity ratios using current year data with graceful handling of missing values"""
        ratios = {}
        
        current_assets = data.get('current_assets', {}).get('total')
        current_liabilities = data.get('current_liabilities', {}).get('total')
        inventories = data.get('current_assets', {}).get('breakdown', {}).get('inventories')
        
        # Current Ratio - ALWAYS include with formula from config
        config = FINANCIAL_RATIOS_CONFIG['current_ratio']
        if current_assets is not None and current_liabilities is not None and current_liabilities != 0:
            ratios['current_ratio'] = {
                'value': round(current_assets / current_liabilities, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'data_quality': 'complete'
            }
        else:
            # Always show even if data missing
            missing_fields = []
            if current_assets is None:
                missing_fields.append('Current Assets')
            if current_liabilities is None:
                missing_fields.append('Current Liabilities')
            
            ratios['current_ratio'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'data_quality': 'incomplete',
                'missing_fields': missing_fields if missing_fields else ['Complete data not available']
            }
        
        # Quick Ratio - ALWAYS include with formula from config
        config = FINANCIAL_RATIOS_CONFIG['quick_ratio']
        if current_assets is not None and current_liabilities is not None and current_liabilities != 0:
            inventory_value = inventories if inventories is not None else 0
            quick_assets = current_assets - inventory_value
            ratios['quick_ratio'] = {
                'value': round(quick_assets / current_liabilities, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'data_quality': 'complete' if inventories is not None else 'estimated',
                'note': 'Inventory assumed to be 0' if inventories is None else None
            }
        else:
            missing_fields = []
            if current_assets is None:
                missing_fields.append('Current Assets')
            if current_liabilities is None:
                missing_fields.append('Current Liabilities')
            
            ratios['quick_ratio'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'data_quality': 'incomplete',
                'missing_fields': missing_fields if missing_fields else ['Complete data not available']
            }
        
        return ratios
    
    def calculate_profitability_ratios(self, data: Dict, avg_data: Dict) -> Dict:
        """Calculate profitability ratios using averages with graceful null handling - ALWAYS return all 4 ratios"""
        ratios = {}
        
        income_stmt = data.get('income_statement', {})
        gross_profit = income_stmt.get('gross_profit')
        revenue = income_stmt.get('revenue')
        net_income = income_stmt.get('net_income')
        
        # Get averaged values
        avg_total_equity = avg_data.get('avg_total_equity')
        avg_total_assets = avg_data.get('avg_total_assets')
        
        # 1. Gross Profit Margin - ALWAYS include
        config = FINANCIAL_RATIOS_CONFIG['gross_profit_margin']
        if gross_profit is not None and revenue is not None and revenue != 0:
            ratios['gross_profit_margin'] = {
                'value': round((gross_profit / revenue) * 100, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'unit': config['unit'],
                'data_quality': 'complete'
            }
        else:
            ratios['gross_profit_margin'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'unit': config['unit'],
                'data_quality': 'incomplete'
            }
        
        # 2. Net Profit Margin - ALWAYS include
        config = FINANCIAL_RATIOS_CONFIG['net_profit_margin']
        if net_income is not None and revenue is not None and revenue != 0:
            ratios['net_profit_margin'] = {
                'value': round((net_income / revenue) * 100, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'unit': config['unit'],
                'data_quality': 'complete'
            }
        else:
            ratios['net_profit_margin'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'unit': config['unit'],
                'data_quality': 'incomplete'
            }
        
        # 3. ROE using average equity - ALWAYS include
        config = FINANCIAL_RATIOS_CONFIG['return_on_equity']
        if net_income is not None and avg_total_equity is not None and avg_total_equity != 0:
            ratios['return_on_equity'] = {
                'value': round((net_income / avg_total_equity) * 100, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'unit': config['unit'],
                'data_quality': 'complete'
            }
        else:
            ratios['return_on_equity'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'unit': config['unit'],
                'data_quality': 'incomplete'
            }
        
        # 4. ROA using average assets - ALWAYS include
        config = FINANCIAL_RATIOS_CONFIG['return_on_assets']
        if net_income is not None and avg_total_assets is not None and avg_total_assets != 0:
            ratios['return_on_assets'] = {
                'value': round((net_income / avg_total_assets) * 100, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'unit': config['unit'],
                'data_quality': 'complete'
            }
        else:
            ratios['return_on_assets'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'unit': config['unit'],
                'data_quality': 'incomplete'
            }
        
        return ratios
    
    def calculate_solvency_ratios(self, data: Dict, avg_data: Dict) -> Dict:
        """Calculate solvency ratios with graceful null handling - ALWAYS return all 3 ratios"""
        ratios = {}
        
        # Get total liabilities components
        current_liabilities = data.get('current_liabilities', {}).get('total')
        non_current_liabilities = data.get('non_current_liabilities', {}).get('total')
        total_liabilities = data.get('totals', {}).get('total_liabilities')
        
        total_equity = data.get('equity', {}).get('total')
        total_assets = data.get('totals', {}).get('total_assets')
        ebit = data.get('income_statement', {}).get('ebit')
        interest_expense = data.get('income_statement', {}).get('interest_expense')
        
        # 1. Debt to Equity - ALWAYS include
        config = FINANCIAL_RATIOS_CONFIG['debt_to_equity']
        if total_liabilities is not None and total_equity is not None and total_equity != 0:
            ratios['debt_to_equity'] = {
                'value': round(total_liabilities / total_equity, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'data_quality': 'complete'
            }
        elif current_liabilities is not None and non_current_liabilities is not None and total_equity is not None and total_equity != 0:
            # Fallback: calculate from components
            total_debt = (current_liabilities or 0) + (non_current_liabilities or 0)
            ratios['debt_to_equity'] = {
                'value': round(total_debt / total_equity, 2),
                'formula': '(Current Liabilities + Non-Current Liabilities) / Total Equity',
                'interpretation': config['interpretation'],
                'data_quality': 'estimated'
            }
        else:
            ratios['debt_to_equity'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'data_quality': 'incomplete'
            }
        
        # 2. Debt Ratio - ALWAYS include
        config = FINANCIAL_RATIOS_CONFIG['debt_ratio']
        if total_liabilities is not None and total_assets is not None and total_assets != 0:
            ratios['debt_ratio'] = {
                'value': round((total_liabilities / total_assets) * 100, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'unit': config['unit'],
                'data_quality': 'complete'
            }
        else:
            ratios['debt_ratio'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'unit': config['unit'],
                'data_quality': 'incomplete'
            }
        
        # 3. Interest Coverage - ALWAYS include
        config = FINANCIAL_RATIOS_CONFIG['interest_coverage']
        if ebit is not None and interest_expense is not None and interest_expense != 0:
            income_tax = data.get('income_statement', {}).get('income_tax_expense', 0) or 0
            numerator = ebit + income_tax
            ratios['interest_coverage'] = {
                'value': round(numerator / interest_expense, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'data_quality': 'complete'
            }
        else:
            ratios['interest_coverage'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'data_quality': 'incomplete'
            }
        
        return ratios
    
    def calculate_efficiency_ratios(self, data: Dict, avg_data: Dict) -> Dict:
        """Calculate efficiency ratios using averages with graceful null handling - ALWAYS return all 4 ratios"""
        ratios = {}
        
        revenue = data.get('income_statement', {}).get('revenue')
        cogs = data.get('income_statement', {}).get('cost_of_goods_sold')
        
        # Get averaged values
        avg_total_assets = avg_data.get('avg_total_assets')
        avg_fixed_assets = avg_data.get('avg_fixed_assets')
        avg_inventories = avg_data.get('avg_inventories')
        avg_accounts_receivable = avg_data.get('avg_accounts_receivable')
        
        # 1. Asset Turnover - ALWAYS include
        config = FINANCIAL_RATIOS_CONFIG['asset_turnover']
        if revenue is not None and avg_total_assets is not None and avg_total_assets != 0:
            ratios['asset_turnover'] = {
                'value': round(revenue / avg_total_assets, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'data_quality': 'complete'
            }
        else:
            ratios['asset_turnover'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'data_quality': 'incomplete'
            }
        
        # 2. Fixed Asset Turnover - ALWAYS include
        config = FINANCIAL_RATIOS_CONFIG['fixed_asset_turnover']
        if revenue is not None and avg_fixed_assets is not None and avg_fixed_assets != 0:
            ratios['fixed_asset_turnover'] = {
                'value': round(revenue / avg_fixed_assets, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'data_quality': 'complete'
            }
        else:
            ratios['fixed_asset_turnover'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'data_quality': 'incomplete'
            }
        
        # 3. Inventory Turnover - ALWAYS include
        config = FINANCIAL_RATIOS_CONFIG['inventory_turnover']
        if revenue is not None and avg_inventories is not None and avg_inventories != 0:
            ratios['inventory_turnover'] = {
                'value': round(revenue / avg_inventories, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'data_quality': 'complete'
            }
        else:
            ratios['inventory_turnover'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'data_quality': 'incomplete'
            }
        
        # 4. Debtors Turnover - ALWAYS include
        config = FINANCIAL_RATIOS_CONFIG['debtors_turnover']
        if revenue is not None and avg_accounts_receivable is not None and avg_accounts_receivable != 0:
            ratios['debtors_turnover'] = {
                'value': round(revenue / avg_accounts_receivable, 2),
                'formula': config['formula'],
                'interpretation': config['interpretation'],
                'data_quality': 'complete'
            }
        else:
            ratios['debtors_turnover'] = {
                'value': 'N/A',
                'formula': config['formula'],
                'interpretation': 'Insufficient data to calculate',
                'data_quality': 'incomplete'
            }
        
        return ratios
