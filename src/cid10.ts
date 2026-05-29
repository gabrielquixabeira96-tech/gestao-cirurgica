export interface CID10 {
  code: string;
  description: string;
  specialty: string;
}

export const CID10_DATABASE: CID10[] = [
  // Ginecologia Oncológica
  { code: "C51", description: "Neoplasia maligna da vulva", specialty: "Ginecologia Oncológica" },
  { code: "C52", description: "Neoplasia maligna da vagina", specialty: "Ginecologia Oncológica" },
  { code: "C53", description: "Neoplasia maligna do colo do útero", specialty: "Ginecologia Oncológica" },
  { code: "C53.0", description: "Endocérvice", specialty: "Ginecologia Oncológica" },
  { code: "C53.1", description: "Exocérvice", specialty: "Ginecologia Oncológica" },
  { code: "C54", description: "Neoplasia maligna do corpo do útero", specialty: "Ginecologia Oncológica" },
  { code: "C54.1", description: "Endométrio", specialty: "Ginecologia Oncológica" },
  { code: "C56", description: "Neoplasia maligna do ovário", specialty: "Ginecologia Oncológica" },
  { code: "C57", description: "Neoplasia maligna de outros órgãos genitais femininos", specialty: "Ginecologia Oncológica" },
  { code: "D06", description: "Carcinoma in situ do colo do útero (NIC III)", specialty: "Ginecologia Oncológica" },
  { code: "D07", description: "Carcinoma in situ de outros órgãos genitais femininos", specialty: "Ginecologia Oncológica" },
  { code: "D07.0", description: "Endométrio", specialty: "Ginecologia Oncológica" },
  { code: "D07.1", description: "Vulva/NIV III", specialty: "Ginecologia Oncológica" },
  { code: "D07.2", description: "Vagina/NIVA III", specialty: "Ginecologia Oncológica" },
  { code: "D39", description: "Neoplasia de comportamento incerto ou desconhecido dos órgãos genitais femininos", specialty: "Ginecologia Oncológica" },

  // Cabeça e Pescoço
  { code: "C00", description: "Neoplasia maligna do lábio", specialty: "Cabeça e Pescoço" },
  { code: "C01", description: "Base da língua", specialty: "Cabeça e Pescoço" },
  { code: "C02", description: "Outras partes e partes não especificadas da língua", specialty: "Cabeça e Pescoço" },
  { code: "C03", description: "Neoplasia maligna da gengiva", specialty: "Cabeça e Pescoço" },
  { code: "C04", description: "Assoalho da boca", specialty: "Cabeça e Pescoço" },
  { code: "C05", description: "Neoplasia maligna do palato", specialty: "Cabeça e Pescoço" },
  { code: "C06", description: "Outras partes e partes não especificadas da boca", specialty: "Cabeça e Pescoço" },
  { code: "C07", description: "Neoplasia maligna da parótida", specialty: "Cabeça e Pescoço" },
  { code: "C08", description: "Neoplasia maligna de outras glândulas salivares maiores e as não especificadas", specialty: "Cabeça e Pescoço" },
  { code: "C09", description: "Neoplasia maligna da amígdala", specialty: "Cabeça e Pescoço" },
  { code: "C10", description: "Neoplasia maligna da orofaringe", specialty: "Cabeça e Pescoço" },
  { code: "C11", description: "Neoplasia maligna da nasofaringe", specialty: "Cabeça e Pescoço" },
  { code: "C12", description: "Neoplasia maligna do seio piriforme", specialty: "Cabeça e Pescoço" },
  { code: "C13", description: "Neoplasia maligna da hipofaringe", specialty: "Cabeça e Pescoço" },
  { code: "C14", description: "Neoplasia maligna de outras localizações e localizações mal definidas do lábio, cavidade oral e faringe", specialty: "Cabeça e Pescoço" },
  { code: "C32", description: "Neoplasia maligna da laringe", specialty: "Cabeça e Pescoço" },
  { code: "C32.0", description: "Glote", specialty: "Cabeça e Pescoço" },
  { code: "C32.1", description: "Supraglote", specialty: "Cabeça e Pescoço" },
  { code: "C73", description: "Neoplasia maligna da glândula tireoide", specialty: "Cabeça e Pescoço" },
  { code: "C77", description: "Neoplasia maligna secundária e não especificada dos gânglios linfáticos", specialty: "Cabeça e Pescoço" },
  { code: "D34", description: "Neoplasia benigna da glândula tireoide", specialty: "Cabeça e Pescoço" },
  { code: "E04.1", description: "Nódulo tireoidiano simples", specialty: "Cabeça e Pescoço" },
  { code: "E04.2", description: "Bócio multinodular", specialty: "Cabeça e Pescoço" },
  { code: "D11", description: "Neoplasia benigna de glândulas salivares maiores", specialty: "Cabeça e Pescoço" },
  { code: "C43.3", description: "Melanoma maligno da face", specialty: "Cabeça e Pescoço" },
  { code: "C43.4", description: "Melanoma maligno do couro cabeludo e pescoço", specialty: "Cabeça e Pescoço" },
  { code: "C44.2", description: "Neoplasia maligna da pele da orelha e do conduto auditivo externo", specialty: "Cabeça e Pescoço" },
  { code: "C44.3", description: "Neoplasia maligna de pele da face", specialty: "Cabeça e Pescoço" },
  { code: "C44.4", description: "Neoplasia maligna de pele do couro cabeludo e pescoço", specialty: "Cabeça e Pescoço" },

  // Mastologia
  { code: "C50", description: "Neoplasia maligna da mama", specialty: "Mastologia" },
  { code: "C50.1", description: "Porção central da mama", specialty: "Mastologia" },
  { code: "C50.2", description: "Quadrante superior interno da mama", specialty: "Mastologia" },
  { code: "C50.4", description: "Quadrante superior externo da mama", specialty: "Mastologia" },
  { code: "D05", description: "Carcinoma in situ da mama", specialty: "Mastologia" },
  { code: "D05.0", description: "Carcinoma lobular in situ", specialty: "Mastologia" },
  { code: "D05.1", description: "Carcinoma intraductal in situ", specialty: "Mastologia" },
  { code: "D24", description: "Neoplasia benigna da mama (fibroadenoma)", specialty: "Mastologia" },
  { code: "N60", description: "Displasias mamárias benignas", specialty: "Mastologia" },
  { code: "N60.1", description: "Mastopatia cística", specialty: "Mastologia" },
  { code: "N60.2", description: "Fibroadenose mamária", specialty: "Mastologia" },
  { code: "N61", description: "Transtornos inflamatórios da mama", specialty: "Mastologia" },
  { code: "N62", description: "Hipertrofia da mama (ginecomastia)", specialty: "Mastologia" },
  { code: "N63", description: "Nódulo mamário não especificado", specialty: "Mastologia" },
  { code: "N64.3", description: "Galactorreia", specialty: "Mastologia" },
  { code: "N64.4", description: "Mastodinia", specialty: "Mastologia" },
  { code: "N64.5", description: "Sinais e sintomas na mama (retração mamilo)", specialty: "Mastologia" },
];

export function findBestCID(text: string): string {
  if (!text) return "N/A";
  const normalized = text.toLowerCase();
  
  // 1. Try to find an explicit CID code in the text (e.g., "C50", "C50.1", "CID C50")
  const cidRegex = /\b([A-Z][0-9]{2}(?:\.[0-9]{1,2})?)\b/i;
  const match = text.match(cidRegex);
  if (match) {
    return match[1].toUpperCase();
  }

  // Synonyms mapping to help with common medical terms
  const synonyms: Record<string, string[]> = {
    "câncer": ["neoplasia maligna", "carcinoma", "tumor maligno", "ca"],
    "cancer": ["neoplasia maligna", "carcinoma", "tumor maligno", "ca"],
    "ca": ["neoplasia maligna", "carcinoma", "tumor maligno", "câncer"],
    "tumor": ["neoplasia", "nódulo", "lesão"],
    "nódulo": ["neoplasia", "tumor", "lesão"],
    "lesão": ["neoplasia", "tumor", "pele"],
    "lesões": ["neoplasia", "tumor", "pele"],
    "lesao": ["neoplasia", "tumor", "pele"],
    "mama": ["mamária", "mamário"],
    "colo": ["cérvice", "cervical"],
    "útero": ["uterino"],
    "pele": ["cutâneo", "cutânea", "melanoma", "cec", "cbc", "nasal", "periorbital", "pálpebra", "testa", "nariz", "orelha", "lóbulo", "tragus"],
    "orelha": ["lóbulo", "tragus", "pavilhão auricular"],
    "lóbulo": ["orelha"],
    "tragus": ["orelha"],
    "tireoide": ["tireoidiano", "tireoidiana", "bócio"],
    "ovário": ["ovariano", "ovariana", "anexial"],
    "nic": ["nic iii", "nic 3", "carcinoma in situ do colo do útero"],
    "nic3": ["nic iii", "nic 3", "carcinoma in situ do colo do útero"],
    "nic 3": ["nic iii", "carcinoma in situ do colo do útero"],
    "cec": ["carcinoma espinocelular", "pele", "neoplasia maligna de pele"],
    "cbc": ["carcinoma basocelular", "pele", "neoplasia maligna de pele"],
    "melanoma": ["pele"],
    "endometrio": ["endométrio", "corpo do útero"],
    "endométrio": ["corpo do útero"],
    "glossectomia": ["língua", "base da língua"],
    "glssectomia": ["língua", "base da língua"],
    "hemiglossectomia": ["língua", "base da língua"],
    "glosse": ["língua", "base da língua"],
    "laringectomia": ["laringe", "glote"],
    "larngectomia": ["laringe", "glote"],
    "laringea": ["laringe"],
    "faringectomia": ["faringe"],
    "faringea": ["faringe"],
    "parotidectomia": ["parótida", "glândulas salivares"],
    "parotide": ["parótida"],
    "tireoglosso": ["tireoide"],
    "maxila": ["boca", "assoalho da boca"],
    "maxilectomia": ["boca", "assoalho da boca"],
    "maxilextomia": ["boca", "assoalho da boca"],
    "mandíbula": ["boca", "assoalho da boca"],
    "submandibular": ["glândulas salivares"],
    "submandibulr": ["glândulas salivares"],
    "sublingual": ["glândulas salivares"],
    "amidalectomia": ["amígdala"],
    "amigdalectomia": ["amígdala"],
    "uvula": ["palato"],
    "linfadene": ["gânglios linfáticos", "pescoço", "cabeça e pescoço"],
    "esvaziamento": ["gânglios linfáticos", "pescoço", "cabeça e pescoço"],
    "pelveglosso": ["língua", "assoalho da boca"],
    "comando": ["boca", "assoalho da boca"],
    "commando": ["boca", "assoalho da boca"],
    "faringe": ["faringe", "cabeça e pescoço"],
    "faringostoma": ["faringe", "cabeça e pescoço"],
    "buco": ["boca", "assoalho da boca"],
    "benigno": ["benigna", "benigno"],
    "benigna": ["benigna", "benigno"],
    "maligno": ["maligna", "maligno"],
    "maligna": ["maligna", "maligno"],
    "cisto": ["benigna", "benigno"],
    "lobectomia": ["tireoide"],
    "tireoidectomia": ["tireoide"],
    "tireoudectomia": ["tireoide"],
    "linfonodo": ["gânglios linfáticos"],
    "linfadenectomia": ["gânglios linfáticos"]
  };

  let bestMatch = { code: "N/A", score: 1 }; // Require at least score 2
  
  // 2. Try exact match in description
  const exactMatch = CID10_DATABASE.find(cid => {
    const desc = cid.description.toLowerCase();
    return normalized === desc || normalized.includes(desc);
  });
  
  if (exactMatch) return exactMatch.code;

  // 3. Try keyword matching with synonyms
  const preProcessed = normalized
    .replace(/nic 3/g, 'nic iii')
    .replace(/nic3/g, 'nic iii')
    .replace(/[^\w\sÀ-ú]/g, ' '); // Remove punctuation
  const keywords = preProcessed.split(/[\s]+/);
  
  const stopWords = new Set([
    "de", "da", "do", "das", "dos", "com", "em", "e", "o", "a", "os", "as", "um", "uma", "para", "por", "sem",
    "i", "ii", "iii", "iv", "v", "d", "e", "dir", "esq", "direito", "esquerdo", "direita", "esquerda"
  ]);

  // Pre-calculate matching synonyms for this specific search term
  const matchingSynonyms: RegExp[] = [];
  for (const [key, synList] of Object.entries(synonyms)) {
    const keyRegex = new RegExp(`\\b${key}\\b`, 'i');
    if (keyRegex.test(preProcessed)) {
      for (const syn of synList) {
        matchingSynonyms.push(new RegExp(`\\b${syn}\\b`, 'i'));
      }
    }
  }

  // Pre-calculate keyword regexes
  const validKeywordsRegexes: RegExp[] = [];
  for (const kw of keywords) {
    if (kw.length >= 2 && !stopWords.has(kw)) {
      validKeywordsRegexes.push(new RegExp(`\\b${kw}\\b`, 'i'));
    }
  }
  
  for (const cid of CID10_DATABASE) {
    let score = 0;
    const cidDesc = cid.description.toLowerCase();
    
    // Check synonyms against the whole normalized text using word boundaries
    for (const synRegex of matchingSynonyms) {
      if (synRegex.test(cidDesc)) {
        score += 2; // Synonyms are strong indicators
      }
    }
    
    // Check direct keyword match
    for (const kwRegex of validKeywordsRegexes) {
      if (kwRegex.test(cidDesc)) {
        score += 2; // Direct matches are worth more
      }
    }
    
    if (score > bestMatch.score) {
      bestMatch = { code: cid.code, score };
    }
  }

  return bestMatch.score > 0 ? bestMatch.code : "N/A";
}
