var fs = require('fs');
var parser = require('biojs-io-newick');
var metaData = {};


var args = process.argv.slice(2);

var tsv = args[0];
var newick = args[1];
var outFile = "Result.json"



function createTreeCSVNewick(dataIn,dataPlaces, topRow){
  var fileDate;
    //console.log(content.toString());
  var acdata = dataIn[0].split("\n");
  for(var i = 0; i < acdata.length; i++){
    var line= acdata[i];
    if($("#removeHeader").is(":checked") && i == 0){
      continue;
    }
    if(line.length > 0){
      var dataset = line.split(",");
      var id = dataset[dataPlaces.mandatory.name - 1];
      metaData[id] = dataset;
    }
  }
  loadNewick(dataIn, dataPlaces);



}


function loadNewick(dataIn, dataPlaces){
    var tree = parser.parse_newick(dataIn[1]);
    //console.log(metaData);
    var rootNode = recBuild(tree,dataPlaces);
    if(dataPlaces.optional.date){
      earthStructure.options.time = true;
    }
    //console.log(correctData);
    earthStructure.data = data;
    earthStructure.options.roots = [rootNode];
    $("#savePath").trigger('click');


}

$("#savePath").change(function(evt){
  fs.writeFile(evt.delegateTarget.value,JSON.stringify(earthStructure),function(){
    $("#colChoice").hide();
    $("#completed").show();
  });
})

var earthStructure = {"metadata":{
                        "fileName":outFile,
                        "author":"",
                        "irods": "",
                        "description":""
                      },
                      "options":{
                        "rootsCount":1,
                        "time":false,
                        "timeRange":[],
                        "roots":[]
                        }

                      };
// Pass in the data object so that it can be continously filled as the
// data gets parsed.
var data ={}, places = {};
function recBuild( source, dataPlaces){
  var nodeRep = {};
  if(source.children == undefined || source.children.length == 0){
    nodeRep.children = [];
    //var name = source.name.replace(new RegExp("\'",'g'),"");
    var name = source.name;
    if(name in data){
      return name;
    }

    nodeRep.root = false;
    nodeRep.desc = ""
    nodeRep.links = [];
    nodeRep.color = "#b4a643";

    var placeKeys = Object.keys(dataPlaces.optional);
    for(var i = 0; i < placeKeys.length; i++){
          try{
            nodeRep[placeKeys[i]] = metaData[name][dataPlaces.optional[placeKeys[i]]-1];
          }
          catch(err){
            alert("An error was found... " + name + "as found in the newick file does not exist in the csv");
          }
    }

    //nodeRep.date = metaData[name][3];
    var latPos = dataPlaces.mandatory.lat -1;
    var lonPos = dataPlaces.mandatory.lon -1;
    nodeRep.coord = [metaData[name][latPos],metaData[name][lonPos]];
    data[name] = nodeRep;
    return name;
  }

  var childNames = []
  for(var i = 0; i < source.children.length; i++){
    var name = recBuild(source.children[i], dataPlaces);
    childNames.push(name);
  }

  nodeRep.children = childNames

  var name = source.name;



  if(name == '\'\'' || name == "" || !isNaN(name)){
    name = genVariable();
    nodeRep.root = false;
    nodeRep.desc = "";
    nodeRep.links = [];
    nodeRep.color = "#e3483e";
    nodeRep.date= "";

  }
  else{

    var placeKeys = Object.keys(dataPlaces.optional);
    for(var i = 0; i < placeKeys.length; i++){
          nodeRep[placeKeys[i]] = metaData[name][dataPlaces.optional[placeKeys[i]] - 1];
    }
    if(metaData[name] == undefined){
      alert("There was an error trying to match the ID: " + name + "in your tree file with the metaData. Please check to make sure that this ID is consistant in both files.")
      return;
    }
    else{
  	   nodeRep.coord = [metaData[name][dataPlaces.mandatory["lat"]] -1,metaData[name][dataPlaces.mandatory["lon"]] -1];
    }
  }

  data[name] = nodeRep;
  return name;
}






var lastChar = 'a';
var lastNumber = 0
function genVariable(){
  var toReturn = lastChar + lastNumber;
  if(lastNumber == 1000){
    lastChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
    lastNumber = lastNumber = 0;
  }
  else{
    lastNumber = lastNumber + 1;
  }
  return toReturn;
}
