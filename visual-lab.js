import * as THREE from 'https://unpkg.com/three@0.181.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.181.1/examples/jsm/controls/OrbitControls.js';

const models = {
  Biology: { label: 'Animal cell explorer', description: 'A simplified cell model. Drag around it and identify the cell membrane, nucleus and mitochondria.', type: 'cell', colour: 0x38d996 },
  Mathematics: { label: 'Geometry explorer', description: 'A rotating geometric solid. Use it to think about faces, edges, vertices and transformations.', type: 'geometry', colour: 0x4db5ff },
  'Computer Science': { label: 'Data network explorer', description: 'Nodes and connections represent how data can move through a computer system or network.', type: 'network', colour: 0xa78bfa },
  Physics: { label: 'Forces and orbit explorer', description: 'The orbiting body is a visual reminder that physics uses forces and motion to describe change.', type: 'orbit', colour: 0xffc857 },
  Chemistry: { label: 'Molecule explorer', description: 'This ball-and-stick model represents atoms joining through chemical bonds.', type: 'molecule', colour: 0xff6b8a },
  'Additional Maths': { label: 'Function surface explorer', description: 'This moving surface is a visual way to think about inputs, outputs and mathematical relationships.', type: 'surface', colour: 0x57d7ff },
  Accounting: { label: 'Balance explorer', description: 'The balanced blocks represent the careful matching and checking used in accounting records.', type: 'balance', colour: 0x5eead4 },
  Economics: { label: 'Market explorer', description: 'The rising and falling bars represent how supply, demand and choices can change a market.', type: 'market', colour: 0xfbbf24 },
  'Business Studies': { label: 'Business system explorer', description: 'The connected parts represent people, operations, finance and customers working together.', type: 'network', colour: 0x60a5fa },
  English: { label: 'Story structure explorer', description: 'The layered pages represent how words, ideas, evidence and structure work together in writing.', type: 'book', colour: 0xf472b6 }
};

function material(colour, wireframe = false) {
  return new THREE.MeshStandardMaterial({ color: colour, metalness: .25, roughness: .38, wireframe });
}

function addLabel(group, text, position) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = '#07111f'; context.fillRect(0, 0, 512, 128);
  context.fillStyle = '#f8fbff'; context.font = 'bold 38px Arial'; context.textAlign = 'center';
  context.fillText(text, 256, 76);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
  sprite.scale.set(2.7, .68, 1); sprite.position.copy(position); group.add(sprite);
}

function createModel(model) {
  const group = new THREE.Group();
  const accent = material(model.colour);
  const dark = material(0x17335c);

  if (model.type === 'cell') {
    group.add(new THREE.Mesh(new THREE.SphereGeometry(2.4, 40, 28), new THREE.MeshPhysicalMaterial({ color: 0x73ddb0, transparent: true, opacity: .32, roughness: .2, transmission: .15 })));
    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(.75, 28, 20), material(0xa78bfa)); nucleus.position.set(-.35, .25, .25); group.add(nucleus);
    for (let index = 0; index < 7; index += 1) { const mitochondrion = new THREE.Mesh(new THREE.TorusGeometry(.28, .12, 12, 20), accent); mitochondrion.position.set(Math.sin(index * 2.1) * 1.45, Math.cos(index * 1.4) * 1.1, Math.cos(index * .9) * 1.25); mitochondrion.rotation.set(index, index * .8, 0); group.add(mitochondrion); }
    addLabel(group, 'cell membrane', new THREE.Vector3(0, 2.9, 0));
  } else if (model.type === 'molecule' || model.type === 'orbit') {
    const centre = new THREE.Mesh(new THREE.SphereGeometry(.72, 28, 20), accent); group.add(centre);
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.7, .035, 8, 80), dark); orbit.rotation.x = Math.PI / 2.6; group.add(orbit);
    const electron = new THREE.Mesh(new THREE.SphereGeometry(.25, 20, 16), material(0xf8fbff)); electron.name = 'orbiter'; electron.userData.radius = 1.7; group.add(electron);
    if (model.type === 'molecule') { [-1.5, 1.5].forEach((x, index) => { const atom = new THREE.Mesh(new THREE.SphereGeometry(.55, 24, 18), material(index ? 0x9bc7ff : 0xf8fbff)); atom.position.x = x; group.add(atom); }); }
  } else if (model.type === 'network') {
    const points = [[0, 0, 0], [1.5, .6, .4], [-1.4, .8, -.3], [.8, -1.3, -.6], [-.9, -1.2, .7]];
    points.forEach(point => { const node = new THREE.Mesh(new THREE.IcosahedronGeometry(.35, 1), accent); node.position.set(...point); group.add(node); });
    points.slice(1).forEach(point => { const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(...point)]); group.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: model.colour }))); });
  } else if (model.type === 'market' || model.type === 'balance') {
    [-1.2, 0, 1.2].forEach((x, index) => { const height = model.type === 'market' ? [1.1, 2.2, 1.65][index] : 1.5; const block = new THREE.Mesh(new THREE.BoxGeometry(.75, height, .75), index === 1 ? accent : dark); block.position.set(x, height / 2 - .8, 0); group.add(block); });
    group.add(new THREE.Mesh(new THREE.BoxGeometry(4.4, .15, .8), material(0xf8fbff)).translateY(-.85));
  } else if (model.type === 'book') {
    for (let index = 0; index < 7; index += 1) { const page = new THREE.Mesh(new THREE.BoxGeometry(3.1, .08, 2), index % 2 ? accent : material(0xf8fbff)); page.position.set(0, (index - 3) * .12, 0); page.rotation.y = (index - 3) * .04; group.add(page); }
  } else {
    const shape = model.type === 'surface' ? new THREE.TorusKnotGeometry(1.25, .38, 140, 20) : new THREE.IcosahedronGeometry(1.65, 2);
    group.add(new THREE.Mesh(shape, accent));
    group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.05, 1), material(model.colour, true)));
  }
  return group;
}

export function mountStudyModel(container, subject, descriptionNode) {
  const model = models[subject] || models.Biology;
  descriptionNode.textContent = `${model.label}: ${model.description}`;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth || 620, 420); container.replaceChildren(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, (container.clientWidth || 620) / 420, .1, 100); camera.position.set(0, 1, 7);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.autoRotate = true; controls.autoRotateSpeed = .8;
  scene.add(new THREE.HemisphereLight(0xe6f2ff, 0x07111f, 2.6));
  const light = new THREE.DirectionalLight(0xffffff, 2.4); light.position.set(4, 5, 5); scene.add(light);
  const object = createModel(model); scene.add(object);
  let frame;
  const render = () => { object.rotation.y += .002; object.children.filter(item => item.name === 'orbiter').forEach(item => { const time = performance.now() * .001; item.position.set(Math.cos(time) * item.userData.radius, Math.sin(time) * .65, Math.sin(time) * item.userData.radius); }); controls.update(); renderer.render(scene, camera); frame = requestAnimationFrame(render); };
  render();
  const observer = new ResizeObserver(() => { const width = container.clientWidth || 620; camera.aspect = width / 420; camera.updateProjectionMatrix(); renderer.setSize(width, 420); });
  observer.observe(container);
  return () => { cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); renderer.dispose(); };
}
