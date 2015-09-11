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
		scene.add(graph);
		console.log("y up");
	}

	function buildearth(){
		var rotating
		scene = new THREE.Scene();
		scene.matrixAutoUpdate = false;
		//scene.fog = new THREE.FogExp2( 0xBBBBBB, 0.00003 );

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

	var countryColorMap = {'PE':1,
	'BF':2,'FR':3,'LY':4,'BY':5,'PK':6,'ID':7,'YE':8,'MG':9,'BO':10,'CI':11,'DZ':12,'CH':13,'CM':14,'MK':15,'BW':16,'UA':17,
	'KE':18,'TW':19,'JO':20,'MX':21,'AE':22,'BZ':23,'BR':24,'SL':25,'ML':26,'CD':27,'IT':28,'SO':29,'AF':30,'BD':31,'DO':32,'GW':33,
	'GH':34,'AT':35,'SE':36,'TR':37,'UG':38,'MZ':39,'JP':40,'NZ':41,'CU':42,'VE':43,'PT':44,'CO':45,'MR':46,'AO':47,'DE':48,'SD':49,
	'TH':50,'AU':51,'PG':52,'IQ':53,'HR':54,'GL':55,'NE':56,'DK':57,'LV':58,'RO':59,'ZM':60,'IR':61,'MM':62,'ET':63,'GT':64,'SR':65,
	'EH':66,'CZ':67,'TD':68,'AL':69,'FI':70,'SY':71,'KG':72,'SB':73,'OM':74,'PA':75,'AR':76,'GB':77,'CR':78,'PY':79,'GN':80,'IE':81,
	'NG':82,'TN':83,'PL':84,'NA':85,'ZA':86,'EG':87,'TZ':88,'GE':89,'SA':90,'VN':91,'RU':92,'HT':93,'BA':94,'IN':95,'CN':96,'CA':97,
	'SV':98,'GY':99,'BE':100,'GQ':101,'LS':102,'BG':103,'BI':104,'DJ':105,'AZ':106,'MY':107,'PH':108,'UY':109,'CG':110,'RS':111,'ME':112,'EE':113,
	'RW':114,'AM':115,'SN':116,'TG':117,'ES':118,'GA':119,'HU':120,'MW':121,'TJ':122,'KH':123,'KR':124,'HN':125,'IS':126,'NI':127,'CL':128,'MA':129,
	'LR':130,'NL':131,'CF':132,'SK':133,'LT':134,'ZW':135,'LK':136,'IL':137,'LA':138,'KP':139,'GR':140,'TM':141,'EC':142,'BJ':143,'SI':144,'NO':145,
	'MD':146,'LB':147,'NP':148,'ER':149,'US':150,'KZ':151,'AQ':152,'SZ':153,'UZ':154,'MN':155,'BT':156,'NC':157,'FJ':158,'KW':159,'TL':160,'BS':161,
	'VU':162,'FK':163,'GM':164,'QA':165,'JM':166,'CY':167,'PR':168,'PS':169,'BN':170,'TT':171,'CV':172,'PF':173,'WS':174,'LU':175,'KM':176,'MU':177,
	'FO':178,'ST':179,'AN':180,'DM':181,'TO':182,'KI':183,'FM':184,'BH':185,'AD':186,'MP':187,'PW':188,'SC':189,'AG':190,'BB':191,'TC':192,'VC':193,
	'LC':194,'YT':195,'VI':196,'GD':197,'MT':198,'MV':199,'KY':200,'KN':201,'MS':202,'BL':203,'NU':204,'PM':205,'CK':206,'WF':207,'AS':208,'MH':209,
	'AW':210,'LI':211,'VG':212,'SH':213,'JE':214,'AI':215,'MF_1_':216,'GG':217,'SM':218,'BM':219,'TV':220,'NR':221,'GI':222,'PN':223,'MC':224,'VA':225,
	'IM':226,'GU':227,'SG':228};

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
