import { jsPDF } from 'jspdf';
import { Patient } from '../types';
import { cleanWords, cleanDate } from '../dataCleaner';

export const generateTCLE = (patient: Patient) => {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const today = new Date().toLocaleDateString('pt-BR');

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  let y = 35;
  const margin = 20;
  const width = 170;

  const addText = (text: string, isBold: boolean = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const splitText = doc.splitTextToSize(text, width);
    doc.text(splitText, margin, y);
    y += (splitText.length * 5) + 2;
  };

  addText(`Eu, ${cleanWords(patient.name)}, portador do Cartão SUS nº ${patient.sus_card || '_________________'}, declaro que fui devidamente informado(a) pelo Dr(a). ${patient.doctor || '_________________'} sobre a necessidade de realização do procedimento cirúrgico: ${patient.surgery_type || '_________________'}.`);

  addText('Fui informado(a) sobre os objetivos, os riscos, os benefícios e as possíveis complicações do procedimento, bem como sobre as alternativas terapêuticas existentes.');

  addText('Compreendo que a medicina não é uma ciência exata e que não podem ser dadas garantias absolutas de cura ou de ausência de complicações.');

  addText('Autorizo a equipe médica a realizar o procedimento proposto, bem como qualquer outro procedimento adicional ou modificação que se torne necessária durante a cirurgia para salvaguardar minha saúde ou vida.');

  addText('Declaro que tive a oportunidade de fazer perguntas e que todas as minhas dúvidas foram esclarecidas de forma satisfatória.');

  addText('Este consentimento é dado de forma livre e esclarecida, podendo ser revogado por mim a qualquer momento antes da realização do procedimento, sem que isso afete meu direito a receber outros cuidados médicos.');

  y += 20;
  doc.text(`Local e Data: Paragominas - PA, ${today}`, margin, y);

  y += 30;
  doc.line(margin, y, 90, y);
  doc.line(120, y, 190, y);
  
  y += 5;
  doc.text('Assinatura do Paciente ou Responsável', 55, y, { align: 'center' });
  doc.text('Assinatura e Carimbo do Médico', 155, y, { align: 'center' });

  doc.save(`TCLE_${patient.name.replace(/\s+/g, '_')}.pdf`);
};
