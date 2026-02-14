import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import toast from 'react-hot-toast';
import { getScore, hasPartnerAnswered, claimPoints, compareAnswers } from '../utils/api';
import type { Score } from '../utils/types';

export default function ResultsPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const { user } = usePrivy();
  const navigate = useNavigate();

  const [score, setScore] = useState<Score | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerAnswered, setPartnerAnswered] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchScoreAndPartnerStatus();
  }, [questionId, user]);

  const fetchScoreAndPartnerStatus = async () => {
    try {
      setLoading(true);

      // Check if partner has answered
      const { data } = await hasPartnerAnswered(questionId!);
      setPartnerAnswered(data.hasAnswered);

      // If partner has answered, get the score
      if (data.hasAnswered && !score) {
        const { data: scoreData } = await getScore(questionId!);

        if (!scoreData.score) {
          const { data: compareData } = await compareAnswers(questionId!);
          setScore(compareData.score);
        } else {
          setScore(scoreData.score);
        }
      }
    } catch (error) {
      console.error('Error fetching score:', error);
      if (!loading) {
        toast.error('Failed to load results');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      setClaiming(true);
      await claimPoints(questionId!);
      toast.success('Points claimed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error claiming points:', error);
      toast.error('Failed to claim points');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!partnerAnswered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
            <span className="text-6xl block">⏳</span>
            <h2 className="text-2xl font-bold text-gray-800">Waiting for Your Partner</h2>
            <p className="text-gray-600">
              Your partner hasn't answered the questions yet. Once they do, you'll be able to see
              your compatibility results!
            </p>
            <button
              onClick={fetchScoreAndPartnerStatus}
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Refresh Results
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <p className="text-gray-600">Unable to load results, partner hasn't answered yet.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-pink-600 hover:text-pink-700 font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const highCompatibility = score.overallScore >= 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-pink-600 hover:text-pink-700 font-semibold flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Overall Score Card */}
        <div
          className={`rounded-2xl shadow-xl p-8 sm:p-12 mb-8 text-center ${
            highCompatibility
              ? 'bg-gradient-to-br from-pink-100 to-red-100'
              : 'bg-gradient-to-br from-blue-100 to-purple-100'
          }`}
        >
          <span className="text-6xl block mb-4">
            {highCompatibility ? '💕' : '😊'}
          </span>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {score.overallScore}% Compatible
          </h1>
          <p className="text-xl text-gray-700 mb-6">{score.mood} Connection</p>
          <p className="text-gray-600 text-lg mb-8">{score.overallFeedback}</p>

          {highCompatibility && (
            <button
              onClick={handleClaim}
              disabled={claiming || score.isClaimed}
              className={`px-8 py-4 rounded-lg font-bold text-white transition transform hover:scale-105 ${
                score.isClaimed
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              }`}
            >
              {claiming
                ? 'Claiming...'
                : score.isClaimed
                ? '✓ Points Claimed'
                : '🏆 Claim Your Points'}
            </button>
          )}
        </div>

        {/* Detailed Comparisons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Question-by-Question Comparison</h2>
 
          {score.comparisons.map((comparison, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              {/* Question */}
              <h3 className="text-lg font-bold text-gray-800 mb-6">
                {index + 1}. {comparison.question}
              </h3>

              {/* Compatibility Meter */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-gray-700">Compatibility</p>
                  <p className="text-2xl font-bold text-pink-600">{comparison.compatibility}%</p>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-600 to-red-600 transition-all duration-300"
                    style={{ width: `${comparison.compatibility}%` }}
                  />
                </div>
              </div>

              {/* Answers Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* User 1 Answer */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">{comparison.user1Name}</p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-gray-800">{comparison.user1Answer}</p>
                  </div>
                </div>

                {/* User 2 Answer */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">{comparison.user2Name}</p>
                  <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded">
                    <p className="text-gray-800">{comparison.user2Answer}</p>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                <p className="text-sm font-semibold text-gray-700 mb-1">Analysis</p>
                <p className="text-gray-700">{comparison.explanation}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-white border-2 border-pink-600 text-pink-600 hover:bg-pink-50 font-bold rounded-lg transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={fetchScoreAndPartnerStatus}
            className="px-8 py-3 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold rounded-lg transition"
          >
            Refresh Results
          </button>
        </div>
      </main>
    </div>
  );
}
