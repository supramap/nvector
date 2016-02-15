var renderer
var scene
var camera

//var isoFile = 'country_iso3166.json';
//var latlonFile = 'country_lat_lon.json';
//var latlonData;
var mouse ={x: 0,y: 0};
var cube;
var countryLookup;
var raycaster = new THREE.Raycaster();
var graph = new THREE.Object3D();
var graph2d = new THREE.Object3D();
var layers = new THREE.Object3D();
var particleUniverse = new THREE.Object3D();
var rootDataStore = [];
var layerStore = [];
var particleCloud;
var particlesExist = false,treeState = false;
var rotating,controls;

//window.onload = function(){
	var outlinedMapTexture;
	var mapIndexedImage = new Image();
	mapIndexedImage.src = 'images/map_indexed.png'
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
			isNW = true;
		}
		// If the existing runtime is the browser
		else{
			isNW = false;
		}
		// [[DISTANT FUTURE]] Maybe test the possibilities for the use of phonegap
		buildearth();
	}



	function addNewLayer(layerObj,fileName){
		var newLayer = geoJsonLayer(layerObj);
		layers.add(newLayer);
		layerStore.push(fileName);
		displayContents();
	}

	function addNewGraph(connectionObj, graphName){
		rootDataStore.push([JSON.parse(JSON.stringify(connectionObj)),graphName]);
		if(connectionObj.options.time == true){
			if(sliderExists){
				checkSlider();
			}
			else{
				generateSlider(connectionObj.options.timeRange);
			}
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

		// Setup to properly show the loaded graph's names
		var htmlString = ((rootDataStore.length>0) ? "<div class='subLabel'>Graphs</div>":"")+"<ul id='loadedFiles-names-list'>"
		for(var i = 0; i < rootDataStore.length; i++){
			htmlString = htmlString + "<li class='listItems'><div class='textSpan'>"+rootDataStore[i][1]+"</div>"+
			"<div class='inputDelete' onclick='removeGraph("+i+")' >x</div>"+
			"<input class='inputCheck' type='checkbox' value="+i+" onclick='hideGraph()' checked>"+
			"<input class='inputRadio' type='radio' onclick='testLiveParticle()' name='selected' value="+ i + " "+((i==0) ? "checked":"")+" > </li>";
		}
		htmlString += "</ul>";

		// Setup to properly show the loaded layer's names

		htmlString += ((layerStore.length > 0) ? "<div class='subLabel'>Layers</div>":"") + "<ul id='loadedFiles-layers-list'>"
		for(var i= 0; i < layerStore.length; i++){
			htmlString = htmlString + "<li class='listItems'><div class='textSpan'>"+layerStore[i]+"</div>"+
			"<div class='inputDelete' onclick='removeLayer("+i+")' >x</div>"+
			"<input class='inputCheckLayer' type='checkbox' value="+i+" onclick='hideLayer()' checked>"+
			"</li>";
		}

		$("#loadedFiles-names").html(htmlString);
	}

	/*
		The function called when the user selects the x button next to the view's name.
		This function should remove the loaded file from the rootDataStore as well
		as the graph object..
	*/
	function removeGraph(place){
		var removed = graph.children[place]
		graph.remove(removed);
		deleteObj(removed);
		rootDataStore.splice(place,1);
		displayContents();
		checkSlider();
	}

	function hideGraph(){
		var checkedBoxes = $(".inputCheck:checked");
		var checkList = [];
		for(var i = 0; i < checkedBoxes.length; i++){
			var current = parseInt(checkedBoxes[i].value);
			checkList.push(current);
		}

		for (var i = 0; i < graph.children.length; i++){
			if(checkList.indexOf(i) > -1){
				graph.children[i].visible = true;
			}
			else{
				graph.children[i].visible = false;
			}
		}
	}


	function hideLayer(){
		var checkedBoxes = $(".inputCheckLayer:checked");
		var checkList = [];
		for(var i = 0; i < checkedBoxes.length; i++){
			var current = parseInt(checkedBoxes[i].value);
			checkList.push(current);
		}

		for (var i = 0; i < layers.children.length; i++){
			if(checkList.indexOf(i) > -1){
				layers.children[i].visible = true;
			}
			else{
				layers.children[i].visible = false;
			}
		}
	}

	function removeLayer(place){
		var removed = layers.children[place];
		layers.remove(removed);
		deleteObj(removed);
		layerStore.splice(place,1);
		displayContents();
	}


	function redrawGraph(sTime,eTime){
		loading();

		// Need to redraw the graph for all of the elements in the root array
		// maybe add a filter  in here based upon the name of the elements selected
		// For now only one tree should be selected for a 2d visualization

		// If currently in 2d tree
		if(treeState){
			var child2d = graph2d.children[0];
			graph2d.remove(child2d);
			deleteObj(child2d);
			render();
			var checkedRadio = $("input:radio:checked");
			var graphPos = parseInt(checkedRadio[0].value);

			build2d(rootDataStore[graphPos][0],sTime,eTime,graphPos);
		}
		// otherwise in earth context
		else{
			var originalLength = graph.children.length
			for(var i=0; i < originalLength; i++){
				var tempObj = graph.children[0];
				graph.remove(tempObj);
				deleteObj(tempObj);
			}


			render();
			for(var i = 0; i < rootDataStore.length; i++){
					var rootClone = JSON.parse(JSON.stringify(rootDataStore[i][0]));
					graph.add(new THREE.Object3D());
					makeGraphGeometry(rootClone,sTime,eTime,i);
			}
			//hideGraph();
		}


		// initialize particle affects
		//particlesExist = true;
		//particleCloud = initializeParticles();
		doneLoading();

	}


	function jumpToTree(){


		render();
		// if currently in the tree state then switch back to display the earth
		if(treeState){
			treeState = false;
			// need to hide the search buttons if currently visible and camera focus
			selSlide();
			offKilter = false;

			if(sliderExists){

				render();
				var slideEnds = slider.noUiSlider.get();
				redrawGraph(reFormatDate(new Date(+slideEnds[0])),reFormatDate(new Date(+slideEnds[1])));
				//makeGraphGeometry(rootObject,reFormatDate(new Date(+slideEnds[0])),reFormatDate(new Date(+slideEnds[1])));
			}
			else{
				redrawGraph(undefined,undefined);
				//makeGraphGeometry(rootObject);
			}
			// Show all of the objects required for this view.
			graph.visible = true;
			rotating.visible = true;
			layers.visible = true;
			graph2d.visible = false;

			// setup the animation to be run
			var midPoint = camera._position.clone().lerp(camera.position,.5);
			midPoint.setLength(200);



			var pathCurve = new THREE.QuadraticBezierCurve3(camera.position,midPoint,camera._position);
			var path = pathCurve.getPoints(100);
			camera.path = path;
			camera.pip = 0;
			camera.nlerp = 1;

			cameraRelocate = true;
			clickViews();

		}
		else{
			hideAllParticles();
			graph.visible = false;
			rotating.visible = false;
			layers.visible = false;
			graph2d.visible = true;
			// need to find the currently selected graph to be converted into 2d
			var checkedRadio = $("input:radio:checked");
			var graphPos = parseInt(checkedRadio[0].value);

			//delete what is currently in the graph
			var child2d = graph2d.children[0];
			if(child2d != undefined){
				graph2d.remove(child2d);
				deleteObj(child2d);
			}


			if(sliderExists){
				var slideEnds = slider.noUiSlider.get();
	      build2d(rootDataStore[graphPos][0],reFormatDate(new Date(+slideEnds[0])),reFormatDate(new Date(+slideEnds[1])),graphPos);
			}
			else{
				build2d(rootDataStore[graphPos][0],undefined,undefined,graphPos);
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

		panOrbToggle();

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
		//
		if(offKilter){
			camera.lookAt(new THREE.Vector3(camera.position.x,camera.position.y,0));
			controls.target = new THREE.Vector3(camera.position.x,camera.position.y,0);
		}
		else{
			camera.lookAt(new THREE.Vector3(0,0,0));
			controls.target = new THREE.Vector3(0,0,0);
		}

		//camera.nlerp += .5;
	}




	function buildearth(){
		scene = new THREE.Scene();
		scene.matrixAutoUpdate = false;
		//scene.fog = new THREE.FogExp2( 0xBBBBBB, 0.00003 );
		scene.add(layers);
		scene.add(graph);
		scene.add(graph2d);
		scene.add(particleUniverse);
		scene.add( new THREE.AmbientLight( 0x888888 ) );

		var point = new THREE.SpotLight( 0x333333,3.0);
  	point.position.set( 400, 280, 180 );
  	point.target.position.set(150,10,-10);
  	//scene.add(point)

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
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.noPan = true;
		controls.minDistance = 140;
		controls.maxDistance = 280;
		controls.zoomSpeed = .15;

		var atlas = document.getElementById('atlas')
		atlas.appendChild( renderer.domElement );
		//var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		//var cube = new THREE.Mesh( geometry, material );
		//scene.add( cube );



		clickViews();
		window.addEventListener( 'click', onDocumentMouseDown, false );
		window.addEventListener( 'resize', onWindowResize, false );
		render();
		animate();

		// THIS IS ONLY HERE FOR DEMO PURPOSES!!!!!!!!!!................!!!!!!!!!!!!

		//$("#layerButCloud").hide();
		//$("#infileButCloud").hide();

		// THIS IS ONLY HERE FOR DEMO PURPOSES!!!!!!!!!!..............!!!!!!!!!!!!!

	}

	function render() {
		renderer.clear();
		renderer.render( scene, camera );
	}

	var possible = [];



	/*
		This is where we govern everything that happens when a user selects a
		node. The primary factor taken into consideration is the 'treeState' which
		shows if the current view is 3d or 2d.
	*/
	function onDocumentMouseDown(event){
		mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);

		// determine how far out the menu is.
		var menuWidth = $("#menu").width();

		// if in the standard view utilize the graph object to search for appropriately
		// children.
		if(!treeState){
			if(graph.children[0] != undefined && event.clientX > menuWidth){
				var allObjs = [];
				for(var i = 0; i < graph.children.length; i++){
					allObjs.push(graph.children[i].children[0]);
				}

				var intersecs = raycaster.intersectObjects(allObjs);
				if(intersecs.length > 0 ){
					//var relname = instersecs[0].object.name;
					var foundSphere = false;

					/*
						Iterate through all of the possible intersections for determining
						which pointClouds it intersects.
					*/
					for(var i = 0; i < intersecs.length; i++){
						if(foundSphere == false && intersecs[i].object.type == "PointCloud"){
							foundSphere = true;
							possible = [];
						}
						if(intersecs[i].object.type == "PointCloud"){
							var currentName = intersecs[i].object.geometry.vertices[intersecs[i].index].nodeName;
							var currentRootPos = intersecs[i].object.rootPosition;
							possible.push([currentName,currentRootPos]);
						}
					}
					$("#dataTab").trigger("click");
					showPossible();
				}
			}
		}
		//otherwise assume that we are in the 2d view and use the appropriate 2dObject
		else{
			if(graph2d.children[0] != undefined && event.clientX > menuWidth){
				var allObjs = [];
				for(var i = 0; i < graph2d.children.length; i++){
					allObjs.push(graph2d.children[i].children[0]);
				}

				var intersecs = raycaster.intersectObjects(allObjs);

				// If there is something that was selected dig deeper.
				if(intersecs.length > 0 ){
					//var relname = instersecs[0].object.name;
					var foundSphere = false;
					for(var i = 0; i < intersecs.length; i++){

						if(foundSphere == false && intersecs[i].object.type == "PointCloud"){
							foundSphere = true;
							possible = [];
						}
						if(intersecs[i].object.type == "PointCloud"){
							var currentName = intersecs[i].object.geometry.vertices[intersecs[i].index].nodeName;
							var currentRootPos = intersecs[i].object.rootPosition;
							possible.push([currentName,currentRootPos]);
						}
					}//end for loop

					if(subToggled){
						//**************** If choosing subsection
						subsect();
						$("#subButton").trigger("click");
						//****************
					}
					else{
						//***************	If not in any form of editing mode
						$("#dataTab").trigger("click");
						showPossible();
						//*****************
					}

				}
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
			//pSystem.update();
			updateAllParticles();
		}
		if(cameraRelocate){
			slideCamera();
		}


		render();
		requestAnimationFrame( animate );
	}

//}
