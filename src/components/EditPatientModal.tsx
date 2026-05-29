import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2 } from 'lucide-react';
import { Patient } from '../types';
import { findBestCID } from '../cid10';
import { findBestProcedure } from '../procedures';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: (patientId: number, data: Partial<Patient>) => void;
  onDelete?: (patientId: number) => void;
}

export function EditPatientModal({ isOpen, onClose, patient, onSave, onDelete }: EditPatientModalProps) {
  const [formData, setFormData] = useState<Partial<Patient>>({});

  useEffect(() => {
    if (patient && isOpen) {
      const combinedText = `${patient.diagnosis || ""} ${patient.surgery_type || ""}`.trim();
      setFormData({
        name: patient.name,
        sus_card: patient.sus_card,
        diagnosis: patient.diagnosis,
        surgery_type: patient.surgery_type,
        risk_status: patient.risk_status,
        age: patient.age,
        birth_date: patient.birth_date,
        phone: patient.phone,
        cid_code: (patient.cid_code && patient.cid_code !== 'N/A') ? patient.cid_code : findBestCID(combinedText),
        procedure_code: patient.procedure_code || findBestProcedure(patient.surgery_type || '').code,
        category: patient.category,
        doctor: patient.doctor,
        whatsapp_sent: patient.whatsapp_sent,
        aih_generated: patient.aih_generated,
        aih_nir: patient.aih_nir,
        uti_vacancy: patient.uti_vacancy,
        scheduled_cc: patient.scheduled_cc,
        exam_pathology: patient.exam_pathology,
        exam_imaging: patient.exam_imaging,
        exam_others: patient.exam_others
      });
    }
  }, [patient, isOpen]);

  if (!isOpen || !patient) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    
    setFormData(prev => {
      const newValue = type === 'checkbox' ? ((e.target as HTMLInputElement).checked ? 1 : 0) : value;
      const newData = { ...prev, [name]: newValue };
      
      // Auto-update CID when diagnosis changes
      if (name === 'diagnosis') {
        const combinedText = `${value} ${newData.surgery_type || ''}`;
        const bestCid = findBestCID(combinedText);
        if (bestCid) {
          newData.cid_code = bestCid;
        }
      }
      
      // Auto-update CID and Procedure when surgery_type changes
      if (name === 'surgery_type') {
        const combinedText = `${newData.diagnosis || ''} ${value}`;
        const bestCid = findBestCID(combinedText);
        if (bestCid) {
          newData.cid_code = bestCid;
        }
        
        const bestProcedure = findBestProcedure(value);
        if (bestProcedure && bestProcedure.code) {
          newData.procedure_code = bestProcedure.code;
        }
      }
      
      return newData;
    });
  };

  const handleSave = () => {
    onSave(patient.id, formData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-3xl flex flex-col shadow-2xl max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div>
              <h2 className="text-xl font-bold text-black">Editar Paciente</h2>
              <p className="text-sm text-neutral-500 mt-1">Atualize os dados de <span className="font-semibold text-black">{patient.name}</span></p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Cartão SUS</label>
                <input
                  type="text"
                  name="sus_card"
                  value={formData.sus_card || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Data de Nascimento</label>
                <input
                  type="text"
                  name="birth_date"
                  value={formData.birth_date || ''}
                  onChange={handleChange}
                  placeholder="DD/MM/AAAA"
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Idade</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Telefone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Médico</label>
                <input
                  type="text"
                  name="doctor"
                  value={formData.doctor || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Diagnóstico</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Tipo de Cirurgia</label>
                <input
                  type="text"
                  name="surgery_type"
                  value={formData.surgery_type || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                />
                {formData.surgery_type && findBestProcedure(formData.surgery_type).code && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Procedimento detectado: <span className="font-bold">{findBestProcedure(formData.surgery_type).code}</span> - {findBestProcedure(formData.surgery_type).description}
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        surgery_type: findBestProcedure(formData.surgery_type || '').description,
                        procedure_code: findBestProcedure(formData.surgery_type || '').code
                      }))}
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      (Aplicar descrição)
                    </button>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Código do Procedimento</label>
                <input
                  type="text"
                  name="procedure_code"
                  value={formData.procedure_code || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">CID-10</label>
                <input
                  type="text"
                  name="cid_code"
                  value={formData.cid_code || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Status de Risco</label>
                <input
                  type="text"
                  name="risk_status"
                  value={formData.risk_status || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Categoria</label>
                <select
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm"
                >
                  <option value="AGENDADA">Cirurgias Agendadas</option>
                  <option value="PRIORITARIA">Cirurgias Prioritárias</option>
                  <option value="PENDENCIA">Pacientes com Pendências</option>
                  <option value="PELE_NAO_MELANOMA">Pele Não Melanoma</option>
                  <option value="FALTOSO">Faltosos</option>
                  <option value="NEGOU_NAO_ATENDE">Negou / Não Atende</option>
                  <option value="PRONTO">Pacientes Prontos</option>
                </select>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-whatsapp"
                    name="whatsapp_sent"
                    checked={formData.whatsapp_sent === 1}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label htmlFor="edit-whatsapp" className="text-xs font-bold text-black uppercase tracking-wider">WhatsApp Enviado</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-aih-gen"
                    name="aih_generated"
                    checked={formData.aih_generated === 1}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label htmlFor="edit-aih-gen" className="text-xs font-bold text-black uppercase tracking-wider">AIH Gerada</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-aih-nir"
                    name="aih_nir"
                    checked={formData.aih_nir === 1}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label htmlFor="edit-aih-nir" className="text-xs font-bold text-black uppercase tracking-wider">AIH no NIR</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-uti"
                    name="uti_vacancy"
                    checked={formData.uti_vacancy === 1}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label htmlFor="edit-uti" className="text-xs font-bold text-black uppercase tracking-wider">Vaga UTI</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-cc"
                    name="scheduled_cc"
                    checked={formData.scheduled_cc === 1}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label htmlFor="edit-cc" className="text-xs font-bold text-black uppercase tracking-wider">Agendado CC</label>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2 pt-4 border-t border-neutral-100">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Exames de Patologia</label>
                <textarea
                  name="exam_pathology"
                  value={formData.exam_pathology || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm h-20"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Exames de Imagem</label>
                <textarea
                  name="exam_imaging"
                  value={formData.exam_imaging || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm h-20"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">Outros Exames</label>
                <textarea
                  name="exam_others"
                  value={formData.exam_others || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black text-sm h-20"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex justify-between gap-3">
            <div>
              {onDelete && (
                <button
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
                      onDelete(patient.id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-red-600 uppercase tracking-wider border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-bold text-black uppercase tracking-wider border border-black/20 hover:bg-neutral-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
