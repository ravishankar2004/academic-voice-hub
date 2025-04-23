
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

interface ResultData {
  id: string;
  student_id: string;
  student_name: string;
  subject: string;
  marks_obtained: number;
  total_marks: number;
  academic_year: string;
  semester: string;
  grade: string;
}

export const generateResultPDF = (results: ResultData[], studentName: string, rollNumber: string) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(33, 110, 180); // Academic blue
  doc.text("Academic Result Report", 105, 20, { align: "center" });
  
  // Add school/college logo or name
  doc.setFontSize(14);
  doc.setTextColor(33, 110, 180); // Academic blue
  doc.text("Academic Voice Hub", 105, 30, { align: "center" });
  
  // Add horizontal line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);
  
  // Add student information
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100); // Dark gray
  doc.text(`Student Name: ${studentName}`, 14, 45);
  doc.text(`Roll Number: ${rollNumber}`, 14, 52);
  
  // Add current date
  const today = new Date();
  doc.text(`Date: ${today.toLocaleDateString()}`, 160, 45);
  
  // Group results by academic_year and semester
  const groupedResults: Record<string, ResultData[]> = {};
  
  results.forEach(result => {
    const key = `${result.academic_year} - Semester ${result.semester}`;
    if (!groupedResults[key]) {
      groupedResults[key] = [];
    }
    groupedResults[key].push(result);
  });
  
  let yPosition = 65;
  
  // Add results for each semester
  Object.entries(groupedResults).forEach(([period, semesterResults]) => {
    // Add semester heading
    doc.setFontSize(12);
    doc.setTextColor(33, 110, 180); // Academic blue
    doc.text(period, 14, yPosition);
    yPosition += 8;
    
    // Calculate total marks and percentage
    const totalObtained = semesterResults.reduce((sum, result) => sum + result.marks_obtained, 0);
    const totalPossible = semesterResults.reduce((sum, result) => sum + result.total_marks, 0);
    const percentage = ((totalObtained / totalPossible) * 100).toFixed(2);
    
    // Prepare data for table
    const tableData = semesterResults.map(result => [
      result.subject,
      result.marks_obtained.toString(),
      result.total_marks.toString(),
      result.grade
    ]);
    
    // Add table
    autoTable(doc, {
      startY: yPosition,
      head: [['Subject', 'Marks Obtained', 'Total Marks', 'Grade']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [33, 110, 180],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 10 },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });
    
    // Update y position after table
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // Add semester summary
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Marks: ${totalObtained}/${totalPossible}`, 14, yPosition);
    doc.text(`Percentage: ${percentage}%`, 100, yPosition);
    
    // Determine overall grade based on percentage
    let overallGrade = '';
    if (parseFloat(percentage) >= 90) overallGrade = 'A+';
    else if (parseFloat(percentage) >= 80) overallGrade = 'A';
    else if (parseFloat(percentage) >= 70) overallGrade = 'B';
    else if (parseFloat(percentage) >= 60) overallGrade = 'C';
    else if (parseFloat(percentage) >= 50) overallGrade = 'D';
    else overallGrade = 'F';
    
    doc.text(`Overall Grade: ${overallGrade}`, 160, yPosition);
    
    yPosition += 20;
    
    // Add a new page if needed
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
  });
  
  // Add footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const totalPages = doc.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.text('Academic Voice Hub - Official Result Document', 105, 285, { align: "center" });
    doc.text(`Page ${i} of ${totalPages}`, 195, 285, { align: "right" });
  }
  
  // Save and download the PDF
  doc.save(`${studentName.replace(/\s+/g, '_')}_Result_Report.pdf`);
};
