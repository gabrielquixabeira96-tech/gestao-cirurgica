import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Loader2 } from 'lucide-react';
import { Patient } from '../types';
import { cn } from '../lib/utils';

interface ExamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: (patientId: number, exams: { exam_pathology: string; exam_imaging: string; exam_others: string }) => Promise<void>;
}

export function ExamsModal({ isOpen, onClose, patient, onSave }: ExamsModalProps) {
  const [pathology, setPathology] = useState('');
  const [imaging, setImaging] = useState('');
  const [others, setOthers] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (patient && isOpen) {
      setPathology(patient.exam_pathology || '');
      setImaging(patient.exam_imaging || '');
      setOthers(patient.exam_others || '');
    }
  }, [patient, isOpen]);

  if (!isOpen || !patient) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(patient.id, {
        exam_pathology: pathology,
        exam_imaging: imaging,
        exam_others: others,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar exames:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div>
              <h2 className="text-xl font-bold text-black">Exames e Resultados</h2>
              <p className="text-sm text-neutral-500 mt-1">Paciente: <span className="font-semibold text-black">{patient.name}</span></p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black uppercase tracking-wider">
                Anátomo Patológico
              </label>
              <textarea
                value={pathology}
                onChange={(e) => setPathology(e.target.value)}
                placeholder="Cole aqui o resultado do exame anátomo patológico..."
                className="w-full h-40 p-4 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black resize-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-black uppercase tracking-wider">
                Exames de Imagem
              </label>
              <textarea
                value={imaging}
                onChange={(e) => setImaging(e.target.value)}
                placeholder="Cole aqui os laudos de exames de imagem (TC, RM, USG, etc)..."
                className="w-full h-40 p-4 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black resize-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-black uppercase tracking-wider">
                Outros Exames
              </label>
              <textarea
                value={others}
                onChange={(e) => setOthers(e.target.value)}
                placeholder="Cole aqui outros resultados relevantes (Laboratoriais, etc)..."
                className="w-full h-40 p-4 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black resize-none text-sm"
              />
            </div>
          </div>

          <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-black uppercase tracking-wider border border-black/20 hover:bg-neutral-100 transition-colors"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
