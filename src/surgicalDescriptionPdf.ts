import { jsPDF } from 'jspdf';
import { cleanWords, cleanDate, cleanSusCard } from './dataCleaner';
import { Patient } from './types';

export const generateSurgicalDescription = (patient: Patient, templateText: string) => {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const today = new Date().toLocaleDateString('pt-BR');

  // Extract surgery date from risk_status or surgery_type or diagnosis
  const extractDate = (text: string) => {
    if (!text) return '';
    const match = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      let year = match[3];
      if (!year) {
        year = '2026';
      } else if (year.length === 2) {
        year = '20' + year;
      }
      return `${day}/${month}/${year}`;
    }
    return '';
  };
  
  let surgeryDate = extractDate(patient.risk_status) || extractDate(patient.surgery_type) || extractDate(patient.diagnosis);
  if (!surgeryDate) surgeryDate = today;

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIÇÃO CIRÚRGICA', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paciente: ${cleanWords(patient.name)}`, 15, 35);
  doc.text(`Cartão SUS: ${cleanSusCard(patient.sus_card)}`, 15, 42);
  doc.text(`Data da Cirurgia: ${surgeryDate}`, 15, 49);
  doc.text(`Cirurgião: ${patient.doctor || 'Não informado'}`, 15, 56);

  doc.line(15, 60, 195, 60);

  // Body
  doc.setFontSize(10);
  const splitText = doc.splitTextToSize(templateText, 170);
  
  let y = 70;
  const pageHeight = 280; // A4 height is 297, leaving margin
  
  for (let i = 0; i < splitText.length; i++) {
    if (y > pageHeight) {
      doc.addPage();
      y = 20;
    }
    doc.text(splitText[i], 15, y);
    y += 5; // line height
  }

  doc.save(`Descricao_Cirurgica_${patient.name.replace(/\s+/g, '_')}.pdf`);
  alert(`Descrição Cirúrgica gerada para ${patient.name}`);
};
