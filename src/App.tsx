import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ClipboardList,
  MessageSquare,
  FileText,
  CheckCircle2,
  Search,
  Plus,
  Calendar,
  Activity,
  Loader2,
  AlertCircle,
  X,
  RefreshCw,
  Camera,
  HelpCircle,
  Download,
  Settings,
  CloudOff,
  Cloud,
  CheckCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

import { findBestCID } from './cid10';
import { findBestProcedure } from './procedures';
import { generateSurgeryNoticePdf } from './surgeryNotice';
import { cleanSusCard, cleanPhone, cleanDate, cleanWords } from './dataCleaner';
import { sharePDFViaWhatsApp } from './services/pdfService';
import {
  getAllPatients,
  addPatient,
  updatePatient,
  deletePatient,
  updatePatientStatus,
  importPatientsFromText,
  seedIfEmpty,
} from './lib/db';
import { syncAll, getGasUrl, setGasUrl, getLastSync } from './lib/sheetsSync';
import { Patient } from './types';
import { PatientRow } from './components/PatientRow';
import { StatusCheckbox } from './components/StatusCheckbox';
import { DischargeModal } from './components/DischargeModal';
import {
  generateAPAC,
  generateDischargeDocuments,
  generateRiskRequest,
  generateAIHPDF,
} from './services/pdfGenerator';

const ExamsModal = React.lazy(() =>
  import('./components/ExamsModal').then((m) => ({ default: m.ExamsModal }))
);
const CustomApacModal = React.lazy(() =>
  import('./components/CustomApacModal').then((m) => ({ default: m.CustomApacModal }))
);
const RiskRequestModal = React.lazy(() =>
  import('./components/RiskRequestModal').then((m) => ({ default: m.RiskRequestModal }))
);
const EditPatientModal = React.lazy(() =>
  import('./components/EditPatientModal').then((m) => ({ default: m.EditPatientModal }))
);
const ScheduleModal = React.lazy(() =>
  import('./components/ScheduleModal').then((m) => ({ default: m.ScheduleModal }))
);
const AihModal = React.lazy(() =>
  import('./components/AihModal').then((m) => ({ default: m.AihModal }))
);

const CATEGORY_LABELS: Record<string, string> = {
  AGENDADA: 'Cirurgias Agendadas',
  PRIORITARIA: 'Cirurgias Prioritárias',
  PENDENCIA: 'Pacientes com Pendências',
  PELE_NAO_MELANOMA: 'Pele Não Melanoma',
  FALTOSO: 'Faltosos',
  NEGOU_NAO_ATENDE: 'Negou / Não Atende',
  PRONTO: 'Pacientes Prontos',
};

const CATEGORY_COLORS: Record<string, string> = {
  AGENDADA: 'bg-black',
  PRIORITARIA: 'bg-black',
  PENDENCIA: 'bg-neutral-400',
  PELE_NAO_MELANOMA: 'bg-neutral-500',
  FALTOSO: 'bg-neutral-600',
  NEGOU_NAO_ATENDE: 'bg-neutral-700',
  PRONTO: 'bg-black',
};

const CATEGORY_ORDER = [
  'AGENDADA',
  'PRIORITARIA',
  'PENDENCIA',
  'PELE_NAO_MELANOMA',
  'FALTOSO',
  'NEGOU_NAO_ATENDE',
  'PRONTO',
];

type DoctorTab =
  | 'Todos'
  | 'Dra. Bianca'
  | 'Dr. Rafael'
  | 'Dr. Manoel'
  | 'Dra. Mara'
  | 'Dr. Gilmar'
  | 'Dr. Rodolfo';

const EMPTY_PATIENT = {
  name: '',
  sus_card: '',
  diagnosis: '',
  surgery_type: '',
  risk_status: 'Aguardando',
  age: 0,
  birth_date: '',
  phone: '',
  category: 'PENDENCIA',
  doctor: '',
  whatsapp_sent: 0,
  aih_generated: 0,
  aih_nir: 0,
  uti_vacancy: 0,
  scheduled_cc: 0,
  exam_pathology: '',
  exam_imaging: '',
  exam_others: '',
};

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [activeDoctorTab, setActiveDoctorTab] = useState<DoctorTab>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isAihModalOpen, setIsAihModalOpen] = useState(false);
  const [aihPatient, setAihPatient] = useState<Patient | null>(null);

  const [isSurgeryNoticeModalOpen, setIsSurgeryNoticeModalOpen] = useState(false);
  const [surgeryNoticePatient, setSurgeryNoticePatient] = useState<Patient | null>(null);
  const [surgeryNoticeDate, setSurgeryNoticeDate] = useState('');
  const [surgeryNoticeTime, setSurgeryNoticeTime] = useState('');
  const [isGeneratingSurgeryNotice, setIsGeneratingSurgeryNotice] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<number | null>(null);
  const [importText, setImportText] = useState('');

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppPatient, setWhatsAppPatient] = useState<Patient | null>(null);
  const [whatsAppAdmissionDate, setWhatsAppAdmissionDate] = useState('');

  const [isExamsModalOpen, setIsExamsModalOpen] = useState(false);
  const [examsPatient, setExamsPatient] = useState<Patient | null>(null);

  const [isCustomApacModalOpen, setIsCustomApacModalOpen] = useState(false);
  const [customApacPatient, setCustomApacPatient] = useState<Patient | null>(null);

  const [isRiskRequestModalOpen, setIsRiskRequestModalOpen] = useState(false);
  const [riskRequestPatient, setRiskRequestPatient] = useState<Patient | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);

  const [isScanningAI, setIsScanningAI] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulePatient, setSchedulePatient] = useState<Patient | null>(null);

  // ─── Discharge (Alta) ─────────────────────────────────────────────────────
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [dischargePatient, setDischargePatient] = useState<Patient | null>(null);

  // ─── Google Sheets Sync ───────────────────────────────────────────────────
  type SyncState = 'idle' | 'syncing' | 'ok' | 'error';
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [lastSync, setLastSync] = useState(getLastSync);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [gasUrlInput, setGasUrlInput] = useState(getGasUrl);

  const [newPatient, setNewPatient] = useState({ ...EMPTY_PATIENT });

  // ─── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      await seedIfEmpty();
      await fetchPatients();
      // Auto-sync on boot if GAS URL is configured
      if (getGasUrl()) {
        setTimeout(() => handleSync(), 1500);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Discharge (Alta) handler ─────────────────────────────────────────────
  const openDischargeModal = useCallback((patient: Patient) => {
    setDischargePatient(patient);
    setIsDischargeModalOpen(true);
  }, []);

  // ─── Google Sheets Sync ───────────────────────────────────────────────────
  const handleSync = useCallback(async () => {
    if (!getGasUrl()) {
      setIsSettingsOpen(true);
      return;
    }
    setSyncState('syncing');
    setSyncMessage('Sincronizando...');
    try {
      const result = await syncAll();
      await fetchPatients();
      setSyncState('ok');
      setSyncMessage(`Importação concluída! ${result.total} no total, +${result.added} novos adicionados.`);
      setLastSync(getLastSync());
      setTimeout(() => setSyncState('idle'), 4000);
    } catch (err: any) {
      console.error('Sync error:', err);
      setSyncState('error');
      setSyncMessage(err.message ?? 'Erro ao importar');
      setTimeout(() => setSyncState('idle'), 6000);
    }
  }, []);

  const saveGasUrl = () => {
    setGasUrl(gasUrlInput);
    setIsSettingsOpen(false);
  };

  // ─── Add patient ──────────────────────────────────────────────────────────
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleaned = {
        ...newPatient,
        name: cleanWords(newPatient.name),
        sus_card: cleanSusCard(newPatient.sus_card),
        diagnosis: cleanWords(newPatient.diagnosis),
        surgery_type: cleanWords(newPatient.surgery_type),
        birth_date: cleanDate(newPatient.birth_date),
        phone: cleanPhone(newPatient.phone),
        risk_status: cleanWords(newPatient.risk_status),
      };
      const combinedText = `${cleaned.diagnosis} ${cleaned.surgery_type}`.trim();
      const cid_code = findBestCID(combinedText);
      const procedure_code = findBestProcedure(cleaned.surgery_type || '').code;

      const saved = await addPatient({ ...cleaned, cid_code, procedure_code });
      setPatients((prev) => [saved, ...prev]);
      setIsModalOpen(false);
      setNewPatient({ ...EMPTY_PATIENT });
    } catch (err) {
      console.error('Erro ao adicionar paciente:', err);
      alert('Erro ao salvar o paciente. Tente novamente.');
    }
  };

  // ─── AI scan (prontuario photos) ─────────────────────────────────────────
  const processImages = async (files: File[]) => {
    if (!files.length) return;
    setIsScanningAI(true);
    try {
      const parts: any[] = [];
      for (const file of files) {
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        parts.push({ inlineData: { mimeType: file.type, data: base64Data } });
      }
      parts.push({
        text: `Extraia as informações do paciente destas fotos de prontuário médico.
As fotos podem ser de diferentes páginas do mesmo prontuário.
Combine as informações encontradas em todas as fotos.
Retorne apenas um objeto JSON com os seguintes campos:
- name: Nome completo do paciente
- sus_card: Número do cartão SUS (apenas números)
- diagnosis: Diagnóstico principal
- surgery_type: Tipo de cirurgia proposta
- age: Idade (número)
- birth_date: Data de nascimento (DD/MM/AAAA)
- phone: Telefone de contato
- doctor: Nome do médico (escolha entre "Dra. Bianca", "Dr. Rafael", "Dr. Manoel", "Dra. Mara", "Dr. Gilmar", ou "Dr. Rodolfo" se possível, ou deixe vazio)
- risk_status: Status de risco cirúrgico
- whatsapp_sent: 0, aih_generated: 0, aih_nir: 0, uti_vacancy: 0, scheduled_cc: 0
- exam_pathology, exam_imaging, exam_others: resultados se houver
Retorne APENAS o JSON.`,
      });

      // Call Netlify Function in production, or local proxy in dev
      const endpoint = '/.netlify/functions/scan-prontuario';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parts }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao processar imagens');
      }

      const result = await response.json();
      const extracted = JSON.parse(result.text);
      setNewPatient((prev) => ({
        ...prev,
        ...extracted,
        age: parseInt(extracted.age) || prev.age,
        whatsapp_sent: extracted.whatsapp_sent || 0,
        aih_generated: extracted.aih_generated || 0,
        aih_nir: extracted.aih_nir || 0,
        uti_vacancy: extracted.uti_vacancy || 0,
        scheduled_cc: extracted.scheduled_cc || 0,
        doctor: extracted.doctor?.includes('Bianca')
          ? 'Dra. Bianca'
          : extracted.doctor?.includes('Rafael')
          ? 'Dr. Rafael'
          : extracted.doctor?.includes('Manoel')
          ? 'Dr. Manoel'
          : extracted.doctor?.includes('Mara')
          ? 'Dra. Mara'
          : extracted.doctor?.includes('Gilmar')
          ? 'Dr. Gilmar'
          : extracted.doctor?.includes('Rodolfo')
          ? 'Dr. Rodolfo'
          : prev.doctor,
      }));
      alert('Informações extraídas com sucesso!');
    } catch (err: any) {
      console.error('Erro ao escanear prontuário:', err);
      alert(err.message || 'Erro ao processar as imagens. Tente novamente ou insira manualmente.');
    } finally {
      setIsScanningAI(false);
    }
  };

  const handleScanProntuario = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[];
    await processImages(files);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = (Array.from(e.dataTransfer.files) as File[]).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) await processImages(files);
  };

  // ─── Surgery notice ───────────────────────────────────────────────────────
  const handleGenerateSurgeryNotice = async () => {
    if (!surgeryNoticePatient) return;
    setIsGeneratingSurgeryNotice(true);
    try {
      generateSurgeryNoticePdf(surgeryNoticePatient, surgeryNoticeDate, surgeryNoticeTime);
      setIsSurgeryNoticeModalOpen(false);
    } catch (err) {
      console.error('Erro ao gerar aviso:', err);
      alert('Erro ao gerar o documento.');
    } finally {
      setIsGeneratingSurgeryNotice(false);
    }
  };

  // ─── Import ───────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!importText.trim()) return;
    try {
      const doctor = activeDoctorTab !== 'Todos' ? activeDoctorTab : '';
      const added = await importPatientsFromText(importText, doctor);
      alert(`${added} paciente(s) importado(s) com sucesso!`);
      setIsImportModalOpen(false);
      setImportText('');
      await fetchPatients();
    } catch (err) {
      console.error('Erro ao importar:', err);
      alert('Erro ao importar pacientes.');
    }
  };

  // ─── Status toggle ────────────────────────────────────────────────────────
  const toggleStatus = useCallback(
    async (id: number, field: string, currentValue: number) => {
      const newValue = currentValue === 1 ? 0 : 1;
      setPatients((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: newValue } : p))
      );
      try {
        await updatePatientStatus(id, field, newValue);
      } catch (err) {
        console.error('Erro ao atualizar status:', err);
        setPatients((prev) =>
          prev.map((p) => (p.id === id ? { ...p, [field]: currentValue } : p))
        );
      }
    },
    []
  );

  // ─── WhatsApp ─────────────────────────────────────────────────────────────
  const openWhatsAppModal = useCallback((patient: Patient) => {
    setWhatsAppPatient(patient);
    setWhatsAppAdmissionDate('');
    setIsWhatsAppModalOpen(true);
  }, []);

  const confirmWhatsApp = async () => {
    if (!whatsAppPatient || !whatsAppAdmissionDate) return;
    setIsGeneratingPDF(whatsAppPatient.id);
    setIsWhatsAppModalOpen(false);
    try {
      const patient = whatsAppPatient;
      const [year, month, day] = whatsAppAdmissionDate.split('-');
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const dayOfWeek = daysOfWeek[localDate.getDay()];
      const formattedDate = `${day}/${month}/${year}`;
      const prefix = localDate.getDay() === 0 || localDate.getDay() === 6 ? 'no' : 'na';
      const firstName = patient.name.split(' ')[0].toLowerCase();
      const isFemale = firstName.endsWith('a') || firstName.endsWith('e') || firstName.endsWith('y') || firstName.endsWith('i');
      const title = isFemale ? 'da Sra' : 'do Sr';
      const pronoun = isFemale ? 'a Sra' : 'o Sr';
      let doctorString = 'da equipe médica';
      const doctorName = patient.doctor || (activeDoctorTab !== 'Todos' ? activeDoctorTab : '');
      if (doctorName) {
        const hasDra = doctorName.toLowerCase().includes('dra');
        doctorString = `da equipe ${hasDra ? 'da' : 'do'} ${doctorName}`;
      }
      const message = `Olá tudo Bem?, esse número é ${title} ${cleanWords(patient.name)}? Sou ${doctorString} do ITC, estou entrando em contato para falar a respeito do procedimento cirúrgico que ${pronoun} está aguardando, gostaria de saber se consegue comparecer ao hospital geral no hospital para a internação ${prefix} ${dayOfWeek} Dia ${formattedDate}?`;
      const filename = `Orientacoes_${patient.name.replace(/\s+/g, '_')}`;
      await sharePDFViaWhatsApp(`patient-card-${patient.id}`, filename, patient.phone || '', message);
      setPatients((prev) => prev.map((p) => (p.id === patient.id ? { ...p, whatsapp_sent: 1 } : p)));
      await updatePatientStatus(patient.id, 'whatsapp_sent', 1);
    } catch (err) {
      console.error('Erro ao gerar PDF para WhatsApp:', err);
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(null);
      setWhatsAppPatient(null);
    }
  };

  // ─── Exams ────────────────────────────────────────────────────────────────
  const openExamsModal = useCallback((patient: Patient) => {
    setExamsPatient(patient);
    setIsExamsModalOpen(true);
  }, []);

  const saveExams = async (
    patientId: number,
    exams: { exam_pathology: string; exam_imaging: string; exam_others: string }
  ) => {
    try {
      await updatePatient(patientId, exams);
      setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, ...exams } : p)));
      alert('Exames salvos com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar exames:', err);
      alert('Ocorreu um erro ao salvar os exames.');
    }
  };

  // ─── Edit patient ─────────────────────────────────────────────────────────
  const openEditModal = useCallback((patient: Patient) => {
    setEditPatient(patient);
    setIsEditModalOpen(true);
  }, []);

  const savePatientEdits = async (patientId: number, data: Partial<Patient>) => {
    try {
      setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, ...data } : p)));
      await updatePatient(patientId, data);
      setIsEditModalOpen(false);
      alert('Paciente atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
      alert('Ocorreu um erro ao atualizar o paciente.');
      await fetchPatients();
    }
  };

  const handleDeletePatient = async (patientId: number) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return;
    try {
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
      await deletePatient(patientId);
      alert('Paciente excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir paciente:', err);
      alert('Ocorreu um erro ao excluir o paciente.');
      await fetchPatients();
    }
  };

  // ─── AIH modal ────────────────────────────────────────────────────────────
  const openAihModal = useCallback((patient: Patient) => {
    setAihPatient(patient);
    setIsAihModalOpen(true);
  }, []);

  const handleGenerateAIH = useCallback(async (data: any) => {
    try {
      await generateAIHPDF(data);
    } catch (err) {
      console.error('Erro ao gerar AIH:', err);
      alert('Erro ao gerar AIH');
    }
  }, []);

  // ─── APAC ─────────────────────────────────────────────────────────────────
  const openCustomApacModal = useCallback((patient: Patient) => {
    setCustomApacPatient(patient);
    setIsCustomApacModalOpen(true);
  }, []);

  const handleGenerateAPAC = async (data: any) => {
    try {
      await generateAPAC(data);
    } catch (err) {
      console.error('Erro ao gerar APAC:', err);
      alert('Erro ao gerar APAC');
    }
  };

  // ─── Risk request ─────────────────────────────────────────────────────────
  const openRiskRequestModal = useCallback((patient: Patient) => {
    setRiskRequestPatient(patient);
    setIsRiskRequestModalOpen(true);
  }, []);

  const handleGenerateRiskRequest = async (patient: Patient, otherExams: string = '') => {
    setIsGeneratingPDF(patient.id);
    try {
      await generateRiskRequest(patient, otherExams);
    } catch (err) {
      console.error('Erro ao gerar solicitação de risco:', err);
      alert('Erro ao gerar solicitação de risco');
    } finally {
      setIsGeneratingPDF(null);
    }
  };

  // ─── Schedule surgery ─────────────────────────────────────────────────────
  const handleScheduleSurgery = useCallback(
    async (patient: Patient) => {
      const requiredFields: (keyof Patient)[] = [
        'name', 'sus_card', 'age', 'doctor', 'surgery_type',
        'procedure_code', 'diagnosis', 'cid_code',
        'data_internacao', 'data_cirurgia', 'horario_cirurgia',
      ];
      const missingFields = requiredFields.filter((f) => !patient[f]);
      if (missingFields.length > 0) {
        let updatedPatient = { ...patient };
        if (!updatedPatient.cid_code && updatedPatient.diagnosis) {
          updatedPatient.cid_code = findBestCID(`${updatedPatient.diagnosis} ${updatedPatient.surgery_type || ''}`.trim());
        }
        if (!updatedPatient.procedure_code && updatedPatient.surgery_type) {
          updatedPatient.procedure_code = findBestProcedure(updatedPatient.surgery_type).code;
        }
        setSchedulePatient(updatedPatient);
        setIsScheduleModalOpen(true);
        return;
      }
      try {
        const message = `Olá, informamos que a cirurgia de ${patient.name} foi agendada para o dia ${patient.data_cirurgia} às ${patient.horario_cirurgia}. A internação será no dia ${patient.data_internacao}.`;
        const phone = patient.phone?.replace(/\D/g, '');
        if (phone) {
          window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
          alert('Paciente sem telefone cadastrado para notificação via WhatsApp.');
        }
        await toggleStatus(patient.id, 'aih_generated', 0);
        alert('Paciente agendado. Use os botões individuais para revisar e baixar o Aviso e a AIH.');
      } catch (err) {
        console.error('Erro ao agendar cirurgia:', err);
        alert('Erro ao agendar a cirurgia.');
      }
    },
    [toggleStatus]
  );

  const saveScheduleData = async (patientId: number, data: Partial<Patient>) => {
    try {
      const updated = await updatePatient(patientId, data);
      setPatients((prev) => prev.map((p) => (p.id === patientId ? updated : p)));
      setIsScheduleModalOpen(false);
      handleScheduleSurgery(updated);
    } catch (err) {
      console.error('Erro ao salvar dados de agendamento:', err);
      alert('Erro ao salvar dados. Tente novamente.');
    }
  };

  // ─── Filtered / grouped ───────────────────────────────────────────────────
  const filteredPatients = useMemo(
    () =>
      patients
        .filter(
          (p) =>
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (p.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
            (activeDoctorTab === 'Todos' || p.doctor === activeDoctorTab)
        )
        .filter((p) => activeTab === 'all' || p.scheduled_cc === 0),
    [patients, searchTerm, activeDoctorTab, activeTab]
  );

  const patientsByCategory = useMemo(
    () =>
      filteredPatients.reduce((acc, p) => {
        const cat = p.category || 'PENDENCIA';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
      }, {} as Record<string, Patient[]>),
    [filteredPatients]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-[#1E293B] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-serif font-bold text-[var(--color-mayo-blue)]">GQB OS</h1>
              <button
                onClick={() => setIsHelpModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors rounded"
                title="Ajuda e Funcionalidades"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Ajuda</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-neutral-100 p-1 rounded-none overflow-x-auto">
                {(['Todos', 'Dra. Bianca', 'Dr. Rafael', 'Dr. Manoel', 'Dra. Mara', 'Dr. Gilmar', 'Dr. Rodolfo'] as DoctorTab[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveDoctorTab(tab)}
                      className={cn(
                        'px-4 py-1.5 rounded-none text-sm font-medium transition-colors whitespace-nowrap',
                        activeDoctorTab === tab
                          ? 'bg-white text-[var(--color-mayo-blue)] shadow-sm'
                          : 'text-neutral-600 hover:text-[var(--color-mayo-blue)] hover:bg-neutral-200/50'
                      )}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  className="pl-10 pr-4 py-2 bg-neutral-100 border-none rounded-none text-sm focus:ring-2 focus:ring-[var(--color-mayo-blue)] w-64 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            <div className="flex items-center gap-2">
                {/* Sync button */}
                <button
                  onClick={handleSync}
                  disabled={syncState === 'syncing'}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-none border transition-colors disabled:cursor-not-allowed',
                    syncState === 'ok' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                    syncState === 'error' ? 'bg-red-50 border-red-300 text-red-700' :
                    syncState === 'syncing' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                    'bg-white border-neutral-300 text-neutral-600 hover:border-black hover:text-black'
                  )}
                  title={`Sincronizar com Google Sheets\nÚltima sync: ${lastSync}`}
                >
                  {syncState === 'syncing' && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {syncState === 'ok' && <CheckCheck className="w-4 h-4" />}
                  {syncState === 'error' && <CloudOff className="w-4 h-4" />}
                  {syncState === 'idle' && <Cloud className="w-4 h-4" />}
                  <span className="hidden sm:inline">
                    {syncState === 'syncing' ? 'Sincronizando...' :
                     syncState === 'ok' ? 'Sincronizado' :
                     syncState === 'error' ? 'Erro' : 'Sheets'}
                  </span>
                </button>

                {/* Settings button */}
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors rounded-none"
                  title="Configurações de Sincronização"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="bg-white hover:bg-neutral-50 text-black border border-black px-4 py-2 rounded-none text-sm font-medium transition-colors"
                >
                  Importar Lista
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-none text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  Novo Paciente
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sync status bar */}
      <AnimatePresence>
        {syncMessage && (syncState === 'ok' || syncState === 'error') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              'text-xs font-medium text-center py-1.5 px-4',
              syncState === 'ok' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            )}
          >
            {syncMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-none shadow-lg w-full max-w-lg overflow-hidden border border-black"
            >
              <div className="px-6 py-4 border-b border-black flex justify-between items-center">
                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Configurações — Google Sheets Sync
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="text-neutral-500 hover:text-black">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {getGasUrl() ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 leading-relaxed flex items-start gap-2">
                    <CheckCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>URL configurada e pronta!</strong><br/>
                      A importação de novos pacientes da planilha acontece automaticamente ao abrir o app e ao clicar em "Sheets" no cabeçalho.
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-800 leading-relaxed">
                    <strong>Como configurar:</strong><br/>
                    1. Abra a planilha → Extensões → Apps Script<br/>
                    2. Cole o código de <code className="bg-blue-100 px-1">GAS_CODE.md</code><br/>
                    3. Implante como App da Web ("Qualquer pessoa") e copie a URL<br/>
                    4. Cole a URL abaixo e salve
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">URL do Google Apps Script Web App</label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                    value={gasUrlInput}
                    onChange={(e) => setGasUrlInput(e.target.value)}
                  />
                </div>
                <div className="text-xs text-neutral-500">
                  ID da planilha: <code className="bg-neutral-100 px-1">1kpSib49Fpm8wjkA5AXurdQE3Dp5aFrfyr86G3jVg5Y8</code><br/>
                  Última sincronização: <strong>{lastSync}</strong>
                </div>
              </div>
              <div className="px-6 py-4 bg-neutral-50 border-t border-black flex justify-end gap-3">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-black"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveGasUrl}
                  disabled={!gasUrlInput.trim()}
                  className="px-6 py-2 bg-black text-white text-sm font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  Salvar e Sincronizar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* WhatsApp Modal */}
        <AnimatePresence>
          {isWhatsAppModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-none shadow-lg w-full max-w-md overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-black flex justify-between items-center">
                  <h3 className="text-lg font-bold text-black">Data da Internação</h3>
                  <button onClick={() => setIsWhatsAppModalOpen(false)} className="text-neutral-500 hover:text-neutral-600">
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-neutral-600">
                    Selecione a data de internação para gerar a mensagem do WhatsApp para{' '}
                    <strong>{whatsAppPatient?.name}</strong>.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Data da Internação
                    </label>
                    <input
                      type="date"
                      required
                      value={whatsAppAdmissionDate}
                      onChange={(e) => setWhatsAppAdmissionDate(e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                    />
                  </div>
                </div>
                <div className="px-6 py-4 bg-neutral-50 border-t border-black flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-black"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmWhatsApp}
                    disabled={!whatsAppAdmissionDate}
                    className="px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar e Enviar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Import Modal */}
        <AnimatePresence>
          {isImportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-none shadow-lg w-full max-w-2xl overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-black flex justify-between items-center">
                  <h3 className="text-lg font-bold text-black">Importar Lista de Pacientes (Excel)</h3>
                  <button onClick={() => setIsImportModalOpen(false)} className="text-neutral-500 hover:text-neutral-600">
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-neutral-600">
                    Cole os dados do Excel aqui. A ordem das colunas deve ser: <br />
                    <strong>Nome | Cartão SUS | Diagnóstico | Cirurgia | Data de Nascimento (DD/MM/AAAA) | Risco | Telefone</strong>
                  </p>
                  <textarea
                    className="w-full h-64 px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none font-mono whitespace-pre"
                    placeholder="Cole aqui..."
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                </div>
                <div className="px-6 py-4 bg-neutral-50 border-t border-black flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-black"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImport}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-none text-sm font-medium transition-colors"
                  >
                    Processar Importação
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Surgery Notice Modal */}
        <AnimatePresence>
          {isSurgeryNoticeModalOpen && surgeryNoticePatient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-none shadow-lg w-full max-w-md overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-black flex justify-between items-center">
                  <h3 className="text-lg font-bold text-black">Aviso de Cirurgia</h3>
                  <button
                    onClick={() => { setIsSurgeryNoticeModalOpen(false); }}
                    className="text-neutral-500 hover:text-neutral-600"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-neutral-600 mb-4">
                      Informe a data e horário da cirurgia para o paciente{' '}
                      <strong>{surgeryNoticePatient.name}</strong>.
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                        Data da Cirurgia
                      </label>
                      <input
                        type="text"
                        placeholder="DD/MM/AAAA"
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={surgeryNoticeDate}
                        onChange={(e) => setSurgeryNoticeDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                        Horário da Cirurgia
                      </label>
                      <input
                        type="text"
                        placeholder="HH:MM"
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={surgeryNoticeTime}
                        onChange={(e) => setSurgeryNoticeTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-neutral-50 border-t border-black flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSurgeryNoticeModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-black"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGenerateSurgeryNotice}
                    disabled={isGeneratingSurgeryNotice}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-none text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGeneratingSurgeryNotice ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                    Gerar Aviso
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* New Patient Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-none shadow-lg w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <div className="px-6 py-4 border-b border-black flex justify-between items-center sticky top-0 bg-white z-10">
                  <h3 className="text-lg font-bold text-black">Novo Paciente</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-neutral-600">
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleAddPatient} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* AI Scanner */}
                    <div className="col-span-2 mb-2">
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-2">
                        Escanear Prontuário (IA)
                      </label>
                      <div
                        className="flex items-center gap-3"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <label
                          className={cn(
                            'flex-1 flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-none cursor-pointer transition-all',
                            isScanningAI
                              ? 'bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed'
                              : isDragging
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100 text-blue-600'
                          )}
                        >
                          {isScanningAI ? (
                            <>
                              <RefreshCw className="w-6 h-6 animate-spin" />
                              <span className="text-sm font-bold uppercase tracking-wider">Processando Imagens...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-6 h-6" />
                              <span className="text-sm font-bold uppercase tracking-wider">
                                Tirar Fotos, Fazer Upload ou Arrastar
                              </span>
                              <span className="text-xs font-normal opacity-75">Você pode selecionar múltiplas fotos</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            capture="environment"
                            className="hidden"
                            onChange={handleScanProntuario}
                            disabled={isScanningAI}
                          />
                        </label>
                      </div>
                      <p className="mt-1 text-[10px] text-neutral-500 italic">
                        A IA preencherá os campos automaticamente a partir das fotos do prontuário.
                      </p>
                    </div>

                    {/* Fields */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Nome Completo</label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={newPatient.name}
                        onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Cartão SUS</label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={newPatient.sus_card}
                        onChange={(e) => setNewPatient({ ...newPatient, sus_card: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Telefone</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={newPatient.phone}
                        onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Data de Nascimento</label>
                      <input
                        type="text"
                        placeholder="DD/MM/AAAA"
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={newPatient.birth_date}
                        onChange={(e) => setNewPatient({ ...newPatient, birth_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Idade</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Diagnóstico</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={newPatient.diagnosis}
                        onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Tipo de Cirurgia</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={newPatient.surgery_type}
                        onChange={(e) => setNewPatient({ ...newPatient, surgery_type: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Categoria</label>
                      <select
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={newPatient.category}
                        onChange={(e) => setNewPatient({ ...newPatient, category: e.target.value })}
                      >
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Médico</label>
                      <select
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={newPatient.doctor}
                        onChange={(e) => setNewPatient({ ...newPatient, doctor: e.target.value })}
                      >
                        <option value="">Não atribuído</option>
                        <option value="Dra. Bianca">Dra. Bianca</option>
                        <option value="Dr. Rafael">Dr. Rafael</option>
                        <option value="Dr. Manoel">Dr. Manoel</option>
                        <option value="Dra. Mara">Dra. Mara</option>
                        <option value="Dr. Gilmar">Dr. Gilmar</option>
                        <option value="Dr. Rodolfo">Dr. Rodolfo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">Risco Cirúrgico</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none"
                        value={newPatient.risk_status}
                        onChange={(e) => setNewPatient({ ...newPatient, risk_status: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4 pt-2">
                      {[
                        { id: 'new-whatsapp', field: 'whatsapp_sent', label: 'WhatsApp Enviado' },
                        { id: 'new-aih-gen', field: 'aih_generated', label: 'AIH Gerada' },
                        { id: 'new-aih-nir', field: 'aih_nir', label: 'AIH no NIR' },
                        { id: 'new-uti', field: 'uti_vacancy', label: 'Vaga UTI' },
                        { id: 'new-cc', field: 'scheduled_cc', label: 'Agendado CC' },
                      ].map(({ id, field, label }) => (
                        <div key={id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={id}
                            checked={(newPatient as any)[field] === 1}
                            onChange={(e) => setNewPatient({ ...newPatient, [field]: e.target.checked ? 1 : 0 })}
                            className="w-4 h-4"
                          />
                          <label htmlFor={id} className="text-xs font-bold text-neutral-600 uppercase">
                            {label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {[
                      { field: 'exam_pathology', label: 'Exames de Patologia' },
                      { field: 'exam_imaging', label: 'Exames de Imagem' },
                      { field: 'exam_others', label: 'Outros Exames' },
                    ].map(({ field, label }) => (
                      <div key={field} className="col-span-2">
                        <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">{label}</label>
                        <textarea
                          className="w-full px-4 py-2 bg-neutral-50 border border-black rounded-none text-sm focus:ring-2 focus:ring-[#004b87] outline-none h-16"
                          value={(newPatient as any)[field]}
                          onChange={(e) => setNewPatient({ ...newPatient, [field]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-none text-sm font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-black text-white hover:bg-neutral-800 rounded-none text-sm font-bold transition-colors"
                    >
                      Salvar Paciente
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-none border border-black">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-none">
                <Calendar className="text-black w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Total de Pacientes</p>
                <p className="text-2xl font-bold text-black">{patients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-none border border-black">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-none">
                <AlertCircle className="text-black w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Pendências Críticas</p>
                <p className="text-2xl font-bold text-black">
                  {patients.filter((p) => !p.aih_nir || !p.uti_vacancy).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-none border border-black">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-none">
                <CheckCircle2 className="text-black w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Agendados</p>
                <p className="text-2xl font-bold text-black">
                  {patients.filter((p) => p.scheduled_cc === 1).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-4 py-2 rounded-none text-sm font-medium transition-all',
              activeTab === 'all' ? 'bg-black text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
            )}
          >
            Todos os Pacientes
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              'px-4 py-2 rounded-none text-sm font-medium transition-all',
              activeTab === 'pending' ? 'bg-black text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
            )}
          >
            Aguardando Agendamento
          </button>
        </div>

        {/* Patient List */}
        <div className="space-y-12">
          {loading ? (
            <div className="bg-white rounded-none border border-black flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-black animate-spin mb-4" strokeWidth={1.5} />
              <p className="text-neutral-600 font-medium">Carregando base de dados...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="bg-white rounded-none border border-black text-center py-20">
              <div className="bg-neutral-50 w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-4">
                <Search className="text-neutral-500 w-8 h-8" strokeWidth={1.5} />
              </div>
              <p className="text-black font-semibold">Nenhum paciente encontrado</p>
              <p className="text-neutral-600">Tente ajustar sua busca ou filtros.</p>
            </div>
          ) : (
            CATEGORY_ORDER.map((category) => {
              const categoryPatients = patientsByCategory[category];
              if (!categoryPatients || categoryPatients.length === 0) return null;
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-1 h-6 rounded-none', CATEGORY_COLORS[category])} />
                    <h2 className="text-lg font-bold text-black">{CATEGORY_LABELS[category]}</h2>
                    <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-none text-xs font-bold">
                      {categoryPatients.length}
                    </span>
                  </div>
                  <div className="bg-white rounded-none border border-black overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-black">
                            <th className="px-8 py-5 text-xs font-bold text-neutral-600 uppercase tracking-wider">Paciente</th>
                            <th className="px-8 py-5 text-xs font-bold text-neutral-600 uppercase tracking-wider">Checklist de Pendências</th>
                            <th className="px-8 py-5 text-xs font-bold text-neutral-600 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {categoryPatients.map((patient) => (
                            <PatientRow
                              key={patient.id}
                              patient={patient}
                              toggleStatus={toggleStatus}
                              openWhatsAppModal={openWhatsAppModal}
                              isGeneratingPDF={isGeneratingPDF === patient.id}
                              openAihModal={openAihModal}
                              openRiskRequestModal={openRiskRequestModal}
                              setSurgeryNoticePatient={setSurgeryNoticePatient}
                              setSurgeryNoticeDate={setSurgeryNoticeDate}
                              setSurgeryNoticeTime={setSurgeryNoticeTime}
                              setIsSurgeryNoticeModalOpen={setIsSurgeryNoticeModalOpen}
                              openExamsModal={openExamsModal}
                              openCustomApacModal={openCustomApacModal}
                              openEditModal={openEditModal}
                              openDischargeModal={openDischargeModal}
                              scheduleSurgery={handleScheduleSurgery}
                              findBestCID={findBestCID}
                              findBestProcedure={findBestProcedure}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-black mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <span className="text-sm font-medium">GQB OS — CirurgiaFlow v1.0</span>
          </div>
          <p className="text-sm text-neutral-600">
            © 2026 Sistema de Automação Hospitalar. Desenvolvido para agilidade cirúrgica.
          </p>
        </div>
      </footer>

      {/* Lazy Modals */}
      <React.Suspense fallback={null}>
        <ExamsModal
          isOpen={isExamsModalOpen}
          onClose={() => setIsExamsModalOpen(false)}
          patient={examsPatient}
          onSave={saveExams}
        />
        <CustomApacModal
          isOpen={isCustomApacModalOpen}
          onClose={() => setIsCustomApacModalOpen(false)}
          patient={customApacPatient}
          onGenerate={handleGenerateAPAC}
        />
        <AihModal
          isOpen={isAihModalOpen}
          onClose={() => setIsAihModalOpen(false)}
          patient={aihPatient}
          onGenerate={handleGenerateAIH}
        />
        <RiskRequestModal
          isOpen={isRiskRequestModalOpen}
          onClose={() => setIsRiskRequestModalOpen(false)}
          patient={riskRequestPatient}
          onGenerate={handleGenerateRiskRequest}
        />
        <EditPatientModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          patient={editPatient}
          onSave={savePatientEdits}
          onDelete={handleDeletePatient}
        />
      </React.Suspense>

      {/* Discharge (Alta) Modal */}
      <DischargeModal
        isOpen={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        patient={dischargePatient}
      />

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl border border-black"
          >
            <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-serif font-bold text-black flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-[var(--color-mayo-blue)]" />
                Sobre o Sistema e Funcionalidades
              </h2>
              <button onClick={() => setIsHelpModalOpen(false)} className="text-neutral-500 hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6 text-neutral-800">
              <p className="text-sm leading-relaxed">
                O <strong>GQB OS (CirurgiaFlow)</strong> é um sistema avançado de automação hospitalar projetado para
                otimizar o fluxo de trabalho cirúrgico, reduzindo a burocracia e acelerando o atendimento ao paciente.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Camera className="w-5 h-5 text-[var(--color-mayo-blue)]" />, title: '1. Cadastro Inteligente (IA)', desc: 'Leia fotos de prontuários físicos com IA para extrair automaticamente dados do paciente.' },
                  { icon: <FileText className="w-5 h-5 text-[var(--color-mayo-blue)]" />, title: '2. Geração de Documentos (PDF)', desc: 'Geração automática de AIH, APAC, Pedidos de Risco, Avisos de Cirurgia e Documentos de Alta.' },
                  { icon: <Search className="w-5 h-5 text-[var(--color-mayo-blue)]" />, title: '3. Codificação Automática', desc: 'Sugestão automática de CID-10 e código SIGTAP baseada no diagnóstico e tipo de cirurgia.' },
                  { icon: <CheckCircle2 className="w-5 h-5 text-[var(--color-mayo-blue)]" />, title: '4. Gestão de Fluxo (Checklists)', desc: 'Controle visual de etapas pré-operatórias: WhatsApp Enviado, AIH Gerada, NIR, Vaga UTI, Agendado CC.' },
                  { icon: <MessageSquare className="w-5 h-5 text-[var(--color-mayo-blue)]" />, title: '5. Integração WhatsApp', desc: 'Geração de links com mensagens pré-formatadas para notificação de internação ao paciente.' },
                  { icon: <ClipboardList className="w-5 h-5 text-[var(--color-mayo-blue)]" />, title: '6. Filtros e Organização', desc: 'Categorização em abas dinâmicas (Agendadas, Prioritárias, Pendências, Faltosos, etc.) e busca em tempo real.' },
                  { icon: <Download className="w-5 h-5 text-[var(--color-mayo-blue)]" />, title: '7. Dados Locais (Offline First)', desc: 'Todos os dados são salvos localmente no navegador via IndexedDB. A aplicação funciona mesmo sem internet.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="bg-neutral-50 p-4 border border-black/10">
                    <h3 className="font-bold text-black flex items-center gap-2 mb-2">
                      {icon}
                      {title}
                    </h3>
                    <p className="text-sm text-neutral-600">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-black bg-neutral-50 flex justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && schedulePatient && (
        <React.Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Loader2 className="animate-spin text-white" />
            </div>
          }
        >
          <ScheduleModal
            patient={schedulePatient}
            onClose={() => setIsScheduleModalOpen(false)}
            onSave={saveScheduleData}
          />
        </React.Suspense>
      )}
    </div>
  );
}
