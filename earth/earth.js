var renderer
var scene
var camera

var isoFile = 'country_iso3166.json';
var latlonFile = 'country_lat_lon.json';
var latlonData;
var stateCoords, mouse ={x: 0,y: 0};
var cube;
var countryLookup;
var raycaster = new THREE.Raycaster();
var graph = new THREE.Object3D();
var rootDataStore = []
var particleCloud;
var layers = new THREE.Object3D();
var countryData = new Object();
var stateData = new Object();
var particlesExist = false,treeState = false;
var rotating;

//window.onload = function(){
	var outlinedMapTexture;
	var mapIndexedImage = new Image();
	mapIndexedImage.src = 'images/map_indexed.png'
	//document.body.appendChild(mapIndexedImage)
	var mapOutlineImage
	var indexedMapTexture = THREE.ImageUtils.loadTexture('images/map_indexed.png', {}, function(){
		mapOutlineImage = new Image();
		mapOutlineImage.src = 'images/map_outline.png'
		outlinedMapTexture = THREE.ImageUtils.loadTexture('images/map_outline.png', {}, function(){
			initializeEnvironment();
		});
	});


	// Function to be run after the expected images are loaded.
	// analyzes the current runtime environment and constructs the app appropirately
	var isNW = true;
	//var isMobile = false;
	function initializeEnvironment(){

		// If the existing runtime is nwjs
		if(is_nwjs()){
			isNw = true;
		}
		// If the existing runtime is the browser
		else{
			isNW = false;
		}
		// [[DISTANT FUTURE]] Maybe test the possibilities for the use of phonegap
		buildearth();
	}



	function addNewLayer(layerObj){
		var newLayer = generateLayer(layerObj);
		var currentLayer = new THREE.Object3D();
		for (var i in newLayer){
			currentLayer.add(newLayer[i]);
		}
		layers.add(currentLayer);
	}

	function addNewGraph(connectionObj, graphName){
		rootDataStore.push([JSON.parse(JSON.stringify(connectionObj)),graphName]);
		if(connectionObj.options.time == true){
			generateSlider(connectionObj.options.timeRange);
		}
		// function called in visualize_lines to generate the graph geometry
		var graphObject = makeGraphGeometry(connectionObj,null,null,rootDataStore.length-1);

		scene.add(graph);
		displayContents();
		// initialize particle affects
		//particlesExist = true;
		//particleCloud = initializeParticles();
		//graph.add(particleCloud);
		//scene.add(graph);
		//console.log("y up");
		//connectionObj = {};*/
	}

	function displayContents(){
		//$("#loadedFiles-names").empty();

		var htmlString = "<ul id='loadedFiles-names-list'>"
		for(var i = 0; i < rootDataStore.length; i++){
			htmlString = htmlString + "<li class='listItems'><div class='textSpan'>"+rootDataStore[i][1]+"</div><div class='inputDelete' onclick='removeGraph("+i+")' >x</div><input class='inputCheck' type='checkbox'><input class='inputRadio' type='radio'> </li>";
		}
		htmlString += "</ul>";
		$("#loadedFiles-names").html(htmlString);
	}

	/*
		The function called when the user selects the x button next to the view's name.
		This function should remove the loaded file from the rootDataStore as well
		as the graph object..
	*/
	function removeGraph(place){

	}

	function redrawGraph(sTime,eTime){
		loading();

		// Need to redraw the graph for all of the elements in the root array
		// maybe add a filter  in here based upon the name of the elements selected
		// For now only one tree should be selected for a 2d visualization

		scene.remove(graph);
		graph = new THREE.Object3D();
		render();
		for(var i = 0; i < rootDataStore.length; i++){
				var rootClone = JSON.parse(JSON.stringify(rootDataStore[i][0]));

				if(treeState){
					build2d(rootClone,sTime,eTime,i);
				}
				else{
					makeGraphGeometry(rootClone,sTime,eTime,i);
				}

		}
		//graph.dispose();

		// initialize particle affects
		//particlesExist = true;
		//particleCloud = initializeParticles();
		scene.add(graph);
		doneLoading();

	}


	function jumpToTree(){
		// going to need to fetch the current state of the time if it is enabled

		scene.remove(graph);
		//graph.dispose();
		graph = new THREE.Object3D();
		render()
		// if currently in the tree state then switch back to display the earth
		if(treeState){
			if(sliderExists){

				render();
				var slideEnds = slider.noUiSlider.get();

				makeGraphGeometry(rootObject,reFormatDate(new Date(+slideEnds[0])),reFormatDate(new Date(+slideEnds[1])));
			}
			else{
				makeGraphGeometry(rootObject);
			}
			treeState = false;
			scene.add(rotating);

			var midPoint = camera._position.clone().lerp(camera.position,.5);
			midPoint.setLength(200);



			var pathCurve = new THREE.QuadraticBezierCurve3(camera.position,midPoint,camera._position);
			var path = pathCurve.getPoints(100);
			camera.path = path;
			camera.pip = 0;
			camera.nlerp = 1;

			cameraRelocate = true;


		}
		else{

			scene.remove(rotating);
			if(sliderExists){
				var slideEnds = slider.noUiSlider.get();
	      build2d(rootObject,reFormatDate(new Date(+slideEnds[0])),reFormatDate(new Date(+slideEnds[1])));
			}
			else{
				build2d(rootObject);
			}
			treeState = true;
			var target = new THREE.Vector3(0,0,180);

			var midPoint = camera.position.clone().lerp(target,.5);
			midPoint.setLength(200);


			camera._position = camera.position.clone();
			var pathCurve = new THREE.QuadraticBezierCurve3(camera.position,midPoint,target);
			var path = pathCurve.getPoints(100);
			camera.path = path;
			camera.pip = 0;
			camera.nlerp = 1;

			cameraRelocate = true;

		}
		scene.add(graph);

		//build2d(rootObject);


	}

	var cameraRelocate = false;
	function slideCamera(){

		camera.pip += 1
		//camera.nlerp = 0;
		if(camera.pip + 1 >= camera.path.length){
			cameraRelocate = false;
			return;
		}

		var currentPoint = camera.path[camera.pip];
		var nextPoint = camera.path[camera.pip + 1];

		var newPosition = currentPoint.lerp(nextPoint,camera.nlerp);
		camera.position.set(newPosition.x,newPosition.y,newPosition.z);

		camera.lookAt(new THREE.Vector3(0,0,0));

		//camera.nlerp += .5;
	}




	function buildearth(){
		scene = new THREE.Scene();
		scene.matrixAutoUpdate = false;
		//scene.fog = new THREE.FogExp2( 0xBBBBBB, 0.00003 );
		scene.add(layers);
		scene.add(graph)
		scene.add( new THREE.AmbientLight( 0x888888 ) );

		var point = new THREE.SpotLight( 0x333333,3.0);
  	point.position.set( 400, 280, 180 );
  	point.target.position.set(150,10,-10);
  	//scene.add(point)

		/*
		light1 = new THREE.SpotLight( 0xeeeeee, 100 );
		light1.position.x = 0;
		light1.position.y = 0;
		light1.position.z = 400;
		light1.castShadow = true;
		light1.lookAt(scene.position)
		scene.add( light1 );*/

		//scene.add(new axis(160));
		rotating = new THREE.Object3D();
		scene.add(rotating);


		lookupCanvas = document.createElement('canvas');
		lookupCanvas.width = 256;
		lookupCanvas.height = 1;

		lookupTexture = new THREE.Texture( lookupCanvas );
		lookupTexture.magFilter = THREE.NearestFilter;
		lookupTexture.minFilter = THREE.NearestFilter;
		lookupTexture.needsUpdate = true;

		//THREE.ImageUtils.loadTexture( 'images/map_indexed.png' );
		//var indexedMapTexture = new THREE.Texture( mapIndexedImage );
		indexedMapTexture.needsUpdate = true;
		indexedMapTexture.magFilter = THREE.NearestFilter;
		indexedMapTexture.minFilter = THREE.NearestFilter;

		//var mapOutlineImage = new Image();
		//mapOutlineImage.src = 'images/map_outline.png'
		//var outlinedMapTexture = new THREE.Texture( mapOutlineImage );
		outlinedMapTexture.needsUpdate = true;
		// outlinedMapTexture.magFilter = THREE.NearestFilter;
		// outlinedMapTexture.minFilter = THREE.NearestFilter;

		var uniforms = {
			'mapIndex': { type: 't', value: 0, texture: indexedMapTexture  },
			'lookup': { type: 't', value: 1, texture: lookupTexture },
			'outline': { type: 't', value: 2, texture: outlinedMapTexture },
			'outlineLevel': {type: 'f', value: 1 },
		};
		/*
		var uniforms = {
		    time: { type: "f", value: 0 },
		    resolution: { type: "v2", value: new THREE.Vector2 },
		    texture: { type: "t", value: THREE.ImageUtils.loadTexture('images/map_indexed.png') }
		};*/

		mapUniforms = uniforms;


		//shaderMaterial.needsUpdate = true;
		var sphereMaterial = new THREE.MeshPhongMaterial({map: outlinedMapTexture});

		//	-----------------------------------------------------------------------------
		//	Create the backing (sphere)
		// var mapGraphic = new THREE.Texture(worldCanvas);//THREE.ImageUtils.loadTexture("images/map.png");
		// backTexture =  mapGraphic;
		// mapGraphic.needsUpdate = true;

		// backMat.ambient = new THREE.Color(255,255,255);
		sphere = new THREE.Mesh( new THREE.SphereGeometry( 100, 40, 40 ), sphereMaterial /*shaderMaterial*/ );
		//sphere.receiveShadow = true;
		//sphere.castShadow = true;
		//sphere.needsUpdate = true;
		sphere.doubleSided = false;
		sphere.rotation.x = Math.PI ;//- .2;
		sphere.rotation.y = -Math.PI/2;// + .08;
		sphere.rotation.z = Math.PI;// - .1;
		sphere.id = "base";

		rotating.add( sphere );

		//console.log( selectableCountries );


		renderer = new THREE.WebGLRenderer({antialias:false});
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;

		renderer.sortObjects = false;
		renderer.generateMipmaps = false;


		var skyBoxGeometry = new THREE.SphereGeometry( 8000, 100, 100 );
		// BackSide: render faces from inside of the cube, instead of from outside (default).
		var skyBoxMaterial = new THREE.MeshBasicMaterial( { side: THREE.BackSide,map: THREE.ImageUtils.loadTexture('images/starfield.png') } );
		var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
		scene.add(skyBox);



		camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.5, 10000 );
		camera.position.set(-131,119,-22);
		camera.add(point)
  	scene.add(camera)
		var controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.noPan = true;
		controls.minDistance = 140;
		//controls.maxDistance = 280;
		controls.zoomSpeed = .15;

		var atlas = document.getElementById('atlas')
		atlas.appendChild( renderer.domElement );
		//var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		//var cube = new THREE.Mesh( geometry, material );
		//scene.add( cube );



		clickViews();
		window.addEventListener( 'mousedown', onDocumentMouseDown, false );
		window.addEventListener( 'resize', onWindowResize, false );
		render();
		animate();
	}

	function render() {
		renderer.clear();
		renderer.render( scene, camera );
	}

	function onDocumentMouseDown(event){
		mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);
		if(graph.children[0] != undefined){
			var instersecs = raycaster.intersectObjects(graph.children[0].children);
			if(instersecs.length > 0 ){
				//var relname = instersecs[0].object.name;
				$("#details").html("found Something!");
			}
		}
	}

	function onWindowResize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	function animate(){
		if(particlesExist){
			pSystem.update();
		}
		if(cameraRelocate){
			slideCamera();
		}


		render();
		requestAnimationFrame( animate );
	}

//}
