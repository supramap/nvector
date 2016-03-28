var globeRadius = 1000;
var vec3_origin = new THREE.Vector3(0,0,0);
var rad = 100;
var freshLines, freshNodes;
var cantPlace = [];

/*
	The makeGraphGeometry function is where the magic begins. This function is
	effectively the helper function for the recursiveRebuild function that actually
	generates the 3d graph. Here it is determined as to weather or not a webworker
	is available, and all of the organization of the data is completed.

	Nothing is returned however a THREE.Object3D object is placed in a global
	array relative to its rootPosition.
*/
function makeGraphGeometry(connectionObj, startP, endP, rootPosition){
		freshNodes = [];
		freshLines = [];

		if(typeof(Worker) !== "undefined"){
			var graphWorker = new Worker("graphWorker.js");

			// check for optional roots so that they can be stuffed into the sendObject

			var sendObject = {"type":"3d","obj":connectionObj,"stt":startP,"stp":endP,"custRoots":rootDataStore[rootPosition][2]}
			graphWorker.postMessage(JSON.stringify(sendObject));
			graphWorker.onmessage = function(e){
				// Take the data returned from the thread and convert it into the
				// appropriate systems for gpu rendering
				var dataset = JSON.parse(e.data);
				var allSpheres = initializeSpheres(dataset.nodes,rootPosition);
				var allLines = initializeLines(dataset.lines,connectionObj.options.defaultColor);
				var graphObject = new THREE.Object3D();
				graphObject.add(allSpheres);
				graphObject.add(allLines);

				var currentParticleSystem = initializeParticles(generateParticles(dataset.lines));
				particleUniverse.children[rootPosition] = currentParticleSystem;
				graph.children[rootPosition] = graphObject;
				// try and hide all of the non-checked children at this point.
				hideGraph();
				// check if particles are enabled and show only the particles of the selected graph
				testLiveParticle();

			}
		}
		else{
			var roots;
			if(rootDataStore[rootPosition][2] != undefined){
				roots = rooDataStore = rootDataStore[rootPosition][2];
			}
			else{
				roots = connectionObj.options.roots;
			}

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
			var allSpheres = initializeSpheres(freshNodes,rootPosition);
			var allLines = initializeLines(freshLines,connectionObj.options.defaultColor);
			var graphObject = new THREE.Object3D();
			graphObject.add(allSpheres);
			graphObject.add(allLines);
			//scene.add(graphObject);
			graph.add(graphObject);
			rootDataStore[rootPosition][3] = allSpheres;

		}
}

// recursive function to iterate through the object and construct the places.
function recurseRebuild(current, bigObj,dateStart,dateEnd){
	var node = bigObj[current];
	// if leaf node, convert the current coordinates into three dimentional points

	if(node.children.length == 0){
		if(node.coord != "NONE" || node.coord!= null || node.coord!= undefined){
				if(node.coord instanceof THREE.Vector3 || ( (dateStart != undefined && dateEnd != undefined) && !(new Date(node.date) >= new Date(dateStart) && new Date(node.date) <= new Date(dateEnd)))){
					return 1;
				}
			//	take the lat lon from the data and convert this to 3d globe space


				var center = locationToVector(node.coord[0], node.coord[1]);
				if(node.coord[0] == undefined || node.coord[1] == undefined || center == null){
					cantPlace.push(current);
					node.coord = null;
          return 0;
				}
				node.coord = center;

				// make a sphere to represent this node, I'll give it a color to indicate
				// that it is a leaf
				//var sphere = createSphere(0xfffc32, current,center);
				if(node.color == undefined || node.color == "NONE" || node.color == null ){
		      node.color = 0xd9ca04;
		    }

        var nodeObj = {"name":current,"desc":node.desc,"color":node.color,"links":node.links,"location":[center.x,center.y,center.z]}
				freshNodes.push(nodeObj);

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
				if((childCoord != "NONE" && childCoord != null && childCoord != undefined) && ((dateStart == undefined || dateEnd == undefined)||(new Date(childDate) >= new Date(dateStart) && new Date(childDate) <= new Date(dateEnd)))){
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

		if(node.color == undefined || node.color == "NONE" || node.color == null ){
      node.color = 0xff0000;
    }
		// create the node's circle
		//var sphere = createSphere(0xfff4234, current,midPoint);
    var nodeObj = {"name":current,"desc":node.desc,"color":node.color,"links":node.links,"location":[midPoint.x,midPoint.y,midPoint.z]}
		freshNodes.push(nodeObj);



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

        var geoArr = [];
        for(var vert = 0 ; vert < currentGeometry.vertices.length; vert++){
          var subArr = currentGeometry.vertices[vert].toArray();
          geoArr= geoArr.concat(subArr)
        }

        //generateParticles(currentGeometry.vertices, curve.getLength());
				//var currentLine = new THREE.Line(currentGeometry,lineMat);
				//currentLine.name = current + " -> " + node.children[i]
				freshLines.push(geoArr);
			}
			else{
				//currentGeometry.vertices.push(midPoint,childPositions[i]);
				var streightCurve = new THREE.LineCurve3(midPoint,childPositions[i])
				currentGeometry.vertices = streightCurve.getPoints(50);
				//generateParticles(currentGeometry.vertices,streightCurve.getLength());

        var geoArr = [];
        for(var vert = 0 ; vert < currentGeometry.vertices.length; vert++){
          var subArr = currentGeometry.vertices[vert].toArray();
          geoArr = geoArr.concat(subArr);
        }

				//var lineMat = new THREE.LineBasicMaterial({color: 0xc5c5c5});
				//var currentLine = new THREE.Line(currentGeometry,lineMat);
				//currentLine.name = current + " -> " + node.children[i]
				freshLines.push(geoArr);
			}

		}
		//console.log(conlines);
		return currentLevel + 1;
	}
}




var totalDepth = 0;
var totalBreadth = 0;
var leafPlace = 0;
function build2d(coreObject,startP,endP,rootPosition){
	freshLines = [];
	freshNodes = [];
	graph.children = [];
	render();

	// test the potential use of webworkers
	if(typeof(Worker) !== "undefined"){

		var graphWorker = new Worker("graphWorker.js");

		// check for optional roots so that they can be sent to the webworker appropriately

		graphWorker.postMessage(JSON.stringify({"type":"2dlin","obj":coreObject,"stt":startP,"stp":endP,"custRoots":rootDataStore[rootPosition][2]}));
		graphWorker.onmessage = function(e){
			//var loader = new THREE.ObjectLoader();
			var dataset = JSON.parse(e.data);
			var allSpheres = initializeSpheres(dataset.nodes,rootPosition);
			var allLines = initializeLines(dataset.lines,coreObject.options.defaultColor);
			var graphObject = new THREE.Object3D();
			graphObject.add(allSpheres);
			graphObject.add(allLines);
			//graph2d.add(graphObject);
			// here we add the fun stuff for names
			var group = new textGroup("Arial",0xffffff,.5);
			var toAdd = allSpheres.geometry.vertices;
			for(var i = 0; i < toAdd.length; i++){
				var currentGeo = toAdd[i];
				group.addString(currentGeo.nodeName,new THREE.Vector3(currentGeo.x + 1, currentGeo.y-.15,0));
			}
			graphObject.add(group.build());
			graph2d.add(graphObject);

			//graph.remove(rotating);
			//return graphObject;
			rootDataStore[rootPosition][3] = allSpheres;
		}
	}
	else{
		var roots;
		if(rootDataStore[rootPosition][2] != undefined){
			roots = rootDataStore[rootPosition][2];
			totalBreadth = recCalcLeaves(roots[0],coreObject,startP,endP);
		}
		else{
			roots = coreObject.options.roots;
			totalBreadth = calcLeaves(coreObject.data,startP,endP);
		}

		totalDepth = calcDepth(roots[0],coreObject.data,startP,endP);
		if(coreObject.options.time == true){
				if(startP == undefined || endP == undefined){
					var range = coreObject.options.timeRange
					recurseBuild2d(roots[0],coreObject.data,range[0],range[1]);
				}
				else{
					recurseBuild2d(roots[0],coreObject.data,startP,endP);
				}
		}
		else{
				recurseBuild2d(roots[0],coreObject.data);
		}
		recurseBuild2d(coreObject.options.roots[0],coreObject.data,0);
		var allSpheres = initializeSpheres(freshNodes);
		var allLines = initializeLines(freshLines,coreObject.options.defaultColor);
		var graphObject = new THREE.Object3D();
		graphObject.add(allSpheres);
		graphObject.add(allLines);
		//graph2d.add(graphObject);
		// here we add the fun stuff for names
		var group = new textGroup("Arial",0xffffff,.5);
		var toAdd = allSpheres.geometry.vertices;
		for(var i = 0; i < toAdd.length; i++){
			var currentGeo = toAdd[i];
			group.addString(currentGeo.nodeName,new THREE.Vector3(currentGeo.x + 1, currentGeo.y-.15,0));
		}
		graphObject.add(group.build());
		graph2d.add(graphObject);


		rootDataStore[rootPosition][3] = allSpheres;
	}
	//scene.remove(rotating);

}


/*The recursive function is built to generate 2d graphs in a 3d context */
function recurseBuild2d(current, bigObj,depth,dateStart,dateEnd){
	var node = bigObj[current];
	var depthFactor = 5;
	if(node.children.length == 0){
			if(node.coord instanceof THREE.Vector3 || ( (dateStart != undefined && dateEnd != undefined) && !(new Date(node.date) >= new Date(dateStart) && new Date(node.date) <= new Date(dateEnd)))){
				return 1;
			}
			// This is a leaf node and so needs to be placed in its relative position
			// based upon depth and breadth

			// z is easy as we are building to 2 dimensions
			var z = 0;
			// x is going to be the maximum depth;
			var x = (totalDepth * depthFactor)/2;
			// calculate y:
			var sepFactor = .3;
			var halved = totalBreadth/2;
			var relHalf = halved +(halved * sepFactor);
			var y = relHalf - (leafPlace + (leafPlace * sepFactor));

			node.coord = new THREE.Vector3(x,y,z);

			// make a sphere to represent this node, I'll give it a color to indicate
			// that it is a leaf
			var sphere = createSphere(0xfffc32, current,node.coord);
			freshNodes.push(sphere);
			leafPlace++;

			return 1;
	}


	else{
		var childPositions = [];
		var childDates = [];
		for(var i = 0; i < node.children.length; i++){

				var child = node.children[i];
				// This handles the case where a node may be recursive
				if (child == current){
					continue
				}

				var recRet = recurseBuild2d(child, bigObj,depth + 1,dateStart, dateEnd);

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

					// calculate the nodes x position:
					var x = depth * 5 - ((totalDepth * 5)/2);
					midPoint.setX(x);
					midPoint.setZ(0);

				}
				// Otherwise start calculating the midpoint between all of the
				// current point's children.
				else{
					var firstPoint = childPositions[i];
					i= i + 1;
					var secondPoint = childPositions[i];


					midPoint = firstPoint.clone().lerp(secondPoint.clone(),.5);
					var x = depth * 5 - ((totalDepth * 5)/2);
					midPoint.setX(x);
					midPoint.setZ(0);
				}
			}
			else{
				var nextPoint = childPositions[i];
				midPoint = midPoint.clone().lerp(nextPoint,.5);
				var x = depth * 5 - ((totalDepth * 5)/2);
				midPoint.setX(x);
				midPoint.setZ(0);

			}
		}

		// if at this point the midPoint does not exist then assume that this branch
		// should not exist. This is likely going to be due to a date restriction.
		if(midPoint == null){
			return currentLevel + 1;
		}

		bigObj[current].coord = midPoint;
		//		bigObj[current].level = currentLevel;

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
				//linepeak.setLength(midPoint.length());


				var latepeak = linepeak.clone().lerp(childPositions[i],.5);
				//latepeak.setLength(midPoint.length());

				//material.color.setHSL( .4, 0.1, .8 );


				var lineMat = new THREE.LineBasicMaterial({color: 0xc5c5c5});
				//var curve = new THREE.CubicBezierCurve3(midPoint,linepeak,latepeak,childPositions[i]);

				//var curvePointsOne = segmentLine(midPoint,linepeak,10)
				//var curvePointsTwo = segmentLine(linepeak,childPositions[i],15);

				var curvePoints = []
				curvePoints.push(midPoint);
				curvePoints.push(latepeak);
				//curvePoints = curvePoints.concat(curvePointsOne);
				//curvePoints = curvePoints.concat(segmentLine(midPoint,childPositions[i],10));
				//curvePoints.push(linepeak);
				//urvePoints = curvePoints.concat(curvePointsTwo);
				curvePoints.push(childPositions[i]);

				// this still needs work but it may be on the right track
				var curve = new THREE.SplineCurve3(curvePoints);

				currentGeometry.vertices = curve.getPoints(50);
				//generateParticles(currentGeometry.vertices, curve.getLength());
				var currentLine = new THREE.Line(currentGeometry,lineMat);
				//currentLine.name = current + " -> " + node.children[i]
				freshLines.push(currentLine);
			}
			else{
				//currentGeometry.vertices.push(midPoint,childPositions[i]);
				var streightCurve = new THREE.LineCurve3(midPoint,childPositions[i])
				currentGeometry.vertices = streightCurve.getPoints(50);
				//generateParticles(currentGeometry.vertices,streightCurve.getLength());
				var lineMat = new THREE.LineBasicMaterial({color: 0xc5c5c5});
				var currentLine = new THREE.Line(currentGeometry,lineMat);
				//currentLine.name = current + " -> " + node.children[i]
				freshLines.push(currentLine);
			}

		}
		//console.log(conlines);
		return 1;
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
