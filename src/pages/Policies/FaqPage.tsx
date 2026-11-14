import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS, type FaqItem } from '../../data/mockAccount';
import { PageTransition } from '../../components/common/PageTransition';

const CATEGORIES: Array<'All' | FaqItem['category']> = [
  'All',
  'Artworks',
  'Shipping',
  'Commissions',
  'Care',
];

export const FaqPage: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<'All' | FaqItem['category']>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const visible =
    selectedCat === 'All' ? FAQ_ITEMS : FAQ_ITEMS.filter((f) => f.category === selectedCat);

  return (
    <PageTransition className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <p className="font-handwritten text-2xl text-[#C86D51]">Studio Answers</p>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-[#6E655F]">
            Everything about archival materials, fragile clay packing, and custom commissions.
          </p>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCat(cat);
                setOpenIndex(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                selectedCat === cat
                  ? 'bg-[#C86D51] text-white border-[#C86D51]'
                  : 'bg-[#F3EDE2] text-[#2B2623] border-[#EAE3D5] hover:border-[#C86D51]/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-white border border-[#EAE3D5] rounded-2xl divide-y divide-[#EAE3D5] shadow-warm/40">
          {visible.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.question} className="p-5">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left"
                >
                  <span className="font-display text-base sm:text-lg font-medium text-[#2B2623]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#C86D51] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm text-[#6E655F] leading-relaxed">{item.answer}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-[#6E655F]">
            Still wondering about something?{' '}
            <Link to="/contact" className="font-medium text-[#C86D51] hover:text-[#B2593E]">
              Write directly to Varnika →
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};
