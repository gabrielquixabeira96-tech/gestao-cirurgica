import React, { useState } from 'react';
import { Patient } from '../types';
import { X, Plus, Trash2, Save, RefreshCw, ClipboardList, TrendingUp, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface Exam {
  id: string;
  type: string;
  date: string;
  conclusion: string;
}

interface EvolutionModuleProps {
  patient: Patient;
  onClose: () => void;
  onSave: (content: string) => void;
}

export default function EvolutionModule({ patient, onClose, onSave }: EvolutionModuleProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  
  // Form State
  const [estadoGeral, setEstadoGeral] = useState('Bom');
  const [queixaPrincipal, setQueixaPrincipal] = useState('');
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [evolucaoSintomas, setEvolucaoSintomas] = useState('Estável');
  const [efPalpacao, setEfPalpacao] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [impressaoClinica, setImpressaoClinica] = useState('');
  const [novosPedidos, setNovosPedidos] = useState('');

  const handleSintomaToggle = (sintoma: string) => {
    setSintomas(prev => 
      prev.includes(sintoma) ? prev.filter(s => s !== sintoma) : [...prev, sintoma]
    );
  };

  const addExam = () => {
    const newExam: Exam = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'VLC',
      date: new Date().toISOString().split('T')[0],
      conclusion: ''
    };
    setExams([...exams, newExam]);
  };

  const removeExam = (id: string) => {
    setExams(exams.filter(e => e.id !== id));
  };

  const updateExam = (id: string, field: keyof Exam, value: string) => {
    setExams(exams.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const generateEvolution = async () => {
    setIsGenerating(true);
    try {
      const prompt = `
        Você é um assistente médico especializado.
        Sua tarefa é gerar uma evolução clínica estruturada baseada nos dados fornecidos.
        
        DADOS DO PACIENTE:
        Nome: ${patient.name}
        DN: ${patient.birth_date || 'Não informada'}
        Idade: ${patient.age || 'Não informada'}
        Diagnósticos de Base: ${patient.diagnosis || 'Não informado'}
        
        DADOS DA CONSULTA ATUAL:
        Estado Geral: ${estadoGeral}
        Queixa Principal: ${queixaPrincipal}
        Sintomas: ${sintomas.join(', ') || 'Nenhum relatado'}
        Evolução dos Sintomas: ${evolucaoSintomas}
        Exame Físico (Palpação): ${efPalpacao}
        Exames Complementares: ${JSON.stringify(exams)}
        Impressão Clínica: ${impressaoClinica}
        Novos Pedidos: ${novosPedidos}
        Data Atual: ${new Date().toLocaleDateString('pt-BR')}

        INSTRUÇÃO DE FORMATAÇÃO:
        Gere o texto formatado EXATAMENTE no padrão abaixo, utilizando Markdown para os cabeçalhos:

        NOME: ${patient.name}
        DATA: ${new Date().toLocaleDateString('pt-BR')}
        DN: ${patient.birth_date || 'Não informada'}
        IDADE: ${patient.age || 'Não informada'}

        [Histórico de Base Merged]
        ${patient.diagnosis || 'Sem diagnósticos prévios'}

        PACIENTE RETORNA EM ${estadoGeral}, COM QUEIXA DE ${queixaPrincipal}. Relata ${sintomas.join(', ') || 'ausência de sintomas específicos'} com evolução ${evolucaoSintomas}.

        #EF:
        ${efPalpacao}

        ${exams.map(e => `#${e.type}: ${new Date(e.date).toLocaleDateString('pt-BR')}\n${e.conclusion}`).join('\n\n')}

        #CD:
        ${impressaoClinica}

        SOLICITO ${novosPedidos}
      `;

      const response = await fetch('/api/generate-evolution-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Falha na API');
      }

      const { text } = await response.json();
      setGeneratedText(text || '');
    } catch (error) {
      console.error("Error generating evolution:", error);
      
      // Fallback manual formatting in case API fails
      const fallbackText = `NOME: ${patient.name}
DATA: ${new Date().toLocaleDateString('pt-BR')}
DN: ${patient.birth_date || 'Não informada'}
IDADE: ${patient.age || 'Não informada'}

[Histórico de Base Merged]
${patient.diagnosis || 'Sem diagnósticos prévios'}

PACIENTE RETORNA EM ${estadoGeral}, COM QUEIXA DE ${queixaPrincipal}. Relata ${sintomas.join(', ') || 'ausência de sintomas específicos'} com evolução ${evolucaoSintomas}.

#EF:
${efPalpacao}

${exams.map(e => `#${e.type}: ${new Date(e.date).toLocaleDateString('pt-BR')}\n${e.conclusion}`).join('\n\n')}

#CD:
${impressaoClinica}

SOLICITO ${novosPedidos}`;
      
      setGeneratedText(fallbackText);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const { generateEvolutionPdf } = await import('../evolutionPdf');
      generateEvolutionPdf(patient, generatedText, 'EVOLUÇÃO CLÍNICA');
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Erro ao gerar o PDF.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Registro de Evolução Clínica</h2>
              <p className="text-xs text-slate-500 font-medium">Paciente: {patient.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {generatedText ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Evolução Gerada</h3>
                <button 
                  onClick={() => setGeneratedText('')}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Voltar para edição
                </button>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 prose prose-sm max-w-none prose-slate">
                <ReactMarkdown>{generatedText}</ReactMarkdown>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm"
                >
                  <FileDown size={18} /> Baixar PDF
                </button>
                <button 
                  onClick={() => onSave(generatedText)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Save size={18} /> Salvar no Prontuário
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Seção S (Subjetivo) */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Seção S (Subjetivo) - Quadro Atual</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Estado Geral</label>
                  <select 
                    value={estadoGeral}
                    onChange={(e) => setEstadoGeral(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option>Bom</option>
                    <option>Regular</option>
                    <option>Ruim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Queixa Principal</label>
                  <textarea 
                    value={queixaPrincipal}
                    onChange={(e) => setQueixaPrincipal(e.target.value)}
                    placeholder="Descreva a queixa principal..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Checklist de Sintomas</label>
                  <div className="flex flex-wrap gap-2">
                    {['Disfonia', 'Disfagia', 'Perda de Peso', 'Dispneia', 'Dor'].map(sintoma => (
                      <button
                        key={sintoma}
                        onClick={() => handleSintomaToggle(sintoma)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          sintomas.includes(sintoma)
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        {sintoma}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Evolução dos Sintomas</label>
                  <select 
                    value={evolucaoSintomas}
                    onChange={(e) => setEvolucaoSintomas(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option>Estável</option>
                    <option>Melhora</option>
                    <option>Piora</option>
                    <option>Nova Queixa</option>
                  </select>
                </div>
              </div>

              {/* Seção O (Objetivo) */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Seção O (Objetivo) - Exame Físico</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Exame Físico (Palpação)</label>
                  <textarea 
                    value={efPalpacao}
                    onChange={(e) => setEfPalpacao(e.target.value)}
                    placeholder="Foco em cabeça e pescoço..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px]"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Repetidor de Exames</label>
                    <button 
                      onClick={addExam}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <Plus size={14} /> Adicionar Exame
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {exams.map((exam) => (
                      <motion.div 
                        key={exam.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                      >
                        <div className="flex gap-2">
                          <select 
                            value={exam.type}
                            onChange={(e) => updateExam(exam.id, 'type', e.target.value)}
                            className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          >
                            <option>VLC</option>
                            <option>RNM Pescoço</option>
                            <option>TC Pescoço</option>
                            <option>AP/Biópsia</option>
                          </select>
                          <input 
                            type="date"
                            value={exam.date}
                            onChange={(e) => updateExam(exam.id, 'date', e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <button 
                            onClick={() => removeExam(exam.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <textarea 
                          value={exam.conclusion}
                          onChange={(e) => updateExam(exam.id, 'conclusion', e.target.value)}
                          placeholder="Conclusão do exame..."
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs min-h-[60px]"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {exams.length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-xs">
                      Nenhum exame adicionado.
                    </div>
                  )}
                </div>
              </div>

              {/* Seção A/P (Avaliação e Conduta) */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Seção A/P (Avaliação e Conduta)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Impressão Clínica</label>
                    <textarea 
                      value={impressaoClinica}
                      onChange={(e) => setImpressaoClinica(e.target.value)}
                      placeholder="Resumo do médico..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Novos Pedidos</label>
                    <textarea 
                      value={novosPedidos}
                      onChange={(e) => setNovosPedidos(e.target.value)}
                      placeholder="Exames solicitados..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!generatedText && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={generateEvolution}
              disabled={isGenerating}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-md shadow-blue-200"
            >
              {isGenerating ? (
                <><RefreshCw size={18} className="animate-spin" /> Gerando...</>
              ) : (
                <><TrendingUp size={18} /> Gerar Evolução Narrativa</>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
