var globeRadius = 1000;
var vec3_origin = new THREE.Vector3(0,0,0);
var rad = 100;
var freshLines, freshNodes;
var particlesGeo;
var cantPlace = [];

function makeGraphGeometry(connectionObj, startP, endP){
		freshNodes = [];
		freshLines = [];
		var roots = connectionObj.options.roots;
		particlesGeo = new THREE.Geometry();
		for (var i = 0; i < roots.length; i++){
			var current = roots[i];
			if(connectionObj.options.time == true){
					if(startP == undefined || endP == undefined){
						var range = connectionObj.options.timeRange
						recurseRebuild(current,connectionObj.data,range[0],range[1]);
					}
					else{
						recurseRebuild(current,connectionObj.data,startP,endP);
					}
			}
			else{
					recurseRebuild(current,connectionObj.data);
			}

		}
		return freshLines;
}

// recursive function to iterate through the object and construct the places.
function recurseRebuild(current, bigObj,dateStart,dateEnd){
	var node = bigObj[current];
	// if leaf node, convert the current coordinates into three dimentional points

	if(node.children.length == 0){
		if(node.coord != "NONE"){
				if(node.coord instanceof THREE.Vector3 || ( (dateStart != undefined && dateEnd != undefined) && !(new Date(node.date) >= new Date(dateStart) && new Date(node.date) <= new Date(dateEnd)))){
					return 1;
				}
			//	take the lat lon from the data and convert this to 3d globe space
				var center = locationToVector(node.coord[0], node.coord[1]);
				if(node.coord[0] == undefined || node.coord[1] == undefined){
					cantPlace.push(current);
				}
				node.coord = center;

				// make a sphere to represent this node, I'll give it a color to indicate
				// that it is a leaf
				var sphere = createSphere(0xfffc32, current,center);
				freshNodes.push(sphere);

		}
		return 1;
	}

	else{
		// assume that this is a parenting node and begin recursion on this node
		//conlines = [];
		// iterate through all of the children and recurse

		var childPositions = [];
		var childDates = [];
		var currentLevel = 0;
		for(var i = 0; i < node.children.length; i++){

				var child = node.children[i];
				if (child == current){
					continue
				}
				var recRet = recurseRebuild(child, bigObj,dateStart, dateEnd);
				// test if the returned Value is higher than the current level
				// if so then set the current level to be higher.
				if(recRet > currentLevel){
					currentLevel = recRet;
				}

				//conlines.push.apply(conlines,recRet);
				var childCoord = bigObj[child].coord
				// pull the child's recorded date for comparison
				var childDate = bigObj[child].date
				// In some cases the child Coordinate may be NONE or the child
				// may not fall within the currently specified date range.
				if(childCoord != "NONE" && ((dateStart == undefined || dateEnd == undefined)||(new Date(childDate) >= new Date(dateStart) && new Date(childDate) <= new Date(dateEnd)))){
						childPositions.push(childCoord);
						childDates.push(childDate);
				}

		}
		var midPoint = null;
		// on return from recursion, calculate the midpoint location of this node

		//var midLength = midPoint.length()
		var distanceBetweenCenter = 0//firstPoint.clone().sub(secondPoint.center).length();
		//midPoint.normalize();
		//midPoint.multiplyScalar( midLength + distanceBetweenCenter * 0.4 );
		var avg = 0;

		var highestChildLength = 0;

		// calculate the date of the current point based upon the date of its children


		if(!(dateStart == undefined || dateEnd == undefined)){
			var highestChildDate;
			for(var i = 0; i < childDates.length; i++){
				if(highestChildDate == undefined){
					highestChildDate = childDates[i];
				}
			}
			node.date = highestChildDate;
		}


		// calculate the midpoint of the current point based upon the location
		// of its children
		for(var i = 0; i < childPositions.length; i++){

			// If a midpoint doesnt already exist
			if(midPoint == null){
				// if there is only a single child then clone the position of this midpoint
				// to be the same as that child only raised slightly more above the surface
				// of the earth
				if(childPositions.length == 1){
					midPoint = childPositions[i].clone();
					distanceBetweenCenter = 12;
					highestChildLength = midPoint.length();
				}
				// Otherwise start calculating the midpoint between all of the
				// current point's children.
				else{
					var firstPoint = childPositions[i];
					i= i + 1;
					var secondPoint = childPositions[i];

					if(firstPoint.length() > highestChildLength){
						highestChildLength = firstPoint.length();
					}
					if(secondPoint.length() > highestChildLength){
						highestChildLength = secondPoint.length();
					}

					midPoint = firstPoint.clone().lerp(secondPoint.clone(),.5);
					distanceBetweenCenter = firstPoint.distanceTo(secondPoint);
				}
			}
			else{
				var nextPoint = childPositions[i];
				midPoint = midPoint.clone().lerp(nextPoint,.5);
				if(nextPoint.length() > highestChildLength){
					highestChildLength = nextPoint.length()
				}

			}
		}

		// if at this point the midPoint does not exist then assume that this branch
		// should not exist. This is likely going to be due to a date restriction.
		if(midPoint == null){
			return currentLevel + 1;
		}

		var midLength = midPoint.length();
		midPoint.normalize();
		if (distanceBetweenCenter < 3){
			distanceBetweenCenter = 3;
		}
		//console.log(distanceBetweenCenter);
		var test = midLength + distanceBetweenCenter * 0.4;
		// 100 + currentLevel * 3
		// develop the distance scalling factor
		scaling = highestChildLength + ((.5/currentLevel) * (distanceBetweenCenter * ((200 - distanceBetweenCenter)/200)));

		midPoint.multiplyScalar(scaling);
		bigObj[current].coord = midPoint;
		bigObj[current].level = currentLevel;

		// create the node's circle
		var sphere = createSphere(0xfff4234, current,midPoint);
		freshNodes.push(sphere);



		//create and push newly made lines
		for(var i = 0; i < childPositions.length; i++){
			var currentGeometry = new THREE.Geometry();
			// determine if the line needs to be curved
			var distOfLine = midPoint.distanceTo(childPositions[i]);





			if (distOfLine > 35){
				var linepeak = midPoint.clone().lerp(childPositions[i],.5);
				linepeak.setLength(midPoint.length());


				var latepeak = linepeak.clone().lerp(childPositions[i],.5);
				latepeak.setLength(midPoint.length());



				var geometry = new THREE.SphereGeometry( .5 ,10, 10 );

				var material = new THREE.MeshLambertMaterial( {color:0xaa26f1, ambient:0xaa26f1} );
				material.fog = false;
				//material.color.setHSL( .4, 0.1, .8 );


				var lineMat = new THREE.LineBasicMaterial({color: 0xc5c5c5});
				//var curve = new THREE.CubicBezierCurve3(midPoint,linepeak,latepeak,childPositions[i]);

				//var curvePointsOne = segmentLine(midPoint,linepeak,10)
				//var curvePointsTwo = segmentLine(linepeak,childPositions[i],15);

				var curvePoints = []
				curvePoints.push(midPoint);
				//curvePoints = curvePoints.concat(curvePointsOne);
				curvePoints = curvePoints.concat(segmentLine(midPoint,childPositions[i],10));
				//curvePoints.push(linepeak);
				//urvePoints = curvePoints.concat(curvePointsTwo);
				curvePoints.push(childPositions[i]);

				// this still needs work but it may be on the right track
				var curve = new THREE.SplineCurve3(curvePoints);

				currentGeometry.vertices = curve.getPoints(50);
				generateParticles(currentGeometry.vertices, curve.getLength());
				var currentLine = new THREE.Line(currentGeometry,lineMat);
				//currentLine.name = current + " -> " + node.children[i]
				freshLines.push(currentLine);
			}
			else{
				//currentGeometry.vertices.push(midPoint,childPositions[i]);
				var streightCurve = new THREE.LineCurve3(midPoint,childPositions[i])
				currentGeometry.vertices = streightCurve.getPoints(50);
				generateParticles(currentGeometry.vertices,streightCurve.getLength());
				var lineMat = new THREE.LineBasicMaterial({color: 0xc5c5c5});
				var currentLine = new THREE.Line(currentGeometry,lineMat);
				//currentLine.name = current + " -> " + node.children[i]
				freshLines.push(currentLine);
			}

		}
		//console.log(conlines);
		return currentLevel + 1;
	}
}

/*
	A recursive function designed to segment a curve appropriately to produce
	a fluid arc that stays above the earth
*/
function segmentLine(startPoint, endPoint, restraint){
	var lineLength = startPoint.distanceTo(endPoint)
	if(lineLength < restraint){
		return []
	}
	var currentMid = startPoint.clone().lerp(endPoint.clone(),.5);
	currentMid.setLength((startPoint.length() + endPoint.length())/2)
	var firstRetArray = segmentLine(startPoint,currentMid,restraint);
	var secRetArray = segmentLine(currentMid,endPoint, restraint);
	firstRetArray.push(currentMid)
	return firstRetArray.concat(secRetArray);

}

var leafCount = 0;
function calcLeaves(data){
	var allKeys = Object.keys(data);
	for(var i = 0; i < allKeys.length; i++){
		var current = data[allKeys[i]];
		if(current.children.length < 1){
			leafCount++;
		}
	}
}

/*The recursive function is built to  */
function recurseBuild2d(current, bigObj,depth,breadth,dateStart,dateEnd){
	if(node.children.length == 0){
			if(node.coord instanceof THREE.Vector3 || ( (dateStart != undefined && dateEnd != undefined) && !(new Date(node.date) >= new Date(dateStart) && new Date(node.date) <= new Date(dateEnd)))){
				return 1;
			}
			//	take the lat lon from the data and convert this to 3d globe space
			var center = locationToVector(node.coord[0], node.coord[1]);

			node.coord = center;

			// make a sphere to represent this node, I'll give it a color to indicate
			// that it is a leaf
			var sphere = createSphere(0xfffc32, current,center);
			freshNodes.push(sphere);

			return 1;
	}


	else{
		var childPositions = [];
		var childDates = [];
		var currentLevel = 0;
		for(var i = 0; i < node.children.length; i++){

				var child = node.children[i];
				if (child == current){
					continue
				}
				var recRet = recurseRebuild(child, bigObj,dateStart, dateEnd);
				// test if the returned Value is higher than the current level
				// if so then set the current level to be higher.
				if(recRet > currentLevel){
					currentLevel = recRet;
				}

				//conlines.push.apply(conlines,recRet);
				var childCoord = bigObj[child].coord
				// pull the child's recorded date for comparison
				var childDate = bigObj[child].date
				// In some cases the child Coordinate may be NONE or the child
				// may not fall within the currently specified date range.
				if(childCoord != "NONE" && ((dateStart == undefined || dateEnd == undefined)||(new Date(childDate) >= new Date(dateStart) && new Date(childDate) <= new Date(dateEnd)))){
						childPositions.push(childCoord);
						childDates.push(childDate);
				}

		}
		var midPoint = null;
		// on return from recursion, calculate the midpoint location of this node

		//var midLength = midPoint.length()
		var distanceBetweenCenter = 0//firstPoint.clone().sub(secondPoint.center).length();
		//midPoint.normalize();
		//midPoint.multiplyScalar( midLength + distanceBetweenCenter * 0.4 );
		var avg = 0;

		var highestChildLength = 0;

		// calculate the date of the current point based upon the date of its children


		if(!(dateStart == undefined || dateEnd == undefined)){
			var highestChildDate;
			for(var i = 0; i < childDates.length; i++){
				if(highestChildDate == undefined){
					highestChildDate = childDates[i];
				}
			}
			node.date = highestChildDate;
		}


		// calculate the midpoint of the current point based upon the location
		// of its children
		for(var i = 0; i < childPositions.length; i++){

			// If a midpoint doesnt already exist
			if(midPoint == null){
				// if there is only a single child then clone the position of this midpoint
				// to be the same as that child only raised slightly more above the surface
				// of the earth
				if(childPositions.length == 1){
					midPoint = childPositions[i].clone();
					distanceBetweenCenter = 12;
					highestChildLength = midPoint.length();
				}
				// Otherwise start calculating the midpoint between all of the
				// current point's children.
				else{
					var firstPoint = childPositions[i];
					i= i + 1;
					var secondPoint = childPositions[i];

					if(firstPoint.length() > highestChildLength){
						highestChildLength = firstPoint.length();
					}
					if(secondPoint.length() > highestChildLength){
						highestChildLength = secondPoint.length();
					}

					midPoint = firstPoint.clone().lerp(secondPoint.clone(),.5);
					distanceBetweenCenter = firstPoint.distanceTo(secondPoint);
				}
			}
			else{
				var nextPoint = childPositions[i];
				midPoint = midPoint.clone().lerp(nextPoint,.5);
				if(nextPoint.length() > highestChildLength){
					highestChildLength = nextPoint.length()
				}

			}
		}

		// if at this point the midPoint does not exist then assume that this branch
		// should not exist. This is likely going to be due to a date restriction.
		if(midPoint == null){
			return currentLevel + 1;
		}

		var midLength = midPoint.length();
		midPoint.normalize();
		if (distanceBetweenCenter < 3){
			distanceBetweenCenter = 3;
		}
		//console.log(distanceBetweenCenter);
		var test = midLength + distanceBetweenCenter * 0.4;
		// 100 + currentLevel * 3
		// develop the distance scalling factor
		scaling = highestChildLength + ((.5/currentLevel) * (distanceBetweenCenter * ((200 - distanceBetweenCenter)/200)));

		midPoint.multiplyScalar(scaling);
		bigObj[current].coord = midPoint;
		bigObj[current].level = currentLevel;

		// create the node's circle
		var sphere = createSphere(0xfff4234, current,midPoint);
		freshNodes.push(sphere);



		//create and push newly made lines
		for(var i = 0; i < childPositions.length; i++){
			var currentGeometry = new THREE.Geometry();
			// determine if the line needs to be curved
			var distOfLine = midPoint.distanceTo(childPositions[i]);





			if (distOfLine > 35){
				var linepeak = midPoint.clone().lerp(childPositions[i],.5);
				linepeak.setLength(midPoint.length());


				var latepeak = linepeak.clone().lerp(childPositions[i],.5);
				latepeak.setLength(midPoint.length());



				var geometry = new THREE.SphereGeometry( .5 ,10, 10 );

				var material = new THREE.MeshLambertMaterial( {color:0xaa26f1, ambient:0xaa26f1} );
				material.fog = false;
				//material.color.setHSL( .4, 0.1, .8 );


				var lineMat = new THREE.LineBasicMaterial({color: 0xc5c5c5});
				//var curve = new THREE.CubicBezierCurve3(midPoint,linepeak,latepeak,childPositions[i]);

				//var curvePointsOne = segmentLine(midPoint,linepeak,10)
				//var curvePointsTwo = segmentLine(linepeak,childPositions[i],15);

				var curvePoints = []
				curvePoints.push(midPoint);
				//curvePoints = curvePoints.concat(curvePointsOne);
				curvePoints = curvePoints.concat(segmentLine(midPoint,childPositions[i],10));
				//curvePoints.push(linepeak);
				//urvePoints = curvePoints.concat(curvePointsTwo);
				curvePoints.push(childPositions[i]);

				// this still needs work but it may be on the right track
				var curve = new THREE.SplineCurve3(curvePoints);

				currentGeometry.vertices = curve.getPoints(50);
				generateParticles(currentGeometry.vertices, curve.getLength());
				var currentLine = new THREE.Line(currentGeometry,lineMat);
				//currentLine.name = current + " -> " + node.children[i]
				freshLines.push(currentLine);
			}
			else{
				//currentGeometry.vertices.push(midPoint,childPositions[i]);
				var streightCurve = new THREE.LineCurve3(midPoint,childPositions[i])
				currentGeometry.vertices = streightCurve.getPoints(50);
				generateParticles(currentGeometry.vertices,streightCurve.getLength());
				var lineMat = new THREE.LineBasicMaterial({color: 0xc5c5c5});
				var currentLine = new THREE.Line(currentGeometry,lineMat);
				//currentLine.name = current + " -> " + node.children[i]
				freshLines.push(currentLine);
			}

		}
		//console.log(conlines);
		return currentLevel + 1;
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



function constrain(v, min, max){
	if( v < min )
		v = min;
	else
	if( v > max )
		v = max;
	return v;
}
