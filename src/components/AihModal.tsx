import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileOutput } from 'lucide-react';
import { Patient } from '../types';
import { cleanWords, cleanDate, cleanPhone, cleanSusCard } from '../dataCleaner';
import { findBestCID } from '../cid10';

interface AihModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onGenerate: (data: any) => void;
}

export function AihModal({ isOpen, onClose, patient, onGenerate }: AihModalProps) {
  const [sinaisSintomas, setSinaisSintomas] = useState('');
  const [condicoes, setCondicoes] = useState('');
  const [resultados, setResultados] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [surgeryType, setSurgeryType] = useState('');
  const [cidCode, setCidCode] = useState('');
  const [procedureCode, setProcedureCode] = useState('');

  useEffect(() => {
    if (isOpen && patient) {
      setDiagnosis(cleanWords(patient.diagnosis));
      setSurgeryType(cleanWords(patient.surgery_type));
      setProcedureCode(patient.procedure_code || '');
      
      let bestCid = patient.cid_code;
      if (!bestCid || bestCid === 'N/A') {
        const combinedText = `${patient.diagnosis || ""} ${patient.surgery_type || ""}`.trim();
        bestCid = findBestCID(combinedText);
      }
      setCidCode(bestCid);

      setSinaisSintomas(`PACIENTE ${patient.age || ''} ANOS COM DIAGNÓSTICO DE ${cleanWords(patient.diagnosis)} SOLICITO ${cleanWords(patient.surgery_type)}`);
      setCondicoes('AS ACIMA');
      setResultados('ANAMNESE + EXAME FÍSICO + EXAMES COMPLEMENTARES');
    }
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const handleGenerate = () => {
    onGenerate({
      patientName: cleanWords(patient.name),
      susCard: cleanSusCard(patient.sus_card),
      birthDate: cleanDate(patient.birth_date),
      phone: cleanPhone(patient.phone),
      procedureCode: procedureCode,
      surgeryType,
      sinaisSintomas,
      condicoes,
      resultados,
      diagnosis,
      cid: cidCode
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-xl font-bold text-black uppercase">Revisão Laudo AIH</h2>
              <p className="text-sm text-neutral-500 mt-1">Paciente: <span className="font-semibold text-black">{patient.name}</span></p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Diagnóstico Inicial (Box 39)
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  CID Principal (Box 40)
                </label>
                <input
                  type="text"
                  value={cidCode}
                  onChange={(e) => setCidCode(e.target.value)}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Procedimento Solicitado
                </label>
                <input
                  type="text"
                  value={surgeryType}
                  onChange={(e) => setSurgeryType(e.target.value)}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Código do Procedimento
                </label>
                <input
                  type="text"
                  value={procedureCode}
                  onChange={(e) => setProcedureCode(e.target.value)}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm uppercase"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Principais Sinais e Sintomas Clínicos (Box 36)
              </label>
              <textarea
                value={sinaisSintomas}
                onChange={(e) => setSinaisSintomas(e.target.value)}
                className="w-full h-24 p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black resize-none text-sm uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Condições que Justificam a Internação (Box 37)
              </label>
              <input
                value={condicoes}
                onChange={(e) => setCondicoes(e.target.value)}
                className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Principais Resultados de Provas Diagnósticas (Box 38)
              </label>
              <input
                value={resultados}
                onChange={(e) => setResultados(e.target.value)}
                className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm uppercase"
              />
            </div>
          </div>

          <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3 sticky bottom-0">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-black uppercase tracking-wider border border-black/20 hover:bg-neutral-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              <FileOutput className="w-4 h-4" />
              Baixar AIH
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
