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
var layers = new THREE.Object3D();
var countryData = new Object();
var stateData = new Object();
var particlesExist = false;

//window.onload = function(){
	var outlinedMapTexture;
	var mapIndexedImage = new Image();
	mapIndexedImage.src = 'images/map_indexed.png'
	//document.body.appendChild(mapIndexedImage)
	var mapOutlineImage
	var indexedMapTexture = THREE.ImageUtils.loadTexture('images/map_indexed.png', {}, function(){
		mapOutlineImage = new Image();
		mapOutlineImage.src = 'images/map_outline.png'
		loadWorldPins(function(){
			loadStatePins(function(){
				loadCountryCodes(function(){
					outlinedMapTexture = THREE.ImageUtils.loadTexture('images/map_outline.png', {}, function(){
						buildearth();
					});
				});
			});
		});
	});


	$("#infileBut").click(function(){
		$("#infile").trigger('click');
	});
	$("#layerBut").click(function(){
		$("#layerFile").trigger('click');
	});


	var chooser = $("#infile");
	chooser.change(function(evt) {
	    console.log($(this).val() + " is loaded");
			// draw file from the input
			var f = this.files[0]

			if(f){
				var reader = new FileReader();
				reader.onload = function(data){
					// determine the file type. Based on file type call appropriate parser
					loadTransmissions(data.target.result,addNewGraph);
				};
				reader.readAsText(f);
			}
	});

	var layerSelection = $("#layerFile")

	layerSelection.change(function(evt){
		console.log($(this).val() + " is loaded");
		// draw file from the input
		var f = this.files[0]

		if(f){
			var reader = new FileReader();
			reader.onload = function(data){
				// determine the file type. Based on file type call appropriate parser
				loadLayer(data.target.result,addNewLayer);
			};
			reader.readAsText(f);
		}
	});

// The addNewLines function is designed to be a callback function that
// applies the newly loaded lines from the input file to the earth.
	function addNewLines(connections){
		// At this point add the lines to the earth based on the input from the file
		for (var origin in connections){
			var geo = makeLineGeometry(origin, connections[origin], 2000, 'state','state');
			createLine(geo);
		}
		console.log("add the new lines")
	}


	function addNewLayer(layerObj){
		var newLayer = generateLayer(layerObj);
		var currentLayer = new THREE.Object3D();
		for (var i in newLayer){
			currentLayer.add(newLayer[i]);
		}
		layers.add(currentLayer);
	}

	function addNewGraph(connectionObj){
		var connectGeo = makeGraphGeometry(connectionObj);

		for(var i = 0; i < connectGeo.length; i++){
			graph.add(connectGeo[i]);
		}
		for(var i = 0; i < freshNodes.length; i++){
			graph.add(freshNodes[i]);
		}
		// initialize particle affects
		particlesExist = true;
		var particleCloud = initializeParticles();
		graph.add(particleCloud);
		//scene.add(graph);
		console.log("y up");
	}

	function buildearth(){
		var rotating
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

		var shaderMaterial = new THREE.ShaderMaterial( {

			uniforms: 		uniforms,
			// attributes:     attributes,
			vertexShader:   document.getElementById( 'globeVertexShader' ).textContent,
			fragmentShader: document.getElementById( 'globeFragmentShader' ).textContent,
			// sizeAttenuation: true,
		});

		//shaderMaterial.needsUpdate = true;
		var sphereMaterial = new THREE.MeshPhongMaterial({map: outlinedMapTexture})

		shaderMaterial.index0AttributeName = "position";
		//	-----------------------------------------------------------------------------
		//	Create the backing (sphere)
		// var mapGraphic = new THREE.Texture(worldCanvas);//THREE.ImageUtils.loadTexture("images/map.png");
		// backTexture =  mapGraphic;
		// mapGraphic.needsUpdate = true;

		// backMat.ambient = new THREE.Color(255,255,255);
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
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


		/*for( var i in timeBins ){
			var bin = timeBins[i].data;
			for( var s in bin ){
				var set = bin[s];
				// if( set.v < 1000000 )
				// 	continue;

				var exporterName = set.e.toUpperCase();
				var importerName = set.i.toUpperCase();

				//	let's track a list of actual countries listed in this data set
				//	this is actually really slow... consider re-doing this with a map
				if( $.inArray(exporterName, selectableCountries) < 0 )
					selectableCountries.push( exporterName );

				if( $.inArray(importerName, selectableCountries) < 0 )
					selectableCountries.push( importerName );
			}
		}*/

		//console.log( selectableCountries );

		// load geo data (country lat lons in this case)
		console.time('loadGeoData');
		loadGeoData( latlonData , stateCoords);
		console.timeEnd('loadGeoData');

		visualizationMesh = new THREE.Object3D();
		rotating.add(visualizationMesh);


		//Create the geometry for a line between two countries.
		//var geometry = makeLineGeometry('UNITED STATES','CANADA', 2000,'country','country');

		//var stateGeo1 = makeLineGeometry('Alabama', 'New York', 2000, 'state','state');


		//for (var i in stateData){
		//	var firstMarker = createMarker(i, 'state');

		//var nextGeo = makeLineGeometry('UNITED STATES','RUSSIAN FEDERATION', 100, 'country','country');
		//Try and create the mesh for the fresh geometry

		//	createLine(firstMarker);
		//}
		//createLine(nextGeo);


		//console.time('buildDataVizGeometries');
		//var vizilines = buildDataVizGeometries(timeBins);
		//console.timeEnd('buildDataVizGeometries');

		//visualizationMesh = new THREE.Object3D();
		//rotating.add(visualizationMesh);


		renderer = new THREE.WebGLRenderer({antialias:false});
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;

		renderer.sortObjects = false;
		renderer.generateMipmaps = false;

		/*camera = new THREE.PerspectiveCamera( 12, window.innerWidth / window.innerHeight, 1, 20000 );
		camera.position.z = 1400;
		camera.position.y = 0;
		camera.lookAt(scene.width/2, scene.height/2);
		scene.add( camera );*/

		var skyBoxGeometry = new THREE.SphereGeometry( 300, 50, 50 );
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
		controls.maxDistance = 280;
		controls.zoomSpeed = .15;

		var atlas = document.getElementById('atlas')
		atlas.appendChild( renderer.domElement );
		//var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		//var cube = new THREE.Mesh( geometry, material );
		//scene.add( cube );





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
		var instersecs = raycaster.intersectObjects(graph.children);
		if(instersecs.length > 0 ){
			var relname = instersecs[0].object.name;
			$("#details").html(relname);
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
		render();
		requestAnimationFrame( animate );
	}

//}
