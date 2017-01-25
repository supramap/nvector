//var pSystem;

function initializeParticles(generatedParticles){
	// load the shaders
	particleAttributes = {

		size: {	type: 'f', value: [] },
		customColor: { type: 'c', value: [] }

	};

	particleUniforms = {

		amplitude: { type: "f", value: 1.0 },
		color:     { type: "c", value: new THREE.Color( 0xffaa00 ) },
		texture:   { type: "t", value: particleTexture/*THREE.ImageUtils.loadTexture( "../images/particleA.png" )*/ },

	};


	var particleMaterial = new THREE.ShaderMaterial( {

		uniforms:       particleUniforms,
		/*attributes:     particleAttributes,*/
		vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true

	});

	//var particleMaterial = new THREE.PointsMaterial({size:1, map:particleTexture, alphaTest:.5, vetexColors: THREE.VertexColors, transparent:true});
	// after the shaders are loaded build the particle system
	/*var particleMaterial = new THREE.ShaderMaterial({

		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader = documetn.getElementById('fragmentshader').textContent,
		uniforms: particleUniforms,
		depthWrite: false,
		transparent: true,
		blending: THREE.AdditiveBlending
	});*/

	/*var values_size = particleAttributes.size.value;
	var values_color = particleAttributes.customColor.value

	for(var i = 0 ; i < generatedParticles.vertices.length; i++){
		values_size[i] = 3;
		values_color[ i ] = new THREE.Color( 0xffaa00 );
		values_color[i].setHSL(.2,.7,.4);
	}

	generatedParticles.addAttribute('customColor', new THREE.BufferAttribute(new Float32Array(values_color)),3 );
	generatedParticles.addAttribute('size', new THREE.BufferAttribute(new Float32Array(values_color)),1 );
	*/

	pSystem = new THREE.Points(generatedParticles,particleMaterial);
	//pSystem.attributes = particleAttributes;


	pSystem.update = function(){
			// var time = Date.now()
			for( var i = 0; i < this.geometry.attributes.position.length; i+3 ){
				if(i == "extend"){
					return;
				}

				//var particle = this.geometry.vertices[i];
				var path = this.geometry.movement.paths[i/3];
				//var moveLength = path.length;

				this.geometry.movement.indices[i/3].lerpN+= 0.05;
				if(this.geometry.movement.indices[i/3].lerpN > 1){
					this.geometry.movement.indices[i/3].lerpN = 0;
					this.geometry.movement.indices[i/3].moveIndex = this.geometry.movement.indices[i/3].nextIndex;
					this.geometry.movement.indices[i/3].nextIndex = this.geometry.movement.indices[i/3].nextIndex + 3;
					if( this.geometry.movement.indices[i/3].nextIndex >= path.length ){
						this.geometry.movement.indices[i/3].moveIndex = 0;
						this.geometry.movement.indices[i/3].nextIndex = 3;
					}
				}
				var currentPoint = new THREE.Vector3(path[particle.moveIndex],path[particle.moveIndex + 1],path[particle.moveIndex + 2]);
				var nextPoint = new THREE.Vector3(path[particle.nextIndex],path[particle.nextIndex + 1],path[particle.nextIndex + 2]);

				var positionS = this.geometry.attributes.position[i];
				var mathVector = new THREE.Vector3(positionS[i],positionS[i+1],positionS[i+2]);
				particle.copy( currentPoint );
				particle.lerp( nextPoint, particle.lerpN );
			}
			//this.geometry.verticesNeedUpdate = true;
		};


		return pSystem
}



function generateParticles(lineData){
	// I will require something to continue storing the line data in to control
	// the movement of the particles.
	var particleMovement = {};
	particleMovement.paths = [];
	particleMovement.indices = [];

	var	particleCount = 0;
	var particlesGeo = new THREE.BufferGeometry();

	var valuesSize = [];
	var valuesColor = [];
	var valuesPosition = [];


	//particlesGeo.addAttribute('customColor', new THREE.BufferAttribute(new Float32Array(values_color)),3 );
	//particlesGeo.addAttribute('size', new THREE.BufferAttribute(new Float32Array(values_size)),1 );

	for(var linePos = 0; linePos < lineData.length; linePos++){
		var currentLine = lineData[linePos];

		// calculate a replacement for the lineLength
		var arrLength = currentLine.length;
		var firstPoint = new THREE.Vector3(currentLine[0],currentLine[1],currentLine[2]);
		var lastPoint = new THREE.Vector3(currentLine[arrLength-3],currentLine[arrLength-2],currentLine[arrLength-1]);
		var directDistance = firstPoint.distanceTo(lastPoint);

		//particleCount = Math.floor(Math.sqrt(	(Math.pow(directDistance,2))/4	));
		particleCount = Math.floor(Math.sqrt(directDistance));
		for(var i = 0; i < particleCount; i++){
			var lineIndex = i/particleCount * (currentLine.length/3);
			var rIndex = Math.floor(lineIndex);
			var baseIndex = rIndex * 3;
			//old particle
			//var particle = new THREE.Vector3(currentLine[baseIndex],currentLine[baseIndex+1],currentLine[baseIndex+2]);
			var indexInfo = {};

			indexInfo.moveIndex = baseIndex;
			indexInfo.nextIndex = baseIndex+3;
			indexInfo.lerpN = 0;
			particleMovement.indices.push(indexInfo);
			//if(particle.nextIndex >= (currentLine.length/3) )
					//particle.nextIndex = 0;

			particleMovement.paths.push(currentLine);
			//particlesGeo.vertices.push(particle);
			$.merge(valuesPosition,[currentLine[baseIndex],currentLine[baseIndex+1],currentLine[baseIndex+2]])



			valuesSize[i] = 3;
			valuesColor[ i ] = new THREE.Color( 0xffaa00 );
			valuesColor[i].setHSL(.2,.7,.4);
		}



	}

	particlesGeo.addAttribute('customColor', new THREE.BufferAttribute(new Float32Array(valuesColor)),3 );
	particlesGeo.addAttribute('position', new THREE.BufferAttribute(new Float32Array(valuesPosition)),3 );
	particlesGeo.addAttribute('size', new THREE.BufferAttribute(new Float32Array(valuesSize)),1 );

	particlesGeo.movement = particleMovement;

	return particlesGeo;

}




function initializeSpheres(ingeometry,rootPosition){
	var spheresGeometry = new THREE.Geometry();

	/*var sphereAttributes = {
		size: {	type: 'f', value: [] },
    customColor: { type: 'c', value: [] }
	}

	var sphereUniforms ={
		amplitude: { type: "f", value: 1.0 },
		color:     { type: "c", value: new THREE.Color( 0xffaa00 ) },
		texture:   { type: "t", value: sphereTexture }
	}*/

	/*var sphmat = new THREE.ShaderMaterial({
  uniforms: sphereUniforms,
  /*attributes: sphereAttributes,*/
  /*vertexShader: document.getElementById( 'sphereVertex' ).textContent,
  fragmentShader: document.getElementById( 'sphereFragment' ).textContent,
});*/


	sphmat = new THREE.PointsMaterial({size:3, map:sphereTexture, alphaTest:.5, vertexColors:THREE.VertexColors, transparent:true})

	var colorsArr = [];
	for(var i = 0; i < ingeometry.length;i++){
		var currentGeo = ingeometry[i];
		var vertex = new THREE.Vector3(currentGeo['location'][0],currentGeo['location'][1],currentGeo['location'][2]);
		vertex.nodeName=currentGeo['name'];
		spheresGeometry.vertices.push(vertex);
		//sphereAttributes.size.value[i] = 5;
		//sphereAttributes.customColor.value[i] = new THREE.Color(currentGeo.color);
		colorsArr.push(new THREE.Color(currentGeo.color));
	}



	//spheresGeometry.attributes = sphereAttributes;
	spheresGeometry.colors = colorsArr;
	var spherePSystem = new THREE.Points(spheresGeometry,sphmat);
	spherePSystem.rootPosition = rootPosition;



	// still need to add to the custom color based upon the values provided
	// in ingeometry
	return spherePSystem;
}

function initializeLines(lineData,defaultColor,colOptions,rootPos){
	if(defaultColor == undefined){
		defaultColor = [1,1,1];
	}

	var lineGeo = new THREE.BufferGeometry();
	var lineMat = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors});
	// For increased line width:
	//lineMat.linewidth = 2;
	lineMat.linewidth = $("input:radio[name=lnwidth]:checked").val();


	var linepos = []
	var posIndex = 0;
	var colors = [];
	var indicesArr = []

 	var colIndex = [];
	var colcol = [];
	// need to write a quicksort

	if(colOptions){
		for(var i = 0; i < colOptions.length; i++){
			var colSel = colOptions[i];
			var ind = rootDataStore[rootPos][0].data[colSel.strt].edgeIndices;
			var childrenBuff = 0;
			var childrenAr = rootDataStore[rootPos][0].data[colSel.strt].children;
			var bad = true;
			for(var c = 0; c < childrenAr.length; c++){
				if(childrenAr[c] == colSel.end){
					bad = false;
					break;
				}
				else{
					childrenBuff++;
				}

			}
			if(bad){
				continue;
			}
			ind = ind + childrenBuff;
			colIndex.push(ind);
			colcol.push(colSel.c);
		}

		var sorted = quickSort(colIndex, colcol, 0, colIndex.length -1);
		var cleanSort = removeDup(sorted);
		colIndex = cleanSort[0];
		colcol = cleanSort[1];
	}

	var p = 0;
	var coloring = false;
	for(var i = 0; i < lineData.length;i++){
		//linepos = linepos.concat(lineData[i]);
		$.merge(linepos,lineData[i])
		var calcLength = (lineData[i].length/3) -1;
		for(var seg = 0; seg < calcLength; ++seg ){
			indicesArr.push(posIndex + seg,posIndex + seg +1);

		}

		// calculate the color positions for each line
		if(colIndex[p] == i){
			coloring = true;
		}
		var colorDuration = 0;
		//p is the current index position of the color starting place currently being
		// searched for


		for(ccount = 0; ccount < lineData[i].length; ccount = ccount + 3){
			//colors.push(Math.random()*0.5+0.5, Math.random()*0.5+0.5, 1);
			if(colIndex.length > 0 && coloring == true){
				var toMerge = [colcol[p].r/255,colcol[p].g/255,colcol[p].b/255];
				$.merge(colors,toMerge);

			}
			else{
				$.merge(colors,defaultColor);
			}
		}
		if(coloring == true){
			coloring = false;
			p++;
		}

		posIndex = posIndex + calcLength + 1;
		//colors.push(.9, .2, .4);
		//colors.push(Math.random()*0.5+0.5, Math.random()*0.5+0.5, 1);
	}
	// test for colors
  lineGeo.setIndex(new THREE.BufferAttribute( new Uint32Array( indicesArr ), 1 ));
	//lineGeo.addAttribute( 'index', new THREE.BufferAttribute( new Uint32Array( indicesArr ), 1 ) );
	lineGeo.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( linepos ), 3 ) );
	lineGeo.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( colors ), 3 ) );
	lineGeo.computeBoundingSphere();

	var mesh = new THREE.Line(lineGeo, lineMat, THREE.LineSegments);

	return mesh;
}



function initializeLinesTest(lineData){

	var lineGeo = new THREE.BufferGeometry();
	var lineMat = new THREE.LineBasicMaterial();

	var linepos = []
	var posIndex = 0;
	var colors = [];
	var indicesArr = [];
	var pretendIndices = [0,1,1,2,2,3,3,4,4,5,5,6,7,8,8,9,9,10,10,11,11,12]

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





function updateAllParticles(){
	for(var i = 0 ; i < particleUniverse.children.length; i++){
		// I will probably need an if conditional in here at some point to help
		// manage which particles are shown.
		particleUniverse.children[i].update();
		particleUniverse.children[i].geometry.verticesNeedUpdate = true;
	}
}

function hideAllParticles(){
	for(var i = 0 ; i < particleUniverse.children.length; i++){
		particleUniverse.children[i].visible = false;
	}
}

function testLiveParticle(){
	hideAllParticles();
	if(particlesExist){
		// get the currently selected view and display it's particles.
		var checkedRadio = $("input:radio:checked");
		var graphPos = parseInt(checkedRadio[0].value);
		particleUniverse.children[graphPos].visible=true;
	}
}
