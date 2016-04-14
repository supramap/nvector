var static = require('node-static');
var os = require('os');

var fileServer = new static.Server('../earth/NVector');
var ifaces = os.networkInterfaces();

console.log("Server running");

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;


  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log("Connect at http://" + iface.address + ":8080");
    }
    ++alias;
  });
});

require('http').createServer(function (request, response) {
	console.log("HIT")
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(8080);
