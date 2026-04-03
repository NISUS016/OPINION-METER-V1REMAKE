import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, MessageSquare, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoadingViewProps {
  count: number;
}

const LoadingView = ({ count }: LoadingViewProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center px-8"
    >
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full -rotate-90">
              <circle cx="128" cy="128" r="110" className="stroke-surface-container-high fill-none" strokeWidth="2" />
              <motion.circle 
                cx="128" cy="128" r="110" className="stroke-primary fill-none" strokeWidth="6" strokeLinecap="round" strokeDasharray="691"
                animate={{ strokeDashoffset: 691 - (691 * progress) / 100 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-headline font-extrabold">{count}+</span>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Data Points</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <h1 className="text-4xl font-headline font-extrabold mb-4">Neural Synthesis in Progress...</h1>
          <p className="text-on-surface-variant mb-12 max-w-md">
            Processing {count} raw reviews through our Logistic Regression pipeline to classify sentiment nuance.
          </p>

          <div className="space-y-4">
            {[
              { icon: BrainCircuit, label: 'Running preprocessing...', status: progress < 40 ? `${progress}%` : 'Complete', active: progress < 40 },
              { icon: MessageSquare, label: 'TF-IDF Vectorization...', status: progress < 80 ? 'In progress' : 'Complete', active: progress >= 40 && progress < 80 },
              { icon: CheckCircle2, label: 'Predicting class probabilities...', status: progress < 90 ? 'Pending' : 'Finalizing', active: progress >= 80 }
            ].map((step, i) => (
              <div key={i} className={cn("flex items-center gap-4 p-5 rounded-xl transition-all border", step.active ? "bg-surface-container-lowest shadow-ambient border-transparent" : "bg-surface-container-low opacity-60 border-transparent")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", step.active ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant")}>
                  <step.icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{step.label}</div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{step.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingView;
