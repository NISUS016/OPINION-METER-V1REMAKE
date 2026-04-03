import { ProductAnalysis, SearchResult } from './types';

export const MOCK_SEARCH_RESULTS: SearchResult[] = [
  { id: '1', name: 'iPhone 15 Pro Max', verdict: 'Exceptional', type: 'tech' },
  { id: '2', name: 'Sony WH-1000XM5', verdict: 'Strong Neutral', type: 'audio' },
  { id: '3', name: 'Apple AirTags', verdict: 'Recommended', type: 'tech' },
];

export const POPULAR_ANALYSIS = [
  {
    id: 'macbook',
    name: 'MacBook Air M3',
    category: 'TECH',
    description: 'Aggregate sentiment remains positive following recent performance benchmarks.',
    positivePercentage: 92,
  },
  {
    id: 'airpods',
    name: 'AirPods Pro Gen 2',
    category: 'AUDIO',
    description: 'High editorial acclaim for noise cancellation improvements and USB-C update.',
    positivePercentage: 88,
  }
];

export const RECENT_SEARCHES = [
  'Samsung S24 Ultra',
  'DJI Mini 4 Pro',
  'Tesla Model 3 Highland'
];

export const DETAILED_ANALYSIS: ProductAnalysis = {
  id: 'macbook',
  name: 'MacBook Air M3',
  category: 'TECH',
  verdict: 'The Verdict',
  overallSentiment: 'positive',
  confidence: 94,
  breakdown: {
    positive: 75,
    neutral: 15,
    negative: 10,
  },
  stats: {
    velocity: '+24.8%',
    engagement: '8.2k',
  },
  reviews: [
    {
      id: 'r1',
      text: "Amazing sound quality, but the battery life could be better. Overall, a great investment for music lovers.",
      source: 'Amazon Marketplace',
      timeAgo: '2 mins ago',
      sentiment: 'positive',
      confidence: 98,
    },
    {
      id: 'r2',
      text: "The shipping was standard. Product arrived in good condition. Not much else to say.",
      source: 'Direct Feedback',
      timeAgo: '15 mins ago',
      sentiment: 'neutral',
      confidence: 82,
    },
    {
      id: 'r3',
      text: "The app keeps crashing on startup after the latest update. Completely unusable right now.",
      source: 'App Store',
      timeAgo: '1 hour ago',
      sentiment: 'negative',
      confidence: 99,
    }
  ]
};

export const CHART_DATA = [
  { name: 'Jan', value: 60 },
  { name: 'Feb', value: 75 },
  { name: 'Mar', value: 45 },
  { name: 'Apr', value: 90 },
  { name: 'May', value: 55 },
  { name: 'Jun', value: 65 },
];
