import * as THREE from 'three';

const canvasRef = useRef();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// const geometry = new THREE.TorusGeometry(10, 3, 16, 100, Math.PI * 2);
const color = 0xffffff;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

const material = new THREE.MeshPhongMaterial({ color: '#b546ff' });
// const geometry = new THREE.IcosahedronGeometry(10);
const geometry = new THREE.BoxGeometry(10, 10, 10);

const x = document.createElement('canvas');
const xc = x.getContext('2d');
x.width = x.height = 128;
xc.shadowColor = '#000';
xc.shadowBlur = 7;
xc.fillStyle = 'orange';
xc.font = '30pt arial bold';
xc.fillText('Test', 10, 64);

const el = new THREE.Mesh(geometry, [
new THREE.MeshBasicMaterial({
    // color: '#762fa5',
    // map:
    map: new THREE.Texture(x),
    transparent: true,
}),
new THREE.MeshBasicMaterial({
    // color: '#24bb2b',
    map: new THREE.Texture(x),
}),
new THREE.MeshBasicMaterial({
    // color: '#1583b6',
    map: new THREE.Texture(x),
}),
new THREE.MeshBasicMaterial({
    // color: '#c21111',
    map: new THREE.Texture(x),
}),
new THREE.MeshBasicMaterial({
    // color: '#db9719',
    map: new THREE.Texture(x),
}),
new THREE.MeshBasicMaterial({
    // color: '#b82160'
    map: new THREE.Texture(x),
}),
]);
scene.add(el);

camera.position.z = 30;
// el.position.x = x;
// el.position.y = y;
// el.position.z = z;

// if (canvasRef && canvasRef.current) {
useEffect(() => {
const node = canvasRef.current as any;
node.appendChild(renderer.domElement);
});
// }

function animate() {
requestAnimationFrame(animate);
el.rotation.x += 0.01;
el.rotation.y += 0.01;
renderer.render(scene, camera);
}
animate();