import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Variables
let scene, camera, renderer, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let clickableObjects = [];
let autoRotate = false;

// Object information data
const objectInfo = {
    'headphone': {
        title: '🎧 Headphones',
        description: 'My favorite wireless headphones for music and calls. Noise-cancelling feature helps me focus.',
        image: 'images/headphone.jpg'
    },
    'book': {
        title: '📚 Book',
        description: '"Atomic Habits" by James Clear. Learning about building good habits and breaking bad ones.',
        image: 'images/book.jpg'
    },
    'letter': {
        title: '💌 Letter',
        description: 'A special handwritten letter from a dear friend. Kept as a precious memory.',
        image: 'images/letter.jpg'
    },
    'camera': {
        title: '📷 Camera',
        description: 'Vintage film camera. Love capturing moments with this classic piece.',
        image: 'images/camera.jpg'
    }
};

// Object positions in the room (adjust based on your room layout)
const objectPositions = {
    'headphone': new THREE.Vector3(1.5, 0.8, 0.5),
    'book': new THREE.Vector3(-1.2, 0.7, 1.8),
    'letter': new THREE.Vector3(0.8, 0.9, -1.5),
    'camera': new THREE.Vector3(-1.8, 1.0, -0.5)
};

// Initialize
init();

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(3, 2, 4);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Add controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Add lighting
    addLighting();
    
    // Load room model
    loadRoom();
    
    // Add clickable objects
    createClickableObjects();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
    
    // Hide loading
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);
    
    // Start animation
    animate();
}

function addLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 5, -15);
    scene.add(rimLight);
}

async function loadRoom() {
    const loader = new GLTFLoader();
    
    try {
        // Try loading GLB first
        const gltf = await loader.loadAsync('pink_bedroom_miside.glb');
        setupModel(gltf.scene);
    } catch (error) {
        console.log('GLB failed, trying GLTF...', error);
        try {
            // Fallback to GLTF
            const gltf = await loader.loadAsync('scene.gltf');
            setupModel(gltf.scene);
        } catch (error2) {
            console.error('Both GLB and GLTF loading failed:', error2);
            createFallbackRoom();
        }
    }
}

function setupModel(model) {
    // Scale and position the room
    model.scale.set(0.5, 0.5, 0.5);
    model.position.set(0, -0.5, 0);
    
    // Enable shadows for all children
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Improve material appearance
            if (child.material) {
                child.material.roughness = 0.8;
                child.material.metalness = 0.2;
            }
        }
    });
    
    scene.add(model);
    console.log('Room model loaded successfully');
}

function createFallbackRoom() {
    console.log('Creating fallback room');
    
    // Create a simple room as fallback
    const roomGeometry = new THREE.BoxGeometry(8, 4, 8);
    const roomMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffccd5,
        side: THREE.BackSide 
    });
    const room = new THREE.Mesh(roomGeometry, roomMaterial);
    scene.add(room);
    
    // Add floor
    const floorGeometry = new THREE.PlaneGeometry(8, 8);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf8c8dc,
        roughness: 0.8 
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);
}

function createClickableObjects() {
    // Create objects with better visuals
    Object.keys(objectPositions).forEach(objectName => {
        createObject(objectName, objectPositions[objectName]);
    });
}

function createObject(type, position) {
    let geometry, material;
    
    // Different geometries for different objects
    switch(type) {
        case 'headphone':
            geometry = new THREE.TorusGeometry(0.15, 0.05, 8, 16);
            material = new THREE.MeshStandardMaterial({ 
                color: 0x000000,
                metalness: 0.8,
                roughness: 0.2
            });
            break;
        case 'book':
            geometry = new THREE.BoxGeometry(0.25, 0.3, 0.05);
            material = new THREE.MeshStandardMaterial({ 
                color: 0x4a6572,
                metalness: 0.3,
                roughness: 0.7
            });
            break;
        case 'letter':
            geometry = new THREE.PlaneGeometry(0.2, 0.15);
            material = new THREE.MeshStandardMaterial({ 
                color: 0xf5f5dc,
                side: THREE.DoubleSide,
                roughness: 0.9
            });
            break;
        case 'camera':
            geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.15, 16);
            material = new THREE.MeshStandardMaterial({ 
                color: 0x333333,
                metalness: 0.9,
                roughness: 0.1
            });
            break;
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.name = type;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add hover effect
    mesh.userData.originalScale = 1;
    mesh.userData.hovering = false;
    
    // Add glow effect
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x667eea,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide
    });
    
    const glowGeometry = geometry.clone();
    glowGeometry.scale(1.2, 1.2, 1.2);
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    mesh.add(glowMesh);
    mesh.userData.glowMesh = glowMesh;
    
    // Add floating animation
    mesh.userData.floatSpeed = 0.5 + Math.random() * 0.5;
    mesh.userData.floatHeight = 0.05;
    mesh.userData.originalY = position.y;
    
    scene.add(mesh);
    clickableObjects.push(mesh);
    
    // Create label
    createLabel(mesh, type);
}

function createLabel(mesh, text) {
    // Create sprite with text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Background
    context.fillStyle = 'rgba(102, 126, 234, 0.9)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    context.font = 'bold 24px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text.charAt(0).toUpperCase() + text.slice(1), 
                     canvas.width/2, canvas.height/2);
    
    // Click hint
    context.font = '14px Arial';
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.fillText('Click me!', canvas.width/2, canvas.height/2 + 30);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true 
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.8, 0.4, 1);
    sprite.position.y = 0.4;
    mesh.add(sprite);
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        showObjectInfo(clickedObject.name);
        
        // Animation
        clickedObject.scale.set(1.3, 1.3, 1.3);
        clickedObject.userData.glowMesh.material.opacity = 0.5;
        
        setTimeout(() => {
            clickedObject.scale.set(1, 1, 1);
            clickedObject.userData.glowMesh.material.opacity = 0;
        }, 300);
    } else {
        // Hide info panel if clicking elsewhere
        document.getElementById('info').style.display = 'none';
    }
}

function showObjectInfo(objectName) {
    const info = document.getElementById('info');
    const infoImage = document.getElementById('info-image');
    const infoTitle = document.getElementById('info-title');
    const infoText = document.getElementById('info-text');
    
    const object = objectInfo[objectName];
    
    if (object) {
        infoImage.src = object.image;
        infoTitle.textContent = object.title;
        infoText.textContent = object.description;
        info.style.display = 'block';
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Auto rotate if enabled
    if (autoRotate) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1;
    } else {
        controls.autoRotate = false;
    }
    
    // Update floating animation for objects
    clickableObjects.forEach(obj => {
        if (obj.userData.floatSpeed) {
            obj.position.y = obj.userData.originalY + 
                Math.sin(Date.now() * 0.001 * obj.userData.floatSpeed) * obj.userData.floatHeight;
        }
        
        // Hover effect
        if (obj.userData.hovering) {
            obj.rotation.y += 0.02;
        }
    });
    
    controls.update();
    renderer.render(scene, camera);
}

// Control functions (called from HTML buttons)
function resetView() {
    controls.reset();
    camera.position.set(3, 2, 4);
    controls.update();
}

function toggleAutoRotate() {
    autoRotate = !autoRotate;
    const button = document.querySelector('.controls button:nth-child(2)');
    button.textContent = autoRotate ? 'Stop Rotate' : 'Auto Rotate';
}

// Mouse hover effects
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);
    
    // Reset all objects
    clickableObjects.forEach(obj => {
        obj.userData.hovering = false;
        obj.userData.glowMesh.material.opacity = 0;
    });
    
    // Highlight hovered object
    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        hoveredObject.userData.hovering = true;
        hoveredObject.userData.glowMesh.material.opacity = 0.3;
        
        // Change cursor
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
});
