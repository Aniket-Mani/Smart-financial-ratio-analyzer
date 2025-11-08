from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from app.services.gemini_service import gemini_service
from app.services.financial_ratios_service import FinancialRatiosService
from app.services.custom_ratios_storage import custom_ratios_storage
from app.models.schemas import AnalysisResponse, ErrorResponse
from app.utils.pdf_converter import pdf_converter
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

router = APIRouter()
ratios_service = FinancialRatiosService()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class RecalculateRequest(BaseModel):
    """Request model for ratio recalculation"""
    extracted_data: Dict[str, Any]
    custom_ratios: Optional[List[Dict[str, Any]]] = None
    dev_mode: bool = False


class RecalculateResponse(BaseModel):
    """Response model for ratio recalculation"""
    success: bool
    message: str
    ratios: Dict[str, Any]
    custom_ratios_calculated: Optional[int] = None
    warnings: Optional[List[str]] = None
    errors: Optional[List[str]] = None


class CustomRatioRequest(BaseModel):
    """Request model for custom ratio operations"""
    ratio: Dict[str, Any]
    user_id: Optional[str] = "default"


class CustomRatiosListRequest(BaseModel):
    """Request model for saving multiple custom ratios"""
    ratios: List[Dict[str, Any]]
    user_id: Optional[str] = "default"


class CustomRatiosResponse(BaseModel):
    """Response model for custom ratios operations"""
    success: bool
    message: str
    ratios: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None


def merge_financial_data(data_list: List[tuple]) -> dict:
    """
    Intelligently merge financial data from multiple images.
    Handles cases where balance sheet is split across multiple images.
    Args:
        data_list: List of (financial_data, confidence) tuples
    Returns:
        merged_data: Combined financial data dictionary
        avg_confidence: Average confidence across all images
    """
    if len(data_list) == 1:
        # Single source - ensure all_years is populated
        data, confidence = data_list[0]
        if 'all_years' not in data:
            # Build all_years from current/previous structure
            all_years = []
            if data.get('current_year'):
                all_years.append(data['current_year'])
            if data.get('previous_year') and isinstance(data['previous_year'], dict):
                # Check if previous_year has actual data
                if any(v for k, v in data['previous_year'].items() if k != 'year' and v):
                    all_years.append(data['previous_year'])
            data['all_years'] = all_years
        return data, confidence
    
    merged = {
        'current_year': {},
        'previous_year': {},
        'all_years': []  # Initialize all_years
    }
    
    confidences = []
    
    def deep_merge(base, update):
        """Recursively merge two dictionaries, preferring non-null values"""
        for key, value in update.items():
            if key in base:
                if isinstance(base[key], dict) and isinstance(value, dict):
                    deep_merge(base[key], value)
                elif value is not None:
                    # Prefer non-null values
                    if base[key] is None:
                        base[key] = value
                    elif isinstance(value, (int, float)) and isinstance(base[key], (int, float)):
                        # For numeric values, take the larger one (more complete data)
                        base[key] = max(base[key], value)
            else:
                base[key] = value
    
    # Initialize structure
    for year_key in ['current_year', 'previous_year']:
        merged[year_key] = {
            'year': None,
            'current_assets': {'total': None, 'breakdown': {}},
            'non_current_assets': {'total': None, 'breakdown': {}},
            'current_liabilities': {'total': None, 'breakdown': {}},
            'non_current_liabilities': {'total': None, 'breakdown': {}},
            'equity': {'total': None, 'breakdown': {}},
            'income_statement': {},
            'totals': {'total_assets': None, 'total_liabilities': None, 'total_equity': None}
        }
    
    # Merge all data
    all_years_from_sources = []
    for financial_data, confidence in data_list:
        confidences.append(confidence)
        
        current = financial_data.get('current_year', financial_data)
        previous = financial_data.get('previous_year', {})
        
        deep_merge(merged['current_year'], current)
        if previous and isinstance(previous, dict):
            deep_merge(merged['previous_year'], previous)
        
        # Collect all_years from FIRST source only (subsequent sources are just supplemental data for same years)
        if 'all_years' in financial_data and isinstance(financial_data['all_years'], list) and len(all_years_from_sources) == 0:
            all_years_from_sources = financial_data['all_years']
    
    # Merge all_years data from multiple sources
    if all_years_from_sources and len(data_list) > 1:
        # We have years structure from first source, now merge supplemental data
        merged['all_years'] = []
        for year_data in all_years_from_sources:
            merged_year = year_data.copy()
            # Merge this year's data from all sources
            for financial_data, _ in data_list[1:]:
                if 'all_years' in financial_data:
                    # Find matching year in other sources
                    for other_year in financial_data['all_years']:
                        if other_year.get('year') == year_data.get('year'):
                            deep_merge(merged_year, other_year)
            merged['all_years'].append(merged_year)
    elif all_years_from_sources:
        # Single source with all_years
        merged['all_years'] = all_years_from_sources
    else:
        # Build from merged current/previous as fallback
        merged['all_years'] = []
        if merged['current_year'] and merged['current_year'].get('year'):
            merged['all_years'].append(merged['current_year'])
        if merged['previous_year'] and isinstance(merged['previous_year'], dict):
            if any(v for k, v in merged['previous_year'].items() if k != 'year' and v):
                merged['all_years'].append(merged['previous_year'])
    
    # Calculate average confidence
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
    
    # Clean up empty previous year
    if not any(v for k, v in merged['previous_year'].items() if k != 'year' and v):
        merged['previous_year'] = {}
    
    return merged, avg_confidence


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_financial_statement(files: List[UploadFile] = File(...)):
    """
    Analyze uploaded financial statement images or PDFs with multi-year and multi-file support.
    Handles cases where balance sheet is split across multiple images.
    PDFs are automatically converted to images before processing.
    """
    try:
        if not files or len(files) == 0:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Collect all image bytes (from images or converted PDFs)
        all_image_bytes = []
        pdf_pages_converted = 0
        
        for file in files:
            file_bytes = await file.read()
            
            # Check if it's a PDF
            if pdf_converter.is_pdf(file_bytes):
                try:
                    # Convert PDF pages to images
                    pdf_images = pdf_converter.convert_pdf_to_images(file_bytes)
                    all_image_bytes.extend(pdf_images)
                    pdf_pages_converted += len(pdf_images)
                except Exception as e:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Failed to process PDF '{file.filename}': {str(e)}"
                    )
            else:
                # Validate it's an image
                if not file.content_type or not file.content_type.startswith('image/'):
                    raise HTTPException(
                        status_code=400, 
                        detail=f"File '{file.filename}' must be an image or PDF"
                    )
                all_image_bytes.append(file_bytes)
        
        if not all_image_bytes:
            raise HTTPException(status_code=400, detail="No valid images to process")
        
        # Extract data from all images (including converted PDF pages)
        extraction_results = []
        for img_bytes in all_image_bytes:
            financial_data, confidence = await gemini_service.extract_financial_data_from_image(img_bytes)
            extraction_results.append((financial_data, confidence))
        
        # Merge data from multiple files
        merged_data, avg_confidence = merge_financial_data(extraction_results)
        
        # Calculate ratios with multi-year support
        ratios = ratios_service.calculate_all_ratios(merged_data)
        
        # Check for warnings
        warnings = []
        
        total_sources = len(files)
        total_images = len(all_image_bytes)
        
        if pdf_pages_converted > 0:
            warnings.append(f"Converted {pdf_pages_converted} PDF page(s) to images")
        
        if total_images > 1:
            warnings.append(f"Merged data from {total_images} image(s)")
        
        if avg_confidence < 0.8:
            warnings.append(f"Average OCR confidence: {avg_confidence*100:.1f}%")
        
        # Check for missing critical data
        current_year = merged_data.get('current_year', merged_data)
        critical_fields = []
        
        if not current_year.get('current_assets', {}).get('total'):
            critical_fields.append('current_assets')
        if not current_year.get('current_liabilities', {}).get('total'):
            critical_fields.append('current_liabilities')
        if not current_year.get('totals', {}).get('total_assets'):
            critical_fields.append('total_assets')
        
        if critical_fields:
            warnings.append(f"Some fields may be incomplete: {', '.join(critical_fields)}")
        
        # Check if previous year data available - FIXED: Check if it has actual data
        previous_year = merged_data.get('previous_year')
        has_previous_year_data = (
            previous_year and 
            isinstance(previous_year, dict) and 
            len(previous_year) > 0 and
            any(v for k, v in previous_year.items() if k != 'year' and v)
        )
        
        if has_previous_year_data:
            warnings.append("Multi-year data detected - using averages for ratio calculations")
        
        return AnalysisResponse(
            success=True,
            message=f"Analysis completed successfully ({total_sources} file(s) processed, {total_images} image(s) analyzed)",
            extracted_data=merged_data,
            ratios=ratios,
            ocr_confidence=avg_confidence,
            warnings=warnings if warnings else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recalculate", response_model=RecalculateResponse)
async def recalculate_ratios(request: RecalculateRequest):
    """
    Recalculate financial ratios with optional custom ratios.
    
    This endpoint allows dynamic recalculation of ratios when:
    - User adds/modifies custom ratio formulas
    - User toggles developer mode
    - User wants to refresh calculations
    
    Args:
        request: RecalculateRequest with extracted_data, custom_ratios, and dev_mode
    
    Returns:
        RecalculateResponse with calculated ratios
    """
    try:
        extracted_data = request.extracted_data
        custom_ratios = request.custom_ratios or []
        dev_mode = request.dev_mode
        
        # Debug logging
        print(f"[RECALCULATE] Dev mode: {dev_mode}")
        print(f"[RECALCULATE] Custom ratios count: {len(custom_ratios)}")
        if custom_ratios:
            for idx, ratio in enumerate(custom_ratios):
                print(f"[RECALCULATE] Custom ratio {idx+1}: {ratio.get('name')} - Formula: {ratio.get('formula')}")
        
        # Validate extracted data
        if not extracted_data:
            raise HTTPException(
                status_code=400,
                detail="extracted_data is required"
            )
        
        warnings = []
        errors = []
        
        # Validate custom ratios if provided
        if custom_ratios:
            from app.utils.ratios_manager import validate_custom_ratio, get_available_variables, check_formula_variables
            
            # Get available variables from extracted data
            available_vars = get_available_variables(extracted_data)
            
            valid_custom_ratios = []
            for i, ratio in enumerate(custom_ratios):
                # Validate ratio structure
                is_valid, error_msg = validate_custom_ratio(ratio)
                if not is_valid:
                    errors.append(f"Custom ratio {i+1} validation failed: {error_msg}")
                    continue
                
                # Check if formula variables are available
                check_result = check_formula_variables(ratio['formula'], available_vars)
                if not check_result['all_found']:
                    missing = check_result['missing']
                    warnings.append(
                        f"Custom ratio '{ratio.get('name', 'unnamed')}' missing variables: {', '.join(missing)}"
                    )
                
                valid_custom_ratios.append(ratio)
            
            custom_ratios = valid_custom_ratios
        
        # Calculate ratios (base + custom if dev mode)
        ratios = ratios_service.calculate_all_ratios(
            data=extracted_data,
            custom_ratios=custom_ratios,
            dev_mode=dev_mode
        )
        
        # Count custom ratios calculated
        custom_count = 0
        if dev_mode and custom_ratios:
            for category_ratios in ratios.values():
                for ratio_data in category_ratios.values():
                    if isinstance(ratio_data, dict) and ratio_data.get('is_custom'):
                        custom_count += 1
        
        # Build response message
        if dev_mode and custom_ratios:
            message = f"Recalculated with {custom_count} custom ratio(s) in developer mode"
        else:
            message = "Recalculated using base ratios only"
        
        # Add warnings for data quality
        current_year = extracted_data.get('current_year', extracted_data)
        if not current_year.get('current_assets', {}).get('total'):
            warnings.append("Current assets data missing - some ratios may be unavailable")
        if not current_year.get('income_statement', {}).get('revenue'):
            warnings.append("Revenue data missing - profitability ratios may be unavailable")
        
        return RecalculateResponse(
            success=True,
            message=message,
            ratios=ratios,
            custom_ratios_calculated=custom_count if dev_mode else None,
            warnings=warnings if warnings else None,
            errors=errors if errors else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============= CUSTOM RATIOS MANAGEMENT ENDPOINTS =============

@router.get("/custom-ratios/{user_id}", response_model=CustomRatiosResponse)
async def get_custom_ratios(user_id: str = "default"):
    """
    Get all saved custom ratios for a user
    
    Args:
        user_id: User identifier (default: "default")
    
    Returns:
        CustomRatiosResponse with list of custom ratios
    """
    try:
        ratios, error = custom_ratios_storage.load_custom_ratios(user_id)
        
        if error:
            return CustomRatiosResponse(
                success=False,
                message="Failed to load custom ratios",
                error=error
            )
        
        return CustomRatiosResponse(
            success=True,
            message=f"Loaded {len(ratios)} custom ratio(s)",
            ratios=ratios
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/custom-ratios", response_model=CustomRatiosResponse)
async def save_custom_ratios(request: CustomRatiosListRequest):
    """
    Save multiple custom ratios (replaces existing)
    
    Args:
        request: CustomRatiosListRequest with ratios list and user_id
    
    Returns:
        CustomRatiosResponse confirming save
    """
    try:
        from app.utils.ratios_manager import validate_custom_ratio
        
        # Validate each ratio
        errors = []
        for i, ratio in enumerate(request.ratios):
            is_valid, error_msg = validate_custom_ratio(ratio)
            if not is_valid:
                errors.append(f"Ratio {i+1} invalid: {error_msg}")
        
        if errors:
            return CustomRatiosResponse(
                success=False,
                message="Validation failed",
                error="; ".join(errors)
            )
        
        # Save ratios
        success, error = custom_ratios_storage.save_custom_ratios(
            request.ratios, 
            request.user_id
        )
        
        if not success:
            return CustomRatiosResponse(
                success=False,
                message="Failed to save custom ratios",
                error=error
            )
        
        return CustomRatiosResponse(
            success=True,
            message=f"Saved {len(request.ratios)} custom ratio(s)",
            ratios=request.ratios
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/custom-ratios/add", response_model=CustomRatiosResponse)
async def add_custom_ratio(request: CustomRatioRequest):
    """
    Add a single custom ratio to existing list
    
    Args:
        request: CustomRatioRequest with ratio and user_id
    
    Returns:
        CustomRatiosResponse confirming addition
    """
    try:
        from app.utils.ratios_manager import validate_custom_ratio
        
        # Validate ratio
        is_valid, error_msg = validate_custom_ratio(request.ratio)
        if not is_valid:
            return CustomRatiosResponse(
                success=False,
                message="Validation failed",
                error=error_msg
            )
        
        # Add ratio
        success, error = custom_ratios_storage.add_custom_ratio(
            request.ratio,
            request.user_id
        )
        
        if not success:
            return CustomRatiosResponse(
                success=False,
                message="Failed to add custom ratio",
                error=error
            )
        
        # Load updated list
        ratios, load_error = custom_ratios_storage.load_custom_ratios(request.user_id)
        
        return CustomRatiosResponse(
            success=True,
            message=f"Added custom ratio: {request.ratio.get('name', 'unnamed')}",
            ratios=ratios
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/custom-ratios/{ratio_id}", response_model=CustomRatiosResponse)
async def delete_custom_ratio(ratio_id: str, user_id: str = "default"):
    """
    Delete a specific custom ratio
    
    Args:
        ratio_id: ID or name of ratio to delete
        user_id: User identifier
    
    Returns:
        CustomRatiosResponse confirming deletion
    """
    try:
        success, error = custom_ratios_storage.delete_custom_ratio(ratio_id, user_id)
        
        if not success:
            return CustomRatiosResponse(
                success=False,
                message="Failed to delete custom ratio",
                error=error
            )
        
        # Load updated list
        ratios, load_error = custom_ratios_storage.load_custom_ratios(user_id)
        
        return CustomRatiosResponse(
            success=True,
            message=f"Deleted custom ratio: {ratio_id}",
            ratios=ratios
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/custom-ratios", response_model=CustomRatiosResponse)
async def clear_all_custom_ratios(user_id: str = "default"):
    """
    Delete all custom ratios for a user
    
    Args:
        user_id: User identifier
    
    Returns:
        CustomRatiosResponse confirming deletion
    """
    try:
        success, error = custom_ratios_storage.clear_all_custom_ratios(user_id)
        
        if not success:
            return CustomRatiosResponse(
                success=False,
                message="Failed to clear custom ratios",
                error=error
            )
        
        return CustomRatiosResponse(
            success=True,
            message="All custom ratios cleared",
            ratios=[]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/available-variables")
async def get_available_variables():
    """
    Get list of all available financial variables that can be used in formulas
    
    Returns:
        Dictionary with categorized variables and their descriptions
    """
    variables = {
        "balance_sheet": {
            "assets": [
                {"name": "current_assets", "label": "Current Assets", "description": "Total current assets"},
                {"name": "cash", "label": "Cash", "description": "Cash and cash equivalents"},
                {"name": "accounts_receivable", "label": "Accounts Receivable", "description": "Money owed by customers"},
                {"name": "inventories", "label": "Inventories", "description": "Stock/inventory value"},
                {"name": "non_current_assets", "label": "Non-Current Assets", "description": "Long-term assets"},
                {"name": "fixed_assets", "label": "Fixed Assets", "description": "Property, plant, equipment"},
                {"name": "total_assets", "label": "Total Assets", "description": "Sum of all assets"},
            ],
            "liabilities": [
                {"name": "current_liabilities", "label": "Current Liabilities", "description": "Short-term obligations"},
                {"name": "non_current_liabilities", "label": "Non-Current Liabilities", "description": "Long-term debt"},
                {"name": "total_liabilities", "label": "Total Liabilities", "description": "Sum of all liabilities"},
            ],
            "equity": [
                {"name": "total_equity", "label": "Total Equity", "description": "Shareholders' equity"},
                {"name": "share_capital", "label": "Share Capital", "description": "Issued share capital"},
                {"name": "retained_earnings", "label": "Retained Earnings", "description": "Accumulated profits"},
            ]
        },
        "income_statement": [
            {"name": "revenue", "label": "Revenue", "description": "Total sales/income"},
            {"name": "cost_of_goods_sold", "label": "Cost of Goods Sold", "description": "Direct costs of production"},
            {"name": "gross_profit", "label": "Gross Profit", "description": "Revenue minus COGS"},
            {"name": "operating_expenses", "label": "Operating Expenses", "description": "Operating costs"},
            {"name": "operating_income", "label": "Operating Income", "description": "Profit from operations"},
            {"name": "ebit", "label": "EBIT", "description": "Earnings before interest and tax"},
            {"name": "interest_expense", "label": "Interest Expense", "description": "Interest paid on debt"},
            {"name": "income_tax_expense", "label": "Income Tax Expense", "description": "Tax liability"},
            {"name": "net_income", "label": "Net Income", "description": "Bottom line profit"},
        ],
        "averaged_values": [
            {"name": "avg_total_assets", "label": "Average Total Assets", "description": "Average of current and previous year assets"},
            {"name": "avg_total_equity", "label": "Average Total Equity", "description": "Average of current and previous year equity"},
            {"name": "avg_fixed_assets", "label": "Average Fixed Assets", "description": "Average of current and previous year fixed assets"},
        ]
    }
    
    return {
        "success": True,
        "variables": variables,
        "total_count": sum(
            len(vars) if isinstance(vars, list) else sum(len(v) for v in vars.values())
            for vars in variables.values()
        )
    }


class CompileLatexRequest(BaseModel):
    """Request model for LaTeX compilation"""
    latex_content: str


@router.post("/compile-latex")
async def compile_latex(request: CompileLatexRequest):
    """
    Compile LaTeX content to PDF using pdflatex
    
    Requires pdflatex to be installed on the system
    """
    import subprocess
    import tempfile
    import os
    from fastapi.responses import Response
    
    # Create temporary directory for LaTeX compilation
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Save LaTeX content to .tex file
        tex_file = temp_path / "document.tex"
        tex_file.write_text(request.latex_content, encoding='utf-8')
        
        try:
            # Run pdflatex twice (for TOC and references)
            for _ in range(2):
                result = subprocess.run(
                    ['pdflatex', '-interaction=nonstopmode', '-output-directory', str(temp_path), str(tex_file)],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if result.returncode != 0:
                    # Extract relevant error info from log
                    log_file = temp_path / "document.log"
                    error_details = "Unknown error"
                    if log_file.exists():
                        log_content = log_file.read_text()
                        # Extract error context (5 lines around error)
                        lines = log_content.split('\n')
                        error_lines = []
                        for i, line in enumerate(lines):
                            if line.startswith('!'):
                                # Get error and 5 lines of context
                                start = max(0, i-2)
                                end = min(len(lines), i+6)
                                error_lines = lines[start:end]
                                break
                        
                        if error_lines:
                            error_details = '\n'.join(error_lines)
                        else:
                            # Fallback: show last 20 lines of log
                            error_details = '\n'.join(lines[-20:])
                    
                    # Also print to console for debugging
                    print("=" * 60)
                    print("LATEX COMPILATION ERROR:")
                    print(error_details)
                    print("=" * 60)
                    print("STDOUT:", result.stdout[-500:] if result.stdout else "empty")
                    print("STDERR:", result.stderr[-500:] if result.stderr else "empty")
                    print("=" * 60)
                    
                    raise HTTPException(
                        status_code=500,
                        detail=f"LaTeX compilation failed: {error_details}"
                    )
            
            # Check if PDF was created
            pdf_file = temp_path / "document.pdf"
            if not pdf_file.exists():
                raise HTTPException(
                    status_code=500,
                    detail="PDF file was not created. Check LaTeX syntax."
                )
            
            # Read PDF content into memory before temp directory is deleted
            pdf_content = pdf_file.read_bytes()
            
            # Return the PDF as a streaming response
            return Response(
                content=pdf_content,
                media_type='application/pdf',
                headers={
                    'Content-Disposition': 'attachment; filename="financial_report.pdf"'
                }
            )
            
        except subprocess.TimeoutExpired:
            raise HTTPException(
                status_code=500,
                detail="LaTeX compilation timed out (>30 seconds)"
            )
        except FileNotFoundError:
            raise HTTPException(
                status_code=500,
                detail="pdflatex not found. Please install TeX Live or MiKTeX."
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Compilation error: {str(e)}"
            )
