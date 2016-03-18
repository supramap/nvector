


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
  console.log(value);
  // unshade the second selection box and fill it
  for(var i = 0; i < Object.keys(buttons).length; i++){
     var current = Object.keys(buttons)[i]
    $("#fileOption").append("<option class='optionBox' value='"+ current +"'>" + current + "</option>")
  }

}

function changeButtons(){
  var value = $("#fileOption option:selected").text();
  var buttonList = buttons[value];

  // create the filepicker for this system
  var picker = document.createElement("input")
  picker.setAttribute("type","file");
  picker.setAttribute("class","hiddenFileSelect");
  picker.setAttribute("id","filePicker");
  picker.onchange = function(evt,val){
    var f = this.files[0];
    latestFileName = f.name;
    var r = new FileReader();
    r.onload = function(event){
        // do what you will to the data
        dataSet[val] = r.result;
    }
    r.readAsText(f);
  }
  $("#buttonHouse").append(picker);
  for(var i =0; i < buttonList.length; i++){

    //Need to dynamically add file input buttons and drag and drop zones
    var newDiv = document.createElement("div");
    newDiv.setAttribute("value",i);
    newDiv.setAttribute("class","dragNDrop");
    newDiv.innerHTML = "<label>Drop Files Here<br>Or Click to Select</label>";

    // set the on dragover event to alter the css of the text
    newDiv.ondragover = function(){
      $(this).addClass("onHover");
    }

    // load the files in when a user drops them onto the box
    newDiv.ondrop = function(e){
      var files = e.target.files || e.dataTransfer.files;
      // instanciate the reader
      var reader = new FileReader();
      //define what happens when a file is loaded
      reader.onload = function(event){
        console.log(reader.result);
        // Now that the file is loaded I need to call the parsing functions and
        // alter the box to indicate that a file has been successfully loaded.
      }
      // tell the reader what to load and as a text blob
      reader.readAsText(files[0]);
    }

    // enable the functionality for a user to click on the box and open a
    // dropdown window.
    newDiv.onclick = function(e){
      $(picker).trigger('click',i);
    }

    // start by creating the logical html string
    var newHtml= "<div class='dragNDrop' ondragover='dragHandle(this)' ondrop='dropHandle(e)' onclick='clickHandle(this)' value='"+i+"'><label>Drop Files Here<br>Or Click to Select</label></div>"

    $("#buttonHouse").append(newDiv);

    // now we have to append functionality to it

  }

}


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
