import * as THREE from 'three';
import { Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.setClearColor( 0xfefae0 );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();

//Światło główne
const light = new THREE.AmbientLight( 0xffffff );
scene.add( light );

//Szachownica
const szachownica = new THREE.Group();
const boxGeo = new THREE.BoxGeometry(2, 2, 0.5);
const backGeo = new THREE.BoxGeometry(17, 17, 1);
const boxMat1 = new THREE.MeshStandardMaterial( { color: 0xbc6c25 } );
const boxMat2 = new THREE.MeshStandardMaterial( { color: 0xdda15e } );
const backMat = new THREE.MeshStandardMaterial( { color: 0x5E3613 } );

let k = 1;
for (let i = 0; i < 8; i++) //Generowanie Planszy
{
	k = k * -1;
	for (let j = 0; j < 8; j++) 
	{
		k = k * -1;
		
		if(k == -1) //Naprzemienne stawianie kolorów
		{
			const plane = new THREE.Mesh( boxGeo, boxMat1 );
			plane.receiveShadow = true;
			szachownica.add(plane);
			plane.position.set(2 * i, 2 * j, 0);

			if(j >= 3 && j <= 4)
			{
				plane.tag = "move";
			}
		}
		else
		{
			const plane = new THREE.Mesh( boxGeo, boxMat2 );
			plane.receiveShadow = true;
			szachownica.add(plane);
			plane.position.set(2 * i, 2 * j, 0);
		}

	}
}

const backplane = new THREE.Mesh( backGeo, backMat );
backplane.receiveShadow = true;
backplane.castShadow = true;
szachownica.add(backplane);
backplane.position.set(7, 7, -0.5);

scene.add( szachownica );
szachownica.rotation.x = -Math.PI/2;
szachownica.position.set(-7, 0, 7);


//pionki
const fg = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 20, 20);
const fgm1 = new THREE.MeshStandardMaterial( { color: 0x5E3613 } );
const fgm2 = new THREE.MeshStandardMaterial( { color: 0xEECE9F } );
const fgpicked = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
const figury = new THREE.Group();

for(let i = 0; i < 8; i++) //rozstawienie pionków na odpowiednich polach
{
	for(let j = 0; j < 8; j++) 
	{
		if(j < 3 || j > 4)
		{		
			if ((i + j) % 2 == 1) 
			{
				const f = new THREE.Mesh(fg, j < 3 ? fgm1 : fgm2);
				f.castShadow = true;
				f.position.set(2 * i, 0.5, -2 * j);
				figury.add(f);
			}
		}
	}
}

scene.add(figury);
figury.position.set(-7, 0, 7);


//Raycasting - wybierz pionka
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let lastObj;
let lastMat;
let lastTile;

window.addEventListener('mousemove', onMouseMove, false);

function onMouseMove(event) 
{
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('click', onMouseClick, false);

function onMouseClick() 
{
	//Postaw na nowym polu
	raycaster.setFromCamera(mouse, camera);
    const intersects2 = raycaster.intersectObjects(szachownica.children, true);

	if (intersects2.length > 0) 
	{
		const pickedPosition = intersects2[0].object;
		if(intersects2[0].object.tag == "move")
		{		
			if(lastObj != null)
			{
				lastObj.position.set(pickedPosition.position.x, 0.5, -pickedPosition.position.y);
				lastObj.material = lastMat;
				lastObj = null;
				pickedPosition.tag = "";
				lastTile.tag = "move";
				return;
			}
		}
		lastTile = pickedPosition;
	}

	//Wybierz nowego pionka
    raycaster.setFromCamera(mouse, camera);
    const intersects1 = raycaster.intersectObjects(figury.children, true);

    if (intersects1.length > 0) 
	{
		const pickedObject = intersects1[0].object;

		if(lastObj != null)
		{
			if(pickedObject == lastObj)
			{
				lastObj.material = lastMat;
				lastObj = null;
				return;
			}


			lastObj.position.y = 0.5;
			lastObj.material = lastMat;
		}

		lastObj = pickedObject;
		lastMat = pickedObject.material;
		pickedObject.material = fgpicked;
    }
}

document.addEventListener('keydown', onKeyDown, false);

function onKeyDown(event) //Usuwanie pionka z szachownicy
{
	if (event.key === 'D' || event.key === 'd') 
	{
		if(lastObj != null)
		{
			figury.remove(lastObj);
			lastTile.tag = "move";
			return;
		}
	}
}

//światło rzut
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.castShadow = true;
directionalLight.position.set(50,50,50);

directionalLight.shadow.camera.top = 125;
directionalLight.shadow.camera.bottom = -125;
directionalLight.shadow.camera.left = -125;
directionalLight.shadow.camera.right = 125;

scene.add( directionalLight );

//biurko
const texture = new THREE.TextureLoader().load('public/dark_wood.png' ); 
const biurko = new THREE.Group();

const bGeo = new THREE.BoxGeometry(70, 2, 30);
const nleftGeo = new THREE.BoxGeometry(2, 29, 30);
const nbackGeo = new THREE.BoxGeometry(50, 8, 2);
const nundGeo = new THREE.BoxGeometry(44, 2, 30);
const nund2Geo = new THREE.BoxGeometry(2, 1, 28);
const szufGeo = new THREE.BoxGeometry(19.5, 8.5, 29.5);
const szufhandGeo = new THREE.BoxGeometry(3, 0.5, 0.5);
const bMat = new THREE.MeshStandardMaterial( { color: 0x7c4c05, map: texture } );
const bMat2 = new THREE.MeshStandardMaterial( { color: 0x808080 } );


const bmain = new THREE.Mesh(bGeo, bMat);
const nleft1 = new THREE.Mesh(nleftGeo, bMat);
const nleft2 = new THREE.Mesh(nleftGeo, bMat);
const nleft3 = new THREE.Mesh(nleftGeo, bMat);
const nback = new THREE.Mesh(nbackGeo, bMat);
const nund = new THREE.Mesh(nundGeo, bMat);
const szuf1 = new THREE.Mesh(szufGeo, bMat);
const szuf2 = new THREE.Mesh(szufGeo, bMat);
const szuf3 = new THREE.Mesh(szufGeo, bMat);
const szuf1h = new THREE.Mesh(szufhandGeo, bMat2);
const szuf2h = new THREE.Mesh(szufhandGeo, bMat2);
const szuf3h = new THREE.Mesh(szufhandGeo, bMat2);
const nund21 = new THREE.Mesh(nund2Geo, bMat2);
const nund22 = new THREE.Mesh(nund2Geo, bMat2);

bmain.receiveShadow = true;
bmain.castShadow = true;
nleft1.receiveShadow = true;
nleft1.castShadow  = true;
nleft2.receiveShadow = true;
nleft2.castShadow  = true;
nleft3.receiveShadow = true;
nleft3.castShadow  = true;
nback.receiveShadow = true;
nback.castShadow  = true;
nund.receiveShadow = true;
nund.castShadow  = true;
nund21.receiveShadow = true;
nund21.castShadow  = true;
nund22.receiveShadow = true;
nund22.castShadow  = true;
szuf1.receiveShadow = true;
szuf2.receiveShadow = true;
szuf3.receiveShadow = true;
szuf1h.castShadow = true;
szuf2h.castShadow = true;
szuf3h.castShadow = true;

biurko.add(bmain);
biurko.add(nleft1);
biurko.add(nleft2);
biurko.add(nleft3);
biurko.add(nback);
biurko.add(nund);
biurko.add(szuf1);
biurko.add(szuf2);
biurko.add(szuf3);
biurko.add(szuf1h);
biurko.add(szuf2h);
biurko.add(szuf3h);
biurko.add(nund21);
biurko.add(nund22);

nleft1.position.set(-34, -14, 0);
nleft2.position.set(34, -14, 0);
nleft3.position.set(14, -14, 0);
nback.position.set(-10, -15, -14);
nund.position.set(-10, -8, 0);
szuf1.position.set(25, -5.5, 0);
szuf2.position.set(25, -14.5, 0);
szuf3.position.set(25, -23.5, 0);
szuf1h.position.set(25, -5.5, 15);
szuf2h.position.set(25, -14.5, 15);
szuf3h.position.set(25, -23.5, 15);
nund21.position.set(-33, -8, 0);
nund22.position.set(13, -8, 0);

scene.add(biurko);
biurko.position.y = -1.5;

//kubek
const kubek = new THREE.Group();
const kubGeo = new THREE.CylinderGeometry( 2, 2, 5, 32, 5, true); 
const penGeo = new THREE.CylinderGeometry( 0.2, 0.2, 8, 32, 5); 
const kubdownGeo = new THREE.CircleGeometry(2, 30);
const kubMat = new THREE.MeshStandardMaterial( { color: 0x6060ff, roughness: 1, metalness: 0.7 } );
kubMat.side = THREE.DoubleSide;
const penMat = new THREE.MeshStandardMaterial( { color: 0xff6060 } );

const kobu = new THREE.Mesh(kubGeo, kubMat);
const kdwn = new THREE.Mesh(kubdownGeo, kubMat);
const pen = new THREE.Mesh(penGeo, penMat);
kubek.add(pen);
kubek.add(kobu);
kubek.add(kdwn);

kdwn.rotation.x = Math.PI/2;
kdwn.position.y = -2.4;
pen.rotation.x = Math.PI/8;
pen.position.set(1,0,0);

scene.add(kubek);
kubek.position.set(20, 2, -10);

//pokój ściany
const texture2 = new THREE.TextureLoader().load('public/plastered_wall.jpg' ); 
const wallGeo = new THREE.BoxGeometry(100, 100, 1);
const wallMat = new THREE.MeshStandardMaterial( { color: 0xffffff, map: texture2 } );

const wall1 = new THREE.Mesh(wallGeo, wallMat);
scene.add(wall1);
wall1.position.set(0, 20, -30);

const wall2 = new THREE.Mesh(wallGeo, wallMat);
scene.add(wall2);
wall2.rotation.set(0, Math.PI/2, 0);
wall2.position.set(-50, 20, 20);

const wall3 = new THREE.Mesh(wallGeo, wallMat);
scene.add(wall3);
wall3.rotation.set(Math.PI/2, 0, 0);
wall3.position.set(0, -30, 20);

wall1.castShadow = true;
wall1.receiveShadow = true;
wall2.castShadow = true;
wall2.receiveShadow = true;
wall3.castShadow = true;
wall3.receiveShadow = true;

//lampka
const lamp = new THREE.Group();

const lampbaseGeo = new THREE.CylinderGeometry( 3.5, 3.5, 1, 32, 5);
const lampbaseMat = new THREE.MeshStandardMaterial( { color: 0x0a0a0a, roughness: 0.3, metalness: 0.3 } );
lampbaseMat.side = THREE.DoubleSide;
const lampleg1Geo = new THREE.CylinderGeometry( 1, 2, 3, 32, 5);
const lampleg2Geo = new THREE.CylinderGeometry( 1, 1, 7, 32, 5);
const lampshieldGeo = new THREE.CylinderGeometry( 4, 4.5, 5, 32, 5, true);

const lbase = new THREE.Mesh(lampbaseGeo, lampbaseMat);
lamp.add(lbase);
lbase.castShadow = true;
lbase.receiveShadow = true;
const lleg1 = new THREE.Mesh(lampleg1Geo, lampbaseMat);
lamp.add(lleg1);
lleg1.castShadow = true;
lleg1.receiveShadow = true;
lleg1.position.set(0, 1.5, 0);
const lleg2 = new THREE.Mesh(lampleg2Geo, lampbaseMat);
lamp.add(lleg2);
lleg2.castShadow = true;
lleg2.receiveShadow = true;
lleg2.position.set(0, 6.5, 0);
const lsh = new THREE.Mesh(lampshieldGeo, lampbaseMat);
lamp.add(lsh);
lsh.castShadow = true;
lsh.receiveShadow = true;
lsh.position.set(0, 8.5, 0);


const llight1 = new THREE.PointLight( 0xffffff, 200, 1000);
llight1.position.set( 2, 8, 0 );
llight1.castShadow = true;

const llight2 = new THREE.PointLight( 0xffffff, 200, 1000 );
llight2.position.set( -2, 8, 0 );
llight2.castShadow = true;

const llight3 = new THREE.PointLight( 0xffffff, 200, 1000 );
llight3.position.set( 0, 8, 2 );
llight3.castShadow = true;

const llight4 = new THREE.PointLight( 0xffffff, 200, 1000 );
llight4.position.set( 0, 8, -2 );
llight4.castShadow = true;

lamp.add( llight1 );
lamp.add( llight2 );
lamp.add( llight3 );
lamp.add( llight4 );

scene.add(lamp);
lamp.position.set(-30, 0, -10);

//Kamera
camera.position.set(0, 15, 15);
camera.rotation.set(0, 90, 0);

function animate() {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );
}

animate();