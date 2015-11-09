
var fs = require('fs');
var parser = require('biojs-io-newick');
var request = require('request')
var metaData = {}

function compare(){
  var fileDate;
  fs.readFile('sample/sample.tsv',function(err, content){
    //console.log(content.toString());
    var acdata = content.toString().split("\n");
    for(var i = 0; i < acdata.length; i++){
      var line= acdata[i];
      if(line.length > 0){
        var dataset = line.split("\t");
        var id = dataset[0].split("|")[0]
        metaData[id] = dataset;
      }
    }
    loadNewick();
  });



}


function loadNewick(){
  fs.readFile('sample/sample.newick',function(err,content){
    var lotsOStuff = content.toString();
    var tree = parser.parse_newick(lotsOStuff);
    //console.log(metaData);
    var rootNode = recBuild(tree);
    //console.log(correctData);
    earthStructure.data = data;
    earthStructure.options.roots = [rootNode];

    var allPlaces = Object.keys(places);
    for(var i = 0; i < allPlaces.length; i++){
      //console.log(allPlaces[i]);
      setTimeout(geoLocate(allPlaces[i],allPlaces.length,allPlaces[i]), 1200);
    }

  });
}

var earthStructure = {"metadata":{
                        "fileName":"",
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
var data ={};
function recBuild( source){
  var nodeRep = {};
  if(source.children == undefined || source.children.length == 0){
    nodeRep.children = [];
    var name = source.name.replace(new RegExp("\'",'g'),"");

    if(name in data){
      return name;
    }

    nodeRep.coord = metaData[name][21];//19th position has the place. It will need to be geocoded.
    if(!(nodeRep.coord in places)){
      places[nodeRep.coord] = '';
    }
    nodeRep.root = false;

    nodeRep.desc = metaData[name][24]//26th;
    nodeRep.links = [];
    nodeRep.color = "#b4a643";
    nodeRep.date = metaData[name][36]
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
  if(name == '\'\''){
    name = genVariable();
  }
  nodeRep.root = false;
  nodeRep.desc = "";
  nodeRep.links = [];
  nodeRep.color = "#e3483e";
  nodeRep.date= "";
  data[name] = nodeRep;
  return name;
}

var places = {};




// generate a name for a node that isn't otherwise labled.
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

var countSuccess = 0;
function finishCoding(total){
  countSuccess = countSuccess + 1;
  console.log("count success =================  " + countSuccess);
  if(countSuccess == total){
    console.log("successfully completed all geocoding")
    // stuff all of the new coordinates into the object
     var objKeys = Object.keys(earthStructure.data)
    for(var i = 0; i < Object.keys(earthStructure.data).length; i++){
        var piq = earthStructure.data[objKeys[i]].coord;
        var coords = places[piq];
        earthStructure.data[objKeys[i]].coord = coords;
    }

    fs.writeFile("sample.json",JSON.stringify(earthStructure),function(){
      console.log("conversion successful")
    });
  }
}

function geoLocate(place,total,original){

  if(place.indexOf('\#') > -1){
      place = place.slice(0,place.indexOf('\#'));
  }
  var testPlace = place.replace(new RegExp(" ",'g'),"\%20");
  console.log("locating: " + place)
  //console.log('http://nominatim.openstreetmap.org/search/' + testPlace + '?format=json');
  request('http://nominatim.openstreetmap.org/search/' + testPlace + '?format=json',function(error,response,body){
    if(!error && response.statusCode == 200){
      var result = JSON.parse(body);
      if(result == undefined || result[0] == undefined || result.length == 0){
        var newPlace = place.slice(0,place.lastIndexOf(" "));
        console.log("failed to find " + place + ". Now testing " + newPlace);
        setTimeout(geoLocate(newPlace,total,original),1200);
      }
      else{
        console.log("located: " + place);
        places[place] = [result[0].lat,result[0].lon];
        finishCoding(total);
      }
    }
    else{
      console.log(error)

      var newPlace = place.slice(0,place.lastIndexOf(" "));
      console.log("failed to find " + place + ". Now testing " + newPlace)
      setTimeout(geoLocate(newPlace,total,original),1200);
    }
  });
}



compare();
