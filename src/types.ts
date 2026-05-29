export interface Patient {
  id: number;
  name: string;
  sus_card: string;
  diagnosis?: string;
  surgery_type?: string;
  risk_status?: string;
  age?: number;
  birth_date?: string;
  phone?: string;
  cid_code?: string;
  procedure_code?: string;
  category?: string;
  whatsapp_sent?: number;
  aih_generated?: number;
  aih_nir?: number;
  uti_vacancy?: number;
  scheduled_cc?: number;
  doctor?: string;
  evolution?: string;
  exam_pathology?: string;
  exam_imaging?: string;
  exam_others?: string;
  data_internacao?: string;
  data_cirurgia?: string;
  horario_cirurgia?: string;
  updatedAt?: number;
}
