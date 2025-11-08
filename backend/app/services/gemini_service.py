import google.generativeai as genai
from app.core.config import settings
import json
from typing import Dict, Tuple
from PIL import Image
import io

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash-lite')
    
    async def extract_financial_data_from_image(self, image_bytes: bytes) -> Tuple[Dict, float]:
        """
        Extract detailed financial data from image for ALL years using Gemini
        Returns: (financial_data_dict, confidence)
        """
        
        image = Image.open(io.BytesIO(image_bytes))
        
        prompt = """
You are analyzing a financial statement image. Extract ALL financial data for every year column shown.

INSTRUCTIONS:
1. Count the year columns carefully (could be 1, 2, 3, or more)
2. Extract data for EVERY year from left to right (newest → oldest)
3. Identify the year from column headers or context
4. Remove currency symbols ($, ℹ, £, ₹) and commas from numbers
5. Convert parentheses to negative: (500) → -500
6. Use null for missing/unavailable values
7. Calculate derived metrics when possible (EBIT, EBITDA, working capital)

COMPREHENSIVE EXTRACTION - Include these critical items:
- Balance Sheet: All asset, liability, and equity line items
- Income Statement: Revenue through net income with all intermediate items
- Derived Metrics: EBIT (Operating Income + Interest Expense), EBITDA, Working Capital (Current Assets - Current Liabilities)
- Book Value: Total Equity / Total Assets ratio components
- Shareholders' Equity: Common/Preferred Stock + Retained Earnings + Additional Paid-in Capital

Return JSON in this exact structure:
{
    "years": [
        {
            "year": "YYYY",
            "current_assets": {"total": number_or_null, "breakdown": {"cash": null, "accounts_receivable": null, "inventories": null, "prepaid_expenses": null, "marketable_securities": null, "other_current_assets": null}},
            "non_current_assets": {"total": number_or_null, "breakdown": {"fixed_assets": null, "property_plant_equipment": null, "intangible_assets": null, "long_term_investments": null, "goodwill": null, "other_non_current_assets": null}},
            "current_liabilities": {"total": number_or_null, "breakdown": {"accounts_payable": null, "short_term_debt": null, "accrued_expenses": null, "current_portion_long_term_debt": null, "other_current_liabilities": null}},
            "non_current_liabilities": {"total": number_or_null, "breakdown": {"long_term_debt": null, "bonds_payable": null, "deferred_tax_liabilities": null, "pension_liabilities": null, "other_non_current_liabilities": null}},
            "equity": {"total": number_or_null, "breakdown": {"common_stock": null, "preferred_stock": null, "share_capital": null, "retained_earnings": null, "additional_paid_in_capital": null, "treasury_stock": null, "accumulated_other_comprehensive_income": null}},
            "income_statement": {"revenue": null, "sales": null, "cost_of_goods_sold": null, "cogs": null, "gross_profit": null, "operating_expenses": null, "selling_general_administrative": null, "research_development": null, "depreciation_amortization": null, "operating_income": null, "ebit": null, "ebitda": null, "interest_expense": null, "interest_income": null, "other_income_expense": null, "earnings_before_tax": null, "income_tax_expense": null, "tax": null, "net_income": null, "net_profit": null},
            "derived_metrics": {"working_capital": null, "book_value_per_share": null, "shareholders_equity": null},
            "totals": {"total_assets": number_or_null, "total_liabilities": number_or_null, "total_equity": number_or_null}
        }
    ],
    "confidence": 0.9
}

CALCULATION RULES:
- If EBIT not shown, calculate as: Operating Income + Interest Expense (or Revenue - COGS - Operating Expenses)
- If EBITDA not shown, calculate as: EBIT + Depreciation + Amortization
- If Working Capital not shown, calculate as: Current Assets - Current Liabilities
- If Gross Profit not shown, calculate as: Revenue - COGS
- Shareholders' Equity = equity.total (same as Total Equity)

IMPORTANT: Return ONLY the JSON, no markdown formatting.
"""
        
        try:
            response = await self.model.generate_content_async(
                [prompt, image],
                generation_config=genai.GenerationConfig(
                    temperature=0,
                    response_mime_type="application/json"
                )
            )
            
            response_text = response.text.strip()
            
            # Clean markdown formatting
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            financial_data = json.loads(response_text)
            
            # Extract confidence
            confidence = financial_data.get('confidence', 0.90)
            if 'confidence' in financial_data:
                del financial_data['confidence']
            
            confidence = max(0.0, min(1.0, float(confidence)))
            
            # Convert new years array format to backward-compatible structure
            if 'years' in financial_data and isinstance(financial_data['years'], list):
                years_data = financial_data['years']
                
                # For backward compatibility, keep current_year and previous_year structure
                # But also include all_years for future multi-year support
                result = {
                    'current_year': years_data[0] if len(years_data) > 0 else {},
                    'previous_year': years_data[1] if len(years_data) > 1 else {},
                    'all_years': years_data  # Include all years for future use
                }
                
                return result, confidence
            
            # Old format handling - check if it's current_year/previous_year structure
            elif 'current_year' in financial_data:
                # Add all_years array for consistency
                all_years = [financial_data['current_year']]
                if financial_data.get('previous_year') and isinstance(financial_data['previous_year'], dict):
                    # Check if previous_year has actual data
                    if any(v for k, v in financial_data['previous_year'].items() if k != 'year' and v):
                        all_years.append(financial_data['previous_year'])
                
                financial_data['all_years'] = all_years
                return financial_data, confidence
            
            # Check if it's a list at top level
            elif isinstance(financial_data, list):
                # Convert list to proper structure
                result = {
                    'current_year': financial_data[0] if len(financial_data) > 0 else {},
                    'previous_year': financial_data[1] if len(financial_data) > 1 else {},
                    'all_years': financial_data
                }
                return result, confidence
            
            else:
                # Single year data without structure - wrap it
                result = {
                    'current_year': financial_data,
                    'previous_year': {},
                    'all_years': [financial_data]
                }
                return result, confidence

        except json.JSONDecodeError as e:
            try:
                # Fallback JSON parsing
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                if start != -1 and end > start:
                    clean_json = response_text[start:end]
                    financial_data = json.loads(clean_json)
                    
                    # Extract confidence
                    confidence = financial_data.get('confidence', 0.85)
                    if 'confidence' in financial_data:
                        del financial_data['confidence']
                    
                    # Apply same conversion logic
                    if 'years' in financial_data and isinstance(financial_data['years'], list):
                        years_data = financial_data['years']
                        result = {
                            'current_year': years_data[0] if len(years_data) > 0 else {},
                            'previous_year': years_data[1] if len(years_data) > 1 else {},
                            'all_years': years_data
                        }
                        return result, confidence
                    elif 'current_year' in financial_data:
                        all_years = [financial_data['current_year']]
                        if financial_data.get('previous_year') and isinstance(financial_data['previous_year'], dict):
                            if any(v for k, v in financial_data['previous_year'].items() if k != 'year' and v):
                                all_years.append(financial_data['previous_year'])
                        financial_data['all_years'] = all_years
                        return financial_data, confidence
                    else:
                        result = {
                            'current_year': financial_data,
                            'previous_year': {},
                            'all_years': [financial_data]
                        }
                        return result, confidence
                    
                raise Exception("No valid JSON found in response")
            except Exception as inner_error:
                raise Exception(f"Failed to parse Gemini response: {str(inner_error)}")
        except Exception as e:
            raise Exception(f"Error extracting financial data: {str(e)}")

gemini_service = GeminiService()
