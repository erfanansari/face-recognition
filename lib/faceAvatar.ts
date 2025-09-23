import * as THREE from 'three';

export class FaceAvatar {
  private scene: THREE.Scene;
  private faceMesh: THREE.Mesh | null = null;
  private glassesMesh: THREE.Mesh | null = null;
  private faceGroup: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.faceGroup = new THREE.Group();
    this.scene.add(this.faceGroup);
  }

  async createFromLandmarks(landmarks: any, imageUrl: string) {
    if (!landmarks || !landmarks.landmarks) {
      throw new Error('Invalid landmarks data');
    }

    // Create face geometry from landmarks
    const geometry = this.createFaceGeometry(landmarks.landmarks);

    // Load texture from uploaded image
    const texture = await this.loadTexture(imageUrl);

    // Create material
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    // Create face mesh
    this.faceMesh = new THREE.Mesh(geometry, material);
    this.faceGroup.add(this.faceMesh);

    // Center and scale the face
    this.centerAndScaleFace();
  }

  private createFaceGeometry(landmarks: any[]): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();

    // Convert MediaPipe landmarks to Three.js coordinates
    const vertices = [];
    const uvs = [];

    for (const landmark of landmarks) {
      // Convert from MediaPipe coordinate system to Three.js
      // MediaPipe: (0,0) is top-left, (1,1) is bottom-right
      // Three.js: center at origin, Y up
      const x = (landmark.x - 0.5) * 2; // -1 to 1
      const y = -(landmark.y - 0.5) * 2; // -1 to 1, flip Y
      const z = landmark.z * 2; // Scale Z

      vertices.push(x, y, z);
      uvs.push(landmark.x, 1 - landmark.y); // Flip Y for UV
    }

    // Create triangular faces for the face mesh
    const indices = this.createFaceIndices();

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();

    return geometry;
  }

  private createFaceIndices(): number[] {
    // Define face triangulation based on MediaPipe face mesh topology
    // This is a simplified version - in production, you'd use the full MediaPipe topology
    const indices = [];

    // Face contour triangulation (simplified)
    const faceOval = [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
      397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
      172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
    ];

    // Create triangles for face oval
    for (let i = 0; i < faceOval.length - 2; i++) {
      indices.push(faceOval[0], faceOval[i + 1], faceOval[i + 2]);
    }

    // Eyes region
    const leftEye = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    const rightEye = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

    // Triangulate eyes
    this.triangulateRegion(leftEye, indices);
    this.triangulateRegion(rightEye, indices);

    // Mouth region
    const mouth = [
      61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318,
      402, 317, 14, 87, 178, 88, 95, 185, 40, 39, 37, 0, 267,
      269, 270, 267, 271, 272, 271, 272
    ];

    this.triangulateRegion(mouth, indices);

    return indices;
  }

  private triangulateRegion(points: number[], indices: number[]) {
    // Simple fan triangulation
    for (let i = 1; i < points.length - 1; i++) {
      indices.push(points[0], points[i], points[i + 1]);
    }
  }

  private async loadTexture(imageUrl: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        imageUrl,
        (texture) => {
          texture.flipY = true;
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  private centerAndScaleFace() {
    if (!this.faceMesh) return;

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(this.faceMesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the face
    this.faceGroup.position.copy(center.negate());

    // Scale to reasonable size
    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetSize = 2;
    const scale = targetSize / maxDimension;
    this.faceGroup.scale.setScalar(scale);
  }

  addGlasses(glassesType: string) {
    this.removeGlasses();

    if (!this.faceMesh) return;

    // Create glasses geometry based on type
    let glassesGeometry: THREE.BufferGeometry;
    let glassesMaterial: THREE.Material;

    switch (glassesType) {
      case 'aviator':
        glassesGeometry = this.createAviatorGlasses();
        glassesMaterial = new THREE.MeshPhongMaterial({
          color: 0x333333,
          transparent: true,
          opacity: 0.8
        });
        break;
      case 'round':
        glassesGeometry = this.createRoundGlasses();
        glassesMaterial = new THREE.MeshPhongMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.7
        });
        break;
      case 'square':
        glassesGeometry = this.createSquareGlasses();
        glassesMaterial = new THREE.MeshPhongMaterial({
          color: 0x8B4513,
          transparent: true,
          opacity: 0.8
        });
        break;
      default:
        return;
    }

    this.glassesMesh = new THREE.Mesh(glassesGeometry, glassesMaterial);

    // Position glasses on face
    this.positionGlasses();

    this.faceGroup.add(this.glassesMesh);
  }

  removeGlasses() {
    if (this.glassesMesh) {
      this.faceGroup.remove(this.glassesMesh);
      this.glassesMesh.geometry.dispose();
      if (Array.isArray(this.glassesMesh.material)) {
        this.glassesMesh.material.forEach(mat => mat.dispose());
      } else {
        this.glassesMesh.material.dispose();
      }
      this.glassesMesh = null;
    }
  }

  private createAviatorGlasses(): THREE.BufferGeometry {
    const shape = new THREE.Shape();

    // Left lens (aviator style)
    shape.absarc(-0.3, 0, 0.25, 0, Math.PI * 2, false);

    // Right lens
    const rightLens = new THREE.Shape();
    rightLens.absarc(0.3, 0, 0.25, 0, Math.PI * 2, false);

    const geometry = new THREE.ShapeGeometry([shape, rightLens]);
    return geometry;
  }

  private createRoundGlasses(): THREE.BufferGeometry {
    const shape = new THREE.Shape();

    // Left lens
    shape.absarc(-0.25, 0, 0.2, 0, Math.PI * 2, false);

    // Right lens
    const rightLens = new THREE.Shape();
    rightLens.absarc(0.25, 0, 0.2, 0, Math.PI * 2, false);

    return new THREE.ShapeGeometry([shape, rightLens]);
  }

  private createSquareGlasses(): THREE.BufferGeometry {
    const shape = new THREE.Shape();

    // Left lens
    shape.moveTo(-0.45, -0.15);
    shape.lineTo(-0.05, -0.15);
    shape.lineTo(-0.05, 0.15);
    shape.lineTo(-0.45, 0.15);
    shape.lineTo(-0.45, -0.15);

    // Right lens
    const rightLens = new THREE.Shape();
    rightLens.moveTo(0.05, -0.15);
    rightLens.lineTo(0.45, -0.15);
    rightLens.lineTo(0.45, 0.15);
    rightLens.lineTo(0.05, 0.15);
    rightLens.lineTo(0.05, -0.15);

    return new THREE.ShapeGeometry([shape, rightLens]);
  }

  private positionGlasses() {
    if (!this.glassesMesh || !this.faceMesh) return;

    // Position glasses slightly in front of face
    this.glassesMesh.position.set(0, 0.1, 0.1);
    this.glassesMesh.scale.setScalar(1.2);
  }

  dispose() {
    // Clean up all Three.js resources
    if (this.faceMesh) {
      this.faceMesh.geometry.dispose();
      if (Array.isArray(this.faceMesh.material)) {
        this.faceMesh.material.forEach(mat => mat.dispose());
      } else {
        this.faceMesh.material.dispose();
      }
    }

    this.removeGlasses();

    if (this.faceGroup.parent) {
      this.faceGroup.parent.remove(this.faceGroup);
    }
  }
}