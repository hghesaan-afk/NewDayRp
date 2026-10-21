/* ============================================================
   ONE DAY RP - محرك العالم المفتوح الكامل والشخصيات (World Engine)
   شخصية إنسان حقيقي، مشي واقعي، سيارات شرطة وسارينة مضيئة
   ============================================================ */

let scene, camera, renderer;
let characterGroup, legLeft, legRight, armLeft, armRight;
let policeCar, sirenRed, sirenBlue;
let moveX = 0, moveZ = 0;
let walkTime = 0;

function start3DScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.015);

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const moon = new THREE.DirectionalLight(0x93c5fd, 0.8);
    moon.position.set(50, 80, 50);
    scene.add(moon);

    buildCityEnvironment();
    buildPoliceCruiser();
    buildPlayerHuman();

    setupMobileControls();
    renderLoop();
}

// بناء شوارع وأرصفة المدينة ومبانيها
function buildCityEnvironment() {
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x090d16 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // شارع أسفلت
    const roadGeo = new THREE.PlaneGeometry(22, 500);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.02;
    scene.add(road);

    // خطوط وسط الشارع
    for (let z = -240; z < 240; z += 14) {
        const lineGeo = new THREE.PlaneGeometry(0.5, 7);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.03, z);
        scene.add(line);
    }

    // أرصفة المشاة
    createSidewalk(-12);
    createSidewalk(12);

    // مباني وناطحات سحاب
    for (let i = 0; i < 35; i++) {
        const h = 20 + Math.random() * 40;
        const bGeo = new THREE.BoxGeometry(14, h, 14);
        const bMat = new THREE.MeshStandardMaterial({ color: (i % 2 === 0) ? 0x1e293b : 0x0f172a });
        const building = new THREE.Mesh(bGeo, bMat);

        let side = (i % 2 === 0) ? 1 : -1;
        building.position.set(side * (26 + Math.random() * 30), h / 2, (Math.random() - 0.5) * 350);
        scene.add(building);
    }
}

function createSidewalk(xPos) {
    const swGeo = new THREE.BoxGeometry(3.5, 0.35, 500);
    const swMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46 });
    const sw = new THREE.Mesh(swGeo, swMat);
    sw.position.set(xPos, 0.17, 0);
    scene.add(sw);
}

// بناء سيارة الشرطة مع السارينة المضيئة
function buildPoliceCruiser() {
    policeCar = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(2.3, 0.9, 4.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    policeCar.add(body);

    const cabinGeo = new THREE.BoxGeometry(1.9, 0.75, 2.4);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.4, -0.2);
    policeCar.add(cabin);

    // سارينة الشرطة
    sirenRed = new THREE.PointLight(0xef4444, 2, 12);
    sirenRed.position.set(-0.5, 2.0, -0.2);
    policeCar.add(sirenRed);

    sirenBlue = new THREE.PointLight(0x3b82f6, 2, 12);
    sirenBlue.position.set(0.5, 2.0, -0.2);
    policeCar.add(sirenBlue);

    policeCar.position.set(5.5, 0, 8);
    scene.add(policeCar);
}

// بناء شخصية الإنسان ثلاثية الأبعاد
function buildPlayerHuman() {
    characterGroup = new THREE.Group();

    // الجذع (البدلة)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.85, 0.4);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.35;
    characterGroup.add(torso);

    // الرأس
    const headGeo = new THREE.BoxGeometry(0.38, 0.42, 0.38);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.0;
    characterGroup.add(head);

    // الأذرع
    const armGeo = new THREE.BoxGeometry(0.18, 0.75, 0.2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });

    armLeft = new THREE.Mesh(armGeo, armMat);
    armLeft.position.set(-0.46, 1.35, 0);
    characterGroup.add(armLeft);

    armRight = new THREE.Mesh(armGeo, armMat);
    armRight.position.set(0.46, 1.35, 0);
    characterGroup.add(armRight);

    // الأرجل
    const legGeo = new THREE.BoxGeometry(0.24, 0.9, 0.26);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

    legLeft = new THREE.Mesh(legGeo, legMat);
    legLeft.position.set(-0.18, 0.45, 0);
    characterGroup.add(legLeft);

    legRight = new THREE.Mesh(legGeo, legMat);
    legRight.position.set(0.18, 0.45, 0);
    characterGroup.add(legRight);

    characterGroup.position.set(0, 0, 0);
    scene.add(characterGroup);

    window.gamePlayer = characterGroup;
}

// حلقة التحريك والرسم المستمرة
function renderLoop() {
    requestAnimationFrame(renderLoop);

    if (characterGroup) {
        // حركة اللاعب
        characterGroup.position.x += moveX * 0.16;
        characterGroup.position.z += moveZ * 0.16;

        if (moveX !== 0 || moveZ !== 0) {
            characterGroup.rotation.y = Math.atan2(moveX, moveZ);
            
            // محاكاة حركة الأرجل والأذرع أثناء المشي
            walkTime += 0.2;
            legLeft.rotation.x = Math.sin(walkTime) * 0.6;
            legRight.rotation.x = -Math.sin(walkTime) * 0.6;
            armLeft.rotation.x = -Math.sin(walkTime) * 0.5;
            armRight.rotation.x = Math.sin(walkTime) * 0.5;
        } else {
            legLeft.rotation.x = 0;
            legRight.rotation.x = 0;
            armLeft.rotation.x = 0;
            armRight.rotation.x = 0;
        }

        // الكاميرا تتبع اللاعب من الخلف في وضع Landscape
        camera.position.x = characterGroup.position.x;
        camera.position.y = characterGroup.position.y + 3.8;
        camera.position.z = characterGroup.position.z + 6.8;
        camera.lookAt(characterGroup.position.x, characterGroup.position.y + 1.2, characterGroup.position.z);
    }

    // وميض سارينة الشرطة
    if (sirenRed && sirenBlue) {
        const time = Date.now() * 0.006;
        sirenRed.intensity = Math.sin(time) > 0 ? 3 : 0.2;
        sirenBlue.intensity = Math.sin(time) <= 0 ? 3 : 0.2;
    }

    renderer.render(scene, camera);
}

// عصا التحكم باللمس
function setupMobileControls() {
    const zone = document.getElementById('joystick-zone');
    const handle = document.getElementById('joystick-handle');
    let touching = false;

    zone.addEventListener('touchstart', (e) => { touching = true; updateJoy(e); }, { passive: false });
    window.addEventListener('touchmove', (e) => { if (touching) updateJoy(e); }, { passive: false });
    window.addEventListener('touchend', () => {
        touching = false;
        handle.style.top = '32px';
        handle.style.left = '32px';
        moveX = 0; moveZ = 0;
    });

    function updateJoy(e) {
        const touch = e.touches[0];
        const rect = zone.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = touch.clientX - cx;
        let dy = touch.clientY - cy;
        const dist = Math.min(40, Math.hypot(dx, dy));
        const ang = Math.atan2(dy, dx);

        handle.style.left = `${32 + Math.cos(ang) * dist}px`;
        handle.style.top = `${32 + Math.sin(ang) * dist}px`;

        moveX = (Math.cos(ang) * dist) / 40;
        moveZ = (Math.sin(ang) * dist) / 40;
    }
}

window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
