import { jsPDF } from 'jspdf';

export interface SurgicalReportData {
  patientName: string;
  doctorName: string;
  surgery: string;
  date: string;
  time: string;
}

export const generateSurgicalReportPdf = async (data: SurgicalReportData, generatedText: string) => {
  // 2. Generate PDF from scratch using jsPDF
  try {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    
    // Configurações de fonte e cores
    doc.setFont('helvetica');
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      doc.setDrawColor(0, 100, 0); // Verde escuro para as linhas
      doc.setLineWidth(0.5);
      doc.line(x1, y1, x2, y2);
    };

    const writeLabel = (text: string, x: number, y: number) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 100, 0); // Verde escuro
      doc.text(text, x, y);
    };

    const writeValue = (text: string, x: number, y: number, maxWidth?: number) => {
      if (!text) return;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0); // Preto
      if (maxWidth) {
        const split = doc.splitTextToSize(text, maxWidth);
        doc.text(split, x, y);
      } else {
        doc.text(text, x, y);
      }
    };

    // Tentar carregar a logo
    try {
      doc.addImage('/logohg.png', 'PNG', 10, 10, 25, 30);
    } catch (e) {
      console.warn("Logo não encontrada, gerando sem logo.");
    }

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 100, 0);
    doc.text('RELATÓRIO DE CIRURGIA', 80, 25);

    let startY = 45;
    const lineSpacing = 8;

    // Linha 1: Nome do Paciente, Idade, Sexo, Data
    writeLabel('Nome do Paciente:', 10, startY);
    writeValue(data.patientName, 45, startY);
    drawLine(10, startY + 1, 120, startY + 1);

    writeLabel('Idade:', 125, startY);
    drawLine(125, startY + 1, 145, startY + 1);

    writeLabel('Sexo:', 150, startY);
    drawLine(150, startY + 1, 170, startY + 1);

    writeLabel('Data:', 175, startY);
    const [year, month, day] = data.date.split('-');
    writeValue(`${day}/${month}/${year}`, 185, startY);
    drawLine(175, startY + 1, 200, startY + 1);

    startY += lineSpacing;

    // Linha 2: Data Operação, Enf, Leito
    writeLabel('Data Operação:', 10, startY);
    writeValue(`${day}/${month}/${year}`, 40, startY);
    drawLine(10, startY + 1, 80, startY + 1);

    writeLabel('Enf.:', 85, startY);
    drawLine(85, startY + 1, 140, startY + 1);

    writeLabel('Leito:', 145, startY);
    drawLine(145, startY + 1, 200, startY + 1);

    startY += lineSpacing;

    // Linha 3: Cirurgião, 1º Auxiliar
    writeLabel('Cirurgião:', 10, startY);
    writeValue(data.doctorName, 30, startY);
    drawLine(10, startY + 1, 100, startY + 1);

    writeLabel('1º Auxiliar:', 105, startY);
    drawLine(105, startY + 1, 200, startY + 1);

    startY += lineSpacing;

    // Linha 4: 2º Auxiliar, 3º Auxiliar, Instrumentador
    writeLabel('2º Auxiliar:', 10, startY);
    drawLine(10, startY + 1, 70, startY + 1);

    writeLabel('3º Auxiliar:', 75, startY);
    drawLine(75, startY + 1, 135, startY + 1);

    writeLabel('Instrumentador:', 140, startY);
    drawLine(140, startY + 1, 200, startY + 1);

    startY += lineSpacing;

    // Linha 5: Anestesista, Tipo de Anestesia
    writeLabel('Anestesista:', 10, startY);
    drawLine(10, startY + 1, 90, startY + 1);

    writeLabel('Tipo de Anestesia:', 95, startY);
    drawLine(95, startY + 1, 200, startY + 1);

    startY += lineSpacing;

    // Linha 6: Diagnóstico Pré-operatório
    writeLabel('Diagnóstico Pré-operatório:', 10, startY);
    drawLine(10, startY + 1, 200, startY + 1);
    startY += lineSpacing;
    drawLine(10, startY + 1, 200, startY + 1);

    startY += lineSpacing;

    // Linha 7: Tipo de Operação
    writeLabel('Tipo de Operação:', 10, startY);
    writeValue(data.surgery, 45, startY);
    drawLine(10, startY + 1, 200, startY + 1);
    startY += lineSpacing;
    drawLine(10, startY + 1, 200, startY + 1);

    startY += lineSpacing;

    // Linha 8: Diagnóstico Pos-operatório
    writeLabel('Diagnóstico Pos-operatório:', 10, startY);
    drawLine(10, startY + 1, 200, startY + 1);
    startY += lineSpacing;
    drawLine(10, startY + 1, 200, startY + 1);

    startY += lineSpacing;

    // Linha 9: Relatório Imediato do Patologista
    writeLabel('Relatório Imediato do Patologista:', 10, startY);
    drawLine(10, startY + 1, 200, startY + 1);
    startY += lineSpacing;

    // Linha 10: Exame Radiológico no Ato
    writeLabel('Exame Radiológico no Ato:', 10, startY);
    drawLine(10, startY + 1, 200, startY + 1);
    startY += lineSpacing;

    // Linha 11: Acidente Durante a Operação
    writeLabel('Acidente Durante a Operação:', 10, startY);
    drawLine(10, startY + 1, 200, startY + 1);
    startY += lineSpacing;
    drawLine(10, startY + 1, 200, startY + 1);

    startY += 15;

    // DESCRIÇÃO DA OPERAÇÃO
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 100, 0);
    doc.text('DESCRIÇÃO DA OPERAÇÃO', 105, startY, { align: 'center' });
    startY += 10;

    // Draw the ruled lines and labels
    const labels = [
      'VIA DE ACESSO',
      'TÁTICA E TÉCNICA',
      'LIGADURA',
      'DRENAGEM',
      'SUTURA',
      'MATERIAL EMPREGADO',
      'MATERIAL EMPREGADO' // Included twice to match the screenshot exactly
    ];

    let currentY = startY;
    let lineIndex = 0;

    // Draw all horizontal lines down to the bottom of the page
    while (currentY < 285) {
      drawLine(10, currentY + 2, 200, currentY + 2);
      
      // Draw labels on the left for the first few lines
      if (lineIndex < labels.length) {
        writeLabel(labels[lineIndex], 10, currentY);
      }
      
      currentY += lineSpacing;
      lineIndex++;
    }

    // Now, write the generated text wrapping around the labels
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const paragraphs = generatedText.split(/\r?\n/);
    let textLineIndex = 0;
    let textY = startY;

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        if (textY < 285) {
          textY += lineSpacing;
          textLineIndex++;
        }
        continue;
      }

      const words = paragraph.split(' ');
      let currentLineText = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLineText ? currentLineText + ' ' + word : word;
        
        // If we are on the lines with labels, max width is smaller (start at X=60)
        // If we are below the labels, max width is full (start at X=10)
        const isLabelLine = textLineIndex < labels.length;
        const currentMaxWidth = isLabelLine ? 135 : 185; // 200 - 65 = 135, 200 - 15 = 185
        
        const testWidth = doc.getTextWidth(testLine);
        
        if (testWidth > currentMaxWidth) {
          // Draw currentLineText
          const currentX = isLabelLine ? 60 : 10;
          
          if (textY >= 285) {
            doc.addPage();
            textY = 20; // Reset Y for new page
            
            // Draw lines for the new page
            let newPageY = textY;
            while (newPageY < 285) {
              drawLine(10, newPageY + 2, 200, newPageY + 2);
              newPageY += lineSpacing;
            }
          }
          
          doc.text(currentLineText, currentX, textY);
          
          // Move to next line
          textLineIndex++;
          textY += lineSpacing;
          currentLineText = word;
        } else {
          currentLineText = testLine;
        }
      }
      
      // Draw remaining text of the paragraph
      if (currentLineText) {
        if (textY >= 285) {
          doc.addPage();
          textY = 20;
          let newPageY = textY;
          while (newPageY < 285) {
            drawLine(10, newPageY + 2, 200, newPageY + 2);
            newPageY += lineSpacing;
          }
        }
        const isLabelLine = textLineIndex < labels.length;
        const currentX = isLabelLine ? 60 : 10;
        doc.text(currentLineText, currentX, textY);
        textY += lineSpacing;
        textLineIndex++;
      }
    }

    doc.save(`Relatorio_Cirurgia_${data.patientName.replace(/\s+/g, '_')}.pdf`);

  } catch (e) {
    console.error("Error generating PDF", e);
    alert("Erro ao gerar o PDF do relatório cirúrgico.");
  }
};
