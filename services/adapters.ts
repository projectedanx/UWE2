
import type { Definition, RelationEdge, WikiTocItem, Association, SourceTag, DictionaryApiResponse, RelationType } from '../types';

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        if (!response.ok) {
            // Special handling for 404 from dictionary API
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        clearTimeout(id);
        console.error(`Fetch failed for ${url}:`, error);
        return null;
    }
};

const createAttribution = (source: SourceTag, url?: string) => ({
    source,
    url,
    fetchedAt: new Date().toISOString(),
});

// --- DictionaryAPI.dev Adapter ---
export async function fetchDictionaryData(term: string) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`;
    const data: DictionaryApiResponse[] | null = await fetchWithTimeout(url);

    if (!data || !Array.isArray(data) || data.length === 0) {
        return { definitions: [], phonetics: [], etymology: undefined };
    }
    
    const entry = data[0];
    const definitions: Definition[] = [];
    entry.meanings.forEach(meaning => {
        meaning.definitions.forEach(def => {
            definitions.push({
                text: def.definition,
                partOfSpeech: meaning.partOfSpeech,
                examples: def.example ? [def.example] : [],
                attribution: createAttribution('dictionaryapi', entry.sourceUrls[0]),
            });
        });
    });

    return {
        definitions,
        phonetics: entry.phonetics?.filter(p => p.text),
        etymology: entry.origin,
    };
}


// --- Datamuse Adapter ---
const DATAMUSE_BASE = 'https://api.datamuse.com/words';
export async function fetchDatamuseSynonyms(term: string): Promise<RelationEdge[]> {
    const url = `${DATAMUSE_BASE}?ml=${encodeURIComponent(term)}&md=f&max=20`;
    const data = await fetchWithTimeout(url);
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item: any) => ({
        rel: 'synonym',
        target: item.word,
        weight: item.score,
        attribution: createAttribution('datamuse'),
    }));
}

export async function fetchDatamuseAssociations(term: string): Promise<Association[]> {
    const url = `${DATAMUSE_BASE}?rel_trg=${encodeURIComponent(term)}&md=f&max=30`;
    const data = await fetchWithTimeout(url);
    if (!data || !Array.isArray(data)) return [];

    return data.map((item: any) => ({
        term: item.word,
        score: item.score,
        attribution: createAttribution('datamuse'),
    }));
}

// --- ConceptNet Adapter ---
const CONCEPTNET_BASE = 'https://api.conceptnet.io';
const ALLOWED_RELATIONS: Set<string> = new Set(['relatedto', 'isa', 'usedfor', 'antonym', 'hassubevent', 'hascontext', 'mannerof', 'causes', 'derivedfrom', 'capableof']);

export async function fetchConceptNetEdges(term: string, lang = 'en'): Promise<RelationEdge[]> {
    const node = `/c/${lang}/${encodeURIComponent(term.replace(/ /g, '_'))}`;
    const url = `${CONCEPTNET_BASE}/query?node=${node}&limit=50`;
    const data = await fetchWithTimeout(url);

    if (!data || !data.edges || !Array.isArray(data.edges)) return [];

    return data.edges
        .map((edge: any) => {
            const rel = edge.rel['@id'].split('/').pop().toLowerCase();
            if (!ALLOWED_RELATIONS.has(rel)) return null;

            const isStartNode = edge.start['@id'] === node;
            const targetNode = isStartNode ? edge.end : edge.start;
            
            return {
                rel: rel as RelationType,
                target: targetNode.label,
                weight: edge.weight,
                attribution: createAttribution('conceptnet', edge['@id']),
            };
        })
        .filter((edge: RelationEdge | null): edge is RelationEdge => edge !== null);
}

// --- Wikipedia Adapter ---
const WIKIPEDIA_BASE = 'https://en.wikipedia.org/w/api.php';
export async function fetchWikipediaToc(title: string): Promise<WikiTocItem[]> {
    const params = new URLSearchParams({
        action: 'parse',
        page: title,
        prop: 'sections',
        format: 'json',
        origin: '*',
    });
    const url = `${WIKIPEDIA_BASE}?${params.toString()}`;
    const data = await fetchWithTimeout(url);

    if (!data || !data.parse || !data.parse.sections || !Array.isArray(data.parse.sections)) {
        return [];
    }

    return data.parse.sections.map((s: any) => ({
        index: s.index,
        title: s.line,
        level: Number(s.level),
        anchor: s.anchor,
        attribution: createAttribution('wikipedia', `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`),
    }));
}
