var count = 300;
var offsetWidth = 600;
// var socketurl = "ws://127.0.0.1:5500";
// var url = "http://localhost:5000/signed";
var socketurl = "wss://wechat.mynecis.cn";
var url = "/faceapi/signed";
var socket = io.connect(socketurl, {
	path: '/facesocket/socket.io'
});
var allNums = [],
	existArr = [],
	existNums = [];
calArr();

function calArr() {
	for (var i = 0; i < count; i++) {
		allNums.push(i);
	}
}

var allFaces = [],
	isAnimate = false;

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

var cubeWorldPos = new THREE.Vector3();
var targetWorldPos = new THREE.Vector3();
var targetWorldQua = new THREE.Quaternion();

var allShape;

// init();
// animate();

imageLoad('./images/ani.jpg', imageCanvas);

function imageLoad(src, callback) {
	var img = new Image();
	img.src = src;
	img.onload = function() {
		callback && callback(img);
	}
}

function imageCanvas(img) {
	var canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	var ctx=canvas.getContext("2d");
	ctx.drawImage(img,0,0,canvas.width,canvas.height);
	// document.body.appendChild(canvas);
	// ctx.save();
	var data= ctx.getImageData(0, 0, canvas.width, canvas.height);
	console.log(data);
}

function init() {

	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 4000;

	scene = new THREE.Scene();
	scene.updateMatrixWorld(true);

	allObjects = new THREE.Object3D();
	allObjects.updateMatrixWorld(true);

	scene.add(allObjects);

	//add bg
	addBg();
	//addIcons
	addIcons();
	//addObjects
	addObjects();
	//addGUI
	addGUI();
	//addExits
	addExitsFaces();
	//create shape object
	allShape = addShape();
	allShape.visible = false;
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

	// transformShape(allShape, 4000);
	transform(targets.sphere, 2000);
	// transform(targets.sphere, 0);
	// setTimeout(function() {
	// 	transformShape(allShape, 2500);
	// }, 2000);
	// setTimeout(function() {
	// 	// transformTarget(cube, 2000);
	// 	transformTarget(allShape.children[0], 2000, 0);
	// }, 4000)
	setTimeout(function() {
		freeTimeAni();
	}, 2000);


	socket.on("message", function(obj) {
		console.log("收到消息");
		addFaces(obj.img, facesAni);
	});

	window.addEventListener('resize', onWindowResize, false);

	animate();

}

var loaderface = new THREE.TextureLoader();

function addFaces(img, callback) {
	loaderface.load(img, function(texture) {
		// body...
		console.log(texture);
		allFaces.push(texture);
		callback && callback();
	});
}

function addExitsFaces() {
	$.ajax({
		url: url,
		type: "get",
		dataType: "json",
		success: function(result) {
			console.log(result);
			if (result.code == 200 && result.data) {
				existArr = result.data;
				for (var i = 0; i < existArr.length; i++) {
					var random = calRandom();
					var base64 = "data:image/jpeg;base64," + existArr[i].facebase64;
					var texture = loaderface.load(base64);
					allObjects.children[random].material.map = texture;
					allObjects.children[random].material.opacity = 1;
					allObjects.children[random].material.color = new THREE.Color(0xffffff);
					allObjects.children[random].material.needsUpdate = true;
				}
			}
		},
		error: function(error) {
			console.log(error);
		}
	});
}

function calRandom() {
	var arr = _.difference(allNums, existNums);
	var random = Math.floor(Math.random() * arr.length);
	existNums.push(arr[random]);
	return random;
}

function facesAni() {
	if (isAnimate) return;
	isAnimate = true;
	allShape.children[0].children[4].material.map = allFaces[0];
	allShape.children[0].children[4].material.needsUpdate = true;
	transformShape(allShape, 2500);
	setTimeout(function() {
		// transformTarget(cube, 2000);
		transformTarget(allShape.children[0], 2000, calRandom(), true);
	}, 5000);
}

function freeTimeAni() {
	if (isAnimate) return;
	isAnimate = true;
	var rdm = Math.floor(Math.random() * 5);
	var texture;
	switch (rdm) {
		case 0:
			texture = qqTexture
			break;
		case 1:
			texture = facebookTexture
			break;
		case 2:
			texture = githubTexture;
			break;
		case 3:
			texture = githubTexture;
			break;
		case 4:
			texture = googleTexture;
			break;
	}
	allShape.children[0].children[4].material.map = texture;
	allShape.children[0].children[4].material.needsUpdate = true;
	setTimeout(function() {
		transformShape(allShape, 2500, true);
	}, 2000);

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
		side: THREE.DoubleSide,
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
		var material;
		// var material=new THREE.MeshBasicMaterial({color:Math.random()*0xffffff,side:THREE.DoubleSide});
		material = new THREE.MeshBasicMaterial({
			// map: facebookTexture,
			color: new THREE.Color(0, 127, 127),
			// color: new THREE.Color(0xffffff),
			side: THREE.DoubleSide,
			opacity: 0.5,
			transparent: true
		});
		var geometry = new THREE.PlaneBufferGeometry(100, 100);
		var object = new THREE.Mesh(geometry, material);
		object.updateMatrixWorld(true);

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
		this.allObjectsX = Math.PI / 4;
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
	gui.add(guiControls, 'allObjectsX', -Math.PI, Math.PI);
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

function createShapeObject(multi, color) {
	multi = multi || 1;
	color = color || Math.random() * 0xffffff;
	var geometry = new THREE.Geometry();
	var material = new THREE.MeshBasicMaterial({
		color: color,
		// wireframe: true,
		vertexColors: THREE.FaceColors,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 1
	});
	geometry.vertices.push(new THREE.Vector3(0, 0, 0));
	geometry.vertices.push(new THREE.Vector3(10 * multi, 0, 0));
	geometry.vertices.push(new THREE.Vector3(10 * multi, -1 * multi, 0));
	geometry.vertices.push(new THREE.Vector3(1 * multi, -1 * multi, 0));
	geometry.vertices.push(new THREE.Vector3(1 * multi, -10 * multi, 0));
	geometry.vertices.push(new THREE.Vector3(0, -10 * multi, 0));
	geometry.faces.push(new THREE.Face3(0, 1, 2));
	geometry.faces.push(new THREE.Face3(2, 3, 0));
	geometry.faces.push(new THREE.Face3(3, 4, 5));
	geometry.faces.push(new THREE.Face3(3, 5, 0));
	geometry.computeFaceNormals();
	var shape = new THREE.Mesh(geometry, material);
	return shape;
}

function addShape() {
	var shapeGroup = new THREE.Object3D();
	shapeGroup.position.set(0, 0, 0);
	shapeGroup.updateMatrixWorld(true);
	scene.add(shapeGroup);
	var shapeObjects = new THREE.Object3D();
	shapeObjects.position.z = 2000;
	shapeObjects.position.x = -500;
	shapeObjects.position.y = 500;
	var shape1 = createShapeObject(30);
	shape1.name = 'topleft';
	var shape2 = shape1.clone();
	shape2.name = 'topright';
	shape2.position.x = 1000;
	shape2.rotation.y = Math.PI;
	var shape3 = shape1.clone();
	shape3.name = 'bottomleft';
	shape3.position.y = -1000;
	shape3.rotation.x = -Math.PI;
	var shape4 = shape1.clone();
	shape4.name = 'bottomright';
	shape4.position.y = -1000;
	shape4.position.x = 1000;
	shape4.rotation.x = -Math.PI;
	shape4.rotation.y = -Math.PI;
	shapeObjects.add(shape1);
	shapeObjects.add(shape2);
	shapeObjects.add(shape3);
	shapeObjects.add(shape4);

	var geometry = new THREE.PlaneBufferGeometry(800, 800, 0);
	var material = new THREE.MeshBasicMaterial({
		map: qqTexture,
		transparent: true,
		opacity: 1
	});
	var cube = new THREE.Mesh(geometry, material);
	cube.updateMatrixWorld(true);
	cube.name = "center";
	cube.position.x = 500;
	cube.position.y = -500;
	shapeObjects.add(cube);

	shapeGroup.add(shapeObjects);

	return shapeGroup;
}

function transformShape(targets, duration, flag) {
	allShape.visible = true;
	targets.children[0].visible = true;
	// targets.children[0].material.opacity = 1;
	targets.rotation.z = -Math.PI / 4;
	var shapeTargets = targets.children[0].children;
	shapeTargets[0].material.color = new THREE.Color(Math.random() * 0xffffff);
	shapeTargets[4].material.opacity = 1;
	shapeTargets[0].material.opacity = 1;
	var toTarget0, toTarget1, toTarget2, toTarget3;
	for (var i = 0; i < shapeTargets.length; i++) {
		switch (shapeTargets[i].name) {
			case "topleft":
				shapeTargets[i].position.x = 400;
				shapeTargets[i].position.y = -400;
				toTarget0 = {
					'x': 0,
					'y': 0
				};
				break;
			case "topright":
				shapeTargets[i].position.x = 940;
				shapeTargets[i].position.y = -60;
				toTarget1 = {
					'x': 1000,
					'y': 0
				};
				break;
			case "bottomleft":
				shapeTargets[i].position.x = 60;
				shapeTargets[i].position.y = -940;
				toTarget2 = {
					'x': 0,
					'y': -1000
				};
				break;
			case "bottomright":
				shapeTargets[i].position.x = 600;
				shapeTargets[i].position.y = -600;
				toTarget3 = {
					'x': 1000,
					'y': -1000
				};
				break;
			case "center":
				shapeTargets[i].material.opacity = 0;
				break;
		}
	}

	var reverseAnim = anime.timeline({
		complete: function() {
			if (flag) {
				anime.timeline({
					complete: function() {
						isAnimate = false;
						allShape.visible = false;
						reverseAnim.reset();
						if (allFaces.length > 0) {
							facesAni();
						} else {
							freeTimeAni();
						}
					}
				}).add({
					targets: shapeTargets[4].material,
					opacity: 0,
					duration: duration / 3,
					easing: 'easeOutExpo',
					offset: 0
				}).add({
					targets: shapeTargets[0].material,
					opacity: 0,
					duration: duration / 3,
					easing: 'easeOutExpo',
					offset: 0
				});
			}
		}
	}).add({
		targets: shapeTargets[0].position,
		x: toTarget0.x,
		y: toTarget0.y,
		duration: duration / 2,
		easing: 'easeOutExpo',
		offset: 0
	}).add({
		targets: shapeTargets[0].position,
		x: toTarget0.x - offsetWidth,
		y: toTarget0.y + offsetWidth,
		duration: duration / 2,
		easing: 'easeOutExpo',
		offset: duration / 2
	}).add({
		targets: shapeTargets[1].position,
		x: toTarget1.x,
		y: toTarget1.y,
		duration: duration / 2,
		easing: 'easeOutExpo',
		offset: 0
	}).add({
		targets: shapeTargets[1].position,
		x: toTarget1.x + offsetWidth,
		y: toTarget1.y + offsetWidth,
		duration: duration / 2,
		easing: 'easeOutExpo',
		offset: duration / 2
	}).add({
		targets: shapeTargets[2].position,
		x: toTarget2.x,
		y: toTarget2.y,
		duration: duration / 2,
		easing: 'easeOutExpo',
		offset: 0
	}).add({
		targets: shapeTargets[2].position,
		x: toTarget2.x - offsetWidth,
		y: toTarget2.y - offsetWidth,
		duration: duration / 2,
		easing: 'easeOutExpo',
		offset: duration / 2
	}).add({
		targets: shapeTargets[3].position,
		x: toTarget3.x,
		y: toTarget3.y,
		duration: duration / 2,
		easing: 'easeOutExpo',
		offset: 0
	}).add({
		targets: shapeTargets[3].position,
		x: toTarget3.x + offsetWidth,
		y: toTarget3.y - offsetWidth,
		duration: duration / 2,
		easing: 'easeOutExpo',
		offset: duration / 2
	}).add({
		targets: shapeTargets[4].material,
		opacity: 1,
		duration: duration / 3,
		delay: duration / 3,
		easing: 'easeOutExpo',
		offset: 0
	}).add({
		targets: targets.rotation,
		z: 0,
		duration: duration / 2,
		easing: 'easeInOutExpo',
		offset: 0
	})

}

function transformTarget(targets, duration, i, flag) {
	// target.getWorldPosition(cubeWorldPos);
	// i = i ? i : 200;
	targets.visible = true;
	objects[i].getWorldPosition(targetWorldPos);
	targets.worldToLocal(targetWorldPos);
	objects[i].getWorldQuaternion(targetWorldQua);
	var target = targets.children[4];
	var targetBorder = targets.children[0];
	targetBorder.material.opacity = 1;
	target.visible = true;
	// allShape.visible = true;
	target.material.opacity = 1;
	var reverseAnim = anime.timeline({
		// loop: true
		complete: function() {
			allObjects.children[i].material.map = allFaces[0];
			allObjects.children[i].material.opacity = 1;
			allObjects.children[i].material.color = new THREE.Color(0xffffff);
			allObjects.children[i].material.needsUpdate = true;
			reverseAnim.reset();
			targets.visible = false;
			if (flag) {
				isAnimate = false;
				allFaces.shift();
				if (allFaces.length > 0) {
					facesAni();
				} else {
					freeTimeAni();
				}
			}
		}
	}).add({
		targets: target.scale,
		x: 1 / 8,
		y: 1 / 8,
		z: 1 / 8,
		duration: duration,
		offset: 0,
		easing: 'easeOutExpo'
	}).add({
		targets: target.position,
		duration: duration,
		x: targetWorldPos.x,
		y: targetWorldPos.y,
		z: targetWorldPos.z,
		offset: 0,
		easing: 'easeOutExpo',
		update: function(anim) {
			objects[i].getWorldPosition(targetWorldPos);
			targets.worldToLocal(targetWorldPos);
			anim.animations[0].tweens[0].to.numbers[0] = targetWorldPos.x;
			anim.animations[1].tweens[0].to.numbers[0] = targetWorldPos.y;
			anim.animations[2].tweens[0].to.numbers[0] = targetWorldPos.z;
		}
	}).add({
		targets: target.quaternion,
		duration: duration,
		x: targetWorldQua.x,
		y: targetWorldQua.y,
		z: targetWorldQua.z,
		w: targetWorldQua.w,
		offset: 0,
		easing: 'easeOutExpo',
		update: function(anim) {
			objects[i].getWorldQuaternion(targetWorldQua);
			anim.animations[0].tweens[0].to.numbers[0] = targetWorldQua.x;
			anim.animations[1].tweens[0].to.numbers[0] = targetWorldQua.y;
			anim.animations[2].tweens[0].to.numbers[0] = targetWorldQua.z;
			anim.animations[3].tweens[0].to.numbers[0] = targetWorldQua.w;
		}
	}).add({
		targets: targetBorder.material,
		duration: duration,
		opacity: 0,
		offset: 0,
		easing: 'easeOutExpo'
	});
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

	for (var i = 0; i < objects.length; i++) {

		var object = objects[i];
		var target = targets[i];

		anime.timeline({

		}).add({
			targets: object.position,
			duration: Math.random() * duration + duration,
			x: target.position.x,
			y: target.position.y,
			z: target.position.z,
			offset: 0,
			easing: 'easeInOutExpo',
		}).add({
			targets: object.rotation,
			duration: Math.random() * duration + duration,
			x: target.rotation.x,
			y: target.rotation.y,
			z: target.rotation.z,
			offset: 0,
			easing: 'easeInOutExpo',
		})

	}

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