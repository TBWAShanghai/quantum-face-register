var count = 300;

var camera, scene, renderer;
var controls;

var backgroundMesh,backgroundScene,backgroundCamera;

var objects = [];
var targets = {
	table: [],
	sphere: [],
	helix: [],
	grid: []
};

var manager = new THREE.LoadingManager();
manager.onLoad = init;
var loader = new THREE.TextureLoader( manager );
var bgTexture = loader.load( './images/bg.jpg');

// init();
// animate();

function init() {

	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 3000;

	scene = new THREE.Scene();

	//add bg
	var backgroundMesh = new THREE.Mesh(
    	new THREE.PlaneGeometry(20000, 20000),
		new THREE.MeshBasicMaterial({
    		map: bgTexture
		})
    );

	backgroundMesh.material.depthTest = false;
	backgroundMesh.material.depthWrite = false;

	backgroundScene = new THREE.Scene();
	backgroundCamera = new THREE.Camera();
	backgroundScene.add( backgroundCamera );
	backgroundScene.add( backgroundMesh );

	// table
	for (var i = 0; i < count; i++) {

		// var material=new THREE.MeshBasicMaterial({color:Math.random()*0xffffff,side:THREE.DoubleSide});
		var material = new THREE.MeshBasicMaterial({
			color: new THREE.Color(0, 127, 127),
			side: THREE.DoubleSide,
			opacity: 0.5,
			transparent: true
		});
		var geometry = new THREE.PlaneBufferGeometry(100, 100);
		var object = new THREE.Mesh(geometry, material);

		object.position.x = Math.random() * 4000 - 2000;
		object.position.y = Math.random() * 4000 - 2000;
		object.position.z = Math.random() * 4000 - 2000;
		scene.add(object);

		objects.push(object);

		var object = new THREE.Object3D();

		// console.log((table[i + 3] * 140) - 1330);
		object.position.x = (i % 20) * 150 - 1330;
		object.position.y = Math.ceil(i / 20) * 150 - 1300;

		targets.table.push(object);

	}

	// sphere

	var vector = new THREE.Vector3();
	var spherical = new THREE.Spherical();

	for (var i = 0, l = objects.length; i < l; i++) {

		var phi = Math.acos(-1 + (2 * i) / l);
		var theta = Math.sqrt(l * Math.PI) * phi;

		var object = new THREE.Object3D();

		spherical.set(800, phi, theta);

		object.position.setFromSpherical(spherical);

		vector.copy(object.position).multiplyScalar(2);

		object.lookAt(vector);

		targets.sphere.push(object);

	}

	// helix

	var vector = new THREE.Vector3();
	var cylindrical = new THREE.Cylindrical();

	for (var i = 0, l = objects.length; i < l; i++) {

		var theta = i * 0.175 + Math.PI;
		var y = -(i * 8) + 450;

		var object = new THREE.Object3D();

		cylindrical.set(900, theta, y);

		object.position.setFromCylindrical(cylindrical);

		vector.x = object.position.x * 2;
		vector.y = object.position.y;
		vector.z = object.position.z * 2;

		object.lookAt(vector);

		targets.helix.push(object);

	}

	// grid

	for (var i = 0; i < objects.length; i++) {

		var object = new THREE.Object3D();

		object.position.x = ((i % 5) * 400) - 800;
		object.position.y = (-(Math.floor(i / 5) % 5) * 400) + 800;
		object.position.z = (Math.floor(i / 25)) * 1000 - 2000;

		targets.grid.push(object);

	}

	// renderer = new THREE.CSS3DRenderer();
	// renderer.setSize(window.innerWidth, window.innerHeight);
	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('container').appendChild(renderer.domElement);

	// controls = new THREE.TrackballControls(camera, renderer.domElement);
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.rotateSpeed = 0.5;
	controls.minDistance = 500;
	controls.maxDistance = 6000;
	controls.addEventListener('change', render);

	var button = document.getElementById('table');
	button.addEventListener('click', function(event) {

		transform(targets.table, 2000);

	}, false);

	var button = document.getElementById('sphere');
	button.addEventListener('click', function(event) {

		transform(targets.sphere, 2000);

	}, false);

	var button = document.getElementById('helix');
	button.addEventListener('click', function(event) {

		transform(targets.helix, 2000);

	}, false);

	var button = document.getElementById('grid');
	button.addEventListener('click', function(event) {

		transform(targets.grid, 2000);

	}, false);

	transform(targets.sphere, 2000);

	window.addEventListener('resize', onWindowResize, false);


	animate();

}

function transform(targets, duration) {

	TWEEN.removeAll();

	for (var i = 0; i < objects.length; i++) {

		var object = objects[i];
		var target = targets[i];

		new TWEEN.Tween(object.position)
			.to({
				x: target.position.x,
				y: target.position.y,
				z: target.position.z
			}, Math.random() * duration + duration)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start();

		new TWEEN.Tween(object.rotation)
			.to({
				x: target.rotation.x,
				y: target.rotation.y,
				z: target.rotation.z
			}, Math.random() * duration + duration)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start();

	}

	new TWEEN.Tween(this)
		.to({}, duration * 2)
		.onUpdate(render)
		.start();

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	render();

}

function animate() {

	requestAnimationFrame(animate);

	TWEEN.update();

	// controls.update();

}

function render() {
	renderer.render( backgroundScene, backgroundCamera );
	renderer.render(scene, camera);

}