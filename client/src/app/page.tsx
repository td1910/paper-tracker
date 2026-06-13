'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<number>>(new Set());
  const [favoritedPaperIds, setFavoritedPaperIds] = useState<Set<number>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
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
    const storedUserEmail = localStorage.getItem('userEmail');
    if (token) {
      setUserId(storedUserId);
      setUserEmail(storedUserEmail);
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const fetchedPapers = await apiRequest('/papers');
        setPapers(fetchedPapers);

        const allTopics = await apiRequest('/topics');
        setTopics(allTopics);

        if (token) {
          const ut = await apiRequest('/user-topics', { headers: { Authorization: `Bearer ${token}` } });
          const userFollowedTopicIds = ut.map((u: any) => u.fkTopicId);
          if (userFollowedTopicIds.length > 0) {
            setSelectedTopicIds(new Set(userFollowedTopicIds));
          }

          const favs = await apiRequest('/papers/my-favorites', { headers: { Authorization: `Bearer ${token}` } });
          setFavoritedPaperIds(new Set(favs));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSearching(true);
      if (searchQuery.trim() === '') {
        await loadPapers();
      } else {
        const results = await apiRequest(`/papers/search?q=${encodeURIComponent(searchQuery)}`);
        setPapers(results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    setUserId(null);
    setUserEmail(null);
    setFavoritedPaperIds(new Set());
    setShowFavoritesOnly(false);
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

  const clearFilter = () => {
    setSelectedTopicIds(new Set());
    setShowFavoritesOnly(false);
  };

  const handleToggleFavorite = async (paperId: number, newState: boolean) => {
    try {
      setFavoritedPaperIds(prev => {
        const next = new Set(prev);
        if (newState) next.add(paperId);
        else next.delete(paperId);
        return next;
      });

      const token = localStorage.getItem('token');
      if (token) {
        await apiRequest(`/papers/${paperId}/favorite`, {
          method: newState ? 'POST' : 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const filteredPapers = papers.filter(p => {
    if (showFavoritesOnly && !favoritedPaperIds.has(p.id)) return false;
    if (!showFavoritesOnly && selectedTopicIds.size > 0 && !p.topics?.some(pt => selectedTopicIds.has(pt.fkTopicId))) return false;
    return true;
  });

  const paperCountForTopic = (topicId: number) =>
    papers.filter(p => p.topics?.some(pt => pt.fkTopicId === topicId)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-blue-900 shrink-0">Paper Tracker</h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers by keyword..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  {isSearching ? (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <button type="submit" className="hidden">Search</button>
              </div>
            </form>

            {userId ? (
              <div className="flex gap-4 items-center">
                <span className="text-sm text-gray-700 font-medium">{userEmail}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 text-sm font-medium transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => router.push('/login')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition shadow-sm"
                >
                  Sign Up
                </button>
              </div>
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
              <div className="flex items-center gap-2">
                {userId && (
                  <Link href="/settings/topics" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Manage
                  </Link>
                )}
                {selectedTopicIds.size > 0 && (
                  <button
                    onClick={clearFilter}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* All option */}
            <label className="flex items-center gap-2 py-1.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedTopicIds.size === 0 && !showFavoritesOnly}
                onChange={clearFilter}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">All</span>
              <span className="ml-auto text-xs text-gray-400">{papers.length}</span>
            </label>

            {/* Favorites option */}
            {userId && (
              <label className="flex items-center gap-2 py-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => {
                    setShowFavoritesOnly(e.target.checked);
                    if (e.target.checked) setSelectedTopicIds(new Set());
                  }}
                  className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-red-600 group-hover:text-red-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                  My Favorites
                </span>
                <span className="ml-auto text-xs text-gray-400">{favoritedPaperIds.size}</span>
              </label>
            )}

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
                {showFavoritesOnly
                  ? 'My Favorites'
                  : selectedTopicIds.size === 0
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
                <PaperCard 
                  key={paper.id} 
                  paper={paper} 
                  isFavorited={favoritedPaperIds.has(paper.id)}
                  onToggleFavorite={userId ? handleToggleFavorite : undefined}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
