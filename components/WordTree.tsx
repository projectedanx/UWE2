
import React from 'react';
import { BookText, Link as LinkIcon, Users, BrainCircuit, Type, Speaker } from 'lucide-react';

import type { WordBundle } from '../types';
import CollapsibleSection from './CollapsibleSection';

interface WordTreeProps {
  bundle: WordBundle;
  onWordClick: (word: string) => void;
}

const SourceBadge: React.FC<{ source: string }> = ({ source }) => (
  <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-700 text-cyan-400">{source}</span>
);

const WordLink: React.FC<{ word: string; onClick: (word: string) => void; }> = ({ word, onClick }) => (
  <button onClick={() => onClick(word)} className="text-cyan-400 hover:text-cyan-300 hover:underline transition">
    {word}
  </button>
);


const WordTree: React.FC<WordTreeProps> = ({ bundle, onWordClick }) => {
  return (
    <div className="space-y-4">
      {bundle.phonetics && bundle.phonetics.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl mb-4">
            <Speaker className="text-gray-400" />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {bundle.phonetics.map((p, i) => p.text && (
                    <span key={i} className="text-lg font-mono text-gray-300">{p.text}</span>
                ))}
            </div>
          </div>
      )}
      
      {bundle.etymology && (
          <CollapsibleSection id="etymology" title="Etymology" icon={<Type size={20}/>} defaultOpen={true}>
              <p className="text-sm italic">{bundle.etymology}</p>
          </CollapsibleSection>
      )}

      {bundle.definitions.length > 0 && (
        <CollapsibleSection id="lexical" title="Lexical Definitions" icon={<BookText size={20}/>}>
          {bundle.definitions.map((d, i) => (
            <div key={i} className="text-sm border-l-2 border-gray-600 pl-4 py-1">
              <p>
                <span className="px-2 py-0.5 rounded bg-gray-700 mr-2 font-semibold text-xs uppercase">{d.partOfSpeech ?? '—'}</span>
                {d.text}
                <SourceBadge source={d.attribution.source} />
              </p>
              {d.examples && d.examples.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1 italic">e.g., "{d.examples[0]}"</p>
              )}
            </div>
          ))}
        </CollapsibleSection>
      )}

      {bundle.relations.length > 0 && (
        <CollapsibleSection id="semantic" title="Semantic Relations" icon={<BrainCircuit size={20}/>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {bundle.relations.slice(0, 50).map((r, i) => (
              <div key={i} className="text-sm flex items-baseline">
                <span className="px-2 py-0.5 rounded bg-gray-700 mr-2 font-mono text-xs w-24 text-center flex-shrink-0">{r.rel}</span>
                <WordLink word={r.target} onClick={onWordClick} />
                <SourceBadge source={r.attribution.source} />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {bundle.associations.length > 0 && (
         <CollapsibleSection id="associations" title="Word Associations" icon={<Users size={20}/>}>
           <div className="flex flex-wrap gap-2">
            {bundle.associations.slice(0,50).map((a, i) => (
              <div key={i} className="text-sm bg-gray-700/50 rounded-md px-3 py-1 flex items-center">
                 <WordLink word={a.term} onClick={onWordClick} />
                 {a.score && <span className="text-xs text-gray-400 ml-2">({a.score})</span>}
                 <SourceBadge source={a.attribution.source} />
              </div>
            ))}
           </div>
         </CollapsibleSection>
      )}

      {bundle.wiki.toc.length > 0 && (
        <CollapsibleSection id="wiki" title="Wikipedia Subtopics" icon={<LinkIcon size={20}/>}>
          {bundle.wiki.toc.map((s, i) => (
            <div key={i} className="text-sm">
                <a 
                    href={`https://en.wikipedia.org/wiki/${bundle.query}#${s.anchor}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-cyan-300 transition-colors"
                    style={{ paddingLeft: `${(s.level -1) * 1}rem` }}
                >
                    <span className="text-gray-500">{s.index}</span>
                    <span>{s.title}</span>
                </a>
            </div>
          ))}
        </CollapsibleSection>
      )}
    </div>
  );
};

export default WordTree;
