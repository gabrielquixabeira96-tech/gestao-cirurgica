import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut, Download, FileText, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Patient } from '../types';
import { getDischargeText } from '../discharge';
import { generateDischargePDF } from '../services/dischargeGenerator';
import { cn } from '../lib/utils';

interface DischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({ isOpen, onClose, patient }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  if (!patient) return null;

  const sections = getDischargeText(patient.doctor ?? '');
  const today = new Date().toLocaleDateString('pt-BR');

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionTitle]: !prev[sectionTitle] }));
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      generateDischargePDF(patient);
    } catch (err) {
      console.error('Erro ao gerar PDF de alta:', err);
      alert('Erro ao gerar o documento de alta.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsApp = () => {
    const phone = patient.phone?.replace(/\D/g, '');
    if (!phone) {
      alert('Paciente sem telefone cadastrado.');
      return;
    }
    const firstName = patient.name.split(' ')[0];
    const isFemale = /[aeiAEI]$/.test(firstName);
    const pronoun = isFemale ? 'a Sra.' : 'o Sr.';
    const msg =
      `Olá! Aqui é da equipe${patient.doctor ? ` do ${patient.doctor}` : ''} do GQB. ` +
      `${pronoun} ${firstName} recebeu alta hoje (${today}). ` +
      `Enviamos as orientações de cuidados pós-operatórios. Em caso de dúvidas ou urgência, ` +
      `procure o Pronto-Socorro. Bom restabelecimento! 🏥`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-none shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-black"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-black flex justify-between items-center bg-[#004b87] text-white shrink-0">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <div>
                  <h3 className="text-base font-bold">Alta do Paciente</h3>
                  <p className="text-xs text-blue-200">{patient.name} — {today}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Patient summary */}
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 shrink-0">
              <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
                {patient.surgery_type && (
                  <span><span className="font-bold text-black">Cirurgia:</span> {patient.surgery_type}</span>
                )}
                {patient.diagnosis && (
                  <span><span className="font-bold text-black">Diagnóstico:</span> {patient.diagnosis}</span>
                )}
                {patient.doctor && (
                  <span><span className="font-bold text-black">Médico:</span> {patient.doctor}</span>
                )}
              </div>
            </div>

            {/* Discharge sections */}
            <div className="overflow-y-auto flex-1 p-6 space-y-3">
              {/* Warning banner */}
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Em caso de <strong>febre acima de 37,8°C, sangramento, inchaço súbito ou dificuldade respiratória</strong>,
                  procure o Pronto-Socorro imediatamente.
                </p>
              </div>

              {sections.map((section, idx) => {
                const isExpanded = expandedSections[section.section] !== false; // default open
                const isAlert = section.section.toLowerCase().includes('alerta');
                return (
                  <div
                    key={section.section}
                    className={cn(
                      'border rounded-none overflow-hidden',
                      isAlert ? 'border-red-200' : 'border-neutral-200'
                    )}
                  >
                    <button
                      onClick={() => toggleSection(section.section)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
                        isAlert
                          ? 'bg-red-50 text-red-800 hover:bg-red-100'
                          : 'bg-neutral-50 text-black hover:bg-neutral-100'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0',
                          isAlert ? 'bg-red-500' : 'bg-[#004b87]'
                        )}>
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold">{section.section}</span>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-neutral-400" />
                        : <ChevronDown className="w-4 h-4 text-neutral-400" />
                      }
                    </button>
                    {isExpanded && (
                      <div className="px-4 py-3 space-y-3 bg-white">
                        {section.items.map((item, i) => (
                          <div key={i} className="text-sm">
                            {item.title ? (
                              <>
                                <p className="font-semibold text-black mb-0.5">• {item.title}</p>
                                <p className="text-neutral-600 pl-4 leading-relaxed">{item.text}</p>
                              </>
                            ) : (
                              <p className="text-neutral-600 leading-relaxed">{item.text}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-black flex justify-between items-center gap-3 shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-black transition-colors"
              >
                Fechar
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-none transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Notificar WhatsApp
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-[#004b87] hover:bg-[#003d6f] text-white text-sm font-bold rounded-none transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isGenerating ? 'Gerando...' : 'Baixar PDF de Alta'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
