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
		vertex.nodeName=currentGeo['name'];
		spheresGeometry.vertices.push(vertex);
		sphereAttributes.size.value[i] = 5;
		sphereAttributes.customColor.value[i] = new THREE.Color(currentGeo.color);
	}




	var spherePSystem = new THREE.PointCloud(spheresGeometry,sphmat);




	// still need to add to the custom color based upon the values provided
	// in ingeometry
	return spherePSystem;
}

function initializeLines(lineData){

	var lineGeo = new THREE.BufferGeometry();
	var lineMat = new THREE.LineBasicMaterial();

	var linepos = []
	var posIndex = 0;
	var colors = [];
	var indicesArr = []

	for(var i = 0; i < lineData.length;i++){
		//linepos = linepos.concat(lineData[i]);
		$.merge(linepos,lineData[i])
		var calcLength = (lineData[0].length/3) -1;
		for(var seg = 0; seg < calcLength; ++seg ){
			indicesArr.push(posIndex + seg,posIndex + seg +1);
		}
		posIndex = posIndex + calcLength + 1;

		colors.push(Math.random()*0.5+0.5, Math.random()*0.5+0.5, 1);
	}

	lineGeo.addAttribute( 'index', new THREE.BufferAttribute( new Uint32Array( indicesArr ), 1 ) );
	lineGeo.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( linepos ), 3 ) );
	lineGeo.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( colors ), 3 ) );
	lineGeo.computeBoundingSphere();

	var mesh = new THREE.Line(lineGeo, lineMat, THREE.LinePieces);

	return mesh;
}
