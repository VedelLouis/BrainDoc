
export interface AnalysisResult {
  reasoning: string[];
  deliverableType: string;
  generatedContent: string;
  justification: string;
}

export interface HistoryItem extends AnalysisResult {
  id: string;
  context: string;
  timestamp: Date;
}
