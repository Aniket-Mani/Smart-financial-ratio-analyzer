"""
Base Financial Ratios Configuration (IMMUTABLE)
These are the 13 core financial ratios that cannot be modified by users.
This configuration is used when NOT in developer mode.
"""

BASE_FINANCIAL_RATIOS = {
    # LIQUIDITY RATIOS
    "current_ratio": {
        "name": "Current Ratio",
        "category": "liquidity",
        "formula": "Current Assets / Current Liabilities",
        "interpretation": "Measures ability to pay short-term obligations",
        "ideal_range": {
            "min": 1.5,
            "max": 3.0,
            "optimal": 2.0
        },
        "unit": "ratio",
        "higher_is_better": True,
        "is_base": True  # Flag to identify base ratios
    },
    "quick_ratio": {
        "name": "Quick Ratio (Acid Test)",
        "category": "liquidity",
        "formula": "(Current Assets - Inventory) / Current Liabilities",
        "interpretation": "Measures ability to pay short-term obligations without selling inventory",
        "ideal_range": {
            "min": 1.0,
            "max": 2.0,
            "optimal": 1.5
        },
        "unit": "ratio",
        "higher_is_better": True,
        "is_base": True
    },
    
    # PROFITABILITY RATIOS
    "gross_profit_margin": {
        "name": "Gross Profit Margin",
        "category": "profitability",
        "formula": "((Revenue - Cost of Goods Sold) / Revenue) × 100",
        "interpretation": "Percentage of revenue remaining after deducting cost of goods sold",
        "ideal_range": {
            "min": 20.0,
            "max": 50.0,
            "optimal": 30.0
        },
        "unit": "%",
        "higher_is_better": True,
        "is_base": True
    },
    "net_profit_margin": {
        "name": "Net Profit Margin",
        "category": "profitability",
        "formula": "(Net Income / Revenue) × 100",
        "interpretation": "Percentage of revenue that translates to profit",
        "ideal_range": {
            "min": 5.0,
            "max": 20.0,
            "optimal": 10.0
        },
        "unit": "%",
        "higher_is_better": True,
        "is_base": True
    },
    "return_on_equity": {
        "name": "Return on Equity (ROE)",
        "category": "profitability",
        "formula": "(Net Income / Shareholders' Equity) × 100",
        "interpretation": "How efficiently the company generates profit from shareholders' equity",
        "ideal_range": {
            "min": 10.0,
            "max": 25.0,
            "optimal": 15.0
        },
        "unit": "%",
        "higher_is_better": True,
        "is_base": True
    },
    "return_on_assets": {
        "name": "Return on Assets (ROA)",
        "category": "profitability",
        "formula": "(Net Income / Total Assets) × 100",
        "interpretation": "How efficiently the company uses its assets to generate profit",
        "ideal_range": {
            "min": 5.0,
            "max": 20.0,
            "optimal": 10.0
        },
        "unit": "%",
        "higher_is_better": True,
        "is_base": True
    },
    
    # SOLVENCY RATIOS
    "debt_to_equity": {
        "name": "Debt to Equity Ratio",
        "category": "solvency",
        "formula": "Total Liabilities / Shareholders' Equity",
        "interpretation": "Indicates the relative proportion of debt and equity used to finance assets",
        "ideal_range": {
            "min": 0.0,
            "max": 1.5,
            "optimal": 0.5
        },
        "unit": "ratio",
        "higher_is_better": False,
        "is_base": True
    },
    "debt_ratio": {
        "name": "Debt Ratio",
        "category": "solvency",
        "formula": "(Total Liabilities / Total Assets) × 100",
        "interpretation": "Percentage of assets financed by debt",
        "ideal_range": {
            "min": 0.0,
            "max": 60.0,
            "optimal": 40.0
        },
        "unit": "%",
        "higher_is_better": False,
        "is_base": True
    },
    "interest_coverage": {
        "name": "Interest Coverage Ratio",
        "category": "solvency",
        "formula": "EBIT / Interest Expense",
        "interpretation": "Ability to pay interest on outstanding debt",
        "ideal_range": {
            "min": 2.5,
            "max": 10.0,
            "optimal": 5.0
        },
        "unit": "times",
        "higher_is_better": True,
        "is_base": True
    },
    
    # EFFICIENCY RATIOS
    "asset_turnover": {
        "name": "Asset Turnover Ratio",
        "category": "efficiency",
        "formula": "Revenue / Total Assets",
        "interpretation": "How efficiently assets are used to generate revenue",
        "ideal_range": {
            "min": 0.5,
            "max": 2.0,
            "optimal": 1.0
        },
        "unit": "times",
        "higher_is_better": True,
        "is_base": True
    },
    "fixed_asset_turnover": {
        "name": "Fixed Asset Turnover",
        "category": "efficiency",
        "formula": "Revenue / Fixed Assets",
        "interpretation": "How efficiently fixed assets generate revenue",
        "ideal_range": {
            "min": 1.0,
            "max": 5.0,
            "optimal": 2.0
        },
        "unit": "times",
        "higher_is_better": True,
        "is_base": True
    },
    "inventory_turnover": {
        "name": "Inventory Turnover Ratio",
        "category": "efficiency",
        "formula": "Cost of Goods Sold / Average Inventory",
        "interpretation": "How many times inventory is sold and replaced in a period",
        "ideal_range": {
            "min": 4.0,
            "max": 12.0,
            "optimal": 6.0
        },
        "unit": "times",
        "higher_is_better": True,
        "is_base": True
    },
    "debtors_turnover": {
        "name": "Debtors Turnover Ratio",
        "category": "efficiency",
        "formula": "Revenue / Accounts Receivable",
        "interpretation": "How quickly the company collects payments from customers",
        "ideal_range": {
            "min": 6.0,
            "max": 12.0,
            "optimal": 8.0
        },
        "unit": "times",
        "higher_is_better": True,
        "is_base": True
    }
}

# Base category definitions (immutable)
BASE_RATIO_CATEGORIES = {
    "liquidity": {
        "name": "Liquidity Ratios",
        "description": "Measure the company's ability to pay short-term obligations",
        "is_base": True
    },
    "profitability": {
        "name": "Profitability Ratios",
        "description": "Measure the company's ability to generate profit",
        "is_base": True
    },
    "solvency": {
        "name": "Solvency Ratios",
        "description": "Measure the company's ability to meet long-term obligations",
        "is_base": True
    },
    "efficiency": {
        "name": "Efficiency Ratios",
        "description": "Measure how efficiently the company uses its assets",
        "is_base": True
    }
}
