
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Send, 
  Cpu, 
  History, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Lightbulb,
  Copy,
  ChevronRight,
  Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeContext } from './services/geminiService';
import { AnalysisResult, HistoryItem } from './types';

const App: React.FC = () => {
  const [contextInput, setContextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!contextInput.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeContext(contextInput);
      setResult(analysis);
      
      const newItem: HistoryItem = {
        ...analysis,
        id: Math.random().toString(36).substring(7),
        context: contextInput,
        timestamp: new Date()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
      setContextInput('');
    } catch (err: any) {
      setError(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setResult({
      reasoning: item.reasoning,
      deliverableType: item.deliverableType,
      generatedContent: item.generatedContent,
      justification: item.justification
    });
    setContextInput(item.context);
    resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                DevMind
              </h1>
              <p className="text-xs text-slate-500 font-medium">AI Software Engineering Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={clearHistory}
              className="text-slate-500 hover:text-red-400 transition-colors"
              title="Effacer l'historique"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input and History */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Input Section */}
          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="text-indigo-400 w-5 h-5" />
              <h2 className="font-semibold text-lg">Contexte</h2>
            </div>
            <textarea
              className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-600"
              placeholder="Ex: Un bug critique a été corrigé sur la validation du mot de passe juste avant un déploiement..."
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !contextInput.trim()}
              className={`mt-4 w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg ${
                loading || !contextInput.trim() 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:scale-[1.01]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Générer le livrable
                </>
              )}
            </button>
            {error && (
              <p className="mt-3 text-red-400 text-sm flex items-center gap-1">
                <Info className="w-4 h-4" /> {error}
              </p>
            )}
          </section>

          {/* History Section */}
          <section className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30 flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <History className="text-slate-400 w-5 h-5" />
              <h2 className="font-semibold text-lg">Dernières analyses</h2>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[400px]">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 py-10">
                  <p className="text-sm">Aucun historique disponible</p>
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-left p-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-700/50 rounded-xl transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                        {item.deliverableType}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 italic font-light">"{item.context}"</p>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7" ref={resultRef}>
          {!result && !loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-800/10 rounded-3xl border border-dashed border-slate-700/50">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-slate-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-slate-400 mb-2">Prêt à analyser</h3>
              <p className="text-slate-500 max-w-sm">
                Saisissez un contexte technique ou organisationnel pour que l'agent génère le meilleur livrable.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500/10 rounded-full border-t-indigo-500 animate-spin" />
                <Cpu className="absolute inset-0 m-auto text-indigo-400 w-8 h-8 animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-medium text-slate-200">Intelligence en cours d'exécution...</h3>
                <p className="text-slate-500 animate-pulse mt-2">Évaluation des intentions et choix du format optimal.</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Deliverable Section */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Livrable Généré</span>
                      <h3 className="font-bold text-white text-lg">{result.deliverableType}</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(result.generatedContent)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium border border-slate-700 transition-all active:scale-95"
                  >
                    {copied ? (
                      <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copié !</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copier</>
                    )}
                  </button>
                </div>
                <div className="p-6 bg-[#0d1117]">
                  <div className="prose-custom max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {result.generatedContent}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Reasoning Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                   <div className="flex items-center gap-2 mb-4">
                    <Terminal className="text-slate-400 w-4 h-4" />
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Raisonnement</h4>
                  </div>
                  <ul className="space-y-3">
                    {result.reasoning.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-300">
                        <span className="text-indigo-400 font-mono text-xs mt-0.5">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="text-amber-400 w-4 h-4" />
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Justification</h4>
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    {result.justification}
                  </p>
                </div>
              </div>

              {/* Suggestions/Tips */}
              <div className="flex items-center gap-4 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Info className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-xs text-slate-400">
                  <strong className="text-indigo-300">Astuce :</strong> Vous pouvez demander des modifications en précisant le contexte, par exemple en ajoutant "Destiné à un client non-technique".
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800 py-8 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Cpu className="w-4 h-4" />
            <span className="text-xs">Propulsé par Gemini 3 Flash & React</span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-tighter">
            © 2024 DevMind Agent System • v1.0.0-PRO
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
