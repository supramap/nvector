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
    if(line.length > 0){
      var dataset = line.split(",");
      var id = dataset[dataPlaces.mandatory.name - 1];
      metaData[id] = dataset;
    }
  }
  loadNewick(dataIn);



}


function loadNewick(dataIn){
    var tree = parser.parse_newick(dataIn[1]);
    //console.log(metaData);
    var rootNode = recBuild(tree);
    //console.log(correctData);
    earthStructure.data = data;
    earthStructure.options.roots = [rootNode];

    fs.writeFile(outFile,JSON.stringify(earthStructure),function(){
      console.log("conversion successful")
    });

}

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
function recBuild( source){
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
    nodeRep.date = metaData[name][3];
    nodeRep.coord = [metaData[name][1],metaData[name][2]];
    data[name] = nodeRep;
    return name;
  }

  var childNames = []
  for(var i = 0; i < source.children.length; i++){
    var name = recBuild(source.children[i]);
    childNames.push(name);
  }

  nodeRep.children = childNames

  var name = source.name;
  if(name == '\'\'' || name == "" || !isNaN(name)){
    name = genVariable();
  }
  else{
  	nodeRep.coord = [metaData[name][1],metaData[name][2]];
  }
  nodeRep.root = false;
  nodeRep.desc = "";
  nodeRep.links = [];
  nodeRep.color = "#e3483e";
  nodeRep.date= "";
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
