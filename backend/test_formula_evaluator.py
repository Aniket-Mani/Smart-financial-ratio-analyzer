"""
Quick test script to verify formula evaluator functionality
Run: python backend/test_formula_evaluator.py
"""

import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.utils.formula_evaluator import (
    evaluate_formula,
    parse_and_validate_formula,
    test_formula_with_sample_data,
    get_formula_dependencies
)

def test_basic_evaluation():
    """Test basic formula evaluation"""
    print("=" * 60)
    print("TEST 1: Basic Formula Evaluation")
    print("=" * 60)
    
    # Sample data
    data = {
        "current_assets": 500000,
        "current_liabilities": 200000,
        "inventories": 100000,
        "total_assets": 1000000
    }
    
    # Test cases
    test_cases = [
        ("Current Assets / Current Liabilities", "Current Ratio"),
        ("(Current Assets - Inventories) / Current Liabilities", "Quick Ratio"),
        ("(Current Assets - Current Liabilities) / Total Assets", "Working Capital Ratio"),
        ("Current Assets * 2 - Current Liabilities", "Complex Formula"),
    ]
    
    for formula, name in test_cases:
        success, result, error = evaluate_formula(formula, data)
        
        if success:
            print(f"✅ {name}: {result:.2f}")
            print(f"   Formula: {formula}")
        else:
            print(f"❌ {name}: FAILED")
            print(f"   Error: {error}")
        print()

def test_variable_normalization():
    """Test case-insensitive variable matching"""
    print("=" * 60)
    print("TEST 2: Variable Normalization (Case-Insensitive)")
    print("=" * 60)
    
    # Data with standard names
    data = {
        "current_assets": 500000,
        "current_liabilities": 200000
    }
    
    # Test with different casings
    test_formulas = [
        "current_assets / current_liabilities",  # lowercase
        "Current Assets / Current Liabilities",  # Title Case
        "CURRENT ASSETS / CURRENT LIABILITIES",  # UPPERCASE
        "Current assets / current Liabilities",  # Mixed case
    ]
    
    for formula in test_formulas:
        success, result, error = evaluate_formula(formula, data, normalize_vars=True)
        
        if success:
            print(f"✅ Formula: {formula}")
            print(f"   Result: {result:.2f}")
        else:
            print(f"❌ Formula: {formula}")
            print(f"   Error: {error}")
        print()

def test_validation():
    """Test formula validation"""
    print("=" * 60)
    print("TEST 3: Formula Validation")
    print("=" * 60)
    
    test_cases = [
        ("A + B", True, "Valid formula"),
        ("(A + B) / C", True, "Valid with parentheses"),
        ("A / (B + C) * 100", True, "Complex valid"),
        ("A +", False, "Missing operand"),
        ("(A + B", False, "Unbalanced parentheses"),
        ("A // B", True, "Floor division"),
        ("A ** 2", True, "Power operator"),
    ]
    
    for formula, should_pass, description in test_cases:
        is_valid, error, _ = parse_and_validate_formula(formula)
        
        if is_valid == should_pass:
            status = "✅" if should_pass else "✅ (Correctly rejected)"
            print(f"{status} {description}")
            print(f"   Formula: {formula}")
        else:
            print(f"❌ {description}")
            print(f"   Formula: {formula}")
            print(f"   Expected: {'Valid' if should_pass else 'Invalid'}, Got: {'Valid' if is_valid else 'Invalid'}")
            if error:
                print(f"   Error: {error}")
        print()

def test_error_handling():
    """Test error cases"""
    print("=" * 60)
    print("TEST 4: Error Handling")
    print("=" * 60)
    
    data = {
        "assets": 100000,
        "liabilities": 50000,
        "zero_value": 0
    }
    
    test_cases = [
        ("assets / zero_value", "Division by zero"),
        ("assets / nonexistent", "Missing variable"),
        ("assets + (liabilities", "Syntax error"),
    ]
    
    for formula, expected_error in test_cases:
        success, result, error = evaluate_formula(formula, data)
        
        if not success:
            print(f"✅ Correctly caught: {expected_error}")
            print(f"   Formula: {formula}")
            print(f"   Error: {error}")
        else:
            print(f"❌ Should have failed: {expected_error}")
            print(f"   Formula: {formula}")
            print(f"   Got result: {result}")
        print()

def test_dependencies():
    """Test dependency extraction"""
    print("=" * 60)
    print("TEST 5: Formula Dependencies")
    print("=" * 60)
    
    formula = "(Current Assets - Inventory) / Current Liabilities * 100"
    
    deps = get_formula_dependencies(formula)
    
    print(f"Formula: {formula}")
    print(f"Variables found: {deps['variables']}")
    print(f"Normalized: {deps['normalized_variables']}")
    print(f"Unique: {deps['unique_variables']}")
    print(f"Syntax valid: {deps['syntax_valid']}")
    print()

def test_with_sample_data():
    """Test formula with built-in sample data"""
    print("=" * 60)
    print("TEST 6: Testing with Sample Data")
    print("=" * 60)
    
    formulas = [
        "Revenue / Total Assets",
        "(Net Income / Total Equity) * 100",
        "Current Assets / Current Liabilities",
    ]
    
    for formula in formulas:
        result = test_formula_with_sample_data(formula)
        
        if result['success']:
            print(f"✅ Formula: {formula}")
            print(f"   Result: {result['result']:.2f}")
        else:
            print(f"❌ Formula: {formula}")
            print(f"   Error: {result['error']}")
        print()

def main():
    """Run all tests"""
    print("\n")
    print("█" * 60)
    print("  FORMULA EVALUATOR TEST SUITE")
    print("█" * 60)
    print("\n")
    
    try:
        test_basic_evaluation()
        test_variable_normalization()
        test_validation()
        test_error_handling()
        test_dependencies()
        test_with_sample_data()
        
        print("=" * 60)
        print("✅ ALL TESTS COMPLETED")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ TEST SUITE FAILED: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
