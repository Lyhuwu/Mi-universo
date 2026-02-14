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

// --- 1. LÓGICA DE INTERFAZ Y PRE-CARGA ---
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('intro-overlay');

// Deshabilitamos el botón al inicio para cargar assets
if (startBtn) {
    startBtn.disabled = true;
    startBtn.innerText = "Cargando recuerdos... (0%)";
    startBtn.style.opacity = "0.5";
    startBtn.style.cursor = "wait";
}

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

// --- SISTEMA DE PRECARGA DE IMÁGENES ---
const imagesToLoad = [];
// Extraemos todas las rutas de imágenes y gifs
sofPoints.forEach(p => {
    if (p.img) imagesToLoad.push(p.img);
    if (p.secondary) imagesToLoad.push(p.secondary);
});

let loadedCount = 0;
const totalImages = imagesToLoad.length;

function checkLoadStatus() {
    loadedCount++;
    if (startBtn) {
        // Actualizar porcentaje
        const percent = Math.floor((loadedCount / totalImages) * 100);
        startBtn.innerText = `Cargando recuerdos... (${percent}%)`;
        
        if (loadedCount >= totalImages) {
            // ¡TODO LISTO!
            startBtn.innerText = "¿Quieres observar como se ve para mi?";
            startBtn.disabled = false;
            startBtn.style.opacity = "1";
            startBtn.style.cursor = "pointer";
            
            // Añadir el evento de clic ahora que está listo
            startBtn.addEventListener('click', () => {
                overlay.classList.add('rolling-up');
                setTimeout(() => {
                     overlay.classList.add('fade-out');
                     gameStarted = true;
                     controls.autoRotate = true; 
                }, 1200);
            });
        }
    }
}

// Iniciar la descarga oculta
if (totalImages === 0) {
    // Si no hay imágenes, habilitar botón directo
    checkLoadStatus();
} else {
    imagesToLoad.forEach(src => {
        const img = new Image();
        img.onload = checkLoadStatus;
        img.onerror = checkLoadStatus; // Si falla una, seguimos igual para no trabar
        img.src = src;
    });
}

// --- 2. ESCENA 3D ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

camera.position.z = 140; 

const ambientLight = new THREE.AmbientLight(0x404040, 2); scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 3); sunLight.position.set(50, 30, 50); scene.add(sunLight);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1; bloomPass.strength = 1.8; composer.addPass(bloomPass);

const starCoords = [];
for(let i=0; i<5000; i++) { starCoords.push(THREE.MathUtils.randFloatSpread(400), THREE.MathUtils.randFloatSpread(400), THREE.MathUtils.randFloatSpread(400)); }
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xa0c4ff, size: 0.09 })));

const ambientPlanets = []; 
function createPlanet(size, x, y, z, color, isIcy=true) {
    const geo = new THREE.SphereGeometry(size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: color, roughness: isIcy ? 0.2 : 0.7, metalness: isIcy ? 0.8 : 0.1 });
    const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x, y, z); scene.add(mesh); ambientPlanets.push(mesh);
}
// Planetas
createPlanet(6, 40, 25, -30, 0x4682b4, false);
createPlanet(4, -50, -20, -10, 0xa0e0ff);
createPlanet(8, -70, 50, -60, 0x4682b4, false);
createPlanet(5, 80, 20, -40, 0xa0e0ff);
createPlanet(2.5, 0, 70, -50, 0xa0e0ff);


const visualObjects = [], hitObjects = [];
const starBaseMaterial = new THREE.MeshBasicMaterial({ color: 0xe0ffff });
const hitMaterial = new THREE.MeshBasicMaterial({ visible: false }); 

for (let i = 0; i < sofPoints.length; i++) {
    const p = sofPoints[i];
    if (p.text !== "") {
        const vMesh = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 24), starBaseMaterial.clone());
        vMesh.position.set(...p.pos); scene.add(vMesh); visualObjects.push(vMesh);
        const hMesh = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), hitMaterial);
        hMesh.position.set(...p.pos); hMesh.userData = p; scene.add(hMesh); hitObjects.push(hMesh);
    }
    const saltos = [4, 9, 13]; 
    if (i < sofPoints.length - 1 && !saltos.includes(i)) {
        const lGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p.pos), new THREE.Vector3(...sofPoints[i+1].pos)]);
        scene.add(new THREE.Line(lGeo, new THREE.LineBasicMaterial({ color: 0x87cefa, transparent: true, opacity: 0.3 })));
    }
}

// CONTROLES
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.enablePan = false; controls.autoRotate = false; controls.autoRotateSpeed = 0.8;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (e) => { 
    if (!gameStarted) return; controls.autoRotate = false; if (autoRotateTimer) clearTimeout(autoRotateTimer);
    isDragging = false; startX = e.clientX; startY = e.clientY;
});
window.addEventListener('pointermove', (e) => { if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) isDragging = true; });

window.addEventListener('pointerup', (e) => {
    if (!gameStarted || isDragging) return;
    autoRotateTimer = setTimeout(() => { controls.autoRotate = true; }, 3000);

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hitObjects);

    if (intersects.length > 0) {
        const d = intersects[0].object.userData;
        document.getElementById('memory-text').innerText = d.text;
        const iEl = document.getElementById('memory-img');
        const sEl = document.getElementById('memory-secondary');
        const lEl = document.getElementById('memory-link');

        if(d.img) { iEl.src = d.img; iEl.classList.remove('hidden'); } else { iEl.classList.add('hidden'); }
        if(d.secondary) { sEl.src = d.secondary; sEl.classList.remove('hidden'); } else { sEl.classList.add('hidden'); }
        if(d.link) { lEl.href = d.link; lEl.classList.remove('hidden'); } else { lEl.classList.add('hidden'); }
        
        document.getElementById('memory-modal').classList.remove('hidden');
    }
});

document.getElementById('close-modal').onclick = () => document.getElementById('memory-modal').classList.add('hidden');

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // Sin animación de entrada automática, posición fija inicial
    ambientPlanets.forEach((p, i) => { p.rotation.y += 0.002 * (i % 2 === 0 ? 1 : -1); });
    visualObjects.forEach((v, i) => { v.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1); v.material.color.setHSL(0.55 + Math.sin(time * 0.5 + i) * 0.05, 0.7, 0.8); });
    controls.update(); composer.render();
}
animate();
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
