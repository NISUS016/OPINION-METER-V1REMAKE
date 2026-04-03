import React from 'react';
import { motion } from 'motion/react';
import { History, ArrowUpRight } from 'lucide-react';

interface HistoryItem {
  query: string;
  timestamp: string;
}

interface HistoryViewProps {
  sessionHistory: HistoryItem[];
  onSearch: (query: string) => void;
  onNavigateToLanding: () => void;
}

const HistoryView = ({ sessionHistory, onSearch, onNavigateToLanding }: HistoryViewProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-8 py-20"
    >
      <h1 className="text-4xl font-headline font-extrabold mb-12">Session History</h1>
      {sessionHistory.length === 0 ? (
        <div className="bg-surface-container-low p-12 rounded-xl text-center border border-transparent">
          <p className="text-on-surface-variant">No products searched in this session yet.</p>
          <button 
            onClick={onNavigateToLanding}
            className="mt-6 text-primary font-bold hover:underline"
          >
            Start Searching
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessionHistory.map((item, i) => (
            <div 
              key={i} 
              onClick={() => onSearch(item.query)}
              className="bg-surface-container-lowest p-6 rounded-xl shadow-ambient border border-transparent hover:translate-y-[-2px] transition-all cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-surface-container-high rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <History size={20} />
                </div>
                <div>
                  <div className="font-headline font-bold text-lg">{item.query}</div>
                  <div className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{item.timestamp}</div>
                </div>
              </div>
              <ArrowUpRight size={20} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default HistoryView;
