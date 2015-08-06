

function getVisualizedMesh(){

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
