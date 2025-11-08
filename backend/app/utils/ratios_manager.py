"""
Ratios Configuration Manager
Handles merging of base ratios with custom user-defined ratios,
variable name normalization, and formula validation.
"""

import re
from typing import Dict, List, Optional, Tuple
from ..config.base_ratios_config import BASE_FINANCIAL_RATIOS, BASE_RATIO_CATEGORIES


# Variable name mappings for case-insensitive and common variations
VARIABLE_NAME_MAPPINGS = {
    # Assets variations
    "total assets": "total_assets",
    "totalassets": "total_assets",
    "total_assets": "total_assets",
    "assets": "total_assets",
    "current assets": "current_assets",
    "currentassets": "current_assets",
    "current_assets": "current_assets",
    "fixed assets": "fixed_assets",
    "fixedassets": "fixed_assets",
    "fixed_assets": "fixed_assets",
    
    # Liabilities variations
    "total liabilities": "total_liabilities",
    "totalliabilities": "total_liabilities",
    "total_liabilities": "total_liabilities",
    "liabilities": "total_liabilities",
    "current liabilities": "current_liabilities",
    "currentliabilities": "current_liabilities",
    "current_liabilities": "current_liabilities",
    
    # Equity variations
    "total equity": "total_equity",
    "totalequity": "total_equity",
    "total_equity": "total_equity",
    "equity": "total_equity",
    "shareholders equity": "total_equity",
    "shareholders' equity": "total_equity",
    "shareholdersequity": "total_equity",
    "shareholders_equity": "total_equity",
    "capital": "total_equity",
    
    # Revenue variations
    "revenue": "revenue",
    "sales": "revenue",
    "total revenue": "revenue",
    "totalrevenue": "revenue",
    "net sales": "revenue",
    "netsales": "revenue",
    
    # Income variations
    "net income": "net_income",
    "netincome": "net_income",
    "net_income": "net_income",
    "profit": "net_income",
    "net profit": "net_income",
    "netprofit": "net_income",
    
    # COGS variations
    "cost of goods sold": "cost_of_goods_sold",
    "costofgoodssold": "cost_of_goods_sold",
    "cost_of_goods_sold": "cost_of_goods_sold",
    "cogs": "cost_of_goods_sold",
    
    # Inventory variations
    "inventory": "inventory",
    "stock": "inventory",
    "average inventory": "average_inventory",
    "averageinventory": "average_inventory",
    
    # Receivables variations
    "accounts receivable": "accounts_receivable",
    "accountsreceivable": "accounts_receivable",
    "accounts_receivable": "accounts_receivable",
    "receivables": "accounts_receivable",
    "debtors": "accounts_receivable",
    
    # EBIT variations
    "ebit": "ebit",
    "operating income": "ebit",
    "operatingincome": "ebit",
    
    # Interest variations
    "interest expense": "interest_expense",
    "interestexpense": "interest_expense",
    "interest_expense": "interest_expense",
    "interest": "interest_expense",
}


def normalize_variable_name(variable: str) -> str:
    """
    Normalize a variable name to standard format (case-insensitive, handles common variations)
    
    Args:
        variable: Variable name from formula (e.g., "Total Assets", "CaPital", "revenue")
    
    Returns:
        Normalized variable name (e.g., "total_assets", "total_equity", "revenue")
    """
    # Convert to lowercase and strip whitespace
    normalized = variable.lower().strip()
    
    # Check direct mappings
    if normalized in VARIABLE_NAME_MAPPINGS:
        return VARIABLE_NAME_MAPPINGS[normalized]
    
    # If not found, try to find partial matches
    for key, value in VARIABLE_NAME_MAPPINGS.items():
        if normalized in key or key in normalized:
            return value
    
    # If still not found, return snake_case version
    return normalized.replace(" ", "_").replace("'", "")


def extract_variables_from_formula(formula: str) -> List[str]:
    """
    Extract all variable names from a formula string
    Handles both "Current Assets" and "current_assets" formats
    
    Args:
        formula: Formula string (e.g., "Current Assets / Current Liabilities" or "current_assets / current_liabilities")
    
    Returns:
        List of variable names found in the formula (preserving original format)
    """
    # Remove operators, parentheses, and numbers to isolate variables
    # Pattern matches:
    # - Multi-word with spaces: "Current Assets", "Net Income"
    # - Snake_case: "current_assets", "net_income"
    # - CamelCase: "CurrentAssets", "NetIncome"
    
    # First, replace operators with spaces to help tokenization
    temp_formula = formula
    for op in ['/', '*', '+', '-', '(', ')', '**', '//', '%', '×', '÷']:
        temp_formula = temp_formula.replace(op, ' ')
    
    # Split by spaces and filter
    tokens = temp_formula.split()
    
    variables = []
    for token in tokens:
        # Skip if it's a number
        try:
            float(token)
            continue
        except ValueError:
            pass
        
        # Skip empty or very short tokens
        if not token or len(token) < 2:
            continue
        
        # Skip common mathematical keywords
        if token.lower() in ['and', 'or', 'not', 'if', 'else', 'then']:
            continue
        
        # Add if not already present (case-sensitive to preserve original format)
        if token not in variables:
            variables.append(token)
    
    return variables


def get_merged_ratios_config(custom_ratios: Optional[List[Dict]] = None, dev_mode: bool = False) -> Dict:
    """
    Merge base ratios with custom user-defined ratios
    
    Args:
        custom_ratios: List of custom ratio configurations
        dev_mode: If True, include custom ratios; if False, only return base ratios
    
    Returns:
        Merged dictionary of all ratios
    """
    merged = BASE_FINANCIAL_RATIOS.copy()
    
    if dev_mode and custom_ratios:
        for custom_ratio in custom_ratios:
            ratio_key = custom_ratio.get("key")
            if ratio_key:
                # Add custom flag
                custom_ratio["is_base"] = False
                custom_ratio["is_custom"] = True
                merged[ratio_key] = custom_ratio
    
    return merged


def get_merged_categories(custom_ratios: Optional[List[Dict]] = None, dev_mode: bool = False) -> Dict:
    """
    Merge base categories with custom categories from user ratios
    
    Args:
        custom_ratios: List of custom ratio configurations
        dev_mode: If True, include custom categories; if False, only return base categories
    
    Returns:
        Merged dictionary of all categories
    """
    merged = BASE_RATIO_CATEGORIES.copy()
    
    if dev_mode and custom_ratios:
        # Find unique custom categories
        custom_categories = set()
        for ratio in custom_ratios:
            category = ratio.get("category")
            if category and category not in BASE_RATIO_CATEGORIES:
                custom_categories.add(category)
        
        # Add custom categories
        for category in custom_categories:
            merged[category] = {
                "name": category.replace("_", " ").title(),
                "description": f"Custom {category.replace('_', ' ')} ratios",
                "is_base": False,
                "is_custom": True
            }
    
    return merged


def validate_formula_syntax(formula: str) -> Tuple[bool, Optional[str]]:
    """
    Validate formula syntax (basic validation)
    
    Args:
        formula: Formula string to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not formula or not formula.strip():
        return False, "Formula cannot be empty"
    
    # Check for balanced parentheses
    if formula.count("(") != formula.count(")"):
        return False, "Unbalanced parentheses in formula"
    
    # Check for empty parentheses
    if "()" in formula:
        return False, "Empty parentheses found in formula"
    
    # Check for consecutive operators
    consecutive_ops = re.search(r'[+\-*/]{2,}', formula.replace('**', ''))  # Allow ** for power
    if consecutive_ops:
        return False, f"Consecutive operators found: {consecutive_ops.group()}"
    
    # Check if formula starts or ends with operator
    if re.match(r'^[+\-*/]', formula.strip()) or re.search(r'[+\-*/]$', formula.strip()):
        return False, "Formula cannot start or end with an operator"
    
    # Check for division by zero patterns
    if "/0" in formula.replace(" ", ""):
        return False, "Division by zero detected in formula"
    
    return True, None


def validate_custom_ratio(ratio_config: Dict) -> Tuple[bool, Optional[str]]:
    """
    Validate a custom ratio configuration
    
    Args:
        ratio_config: Dictionary containing ratio configuration
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ["name", "category", "formula", "unit"]
    
    # Check required fields
    for field in required_fields:
        if field not in ratio_config or not ratio_config[field]:
            return False, f"Missing required field: {field}"
    
    # Validate formula syntax
    is_valid, error = validate_formula_syntax(ratio_config["formula"])
    if not is_valid:
        return False, error
    
    # Validate unit
    valid_units = ["%", "ratio", "times", "days", "number"]
    if ratio_config["unit"] not in valid_units:
        return False, f"Invalid unit. Must be one of: {', '.join(valid_units)}"
    
    # Validate category
    if not ratio_config["category"]:
        return False, "Category cannot be empty"
    
    return True, None


def get_available_variables(extracted_data: Dict) -> Dict[str, any]:
    """
    Get all available variables from extracted financial data
    
    Args:
        extracted_data: Financial data extracted from documents
    
    Returns:
        Flattened dictionary of available variables with their values
    """
    variables = {}
    
    def flatten_dict(d: Dict, prefix: str = ""):
        """Recursively flatten nested dictionary"""
        for key, value in d.items():
            new_key = f"{prefix}_{key}" if prefix else key
            
            if isinstance(value, dict) and key not in ["breakdown", "totals"]:
                flatten_dict(value, new_key)
            elif isinstance(value, (int, float)):
                variables[new_key] = value
                # Also add normalized version
                normalized_key = normalize_variable_name(new_key)
                if normalized_key != new_key:
                    variables[normalized_key] = value
    
    # Flatten current year data
    current_year = extracted_data.get("current_year") or extracted_data
    if current_year:
        flatten_dict(current_year)
    
    return variables


def check_formula_variables(formula: str, available_variables: Dict[str, any]) -> Dict:
    """
    Check which variables in a formula are available in the extracted data
    
    Args:
        formula: Formula string
        available_variables: Dictionary of available variables
    
    Returns:
        Dictionary with 'available', 'missing', and 'all_found' keys
    """
    formula_variables = extract_variables_from_formula(formula)
    available = []
    missing = []
    
    available_keys_lower = {k.lower(): k for k in available_variables.keys()}
    
    for var in formula_variables:
        var_normalized = normalize_variable_name(var)
        
        # Check if variable exists in available variables (case-insensitive)
        if var_normalized.lower() in available_keys_lower:
            available.append(var)
        else:
            missing.append(var)
    
    return {
        "available": available,
        "missing": missing,
        "all_found": len(missing) == 0,
        "formula_variables": formula_variables
    }
