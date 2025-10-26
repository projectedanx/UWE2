
import { GoogleGenAI } from "@google/genai";
import type { WordBundle } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function formatBundleForPrompt(bundle: WordBundle): string {
  let context = `Word: ${bundle.query}\n\n`;

  if (bundle.definitions.length > 0) {
    context += "Definitions:\n";
    bundle.definitions.slice(0, 5).forEach(d => {
      context += `- (${d.partOfSpeech}) ${d.text}\n`;
    });
    context += "\n";
  }

  if (bundle.relations.length > 0) {
    context += "Semantic Relations:\n";
    const relationsByType: Record<string, string[]> = {};
    bundle.relations.slice(0, 15).forEach(r => {
      if (!relationsByType[r.rel]) {
        relationsByType[r.rel] = [];
      }
      relationsByType[r.rel].push(r.target);
    });
    for (const [rel, targets] of Object.entries(relationsByType)) {
      context += `- ${rel}: ${targets.join(', ')}\n`;
    }
    context += "\n";
  }

  if (bundle.associations.length > 0) {
    context += "Associations:\n";
    context += bundle.associations.slice(0, 10).map(a => a.term).join(', ') + "\n\n";
  }

  if (bundle.wiki.toc.length > 0) {
    context += "Wikipedia Subtopics:\n";
    context += bundle.wiki.toc.slice(0, 5).map(t => t.title).join(', ') + "\n";
  }

  return context;
}

export async function getAiSummary(bundle: WordBundle): Promise<string> {
  if (!API_KEY) {
    return "AI features are disabled. Please configure your Gemini API key.";
  }
  
  const model = 'gemini-2.5-flash';
  const dataContext = formatBundleForPrompt(bundle);

  const prompt = `
    You are a linguistic analyst AI. Your task is to synthesize the provided data about a word into a concise and insightful summary.
    
    **Instructions:**
    1.  Produce a 90-120 word synthesis based *only* on the provided data bundles.
    2.  Do not invent facts or definitions.
    3.  When you use information, cite the source tag inline, like [dictionaryapi] or [conceptnet].
    4.  Start with a primary definition.
    5.  Weave in semantic relationships and associations to provide deeper context.
    6.  Conclude with a brief mention of its conceptual space based on Wikipedia topics, if available.
    7.  Maintain a neutral, analytical tone.

    **Provided Data for "${bundle.query}":**
    ---
    ${dataContext}
    ---
    
    **Synthesis:**
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate AI summary. The API call may have failed.");
  }
}
