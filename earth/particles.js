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


	pSystem = new THREE.PointCloud(particlesGeo,particleMaterial);

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



function generateParticles(points,lineLength){
	var	particleSize = 2;
	// this may change to be relative to the size of the line.
	particleCount = Math.floor(Math.sqrt(lineLength)) - 1;
	for(var i = 0; i < particleCount; i++){
		var lineIndex = i/particleCount * points.length;
		var rIndex = Math.floor(lineIndex);

		// the point within the line's geometry where the particle starts
		var point = points[rIndex];
		// clone the points vertices into a particle
		var particle = point.clone();
		// determine where it goes next
		particle.moveIndex = rIndex;
		particle.nextIndex = rIndex+1;
		if(particle.nextIndex >= points.length )
				particle.nextIndex = 0;
		particle.lerpN = 0;
		particle.path = points;
		particlesGeo.vertices.push( particle );
		particle.size = particleSize;
	}

}


function initializeSpheres(ingeometry){
	var spheresGeometry = new THREE.Geometry();

	var sphereAttributes = {
		size: {	type: 'f', value: [] },
    customColor: { type: 'c', value: [] }
	}

	var sphereUniforms ={
		amplitude: { type: "f", value: 1.0 },
		color:     { type: "c", value: new THREE.Color( 0xffaa00 ) },
		texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "ball.png" ) }
	}

	var sphmat = new THREE.ShaderMaterial({
  uniforms: sphereUniforms,
  attributes: sphereAttributes,
  vertexShader: document.getElementById( 'sphereVertex' ).textContent,
  fragmentShader: document.getElementById( 'sphereFragment' ).textContent,
	});

	for(var i = 0; i < ingeometry.length;i++){
		var currentGeo = ingeometry[i];
		var vertex = new THREE.Vector3(currentGeo['location'][0],currentGeo['location'][1],currentGeo['location'][2]);
		spheresGeometry.vertices.push(vertex);
		sphereAttributes.size.value[i] = 5;
		sphereAttributes.customColor.value[i] = new THREE.Color(currentGeo.color);
	}




	var spherePSystem = new THREE.PointCloud(spheresGeometry,sphmat);




	// still need to add to the custom color based upon the values provided
	// in ingeometry
	return spherePSystem;
}

function initializeLines(){

}


function generateSpheres(){

}

function generateLines(){

}
