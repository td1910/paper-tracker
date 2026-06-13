import { useState, useEffect } from 'react';

interface Paper {
  id: number;
  arxivId: string;
  title: string;
  abstract: string;
  authors: string;
  publishedDate: string;
  url: string;
}

export function PaperCard({ paper }: { paper: Paper }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Simple formatting for the date
  const formattedDate = new Date(paper.publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
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

      <div className="text-gray-700 text-sm">
        <p className={`${!isExpanded && 'line-clamp-3'}`}>
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
