(this.webpackJsonpVirtualTurntable=this.webpackJsonpVirtualTurntable||[]).push([[0],{707:function(e,t,a){e.exports=a(750)},712:function(e,t,a){},745:function(e,t,a){},746:function(e,t,a){},750:function(e,t,a){"use strict";a.r(t);var n=a(9),r=a.n(n),o=a(543),i=a.n(o),l=(a(712),a(5)),c=a.n(l),s=a(13),u=a(754),f=a(753),m=a(544),p=a(71),v=a(694),d=a.n(v);a(744);function b(){return(b=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e}).apply(this,arguments)}function h(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var g=r.a.createElement("g",{id:"Page-1",stroke:"none",strokeWidth:1,fill:"none",fillRule:"evenodd"},r.a.createElement("g",{id:"Group",transform:"translate(3.000000, 3.000000)",fillRule:"nonzero",stroke:"#fff"},r.a.createElement("path",{d:"M50,100 C77.6142375,100 100,77.6142375 100,50 C100,22.3857625 77.6142375,0 50,0 C22.3857625,0 0,22.3857625 0,50",id:"Oval",strokeWidth:5}),r.a.createElement("polygon",{id:"Triangle",fill:"#fff",transform:"translate(41.882241, 98.882241) rotate(273.000000) translate(-41.882241, -98.882241) ",points:"41.8822412 91.3822412 49.3822412 106.382241 34.3822412 106.382241"}))),y=function(e){var t=e.svgRef,a=e.title,n=h(e,["svgRef","title"]);return r.a.createElement("svg",b({viewBox:"0 0 106 111",ref:t},n),a?r.a.createElement("title",null,a):null,g)},w=r.a.forwardRef((function(e,t){return r.a.createElement(y,b({svgRef:t},e))})),E=(a.p,a(745),a(746),a(695)),O=!1,k=[],j=[],N=new(a.n(E).a);p.a.prototype._reverse=function(){return this.loaded&&((O=!O)?(this._buffer.copyToChannel(j[0],0,0),this._buffer.copyToChannel(j[1],1,0)):(this._buffer.copyToChannel(k[0],0,0),this._buffer.copyToChannel(k[1],1,0))),this},window.location.protocol;var M=function(e,t){var a=Math.round(60*e/360);if(t){var n=Math.abs(a/45);console.log(n),t.playbackRate=n>.1?n:0;var r=t.reverse;t.reverse=a>0,r!==t.reverse&&(C=t.buffer.duration-C,C=Math.max(Math.min(C,t.buffer.duration),0),t.start(0,C))}},x=function(e,t,a,n,r){var o=Math.round(60*e/360),i=t+Math.abs(o/45)*a/1e3;return Math.max(Math.min(i,r),n)},C=0,P=0;var R=function(e){return Object(n.useEffect)((function(){var t=new p.b({onload:function(){for(var a=0;a<t._buffer.numberOfChannels;a++){var n=t._buffer.getChannelData(a);k.push(n.slice()),j.push(n.slice().reverse())}e.onload(t)},url:e.url,loop:e.loop}).toDestination()}),[]),null},D=function(){var e=Object(n.useState)({}),t=Object(s.a)(e,2),a=t[0],o=t[1],i=Object(n.useState)(!1),l=Object(s.a)(i,2),p=l[0],v=l[1],b=Object(n.useState)(!1),h=Object(s.a)(b,2),g=h[0],y=h[1],E=Object(n.useState)(!1),O=Object(s.a)(E,2),k=O[0],j=O[1];return Object(n.useEffect)((function(){y(!window.DeviceOrientationEvent||!m.isMobile)}),[]),r.a.createElement("div",{className:"app"},r.a.createElement(R,{url:"./Midday.[mp3|ogg]",onload:function(e){a.start||(console.log("SET PLAYER"),o(e))},loop:!0}),r.a.createElement("div",{className:"title-wrapper"},r.a.createElement("span",{className:"playing-title "},"Now Playing"),r.a.createElement("div",{className:"track-title"},"Moff & Tarkin - Powerplay")),r.a.createElement("div",{className:"vinyl-wrapper"},r.a.createElement("img",{alt:"vinyl",className:"vinyl-image  ".concat(a?"":"loading"),src:"man.jpg"}),r.a.createElement("div",{className:"vinyl-dot center"}),!a.start&&r.a.createElement(d.a,{type:"Puff",className:"center",color:"#00BFFF",height:300,width:300}),a.start&&!p&&r.a.createElement("button",{className:"center",onClick:function(){var e,t;return c.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:if(a.start(),a.playbackRate=0,!window.DeviceOrientationEvent){n.next=12;break}if(!DeviceMotionEvent.requestPermission){n.next=9;break}return n.next=6,c.a.awrap(DeviceMotionEvent.requestPermission());case 6:n.t0=n.sent,n.next=10;break;case 9:n.t0="granted";case 10:("granted"===(e=n.t0)||e.result&&"granted"===e.result)&&(t=Object(u.a)(window,"devicemotion").pipe(Object(f.a)(10)),N.enable(),v(!0),j(!0),P=new Date,t.subscribe((function(e){C=x(e.rotationRate.gamma,C,new Date-P,0,a.buffer.duration),M(e.rotationRate.gamma,a),P=new Date})));case 12:case"end":return n.stop()}}))}},"Get Started"),p&&k&&r.a.createElement("div",{className:"message center"},r.a.createElement("img",{alt:"close",onClick:function(){return j(!1)},className:"message-close",src:"close.png"}),r.a.createElement(w,{className:"rotate rotating-svg"}),"Turn off silent mode and rotate the phone to hear the song play"),g&&r.a.createElement("div",{className:"message"},"Looks like your device does not support the",r.a.createElement("a",{style:{marginLeft:"5px"},href:"https://caniuse.com/#feat=deviceorientation"},"Device Motion event"),". ",r.a.createElement("br",null),"Please try again with a mobile device")),r.a.createElement("a",{className:"buy-wrapper",href:"https://lagaffetales.bandcamp.com"},"Buy on"," ",r.a.createElement("img",{className:"buy-wrapper-image",alt:"bandcamp",src:"bandcamp-logotype-light-512.png"})))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(r.a.createElement(D,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))}},[[707,1,2]]]);
//# sourceMappingURL=main.6c8a2031.chunk.js.map