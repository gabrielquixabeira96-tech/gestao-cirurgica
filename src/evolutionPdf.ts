import { jsPDF } from 'jspdf';
import { Patient } from './types';

export const generateEvolutionPdf = (patient: Patient, content: string, title: string = 'EVOLUÇÃO CLÍNICA') => {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paciente: ${patient.name}`, 15, 35);
  doc.text(`Cartão SUS: ${patient.sus_card || 'Não informado'}`, 15, 42);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 15, 49);

  doc.line(15, 55, 195, 55);

  // Body
  let y = 65;
  const pageHeight = 280; 
  const margin = 15;
  const maxWidth = 180;

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) {
      y += 4; // Add some space for empty lines
      continue;
    }

    if (y > pageHeight) {
      doc.addPage();
      y = 20;
    }

    // Handle Headers
    if (line.startsWith('### ')) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      line = line.replace('### ', '');
      y += 2;
    } else if (line.startsWith('## ')) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      line = line.replace('## ', '');
      y += 4;
    } else if (line.startsWith('# ')) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      line = line.replace('# ', '');
      y += 6;
    } else {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
    }

    // Handle Bold Text (simple regex for **text**)
    // Since jsPDF doesn't support inline bold easily without splitting text and calculating widths,
    // we will just remove the ** for now, but keep the header formatting.
    line = line.replace(/\*\*(.*?)\*\*/g, '$1');
    line = line.replace(/\*(.*?)\*/g, '$1');
    line = line.replace(/__(.*?)__/g, '$1');
    line = line.replace(/_(.*?)_/g, '$1');

    const splitText = doc.splitTextToSize(line, maxWidth);
    
    for (let j = 0; j < splitText.length; j++) {
      if (y > pageHeight) {
        doc.addPage();
        y = 20;
      }
      doc.text(splitText[j], margin, y);
      y += 6;
    }
  }

  const filename = `${title.replace(/\s+/g, '_')}_${patient.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
