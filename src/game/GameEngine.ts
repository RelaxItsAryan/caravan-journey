import * as THREE from "three";
import { Obstacle, SupplyDrop, WeatherType, DifficultyConfig } from "./types";

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;

  private jeep: THREE.Group;
  private road: THREE.Group;
  private roadSegments: THREE.Mesh[] = [];
  private crossroads: THREE.Group[] = [];
  private decorations: THREE.Group;
  private obstacles: Obstacle[] = [];
  private supplyDrops: SupplyDrop[] = [];

  private jeepPosition = { x: 0, z: 0 };
  private jeepRotation = 0;
  private targetRotation = 0;

  private roadOffset = 0;
  private readonly ROAD_SEGMENT_LENGTH = 40;
  private readonly ROAD_WIDTH = 12;
  private readonly NUM_ROAD_SEGMENTS = 8;
  private readonly LANES = [-4, 0, 4];

  private nextCrossroadDistance = 150;
  private readonly CROSSROAD_INTERVAL = 200;
  private nextObstacleDistance = 15;
  private nextSupplyDropDistance = 50;
  private difficultyMultiplier = 1;

  // Day/Night cycle
  private timeOfDay = 10;
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private skyMaterial: THREE.ShaderMaterial | null = null;
  private sunMesh: THREE.Mesh | null = null;
  private moonMesh: THREE.Mesh | null = null;
  private stars: THREE.Points | null = null;

  // Weather system
  private weatherType: WeatherType = 'clear';
  private dustParticles: THREE.Points | null = null;
  private weatherParticles: THREE.Points | null = null;

  // Background
  private backgroundPlane: THREE.Mesh | null = null;

  // Difficulty settings
  private difficultyConfig: DifficultyConfig = {
    name: 'Medium',
    description: 'Balanced challenge',
    obstacleSpawnRate: 1.0,
    obstacleDamage: 1.0,
    fuelConsumption: 1.0,
    supplyDropRate: 1.0,
    startingFuel: 100,
    startingHealth: 100,
    startingMoney: 50,
    scoreMultiplier: 1.0,
    color: 'text-yellow-400'
  };

  public onCrossroadReached?: () => void;
  public onObstacleHit?: (damage: number) => void;
  public onSupplyCollected?: (type: string, value: number) => void;

  constructor(container: HTMLElement) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1510);
    this.scene.fog = new THREE.Fog(0x2a2015, 30, 150);

    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 8, 15);
    this.camera.lookAt(0, 0, -10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    const lights = this.setupLighting();
    this.sunLight = lights.sunLight;
    this.ambientLight = lights.ambient;
    
    this.road = this.createRoad();
    this.scene.add(this.road);
    this.jeep = this.createJeep();
    this.scene.add(this.jeep);
    this.decorations = this.createDecorations();
    this.scene.add(this.decorations);
    this.createSkybox();
    this.createBackgroundImage();
    this.createStars();
    this.createWeatherParticles();

    window.addEventListener("resize", this.handleResize);
  }

  private setupLighting(): { sunLight: THREE.DirectionalLight; ambient: THREE.AmbientLight } {
    const ambient = new THREE.AmbientLight(0xd4a574, 0.4);
    this.scene.add(ambient);

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

    const fillLight = new THREE.DirectionalLight(0x6688aa, 0.3);
    fillLight.position.set(30, 20, 30);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff6600, 0.5);
    rimLight.position.set(0, 5, -50);
    this.scene.add(rimLight);

    return { sunLight, ambient };
  }

  private createBackgroundImage(): void {
    const loader = new THREE.TextureLoader();
    loader.load('/desert-bg.jpg', (texture) => {
      const bgGeometry = new THREE.PlaneGeometry(400, 200);
      const bgMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      this.backgroundPlane = new THREE.Mesh(bgGeometry, bgMaterial);
      this.backgroundPlane.position.set(0, 50, -180);
      this.scene.add(this.backgroundPlane);
    });
  }

  private createStars(): void {
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(1000 * 3);
    
    for (let i = 0; i < 1000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const r = 180 + Math.random() * 20;
      
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi);
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0
    });
    
    this.stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.stars);
  }

  private createWeatherParticles(): void {
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(2000 * 3);
    
    for (let i = 0; i < 2000; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 100;
      dustPositions[i * 3 + 1] = Math.random() * 30;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    
    const dustMaterial = new THREE.PointsMaterial({
      color: 0xd4a574,
      size: 0.3,
      transparent: true,
      opacity: 0
    });
    
    this.dustParticles = new THREE.Points(dustGeometry, dustMaterial);
    this.scene.add(this.dustParticles);

    const weatherGeometry = new THREE.BufferGeometry();
    const weatherPositions = new Float32Array(500 * 3);
    
    for (let i = 0; i < 500; i++) {
      weatherPositions[i * 3] = (Math.random() - 0.5) * 80;
      weatherPositions[i * 3 + 1] = Math.random() * 20;
      weatherPositions[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    
    weatherGeometry.setAttribute('position', new THREE.BufferAttribute(weatherPositions, 3));
    
    const weatherMaterial = new THREE.PointsMaterial({
      color: 0xccbbaa,
      size: 0.8,
      transparent: true,
      opacity: 0
    });
    
    this.weatherParticles = new THREE.Points(weatherGeometry, weatherMaterial);
    this.scene.add(this.weatherParticles);
  }

  private createRoad(): THREE.Group {
    const roadGroup = new THREE.Group();

    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    roadGroup.add(ground);

    const roadGeometry = new THREE.PlaneGeometry(
      this.ROAD_WIDTH,
      this.ROAD_SEGMENT_LENGTH
    );
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });

    for (let i = 0; i < this.NUM_ROAD_SEGMENTS; i++) {
      const segment = new THREE.Mesh(roadGeometry, roadMaterial);
      segment.rotation.x = -Math.PI / 2;
      segment.position.y = 0;
      segment.position.z = -i * this.ROAD_SEGMENT_LENGTH + this.ROAD_SEGMENT_LENGTH;
      segment.receiveShadow = true;
      this.roadSegments.push(segment);
      roadGroup.add(segment);

      this.addRoadMarkings(roadGroup, segment.position.z);
      this.addRoadEdges(roadGroup, segment.position.z);
    }

    return roadGroup;
  }

  private addRoadMarkings(parent: THREE.Group, zPos: number): void {
    const lineGeometry = new THREE.PlaneGeometry(0.3, 4);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    
    for (let i = 0; i < 5; i++) {
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.02, zPos - i * 8 + 16);
      parent.add(line);
    }

    const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-4, 4].forEach(xOffset => {
      for (let i = 0; i < 5; i++) {
        const dash = new THREE.Mesh(lineGeometry, whiteMaterial);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(xOffset, 0.02, zPos - i * 8 + 16);
        parent.add(dash);
      }
    });
  }

  private addRoadEdges(parent: THREE.Group, zPos: number): void {
    const edgeGeometry = new THREE.BoxGeometry(0.5, 0.3, this.ROAD_SEGMENT_LENGTH);
    const edgeMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });

    [-this.ROAD_WIDTH / 2, this.ROAD_WIDTH / 2].forEach((xOffset) => {
      const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
      edge.position.set(xOffset, 0.15, zPos);
      edge.receiveShadow = true;
      edge.castShadow = true;
      parent.add(edge);
    });
  }

  private createJeep(): THREE.Group {
    const jeepGroup = new THREE.Group();

    // Main body - red color
    const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 3.5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xcc2222 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.8;
    body.castShadow = true;
    jeepGroup.add(body);

    // Cabin
    const cabinGeometry = new THREE.BoxGeometry(1.8, 0.9, 1.8);
    const cabinMaterial = new THREE.MeshLambertMaterial({ color: 0xaa1111 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 1.55, 0.3);
    cabin.castShadow = true;
    jeepGroup.add(cabin);

    // Windshield
    const windshieldGeometry = new THREE.PlaneGeometry(1.6, 0.7);
    const windshieldMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x88ccff, 
      transparent: true, 
      opacity: 0.6 
    });
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0, 1.6, -0.59);
    windshield.rotation.x = 0.2;
    jeepGroup.add(windshield);

    // Rear window
    const rearWindow = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    rearWindow.position.set(0, 1.6, 1.19);
    rearWindow.rotation.x = -0.1;
    jeepGroup.add(rearWindow);

    // Hood
    const hoodGeometry = new THREE.BoxGeometry(1.9, 0.3, 1.2);
    const hoodMaterial = new THREE.MeshLambertMaterial({ color: 0xdd3333 });
    const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
    hood.position.set(0, 1.1, -1.2);
    hood.castShadow = true;
    jeepGroup.add(hood);

    // Headlights
    const headlightGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
    const headlightMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffcc,
      emissive: 0xffffaa,
      emissiveIntensity: 0.5
    });
    [-0.6, 0.6].forEach(x => {
      const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
      headlight.rotation.x = Math.PI / 2;
      headlight.position.set(x, 0.9, -1.78);
      jeepGroup.add(headlight);

      const headlightLight = new THREE.PointLight(0xffffcc, 0.3, 8);
      headlightLight.position.set(x, 0.9, -2);
      jeepGroup.add(headlightLight);
    });

    // Tail lights
    const taillightMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.3
    });
    [-0.7, 0.7].forEach(x => {
      const taillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
      taillight.rotation.x = Math.PI / 2;
      taillight.position.set(x, 0.9, 1.78);
      jeepGroup.add(taillight);
    });

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const hubMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const wheelPositions = [
      { x: -1.1, z: -1.1 },
      { x: 1.1, z: -1.1 },
      { x: -1.1, z: 1.1 },
      { x: 1.1, z: 1.1 },
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, 0.4, pos.z);
      wheel.castShadow = true;
      jeepGroup.add(wheel);

      const hubGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.32, 8);
      const hub = new THREE.Mesh(hubGeometry, hubMaterial);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(pos.x, 0.4, pos.z);
      jeepGroup.add(hub);
    });

    // Roof rack
    const rackGeometry = new THREE.BoxGeometry(1.6, 0.1, 1.6);
    const rackMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const rack = new THREE.Mesh(rackGeometry, rackMaterial);
    rack.position.set(0, 2.05, 0.3);
    rack.castShadow = true;
    jeepGroup.add(rack);

    // Cargo on roof
    const cargoGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.6);
    const cargoMaterial = new THREE.MeshLambertMaterial({ color: 0x8b6914 });
    const cargo = new THREE.Mesh(cargoGeometry, cargoMaterial);
    cargo.position.set(-0.4, 2.3, 0.3);
    cargo.castShadow = true;
    jeepGroup.add(cargo);

    // Spare tire on back
    const spareTireGeometry = new THREE.TorusGeometry(0.35, 0.12, 8, 16);
    const spareTireMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const spareTire = new THREE.Mesh(spareTireGeometry, spareTireMaterial);
    spareTire.position.set(0, 1.0, 1.85);
    spareTire.rotation.y = Math.PI / 2;
    jeepGroup.add(spareTire);

    // Side mirrors
    const mirrorGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.2);
    const mirrorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    [-1.1, 1.1].forEach(x => {
      const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
      mirror.position.set(x, 1.5, -0.3);
      jeepGroup.add(mirror);
    });

    jeepGroup.position.y = 0;
    return jeepGroup;
  }

  private createObstacle(zPosition: number): Obstacle {
    const lane = this.LANES[Math.floor(Math.random() * this.LANES.length)];
    const obstacleTypes = [
      'rock', 'debris', 'cactus', 'barrel', 'tumbleweed', 'brokenCar', 'oilSpill',
      'trafficCar', 'truck', 'motorcycle', 'pothole', 'constructionBarrier', 'sandbags',
      'policeCar', 'ambulance', 'sportsCar', 'bus', 'pickupTruck', 'taxi'
    ] as const;
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    
    let mesh: THREE.Object3D;
    let isMoving = false;
    let moveDirection = 0;
    
    if (type === 'rock') {
      const geometry = new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.4, 0);
      const material = new THREE.MeshLambertMaterial({ color: 0x5a4a3a });
      mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(1 + Math.random() * 0.5, 0.6, 1 + Math.random() * 0.5);
      mesh.position.y = 0.4;
    } else if (type === 'debris') {
      const group = new THREE.Group();
      const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x6b5a45 });
      
      for (let i = 0; i < 4; i++) {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(0.4 + Math.random() * 0.4, 0.3, 0.4 + Math.random() * 0.4),
          boxMaterial
        );
        box.position.set((Math.random() - 0.5) * 1.2, 0.15 + i * 0.15, (Math.random() - 0.5) * 1.2);
        box.rotation.y = Math.random() * Math.PI;
        group.add(box);
      }
      mesh = group;
    } else if (type === 'cactus') {
      const group = new THREE.Group();
      const cactusMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
      
      const mainGeometry = new THREE.CylinderGeometry(0.2, 0.25, 1.5, 8);
      const main = new THREE.Mesh(mainGeometry, cactusMaterial);
      main.position.y = 0.75;
      group.add(main);
      
      const armGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.6, 6);
      [-1, 1].forEach(side => {
        const arm = new THREE.Mesh(armGeometry, cactusMaterial);
        arm.position.set(side * 0.35, 0.8, 0);
        arm.rotation.z = side * Math.PI / 4;
        group.add(arm);
      });
      
      mesh = group;
    } else if (type === 'barrel') {
      const group = new THREE.Group();
      const barrelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1, 12);
      const barrelMaterial = new THREE.MeshLambertMaterial({ color: 0xff4400 });
      const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
      barrel.position.y = 0.5;
      barrel.rotation.x = Math.PI / 6;
      group.add(barrel);
      
      const stripeGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 12);
      const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [0.2, 0.5, 0.8].forEach(y => {
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.y = y;
        stripe.rotation.x = Math.PI / 6;
        group.add(stripe);
      });
      
      mesh = group;
    } else if (type === 'tumbleweed') {
      const geometry = new THREE.IcosahedronGeometry(0.6, 0);
      const material = new THREE.MeshLambertMaterial({ 
        color: 0x8b7355,
        wireframe: true
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 0.6;
      isMoving = true;
      moveDirection = Math.random() > 0.5 ? 1 : -1;
    } else if (type === 'brokenCar') {
      const group = new THREE.Group();
      
      const bodyGeometry = new THREE.BoxGeometry(1.8, 0.6, 3);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.5;
      body.rotation.y = Math.random() * 0.5 - 0.25;
      group.add(body);
      
      const glassGeometry = new THREE.PlaneGeometry(1.4, 0.5);
      const glassMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x88aacc,
        transparent: true,
        opacity: 0.4
      });
      const glass = new THREE.Mesh(glassGeometry, glassMaterial);
      glass.position.set(0, 0.9, -0.8);
      glass.rotation.x = 0.3;
      group.add(glass);
      
      const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [[-0.8, -1], [0.8, 1]].forEach(([x, z]) => {
        if (Math.random() > 0.3) {
          const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(x, 0.3, z);
          group.add(wheel);
        }
      });
      
      mesh = group;
    } else if (type === 'trafficCar') {
      // Moving car - different colors
      const group = new THREE.Group();
      const carColors = [0x2244aa, 0x22aa44, 0xaa8822, 0x882288, 0x228888, 0xffffff];
      const carColor = carColors[Math.floor(Math.random() * carColors.length)];
      
      // Car body
      const bodyGeometry = new THREE.BoxGeometry(1.6, 0.5, 2.8);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: carColor });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.6;
      body.castShadow = true;
      group.add(body);
      
      // Car roof/cabin
      const cabinGeometry = new THREE.BoxGeometry(1.4, 0.5, 1.4);
      const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
      cabin.position.set(0, 1.05, 0.2);
      cabin.castShadow = true;
      group.add(cabin);
      
      // Windows
      const windowMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x88ccff, 
        transparent: true, 
        opacity: 0.6 
      });
      const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), windowMaterial);
      frontWindow.position.set(0, 1.1, -0.49);
      frontWindow.rotation.x = 0.2;
      group.add(frontWindow);
      
      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [[-0.7, -0.9], [0.7, -0.9], [-0.7, 0.9], [0.7, 0.9]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.25, z);
        group.add(wheel);
      });
      
      // Headlights
      const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });
      [-0.5, 0.5].forEach(x => {
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(x, 0.5, -1.4);
        group.add(light);
      });
      
      // Tail lights
      const tailMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      [-0.5, 0.5].forEach(x => {
        const tail = new THREE.Mesh(lightGeometry, tailMaterial);
        tail.position.set(x, 0.5, 1.4);
        group.add(tail);
      });
      
      mesh = group;
      isMoving = true;
      // Some cars move towards you (negative), some same direction (positive but slower)
      moveDirection = Math.random() > 0.4 ? -1 : 0.3;
    } else if (type === 'truck') {
      // Big truck obstacle
      const group = new THREE.Group();
      
      // Truck cab
      const cabGeometry = new THREE.BoxGeometry(2.2, 1.2, 2);
      const cabMaterial = new THREE.MeshLambertMaterial({ color: 0x884422 });
      const cab = new THREE.Mesh(cabGeometry, cabMaterial);
      cab.position.set(0, 1, -1.5);
      cab.castShadow = true;
      group.add(cab);
      
      // Truck trailer
      const trailerGeometry = new THREE.BoxGeometry(2.4, 1.8, 5);
      const trailerMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
      const trailer = new THREE.Mesh(trailerGeometry, trailerMaterial);
      trailer.position.set(0, 1.2, 1.5);
      trailer.castShadow = true;
      group.add(trailer);
      
      // Wheels (6 wheels)
      const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [[-1, -2], [1, -2], [-1, 0.5], [1, 0.5], [-1, 2.5], [1, 2.5]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.35, z);
        group.add(wheel);
      });
      
      mesh = group;
      isMoving = true;
      moveDirection = Math.random() > 0.5 ? -0.8 : 0.2;
    } else if (type === 'motorcycle') {
      // Fast motorcycle
      const group = new THREE.Group();
      
      // Body
      const bodyGeometry = new THREE.BoxGeometry(0.5, 0.4, 1.8);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.6;
      group.add(body);
      
      // Fuel tank
      const tankGeometry = new THREE.SphereGeometry(0.25, 8, 8);
      const tankMaterial = new THREE.MeshLambertMaterial({ color: 0xcc0000 });
      const tank = new THREE.Mesh(tankGeometry, tankMaterial);
      tank.scale.set(1, 0.8, 1.5);
      tank.position.set(0, 0.8, 0);
      group.add(tank);
      
      // Wheels
      const wheelGeometry = new THREE.TorusGeometry(0.3, 0.08, 8, 16);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [-0.7, 0.7].forEach(z => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.y = Math.PI / 2;
        wheel.position.set(0, 0.3, z);
        group.add(wheel);
      });
      
      // Handlebars
      const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
      const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(0, 0.9, -0.6);
      group.add(handle);
      
      mesh = group;
      isMoving = true;
      moveDirection = Math.random() > 0.3 ? -1.5 : 0.5; // Motorcycles are fast!
    } else if (type === 'pothole') {
      // Dangerous pothole
      const group = new THREE.Group();
      
      const holeGeometry = new THREE.CircleGeometry(0.8, 12);
      const holeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x111111,
        side: THREE.DoubleSide
      });
      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      hole.rotation.x = -Math.PI / 2;
      hole.position.y = 0.01;
      group.add(hole);
      
      // Cracked edges
      const crackMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
      for (let i = 0; i < 8; i++) {
        const crack = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.05, 0.4),
          crackMaterial
        );
        const angle = (i / 8) * Math.PI * 2;
        crack.position.set(Math.cos(angle) * 0.9, 0.02, Math.sin(angle) * 0.9);
        crack.rotation.y = angle;
        group.add(crack);
      }
      
      mesh = group;
    } else if (type === 'constructionBarrier') {
      // Orange/white striped barrier
      const group = new THREE.Group();
      
      const barrierGeometry = new THREE.BoxGeometry(3, 0.8, 0.3);
      const barrierMaterial = new THREE.MeshLambertMaterial({ color: 0xff6600 });
      const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
      barrier.position.y = 0.4;
      group.add(barrier);
      
      // White stripes
      const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
      for (let i = 0; i < 5; i++) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.78, 0.32),
          stripeMaterial
        );
        stripe.position.set(-1.2 + i * 0.6, 0.4, 0);
        group.add(stripe);
      }
      
      // Legs
      const legGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.5);
      const legMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
      [-1.2, 1.2].forEach(x => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(x, 0.4, 0.3);
        group.add(leg);
      });
      
      mesh = group;
    } else if (type === 'sandbags') {
      // Pile of sandbags
      const group = new THREE.Group();
      const bagMaterial = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
      
      // Bottom row
      for (let i = 0; i < 3; i++) {
        const bag = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.25, 0.4),
          bagMaterial
        );
        bag.position.set((i - 1) * 0.65, 0.125, 0);
        bag.rotation.y = Math.random() * 0.2 - 0.1;
        group.add(bag);
      }
      
      // Top row
      for (let i = 0; i < 2; i++) {
        const bag = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.25, 0.4),
          bagMaterial
        );
        bag.position.set((i - 0.5) * 0.65, 0.375, 0.05);
        bag.rotation.y = Math.random() * 0.2 - 0.1;
        group.add(bag);
      }
      
      mesh = group;
    } else if (type === 'policeCar') {
      // Police car with lights
      const group = new THREE.Group();
      
      // Body (black and white)
      const bodyGeometry = new THREE.BoxGeometry(1.7, 0.5, 2.8);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.6;
      group.add(body);
      
      // White door panels
      const doorMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
      [-0.86, 0.86].forEach(x => {
        const door = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 1.2), doorMaterial);
        door.position.set(x, 0.6, 0);
        group.add(door);
      });
      
      // Cabin
      const cabinGeometry = new THREE.BoxGeometry(1.5, 0.45, 1.3);
      const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
      cabin.position.set(0, 1.0, 0.2);
      group.add(cabin);
      
      // Light bar (red and blue)
      const lightBarGeometry = new THREE.BoxGeometry(1.2, 0.15, 0.3);
      const lightBarMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const lightBar = new THREE.Mesh(lightBarGeometry, lightBarMaterial);
      lightBar.position.set(0, 1.3, 0.2);
      group.add(lightBar);
      
      // Red light
      const redLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.12, 0.25),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      redLight.position.set(-0.35, 1.35, 0.2);
      group.add(redLight);
      
      // Blue light
      const blueLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.12, 0.25),
        new THREE.MeshBasicMaterial({ color: 0x0066ff })
      );
      blueLight.position.set(0.35, 1.35, 0.2);
      group.add(blueLight);
      
      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [[-0.7, -0.9], [0.7, -0.9], [-0.7, 0.9], [0.7, 0.9]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.25, z);
        group.add(wheel);
      });
      
      mesh = group;
      isMoving = true;
      moveDirection = Math.random() > 0.3 ? -1.3 : 0.4;
    } else if (type === 'ambulance') {
      // Ambulance
      const group = new THREE.Group();
      
      // Body (white with red cross)
      const bodyGeometry = new THREE.BoxGeometry(2, 1.2, 3.5);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.9;
      group.add(body);
      
      // Red cross on side
      const crossMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.02), crossMaterial);
      crossH.position.set(-1.01, 0.9, 0);
      group.add(crossH);
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.02), crossMaterial);
      crossV.position.set(-1.01, 0.9, 0);
      group.add(crossV);
      
      // Cab
      const cabGeometry = new THREE.BoxGeometry(1.8, 0.8, 1.2);
      const cab = new THREE.Mesh(cabGeometry, bodyMaterial);
      cab.position.set(0, 0.7, -1.8);
      group.add(cab);
      
      // Windshield
      const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 });
      const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.6), windowMaterial);
      windshield.position.set(0, 0.9, -2.4);
      windshield.rotation.x = 0.1;
      group.add(windshield);
      
      // Lights on top
      const sirenMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const siren = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.3), sirenMaterial);
      siren.position.set(0, 1.6, -1.5);
      group.add(siren);
      
      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 12);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [[-0.9, -1.2], [0.9, -1.2], [-0.9, 1.2], [0.9, 1.2]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.3, z);
        group.add(wheel);
      });
      
      mesh = group;
      isMoving = true;
      moveDirection = Math.random() > 0.5 ? -1.2 : 0.3;
    } else if (type === 'sportsCar') {
      // Fast sports car
      const group = new THREE.Group();
      const sportsColors = [0xff0000, 0xffff00, 0x00ff00, 0xff6600, 0x0066ff];
      const color = sportsColors[Math.floor(Math.random() * sportsColors.length)];
      
      // Low sleek body
      const bodyGeometry = new THREE.BoxGeometry(1.6, 0.35, 3);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.45;
      group.add(body);
      
      // Sloped cabin
      const cabinGeometry = new THREE.BoxGeometry(1.3, 0.35, 1.2);
      const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
      cabin.position.set(0, 0.75, 0.3);
      group.add(cabin);
      
      // Spoiler
      const spoilerGeometry = new THREE.BoxGeometry(1.4, 0.08, 0.15);
      const spoiler = new THREE.Mesh(spoilerGeometry, bodyMaterial);
      spoiler.position.set(0, 0.7, 1.4);
      group.add(spoiler);
      const spoilerStand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08), bodyMaterial);
      [-0.5, 0.5].forEach(x => {
        const stand = spoilerStand.clone();
        stand.position.set(x, 0.55, 1.4);
        group.add(stand);
      });
      
      // Wheels (low profile)
      const wheelGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.25, 12);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [[-0.75, -1], [0.75, -1], [-0.75, 1], [0.75, 1]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.22, z);
        group.add(wheel);
      });
      
      mesh = group;
      isMoving = true;
      moveDirection = Math.random() > 0.3 ? -2 : 0.6; // Sports cars are FAST
    } else if (type === 'bus') {
      // Large bus
      const group = new THREE.Group();
      
      // Bus body
      const bodyGeometry = new THREE.BoxGeometry(2.4, 1.8, 6);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xffcc00 }); // School bus yellow
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 1.2;
      group.add(body);
      
      // Windows
      const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 });
      for (let i = 0; i < 5; i++) {
        [-1.21, 1.21].forEach(x => {
          const window = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.5), windowMaterial);
          window.position.set(x, 1.4, -2 + i * 1);
          window.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
          group.add(window);
        });
      }
      
      // Front windshield
      const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.8), windowMaterial);
      frontWindow.position.set(0, 1.5, -3);
      group.add(frontWindow);
      
      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.35, 12);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [[-1.1, -2], [1.1, -2], [-1.1, 2], [1.1, 2]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.4, z);
        group.add(wheel);
      });
      
      mesh = group;
      isMoving = true;
      moveDirection = Math.random() > 0.5 ? -0.6 : 0.15; // Buses are slow
    } else if (type === 'pickupTruck') {
      // Pickup truck
      const group = new THREE.Group();
      
      // Cab
      const cabGeometry = new THREE.BoxGeometry(1.8, 0.9, 1.8);
      const cabMaterial = new THREE.MeshLambertMaterial({ color: 0x336699 });
      const cab = new THREE.Mesh(cabGeometry, cabMaterial);
      cab.position.set(0, 0.85, -0.8);
      group.add(cab);
      
      // Bed
      const bedGeometry = new THREE.BoxGeometry(1.8, 0.4, 2);
      const bed = new THREE.Mesh(bedGeometry, cabMaterial);
      bed.position.set(0, 0.55, 0.9);
      group.add(bed);
      
      // Bed walls
      const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x224466 });
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.1), wallMaterial);
      backWall.position.set(0, 0.85, 1.85);
      group.add(backWall);
      [-0.9, 0.9].forEach(x => {
        const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 2), wallMaterial);
        sideWall.position.set(x, 0.85, 0.9);
        group.add(sideWall);
      });
      
      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 12);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [[-0.8, -1.2], [0.8, -1.2], [-0.8, 1.2], [0.8, 1.2]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.3, z);
        group.add(wheel);
      });
      
      mesh = group;
      isMoving = true;
      moveDirection = Math.random() > 0.4 ? -0.9 : 0.3;
    } else if (type === 'taxi') {
      // Yellow taxi
      const group = new THREE.Group();
      
      // Body
      const bodyGeometry = new THREE.BoxGeometry(1.6, 0.5, 2.8);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.6;
      group.add(body);
      
      // Cabin
      const cabinGeometry = new THREE.BoxGeometry(1.4, 0.45, 1.3);
      const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
      cabin.position.set(0, 1.0, 0.2);
      group.add(cabin);
      
      // Taxi sign on roof
      const signGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.25);
      const signMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const sign = new THREE.Mesh(signGeometry, signMaterial);
      sign.position.set(0, 1.35, 0.2);
      group.add(sign);
      
      // Checkered stripe
      const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
      for (let i = 0; i < 8; i++) {
        if (i % 2 === 0) {
          const check = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.2), stripeMaterial);
          check.position.set(-0.81, 0.45, -1 + i * 0.25);
          group.add(check);
        }
      }
      
      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      [[-0.7, -0.9], [0.7, -0.9], [-0.7, 0.9], [0.7, 0.9]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.25, z);
        group.add(wheel);
      });
      
      mesh = group;
      isMoving = true;
      moveDirection = Math.random() > 0.4 ? -1 : 0.35;
    } else {
      // Oil spill (default)
      const geometry = new THREE.CircleGeometry(1.2, 16);
      const material = new THREE.MeshLambertMaterial({ 
        color: 0x222233,
        transparent: true,
        opacity: 0.8
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.02;
    }
    
    mesh.position.set(lane, mesh.position.y, zPosition);
    (mesh as THREE.Mesh).castShadow = true;
    this.scene.add(mesh);
    
    return { mesh, lane, z: zPosition, type, isMoving, moveDirection };
  }

  private createSupplyDrop(zPosition: number): SupplyDrop {
    const lane = this.LANES[Math.floor(Math.random() * this.LANES.length)];
    const types = ['fuel', 'fuel', 'fuel', 'health', 'money', 'coin', 'coin', 'coin', 'goldCoin', 'diamond'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    
    const group = new THREE.Group();
    
    if (type === 'coin') {
      // Regular coin - spinning golden disc
      const coinGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16);
      const coinMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 0.4
      });
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      coin.rotation.x = Math.PI / 2;
      coin.position.y = 0.8;
      group.add(coin);
      
      // Dollar sign on coin
      const signGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.09);
      const signMaterial = new THREE.MeshLambertMaterial({ color: 0xaa8800 });
      const vSign = new THREE.Mesh(signGeometry, signMaterial);
      vSign.position.set(0, 0.8, 0.01);
      group.add(vSign);
      
      // Glow
      const glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.25
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.y = 0.8;
      group.add(glow);
    } else if (type === 'goldCoin') {
      // Gold coin - larger and shinier
      const coinGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 20);
      const coinMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xffcc00,
        emissive: 0xffdd00,
        emissiveIntensity: 0.6
      });
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      coin.rotation.x = Math.PI / 2;
      coin.position.y = 0.8;
      group.add(coin);
      
      // Star on gold coin
      const starMaterial = new THREE.MeshLambertMaterial({ color: 0xff8800 });
      for (let i = 0; i < 5; i++) {
        const ray = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.11), starMaterial);
        ray.rotation.z = (i / 5) * Math.PI * 2;
        ray.position.set(0, 0.8, 0.01);
        group.add(ray);
      }
      
      // Bigger glow
      const glowGeometry = new THREE.SphereGeometry(0.7, 8, 8);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffcc00,
        transparent: true,
        opacity: 0.35
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.y = 0.8;
      group.add(glow);
    } else if (type === 'diamond') {
      // Diamond - rare and valuable
      const diamondGeometry = new THREE.OctahedronGeometry(0.4, 0);
      const diamondMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x88ffff,
        emissive: 0x44aaff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.9
      });
      const diamond = new THREE.Mesh(diamondGeometry, diamondMaterial);
      diamond.position.y = 1;
      diamond.scale.set(1, 1.5, 1);
      group.add(diamond);
      
      // Sparkle glow
      const glowGeometry = new THREE.SphereGeometry(0.6, 8, 8);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ffff,
        transparent: true,
        opacity: 0.4
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.y = 1;
      group.add(glow);
    } else if (type === 'fuel') {
      // Fuel canister - red jerrycan style
      const canisterMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xff3300,
        emissive: 0xff2200,
        emissiveIntensity: 0.3
      });
      
      // Main body
      const bodyGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.3);
      const body = new THREE.Mesh(bodyGeometry, canisterMaterial);
      body.position.y = 0.5;
      group.add(body);
      
      // Handle
      const handleGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.08);
      const handle = new THREE.Mesh(handleGeometry, canisterMaterial);
      handle.position.set(0, 0.95, 0);
      group.add(handle);
      
      // Spout
      const spoutGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 8);
      const spout = new THREE.Mesh(spoutGeometry, canisterMaterial);
      spout.position.set(0.15, 0.95, 0);
      group.add(spout);
      
      // Cap
      const capMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const capGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8);
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.set(0.15, 1.05, 0);
      group.add(cap);
      
      // Fuel label (yellow stripe)
      const labelMaterial = new THREE.MeshLambertMaterial({ color: 0xffdd00 });
      const labelGeometry = new THREE.BoxGeometry(0.35, 0.15, 0.31);
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(0, 0.5, 0);
      group.add(label);
      
      // Glow
      const glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.25
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.y = 0.5;
      group.add(glow);
    } else {
      // Health and money crate-style drops
      const crateGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const crateColor = {
        health: 0xff4444,
        money: 0x44ff44
      }[type] || 0xffffff;
      
      const crateMaterial = new THREE.MeshLambertMaterial({ 
        color: crateColor,
        emissive: crateColor,
        emissiveIntensity: 0.3
      });
      const crate = new THREE.Mesh(crateGeometry, crateMaterial);
      crate.position.y = 0.5;
      group.add(crate);
      
      const glowGeometry = new THREE.SphereGeometry(0.6, 8, 8);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: crateColor,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.y = 0.5;
      group.add(glow);
    }
    
    group.userData.floatOffset = Math.random() * Math.PI * 2;
    
    const value = {
      fuel: 20,
      health: 20,
      money: 25,
      coin: 10,
      goldCoin: 50,
      diamond: 100
    }[type] || 10;
    
    group.position.set(lane, 0, zPosition);
    this.scene.add(group);
    
    return { mesh: group, lane, z: zPosition, type, value };
  }

  private createCrossroad(zPosition: number): THREE.Group {
    const crossroadGroup = new THREE.Group();

    const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.3, 8);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x5a5a5a });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.15;
    platform.receiveShadow = true;
    crossroadGroup.add(platform);

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

    const postGeometry = new THREE.BoxGeometry(0.3, 3, 0.3);
    const postMaterial = new THREE.MeshLambertMaterial({ color: 0x5a4a3a });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.set(0, 1.5, 0);
    post.castShadow = true;
    crossroadGroup.add(post);

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

    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x8a6a4a });

    for (let i = 0; i < 60; i++) {
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

    const cactusMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
    for (let i = 0; i < 30; i++) {
      const cactus = new THREE.Group();
      
      const mainGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2 + Math.random() * 2, 8);
      const main = new THREE.Mesh(mainGeometry, cactusMaterial);
      main.position.y = 1;
      main.castShadow = true;
      cactus.add(main);
      
      if (Math.random() > 0.3) {
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1, 6);
        const arm = new THREE.Mesh(armGeometry, cactusMaterial);
        arm.position.set(0.4, 1.2, 0);
        arm.rotation.z = -Math.PI / 4;
        arm.castShadow = true;
        cactus.add(arm);
      }
      if (Math.random() > 0.5) {
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 6);
        const arm = new THREE.Mesh(armGeometry, cactusMaterial);
        arm.position.set(-0.35, 1.5, 0);
        arm.rotation.z = Math.PI / 4;
        arm.castShadow = true;
        cactus.add(arm);
      }
      
      const side = Math.random() > 0.5 ? 1 : -1;
      cactus.position.set(
        side * (this.ROAD_WIDTH / 2 + 6 + Math.random() * 25),
        0,
        Math.random() * 250 - 125
      );
      decorGroup.add(cactus);
    }

    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 3, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
    const branchGeometry = new THREE.CylinderGeometry(0.05, 0.15, 1.5, 5);

    for (let i = 0; i < 15; i++) {
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
        side * (this.ROAD_WIDTH / 2 + 10 + Math.random() * 25),
        0,
        Math.random() * 250 - 125
      );
      decorGroup.add(tree);
    }

    return decorGroup;
  }

  private createSkybox(): void {
    const skyGeometry = new THREE.SphereGeometry(200, 32, 32);
    this.skyMaterial = new THREE.ShaderMaterial({
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
    const sky = new THREE.Mesh(skyGeometry, this.skyMaterial);
    this.scene.add(sky);

    const sunGeometry = new THREE.SphereGeometry(8, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc66 });
    this.sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    this.sunMesh.position.set(-80, 25, -100);
    this.scene.add(this.sunMesh);

    const moonGeometry = new THREE.SphereGeometry(5, 16, 16);
    const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeff });
    this.moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    this.moonMesh.position.set(80, -50, -100);
    this.scene.add(this.moonMesh);
  }

  public updateTimeOfDay(time: number): void {
    this.timeOfDay = time;
    
    const sunAngle = ((time - 6) / 12) * Math.PI;
    const isDay = time >= 6 && time < 18;
    
    if (this.sunMesh) {
      const sunHeight = Math.sin(sunAngle) * 80;
      const sunX = Math.cos(sunAngle) * 100 - 50;
      this.sunMesh.position.set(sunX, isDay ? sunHeight : -50, -100);
    }
    
    if (this.moonMesh) {
      const moonAngle = ((time + 6) / 12) * Math.PI;
      const moonHeight = Math.sin(moonAngle) * 60;
      this.moonMesh.position.set(Math.cos(moonAngle) * 80, !isDay ? moonHeight : -50, -100);
    }
    
    if (isDay) {
      const dayProgress = (time - 6) / 12;
      
      if (dayProgress < 0.2) {
        this.ambientLight.color.setHex(0xffaa77);
        this.ambientLight.intensity = 0.3 + dayProgress * 1.5;
        this.sunLight.color.setHex(0xffaa44);
        this.sunLight.intensity = 0.5 + dayProgress * 3;
      } else if (dayProgress > 0.8) {
        const eveningProgress = (dayProgress - 0.8) / 0.2;
        this.ambientLight.color.setHex(0xff8855);
        this.ambientLight.intensity = 0.6 - eveningProgress * 0.3;
        this.sunLight.color.setHex(0xff6622);
        this.sunLight.intensity = 1.2 - eveningProgress * 0.8;
      } else {
        this.ambientLight.color.setHex(0xffffff);
        this.ambientLight.intensity = 0.6;
        this.sunLight.color.setHex(0xffeedd);
        this.sunLight.intensity = 1.4;
      }
      
      if (this.skyMaterial) {
        if (dayProgress < 0.2) {
          this.skyMaterial.uniforms.topColor.value.setHex(0x4477aa);
          this.skyMaterial.uniforms.bottomColor.value.setHex(0xffaa77);
        } else if (dayProgress > 0.8) {
          this.skyMaterial.uniforms.topColor.value.setHex(0x331133);
          this.skyMaterial.uniforms.bottomColor.value.setHex(0xff5533);
        } else {
          this.skyMaterial.uniforms.topColor.value.setHex(0x4488cc);
          this.skyMaterial.uniforms.bottomColor.value.setHex(0xaaddff);
        }
      }
      
      if (this.stars) {
        (this.stars.material as THREE.PointsMaterial).opacity = 0;
      }
    } else {
      this.ambientLight.color.setHex(0x334466);
      this.ambientLight.intensity = 0.15;
      this.sunLight.color.setHex(0x6688aa);
      this.sunLight.intensity = 0.2;
      
      if (this.skyMaterial) {
        this.skyMaterial.uniforms.topColor.value.setHex(0x0a0a1a);
        this.skyMaterial.uniforms.bottomColor.value.setHex(0x1a1a2a);
      }
      
      if (this.stars) {
        (this.stars.material as THREE.PointsMaterial).opacity = 0.8;
      }
    }
    
    const fogColor = isDay ? 0x8899aa : 0x1a1a2a;
    this.scene.fog = new THREE.Fog(fogColor, 30, 150);
  }

  public updateWeather(weather: WeatherType, intensity: number = 0.5): void {
    this.weatherType = weather;
    
    const dustMaterial = this.dustParticles?.material as THREE.PointsMaterial;
    const weatherMaterial = this.weatherParticles?.material as THREE.PointsMaterial;
    
    switch (weather) {
      case 'sandstorm':
        if (dustMaterial) {
          dustMaterial.opacity = 0.3 + intensity * 0.4;
          dustMaterial.size = 0.5 + intensity * 0.3;
        }
        if (weatherMaterial) {
          weatherMaterial.opacity = 0.4 + intensity * 0.3;
        }
        this.scene.fog = new THREE.Fog(0xd4a574, 10 - intensity * 5, 80 - intensity * 30);
        break;
        
      case 'dusty':
        if (dustMaterial) {
          dustMaterial.opacity = 0.15;
          dustMaterial.size = 0.3;
        }
        if (weatherMaterial) weatherMaterial.opacity = 0;
        this.scene.fog = new THREE.Fog(0xb8a090, 40, 120);
        break;
        
      case 'windy':
        if (dustMaterial) dustMaterial.opacity = 0.08;
        if (weatherMaterial) {
          weatherMaterial.opacity = 0.2;
          weatherMaterial.size = 1.2;
        }
        break;
        
      default:
        if (dustMaterial) dustMaterial.opacity = 0;
        if (weatherMaterial) weatherMaterial.opacity = 0;
        this.scene.fog = new THREE.Fog(0x2a2015, 30, 150);
    }
  }

  private updateWeatherParticles(deltaTime: number, speed: number): void {
    if (this.dustParticles) {
      const positions = this.dustParticles.geometry.attributes.position.array as Float32Array;
      const windSpeed = this.weatherType === 'sandstorm' ? 30 : this.weatherType === 'windy' ? 15 : 5;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (Math.random() - 0.3) * windSpeed * deltaTime;
        positions[i + 1] += (Math.random() - 0.5) * 2 * deltaTime;
        positions[i + 2] += speed * deltaTime * 10;
        
        if (positions[i] > 50) positions[i] -= 100;
        if (positions[i] < -50) positions[i] += 100;
        if (positions[i + 2] > 100) positions[i + 2] -= 200;
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }
    
    if (this.weatherParticles && this.weatherType === 'windy') {
      const positions = this.weatherParticles.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += 20 * deltaTime;
        positions[i + 2] += speed * deltaTime * 10;
        
        if (positions[i] > 40) positions[i] -= 80;
        if (positions[i + 2] > 75) positions[i + 2] -= 150;
      }
      this.weatherParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  public update(
    deltaTime: number,
    speed: number,
    steering: number,
    isPaused: boolean
  ): { movement: number; collisions: { type: string; damage?: number; pickup?: { type: string; value: number } }[] } {
    const collisions: { type: string; damage?: number; pickup?: { type: string; value: number } }[] = [];
    
    if (isPaused) {
      this.renderer.render(this.scene, this.camera);
      return { movement: 0, collisions };
    }

    const movement = speed * deltaTime * 10;
    this.roadOffset += movement;

    // Increase difficulty over time
    this.difficultyMultiplier = 1 + (this.roadOffset / 1000) * 0.3;

    this.targetRotation = steering * 0.3;
    this.jeepRotation += (this.targetRotation - this.jeepRotation) * 0.1;

    this.jeepPosition.x += steering * speed * deltaTime * 3;
    this.jeepPosition.x = THREE.MathUtils.clamp(
      this.jeepPosition.x,
      -this.ROAD_WIDTH / 2 + 2,
      this.ROAD_WIDTH / 2 - 2
    );

    this.jeep.position.x = this.jeepPosition.x;
    this.jeep.rotation.y = this.jeepRotation;
    this.jeep.position.y = Math.sin(this.roadOffset * 0.5) * 0.03;

    this.roadSegments.forEach((segment) => {
      segment.position.z += movement;
      if (segment.position.z > this.ROAD_SEGMENT_LENGTH * 2) {
        segment.position.z -= this.NUM_ROAD_SEGMENTS * this.ROAD_SEGMENT_LENGTH;
      }
    });

    this.decorations.children.forEach((child) => {
      child.position.z += movement;
      if (child.position.z > 150) {
        child.position.z -= 300;
      }
    });

    // Spawn obstacles more frequently as difficulty increases
    if (this.roadOffset >= this.nextObstacleDistance) {
      // Spawn 2-4 obstacles at once based on difficulty
      const numObstacles = Math.min(4, Math.floor((2 + Math.random() * this.difficultyMultiplier) * this.difficultyConfig.obstacleSpawnRate));
      for (let j = 0; j < numObstacles; j++) {
        this.obstacles.push(this.createObstacle(-60 - Math.random() * 50 - j * 15));
      }
      // Faster spawning - obstacles appear more frequently (adjusted by difficulty)
      const baseInterval = Math.max(6, (20 - this.difficultyMultiplier * 3) / this.difficultyConfig.obstacleSpawnRate);
      this.nextObstacleDistance += baseInterval + Math.random() * 15;
    }

    // Spawn supply drops
    if (this.roadOffset >= this.nextSupplyDropDistance) {
      this.supplyDrops.push(this.createSupplyDrop(-100 - Math.random() * 30));
      // Adjust supply drop rate based on difficulty
      this.nextSupplyDropDistance += (60 + Math.random() * 80) / this.difficultyConfig.supplyDropRate;
    }

    // Update and check obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.mesh.position.z += movement;
      obstacle.z = obstacle.mesh.position.z;
      
      // Moving obstacles (tumbleweeds, vehicles)
      if (obstacle.isMoving && obstacle.moveDirection) {
        // Check if it's a vehicle type
        const vehicleTypes = ['trafficCar', 'truck', 'motorcycle', 'policeCar', 'ambulance', 'sportsCar', 'bus', 'pickupTruck', 'taxi'];
        
        if (vehicleTypes.includes(obstacle.type)) {
          // Vehicles move along the road
          const vehicleSpeed = obstacle.moveDirection * deltaTime * 15 * speed;
          obstacle.mesh.position.z += vehicleSpeed;
          obstacle.z = obstacle.mesh.position.z;
          
          // Face the correct direction
          if (obstacle.moveDirection < 0) {
            obstacle.mesh.rotation.y = Math.PI; // Coming towards player
          }
        } else {
          // Tumbleweeds roll sideways
          obstacle.mesh.position.x += obstacle.moveDirection * deltaTime * 3;
          obstacle.lane = obstacle.mesh.position.x;
          obstacle.mesh.rotation.x += deltaTime * 5;
          obstacle.mesh.rotation.z += deltaTime * 3;
          
          // Bounce off edges
          if (obstacle.mesh.position.x > this.ROAD_WIDTH / 2 - 1) {
            obstacle.moveDirection = -1;
          } else if (obstacle.mesh.position.x < -this.ROAD_WIDTH / 2 + 1) {
            obstacle.moveDirection = 1;
          }
        }
      }
      
      // Collision detection with variable hitbox based on obstacle type
      let hitboxWidth = 1.3;
      let hitboxDepth = 2.5;
      
      switch (obstacle.type) {
        case 'truck': hitboxWidth = 2.5; hitboxDepth = 4; break;
        case 'trafficCar': hitboxWidth = 1.8; hitboxDepth = 3; break;
        case 'motorcycle': hitboxWidth = 0.8; hitboxDepth = 2; break;
        case 'brokenCar': hitboxWidth = 2; hitboxDepth = 3; break;
        case 'constructionBarrier': hitboxWidth = 3; hitboxDepth = 1; break;
        case 'oilSpill': hitboxWidth = 1.5; hitboxDepth = 1.5; break;
        case 'pothole': hitboxWidth = 1; hitboxDepth = 1; break;
        case 'policeCar': hitboxWidth = 1.8; hitboxDepth = 3.2; break;
        case 'ambulance': hitboxWidth = 2; hitboxDepth = 3.5; break;
        case 'sportsCar': hitboxWidth = 1.6; hitboxDepth = 3; break;
        case 'bus': hitboxWidth = 2.2; hitboxDepth = 5; break;
        case 'pickupTruck': hitboxWidth = 2; hitboxDepth = 3.5; break;
        case 'taxi': hitboxWidth = 1.8; hitboxDepth = 3; break;
      }
      
      const dx = Math.abs(this.jeepPosition.x - obstacle.mesh.position.x);
      const dz = Math.abs(obstacle.z);
      
      if (dx < hitboxWidth && dz < hitboxDepth) {
        // Different damage for different obstacles
        let damage = 10;
        switch (obstacle.type) {
          case 'rock': damage = 18; break;
          case 'brokenCar': damage = 25; break;
          case 'barrel': damage = 20; break;
          case 'cactus': damage = 12; break;
          case 'debris': damage = 10; break;
          case 'tumbleweed': damage = 5; break;
          case 'oilSpill': damage = 8; break;
          case 'trafficCar': damage = 35; break;
          case 'truck': damage = 50; break;
          case 'motorcycle': damage = 20; break;
          case 'pothole': damage = 15; break;
          case 'constructionBarrier': damage = 12; break;
          case 'sandbags': damage = 8; break;
          case 'policeCar': damage = 40; break;
          case 'ambulance': damage = 45; break;
          case 'sportsCar': damage = 30; break;
          case 'bus': damage = 60; break;
          case 'pickupTruck': damage = 35; break;
          case 'taxi': damage = 30; break;
        }
        
        // Apply difficulty damage multiplier
        damage = Math.round(damage * this.difficultyConfig.obstacleDamage);
        
        collisions.push({ type: 'obstacle', damage });
        
        if (this.onObstacleHit) {
          this.onObstacleHit(damage);
        }
        
        this.scene.remove(obstacle.mesh);
        this.obstacles.splice(i, 1);
        continue;
      }
      
      if (obstacle.z > 30) {
        this.scene.remove(obstacle.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    for (let i = this.supplyDrops.length - 1; i >= 0; i--) {
      const drop = this.supplyDrops[i];
      drop.mesh.position.z += movement;
      drop.z = drop.mesh.position.z;
      
      const floatOffset = (drop.mesh as THREE.Group).userData.floatOffset || 0;
      drop.mesh.position.y = 0.3 + Math.sin(Date.now() * 0.003 + floatOffset) * 0.2;
      drop.mesh.rotation.y += deltaTime * 2;
      
      const dx = Math.abs(this.jeepPosition.x - drop.lane);
      const dz = Math.abs(drop.z);
      
      if (dx < 1.8 && dz < 2.5) {
        collisions.push({ type: 'pickup', pickup: { type: drop.type, value: drop.value } });
        
        if (this.onSupplyCollected) {
          this.onSupplyCollected(drop.type, drop.value);
        }
        
        this.scene.remove(drop.mesh);
        this.supplyDrops.splice(i, 1);
        continue;
      }
      
      if (drop.z > 30) {
        this.scene.remove(drop.mesh);
        this.supplyDrops.splice(i, 1);
      }
    }

    if (this.roadOffset >= this.nextCrossroadDistance) {
      const crossroad = this.createCrossroad(-100);
      this.crossroads.push(crossroad);
      this.scene.add(crossroad);
      this.nextCrossroadDistance += this.CROSSROAD_INTERVAL;
    }

    let triggeredEncounter = false;
    this.crossroads.forEach((crossroad, index) => {
      crossroad.position.z += movement;

      if (crossroad.position.z > -5 && crossroad.position.z < 5 && !triggeredEncounter) {
        triggeredEncounter = true;
        if (this.onCrossroadReached) {
          this.onCrossroadReached();
        }
      }

      if (crossroad.position.z > 50) {
        this.scene.remove(crossroad);
        this.crossroads.splice(index, 1);
      }
    });

    this.updateWeatherParticles(deltaTime, speed);

    this.renderer.render(this.scene, this.camera);

    return { movement, collisions };
  }

  private handleResize = (): void => {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  public setDifficulty(config: DifficultyConfig): void {
    this.difficultyConfig = config;
  }

  public reset(): void {
    // Clear obstacles
    this.obstacles.forEach(obs => this.scene.remove(obs.mesh));
    this.obstacles = [];
    
    // Clear supply drops
    this.supplyDrops.forEach(drop => this.scene.remove(drop.mesh));
    this.supplyDrops = [];
    
    // Reset positions and state
    this.roadOffset = 0;
    this.nextCrossroadDistance = 150;
    this.nextObstacleDistance = 15;
    this.nextSupplyDropDistance = 50;
    this.difficultyMultiplier = 1;
    this.jeepPosition = { x: 0, z: 0 };
    this.jeep.position.set(0, 0.5, 0);
  }

  public getDifficultyConfig(): DifficultyConfig {
    return this.difficultyConfig;
  }

  public dispose(): void {
    window.removeEventListener("resize", this.handleResize);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
