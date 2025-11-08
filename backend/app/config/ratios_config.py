"""
Financial Ratios Configuration
Centralized definitions for all financial ratios including formulas, interpretations, and ideal ranges.
This file now imports from base_ratios_config.py for backward compatibility.
"""

from .base_ratios_config import BASE_FINANCIAL_RATIOS, BASE_RATIO_CATEGORIES

# For backward compatibility - references the base (immutable) ratios
FINANCIAL_RATIOS_CONFIG = BASE_FINANCIAL_RATIOS

# Category definitions
RATIO_CATEGORIES = BASE_RATIO_CATEGORIES.copy()


def get_ratio_config(ratio_key: str) -> dict:
    """Get configuration for a specific ratio"""
    return FINANCIAL_RATIOS_CONFIG.get(ratio_key)


def get_all_ratios_by_category(category: str) -> dict:
    """Get all ratios for a specific category"""
    return {
        key: config 
        for key, config in FINANCIAL_RATIOS_CONFIG.items() 
        if config["category"] == category
    }


def get_ratio_formula(ratio_key: str) -> str:
    """Get just the formula for a specific ratio"""
    config = get_ratio_config(ratio_key)
    return config["formula"] if config else None
