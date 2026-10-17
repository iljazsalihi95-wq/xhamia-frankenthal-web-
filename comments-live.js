(function(){
  'use strict';
  const API='https://script.google.com/macros/s/AKfycbz2zl4xLog1gsO8nyEtGzCxAuL2NXW64Q50z6a10phju8RWG37NRfkFNOCPnsyurRIf/exec';
  const list=document.getElementById('commentsLive'),form=document.getElementById('commentForm'),status=document.getElementById('commentStatus');
  if(!list||!form)return;
  async function request(options){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),25000);
    try{const response=await fetch(API,{cache:'no-store',signal:controller.signal,...options});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();if(!data.ok)throw Error(data.error||'Kërkesa nuk u pranua');return data;}finally{clearTimeout(timeout);}
  }
  async function load(){
    try{const data=await request();if(!Array.isArray(data.comments))throw Error('Përgjigje e pavlefshme');const fragment=document.createDocumentFragment();for(const comment of data.comments){const article=document.createElement('article');article.className='news-card';const author=document.createElement('h3');author.textContent=comment.emri;const date=document.createElement('small');date.textContent=[comment.data,comment.ora].filter(Boolean).join(' · ');const p=document.createElement('p');p.style.whiteSpace='pre-wrap';p.textContent=comment.shqip||comment.komenti;article.append(author,date,p);fragment.append(article);}list.replaceChildren(fragment);if(!data.comments.length)list.textContent='Ende nuk ka komente të miratuara.';}catch(error){list.textContent='Komentet nuk u ngarkuan. Provo përsëri më vonë.';console.warn('Komentet:',error.message);}
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const button=form.querySelector('button[type="submit"]');button.disabled=true;status.textContent='Po dërgohet…';
    try{const fields=new FormData(form);const data=await request({method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'comment',emri:fields.get('emri'),komenti:fields.get('komenti'),website:fields.get('website')})});status.textContent=data.message||'Komenti u ruajt dhe pret miratimin e administratorit.';form.reset();}
    catch(error){status.textContent=error.name==='AbortError'?'Përgjigjja vonoi. Kontrollo para ridërgimit; një koment i njëjtë nuk ruhet dy herë.':error.message;}
    finally{button.disabled=false;}
  });
  load();
})();
