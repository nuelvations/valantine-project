import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../utils/auth';
import { checkUser } from '../utils/api';

export default function LoginPage() {
  const { login, user } = usePrivy();
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      (async () => {
        setChecking(true);
        const { data } = await checkUser(user.email?.address as string);
        if (data?.exists) {
          setUser(data.user);
          navigate('/dashboard');
        } else {
          navigate('/username-setup');
        }
        setChecking(false);
      })();
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              ❤️ Tangle
            </h1>
            <p className="text-gray-600 text-lg">Test Your Connection</p>
            <p className="text-gray-500 text-sm">Generate questions with ai, share with your partner/friend, and see how well you match!</p>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-gray-800">Generate Questions</p>
                <p className="text-sm text-gray-600">Generate questions for you, your partner or friend</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💞</span>
              <div>
                <p className="font-semibold text-gray-800">Share & Compare</p>
                <p className="text-sm text-gray-600">Get instant compatibility reports</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold text-gray-800">Earn Points</p>
                <p className="text-sm text-gray-600">Track your connection strength</p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <button
          disabled={checking}
            onClick={() => login()}
            className={`w-full bg-gradient-to-r from-pink-600 shadow-lg to-red-600 text-white font-bold py-3 px-6 rounded-lg ${checking ? "" : "transition duration-300 transform hover:scale-105 hover:from-pink-700 hover:to-red-700"}`}
          >
            {checking ? "Signing In..." : "Sign In with Email"}
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            Secure login powered by <span className="font-semibold">Privy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
