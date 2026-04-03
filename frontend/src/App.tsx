import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Review, AnalysisSummary } from './types';

// Components
import LandingView from './components/LandingView';
import LoadingView from './components/LoadingView';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import Footer from './components/Footer';

export default function App() {
  const [view, setView] = useState<'landing' | 'loading' | 'dashboard' | 'history'>('landing');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Review[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [error, setError] = useState('');
  const [foundCount, setFoundCount] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<{query: string, timestamp: string}[]>([]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery) return;
    setQuery(searchQuery);
    setError('');
    
    // Add to session history
    setSessionHistory(prev => [{
      query: searchQuery,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.filter(h => h.query !== searchQuery)]);

    try {
      // 1. Search
      const searchRes = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      const searchData = await searchRes.json();
      
      if (!searchData.reviews || searchData.reviews.length === 0) {
        setError("No reviews found for this product.");
        setView('landing');
        return;
      }

      setFoundCount(searchData.reviews.length);
      setView('loading');

      // 2. Analyze
      const reviewTexts = searchData.reviews.map((r: any) => r.text);
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: reviewTexts })
      });
      const analyzeData = await analyzeRes.json();

      // 3. Combine
      const combined = searchData.reviews.map((r: any, i: number) => ({
        ...r,
        label: analyzeData.results[i].label,
        confidence: analyzeData.results[i].confidence
      }));

      setResults(combined);
      setSummary(analyzeData.summary);
      
      // Delay slightly for dramatic effect of loading screen
      setTimeout(() => setView('dashboard'), 1500);
      
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching analysis.");
      setView('landing');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFE] text-on-surface">
      <header className="sticky top-0 z-50 glass shadow-ambient px-8 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-12">
            <span 
              className="text-xl font-headline font-extrabold tracking-tight cursor-pointer" 
              onClick={() => setView('landing')}
            >
              Opinion-Meter
            </span>
            <div className="hidden md:flex gap-8">
              <button 
                onClick={() => setView('landing')} 
                className={cn(
                  "text-sm font-headline font-bold transition-colors", 
                  view === 'landing' || view === 'dashboard' || view === 'loading' 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setView('history')} 
                className={cn(
                  "text-sm font-headline font-bold transition-colors", 
                  view === 'history' 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                History
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <LandingView 
              key="landing" 
              onSearch={handleSearch} 
              error={error} 
              sessionHistory={sessionHistory} 
            />
          )}
          {view === 'loading' && (
            <LoadingView key="loading" count={foundCount} />
          )}
          {view === 'dashboard' && summary && (
            <DashboardView key="dashboard" query={query} results={results} summary={summary} />
          )}
          {view === 'history' && (
            <HistoryView 
              key="history"
              sessionHistory={sessionHistory} 
              onSearch={handleSearch} 
              onNavigateToLanding={() => setView('landing')}
            />
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
