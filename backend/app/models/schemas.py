from pydantic import BaseModel, Field
from typing import Optional, Dict, List

class AssetBreakdown(BaseModel):
    cash: Optional[float] = None
    accounts_receivable: Optional[float] = None
    inventories: Optional[float] = None
    prepaid_expenses: Optional[float] = None
    marketable_securities: Optional[float] = None
    other_current_assets: Optional[float] = None
    fixed_assets: Optional[float] = None
    property_plant_equipment: Optional[float] = None
    intangible_assets: Optional[float] = None
    long_term_investments: Optional[float] = None
    goodwill: Optional[float] = None
    other_non_current_assets: Optional[float] = None

class LiabilityBreakdown(BaseModel):
    accounts_payable: Optional[float] = None
    short_term_debt: Optional[float] = None
    accrued_expenses: Optional[float] = None
    current_portion_long_term_debt: Optional[float] = None
    other_current_liabilities: Optional[float] = None
    long_term_debt: Optional[float] = None
    bonds_payable: Optional[float] = None
    deferred_tax_liabilities: Optional[float] = None
    pension_liabilities: Optional[float] = None
    other_non_current_liabilities: Optional[float] = None

class EquityBreakdown(BaseModel):
    common_stock: Optional[float] = None
    preferred_stock: Optional[float] = None
    retained_earnings: Optional[float] = None
    additional_paid_in_capital: Optional[float] = None
    treasury_stock: Optional[float] = None
    accumulated_other_comprehensive_income: Optional[float] = None

class CategoryData(BaseModel):
    total: Optional[float] = None
    breakdown: Optional[Dict[str, Optional[float]]] = None

class IncomeStatement(BaseModel):
    revenue: Optional[float] = None
    cost_of_goods_sold: Optional[float] = None
    gross_profit: Optional[float] = None
    operating_expenses: Optional[float] = None
    operating_income: Optional[float] = None
    interest_expense: Optional[float] = None
    interest_income: Optional[float] = None
    other_income: Optional[float] = None
    ebit: Optional[float] = None
    ebitda: Optional[float] = None
    income_tax_expense: Optional[float] = None
    net_income: Optional[float] = None

class Totals(BaseModel):
    total_assets: Optional[float] = None
    total_liabilities: Optional[float] = None
    total_equity: Optional[float] = None

# Single year financial data
class YearlyFinancialData(BaseModel):
    year: Optional[str] = None
    current_assets: Optional[CategoryData] = None
    non_current_assets: Optional[CategoryData] = None
    current_liabilities: Optional[CategoryData] = None
    non_current_liabilities: Optional[CategoryData] = None
    equity: Optional[CategoryData] = None
    income_statement: Optional[IncomeStatement] = None
    totals: Optional[Totals] = None

# Multi-year structure (MAIN MODEL)
class MultiYearFinancialData(BaseModel):
    current_year: Optional[YearlyFinancialData] = None
    previous_year: Optional[YearlyFinancialData] = None

# Ratio detail
class RatioDetail(BaseModel):
    value: float
    formula: str
    interpretation: str
    unit: Optional[str] = None

# API Response
class AnalysisResponse(BaseModel):
    success: bool
    message: str
    extracted_data: Optional[Dict] = None  # Now contains current_year and previous_year
    ratios: Optional[Dict] = None
    ocr_confidence: Optional[float] = None
    warnings: Optional[List[str]] = None

# Error Response
class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None
