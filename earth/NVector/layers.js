

/**
  DEPRICATED
  This has been pretty well depricated in exchange for the use of geojson files
*/
function generateLayer(inObject){
  var keys = Object.keys(inObject);
  var lines =[];
  var lineMaterial = new THREE.LineBasicMaterial({color:0xbbbbbb})
  for(var i = 0; i < keys.length; i++){
    var currentPlace = inObject[keys[i]]
    // get all of the vertices for this object.
    var polyCoordinates = currentPlace.polys

    var lineGeo = new THREE.Geometry();


    first = true;
    firstPoint = null;
    for (var j in polyCoordinates){
      // convert the given values into a vector
      var lon = parseFloat(polyCoordinates[j][0]) - 90;
      var lat = parseFloat(polyCoordinates[j][1]);

      var phi = Math.PI/2 - lat * Math.PI / 180 - Math.PI * 0.00//0.01;
      var theta = 2 * Math.PI - lon * Math.PI / 180 + Math.PI * 0.00//0.06;

      var point = new THREE.Vector3();
      point.x = Math.sin(phi) * Math.cos(theta) * rad;
      point.y = Math.cos(phi) * rad;
      point.z = Math.sin(phi) * Math.sin(theta) * rad;

      lineGeo.vertices.push(point)
      if(first){
        first = false;
        firstPoint = point
      }
    }// end of for loop for looping through coordinates

    // push the first point back on to close the polygon
    lineGeo.vertices.push(firstPoint);
    var currentLine = new THREE.Line(lineGeo, lineMaterial);
    lines.push(currentLine);


  }// end of for loop for looping through keys

  return lines;
}


/*
  This function manages the creation of the geoJson based outlines rendered into
  NVector
*/
function geoJsonLayer(inObject){


  var lineArry = genGeometryArray(inObject);
  // initializeLines is the same function used to create the lines for regular
  // graphs. layerLine will then be the three.js buffered lines ready for rendering
  var layerLine = initializeLines(lineArry);
  //var layerLine = initializeLines([lineArr[6]]);
  return layerLine;
}


/*
  This function breaks geojson files down into line segments in the same
  manner that it is done for generating graph lines. Essentially all of the
  2D coordinates are converted into 3d coordinate space and then stuffed into
  a single array so that they can be sent off to have a buffer created.

  inObject: the geojson object input that needs to be parsed
  poly: A boolean to inform the function wheather or not it is using a
  bufferGeometry object to create a large number of lines or a polygon
*/
function genGeometryArray(inObject, poly){
  var lineArr = [];

  if(inObject.type == "FeatureCollection" ){
    for(var i = 0; i < inObject.features.length; i++){
      var currentline = [];
      var cordArr = [];
      var currentFeature = inObject.features[i];
      if(currentFeature.type == "Feature"){
        var featGeometry = currentFeature.geometry;
        if(featGeometry.type == "MultiPolygon"){
          for(var coords = 0; coords < featGeometry.coordinates.length; coords++){
              cordArr = featGeometry.coordinates[coords];
              lineArr.push(featureLineBuild(cordArr, poly));
          }
        }
        else if(featGeometry.type == "Polygon"){
          cordArr = featGeometry.coordinates;
          lineArr.push(featureLineBuild(cordArr,poly));
        }
        else if(featGeometry.type == "LineString"){
          cordArr = [featGeometry.coordinates];
          lineArr.push(featureLineBuild(cordArr,poly));
        }


      }
    }
  }

  else if(inObject.type == "GeometryCollection"){
    for(var i = 0; i < inObject.geometries.length; i++){
      var currentPolly = inObject.geometries[i];
      if(currentPolly.type == "Polygon" || currentPolly.type == "MultiPolygon"){
        // This for loop is to iterate through the inner and outer polygons for
        // multipolygon instances. More often than not there will be single polygons
        // and its unlikely that there will be very many polygons in a multipolygon
        // so this loop can likely be ignored for most cases of efficiency.
        for(var subPoly = 0; subPoly < currentPolly.coordinates.length; subPoly++){
          var currentline = [];
          var cordArr
          if(currentPolly.type == "Polygon"){
            cordArr = currentPolly.coordinates[subPoly];
          }
          else if(currentPolly.type == "MultiPolygon"){
            cordArr = currentPolly.coordinates[subPoly][0];
          }

          var lastLat = null;
          var lastLon = null;

          for(var coordP = 0; coordP < cordArr.length; coordP++){
            var lat = cordArr[coordP][1];
            var lon = cordArr[coordP][0];
            if(poly){
              lat = lat.toFixed(2);
              lon = lon.toFixed(2);
              if(lat == lastLat || lon == lastLon){
                  continue;
              }
              lastLat = lat;
              lastLon = lon
            }
            var vect = locationToVector(cordArr[coordP][1],cordArr[coordP][0]);
            //$.merge(currentline,[vect.y,vect.x,vect.z]);
            if(!poly){
              $.merge(currentline,[vect.x,vect.y,vect.z]);
            }
            else{
              currentline.push(vect);
            }
          }
          lineArr.push(currentline);
        }
      }
    }
  }
  return lineArr;
}


function featureLineBuild(cordArr,poly){
  var currentLine = [];
  for(var arrPlace = 0; arrPlace < cordArr.length; arrPlace++){
    var lastLon = null;
    var lastLat = null;
    for(var coordP = 0; coordP < cordArr[arrPlace].length; coordP++){
      var lat = cordArr[arrPlace][coordP][1];
      var lon = cordArr[arrPlace][coordP][0];

      if(poly){
        lat = lat.toFixed(2);
        lon = lon.toFixed(2);
        if(lat == lastLat || lon == lastLon){
          continue;
        }
        lastLast = lat;
        lastLon = lon;
      }

      var vect = locationToVector(lat,lon);
      //$.merge(currentline,[vect.y,vect.x,vect.z]);
      if(!poly){
        $.merge(currentLine,[vect.x,vect.y,vect.z]);
      }
      else{
        currentLine.push(vect);
      }
    }
  }
  return currentLine;
}



/**
  The polygonLayer function is designed to take in the loaded geojson file and
  render a polygon that can be manipulated with regards to color, shape and size

*/
function polygonLayer(inObject){
  var lineArry = genGeometryArray(inObject, true);

  var layer = new THREE.Object3D();
  // At this point we need to try and create the polygons with three.js shapes
  //for(var i = 0; i < lineArry.length; i++){
    var currentLine = DupKiller(lineArry[1]);
    if(currentLine.length > 3){
      var geoShape = new THREE.Shape(currentLine);
      var shapeGeometry = new THREE.ShapeGeometry(geoShape).mergeVertices();
      var shapeMat = new THREE.MeshBasicMaterial({color:0x00ff00});
      var shapemesh = new THREE.Mesh(shapeGeometry, shapeMat);

      layer.add(shapemesh);
    }
  //}

  return layer;

}

/**
  The dupKiller function is designed to kill duplicate vertices showing up in
  arrays. Hopefully removing the duplicates or altering the point just enough
  to no longer be a duplicate will allow us to complete a threejs polygon.

  toClean: An array of vectors that need to have duplicates removed.

*/
function DupKiller(toClean){
  var visited={};
  var cleanArr = [];
  for(var i = 0; i < toClean.length; i++){
    var currentVector = toClean[i];
    if(currentVector instanceof THREE.Vector3){
        var toCheck = currentVector.x + ":" + currentVector.y + ":" + currentVector.z
        if(toCheck in visited){
          continue
        }
        visited[toCheck] = true;
        cleanArr.push(currentVector);
    }
    if(currentVector instanceof THREE.Vector2){
        var toCheck = currentVector.x + ":" + currentVector.y;
        if(toCheck in visited){
          continue
        }
        visited[toCheck] = true;
        cleanArr.push(currentVector);
    }

  }

  return cleanArr;
}
