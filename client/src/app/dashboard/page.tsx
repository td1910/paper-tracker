'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
    } else {
      setUserId(storedUserId);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  if (!userId) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Paper Tracker Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition shadow-md"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Welcome!</h2>
          <p className="text-gray-600 mb-2">
            You are logged in with a secure ID:
          </p>
          <code className="block bg-gray-50 p-2 rounded text-sm text-blue-700 break-all mb-4">
            {userId}
          </code>
          <p className="text-gray-600">
            Soon you will be able to manage your topics and view research papers here.
          </p>
        </div>
      </div>
    </div>
  );
}
