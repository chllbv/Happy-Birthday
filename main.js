import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Variables
let scene, camera, renderer, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let clickableObjects = [];

// Initialize
init();

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Add controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Load 3D room
    loadRoom();
    
    // Add clickable objects
    addClickableObjects();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
    
    // Start animation
    animate();
}

async function loadRoom() {
    const loader = new GLTFLoader();
    
    try {
        // Load your GLB/GLTF file
        const gltf = await loader.loadAsync('models/your-room.glb');
        scene.add(gltf.scene);
        
        // Center the room
        gltf.scene.position.set(0, 0, 0);
        
        console.log('Room loaded successfully');
    } catch (error) {
        console.error('Error loading room:', error);
    }
}

function addClickableObjects() {
    // Define positions for your objects
    const positions = [
        { x: 2, y: 1, z: 1.5 },    // Headphone
        { x: -1, y: 0.8, z: 2 },   // Book
        { x: 0, y: 1, z: -2 },     // Letter
        { x: -2, y: 1.2, z: -1 }   // Camera
    ];
    
    const objectTypes = ['headphone', 'book', 'letter', 'camera'];
    
    objectTypes.forEach((type, index) => {
        // Create a placeholder box (palitan mo to ng actual models)
        const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.5
        });
        
        const object = new THREE.Mesh(geometry, material);
        object.position.set(positions[index].x, positions[index].y, positions[index].z);
        object.name = type;
        
        // Add label
        addLabel(object, type);
        
        scene.add(object);
        clickableObjects.push(object);
    });
}

function addLabel(mesh, text) {
    // Create canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Draw text
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 40px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText(text.toUpperCase(), canvas.width/2, canvas.height/2 + 15);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 0.5, 1);
    sprite.position.y = 0.5;
    
    mesh.add(sprite);
}

function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(clickableObjects);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        showObjectInfo(clickedObject.name);
        
        // Animation effect
        clickedObject.scale.set(1.2, 1.2, 1.2);
        setTimeout(() => {
            clickedObject.scale.set(1, 1, 1);
        }, 200);
    }
}

function showObjectInfo(objectName) {
    const info = document.getElementById('info');
    
    const infoText = {
        'headphone': '🎵 My favorite headphones for music production',
        'book': '📚 Currently reading: Atomic Habits',
        'letter': '💌 Personal letters from friends',
        'camera': '📷 My vintage film camera collection'
    };
    
    info.innerHTML = `<h3>${objectName.toUpperCase()}</h3>
                      <p>${infoText[objectName]}</p>`;
    info.style.display = 'block';
    
    setTimeout(() => {
        info.style.display = 'none';
    }, 3000);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
