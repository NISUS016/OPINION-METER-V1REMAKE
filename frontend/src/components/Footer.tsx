import React from 'react';

const Footer = () => (
  <footer className="bg-surface-container-low py-16 px-8 mt-24 border-t transition-colors">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <span className="text-lg font-headline font-bold">Opinion-Meter Intelligence</span>
        <p className="mt-4 text-sm text-on-surface-variant max-w-sm leading-relaxed">
          Elevating raw sentiment data into actionable product insights. Powered by NLTK and Logistic Regression.
        </p>
        <p className="mt-8 text-xs text-on-surface-variant/60">
          © 2024 Opinion-Meter. All rights reserved.
        </p>
      </div>
      <div className="flex flex-wrap gap-x-12 gap-y-4 md:justify-end">
        {['Privacy Policy', 'Terms of Service', 'API Documentation', 'Support'].map((link) => (
          <a key={link} href="#" className="text-sm text-on-surface-variant hover:text-primary underline transition-colors underline-offset-4">
            {link}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
