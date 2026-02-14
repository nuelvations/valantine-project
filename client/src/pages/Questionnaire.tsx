import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getQuestion, submitAnswers } from '../utils/api';
import type { Question } from '../utils/types';
import { getUser } from '../utils/auth';

export default function Questionnaire() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [user, setUser] = useState({
    username: "",
    _id: ""
  });

  useEffect(() => {
    fetchQuestion();
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      toast.error('User not found. Please log in again.');
      navigate('/login');
    }
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);

      const response = await getQuestion(questionId!, user._id);
      if (response.data.questionCompleted) {
        navigate(`/results/${questionId}`);
        return;
      }

      setQuestion(response.data);
      setAnswers(new Array(response.data.questions.length).fill(''));
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Failed to load questions');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!answers[currentQuestionIndex]?.trim()) {
      toast.error('Please answer this question before continuing');
      return;
    }
    if (currentQuestionIndex < (question?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    const allAnswered = answers.every((answer) => answer.trim());
    if (!allAnswered) {
      toast.error('Please answer all questions');
      return;
    }

    try {
      setSubmitting(true);
      const formattedAnswers = question!.questions.map((q, index) => ({
        question: q,
        answer: answers[index],
      }));

      await submitAnswers({
        questionId: questionId!,
        username: user.username,
        userId: user._id,
        answers: formattedAnswers,
      });

      toast.success('Answers submitted successfully!');
      navigate(`/results/${questionId}`);
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error('Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Question not found</p>
        </div>
      </div>
    );
  }

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === question.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / question.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-pink-600 hover:text-pink-700 font-semibold flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          {/* Header Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {question.choice}
            </h1>
            <p className="text-gray-600 mb-4">{question.moodDescription}</p>
            <p className="text-sm text-gray-500">
              Mood: <span className="font-semibold">{question.mood}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-gray-700">
                Question {currentQuestionIndex + 1} of {question.questions.length}
              </p>
              <p className="text-sm text-gray-600">{Math.round(progress)}%</p>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-600 to-red-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {question.questions[currentQuestionIndex]}
            </h2>

            {/* Answer Textarea - Typeform Style */}
            <textarea
              value={answers[currentQuestionIndex]}
              onChange={handleAnswerChange}
              placeholder="Type your answer here..."
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition resize-none min-h-32"
              autoFocus
            />
          </div>

          {/* Character Count */}
          <p className="text-xs text-gray-500 mb-8">
            {answers[currentQuestionIndex]?.length || 0} characters
          </p>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {question.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (answers[currentQuestionIndex]?.trim()) {
                      setCurrentQuestionIndex(index);
                    } else {
                      toast.error('Please answer the current question first');
                    }
                  }}
                  className={`w-8 h-8 rounded-full font-semibold transition ${
                    index === currentQuestionIndex
                      ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white'
                      : answers[index]?.trim()
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 disabled:opacity-50 text-white font-semibold rounded-lg transition transform hover:scale-105"
              >
                {submitting ? 'Submitting...' : 'Submit Answers'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestionIndex]?.trim()}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 disabled:opacity-50 text-white font-semibold rounded-lg transition transform hover:scale-105"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
