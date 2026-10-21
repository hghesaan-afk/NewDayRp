/* ============================================================
   ONE DAY RP - محرك أنظمة الرول بلاي الشامل (Systems Engine)
   يشمل: الفصائل الـ 13، الرواتب، السجن، المعارض، والهاتف
   ============================================================ */

// 1. بيانات اللاعب الافتراضية داخل السيرفر المختار
const PlayerData = {
    username: "Ali_Karim",
    server: "Lomina",
    id: 101,
    cash: 1000,
    bank: 5000,
    hp: 100,
    armor: 100,
    faction: "Police", // Citizen, Police, Army, EMS, Gang
    factionRank: 1,    // من 1 إلى 13 للشرطة
    medalPoints: 50,
    isCuffed: false,
    jailTimeMinutes: 0,
    cars: ["Dodge Charger Police"],
    activeJob: "عاطل",
    jobLevel: 1
};

// 2. جدول رواتب ونقاط رتب الشرطة الـ 13 (كل 30 دقيقة)
const POLICE_RANKS = {
    1:  { name: "مستجد (Cadet)", salary: 3500, medals: 50 },
    2:  { name: "ضابط دورية أول (Officer I)", salary: 5000, medals: 120 },
    3:  { name: "ضابط دورية ثانٍ (Officer II)", salary: 6800, medals: 200 },
    4:  { name: "ضابط أول (Senior Officer)", salary: 9000, medals: 300 },
    5:  { name: "عريف (Corporal)", salary: 12000, medals: 450 },
    6:  { name: "رقيب (Sergeant I)", salary: 15500, medals: 600 },
    7:  { name: "رقيب أول (Sergeant II)", salary: 19500, medals: 800 },
    8:  { name: "ملازم (Lieutenant)", salary: 24000, medals: 1050 },
    9:  { name: "نقيب (Captain)", salary: 29000, medals: 1350 },
    10: { name: "رائد (Major)", salary: 35000, medals: 1700 },
    11: { name: "مقدم (Commander)", salary: 42000, medals: 2200 },
    12: { name: "نائب القائد (Deputy Chief)", salary: 55000, medals: 3000 },
    13: { name: "قائد جهاز الشرطة (Police Chief)", salary: 75000, medals: 5000 }
};

// 3. معارض السيارات الثلاثة (OneState 3 Dealerships)
const CAR_DEALERSHIPS = {
    economy: [
        { model: "Sedan Classic", price: 8000, speed: 140 },
        { model: "Compact City", price: 14000, speed: 160 },
        { model: "Family Wagon", price: 22000, speed: 175 }
    ],
    comfort: [
        { model: "Range SUV 4x4", price: 55000, speed: 200 },
        { model: "Executive Luxury", price: 78000, speed: 220 },
        { model: "Sport Truck Raptor", price: 95000, speed: 210 }
    ],
    luxury: [
        { model: "Lamborghini Huracan", price: 320000, speed: 330 },
        { model: "Porsche 911 GT3", price: 280000, speed: 315 },
        { model: "Mercedes G63 AMG", price: 250000, speed: 260 },
        { model: "Bugatti Chiron", price: 1200000, speed: 410 }
    ]
};

// 4. نظام أكواد الهدايا النشطة (Promo Codes)
const PROMO_CODES = {
    "ONEDAY2026": { money: 100000, car: "Porsche 911 GT3", used: false },
    "WELCOME": { money: 25000, car: null, used: false },
    "POLICE_BOOST": { money: 50000, medals: 200, used: false }
};

// --- دوال تسجيل الدخول واختيار السيرفرات ---
function selectServer(element, serverName) {
    document.querySelectorAll('.server-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    PlayerData.server = serverName;
}

function enterGameWorld() {
    const userInput = document.getElementById('player-username').value;
    if(!userInput) {
        alert("يرجى كتابة اسم الشخصية بنظام الرول بلاي (مثال: Ali_Karim)!");
        return;
    }
    PlayerData.username = userInput;

    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';

    updateHUD();
    startPaydayScheduler();

    // تشغيل العالم ثلاثي الأبعاد
    if (typeof start3DScene === "function") {
        start3DScene();
    }
}

// تحديث بيانات الشاشة (HUD)
function updateHUD() {
    document.getElementById('hud-cash').innerText = `${PlayerData.cash.toLocaleString()} $`;
    document.getElementById('hud-bank').innerText = `${PlayerData.bank.toLocaleString()} $ (بنك)`;
    document.getElementById('hud-server-tag').innerText = `ID: #${PlayerData.id} • ${PlayerData.server}`;
}

// --- نظام الرواتب التلقائي كل 30 دقيقة ---
function startPaydayScheduler() {
    // يعمل كل 30 دقيقة (30 * 60 * 1000 ميلي ثانية)
    setInterval(() => {
        let paydaySalary = 1500; // دعم العاطلين

        if (PlayerData.faction === "Police" && POLICE_RANKS[PlayerData.factionRank]) {
            paydaySalary = POLICE_RANKS[PlayerData.factionRank].salary;
        }

        PlayerData.bank += paydaySalary;
        updateHUD();

        alert(`💵 [إيداع الراتب]: تم نزول راتب الـ 30 دقيقة وقدره ${paydaySalary.toLocaleString()}$ في حسابك البنكي!`);
    }, 30 * 60 * 1000);
}

// --- نظام قائمة الشرطة الميدانية (...) ---
function togglePoliceMenu() {
    const menu = document.getElementById('police-radial');
    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}

function policeAction(type) {
    togglePoliceMenu();

    if (type === 'طلب مستندات ورخصة') {
        alert("🪪 [مستندات المواطن]:\n- الاسم: مشتبه به #44\n- رخصة القيادة: سارية المفعول ✅\n- نجوم المطلوبين: ⭐⭐ (2 نجوم)");
    } 
    else if (type === 'تسجيل مخالفة مرورية') {
        const amount = prompt("أدخل قيمة الغرامة المالية ($):", "500");
        if(amount) {
            alert(`📝 تم تسجيل مخالفة بقيمة ${amount}$ وسحبها لحساب خزينة الشرطة.`);
        }
    } 
    else if (type === 'تقييد اليدين (كلبشات)') {
        PlayerData.isCuffed = !PlayerData.isCuffed;
        alert(PlayerData.isCuffed ? "⛓️ تم تقييد يدي اللاعب بالكلبشات!" : "🔓 تم فك القيود عن اللاعب.");
    } 
    else if (type === 'إرسال إلى السجن') {
        const mins = prompt("أدخل مدة السجن بالدقائق (مثال: 15):", "15");
        if(mins) {
            startJailSystem(parseInt(mins));
        }
    }
}

// نظام عداد السجن والكفالة المالية
function startJailSystem(minutes) {
    PlayerData.jailTimeMinutes = minutes;
    const badge = document.getElementById('jail-timer-badge');
    const count = document.getElementById('jail-count');
    badge.style.display = 'block';

    let seconds = minutes * 60;
    const timer = setInterval(() => {
        seconds--;
        let m = Math.floor(seconds / 60);
        let s = seconds % 60;
        count.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;

        if (seconds <= 0) {
            clearInterval(timer);
            badge.style.display = 'none';
            alert("⚖️ لقد انتهت محكوميتك وتم الإفراج عنك من السجن المركزي!");
        }
    }, 1000);
}

// --- نظام الهاتف الذكي OnePhone ---
function togglePhone() {
    const p = document.getElementById('phone-modal');
    p.style.display = (p.style.display === 'flex') ? 'none' : 'flex';
}

function phoneApp(appName) {
    if (appName === 'البنك') {
        const targetId = prompt("أدخل رقم ID اللاعب المراد تحويل الفلوس له:");
        const amount = prompt("أدخل المبلغ المطلوب تحويله ($):");
        if(targetId && amount) {
            const num = parseInt(amount);
            if(PlayerData.bank >= num) {
                PlayerData.bank -= num;
                updateHUD();
                alert(`🏦 تم تحويل ${num.toLocaleString()}$ بنجاح إلى اللاعب #${targetId}!`);
            } else {
                alert("❌ رصيدك البنكي غير كافٍ لإتمام التحويل!");
            }
        }
    } 
    else if (appName === 'الكراج') {
        alert(`🚗 [كراج سياراتك]:\nلديك: ${PlayerData.cars.join(" ، ")}\nتم استدعاء سيارتك وركنها في أقرب موقف لك!`);
    } 
    else if (appName === 'الوظائف') {
        const chosen = prompt("اختر وظيفتك المدنية:\n1: عامل توصيل طلبات (Courier)\n2: سائق شاحنات (Trucker)\n3: سائق تاكسي (Taxi)\n4: عامل نظافة", "1");
        const jobNames = { "1": "توصيل طلبات", "2": "سائق شاحنات", "3": "سائق تاكسي", "4": "عامل نظافة" };
        if(jobNames[chosen]) {
            PlayerData.activeJob = jobNames[chosen];
            alert(`💼 مبروك! بدأت العمل في وظيفة [${PlayerData.activeJob}] بمستوى مهارة (Lv: ${PlayerData.jobLevel}). تم تحديد موقع العمل بنقطة GPS على الخريطة!`);
        }
    } 
    else if (appName === 'الشرطة') {
        alert("🚨 [طوارئ 911]: تم إرسال بلاغك وموقعك الحالي بنجاح إلى جميع دوريات الشرطة المتواجدة في السيرفر!");
    } 
    else if (appName === 'البروموكود') {
        const code = prompt("أدخل كود الهدية (Promo Code):");
        if(PROMO_CODES[code]) {
            if(!PROMO_CODES[code].used) {
                PROMO_CODES[code].used = true;
                PlayerData.bank += PROMO_CODES[code].money;
                if(PROMO_CODES[code].car) PlayerData.cars.push(PROMO_CODES[code].car);
                updateHUD();
                alert(`🎉 مبروك! استلمت هدية الكود:\n+ ${PROMO_CODES[code].money.toLocaleString()}$ كاش في البنك!\n${PROMO_CODES[code].car ? '+ سيارة: ' + PROMO_CODES[code].car : ''}`);
            } else {
                alert("❌ لقد قمت باستخدام هذا الكود مسبقاً!");
            }
        } else {
            alert("❌ الكود غير صحيح أو انتهت صلاحيته!");
        }
    }
}

// أزرار التفاعل المباشر
function useInteract() {
    alert("✋ تفاعل: تم فتح صندوق السيارة / تشغيل محرك المركبة بمفتاح الملكية.");
}

function useJump() {
    if(window.gamePlayer) {
        window.gamePlayer.position.y += 0.6;
        setTimeout(() => window.gamePlayer.position.y = 0.9, 220);
    }
      }
