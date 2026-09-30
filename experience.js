import * as THREE from 'three';
import { animate as motionAnimate, stagger, press } from 'https://cdn.jsdelivr.net/npm/motion@latest/+esm';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let worldStarted = false;
let activeCleanup = () => {};

function startWorld() {
  if (worldStarted || reducedMotion.matches) return;
  const canvas = document.querySelector('#world-canvas');
  if (!canvas) return;
  worldStarted = true;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setSize(innerWidth, innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 100);
  camera.position.z = 8;

  const geometry = new THREE.BufferGeometry();
  const count = innerWidth < 700 ? 420 : 950;
  const positions = new Float32Array(count * 3);
  const colours = new Float32Array(count * 3);
  const blue = new THREE.Color('#1688ff');
  const cyan = new THREE.Color('#55ddff');
  for (let index = 0; index < count; index += 1) {
    const radius = 4 + Math.random() * 9;
    const angle = Math.random() * Math.PI * 2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = (Math.random() - .5) * 11;
    positions[index * 3 + 2] = Math.sin(angle) * radius - 4;
    const colour = blue.clone().lerp(cyan, Math.random());
    colours.set([colour.r, colour.g, colour.b], index * 3);
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3));
  const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ size: .038, transparent: true, opacity: .72, vertexColors: true }));
  scene.add(stars);

  const rings = new THREE.Group();
  [2.2, 3.3, 4.5].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, .012 + index * .005, 8, 160),
      new THREE.MeshBasicMaterial({ color: index === 1 ? 0x55ddff : 0x1479ff, transparent: true, opacity: .13 })
    );
    ring.rotation.set(1.15 + index * .24, index * .6, index * .18);
    rings.add(ring);
  });
  rings.position.set(3.8, -.6, -2);
  scene.add(rings);

  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', event => {
    pointer.x = (event.clientX / innerWidth - .5) * 2;
    pointer.y = (event.clientY / innerHeight - .5) * 2;
  }, { passive: true });

  const clock = new THREE.Clock();
  function animate() {
    const time = clock.getElapsedTime();
    stars.rotation.y = time * .018;
    stars.rotation.x += (pointer.y * .035 - stars.rotation.x) * .015;
    rings.rotation.y = time * .035;
    camera.position.x += (pointer.x * .22 - camera.position.x) * .025;
    camera.position.y += (-pointer.y * .14 - camera.position.y) * .025;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

function addTilt(element) {
  const move = event => {
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    element.style.setProperty('--rx', `${-y * 8}deg`);
    element.style.setProperty('--ry', `${x * 10}deg`);
    element.style.setProperty('--mx', `${(x + .5) * 100}%`);
    element.style.setProperty('--my', `${(y + .5) * 100}%`);
  };
  const leave = () => { element.style.setProperty('--rx', '0deg'); element.style.setProperty('--ry', '0deg'); };
  element.addEventListener('pointermove', move);
  element.addEventListener('pointerleave', leave);
  return () => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave); };
}

export function enhanceExperience(screen) {
  startWorld();
  activeCleanup();
  const cleanup = [];
  const gsap = window.gsap;
  const glow = document.querySelector('.cursor-glow');
  const moveGlow = event => { if (glow) { glow.style.left = `${event.clientX}px`; glow.style.top = `${event.clientY}px`; } };
  addEventListener('pointermove', moveGlow, { passive: true });
  cleanup.push(() => removeEventListener('pointermove', moveGlow));

  if (!reducedMotion.matches) {
    document.querySelectorAll('.world-tile, .mission-deck, .card, .lesson, .cell-mission, .lab-panel').forEach(element => cleanup.push(addTilt(element)));
    if (gsap) {
      gsap.killTweensOf('.content > *');
      gsap.fromTo('.content > *', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .72, stagger: .075, ease: 'power3.out', clearProps: 'transform' });
      gsap.fromTo('.sidebar', { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: .65, ease: 'power3.out' });
      gsap.fromTo('.world-tile', { y: 44, scale: .94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .7, stagger: .055, delay: .14, ease: 'back.out(1.4)', clearProps: 'transform' });
      if (screen === 'dashboard') gsap.fromTo('.cell-scan', { scale: .72, rotate: -8, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1.1, ease: 'expo.out' });
    }
    motionAnimate('.nav button', { opacity: [0, 1], x: [-16, 0] }, { duration: .45, delay: stagger(.045), easing: 'ease-out' });
    motionAnimate('.player-strip > div', { opacity: [0, 1], y: [16, 0] }, { duration: .5, delay: stagger(.07), easing: [.22, 1, .36, 1] });
    const stopPress = press('button', element => {
      motionAnimate(element, { scale: .96 }, { type: 'spring', stiffness: 620, damping: 26 });
      return () => motionAnimate(element, { scale: 1 }, { type: 'spring', stiffness: 470, damping: 22 });
    });
    cleanup.push(stopPress);
  }
  activeCleanup = () => cleanup.forEach(dispose => dispose());
}

