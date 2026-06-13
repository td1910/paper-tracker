'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { PaperCard } from '@/components/papers/PaperCard';

interface Paper {
  id: number;
  arxivId: string;
  title: string;
  abstract: string;
  authors: string;
  publishedDate: string;
  url: string;
}

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (token) {
      setUserId(storedUserId);
    }
    loadPapers();
  }, [router]);

  const loadPapers = async () => {
    try {
      setIsLoading(true);
      // We don't necessarily need the token to fetch public papers, 
      // but apiRequest will attach it if it exists.
      const data = await apiRequest('/papers');
      setPapers(data);
    } catch (error) {
      console.error('Failed to load papers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualFetch = async () => {
    try {
      setIsFetching(true);
      await apiRequest('/papers/fetch-now');
      await loadPapers(); // Reload the list after fetching new ones
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
    setUserId(null); // Update state to reflect logout
    // We don't push to login, just stay on the public feed
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Latest Papers (cs.AI)</h2>
          
          <button
            onClick={handleManualFetch}
            disabled={isFetching}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white transition ${
              isFetching ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
            }`}
          >
            {isFetching ? 'Fetching from ArXiv...' : 'Fetch New Papers'}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading papers...</div>
        ) : papers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No papers found in your database.</p>
            <p className="text-sm text-gray-400">Click the "Fetch New Papers" button above to pull the latest research from arXiv.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
