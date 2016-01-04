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
  }
}
