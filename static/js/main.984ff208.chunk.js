(this.webpackJsonpVirtualTurntable=this.webpackJsonpVirtualTurntable||[]).push([[0],{22:function(e,t,n){e.exports=n(56)},27:function(e,t,n){},52:function(e,t,n){},56:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),o=n(18),i=n.n(o),l=(n(27),n(15)),c=n.n(l),s=n(14),u=n(60),f=n(59),m=n(19),v=n(16),p=n(20),d=n.n(p);n(51);function b(){return(b=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e}).apply(this,arguments)}function h(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var g=r.a.createElement("g",{id:"Page-1",stroke:"none",strokeWidth:1,fill:"none",fillRule:"evenodd"},r.a.createElement("g",{id:"Group",transform:"translate(3.000000, 3.000000)",fillRule:"nonzero",stroke:"#fff"},r.a.createElement("path",{d:"M50,100 C77.6142375,100 100,77.6142375 100,50 C100,22.3857625 77.6142375,0 50,0 C22.3857625,0 0,22.3857625 0,50",id:"Oval",strokeWidth:5}),r.a.createElement("polygon",{id:"Triangle",fill:"#fff",transform:"translate(41.882241, 98.882241) rotate(273.000000) translate(-41.882241, -98.882241) ",points:"41.8822412 91.3822412 49.3822412 106.382241 34.3822412 106.382241"}))),E=function(e){var t=e.svgRef,n=e.title,a=h(e,["svgRef","title"]);return r.a.createElement("svg",b({viewBox:"0 0 106 111",ref:t},a),n?r.a.createElement("title",null,n):null,g)},y=r.a.forwardRef((function(e,t){return r.a.createElement(E,b({svgRef:t},e))})),w=(n.p,n(52),n(21)),O=!1,k=[],j=[],R=new(n.n(w).a);v.Buffer.prototype._reverse=function(){return this.loaded&&((O=!O)?(this._buffer.copyToChannel(j[0],0,0),this._buffer.copyToChannel(j[1],1,0)):(this._buffer.copyToChannel(k[0],0,0),this._buffer.copyToChannel(k[1],1,0))),this},window.location.protocol;var M=function(e,t){var n=Math.round(60*e/360);if(t){var a=Math.abs(n/45);t.playbackRate=a>.1?a:0;var r=t.reverse;t.reverse=n>0,r!==t.reverse&&(console.log("REWIND"),C=t.buffer.duration-C,C=Math.min(Math.max(C,t.buffer.duration),0),t.stop().start(0,C))}},x=function(e,t,n){var a=Math.round(60*e/360),r=Math.abs(a/45);return console.log(t),console.log(n),t+r*n/1e3},C=0,D=0;var P=function(e){return Object(a.useEffect)((function(){var t=new v.Player({onload:function(){for(var n=0;n<t._buffer.numberOfChannels;n++){var a=t._buffer.getChannelData(n);k.push(a.slice()),j.push(a.slice().reverse())}e.onload(t)},url:e.url,loop:e.loop}).toMaster()}),[]),null},N=function(){var e=Object(a.useState)({}),t=Object(s.a)(e,2),n=t[0],o=t[1],i=Object(a.useState)(!1),l=Object(s.a)(i,2),v=l[0],p=l[1],b=Object(a.useState)(!1),h=Object(s.a)(b,2),g=h[0],E=h[1];Object(a.useEffect)((function(){E(!window.DeviceOrientationEvent||!m.isMobile)}),[]);var w=r.a.createElement(r.a.Fragment,null,r.a.createElement("button",{onClick:function(){n.reverse=!n.reverse,C=n.buffer.duration-C,n.start(0,C)}},"REVERSE"),r.a.createElement("input",{onChange:function(e){return n.playbackRate=e.target.value},step:"0.05",type:"range",min:"0",max:"1",class:"slider",id:"myRange"}),")");return r.a.createElement("div",{className:"app"},r.a.createElement(P,{url:"./Midday.[mp3|ogg]",onload:function(e){n.start||(console.log("SET PLAYER"),o(e))},loop:!0}),r.a.createElement("img",{alt:"vinyl",className:"vinyl-image center ".concat(n?"":"loading"),src:"man.jpg"}),r.a.createElement("div",{className:"vinyl-dot center"}),!n.start&&r.a.createElement(d.a,{type:"Puff",className:"center",color:"#00BFFF",height:350,width:350}),n.start&&!v&&r.a.createElement("button",{className:"center",onClick:function(){var e;return c.a.async((function(t){for(;;)switch(t.prev=t.next){case 0:if(n.playbackRate=1,p(!0),!window.DeviceOrientationEvent){t.next=12;break}if(!DeviceMotionEvent.requestPermission){t.next=9;break}return t.next=6,c.a.awrap(DeviceMotionEvent.requestPermission());case 6:t.t0=t.sent,t.next=10;break;case 9:t.t0="granted";case 10:"granted"===t.t0&&(n.start(),R.enable(),n.playbackRate=0,p(!0),n.context.updateInterval=.01,e=Object(u.a)(window,"devicemotion").pipe(Object(f.a)(5)),D=new Date,e.subscribe((function(e){C=x(e.rotationRate.gamma,C,new Date-D),M(e.rotationRate.gamma,n),D=new Date})));case 12:case"end":return t.stop()}}))}},"Get Started"),v&&r.a.createElement("div",{className:"center message"},r.a.createElement(y,{className:"rotate rotating-svg"}),"Turn of silent mode and rotate the phone to hear the song play"),w,g&&r.a.createElement("div",{className:"center message"},"Looks like your device does not support the",r.a.createElement("a",{href:"https://caniuse.com/#feat=deviceorientation"},"Device Motion event"),". ",r.a.createElement("br",null),"Please try again with a mobile device"))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(r.a.createElement(N,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))}},[[22,1,2]]]);
//# sourceMappingURL=main.984ff208.chunk.js.map