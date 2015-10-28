var queryroot = "http://192.168.1.14:8080/irods-rest/rest/"

// Make the buttons trigger the file selector
$("#infileBut").click(function(){
  $("#infile").trigger('click');
});

$("#layerBut").click(function(){
  $("#layerFile").trigger('click');
});

$("#infileButCloud").click(function(){
  // fire off the query to retrieve collection information.
  // while waiting for collection information be sure to display the popup
  // window and a loading animation.
  var list = "collection/tempZone/home/zach/fda?listing=true"

  $.ajax({
    type:"GET",
    url:(queryroot + list),
    beforeSend: function(xhr){
      xhr.setRequestHeader("Authorization","Basic " + btoa("earth" + ":" + "!darpa"));
    },
    //datatype:'json',
    success:function(data){
      console.log(data);
    }
  })

  $("#popup").show();

});
//http://192.168.1.14:8080/irods-rest/rest/collection/tempZone/home/zach/fda?listing=true
$("#layerButCloud").click(function(){

});

$("#popCancel").click(function(){
  $("#popup").hide();
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
    var amount = '-' + $("#menu").width().toString() + 'px';
    $("#menu").animate({

      left: amount
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
