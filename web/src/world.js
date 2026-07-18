/* Summit & Stitch — clay scroll-world
   Procedural claymation diorama + damped scroll-scrubbed camera path.
   No GSAP/Lenis: a hand-rolled critically-damped scrub gives the same
   drifting feel with zero dependencies. */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('World');

  /* forms + nav work in both modes */
  var captureForm = document.getElementById('CaptureForm');
  if (captureForm) {
    captureForm.addEventListener('submit', function (e) {
      e.preventDefault();
      captureForm.hidden = true;
      document.getElementById('CaptureOk').hidden = false;
    });
  }
  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-goto]');
    if (!go) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: parseFloat(go.dataset.goto) * max, behavior: 'smooth' });
  });

  function enterStaticMode() {
    document.documentElement.classList.add('static-mode');
  }

  if (reduced || !window.THREE) { enterStaticMode(); return; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  } catch (e) {
    enterStaticMode(); return;
  }

  var isMobile = window.innerWidth < 640;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xEADFC9);

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xEADFC9, 38, 95);

  var camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 200);

  /* ------------------------------------------------------- palette --- */

  var C = {
    linen: 0xE7DCC2, wool: 0xDDD3BC, navy: 0x24354B, deepnavy: 0x1E2D40,
    slate: 0x46545D, brick: 0xA0473A, sage: 0x7A8C6E, pine: 0x5C7258,
    gold: 0xC4A267, cognac: 0x8A5A3B, earth: 0x6E4E36, snow: 0xF4EFE4,
    cream: 0xEFE7D3, charcoal: 0x2A3238
  };

  function clay(color) {
    return new THREE.MeshStandardMaterial({ color: color, roughness: 0.92, metalness: 0 });
  }

  /* ------------------------------------------------------ lighting --- */

  scene.add(new THREE.HemisphereLight(0xF2EDE3, 0xB89B72, 0.55));
  var sun = new THREE.DirectionalLight(0xFFE2B0, 2.0);
  sun.position.set(-14, 16, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  sun.shadow.camera.left = -30; sun.shadow.camera.right = 34;
  sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -20;
  sun.shadow.camera.far = 80;
  sun.shadow.bias = -0.0005;
  sun.shadow.radius = 4;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xF2EDE3, 0.32));

  /* ------------------------------------------------ geometry helpers --- */

  function roundedBox(w, h, d, r) {
    r = Math.min(r, w / 2 - 0.01, h / 2 - 0.01);
    var shape = new THREE.Shape();
    var x = -w / 2, y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r); shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
    var geo = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(d - r * 2, 0.05), bevelEnabled: true, bevelThickness: r,
      bevelSize: r * 0.9, bevelSegments: 3, curveSegments: 6
    });
    geo.center();
    return geo;
  }

  function mesh(geo, material, x, y, z, shadows) {
    var m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    if (shadows !== false) { m.castShadow = true; m.receiveShadow = true; }
    return m;
  }

  /* island: soft pudding lathe */
  function island(radius, depth, topColor, earthColor) {
    var g = new THREE.Group();
    var pts = [];
    var profile = [
      [0.0, 0], [0.62, 0], [0.86, -0.02], [0.97, -0.10], [1.0, -0.28],
      [0.94, -0.5], [0.72, -0.74], [0.42, -0.92], [0.0, -1.0]
    ];
    for (var i = 0; i < profile.length; i++) {
      pts.push(new THREE.Vector2(profile[i][0] * radius, profile[i][1] * depth));
    }
    var body = new THREE.Mesh(new THREE.LatheGeometry(pts, 44), clay(earthColor));
    body.receiveShadow = true;
    g.add(body);
    var top = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.985, radius * 0.985, 0.34, 44), clay(topColor));
    top.position.y = -0.03;
    top.receiveShadow = true;
    g.add(top);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.985, 0.17, 10, 44), clay(topColor));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.02;
    rim.receiveShadow = true;
    g.add(rim);
    return g;
  }

  function beanie(color, cuffColor, s) {
    s = s || 1;
    var g = new THREE.Group();
    var domeGeo = new THREE.SphereGeometry(0.42 * s, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55);
    g.add(mesh(domeGeo, clay(color), 0, 0, 0));
    var cuff = mesh(new THREE.TorusGeometry(0.34 * s, 0.1 * s, 10, 20), clay(cuffColor || color), 0, -0.02 * s, 0);
    cuff.rotation.x = Math.PI / 2;
    g.add(cuff);
    g.add(mesh(new THREE.SphereGeometry(0.11 * s, 10, 8), clay(C.cream), 0, 0.42 * s, 0));
    return g;
  }

  function pine(h, x, z) {
    var g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.5, 8), clay(C.cognac), 0, 0.25, 0));
    var tiers = [[0.62, 0.55], [0.5, 0.85], [0.36, 1.18]];
    for (var i = 0; i < tiers.length; i++) {
      g.add(mesh(new THREE.ConeGeometry(tiers[i][0] * h, 0.62 * h, 9), clay(C.pine), 0, tiers[i][1] * h, 0));
    }
    g.add(mesh(new THREE.SphereGeometry(0.09 * h, 8, 6), clay(C.snow), 0, 1.5 * h, 0));
    g.position.set(x, 0, z);
    return g;
  }

  function cloud(s, x, y, z) {
    var g = new THREE.Group();
    var m = clay(0xF6F1E5);
    g.add(mesh(new THREE.SphereGeometry(0.7 * s, 12, 10), m, 0, 0, 0, false));
    g.add(mesh(new THREE.SphereGeometry(0.5 * s, 12, 10), m, 0.7 * s, 0.12 * s, 0, false));
    g.add(mesh(new THREE.SphereGeometry(0.45 * s, 12, 10), m, -0.65 * s, 0.05 * s, 0.1, false));
    g.position.set(x, y, z);
    return g;
  }

  function figure(sweater, x, z, rotY) {
    var g = new THREE.Group();
    var body = mesh(new THREE.CapsuleGeometry(0.26, 0.34, 6, 12), clay(sweater), 0, 0.52, 0);
    g.add(body);
    g.add(mesh(new THREE.SphereGeometry(0.21, 14, 12), clay(0xD9B48F), 0, 1.05, 0));
    var hat = beanie(C.brick, C.brick, 0.62);
    hat.position.set(0, 1.14, 0);
    g.add(hat);
    var armGeo = new THREE.CapsuleGeometry(0.075, 0.3, 4, 8);
    var la = mesh(armGeo, clay(sweater), -0.3, 0.6, 0.14); la.rotation.z = 0.9; la.rotation.x = -0.5; g.add(la);
    var ra = mesh(armGeo, clay(sweater), 0.3, 0.6, 0.14); ra.rotation.z = -0.9; ra.rotation.x = -0.5; g.add(ra);
    g.position.set(x, 0, z);
    g.rotation.y = rotY || 0;
    return g;
  }

  /* ---------------------------------------------------- main island --- */

  var world = new THREE.Group();
  scene.add(world);

  var main = island(14, 7, C.sage, C.earth);
  world.add(main);

  /* peaks at the back */
  var peaks = [[-3.5, 6.5, -10, 3.2], [1.5, 8.5, -11.5, 3.9], [6, 5.2, -9.5, 2.6]];
  peaks.forEach(function (p) {
    world.add(mesh(new THREE.ConeGeometry(p[3], p[1], 10), clay(C.slate), p[0], p[1] / 2 - 0.2, p[2]));
    world.add(mesh(new THREE.ConeGeometry(p[3] * 0.45, p[1] * 0.42, 10), clay(C.snow), p[0], p[1] * 0.79, p[2]));
  });

  /* cabin */
  var cabin = new THREE.Group();
  cabin.add(mesh(roundedBox(3.4, 2.2, 2.8, 0.22), clay(C.cognac), 0, 1.1, 0));
  var roof = mesh(new THREE.ConeGeometry(2.9, 1.7, 4), clay(C.deepnavy), 0, 3.0, 0);
  roof.rotation.y = Math.PI / 4;
  cabin.add(roof);
  cabin.add(mesh(roundedBox(0.55, 0.9, 0.55, 0.1), clay(C.charcoal), 1.0, 3.35, -0.5));
  var door = mesh(roundedBox(0.7, 1.2, 0.12, 0.08), clay(C.brick), -0.7, 0.7, 1.44);
  cabin.add(door);
  var win = new THREE.Mesh(roundedBox(0.75, 0.75, 0.1, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xFFD98A, roughness: 0.6, emissive: 0xC4A267, emissiveIntensity: 0.9 }));
  win.position.set(0.8, 1.35, 1.44);
  cabin.add(win);
  var winLight = new THREE.PointLight(0xFFC46B, 6, 7);
  winLight.position.set(0.8, 1.4, 2.1);
  cabin.add(winLight);
  cabin.position.set(-3, 0, -2);
  cabin.rotation.y = 0.18;
  world.add(cabin);

  /* clothesline with the four colorways */
  var lineA = new THREE.Vector3(3.0, 0, 3.0), lineB = new THREE.Vector3(8.2, 0, 1.2);
  [lineA, lineB].forEach(function (p) {
    world.add(mesh(new THREE.CylinderGeometry(0.1, 0.13, 2.4, 8), clay(C.cognac), p.x, 1.2, p.z));
  });
  var sag = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(lineA.x, 2.32, lineA.z),
    new THREE.Vector3((lineA.x + lineB.x) / 2, 1.95, (lineA.z + lineB.z) / 2),
    new THREE.Vector3(lineB.x, 2.32, lineB.z)
  );
  world.add(mesh(new THREE.TubeGeometry(sag, 20, 0.025, 6), clay(C.charcoal), 0, 0, 0));
  var colorways = [
    [0xDDD3BC, 'linen'], [0x24354B, 'navy'], [0x46545D, 'slate'], [0xA0473A, 'brick']
  ];
  var hats = [];
  colorways.forEach(function (cw, i) {
    var t = 0.2 + i * 0.2;
    var p = sag.getPoint(t);
    var b = beanie(cw[0], cw[0], 1);
    b.position.set(p.x, p.y - 0.42, p.z);
    b.rotation.z = (i % 2 ? -1 : 1) * 0.12;
    world.add(b);
    hats.push(b);
  });

  /* yarn basket by the door */
  var basket = new THREE.Group();
  var bwall = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.55, 18, 1, true), clay(C.gold));
  bwall.material.side = THREE.DoubleSide;
  bwall.position.y = 0.28; bwall.castShadow = true;
  basket.add(bwall);
  var basketRim = mesh(new THREE.TorusGeometry(0.62, 0.07, 8, 18), clay(C.gold), 0, 0.56, 0);
  basketRim.rotation.x = Math.PI / 2;
  basket.add(basketRim);
  var yarnColors = [C.brick, 0x24354B, C.wool, C.sage, 0x46545D];
  yarnColors.forEach(function (yc, i) {
    var a = i * 1.4;
    basket.add(mesh(new THREE.SphereGeometry(0.2, 12, 10), clay(yc),
      Math.cos(a) * 0.26, 0.52 + (i % 2) * 0.13, Math.sin(a) * 0.26));
  });
  basket.position.set(-0.7, 0, 0.9);
  world.add(basket);

  /* bench with two knitting figures */
  var bench = new THREE.Group();
  bench.add(mesh(roundedBox(2.1, 0.16, 0.7, 0.06), clay(C.cognac), 0, 0.5, 0));
  bench.add(mesh(roundedBox(0.16, 0.5, 0.6, 0.05), clay(C.cognac), -0.85, 0.25, 0));
  bench.add(mesh(roundedBox(0.16, 0.5, 0.6, 0.05), clay(C.cognac), 0.85, 0.25, 0));
  bench.position.set(-4.6, 0, 2.6);
  bench.rotation.y = 0.5;
  world.add(bench);
  var f1 = figure(C.sage, -4.95, 2.75, 0.55); f1.scale.setScalar(0.85); f1.position.y = 0.42;
  var f2 = figure(0x24354B, -4.15, 2.5, 0.4); f2.scale.setScalar(0.85); f2.position.y = 0.42;
  world.add(f1); world.add(f2);

  /* pines */
  var pineSpots = [
    [-9.5, -5.5, 1.5], [-8, -7.5, 1.9], [-10.5, -2.5, 1.2], [-7, -4, 1.0],
    [9, -4.5, 1.7], [10.5, -2, 1.2], [8, -6.5, 1.3], [-11, 1.5, 1.0],
    [11, 2.5, 1.1], [5.5, -7.5, 1.6]
  ];
  pineSpots.forEach(function (p, i) {
    if (isMobile && i % 2) return;
    world.add(pine(p[2], p[0], p[1]));
  });

  /* market stall island */
  var marketIsle = new THREE.Group();
  marketIsle.add(island(5, 3.5, C.sage, C.earth));
  var stall = new THREE.Group();
  stall.add(mesh(roundedBox(2.6, 0.14, 1.2, 0.05), clay(C.cognac), 0, 0.85, 0));
  [[-1.1, -0.45], [1.1, -0.45], [-1.1, 0.45], [1.1, 0.45]].forEach(function (l) {
    stall.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.85, 8), clay(C.cognac), l[0], 0.42, l[1]));
  });
  [[-1.25, -0.55], [1.25, -0.55], [-1.25, 0.55], [1.25, 0.55]].forEach(function (l) {
    stall.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8), clay(C.cognac), l[0], 1.15, l[1]));
  });
  var awning = mesh(roundedBox(3.0, 0.12, 1.7, 0.05), clay(C.brick), 0, 2.35, 0);
  awning.rotation.x = -0.12;
  stall.add(awning);
  [[-0.8, 0.2, 0xDDD3BC], [0, 0.05, 0x24354B], [0.8, 0.25, 0xA0473A], [0.35, -0.3, 0x46545D]].forEach(function (b) {
    var hb = beanie(b[2], b[2], 0.55);
    hb.position.set(b[0], 1.05, b[1]);
    stall.add(hb);
  });
  stall.add(mesh(roundedBox(0.7, 0.5, 0.55, 0.07), clay(C.gold), -1.6, 0.25, 0.4));
  marketIsle.add(stall);
  marketIsle.position.set(22, -2.2, 6);
  marketIsle.rotation.y = -0.4;
  world.add(marketIsle);

  /* clouds */
  var clouds = [];
  if (!isMobile) {
    [[1.6, -12, 8, -8], [1.1, 10, 10, -12], [1.3, 16, 7, 12], [0.9, -6, 11, 6]].forEach(function (c) {
      var cl = cloud(c[0], c[1], c[2], c[3]);
      world.add(cl);
      clouds.push(cl);
    });
  }

  /* ------------------------------------------------- camera path --- */

  var KEYS = [
    { t: 0.00, pos: [7, 8.5, 31], look: [3, 1.5, 0] },
    { t: 0.17, pos: [-1.6, 3.3, 8.6], look: [-3, 1.7, -2] },
    { t: 0.33, pos: [5.6, 2.3, 8.2], look: [5.6, 1.7, 2.1] },
    { t: 0.50, pos: [-0.2, 1.9, 4.4], look: [-0.7, 0.7, 0.9] },
    { t: 0.64, pos: [0, 9.5, 11], look: [1, 4.5, -10] },
    { t: 0.78, pos: [22.5, 2.6, 13.5], look: [22, 0.6, 6] },
    { t: 0.90, pos: [-3.4, 1.9, 6.4], look: [-4.7, 1.1, 2.6] },
    { t: 1.00, pos: [9, 10, 33], look: [4, 1.5, 0] }
  ];

  var vPos = new THREE.Vector3(), vLook = new THREE.Vector3();
  var a3 = new THREE.Vector3(), b3 = new THREE.Vector3();

  function ease(t) { return t * t * (3 - 2 * t); }

  function sampleCam(p) {
    p = Math.min(Math.max(p, 0), 1);
    var i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].t) i++;
    var k0 = KEYS[i], k1 = KEYS[i + 1];
    var local = ease((p - k0.t) / (k1.t - k0.t));
    a3.fromArray(k0.pos); b3.fromArray(k1.pos); vPos.lerpVectors(a3, b3, local);
    a3.fromArray(k0.look); b3.fromArray(k1.look); vLook.lerpVectors(a3, b3, local);
    camera.position.copy(vPos);
    camera.lookAt(vLook);
  }

  /* -------------------------------------------------- scroll scrub --- */

  var sections = [].slice.call(document.querySelectorAll('.section'));
  var rail = document.getElementById('RailFill');
  var target = 0, current = 0;

  function readScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    target = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener('scroll', readScroll, { passive: true });
  readScroll();

  function updateOverlay(p) {
    var F = 0.035;
    sections.forEach(function (s) {
      var tin = parseFloat(s.dataset.in), tout = parseFloat(s.dataset.out);
      var o = 0;
      if (p > tin - F && p < tout + F) {
        o = Math.min((p - (tin - F)) / F, 1, ((tout + F) - p) / F);
        o = Math.max(0, Math.min(1, o));
      }
      s.style.opacity = o.toFixed(3);
      s.style.visibility = o > 0.01 ? 'visible' : 'hidden';
    });
    if (rail) rail.style.height = (p * 100).toFixed(1) + '%';
  }

  var clock = new THREE.Clock();

  function frame() {
    var dt = Math.min(clock.getDelta(), 0.05);
    current += (target - current) * Math.min(1, dt * 3.2);
    sampleCam(current);

    var t = clock.elapsedTime;
    world.position.y = Math.sin(t * 0.5) * 0.12;
    marketIsle.position.y = -2.2 + Math.sin(t * 0.6 + 2) * 0.18;
    hats.forEach(function (h, i) { h.rotation.z = Math.sin(t * 0.9 + i) * 0.09; });
    clouds.forEach(function (c, i) {
      c.position.x += dt * (0.14 + i * 0.03);
      if (c.position.x > 30) c.position.x = -30;
    });

    updateOverlay(current);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* overlay sections stay transparent to drags; only CTAs are clickable */
  document.querySelectorAll('.section .button, .section input, .section form').forEach(function (el) {
    el.style.pointerEvents = 'auto';
  });
})();
