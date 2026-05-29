import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';

export const formatWhatsAppNumber = (phone: string) => {
  if (!phone) return '';
  
  const hasPlus = phone.trim().startsWith('+');
  let digits = phone.replace(/\D/g, '');
  
  if (hasPlus) {
    return digits; // Usuário forneceu o código do país explicitamente
  }
  
  // Remove zero à esquerda se o usuário digitou algo como 011999999999
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // Se tiver 10 ou 11 dígitos, assume que é do Brasil e adiciona o 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
};

export const sharePDFViaWhatsApp = async (elementId: string, filename: string, phone: string, text: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found!`);
    return;
  }

  try {
    // html-to-image supports modern CSS like oklab() natively via SVG foreignObject
    const imgData = await htmlToImage.toPng(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      }
    });
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Baixa o PDF automaticamente
    pdf.save(`${filename}.pdf`);
    
    // Abre o WhatsApp diretamente com o número específico e texto pré-preenchido
    const formattedPhone = formatWhatsAppNumber(phone);
    const encodedText = encodeURIComponent(text);
    
    // Alerta o usuário sobre a limitação da API oficial do WhatsApp
    alert('O PDF foi baixado. O WhatsApp será aberto com o texto preenchido, mas você precisará anexar o PDF manualmente na conversa.');
    
    window.open(`https://api.whatsapp.com/send/?phone=${formattedPhone}&text=${encodedText}`, '_blank');
    
  } catch (error) {
    console.error('Error in sharePDFViaWhatsApp:', error);
    throw error;
  }
};
