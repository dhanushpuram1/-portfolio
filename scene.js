// 3D background: an original electric-scooter model that turns as you scroll.
(function () {
  if (typeof THREE === 'undefined') return;
  var canvas = document.getElementById('scene'), renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
  catch (e) { return; }
  document.body.classList.add('has3d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 1.2, 9);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c6b3, 0.9));
  var key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(4, 6, 5); scene.add(key);

  var lime = new THREE.MeshStandardMaterial({ color: 0xd5ff3f, roughness: 0.4, metalness: 0.1 }),
      dark = new THREE.MeshStandardMaterial({ color: 0x172018, roughness: 0.6 }),
      steel = new THREE.MeshStandardMaterial({ color: 0xb6c1b4, roughness: 0.3, metalness: 0.6 });
  function add(g, m, x, y, z, parent) { var o = new THREE.Mesh(g, m); o.position.set(x, y, z); (parent || bike).add(o); return o; }

  var bike = new THREE.Group(), wheels = [];
  [-1.35, 1.35].forEach(function (x) {
    var w = new THREE.Group(); w.position.set(x, 0.55, 0);
    var tyre = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.14, 16, 40), dark); w.add(tyre);
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 20), steel); hub.rotation.x = Math.PI / 2; w.add(hub);
    for (var i = 0; i < 3; i++) { var sp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.04), steel); sp.rotation.z = i * Math.PI / 3; w.add(sp); }
    bike.add(w); wheels.push(w);
  });
  add(new THREE.BoxGeometry(2.7, 0.14, 0.7), lime, 0, 0.62, 0);            // deck
  add(new THREE.BoxGeometry(1.6, 0.55, 0.62), lime, 0, 0.98, 0);           // body / battery
  add(new THREE.BoxGeometry(0.7, 0.2, 0.5), dark, 0.1, 1.3, 0);            // display housing
  var stem = add(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 12), steel, 1.45, 1.25, 0); stem.rotation.z = -0.22;
  var bar = add(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 12), dark, 1.58, 1.9, 0); bar.rotation.x = Math.PI / 2;
  add(new THREE.SphereGeometry(0.14, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xd5ff3f, emissiveIntensity: 0.8 }), 1.7, 1.6, 0);
  add(new THREE.BoxGeometry(0.9, 0.2, 0.8), dark, -0.9, 1.35, 0);          // seat
  bike.position.y = 0.1; scene.add(bike);

  var floor = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.26, 64), new THREE.MeshBasicMaterial({ color: 0x9aa795, side: THREE.DoubleSide }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.02; bike.add(floor);

  var dots = new THREE.Group(); // small orbiting nodes
  for (var i = 0; i < 14; i++) {
    var d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), i % 3 ? dark : lime), a = i / 14 * Math.PI * 2;
    d.position.set(Math.cos(a) * 3.1, 0.6 + Math.sin(a * 3) * 0.7, Math.sin(a) * 3.1); dots.add(d);
  }
  bike.add(dots);

  var mx = 0, my = 0, p = 0, cur = { x: 0, y: 0, s: 1, r: 0 };
  addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
  function size() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  addEventListener('resize', size); size();

  function frame(t) {
    var max = document.documentElement.scrollHeight - innerHeight; p = max > 0 ? scrollY / max : 0;
    var wide = innerWidth > 850, hero = Math.max(0, 1 - scrollY / (innerHeight * 0.8));
    var tx = wide ? 1.9 + (1 - hero) * 1.3 : 0, ty = wide ? 0 : 1.3 - (1 - hero) * 0.4, ts = (wide ? 1 : 0.7) * (0.55 + 0.45 * hero), tr = p * Math.PI * 3;
    var k = reduce ? 1 : 0.08;
    cur.x += (tx - cur.x) * k; cur.y += (ty - cur.y) * k; cur.s += (ts - cur.s) * k; cur.r += (tr - cur.r) * k;
    bike.position.set(cur.x, cur.y - 0.8, 0); bike.scale.setScalar(cur.s);
    bike.rotation.y = -0.6 + cur.r + (reduce ? 0 : mx * 0.8 + Math.sin(t / 2500) * 0.15);
    bike.rotation.x = reduce ? 0 : my * 0.12;
    if (!reduce) { wheels.forEach(function (w) { w.rotation.z -= 0.01; }); dots.rotation.y = t / 6000; }
    renderer.render(scene, camera);
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (reduce) { addEventListener('scroll', function () { requestAnimationFrame(frame); }, { passive: true }); addEventListener('resize', function () { requestAnimationFrame(frame); }); }
})();
