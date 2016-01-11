


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
  This function breaks geojson files down into line segments in the same
  manner that it is done for generating graph lines. Essentially all of the
  2D coordinates are converted into 3d coordinate space and then stuffed into
  a single array so that they can be sent off to have a buffer created.
*/
function geoJsonLayer(inObject){
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
              $.merge(cordArr,featGeometry.coordinates[coords]);
          }
        }
        else if(featGeometry.type == "Polygon"){
          cordArr = featGeometry.coordinates
        }
        else if(featGeometry.type == "LineString"){
          cordArr = [featGeometry.coordinates];
        }
        for(var arrPlace = 0; arrPlace < cordArr.length; arrPlace++){
          for(var coordP = 0; coordP < cordArr[arrPlace].length; coordP++){
            var vect = locationToVector(cordArr[arrPlace][coordP][1],cordArr[arrPlace][coordP][0]);
            //$.merge(currentline,[vect.y,vect.x,vect.z]);
            $.merge(currentline,[vect.x,vect.y,vect.z]);
          }
        }
        lineArr.push(currentline);
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
          else{
            cordArr = currentPolly.coordinates[subPoly][0];
          }

          for(var coordP = 0; coordP < cordArr.length; coordP++){
            var vect = locationToVector(cordArr[coordP][1],cordArr[coordP][0]);
            //$.merge(currentline,[vect.y,vect.x,vect.z]);
            $.merge(currentline,[vect.x,vect.y,vect.z]);
          }
          lineArr.push(currentline);
        }
      }
    }
  }

  var layerLine = initializeLines(lineArr);
  //var layerLine = initializeLines([lineArr[6]]);
  return layerLine;




}
