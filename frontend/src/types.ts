export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Review {
  id: string;
  text: string;
  source: string;
  timeAgo: string;
  sentiment: Sentiment;
  confidence: number;
}

export interface ProductAnalysis {
  id: string;
  name: string;
  category: string;
  verdict: string;
  overallSentiment: Sentiment;
  confidence: number;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  stats: {
    velocity: string;
    engagement: string;
  };
  reviews: Review[];
}

export interface SearchResult {
  id: string;
  name: string;
  verdict: string;
  type: string;
}
