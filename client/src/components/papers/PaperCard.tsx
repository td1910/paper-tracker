import { useState } from 'react';

interface Topic {
  id: number;
  name: string;
}

interface PaperTopic {
  fkTopicId: number;
  topic: Topic;
}

interface Paper {
  id: number;
  arxivId: string;
  title: string;
  abstract: string;
  authors: string;
  publishedDate: string;
  url: string;
  summary?: string;
  readabilityScore?: number | null;
  topics?: PaperTopic[];
}

interface PaperCardProps {
  paper: Paper;
  isFavorited?: boolean;
  onToggleFavorite?: (paperId: number, newState: boolean) => void;
}

export function PaperCard({ paper, isFavorited = false, onToggleFavorite }: PaperCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Simple formatting for the date
  const formattedDate = new Date(paper.publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col relative group">
      {onToggleFavorite && (
        <button 
          onClick={() => onToggleFavorite(paper.id, !isFavorited)}
          className="absolute top-6 right-6 text-gray-400 hover:scale-110 transition-transform focus:outline-none"
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={isFavorited ? "currentColor" : "none"} 
            stroke="currentColor" 
            className={`w-6 h-6 ${isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      )}
      
      <div className="flex justify-between items-start mb-2 pr-10">
        <h3 className="text-xl font-bold text-blue-900 leading-tight">
          <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {paper.title}
          </a>
        </h3>
        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
          {formattedDate}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 font-medium">
        {paper.authors}
      </p>

      {paper.topics && paper.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {paper.topics.map(pt => (
            <span key={pt.fkTopicId} className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
              {pt.topic.name}
            </span>
          ))}
        </div>
      )}

      {paper.summary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-3 rounded-md mb-4 shadow-sm flex flex-col gap-2">
          {paper.readabilityScore !== undefined && paper.readabilityScore !== null && (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                paper.readabilityScore >= 8 ? 'bg-green-500' : 
                paper.readabilityScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                AI Score: {paper.readabilityScore}/10
              </span>
              <span className="text-xs text-blue-800/60 font-bold uppercase tracking-wider">Readability</span>
            </div>
          )}
          <div className="text-sm text-blue-900">
            {paper.summary}
          </div>
        </div>
      )}

      <div className="text-gray-700 text-sm mt-auto">
        <p className={`${!isExpanded && 'line-clamp-3'}`}>
          <span className="font-semibold block mb-1">Abstract:</span>
          {paper.abstract}
        </p>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 font-semibold mt-2 text-sm focus:outline-none"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </button>
      </div>
    </div>
  );
}
