q4ssss.X=function(y){return y;};q4ssss.w4=function(y){return y;};q4ssss.T4=function (){return typeof q4ssss.P4.q==='function'?q4ssss.P4.q.apply(q4ssss.P4,arguments):q4ssss.P4.q;};q4ssss.a4=function(x,y){return x in y;};q4ssss.B4=function (){return typeof q4ssss.P4.q==='function'?q4ssss.P4.q.apply(q4ssss.P4,arguments):q4ssss.P4.q;};q4ssss.f4=function (){return typeof q4ssss.P4.q==='function'?q4ssss.P4.q.apply(q4ssss.P4,arguments):q4ssss.P4.q;};function q4ssss(){}q4ssss.Y=function(x,y){return x===y;};q4ssss.A4=function(y){return y;};q4ssss.j4=function(y){return y;};q4ssss.o4=function (){return typeof q4ssss.P4.q==='function'?q4ssss.P4.q.apply(q4ssss.P4,arguments):q4ssss.P4.q;};q4ssss.O4=function(y){return y;};q4ssss.F4=function(x,y){return x<y;};q4ssss.K4=function(x,y){return x<y;};q4ssss.v4=function(y){return y;};q4ssss.t4=function(x){return x;};q4ssss.V4=function(y){return y;};q4ssss.M4=function (){return typeof q4ssss.P4.q==='function'?q4ssss.P4.q.apply(q4ssss.P4,arguments):q4ssss.P4.q;};q4ssss.q4=function(y){return y;};q4ssss.z4=function(y){return y;};q4ssss.P4=function(){var z=function(V,w){var K=w&0xffff;var a=w-K;return(a*V|0)+(K*V|0)|0;},O=function(o,T,E){var h=0xcc9e2d51,C=0x1b873593;var P=E;var B=T&~0x3;for(var M=0;M<B;M+=4){var m=o.charCodeAt(M)&0xff|(o.charCodeAt(M+1)&0xff)<<8|(o.charCodeAt(M+2)&0xff)<<16|(o.charCodeAt(M+3)&0xff)<<24;m=z(m,h);m=(m&0x1ffff)<<15|m>>>17;m=z(m,C);P^=m;P=(P&0x7ffff)<<13|P>>>19;P=P*5+0xe6546b64|0;}m=0;switch(T%4){case 3:m=(o.charCodeAt(B+2)&0xff)<<16;case 2:m|=(o.charCodeAt(B+1)&0xff)<<8;case 1:m|=o.charCodeAt(B)&0xff;m=z(m,h);m=(m&0x1ffff)<<15|m>>>17;m=z(m,C);P^=m;}P^=T;P^=P>>>16;P=z(P,0x85ebca6b);P^=P>>>13;P=z(P,0xc2b2ae35);P^=P>>>16;return P;};return{q:O};}();q4ssss.m4=function(y){return y;};q4ssss.L4=function(y){return y;};(typeof window==="object"?window:global).q4ssss=q4ssss;function loadContentData(O){var q;q="categories/All.json";q=encodeURI(q);xhr=new XMLHttpRequest();xhr["open"]('GET',q,!"");xhr["onreadystatechange"]=function(){if(xhr["readyState"]===4&&q4ssss.Y(xhr["status"],200)){timeBins=JSON["parse"](xhr["responseText"])["timeBins"];maxValue=0;startTime=q4ssss.X(timeBins[0]["t"]);endTime=timeBins[timeBins["length"]-1]["t"];timeLength=endTime-startTime;if(O)O();console["log"]("finished read data file");}};xhr["send"](null);}function loadTransmissionsJson(F,m){var w,a,V,L,K;if(typeof F=="string"){locations=q4ssss.q4(JSON["parse"](F));}else{locations=F;}if(locations["options"]["time"]==!""&&locations["options"]["timeRange"]["length"]<2){w=locations["data"];a=Object["keys"](w);for(var A=q4ssss.z4(0);A<a["length"];A++){K=w[a[A]];if(K["date"]["length"]<1){continue;}if(V==undefined){V=K["date"];}if(L==undefined){L=K["date"];}if(new Date(K["date"])<new Date(V)){V=q4ssss.O4(K["date"]);}if(new Date(K["date"])>new Date(L)){L=K["date"];}}locations["options"]["timeRange"]=[V,L];}if(!jQuery["isEmptyObject"](locations)){if(q4ssss.K4(locations["metadata"]["fileName"]["length"],1)){addNewGraph(locations,m);}else{addNewGraph(locations,locations["metadata"]["fileName"]);}}}function loadTransmissions(W,Q){var Z,C,o,D,M,h,N,T,U,B,I,J,S,k,G,n,R;locations=q4ssss.V4({});locations['metadata']={"author":"","description":"","filename":"","irods":""};locations['options']={"roots":[],"rootsCount":0,"time":![]};locations['data']={};places={};Z=q4ssss.L4(W["split"]("\n"));for(var E=0;E<Z["length"];E++){C=Z[E];if(C["indexOf"]("->")>-1){o=q4ssss.j4(C["split"]("->"));D=o[0]["replace"](/\"/g,"")["trim"]();M=q4ssss.A4(o[1]["substring"](0,o[1]["indexOf"]("["))["replace"](/\"/g,"")["trim"]());h={};N=o[1]["substring"](o[1]["indexOf"]("[")+1,o[1]["indexOf"]("]"))["split"](",");for(var P=0;q4ssss.F4(P,N["length"]);P++){T=N[P];U=T["split"]("=");h[U[0]["trim"]()]=U[1]["replace"](/\"/g,"");}if(!(D in locations["data"])){B=h["start"]["split"](":");if(B=="NONE"){locations["data"][D]={"children":[M],"root":"true","coord":"NONE"};}else{I=[parseInt(B[0]),parseInt(B[1])];locations["data"][D]=q4ssss.w4({"children":[M],"root":"true","coord":I});}}else{J=q4ssss.v4(locations["data"][D]);S=J["children"];S["push"](M);J["children"]=S;}if(!q4ssss.a4(M,locations["data"])){B=h["end"]["split"](":");if(B=="NONE"){locations["data"][M]={"children":[],"root":"false","coord":"NONE"};}else{I=[parseInt(B[0]),parseInt(B[1])];locations["data"][M]={"children":[],"root":"false","coord":I};}}else if(q4ssss.t4(M in locations["data"])&&locations["data"][M]["root"]=="true"){locations["data"][M]["root"]=![];}}else if(C["indexOf"]("\"")>-1){o=q4ssss.m4(C["split"]("["));k=o[0]["replace"](/\"/g,"")["trim"]();h=o[1]["replace"](/]/g,"")["split"](",");places[k]={};for(var P=0;P<h["length"];P++){T=h[P]["split"]("=");if(T[0]["trim"]()=="position"){places[k]["position"]=T[1]["replace"](/\"/g,"")["trim"]();}if(T[0]["trim"]()=="color"){places[k]["color"]=T[1]["replace"](/\"/g,"")["trim"]();}}}}G=[];n=Object["keys"](locations["data"]);for(var P=0;P<n["length"];P++){R=locations["data"][n[P]];if(R["root"]=="true"){G["push"](n[P]);}}if(!jQuery["isEmptyObject"](places)){buildPlaces(places);}locations["options"]["roots"]=G;if(!jQuery["isEmptyObject"](locations)){addNewGraph(locations,Q);}}function loadLayer(s,u){var h4=48354264,D4=709646535,C4=2;for(var n4=1;q4ssss.o4(n4.toString(),n4.toString().length,20669)!==h4;n4++){var H;H=s;C4+=2;}if(q4ssss.B4(C4.toString(),C4.toString().length,89772)!==D4){addNewLayer(H,u);}var H;H=s;addNewLayer(H,u);}