'use client';

interface UpgradePromptProps {
  onUpgrade: () => void;
  onCancel: () => void;
}

export default function UpgradePrompt({ onUpgrade, onCancel }: UpgradePromptProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-bounce-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 gradient-warning rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-glow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Pro</h3>
          <p className="text-gray-600">
            You've reached the free plan limit
          </p>
        </div>

        {/* Content */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Free Plan</h4>
                <p className="text-sm text-gray-600">Current plan</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-400">3</div>
                <div className="text-xs text-gray-500">notes max</div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full w-full"></div>
            </div>
            <p className="text-sm text-red-600 font-medium mt-2">Limit reached!</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Pro Plan</h4>
                <p className="text-sm text-gray-600">Unlock unlimited potential</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold gradient-text">∞</div>
                <div className="text-xs text-gray-500">unlimited notes</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited notes creation
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced organization features
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority support
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="btn btn-secondary flex-1 px-6 py-3"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Maybe Later
          </button>
          <button
            onClick={onUpgrade}
            className="btn btn-primary flex-1 px-6 py-3 shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Upgrade Now
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Upgrade is instant and free for this demo
          </p>
        </div>
      </div>
    </div>
  );
}
