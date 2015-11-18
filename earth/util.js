
// This is all for representatio of date---------------------------------------
var
	weekdays = [
		"Sunday", "Monday", "Tuesday",
		"Wednesday", "Thursday", "Friday",
		"Saturday"
	],
	months = [
		"January", "February", "March",
		"April", "May", "June", "July",
		"August", "September", "October",
		"November", "December"
	];

// Append a suffix to dates.
// Example: 23 => 23rd, 1 => 1st.
function nth (d) {
  if(d>3 && d<21) return 'th';
  switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

// Create a string representation of the date.
function formatDate ( date ) {
    return months[date.getMonth()] + " " +
				date.getDate() + nth(date.getDate()) + ", " +
        date.getFullYear();
}

function reFormatDate ( date ) {
    return date.getMonth()+1 + "-" +
				date.getDate() + "-" +
        date.getFullYear();
}

function timestamp(str){
    return new Date(str).getTime();
}

// End date -------------------------------------------------------------------

// A function defined to convert latitude and longitude values to 3d vectors for
// the earth
function locationToVector(inLat, inLon){
	var lon = inLon - 90;
	var lat = inLat;

	var phi = Math.PI/2 - lat * Math.PI / 180 - Math.PI * 0.00//0.01;
	var theta = 2 * Math.PI - lon * Math.PI / 180 + Math.PI * 0.00//0.06;

	var center = new THREE.Vector3();
	center.x = Math.sin(phi) * Math.cos(theta) * rad;
	center.y = Math.cos(phi) * rad;
	center.z = Math.sin(phi) * Math.sin(theta) * rad;
	return center;
}

/*
var sphereAttributes = {

	customColor: { type: 'c', value: [] }

};

var sphereUniforms = {

//	amplitude: { type: "f", value: 1.0 },
	color:     { type: "c", value: new THREE.Color( 0xffaa00 ) },
	//texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "images/particleA.png" ) },

};

var sphereMaterial = new THREE.ShaderMaterial( {

	uniforms:       sphereUniforms,
	attributes:     sphereAttributes,
	vertexShader:   document.getElementById( 'sphereVertex' ).textContent,
	fragmentShader: document.getElementById( 'sphereFragment' ).textContent,

	blending:       THREE.AdditiveBlending,
	depthTest:      false,
	transparent:    true

});

*/

/*function createSphere(colorc,name,vec){
	//sphereUniforms.color.value = new THREE.Color(colorc);
	var geometry = new THREE.SphereGeometry( .5 ,10, 10 );
	var material = sphereMaterial;
//	material.fog = false;

	var sphere = new THREE.Mesh( geometry,material);
	sphere.position.x = vec.x;
	sphere.position.y = vec.y;
	sphere.position.z = vec.z;
	sphere.name = name;

	return sphere;
};*/

function createPlainSphere(colorc,name,vec){
	var geometry = new THREE.SphereGeometry( .5 ,10, 10 );
	var material = new THREE.MeshLambertMaterial( {color: colorc, ambient:colorc} );
	material.fog = false;

	var sphere = new THREE.Mesh( geometry, material );
	sphere.position.x = vec.x;
	sphere.position.y = vec.y;
	sphere.position.z = vec.z;
	sphere.name = name;

	return sphere;
};



function toTHREEColor( colorString ){
	return new THREE.Color( parseInt( colorString.substr(1) , 16)  );
}


function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function gup( name )
{
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( results == null )
	return "";
	else
	return results[1];
}

function wrap(value, min, rangeSize) {
	rangeSize-=min;
    while (value < min) {
    	value += rangeSize;
	}
	return value % rangeSize;
}

THREE.Curve.Utils.createLineGeometry = function( points ) {
	var geometry = new THREE.Geometry();
	for( var i = 0; i < points.length; i ++ ) {
		geometry.vertices.push( points[i] );
	}
	return geometry;
};

function getAbsOrigin( object3D ){
	var mat = object3D.matrixWorld;
	var worldpos = new THREE.Vector3();
	worldpos.x = mat.n14;
	worldpos.y = mat.n24;
	worldpos.z = mat.n34;
	return worldpos;
}

function screenXY(vec3){
	var projector = new THREE.Projector();
	var vector = projector.projectVector( vec3.clone(), camera );
	var result = new Object();
    var windowWidth = window.innerWidth;
    var minWidth = 1280;
    if(windowWidth < minWidth) {
        windowWidth = minWidth;
    }
	result.x = Math.round( vector.x * (windowWidth/2) ) + windowWidth/2;
	result.y = Math.round( (0-vector.y) * (window.innerHeight/2) ) + window.innerHeight/2;
	return result;
}

function buildHexColumnGeo(rad, height){
	var points = [];
	var ang = 0;
	var sixth = 2*Math.PI / 6;
	for(var i=0; i<7; i++){
		var x = Math.cos(ang) * rad;
		var y = -Math.sin(ang) * rad;
		points.push( new THREE.Vector2(x,y) );
		ang += sixth;
	}
	var shape = new THREE.Shape(points);

	var options = {
		size: 			0,
		amount: 		height,
		steps: 			1,
		bevelEnabled:  	false,
	};
	var extrudedGeo = new THREE.ExtrudeGeometry(shape, options);
	return extrudedGeo;
}

function map(v, i1, i2, o1, o2) {
   return o1 + (o2 - o1) * (v - i1) / (i2 - i1);
 }

 function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

function save(data, filename, mime) {

    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, initRecord, errorHandler("Error getting file system"));

    function initRecord(fs) {
      var create = function() {
        fs.root.getFile("data.tar", {create: true}, function(fileEntry) {

          // Create a FileWriter object for our FileEntry (log.txt).
          fileEntry.createWriter(function(fileWriter) {


            var bb = new window.WebKitBlobBuilder();

            data = dataURItoBlob(data);
            var header = createHeader(filename, data.byteLength, mime);
            bb.append(header);
            bb.append(data);

//
            fileWriter.write(bb.getBlob('tar/archive'));
            window.open(fileEntry.toURL(), "_blank", "width=400,height=10");


          }, errorHandler("Error creating writer"));

        }, errorHandler("Error getting file"));
      };
      // delete any previous
      fs.root.getFile("data.tar", {create: false}, function(fileEntry) {
        fileEntry.remove(create, errorHandler("Error deleting file"));
      }, create);
    }

  function dumpString(value, ia, off, size) {
    var i,x;
    var sum = 0;
    var len = Math.min(value.length, size);
    for (i = 0; i < len; i++) {
      x = value.charCodeAt(i);
      ia[off] = x;
      sum += x;
      off += 1;
    }
    return sum;
  }

  function padLeft(value, size) {
    if (size < value.length) {
      throw new Error("Incompatible size");
    }
    var l = size-value.length;
    for (var i = 0; i < l; i++) {
      value = "0" + value;
    }
    return value;
  }

  function createHeader( name, size, type ){
    var ab = new ArrayBuffer(512);
    var ia = new Uint8Array(ab);
    var sum = 0;
    sum += dumpString(name, ia, 0, 99);
    sum += dumpString(size.toString(8), ia, 124, 12);
    sum += dumpString(padLeft("644 \0", 8), ia, 100, 8)
      // timestamp
      var ts = new Date().getTime();
    ts = Math.floor(ts/1000);
    sum += dumpString(ts.toString(8), ia, 136, 12);

    // extra header info
    sum += dumpString("0", ia, 156, 1);
    sum += dumpString("ustar ", ia, 257, 6);
    sum += dumpString("00", ia, 263, 2);

    // assume checksum to be 8 spaces
    sum += 8*32;
    //checksum 6 digit octal followed by null and space
    dumpString(padLeft(sum.toString(8)+"\0 ", 8), ia, 148, 8)
      return ab;
  }

  function dataURItoBlob(byteString) {

    // write the bytes of the string to an ArrayBuffer
    var padding = 512 - (byteString.length % 512);
    var ab = new ArrayBuffer(byteString.length + padding);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return ab;
  }


    function errorHandler(msg) {
		return function(e) {
			console.log(msg, e);
		}
    }
}

function wrap(value, min, rangeSize) {
  rangeSize-=min;
    while (value < min) {
      value += rangeSize;
  }
  return value % rangeSize;
}


// calculate details regarding the tree structure
function calcLeaves(data){
	var leafCount = 0;
	var allKeys = Object.keys(data);
	for(var i = 0; i < allKeys.length; i++){
		var current = data[allKeys[i]];
		if(current.children.length < 1){
			leafCount++;
		}
	}
	return leafCount;
}

function calcDepth(current,bigObj){
	var node = bigObj[current];

	if(node.children.length < 1){
		return 1;
	}

	var count;
	for(var i = 0; i < node.children.length; i++){
		var result = calcDepth(node.children[i],bigObj);
		if(count == undefined){
			count = result;
		}
		else{
			if(result > count){
					count = result;
			}
		}
	}
	return count + 1;


}

/*
	A recursive function designed to segment a curve appropriately to produce
	a fluid arc that stays above the earth
*/
function segmentLine(startPoint, endPoint, restraint){
	var lineLength = startPoint.distanceTo(endPoint)
	if(lineLength < restraint){
		return []
	}
	var currentMid = startPoint.clone().lerp(endPoint.clone(),.5);
	currentMid.setLength((startPoint.length() + endPoint.length())/2)
	var firstRetArray = segmentLine(startPoint,currentMid,restraint);
	var secRetArray = segmentLine(currentMid,endPoint, restraint);
	firstRetArray.push(currentMid)
	return firstRetArray.concat(secRetArray);

}
