import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../utils/api';
import { setUser } from '../utils/auth';

export default function UsernameSetupPage() {
  const { user } = usePrivy();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (username.trim().length > 20) {
      toast.error('Username must be 20 characters or less');
      return;
    }

    try {
      setLoading(true);
      const { data } = await loginUser(user!.email!.address, username.trim());

      setUser(data.user);
      toast.success('Username set successfully!');

      navigate('/dashboard');
    } catch (error) {
      console.error('Error setting username:', error);
      toast.error('Failed to set username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              ❤️ Almost There!
            </h1>
            <p className="text-gray-600">Choose your username</p>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                maxLength={20}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {username.length}/20 characters
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !username.trim()}
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
            >
              {loading ? 'Setting up...' : 'Continue to Dashboard'}
            </button>
          </form>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-gray-700">
              <span className="font-semibold">💡 Tip:</span> Your username will be visible to your partner when you share questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
