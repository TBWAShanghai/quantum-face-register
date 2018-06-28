var count = 300;

var camera, scene, renderer;
var controls;

var backgroundMesh, backgroundScene, backgroundCamera;

var objects = [];
var targets = {
	table: [],
	sphere: [],
	helix: [],
	grid: []
};

var apple, facebook, github, google, qq;
var appleR, appleTheta, appleDTheta, appleY;
var facebookR, facebookTheta, facebookDTheta, facebookY;
var githubR, githubTheta, githubDTheta, githubY;
var googleR, googleTheta, googleDTheta, googleY;
var qqR, qqTheta, qqDTheta, qqY;

var manager = new THREE.LoadingManager();
manager.onLoad = init;
var loader = new THREE.TextureLoader(manager);
var bgTexture = loader.load('./images/bg.jpg');

var appleTexture = loader.load('./images/icons8-apple.png');
var facebookTexture = loader.load('./images/icons8-facebook.png');
var githubTexture = loader.load('./images/icons8-github.png');
var googleTexture = loader.load('./images/icons8-google.png');
var qqTexture = loader.load('./images/icons8-qq.png');

var allObjects;
var stats = initStats();

var guiControls;

// init();
// animate();

function init() {

	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 4000;

	scene = new THREE.Scene();

	allObjects = new THREE.Object3D();

	scene.add(allObjects);

	//add bg
	addBg();
	//addIcons
	addIcons();
	//addObjects
	addObjects();
	//addGUI
	addGUI();

	// renderer = new THREE.CSS3DRenderer();
	// renderer.setSize(window.innerWidth, window.innerHeight);
	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('container').appendChild(renderer.domElement);

	controls = new THREE.TrackballControls(camera, renderer.domElement);
	// controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.rotateSpeed = 0.5;
	controls.minDistance = 500;
	controls.maxDistance = 6000;
	// controls.addEventListener('change', render);

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
	// transform(targets.sphere, 0);

	window.addEventListener('resize', onWindowResize, false);


	animate();

}


function addBg() {
	backgroundMesh = new THREE.Mesh(
		new THREE.PlaneGeometry(2, 2, 0),
		new THREE.MeshBasicMaterial({
			map: bgTexture
		})
	);
	backgroundMesh.material.depthTest = false;
	backgroundMesh.material.depthWrite = false;
	backgroundScene = new THREE.Scene();
	backgroundCamera = new THREE.Camera();
	backgroundScene.add(backgroundCamera);
	backgroundScene.add(backgroundMesh);
}


function addIcons() {
	//add apple
	apple = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 0), new THREE.MeshBasicMaterial({
		map: appleTexture,
		transparent: true
	}));
	appleR = 1500;
	appleTheta = 0;
	appleDTheta = 11 * Math.PI / 1000;
	apple.position.set(appleR, 0, 0);
	scene.add(apple);

	//add facebook
	facebook = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 0), new THREE.MeshBasicMaterial({
		map: facebookTexture,
		transparent: true
	}));
	facebookR = 1300;
	facebookTheta = 45;
	facebookDTheta = 11 * Math.PI / 1000;
	facebook.position.set(facebookR, 0, 0);
	scene.add(facebook);

	//add github
	github = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 0), new THREE.MeshBasicMaterial({
		map: githubTexture,
		transparent: true
	}));
	githubR = 1500;
	githubTheta = 90;
	githubDTheta = 11 * Math.PI / 1000;
	github.position.set(githubR, 0, 0);
	scene.add(github);

	google = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 0), new THREE.MeshBasicMaterial({
		map: googleTexture,
		transparent: true
	}));
	googleR = 1500;
	googleTheta = 135;
	googleDTheta = 11 * Math.PI / 1000;
	google.position.set(googleR, 0, 0);
	scene.add(google);

	qq = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 0), new THREE.MeshBasicMaterial({
		map: qqTexture,
		transparent: true
	}));
	qqR = 1500;
	qqTheta = 180;
	qqDTheta = 11 * Math.PI / 1000;
	qq.position.set(qqR, 0, 0);
	scene.add(qq);
}

function addObjects() {
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

		allObjects.add(object);
		// scene.add(object);

		objects.push(object);

		var object = new THREE.Object3D();
		object.position.x = (i % 20) * 150 - 1330;
		object.position.y = Math.ceil(i / 20) * 150 - 1300;

		targets.table.push(object);

	}

	// sphere

	var vector = new THREE.Vector3();
	var spherical = new THREE.Spherical();
	// console.log(spherical);

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
}

function addGUI() {
	guiControls = new function() {
		this.rotationSpeed = 0.01;
		this.allObjectsX = 45;
		this.appleR = 1500;
		this.appleSpeed = 11;
		this.appleY = 0;
		this.facebookR = 1300;
		this.facebookSpeed = 11;
		this.facebookY = 500;
		this.githubR = 1500;
		this.githubSpeed = 11;
		this.githubY = 500;
		this.googleR = 1500;
		this.googleSpeed = 11;
		this.googleY = -500;
		this.qqR = 1500;
		this.qqSpeed = 11;
		this.qqY = 500;
	}
	var gui = new dat.GUI();
	gui.add(guiControls, 'rotationSpeed', 0, 1);
	gui.add(guiControls, 'allObjectsX', 0, 1000);
	var appleGui = gui.addFolder("apple");
	appleGui.add(guiControls, 'appleR', 0, 3000);
	appleGui.add(guiControls, 'appleSpeed', 0, 200);
	appleGui.add(guiControls, 'appleY', -1000, 1000);
	var facebookGui = gui.addFolder("facebook");
	facebookGui.add(guiControls, 'facebookR', 0, 3000);
	facebookGui.add(guiControls, 'facebookSpeed', 0, 200);
	facebookGui.add(guiControls, 'facebookY', -1000, 1000);
	var githubGui = gui.addFolder("github");
	githubGui.add(guiControls, 'githubR', 0, 3000);
	githubGui.add(guiControls, 'githubSpeed', 0, 200);
	githubGui.add(guiControls, 'githubY', -1000, 1000);
	var googleGui = gui.addFolder("google");
	googleGui.add(guiControls, 'googleR', 0, 3000);
	googleGui.add(guiControls, 'googleSpeed', 0, 200);
	googleGui.add(guiControls, 'googleY', -1000, 1000);
	var qqGui = gui.addFolder("qq");
	qqGui.add(guiControls, 'qqR', 0, 3000);
	qqGui.add(guiControls, 'qqSpeed', 0, 200);
	qqGui.add(guiControls, 'qqY', -1000, 1000);
}

function initStats() {
	var stats = new Stats();
	stats.setMode(0);

	stats.domElement.style.position = 'absoulte';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	STATS.appendChild(stats.domElement);
	return stats;
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
	allObjects.rotation.y += guiControls.rotationSpeed;
	allObjects.rotation.x = guiControls.allObjectsX;

	appleR = guiControls.appleR;
	appleDTheta = guiControls.appleSpeed * Math.PI / 1000;
	appleTheta -= appleDTheta;
	apple.position.x = appleR * Math.cos(appleTheta);
	apple.position.y = guiControls.appleY * Math.cos(appleTheta);
	apple.position.z = appleR * Math.sin(appleTheta);


	facebookR = guiControls.facebookR;
	facebookDTheta = guiControls.facebookSpeed * Math.PI / 1000;
	facebookTheta -= facebookDTheta;
	facebook.position.x = facebookR * Math.cos(facebookTheta);
	facebook.position.y = guiControls.facebookY * Math.sin(facebookTheta);
	facebook.position.z = facebookR * Math.sin(facebookTheta);

	githubR = guiControls.githubR;
	githubDTheta = guiControls.githubSpeed * Math.PI / 1000;
	githubTheta -= githubDTheta;
	github.position.x = githubR * Math.cos(githubTheta);
	github.position.y = guiControls.githubY * Math.cos(githubTheta);
	github.position.z = githubR * Math.sin(githubTheta);

	googleR = guiControls.googleR;
	googleDTheta = guiControls.googleSpeed * Math.PI / 1000;
	googleTheta -= googleDTheta;
	google.position.x = googleR * Math.cos(googleTheta);
	google.position.y = guiControls.googleY * Math.cos(googleTheta);
	google.position.z = googleR * Math.sin(googleTheta);

	qqR = guiControls.qqR;
	qqDTheta = guiControls.qqSpeed * Math.PI / 1000;
	qqTheta -= qqDTheta;
	qq.position.x = qqR * Math.cos(qqTheta);
	qq.position.y = guiControls.qqY * Math.cos(qqTheta);
	qq.position.z = qqR * Math.sin(qqTheta);

	TWEEN.update();

	controls.update();

	render();

}

function render() {
	stats.update();
	renderer.autoClear = false;
	renderer.clear();
	renderer.render(backgroundScene, backgroundCamera);
	renderer.render(scene, camera);

}