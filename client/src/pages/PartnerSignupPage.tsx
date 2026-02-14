import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import toast from 'react-hot-toast';
import { getQuestion, checkUser, loginUser } from '../utils/api';
import type { Question } from '../utils/types';
import { getUser, setUser } from '../utils/auth';

export default function PartnerSignupPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const { user, login, ready } = usePrivy();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [signingUp, setSigningUp] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  useEffect(() => {
    if (user && question) {
      handleAutoSignup();
      setLoading(false);
    }
  }, [user, question]);

  const fetchQuestion = async () => {
    try {
      const storedUser = getUser();

      const response = await getQuestion(questionId!, storedUser._id ?? "");

      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Question not found');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSignup = async () => {
    try {
      const userEmail = user?.email?.address as unknown as string;
      if (userEmail) {
        const { data } = await checkUser(userEmail);

        if (data.exists) {
          setUser(data.user);
        } else {
          const { data: createData } = await loginUser(userEmail, username.trim());
          setUser(createData.user);
        }

        // Redirect to questionnaire after signup
        navigate(`/questionnaire/${questionId}`);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('Error signing up');
    }
  };

  const handleContinue = () => {

    if (!username.trim()) {
      toast.error('Please enter your username');
      return;
    }

    setSigningUp(true);
    // Trigger Privy login after setting username
    login();
  };

  if (loading || !ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Question not found</p>
          <button
            onClick={() => navigate('/login')}
            className="text-pink-600 hover:text-pink-700 font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-4xl block">💕</span>
            <h1 className="text-2xl font-bold text-gray-800">
              You've Been Invited!
            </h1>
            <p className="text-gray-600">
              {question.choice}
            </p>
            <p className="text-sm text-gray-500">
              {question.moodDescription}
            </p>
          </div>

          {/* Question Preview */}
          <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
            <p className="font-semibold text-gray-800 text-sm">Questions you'll answer:</p>
            <ul className="space-y-2">
              {question.questions.map((q, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                  <span className="font-bold text-pink-600 flex-shrink-0">{index + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
              />
            </div>

            <p className="text-xs text-gray-500">
              Next, you'll be asked to verify your email for security.
            </p>

            <button
              type="button"
              disabled={signingUp || !username.trim()}
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
            >
              {signingUp ? 'Signing Up...' : 'Continue to Verify Email'}
            </button>
          </form>

          {/* Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-xs text-blue-900">
              💡 <span className="font-semibold">How it works:</span> Create an account, answer the questions, and see your compatibility score with your partner!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
