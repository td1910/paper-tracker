'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { PaperCard } from '@/components/papers/PaperCard';

interface Topic {
  id: number;
  name: string;
  description?: string;
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
  topics: PaperTopic[];
}

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();

  const loadPapers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest('/papers');
      setPapers(data);
    } catch (error) {
      console.error('Failed to load papers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (token) setUserId(storedUserId);

    // Load papers and topics in parallel
    Promise.all([
      loadPapers(),
      apiRequest('/topics').then(setTopics).catch(console.error),
    ]);
  }, [loadPapers]);

  const handleManualFetch = async () => {
    try {
      setIsFetching(true);
      await apiRequest('/papers/fetch-now');
      await loadPapers();
    } catch (error) {
      console.error('Failed to fetch from ArXiv:', error);
      alert('Failed to fetch papers from ArXiv. See console.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUserId(null);
  };

  const toggleTopic = (topicId: number) => {
    setSelectedTopicIds(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const clearFilter = () => setSelectedTopicIds(new Set());

  const filteredPapers =
    selectedTopicIds.size === 0
      ? papers
      : papers.filter(p =>
          p.topics?.some(pt => selectedTopicIds.has(pt.fkTopicId))
        );

  const paperCountForTopic = (topicId: number) =>
    papers.filter(p => p.topics?.some(pt => pt.fkTopicId === topicId)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-blue-900">Paper Tracker</h1>
            {userId ? (
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 text-sm font-medium transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">Topics</h3>
              {selectedTopicIds.size > 0 && (
                <button
                  onClick={clearFilter}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* All option */}
            <label className="flex items-center gap-2 py-1.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedTopicIds.size === 0}
                onChange={clearFilter}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">All</span>
              <span className="ml-auto text-xs text-gray-400">{papers.length}</span>
            </label>

            <div className="border-t border-gray-100 mt-2 pt-2 space-y-0.5">
              {topics.map(topic => {
                const count = paperCountForTopic(topic.id);
                return (
                  <label
                    key={topic.id}
                    className="flex items-center gap-2 py-1.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopicIds.has(topic.id)}
                      onChange={() => toggleTopic(topic.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-tight">
                      {topic.name}
                    </span>
                    <span className="ml-auto text-xs text-gray-400 shrink-0">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedTopicIds.size === 0
                  ? 'Latest Papers'
                  : `${filteredPapers.length} paper${filteredPapers.length !== 1 ? 's' : ''} in ${selectedTopicIds.size} topic${selectedTopicIds.size !== 1 ? 's' : ''}`}
              </h2>
              {selectedTopicIds.size > 0 && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {topics
                    .filter(t => selectedTopicIds.has(t.id))
                    .map(t => t.name)
                    .join(', ')}
                </p>
              )}
            </div>

            <button
              onClick={handleManualFetch}
              disabled={isFetching}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white transition shrink-0 ${
                isFetching
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
              }`}
            >
              {isFetching ? 'Fetching all topics…' : 'Fetch New Papers'}
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading papers...</div>
          ) : filteredPapers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 mb-2">
                {papers.length === 0
                  ? 'No papers in the database yet.'
                  : 'No papers match the selected topics.'}
              </p>
              {papers.length === 0 && (
                <p className="text-sm text-gray-400">
                  Click "Fetch New Papers" to pull the latest research from arXiv.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPapers.map(paper => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
