import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate Financial Report PDF using jsPDF
 * Works entirely on the frontend - no backend required
 */
export const generateFinancialReportPDF = (analysisData) => {
  try {
    if (!analysisData) {
      throw new Error('No analysis data provided');
    }

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    doc.setFont('helvetica');

    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 44, 52);
    doc.text('Financial Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generated: ${today}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    // Financial Ratios Section
    if (analysisData.ratios && Object.keys(analysisData.ratios).length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(40, 44, 52);
      doc.text('Financial Ratios', 15, yPosition);
      yPosition += 8;

      const categories = {};
      Object.entries(analysisData.ratios).forEach(([key, value]) => {
        const category = value.category || 'Other';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({ name: key, ...value });
      });

      Object.entries(categories).forEach(([category, ratios]) => {
        doc.setFontSize(11);
        doc.setTextColor(60, 120, 200);
        doc.text(category.charAt(0).toUpperCase() + category.slice(1) + ' Ratios', 20, yPosition);
        yPosition += 6;

        const tableData = ratios.map(ratio => [
          ratio.name.replace(/_/g, ' ').toUpperCase(),
          formatValue(ratio.value),
          ratio.interpretation || 'N/A'
        ]);

        doc.autoTable({
          startY: yPosition,
          head: [['Ratio', 'Value', 'Interpretation']],
          body: tableData,
          margin: { left: 20, right: 20 },
          headStyles: {
            fillColor: [100, 150, 200],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [50, 50, 50]
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });

        yPosition = doc.lastAutoTable.finalY + 8;

        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 15;
        }
      });
    }

    // Extracted Data Section
    if (analysisData.extracted_data && Object.keys(analysisData.extracted_data).length > 0) {
      yPosition += 5;
      doc.setFontSize(14);
      doc.setTextColor(40, 44, 52);
      doc.text('Extracted Financial Data', 15, yPosition);
      yPosition += 8;

      const financialItems = Object.entries(analysisData.extracted_data).map(([key, value]) => [
        key.replace(/_/g, ' ').toUpperCase(),
        formatValue(value)
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Item', 'Value']],
        body: financialItems,
        margin: { left: 15, right: 15 },
        headStyles: {
          fillColor: [100, 150, 200],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save('financial_report.pdf');
    return true;

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF: ' + error.message);
    return false;
  }
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  if (typeof value === 'number') {
    if (Math.abs(value) < 100) {
      return value.toFixed(2) + '%';
    }
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  return String(value);
};
