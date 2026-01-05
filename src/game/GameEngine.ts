import * as THREE from "three";

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;

  private caravan: THREE.Group;
  private road: THREE.Group;
  private roadSegments: THREE.Mesh[] = [];
  private crossroads: THREE.Group[] = [];
  private decorations: THREE.Group;

  private caravanPosition = { x: 0, z: 0 };
  private caravanRotation = 0;
  private targetRotation = 0;

  private roadOffset = 0;
  private readonly ROAD_SEGMENT_LENGTH = 40;
  private readonly ROAD_WIDTH = 12;
  private readonly NUM_ROAD_SEGMENTS = 8;

  private nextCrossroadDistance = 150;
  private readonly CROSSROAD_INTERVAL = 200;

  public onCrossroadReached?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1510);
    this.scene.fog = new THREE.Fog(0x2a2015, 30, 150);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 8, 15);
    this.camera.lookAt(0, 0, -10);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Initialize scene elements
    this.setupLighting();
    this.road = this.createRoad();
    this.scene.add(this.road);
    this.caravan = this.createCaravan();
    this.scene.add(this.caravan);
    this.decorations = this.createDecorations();
    this.scene.add(this.decorations);
    this.createSkybox();

    // Handle resize
    window.addEventListener("resize", this.handleResize);
  }

  private setupLighting(): void {
    // Ambient light (warm desert evening)
    const ambient = new THREE.AmbientLight(0xd4a574, 0.4);
    this.scene.add(ambient);

    // Main directional light (sunset)
    const sunLight = new THREE.DirectionalLight(0xffa040, 1.2);
    sunLight.position.set(-50, 30, -50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    this.scene.add(sunLight);

    // Fill light (cool sky reflection)
    const fillLight = new THREE.DirectionalLight(0x6688aa, 0.3);
    fillLight.position.set(30, 20, 30);
    this.scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xff6600, 0.5);
    rimLight.position.set(0, 5, -50);
    this.scene.add(rimLight);
  }

  private createRoad(): THREE.Group {
    const roadGroup = new THREE.Group();

    // Ground plane (desert)
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    roadGroup.add(ground);

    // Road segments
    const roadGeometry = new THREE.PlaneGeometry(
      this.ROAD_WIDTH,
      this.ROAD_SEGMENT_LENGTH
    );
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x6b5a45 });

    for (let i = 0; i < this.NUM_ROAD_SEGMENTS; i++) {
      const segment = new THREE.Mesh(roadGeometry, roadMaterial);
      segment.rotation.x = -Math.PI / 2;
      segment.position.y = 0;
      segment.position.z = -i * this.ROAD_SEGMENT_LENGTH + this.ROAD_SEGMENT_LENGTH;
      segment.receiveShadow = true;
      this.roadSegments.push(segment);
      roadGroup.add(segment);

      // Road edges
      this.addRoadEdges(roadGroup, segment.position.z);
    }

    return roadGroup;
  }

  private addRoadEdges(parent: THREE.Group, zPos: number): void {
    const edgeGeometry = new THREE.BoxGeometry(0.3, 0.2, this.ROAD_SEGMENT_LENGTH);
    const edgeMaterial = new THREE.MeshLambertMaterial({ color: 0x5a4a35 });

    [-this.ROAD_WIDTH / 2, this.ROAD_WIDTH / 2].forEach((xOffset) => {
      const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
      edge.position.set(xOffset, 0.1, zPos);
      edge.receiveShadow = true;
      edge.castShadow = true;
      parent.add(edge);
    });
  }

  private createCaravan(): THREE.Group {
    const caravanGroup = new THREE.Group();

    // Cart body
    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 3);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8b6914 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.2;
    body.castShadow = true;
    caravanGroup.add(body);

    // Canvas top
    const canvasGeometry = new THREE.CylinderGeometry(1.2, 1.3, 3, 8, 1, false, 0, Math.PI);
    const canvasMaterial = new THREE.MeshLambertMaterial({
      color: 0xe8dcc4,
      side: THREE.DoubleSide,
    });
    const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
    canvas.rotation.z = Math.PI / 2;
    canvas.rotation.y = Math.PI / 2;
    canvas.position.y = 2.2;
    canvas.castShadow = true;
    caravanGroup.add(canvas);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 12);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
    const wheelPositions = [
      { x: -1.2, z: -1 },
      { x: 1.2, z: -1 },
      { x: -1.2, z: 1 },
      { x: 1.2, z: 1 },
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, 0.5, pos.z);
      wheel.castShadow = true;
      caravanGroup.add(wheel);
    });

    // Lantern
    const lanternGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.3);
    const lanternMaterial = new THREE.MeshLambertMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.5,
    });
    const lantern = new THREE.Mesh(lanternGeometry, lanternMaterial);
    lantern.position.set(0, 2.8, -1.5);
    caravanGroup.add(lantern);

    // Lantern light
    const lanternLight = new THREE.PointLight(0xffaa00, 0.5, 10);
    lanternLight.position.copy(lantern.position);
    caravanGroup.add(lanternLight);

    caravanGroup.position.y = 0;

    return caravanGroup;
  }

  private createCrossroad(zPosition: number): THREE.Group {
    const crossroadGroup = new THREE.Group();

    // Center platform
    const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.3, 8);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x7a6a55 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.15;
    platform.receiveShadow = true;
    crossroadGroup.add(platform);

    // Stone pillars
    const pillarGeometry = new THREE.BoxGeometry(1, 4, 1);
    const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x6a5a4a });
    const pillarPositions = [
      { x: -5, z: 0 },
      { x: 5, z: 0 },
      { x: 0, z: -5 },
      { x: 0, z: 5 },
    ];

    pillarPositions.forEach((pos) => {
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.set(pos.x, 2, pos.z);
      pillar.castShadow = true;
      crossroadGroup.add(pillar);

      // Torch on top
      const torchGeometry = new THREE.ConeGeometry(0.3, 0.6, 6);
      const torchMaterial = new THREE.MeshLambertMaterial({
        color: 0xff6600,
        emissive: 0xff4400,
        emissiveIntensity: 0.8,
      });
      const torch = new THREE.Mesh(torchGeometry, torchMaterial);
      torch.position.set(pos.x, 4.3, pos.z);
      crossroadGroup.add(torch);

      const torchLight = new THREE.PointLight(0xff6600, 0.8, 15);
      torchLight.position.set(pos.x, 4.5, pos.z);
      crossroadGroup.add(torchLight);
    });

    // Signpost
    const postGeometry = new THREE.BoxGeometry(0.3, 3, 0.3);
    const postMaterial = new THREE.MeshLambertMaterial({ color: 0x5a4a3a });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.set(0, 1.5, 0);
    post.castShadow = true;
    crossroadGroup.add(post);

    // Signs
    const signGeometry = new THREE.BoxGeometry(2, 0.5, 0.1);
    const signMaterial = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
    [-0.3, 0.3].forEach((rot, i) => {
      const sign = new THREE.Mesh(signGeometry, signMaterial);
      sign.position.set(0, 2.5 + i * 0.6, 0);
      sign.rotation.y = rot;
      sign.castShadow = true;
      crossroadGroup.add(sign);
    });

    crossroadGroup.position.z = zPosition;

    return crossroadGroup;
  }

  private createDecorations(): THREE.Group {
    const decorGroup = new THREE.Group();

    // Desert rocks
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x6a5a4a });

    for (let i = 0; i < 50; i++) {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      const side = Math.random() > 0.5 ? 1 : -1;
      rock.position.set(
        side * (this.ROAD_WIDTH / 2 + 5 + Math.random() * 30),
        Math.random() * 0.5,
        Math.random() * 300 - 150
      );
      rock.scale.setScalar(0.3 + Math.random() * 1.5);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      rock.castShadow = true;
      decorGroup.add(rock);
    }

    // Dead trees
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 3, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
    const branchGeometry = new THREE.CylinderGeometry(0.05, 0.15, 1.5, 5);

    for (let i = 0; i < 20; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);

      for (let j = 0; j < 3; j++) {
        const branch = new THREE.Mesh(branchGeometry, trunkMaterial);
        branch.position.y = 2 + j * 0.5;
        branch.rotation.z = (Math.random() - 0.5) * 1.5;
        branch.rotation.y = Math.random() * Math.PI * 2;
        tree.add(branch);
      }

      const side = Math.random() > 0.5 ? 1 : -1;
      tree.position.set(
        side * (this.ROAD_WIDTH / 2 + 8 + Math.random() * 25),
        0,
        Math.random() * 250 - 125
      );
      decorGroup.add(tree);
    }

    return decorGroup;
  }

  private createSkybox(): void {
    // Gradient sky sphere
    const skyGeometry = new THREE.SphereGeometry(200, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x1a1520) },
        bottomColor: { value: new THREE.Color(0xd4784a) },
        offset: { value: 10 },
        exponent: { value: 0.4 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(8, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc66 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(-80, 25, -100);
    this.scene.add(sun);
  }

  public update(
    deltaTime: number,
    speed: number,
    steering: number,
    isPaused: boolean
  ): number {
    if (isPaused) {
      this.renderer.render(this.scene, this.camera);
      return 0;
    }

    // Update caravan position
    const movement = speed * deltaTime * 10;
    this.roadOffset += movement;

    // Steering
    this.targetRotation = steering * 0.3;
    this.caravanRotation += (this.targetRotation - this.caravanRotation) * 0.1;

    // Lateral movement
    this.caravanPosition.x += steering * speed * deltaTime * 3;
    this.caravanPosition.x = THREE.MathUtils.clamp(
      this.caravanPosition.x,
      -this.ROAD_WIDTH / 2 + 2,
      this.ROAD_WIDTH / 2 - 2
    );

    // Update caravan visual
    this.caravan.position.x = this.caravanPosition.x;
    this.caravan.rotation.y = this.caravanRotation;

    // Subtle bobbing
    this.caravan.position.y = Math.sin(this.roadOffset * 0.5) * 0.05;

    // Move road segments
    this.roadSegments.forEach((segment) => {
      segment.position.z += movement;
      if (segment.position.z > this.ROAD_SEGMENT_LENGTH * 2) {
        segment.position.z -= this.NUM_ROAD_SEGMENTS * this.ROAD_SEGMENT_LENGTH;
      }
    });

    // Move decorations
    this.decorations.children.forEach((child) => {
      child.position.z += movement;
      if (child.position.z > 150) {
        child.position.z -= 300;
      }
    });

    // Check for crossroad spawning
    if (this.roadOffset >= this.nextCrossroadDistance) {
      const crossroad = this.createCrossroad(-100);
      this.crossroads.push(crossroad);
      this.scene.add(crossroad);
      this.nextCrossroadDistance += this.CROSSROAD_INTERVAL;
    }

    // Move and check crossroads
    let triggeredEncounter = false;
    this.crossroads.forEach((crossroad, index) => {
      crossroad.position.z += movement;

      // Collision detection
      if (crossroad.position.z > -5 && crossroad.position.z < 5 && !triggeredEncounter) {
        triggeredEncounter = true;
        if (this.onCrossroadReached) {
          this.onCrossroadReached();
        }
      }

      // Remove old crossroads
      if (crossroad.position.z > 50) {
        this.scene.remove(crossroad);
        this.crossroads.splice(index, 1);
      }
    });

    this.renderer.render(this.scene, this.camera);

    return movement;
  }

  private handleResize = (): void => {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  public dispose(): void {
    window.removeEventListener("resize", this.handleResize);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
