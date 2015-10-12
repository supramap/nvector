


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
