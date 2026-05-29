import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { Patient } from '../types';

interface RiskRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onGenerate: (patient: Patient, otherExams: string) => void;
}

export function RiskRequestModal({ isOpen, onClose, patient, onGenerate }: RiskRequestModalProps) {
  const [otherExams, setOtherExams] = useState('');

  useEffect(() => {
    if (isOpen) {
      setOtherExams('');
    }
  }, [isOpen]);

  if (!isOpen || !patient) return null;

  const handleGenerate = () => {
    onGenerate(patient, otherExams);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-none-none w-full max-w-md shadow-2xl border border-black flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-black flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Solicitar Risco Cirúrgico
          </h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-600">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <p className="text-sm font-bold text-black mb-1">Paciente:</p>
            <p className="text-sm text-neutral-600">{patient.name}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-bold text-black mb-2">Exames Padrão (já inclusos):</p>
            <ul className="list-disc list-inside text-xs text-neutral-600 space-y-1">
              <li>Hemograma Completo</li>
              <li>TAP</li>
              <li>TTPA</li>
              <li>Creatinina</li>
              <li>Ureia</li>
              <li>Glicemia de Jejum</li>
              <li>Sódio</li>
              <li>Potássio</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Outros Exames (Opcional)
            </label>
            <textarea
              value={otherExams}
              onChange={(e) => setOtherExams(e.target.value)}
              className="w-full px-3 py-2 border border-black rounded-none-none focus:outline-none focus:ring-1 focus:ring-black text-sm min-h-[100px]"
              placeholder="Digite outros exames, um por linha..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-black bg-neutral-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-neutral-600 hover:text-black transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-black text-white text-sm font-bold rounded-none-none hover:bg-neutral-800 transition-colors"
          >
            Gerar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
