import React from 'react';
import { cn, truncateWords } from '../lib/utils';
import { Review } from '../types';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-ambient border border-transparent flex flex-col md:flex-row gap-6 relative overflow-hidden">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", 
        review.label === 'positive' ? "bg-sentiment-positive" : review.label === 'neutral' ? "bg-sentiment-neutral" : "bg-sentiment-negative")} />
      <div className="flex-1">
        <p className="text-[14px] leading-relaxed font-medium italic text-on-surface">"{truncateWords(review.text, 100)}"</p>
        <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-on-surface-variant uppercase">
          <span>Rating: {review.rate || 'N/A'} ★</span>
          <span className="opacity-40">|</span>
          <span>{review.short_label}</span>
          <span className="opacity-40">|</span>
          <span>Source: Flipkart Dataset</span>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0 md:pl-6 border-l border-surface-container-high">
        <div className="text-right">
          <div className={cn("text-lg font-headline font-extrabold uppercase", 
            review.label === 'positive' ? "text-sentiment-positive" : review.label === 'neutral' ? "text-sentiment-neutral" : "text-sentiment-negative")}>
            {review.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
