const $ = id => document.getElementById(id);
const mv = $('faro');
const words = {
 fr:{title:'Visite interactive 3D du phare',language:'Langue',invitation:'Un monument, huit histoires',start:'Explorer le phare en 3D',onDemand:'Le modèle se charge uniquement à votre demande.',loading:'Chargement du modèle 3D…',model:'RECONSTITUTION 3D',reset:'Réinitialiser la vue',hide:'Masquer les points',show:'Afficher les points',fullscreen:'Plein écran',exit:'Quitter le plein écran',gesture:'Faites glisser pour tourner · Pincez pour zoomer',discover:'DÉCOUVRIR LE PHARE',source:'Lire l’article historique ↗',disclaimer:'Reconstitution interprétative : volumes estimés, sans valeur de relevé architectural. Les hauteurs historiques peuvent différer du modèle.',download:'Télécharger le modèle GLB',editorial:'Repère éditorial : cet emplacement sert à ouvrir la notice.',counter:'8 repères',noGL:'La 3D n’est pas disponible sur ce navigateur. L’image et les notices restent accessibles.',error:'Le modèle n’a pas pu être chargé. Vérifiez la connexion, puis réessayez.',retry:'Réessayer',loaded:'Modèle chargé. Faites glisser pour tourner.',fullError:'Le plein écran n’est pas disponible ici. Utilisez le lien « Ouvrir la visite » sous le bloc du blog.'},
 es:{title:'Visita interactiva 3D del faro',language:'Idioma',invitation:'Un monumento, ocho historias',start:'Explorar el faro en 3D',onDemand:'El modelo solo se carga cuando lo solicita.',loading:'Cargando el modelo 3D…',model:'RECONSTRUCCIÓN 3D',reset:'Restablecer la vista',hide:'Ocultar los puntos',show:'Mostrar los puntos',fullscreen:'Pantalla completa',exit:'Salir de pantalla completa',gesture:'Arrastre para girar · Pellizque para ampliar',discover:'DESCUBRIR EL FARO',source:'Leer el artículo histórico ↗',disclaimer:'Reconstrucción interpretativa: volúmenes estimados, sin valor de levantamiento arquitectónico. Las alturas históricas pueden diferir del modelo.',download:'Descargar el modelo GLB',editorial:'Referencia editorial: esta posición permite abrir la nota.',counter:'8 puntos',noGL:'La vista 3D no está disponible en este navegador. La imagen y las notas siguen accesibles.',error:'No se ha podido cargar el modelo. Compruebe la conexión e inténtelo de nuevo.',retry:'Reintentar',loaded:'Modelo cargado. Arrastre para girar.',fullError:'La pantalla completa no está disponible aquí. Abra la visita desde el enlace bajo el bloque del blog.'},
 ar:{title:'زيارة تفاعلية ثلاثية الأبعاد للمنارة',language:'اللغة',invitation:'معلم واحد وثماني حكايات',start:'استكشف المنارة ثلاثية الأبعاد',onDemand:'يُحمّل النموذج عند الطلب فقط.',loading:'تحميل النموذج ثلاثي الأبعاد…',model:'إعادة بناء ثلاثية الأبعاد',reset:'إعادة ضبط العرض',hide:'إخفاء النقاط',show:'إظهار النقاط',fullscreen:'ملء الشاشة',exit:'مغادرة ملء الشاشة',gesture:'اسحب للتدوير · باعد بين إصبعين للتكبير',discover:'اكتشف المنارة',source:'قراءة المقال التاريخي ↗',disclaimer:'إعادة بناء تفسيرية بأحجام تقديرية، وليست رفعاً معمارياً. قد تختلف الارتفاعات التاريخية عن النموذج.',download:'تنزيل نموذج GLB',editorial:'نقطة تحريرية: هذا الموضع يفتح البطاقة التعريفية.',counter:'٨ نقاط',noGL:'العرض ثلاثي الأبعاد غير متاح في هذا المتصفح. تبقى الصورة والبطاقات متاحة.',error:'تعذر تحميل النموذج. تحقق من الاتصال ثم أعد المحاولة.',retry:'أعد المحاولة',loaded:'تم تحميل النموذج. اسحب للتدوير.',fullError:'ملء الشاشة غير متاح هنا. افتح الزيارة من الرابط أسفل قسم المدونة.'}
};
let language = new URLSearchParams(location.search).get('lang') || 'fr';
if (!words[language]) language='fr';
let items=[], selected='tour', loaded=false, showing=true, loading=false, state='onDemand', timer, attempt=0;
const t=key=>words[language][key] || words.fr[key] || key;
const local=(item,key)=>item[key][language] || item[key].fr;
const vec = a=>a.map(n=>`${n}m`).join(' ');
function translate(){
 document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';$('language').value=language;
 document.querySelectorAll('[data-i18n]').forEach(n=>n.textContent=t(n.dataset.i18n));
 $('counter').textContent=t('counter');$('status').textContent=t(state);$('toggle').textContent=t(showing?'hide':'show');
 if(state==='error')$('start').textContent=t('retry');
 items.forEach(item=>{const b=$('list-'+item.id);if(b)b.querySelector('strong').textContent=local(item,'title');const h=$('hotspot-'+item.id);if(h)h.setAttribute('aria-label',local(item,'title'));});
 displayInfo();
}
function displayInfo(){
 const item=items.find(x=>x.id===selected);if(!item)return;
 $('info-title').textContent=local(item,'title');$('info-text').textContent=local(item,'text');$('info-number').textContent=String(items.indexOf(item)+1).padStart(2,'0')+' / 08';$('info-note').textContent=item.editorial?t('editorial'):'';
 for(const x of items){$('list-'+x.id)?.setAttribute('aria-current',String(x.id===selected));$('hotspot-'+x.id)?.classList.toggle('selected',x.id===selected);}
}
function choose(id,move=true){selected=id;displayInfo();if(loaded&&move){const i=items.find(x=>x.id===id);mv.cameraTarget=vec(i.target);mv.cameraOrbit=i.orbit;if(matchMedia('(prefers-reduced-motion: reduce)').matches)mv.jumpCameraToGoal();}declutter();}
function declutter(){
 if(!loaded)return;const used=[];
 for(const item of [...items].sort((a,b)=>(b.id===selected)-(a.id===selected))){
  const h=$('hotspot-'+item.id);h.dataset.crowded='false';h.tabIndex=-1;
  const spot=mv.queryHotspot('hotspot-'+item.id);if(!spot||!h.hasAttribute('data-visible'))continue;
  const p=spot.canvasPosition;const crowded=used.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<45);
  h.dataset.crowded=String(crowded);if(!crowded){used.push(p);h.tabIndex=0;}
 }
}
async function setup(){
 const response=await fetch('./hotspots.json');if(!response.ok)throw new Error('Notices HTTP '+response.status);
 items=(await response.json()).items;
 for(const [index,item] of items.entries()){
  const b=document.createElement('button');b.type='button';b.id='list-'+item.id;
  const num=document.createElement('span');num.textContent=String(index+1).padStart(2,'0');const label=document.createElement('strong');label.style.fontWeight='inherit';b.append(num,label);b.addEventListener('click',()=>choose(item.id));$('poi-list').append(b);
  const h=document.createElement('button');h.type='button';h.tabIndex=-1;h.id='hotspot-'+item.id;h.slot='hotspot-'+item.id;h.className='hotspot';h.dataset.position=vec(item.position);h.dataset.normal=item.normal.join(' ');h.dataset.visibilityAttribute='visible';h.textContent=index+1;h.addEventListener('click',()=>choose(item.id));mv.append(h);
 }
 translate();
}
function fallback(key){clearTimeout(timer);loading=false;loaded=false;state=key;$('poster').hidden=false;$('status').textContent=t(key);$('progress').hidden=true;$('reset').disabled=true;$('toggle').disabled=true;$('start').disabled=false;$('start').textContent=t('retry');if(key==='noGL')$('start').hidden=true;}
function hasWebGL(){try{const c=document.createElement('canvas'),gl=c.getContext('webgl2');if(!gl)return false;gl.getExtension('WEBGL_lose_context')?.loseContext();return true;}catch{return false;}}
async function start(){
 if(loading||loaded)return;
 if(!hasWebGL()){fallback('noGL');return;}
 loading=true;state='loading';$('status').textContent=t(state);$('start').disabled=true;$('progress').value=0;$('progress').hidden=false;
 timer=setTimeout(()=>fallback('error'),90000);
 try{await import('./vendor/model-viewer-4.1.0.min.js');await customElements.whenDefined('model-viewer');if(mv.getAttribute('src')){mv.removeAttribute('src');await new Promise(r=>setTimeout(r,0));}attempt++;mv.src='./assets/punta-nador.glb'+(attempt>1?'?retry='+attempt:'');if(mv.loaded)onLoad();}catch(e){console.error(e);fallback('error');}
}
function onLoad(){clearTimeout(timer);loaded=true;loading=false;state='loaded';$('poster').hidden=true;$('reset').disabled=false;$('toggle').disabled=false;mv.setAttribute('aria-label',t('loaded'));declutter();}
mv.addEventListener('load',onLoad);mv.addEventListener('error',()=>fallback('error'));mv.addEventListener('progress',e=>{$('progress').value=e.detail.totalProgress;});
mv.addEventListener('camera-change',()=>requestAnimationFrame(declutter));new ResizeObserver(()=>requestAnimationFrame(declutter)).observe($('stage'));
$('start').addEventListener('click',start);
$('reset').addEventListener('click',()=>{selected='tour';displayInfo();mv.cameraTarget='0m 16m 0m';mv.cameraOrbit='32deg 80deg 68m';mv.fieldOfView='36deg';if(matchMedia('(prefers-reduced-motion: reduce)').matches)mv.jumpCameraToGoal();});
$('toggle').addEventListener('click',()=>{showing=!showing;mv.classList.toggle('points-hidden',!showing);$('toggle').textContent=t(showing?'hide':'show');$('toggle').setAttribute('aria-pressed',String(showing));});
$('language').addEventListener('change',e=>{language=e.target.value;translate();});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('visit').requestFullscreen();}catch{$('info-note').textContent=t('fullError');}});
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=t(document.fullscreenElement?'exit':'fullscreen');});
if(new URLSearchParams(location.search).get('edit')==='1'){
 $('editor').hidden=false;
 mv.addEventListener('dblclick',e=>{if(!loaded)return;const hit=mv.positionAndNormalFromPoint(e.clientX,e.clientY);if(!hit)return;const arr=v=>[v.x,v.y,v.z].map(n=>+n.toFixed(4));$('coordinates').textContent=JSON.stringify({position:arr(hit.position),normal:arr(hit.normal)},null,2);});
 $('copy-coordinates').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('coordinates').textContent);}catch{$('coordinates').focus();}});
}
translate();setup().catch(e=>{console.error(e);$('info-text').textContent='Les notices sont temporairement indisponibles. Consultez l’article historique.';});
