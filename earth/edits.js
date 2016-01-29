/*
  This is the function called when the user selects a subsection of a graph
  from within edit mode.
*/
function subsect(){
  // utilize the first place available assuming that it exists
  if(possible.length > 0){
    var newRoot = possible[0][0];
    var treePosition = possible[0][1];
    rootDataStore[treePosition][2] = [newRoot];
    // rebuild the graph.
    if(sliderExists){

      var slideEnds = slider.noUiSlider.get();
      redrawGraph(reFormatDate(new Date(+slideEnds[0])),reFormatDate(new Date(+slideEnds[1])));
      //makeGraphGeometry(rootObject,reFormatDate(new Date(+slideEnds[0])),reFormatDate(new Date(+slideEnds[1])));
    }
    else{
      redrawGraph(undefined,undefined);
      //makeGraphGeometry(rootObject);
    }
    var target = new THREE.Vector3(0,0,180);

    var midPoint = camera.position.clone().lerp(target,.5);
    //midPoint.setLength(200);


    var pathCurve = new THREE.QuadraticBezierCurve3(camera.position,midPoint,target);
    var path = pathCurve.getPoints(100);
    camera.path = path;
    camera.pip = 0;
    camera.nlerp = 1;

    cameraRelocate = true;
  }
}

function removeSubsect(){
  var checkedRadio = $("input:radio:checked");
  var graphPos = parseInt(checkedRadio[0].value);
  rootDataStore[graphPos][2] = undefined;
  if(sliderExists){

    var slideEnds = slider.noUiSlider.get();
    redrawGraph(reFormatDate(new Date(+slideEnds[0])),reFormatDate(new Date(+slideEnds[1])));
  }
  else{
    redrawGraph(undefined,undefined);
  }

  var target = new THREE.Vector3(0,0,180);

  var midPoint = camera.position.clone().lerp(target,.5);
  //midPoint.setLength(200);


  var pathCurve = new THREE.QuadraticBezierCurve3(camera.position,midPoint,target);
  var path = pathCurve.getPoints(100);
  camera.path = path;
  camera.pip = 0;
  camera.nlerp = 1;

  cameraRelocate = true;
}




/*
  This is the function called when a user runs a search on the currently
  selected tree
*/

function searchTree(searchTerm,graphPos){
  var target = rootDataStore[graphPos].data
  searchTerm.toLowerCase();
  var matches = [];
  //Begin iterating
  for (var key in target) {
    if (target.hasOwnProperty(key)) {
      // Now begin to search through everyone of the elements in the database.
      // including the current key
      console.log("original string: " + key);
      var tempKey = key;
      if(tempKey.toLowerCase().indexOf(searchTerm) > 0){
        matches.push(key);
      }

      var actObject = target[key];
      for(var datum in actObject){
        if(actObject.hasOwnProperty(datum)){
          var val = actObject.datum;
          if(val.toLowerCase().indexOf(searchTerm) > 0){
            matches.push(key);
          }
        }
      }

      console.log("original is now: " + key + ", tempKey is now: " + tempKey);
    }
  }

}
