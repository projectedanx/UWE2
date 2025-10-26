
import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Compass, Download, Zap, Bot } from 'lucide-react';

import type { WordBundle } from './types';
import { buildWordBundle } from './services/orchestrator';
import { getAiSummary } from './services/geminiService';

import SearchForm from './components/SearchForm';
import WordTree from './components/WordTree';
import LoadingSpinner from './components/LoadingSpinner';

const WORDS_OF_THE_DAY = [
  'ephemeral', 'sonder', 'petrichor', 'serendipity', 'eloquence', 
  'limerence', 'ineffable', 'hiraeth', 'mellifluous', 'nefelibata'
];

const App: React.FC = () => {
  const [wordBundle, setWordBundle] = useState<WordBundle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [wordOfTheDay, setWordOfTheDay] = useState('');

  useEffect(() => {
    const randomWord = WORDS_OF_THE_DAY[Math.floor(Math.random() * WORDS_OF_THE_DAY.length)];
    setWordOfTheDay(randomWord);
  }, []);

  const handleSearch = useCallback(async (word: string) => {
    if (!word) return;
    setIsLoading(true);
    setError(null);
    setWordBundle(null);
    setAiSummary(null);
    setSearchTerm(word);

    try {
      const bundle = await buildWordBundle(word);
      if (bundle.definitions.length === 0 && bundle.relations.length === 0 && bundle.associations.length === 0) {
        throw new Error(`No data found for "${word}". Please check the spelling.`);
      }
      setWordBundle(bundle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateAiSummary = async () => {
    if (!wordBundle) return;
    setIsAiLoading(true);
    setAiSummary(null);
    try {
      const summary = await getAiSummary(wordBundle);
      setAiSummary(summary);
    } catch (err) {
      setAiSummary('Failed to generate AI summary. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const downloadData = (format: 'json' | 'md') => {
    if (!wordBundle) return;
    let dataStr = '';
    let fileName = '';

    if (format === 'json') {
      dataStr = JSON.stringify(wordBundle, null, 2);
      fileName = `${wordBundle.query}.json`;
    } else {
      const fm = {
        word: wordBundle.query,
        exportedAt: new Date().toISOString(),
        sources: Array.from(new Set([
          ...wordBundle.definitions.map(d => d.attribution.source),
          ...wordBundle.relations.map(r => r.attribution.source)
        ]))
      };
      const markdownParts = [
        `---\n${JSON.stringify(fm, null, 2)}\n---`,
        `# ${wordBundle.query}`,
        wordBundle.phonetics?.map(p => p.text).join(' | ') || '',
        wordBundle.etymology ? `## Etymology\n${wordBundle.etymology}` : '',
        `## Definitions\n` + wordBundle.definitions.map(d => `- **(${d.partOfSpeech})** ${d.text}`).join('\n'),
        `## Relations\n` + wordBundle.relations.map(r => `- **[${r.rel}]** ${r.target}`).join('\n'),
        `## Associations\n` + wordBundle.associations.map(a => `- ${a.term} (score: ${a.score || 'N/A'})`).join('\n'),
        `## Wikipedia Subtopics\n` + wordBundle.wiki.toc.map(t => `- ${'  '.repeat(t.level-1)}${t.title}`).join('\n')
      ];
      dataStr = markdownParts.filter(Boolean).join('\n\n');
      fileName = `${wordBundle.query}.md`;
    }

    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-2">
             <Compass size={40} className="text-cyan-400" />
             <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">Unified Word Explorer</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A multi-source, AI-augmented lexicon dashboard for deep linguistic analysis.
          </p>
        </header>

        <main>
          <SearchForm onSearch={handleSearch} placeholder={`Search for a word... e.g., ${wordOfTheDay}`} />

          {isLoading && <LoadingSpinner />}
          {error && <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg mt-6">{error}</div>}
          
          {wordBundle && (
            <div className="mt-8">
              <div className="flex flex-wrap gap-4 items-center mb-6">
                <h2 className="text-3xl font-bold text-cyan-300 capitalize">{wordBundle.query}</h2>
                <div className="flex gap-2">
                   <button onClick={() => downloadData('json')} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm">
                      <Download size={16} /> JSON
                   </button>
                    <button onClick={() => downloadData('md')} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm">
                      <Download size={16} /> MD
                   </button>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-purple-300">
                        <Bot size={24} />
                        <span>Gemini AI Analysis</span>
                    </div>
                    <button 
                      onClick={handleGenerateAiSummary} 
                      disabled={isAiLoading}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      <Zap size={18} />
                      {isAiLoading ? 'Synthesizing...' : 'Generate Synthesis'}
                    </button>
                </div>

                {isAiLoading && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <LoadingSpinner />
                    <p>Gemini is thinking...</p>
                  </div>
                )}

                {aiSummary && (
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300 bg-black/20 p-4 rounded-lg">
                    {aiSummary.split(/(\[[a-zA-Z]+\])/g).map((part, index) => {
                      if (part.match(/(\[[a-zA-Z]+\])/)) {
                        return <span key={index} className="text-purple-400 font-mono text-xs mx-1">{part}</span>;
                      }
                      return <span key={index}>{part}</span>;
                    })}
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                 <WordTree bundle={wordBundle} onWordClick={handleSearch} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
