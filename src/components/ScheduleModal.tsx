import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, User, ClipboardList, Activity } from 'lucide-react';
import { Patient } from '../types';
import { motion } from 'motion/react';

interface ScheduleModalProps {
  patient: Patient;
  onClose: () => void;
  onSave: (id: number, data: Partial<Patient>) => void;
}

export function ScheduleModal({ patient, onClose, onSave }: ScheduleModalProps) {
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: patient.name || '',
    sus_card: patient.sus_card || '',
    age: patient.age || 0,
    doctor: patient.doctor || '',
    surgery_type: patient.surgery_type || '',
    procedure_code: patient.procedure_code || '',
    diagnosis: patient.diagnosis || '',
    cid_code: patient.cid_code || '',
    data_internacao: patient.data_internacao || '',
    data_cirurgia: patient.data_cirurgia || '',
    horario_cirurgia: patient.horario_cirurgia || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(patient.id, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-none-none shadow-2xl border border-black overflow-hidden"
      >
        <div className="bg-black text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-serif font-bold uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Completar Dados para Agendamento
          </h2>
          <button onClick={onClose} className="hover:text-neutral-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <p className="text-xs text-neutral-500 font-medium uppercase mb-4">
            Por favor, preencha as informações obrigatórias para gerar os documentos de agendamento.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Nome do Paciente</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black/20 focus:border-black outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Cartão SUS</label>
              <input
                type="text"
                name="sus_card"
                value={formData.sus_card}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black/20 focus:border-black outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Idade</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black/20 focus:border-black outline-none text-sm"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Médico Responsável</label>
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black/20 focus:border-black outline-none text-sm"
                required
              >
                <option value="">Selecione o médico</option>
                <option value="Dra. Bianca">Dra. Bianca</option>
                <option value="Dr. Rafael">Dr. Rafael</option>
                <option value="Dr. Manoel">Dr. Manoel</option>
                <option value="Dra. Mara">Dra. Mara</option>
                <option value="Dr. Gilmar">Dr. Gilmar</option>
                <option value="Dr. Rodolfo">Dr. Rodolfo</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Procedimento</label>
              <input
                type="text"
                name="surgery_type"
                value={formData.surgery_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black/20 focus:border-black outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Código do Procedimento</label>
              <input
                type="text"
                name="procedure_code"
                value={formData.procedure_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black/20 focus:border-black outline-none text-sm"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Diagnóstico</label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black/20 focus:border-black outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">CID</label>
              <input
                type="text"
                name="cid_code"
                value={formData.cid_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black/20 focus:border-black outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Data da Internação</label>
              <input
                type="date"
                name="data_internacao"
                value={formData.data_internacao}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black/20 focus:border-black outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Data da Cirurgia</label>
              <input
                type="date"
                name="data_cirurgia"
                value={formData.data_cirurgia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black/20 focus:border-black outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Horário da Cirurgia</label>
              <input
                type="time"
                name="horario_cirurgia"
                value={formData.horario_cirurgia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-black/20 focus:border-black outline-none text-sm"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Salvar e Gerar Documentos
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
