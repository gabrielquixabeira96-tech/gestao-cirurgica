import { Patient } from '../types';
import { cleanWords, cleanSusCard, cleanDate, cleanPhone } from '../dataCleaner';
import { findBestCID } from '../cid10';
import { getDischargeText } from '../discharge';

export interface APACData {
  patientName: string;
  susCard: string;
  birthDate: string;
  phone: string;
  procedureCode: string;
  procedureName: string;
  diagnosis: string;
  cid: string;
  justification: string;
}

export const generateAPAC = async (data: APACData) => {
  const { jsPDF } = await import('jspdf');
  const today = new Date().toLocaleDateString('pt-BR');
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });

  const drawBox = (x: number, y: number, w: number, h: number, title: string, content?: string | null, align: 'left'|'center' = 'left') => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(x, y, w, h);
    if (title) {
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      doc.text(title, x + 1, y + 2.5);
    }
    if (content) {
      let fontSize = 8;
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      let textStr = content.toString().toUpperCase().trim();
      let splitText = doc.splitTextToSize(textStr, w - 2);
      while (splitText.length > 1 && fontSize > 4.5 && h <= 12) {
        fontSize -= 0.5;
        doc.setFontSize(fontSize);
        splitText = doc.splitTextToSize(textStr, w - 2);
      }
      if (align === 'center') {
        const textW = doc.getTextWidth(splitText[0]);
        doc.text(splitText, x + (w / 2) - (textW / 2), y + 7 - (8 - fontSize) * 0.3, { lineHeightFactor: 1.1 });
      } else {
        doc.text(splitText, x + 1.5, y + 6.5 - (8 - fontSize) * 0.3, { lineHeightFactor: 1.1 });
      }
    }
  };

  const drawGridBox = (x: number, y: number, w: number, h: number, numBlocks: number, title: string, content?: string | null) => {
    drawBox(x, y, w, h, title, '');
    const blockW = w / numBlocks;
    const cleanContent = (content || '').toString().padEnd(numBlocks, ' ');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    for (let i = 0; i < numBlocks; i++) {
      if (i > 0) {
        doc.setLineWidth(0.1);
        doc.line(x + (i * blockW), y + 3.5, x + (i * blockW), y + h);
      }
      const char = cleanContent[i];
      if (char && char !== ' ') {
        const charW = doc.getTextWidth(char);
        doc.text(char, x + (i * blockW) + (blockW/2) - (charW/2), y + 7.5);
      }
    }
  };

  const drawDocumentHeader = (titleLines: string[], numberLabel: string) => {
    doc.setLineWidth(0.2);
    doc.rect(10, 10, 190, 20); 

    // Column separators
    doc.line(40, 10, 40, 30); 
    doc.line(75, 10, 75, 30);
    doc.line(165, 10, 165, 30);

    // 1: SUS Logo Simulation
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text("SUS", 25, 24, { align: 'center' }); 
    doc.setLineWidth(0.5);
    doc.line(14, 25.5, 36, 25.5); // A stylistic thick baseline mimicking the official logo weight

    // 2: MINISTÉRIO DA SAÚDE
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text("MINISTÉRIO DA SAÚDE", 57.5, 18, { align: 'center' });
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text("SISTEMA ÚNICO", 57.5, 23, { align: 'center' });
    doc.text("DE SAÚDE - SUS", 57.5, 26, { align: 'center' });

    // 3: TITLE
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    let startY = titleLines.length === 2 ? 19 : (titleLines.length === 3 ? 17 : 21);
    titleLines.forEach(line => {
      doc.text(line, 120, startY, { align: 'center' });
      startY += 4.5;
    });

    // 4: NUMBER BOX
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(numberLabel, 182.5, 14, { align: 'center' });
  };

  // --- HEADER
  drawDocumentHeader(
    ["AUTORIZAÇÃO DE", "PROCEDIMENTOS AMBULATORIAIS", "APAC"],
    "NÚMERO DA APAC"
  );

  const drawFieldWithOptions = (x: number, y: number, w: number, h: number, title: string, options: string[]) => {
    drawBox(x, y, w, h, title, '');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    const startX = x + 2;
    const startY = y + 7.5;
    
    let currentX = startX;
    options.forEach(opt => {
      doc.rect(currentX, startY - 2.5, 3, 3);
      doc.text(opt, currentX + 4, startY);
      currentX += doc.getTextWidth(opt) + 7;
    });
  };

  // --- CABEÇALHO / ESTABELECIMENTO
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 32, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("1 - IDENTIFICAÇÃO DO ESTABELECIMENTO DE SAÚDE", 12, 35);

  drawBox(10, 36, 150, 9, "01 - NOME DO ESTABELECIMENTO SOLICITANTE", "HOSPITAL GERAL E MATERNIDADE DE CUIABÁ");
  drawGridBox(160, 36, 40, 9, 7, "02 - CNES", "2659107");

  // --- PACIENTE
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 47, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("2 - IDENTIFICAÇÃO DO PACIENTE", 12, 50);

  drawBox(10, 51, 150, 9, "03 - NOME DO PACIENTE", data.patientName);
  drawBox(160, 51, 40, 9, "04 - NÚMERO DO PRONTUÁRIO", "", "center");

  drawGridBox(10, 60, 90, 9, 15, "05 - CARTÃO NACIONAL DE SAÚDE (CNS)", data.susCard);
  drawBox(100, 60, 30, 9, "06 - DATA DE NASCIMENTO", data.birthDate, "center");
  drawFieldWithOptions(130, 60, 30, 9, "07 - SEXO", ["M", "F"]); 
  drawFieldWithOptions(160, 60, 40, 9, "08 - RAÇA/COR", ["1", "2", "3", "4", "5"]);
  
  drawBox(10, 69, 140, 9, "09 - NOME DA MÃE", "");
  drawBox(150, 69, 50, 9, "10 - TELEFONE DE CONTATO (MÃE / RESP)", data.phone, "center");

  drawBox(10, 78, 100, 9, "11 - NOME DO RESPONSÁVEL", "");
  drawBox(110, 78, 90, 9, "12 - TELEFONE DE CONTATO", "");

  drawBox(10, 87, 190, 9, "13 - ENDEREÇO (RUA, Nº, BAIRRO)", "");
  
  drawBox(10, 96, 75, 9, "14 - MUNICÍPIO DE RESIDÊNCIA", "");
  drawGridBox(85, 96, 35, 9, 6, "15 - CÓDIGO IBGE MUNICÍPIO", "");
  drawBox(120, 96, 20, 9, "16 - UF", "");
  drawGridBox(140, 96, 60, 9, 8, "17 - CEP", "");

  // --- PROCEDIMENTO SOLICITADO
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 107, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("3 - PROCEDIMENTO SOLICITADO", 12, 110);

  const cleanProcedimentoAPAC = (data.procedureCode || '').replace(/\D/g, '').padEnd(10, ' ').substring(0, 10);
  drawGridBox(10, 111, 40, 9, 10, "18 - CÓDIGO DO PROCEDIMENTO PRINCIPAL", cleanProcedimentoAPAC);
  drawBox(50, 111, 150, 9, "19 - NOME DO PROCEDIMENTO PRINCIPAL", data.procedureName);

  drawBox(10, 120, 140, 9, "20 - INDICAÇÃO CLÍNICA", "");
  drawBox(150, 120, 50, 9, "21 - CARÁTER DO ATENDIMENTO", "01 - ELETIVA");

  // --- JUSTIFICATIVA
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 131, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("4 - JUSTIFICATIVA DO PROCEDIMENTO", 12, 134);

  drawBox(10, 135, 190, 25, "22 - OBSERVAÇÕES / JUSTIFICATIVA", data.justification);
  
  drawBox(10, 160, 130, 9, "23 - DIAGNÓSTICO PRINCIPAL", data.diagnosis);
  const cidP = (data.cid || '').replace(/[^a-zA-Z0-9]/g, '').padEnd(4, ' ').substring(0, 4).toUpperCase();
  drawGridBox(140, 160, 30, 9, 4, "24 - CID 10 PRINCIPAL", cidP);
  drawGridBox(170, 160, 30, 9, 4, "25 - CID 10 SECUNDÁRIO", "");

  // --- SOLICITAÇÃO
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 171, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("5 - SOLICITAÇÃO", 12, 174);
  
  drawGridBox(10, 175, 65, 9, 15, "26 - CARTÃO NACIONAL DE SAÚDE (CNS) DO SOLICITANTE", "");
  drawBox(75, 175, 125, 9, "27 - NOME DO PROFISSIONAL SOLICITANTE", "");

  doc.rect(10, 184, 40, 16);
  doc.text("28 - DATA DA SOLICITAÇÃO", 12, 187);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(today, 30, 195, { align: 'center' });

  doc.rect(50, 184, 150, 16);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text("29 - ASSINATURA E CARIMBO", 52, 187);

  // --- AUTORIZAÇÃO / EXECUTANTE
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 202, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("6 - AUTORIZAÇÃO (USO EXCLUSIVO DA INSERÇÃO NO SISTEMA)", 12, 205);
  
  drawBox(10, 206, 140, 9, "30 - NOME DO PROFISSIONAL AUTORIZADOR", "");
  drawBox(150, 206, 50, 9, "31 - CÓDIGO DO ÓRGÃO EMISSOR", "");
  
  drawBox(10, 215, 90, 16, "32 - Nº DO DOCUMENTO DO AUTORIZADOR (CPF)", "");
  doc.rect(100, 215, 40, 16);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text("33 - DATA DA AUTORIZAÇÃO", 102, 218);
  
  doc.rect(140, 215, 60, 16);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text("34 - ASSINATURA E CARIMBO", 142, 218);

  const safeName = (data.patientName || 'Paciente').trim().replace(/\s+/g, '_');
  doc.save(`APAC_${safeName}.pdf`);
};

export const generateDischargeDocuments = async (patient: Patient) => {
  const { jsPDF } = await import('jspdf');
  const today = new Date().toLocaleDateString('pt-BR');
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  
  const drawLogo = (x: number, y: number) => {
    try {
      doc.addImage('/logohg.png', 'PNG', x - 12, y - 12, 24, 24);
    } catch (e) {
      doc.setDrawColor(0, 100, 0); // dark green
      doc.setLineWidth(0.5);
      doc.circle(x, y, 12, 'S');
      
      doc.setFillColor(200, 0, 0); // red cross
      doc.rect(x - 2, y - 6, 4, 12, 'F');
      doc.rect(x - 6, y - 2, 12, 4, 'F');
      
      doc.setFontSize(5);
      doc.setTextColor(0, 100, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Hospital Geral e Maternidade de Cuiabá', x, y - 8, { align: 'center' });
      doc.text('1982', x, y + 10, { align: 'center' });
    }
  };

  // PAGE 1: RECEITUÁRIO DE CONTROLE ESPECIAL (SINTOMÁTICOS)
  doc.setLineWidth(0.4);
  doc.rect(10, 10, 190, 277); // Outer border
  
  // Header Logo (Hospital Geral)
  drawLogo(25, 25);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEITUÁRIO DE CONTROLE ESPECIAL', 105, 40, { align: 'center' });
  
  // IDENTIFICAÇÃO DO EMITENTE
  doc.setLineWidth(0.2);
  doc.rect(15, 45, 180, 25);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('IDENTIFICAÇÃO DO EMITENTE', 17, 49);
  doc.setFont('helvetica', 'normal');
  doc.text('Nome:', 17, 54);
  doc.text('CRM- MT:', 17, 58);
  doc.text('Endereço:', 17, 62);
  doc.text('Bairro:', 17, 66);
  doc.text('Cidade: Cuiabá – MT', 17, 70);
  
  doc.text('1ª VIA - FARMACIA', 140, 50);
  doc.text('2ª VIA - PACIENTE', 140, 55);
  
  // Paciente
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Paciente: ${cleanWords(patient.name)}`, 15, 80);
  
  doc.text('USO ORAL:', 10, 88);
  
  doc.setFont('helvetica', 'normal');
  doc.text('1) DIPIRONA 1G ou PARACETAMOL 750 MG -----------------------------------------------------------------------01CX', 15, 96);
  doc.text('TOMAR 01 CP DE 12/12 HRS POR 05 DIAS', 15, 102);
  
  doc.text('2) DICLOFENACO SÓDICO 50MG --------15CP', 15, 112);
  doc.text('TOMAR 01CP DE 8/8 HRS POR 05 DIAS', 15, 118);
  
  doc.text('3) DRAMIN B6/VONAU 4MG---------------------------01CX', 15, 128);
  doc.text('TOMAR 01 CP DE 6/6 HORAS SE NÁUSEA.', 15, 134);
  
  doc.text('4) PACO 0U TRAMADOL 50MG -------------01CX', 15, 144);
  doc.text('TOMAR 01 CP DE 12/12 HRS SE DOR INTENSA', 15, 150);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`CUIABÁ, ${today}`, 10, 165);
  
  doc.setLineWidth(0.5);
  doc.line(10, 170, 200, 170);
  
  // Identificação do Comprador
  doc.setLineWidth(0.2);
  doc.rect(15, 180, 85, 60);
  doc.rect(15, 180, 85, 8); // header box
  doc.setFontSize(9);
  doc.text('IDENTIFICAÇÃO DO COMPRADOR', 57.5, 185.5, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.text('Nome:________________________________', 18, 195);
  doc.text('Identidade:________________Órgão:______', 18, 205);
  doc.text('Endereço:_________________________________', 18, 215);
  doc.text('_________________________________', 18, 220);
  doc.text('Bairro:________________________________', 18, 230);
  doc.text('Cidade:__________________UF:__________', 18, 240);
  
  // Identificação do Fornecedor
  doc.rect(110, 180, 85, 60);
  doc.rect(110, 180, 85, 8); // header box
  doc.setFont('helvetica', 'bold');
  doc.text('IDENTIFICAÇÃO DO FORNECEDOR', 152.5, 185.5, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('_________________________________', 152.5, 225, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('ASS. DO FARMACEUTICO', 152.5, 230, { align: 'center' });
  doc.text('DATA:___/___/____', 152.5, 235, { align: 'center' });
  
  // PAGE 2: RETORNO AMBULATORIAL // AO ITC
  doc.addPage();
  doc.setLineWidth(0.4);
  doc.rect(10, 10, 190, 277); // Outer border
  
  // Header Logo (Hospital Geral)
  drawLogo(25, 25);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('RETORNO AMBULATORIAL // AO ITC', 105, 45, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`PACIENTE : ${cleanWords(patient.name)}`, 15, 65);
  
  const getReturnDate = (doctorName: string) => {
    const now = new Date();
    let targetDay = 1; // Monday
    if (doctorName && doctorName.toUpperCase().includes('RAFAEL')) {
      targetDay = 2; // Tuesday
    }
    let date = new Date(now);
    date.setDate(date.getDate() + ((targetDay + 7 - date.getDay()) % 7 || 7));
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString('pt-BR');
  };
  
  const returnDate = getReturnDate(patient.doctor || '');
  
  let doctorDisplay = 'MÉDICO';
  if (patient.doctor) {
    const upperDocName = patient.doctor.toUpperCase();
    const isFemale = upperDocName.includes('DRA') || upperDocName.includes('BIANCA') || upperDocName.includes('POLLYANA') || upperDocName.includes('MARIA');
    const cleanName = upperDocName.replace(/^DRA?\.?\s+/i, '').trim();
    doctorDisplay = isFemale ? `DA DRA ${cleanName}` : `DO DR ${cleanName}`;
  }
  
  doc.text(`PACIENTE EM PÓS OPERATÓRIO DE ${patient.surgery_type} AGENDAR`, 15, 80);
  doc.text(`PRÉREVIAMENTE RETORNO NO ITC PARA O DIA ${returnDate} NO AMBULATÓRIO`, 15, 90);
  doc.text(`${doctorDisplay}`, 15, 100);
  
  doc.text(`CUIABÁ, DATA: ${today}`, 30, 150);
  
  // PAGE 3: Orientações de Alta
  doc.addPage();
  doc.setLineWidth(0.4);
  doc.rect(10, 10, 190, 277); // Outer border
  
  // Header Logo (Hospital Geral)
  drawLogo(25, 25);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Orientações de Alta:', 105, 40, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`Paciente: ${cleanWords(patient.name)}`, 15, 55);
  
  const bullet = '• ';
  let y = 70;
  
  const writeBullet = (title: string, text: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const titleStr = title ? bullet + title + ': ' : bullet;
    doc.text(titleStr, 20, y);
    
    doc.setFont('helvetica', 'normal');
    const titleWidth = doc.getTextWidth(titleStr);
    const splitText = doc.splitTextToSize(text, 170 - titleWidth);
    doc.text(splitText, 20 + titleWidth, y);
    y += splitText.length * 5 + 2;
  };
  
  const dischargeSections = getDischargeText(patient.doctor || '');
  
  for (const section of dischargeSections) {
    if (y > 260) {
      doc.addPage();
      doc.setLineWidth(0.4);
      doc.rect(10, 10, 190, 277);
      drawLogo(25, 25);
      y = 40;
    }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(section.section, 15, y);
    y += 8;
    for (const item of section.items) {
      if (y > 265) {
        doc.addPage();
        doc.setLineWidth(0.4);
        doc.rect(10, 10, 190, 277);
        drawLogo(25, 25);
        y = 40;
      }
      writeBullet(item.title, item.text);
    }
    y += 4;
  }
  
  y += 10;
  if (y > 265) {
    doc.addPage();
    doc.setLineWidth(0.4);
    doc.rect(10, 10, 190, 277);
    drawLogo(25, 25);
    y = 40;
  }
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`DATA: ${today}`, 15, y);
  
  doc.save(`Alta_${patient.name.replace(/\s+/g, '_')}.pdf`);
};

export const generateRiskRequest = async (patient: Patient, otherExams: string = '') => {
  const { jsPDF } = await import('jspdf');
  const today = new Date().toLocaleDateString('pt-BR');
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);

  const drawSectionHeader = (y: number, title: string) => {
    doc.setLineWidth(0.4);
    doc.line(5, y, 205, y);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    const width = doc.getTextWidth(title);
    doc.setFillColor(255, 255, 255);
    doc.rect(105 - (width/2) - 2, y - 2, width + 4, 4, 'F');
    doc.text(title, 105, y + 1, { align: 'center' });
    doc.setLineWidth(0.2);
  };

  const drawBox = (x: number, y: number, w: number, h: number, label: string, value: string = '', options: { isMultiLine?: boolean, valueFontSize?: number, charSpace?: number } = {}) => {
    doc.rect(x, y, w, h);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.setCharSpace(0);
    doc.text(label, x + 1, y + 2.5);
    if (value) {
      doc.setFontSize(options.valueFontSize || 9);
      doc.setFont('helvetica', 'bold');
      if (options.charSpace) doc.setCharSpace(options.charSpace);
      if (options.isMultiLine) {
        const splitText = doc.splitTextToSize(value, w - 2);
        doc.text(splitText, x + 1, y + 6);
      } else {
        doc.text(value, x + 1, y + 6);
      }
    }
  };

  // Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SOLICITAÇÃO DE AVALIAÇÃO DE RISCO CIRÚRGICO', 105, 15, { align: 'center' });
  
  let currentY = 25;
  drawSectionHeader(currentY, 'DADOS DO PACIENTE');
  currentY += 5;
  drawBox(5, currentY, 150, 10, 'NOME DO PACIENTE', cleanWords(patient.name));
  drawBox(155, currentY, 50, 10, 'DATA DE NASCIMENTO', cleanDate(patient.birth_date));
  currentY += 10;
  drawBox(5, currentY, 100, 10, 'CARTÃO SUS', cleanSusCard(patient.sus_card));
  drawBox(105, currentY, 100, 10, 'TELEFONE', cleanPhone(patient.phone));
  currentY += 15;

  drawSectionHeader(currentY, 'DADOS CLÍNICOS E CIRÚRGICOS');
  currentY += 5;
  drawBox(5, currentY, 200, 15, 'DIAGNÓSTICO PRINCIPAL', cleanWords(patient.diagnosis), { isMultiLine: true });
  currentY += 15;
  drawBox(5, currentY, 200, 15, 'CIRURGIA PROPOSTA', cleanWords(patient.surgery_type), { isMultiLine: true });
  currentY += 20;

  drawSectionHeader(currentY, 'EXAMES COMPLEMENTARES SOLICITADOS');
  currentY += 5;
  const exams = [
    'Hemograma Completo',
    'Coagulograma (TAP/PTT)',
    'Glicemia de Jejum',
    'Ureia e Creatinina',
    'Eletrocardiograma (ECG)',
    'Raio-X de Tórax (se > 40 anos ou indicação clínica)'
  ];
  
  if (otherExams) {
    exams.push(...otherExams.split('\n').filter(e => e.trim()));
  }

  exams.forEach((exam, index) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`[ ] ${exam}`, 15, currentY + (index * 6));
  });
  
  currentY += (exams.length * 6) + 10;

  drawSectionHeader(currentY, 'SOLICITAÇÃO');
  currentY += 10;
  doc.setFontSize(10);
  doc.text(`Cuiabá, ${today}`, 15, currentY);
  currentY += 20;
  doc.line(105 - 40, currentY, 105 + 40, currentY);
  doc.setFontSize(8);
  doc.text('Assinatura e Carimbo do Médico Solicitante', 105, currentY + 5, { align: 'center' });

  doc.save(`Risco_${patient.name.replace(/\s+/g, '_')}.pdf`);
};

export interface AIHData {
  patientName: string;
  susCard: string;
  birthDate: string;
  phone: string;
  procedureCode: string;
  surgeryType: string;
  sinaisSintomas: string;
  condicoes: string;
  resultados: string;
  diagnosis: string;
  cid: string;
}

export const generateAIHPDF = async (data: AIHData) => {
  const { jsPDF } = await import('jspdf');
  const today = new Date().toLocaleDateString('pt-BR');
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });

  const drawBox = (x: number, y: number, w: number, h: number, title: string, content?: string | null, align: 'left'|'center' = 'left') => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(x, y, w, h);
    if (title) {
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      doc.text(title, x + 1, y + 2.5);
    }
    if (content) {
      let fontSize = 8;
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      let textStr = content.toString().toUpperCase().trim();
      let splitText = doc.splitTextToSize(textStr, w - 2);
      while (splitText.length > 1 && fontSize > 4.5 && h <= 12) {
        fontSize -= 0.5;
        doc.setFontSize(fontSize);
        splitText = doc.splitTextToSize(textStr, w - 2);
      }
      if (align === 'center') {
        const textW = doc.getTextWidth(splitText[0]);
        doc.text(splitText, x + (w / 2) - (textW / 2), y + 7 - (8 - fontSize) * 0.3, { lineHeightFactor: 1.1 });
      } else {
        doc.text(splitText, x + 1.5, y + 6.5 - (8 - fontSize) * 0.3, { lineHeightFactor: 1.1 });
      }
    }
  };

  const drawGridBox = (x: number, y: number, w: number, h: number, numBlocks: number, title: string, content?: string | null) => {
    drawBox(x, y, w, h, title, '');
    const blockW = w / numBlocks;
    const cleanContent = (content || '').toString().padEnd(numBlocks, ' ');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    for (let i = 0; i < numBlocks; i++) {
      if (i > 0) {
        doc.setLineWidth(0.1);
        doc.line(x + (i * blockW), y + 3.5, x + (i * blockW), y + h);
      }
      const char = cleanContent[i];
      if (char && char !== ' ') {
        const charW = doc.getTextWidth(char);
        doc.text(char, x + (i * blockW) + (blockW/2) - (charW/2), y + 7.5);
      }
    }
  };

  const drawFieldWithOptions = (x: number, y: number, w: number, h: number, title: string, options: string[]) => {
    drawBox(x, y, w, h, title, '');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    const startX = x + 2;
    const startY = y + 7.5;
    
    let currentX = startX;
    options.forEach(opt => {
      doc.rect(currentX, startY - 2.5, 3, 3);
      doc.text(opt, currentX + 4, startY);
      currentX += doc.getTextWidth(opt) + 7;
    });
  };

  const drawDocumentHeader = (titleLines: string[], numberLabel: string) => {
    doc.setLineWidth(0.2);
    doc.rect(10, 10, 190, 20); 

    // Column separators
    doc.line(40, 10, 40, 30); 
    doc.line(75, 10, 75, 30);
    doc.line(165, 10, 165, 30);

    // 1: SUS Logo Simulation
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text("SUS", 25, 24, { align: 'center' }); 
    doc.setLineWidth(0.5);
    doc.line(14, 25.5, 36, 25.5); // A stylistic thick baseline mimicking the official logo weight

    // 2: MINISTÉRIO DA SAÚDE
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text("MINISTÉRIO DA SAÚDE", 57.5, 18, { align: 'center' });
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text("SISTEMA ÚNICO", 57.5, 23, { align: 'center' });
    doc.text("DE SAÚDE - SUS", 57.5, 26, { align: 'center' });

    // 3: TITLE
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    let startY = titleLines.length === 2 ? 19 : (titleLines.length === 3 ? 17 : 21);
    titleLines.forEach(line => {
      doc.text(line, 120, startY, { align: 'center' });
      startY += 4.5;
    });

    // 4: NUMBER BOX
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(numberLabel, 182.5, 14, { align: 'center' });
  };

  // --- HEADER (Y=10 to Y=30)
  drawDocumentHeader(
    ["LAUDO PARA SOLICITAÇÃO", "DE AUTORIZAÇÃO DE", "INTERNAÇÃO HOSPITALAR"],
    "NÚMERO DA AIH"
  );

  // --- BLOCO 1: IDENTIFICAÇÃO DO ESTABELECIMENTO DE SAÚDE
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 32, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("1 - IDENTIFICAÇÃO DO ESTABELECIMENTO DE SAÚDE", 12, 35);

  drawBox(10, 36, 150, 9, "01 - NOME DO ESTABELECIMENTO SOLICITANTE", "HOSPITAL GERAL E MATERNIDADE DE CUIABÁ");
  drawGridBox(160, 36, 40, 9, 7, "02 - CNES", "2659107");

  drawBox(10, 45, 150, 9, "03 - NOME DO ESTABELECIMENTO EXECUTANTE", "HOSPITAL GERAL E MATERNIDADE DE CUIABÁ");
  drawGridBox(160, 45, 40, 9, 7, "04 - CNES", "2659107");

  // --- BLOCO 2: IDENTIFICAÇÃO DO PACIENTE
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 56, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("2 - IDENTIFICAÇÃO DO PACIENTE", 12, 59);

  drawBox(10, 60, 150, 9, "05 - NOME DO PACIENTE", data.patientName);
  drawBox(160, 60, 40, 9, "06 - Nº DO PRONTUÁRIO", "", "center");

  drawGridBox(10, 69, 90, 9, 15, "07 - CARTÃO NACIONAL DE SAÚDE (CNS)", data.susCard);
  drawBox(100, 69, 30, 9, "08 - DATA DE NASCIMENTO", data.birthDate, "center");
  drawFieldWithOptions(130, 69, 30, 9, "09 - SEXO", ["M", "F"]); 
  drawFieldWithOptions(160, 69, 40, 9, "10 - RAÇA/COR", ["1", "2", "3", "4", "5"]);
  
  drawBox(10, 78, 140, 9, "11 - NOME DA MÃE", "");
  drawBox(150, 78, 50, 9, "12 - TELEFONE DE CONTATO (MÃE / RESP)", data.phone, "center");

  drawBox(10, 87, 100, 9, "13 - NOME DO RESPONSÁVEL", "");
  drawBox(110, 87, 90, 9, "14 - TELEFONE DE CONTATO", "");

  drawBox(10, 96, 190, 9, "15 - ENDEREÇO (RUA, Nº, BAIRRO)", "");
  
  drawBox(10, 105, 75, 9, "16 - MUNICÍPIO DE RESIDÊNCIA", "");
  drawGridBox(85, 105, 35, 9, 6, "17 - CÓDIGO IBGE MUNICÍPIO", "");
  drawBox(120, 105, 20, 9, "18 - UF", "");
  drawGridBox(140, 105, 60, 9, 8, "19 - CEP", "");

  // --- BLOCO 3: JUSTIFICATIVA DA INTERNAÇÃO
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 116, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("3 - JUSTIFICATIVA DA INTERNAÇÃO", 12, 119);

  drawBox(10, 120, 190, 20, "20 - PRINCIPAIS SINAIS E SINTOMAS CLÍNICOS", data.sinaisSintomas);
  drawBox(10, 140, 190, 20, "21 - CONDIÇÕES QUE JUSTIFICAM A INTERNAÇÃO", data.condicoes);
  drawBox(10, 160, 190, 20, "22 - PRINCIPAIS RESULTADOS DE PROVAS DIAGNÓSTICAS", data.resultados);
  
  drawBox(10, 180, 130, 9, "23 - DIAGNÓSTICO INICIAL", data.diagnosis);
  const cidP = (data.cid || '').replace(/[^a-zA-Z0-9]/g, '').padEnd(4, ' ').substring(0, 4).toUpperCase();
  drawGridBox(140, 180, 25, 9, 4, "24 - CID 10 PRINCIPAL", cidP);
  drawGridBox(165, 180, 35, 9, 4, "25 - CID 10 SECUNDÁRIO", "");

  // --- BLOCO 4: PROCEDIMENTO SOLICITADO
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 191, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("4 - PROCEDIMENTO SOLICITADO", 12, 194);

  const cleanProcedimentoAIH = (data.procedureCode || '').replace(/\D/g, '').padEnd(10, ' ').substring(0, 10);
  drawGridBox(10, 195, 40, 9, 10, "26 - CÓDIGO DO PROCEDIMENTO", cleanProcedimentoAIH);
  drawBox(50, 195, 150, 9, "27 - PROCEDIMENTO SOLICITADO", data.surgeryType);

  drawBox(10, 204, 90, 9, "28 - CLÍNICA", "01 - CIRÚRGICA");
  drawBox(100, 204, 100, 9, "29 - CARÁTER DA INTERNAÇÃO", "01 - ELETIVA");

  // --- BLOCO 5: SOLICITAÇÃO DA INTERNAÇÃO
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 215, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("5 - IDENTIFICAÇÃO DO PROFISSIONAL SOLICITANTE", 12, 218);
  
  drawGridBox(10, 219, 65, 9, 15, "30 - CARTÃO NACIONAL DE SAÚDE (CNS) DO MÉDICO SOLICITANTE", "");
  drawBox(75, 219, 125, 9, "31 - NOME DO PROFISSIONAL SOLICITANTE", "");

  doc.rect(10, 228, 40, 16);
  doc.text("32 - DATA DA SOLICITAÇÃO", 12, 231);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(today, 30, 239, { align: 'center' });

  doc.rect(50, 228, 150, 16);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text("33 - ASSINATURA E CARIMBO", 52, 231);

  // --- BLOCO 6: AUTORIZAÇÃO
  doc.setFillColor('#E6E6E6');
  doc.rect(10, 246, 190, 4, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("6 - AUTORIZAÇÃO (USO EXCLUSIVO DO ÓRGÃO EMISSOR)", 12, 249);
  
  drawBox(10, 250, 140, 9, "34 - NOME DO PROFISSIONAL AUTORIZADOR", "");
  drawBox(150, 250, 50, 9, "35 - CÓDIGO DO ÓRGÃO EMISSOR", "");
  
  drawBox(10, 259, 90, 16, "36 - Nº DO DOCUMENTO DO AUTORIZADOR (CPF)", "");
  doc.rect(100, 259, 40, 16);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text("37 - DATA DA AUTORIZAÇÃO", 102, 262);
  
  doc.rect(140, 259, 60, 16);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text("38 - ASSINATURA E CARIMBO (AUTORIZADOR)", 142, 262);

  const safeName = (data.patientName || 'Paciente').trim().replace(/\s+/g, '_');
  doc.save(`AIH_${safeName}.pdf`);
};
