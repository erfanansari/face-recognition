'use client';

interface GenderSelectorProps {
  onGenderSelect: (gender: 'male' | 'female') => void;
}

export default function GenderSelector({ onGenderSelect }: GenderSelectorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Choose Your Avatar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onGenderSelect('male')}
            className="group p-8 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">👨</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Male Avatar
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Realistic male head model with defined jawline and features
              </p>
            </div>
          </button>

          <button
            onClick={() => onGenderSelect('female')}
            className="group p-8 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">👩</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Female Avatar
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Realistic female head model with softer features and contours
              </p>
            </div>
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            Select an avatar to start trying on virtual glasses in 3D
          </p>
        </div>
      </div>
    </div>
  );
}