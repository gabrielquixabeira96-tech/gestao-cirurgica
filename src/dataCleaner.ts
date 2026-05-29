export const cleanSusCard = (value: string | undefined, row?: string[]): string => {
  const clean = value?.replace(/\D/g, '') || '';
  if (clean.length === 15) return clean;
  
  if (row) {
    for (const cell of row) {
      const c = cell?.replace(/\D/g, '') || '';
      if (c.length === 15) return c;
    }
  }
  return '';
};

export const cleanPhone = (value: string | undefined, row?: string[]): string => {
  const phoneRegex = /(?:\(?\d{2}\)?\s?)?(?:9\d{4}[\s\-]?\d{4}|\d{4}[\s\-]?\d{4})/;
  if (value && phoneRegex.test(value)) {
    const match = value.match(phoneRegex);
    if (match) return match[0];
  }
  
  if (row) {
    for (const cell of row) {
      if (cell && phoneRegex.test(cell)) {
        const match = cell.match(phoneRegex);
        if (match) return match[0];
      }
    }
  }
  return '';
};

export const cleanDate = (value: string | undefined, row?: string[]): string => {
  const dateRegex = /\b\d{2}\/\d{2}\/(?:\d{4}|\d{2})\b/;
  if (value && dateRegex.test(value)) {
    const match = value.match(dateRegex);
    if (match) return match[0];
  }
  
  if (row) {
    for (const cell of row) {
      if (cell && dateRegex.test(cell)) {
        const match = cell.match(dateRegex);
        if (match) return match[0];
      }
    }
  }
  return '';
};

export const cleanWords = (value: string | undefined): string => {
  if (!value) return '';
  const trimmed = value.trim();
  
  // A word field must contain at least one letter.
  if (!/[a-zA-ZÀ-ÿ]/.test(trimmed)) return '';
  
  return trimmed;
};
