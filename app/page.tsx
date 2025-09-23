'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import AvatarViewer from '@/components/AvatarViewer';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [faceLandmarks, setFaceLandmarks] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            3D Face Avatar Creator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload your photo to create a 3D avatar and try on virtual glasses
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          {!uploadedImage ? (
            <FileUpload
              onImageUpload={setUploadedImage}
              onLandmarksDetected={setFaceLandmarks}
            />
          ) : (
            <AvatarViewer
              image={uploadedImage}
              landmarks={faceLandmarks}
              onReset={() => {
                setUploadedImage(null);
                setFaceLandmarks(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
