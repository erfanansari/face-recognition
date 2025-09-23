'use client';

interface GlassesSelectorProps {
  selectedGlasses: string | null;
  onSelectGlasses: (glassesType: string | null) => void;
}

const glassesOptions = [
  {
    id: 'aviator',
    name: 'Aviator',
    description: 'Classic teardrop shape',
    preview: '🕶️'
  },
  {
    id: 'round',
    name: 'Round',
    description: 'Vintage circular frames',
    preview: '👓'
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Modern rectangular frames',
    preview: '🤓'
  }
];

export default function GlassesSelector({ selectedGlasses, onSelectGlasses }: GlassesSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Try On Glasses
      </h3>

      <div className="space-y-3">
        <button
          onClick={() => onSelectGlasses(null)}
          className={`w-full p-3 rounded-lg border transition-all ${
            selectedGlasses === null
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">👤</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              No Glasses
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Original avatar
            </div>
          </div>
        </button>

        {glassesOptions.map((glasses) => (
          <button
            key={glasses.id}
            onClick={() => onSelectGlasses(glasses.id)}
            className={`w-full p-3 rounded-lg border transition-all ${
              selectedGlasses === glasses.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{glasses.preview}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {glasses.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {glasses.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
          Click any style to instantly try it on your 3D avatar
        </p>
      </div>
    </div>
  );
}