import * as THREE from "three";
import CameraControls from "camera-controls";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// The 3D world on /map3d (see World3D.jsx): a floating island with one area per Appro
// route (a park, a bar street and a city), each holding that route's checkpoints.
// Loaded on demand so three.js stays out of the main bundle.
//
// createWorldScene(container, { still, onSelect }) adds a canvas to `container` and
// returns:
//   focus(selection)    fly the camera to { district, checkpoint } (null: the whole map)
//   setLabel(key, el)   keep an HTML element pinned over a spot ("inNature", "inNature:3",
//                       "inNature:meet"); el = null stops tracking it
//   zoom(step)          zoom in (+1) or out (-1)
//   dispose()
// onSelect({ district, checkpoint }) is called when an area or a pin is clicked.
// still: no camera flights or bobbing (prefers-reduced-motion).

CameraControls.install({ THREE });

const TAU = Math.PI * 2;

// --- Layout, in world units on the ground (x right, z toward the viewer).
// stops: the route's checkpoints in order; meet: its meeting point.
export const DISTRICTS = {
  inNature: {
    center: [-15, 5],
    radius: 36,
    meet: [-15, -7],
    stops: [
      [-22, 1],
      [-15, -2],
      [-8, 1],
      [-7, 8],
      [-12, 14],
      [-19, 13],
      [-15, 7],
    ],
  },
  barCrawl: {
    center: [15, 8],
    radius: 38,
    meet: [15, 22],
    // Bars alternate sides of the street (x = 15), from the north end down.
    stops: Array.from({ length: 7 }, (_, i) => [i % 2 ? 17.2 : 12.8, 18 - i * 3.6]),
  },
  cityHopper: {
    center: [0, -17],
    radius: 40,
    meet: [0, -8],
    stops: [
      [-14, -12],
      [-8, -21],
      [-2, -13],
      [5, -21],
      [15, -19],
      [-18, -21],
      [8, -12],
    ],
  },
};

const ISLAND_RADIUS = 35;
const OVERVIEW = { target: [0, 0, -1], radius: 86, polar: 0.8 };
const PIN_TOP = 2.4; // where a pin's label sits
const STOP_RADIUS = 24; // camera distance when one checkpoint is selected

const token = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Small seeded random, so trees land in the same spots on every visit.
const random = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

export const createWorldScene = (container, { still = false, onSelect }) => {
  // --- Renderer, scene, camera.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  const canvas = renderer.domElement;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 400);

  scene.add(new THREE.HemisphereLight(0xfff7ee, 0x8a7360, 1.3));
  const sun = new THREE.DirectionalLight(0xfff0e0, 2.1);
  sun.position.set(-30, 50, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 140 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  // --- Materials: matte, flat colours from the theme (see --world-* in App.css).
  const materials = new Map();
  const matte = (color) => {
    if (!materials.has(color)) {
      materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.92 }));
    }
    return materials.get(color);
  };
  const C = {
    ground: token("--world-ground"),
    side: token("--world-side"),
    grass: token("--world-grass"),
    tree: token("--world-tree"),
    treeLight: token("--world-tree-light"),
    trunk: token("--world-trunk"),
    water: token("--world-water"),
    road: token("--world-road"),
    paving: token("--world-paving"),
    wall: token("--world-wall"),
    door: token("--world-door"),
    window: token("--world-window"),
    pin: token("--world-pin"),
    meet: token("--world-meet"),
    accents: ["--world-accent-a", "--world-accent-b", "--world-accent-c", "--world-accent-d", "--world-accent-e"].map(token),
  };
  const hidden = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  const flagMaterial = new THREE.MeshStandardMaterial({ color: C.meet, roughness: 0.92, side: THREE.DoubleSide });

  // --- Building blocks.
  const geometries = [];
  const keep = (geometry) => (geometries.push(geometry), geometry);
  const mesh = (geometry, material, parent, { x = 0, y = 0, z = 0, shadow = true } = {}) => {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const box = (w, h, d, r = 0.12) => keep(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)));
  const flat = (w, d) => keep(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2));
  // Hard edges (one normal per face), for shapes with few sides.
  const flatShaded = (geometry) => {
    const flat = geometry.toNonIndexed();
    flat.computeVertexNormals();
    geometry.dispose();
    return flat;
  };
  const disc = (r) => keep(new THREE.CircleGeometry(r, 48).rotateX(-Math.PI / 2));

  // A path on the ground between two points.
  const path = (parent, [x1, z1], [x2, z2], width = 1.6, color = C.road) => {
    const length = Math.hypot(x2 - x1, z2 - z1);
    const m = mesh(flat(width, length + width), matte(color), parent, {
      x: (x1 + x2) / 2, y: 0.02, z: (z1 + z2) / 2, shadow: false,
    });
    m.rotation.y = Math.atan2(x2 - x1, z2 - z1);
  };

  // A house with a pitched roof, its door facing +z before `turn` is applied.
  const house = (parent, { x, z, w = 3.4, d = 3, h = 2.6, wall = C.wall, roof, awning, turn = 0 }) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = turn;
    parent.add(g);
    mesh(box(w, h, d), matte(wall), g, { y: h / 2 });
    const cone = keep(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4));
    const top = mesh(cone, matte(roof), g, { y: h + 0.55 });
    top.scale.set(w * 1.08, 1.1, d * 1.1);
    mesh(box(0.8, 1.3, 0.12, 0.05), matte(C.door), g, { y: 0.65, z: d / 2 });
    [-1, 1].forEach((s) => mesh(box(0.6, 0.6, 0.1, 0.05), matte(C.window), g, { x: s * w * 0.3, y: h * 0.62, z: d / 2 }));
    if (awning) {
      const a = mesh(box(w * 0.7, 0.12, 0.9, 0.05), matte(awning), g, { y: 1.65, z: d / 2 + 0.4 });
      a.rotation.x = 0.28;
    }
    return g;
  };

  const trunkGeometry = keep(new THREE.CylinderGeometry(0.14, 0.2, 1, 8).translate(0, 0.5, 0));
  const crownGeometry = keep(new THREE.IcosahedronGeometry(0.85, 1).translate(0, 1.6, 0));
  const treeSpots = [];
  const tree = (x, z, size = 1, light = false) => treeSpots.push({ x, z, size, light });

  // --- The island.
  const world = new THREE.Group();
  scene.add(world);
  const island = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(ISLAND_RADIUS, ISLAND_RADIUS - 2.5, 3, 96)),
    [matte(C.side), matte(C.ground), matte(C.side)],
  );
  island.position.y = -1.5;
  island.receiveShadow = true;
  world.add(island);

  // Paths from a small square in the middle to each area.
  const square = [1, 1];
  path(world, square, DISTRICTS.inNature.meet);
  path(world, square, DISTRICTS.cityHopper.meet);
  path(world, square, [15, -5]);
  mesh(disc(2.6), matte(C.paving), world, { x: square[0], y: 0.03, z: square[1], shadow: false });
  mesh(keep(new THREE.CylinderGeometry(1.1, 1.3, 0.5, 32)), matte(C.side), world, { x: square[0], y: 0.25, z: square[1] });
  mesh(keep(new THREE.CylinderGeometry(0.85, 0.85, 0.1, 32)), matte(C.water), world, { x: square[0], y: 0.52, z: square[1], shadow: false });

  // --- Areas. Every mesh inside an area group can be clicked to fly there.
  const districts = {};
  const pins = [];
  const anchors = {};

  const area = (id) => {
    const g = new THREE.Group();
    g.userData.pick = { district: id, checkpoint: null };
    world.add(g);
    const { center, stops, meet } = DISTRICTS[id];
    districts[id] = { group: g, center: new THREE.Vector3(center[0], 0, center[1]) };
    anchors[id] = new THREE.Vector3(center[0], 7, center[1]);
    stops.forEach(([x, z], i) => pin(g, id, i, x, z));
    flag(g, id, meet[0], meet[1]);
    return g;
  };

  const pinHead = keep(new THREE.SphereGeometry(0.42, 24, 16));
  const pinTip = keep(new THREE.ConeGeometry(0.3, 0.7, 20).rotateX(Math.PI));
  const pinBase = disc(0.6);
  const hitGeometry = keep(new THREE.SphereGeometry(1.1, 8, 6));

  // A checkpoint: a round pin that bobs over its spot.
  function pin(parent, district, checkpoint, x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.userData.pick = { district, checkpoint };
    parent.add(g);
    mesh(pinBase, matte(C.side), g, { y: 0.04, shadow: false });
    const head = new THREE.Group();
    g.add(head);
    mesh(pinTip, matte(C.pin), head, { y: 1.05 });
    mesh(pinHead, matte(C.pin), head, { y: 1.65 });
    mesh(hitGeometry, hidden, g, { y: 1.3, shadow: false });
    pins.push({ key: `${district}:${checkpoint}`, district, checkpoint, head, scale: 1, phase: pins.length * 0.9 });
    anchors[`${district}:${checkpoint}`] = new THREE.Vector3(x, PIN_TOP, z);
  }

  // The meeting point: a flag.
  function flag(parent, district, x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.userData.pick = { district, checkpoint: "meet" };
    parent.add(g);
    mesh(pinBase, matte(C.side), g, { y: 0.04, shadow: false });
    mesh(keep(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8)), matte(C.trunk), g, { y: 1.2 });
    const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(1.1, -0.35), new THREE.Vector2(0, -0.7)]);
    mesh(keep(new THREE.ShapeGeometry(shape)), flagMaterial, g, { x: 0.06, y: 2.35 });
    mesh(hitGeometry, hidden, g, { y: 1.3, shadow: false });
    anchors[`${district}:meet`] = new THREE.Vector3(x, 2.7, z);
  }

  // Park: an oval of grass with a pond and trees between the games.
  const park = area("inNature");
  const grass = mesh(disc(1), matte(C.grass), park, { x: -15, y: 0.02, z: 5, shadow: false });
  grass.scale.set(12, 1, 11);
  mesh(disc(2.1), matte(C.water), park, { x: -19.5, y: 0.04, z: 7, shadow: false });
  {
    const rand = random(7);
    const avoid = [...DISTRICTS.inNature.stops, [-19.5, 7]];
    for (let n = 0; n < 220 && treeSpots.length < 24; n++) {
      const a = rand() * TAU;
      const r = Math.sqrt(rand()) * 0.92;
      const x = -15 + Math.cos(a) * r * 12;
      const z = 5 + Math.sin(a) * r * 11;
      if (avoid.some(([ax, az]) => Math.hypot(x - ax, z - az) < 2.6)) continue;
      if (treeSpots.some((t) => Math.hypot(x - t.x, z - t.z) < 1.5)) continue;
      tree(x, z, 0.8 + rand() * 0.5, rand() > 0.5);
    }
  }

  // Bar street: a road with a bar on either side, each with its own coloured awning.
  const bars = area("barCrawl");
  mesh(flat(7.5, 28), matte(C.paving), bars, { x: 15, y: 0.02, z: 7.5, shadow: false });
  mesh(flat(2.6, 28), matte(C.road), bars, { x: 15, y: 0.03, z: 7.5, shadow: false });
  DISTRICTS.barCrawl.stops.forEach(([x, z], i) => {
    const left = x < 15;
    house(bars, {
      x: left ? 9.9 : 20.1,
      z,
      w: 3.2,
      d: 3.2,
      h: 2.4 + (i % 3) * 0.7,
      roof: C.accents[(i + 2) % 5],
      awning: C.accents[i % 5],
      turn: left ? Math.PI / 2 : -Math.PI / 2,
    });
  });

  // City: a paved quarter with a market, a museum, two small parks, a restaurant and bars.
  const city = area("cityHopper");
  const plaza = mesh(box(42, 0.06, 19, 0.03), matte(C.paving), city, { x: -1, y: 0.03, z: -17, shadow: false });
  plaza.receiveShadow = true;
  path(city, [-20, -16.5], [18, -16.5], 1.8);
  const [market, trattoria, taproom, museum, eastPark, westPark, cocktails] = DISTRICTS.cityHopper.stops;
  // Old Market: three stalls with striped roofs.
  [-2.2, 0, 2.2].forEach((dx, i) => {
    const g = new THREE.Group();
    g.position.set(market[0] + dx, 0, market[1] - 2.2);
    city.add(g);
    mesh(box(1.7, 0.9, 1.1, 0.06), matte(C.wall), g, { y: 0.45 });
    const roof = mesh(box(1.9, 0.1, 1.4, 0.04), matte(C.accents[i]), g, { y: 1.5 });
    roof.rotation.x = 0.25;
    [-0.8, 0.8].forEach((px) => mesh(keep(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6)), matte(C.trunk), g, { x: px, y: 0.75, z: 0.5 }));
  });
  house(city, { x: trattoria[0], z: trattoria[1] - 2.6, roof: C.accents[1], awning: C.accents[0] });
  house(city, { x: taproom[0], z: taproom[1] - 2.6, h: 3.2, roof: C.accents[4], awning: C.accents[2] });
  house(city, { x: cocktails[0], z: cocktails[1] - 2.6, h: 3.6, roof: C.accents[0], awning: C.accents[3] });
  // City Museum: a wide hall with columns and a pediment.
  {
    const g = new THREE.Group();
    g.position.set(museum[0], 0, museum[1] - 3);
    city.add(g);
    mesh(box(7, 0.4, 4.4, 0.06), matte(C.side), g, { y: 0.2 });
    mesh(box(6.2, 2.8, 3, 0.08), matte(C.wall), g, { y: 1.8, z: -0.4 });
    const column = keep(new THREE.CylinderGeometry(0.2, 0.22, 2.6, 12));
    for (let i = 0; i < 6; i++) mesh(column, matte(C.wall), g, { x: -2.6 + i * 1.04, y: 1.7, z: 1.6 });
    mesh(box(6.8, 0.3, 4, 0.06), matte(C.side), g, { y: 3.15 });
    // A three-sided prism lying along z, its point up.
    const pediment = mesh(keep(flatShaded(new THREE.CylinderGeometry(1, 1, 1, 3).rotateX(-Math.PI / 2))), matte(C.wall), g, { y: 3.63 });
    pediment.scale.set(3.9, 0.67, 3.4);
  }
  // East and West Park: round lawns with a few trees.
  [eastPark, westPark].forEach(([x, z], k) => {
    mesh(disc(3.2), matte(C.grass), city, { x, y: 0.07, z, shadow: false });
    [[-1.8, -1.6], [1.9, -1.2], [0.4, -2.3], [-1.5, 1.7]].forEach(([dx, dz], i) => tree(x + dx, z + dz, 0.85, (i + k) % 2 === 0));
  });

  // A few trees around the edge of the island, outside the areas.
  {
    const rand = random(31);
    const start = treeSpots.length;
    for (let n = 0; n < 400 && treeSpots.length < start + 40; n++) {
      const a = rand() * TAU;
      const r = ISLAND_RADIUS - 1.5 - rand() * 5;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const inPark = ((x + 15) / 13) ** 2 + ((z - 5) / 12) ** 2 < 1;
      const inBars = x > 8 && x < 22 && z > -7 && z < 23;
      const inCity = x > -23 && x < 21 && z > -27.5 && z < -7;
      if (inPark || inBars || inCity) continue;
      if (treeSpots.some((t) => Math.hypot(x - t.x, z - t.z) < 1.6)) continue;
      tree(x, z, 0.8 + rand() * 0.6, rand() > 0.5);
    }
  }

  // All trees as two instanced meshes per shade, so they draw in a few calls.
  {
    const matrix = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const trunks = new THREE.InstancedMesh(trunkGeometry, matte(C.trunk), treeSpots.length);
    const crowns = [false, true].map((light) => {
      const count = treeSpots.filter((t) => t.light === light).length;
      return new THREE.InstancedMesh(crownGeometry, matte(light ? C.treeLight : C.tree), count);
    });
    const used = [0, 0];
    treeSpots.forEach(({ x, z, size, light }, i) => {
      const s = new THREE.Vector3(size, size, size);
      matrix.compose(new THREE.Vector3(x, 0, z), q, s);
      trunks.setMatrixAt(i, matrix);
      crowns[light ? 1 : 0].setMatrixAt(used[light ? 1 : 0]++, matrix);
    });
    [trunks, ...crowns].forEach((m) => {
      m.castShadow = true;
      m.receiveShadow = true;
      world.add(m);
    });
  }

  // --- Camera controls: drag to move (like a map), right-drag or two fingers to turn,
  // scroll or pinch to zoom.
  const controls = new CameraControls(camera, canvas);
  const A = CameraControls.ACTION;
  controls.mouseButtons.left = A.TRUCK;
  controls.mouseButtons.right = A.ROTATE;
  controls.mouseButtons.wheel = A.DOLLY;
  controls.touches.one = A.TOUCH_TRUCK;
  controls.touches.two = A.TOUCH_DOLLY_ROTATE;
  controls.touches.three = A.TOUCH_ROTATE;
  controls.verticalDragToForward = true;
  controls.dollyToCursor = true;
  controls.minDistance = 7;
  controls.maxDistance = 130;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = 1.2;
  controls.smoothTime = still ? 0 : 0.45;
  controls.draggingSmoothTime = still ? 0 : 0.12;
  controls.setBoundary(new THREE.Box3(new THREE.Vector3(-30, 0, -30), new THREE.Vector3(30, 0, 30)));

  // Narrow (portrait) boxes need the camera further back to fit the same area.
  const fit = (radius) => radius * Math.max(1, 1.25 / camera.aspect) ** 0.75;
  const view = (target, radius, polar, azimuth = controls.azimuthAngle, smooth = !still) => {
    const p = new THREE.Vector3().setFromSpherical(new THREE.Spherical(fit(radius), polar, azimuth)).add(target);
    return controls.setLookAt(p.x, p.y, p.z, target.x, target.y, target.z, smooth);
  };
  // Tall (portrait) boxes look down more steeply, so the island fills more of the height.
  const overview = (smooth) => {
    const polar = camera.aspect < 1 ? OVERVIEW.polar - 0.25 : OVERVIEW.polar;
    return view(new THREE.Vector3(...OVERVIEW.target), OVERVIEW.radius, polar, 0, smooth);
  };

  // On wide screens the panel covers the map's left side (see .world-panel, 900px in
  // layout.css), so the camera looks a little to its right.
  const shift = (radius) => {
    const side = width > 900 && selected ? -fit(radius) * 0.16 : 0;
    controls.setFocalOffset(side, 0, 0, !still);
  };

  let selected = null;
  const focus = (selection) => {
    selected = selection?.district ? selection : null;
    if (!selected) {
      shift(0);
      return overview(!still);
    }
    const d = DISTRICTS[selected.district];
    const { checkpoint } = selected;
    if (checkpoint === null || checkpoint === undefined) {
      shift(d.radius);
      return view(districts[selected.district].center, d.radius, 0.82);
    }
    const [x, z] = checkpoint === "meet" ? d.meet : d.stops[checkpoint];
    shift(STOP_RADIUS);
    return view(new THREE.Vector3(x, 0.8, z), STOP_RADIUS, 0.9);
  };

  // --- Picking: a click (not a drag) on an area or a pin selects it.
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const pickAt = (event) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - r.left) / r.width) * 2 - 1, -((event.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    for (const hit of raycaster.intersectObject(world, true)) {
      for (let o = hit.object; o; o = o.parent) if (o.userData.pick) return o.userData.pick;
    }
    return null;
  };
  let press = null;
  let hovered = null;
  const onDown = (event) => {
    press = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };
  const onUp = (event) => {
    if (!press || press.id !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - press.x, event.clientY - press.y);
    press = null;
    if (moved > 6) return;
    const pick = pickAt(event);
    if (pick) onSelect?.(pick);
  };
  const onHover = (event) => {
    if (event.pointerType !== "mouse" || event.buttons) return;
    const pick = pickAt(event);
    hovered = pick && pick.checkpoint !== null ? `${pick.district}:${pick.checkpoint}` : null;
    canvas.style.cursor = pick ? "pointer" : "";
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointermove", onHover);

  // --- Labels: HTML elements kept over their spot in the scene.
  const labels = new Map();
  const projected = new THREE.Vector3();
  let width = 1;
  let height = 1;
  const placeLabels = () => {
    labels.forEach((el, key) => {
      projected.copy(anchors[key]).project(camera);
      const off = projected.z > 1 || Math.abs(projected.x) > 1.2 || Math.abs(projected.y) > 1.2;
      el.style.visibility = off ? "hidden" : "";
      if (off) return;
      const x = ((projected.x + 1) / 2) * width;
      const y = ((1 - projected.y) / 2) * height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
  };

  // --- Size.
  const resize = () => {
    const box = container.getBoundingClientRect();
    if (!box.width || !box.height) return;
    width = box.width;
    height = box.height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  // --- Loop.
  const clock = new THREE.Timer();
  let frame = 0;
  let running = false;
  const tick = () => {
    clock.update();
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.getElapsed();
    controls.update(dt);
    pins.forEach((p) => {
      const isSelected = selected && p.district === selected.district && p.checkpoint === selected.checkpoint;
      const target = isSelected ? 1.45 : p.key === hovered ? 1.2 : 1;
      p.scale += (target - p.scale) * Math.min(1, dt * 10);
      p.head.scale.setScalar(p.scale);
      p.head.position.y = still ? 0 : Math.sin(t * 2.2 + p.phase) * 0.12 + (isSelected ? 0.25 : 0);
    });
    placeLabels();
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (running) return;
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
    if (!selected) overview(false);
  });
  sizer.observe(container);
  resize();

  // Start high above, then glide down to the whole map.
  view(new THREE.Vector3(...OVERVIEW.target), OVERVIEW.radius * 1.5, 0.35, -0.6, false);
  overview(!still);

  // Only draw while on screen.
  const seen = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : pause()));
  seen.observe(container);

  return {
    focus,
    setLabel(key, el) {
      if (el && anchors[key]) labels.set(key, el);
      else labels.delete(key);
    },
    zoom(step) {
      controls.dolly(controls.distance * 0.3 * step, !still);
    },
    dispose() {
      pause();
      seen.disconnect();
      sizer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointermove", onHover);
      controls.dispose();
      scene.traverse((o) => o.isInstancedMesh && o.dispose());
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      hidden.dispose();
      flagMaterial.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
};
