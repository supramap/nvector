var renderer
var scene
var camera

var cube

window.onload = function(){
	
	var mapIndexedImage = new Image();
	mapIndexedImage.src = 'images/map_indexed.png'
	document.body.appendChild(mapIndexedImage)
	var mapOutlineImage
	mapIndexedImage.onload= function(){
		mapOutlineImage = new Image();
		mapOutlineImage.src = 'images/map_outline.png'
		mapOutlineImage.onload = function(){
			buildearth();
			};
		};
	
	
	function buildearth(){
		var rotating
		scene = new THREE.Scene();
		scene.matrixAutoUpdate = false;		
		// scene.fog = new THREE.FogExp2( 0xBBBBBB, 0.00003 );		        		       

		scene.add( new THREE.AmbientLight( 0x505050 ) );				

		light1 = new THREE.SpotLight( 0xeeeeee, 3 );
		light1.position.x = 730; 
		light1.position.y = 520;
		light1.position.z = 626;
		light1.castShadow = true;
		scene.add( light1 );

		light2 = new THREE.PointLight( 0x222222, 14.8 );
		light2.position.x = -640;
		light2.position.y = -500;
		light2.position.z = -1000;
		scene.add( light2 );				

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
		var indexedMapTexture = new THREE.Texture( mapIndexedImage );
		indexedMapTexture.needsUpdate = true;
		indexedMapTexture.magFilter = THREE.NearestFilter;
		indexedMapTexture.minFilter = THREE.NearestFilter;

		//var mapOutlineImage = new Image();
		//mapOutlineImage.src = 'images/map_outline.png'
		var outlinedMapTexture = new THREE.Texture( mapOutlineImage );
		outlinedMapTexture.needsUpdate = true;
		// outlinedMapTexture.magFilter = THREE.NearestFilter;
		// outlinedMapTexture.minFilter = THREE.NearestFilter;

		var uniforms = {
			'mapIndex': { type: 't', value: 0, texture: indexedMapTexture  },		
			'lookup': { type: 't', value: 1, texture: lookupTexture },
			'outline': { type: 't', value: 2, texture: outlinedMapTexture },
			'outlineLevel': {type: 'f', value: 1 },
		};
		mapUniforms = uniforms;

		var shaderMaterial = new THREE.ShaderMaterial( {

			uniforms: 		uniforms,
			// attributes:     attributes,
			vertexShader:   document.getElementById( 'globeVertexShader' ).textContent,
			fragmentShader: document.getElementById( 'globeFragmentShader' ).textContent,
			// sizeAttenuation: true,
		});


		//	-----------------------------------------------------------------------------
		//	Create the backing (sphere)
		// var mapGraphic = new THREE.Texture(worldCanvas);//THREE.ImageUtils.loadTexture("images/map.png");
		// backTexture =  mapGraphic;
		// mapGraphic.needsUpdate = true;
		backMat = new THREE.MeshBasicMaterial(
			{
				// color: 		0xffffff, 
				// shininess: 	10, 
	// 			specular: 	0x333333,
				// map: 		mapGraphic,
				// lightMap: 	mapGraphic
			}
		);				
		// backMat.ambient = new THREE.Color(255,255,255);	
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );						
		sphere = new THREE.Mesh( new THREE.SphereGeometry( 100, 40, 40 ), shaderMaterial );				
		// sphere.receiveShadow = true;
		// sphere.castShadow = true;
		sphere.doubleSided = false;
		sphere.rotation.x = Math.PI;				
		sphere.rotation.y = -Math.PI/2;
		sphere.rotation.z = Math.PI;
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
		//loadGeoData( latlonData );				
		console.timeEnd('loadGeoData');				

		console.time('buildDataVizGeometries');
		//var vizilines = buildDataVizGeometries(timeBins);
		console.timeEnd('buildDataVizGeometries');

		//visualizationMesh = new THREE.Object3D();
		//rotating.add(visualizationMesh);	
		
		
		renderer = new THREE.WebGLRenderer({antialias:false});
		renderer.setSize( window.innerWidth, window.innerHeight );
		//renderer.autoClear = false;
		
		renderer.sortObjects = false;		
		renderer.generateMipmaps = false;					

		/*camera = new THREE.PerspectiveCamera( 12, window.innerWidth / window.innerHeight, 1, 20000 ); 		        
		camera.position.z = 1400;
		camera.position.y = 0;
		camera.lookAt(scene.width/2, scene.height/2);	
		scene.add( camera );*/	  

		var camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.5, 100000 );
		camera.position.z = 500;
		camera.position.y = 0;
		camera.position.x = 0;

		document.body.appendChild( renderer.domElement );	
		//var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		//var cube = new THREE.Mesh( geometry, material );
		//scene.add( cube );
		
		var render = function () {	
			//renderer.clear();	 					
			renderer.render( scene, camera );	
		}	
		
		render();
	}
}



