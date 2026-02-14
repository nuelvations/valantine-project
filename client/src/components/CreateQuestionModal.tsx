import { useState } from 'react';
import toast from 'react-hot-toast';
import { createQuestion } from '../utils/api';
import ShareLinkModal from './ShareLinkModal';
import { getUser } from '../utils/auth';

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (questionId: string) => void;
}

const MOOD_OPTIONS = [
  { value: 'Casual/Playful', label: '😄 Fun & Playful' },
  { value: 'Flirty/Romantic', label: '❤️ Romantic & Flirty' },
  { value: 'Deep/Intimate', label: '🌙 Deep & Thoughtful' },
  { value: 'Spicy/Sensual', label: '🔥 Spicy & Sensual' },
  { value: 'Erotic/Naughty', label: '😈 Erotic & Naughty' },
];

export default function CreateQuestionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateQuestionModalProps) {
  const [step, setStep] = useState<'form' | 'share'>('form');
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [questionId, setQuestionId] = useState('');

  const [formData, setFormData] = useState({
    mood: 'Casual/Playful',
    choice: 'game', // 'game' or 'conversation'
    context: '',
  });

  const handleMoodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, mood: value }));
  };

  const handleChoiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, choice: value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, context: e.target.value }));
  };

  const handleSubmit = async () => {

    try {
      setLoading(true);

      const storedUser = getUser();

      const { data } = await createQuestion({
        userId: storedUser?._id,
        mood: formData.mood,
        choice: formData.choice,
        context: formData.context,
      });

      setQuestionId(data.questionId);
      const baseUrl = window.location.origin;

      setShareLink(`${baseUrl}/partner/${data.questionId}`);
      setStep('share');
      toast.success('Questionnaire created!');
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    onSuccess(questionId);
    handleClose();
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      mood: 'Casual/Playful',
      choice: '',
      context: '',
    });
    setShareLink('');
    setQuestionId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {step === 'form' ? (
        // Form Step
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-red-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Create Questions for Your Partner</h2>
              <button
                onClick={handleClose}
                className="text-white hover:bg-pink-700 p-2 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form className="p-8 space-y-6">
              {/* Field 1: Mood Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mood / Category
                </label>
                <select
                  value={formData.mood}
                  onChange={(e) => handleMoodChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition"
                >
                  {MOOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 1.5: Game vs Conversation Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Experience Type
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChoiceChange('game')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                      formData.choice === 'game'
                        ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    🎮 Game
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChoiceChange("conversation")}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                      formData.choice === 'conversation'
                        ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    💬 Conversation
                  </button>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border leaf border-blue-200">
                  <p className="text-xs text-gray-700 mb-2">
                    <span className="font-semibold">🎮 Game:</span> Quick-fire questions for a fun, engaging experience.
                  </p>
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">💬 Conversation:</span> Deeper, thought-provoking questions for meaningful dialogue.
                  </p>
                </div>
              </div>

              {/* Field 2: Mood context */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Describe the Mood Context (optional)
                </label>
                <textarea
                  value={formData.context}
                  onChange={handleDescriptionChange}
                  placeholder="Describe the vibe of the questions..., e.g We're in the early stages of dating and want to have some fun and playful questions to get to know each other better"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-600 transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
              >
                {loading ? 'Creating...' : 'Create & Get Share Link'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Share Step
        <ShareLinkModal
          shareLink={shareLink}
          onProceed={handleProceed}
          onClose={handleClose}
        />
      )}
    </>
  );
}
