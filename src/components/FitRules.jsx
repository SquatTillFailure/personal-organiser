import React, { useState } from 'react';
import { Palette, Shuffle, Layers, ChevronDown } from 'lucide-react';

const RULES = [
  {
    icon: Palette,
    title: 'Colour palette',
    summary: 'Black/white base + grey, navy, sand, blue',
    detail: "Base: black + white. Core neutrals: grey, navy, sand. Accent: blue. Aim for pieces that mix across this palette rather than adding unrelated colours."
  },
  {
    icon: Shuffle,
    title: 'Silhouette balance',
    summary: 'Contrast top and bottom, never match tightness',
    detail: "Looser/wider pants → more fitted tops. Slimmer/tailored pants → looser tops. The goal is contrast, not both halves tight or both oversized. Heavier pants can support a more relaxed top; thin, tailored trousers look better with a cleaner silhouette."
  },
  {
    icon: Layers,
    title: 'Fabric weight & texture',
    summary: 'Match visual weight top-to-bottom-to-shoe',
    detail: "Heavy/structured fabrics pair with similarly substantial pieces; lightweight, smooth trousers pair with lightweight, refined tops and sleek shoes. Wool trousers + fine knit + loafers vs. heavy chinos + textured polo/Oxford + boots. Heavier trousers → heavier footwear; lighter trousers → sleeker footwear."
  }
];

const FitRules = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-4 sm:mb-6 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 text-left hover:bg-slate-50/60 transition-colors"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
          Fit Rules
        </span>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-3">
          {RULES.map((rule) => (
            <div key={rule.title} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <rule.icon size={14} className="text-indigo-500 flex-shrink-0" />
              <span className="truncate"><span className="font-semibold">{rule.title}:</span> {rule.summary}</span>
            </div>
          ))}
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 flex-shrink-0 transition-transform self-end sm:self-center ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-3 sm:px-5 pb-4 pt-1 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {RULES.map((rule) => (
            <div key={rule.title} className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <rule.icon size={14} className="text-indigo-500" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">{rule.title}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{rule.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FitRules;
