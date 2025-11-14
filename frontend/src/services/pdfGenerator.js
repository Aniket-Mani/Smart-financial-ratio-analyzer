import { jsPDF } from 'jspdf';

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

export const generateFinancialReportPDF = (calculatedRatios) => {
  try {
    if (!calculatedRatios || Object.keys(calculatedRatios).length === 0) {
      console.error('No financial data provided');
      return false;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    doc.setFontSize(28);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setFont('Helvetica', 'bold');
    doc.text('Financial Analysis Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(11);
    doc.setTextColor(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]);
    doc.setFont('Helvetica', 'normal');
    const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Generated: ${reportDate}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 12;

    doc.setFillColor(COLORS.gray[50][0], COLORS.gray[50][1], COLORS.gray[50][2]);
    doc.rect(20, yPos, pageWidth - 40, 40, 'F');
    doc.setDrawColor(COLORS.gray[300][0], COLORS.gray[300][1], COLORS.gray[300][2]);
    doc.rect(20, yPos, pageWidth - 40, 40);

    doc.setFontSize(12);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setFont('Helvetica', 'bold');
    doc.text('Report Summary', 25, yPos + 8);

    doc.setFontSize(10);
    doc.setTextColor(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2]);
    doc.setFont('Helvetica', 'normal');
    doc.text('This comprehensive financial analysis includes liquidity, profitability,', 25, yPos + 16);
    doc.text('solvency, and efficiency ratios derived from your financial statements.', 25, yPos + 22);
    doc.text('Use this report for strategic financial planning and decision making.', 25, yPos + 28);

    yPos += 55;

    doc.setFontSize(18);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setFont('Helvetica', 'bold');
    doc.text('Financial Ratios', 20, yPos);
    yPos += 12;

    const categoryColors = {
      liquidity: COLORS.primary,
      profitability: COLORS.success,
      solvency: COLORS.secondary,
      efficiency: COLORS.warning
    };

    Object.entries(calculatedRatios).forEach(([category, ratios]) => {
      if (!ratios || Object.keys(ratios).length === 0) return;

      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      const categoryColor = categoryColors[category] || COLORS.primary;
      doc.setFillColor(categoryColor[0], categoryColor[1], categoryColor[2]);
      doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F');

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
      doc.text(`${categoryTitle} Ratios`, 25, yPos + 2);
      yPos += 12;

      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(COLORS.text.primary[0], COLORS.text.primary[1], COLORS.text.primary[2]);

      Object.entries(ratios).forEach(([ratioName, ratioData]) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(categoryColor[0], categoryColor[1], categoryColor[2]);
        const displayName = ratioName.replace(/_/g, ' ').toUpperCase();
        doc.text(`• ${displayName}`, 25, yPos);
        yPos += 5;

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(COLORS.text.secondary[0], COLORS.text.secondary[1], COLORS.text.secondary[2]);
        const value = typeof ratioData.value === 'number' ? ratioData.value.toFixed(2) + (ratioData.unit || '') : String(ratioData.value || 'N/A');
        doc.text(`  Value: ${value}`, 30, yPos);
        yPos += 4;

        const interpretation = ratioData.interpretation || 'No interpretation available';
        const wrappedText = doc.splitTextToSize(`  ${interpretation}`, pageWidth - 50);
        doc.text(wrappedText, 30, yPos);
        yPos += wrappedText.length * 3.5 + 2;
      });

      yPos += 6;
    });

    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    doc.save('financial_report.pdf');
    console.log('PDF generated successfully');
    return true;

  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
