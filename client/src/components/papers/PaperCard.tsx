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
  topics?: PaperTopic[];
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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-3 rounded-md mb-4 text-sm text-blue-900 shadow-sm">
          {paper.summary}
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
