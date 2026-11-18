/**
 * ============================================================================
 * THREE.JS INTERACTIVE 3D BACKGROUND & HOLOGRAPHIC SCENE
 * ============================================================================
 * Features:
 * - Ambient Cosmic Starfield / Particle Constellation with depth & color shifts
 * - Interactive Wireframe Centerpiece with dual-nested geometric frames
 * - Mouse-driven parallax and raycaster velocity response
 * - Dynamic scroll camera tracking across sections
 * - Performance-optimized render loop with page visibility detection
 */

(function () {
  'use strict';

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // Verify WebGL availability
  let isWebGLAvailable = false;
  try {
    const testCanvas = document.createElement('canvas');
    isWebGLAvailable = !!(
      window.WebGLRenderingContext &&
      (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    isWebGLAvailable = false;
  }

  if (!isWebGLAvailable || typeof THREE === 'undefined') {
    console.warn('WebGL or Three.js not supported. Falling back to ambient CSS gradients.');
    if (canvas) canvas.style.display = 'none';
    return;
  }

  // --- SCENE SETUP ---
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06080e, 0.0018);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.z = 280;
  camera.position.y = 10;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- LIGHTING ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const cyanPointLight = new THREE.PointLight(0x00f0ff, 2.5, 600);
  cyanPointLight.position.set(120, 100, 100);
  scene.add(cyanPointLight);

  const purplePointLight = new THREE.PointLight(0xb026ff, 2.5, 600);
  purplePointLight.position.set(-120, -80, 80);
  scene.add(purplePointLight);

  const emeraldPointLight = new THREE.PointLight(0x00ffaa, 1.8, 500);
  emeraldPointLight.position.set(0, -150, 120);
  scene.add(emeraldPointLight);

  // --- PARTICLE CONSTELLATION ---
  const particleCount = 1400;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  const colorPalette = [
    new THREE.Color(0x00f0ff), // Cyan
    new THREE.Color(0xb026ff), // Violet
    new THREE.Color(0x00ffaa), // Emerald
    new THREE.Color(0xffffff), // White
    new THREE.Color(0x38bdf8), // Sky Blue
  ];

  for (let i = 0; i < particleCount; i++) {
    // Distribute in a spherical cloud
    const radius = 100 + Math.random() * 650;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // Color pick
    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    scales[i] = Math.random() * 3 + 1;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Custom circular point canvas texture for crisp circular particles
  function createPointTexture() {
    const size = 64;
    const pCanvas = document.createElement('canvas');
    pCanvas.width = size;
    pCanvas.height = size;
    const ctx = pCanvas.getContext('2d');

    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(pCanvas);
    texture.needsUpdate = true;
    return texture;
  }

  const particleMaterial = new THREE.PointsMaterial({
    size: 4.5,
    map: createPointTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // --- FLOATING CYBER GEOMETRY HUB (HERO 3D OBJECTS) ---
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  // 1. Inner Glowing Icosahedron
  const icoGeometry = new THREE.IcosahedronGeometry(48, 1);
  const icoWireframe = new THREE.WireframeGeometry(icoGeometry);
  const icoLineMaterial = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.55,
    linewidth: 1.5,
  });
  const icoMesh = new THREE.LineSegments(icoWireframe, icoLineMaterial);
  coreGroup.add(icoMesh);

  // Inner solid core with soft glow
  const innerCoreGeo = new THREE.IcosahedronGeometry(22, 2);
  const innerCoreMat = new THREE.MeshPhongMaterial({
    color: 0x0a1628,
    emissive: 0x003855,
    specular: 0x00f0ff,
    shininess: 90,
    wireframe: true,
  });
  const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
  coreGroup.add(innerCoreMesh);

  // 2. Outer Torus Ring 1 (Rotates along X)
  const torusGeo1 = new THREE.TorusGeometry(72, 0.8, 16, 100);
  const torusMat1 = new THREE.MeshBasicMaterial({
    color: 0xb026ff,
    transparent: true,
    opacity: 0.65,
  });
  const torusRing1 = new THREE.Mesh(torusGeo1, torusMat1);
  torusRing1.rotation.x = Math.PI / 3;
  coreGroup.add(torusRing1);

  // 3. Outer Torus Ring 2 (Rotates along Y/Z)
  const torusGeo2 = new THREE.TorusGeometry(86, 0.8, 16, 100);
  const torusMat2 = new THREE.MeshBasicMaterial({
    color: 0x00ffaa,
    transparent: true,
    opacity: 0.5,
  });
  const torusRing2 = new THREE.Mesh(torusGeo2, torusMat2);
  torusRing2.rotation.y = Math.PI / 4;
  coreGroup.add(torusRing2);

  // 4. Floating Satellites / Nodes orbiting the core
  const satelliteCount = 8;
  const satelliteGroup = new THREE.Group();
  coreGroup.add(satelliteGroup);

  const satelliteMeshes = [];
  for (let i = 0; i < satelliteCount; i++) {
    const sGeo = new THREE.OctahedronGeometry(3 + Math.random() * 2);
    const sMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x00f0ff : 0xb026ff,
      wireframe: true,
    });
    const sMesh = new THREE.Mesh(sGeo, sMat);
    const angle = (i / satelliteCount) * Math.PI * 2;
    const distance = 95 + (i % 3) * 15;
    sMesh.userData = {
      angle: angle,
      speed: 0.008 + Math.random() * 0.006,
      distance: distance,
      tiltY: (Math.random() - 0.5) * 40,
    };
    satelliteGroup.add(sMesh);
    satelliteMeshes.push(sMesh);
  }

  // Position core on right side on desktop for hero balance
  function updateCorePosition() {
    if (window.innerWidth > 1024) {
      coreGroup.position.set(135, 10, -30);
    } else {
      coreGroup.position.set(0, -25, -60);
    }
  }
  updateCorePosition();

  // --- FLOATING BACKGROUND TECH PARTICLES (AMBIENT SHARDS) ---
  const shardCount = 28;
  const shardGroup = new THREE.Group();
  scene.add(shardGroup);

  const shards = [];
  for (let i = 0; i < shardCount; i++) {
    const shardGeo = new THREE.TetrahedronGeometry(4 + Math.random() * 6);
    const shardMat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0x00f0ff : 0x7928ca,
      wireframe: true,
      transparent: true,
      opacity: 0.25 + Math.random() * 0.35,
    });
    const shard = new THREE.Mesh(shardGeo, shardMat);
    shard.position.set(
      (Math.random() - 0.5) * 800,
      (Math.random() - 0.5) * 800,
      (Math.random() - 0.5) * 400
    );
    shard.userData = {
      rotX: (Math.random() - 0.5) * 0.02,
      rotY: (Math.random() - 0.5) * 0.02,
      speedY: (Math.random() - 0.5) * 0.15,
    };
    shardGroup.add(shard);
    shards.push(shard);
  }

  // --- MOUSE & SCROLL TRACKING ---
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let scrollY = 0;
  let targetScrollY = 0;

  window.addEventListener('mousemove', function (e) {
    // Normalized coordinates (-1 to 1)
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('scroll', function () {
    targetScrollY = window.pageYOffset || document.documentElement.scrollTop;
  });

  // Touch Support for mobile devices
  window.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      targetMouseX = (touch.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
  }, { passive: true });

  // Handle Resize
  window.addEventListener('resize', onWindowResize);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateCorePosition();
  }

  // --- ANIMATION LOOP ---
  let isTabVisible = true;
  document.addEventListener('visibilitychange', function () {
    isTabVisible = !document.hidden;
  });

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    if (!isTabVisible) return;

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Smooth lerp mouse & scroll
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    scrollY += (targetScrollY - scrollY) * 0.06;

    // Camera Parallax and Scroll Motion
    camera.position.x = mouseX * 25;
    camera.position.y = 10 + mouseY * 15 - (scrollY * 0.08);
    camera.lookAt(0, -scrollY * 0.08, 0);

    // Rotate Background Particles
    particleSystem.rotation.y = elapsedTime * 0.02 + mouseX * 0.1;
    particleSystem.rotation.x = elapsedTime * 0.01 + mouseY * 0.05;

    // Animate Core Centerpiece
    if (coreGroup) {
      icoMesh.rotation.x = elapsedTime * 0.35 + mouseY * 0.5;
      icoMesh.rotation.y = elapsedTime * 0.45 + mouseX * 0.5;

      innerCoreMesh.rotation.x = -elapsedTime * 0.4;
      innerCoreMesh.rotation.y = -elapsedTime * 0.5;

      torusRing1.rotation.z = elapsedTime * 0.25;
      torusRing1.rotation.y = elapsedTime * 0.3 + mouseX * 0.4;

      torusRing2.rotation.x = elapsedTime * 0.2;
      torusRing2.rotation.z = elapsedTime * 0.35 + mouseY * 0.4;

      // Orbit Satellites
      satelliteMeshes.forEach(function (sat) {
        sat.userData.angle += sat.userData.speed;
        sat.position.x = Math.cos(sat.userData.angle) * sat.userData.distance;
        sat.position.z = Math.sin(sat.userData.angle) * sat.userData.distance;
        sat.position.y = Math.sin(sat.userData.angle * 2) * 15 + sat.userData.tiltY;
        sat.rotation.x += 0.02;
        sat.rotation.y += 0.03;
      });

      // Subtle breathing scale
      const breathe = 1 + Math.sin(elapsedTime * 1.5) * 0.04;
      coreGroup.scale.set(breathe, breathe, breathe);
    }

    // Floating Ambient Shards
    shards.forEach(function (shard) {
      shard.rotation.x += shard.userData.rotX;
      shard.rotation.y += shard.userData.rotY;
      shard.position.y += Math.sin(elapsedTime + shard.position.x) * 0.25;
    });

    // Light motion follows cursor
    cyanPointLight.position.x = 120 + mouseX * 60;
    cyanPointLight.position.y = 100 + mouseY * 60;

    renderer.render(scene, camera);
  }

  animate();
})();
