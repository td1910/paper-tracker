'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

interface Topic {
  id: number;
  name: string;
  description?: string;
}

interface UserTopic {
  id: number;
  fkTopicId: number;
  keywords: string | null;
  topic: Topic;
}

export default function ManageTopicsPage() {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [userTopics, setUserTopics] = useState<UserTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editKeywords, setEditKeywords] = useState('');
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [topicsRes, userTopicsRes] = await Promise.all([
        apiRequest('/topics'),
        apiRequest('/user-topics', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setAllTopics(topicsRes);
      setUserTopics(userTopicsRes);
    } catch (error) {
      console.error('Failed to load topics:', error);
      // If unauthorized, send to login
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [loadData, router]);

  const handleFollow = async (topicId: number) => {
    try {
      await apiRequest('/user-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ topicId })
      });
      await loadData();
    } catch (err) {
      alert('Failed to follow topic');
    }
  };

  const handleUnfollow = async (userTopicId: number) => {
    try {
      await apiRequest(`/user-topics/${userTopicId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await loadData();
    } catch (err) {
      alert('Failed to unfollow topic');
    }
  };

  const handleSaveKeywords = async (userTopicId: number) => {
    try {
      await apiRequest(`/user-topics/${userTopicId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ keywords: editKeywords })
      });
      setEditingId(null);
      await loadData();
    } catch (err) {
      alert('Failed to update keywords');
    }
  };

  if (isLoading) return <div className="p-12 text-center text-gray-500">Loading...</div>;

  const followedTopicIds = new Set(userTopics.map(ut => ut.fkTopicId));
  const availableTopics = allTopics.filter(t => !followedTopicIds.has(t.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-blue-900 hover:text-blue-700 transition">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Followed Topics Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Followed Topics</h2>
          <p className="text-sm text-gray-600 mb-6">
            These topics determine what appears in your personalized feed. You can add extra personal keywords to further refine your feed.
          </p>

          {userTopics.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-500">
              You aren't following any topics yet. Add some below!
            </div>
          ) : (
            <div className="space-y-4">
              {userTopics.map(ut => (
                <div key={ut.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{ut.topic.name}</h3>
                    
                    {editingId === ut.id ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={editKeywords}
                          onChange={e => setEditKeywords(e.target.value)}
                          placeholder="Extra keywords (comma separated)"
                          className="flex-1 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button onClick={() => handleSaveKeywords(ut.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Keywords:</span> {ut.keywords || 'None (using defaults)'}
                        </span>
                        <button onClick={() => { setEditingId(ut.id); setEditKeywords(ut.keywords || ''); }} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          (Edit)
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button onClick={() => handleUnfollow(ut.id)} className="shrink-0 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium transition">
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Topics Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Topics</h2>
          
          {availableTopics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You are following all available topics!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableTopics.map(topic => (
                <div key={topic.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center hover:border-blue-300 transition">
                  <div>
                    <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                    {topic.description && <p className="text-xs text-gray-500 mt-1">{topic.description}</p>}
                  </div>
                  <button onClick={() => handleFollow(topic.id)} className="shrink-0 ml-4 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-sm font-medium transition">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
