# 📊 Smart Financial Ratio Analyzer

An AI-powered financial statement analyzer that uses Google's Gemini AI to extract data from images and calculate comprehensive financial ratios with multi-year and multi-file support.

## ✨ Features

### 🚀 Core Capabilities
- **Multi-File Upload**: Upload multiple images of the same balance sheet (e.g., split across pages) - data is intelligently merged
- **AI-Powered OCR**: Uses Google Gemini to extract financial data from images
- **Multi-Year Analysis**: Automatically detects and processes data from multiple years
- **Comprehensive Ratios**: Calculates liquidity, profitability, solvency, and efficiency ratios
- **Graceful Error Handling**: Works even with incomplete data, showing N/A where needed
- **Professional PDF Reports**: Generates detailed PDF reports with LaTeX-style formulas

### 📑 User Interface
- **Tabbed Interface**: Clean organization with tabs for:
  - 📄 Extracted Data - View all extracted financial information
  - 📊 Financial Ratios - Comprehensive ratio analysis with color-coded indicators
  - 📈 Year Comparison - Side-by-side comparison when multi-year data is available
- **Modern Material Design**: Beautiful, responsive UI with smooth animations
- **Real-time Validation**: Instant feedback on data quality and completeness
- **Drag & Drop**: Easy file upload with drag-and-drop support

### 🎯 Financial Ratios Calculated

#### Liquidity Ratios
- Current Ratio
- Quick Ratio (Acid-Test)

#### Profitability Ratios
- Gross Profit Margin
- Net Profit Margin
- Return on Equity (ROE)
- Return on Assets (ROA)

#### Solvency Ratios
- Debt to Equity Ratio
- Debt Ratio
- Interest Coverage Ratio

#### Efficiency Ratios
- Asset Turnover
- Fixed Asset Turnover
- Inventory Turnover
- Debtors (Receivables) Turnover

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **Google Gemini AI** - Advanced AI for OCR and data extraction
- **Pydantic** - Data validation and settings management
- **Python 3.10+** - Core programming language

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **jsPDF & autoTable** - PDF generation with tables

## 📋 Prerequisites

- Python 3.10 or higher
- Node.js 16 or higher
- Google Gemini API key

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-financial-ratio-analyzer
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
GEMINI_API_KEY=your_gemini_api_key_here
DEBUG=True
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:3000"]
EOF

# Run the backend
python main.py
```

The backend will start at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8000/api/v1
EOF

# Run the frontend
npm run dev
```

The frontend will start at `http://localhost:5173`

## 📖 Usage Guide

### Basic Workflow

1. **Upload Files**
   - Choose "Single Image" for one file
   - Choose "Multiple Images" for files that are split (e.g., a large balance sheet across 2 images)
   - Drag and drop or click to select files

2. **Extract & Analyze**
   - Click "Extract Financial Data"
   - The AI will process your image(s) and extract financial data
   - Data from multiple files is automatically merged

3. **View Results**
   - **Extracted Data Tab**: Review all extracted financial information
     - Toggle between years if multi-year data is detected
     - Expand/collapse sections to see details
   - **Financial Ratios Tab**: See calculated ratios with:
     - Color-coded status indicators (Green=Good, Yellow=Warning, Red=Poor)
     - Formulas and interpretations
     - Data quality indicators
   - **Year Comparison Tab**: Compare metrics year-over-year (if available)
     - Side-by-side values
     - Change in dollars and percentages
     - Visual indicators

4. **Generate Report**
   - Click "Export PDF" to generate a comprehensive PDF report
   - Includes all data, ratios, comparisons, and recommendations

### Multi-File Upload

When you have a balance sheet split across multiple images:

1. Switch to "Multiple Images" mode
2. Select all related images
3. The system will:
   - Process each image independently
   - Intelligently merge the extracted data
   - Prefer non-null values when merging
   - Calculate ratios from the combined data

### Handling Incomplete Data

The system gracefully handles missing information:

- Ratios that cannot be calculated show "N/A"
- Data quality indicators show if values are estimated
- Missing fields are clearly listed
- PDF reports highlight incomplete sections
- Analysis continues even with partial data

## 🔧 Configuration

### Backend Environment Variables

```env
# Required
GEMINI_API_KEY=your_api_key

# Optional
DEBUG=True
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=["http://localhost:5173"]
```

### Frontend Environment Variables

```env
# Optional - defaults to localhost:8000
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 📁 Project Structure

```
smart-financial-ratio-analyzer/
├── backend/
│   ├── main.py                 # FastAPI application entry
│   ├── requirements.txt        # Python dependencies
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── financial_analysis.py  # Multi-file upload endpoint
│   │   ├── services/
│   │   │   ├── gemini_service.py         # AI OCR extraction
│   │   │   └── financial_ratios_service.py  # Ratio calculations
│   │   ├── models/
│   │   │   └── schemas.py      # Pydantic models
│   │   └── core/
│   │       └── config.py       # Configuration
│   └── uploads/                # Temporary file storage
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── App.jsx         # Main application
│   │   ├── components/
│   │   │   ├── FileUpload.jsx  # Multi-file upload UI
│   │   │   ├── TabbedView.jsx  # Tabbed interface
│   │   │   ├── ExtractedDataDisplay.jsx
│   │   │   └── QuickResults.jsx
│   │   └── services/
│   │       ├── api.js          # Backend API calls
│   │       └── pdfGenerator.js # PDF report generation
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'google.generativeai'`
```bash
pip install google-generativeai
```

**Issue**: `Gemini API key not configured`
- Check that `.env` file exists in `backend/` directory
- Verify `GEMINI_API_KEY` is set correctly
- Get API key from: https://makersuite.google.com/app/apikey

### Frontend Issues

**Issue**: `Failed to fetch` or CORS errors
- Ensure backend is running on port 8000
- Check `ALLOWED_ORIGINS` in backend `.env`
- Verify `VITE_API_BASE_URL` in frontend `.env`

**Issue**: Files not uploading
- Check file format (must be images: PNG, JPG, JPEG, TIFF, BMP)
- Verify file size (backend may have limits)
- Check browser console for errors

## 🚀 Deployment

### Backend Deployment

For production deployment, consider:

1. Use a production ASGI server:
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. Set environment variables:
   ```env
   DEBUG=False
   ALLOWED_ORIGINS=["https://yourdomain.com"]
   ```

3. Use a reverse proxy (nginx/Caddy)

### Frontend Deployment

```bash
cd frontend
npm run build
```

Deploy the `dist/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini AI for powerful OCR capabilities
- FastAPI for the excellent Python framework
- React and Vite for the modern frontend stack
- jsPDF for PDF generation capabilities

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: [your-email@example.com]

## 🗺️ Roadmap

- [ ] Support for PDF input files (not just images)
- [ ] Historical trend analysis (3+ years)
- [ ] Industry benchmarking
- [ ] Interactive charts and graphs
- [ ] Export to Excel/CSV
- [ ] User authentication and saved reports
- [ ] Batch processing of multiple companies
- [ ] Mobile app version

---

Made with ❤️ using AI-powered financial analysis
