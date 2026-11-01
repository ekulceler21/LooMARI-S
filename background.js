/* WebGL water and marine-snow rendering, matching the reference shader behaviour. */
(()=>{
const canvas=document.querySelector('#sea-canvas');const gl=canvas.getContext('webgl',{alpha:true,antialias:true});
if(!gl){canvas.parentElement.classList.add('no-webgl');return;}
const sources=window.DEEP_SEA_SHADERS;
function program(vert,frag){function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}const p=gl.createProgram();const vs=shader(gl.VERTEX_SHADER,vert),fs=shader(gl.FRAGMENT_SHADER,frag);gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));gl.deleteShader(vs);gl.deleteShader(fs);return p;}
const water=program(sources[1].source,sources[0].source),snow=program(sources[2].source,sources[3].source);
function uniforms(p,names){return Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(p,n)]));}
const uWater=uniforms(water,['depth','resolution','time','viewHeight','pageHeight']);const uSnow=uniforms(snow,['depth','resolution','time','currScrollTop','pageHeight','viewHeight','pixelRatio','particleScale']);
const waterBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,waterBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,-1,-1,1,-1,1,1]),gl.STATIC_DRAW);
const waterPosition=gl.getAttribLocation(water,'position');const names=['position','size','phase','scrollTop','parallax','spawnTime'];const buffers=Object.fromEntries(names.map(n=>[n,{buffer:gl.createBuffer(),location:gl.getAttribLocation(snow,n),components:n==='position'?2:1}]));
const particles=[];let tick=0,width=0,height=0,ratio=1,frameId;let lost=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function resize(){ratio=devicePixelRatio||1;width=innerWidth;height=innerHeight;canvas.width=Math.round(canvas.parentElement.clientWidth*ratio);canvas.height=Math.round(canvas.parentElement.clientHeight*ratio);gl.viewport(0,0,canvas.width,canvas.height);}
function uniform1(u,name,value){if(u[name]!==null)gl.uniform1f(u[name],value);}function setCommon(u){uniform1(u,'depth',scrollY/height);uniform1(u,'time',tick);uniform1(u,'viewHeight',height);uniform1(u,'pageHeight',document.body.scrollHeight);gl.uniform2f(u.resolution,width*ratio,height*ratio);}
function draw(){if(lost)return;if(width!==innerWidth||height!==innerHeight||ratio!==(devicePixelRatio||1))resize();tick++;
if(tick%10===0||!particles.length){while(particles.length>240)particles.shift();while(particles.length<250)particles.push({position:[Math.random()*2-1,Math.random()*2-1],size:Math.random()*10,phase:Math.random()*100,scrollTop:scrollY,parallax:Math.random()+.2,spawnTime:tick});}
gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.useProgram(water);gl.bindBuffer(gl.ARRAY_BUFFER,waterBuffer);gl.enableVertexAttribArray(waterPosition);gl.vertexAttribPointer(waterPosition,2,gl.FLOAT,false,0,0);setCommon(uWater);gl.drawArrays(gl.TRIANGLES,0,6);
gl.useProgram(snow);Object.entries(buffers).forEach(([name,b])=>{if(b.location<0)return;gl.bindBuffer(gl.ARRAY_BUFFER,b.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(particles.flatMap(p=>p[name])),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(b.location);gl.vertexAttribPointer(b.location,b.components,gl.FLOAT,false,0,0);});setCommon(uSnow);uniform1(uSnow,'currScrollTop',scrollY);uniform1(uSnow,'pixelRatio',ratio);uniform1(uSnow,'particleScale',width>500?1:.6);gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.ONE,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.POINTS,0,particles.length);gl.disable(gl.BLEND);
if(!reduced.matches)frameId=requestAnimationFrame(draw);}
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frameId);canvas.parentElement.classList.add('no-webgl');});
addEventListener('resize',()=>{resize();if(reduced.matches)draw();});addEventListener('scroll',()=>{if(reduced.matches)draw();},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frameId);else if(!lost)draw();});reduced.addEventListener('change',()=>{cancelAnimationFrame(frameId);draw();});resize();draw();
})();
