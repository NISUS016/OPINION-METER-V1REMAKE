export interface ProductAnalysis {
  id: string;
  name: string;
  category: string;
  verdict: string;
  overallSentiment: 'positive' | 'neutral' | 'negative';
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

export interface Review {
  product_name: string;
  text: string;
  sentiment: string;
  rate?: string | number;
  short_label?: string;
  label?: string;
  confidence?: number;
}

export interface SearchResult {
  id: string;
  name: string;
  verdict: string;
  type: 'tech' | 'audio' | 'fashion' | 'home';
}

export interface AnalysisSummary {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}
