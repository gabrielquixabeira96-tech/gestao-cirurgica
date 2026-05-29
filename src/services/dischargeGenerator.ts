import jsPDF from 'jspdf';
import { Patient } from '../types';
import { getDischargeText } from '../discharge';

export const generateDischargePDF = (patient: Patient): void => {
  const doctorName = patient.doctor ?? '';
  const sections = getDischargeText(doctorName);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const LINE_HEIGHT = 6;
  const SECTION_GAP = 8;

  // ── helpers ──────────────────────────────────────────────────────────────
  const addText = (text: string, fontSize: number, bold = false, color: [number, number, number] = [30, 30, 30]): number => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentW);
    const blockH = lines.length * (fontSize * 0.352778 + 1.5);
    if (y + blockH > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, margin, y);
    y += blockH;
    return y;
  };

  const hrLine = (color: [number, number, number] = [200, 200, 200]) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  };

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(0, 75, 135);
  doc.rect(0, 0, pageW, 32, 'F');

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('GQB OS — Orientações de Alta Hospitalar', margin, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paciente: ${patient.name}`, margin, 22);
  const today = new Date().toLocaleDateString('pt-BR');
  doc.text(`Data de Alta: ${today}`, margin, 28);
  if (doctorName) {
    const rightX = pageW - margin;
    doc.setFont('helvetica', 'bold');
    doc.text(doctorName, rightX, 22, { align: 'right' });
  }

  y = 40;
  doc.setTextColor(30, 30, 30);

  // ── Surgery summary ───────────────────────────────────────────────────────
  doc.setFillColor(245, 247, 250);
  doc.rect(margin - 2, y - 2, contentW + 4, 28, 'F');
  addText('Resumo do Procedimento', 10, true, [0, 75, 135]);
  if (patient.surgery_type) addText(`Cirurgia: ${patient.surgery_type}`, 9);
  if (patient.diagnosis) addText(`Diagnóstico: ${patient.diagnosis}${patient.cid_code ? ` (CID: ${patient.cid_code})` : ''}`, 9);
  y += 4;

  hrLine([0, 75, 135]);

  // ── Discharge sections ────────────────────────────────────────────────────
  for (const section of sections) {
    y += 2;
    addText(section.section, 11, true, [0, 75, 135]);
    hrLine([180, 200, 220]);

    for (const item of section.items) {
      if (item.title) {
        addText(`• ${item.title}`, 9, true);
        y -= 2;
        addText(`  ${item.text}`, 8.5);
      } else {
        addText(`• ${item.text}`, 8.5);
      }
      y += LINE_HEIGHT * 0.3;
    }
    y += SECTION_GAP;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 14;
  doc.setFillColor(240, 240, 240);
  doc.rect(0, footerY - 4, pageW, 18, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Em caso de dúvidas ou emergências, dirija-se ao Pronto-Socorro mais próximo ou ligue para o seu médico.',
    pageW / 2,
    footerY + 2,
    { align: 'center' }
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const fileName = `Alta_${patient.name.replace(/\s+/g, '_')}_${today.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
