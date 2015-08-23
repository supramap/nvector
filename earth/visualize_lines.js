var globeRadius = 1000;
var vec3_origin = new THREE.Vector3(0,0,0);
var rad = 100;
var freshLines = [];

function makeConnectionLineGeometry( startpos, endpos, value ){
	if( startpos.countryName == undefined || importer.countryName == undefined )
		return undefined;

	// console.log("making connection between " + startpos.countryName + " and " + endpos.countryName + " with code " + type );

	var distanceBetweenCountryCenter = exporter.center.clone().sub(importer.center).length();

	//	how high we want to shoot the curve upwards
	var anchorHeight = globeRadius + distanceBetweenCountryCenter * 0.7;

	//	start of the line
	var start = exporter.center;

	//	end of the line
	var end = importer.center;

	//	midpoint for the curve
	var mid = start.clone().lerpSelf(end,0.5);
	var midLength = mid.length()
	mid.normalize();
	mid.multiplyScalar( midLength + distanceBetweenCountryCenter * 0.7 );

	//	the normal from start to end
	var normal = (new THREE.Vector3()).subVectors(start,end);
	normal.normalize();

	/*
				The curve looks like this:

				midStartAnchor---- mid ----- midEndAnchor
			  /											  \
			 /											   \
			/												\
	start/anchor 										 end/anchor

		splineCurveA							splineCurveB
	*/

	var distanceHalf = distanceBetweenCountryCenter * 0.5;

	var startAnchor = start;
	var midStartAnchor = mid.clone().addSelf( normal.clone().multiplyScalar( distanceHalf ) );
	var midEndAnchor = mid.clone().addSelf( normal.clone().multiplyScalar( -distanceHalf ) );
	var endAnchor = end;

	//	now make a bezier curve out of the above like so in the diagram
	var splineCurveA = new THREE.CubicBezierCurve3( start, startAnchor, midStartAnchor, mid);
	// splineCurveA.updateArcLengths();

	var splineCurveB = new THREE.CubicBezierCurve3( mid, midEndAnchor, endAnchor, end);
	// splineCurveB.updateArcLengths();

	//	how many vertices do we want on this guy? this is for *each* side
	var vertexCountDesired = Math.floor( /*splineCurveA.getLength()*/ distanceBetweenCountryCenter * 0.02 + 6 ) * 2;

	//	collect the vertices
	var points = splineCurveA.getPoints( vertexCountDesired );

	//	remove the very last point since it will be duplicated on the next half of the curve
	points = points.splice(0,points.length-1);

	points = points.concat( splineCurveB.getPoints( vertexCountDesired ) );

	//	add one final point to the center of the earth
	//	we need this for drawing multiple arcs, but piled into one geometry buffer
	points.push( vec3_origin );

	var val = value * 0.0003;

	var size = (10 + Math.sqrt(val));
	size = constrain(size,0.1, 60);

	//	create a line geometry out of these
	var curveGeometry = THREE.Curve.Utils.createLineGeometry( points );

	curveGeometry.size = size;

	return curveGeometry;
}


function makeLineGeometry(exporter,importer, value, exportType, importType){
	if(exportType == 'country'){
		exporter = countryData[exporter]
	}
	else{
		exporter = stateData[exporter]
	}
	if(importType == 'country' ){
		importer = countryData[importer]
	}
	else{
		importer = stateData[importer]
	}


	var cloned = exporter.center.clone();
	var subslf = cloned.sub(importer.center)
	var lngth = subslf.length();




	var distanceBetweenCountryCenter = exporter.center.clone().sub(importer.center).length();

	//	how high we want to shoot the curve upwards
	var anchorHeight = globeRadius + distanceBetweenCountryCenter * 0.7;

	//	start of the line
	var start = exporter.center;

	//	end of the line
	var end = importer.center;

	//	midpoint for the curve
	var mid = start.clone().lerp(end,0.5);
	var midLength = mid.length()
	mid.normalize();
	mid.multiplyScalar( midLength + distanceBetweenCountryCenter * 0.4 );

	//	the normal from start to end
	var normal = (new THREE.Vector3()).subVectors(start,end);
	normal.normalize();

	/*
				The curve looks like this:

				midStartAnchor---- mid ----- midEndAnchor
			  /											  \
			 /											   \
			/												\
	start/anchor 										 end/anchor

		splineCurveA							splineCurveB
	*/

	var distanceHalf = distanceBetweenCountryCenter * 0.5;

	var startAnchor = start;
	var midStartAnchor = mid.clone().add( normal.clone().multiplyScalar( distanceHalf ) );
	var midEndAnchor = mid.clone().add( normal.clone().multiplyScalar( -distanceHalf ) );
	var endAnchor = end;

	//	now make a bezier curve out of the above like so in the diagram
	var splineCurveA = new THREE.CubicBezierCurve3( start, startAnchor, midStartAnchor, mid);
	// splineCurveA.updateArcLengths();

	var splineCurveB = new THREE.CubicBezierCurve3( mid, midEndAnchor, endAnchor, end);
	// splineCurveB.updateArcLengths();

	//	how many vertices do we want on this guy? this is for *each* side
	var vertexCountDesired = Math.floor( /*splineCurveA.getLength()*/ distanceBetweenCountryCenter * 0.02 + 6 ) * 2;

	//	collect the vertices
	var points = splineCurveA.getPoints( vertexCountDesired );

	//	remove the very last point since it will be duplicated on the next half of the curve
	points = points.splice(0,points.length-1);

	points = points.concat( splineCurveB.getPoints( vertexCountDesired ) );

	//	add one final point to the center of the earth
	//	we need this for drawing multiple arcs, but piled into one geometry buffer
	points.push( vec3_origin );

	var val = value * 0.0003;

	var size = (10 + Math.sqrt(val));
	size = constrain(size,0.1, 60);

	//	create a line geometry out of these
	var curveGeometry = THREE.Curve.Utils.createLineGeometry( points );

	curveGeometry.size = size;

	return curveGeometry;
}


function makeGraphGeometry(connectionObj){
		var roots = connectionObj.TreeRoots;
		for (var i = 0; i < roots.length; i++){
			var current = roots[i];
			recurseRebuild(current,connectionObj);
		}
		return freshLines;
}

// recursive function to iterate through the object and construct the places.
function recurseRebuild(current, bigObj){
	var node = bigObj[current];
	// if leaf node, convert the current coordinates into three dimentional points

	if(node.children.length == 0){
		if(node.coord != "NONE"){
				if(node.coord instanceof THREE.Vector3){
					return;
				}
			// convert the coordinates to three dimensional point
			//	take the lat lon from the data and convert this to 3d globe space
			  var strCord = node.coord.split(":");


        var lon = parseFloat(strCord[1]); //- 90;
        var lat = parseFloat(strCord[0]);

        var phi = Math.PI/2 - lat * Math.PI / 180 - Math.PI * 0.00//0.01;
        var theta = 2 * Math.PI - lon * Math.PI / 180 + Math.PI * 0.00//0.06;

				var center = new THREE.Vector3();
        center.x = Math.sin(phi) * Math.cos(theta) * rad;
        center.y = Math.cos(phi) * rad;
        center.z = Math.sin(phi) * Math.sin(theta) * rad;
				node.coord = center;


				// simple test

				var testGeo = createTestMarker(lat,lon);
				console.log("good : " + testGeo.vertices);
				console.log("bad : " + center);
				/*var testline = new THREE.Line(testGeo);
				scene.add(testline);
				console.log(lat + " " + lon);
				*/
				// simple test
		}
		return [];
	}

	else{
		// assume that this is a parenting node and begin recursion on this node
		//conlines = [];
		// iterate through all of the children and recurse
		var childPositions = [];
		for(var i = 0; i < node.children.length; i++){
				var child = node.children[i];
				var recRet = recurseRebuild(child, bigObj);
				//conlines.push.apply(conlines,recRet);
				var childCoord = bigObj[child].coord
				// In some cases the child Coordinate may be NONE...now what
				if(childCoord != "NONE"){
						childPositions.push(childCoord);
				}

		}
		var midPoint = null;
		// on return from recursion, calculate the midpoint location of this node

		//var midLength = midPoint.length()
		var distanceBetweenCenter = 0//firstPoint.clone().sub(secondPoint.center).length();
		//midPoint.normalize();
		//midPoint.multiplyScalar( midLength + distanceBetweenCenter * 0.4 );
		var avg = 0;
		for(var i = 0; i < childPositions.length; i++){
			if(midPoint == null){
				if(childPositions.length == 1){
					midPoint = childPositions[i].clone();
					distanceBetweenCenter = 30;
				}
				else{
					var firstPoint = childPositions[i];
					i= i + 1;
					var secondPoint = childPositions[i];
					midPoint = firstPoint.lerp(secondPoint,.5);
					avg = firstPoint.sub(secondPoint).length();
					var distanceBetweenCenter = firstPoint.clone().sub(secondPoint.clone()).length();
				}
			}
			else{
				var nextPoint = childPositions[i];
				midPoint = midPoint.lerp(nextPoint,.5);

			}
		}
		var midLength = midPoint.length();
		midPoint.normalize();
		midPoint.multiplyScalar(midLength + distanceBetweenCenter * 0.4);
		bigObj[current].coord = midPoint;

		//create and push newly made lines
		for(var i = 0; i < childPositions.length; i++){
			var currentGeometry = new THREE.Geometry();
			currentGeometry.vertices.push(midPoint,childPositions[i]);
			var currentLine = new THREE.Line(currentGeometry);
			freshLines.push(currentLine);

		}
		//console.log(conlines);
		return;
	}
}

function createMarker(place, type){
	// determine place type and gather appropriate coordinates
	var lat,lon;

	if (type == 'country'){
		lat = countryData[place].lat
		lon = countryData[place].lon
		place = countryData[place]
	}
	else{
		lat = stateData[place].lat
		lon = stateData[place].lon
		place = stateData[place]
	}

	var center = place.center;

	//var rad = 110;

	//var phi = Math.PI/2 - lat * Math.PI / 180 - Math.PI * 0.01;
    //var theta = 2 * Math.PI - lon * Math.PI / 180 + Math.PI * 0.06;

	var endPoint = new THREE.Vector3();
        endPoint.x = center.x + (center.x * .05);
        endPoint.y = center.y + (center.y * .05);
        endPoint.z = center.z + (center.z * .05);

    var geometry = new THREE.Geometry();

    geometry.vertices.push(center);
    geometry.vertices.push(endPoint);
    return geometry

}


function createTestMarker(latit, longit){
	// determine place type and gather appropriate coordinates
	var rad = 100;
	var lat = latit;
	var lon = longit //- 90;


	var phi = Math.PI/2 - lat * Math.PI / 180 - Math.PI * 0.000//0.01;
	var theta = 2 * Math.PI - lon * Math.PI / 180 + Math.PI * 0.00//0.06;

var center = new THREE.Vector3();
	center.x = Math.sin(phi) * Math.cos(theta) * rad;
	center.y = Math.cos(phi) * rad;
	center.z = Math.sin(phi) * Math.sin(theta) * rad;

	//var rad = 110;

	//var phi = Math.PI/2 - lat * Math.PI / 180 - Math.PI * 0.01;
    //var theta = 2 * Math.PI - lon * Math.PI / 180 + Math.PI * 0.06;

	var endPoint = new THREE.Vector3();
        endPoint.x = center.x + (center.x * .05);
        endPoint.y = center.y + (center.y * .05);
        endPoint.z = center.z + (center.z * .05);

    var geometry = new THREE.Geometry();

    geometry.vertices.push(center);
    geometry.vertices.push(endPoint);
    return geometry

}

function createSquareMarker(place, type){
	var lat,lon;

	if (type == 'country'){
		lat = countryData[place].lat
		lon = countryData[place].lon
		place = countryData[place]
	}
	else{
		lat = stateData[place].lat
		lon = stateData[place].lon
		place = stateData[place]
	}

	var center = place.center;
}



function constrain(v, min, max){
	if( v < min )
		v = min;
	else
	if( v > max )
		v = max;
	return v;
}
