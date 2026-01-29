// 3D Scene Setup
// Optimized for performance with mobile detection

(function() {
    'use strict';

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        return;
    }

    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    // Performance settings based on device
    const settings = {
        particles: isMobile ? 300 : 700,
        gridBars: isMobile ? 20 : 40,
        quality: isMobile ? 'low' : 'high',
        antialias: !isMobile
    };

    // Scene setup
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.05);

    // Camera
    const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
        antialias: settings.antialias, 
        alpha: true,
        powerPreference: 'high-performance'
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xd4af37, 1.5, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const blueLight = new THREE.PointLight(0x1387c1, 0.8, 50);
    blueLight.position.set(-5, -5, 2);
    scene.add(blueLight);

    // Grid bars (background)
    const gridGroup = new THREE.Group();
    const gridGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
    const gridMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333, 
        roughness: 0.2, 
        metalness: 0.8 
    });

    for (let i = 0; i < settings.gridBars; i++) {
        const bar = new THREE.Mesh(gridGeometry, gridMaterial);
        bar.position.x = (Math.random() - 0.5) * 15;
        bar.position.z = (Math.random() - 0.5) * 15;
        bar.position.y = -2;
        bar.scale.y = Math.random() * 3 + 0.5;
        gridGroup.add(bar);
    }
    scene.add(gridGroup);

    // Floating tech icons
    const iconsGroup = new THREE.Group();
    const iconMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd4af37, 
        emissive: 0xaa8800,
        emissiveIntensity: 0.2,
        metalness: 1, 
        roughness: 0.3 
    });

    const htmlIcon = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), iconMaterial);
    htmlIcon.position.set(-3, 1, 0);
    
    const jsIcon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5), iconMaterial);
    jsIcon.position.set(0, 2, -2);
    
    const sqlIcon = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.1, 8, 20), iconMaterial);
    sqlIcon.position.set(3, 0.5, -1);

    iconsGroup.add(htmlIcon, jsIcon, sqlIcon);
    scene.add(iconsGroup);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(settings.particles * 3);

    for(let i = 0; i < settings.particles * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 30;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: isMobile ? 0.03 : 0.05,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Initial camera position
    camera.position.z = 5;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    // Only add mouse movement on desktop
    if (!isMobile) {
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX);
            mouseY = (event.clientY - windowHalfY);
        });
    }

    // Animation clock
    const clock = new THREE.Clock();

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Rotate icons
        htmlIcon.rotation.x += 0.01;
        htmlIcon.rotation.y += 0.01;
        jsIcon.rotation.y -= 0.01;
        sqlIcon.rotation.x -= 0.005;
        sqlIcon.rotation.y -= 0.005;

        // Float icons
        htmlIcon.position.y = 1 + Math.sin(elapsedTime) * 0.3;
        jsIcon.position.y = 2 + Math.sin(elapsedTime + 2) * 0.3;
        sqlIcon.position.y = 0.5 + Math.sin(elapsedTime + 4) * 0.3;

        // Rotate groups
        gridGroup.rotation.y += 0.001;
        iconsGroup.rotation.y += 0.002;

        // Mouse parallax (desktop only)
        if (!isMobile) {
            particlesMesh.rotation.y = -mouseX * 0.0001;
            camera.position.x += (mouseX * 0.005 - camera.position.x) * 0.05;
            camera.position.y += (-mouseY * 0.005 - camera.position.y) * 0.05;
        }

        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // Debounce resize for performance
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 250);
    });

    // Expose for navigation.js
    window.threeScene = {
        camera,
        gridGroup,
        scene
    };

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        renderer.dispose();
        gridGeometry.dispose();
        gridMaterial.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        iconMaterial.dispose();
    });

})();
