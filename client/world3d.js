/* ============================================================
   ONE DAY RP - محرك العالم ثلاثي الأبعاد وحركة اللمس (3D World)
   مدينة مفتوحة، سيارات، عصا تحكم باللمس، وكاميرا ذكية
   ============================================================ */

let scene, camera, renderer;
let gamePlayer, carMesh;
let moveX = 0, moveZ = 0;
let isDriving = false;

// دالة تشغيل العالم 3D عند الضغط على "دخول السيرفر"
function start3DScene() {
    // 1. إنشاء المشهد والإضاءة والضباب
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.025);

    // الكاميرا
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // الإضاءة (إضاءة ليلية سينمائية مع أنوار الشوارع)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff4b2b, 0.9);
    dirLight.position.set(30, 50, 30);
    scene.add(dirLight);

    // 2. أرضية المدينة وشوارع الأسفلت
    const roadGeo = new THREE.PlaneGeometry(400, 400);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const ground = new THREE.Mesh(roadGeo, roadMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // 3. بناء مباني ناطحات السحاب حول المدينة
    for (let i = 0; i < 45; i++) {
        const height = 15 + Math.random() * 35;
        const bGeo = new THREE.BoxGeometry(10, height, 10);
        const bMat = new THREE.MeshStandardMaterial({ 
            color: (i % 2 === 0) ? 0x1e293b : 0x0f172a,
            roughness: 0.5 
        });
        const building = new THREE.Mesh(bGeo, bMat);
        
        let x = (Math.random() - 0.5) * 220;
        let z = (Math.random() - 0.5) * 220;

        // ترك مسار آمن وشارع فارغ في الوسط للاعب
        if (Math.abs(x) > 16 || Math.abs(z) > 16) {
            building.position.set(x, height / 2, z);
            scene.add(building);
        }
    }

    // 4. مجسم سيارة شرطة ودورية في الشارع
    const carGeo = new THREE.BoxGeometry(2.2, 1.2, 4.5);
    const carMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    carMesh = new THREE.Mesh(carGeo, carMat);
    carMesh.position.set(6, 0.6, 6);
    scene.add(carMesh);

    // 5. شخصية اللاعب (3D Player Mesh)
    const pGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16);
    const pMat = new THREE.MeshStandardMaterial({ color: 0xff4b2b, roughness: 0.3 });
    gamePlayer = new THREE.Mesh(pGeo, pMat);
    gamePlayer.position.set(0, 0.9, 0);
    scene.add(gamePlayer);

    // حفظ اللاعب كمتغير عام للقفز والتفاعل
    window.gamePlayer = gamePlayer;

    // تفعيل عصا التحكم باللمس
    setupMobileTouch();

    // بدء حلقة الرسوميات (Animation Loop)
    animate3D();
}

// حلقة التحريك والرسم المستمرة
function animate3D() {
    requestAnimationFrame(animate3D);

    if (gamePlayer) {
        // حركة اللاعب بحسب توجيه عصا اللمس
        gamePlayer.position.x += moveX * 0.18;
        gamePlayer.position.z += moveZ * 0.18;

        // توجيه وجه اللاعب باتجاه الحركة
        if (moveX !== 0 || moveZ !== 0) {
            gamePlayer.rotation.y = Math.atan2(moveX, moveZ);
        }

        // كاميرا منظور الشخص الثالث الذكية (Third-Person Camera)
        camera.position.x = gamePlayer.position.x;
        camera.position.y = gamePlayer.position.y + 4.2;
        camera.position.z = gamePlayer.position.z + 7.5;
        camera.lookAt(gamePlayer.position.x, gamePlayer.position.y + 1.2, gamePlayer.position.z);
    }

    renderer.render(scene, camera);
}

// نظام عصا التحكم باللمس على الجوال (Virtual Joystick)
function setupMobileTouch() {
    const zone = document.getElementById('joystick-zone');
    const handle = document.getElementById('joystick-handle');
    let isTouching = false;

    zone.addEventListener('touchstart', (e) => {
        isTouching = true;
        handleJoystick(e);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (isTouching) handleJoystick(e);
    }, { passive: false });

    window.addEventListener('touchend', () => {
        isTouching = false;
        handle.style.top = '32px';
        handle.style.left = '32px';
        moveX = 0;
        moveZ = 0;
    });

    function handleJoystick(e) {
        const touch = e.touches[0];
        const rect = zone.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let deltaX = touch.clientX - centerX;
        let deltaY = touch.clientY - centerY;
        const maxDist = 42;
        const distance = Math.min(maxDist, Math.hypot(deltaX, deltaY));
        const angle = Math.atan2(deltaY, deltaX);

        handle.style.left = `${32 + Math.cos(angle) * distance}px`;
        handle.style.top = `${32 + Math.sin(angle) * distance}px`;

        // إحداثيات الحركة
        moveX = (Math.cos(angle) * distance) / maxDist;
        moveZ = (Math.sin(angle) * distance) / maxDist;
    }
}

// التجاوب التلقائي مع شاشات الهواتف عند التدوير
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
