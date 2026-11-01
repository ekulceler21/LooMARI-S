'use strict';
const content=window.DEEP_SEA_CONTENT;
if(content.animals.length!==127||content.texts.length!==65||window.DEEP_SEA_ENGLISH.length!==65)throw Error('Incomplete ocean content');
const journey=document.querySelector('#journey');const depthLine=document.querySelector('.depth-line');
const grids=[999,999,999,642].map((rows,index)=>{const ocean=document.createElement('div');ocean.className='ocean';ocean.style.gridTemplateRows=`repeat(${rows},50px)`;journey.insertBefore(ocean,depthLine);return ocean;});
const labels=[];const textNodes=[];
content.animals.forEach(a=>{const wrapper=document.createElement('div');wrapper.className='animal-wrapper';wrapper.style.cssText=a.style;wrapper.dataset.image=a.image;const inner=document.createElement('div');inner.className='animal-inner';const img=document.createElement('img');img.className='animal-img';img.src=`assets/${a.image}`;img.decoding='async';const label=document.createElement('div');label.className='animal-name';inner.append(img,document.createTextNode(' '),label);wrapper.append(inner);grids[a.ocean].append(wrapper);labels.push({a,label,img});});
content.texts.forEach((b,index)=>{const wrapper=document.createElement('div');wrapper.className='blurb';wrapper.style.cssText=b.style;wrapper.dataset.textIndex=index;const span=document.createElement('span');const text=document.createElement(b.heading?'div':'span');if(b.heading)text.className='zone-title';span.append(text);wrapper.append(span);grids[b.ocean].append(wrapper);textNodes.push({text,b,index});});
const trieste=document.createElement('img');trieste.className='trieste';trieste.src='assets/trieste.png';trieste.alt='Trieste';grids[3].append(trieste);
const ui={en:{title:'LooMARI\'S',credit:'A journey beyond the surface.',eyebrow:'AN EXPLORATION IN DEPTH',descend:'Scroll to descend',end:'THE END OF THE DESCENT',inspired:'site Neal.fun by Neal Agarwal’dan esinlenilmiştir.',return:'Return to the surface'},tr:{title:'LooMARI\'S',credit:'Yüzeyin ötesine bir yolculuk.',eyebrow:'DERİNLİKLERE BİR KEŞİF',descend:'İnmek için kaydır',end:'DALIŞIN SONU',inspired:'siteNeal.fun by Neal Agarwal’dan esinlenilmiştir.',return:'Yüzeye dön'}};
let language='en';try{const saved=localStorage.getItem('deep-sea-language');if(saved==='tr'||saved==='en')language=saved;}catch{}
function updateDepth(){const depth=Math.round(Math.max(0,Math.min(10924,scrollY/50*3-12)));depthLine.textContent=language==='tr'?`${depth} METRE DERİNLİK`:`${depth} METERS DEEP`;depthLine.style.opacity=depth>0?'1':'0';}
const toggleBtn=document.querySelector('#language-toggle-btn');
if(toggleBtn){
  toggleBtn.addEventListener('click',()=>{
    const nextLang=language==='tr'?'en':'tr';
    setLanguage(nextLang,true);
  });
}
function setLanguage(lang,persist=false){
  language=lang;
  document.documentElement.lang=lang;
  document.title=ui[lang].title;
  document.querySelectorAll('[data-ui]').forEach(e=>e.textContent=ui[lang][e.dataset.ui]);
  labels.forEach(({a,label,img})=>{const name=lang==='tr'?a.name:a.english;label.textContent=name;label.classList.toggle('animal-name-long',name.length>20);img.alt=name;});
  textNodes.forEach(({text,b,index})=>text.textContent=lang==='tr'?b.text:window.DEEP_SEA_ENGLISH[index]);
  document.querySelector('.ocean-bottom-top').alt=lang==='tr'?'Okyanus tabanı':'The ocean bottom';
  trieste.alt=lang==='tr'?'Trieste batiskafı':'Submarine Trieste';
  if(toggleBtn){
    toggleBtn.querySelector('#language-toggle-text').textContent=lang==='tr'?'Türkçe':'English';
  }
  if(persist){try{localStorage.setItem('deep-sea-language',lang);}catch{}}
  updateDepth();
}
addEventListener('scroll',updateDepth,{passive:true});
addEventListener('resize',updateDepth);
setLanguage(language);
