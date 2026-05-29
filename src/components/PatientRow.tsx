import React, { memo } from 'react';
import { motion } from 'motion/react';
import { FileText, MessageCircle, FileOutput, Loader2, ClipboardList, Pencil, Calendar, Activity, Bell, LogOut } from 'lucide-react';
import { Patient } from '../types';
import { StatusCheckbox } from './StatusCheckbox';
import { cn } from '../lib/utils';

interface PatientRowProps {
  patient: Patient;
  toggleStatus: (id: number, field: string, currentValue: number) => void;
  openWhatsAppModal: (patient: Patient) => void;
  isGeneratingPDF: boolean;
  openAihModal: (patient: Patient) => void;
  openRiskRequestModal: (patient: Patient) => void;
  setSurgeryNoticePatient: (patient: Patient | null) => void;
  setSurgeryNoticeDate: (date: string) => void;
  setSurgeryNoticeTime: (time: string) => void;
  setIsSurgeryNoticeModalOpen: (isOpen: boolean) => void;
  openExamsModal: (patient: Patient) => void;
  openCustomApacModal: (patient: Patient) => void;
  openEditModal: (patient: Patient) => void;
  openDischargeModal: (patient: Patient) => void;
  scheduleSurgery: (patient: Patient) => void;
  findBestCID: (searchTerm: string) => string;
  findBestProcedure: (searchTerm: string) => { description: string; code: string };
}

export const PatientRow = memo(function PatientRow({
  patient,
  toggleStatus,
  openWhatsAppModal,
  isGeneratingPDF,
  openAihModal,
  openRiskRequestModal,
  setSurgeryNoticePatient,
  setSurgeryNoticeDate,
  setSurgeryNoticeTime,
  setIsSurgeryNoticeModalOpen,
  openExamsModal,
  openCustomApacModal,
  openEditModal,
  openDischargeModal,
  scheduleSurgery,
  findBestCID,
  findBestProcedure
}: PatientRowProps) {
  return (
    <>
      <motion.tr 
        id={`patient-card-${patient.id}`}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="hover:bg-neutral-50/50 transition-colors"
      >
        <td className="px-8 py-8 align-top">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-black">{patient.name}</span>
              <button
                onClick={() => openEditModal(patient)}
                className="p-1 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
                title="Editar Paciente"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {patient.doctor && (
                <span className="px-1.5 py-0.5 bg-white text-black rounded-none text-[9px] font-bold uppercase tracking-wider border border-black/20">
                  {patient.doctor}
                </span>
              )}
            </div>
            {/* SUS + Nascimento + Idade */}
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <span>SUS: {patient.sus_card}</span>
              {patient.birth_date && (
                <>
                  <span className="text-neutral-300">•</span>
                  <span>Nasc: {patient.birth_date}</span>
                </>
              )}
              {(patient.age ?? 0) > 0 && (
                <>
                  <span className="text-neutral-300">•</span>
                  <span>{patient.age} anos</span>
                </>
              )}
            </div>
            {/* Diagnóstico + CID */}
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <span className="font-bold uppercase tracking-widest text-[10px]">Diag:</span>
              <span className="font-medium text-black">
                {patient.diagnosis}
                <span className="ml-1 text-neutral-500 font-normal">(CID: {patient.cid_code && patient.cid_code !== 'N/A' ? patient.cid_code : findBestCID(`${patient.diagnosis || ''} ${patient.surgery_type || ''}`.trim())})</span>
              </span>
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-none text-[10px] font-bold uppercase">
                {patient.surgery_type}
                {(patient.procedure_code || findBestProcedure(patient.surgery_type ?? '').code) && (
                  <span className="ml-1 text-neutral-500 font-normal">
                    (Cód: {patient.procedure_code || findBestProcedure(patient.surgery_type ?? '').code})
                  </span>
                )}
              </span>
              {/* Risk badge — safe against undefined */}
              <span className={cn(
                'px-2 py-0.5 rounded-none text-[10px] font-bold uppercase',
                (patient.risk_status ?? '').includes('III') ||
                (patient.risk_status ?? '').includes('Não') ||
                (patient.risk_status ?? '').includes('Negou')
                  ? 'bg-red-50 text-red-600'
                  : 'bg-white text-black'
              )}>
                {patient.risk_status ?? 'Aguardando'}
              </span>
            </div>
          </div>
        </td>
        <td className="px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <StatusCheckbox 
              label="WhatsApp Enviado" 
              checked={patient.whatsapp_sent === 1} 
              onClick={() => toggleStatus(patient.id, 'whatsapp_sent', patient.whatsapp_sent)}
            />
            <StatusCheckbox 
              label="AIH Gerada" 
              checked={patient.aih_generated === 1} 
              onClick={() => toggleStatus(patient.id, 'aih_generated', patient.aih_generated)}
            />
            <StatusCheckbox 
              label="AIH no NIR" 
              checked={patient.aih_nir === 1} 
              onClick={() => toggleStatus(patient.id, 'aih_nir', patient.aih_nir)}
            />
            <StatusCheckbox 
              label="Vaga UTI" 
              checked={patient.uti_vacancy === 1} 
              onClick={() => toggleStatus(patient.id, 'uti_vacancy', patient.uti_vacancy)}
            />
            <StatusCheckbox 
              label="Agendado CC" 
              checked={patient.scheduled_cc === 1} 
              onClick={() => toggleStatus(patient.id, 'scheduled_cc', patient.scheduled_cc)}
            />
          </div>
        </td>
        <td className="px-8 py-8 align-top">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Ferramentas</div>
            <button 
              onClick={() => scheduleSurgery(patient)}
              disabled={isGeneratingPDF}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-black text-white hover:bg-neutral-800 rounded-none text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-black mb-2"
              title="Agendar Cirurgia (Gera AIH, Aviso, TCLE e Notifica WhatsApp)"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  Agendando...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Agendar Cirurgia
                </>
              )}
            </button>

            {/* Grid compacto de ícones quadrados (caixas) para otimizar espaço vertical */}
            <div className="grid grid-cols-3 gap-1 mb-2">
              <button 
                onClick={() => openWhatsAppModal(patient)}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center p-2 bg-white text-black hover:bg-neutral-100 border border-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="WhatsApp (Orientações)"
              >
                {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              </button>
              
              <button 
                onClick={() => openAihModal(patient)}
                className="flex items-center justify-center p-2 bg-white text-black hover:bg-neutral-100 border border-neutral-200 transition-colors"
                title="Gerar PDF da AIH"
              >
                <FileText className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => openRiskRequestModal(patient)}
                className="flex items-center justify-center p-2 bg-white text-black hover:bg-neutral-100 border border-neutral-200 transition-colors"
                title="Solicitar exames de risco cirúrgico"
              >
                <Activity className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => {
                  setSurgeryNoticePatient(patient);
                  setSurgeryNoticeDate('');
                  setSurgeryNoticeTime('');
                  setIsSurgeryNoticeModalOpen(true);
                }}
                className="flex items-center justify-center p-2 bg-white text-black hover:bg-neutral-100 border border-neutral-200 transition-colors"
                title="Gerar aviso de cirurgia"
              >
                <Bell className="w-4 h-4" />
              </button>

              <button 
                onClick={() => openExamsModal(patient)}
                className="flex items-center justify-center p-2 bg-white text-black hover:bg-neutral-100 border border-neutral-200 transition-colors"
                title="Exames e Resultados"
              >
                <ClipboardList className="w-4 h-4" />
              </button>

              <button 
                onClick={() => openCustomApacModal(patient)}
                className="flex items-center justify-center p-2 bg-white text-black hover:bg-neutral-100 border border-neutral-200 transition-colors"
                title="Gerar APAC Personalizada"
              >
                <FileOutput className="w-4 h-4" />
              </button>

              <button
                onClick={() => openDischargeModal(patient)}
                className="flex items-center justify-center p-2 bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                title="Alta do Paciente — Gerar orientações de alta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </td>
      </motion.tr>
    </>
  );
});
