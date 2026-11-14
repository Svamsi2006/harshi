import React from 'react';
import { SketchArrow } from '../common/BotanicalDecorations';

const STEPS = [
  {
    number: '01',
    title: 'Sketching & Crafting',
    description:
      'Every piece begins on our sunlit wooden table—layered slowly with graphite, wet-on-wet pigment, or hand-pinched river clay.',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-[#C86D51]" aria-hidden="true">
        <path
          d="M14 48L18 35L41 12C43 10 46.5 10 48.5 12L52 15.5C54 17.5 54 21 52 23L29 46L14 48Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M36.5 16.5L47.5 27.5" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M10 54C20 51 36 53 52 51"
          stroke="#7A9178"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Quality Check',
    description:
      'Drawings are fixed with archival sprays, clay is kiln-inspected for strength, and every work is signed by hand before leaving.',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-[#7A9178]" aria-hidden="true">
        <circle cx="29" cy="29" r="16" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M40.5 40.5L53 53"
          stroke="#2B2623"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M22.5 29.5L27 34L36.5 24"
          stroke="#C86D51"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Eco-friendly Gift Wrapping',
    description:
      'Wrapped in acid-free tissue, honeycomb paper, twine, and a handwritten studio note so opening it feels like a warm gift.',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-[#C86D51]" aria-hidden="true">
        <rect
          x="12"
          y="24"
          width="40"
          height="28"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path d="M12 33H52" stroke="currentColor" strokeWidth="1.6" />
        <path d="M32 24V52" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M32 24C26 24 21 19.5 23 15.5C25 11.5 31 16.5 32 24Z"
          stroke="#7A9178"
          strokeWidth="1.65"
          strokeLinejoin="round"
        />
        <path
          d="M32 24C38 24 43 19.5 41 15.5C39 11.5 33 16.5 32 24Z"
          stroke="#7A9178"
          strokeWidth="1.65"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export const ProcessTimeline: React.FC = () => {
  return (
    <section className="bg-[#F3EDE2]/75 border-y border-[#EAE3D5] py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-handwritten text-2xl text-[#C86D51]">From easel to your home</p>
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623] mt-1 text-balance">
            Made with Love, Every Step of the Way
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-start relative">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="relative flex flex-col items-center text-center px-4">
                <div className="w-24 h-24 rounded-full bg-[#FAF7F2] border border-[#EAE3D5] shadow-warm flex items-center justify-center mb-5">
                  {step.icon}
                </div>
                <span className="text-xs font-medium tracking-[0.08em] text-[#6E655F] mb-1">
                  {step.number}
                </span>
                <h3 className="font-display text-xl font-medium text-[#2B2623]">{step.title}</h3>
                <p className="text-sm text-[#6E655F] mt-2 leading-relaxed max-w-xs">
                  {step.description}
                </p>

                {index < STEPS.length - 1 && (
                  <SketchArrow className="hidden md:block absolute -right-10 top-9 w-20 h-6 text-[#C86D51]/60" />
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
