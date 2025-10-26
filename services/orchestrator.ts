
import {
  fetchDictionaryData,
  fetchDatamuseSynonyms,
  fetchDatamuseAssociations,
  fetchConceptNetEdges,
  fetchWikipediaToc
} from './adapters';
import type { WordBundle } from '../types';

export async function buildWordBundle(term: string): Promise<WordBundle> {
  const termLower = term.toLowerCase().trim();
  if (!termLower) throw new Error("Search term cannot be empty.");

  const results = await Promise.allSettled([
    fetchDictionaryData(termLower),
    fetchDatamuseSynonyms(termLower),
    fetchDatamuseAssociations(termLower),
    fetchConceptNetEdges(termLower),
    fetchWikipediaToc(termLower),
  ]);

  const dictionaryResult = results[0].status === 'fulfilled' ? results[0].value : { definitions: [], phonetics: [], etymology: undefined };
  const datamuseSynonymsResult = results[1].status === 'fulfilled' ? results[1].value : [];
  const datamuseAssociationsResult = results[2].status === 'fulfilled' ? results[2].value : [];
  const conceptNetEdgesResult = results[3].status === 'fulfilled' ? results[3].value : [];
  const wikipediaTocResult = results[4].status === 'fulfilled' ? results[4].value : [];

  const allRelations = [...(datamuseSynonymsResult || []), ...(conceptNetEdgesResult || [])];

  const bundle: WordBundle = {
    query: term,
    definitions: dictionaryResult?.definitions || [],
    phonetics: dictionaryResult?.phonetics,
    etymology: dictionaryResult?.etymology,
    relations: allRelations,
    associations: datamuseAssociationsResult || [],
    morphology: [], // Placeholder for future implementation
    wiki: {
      toc: wikipediaTocResult || [],
    },
  };

  return bundle;
}
