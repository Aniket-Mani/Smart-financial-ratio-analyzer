"""
Safe Formula Evaluator
Safely evaluates mathematical formulas without using exec() or eval()
Handles variable mapping, normalization, and error handling
"""

import ast
import operator
import re
from typing import Dict, Tuple, Optional, Any
from .ratios_manager import normalize_variable_name, extract_variables_from_formula


# Safe operators mapping
SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.FloorDiv: operator.floordiv,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


class FormulaEvaluationError(Exception):
    """Custom exception for formula evaluation errors"""
    pass


def normalize_formula_variables(formula: str, variable_mapping: Dict[str, float]) -> str:
    """
    Replace variables in formula with Python-compatible underscore-separated names
    Handles multi-word variables like "Current Assets" → "current_assets"
    
    Args:
        formula: Original formula string (e.g., "Current Assets / Current Liabilities")
        variable_mapping: Dictionary of available variables and their values
    
    Returns:
        Normalized formula with Python-compatible variable names
    """
    from .ratios_manager import normalize_variable_name
    
    # First, ensure all keys in variable_mapping use underscores
    clean_mapping = {k.replace(' ', '_'): v for k, v in variable_mapping.items()}
    
    # Build a list of possible variable names to search for (from long to short)
    # This includes both the original keys and common multi-word variants
    possible_vars = []
    
    # Add keys from mapping
    for key in clean_mapping.keys():
        possible_vars.append(key)
        # Also add space-separated version
        if '_' in key:
            possible_vars.append(key.replace('_', ' '))
    
    # Add common multi-word financial terms
    multi_word_terms = [
        'Current Assets', 'Current Liabilities', 'Total Assets', 'Total Liabilities',
        'Total Equity', 'Net Income', 'Gross Profit', 'Operating Income',
        'Fixed Assets', 'Non Current Assets', 'Accounts Receivable',
        'Cost of Goods Sold', 'Interest Expense', 'Income Tax Expense',
        'Retained Earnings', 'Share Capital', 'Working Capital'
    ]
    possible_vars.extend(multi_word_terms)
    
    # Sort by length (longest first) to avoid partial replacements
    possible_vars = list(set(possible_vars))  # Remove duplicates
    possible_vars.sort(key=len, reverse=True)
    
    normalized_formula = formula
    replacements_made = {}
    
    # Try to find and replace each possible variable
    for var in possible_vars:
        # Create case-insensitive pattern with word boundaries
        pattern = re.compile(r'\b' + re.escape(var) + r'\b', re.IGNORECASE)
        matches = pattern.findall(normalized_formula)
        
        if matches:
            # Normalize the variable name
            norm_var = normalize_variable_name(var)
            
            # Find matching key in clean_mapping (case-insensitive)
            matched_key = None
            for key in clean_mapping.keys():
                if key.lower() == norm_var.lower() or norm_var.lower() in key.lower():
                    matched_key = key
                    break
            
            if matched_key:
                # Replace all occurrences
                normalized_formula = pattern.sub(matched_key, normalized_formula)
                replacements_made[var] = matched_key
    
    return normalized_formula


def safe_eval_ast(node: ast.AST, variables: Dict[str, float]) -> float:
    """
    Safely evaluate an AST node with given variables
    
    Args:
        node: AST node to evaluate
        variables: Dictionary of variable names and their values
    
    Returns:
        Evaluated result as float
    
    Raises:
        FormulaEvaluationError: If evaluation fails
    """
    if isinstance(node, ast.Num):  # Number constant (Python < 3.8)
        return float(node.n)
    
    elif isinstance(node, ast.Constant):  # Number constant (Python >= 3.8)
        return float(node.value)
    
    elif isinstance(node, ast.Name):  # Variable
        var_name = node.id
        if var_name not in variables:
            raise FormulaEvaluationError(f"Variable '{var_name}' not found in data")
        return float(variables[var_name])
    
    elif isinstance(node, ast.BinOp):  # Binary operation (e.g., a + b)
        op_type = type(node.op)
        if op_type not in SAFE_OPERATORS:
            raise FormulaEvaluationError(f"Unsupported operator: {op_type.__name__}")
        
        left = safe_eval_ast(node.left, variables)
        right = safe_eval_ast(node.right, variables)
        
        # Handle division by zero
        if op_type == ast.Div and right == 0:
            raise FormulaEvaluationError("Division by zero")
        
        return SAFE_OPERATORS[op_type](left, right)
    
    elif isinstance(node, ast.UnaryOp):  # Unary operation (e.g., -a)
        op_type = type(node.op)
        if op_type not in SAFE_OPERATORS:
            raise FormulaEvaluationError(f"Unsupported unary operator: {op_type.__name__}")
        
        operand = safe_eval_ast(node.operand, variables)
        return SAFE_OPERATORS[op_type](operand)
    
    elif isinstance(node, ast.Expression):  # Expression wrapper
        return safe_eval_ast(node.body, variables)
    
    else:
        raise FormulaEvaluationError(f"Unsupported AST node type: {type(node).__name__}")


def parse_and_validate_formula(formula: str) -> Tuple[bool, Optional[str], Optional[ast.AST]]:
    """
    Parse and validate formula syntax using AST
    
    Args:
        formula: Formula string to validate
    
    Returns:
        Tuple of (is_valid, error_message, ast_tree)
    """
    if not formula or not formula.strip():
        return False, "Formula cannot be empty", None
    
    # Replace × with * for Python
    clean_formula = formula.replace('×', '*').replace('÷', '/')
    
    try:
        # Parse the formula as an expression
        tree = ast.parse(clean_formula, mode='eval')
        
        # Check if it only contains safe operations
        for node in ast.walk(tree):
            if isinstance(node, (ast.Call, ast.Lambda, ast.FunctionDef)):
                return False, "Function calls are not allowed in formulas", None
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                return False, "Import statements are not allowed", None
            if isinstance(node, (ast.Attribute, ast.Subscript)):
                return False, "Attribute access and subscripts are not allowed", None
        
        return True, None, tree
        
    except SyntaxError as e:
        return False, f"Syntax error: {str(e)}", None
    except Exception as e:
        return False, f"Validation error: {str(e)}", None


def evaluate_formula(
    formula: str, 
    data: Dict[str, Any],
    normalize_vars: bool = True
) -> Tuple[bool, Optional[float], Optional[str]]:
    """
    Safely evaluate a formula with given data
    
    Args:
        formula: Formula string to evaluate (can use spaces in variable names)
        data: Dictionary containing variable values (keys should use underscores)
        normalize_vars: Whether to normalize variable names
    
    Returns:
        Tuple of (success, result, error_message)
    """
    try:
        # Ensure data keys have underscores not spaces (for Python compatibility)
        clean_data = {k.replace(' ', '_'): v for k, v in data.items()}
        
        # Normalize formula variables if needed
        if normalize_vars:
            formula = normalize_formula_variables(formula, clean_data)
        
        # Replace mathematical symbols with Python operators
        clean_formula = formula.replace('×', '*').replace('÷', '/')
        
        # Validate formula syntax
        is_valid, error, ast_tree = parse_and_validate_formula(clean_formula)
        if not is_valid:
            return False, None, error
        
        # Evaluate the formula with clean data
        result = safe_eval_ast(ast_tree, clean_data)
        
        # Check for invalid results
        if result is None or (isinstance(result, float) and (result != result)):  # NaN check
            return False, None, "Formula evaluation resulted in invalid value (NaN)"
        
        return True, result, None
        
    except FormulaEvaluationError as e:
        return False, None, str(e)
    except ZeroDivisionError:
        return False, None, "Division by zero"
    except (ValueError, TypeError) as e:
        return False, None, f"Calculation error: {str(e)}"
    except Exception as e:
        return False, None, f"Unexpected error: {str(e)}"


def test_formula_with_sample_data(formula: str, sample_data: Optional[Dict[str, float]] = None) -> Dict:
    """
    Test a formula with sample data to verify it works
    
    Args:
        formula: Formula to test (can use multi-word variables)
        sample_data: Optional sample data. If not provided, uses default test values
    
    Returns:
        Dictionary with test results
    """
    if sample_data is None:
        sample_data = {
            "total_assets": 1000000,
            "total_liabilities": 400000,
            "total_equity": 600000,
            "current_assets": 500000,
            "current_liabilities": 200000,
            "revenue": 2000000,
            "net_income": 150000,
            "cost_of_goods_sold": 1200000,
            "inventory": 100000,
            "accounts_receivable": 150000,
            "fixed_assets": 500000,
            "ebit": 200000,
            "interest_expense": 20000,
        }
    
    # Try to evaluate (this will handle normalization)
    success, result, error = evaluate_formula(formula, sample_data)
    
    return {
        "success": success,
        "result": result,
        "error": error,
        "syntax_valid": success,  # If evaluation succeeded, syntax was valid
        "sample_data_used": sample_data
    }


def get_formula_dependencies(formula: str) -> Dict[str, Any]:
    """
    Analyze formula and return its dependencies
    
    Args:
        formula: Formula string
    
    Returns:
        Dictionary with dependency information
    """
    # Extract variables
    variables = extract_variables_from_formula(formula)
    normalized_vars = [normalize_variable_name(v) for v in variables]
    
    # Validate syntax
    is_valid, error, ast_tree = parse_and_validate_formula(formula)
    
    return {
        "variables": variables,
        "normalized_variables": normalized_vars,
        "unique_variables": list(set(normalized_vars)),
        "syntax_valid": is_valid,
        "syntax_error": error,
        "formula_cleaned": formula.replace('×', '*').replace('÷', '/')
    }
