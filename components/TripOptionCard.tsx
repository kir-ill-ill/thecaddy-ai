'use client';

import React from 'react';
import { TripOption } from '@/lib/types';

interface TripOptionCardProps {
  option: TripOption;
  onSelect?: () => void;
  selected?: boolean;
}

export default function TripOptionCard({ option, onSelect, selected }: TripOptionCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all cursor-pointer hover:shadow-lg ${
        selected ? 'border-forest ring-2 ring-forest/10' : 'border-forest/10 hover:border-forest/30'
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className={`p-5 ${selected ? 'bg-forest/5' : 'bg-sand/30'}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{option.title}</h3>
            <p className="text-sm text-gray-600">{option.tagline}</p>
          </div>
          {selected && (
            <div className="bg-forest text-white rounded-full p-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span>📍</span>
          <span>{option.destination}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Cost */}
        <div className="mb-5 p-4 bg-forest/5 rounded-xl border border-forest/10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-forest font-semibold uppercase mb-1">Per Person</p>
              <p className="text-3xl font-bold text-forest">
                ${option.cost_estimate.per_person_estimated}
              </p>
              <p className="text-xs text-forest/70 mt-1">
                {option.cost_estimate.confidence} confidence
              </p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-gold/30 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-gold">{Math.round(option.score_breakdown.total)}</p>
                <p className="text-[10px] text-gray-500 font-medium">Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="mb-5">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>⛳</span>
            <span>Courses ({option.courses.length} rounds)</span>
          </h4>
          <div className="space-y-2">
            {option.courses.slice(0, 3).map((course, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-sand/30 rounded-lg p-2">
                <span className="text-gray-700 font-medium">{course.name}</span>
                <span className="text-xs text-gray-500 uppercase bg-white px-2 py-1 rounded font-semibold">
                  {course.role}
                </span>
              </div>
            ))}
            {option.courses.length > 3 && (
              <p className="text-xs text-gray-500 pl-2">+{option.courses.length - 3} more</p>
            )}
          </div>
        </div>

        {/* Lodging */}
        <div className="mb-5 p-3 bg-sand/30 rounded-lg">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Lodging</h4>
          <p className="text-sm font-semibold text-gray-900">
            {option.lodging.name_or_area}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {option.lodging.nights} nights · {option.lodging.type}
          </p>
        </div>

        {/* Why It Fits */}
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-900 mb-2">Why This Works</h4>
          <ul className="space-y-1.5">
            {option.why_it_fits.slice(0, 3).map((reason, idx) => (
              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-forest mt-0.5">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cost Breakdown */}
        <details className="text-xs group">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium py-2 border-t border-forest/10 flex justify-between items-center">
            <span>Cost Breakdown</span>
            <span className="group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="space-y-2 mt-3 pb-2">
            {[
              { label: 'Golf', amount: option.cost_estimate.breakdown.golf },
              { label: 'Lodging', amount: option.cost_estimate.breakdown.lodging },
              { label: 'Food', amount: option.cost_estimate.breakdown.food },
              { label: 'Transport', amount: option.cost_estimate.breakdown.local_transport },
              { label: 'Misc', amount: option.cost_estimate.breakdown.misc },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-gray-600">
                <span>{item.label}:</span>
                <span className="font-semibold">${item.amount}</span>
              </div>
            ))}
          </div>
        </details>

        {option.need_research && (
          <div className="mt-4 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
            <span className="mt-0.5">ℹ️</span>
            <span>Some details need research and may change</span>
          </div>
        )}
      </div>
    </div>
  );
}
