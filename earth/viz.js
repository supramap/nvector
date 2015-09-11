var pSystem;

function initializeParticles(){
	// load the shaders
	particleAttributes = {

		size: {	type: 'f', value: [] },
		customColor: { type: 'c', value: [] }

	};

	particleUniforms = {

		amplitude: { type: "f", value: 1.0 },
		color:     { type: "c", value: new THREE.Color( 0xffaa00 ) },
		texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "images/particleA.png" ) },

	};

	var particleMaterial = new THREE.ShaderMaterial( {

		uniforms:       particleUniforms,
		attributes:     particleAttributes,
		vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true

	});
	// after the shaders are loaded build the particle system


	pSystem = new THREE.PointCloud(particlesGeo,particleMaterial)

	var values_size = particleAttributes.size.value;
	var values_color = particleAttributes.customColor.value
	for(var i = 0 ; i < particlesGeo.vertices.length; i++){
		values_size[i] = 3;
		values_color[ i ] = new THREE.Color( 0xffaa00 );
		values_color[i].setHSL(.2,.7,.4);
	}

	pSystem.update = function(){
			// var time = Date.now()
			for( var i in this.geometry.vertices ){
				var particle = this.geometry.vertices[i];
				var path = particle.path;
				var moveLength = path.length;

				particle.lerpN += 0.05;
				if(particle.lerpN > 1){
					particle.lerpN = 0;
					particle.moveIndex = particle.nextIndex;
					particle.nextIndex++;
					if( particle.nextIndex >= path.length ){
						particle.moveIndex = 0;
						particle.nextIndex = 1;
					}
				}

				var currentPoint = path[particle.moveIndex];
				var nextPoint = path[particle.nextIndex];


				particle.copy( currentPoint );
				particle.lerp( nextPoint, particle.lerpN );
			}
			this.geometry.verticesNeedUpdate = true;
		};

		return pSystem
}



function createLine(geometry){
	var set = geometry

	var lineColor = new THREE.Color(0x154492);

	var material = new THREE.LineBasicMaterial({
		color: 0xff4b49,
		linewidth:3
	});


	var line = new THREE.Line(geometry,material);


	visualizationMesh.add(line);
	//	add it to scene graph
//	visualizationMesh.add( mesh );
}

function createSquare(geometry){

	var material = new THREE.LineBasicMaterial({
		color: 0xd75b49,
		linewidth:5
	});

	var square = new THREE.Mesh(geometry, material)

	vizualizationMesh.add()
}
