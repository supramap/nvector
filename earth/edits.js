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
var matches = [];
function searchTree(searchTerm,graphPos){
  var target = rootDataStore[graphPos][0].data
  searchTerm.toLowerCase();
  matches = [];
  //Begin iterating
  for (var key in target) {
    if (target.hasOwnProperty(key)) {
      // Now begin to search through everyone of the elements in the database.
      // including the current key
      var tempKey = key;
      if(tempKey.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0){
        if(shouldMatch(key)){
            matches.push(key);
        }
      }

      var actObject = target[key];
      for(var datum in actObject){
        if(actObject.hasOwnProperty(datum)){
          var val = actObject[datum];
          // if the current val is an array then we need to iterate through it
          // O(n^3) ugh...
          if(Array.isArray(val)){
            for(var i = 0 ; i < val.length; i++){
              if(typeof val[i] == "string"){
                if(val[i].toLowerCase().indexOf(searchTerm) > 0){
                  if(shouldMatch(key)){
                      matches.push(key);
                  }
                }
              }
            }
          }

          else if(typeof val == "string" && val.toLowerCase().indexOf(searchTerm) > 0){
            if(shouldMatch(key)){
                matches.push(key);
            }
          }
        }
      }


    }
  }

  if(matches.length < 1){
    console.log("No matches were found");
  }

  displayedResult = 0;
  // need to search for the matching position in the point cloud
  //graph2d.children[{selectedGraph}].children[0].geometry.vertices;
  //graph2d.children[{selectedGraph}].children[0].material.attributes

  // toggle the dropdown arrows
  if(matches.length == 0){
    // This will change into an error log for the user.
    console.log("Nothing was found matching your query")
  }
  else if(matches.length == 1){
    // then simply zoom to that single result.
    console.log("one match");
    nodeHighlight(matches[0]);
    showSelected(matches[0],graphPos)
  }
  else{
    // setup the next/previous buttons.
    if(!slideOut){
        selSlide();
    }
    nodeHighlight(matches[0]);

  }

}

/*
  ensure matched nodes are actually displayed. For instance
  If the time function is used then matches that don't fall within the time frame
  should not be displayed.
  returns true if the match should be added ie( the match is within the showed tree)
  or false if the match is excluded from the current tree (likely because of time)
*/
function shouldMatch(key){
  var searchList = graph2d.children[0].children[0].geometry.vertices;
  for(var i = 0; i < searchList.length; i++){
    if(searchList[i].nodeName == key){
      return true;
    }
  }
  return false;
}



/*
  This function will scroll the camera along two axis, allowing for smoother
  animations while in 2D mode. The input is the key storing the object data.
*/
function nodeHighlight(key){

  // first step is to find the location of the node to highlight.
  var searchList = graph2d.children[0].children[0].geometry.vertices;
  var position;
  var vectorPosition;
  for(var i = 0; i < searchList.length; i++){
    if(searchList[i].nodeName == key){
      position = i;
      vectorPosition = searchList[i];
      break;
    }
  }
  // This may need to be updated to a custom input color
  graph2d.children[0].children[0].material.attributes.customColor.value[position] = new THREE.Color(0x0e9e9e);
  //graph2d.children[0].children[0].material.needsUpdate = true;
  graph2d.children[0].children[0].material.attributes.customColor.needsUpdate = true;

  var hover = vectorPosition.clone();
  hover.z = 25;

  // calculate a good midpoint
  var tempMid = camera.position.clone().lerp(hover.clone(),.5)
  tempMid.z = 25 + (camera.position.distanceTo(hover))
  var trueDist = camera.position.distanceTo(hover);
  // and here we apply some weird math based on the distance betweent the nodes
  // to try and keep the rate at which the animation moves comfortable while
  // navigating the search function.
  var weirdMath = (Math.sqrt(trueDist) * 5) + ((Math.sqrt(trueDist)/trueDist) * 50)
  var path = new THREE.QuadraticBezierCurve3(camera.position,tempMid,hover).getPoints(weirdMath);
  path.push(hover);
  camera.path = path;
  cameraRelocate = true;
  camera.pip = 0;
  camera.nlerp = 1;
  offKilter = true;

}

/*
  So the function to highlight a node works great... but what about returning it
  to its original color? Thats what this baby is for
*/

function removeHighlight(key, rootPos){
  var searchList = graph2d.children[0].children[0].geometry.vertices;
  var position;

  for(var i = 0; i < searchList.length; i++){
    if(searchList[i].nodeName == key){
      position = i;
      vectorPosition = searchList[i];
      break;
    }
  }

  var correctColor = rootDataStore[rootPos][0].data[key].color;

  graph2d.children[0].children[0].material.attributes.customColor.value[position] = new THREE.Color(correctColor);
  //graph2d.children[0].children[0].material.needsUpdate = true;
  graph2d.children[0].children[0].material.attributes.customColor.needsUpdate = true;
}
