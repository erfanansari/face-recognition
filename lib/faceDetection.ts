import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class FileDetector {
  private faceLandmarker: FaceLandmarker | null = null;

  async initialize() {
    if (this.faceLandmarker) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'IMAGE',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true
      });
    } catch (error) {
      console.error('Failed to initialize face detector:', error);
      throw error;
    }
  }

  async detectFaceLandmarks(file: File) {
    await this.initialize();

    if (!this.faceLandmarker) {
      throw new Error('Face detector not initialized');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const results = this.faceLandmarker!.detect(img);

          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            resolve({
              landmarks: results.faceLandmarks[0],
              blendshapes: results.faceBlendshapes?.[0] || null,
              transformationMatrix: results.facialTransformationMatrixes?.[0] || null
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}