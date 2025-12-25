
import React, { useState } from 'react';
import { generateText, generateJson } from '../services/geminiService';
import { MODELS } from '../constants';
import { Type } from '@google/genai';

const TextGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [model, setModel] = useState(MODELS.TEXT_FLASH);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      if (isJsonMode) {
        const schema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            points: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["title", "summary", "points"]
        };
        const json = await generateJson(prompt, schema);
        setResult(JSON.stringify(json, null, 2));
      } else {
        const text = await generateText(prompt, model);
        setResult(text || '');
      }
    } catch (error: any) {
      setResult("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Text Generator</h2>
          <p className="text-slate-400">Prompt engineering, logic, and structured data.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value={MODELS.TEXT_FLASH}>Gemini 3 Flash</option>
            <option value={MODELS.TEXT_PRO}>Gemini 3 Pro</option>
          </select>
          <button
            onClick={() => setIsJsonMode(!isJsonMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isJsonMode ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'
            }`}
          >
            JSON Mode
          </button>
        </div>
      </header>

      <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={isJsonMode ? "Ask for structured information (e.g., 'Analyze the impact of AI in healthcare')" : "Ask anything..."}
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 min-h-[150px] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : 'Generate Output'}
        </button>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Result</h3>
          <div className="glass rounded-2xl border border-white/5 p-6 overflow-x-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-200">
              {result}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextGenerator;
