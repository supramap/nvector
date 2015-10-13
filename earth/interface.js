// Make the buttons trigger the file selector
$("#infileBut").click(function(){
  $("#infile").trigger('click');
});

$("#layerBut").click(function(){
  $("#layerFile").trigger('click');
});


// Define what is done when the files are loaded
var chooser = $("#infile");
chooser.change(function(evt) {
    console.log($(this).val() + " is loaded");
    // draw file from the input
    var f = this.files[0]

    if(f){
      var reader = new FileReader();
      reader.onload = function(data){
        // loadTransmissions is defined in dataloading.js and is intended to
        // load in all of the data provided by a graphviz formatted file.
        // addNewGraph is housed in the earth.js file as it interfaces with the
        // THREE.js visualization.
        loadTransmissions(data.target.result,addNewGraph);
      };
      reader.readAsText(f);
    }
});

// define what is done when a file is selected
var layerSelection = $("#layerFile")
layerSelection.change(function(evt){
  console.log($(this).val() + " is loaded");
  // draw file from the input
  var f = this.files[0]

  if(f){
    var reader = new FileReader();
    reader.onload = function(data){
      // Again addNewLayer is in earth.js to interface appropriately with
      // three.js
      loadLayer(data.target.result,addNewLayer);
    };
    reader.readAsText(f);
  }
});

var open = true;

$("#close").click(function(){
  if(open == true){
    $("#menu").animate({
      left: '-20%'
    });
    $("#close").animate({
      right:'-25px'
    }).html(">");
    open = false;
  }
  else{
    $("#menu").animate({
      left: '0px'
    });
    $("#close").animate({
      right:'1px'
    }).html("<");
    open = true;
  }

})



// Make the control panel slide.
