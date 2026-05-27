import * as THREE from 'three';

/**
 * Initialize a Three.js scene with standard settings
 */
export function initializeScene(
  canvas: HTMLCanvasElement,
  options: {
    width?: number;
    height?: number;
    backgroundColor?: number;
    pixelRatio?: number;
    transparent?: boolean;
  } = {}
) {
  const rect = canvas.getBoundingClientRect();
  const {
    width = rect.width || window.innerWidth,
    height = rect.height || window.innerHeight,
    backgroundColor = 0x0a0a0a,
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2),
    transparent = true,
  } = options;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: transparent,
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  if (!transparent) {
    scene.background = new THREE.Color(backgroundColor);
  }

  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 1000);
  camera.position.set(0, 0.8, 7);
  camera.lookAt(0, 0.5, 0);

  return { scene, camera, renderer };
}

/**
 * Set up beautiful studio-style lighting
 */
export function setupLighting(scene: THREE.Scene) {
  // Key light — upper right, warm, main light source
  const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.2);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  // Fill light — soft, left side, cooler tone
  const fillLight = new THREE.DirectionalLight(0xddeeff, 0.7);
  fillLight.position.set(-6, 3, 4);
  scene.add(fillLight);

  // Rim / backlight — creates a glowing halo on the edges
  const rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
  rimLight.position.set(0, 5, -7);
  scene.add(rimLight);

  // Under-fill — subtle warm bounce from below
  const underLight = new THREE.DirectionalLight(0xffcc88, 0.35);
  underLight.position.set(0, -4, 3);
  scene.add(underLight);

  // Ambient light — soft overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Hemisphere light — sky blue from top, warm from bottom
  const hemiLight = new THREE.HemisphereLight(0xccddff, 0x443322, 0.4);
  scene.add(hemiLight);

  return { keyLight, fillLight, rimLight, ambientLight, hemiLight };
}

/**
 * Create a beautiful cream material
 */
export function createCreamMaterial(color: string | number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.35,
    metalness: 0.05,
    clearcoat: 0.6,
    clearcoatRoughness: 0.3,
    sheen: 0.5,
    sheenColor: new THREE.Color(0xffffff),
    sheenRoughness: 0.5,
  });
}

/**
 * Create a glossy chocolate-coated material
 */
export function createGlossyMaterial(color: string | number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.15,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
}

/**
 * Create wood material for the stick
 */
export function createWoodMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    roughness: 0.85,
    metalness: 0.0,
  });
}

/**
 * Create a beautiful popsicle (paleta) ice cream geometry
 */
export function createPopsicleGeometry(color: string, scale = 1): THREE.Group {
  const group = new THREE.Group();

  // Main popsicle body - rounded rectangular shape
  const bodyShape = new THREE.Shape();
  const width = 0.9;
  const height = 1.6;
  const radius = 0.35;

  bodyShape.moveTo(-width + radius, -height);
  bodyShape.lineTo(width - radius, -height);
  bodyShape.quadraticCurveTo(width, -height, width, -height + radius);
  bodyShape.lineTo(width, height - radius * 1.5);
  bodyShape.quadraticCurveTo(width, height, width - radius * 1.5, height);
  bodyShape.lineTo(-width + radius * 1.5, height);
  bodyShape.quadraticCurveTo(-width, height, -width, height - radius * 1.5);
  bodyShape.lineTo(-width, -height + radius);
  bodyShape.quadraticCurveTo(-width, -height, -width + radius, -height);

  const extrudeSettings = {
    steps: 1,
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.12,
    bevelOffset: 0,
    bevelSegments: 8,
  };

  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  bodyGeometry.center();
  const bodyMaterial = createCreamMaterial(color);
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.scale.set(scale, scale, scale);
  body.position.y = 0.3 * scale;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Highlights/glossy reflection on the front (subtle layer)
  const highlightShape = new THREE.Shape();
  highlightShape.moveTo(-0.3, -1.2);
  highlightShape.lineTo(-0.1, -1.2);
  highlightShape.lineTo(-0.05, 1.2);
  highlightShape.lineTo(-0.25, 1.2);
  highlightShape.lineTo(-0.3, -1.2);

  const highlightGeometry = new THREE.ShapeGeometry(highlightShape);
  const highlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15,
  });
  const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
  highlight.position.set(0, 0.3 * scale, 0.45 * scale);
  highlight.scale.set(scale, scale, scale);
  group.add(highlight);

  // Wooden stick
  const stickGeometry = new THREE.BoxGeometry(0.28, 1.2, 0.12);
  stickGeometry.translate(0, -0.6, 0);
  const stickMaterial = createWoodMaterial();
  const stick = new THREE.Mesh(stickGeometry, stickMaterial);
  stick.position.y = -1.2 * scale;
  stick.scale.set(scale, scale, scale);
  stick.castShadow = true;
  stick.receiveShadow = true;
  group.add(stick);

  // Top "bite" detail - small indentations for premium look
  for (let i = 0; i < 3; i++) {
    const dotGeometry = new THREE.SphereGeometry(0.04 * scale, 16, 16);
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(
      (i - 1) * 0.4 * scale,
      1.4 * scale,
      0.46 * scale
    );
    group.add(dot);
  }

  return group;
}

/**
 * Create a beautiful ice cream cone geometry
 */
export function createConeIceCreamGeometry(color: string, scale = 1): THREE.Group {
  const group = new THREE.Group();

  // Ice cream scoop on top (sphere)
  const scoopGeometry = new THREE.SphereGeometry(0.85, 32, 32);
  const scoopMaterial = createCreamMaterial(color);
  const scoop = new THREE.Mesh(scoopGeometry, scoopMaterial);
  scoop.position.y = 0.7 * scale;
  scoop.scale.set(scale, scale, scale);
  scoop.castShadow = true;
  scoop.receiveShadow = true;
  group.add(scoop);

  // Second scoop (smaller, on top)
  const scoop2Geometry = new THREE.SphereGeometry(0.6, 32, 32);
  const scoop2 = new THREE.Mesh(scoop2Geometry, scoopMaterial);
  scoop2.position.y = 1.5 * scale;
  scoop2.scale.set(scale, scale * 0.9, scale);
  scoop2.castShadow = true;
  scoop2.receiveShadow = true;
  group.add(scoop2);

  // Cone (waffle)
  const coneGeometry = new THREE.ConeGeometry(0.7, 1.8, 32);
  const coneMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd4a574,
    roughness: 0.7,
    metalness: 0.1,
  });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.position.y = -0.9 * scale;
  cone.rotation.x = Math.PI;
  cone.scale.set(scale, scale, scale);
  cone.castShadow = true;
  cone.receiveShadow = true;
  group.add(cone);

  // Waffle pattern (simple lines)
  for (let i = 0; i < 8; i++) {
    const lineGeometry = new THREE.TorusGeometry(0.6, 0.02, 8, 16);
    const lineMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b6f47,
      roughness: 0.8,
    });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.position.y = (-1.5 + i * 0.2) * scale;
    line.rotation.x = Math.PI / 2;
    line.scale.set(scale * (1 - i * 0.1), 1, scale * (1 - i * 0.1));
    group.add(line);
  }

  // Cherry on top
  const cherryGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const cherryMaterial = createGlossyMaterial(0xc41e3a);
  const cherry = new THREE.Mesh(cherryGeometry, cherryMaterial);
  cherry.position.y = 2.05 * scale;
  cherry.scale.set(scale, scale, scale);
  cherry.castShadow = true;
  group.add(cherry);

  // Cherry stem
  const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.position.y = 2.2 * scale;
  stem.rotation.z = 0.3;
  stem.scale.set(scale, scale, scale);
  group.add(stem);

  return group;
}

/**
 * Create a beautiful cup ice cream geometry
 */
export function createCupIceCreamGeometry(color: string, scale = 1): THREE.Group {
  const group = new THREE.Group();

  // Cup container
  const cupGeometry = new THREE.CylinderGeometry(0.85, 0.6, 1.2, 32);
  const cupMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.0,
  });
  const cup = new THREE.Mesh(cupGeometry, cupMaterial);
  cup.position.y = -0.4 * scale;
  cup.scale.set(scale, scale, scale);
  cup.castShadow = true;
  cup.receiveShadow = true;
  group.add(cup);

  // Ice cream scoop on top
  const scoopGeometry = new THREE.SphereGeometry(0.9, 32, 32);
  const scoopMaterial = createCreamMaterial(color);
  const scoop = new THREE.Mesh(scoopGeometry, scoopMaterial);
  scoop.position.y = 0.5 * scale;
  scoop.scale.set(scale, scale * 0.85, scale);
  scoop.castShadow = true;
  scoop.receiveShadow = true;
  group.add(scoop);

  return group;
}

/**
 * Soft-serve swirl ice cream cone — realistic version
 *
 * Strategy:
 *  1. LatheGeometry body with periodic coil-bumps → smooth, solid, no gaps
 *  2. Thin TubeGeometry groove on top → visible spiral line when rotating
 *  3. Solid waffle cone with thick rings + diagonals
 */
export function createSoftServeGeometry(color: string, scale = 1): THREE.Group {
  const group = new THREE.Group();

  // ════════════════════════════════════════════
  // 1. WAFFLE CONE — solid, golden, with grid
  // ════════════════════════════════════════════
  const coneH    = 2.0 * scale;
  const coneTopR = 0.68 * scale;
  const coneBotR = 0.03 * scale;

  const coneMat = new THREE.MeshPhysicalMaterial({
    color: 0xc07828,
    roughness: 0.62,
    metalness: 0.0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.55,
  });
  const coneMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(coneTopR, coneBotR, coneH, 48, 1, false),
    coneMat,
  );
  coneMesh.position.y = -(coneH / 2);
  coneMesh.castShadow = true;
  coneMesh.receiveShadow = true;
  group.add(coneMesh);

  // Waffle rings — thick, clearly visible
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x7a4820, roughness: 0.72 });
  for (let i = 0; i < 9; i++) {
    const t = i / 9;
    const r = THREE.MathUtils.lerp(coneTopR * 0.97, coneBotR + 0.07 * scale, t);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.024 * scale, 8, 40), ringMat);
    ring.position.y = -(t * coneH * 0.94);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }
  // Diagonal waffle strands
  for (let s = 0; s < 8; s++) {
    const pts: THREE.Vector3[] = [];
    const a0 = (s / 8) * Math.PI * 2;
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const r = THREE.MathUtils.lerp(coneTopR * 0.96, coneBotR + 0.05 * scale, t);
      pts.push(new THREE.Vector3(
        Math.cos(a0 + t * Math.PI * 0.7) * r,
        -(t * coneH * 0.93),
        Math.sin(a0 + t * Math.PI * 0.7) * r,
      ));
    }
    group.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.018 * scale, 6, false),
      ringMat,
    ));
  }

  // ════════════════════════════════════════════
  // 2. ICE CREAM BODY — LatheGeometry with
  //    periodic coil-bumps so it looks like
  //    real stacked soft-serve, not balloons
  // ════════════════════════════════════════════
  const H       = 3.0 * scale;
  const nLoops  = 6;
  const pitch   = H / nLoops;
  const bumpAmp = 0.055 * scale; // subtle bump per coil

  // Build 2-D profile with cosine bumps
  const lathePts: THREE.Vector2[] = [];
  lathePts.push(new THREE.Vector2(0, 0)); // centre of base
  const profileSegs = nLoops * 30;       // 30 points per coil = smooth
  for (let i = 0; i <= profileSegs; i++) {
    const t  = i / profileSegs;
    const y  = t * H;
    // Smooth taper: wide base → zero at tip
    const baseR = THREE.MathUtils.lerp(coneTopR * 0.98, 0, Math.pow(t, 0.82));
    // Cosine bump: one full period per loop
    const bump  = Math.cos((y / pitch) * Math.PI * 2) * bumpAmp * (1 - t * 0.75);
    const r     = Math.max(0, baseR + bump);
    lathePts.push(new THREE.Vector2(r, y));
  }
  lathePts.push(new THREE.Vector2(0, H)); // tip

  const iceMat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.22,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    sheen: 0.9,
    sheenColor: new THREE.Color(0xffffff),
    sheenRoughness: 0.30,
  });
  const body = new THREE.Mesh(new THREE.LatheGeometry(lathePts, 72), iceMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // ════════════════════════════════════════════
  // 3. SPIRAL GROOVE — thin TubeGeometry that
  //    sits 1% outside the body surface, darker
  //    colour → shows the true spiral on rotation
  // ════════════════════════════════════════════
  const grooveN   = nLoops * 80;
  const groovePts: THREE.Vector3[] = [];
  for (let i = 0; i <= grooveN; i++) {
    const t     = i / grooveN;
    const angle = t * Math.PI * 2 * nLoops;
    // Match body surface radius
    const baseR = THREE.MathUtils.lerp(coneTopR * 0.98, 0, Math.pow(t, 0.82));
    const bump  = Math.cos((t * H / pitch) * Math.PI * 2) * bumpAmp * (1 - t * 0.75);
    const r     = Math.max(0, baseR + bump) * 1.012; // tiny offset outside body
    groovePts.push(new THREE.Vector3(Math.cos(angle) * r, t * H, Math.sin(angle) * r));
  }
  // Darker shade of the product colour for depth contrast
  const darkerColor = new THREE.Color(color).multiplyScalar(0.70);
  const grooveMat = new THREE.MeshPhysicalMaterial({
    color: darkerColor,
    roughness: 0.18,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });
  const groove = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(groovePts), grooveN, 0.038 * scale, 8, false),
    grooveMat,
  );
  groove.castShadow = true;
  group.add(groove);

  // ════════════════════════════════════════════
  // 4. DETAILS — collar + tip sphere
  // ════════════════════════════════════════════
  // Collar where cream meets cone
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(coneTopR * 0.92, 0.055 * scale, 12, 48),
    iceMat,
  );
  collar.rotation.x = Math.PI / 2;
  group.add(collar);

  // Tip sphere
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05 * scale, 16, 16), iceMat);
  tip.position.y = H;
  group.add(tip);

  // Centre vertically in the camera frame
  group.position.y = (coneH / 2 - 0.4) * scale;
  return group;
}

/**
 * Create an ice cream geometry (default popsicle)
 */
export function createIceCreamGeometry(color: string, scale = 1): THREE.Group {
  return createPopsicleGeometry(color, scale);
}

/**
 * Create a juice bottle geometry (kept for compatibility)
 */
export function createJuiceBottleGeometry(color: string, scale = 1): THREE.Group {
  return createCupIceCreamGeometry(color, scale);
}

/**
 * Handle window resize for Three.js
 */
export function handleWindowResize(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  canvas?: HTMLCanvasElement
) {
  let width: number;
  let height: number;

  if (canvas) {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  } else {
    width = window.innerWidth;
    height = window.innerHeight;
  }

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

/**
 * Animate gentle rotation on a 3D object
 */
export function animateRotation(object: THREE.Object3D, speed = 0.005) {
  object.rotation.y += speed;
}

/**
 * Animate floating motion
 */
export function animateFloating(object: THREE.Object3D, time: number, amplitude = 0.1, frequency = 1.5) {
  object.position.y = Math.sin(time * frequency) * amplitude;
}

/**
 * Add mouse controls to rotate an object
 */
export function setupMouseControls(
  element: HTMLElement,
  object: THREE.Object3D,
  sensitivityX = 0.008,
  sensitivityY = 0.008
) {
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    element.style.cursor = 'grabbing';
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    object.rotation.y += deltaX * sensitivityX;
    object.rotation.x += deltaY * sensitivityY;
    // Clamp x rotation
    object.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, object.rotation.x));

    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    isDragging = false;
    element.style.cursor = 'grab';
  };

  element.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  // Touch controls
  let touchStartX = 0;
  let touchStartY = 0;

  const onTouchStart = (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  const onTouchMove = (e: TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;

    object.rotation.y += deltaX * sensitivityX;
    object.rotation.x += deltaY * sensitivityY;
    object.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, object.rotation.x));

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  element.addEventListener('touchstart', onTouchStart);
  element.addEventListener('touchmove', onTouchMove);

  // Return cleanup function
  return () => {
    element.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    element.removeEventListener('touchstart', onTouchStart);
    element.removeEventListener('touchmove', onTouchMove);
  };
}

/**
 * Cleanup Three.js resources
 */
export function cleanupScene(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
) {
  scene.traverse((object: THREE.Object3D) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((m: THREE.Material) => m.dispose());
      } else {
        object.material.dispose();
      }
    }
  });

  renderer.dispose();
}
