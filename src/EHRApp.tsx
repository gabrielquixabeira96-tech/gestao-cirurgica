import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Patient } from './types';
import { Search, Plus, FileText, Activity, MessageSquare, Edit3, X, Save, RefreshCw, Wifi, WifiOff, TrendingUp, FileDown } from 'lucide-react';
import { getPatientsFromLocal } from './lib/db';
import ReactMarkdown from 'react-markdown';

const EvolutionModule = React.lazy(() => import('./components/EvolutionModule'));

export default function EHRApp() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Document State
  const [activeDocTab, setActiveDocTab] = useState<'ehr' | 'risk'>('ehr');
  const [ehrContent, setEhrContent] = useState('');
  const [riskContent, setRiskContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    fetchPatients();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchPatients = async () => {
    try {
      // Load from local DB first for speed
      const localPatients = await getPatientsFromLocal();
      if (localPatients.length > 0) {
        setPatients(localPatients);
        setLoading(false);
      }

      if (navigator.onLine) {
        const response = await fetch('/api/patients');
        if (response.ok) {
          const data = await response.json();
          setPatients(data);
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sus_card && p.sus_card.includes(searchTerm)) ||
      (p.diagnosis && p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [patients, searchTerm]);

  const handleGenerateEHR = async () => {
    if (!selectedPatient) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-ehr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: selectedPatient })
      });
      const data = await response.json();
      if (data.ehr) {
        setEhrContent(data.ehr);
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error generating EHR:", error);
      alert("Failed to generate EHR.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRisk = async () => {
    if (!selectedPatient) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-surgical-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: selectedPatient })
      });
      const data = await response.json();
      if (data.riskAssessment) {
        setRiskContent(data.riskAssessment);
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error generating Risk Assessment:", error);
      alert("Failed to generate Risk Assessment.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppShare = () => {
    const content = activeDocTab === 'ehr' ? ehrContent : riskContent;
    if (!content) {
      alert("Please generate a document first.");
      return;
    }
    const text = encodeURIComponent(`*Patient:* ${selectedPatient?.name}\n\n${content}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadPDF = async () => {
    if (!selectedPatient) return;
    const content = activeDocTab === 'ehr' ? ehrContent : riskContent;
    if (!content) {
      alert("Please generate a document first.");
      return;
    }
    const title = activeDocTab === 'ehr' ? 'EVOLUÇÃO CLÍNICA' : 'RISCO CIRÚRGICO';
    try {
      const { generateEvolutionPdf } = await import('./evolutionPdf');
      generateEvolutionPdf(selectedPatient, content, title);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">EHR & Risk Generator</h1>
              <p className="text-xs text-slate-500 font-medium">Clinical Documentation System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isOnline && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <WifiOff size={14} /> Offline Mode
              </span>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Switch to Surgical Manager"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex gap-6 h-[calc(100vh-4rem)]">
        {/* Left Panel: Patient List */}
        <div className="w-1/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold mb-4">Patients</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center p-8 text-slate-500 text-sm">No patients found.</div>
            ) : (
              <div className="space-y-1">
                {filteredPatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setEhrContent('');
                      setRiskContent('');
                      setIsEditing(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedPatient?.id === patient.id 
                        ? 'bg-blue-50 border border-blue-100 shadow-sm' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="font-medium text-slate-900">{patient.name}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-1">{patient.diagnosis}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Document Generator */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {selectedPatient ? (
            <>
              {/* Patient Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedPatient.name}</h2>
                    <div className="flex gap-4 mt-2 text-sm text-slate-600">
                      <span><strong className="font-medium text-slate-900">Age:</strong> {selectedPatient.age}</span>
                      <span><strong className="font-medium text-slate-900">SUS:</strong> {selectedPatient.sus_card}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowEvolutionModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                    >
                      <TrendingUp size={18} /> Nova Evolução
                    </button>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider h-fit">
                      {selectedPatient.category}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Diagnosis</div>
                    <div className="font-medium">{selectedPatient.diagnosis}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Surgery Type</div>
                    <div className="font-medium">{selectedPatient.surgery_type}</div>
                  </div>
                </div>
              </div>

              {/* Document Tabs */}
              <div className="flex border-b border-slate-200 px-6 pt-4 gap-6">
                <button
                  onClick={() => setActiveDocTab('ehr')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeDocTab === 'ehr' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2"><FileText size={16} /> Electronic Health Record</div>
                </button>
                <button
                  onClick={() => setActiveDocTab('risk')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeDocTab === 'risk' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2"><Activity size={16} /> Surgical Risk Assessment</div>
                </button>
              </div>

              {/* Document Content Area */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {activeDocTab === 'ehr' ? 'EHR Summary' : 'Risk Assessment'}
                  </h3>
                  <div className="flex gap-2">
                    {((activeDocTab === 'ehr' && ehrContent) || (activeDocTab === 'risk' && riskContent)) && (
                      <>
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          {isEditing ? <><Save size={16} /> Preview</> : <><Edit3 size={16} /> Edit</>}
                        </button>
                        <button
                          onClick={handleWhatsAppShare}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
                        >
                          <MessageSquare size={16} /> Share via WhatsApp
                        </button>
                        <button
                          onClick={handleDownloadPDF}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                        >
                          <FileDown size={16} /> Baixar PDF
                        </button>
                      </>
                    )}
                    <button
                      onClick={activeDocTab === 'ehr' ? handleGenerateEHR : handleGenerateRisk}
                      disabled={isGenerating || !isOnline}
                      className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors shadow-sm"
                    >
                      {isGenerating ? (
                        <><RefreshCw size={16} className="animate-spin" /> Generating...</>
                      ) : (
                        <><Plus size={16} /> Generate AI {activeDocTab === 'ehr' ? 'EHR' : 'Risk'}</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Display/Editor */}
                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                  {activeDocTab === 'ehr' ? (
                    ehrContent ? (
                      isEditing ? (
                        <textarea
                          value={ehrContent}
                          onChange={(e) => setEhrContent(e.target.value)}
                          className="flex-1 w-full p-4 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
                          placeholder="Edit EHR content here..."
                        />
                      ) : (
                        <div className="p-6 overflow-y-auto prose prose-sm max-w-none prose-slate">
                          <ReactMarkdown>{ehrContent}</ReactMarkdown>
                        </div>
                      )
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-3">
                        <FileText size={48} className="opacity-20" />
                        <p>Click "Generate AI EHR" to create a summary.</p>
                      </div>
                    )
                  ) : (
                    riskContent ? (
                      isEditing ? (
                        <textarea
                          value={riskContent}
                          onChange={(e) => setRiskContent(e.target.value)}
                          className="flex-1 w-full p-4 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
                          placeholder="Edit Risk Assessment here..."
                        />
                      ) : (
                        <div className="p-6 overflow-y-auto prose prose-sm max-w-none prose-slate">
                          <ReactMarkdown>{riskContent}</ReactMarkdown>
                        </div>
                      )
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-3">
                        <Activity size={48} className="opacity-20" />
                        <p>Click "Generate AI Risk" to create an assessment.</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Search size={24} className="text-slate-300" />
              </div>
              <p className="text-lg font-medium text-slate-500">Select a patient to view details</p>
            </div>
          )}
        </div>
      </main>

      {showEvolutionModal && selectedPatient && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
              <RefreshCw className="animate-spin text-blue-600" size={24} />
              <span className="font-medium text-slate-700">Carregando módulo...</span>
            </div>
          </div>
        }>
          <EvolutionModule 
            patient={selectedPatient}
            onClose={() => setShowEvolutionModal(false)}
            onSave={(content) => {
              setEhrContent(content);
              setActiveDocTab('ehr');
              setShowEvolutionModal(false);
              setIsEditing(true);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
