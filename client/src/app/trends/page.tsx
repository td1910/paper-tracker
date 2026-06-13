'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

interface TrendingPaper {
  id: number;
  title: string;
  url: string;
  publishedDate: string;
  favoriteCount: number;
}

interface Trend {
  id: number;
  name: string;
  topPapers: TrendingPaper[];
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const data = await apiRequest('/topics/trends');
        setTrends(data);
      } catch (err) {
        console.error('Failed to fetch trends:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrends();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-blue-900 shrink-0">Paper Tracker</h1>
              <div className="flex items-center gap-4 border-l pl-6 border-gray-200">
                <Link href="/" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition">
                  Feed
                </Link>
                <Link href="/trends" className="text-sm font-medium text-blue-600 transition">
                  Trends 🔥
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-red-500">🔥</span> Trending Papers
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            The most favorited and talked-about papers in each topic.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading trending papers...</div>
        ) : trends.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">No data available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trends.map((trend) => (
              <div key={trend.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-blue-50/50">
                  <h3 className="font-bold text-blue-900 text-lg truncate" title={trend.name}>
                    {trend.name}
                  </h3>
                </div>
                <div className="p-0 flex-1">
                  {trend.topPapers.length === 0 ? (
                    <div className="p-6 text-sm text-center text-gray-400">No popular papers yet.</div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {trend.topPapers.map((paper, index) => (
                        <li key={paper.id} className="p-4 hover:bg-gray-50 transition flex items-start gap-3 group">
                          <span className={`text-sm font-bold mt-0.5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-300'}`}>
                            #{index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
                              {paper.title}
                            </a>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                ❤️ {paper.favoriteCount}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(paper.publishedDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
