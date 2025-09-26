'use client';

import AvatarViewer from '@/components/AvatarViewer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            3D Head Model
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Realistic 3D head with virtual glasses try-on
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          <AvatarViewer />
        </div>
      </div>
    </div>
  );
}
