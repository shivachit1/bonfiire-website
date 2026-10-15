import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// The 3D character on /character (see Figure.jsx): a Finnish student in haalarit (student
// overalls), full body, with matte, softly lit materials, jointed so it can move. Loaded on demand so three.js stays out of the main
// bundle.
//
// Rig: root (turns, jumps) > hips > legs (hip > knee > ankle)
//                                 > spine > arms (shoulder > elbow > hand)
//                                         > neck > head
//
// createFigureScene(container, { still, move }) adds a canvas to `container` and returns
// { setMove(name), dispose() }. still: hold one pose, no motion (prefers-reduced-motion);
// dragging still turns the character.

const TAU = Math.PI * 2;
const THIGH = 1.2;
const SHIN = 1.2;
const UPPER_ARM = 0.95;
const FOREARM = 0.85;
const SHOULDER = { x: 0.66, y: 1.6 };
const NECK_Y = 2.06;
const HEAD_R = 0.76;
const FACING = -0.35; // a three-quarter view to start with

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const smoothstep = (a, b, v) => {
  const k = clamp((v - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};
const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

// --- Moves: each returns a pose (numbers only, so two poses can be blended).
// Arms: r = raise sideways, f = swing forward, e = elbow bend, w = forearm sideways.
// Legs: h = thigh lift forward, k = knee bend. crouch bends both legs and lowers the hips.
const REST = {
  x: 0, y: 0, sway: 0, lean: 0, twist: 0, breathe: 0, crouch: 0,
  headYaw: 0, headPitch: 0, headTilt: 0,
  rL: 0.21, fL: 0, eL: 0.18, wL: 0,
  rR: 0.21, fR: 0, eR: 0.18, wR: 0,
  hL: 0, kL: 0, hR: 0, kR: 0,
};

const idle = (t) => {
  const b = Math.sin((t * TAU) / 4);
  const w = Math.sin(t * 0.6);
  return {
    ...REST,
    x: w * 0.05,
    sway: w * 0.03,
    breathe: b,
    headTilt: Math.sin(t * 0.7) * 0.05,
    headYaw: Math.sin(t * 0.4) * 0.12,
    rL: 0.21 + b * 0.015,
    rR: 0.21 + b * 0.015,
    kL: Math.max(0, w) * 0.12,
    kR: Math.max(0, -w) * 0.12,
  };
};

const wave = (t) => {
  const w = Math.sin(t * TAU * 1.5);
  return {
    ...idle(t),
    rL: 2.2,
    fL: 0.2,
    eL: 0.2,
    wL: 0.55 + w * 0.35,
    lean: -0.03,
    headTilt: 0.1,
  };
};

// Marching in place.
const walk = (t) => {
  const s = Math.sin(t * TAU * 0.9);
  return {
    ...REST,
    y: -Math.abs(s) * 0.06,
    twist: s * 0.08,
    headYaw: -s * 0.06,
    hL: Math.max(0, s) * 0.75,
    kL: Math.max(0, s) * 1.2,
    hR: Math.max(0, -s) * 0.75,
    kR: Math.max(0, -s) * 1.2,
    fL: -s * 0.45,
    fR: s * 0.45,
    eL: 0.4,
    eR: 0.4,
  };
};

// Crouch, launch with the arms up, tuck, land softly.
const jump = (t) => {
  const u = (t % 1.7) / 1.7;
  const v = clamp((u - 0.25) / 0.5, 0, 1);
  const height = u > 0.25 && u < 0.75 ? 4 * v * (1 - v) * 1.4 : 0;
  const crouch =
    u < 0.25 ? smoothstep(0, 0.2, u) : u < 0.32 ? 1 - (u - 0.25) / 0.07 : 0;
  const land = u > 0.75 && u < 0.95 ? Math.sin((Math.PI * (u - 0.75)) / 0.2) * 0.8 : 0;
  const air = smoothstep(0.22, 0.4, u) * (1 - smoothstep(0.68, 0.85, u));
  return {
    ...REST,
    y: height,
    crouch: Math.max(crouch, land),
    lean: Math.max(crouch, land) * 0.18,
    rL: 0.21 + air * 2.2,
    rR: 0.21 + air * 2.2,
    fL: -0.5 * crouch,
    fR: -0.5 * crouch,
    eL: 0.2 + air * 0.3,
    eR: 0.2 + air * 0.3,
    hL: air * 0.35,
    hR: air * 0.35,
    kL: air * 0.7,
    kR: air * 0.7,
    headPitch: -air * 0.12,
  };
};

const MOVES = { idle, wave, walk, jump };
const STILL_AT = { idle: 0, wave: 0.15, walk: 0.28, jump: 0.8 };

const KEYS = Object.keys(REST);
const mix = (a, b, k) => {
  const out = {};
  KEYS.forEach((key) => (out[key] = a[key] + (b[key] - a[key]) * k));
  return out;
};

// --- Shapes.

const token = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// How far down the hair reaches (angle from the crown, radians) around the head
// (0 = the face, + = the viewer's right): a side part on the right, the fringe swept
// to the left, shorter at the sides so the ears show, down to the nape at the back.
const hairline = (az) => {
  const c = Math.cos(az);
  const front = Math.max(0, c) ** 1.2;
  const back = Math.max(0, -c);
  const sweep = -0.32 * Math.sin(az) * front;
  const part = -0.12 * Math.exp(-(((az - 0.55) / 0.16) ** 2));
  // Short sideburns in front of the ears.
  const sideburns = 0.16 * Math.exp(-(((Math.abs(az) - 1.22) / 0.12) ** 2));
  return 1.45 + 0.6 * back - 0.27 * front + sweep + part + sideburns;
};

// The scalp layer under the locks: a sphere whose grid is squeezed into the hair
// region, so its lower edge follows the hairline, thinning out to the skin at the edge.
const hairGeometry = () => {
  const geo = new THREE.SphereGeometry(1, 160, 72, -Math.PI / 2);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const phi = -Math.PI / 2 + uv.getX(i) * TAU;
    const t = 1 - uv.getY(i);
    const hx = -Math.cos(phi);
    const hz = Math.sin(phi);
    const az = Math.atan2(hx, hz);
    const theta = t * hairline(az);
    const front = Math.max(0, Math.cos(az));
    const thin = (1 - smoothstep(0.45, 1, t)) ** 0.8;
    const volume = 0.05 + 0.03 * front * Math.sin(Math.PI * t);
    const r = 1.004 + volume * thin;
    pos.setXYZ(
      i,
      hx * Math.sin(theta) * r,
      Math.cos(theta) * r,
      hz * Math.sin(theta) * r,
    );
  }
  geo.computeVertexNormals();
  return geo;
};

// Fluffy hair: soft, overlapping locks spread over the hair region, each one lying
// along the way the hair is combed (down, and swept to the viewer's left over the
// forehead). Locks near the edge are smaller, so the hairline stays soft; slight colour
// differences between locks give depth. One instanced mesh, so it stays cheap to draw.
const hairLocks = (material) => {
  const count = 330;
  const spots = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const ring = Math.sqrt(1 - y * y);
    const a = i * golden;
    const dir = new THREE.Vector3(Math.cos(a) * ring, y, Math.sin(a) * ring);
    const az = Math.atan2(dir.x, dir.z);
    const theta = Math.acos(clamp(dir.y, -1, 1));
    const edge = hairline(az) - theta;
    if (edge > 0.02) spots.push({ dir, az, edge, seed: i });
  }

  const locks = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), material, spots.length);
  locks.castShadow = true;
  locks.receiveShadow = true;
  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const basis = new THREE.Matrix4();
  const down = new THREE.Vector3();
  const flow = new THREE.Vector3();
  const side = new THREE.Vector3();
  const tint = new THREE.Color();
  const rand = (n) => {
    const x = Math.sin(n * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };

  spots.forEach(({ dir, az, edge, seed }, i) => {
    const front = Math.max(0, Math.cos(az));
    // Combed down the head, and over the forehead swept toward the viewer's left.
    down.set(0, -1, 0).addScaledVector(dir, dir.y).normalize();
    side.set(-1, 0, 0).addScaledVector(dir, dir.x);
    flow.copy(down).addScaledVector(side, 1.3 * front).normalize();
    if (dir.y > 0.97) flow.set(-1, 0, 0.3).normalize();
    const across = new THREE.Vector3().crossVectors(dir, flow).normalize();
    basis.makeBasis(across, dir, flow);
    quat.setFromRotationMatrix(basis);

    const size = (0.55 + 0.45 * smoothstep(0.02, 0.35, edge)) * (0.9 + rand(seed) * 0.25);
    const lift = 1.02 + 0.06 * smoothstep(0.02, 0.5, edge) + rand(seed + 7) * 0.025;
    matrix.compose(
      dir.clone().multiplyScalar(lift).addScaledVector(flow, 0.05),
      quat,
      new THREE.Vector3(0.23 * size, 0.11 * size, 0.37 * size),
    );
    locks.setMatrixAt(i, matrix);
    locks.setColorAt(i, tint.setScalar(0.88 + rand(seed + 3) * 0.24));
  });
  locks.instanceMatrix.needsUpdate = true;
  locks.instanceColor.needsUpdate = true;
  return locks;
};

const lathe = (points, segments = 64) =>
  new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );

// A soft round spot, for the cheeks.
const blushTexture = (color) => {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

// Puts `obj` on the unit head sphere in direction (x, y, z), facing outward.
const onHead = (obj, x, y, z, lift = 1) => {
  const dir = new THREE.Vector3(x, y, z).normalize();
  obj.position.copy(dir).multiplyScalar(lift);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  return obj;
};

export const createFigureScene = (container, { still = false, move = "idle" } = {}) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(26, 0.8, 0.1, 100);
  camera.position.set(0, 4.6, 18);
  camera.lookAt(0, 3.75, 0);

  // Soft daylight: a sky/ground fill, a warm key from the front right that casts the
  // floor shadow, a cool fill from the left and a gentle rim from behind.
  scene.add(new THREE.HemisphereLight(0xfff7ee, 0x8a7360, 1.1));
  const key = new THREE.DirectionalLight(0xfff0e0, 1.9);
  key.position.set(3, 12, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 8, bottom: -1, near: 1, far: 30 });
  key.shadow.radius = 6;
  key.shadow.normalBias = 0.03;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe8eeff, 0.5);
  fill.position.set(-7, 3, 4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xfff2e4, 0.7);
  rim.position.set(-2, 6, -8);
  scene.add(rim);

  const matte = (name, roughness = 0.85) =>
    new THREE.MeshStandardMaterial({ color: new THREE.Color(token(name)), roughness });
  const M = {
    skin: matte("--figure-skin", 0.7),
    hair: matte("--figure-hair", 0.75),
    top: matte("--figure-top", 0.92),
    overalls: matte("--figure-overalls", 0.9),
    "patch-a": matte("--figure-patch-a", 0.85),
    "patch-b": matte("--figure-patch-b", 0.85),
    "patch-c": matte("--figure-patch-c", 0.85),
    "patch-d": matte("--figure-patch-d", 0.85),
    "patch-e": matte("--figure-patch-e", 0.85),
    shoe: matte("--figure-shoe", 0.75),
    sole: matte("--figure-sole", 0.85),
    lace: matte("--figure-lace", 0.85),
    eye: matte("--figure-eye", 0.35),
    mouth: matte("--figure-mouth", 0.8),
    glint: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }),
  };
  const blushMap = blushTexture(token("--figure-blush"));
  M.blush = new THREE.MeshStandardMaterial({
    map: blushMap,
    transparent: true,
    depthWrite: false,
    roughness: 0.9,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  M.floor = new THREE.ShadowMaterial({ color: new THREE.Color(0x59412b), opacity: 0.22 });

  const mesh = (geometry, material, parent, setup) => {
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = true;
    m.receiveShadow = true;
    setup?.(m);
    parent.add(m);
    return m;
  };
  const group = (parent, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };

  // Floor that only shows the shadow.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), M.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // --- Body: a Finnish student in haalarit (overalls), the top half pulled down and the
  // sleeves tied around the waist, with sewn-on patches; a T-shirt on top.
  const root = group(scene);
  const hips = group(root);

  mesh(
    lathe([
      [0.001, -0.66], [0.5, -0.64], [0.7, -0.42], [0.74, -0.1], [0.76, 0.18], [0.75, 0.3],
      [0.001, 0.32],
    ]),
    M.overalls,
    hips,
    (m) => m.scale.set(1, 1, 0.74),
  );
  // The tied sleeves: a roll around the waist, a knot on the left hip, two loose ends
  // hanging down the side of the leg.
  mesh(new THREE.TorusGeometry(0.75, 0.15, 20, 72), M.overalls, hips, (m) => {
    m.rotation.x = Math.PI / 2;
    m.position.y = 0.22;
    m.scale.set(1.02, 0.76, 0.72);
  });
  mesh(new THREE.SphereGeometry(0.18, 24, 16), M.overalls, hips, (m) => {
    m.position.set(0.72, 0.2, 0.32);
    m.scale.set(0.8, 0.9, 1.15);
  });
  [
    [0.86, -0.24, 0.24, 0.06, 0.15],
    [0.84, -0.18, 0.44, 0.1, -0.25],
  ].forEach(([x, y, z, tilt, swing]) => {
    mesh(new THREE.CapsuleGeometry(0.13, 0.55, 8, 20), M.overalls, hips, (m) => {
      m.position.set(x, y, z);
      m.rotation.set(swing, 0, tilt);
      m.scale.set(0.5, 1, 1.15);
    });
  });

  // A patch sewn on a leg: angle around the leg (0 = front), height, shape, colour.
  const patch = (parent, radius, angle, y, shape, material) => {
    const geometry =
      shape === "round"
        ? new THREE.CylinderGeometry(0.1, 0.1, 0.035, 28)
        : new RoundedBoxGeometry(0.2, 0.035, 0.15, 2, 0.015);
    mesh(geometry, material, parent, (m) => {
      m.position.set(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
      m.rotation.set(Math.PI / 2, 0, 0);
      m.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), angle);
    });
  };
  const PATCHES = {
    1: { thigh: [[0.3, -0.35, "round", "a"], [1.1, -0.7, "square", "b"], [-0.2, -1.0, "square", "c"]],
         shin: [[0.6, -0.35, "round", "d"], [-0.1, -0.8, "square", "e"]] },
    "-1": { thigh: [[-0.4, -0.45, "square", "d"], [-1.2, -0.85, "round", "c"]],
            shin: [[-0.3, -0.4, "square", "a"], [0.4, -0.75, "round", "b"], [-1.1, -0.6, "round", "e"]] },
  };

  const legs = [1, -1].map((s) => {
    const leg = group(hips, s * 0.34, -0.32);
    const knee = group(leg, 0, -THIGH);
    // The trouser leg itself is one smooth tube (see trouserLeg), bent through the knee.
    PATCHES[s].thigh.forEach(([angle, y, shape, c]) =>
      patch(leg, 0.345, s * angle, y, shape, M[`patch-${c}`]),
    );
    PATCHES[s].shin.forEach(([angle, y, shape, c]) =>
      patch(knee, 0.325, s * angle, y, shape, M[`patch-${c}`]),
    );
    const ankle = group(knee, 0, -SHIN);
    // Sneakers: a rounded upper on a soft rubber sole.
    mesh(new THREE.SphereGeometry(1, 40, 24), M.shoe, ankle, (m) => {
      m.position.set(0, -0.17, 0.16);
      m.scale.set(0.25, 0.17, 0.44);
    });
    mesh(new THREE.SphereGeometry(1, 40, 16), M.sole, ankle, (m) => {
      m.position.set(0, -0.28, 0.16);
      m.scale.set(0.27, 0.075, 0.47);
    });
    mesh(new THREE.CapsuleGeometry(0.035, 0.16, 6, 12), M.lace, ankle, (m) => {
      m.position.set(0, -0.04, 0.3);
      m.rotation.set(0.5, 0, Math.PI / 2);
    });
    return { leg, knee, ankle };
  });
  // Each trouser leg is one continuous tube along a smooth curve through hip, knee and
  // ankle, rebuilt as the leg moves, so the knee bends without a seam.
  const RINGS = 40;
  const AROUND = 32;
  const trouserLeg = () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array((RINGS + 1) * (AROUND + 1) * 3), 3),
    );
    const index = [];
    for (let i = 0; i < RINGS; i++) {
      for (let j = 0; j < AROUND; j++) {
        const a = i * (AROUND + 1) + j;
        const b = a + AROUND + 1;
        index.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    geometry.setIndex(index);
    return mesh(geometry, M.overalls, hips);
  };
  // Width along the leg (0 = hip, 1 = ankle): roomy at the top, a little narrower below,
  // then gathered in over the shoe so the end of the leg is closed.
  const legRadius = (u) =>
    (0.37 - 0.04 * smoothstep(0, 0.6, u)) * (1 - 0.35 * smoothstep(0.88, 1, u));
  const trousers = legs.map(() => trouserLeg());
  const curvePoints = [0, 1, 2, 3, 4].map(() => new THREE.Vector3());
  const curve = new THREE.CatmullRomCurve3(curvePoints, false, "centripetal");
  const at = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const across = new THREE.Vector3(1, 0, 0);
  const shapeTrousers = () => {
    root.updateMatrixWorld(true);
    legs.forEach(({ leg, knee, ankle }, k) => {
      const [top, hip, kneeAt, ankleAt, end] = curvePoints;
      hips.worldToLocal(leg.getWorldPosition(hip));
      hips.worldToLocal(knee.getWorldPosition(kneeAt));
      hips.worldToLocal(ankle.getWorldPosition(ankleAt));
      top.copy(hip).y += 0.35;
      end.subVectors(ankleAt, kneeAt).setLength(0.12).add(ankleAt);
      curve.updateArcLengths();

      const pos = trousers[k].geometry.attributes.position;
      for (let i = 0; i <= RINGS; i++) {
        // From just above the hip joint (inside the waist) down to the ankle.
        const u = 0.12 + (i / RINGS) * 0.88;
        curve.getPointAt(u, at);
        curve.getTangentAt(u, tangent);
        normal.copy(across).addScaledVector(tangent, -across.dot(tangent)).normalize();
        binormal.crossVectors(tangent, normal);
        const r = legRadius(i / RINGS);
        for (let j = 0; j <= AROUND; j++) {
          const a = (j / AROUND) * TAU;
          const c = Math.cos(a) * r;
          const sn = Math.sin(a) * r;
          pos.setXYZ(
            i * (AROUND + 1) + j,
            at.x + normal.x * c + binormal.x * sn,
            at.y + normal.y * c + binormal.y * sn,
            at.z + normal.z * c + binormal.z * sn,
          );
        }
      }
      pos.needsUpdate = true;
      trousers[k].geometry.computeVertexNormals();
      trousers[k].geometry.computeBoundingSphere();
    });
  };

  // The legs hang from below the pelvis; lift the hips so the soles touch the floor.
  hips.userData.baseY = 0.32 + THIGH + SHIN + 0.35;

  // T-shirt, tucked into the overalls.
  const spine = group(hips);
  const chest = group(spine);
  mesh(
    lathe([
      [0.001, -0.18], [0.62, -0.16], [0.67, 0.1], [0.65, 0.6], [0.68, 1.1], [0.74, 1.42],
      [0.74, 1.66], [0.62, 1.84], [0.36, 1.95], [0.001, 1.98],
    ]),
    M.top,
    chest,
    (m) => m.scale.set(1, 1, 0.7),
  );

  // Arms: the shoulder joint sits inside a rounded shoulder, so the sleeve grows out of
  // the body; short T-shirt sleeves, then bare arms with soft elbows, wrists and fingers.
  const arms = [1, -1].map((s) => {
    mesh(new THREE.SphereGeometry(0.3, 32, 20), M.top, spine, (m) => {
      m.position.set(s * 0.6, SHOULDER.y - 0.04, 0);
      m.scale.set(1, 0.9, 0.78);
    });
    const arm = group(spine, s * SHOULDER.x, SHOULDER.y);
    mesh(new THREE.CapsuleGeometry(0.255, 0.3, 12, 32), M.top, arm, (m) => {
      m.position.y = -0.22;
      m.scale.set(1, 1, 0.92);
    });
    mesh(new THREE.TorusGeometry(0.245, 0.035, 12, 32), M.top, arm, (m) => {
      m.rotation.x = Math.PI / 2;
      m.position.y = -0.5;
      m.scale.set(1, 0.92, 1);
    });
    mesh(new THREE.CapsuleGeometry(0.19, UPPER_ARM - 0.2, 12, 32), M.skin, arm, (m) => {
      m.position.y = -UPPER_ARM / 2 - 0.05;
    });
    const elbow = group(arm, 0, -UPPER_ARM);
    mesh(new THREE.SphereGeometry(0.18, 24, 16), M.skin, elbow);
    mesh(new THREE.CapsuleGeometry(0.165, FOREARM - 0.2, 12, 32), M.skin, elbow, (m) => {
      m.position.y = -FOREARM / 2;
      m.scale.set(1, 1, 0.9);
    });
    const hand = group(elbow, 0, -FOREARM);
    mesh(new THREE.SphereGeometry(0.14, 20, 12), M.skin, hand, (m) => m.scale.set(1, 1, 0.85));
    mesh(new THREE.SphereGeometry(0.17, 32, 16), M.skin, hand, (m) => {
      m.position.y = -0.13;
      m.scale.set(0.78, 0.95, 0.5);
    });
    [-0.075, -0.025, 0.025, 0.075].forEach((x, i) =>
      mesh(new THREE.CapsuleGeometry(0.036, 0.1 - Math.abs(i - 1.5) * 0.02, 6, 12), M.skin, hand, (m) => {
        m.position.set(x, -0.29, 0.02);
        m.rotation.x = -0.35;
      }),
    );
    mesh(new THREE.CapsuleGeometry(0.045, 0.1, 6, 12), M.skin, hand, (m) => {
      m.position.set(-s * 0.1, -0.12, 0.07);
      m.rotation.set(0.6, 0, s * 0.45);
    });
    return { arm, elbow };
  });

  // Neck, the T-shirt's round neckline, head.
  mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.42, 24), M.skin, spine, (m) => {
    m.position.y = 1.98;
  });
  mesh(new THREE.TorusGeometry(0.3, 0.055, 16, 48), M.top, spine, (m) => {
    m.rotation.x = Math.PI / 2;
    m.position.y = 1.9;
    m.scale.set(1.05, 0.85, 1);
  });

  const headPivot = group(spine, 0, NECK_Y);
  const head = group(headPivot, 0, HEAD_R * 1.02);
  head.scale.set(HEAD_R * 0.88, HEAD_R * 1.12, HEAD_R * 0.95);

  mesh(new THREE.SphereGeometry(1, 96, 64), M.skin, head);
  mesh(hairGeometry(), M.hair, head);
  head.add(hairLocks(M.hair));
  // Ears: a soft shell with a rolled rim, turned a little toward the back.
  [1, -1].forEach((s) => {
    const ear = group(head, s * 0.95, -0.12, -0.06);
    ear.rotation.y = s * (Math.PI / 2 - 0.35);
    mesh(new THREE.SphereGeometry(1, 24, 16), M.skin, ear, (m) => m.scale.set(0.1, 0.14, 0.05));
    mesh(new THREE.TorusGeometry(0.085, 0.024, 10, 28, 4.6), M.skin, ear, (m) => {
      m.position.z = 0.03;
      m.rotation.z = s > 0 ? 2.4 : 0.8;
      m.scale.set(1, 1.35, 1);
    });
  });

  const eyes = [1, -1].map((s) => {
    const eye = onHead(group(head), s * 0.33, -0.04, 0.94, 0.985);
    mesh(new THREE.SphereGeometry(0.1, 32, 16), M.eye, eye, (m) => m.scale.set(0.85, 1.1, 0.45));
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 8), M.glint);
    glint.position.set(-0.026, 0.04, 0.04);
    eye.add(glint);
    return eye;
  });
  [1, -1].forEach((s) => {
    const brow = onHead(group(head), s * 0.34, 0.2, 0.92, 1.0);
    mesh(new THREE.CapsuleGeometry(0.026, 0.13, 6, 12), M.hair, brow, (m) => {
      m.rotation.z = Math.PI / 2 + s * 0.12;
    });
    onHead(mesh(new THREE.CircleGeometry(0.2, 32), M.blush, head), s * 0.55, -0.3, 0.78, 1.004);
  });
  mesh(new THREE.SphereGeometry(0.07, 24, 16), M.skin, head, (m) => {
    onHead(m, 0, -0.17, 1, 0.995);
    m.scale.set(1, 0.85, 0.75);
  });

  const smile = [];
  for (let i = 0; i <= 20; i++) {
    const k = i / 20;
    const x = -0.11 + 0.22 * k;
    const y = -0.4 - 0.04 * Math.sin(Math.PI * k);
    smile.push(new THREE.Vector3(x, y, Math.sqrt(1 - x * x - y * y) * 1.003));
  }
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(smile), 32, 0.017, 8), M.mouth, head);

  // --- Posing.
  const draw = (P, look, yaw, blink) => {
    // Crouching bends hips and knees by the same amount, so the shins lean forward and
    // the hips drop straight down.
    const c = P.crouch;
    const bendAngle = c * 0.6;
    const drop = (THIGH + SHIN) * (1 - Math.cos(bendAngle));

    root.rotation.y = yaw;
    root.position.y = Math.max(0, P.y);
    hips.position.set(P.x, hips.userData.baseY - drop + Math.min(0, P.y), 0);
    hips.rotation.z = P.sway;

    legs.forEach(({ leg, knee, ankle }, i) => {
      const side = i === 0 ? "L" : "R";
      const lift = P[`h${side}`] + bendAngle;
      const bend = P[`k${side}`] + bendAngle * 2;
      leg.rotation.set(-lift, 0, -P.sway);
      knee.rotation.x = bend;
      ankle.rotation.x = lift - bend;
    });

    spine.rotation.set(P.lean, P.twist, -P.sway * 1.6);
    chest.scale.set(1 + P.breathe * 0.012, 1 + P.breathe * 0.008, 1 + P.breathe * 0.02);

    arms.forEach(({ arm, elbow }, i) => {
      const side = i === 0 ? "L" : "R";
      const s = i === 0 ? 1 : -1;
      arm.position.y = SHOULDER.y + P.breathe * 0.01;
      arm.rotation.set(-P[`f${side}`], 0, s * P[`r${side}`]);
      elbow.rotation.set(-P[`e${side}`], 0, s * P[`w${side}`]);
    });

    // The head looks toward the pointer, and back toward the viewer when the body is
    // turned away (within what a neck can do).
    headPivot.rotation.set(
      clamp(P.headPitch + look.y * 0.3 - P.lean, -0.4, 0.4),
      clamp(P.headYaw + look.x * 0.5 - (yaw - FACING) * 0.6 - P.twist, -0.75, 0.75),
      P.headTilt,
    );
    eyes.forEach((e) => (e.scale.y = 1 - blink * 0.9));
    shapeTrousers();
  };

  // --- Size.
  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the whole body in view on wide and narrow boxes alike.
    camera.fov = camera.aspect < 0.8 ? 26 * (0.8 / camera.aspect) ** 0.7 : 26;
    camera.updateProjectionMatrix();
  };

  // --- Input: the pointer to look at, and drags to turn the body.
  const aim = { x: 0, y: 0 };
  const look = { x: 0, y: 0 };
  let yaw = FACING;
  let spin = 0;
  let drag = null;

  const onPointer = (event) => {
    const box = container.getBoundingClientRect();
    aim.x = clamp((event.clientX - (box.left + box.width / 2)) / 400, -1, 1);
    aim.y = clamp((event.clientY - (box.top + box.height * 0.2)) / 400, -1, 1);
  };
  const canvas = renderer.domElement;
  const onDown = (event) => {
    drag = { x: event.clientX, id: event.pointerId };
    canvas.setPointerCapture(event.pointerId);
  };
  const onMove = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    drag.x = event.clientX;
    yaw += dx * 0.012;
    spin = dx * 0.012 * 60;
    if (still) render();
  };
  const onUp = () => {
    drag = null;
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // --- Loop.
  let current = MOVES[move] ? move : "idle";
  let blend = null;
  let last = null;
  const clock = new THREE.Timer();
  let frame = 0;
  let running = false;
  let nextBlink = 2;

  const render = () => {
    draw(MOVES[current](STILL_AT[current]), look, yaw, 0);
    renderer.render(scene, camera);
  };

  const tick = () => {
    clock.update();
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.getElapsed();

    let P = MOVES[current](t);
    if (blend) {
      const k = (t - blend.start) / 0.6;
      if (k >= 1) blend = null;
      else P = mix(blend.from, P, easeInOut(k));
    }
    last = P;

    look.x += (aim.x - look.x) * Math.min(1, dt * 4);
    look.y += (aim.y - look.y) * Math.min(1, dt * 4);
    if (!drag) {
      yaw += spin * dt;
      spin *= Math.exp(-dt * 4);
    }
    if (t > nextBlink + 0.16) nextBlink = t + 2.2 + Math.random() * 2.6;
    const blink = t > nextBlink ? Math.sin((Math.PI * (t - nextBlink)) / 0.16) : 0;

    draw(P, look, yaw, blink);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (running || still) return;
    running = true;
    clock.reset();
    frame = requestAnimationFrame(tick);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  const sizer = new ResizeObserver(() => {
    resize();
    if (still) render();
  });
  sizer.observe(container);
  resize();

  // Only animate while on screen.
  const seen = new IntersectionObserver(([entry]) =>
    entry.isIntersecting ? start() : pause(),
  );
  seen.observe(container);
  if (still) render();
  else window.addEventListener("pointermove", onPointer);

  return {
    setMove(name) {
      if (!MOVES[name] || name === current) return;
      if (last) blend = { from: last, start: clock.getElapsed() };
      current = name;
      if (still) render();
    },
    dispose() {
      pause();
      seen.disconnect();
      sizer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      scene.traverse((obj) => obj.isMesh && obj.geometry.dispose());
      Object.values(M).forEach((m) => m.dispose());
      blushMap.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
};
