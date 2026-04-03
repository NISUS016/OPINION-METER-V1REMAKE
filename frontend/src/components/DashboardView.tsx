import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../lib/utils';
import { Review, AnalysisSummary } from '../types';
import ReviewCard from './ReviewCard';

interface DashboardViewProps {
  query: string;
  results: Review[];
  summary: AnalysisSummary;
}

const DashboardView = ({ query, results, summary }: DashboardViewProps) => {
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'rating-high' | 'rating-low'>('default');

  const chartData = [
    { name: 'Positive', value: summary.positive, color: '#10b981' },
    { name: 'Neutral', value: summary.neutral, color: '#6b7280' },
    { name: 'Negative', value: summary.negative, color: '#ef4444' }
  ];

  const dominant = Object.entries(summary)
    .filter(([k]) => k !== 'total')
    .reduce((a, b) => b[1] > a[1] ? b : a)[0];

  const filteredAndSortedResults = useMemo(() => {
    let list = [...results];
    if (filter !== 'all') {
      list = list.filter(r => r.label === filter);
    }
    if (sortBy === 'rating-high') {
      list.sort((a, b) => Number(b.rate || 0) - Number(a.rate || 0));
    } else if (sortBy === 'rating-low') {
      list.sort((a, b) => Number(a.rate || 0) - Number(b.rate || 0));
    }
    return list;
  }, [results, filter, sortBy]);

  const exportToCSV = () => {
    const headers = ['Product', 'Review', 'Sentiment', 'Rating', 'AI Label'];
    const rows = results.map(r => [
      r.product_name,
      `"${r.text.replace(/"/g, '""')}"`,
      r.sentiment,
      r.rate || 'N/A',
      r.label
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `opinion_meter_${query.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-8 py-12 space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Analysis Dashboard</h2>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-10 relative overflow-hidden border-t-2 border-primary shadow-ambient flex flex-col justify-between min-h-[320px]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Results for: {query}</span>
            <h1 className="text-5xl font-headline font-extrabold mt-4 mb-4">The Verdict</h1>
            <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
              Based on {summary.total} verified Flipkart reviews, our model identifies a high-confidence <span className="font-bold text-primary">{dominant}</span> sentiment profile.
            </p>
          </div>
          <div className="mt-12 flex items-center gap-6">
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white", 
              dominant === 'positive' ? 'bg-sentiment-positive' : dominant === 'neutral' ? 'bg-sentiment-neutral' : 'bg-sentiment-negative')}>
              <CheckCircle2 size={32} />
            </div>
            <div>
              <div className="font-headline font-extrabold text-2xl uppercase">{dominant} SENTIMENT</div>
              <div className="text-on-surface-variant font-medium">Model Confidence: {(summary[dominant as keyof AnalysisSummary] / summary.total * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-8 flex flex-col justify-between shadow-ambient">
          <h3 className="font-headline text-xl font-bold mb-8">Composition</h3>
          <div className="space-y-8">
            {[
              { label: 'Positive', val: Math.round((summary.positive / summary.total) * 100), color: 'bg-sentiment-positive', type: 'positive' as const },
              { label: 'Neutral', val: Math.round((summary.neutral / summary.total) * 100), color: 'bg-sentiment-neutral', type: 'neutral' as const },
              { label: 'Negative', val: Math.round((summary.negative / summary.total) * 100), color: 'bg-sentiment-negative', type: 'negative' as const }
            ].map((item) => (
              <div key={item.label} className="space-y-3 cursor-pointer group" onClick={() => setFilter(item.type)}>
                <div className="flex justify-between items-end">
                  <span className={cn("text-sm font-bold transition-colors", filter === item.type ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface")}>
                    {item.label}
                  </span>
                  <span className="text-2xl font-headline font-extrabold">{item.val}%</span>
                </div>
                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${item.val}%` }} 
                    className={cn("h-full transition-opacity", item.color, filter !== 'all' && filter !== item.type ? "opacity-30" : "opacity-100")} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-headline text-2xl font-bold">Sentiment Distribution</h2>
        </div>
        <div className="h-[300px] w-full flex flex-col md:flex-row items-center justify-around gap-8">
          <div className="h-full w-full max-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-bold">{item.name}</span>
                <span className="text-sm text-on-surface-variant">{item.value} reviews</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="font-headline text-3xl font-extrabold">Individual Evidence</h2>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-surface-container-low p-1 rounded-lg border border-transparent">
              {(['all', 'positive', 'neutral', 'negative'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                    filter === f 
                      ? "bg-white shadow-sm text-primary" 
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-container-low text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg outline-none cursor-pointer border border-transparent"
            >
              <option value="default">Default Sort</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAndSortedResults.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-low rounded-xl text-on-surface-variant font-medium border border-transparent">
              No reviews match the selected filter.
            </div>
          ) : (
            filteredAndSortedResults.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default DashboardView;
