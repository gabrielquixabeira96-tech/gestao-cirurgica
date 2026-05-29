import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, Square, Circle, Loader2, Save } from 'lucide-react';
import { Patient } from '../types';

interface EvolutionEditorProps {
  patient: Patient;
  onSave: (id: number, text: string) => void;
}

export function EvolutionEditor({ patient, onSave }: EvolutionEditorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isGeneratingEvolution, setIsGeneratingEvolution] = useState(false);
  const [evolutionText, setEvolutionText] = useState(patient.evolution || '');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        processAudio(chunks);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const processAudio = async (chunks: Blob[]) => {
    setIsGeneratingEvolution(true);
    try {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          if (reader.result) {
            resolve((reader.result as string).split(',')[1]);
          } else {
            reject(new Error("Falha ao ler o áudio"));
          }
        };
        reader.onerror = () => reject(new Error("Erro ao ler o arquivo de áudio"));
      });

      const context = `
Nome: ${patient.name}
Idade: ${patient.age}
Diagnóstico: ${patient.diagnosis}
Cirurgia: ${patient.surgery_type}
      `;

      const response = await fetch('/api/generate-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Audio,
          mimeType: 'audio/webm',
          patientContext: context,
          template: 'Evolução SOAP (Subjetivo, Objetivo, Avaliação, Plano)'
        })
      });

      if (!response.ok) {
        throw new Error('Erro na resposta da API');
      }

      const data = await response.json();
      if (data.evolution) {
        setEvolutionText(data.evolution);
      } else {
        throw new Error('Evolução não retornada pela API');
      }
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      alert('Ocorreu um erro ao gerar a evolução. Por favor, tente novamente.');
    } finally {
      setIsGeneratingEvolution(false);
    }
  };

  const handleSave = () => {
    onSave(patient.id, evolutionText);
  };

  return (
    <motion.tr
      key={`evolution-${patient.id}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-neutral-50 border-b border-black/10"
    >
      <td colSpan={3} className="px-8 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Gravador de Evolução IA
            </h4>
            <div className="flex items-center gap-2">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
                >
                  <Square className="w-3.5 h-3.5" fill="currentColor" />
                  Parar Gravação
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isGeneratingEvolution}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Iniciar Gravação
                </button>
              )}
            </div>
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-3 text-red-600 font-medium text-sm animate-pulse">
              <Circle className="w-3 h-3 fill-current" />
              Gravando áudio da consulta...
            </div>
          )}

          {isGeneratingEvolution && (
            <div className="flex items-center gap-3 text-neutral-600 font-medium text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando áudio e gerando evolução (isso pode levar alguns segundos)...
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Texto da Evolução
            </label>
            <textarea
              value={evolutionText}
              onChange={(e) => setEvolutionText(e.target.value)}
              placeholder="A evolução gerada pela IA aparecerá aqui. Você pode editá-la antes de salvar."
              className="w-full h-48 p-4 border border-black/20 bg-white text-sm focus:outline-none focus:border-black resize-y font-serif"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!evolutionText.trim() || isGeneratingEvolution}
              className="flex items-center gap-2 px-6 py-2 bg-green-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-green-800 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Evolução
            </button>
          </div>
        </div>
      </td>
    </motion.tr>
  );
}
