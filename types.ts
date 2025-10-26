
export type SourceTag = 'dictionaryapi' | 'datamuse' | 'conceptnet' | 'wikipedia' | 'gemini' | 'internal';

export interface SourceAttribution {
  source: SourceTag;
  url?: string;
  fetchedAt: string;
}

export interface Definition {
  text: string;
  partOfSpeech?: string;
  examples?: string[];
  attribution: SourceAttribution;
}

export type RelationType = 'synonym' | 'antonym' | 'hypernym' | 'hyponym' | 'meronym' | 'holonym' | 'isa' | 'usedfor' | 'relatedto' | 'atlocation' | 'derivedfrom' | 'triggers' | 'hassubevent' | 'hascontext' | 'mannerof' | 'causes' | 'capableof';

export interface RelationEdge {
  rel: RelationType;
  target: string;
  weight?: number;
  attribution: SourceAttribution;
}

export interface MorphVariant {
  form: string;
  kind: 'prefix' | 'suffix' | 'inflection';
  rule?: string;
  attribution: SourceAttribution;
}

export interface WikiTocItem {
  index: string;
  title: string;
  level: number;
  anchor?: string;
  attribution: SourceAttribution;
}

export interface Association {
  term: string;
  score?: number;
  attribution: SourceAttribution;
}

export interface WordBundle {
  query: string;
  phonetics?: { text: string; audio?: string }[];
  etymology?: string;
  definitions: Definition[];
  relations: RelationEdge[];
  associations: Association[];
  morphology: MorphVariant[];
  wiki: {
    summary?: string;
    toc: WikiTocItem[];
  };
}

// Partial type for dictionary API response, focusing on needed fields
export interface DictionaryApiResponse {
    word: string;
    phonetic?: string;
    phonetics: { text: string; audio?: string }[];
    meanings: {
        partOfSpeech: string;
        definitions: {
            definition: string;
            synonyms: string[];
            antonyms: string[];
            example?: string;
        }[];
        synonyms: string[];
        antonyms: string[];
    }[];
    origin?: string;
    sourceUrls: string[];
}
