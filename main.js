import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- VARIABLES DE CONTROL ---
let gameStarted = false;
let autoRotateTimer = null; 
let isDragging = false;
let startX = 0;
let startY = 0;

// --- SISTEMA DE AUDIO (MÚSICA + EFECTOS) ---
// 1. Música de fondo (Asegúrate de subir 'cancion.mp3' a la carpeta sonidos)
const audioBg = new Audio('sonidos/cancion.mp3');
audioBg.loop = true; // Para que se repita infinitamente
audioBg.volume = 0.5; // Volumen al 50% (agradable)

// 2. Efecto de sonido al tocar estrellas
const audioSparkle = new Audio('sonidos/sparkle.mp3');

function playSparkle() {
    // Clonamos para poder reproducir varios sonidos seguidos sin cortarse
    const sound = audioSparkle.cloneNode();
    sound.volume = 0.6;
    sound.play().catch(() => {}); // Ignorar errores si el navegador se pone difícil
}

// --- 1. LÓGICA DE INTERFAZ ---
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('intro-overlay');

if (startBtn && overlay) {
    startBtn.addEventListener('click', () => {
        // AQUÍ INICIA LA MÚSICA (Al interactuar con el botón)
        audioBg.play().catch(e => console.log("Error al reproducir música:", e));

        overlay.classList.add('rolling-up');
        setTimeout(() => {
             overlay.classList.add('fade-out');
             gameStarted = true;
             // Al entrar, activamos la rotación suave inmediatamente
             controls.autoRotate = true; 
        }, 1200);
    });
}

// --- 2. ESCENA 3D ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 🚀 POSICIÓN PANORÁMICA
camera.position.z = 140; 

// --- ILUMINACIÓN ---
const ambientLight = new THREE.AmbientLight(0x404040, 2); 
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 3);
sunLight.position.set(50, 30, 50);
scene.add(sunLight);

// --- EFECTO BLOOM ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 1.8;
composer.addPass(bloomPass);

// --- FONDO DE ESTRELLAS ---
const starCoords = [];
for(let i=0; i<5000; i++) {
    starCoords.push(THREE.MathUtils.randFloatSpread(400), THREE.MathUtils.randFloatSpread(400), THREE.MathUtils.randFloatSpread(400));
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
const backgroundStars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xa0c4ff, size: 0.09 }));
scene.add(backgroundStars);

// --- MINI UNIVERSOS (PLANETAS) ---
const ambientPlanets = []; 

function createIcyPlanet(size, x, y, z) {
    const geo = new THREE.SphereGeometry(size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0xa0e0ff, roughness: 0.2, metalness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    ambientPlanets.push(mesh);
}

function createRingedPlanet(size, x, y, z) {
    const planetGroup = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(size, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0x4682b4, roughness: 0.7, flatShading: true });
    const planet = new THREE.Mesh(sphereGeo, sphereMat);
    planetGroup.add(planet);
    const ringGeo = new THREE.RingGeometry(size * 1.4, size * 2, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x87cefa, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    planetGroup.add(ring);
    planetGroup.position.set(x, y, z);
    planetGroup.rotation.x = 0.5;
    planetGroup.rotation.z = 0.2;
    scene.add(planetGroup);
    ambientPlanets.push(planetGroup);
}

// Planetas distribuidos
createRingedPlanet(6, 40, 25, -30);
createIcyPlanet(4, -50, -20, -10);
createIcyPlanet(2, -30, 40, 20);
createIcyPlanet(3, 60, -40, 0);
createRingedPlanet(8, -70, 50, -60);
createIcyPlanet(5, 80, 20, -40);
createIcyPlanet(1.5, -20, -60, 40);
createRingedPlanet(4, 50, -50, -20);
createIcyPlanet(2.5, 0, 70, -50);

// --- CONSTELACIÓN SOFI (TUS DATOS) ---
const sofPoints = [
    // S
    { pos: [-16, 6, 0], text: "Nuestra primera vez juntitas❤️", img: "fotos/foto1.jpg", secondary: "" },
    { pos: [-19, 3, 0], text: "Todas las veces que sujetas mi mano<3", img: "fotos/tu_tacto.jpg", secondary: "", link: "" },
    { pos: [-16, 0, 0], text: "Nuestro mesesito conviviendo juntas, día y noche, 24/7", img: "fotos/foto2.jpg", secondary: "" },
    { pos: [-13, -3, 0], text: "Tu carita tan preciosa ayayaya", img: "fotos/foto3.jpg", secondary: "" },
    { pos: [-16, -6, 0], text: "Cocinar juntitas", img: "fotos/foto4.jpg", secondary: "" },
    // O
    { pos: [-8, 4, 0], text: "Mi estrellita preciosa con un don tan precioso", img: "fotos/foto5.jpg", secondary: "" },
    { pos: [-3, 4, 0], text: "Tus cálidos abachitos mi amor", img: "fotos/tus_abachitos.jpg", secondary: "", link: "" },
    { pos: [-3, -4, 0], text: "Jugar nuestros juegos preferidos", img: "fotos/foto6.jpg", secondary: "" },
    { pos: [-8, -4, 0], text: "Compartir algo para sentir que estas conmigo", img: "fotos/foto7.jpg", secondary: "" },
    { pos: [-8, 4, 0], text: "" },
    // F
    { pos: [2, 6, 0], text: "Estar contigo, de las cosas que mas amo en la vida", img: "fotos/foto8.jpg", secondary: "" },
    { pos: [2, -6, 0], text: "Pasar tiempo y compartir mis días favoritos contigo", img: "fotos/foto9.jpg", secondary: "" },
    { pos: [2, 0, 0], text: "Canciones que me recuerdan a ti", img: "", secondary: "fotos/cancioness.gif", link: "" },
    { pos: [7, 0, 0], text: "Verte ser tu misma", img: "fotos/foto10.jpg", secondary: "" },
    // I
    { pos: [12, 4, 0], text: "La felicidad de ser nosotras mismas sin miedo", img: "fotos/foto11.jpg", secondary: "" },
    { pos: [12, -6, 0], text: "Cualquier cosa me recuerda a ti", img: "fotos/foto12.jpg", secondary: "" },
    { pos: [12, 7, 0], text: "Tu existencia alegra mi corazón y mi alma", img: "fotos/sentirme_amada.jpg", secondary: "" }
];

const visualObjects = []; 
const hitObjects = [];

const lineMat = new THREE.LineBasicMaterial({ color: 0x87cefa, transparent: true, opacity: 0.3 });
const starBaseMaterial = new THREE.MeshBasicMaterial({ color: 0xe0ffff });
const hitMaterial = new THREE.MeshBasicMaterial({ visible: false }); 

for (let i = 0; i < sofPoints.length; i++) {
    const p = sofPoints[i];
    if (p.text !== "") {
        // Visual
        const visualMesh = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 24), starBaseMaterial.clone());
        visualMesh.position.set(...p.pos);
        scene.add(visualMesh);
        visualObjects.push(visualMesh);
        
        // Hitbox (Grande)
        const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), hitMaterial);
        hitMesh.position.set(...p.pos);
        hitMesh.userData = { text: p.text, img: p.img, secondary: p.secondary, link: p.link }; 
        scene.add(hitMesh);
        hitObjects.push(hitMesh);
    }
    const saltos = [4, 9, 13]; 
    if (i < sofPoints.length - 1 && !saltos.includes(i)) {
        const lGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p.pos), new THREE.Vector3(...sofPoints[i+1].pos)]);
        scene.add(new THREE.Line(lGeo, lineMat));
    }
}

// --- CONTROLES ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false; 
controls.enableZoom = true;
controls.minDistance = 20; 
controls.maxDistance = 180; 
controls.autoRotate = false; // Se activa al entrar
controls.autoRotateSpeed = 0.8; 

// --- INTERACCIÓN ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (e) => {
    if (!gameStarted) return;
    
    // Frenar al tocar
    controls.autoRotate = false;
    if (autoRotateTimer) clearTimeout(autoRotateTimer);
    
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
    if (!gameStarted) return;
    if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
        isDragging = true;
    }
});

window.addEventListener('pointerup', (e) => {
    if (!gameStarted) return;
    
    // Reactivar giro automático tras 3 segundos
    if (autoRotateTimer) clearTimeout(autoRotateTimer);
    autoRotateTimer = setTimeout(() => {
        controls.autoRotate = true; 
    }, 3000);

    if (isDragging) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hitObjects);

    if (intersects.length > 0) {
        // SONIDO MÁGICO AL CLIC
        playSparkle();

        const data = intersects[0].object.userData;
        document.getElementById('memory-text').innerText = data.text;
        const imgEl = document.getElementById('memory-img');
        const secondaryEl = document.getElementById('memory-secondary');
        const linkEl = document.getElementById('memory-link');
        
        if(data.img) { imgEl.src = data.img; imgEl.classList.remove('hidden'); } else { imgEl.classList.add('hidden'); }
        if(data.secondary) { secondaryEl.src = data.secondary; secondaryEl.classList.remove('hidden'); } else { secondaryEl.classList.add('hidden'); }
        if(data.link) { linkEl.href = data.link; linkEl.classList.remove('hidden'); } else { linkEl.classList.add('hidden'); }
        
        document.getElementById('memory-modal').classList.remove('hidden');
    }
});

document.getElementById('close-modal').onclick = () => {
    document.getElementById('memory-modal').classList.add('hidden');
};

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    backgroundStars.rotation.y += 0.0001;
    ambientPlanets.forEach((planet, i) => {
        planet.rotation.y += 0.002 * (i % 2 === 0 ? 1 : -1);
    });

    visualObjects.forEach((obj, i) => {
        obj.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1);
        const hue = 0.55 + Math.sin(time * 0.5 + i) * 0.05; 
        obj.material.color.setHSL(hue, 0.7, 0.8);
    });

    controls.update();
    composer.render();
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
