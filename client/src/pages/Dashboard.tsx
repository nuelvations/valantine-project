import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CreateQuestionModal from '../components/CreateQuestionModal';
import { getUserStats, getQuestionsByUser } from '../utils/api';
import { getUser } from '../utils/auth';
import type { UserStats, Question } from '../utils/types';

export default function Dashboard() {
  const { user, logout } = usePrivy();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    questionsCreated: 0,
    moneyEarned: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchStats();
    fetchQuestions();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const storedUser = getUser();
      if (storedUser) {
        const response = await getUserStats(storedUser._id);
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if error
      setStats({
        totalPoints: 0,
        questionsCreated: 0,
        moneyEarned: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const storedUser = getUser();
      if (storedUser) {
        const response = await getQuestionsByUser(storedUser._id);
        setQuestions(response.data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleQuestionCreated = (questionId: string) => {
    setIsModalOpen(false);
    toast.success('Question created successfully!');
    fetchStats();
    fetchQuestions();

    navigate(`/questionnaire/${questionId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">❤️</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              Tangle
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 text-sm">
              Welcome, <span className="font-semibold">{user?.email?.address}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Create Question Button */}
        <div className="mb-12">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg text-lg flex items-center space-x-2"
          >
            <span>✨</span>
            <span>Generate Questions for Your Partner</span>
          </button>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Points Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide">
                  Total Points
                </h3>
                <span className="text-3xl">⭐</span>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stats.totalPoints}
              </p>
              <p className="text-gray-500 text-sm mt-2">Points earned from matches</p>
            </div>

            {/* Questions Created Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide">
                  Questions Created
                </h3>
                <span className="text-3xl">❓</span>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                {stats.questionsCreated}
              </p>
              <p className="text-gray-500 text-sm mt-2">Questionnaires you've made</p>
            </div>

            {/* Money Earned Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide">
                  Money Earned
                </h3>
                <span className="text-3xl">💰</span>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ${stats.moneyEarned.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm mt-2">Earnings from claimed matches</p>
            </div>
          </div>
        )}

        {/* Recent Activity or Empty State */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Questions</h2>
          
          {questionsLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-4">📝</span>
              <p className="text-gray-600 text-lg mb-4">No questions created yet</p>
              <p className="text-gray-500 mb-6">Create your first question to get started!</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Create First Question
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {questions.map((question) => (
                <div
                  key={question._id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-pink-600 hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/results/${question._id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{question.choice}</h3>
                      <p className="text-sm text-gray-600 mt-1">{question.mood}</p>
                    </div>
                    <span className="text-2xl">💭</span>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4">{question.moodDescription}</p>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-600 mb-3">
                      <span className="font-semibold">{question.questions.length}</span> questions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {question.questions.slice(0, 2).map((q, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded"
                        >
                          {q.substring(0, 25)}...
                        </span>
                      ))}
                      {question.questions.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          +{question.questions.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      const baseUrl = window.location.origin;
                      const shareLink = `${baseUrl}/partner/${question._id}`;

                      navigator.clipboard.writeText(shareLink);
                      toast.success('Link copied to clipboard!');
                    }}
                    className="w-full mt-4 text-pink-600 hover:bg-pink-50 font-semibold py-2 px-4 rounded-lg transition border border-pink-600"
                  >
                    📋 Copy Share Link
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it Works Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">How it Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">1️⃣</div>
              <p className="font-semibold text-gray-800">Generate Questions</p>
              <p className="text-sm text-gray-600 mt-2">
                Get up to 5 questions for you and your partner to answer based on your chosen mood and category.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">2️⃣</div>
              <p className="font-semibold text-gray-800">Share Link</p>
              <p className="text-sm text-gray-600 mt-2">
                Share the unique link with your partner
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">3️⃣</div>
              <p className="font-semibold text-gray-800">See Results</p>
              <p className="text-sm text-gray-600 mt-2">
                View compatibility score and earn points!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Create Question Modal */}
      <CreateQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(questionId: string) => handleQuestionCreated(questionId)}
      />
    </div>
  );
}
