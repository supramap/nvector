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
