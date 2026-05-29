import { jsPDF } from 'jspdf';
import { cleanWords, cleanDate, cleanSusCard, cleanPhone } from './dataCleaner';
import { Patient } from './types';

export const generateSurgeryNotice = async (patient: Patient, inputDate?: string, inputTime?: string) => {
  try {
    const dataCirurgia = inputDate || patient.data_cirurgia || '';
    const horarioCirurgia = inputTime || patient.horario_cirurgia || '';
    await generateSurgeryNoticePdf(patient, dataCirurgia, horarioCirurgia);
  } catch (error) {
    console.error("Erro ao gerar aviso de cirurgia:", error);
  }
};

export const generateSurgeryNoticePdf = async (patient: Patient, dataCirurgia: string, horarioCirurgia: string) => {
  try {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const today = new Date().toLocaleDateString('pt-BR');
    
    const drawBox = (x: number, y: number, w: number, h: number, title: string, content?: string | null, align: 'left'|'center' = 'left') => {
      doc.setDrawColor(0);
      doc.setLineWidth(0.2);
      doc.rect(x, y, w, h);
      if (title) {
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);
        doc.text(title, x + 1, y + 2.5);
      }
      if (content) {
        let fontSize = 9;
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        let textStr = content.toString().toUpperCase().trim();
        let splitText = doc.splitTextToSize(textStr, w - 2);
        while (splitText.length > 1 && fontSize > 5 && h <= 12) {
          fontSize -= 0.5;
          doc.setFontSize(fontSize);
          splitText = doc.splitTextToSize(textStr, w - 2);
        }
        if (align === 'center') {
          const textW = doc.getTextWidth(splitText[0]);
          doc.text(splitText, x + (w / 2) - (textW / 2), y + 7 - (9 - fontSize) * 0.3, { lineHeightFactor: 1.1 });
        } else {
          doc.text(splitText, x + 1.5, y + 7 - (9 - fontSize) * 0.3, { lineHeightFactor: 1.1 });
        }
      }
    };

    const drawSectionHeader = (y: number, title: string) => {
      doc.setFillColor('#E6E6E6');
      doc.rect(10, y, 190, 4, 'FD');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(title.toUpperCase(), 12, y + 3);
    };

    // Header
    try {
      doc.addImage('/logohg.png', 'PNG', 10, 10, 25, 25);
    } catch (e) {
      console.error("Could not load logo for surgery notice", e);
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('HOSPITAL GERAL E MATERNIDADE DE CUIABÁ', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text('PEDIDO DE MARCAÇÃO DE CIRURGIA', 105, 24, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('(CIRMARC)', 105, 29, { align: 'center' });
    
    // DADOS DA SOLICITAÇÃO
    drawSectionHeader(40, "DADOS DA SOLICITAÇÃO");
    drawBox(10, 44, 150, 9, "NOME DO CLIENTE", patient.name);
    drawBox(160, 44, 40, 9, "ATENDIMENTO", "");
    drawBox(10, 53, 30, 9, "IDADE", patient.age ? patient.age.toString() : "", "center");
    drawBox(40, 53, 30, 9, "SEXO", "", "center");
    drawBox(70, 53, 50, 9, "CARTÃO SUS", patient.sus_card, "center");
    drawBox(120, 53, 80, 9, "CONVÊNIO", "SUS");

    // DATA AGENDA DESEJADA
    drawSectionHeader(65, "DATA AGENDA DESEJADA");
    drawBox(10, 69, 50, 9, "DATA DA CIRURGIA", dataCirurgia, "center");
    drawBox(60, 69, 50, 9, "HORÁRIO", horarioCirurgia, "center");
    drawBox(110, 69, 90, 9, "DATA DA SOLICITAÇÃO", today, "center");

    // PROCEDIMENTOS
    drawSectionHeader(81, "PROCEDIMENTOS");
    doc.rect(10, 85, 190, 40);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`1. ${patient.surgery_type.toUpperCase()}`, 12, 90);
    doc.setFont('helvetica', 'normal');
    doc.text("2.", 12, 97);
    doc.text("3.", 12, 104);
    doc.text("4.", 12, 111);
    doc.text("5.", 12, 118);
    
    drawBox(10, 125, 60, 9, "TEMPO ESTIMADO PARA A CIRURGIA", "");
    drawBox(70, 125, 60, 9, "SANGUE / HEMODERIVADOS - QTDE", "");
    drawBox(130, 125, 70, 9, "GRUPO/FATOR SANGUÍNEO", "");

    // EQUIPE CIRÚRGICA
    drawSectionHeader(137, "EQUIPE CIRÚRGICA");
    drawBox(10, 141, 100, 9, "MÉDICO CIRURGIÃO", patient.doctor);
    drawBox(110, 141, 90, 9, "MÉDICO AUXILIAR", "");
    drawBox(10, 150, 190, 9, "MÉDICO ANESTESISTA", "");

    // MATERIAIS OPME
    drawSectionHeader(162, "MATERIAIS OPME");
    doc.rect(10, 166, 190, 30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text("1.", 12, 171);
    doc.text("2.", 12, 178);
    doc.text("3.", 12, 185);
    doc.text("4.", 12, 192);
    doc.text("5.", 100, 171);
    doc.text("6.", 100, 178);
    doc.text("7.", 100, 185);
    doc.text("8.", 100, 192);

    // OUTROS MATERIAIS
    drawSectionHeader(199, "OUTROS MATERIAIS E QUANTIDADE");
    doc.rect(10, 203, 190, 25);
    doc.text("1.", 12, 208);
    doc.text("2.", 12, 215);
    doc.text("3.", 100, 208);
    doc.text("4.", 100, 215);

    // OBSERVAÇÕES
    drawBox(10, 231, 190, 15, "OBSERVAÇÕES", "");

    // ASSINATURA E CARIMBO
    doc.line(60, 260, 150, 260);
    doc.setFontSize(8);
    doc.text("MÉDICO SOLICITANTE E CARIMBO (CRM)", 105, 264, { align: 'center' });

    // DADOS RECEBIMENTO
    doc.setLineDashPattern([1, 1], 0);
    doc.line(10, 271, 200, 271);
    doc.setLineDashPattern([], 0);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text("DADOS RECEBIMENTO", 12, 275);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text("Data Recebimento do Aviso: _____/_____/_______   Horário: _____:_____   Responsável Recebimento: ___________________________", 12, 280);
    doc.text("Cirurgia Marcada para o dia: _____/_____/_______   às   _____:_____ Horas.", 12, 286);

    doc.save(`Aviso_Cirurgia_${patient.name.replace(/\s+/g, '_')}.pdf`);
    alert(`Aviso de Cirurgia (CIRMARC) gerado para ${patient.name} com sucesso.`);
  } catch (error) {
    console.error("Erro ao gerar aviso de cirurgia:", error);
    alert("Erro ao gerar aviso de cirurgia. Verifique a conexão e tente novamente.");
  }
};
