


// The dataset array will hold the actual input file data as strings.
var dataSet = []

types={"Tree":["CSV + Newick","Excel + Newick"],
       "Directional Graph":["gv"],
       "Points":["gv"]}


buttons={"CSV + Newick": ["CSV","Newick"],
         "Excel + Newick":["Xlsx","Newick"]}


/*
  Need to create a function that handles the addition of the buttons.
*/

function initialize(){

  // hide the other windows
  $("#colChoice").hide();
  $("#completed").hide();
  $("#buttonHouse").hide();
  $("#moveOn").hide();


  for(var i = 0; i < Object.keys(types).length; i++){
     var current = Object.keys(types)[i]
    $("#typeOption").append("<option class='optionBox' value='"+ current +"'>" + current + "</option>")
  }
  // prevent default behavior from changing page on dropped file
  window.ondragover = function(e) { e.preventDefault(); return false };
  // NOTE: ondrop events WILL NOT WORK if you do not "preventDefault" in the ondragover event!!
  window.ondrop = function(e) { e.preventDefault(); return false };
}


function fillFileType(vizType){
  console.log(vizType);
}



function changeType(){
  var value = $("#typeOption option:selected").text();

  // unshade the second selection box and fill it
  for(var i = 0; i < Object.keys(buttons).length; i++){
     var current = Object.keys(buttons)[i]
    $("#fileOption").append("<option class='optionBox' value='"+ current +"'>" + current + "</option>")
  }
  $("#fileOption").prop("disabled",false);
  $("#fileOption").css('opacity',"1.0");

}

function changeButtons(){
  var value = $("#fileOption option:selected").text();
  var buttonList = buttons[value];

  // create the filepicker for this system
  var picker = document.createElement("input")
  picker.setAttribute("type","file");
  picker.setAttribute("class","hiddenFileSelect");
  picker.setAttribute("id","filePicker");
  picker.onchange = function(evt){
    var f = this.files[0];
    latestFileName = f.name;
    var r = new FileReader();
    r.onload = function(event){
        // do what you will to the data
        dataSet[picker.place] = r.result;
        if(dataSet.length == buttonList.length){
          $("#moveOn").show();
        }
    }
    r.readAsText(f);
  }
  $("#buttonHouse").append(picker);
  for(var i =0; i < buttonList.length; i++){

    //Need to dynamically add file input buttons and drag and drop zones
    var newDiv = document.createElement("div");
    newDiv.setAttribute("value",i);
    newDiv.setAttribute("class","dragNDrop");
    newDiv.innerHTML = "<label class='dropLabel'>Drop <span class='keyWord'>"+buttonList[i]+"</span> File Here<br>Or Click to Select</label> <input type='image' class='uploadIm' src='../images/upload.svg'>";
    var totGap = (buttonList.length + 2) * 1.5;

    newDiv.style.width = ((100-totGap)/buttonList.length).toString() + "%";
    // set the on dragover event to alter the css of the text
    newDiv.ondragover = function(){
      $(this).addClass("onHover");
    }

    // load the files in when a user drops them onto the box
    newDiv.ondrop = function(e){
      var files = e.target.files || e.dataTransfer.files;
      // instanciate the reader
      var reader = new FileReader();
      picker.place = this.getAttribute("value");
      //define what happens when a file is loaded
      reader.onload = function(event){
        dataSet[picker.place] = reader.result;
        if(buttonList.length == dataSet.length){
          $("#moveOn").show();
        }
        // Now that the file is loaded I need to call the parsing functions and
        // alter the box to indicate that a file has been successfully loaded.
      }
      // tell the reader what to load and as a text blob
      reader.readAsText(files[0]);
    }

    // enable the functionality for a user to click on the box and open a
    // dropdown window.
    newDiv.onclick = function(e){
      $(picker).trigger('click');
      picker.place = this.getAttribute("value");
    }

    // start by creating the logical html string
    var newHtml= "<div class='dragNDrop' ondragover='dragHandle(this)' ondrop='dropHandle(e)' onclick='clickHandle(this)' value='"+i+"'><label>Drop Files Here<br>Or Click to Select</label></div>"

    $("#buttonHouse").append(newDiv).show();
    // now we have to append functionality to it

  }

}


$("#moveOn").click(function(){
  // trigger to split data file (csv to start) and display it's data in a table
  console.log("hi");
  var typeChosen = $("#typeOption").val();
  var fileFormat = $("#fileOption").val();

  // slide to the new window
  $("#selection").hide();
  $("#colChoice").show();

  // begin segminting by different function
  if(typeChosen == "Tree"){

    if(fileFormat == "CSV + Newick"){
      CSVNewickTree(dataSet);
    }


  }

});




function dragHandle(dropper){
  var jdropper = $(dropper);

}

function clickHandle(dropper){
  $("#filePicker").trigger('click');
  var place = parseInt($(dropper).attr("value"));

}

function dropHandle(e){

}


initialize();
