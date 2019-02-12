
var container, camera, scene, renderer
var parentNode;

init();
animate();

function init(){
  container = document.getElementById('window');

  camera = new THREE.PerspectiveCamera(27 , window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z= 100;



  scene = new THREE.Scene();
  var sphGeo = new THREE.SphereGeometry(20,32,32);
  var sphMat = new THREE.MeshBasicMaterial({color:0xffff00});
  var sphere = new THREE.Mesh(sphGeo, sphMat);


  parentNode  = new THREE.Object3D();



  scene.add(parentNode);
  renderer = new THREE.WebGLRenderer({ antialias: true});
  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  renderer.setSize(window.innerWidth, window.innerHeight);
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  container.appendChild(renderer.domElement);
}

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

$("#submit").click(function(){
  var desired = $("#locationSpec").val();
  var url = "http://nominatim.openstreetmap.org/search/" + desired + "?format=json"
   $.ajax({
    url: url,// the url for geolocation services.
    type: "GET",
    success: function(data){
      // take the new geolocation and get the tiles.
      $("#descriptor").val(data[0].display_name);
      getTile(data[0]);
    }
  });
});


function getTile(location){
  var conversion = getTileURL(parseFloat(location.lat), parseFloat(location.lon),10);
  var url = "http://cci-bsve.uncc.edu/osm/data/v3/" + conversion + ".geojson";
  $.ajax({
    url: url,
    type: "GET",
    success: function(data){
      generateLines(data);
    }
  })
}


var rad = 100;
function getTileURL(lat, lon, zoom) {
	    var xtile = parseInt(Math.floor( (lon + 180) / 360 * (1<<zoom) ));
	    var ytile = parseInt(Math.floor( (1 - Math.log(Math.tan(lat.toRad()) + 1 / Math.cos(lat.toRad())) / Math.PI) / 2 * (1<<zoom) ));
	    return "" + zoom + "/" + xtile + "/" + ytile;
	}

function generateLines(data){
  var geometryArray = genGeometryArray(data, false);
  var geo = normalize(geometryArray);
  console.log("finished creating the line data");
  var lines = initializeLines(geometryArray);
  scene.add(lines);
}

/*
  The normalize function will convert the current coordinate to fit in a 2d
  perspective
*/
// assume the window is a square.
var windowSize = 400;
function normalize(lineData){

  var xDiv = maxx - minx;
  var yDiv = maxy - miny;
  for(var i = 0; i < lineData.length; i++){
    var current = lineData[i];

    for(var c = 0; c < current.length; c = c+3){
      var x = current[c];
      var y = current[c+1];
      var z = current[c+2];

      var newX = ((windowSize)*((x - minx)/xDiv)) - (windowSize/2);
      var newY = ((windowSize)*((y - miny)/yDiv)) - (windowSize/2);


      if(newY > 0){
        newY = newY * -1
      }
      else{
        newY = Math.abs(newY);
      }


      current[c] = newX;
      current[c+1] = newY;
    }
  lineData[i] = current;


  }
  return lineData;

}


var minx;
var miny;
var maxx;
var maxy;


function locationToVector(inLat, inLon){
	var lon = inLon - 90;
	//var lon = inLon;
	var lat = inLat;

	if(isNaN(lon) || isNaN(lat)){
		return null;
	}

	var phi = Math.PI/2 - lat * Math.PI / 180 - Math.PI * 0.00//0.01;
	var theta = 2 * Math.PI - lon * Math.PI / 180 + Math.PI * 0.00//0.06;

	var center = new THREE.Vector3();
	center.x = Math.sin(phi) * Math.cos(theta) * rad;
	center.y = Math.cos(phi) * rad;
	center.z = Math.sin(phi) * Math.sin(theta) * rad;
	return center;
}



function genGeometryArray(inObject, poly){
    var lineArr = [];

    if(inObject.type == "FeatureCollection" ){
      for(var i = 0; i < inObject.features.length; i++){
        var currentline = [];
        var cordArr = [];
        var currentFeature = inObject.features[i];
        if(currentFeature.type == "Feature"){
          var featGeometry = currentFeature.geometry;
          if(featGeometry.type == "MultiPolygon"){
            for(var coords = 0; coords < featGeometry.coordinates.length; coords++){
                cordArr = featGeometry.coordinates[coords];
                lineArr.push(featureLineBuild(cordArr, poly));
            }
          }
          else if(featGeometry.type == "Polygon"){
            cordArr = featGeometry.coordinates;
            lineArr.push(featureLineBuild(cordArr,poly));
          }
          else if(featGeometry.type == "LineString"){
            cordArr = [featGeometry.coordinates];
            lineArr.push(featureLineBuild(cordArr,poly));
          }


        }
      }
    }

    else if(inObject.type == "GeometryCollection"){
      for(var i = 0; i < inObject.geometries.length; i++){
        var currentPolly = inObject.geometries[i];
        if(currentPolly.type == "Polygon" || currentPolly.type == "MultiPolygon"){
          // This for loop is to iterate through the inner and outer polygons for
          // multipolygon instances. More often than not there will be single polygons
          // and its unlikely that there will be very many polygons in a multipolygon
          // so this loop can likely be ignored for most cases of efficiency.
          for(var subPoly = 0; subPoly < currentPolly.coordinates.length; subPoly++){
            var currentline = [];
            var cordArr
            if(currentPolly.type == "Polygon"){
              cordArr = currentPolly.coordinates[subPoly];
            }
            else if(currentPolly.type == "MultiPolygon"){
              cordArr = currentPolly.coordinates[subPoly][0];
            }

            var lastLat = null;
            var lastLon = null;

            for(var coordP = 0; coordP < cordArr.length; coordP++){
              var lat = cordArr[coordP][1];
              var lon = cordArr[coordP][0];
              if(poly){
                lat = lat.toFixed(2);
                lon = lon.toFixed(2);
                if(lat == lastLat || lon == lastLon){
                    continue;
                }
                lastLat = lat;
                lastLon = lon
              }
              var vect = xymerc(lat,lon, 50,50);
              testVect(vect);
              //var vect = locationToVector(cordArr[coordP][1],cordArr[coordP][0]);
              //$.merge(currentline,[vect.y,vect.x,vect.z]);
              if(!poly){
                $.merge(currentline,[vect.x,vect.y,vect.z]);
              }
              else{
                currentline.push(vect);
              }
            }
            lineArr.push(currentline);
          }
        }
      }
    }
    return lineArr;
  }

  function featureLineBuild(cordArr,poly){
    var currentLine = [];
    for(var arrPlace = 0; arrPlace < cordArr.length; arrPlace++){
      var lastLon = null;
      var lastLat = null;
      for(var coordP = 0; coordP < cordArr[arrPlace].length; coordP++){
        var lat = cordArr[arrPlace][coordP][1];
        var lon = cordArr[arrPlace][coordP][0];

        if(poly){
          lat = lat.toFixed(2);
          lon = lon.toFixed(2);
          if(lat == lastLat || lon == lastLon){
            continue;
          }
          lastLast = lat;
          lastLon = lon;
        }
        var vect = xymerc(lat,lon, 50,50);
        testVect(vect);
        //var vect = locationToVector(lat,lon);
        //$.merge(currentline,[vect.y,vect.x,vect.z]);
        if(!poly){
          $.merge(currentLine,[vect.x,vect.y,vect.z]);
        }
        else{
          currentLine.push(vect);
        }
      }
    }
    return currentLine;
  }

function testVect(vect){
  if(!minx){minx = vect.x;}
  if(!miny){miny = vect.y;}
  if(!maxx){maxx = vect.x;}
  if(!maxy){maxy = vect.y;}

  var checkX = vect.x;
  var checkY = vect.y;

  if(checkX < minx){minx = checkX;}
  if(checkX > maxx){maxx = checkX;}
  if(checkY < miny){miny = checkY;}
  if(checkY > maxy){maxy = checkY;}
}

function initializeLines(lineData,defaultColor){
	if(defaultColor == undefined){
		defaultColor = [1,1,1];
	}

	var lineGeo = new THREE.BufferGeometry();
	var lineMat = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors});
	// For increased line width:
	//lineMat.linewidth = 2;
	lineMat.linewidth = $("input:radio[name=lnwidth]:checked").val();


	var linepos = []
	var posIndex = 0;
	var colors = [];
	var indicesArr = []

 	var colIndex = [];
	var colcol = [];



	var p = 0;
	var coloring = false;
	for(var i = 0; i < lineData.length;i++){
		//linepos = linepos.concat(lineData[i]);
		$.merge(linepos,lineData[i])
		var calcLength = (lineData[i].length/3)-1 ;
		for(var seg = 0; seg < calcLength; ++seg ){
			indicesArr.push(posIndex + seg,posIndex + seg +1);

		}

		// calculate the color positions for each line
		if(colIndex[p] === i){
			coloring = true;
		}
		var colorDuration = 0;
		//p is the current index position of the color starting place currently being
		// searched for


		for(ccount = 0; ccount < lineData[i].length; ccount = ccount + 3){
			//colors.push(Math.random()*0.5+0.5, Math.random()*0.5+0.5, 1);
			if(colIndex.length > 0 && coloring === true){
				var toMerge = [colcol[p].r/255,colcol[p].g/255,colcol[p].b/255];
				$.merge(colors,toMerge);

			}
			else{
				$.merge(colors,defaultColor);
			}
		}
		if(coloring == true){
			coloring = false;
			p++;
		}

		posIndex = posIndex + calcLength + 1;
		//colors.push(.9, .2, .4);
		//colors.push(Math.random()*0.5+0.5, Math.random()*0.5+0.5, 1);
	}
	// 128500 - 128502 seems to be the problem child.........
	// this translates to the 65535 vertices to the 65536 vertices,
	// which can be found at the 196,605 index of the linepos...
	//ratio for linepos count to indicesArr count : (2x/3) - 2
	var bsTest = indicesArr.slice(128500,128502);
	// test for colors
  lineGeo.setIndex(new THREE.BufferAttribute( new Uint16Array( /*bsTest*/ indicesArr), 1 ));
	//lineGeo.addAttribute( 'index', new THREE.BufferAttribute( new Uint32Array( indicesArr ), 1 ) );
	lineGeo.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( linepos ), 3 ) );
	lineGeo.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( colors ), 3 ) );
	lineGeo.computeBoundingSphere();

	var mesh = new THREE.LineSegments(lineGeo, lineMat, THREE.LineSegments);

	return mesh;
}





function xymerc(lat, lon, mapWidth, mapHeight){
  var x = (lon + 180) * (mapWidth/360);
  var latRad = lat*Math.PI/180;
  var mercN = Math.log(Math.tan((Math.PI/4) + (latRad/2)));
  var y = (mapHeight/2) - (mapWidth*mercN/(2*Math.PI))
  var result = new THREE.Vector3();

  result.x = x;
  result.y = y;
  result.z = 0;
  return result;
}

function render(){
  renderer.render(scene, camera);
}

function animate(){
  requestAnimationFrame(animate);
  render();
}
