import axios from 'axios';

/**
 * LaTeX-based Professional Financial Report PDF Generator
 * Generates high-quality financial analysis reports using LaTeX
 * for superior typography, tables, and forma    c    `;
    
        cons        
       console.log('✓ LaTeX document generated');
    console.log('🔄 Sending to backend for compilation...');
    
    // Send to backend for compilation
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/compile-latex`,
      { latex_content: latexContent },
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );✓ LaTeX document generated');
    console.log('🔄 Sending to backend for compilation...');
    
    // Send to backend for compilation
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/compile-latex`,
      { latex_content: latexContent },log('✓ LaTeX document generated');
    console.log('🔄 Sending to backend for compilation...');
    
    // Send to backend for compilation
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/compile-latex`,g('✓ LaTeX document generated');
    console.log('🔄 Sending to backend for compilation...');
    
    // Send to backend for compilation
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/compile-latex`,
      { latex_content: latexContent },
      {
        responseType: 'blob',og('✓ LaTeX document generated');
    console.log('🔄 Sending to backend for compilation...');
    
    // Send to backend for compilation
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/compile-latex`,
      { latex_content: latexContent },
      {
        responseType: 'blob',('✓ LaTeX document generated');
    console.log('🔄 Sending to backend for compilation...');
    
    // Send to backend for compilation
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/compile-latex`,
      { latex_content: latexContent },log('✓ LaTeX document generated');
    console.log('🔄 Sending to backend for compilation...');
    
    // Send to backend for compilation
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/compile-latex`,
      { latex_content: latexContent },*/

const API_BASE_URL = 'http://localhost:8000';

/**
 * Escape special LaTeX characters
 */
const escapeLatex = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
};

/**
 * Format number for LaTeX with thousand separators
 */
const formatLatexNumber = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'N/A';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Get years from data
 */
const getYearsFromData = (data) => {
  if (!data) return [];
  
  const years = [];
  if (data.year) years.push(data.year);
  if (data.previous_years && Array.isArray(data.previous_years)) {
    data.previous_years.forEach(py => {
      if (py.year) years.push(py.year);
    });
  }
  
  return years.sort((a, b) => b - a); // Sort descending (newest first)
};

/**
 * Get value for a specific year from data
 */
const getValueForYear = (data, field, year) => {
  if (!data) return null;
  
  // Check current year
  if (data.year === year) {
    return data[field];
  }
  
  // Check previous years
  if (data.previous_years && Array.isArray(data.previous_years)) {
    const yearData = data.previous_years.find(py => py.year === year);
    if (yearData) {
      return yearData[field];
    }
  }
  
  return null;
};

/**
 * Generate LaTeX preamble with packages and styling
 */
const generateLatexPreamble = () => {
  return String.raw`\documentclass[11pt,a4paper]{article}

% Essential packages
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage{geometry}
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{booktabs}
\usepackage{array}
\usepackage{longtable}
\usepackage{multirow}
\usepackage{colortbl}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{enumitem}
\usepackage{amsmath}
\usepackage{siunitx}
\usepackage{hyperref}
\usepackage{tcolorbox}
\usepackage{tikz}
\usepackage{float}

% Page geometry
\geometry{
  a4paper,
  left=2.5cm,
  right=2.5cm,
  top=3cm,
  bottom=3cm
}

% Color definitions
\definecolor{primaryblue}{RGB}{25,118,210}
\definecolor{secondaryteal}{RGB}{0,150,136}
\definecolor{successgreen}{RGB}{56,142,60}
\definecolor{warningorange}{RGB}{245,124,0}
\definecolor{errorred}{RGB}{211,47,47}
\definecolor{darkgray}{RGB}{66,66,66}
\definecolor{lightgray}{RGB}{245,245,245}

% Header and footer
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0.5pt}
\renewcommand{\footrulewidth}{0.5pt}
\fancyhead[L]{\small\textcolor{primaryblue}{\textbf{Financial Analysis Report}}}
\fancyhead[R]{\small\textcolor{darkgray}{\today}}
\fancyfoot[C]{\small\textcolor{darkgray}{\thepage}}

% Title formatting
\titleformat{\section}
  {\normalfont\Large\bfseries\color{primaryblue}}
  {\thesection}{1em}{}[\titlerule]

\titleformat{\subsection}
  {\normalfont\large\bfseries\color{secondaryteal}}
  {\thesubsection}{1em}{}

\titleformat{\subsubsection}
  {\normalfont\normalsize\bfseries\color{darkgray}}
  {\thesubsubsection}{1em}{}

% Hyperlink setup
\hypersetup{
  colorlinks=true,
  linkcolor=primaryblue,
  urlcolor=primaryblue,
  citecolor=primaryblue
}

% Number formatting
\sisetup{
  group-separator={,},
  group-minimum-digits=3,
  round-mode=places,
  round-precision=2
}

% Custom commands
\newcommand{\ratiorow}[3]{
  \textbf{#1} & #2 & \textit{#3} \\
}

\newcommand{\customratio}{\textcolor{secondaryteal}{\textbf{[Custom]}}}

`;
};

/**
 * Multi-year utility functions
 */
const extractYearsData = (extractedData) => {
  if (extractedData.all_years && Array.isArray(extractedData.all_years) && extractedData.all_years.length > 0) {
    return extractedData.all_years.sort((a, b) => {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      return yearA - yearB;
    });
  }
  
  const years = [];
  const previousYear = extractedData.previous_year;
  const currentYear = extractedData.current_year || extractedData;
  
  if (previousYear && Object.keys(previousYear).length > 0) {
    years.push(previousYear);
  }
  if (currentYear && Object.keys(currentYear).length > 0) {
    years.push(currentYear);
  }
  
  return years;
};

const getYearRange = (yearsData) => {
  if (!yearsData || yearsData.length === 0) return 'N/A';
  if (yearsData.length === 1) return yearsData[0].year || 'Current Year';
  const firstYear = yearsData[0].year || 'N/A';
  const lastYear = yearsData[yearsData.length - 1].year || 'N/A';
  return `${firstYear} to ${lastYear}`;
};

const getCurrentYearData = (yearsData) => {
  if (!yearsData || yearsData.length === 0) return {};
  return yearsData[yearsData.length - 1];
};

const calculateChange = (oldValue, newValue) => {
  const oldNum = parseFloat(oldValue) || 0;
  const newNum = parseFloat(newValue) || 0;
  if (oldNum === 0) return newNum === 0 ? 0 : null;
  return ((newNum - oldNum) / oldNum) * 100;
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};

/**
 * Generate executive summary section
 */
const generateExecutiveSummary = (data, ratios) => {
  const yearsData = extractYearsData(data);
  const currentYearData = getCurrentYearData(yearsData);
  const yearRange = getYearRange(yearsData);
  
  let latex = String.raw`
\section{Executive Summary \& Key Findings}

\subsection{Report Overview}

\begin{itemize}
\item \textbf{Analysis Period:} ${escapeLatex(yearRange)}
\item \textbf{Report Date:} \today
\item \textbf{Analysis Type:} ${yearsData.length === 1 ? 'Single Year Analysis' : yearsData.length === 2 ? 'Comparative Two-Year Analysis' : `Multi-Year Trend Analysis (${yearsData.length} years)`}
\end{itemize}

\subsection{Key Financial Metrics Summary}

\begin{table}[H]
\centering
\small
\begin{tabular}{l`;
  
  // Add columns for each year
  yearsData.forEach(() => latex += 'r');
  if (yearsData.length > 1) latex += 'rr';
  
  latex += String.raw`}
\toprule
\textbf{Metric}`;
  
  yearsData.forEach(y => latex += ` & \\textbf{${escapeLatex(String(y.year || 'N/A'))}}`);
  if (yearsData.length > 1) latex += ' & \\textbf{Change} & \\textbf{Change \\%}';
  
  latex += String.raw` \\
\midrule
`;
  
  const metrics = [
    ['Total Assets', 'totals.total_assets'],
    ['Total Liabilities', 'totals.total_liabilities'],
    ['Total Equity', 'totals.total_equity'],
    ['Revenue', 'income_statement.revenue'],
    ['Net Income', 'income_statement.net_income']
  ];
  
  metrics.forEach(([label, path]) => {
    latex += escapeLatex(label);
    const values = [];
    
    yearsData.forEach(yearData => {
      const value = getNestedValue(yearData, path) || 0;
      values.push(value);
      latex += ` & \\$${formatLatexNumber(value)}`;
    });
    
    if (yearsData.length > 1) {
      const change = values[values.length - 1] - values[0];
      const changePercent = values[0] !== 0 ? (change / values[0]) * 100 : 0;
      latex += ` & \\$${formatLatexNumber(change)} & ${changePercent > 0 ? '+' : ''}${formatLatexNumber(changePercent)}\\%`;
    }
    
    latex += ' \\\\\n';
  });
  
  latex += String.raw`\bottomrule
\end{tabular}
\end{table}

`;
  
  return latex;
};

/**
 * Generate detailed balance sheet section
 */
const generateBalanceSheetSection = (data) => {
  const yearsData = extractYearsData(data);
  const currentYear = getCurrentYearData(yearsData);
  const year = currentYear.year || 'N/A';
  
  const ca = currentYear.current_assets || {};
  const nca = currentYear.non_current_assets || {};
  const cl = currentYear.current_liabilities || {};
  const ncl = currentYear.non_current_liabilities || {};
  const eq = currentYear.equity || {};
  const totals = currentYear.totals || {};
  
  return String.raw`
\section{Balance Sheet Analysis}

\subsection{Year: ${escapeLatex(String(year))}}

\subsubsection{Assets}

\begin{table}[H]
\centering
\begin{tabular}{lr}
\toprule
\textbf{Description} & \textbf{Amount} \\
\midrule
\multicolumn{2}{l}{\textit{Current Assets}} \\
${ca.breakdown?.cash ? `\\quad Cash \\& Cash Equivalents & \\$${formatLatexNumber(ca.breakdown.cash)} \\\\\n` : ''}${ca.breakdown?.accounts_receivable ? `\\quad Accounts Receivable & \\$${formatLatexNumber(ca.breakdown.accounts_receivable)} \\\\\n` : ''}${ca.breakdown?.inventories ? `\\quad Inventories & \\$${formatLatexNumber(ca.breakdown.inventories)} \\\\\n` : ''}\textbf{Total Current Assets} & \textbf{\$${formatLatexNumber(ca.total)}} \\
\addlinespace
\multicolumn{2}{l}{\textit{Non-Current Assets}} \\
${nca.breakdown?.fixed_assets ? `\\quad Fixed Assets & \\$${formatLatexNumber(nca.breakdown.fixed_assets)} \\\\\n` : ''}${nca.breakdown?.intangible_assets ? `\\quad Intangible Assets & \\$${formatLatexNumber(nca.breakdown.intangible_assets)} \\\\\n` : ''}\textbf{Total Non-Current Assets} & \textbf{\$${formatLatexNumber(nca.total)}} \\
\midrule
\textbf{TOTAL ASSETS} & \textbf{\$${formatLatexNumber(totals.total_assets)}} \\
\bottomrule
\end{tabular}
\end{table}

\subsubsection{Liabilities \& Equity}

\begin{table}[H]
\centering
\begin{tabular}{lr}
\toprule
\textbf{Description} & \textbf{Amount} \\
\midrule
\multicolumn{2}{l}{\textit{Current Liabilities}} \\
${cl.breakdown?.accounts_payable ? `\\quad Accounts Payable & \\$${formatLatexNumber(cl.breakdown.accounts_payable)} \\\\\n` : ''}${cl.breakdown?.short_term_debt ? `\\quad Short-term Debt & \\$${formatLatexNumber(cl.breakdown.short_term_debt)} \\\\\n` : ''}\textbf{Total Current Liabilities} & \textbf{\$${formatLatexNumber(cl.total)}} \\
\addlinespace
\multicolumn{2}{l}{\textit{Non-Current Liabilities}} \\
${ncl.breakdown?.long_term_debt ? `\\quad Long-term Debt & \\$${formatLatexNumber(ncl.breakdown.long_term_debt)} \\\\\n` : ''}\textbf{Total Non-Current Liabilities} & \textbf{\$${formatLatexNumber(ncl.total)}} \\
\midrule
\textbf{TOTAL LIABILITIES} & \textbf{\$${formatLatexNumber(totals.total_liabilities)}} \\
\addlinespace
\multicolumn{2}{l}{\textit{Shareholders' Equity}} \\
${eq.breakdown?.share_capital ? `\\quad Share Capital & \\$${formatLatexNumber(eq.breakdown.share_capital)} \\\\\n` : ''}${eq.breakdown?.retained_earnings ? `\\quad Retained Earnings & \\$${formatLatexNumber(eq.breakdown.retained_earnings)} \\\\\n` : ''}\textbf{TOTAL EQUITY} & \textbf{\$${formatLatexNumber(totals.total_equity)}} \\
\bottomrule
\end{tabular}
\end{table}
`;
};

/**
 * Generate income statement section in LaTeX
 */
const generateIncomeStatementSection = (data) => {
  const yearsData = extractYearsData(data);
  const currentYear = getCurrentYearData(yearsData);
  const income = currentYear.income_statement || {};
  const revenue = income.revenue || 1;
  
  return String.raw`
\section{Income Statement Analysis}

\subsection{Year: ${escapeLatex(String(currentYear.year || 'Latest'))}}

\begin{table}[H]
\centering
\begin{tabular}{lrr}
\toprule
\textbf{Item} & \textbf{Amount} & \textbf{\% of Revenue} \\
\midrule
Revenue & \$${formatLatexNumber(income.revenue)} & 100.0\% \\
Cost of Goods Sold & (\$${formatLatexNumber(income.cost_of_goods_sold)}) & ${formatLatexNumber((Math.abs(income.cost_of_goods_sold || 0) / revenue) * 100)}\% \\
\midrule
\textbf{Gross Profit} & \textbf{\$${formatLatexNumber(income.gross_profit)}} & \textbf{${formatLatexNumber((Math.abs(income.gross_profit || 0) / revenue) * 100)}\%} \\
\addlinespace
Operating Expenses & (\$${formatLatexNumber(income.operating_expenses)}) & ${formatLatexNumber((Math.abs(income.operating_expenses || 0) / revenue) * 100)}\% \\
\midrule
\textbf{Operating Income} & \textbf{\$${formatLatexNumber(income.operating_income)}} & \textbf{${formatLatexNumber((Math.abs(income.operating_income || 0) / revenue) * 100)}\%} \\
\addlinespace
Interest Expense & (\$${formatLatexNumber(income.interest_expense)}) & ${formatLatexNumber((Math.abs(income.interest_expense || 0) / revenue) * 100)}\% \\
Income Tax Expense & (\$${formatLatexNumber(income.income_tax_expense)}) & ${formatLatexNumber((Math.abs(income.income_tax_expense || 0) / revenue) * 100)}\% \\
\midrule
\textbf{Net Income} & \textbf{\$${formatLatexNumber(income.net_income)}} & \textbf{${formatLatexNumber((Math.abs(income.net_income || 0) / revenue) * 100)}\%} \\
\bottomrule
\end{tabular}
\end{table}
`;
};

/**
 * Generate comprehensive financial ratios section
 */
const generateRatiosSection = (ratios) => {
  let latex = String.raw`
\section{Financial Ratios Analysis}

This section provides a comprehensive analysis of key financial ratios across four critical dimensions: liquidity, profitability, solvency, and efficiency.

`;

  const categoryInfo = {
    liquidity: { label: 'Liquidity Ratios', color: 'primaryblue', desc: 'Ability to meet short-term obligations' },
    profitability: { label: 'Profitability Ratios', color: 'successgreen', desc: 'Ability to generate profits' },
    solvency: { label: 'Solvency Ratios', color: 'warningorange', desc: 'Long-term financial stability' },
    efficiency: { label: 'Efficiency Ratios', color: 'secondaryteal', desc: 'Effectiveness of asset utilization' }
  };

  Object.entries(ratios).forEach(([category, categoryRatios]) => {
    const info = categoryInfo[category] || { label: category, color: 'darkgray', desc: '' };
    
    latex += String.raw`
\subsection{\textcolor{${info.color}}{${info.label}}}

\textit{${info.desc}}

\begin{longtable}{p{4.5cm}rp{5cm}p{5.5cm}}
\toprule
\textbf{Ratio} & \textbf{Value} & \textbf{Formula} & \textbf{Interpretation} \\
\midrule
\endfirsthead
\toprule
\textbf{Ratio} & \textbf{Value} & \textbf{Formula} & \textbf{Interpretation} \\
\midrule
\endhead
\bottomrule
\endfoot
`;

    Object.entries(categoryRatios).forEach(([ratioKey, ratioData]) => {
      if (ratioData && typeof ratioData === 'object') {
        const name = escapeLatex(ratioData.name || ratioKey.replace(/_/g, ' '));
        const value = ratioData.value !== null && ratioData.value !== undefined 
          ? formatLatexNumber(ratioData.value) 
          : 'N/A';
        const formula = escapeLatex(ratioData.formula || '');
        const interpretation = escapeLatex(ratioData.interpretation || 'No interpretation available');
        const isCustom = ratioData.is_custom ? ' \\customratio' : '';
        
        latex += `${name}${isCustom} & ${value} & \\textit{\\small ${formula}} & \\small ${interpretation} \\\\\n`;
      }
    });

    latex += String.raw`\end{longtable}

`;
  });

  return latex;
};

/**
 * Generate multi-year trends section
 */
const generateTrendsSection = (data) => {
  const yearsData = extractYearsData(data);
  
  if (yearsData.length < 2) {
    return String.raw`
\section{Comparative Analysis \& Trends}

Single-year data available. Multi-year comparative analysis not available.

`;
  }
  
  let latex = String.raw`
\section{Comparative Analysis \& Trends}

\subsection{Multi-Year Financial Performance}

\begin{table}[H]
\centering
\small
\begin{tabular}{l`;
  
  yearsData.forEach(() => latex += 'r');
  latex += 'rr}\\toprule\n\\textbf{Metric}';
  
  yearsData.forEach(y => latex += ` & \\textbf{${escapeLatex(String(y.year || 'N/A'))}}`);
  latex += ' & \\textbf{Overall Change} & \\textbf{Change \\%} \\\\\n\\midrule\n';
  
  const metrics = [
    { label: 'Total Assets', path: 'totals.total_assets' },
    { label: 'Total Liabilities', path: 'totals.total_liabilities' },
    { label: 'Total Equity', path: 'totals.total_equity' },
    { label: 'Revenue', path: 'income_statement.revenue' },
    { label: 'Net Income', path: 'income_statement.net_income' }
  ];
  
  metrics.forEach(({ label, path }) => {
    latex += escapeLatex(label);
    const values = [];
    
    yearsData.forEach(yearData => {
      const value = getNestedValue(yearData, path) || 0;
      values.push(value);
      latex += ` & \\$${formatLatexNumber(value)}`;
    });
    
    const change = values[values.length - 1] - values[0];
    const changePercent = values[0] !== 0 ? (change / values[0]) * 100 : 0;
    latex += ` & \\$${formatLatexNumber(change)} & ${changePercent > 0 ? '+' : ''}${formatLatexNumber(changePercent)}\\% \\\\\n`;
  });
  
  latex += `\\bottomrule
\\end{tabular}
\\end{table}

`;
  
  return latex;
};

/**
 * Generate conclusions and recommendations
 */
const generateConclusions = (data, ratios) => {
  const yearsData = extractYearsData(data);
  const currentYear = getCurrentYearData(yearsData);
  
  return String.raw`
\section{Conclusions \& Recommendations}

\subsection{Financial Health Assessment}

This comprehensive financial analysis provides a detailed assessment of the company's financial position, operational efficiency, and overall financial health. The analysis incorporates multiple dimensions of financial performance including liquidity analysis, profitability metrics, solvency indicators, and operational efficiency ratios.

All financial statements and supporting schedules have been thoroughly analyzed and compiled into this executive report. The financial ratios and performance metrics presented herein provide stakeholders with actionable insights into company performance, competitive positioning, and financial position relative to industry benchmarks and historical performance trends.

\subsection{Strategic Recommendations}

\begin{enumerate}
\item \textbf{Liquidity Management Enhancement} \\
Establish comprehensive working capital management processes including accelerated receivables collection, optimized payables management, and implementation of just-in-time inventory systems to improve cash flow position.

\item \textbf{Operational Efficiency Program} \\
Conduct detailed cost-benefit analysis of major expense categories and implement technology and automation investments to reduce variable costs while maintaining quality standards.

\item \textbf{Financial Forecasting Framework} \\
Develop rolling 12-24 month financial forecasts incorporating multiple scenarios to enable proactive financial management and early identification of potential issues.

\item \textbf{Key Performance Indicator Dashboard} \\
Create integrated real-time dashboard monitoring critical financial metrics and operational KPIs on monthly basis for faster decision-making and strategic alignment.

\item \textbf{Industry Benchmarking Analysis} \\
Conduct thorough benchmarking analysis comparing financial ratios against industry peer groups to identify performance gaps and best practices applicable to the organization.
\end{enumerate}

`;
};

/**
 * Main PDF generation export function
 * Generates LaTeX source and compiles to PDF via backend
 */
export const generatePDF = async (extractedData, ratios, fileName) => {
  try {
    console.log('📄 Generating comprehensive LaTeX document...');
    
    const yearsData = extractYearsData(extractedData);
    const yearRange = getYearRange(yearsData);
    
    console.log('Years data:', yearsData.length, 'years');
    console.log('Year range:', yearRange);
    
    // Generate complete LaTeX document with all sections
    const latexContent = generateLatexPreamble() + String.raw`
\begin{document}

% Title page
\begin{titlepage}
\centering
\vspace*{2cm}
{\Huge\bfseries\textcolor{primaryblue}{Financial Analysis Report}}\\[1cm]
{\Large Smart Financial Ratio Analyzer}\\[2cm]
{\large Generated on: \today}\\[1cm]
{\large Analysis Period: ${escapeLatex(yearRange)}}\\[4cm]
\vfill
{\large Comprehensive Financial Statement Analysis}\\[0.5cm]
{\large Multi-Year Performance Review \& Strategic Recommendations}
\end{titlepage}

\tableofcontents
\newpage

` + generateExecutiveSummary(extractedData, ratios) + 
    generateBalanceSheetSection(extractedData) + 
    generateIncomeStatementSection(extractedData) + 
    generateRatiosSection(ratios) +
    generateTrendsSection(extractedData) +
    generateConclusions(extractedData, ratios) + String.raw`

\section{Disclaimer \& Confidentiality Notice}

\subsection{Report Disclaimer}

This report was prepared using information provided and analyzed with best efforts for accuracy. The financial analysis is based on data as of the extraction date and may not reflect subsequent changes. Actual results may differ materially from projections, forecasts, and interpretations provided herein.

This report should be used in conjunction with professional financial advisory, legal, and tax counsel. All information and recommendations are proprietary and confidential. Unauthorized reproduction or distribution is strictly prohibited.

\subsection{Confidentiality}

This document contains confidential financial information intended solely for authorized recipients. Distribution, reproduction, or disclosure of this document or its contents to unauthorized parties is strictly prohibited and may be unlawful.

\vfill
\begin{center}
\textcolor{primaryblue}{\rule{0.5\textwidth}{0.4pt}}\\[0.5cm]
{\Large\textbf{End of Report}}\\[0.2cm]
\textcolor{primaryblue}{\rule{0.5\textwidth}{0.4pt}}
\end{center}

\end{document}
`;
    
    console.log('✓ LaTeX document generated (', latexContent.length, 'characters)');
    console.log('🔄 Sending to backend for compilation...');
    
    // Log first 500 chars for debugging
    console.log('LaTeX preview:', latexContent.substring(0, 500));
    
    // TEMPORARY: Save LaTeX to console for debugging
    console.log('Full LaTeX content (copy this to test):');
    console.log(latexContent);
    
    // Send to backend for compilation
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/compile-latex`,
      { latex_content: latexContent },
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('✓ PDF compiled successfully');
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const reportName = `Financial_Analysis_${timestamp}.pdf`;
    
    link.download = reportName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✓ PDF downloaded:', reportName);
    return true;
  } catch (error) {
    console.error('✗ Error generating PDF:', error);
    
    if (error.response) {
      console.error('Backend error:', error.response.data);
      console.error('Response status:', error.response.status);
      throw new Error(`PDF compilation failed: ${error.response.data.detail || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('Backend not responding. Make sure the server is running.');
    } else {
      throw error;
    }
  }
};
