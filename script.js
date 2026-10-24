/* ===================================================================
 * SKY BATTLE DUBAI 3D - FULL DUBAI CITY AIR DEFENSE + 4-DIGIT P2P
 * =================================================================== */

const SoundFX = {
    ctx: null,
    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    cannon() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.08);
    },
    missile() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(750, this.ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.35);
    },
    explosion() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(90, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(15, this.ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.6);
    }
};

// --- Three.js Setup ---
const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030b18);
scene.fog = new THREE.FogExp2(0x06152a, 0.00035);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.5, 14000);

// Lighting
scene.add(new THREE.AmbientLight(0x4a6080, 1.4));
const sunLight = new THREE.DirectionalLight(0xffbe55, 2.5);
sunLight.position.set(2500, 1400, -2000);
scene.add(sunLight);
const gulfFill = new THREE.DirectionalLight(0x00e1ff, 0.8);
gulfFill.position.set(-2000, 800, 2000);
scene.add(gulfFill);

// --- 3D DUBAI ENVIRONMENT ---

// 1. Arabian Gulf
const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(16000, 8000),
    new THREE.MeshStandardMaterial({ color: 0x012f47, roughness: 0.1, metalness: 0.9 })
);
ocean.rotation.x = -Math.PI / 2;
ocean.position.set(0, -2, -4000);
scene.add(ocean);

// 2. Golden Sand Desert
const desert = new THREE.Mesh(
    new THREE.PlaneGeometry(16000, 10000),
    new THREE.MeshStandardMaterial({ color: 0xbfa36f, roughness: 0.95, metalness: 0.05 })
);
desert.rotation.x = -Math.PI / 2;
desert.position.set(0, -1, 3500);
scene.add(desert);

// 3. BURJ KHALIFA (Downtown Centerpiece with Dynamic LED Facade)
const burjKhalifaGroup = new THREE.Group();
burjKhalifaGroup.position.set(400, 0, 600);
const bkGlassMat = new THREE.MeshStandardMaterial({ color: 0x90caf9, metalness: 0.95, roughness: 0.1 });
const tiers = [
    { rB: 110, rT: 95, h: 160 }, { rB: 95, rT: 80, h: 160 },
    { rB: 80, rT: 65, h: 150 },  { rB: 65, rT: 50, h: 140 },
    { rB: 50, rT: 35, h: 130 },  { rB: 35, rT: 20, h: 120 },
    { rB: 20, rT: 8, h: 110 },   { rB: 8, rT: 3, h: 100 }
];

let curY = 0;
tiers.forEach(t => {
    for (let w = 0; w < 3; w++) {
        const ang = (w * Math.PI * 2) / 3;
        const wing = new THREE.Mesh(new THREE.CylinderGeometry(t.rT * 0.45, t.rB * 0.45, t.h, 6), bkGlassMat);
        const dist = t.rB * 0.4;
        wing.position.set(Math.cos(ang) * dist, curY + (t.h / 2), Math.sin(ang) * dist);
        burjKhalifaGroup.add(wing);
    }
    const core = new THREE.Mesh(new THREE.CylinderGeometry(t.rT, t.rB, t.h, 12), bkGlassMat);
    core.position.y = curY + (t.h / 2);
    burjKhalifaGroup.add(core);
    curY += t.h;
});

const spire = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 4, 180, 8), new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.95, roughness: 0.1 }));
spire.position.y = curY + 90;
burjKhalifaGroup.add(spire);

// Cascading LED Light Strip on Burj Khalifa Facade
const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(3, curY, 3), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
ledStrip.position.set(0, curY / 2, 85);
burjKhalifaGroup.add(ledStrip);

const crownBeacon = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0033 }));
crownBeacon.position.y = curY + 180;
burjKhalifaGroup.add(crownBeacon);
scene.add(burjKhalifaGroup);

// 4. SHEIKH ZAYED ROAD & DUBAI METRO VIADUCT
const szrGroup = new THREE.Group();
const szrRoad = new THREE.Mesh(new THREE.BoxGeometry(220, 3, 9000), new THREE.MeshStandardMaterial({ color: 0x14171d, roughness: 0.7 }));
szrRoad.position.set(0, 1, 600);
szrGroup.add(szrRoad);

const redLightMat = new THREE.MeshBasicMaterial({ color: 0xff1e40 });
const goldLightMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
for (let i = 0; i < 50; i++) {
    const redTrail = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 100 + Math.random() * 120), redLightMat);
    redTrail.position.set(-40 - Math.random() * 60, 4, (Math.random() * 8000) - 3400);
    szrGroup.add(redTrail);

    const goldTrail = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 100 + Math.random() * 120), goldLightMat);
    goldTrail.position.set(40 + Math.random() * 60, 4, (Math.random() * 8000) - 3400);
    szrGroup.add(goldTrail);
}

const metroPillarMat = new THREE.MeshStandardMaterial({ color: 0xa0aab2, roughness: 0.6 });
for (let z = -3400; z < 4500; z += 220) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(8, 30, 8), metroPillarMat);
    pillar.position.set(135, 15, z);
    szrGroup.add(pillar);
}
const metroTrack = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 8000), metroPillarMat);
metroTrack.position.set(135, 30, 600);
szrGroup.add(metroTrack);

// Gold Clam-Shell Dubai Metro Station
const metroStation = new THREE.Mesh(new THREE.SphereGeometry(35, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffcc33, metalness: 0.85, roughness: 0.25 }));
metroStation.scale.set(0.6, 0.45, 2.2);
metroStation.position.set(135, 36, 400);
szrGroup.add(metroStation);
scene.add(szrGroup);

// Flanking SZR Skyscrapers
const dubaiTowerMats = [
    new THREE.MeshStandardMaterial({ color: 0x0e2a47, metalness: 0.9, roughness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 }),
    new THREE.MeshStandardMaterial({ color: 0x1f3c58, metalness: 0.9, roughness: 0.15 })
];
for (let z = -2500; z < 4200; z += 240) {
    if (Math.abs(z - 600) > 450) {
        [-240 - Math.random() * 120, 240 + Math.random() * 120].forEach(x => {
            const h = 200 + Math.random() * 320;
            const w = 70 + Math.random() * 40;
            const mat = dubaiTowerMats[Math.floor(Math.random() * dubaiTowerMats.length)];
            const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat);
            b.position.set(x, h / 2, z);
            scene.add(b);

            const crown = new THREE.Mesh(new THREE.BoxGeometry(w * 0.95, 3, w * 0.95), new THREE.MeshBasicMaterial({ color: (Math.random() > 0.5 ? 0x00ff88 : 0xffd700) }));
            crown.position.set(x, h + 2, z);
            scene.add(crown);
        });
    }
}

// 5. MUSEUM OF THE FUTURE
const motfGroup = new THREE.Group();
motfGroup.position.set(-280, 55, 950);
motfGroup.rotation.y = Math.PI * 0.4;
const motfRing = new THREE.Mesh(new THREE.TorusGeometry(55, 20, 24, 48), new THREE.MeshStandardMaterial({ color: 0xdadada, metalness: 0.95, roughness: 0.1 }));
motfRing.scale.set(1.4, 0.9, 0.7);
motfGroup.add(motfRing);

const calligBand = new THREE.Mesh(new THREE.TorusGeometry(55, 20.5, 8, 24, Math.PI * 0.8), new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true }));
calligBand.scale.set(1.4, 0.9, 0.7);
motfGroup.add(calligBand);
scene.add(motfGroup);

// 6. THE DUBAI FRAME
const frameGroup = new THREE.Group();
frameGroup.position.set(950, 0, 2000);
frameGroup.rotation.y = Math.PI * 0.3;
const goldFrameMat = new THREE.MeshStandardMaterial({ color: 0xffb700, metalness: 0.9, roughness: 0.2 });

const colL = new THREE.Mesh(new THREE.BoxGeometry(22, 280, 22), goldFrameMat); colL.position.set(-90, 140, 0); frameGroup.add(colL);
const colR = new THREE.Mesh(new THREE.BoxGeometry(22, 280, 22), goldFrameMat); colR.position.set(90, 140, 0); frameGroup.add(colR);
const skyBridge = new THREE.Mesh(new THREE.BoxGeometry(202, 24, 28), goldFrameMat); skyBridge.position.set(0, 275, 0); frameGroup.add(skyBridge);
const frameBase = new THREE.Mesh(new THREE.BoxGeometry(202, 20, 28), goldFrameMat); frameBase.position.set(0, 10, 0); frameGroup.add(frameBase);
scene.add(frameGroup);

// 7. BURJ AL ARAB
const burjAlArabGroup = new THREE.Group();
burjAlArabGroup.position.set(-1800, 0, -1400);
const isl = new THREE.Mesh(new THREE.CylinderGeometry(180, 190, 16, 32), new THREE.MeshStandardMaterial({ color: 0xd6c29b, roughness: 0.9 }));
isl.position.y = 6;
burjAlArabGroup.add(isl);

const sailArch = new THREE.Mesh(new THREE.TorusGeometry(170, 22, 16, 36, Math.PI * 0.65), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.2 }));
sailArch.rotation.z = -Math.PI / 2.3; sailArch.rotation.y = Math.PI / 2; sailArch.position.set(0, 180, 0);
burjAlArabGroup.add(sailArch);

const mast = new THREE.Mesh(new THREE.CylinderGeometry(8, 12, 350, 12), new THREE.MeshStandardMaterial({ color: 0x1a2e40, metalness: 0.8 }));
mast.position.set(-35, 180, 0);
burjAlArabGroup.add(mast);

const helipad = new THREE.Mesh(new THREE.CylinderGeometry(32, 32, 4, 16), new THREE.MeshStandardMaterial({ color: 0x00ff88 }));
helipad.position.set(28, 280, 0);
burjAlArabGroup.add(helipad);
scene.add(burjAlArabGroup);

// 8. PALM JUMEIRAH & ATLANTIS
const palmGroup = new THREE.Group();
palmGroup.position.set(-600, 0, -2200);
const palmSandMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.9 });
const pTrunk = new THREE.Mesh(new THREE.BoxGeometry(90, 8, 900), palmSandMat); pTrunk.position.set(0, 2, 0); palmGroup.add(pTrunk);
const crescent = new THREE.Mesh(new THREE.TorusGeometry(700, 45, 8, 36, Math.PI), palmSandMat); crescent.rotation.x = Math.PI / 2; crescent.position.set(0, 2, -450); palmGroup.add(crescent);

const atlantisGroup = new THREE.Group();
atlantisGroup.position.set(0, 10, -1150);
const atlantisMat = new THREE.MeshStandardMaterial({ color: 0xe58e73, roughness: 0.4 });
const wingL = new THREE.Mesh(new THREE.BoxGeometry(80, 90, 30), atlantisMat); wingL.position.set(-60, 45, 0); atlantisGroup.add(wingL);
const wingR = new THREE.Mesh(new THREE.BoxGeometry(80, 90, 30), atlantisMat); wingR.position.set(60, 45, 0); atlantisGroup.add(wingR);
const archTop = new THREE.Mesh(new THREE.BoxGeometry(60, 25, 30), atlantisMat); archTop.position.set(0, 80, 0); atlantisGroup.add(archTop);
palmGroup.add(atlantisGroup);
scene.add(palmGroup);

// --- DUBAI AIR DEFENSE JET ---
function createDubaiFighterJet(isEnemy = false) {
    const jet = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: (isEnemy ? 0x8b0000 : 0xffffff), metalness: 0.85, roughness: 0.2 });
    const trimMat = new THREE.MeshStandardMaterial({ color: (isEnemy ? 0xff3b30 : 0x00ff88), metalness: 0.5, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.1 });
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x00e1ff, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.8 });

    const fuselage = new THREE.Mesh(new THREE.ConeGeometry(2.5, 20, 8), bodyMat);
    fuselage.rotation.x = Math.PI / 2;
    jet.add(fuselage);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5, 8), goldMat);
    nose.rotation.x = Math.PI / 2; nose.position.z = -8;
    jet.add(nose);

    const cockpit = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 16), canopyMat);
    cockpit.scale.set(0.65, 0.8, 2.5); cockpit.position.set(0, 1.2, -1.8);
    jet.add(cockpit);

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 4); wingShape.lineTo(13, -4); wingShape.lineTo(13, -7); wingShape.lineTo(0, -3.5); wingShape.closePath();
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.35, bevelEnabled: false });
    const wingR = new THREE.Mesh(wingGeo, trimMat); wingR.rotation.x = Math.PI / 2; jet.add(wingR);
    const wingL = wingR.clone(); wingL.scale.x = -1; jet.add(wingL);

    const finGeo = new THREE.BoxGeometry(0.3, 3.6, 4.5);
    const finL = new THREE.Mesh(finGeo, goldMat); finL.position.set(-2, 2, 6); finL.rotation.z = -0.22; jet.add(finL);
    const finR = new THREE.Mesh(finGeo, goldMat); finR.position.set(2, 2, 6); finR.rotation.z = 0.22; jet.add(finR);

    const flameL = new THREE.Mesh(new THREE.ConeGeometry(0.7, 4.5, 12), new THREE.MeshBasicMaterial({ color: (isEnemy ? 0xff2200 : 0x00ffcc) }));
    flameL.rotation.x = -Math.PI / 2; flameL.position.set(-1.2, 0, 10.5); jet.add(flameL);
    const flameR = flameL.clone(); flameR.position.x = 1.2; jet.add(flameR);

    jet.userData = { flameL, flameR };
    return jet;
}

const localJet = createDubaiFighterJet(false);
localJet.position.set(0, 320, 1400);
scene.add(localJet);

const flight = {
    speed: 3.8,
    boostSpeed: 10.5,
    pitchRate: 0.038,
    rollRate: 0.055,
    yawRate: 0.022,
    health: 100,
    alive: true,
    name: "FALCON-1"
};

const keys = { w: false, s: false, a: false, d: false, q: false, e: false, shift: false, space: false, m: false, l: false };
const cheats = { laser: false, god: false, speed: false, rapid: false };
const bullets = [];
const missiles = [];
const particles = [];
let lastShot = 0;
let lastMissile = 0;
const remotePlayers = {};

function fireCannons() {
    SoundFX.cannon();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(localJet.quaternion);
    [-2.2, 2.2].forEach(offset => {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6, 6), new THREE.MeshBasicMaterial({ color: cheats.rapid ? 0xff0055 : 0x00ff88 }));
        b.quaternion.copy(localJet.quaternion); b.rotateX(Math.PI / 2);
        const wingOff = new THREE.Vector3(offset, 0, -1).applyQuaternion(localJet.quaternion);
        b.position.copy(localJet.position).add(wingOff);
        bullets.push({ mesh: b, velocity: forward.clone().multiplyScalar(flight.speed + 17), life: 100, owner: peer ? peer.id : 'local' });
        scene.add(b);
    });
    broadcast({
        type: 'shoot',
        pos: { x: localJet.position.x, y: localJet.position.y, z: localJet.position.z },
        quat: { x: localJet.quaternion.x, y: localJet.quaternion.y, z: localJet.quaternion.z, w: localJet.quaternion.w }
    });
}

function fireMissile() {
    SoundFX.missile();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(localJet.quaternion);
    const mMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 7, 8), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 }));
    mMesh.quaternion.copy(localJet.quaternion); mMesh.rotateX(Math.PI / 2);
    mMesh.position.copy(localJet.position).add(forward.clone().multiplyScalar(5));

    let nearest = null;
    let minDist = 4000;
    Object.values(remotePlayers).forEach(p => {
        const d = p.mesh.position.distanceTo(localJet.position);
        if (d < minDist) { minDist = d; nearest = p.mesh; }
    });

    missiles.push({ mesh: mMesh, target: nearest, velocity: forward.clone().multiplyScalar(flight.speed + 9), life: 250, owner: peer ? peer.id : 'local' });
    scene.add(mMesh);
    showNotification("🚀 FALCON MISSILE TRACKING");
}

function createExplosion(pos, color = 0xff6600, count = 28) {
    SoundFX.explosion();
    for (let i = 0; i < count; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(1.2 + Math.random() * 2, 6, 6), new THREE.MeshBasicMaterial({ color: color }));
        p.position.copy(pos);
        const vel = new THREE.Vector3((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7);
        particles.push({ mesh: p, vel, life: 45 });
        scene.add(p);
    }
}

// Laser Cheat Beam
let laserBeam = null;
function updateLaserBeam() {
    if (!cheats.laser || !keys.l) {
        if (laserBeam) { scene.remove(laserBeam); laserBeam = null; }
        return;
    }
    if (!laserBeam) {
        laserBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1400, 8), new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.85 }));
        scene.add(laserBeam);
    }
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(localJet.quaternion);
    laserBeam.quaternion.copy(localJet.quaternion);
    laserBeam.rotateX(Math.PI / 2);
    laserBeam.position.copy(localJet.position).add(forward.clone().multiplyScalar(700));

    const ray = new THREE.Raycaster(localJet.position, forward, 0, 1400);
    Object.entries(remotePlayers).forEach(([id, p]) => {
        const hits = ray.intersectObject(p.mesh, true);
        if (hits.length > 0) {
            broadcast({ type: 'hit', targetId: id, damage: 4.0 });
            createExplosion(hits[0].point, 0x00ffff, 4);
        }
    });
}

// --- 4-DIGIT MULTIPLAYER NETWORKING (PeerJS) ---
let peer = null;
let connections = [];
let currentRoomCode = null;

function generate4DigitCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function hostGame() {
    SoundFX.init();
    flight.name = document.getElementById('username').value.trim() || 'FALCON-LEAD';
    currentRoomCode = generate4DigitCode();
    const peerId = 'dubai-sky-' + currentRoomCode;

    peer = new Peer(peerId);

    peer.on('open', (id) => {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('generatedCodeDisplay').innerText = currentRoomCode;
        document.getElementById('hostModal').style.display = 'flex';
        document.getElementById('hudCode').innerText = `SQUAD [ ${currentRoomCode} ] (HOST)`;
    });

    peer.on('connection', (conn) => { setupConn(conn); });

    peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            hostGame();
        } else {
            document.getElementById('statusMsg').innerText = "Signal error. Try again.";
        }
    });
}

function copyCode() {
    if (currentRoomCode) {
        navigator.clipboard.writeText(currentRoomCode);
        showNotification("CODE COPIED: " + currentRoomCode);
    }
}

function closeHostModalAndFly() {
    document.getElementById('hostModal').style.display = 'none';
    showNotification("AIR DEFENSE DEPLOYED: SQUAD " + currentRoomCode);
}

function joinGame() {
    SoundFX.init();
    flight.name = document.getElementById('username').value.trim() || 'FALCON-WING';
    const code = document.getElementById('joinCode').value.trim();
    if (code.length !== 4 || isNaN(code)) {
        alert("Enter a valid 4-digit squad code!");
        return;
    }

    currentRoomCode = code;
    peer = new Peer();

    peer.on('open', (id) => {
        const hostPeerId = 'dubai-sky-' + currentRoomCode;
        const conn = peer.connect(hostPeerId);
        setupConn(conn);
        document.getElementById('menu').style.display = 'none';
        document.getElementById('hudCode').innerText = `SQUAD [ ${currentRoomCode} ]`;
        showNotification("INTERCEPTOR SCRAMBLED: JOINING " + currentRoomCode);
    });

    peer.on('error', () => {
        document.getElementById('statusMsg').innerText = "Airspace squad not found. Verify 4-digit code.";
    });
}

function setupConn(conn) {
    connections.push(conn);
    conn.on('open', () => {
        conn.send({ type: 'join', name: flight.name, pos: localJet.position });
    });
    conn.on('data', (data) => {
        handleNetworkData(conn, data);
    });
    conn.on('close', () => {
        removeRemotePlayer(conn.peer);
    });
}

function broadcast(msg) {
    connections.forEach(c => { if (c.open) c.send(msg); });
}

function handleNetworkData(conn, data) {
    if (data.type === 'join') {
        createRemotePlayer(conn.peer, data.name, data.pos);
        conn.send({ type: 'sync_ack', name: flight.name, pos: localJet.position });
    }
    else if (data.type === 'sync_ack') {
        createRemotePlayer(conn.peer, data.name, data.pos);
    }
    else if (data.type === 'state') {
        const p = remotePlayers[conn.peer];
        if (p) {
            p.targetPos.set(data.pos.x, data.pos.y, data.pos.z);
            p.targetQuat.set(data.quat.x, data.quat.y, data.quat.z, data.quat.w);
            p.health = data.health;
        }
    }
    else if (data.type === 'shoot') {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff3b30 }));
        b.quaternion.set(data.quat.x, data.quat.y, data.quat.z, data.quat.w);
        b.rotateX(Math.PI / 2);
        b.position.set(data.pos.x, data.pos.y, data.pos.z);
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(b.quaternion);
        bullets.push({ mesh: b, velocity: forward.multiplyScalar(flight.speed + 17), life: 100, owner: conn.peer });
        scene.add(b);
    }
    else if (data.type === 'hit') {
        if (data.targetId === (peer ? peer.id : '')) applyDamage(data.damage, "BOGEY");
    }
    else if (data.type === 'kill') {
        addKillMessage(data.msg);
    }
    else if (data.type === 'nuke') {
        showNotification("⚠️ TACTICAL EMP BLAST DETONATED ⚠️");
        createExplosion(localJet.position, 0xff0055, 90);
        if (!cheats.god) applyDamage(100, data.by);
    }
}

function createRemotePlayer(id, name, pos) {
    if (remotePlayers[id]) return;
    const mesh = createDubaiFighterJet(true);
    if (pos) mesh.position.set(pos.x, pos.y, pos.z);
    scene.add(mesh);

    remotePlayers[id] = {
        name: name || "BANDIT",
        mesh: mesh,
        health: 100,
        targetPos: mesh.position.clone(),
        targetQuat: mesh.quaternion.clone()
    };
    showNotification(`RADAR CONTACT: ${name}`);
}

function removeRemotePlayer(id) {
    if (remotePlayers[id]) {
        scene.remove(remotePlayers[id].mesh);
        delete remotePlayers[id];
    }
}

function applyDamage(amount, source) {
    if (cheats.god || !flight.alive) return;
    flight.health -= amount;
    if (flight.health < 0) flight.health = 0;
    document.getElementById('healthBar').style.width = flight.health + '%';

    if (flight.health <= 0) {
        flight.alive = false;
        createExplosion(localJet.position, 0xff3300, 70);
        localJet.visible = false;
        const msg = `${source} SHOT DOWN ${flight.name}`;
        addKillMessage(msg);
        broadcast({ type: 'kill', msg: msg });
        showNotification("HULL BREACH - EJECTING OVER DUBAI...");

        setTimeout(() => { respawnJet(); }, 3200);
    }
}

function respawnJet() {
    flight.health = 100;
    flight.alive = true;
    localJet.visible = true;
    localJet.position.set((Math.random() - 0.5) * 800, 320, 1000 + Math.random() * 800);
    localJet.quaternion.set(0, 0, 0, 1);
    document.getElementById('healthBar').style.width = '100%';
}

function addKillMessage(msg) {
    const kf = document.getElementById('killFeed');
    const div = document.createElement('div');
    div.className = 'kill-msg';
    div.innerText = msg;
    kf.appendChild(div);
    setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 1000); }, 4000);
}

function showNotification(txt) {
    const n = document.getElementById('notification');
    n.innerText = txt;
    n.style.opacity = '1';
    setTimeout(() => { n.style.opacity = '0'; }, 2200);
}

// --- CONTROLS ---
window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (keys.hasOwnProperty(k)) keys[k] = true;
    if (e.key === 'Shift') keys.shift = true;
    if (e.code === 'Space') keys.space = true;
});

window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (keys.hasOwnProperty(k)) keys[k] = false;
    if (e.key === 'Shift') keys.shift = false;
    if (e.code === 'Space') keys.space = false;
});

function bindTouch(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
    el.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; });
}
bindTouch('btnW', 'w');
bindTouch('btnS', 's');
bindTouch('btnA', 'a');
bindTouch('btnD', 'd');
bindTouch('btnShift', 'shift');
bindTouch('btnSpace', 'space');
bindTouch('btnM', 'm');
bindTouch('btnL', 'l');

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Admin Cheat PIN: 8007
function toggleAdminPanel() {
    const p = document.getElementById('adminPanel');
    p.style.display = p.style.display === 'block' ? 'none' : 'block';
}

function unlockAdmin() {
    const pass = document.getElementById('adminPass').value;
    if (pass === '8007') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('cheatSection').style.display = 'block';
        showNotification("ROYAL VIP OVERRIDE ACTIVE");
    } else {
        alert("SECURITY CODE INVALID");
    }
}

function toggleCheat(c) {
    cheats[c] = !cheats[c];
    const btn = document.getElementById('btn' + c.charAt(0).toUpperCase() + c.slice(1));
    if (btn) btn.classList.toggle('active', cheats[c]);

    if (c === 'laser') {
        const btnL = document.getElementById('btnL');
        if (btnL) btnL.style.display = cheats.laser ? 'block' : 'none';
    } else if (c === 'nuke') {
        broadcast({ type: 'nuke', by: flight.name });
        showNotification("☢️ EMP SHOCKWAVE DISPATCHED");
        createExplosion(localJet.position, 0xff0055, 100);
        cheats.nuke = false;
        if (btn) btn.classList.remove('active');
    }
}

// --- MAIN LOOP ---
const clock = new THREE.Clock();
let atcTimer = 0;

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Cascading Burj Khalifa LED Light Animation
    ledStrip.material.color.setHSL((Date.now() * 0.0003) % 1, 1, 0.5);

    if (flight.alive) {
        let curSpeed = keys.shift ? flight.boostSpeed : flight.speed;
        if (cheats.speed) curSpeed *= 2.0;

        const fScale = keys.shift ? 2.3 : 1.0;
        localJet.userData.flameL.scale.set(1, fScale, 1);
        localJet.userData.flameR.scale.set(1, fScale, 1);

        if (keys.w) localJet.rotateX(flight.pitchRate);
        if (keys.s) localJet.rotateX(-flight.pitchRate);
        if (keys.a) localJet.rotateZ(flight.rollRate);
        if (keys.d) localJet.rotateZ(-flight.rollRate);
        if (keys.q) localJet.rotateY(flight.yawRate);
        if (keys.e) localJet.rotateY(-flight.yawRate);

        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(localJet.quaternion);
        localJet.position.add(forward.multiplyScalar(curSpeed));

        if (localJet.position.y < 12) {
            localJet.position.y = 12;
            applyDamage(100, "TERRAIN IMPACT");
        }

        const camOffset = new THREE.Vector3(0, 7.5, 25).applyQuaternion(localJet.quaternion);
        camera.position.lerp(localJet.position.clone().add(camOffset), 0.12);
        camera.lookAt(localJet.position.clone().add(forward.clone().multiplyScalar(45)));

        const now = performance.now();
        const fireGap = cheats.rapid ? 60 : 150;
        if (keys.space && now - lastShot > fireGap) {
            fireCannons();
            lastShot = now;
        }
        if (keys.m && now - lastMissile > 1100) {
            fireMissile();
            lastMissile = now;
        }
        updateLaserBeam();

        broadcast({
            type: 'state',
            pos: { x: localJet.position.x, y: localJet.position.y, z: localJet.position.z },
            quat: { x: localJet.quaternion.x, y: localJet.quaternion.y, z: localJet.quaternion.z, w: localJet.quaternion.w },
            health: flight.health
        });

        // Landmark Zone Identifier on HUD
        const jx = localJet.position.x, jz = localJet.position.z;
        let sector = "SECTOR: ARABIAN GULF PATROL";
        if (jz > 0 && jz < 1200 && Math.abs(jx) < 600) sector = "OVERFLYING: BURJ KHALIFA & DOWNTOWN";
        else if (Math.abs(jx) < 200 && jz > -2000 && jz < 3500) sector = "OVERFLYING: SHEIKH ZAYED ROAD";
        else if (jx < -1200 && jz < -800) sector = "OVERFLYING: BURJ AL ARAB";
        else if (jz < -1600 && Math.abs(jx) < 1000) sector = "OVERFLYING: PALM JUMEIRAH & ATLANTIS";
        else if (jx > 600 && jz > 1400) sector = "OVERFLYING: THE DUBAI FRAME";
        else if (jx < -200 && jz > 700 && jz < 1200) sector = "OVERFLYING: MUSEUM OF THE FUTURE";

        document.getElementById('landmarkBeacon').innerText = sector;
        document.getElementById('speedGauge').innerText = `THRUST: ${keys.shift ? '150% [SUPERSONIC]' : '100%'} | MACH ${(curSpeed * 0.28).toFixed(1)}`;
        document.getElementById('altGauge').innerText = `ALT: ${Math.round(localJet.position.y * 3.28)} FT`;
    }

    // Radio Chatter Simulation
    atcTimer += delta;
    if (atcTimer > 8) {
        atcTimer = 0;
        const msgs = [
            "DUBAI ATC: RADAR CLEAR OVER BURJ KHALIFA CORRIDOR",
            "TOWER: SHEIKH ZAYED AIRSPACE RESTRICTED TO MACH 2",
            "RADAR: MONITORING OFFSHORE SECTOR BURJ AL ARAB",
            "EMIRATES COMMAND: SQUADRON PATROL EN ROUTE TO PALM JUMEIRAH"
        ];
        document.getElementById('atcChatter').innerText = msgs[Math.floor(Math.random() * msgs.length)];
    }

    let closestEnemyDist = 9999;
    Object.values(remotePlayers).forEach(p => {
        p.mesh.position.lerp(p.targetPos, 0.22);
        p.mesh.quaternion.slerp(p.targetQuat, 0.22);
        const d = p.mesh.position.distanceTo(localJet.position);
        if (d < closestEnemyDist) closestEnemyDist = d;
    });

    if (closestEnemyDist < 3000) {
        document.getElementById('lockState').innerText = closestEnemyDist < 1200 ? "RADAR LOCK CONFIRMED" : `BANDIT ${Math.round(closestEnemyDist)}M`;
        document.getElementById('lockState').style.color = closestEnemyDist < 1200 ? "#ff3366" : "#ffd700";
    } else {
        document.getElementById('lockState').innerText = "AIRSPACE CLEAR";
        document.getElementById('lockState').style.color = "rgba(0,255,136,0.7)";
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.mesh.position.add(b.velocity);
        b.life--;
        if (b.owner === (peer ? peer.id : 'local')) {
            Object.entries(remotePlayers).forEach(([id, p]) => {
                if (b.mesh.position.distanceTo(p.mesh.position) < 8.5) {
                    b.life = 0;
                    createExplosion(b.mesh.position, 0x00ff88, 10);
                    broadcast({ type: 'hit', targetId: id, damage: 16 });
                }
            });
        }
        if (b.life <= 0) { scene.remove(b.mesh); bullets.splice(i, 1); }
    }

    for (let i = missiles.length - 1; i >= 0; i--) {
        const m = missiles[i];
        if (m.target) {
            const des = m.target.position.clone().sub(m.mesh.position).normalize();
            m.velocity.lerp(des.multiplyScalar(flight.speed + 12), 0.08);
            m.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), m.velocity.clone().normalize());
            m.mesh.rotateX(Math.PI / 2);
        }
        m.mesh.position.add(m.velocity);
        m.life--;

        if (Math.random() > 0.4) {
            const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.9, 4, 4), new THREE.MeshBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.5 }));
            smoke.position.copy(m.mesh.position);
            particles.push({ mesh: smoke, vel: new THREE.Vector3(), life: 25 });
            scene.add(smoke);
        }

        if (m.target && m.mesh.position.distanceTo(m.target.position) < 12) {
            createExplosion(m.mesh.position, 0xff3300, 32);
            Object.entries(remotePlayers).forEach(([id, p]) => {
                if (p.mesh === m.target) broadcast({ type: 'hit', targetId: id, damage: 65 });
            });
            m.life = 0;
        }
        if (m.life <= 0) { scene.remove(m.mesh); missiles.splice(i, 1); }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.mesh.position.add(pt.vel);
        pt.life--;
        pt.mesh.scale.multiplyScalar(0.96);
        if (pt.life <= 0) { scene.remove(pt.mesh); particles.splice(i, 1); }
    }

    renderer.render(scene, camera);
}

animate();