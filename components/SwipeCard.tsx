'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DollarSign, X, Heart, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface Course {
  name: string;
  role?: string;
  holes?: number;
}

interface TripOptionCard {
  id: string;
  title: string;
  tagline?: string;
  destination: string;
  courses: Course[];
  cost_estimate: {
    per_person_estimated: number;
  };
  why_it_fits: string[];
  score_breakdown?: {
    total: number;
  };
}

interface SwipeCardProps {
  option: TripOptionCard;
  onSwipe: (direction: 'left' | 'right') => void;
  isActive: boolean;
  isNext?: boolean;
}

export function SwipeCard({ option, onSwipe, isActive, isNext }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const SWIPE_THRESHOLD = 100;

  const handleDragStart = useCallback((clientX: number) => {
    if (!isActive) return;
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(0);
  }, [isActive]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || !isActive) return;
    const deltaX = clientX - startX;
    setCurrentX(deltaX);

    if (deltaX > SWIPE_THRESHOLD / 2) {
      setSwipeDirection('right');
    } else if (deltaX < -SWIPE_THRESHOLD / 2) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
  }, [isDragging, isActive, startX]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !isActive) return;
    setIsDragging(false);

    if (Math.abs(currentX) > SWIPE_THRESHOLD) {
      const direction = currentX > 0 ? 'right' : 'left';
      // Animate out
      setCurrentX(direction === 'right' ? window.innerWidth : -window.innerWidth);
      setTimeout(() => {
        onSwipe(direction);
        setCurrentX(0);
        setSwipeDirection(null);
      }, 300);
    } else {
      setCurrentX(0);
      setSwipeDirection(null);
    }
  }, [isDragging, isActive, currentX, onSwipe]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleDragEnd();

  // Button handlers for accessibility
  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (!isActive) return;
    setSwipeDirection(direction);
    setCurrentX(direction === 'right' ? window.innerWidth : -window.innerWidth);
    setTimeout(() => {
      onSwipe(direction);
      setCurrentX(0);
      setSwipeDirection(null);
    }, 300);
  };

  const rotation = currentX * 0.03;
  const opacity = 1 - Math.abs(currentX) / (window.innerWidth || 500);

  if (!isActive && !isNext) return null;

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 ${isActive ? 'z-20' : 'z-10'}`}
      style={{
        transform: isActive
          ? `translateX(${currentX}px) rotate(${rotation}deg)`
          : 'scale(0.95) translateY(10px)',
        opacity: isActive ? opacity : 0.7,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicators */}
      {isActive && swipeDirection && (
        <div className="absolute inset-4 pointer-events-none z-30">
          {swipeDirection === 'right' && (
            <div className="absolute top-4 left-4 px-4 py-2 bg-green-500 text-white font-bold text-2xl rounded-lg transform -rotate-12 border-4 border-green-600">
              YES!
            </div>
          )}
          {swipeDirection === 'left' && (
            <div className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white font-bold text-2xl rounded-lg transform rotate-12 border-4 border-red-600">
              NOPE
            </div>
          )}
        </div>
      )}

      {/* Card content */}
      <div className="h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col cursor-grab active:cursor-grabbing border-2 border-gray-100">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-1">{option.title}</h2>
            {option.tagline && (
              <p className="text-emerald-100 text-sm">{option.tagline}</p>
            )}
            <div className="flex items-center gap-2 mt-3 text-emerald-100">
              <MapPin className="w-4 h-4" />
              <span>{option.destination}</span>
            </div>
          </div>
        </div>

        {/* Price badge */}
        <div className="px-6 -mt-4 relative z-10">
          <div className="inline-flex items-center gap-1 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-emerald-100">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">
              {option.cost_estimate.per_person_estimated}
            </span>
            <span className="text-sm text-gray-500">/person</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Courses */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">⛳</span> Courses
            </h3>
            <div className="space-y-2">
              {option.courses.slice(0, 4).map((course, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <span className="font-medium text-gray-800">{course.name}</span>
                  {course.holes && (
                    <span className="text-sm text-gray-500">{course.holes} holes</span>
                  )}
                </div>
              ))}
              {option.courses.length > 4 && (
                <p className="text-sm text-gray-500 text-center">
                  +{option.courses.length - 4} more courses
                </p>
              )}
            </div>
          </div>

          {/* Why it fits */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Why This Works</h3>
            <div className="flex flex-wrap gap-2">
              {option.why_it_fits.slice(0, 4).map((reason, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {isActive && (
          <div className="p-6 pt-0">
            <div className="flex justify-center gap-8">
              <button
                onClick={() => handleButtonSwipe('left')}
                className="w-16 h-16 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition shadow-lg active:scale-95"
              >
                <X className="w-8 h-8 text-red-500" />
              </button>
              <button
                onClick={() => handleButtonSwipe('right')}
                className="w-16 h-16 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition shadow-lg active:scale-95"
              >
                <Heart className="w-8 h-8 text-green-500" />
              </button>
            </div>
            <p className="text-center text-gray-500 text-sm mt-3">
              Swipe right to vote YES, left to skip
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface SwipeStackProps {
  options: TripOptionCard[];
  onComplete: (votes: { optionId: string; vote: 'yes' | 'no' }[]) => void;
}

export function SwipeStack({ options, onComplete }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<{ optionId: string; vote: 'yes' | 'no' }[]>([]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentOption = options[currentIndex];
    const newVote = {
      optionId: currentOption.id,
      vote: direction === 'right' ? 'yes' as const : 'no' as const,
    };

    const newVotes = [...votes, newVote];
    setVotes(newVotes);

    if (currentIndex === options.length - 1) {
      // All cards swiped
      setTimeout(() => onComplete(newVotes), 300);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, options, votes, onComplete]);

  const progress = ((currentIndex) / options.length) * 100;
  const yesVotes = votes.filter(v => v.vote === 'yes').length;

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} of {options.length}
          </span>
          <span className="text-sm font-medium text-emerald-600">
            {yesVotes} selected
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Cards container */}
      <div className="flex-1 relative overflow-hidden p-4">
        {options.map((option, index) => {
          if (index < currentIndex) return null;
          return (
            <SwipeCard
              key={option.id}
              option={option}
              onSwipe={handleSwipe}
              isActive={index === currentIndex}
              isNext={index === currentIndex + 1}
            />
          );
        })}

        {currentIndex >= options.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Done!</h3>
              <p className="text-gray-600">
                You voted YES on {yesVotes} option{yesVotes !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation hint */}
      {currentIndex < options.length && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Skip</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Vote Yes</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
