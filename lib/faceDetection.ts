import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class FileDetector {
  private faceLandmarker: FaceLandmarker | null = null;
  private static instance: FileDetector | null = null;

  static getInstance(): FileDetector {
    if (!FileDetector.instance) {
      FileDetector.instance = new FileDetector();
    }
    return FileDetector.instance;
  }

  async initialize() {
    if (this.faceLandmarker) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'CPU'
        },
        runningMode: 'IMAGE',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false
      });
    } catch (error) {
      console.error('Failed to initialize face detector:', error);
      throw error;
    }
  }

  async detectFaceLandmarks(file: File) {
    try {
      await this.initialize();

      if (!this.faceLandmarker) {
        throw new Error('Face detector not initialized');
      }

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = async () => {
          try {
            // Create canvas to ensure proper image format
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              reject(new Error('Failed to create canvas context'));
              return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Detect face landmarks
            const results = this.faceLandmarker!.detect(canvas);

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
              resolve({
                landmarks: results.faceLandmarks[0],
                width: img.width,
                height: img.height
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Face detection error:', error);
            reject(error);
          } finally {
            URL.revokeObjectURL(img.src);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('Detection failed:', error);
      throw error;
    }
  }
}