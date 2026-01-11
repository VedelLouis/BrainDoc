
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `Tu es un assistant expert en ingénierie logicielle, communication technique et productivité. 
Ton rôle est d'analyser un contexte (technique, produit ou organisationnel), de raisonner étape par étape pour identifier l'intention et le besoin de l'utilisateur, puis de générer le livrable le plus pertinent.

Tu dois répondre UNIQUEMENT au format JSON avec la structure suivante :
{
  "reasoning": ["Étape 1...", "Étape 2..."],
  "deliverableType": "Nom du type de livrable",
  "generatedContent": "Contenu du livrable (Markdown supporté)",
  "justification": "Brève explication du choix"
}

Types de livrables possibles (liste non exhaustive) :
- Message de commit (Conventional Commits)
- Ticket de développement (Jira/GitHub style)
- Explication technique ou fonctionnelle
- Plan d'action
- Résumé de situation
- Documentation technique (README, API doc)
- Rapport d'incident (Post-mortem)`;

export async function analyzeContext(context: string): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `Contexte : "${context}"` }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Les étapes de raisonnement logique."
            },
            deliverableType: {
              type: Type.STRING,
              description: "Le type de livrable choisi (ex: Commit Message, Ticket, etc.)"
            },
            generatedContent: {
              type: Type.STRING,
              description: "Le contenu textuel du livrable généré."
            },
            justification: {
              type: Type.STRING,
              description: "Pourquoi ce livrable est le plus adapté."
            }
          },
          required: ["reasoning", "deliverableType", "generatedContent", "justification"]
        }
      }
    });

    const jsonStr = response.text || "";
    return JSON.parse(jsonStr) as AnalysisResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Erreur lors de l'analyse du contexte. Veuillez réessayer.");
  }
}
