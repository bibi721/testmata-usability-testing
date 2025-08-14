/**
 * Reusable testimonial card component
 */
import React from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  image: string;
  content: string;
  rating: number;
  metric?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = React.memo(({
  name,
  role,
  company,
  image,
  content,
  rating,
  metric
}) => {
  return (
    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-slate-200">
      <Quote className="h-8 w-8 text-blue-600 mb-6" />
      
      <blockquote className="text-xl text-slate-700 mb-6 leading-relaxed">
        &ldquo;{content}&rdquo;
      </blockquote>

      {metric && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{metric}</div>
          <div className="text-sm text-blue-700">Key improvement achieved</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image
            src={image}
            alt={name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold text-slate-900">{name}</div>
            <div className="text-slate-600 text-sm">{role} at {company}</div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      </div>
    </div>
  );
});

TestimonialCard.displayName = 'TestimonialCard';