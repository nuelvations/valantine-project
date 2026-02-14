import { useState } from 'react';
import toast from 'react-hot-toast';

interface ShareLinkModalProps {
  shareLink: string;
  onProceed: () => void;
  onClose: () => void;
}

export default function ShareLinkModal({
  shareLink,
  onProceed,
  onClose,
}: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Answer Tangle Questions',
          text: 'Check how well we match! Answer questions and let\'s see our compatibility score.',
          url: shareLink,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-red-600 text-white p-6 rounded-t-2xl text-center">
          <span className="text-4xl block mb-2">🎉</span>
          <h2 className="text-2xl font-bold">Share Questions!</h2>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-gray-700 text-center">
            Share this link with your partner or friend and answer questions.
          </p>

          {/* Share Link Display */}
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between gap-3 border-2 border-gray-200">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none truncate font-mono"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-pink-600 text-white hover:bg-pink-700'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center space-x-2"
            >
              <span>📱</span>
              <span>Share via Device Options</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      `Check how well we match! ${shareLink}`
                    )}`,
                    '_blank'
                  )
                }
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                WhatsApp
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      shareLink
                    )}`,
                    '_blank'
                  )
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Facebook
              </button>
            </div>
          </div>

          {/* Proceed Button */}
          <button
            onClick={onProceed}
            className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Proceed to Answer Questions
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
