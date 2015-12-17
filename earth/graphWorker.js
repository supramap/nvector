
importScripts('three.min.js');
importScripts('util.js');
var rad = 100;

onmessage = function(e){
  var dataset = JSON.parse(e.data);

  if(dataset.type == "3d"){
    makeGraphGeometry(dataset.obj,dataset.stt,dataset.stp);
  }
  if(dataset.type == "2dlin"){
    build2d(dataset.obj,dataset.stt,dataset.stp);
  }

  //var returnObject = new THREE.Object3D();
  //returnObject.children = freshNodes.concat(freshLines)
  var toReturn = {'nodes':freshNodes, 'lines':freshLines, 'failures':cantPlace};
  postMessage(JSON.stringify(toReturn));
  close();
}

var freshNodes=[], freshLines=[];



function makeGraphGeometry(connectionObj, startP, endP){
		var roots = connectionObj.options.roots;
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


var cantPlace = [];

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
				//var sphere = createSphere(0xfffc32, current,center);
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
          geoArr.extend(subArr);
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
          geoArr.extend(subArr);
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

  /*
  //currentGeometry.vertices.push(midPoint,childPositions[i]);
  var streightCurve = new THREE.LineCurve3(midPoint,childPositions[i])
  currentGeometry.vertices = streightCurve.getPoints(50);
  //generateParticles(currentGeometry.vertices,streightCurve.getLength());

  var geoArr = [];
  for(var vert = 0 ; vert < currentGeometry.vertices.length; vert++){
    var subArr = currentGeometry.vertices[vert].toArray();
    geoArr.push(subArr);
  }
  //var lineMat = new THREE.LineBasicMaterial({color: 0xc5c5c5});
  //var currentLine = new THREE.Line(currentGeometry,lineMat);
  //currentLine.name = current + " -> " + node.children[i]
  freshLines.push(geoArr);
  */






var totalDepth = 0;
var totalBreadth = 0;
var leafPlace = 0;
function build2d(coreObject,startP,endP){
	totalBreadth = calcLeaves(coreObject.data,startP,endP);
	totalDepth = calcDepth(coreObject.options.roots[0],coreObject.data,startP,endP);
  freshLines = [];
  freshNodes = [];
  if(coreObject.options.time == true){
      if(startP == undefined || endP == undefined){
        var range = coreObject.options.timeRange
        recurseBuild2d(coreObject.options.roots[0],coreObject.data,0,range[0],range[1]);
      }
      else{
        recurseBuild2d(coreObject.options.roots[0],coreObject.data,0,startP,endP);
      }
  }
  else{
      recurseBuild2d(coreObject.options.roots[0],coreObject.data,0);
  }
  //recurseBuild2d(coreObject.options.roots[0],coreObject.data,0);
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

      var nodeObj = {"name":current,"desc":node.desc,"color":node.color,"links":node.links,"location":[x,y,z]}
			// make a sphere to represent this node, I'll give it a color to indicate
			// that it is a leaf
			//var sphere = createSphere(0xfffc32, current,node.coord);
			freshNodes.push(nodeObj);
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
			return  1;
		}

		bigObj[current].coord = midPoint;
    //		bigObj[current].level = currentLevel;

		// create the node's circle
		//var sphere = createSphere(0xfff4234, current,midPoint);
    var nodeObj = {"name":current,"desc":node.desc,"links":node.links,"color":node.color,"location":[midPoint.x,midPoint.y,midPoint.z]}
		freshNodes.push(nodeObj);



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

        var geoArr = [];
        for(var vert = 0 ; vert < currentGeometry.vertices.length; vert++){
          var subArr = currentGeometry.vertices[vert].toArray();
          geoArr.extend(subArr);
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
          geoArr.extend(subArr);
        }

				//var lineMat = new THREE.LineBasicMaterial({color: 0xc5c5c5});
				//var currentLine = new THREE.Line(currentGeometry,lineMat);
				//currentLine.name = current + " -> " + node.children[i]
				freshLines.push(geoArr);
			}

		}
		//console.log(conlines);
		return 1;
	}

}




function buildCircle(){
  totalBreadth = calcLeaves(coreObject.data);
	totalDepth = calcDepth(coreObject.options.roots[0],coreObject.data);
	freshLines = [];
	freshNodes = [];
  recurseBuildCircle(coreObject.options.roots[0],coreObject.data,0);
}

/* recursive function to build a circular graph*/
function recurseBuildCircle(current, bigObj,depth,dateStart,dateEnd){
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
			// x gets more complicated with a sphere. it should be
      // an adapted equivilant to:     r * cost(t)

      var diameter =  totalBreadth + (totalBreadth * sepFactor);
      var distFact = 360/diameter;
      // where you left off

			var x = (totalDepth * depthFactor)/2;
			// calculate y:
			var sepFactor = .3;
			var halved = totalBreadth/2;
			var relHalf = halved +(halved * sepFactor);
			var y = relHalf - (leafPlace + (leafPlace * sepFactor));

			node.coord = new THREE.Vector3(x,y,z);

      var nodeObj = {"name":current,"desc":node.desc,"color":node.color,"links":node.links,"location":[x,y,z]}
			// make a sphere to represent this node, I'll give it a color to indicate
			// that it is a leaf
			//var sphere = createSphere(0xfffc32, current,node.coord);
			freshNodes.push(nodeObj);
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

				var recRet = recurseBuildCircle(child, bigObj,depth + 1,dateStart, dateEnd);

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
		//var sphere = createSphere(0xfff4234, current,midPoint);
    var nodeObj = {"name":current,"desc":node.desc,"links":node.links,"color":node.color,"location":[midPoint.x,midPoint.y,midPoint.z]}
		freshNodes.push(nodeObj);



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

        var geoArr = [];
        for(var vert = 0 ; vert < currentGeometry.vertices.length; vert++){
          var subArr = currentGeometry.vertices[vert].toArray();
          geoArr.extend(subArr);
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
          geoArr.extend(subArr);
        }

				//var lineMat = new THREE.LineBasicMaterial({color: 0xc5c5c5});
				//var currentLine = new THREE.Line(currentGeometry,lineMat);
				//currentLine.name = current + " -> " + node.children[i]
				freshLines.push(geoArr);
			}

		}
		//console.log(conlines);
		return 1;
	}

}
