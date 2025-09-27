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

  async createAvatar(gender: 'male' | 'female') {
    // Create the appropriate head geometry
    const geometry = gender === 'male' ? this.createMaleHeadGeometry() : this.createFemaleHeadGeometry();

    // Create material with realistic appearance like professional models
    const material = new THREE.MeshPhongMaterial({
      color: 0xe8d5c8, // Professional neutral skin tone
      shininess: 5,
      specular: 0x222222,
      side: THREE.FrontSide,
    });

    // Create face mesh
    this.faceMesh = new THREE.Mesh(geometry, material);
    this.faceGroup.add(this.faceMesh);

    // Position and scale the head properly
    this.setupHead();
  }

  private createMaleHeadGeometry(): THREE.BufferGeometry {
    // Create a professional-quality human head

    // Create head base with proper anatomy
    const headGeometry = new THREE.SphereGeometry(1, 128, 64);
    const positions = headGeometry.attributes.position;
    const positionArray = positions.array as Float32Array;

    // Apply realistic human head proportions and anatomy
    for (let i = 0; i < positionArray.length; i += 3) {
      const x = positionArray[i];
      const y = positionArray[i + 1];
      const z = positionArray[i + 2];

      // Normalize to get direction
      const length = Math.sqrt(x * x + y * y + z * z);
      const nx = x / length;
      const ny = y / length;
      const nz = z / length;


      // Create realistic head proportions (based on human anatomy)
      let radius = 1.0;

      // Y-axis zones (from top to bottom)
      if (ny > 0.7) {
        // Crown/top of head
        radius = 0.95;
      } else if (ny > 0.3) {
        // Forehead and temple area
        radius = 1.0;
        if (nz > 0.3) radius *= 1.1; // Forehead prominence
        if (Math.abs(nx) > 0.7) radius *= 0.95; // Temple depression
      } else if (ny > 0.0) {
        // Eye and upper cheek area
        radius = 1.05;
        if (nz > 0.5) radius *= 1.15; // Eye socket depth
        if (Math.abs(nx) > 0.6) radius *= 1.1; // Cheekbone prominence

        // Create eye socket depressions
        if (Math.abs(nx) > 0.3 && Math.abs(nx) < 0.7 && nz > 0.6) {
          radius *= 0.9;
        }
      } else if (ny > -0.3) {
        // Nose and mouth area
        radius = 1.0;
        if (Math.abs(nx) < 0.2 && nz > 0.5) {
          // Nose bridge and tip
          radius *= 1.25;
        }
        if (Math.abs(nx) < 0.4 && nz > 0.3) {
          // Nose sides
          radius *= 1.1;
        }
      } else if (ny > -0.6) {
        // Lower face and jaw
        radius = 1.0;
        if (Math.abs(nx) > 0.4 && nz > 0.2) {
          radius *= 1.05; // Jaw definition
        }
      } else {
        // Chin area
        radius = 0.9;
        if (Math.abs(nx) < 0.3 && nz > 0.2) {
          radius *= 1.1; // Chin prominence
        }
      }

      // Apply transformations for male characteristics
      const finalX = nx * radius * 0.85; // Head width
      const finalY = ny * radius * 1.4;  // Head height
      const finalZ = nz * radius * 0.95; // Head depth

      positionArray[i] = finalX;
      positionArray[i + 1] = finalY;
      positionArray[i + 2] = finalZ;
    }

    // Add neck geometry
    this.addNeckGeometry(headGeometry, positionArray);

    positions.needsUpdate = true;
    headGeometry.computeVertexNormals();

    return headGeometry;
  }

  private addNeckGeometry(geometry: THREE.SphereGeometry, positionArray: Float32Array) {
    // Extend the geometry to include neck area
    for (let i = 0; i < positionArray.length; i += 3) {
      const y = positionArray[i + 1];

      // Create neck extension below the head
      if (y < -0.8) {
        const x = positionArray[i];
        const z = positionArray[i + 2];

        // Narrow the neck
        const neckScale = 0.4;
        positionArray[i] = x * neckScale;
        positionArray[i + 2] = z * neckScale;

        // Extend downward
        positionArray[i + 1] = y * 1.5;
      }
    }
  }

  private createFemaleHeadGeometry(): THREE.BufferGeometry {
    // Create a professional-quality female head
    const headGeometry = new THREE.SphereGeometry(1, 128, 64);
    const positions = headGeometry.attributes.position;
    const positionArray = positions.array as Float32Array;

    // Apply realistic female head proportions and anatomy
    for (let i = 0; i < positionArray.length; i += 3) {
      const x = positionArray[i];
      const y = positionArray[i + 1];
      const z = positionArray[i + 2];

      // Normalize to get direction
      const length = Math.sqrt(x * x + y * y + z * z);
      const nx = x / length;
      const ny = y / length;
      const nz = z / length;

      // Create realistic female head proportions
      let radius = 1.0;

      // Y-axis zones (from top to bottom) - softer features than male
      if (ny > 0.7) {
        // Crown/top of head - more rounded
        radius = 0.93;
      } else if (ny > 0.3) {
        // Forehead and temple area - smoother
        radius = 0.98;
        if (nz > 0.3) radius *= 1.05; // Less prominent forehead
        if (Math.abs(nx) > 0.7) radius *= 0.93; // Softer temples
      } else if (ny > 0.0) {
        // Eye and upper cheek area - softer
        radius = 1.02;
        if (nz > 0.5) radius *= 1.12; // Gentler eye socket depth
        if (Math.abs(nx) > 0.6) radius *= 1.05; // Softer cheekbones

        // Create gentler eye socket depressions
        if (Math.abs(nx) > 0.3 && Math.abs(nx) < 0.7 && nz > 0.6) {
          radius *= 0.92;
        }
      } else if (ny > -0.3) {
        // Nose and mouth area - smaller, more delicate
        radius = 0.98;
        if (Math.abs(nx) < 0.15 && nz > 0.5) {
          // Smaller nose bridge and tip
          radius *= 1.15;
        }
        if (Math.abs(nx) < 0.3 && nz > 0.3) {
          // Narrower nose sides
          radius *= 1.05;
        }
      } else if (ny > -0.6) {
        // Lower face and jaw - softer, less angular
        radius = 0.95;
        if (Math.abs(nx) > 0.4 && nz > 0.2) {
          radius *= 1.02; // Softer jaw definition
        }
      } else {
        // Chin area - more pointed, less square
        radius = 0.85;
        if (Math.abs(nx) < 0.25 && nz > 0.2) {
          radius *= 1.05; // Softer chin prominence
        }
      }

      // Apply transformations for female characteristics
      const finalX = nx * radius * 0.78; // Narrower head width
      const finalY = ny * radius * 1.35; // Slightly shorter height
      const finalZ = nz * radius * 0.9;  // Less depth

      positionArray[i] = finalX;
      positionArray[i + 1] = finalY;
      positionArray[i + 2] = finalZ;
    }

    // Add neck geometry
    this.addNeckGeometry(headGeometry, positionArray);

    positions.needsUpdate = true;
    headGeometry.computeVertexNormals();

    return headGeometry;
  }

  private async loadTexture(imageUrl: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        imageUrl,
        (texture) => {
          texture.flipY = false; // Keep original orientation
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  private setupHead() {
    if (!this.faceMesh) return;

    // Position the head at the center
    this.faceMesh.position.set(0, 0, 0);

    // Scale the head to a reasonable size
    this.faceMesh.scale.setScalar(1.5);

    // Rotate slightly for better viewing angle
    this.faceMesh.rotation.y = 0.1;
    this.faceMesh.rotation.x = -0.05;
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