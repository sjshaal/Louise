export interface HayAffirmation {
  id: string;
  ailment: string;
  body_part: string;
  probable_cause: string;
  affirmation: string;
  new_thought_pattern: string;
  keywords: string[];
  category: string;
  related_emotions: string[];
  related_ailments: string[]; // IDs of related hay entries
}

export interface SearchResult {
  entry: HayAffirmation;
  score: number;
  matchType: 'semantic' | 'keyword' | 'hybrid';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'healer';
  content: string;
  timestamp: number;
  results?: SearchResult[];
  affirmation?: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  affirmation?: string;
  timestamp: number;
  themes?: string[];
  embedding?: number[];
}

export interface FeedbackPayload {
  resultId: string;
  query: string;
  helpful: boolean;
}

export interface DailyAffirmationResponse {
  entry: HayAffirmation;
  personalNote: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  relatedEntries: HayAffirmation[];
}

export interface ChatResponse {
  message: string;
  results: SearchResult[];
  affirmation: string;
  suggestedJournal?: string;
}
