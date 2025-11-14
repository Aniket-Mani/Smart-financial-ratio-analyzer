import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Professional Financial Report PDF Generator
 * Generates comprehensive financial analysis reports with advanced layouts,
 * professional styling, charts, graphs, and detailed financial insights
 */

// Material Design Colors
const COLORS = {
  primary: [33, 150, 243],
  secondary: [0, 137, 123],
  success: [76, 175, 80],
  warning: [255, 152, 0],
  error: [244, 67, 54],
  gray: {
    50: [250, 250, 250],
    100: [245, 245, 245],
    200: [238, 238, 238],
    300: [224, 224, 224],
    400: [189, 189, 189],
    500: [158, 158, 158],
    600: [117, 117, 117],
    700: [97, 97, 97],
    800: [66, 66, 66],
    900: [33, 33, 33],
  },
  text: {
    primary: [33, 33, 33],
    secondary: [117, 117, 117],
    light: [189, 189, 189],
  }
};

const FONTS = {
  title: 32,
  heading1: 22,
  heading2: 18,
  heading3: 15,
  body: 12,
  small: 11,
  xsmall: 10,
};

const createDocument = () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  doc.setFont('Helvetica');
  // Initialize autoTable plugin
  autoTable(doc);
  return doc;
};

const addCoverPage = (doc, fileName, extractedData) => {
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, 210, 15, 'F');
  
  doc.setFontSize(FONTS.title);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFont('Helvetica', 'bold');
  doc.text('FINANCIAL ANALYSIS REPORT', 105, 50, { align: 'center' });
  
  doc.setFontSize(FONTS.heading2);
  doc.setTextColor(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]);
  doc.setFont('Helvetica', 'normal');
  doc.text('Comprehensive Financial Ratio Analysis', 105, 60, { align: 'center' });
  
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(1);
  doc.line(40, 68, 170, 68);
  
  doc.setFontSize(FONTS.body);
  doc.setTextColor(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2]);
  doc.setFont('Helvetica', 'bold');
  
  let yPos = 90;
  doc.text('Report Details', 20, yPos);
  
  yPos += 8;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(FONTS.small);
  doc.setTextColor(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]);
  
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, yPos);
  yPos += 6;
  
  const currentYear = extractedData.current_year || extractedData;
  const previousYear = extractedData.previous_year;
  const hasMultiYear = previousYear && Object.keys(previousYear).length > 0;
  
  if (hasMultiYear) {
    doc.text(`Analysis Period: ${previousYear.year || 'Previous'} - ${currentYear.year || 'Current'}`, 20, yPos);
    yPos += 6;
    doc.text('Analysis Type: Multi-Year Comparative', 20, yPos);
  } else {
    doc.text(`Analysis Period: ${currentYear.year || 'Current Year'}`, 20, yPos);
    yPos += 6;
    doc.text('Analysis Type: Single Year', 20, yPos);
  }
  
  yPos += 16;
  
  doc.setFillColor(COLORS.gray[50][0], COLORS.gray[50][1], COLORS.gray[50][2]);
  doc.rect(20, yPos - 5, 170, 50, 'F');
  doc.setDrawColor(COLORS.gray[300][0], COLORS.gray[300][1], COLORS.gray[300][2]);
  doc.setLineWidth(0.5);
  doc.rect(20, yPos - 5, 170, 50);
  
  doc.setFontSize(FONTS.heading3);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFont('Helvetica', 'bold');
  doc.text('Key Metrics Overview', 25, yPos + 3);
  
  const totalAssets = currentYear.totals?.total_assets || 0;
  const totalLiabilities = currentYear.totals?.total_liabilities || 0;
  const totalEquity = currentYear.totals?.total_equity || 0;
  
  yPos += 12;
  doc.setFontSize(FONTS.body);
  doc.setTextColor(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2]);
  doc.setFont('Helvetica', 'normal');
  
  doc.text(`Total Assets: $${formatCurrency(totalAssets)}`, 25, yPos);
  yPos += 6;
  doc.text(`Total Liabilities: $${formatCurrency(totalLiabilities)}`, 25, yPos);
  yPos += 6;
  doc.text(`Total Equity: $${formatCurrency(totalEquity)}`, 25, yPos);
  
  return doc;
};

const addExecutiveSummary = (doc, extractedData, ratios) => {
  doc.addPage();
  
  let yPos = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  addPageHeader(doc, 'Executive Summary & Key Findings', yPos);
  yPos += 12;
  
  const currentYear = extractedData.current_year || extractedData;
  const previousYear = extractedData.previous_year;
  const hasMultiYear = previousYear && Object.keys(previousYear).length > 0;
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  doc.setFontSize(FONTS.body);
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.text('Key Financial Metrics', 20, yPos + 6);
  yPos += 12;
  
  const summaryData = [];
  const headers = hasMultiYear 
    ? ['Metric', currentYear.year || 'Current', previousYear.year || 'Previous', 'Change', 'YoY %']
    : ['Metric', currentYear.year || 'Current Year'];
  
  summaryData.push(headers);
  
  const metrics = [
    ['Total Assets', 'total_assets'],
    ['Total Liabilities', 'total_liabilities'],
    ['Total Equity', 'total_equity'],
    ['Revenue', 'revenue'],
    ['Net Income', 'net_income']
  ];
  
  metrics.forEach(([label, key]) => {
    const currentValue = getNestedValue(currentYear, `totals.${key}`) || 
                        getNestedValue(currentYear, `income_statement.${key}`) || 0;
    
    if (hasMultiYear) {
      const previousValue = getNestedValue(previousYear, `totals.${key}`) || 
                           getNestedValue(previousYear, `income_statement.${key}`) || 0;
      const change = currentValue - previousValue;
      const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
      
      summaryData.push([
        label,
        `$${formatCurrency(currentValue)}`,
        `$${formatCurrency(previousValue)}`,
        `$${formatCurrency(change)}`,
        `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`
      ]);
    } else {
      summaryData.push([label, `$${formatCurrency(currentValue)}`]);
    }
  });
  
  doc.autoTable({
    startY: yPos,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontSize: FONTS.body,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: FONTS.body,
      textColor: COLORS.text.primary
    },
    alternateRowStyles: {
      fillColor: COLORS.gray[50]
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    margin: { left: 15, right: 15 }
  });
  
  return doc;
};

const addFinancialPosition = (doc, extractedData) => {
  doc.addPage();
  
  let yPos = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  addPageHeader(doc, 'Financial Position Analysis', yPos);
  yPos += 12;
  
  const currentYear = extractedData.current_year || extractedData;
  const totalAssets = currentYear.totals?.total_assets || 0;
  const totalLiabilities = currentYear.totals?.total_liabilities || 0;
  const totalEquity = currentYear.totals?.total_equity || 0;
  
  doc.setFontSize(FONTS.heading3);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFont('Helvetica', 'bold');
  doc.text('Assets Composition', 20, yPos);
  yPos += 8;
  
  const currentAssets = currentYear.current_assets?.total || 0;
  const nonCurrentAssets = currentYear.non_current_assets?.total || 0;
  
  const assetCompositionData = [
    ['Asset Category', 'Amount', '% of Total Assets'],
    ['Current Assets', `$${formatCurrency(currentAssets)}`, `${((currentAssets / totalAssets) * 100).toFixed(1)}%`],
    ['Non-Current Assets', `$${formatCurrency(nonCurrentAssets)}`, `${((nonCurrentAssets / totalAssets) * 100).toFixed(1)}%`],
    ['Total Assets', `$${formatCurrency(totalAssets)}`, '100.0%']
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [assetCompositionData[0]],
    body: assetCompositionData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.secondary,
      textColor: [255, 255, 255],
      fontSize: FONTS.body,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: FONTS.body
    },
    alternateRowStyles: {
      fillColor: COLORS.gray[50]
    },
    margin: { left: 15, right: 15 }
  });
  
  yPos = doc.lastAutoTable.finalY + 10;
  
  if (yPos > 200) {
    doc.addPage();
    yPos = 15;
  }
  
  doc.setFontSize(FONTS.heading3);
  doc.setTextColor(COLORS.error[0], COLORS.error[1], COLORS.error[2]);
  doc.setFont('Helvetica', 'bold');
  doc.text('Liabilities Composition', 20, yPos);
  yPos += 8;
  
  const currentLiabilities = currentYear.current_liabilities?.total || 0;
  const nonCurrentLiabilities = currentYear.non_current_liabilities?.total || 0;
  
  const liabilityCompositionData = [
    ['Liability Category', 'Amount', '% of Total Liabilities'],
    ['Current Liabilities', `$${formatCurrency(currentLiabilities)}`, `${totalLiabilities > 0 ? ((currentLiabilities / totalLiabilities) * 100).toFixed(1) : '0.0'}%`],
    ['Non-Current Liabilities', `$${formatCurrency(nonCurrentLiabilities)}`, `${totalLiabilities > 0 ? ((nonCurrentLiabilities / totalLiabilities) * 100).toFixed(1) : '0.0'}%`],
    ['Total Liabilities', `$${formatCurrency(totalLiabilities)}`, '100.0%']
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [liabilityCompositionData[0]],
    body: liabilityCompositionData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.error,
      textColor: [255, 255, 255],
      fontSize: FONTS.body,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: FONTS.body
    },
    alternateRowStyles: {
      fillColor: COLORS.gray[50]
    },
    margin: { left: 15, right: 15 }
  });
  
  return doc;
};

const addBalanceSheet = (doc, extractedData) => {
  doc.addPage();
  
  let yPos = 15;
  
  addPageHeader(doc, 'Balance Sheet', yPos);
  yPos += 12;
  
  const currentYear = extractedData.current_year || extractedData;
  
  doc.setFontSize(FONTS.heading3);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFont('Helvetica', 'bold');
  doc.text('ASSETS', 20, yPos);
  yPos += 6;
  
  const assetsData = [['Description', 'Amount']];
  
  doc.setFontSize(FONTS.small);
  doc.setTextColor(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]);
  doc.setFont('Helvetica', 'bold');
  doc.text('Current Assets:', 20, yPos);
  yPos += 4;
  
  if (currentYear.current_assets?.breakdown) {
    Object.entries(currentYear.current_assets.breakdown).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        assetsData.push([`  ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`, `$${formatCurrency(value)}`]);
      }
    });
  }
  
  if (currentYear.current_assets?.total) {
    assetsData.push(['Total Current Assets', `$${formatCurrency(currentYear.current_assets.total)}`]);
  }
  
  doc.setTextColor(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]);
  doc.setFont('Helvetica', 'bold');
  doc.text('Non-Current Assets:', 20, yPos);
  yPos += 4;
  
  if (currentYear.non_current_assets?.breakdown) {
    Object.entries(currentYear.non_current_assets.breakdown).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        assetsData.push([`  ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`, `$${formatCurrency(value)}`]);
      }
    });
  }
  
  if (currentYear.non_current_assets?.total) {
    assetsData.push(['Total Non-Current Assets', `$${formatCurrency(currentYear.non_current_assets.total)}`]);
  }
  
  assetsData.push(['TOTAL ASSETS', `$${formatCurrency(currentYear.totals?.total_assets || 0)}`]);
  
  doc.autoTable({
    startY: yPos,
    head: [assetsData[0]],
    body: assetsData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontSize: FONTS.body,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: FONTS.small
    },
    alternateRowStyles: {
      fillColor: COLORS.gray[50]
    },
    margin: { left: 15, right: 15 }
  });
  
  return doc;
};

const addIncomeStatement = (doc, extractedData) => {
  doc.addPage();
  
  let yPos = 15;
  
  addPageHeader(doc, 'Income Statement', yPos);
  yPos += 12;
  
  const currentYear = extractedData.current_year || extractedData;
  const incomeStatement = currentYear.income_statement || {};
  
  const incomeData = [['Description', 'Amount', '% of Revenue']];
  const revenue = incomeStatement.revenue || 1;
  
  const items = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'cost_of_goods_sold', label: 'Cost of Goods Sold' },
    { key: 'gross_profit', label: 'Gross Profit' },
    { key: 'operating_expenses', label: 'Operating Expenses' },
    { key: 'operating_income', label: 'Operating Income' },
    { key: 'interest_expense', label: 'Interest Expense' },
    { key: 'income_before_tax', label: 'Income Before Tax' },
    { key: 'tax_expense', label: 'Tax Expense' },
    { key: 'net_income', label: 'Net Income' }
  ];
  
  items.forEach(({ key, label }) => {
    const value = incomeStatement[key];
    if (value !== null && value !== undefined) {
      const percentage = revenue > 0 ? (Math.abs(value) / revenue * 100).toFixed(1) : '0.0';
      incomeData.push([label, `$${formatCurrency(value)}`, `${percentage}%`]);
    }
  });
  
  doc.autoTable({
    startY: yPos,
    head: [incomeData[0]],
    body: incomeData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontSize: FONTS.body,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: FONTS.body
    },
    alternateRowStyles: {
      fillColor: COLORS.gray[50]
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' }
    },
    margin: { left: 15, right: 15 }
  });
  
  return doc;
};

const addFinancialRatios = (doc, ratios) => {
  doc.addPage();
  
  let yPos = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  addPageHeader(doc, 'Financial Ratios & Metrics', yPos);
  yPos += 12;
  
  const categoryColors = {
    liquidity: COLORS.primary,
    profitability: COLORS.success,
    solvency: COLORS.secondary,
    efficiency: COLORS.warning
  };
  
  Object.entries(ratios).forEach(([category, categoryRatios]) => {
    if (Object.keys(categoryRatios).length === 0) return;
    
    if (yPos > 240) {
      doc.addPage();
      yPos = 15;
    }
    
    const categoryColor = categoryColors[category] || COLORS.primary;
    doc.setFillColor(categoryColor[0], categoryColor[1], categoryColor[2]);
    doc.rect(15, yPos, pageWidth - 30, 8, 'F');
    doc.setFontSize(FONTS.body);
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${category.toUpperCase()} RATIOS`, 20, yPos + 6);
    yPos += 10;
    
    const ratioRows = [];
    
    Object.entries(categoryRatios).forEach(([name, data]) => {
      if (!ratioRows[0]) {
        ratioRows.push(['Ratio', 'Value', 'Interpretation']);
      }
      
      ratioRows.push([
        name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        `${typeof data.value === 'number' ? data.value.toFixed(2) : data.value}${data.unit || ''}`,
        data.interpretation || 'N/A'
      ]);
    });
    
    if (ratioRows.length > 1) {
      doc.autoTable({
        startY: yPos,
        head: [ratioRows[0]],
        body: ratioRows.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: categoryColor,
          textColor: [255, 255, 255],
          fontSize: FONTS.small,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 50, fontSize: FONTS.small },
          1: { cellWidth: 30, halign: 'center', fontSize: FONTS.small },
          2: { cellWidth: 80, fontSize: FONTS.small }
        },
        bodyStyles: {
          fontSize: FONTS.small,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: COLORS.gray[50]
        },
        margin: { left: 15, right: 15 }
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
    }
  });
  
  return doc;
};

const addPageHeader = (doc, title, yPos) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, yPos - 5, pageWidth, 10, 'F');
  
  doc.setFontSize(FONTS.heading2);
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.text(title, 20, yPos + 2);
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};

const formatCurrency = (value) => {
  if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(2) + 'K';
  return value.toFixed(2);
};

export const generateFinancialReportPDF = (calculatedRatios) => {
  try {
    if (!calculatedRatios || Object.keys(calculatedRatios).length === 0) {
      alert('No data to generate PDF');
      return false;
    }

    const doc = createDocument();
    
    let yPos = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(FONTS.title);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setFont('Helvetica', 'bold');
    doc.text('Financial Analysis Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;
    
    // Date
    doc.setFontSize(FONTS.small);
    doc.setTextColor(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Financial Ratios Section
    doc.setFontSize(FONTS.heading2);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setFont('Helvetica', 'bold');
    doc.text('Financial Ratios', 15, yPos);
    yPos += 8;
    
    const categoryColors = {
      liquidity: COLORS.primary,
      profitability: COLORS.success,
      solvency: COLORS.secondary,
      efficiency: COLORS.warning
    };
    
    Object.entries(calculatedRatios).forEach(([category, ratios]) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 15;
      }
      
      const categoryColor = categoryColors[category] || COLORS.primary;
      doc.setFillColor(categoryColor[0], categoryColor[1], categoryColor[2]);
      doc.rect(15, yPos, pageWidth - 30, 8, 'F');
      doc.setFontSize(FONTS.body);
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.text(category.toUpperCase() + ' RATIOS', 20, yPos + 6);
      yPos += 10;
      
      const tableData = [];
      Object.entries(ratios).forEach(([key, value]) => {
        tableData.push([
          key.replace(/_/g, ' ').toUpperCase(),
          typeof value.value === 'number' ? value.value.toFixed(2) : value.value,
          value.interpretation || 'N/A'
        ]);
      });
      
      doc.autoTable({
        startY: yPos,
        head: [['Ratio', 'Value', 'Interpretation']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: categoryColor,
          textColor: [255, 255, 255],
          fontSize: FONTS.small,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: FONTS.small
        },
        alternateRowStyles: {
          fillColor: COLORS.gray[50]
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 100 }
        },
        margin: { left: 15, right: 15 }
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
    });
    
    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, 290, { align: 'center' });
    }
    
    doc.save('financial_report.pdf');
    return true;

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF: ' + error.message);
    return false;
  }
};
