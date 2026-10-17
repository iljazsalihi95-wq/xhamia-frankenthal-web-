(function(root){
  'use strict';
  const API='https://script.google.com/macros/s/AKfycbw9M1i3sBBrIvlFoVfjRPQ9fjFgF425MXayYkDxd9GDb2Nt9k-Nc_uG24RUYsKIBfWn/exec';
  function dateKey(now=new Date()){
    const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
    return p.day+'.'+p.month+'.'+p.year;
  }
  function selectDay(payload,date){
    if(payload.success!==true||!Array.isArray(payload.items))throw Error('Përgjigje e pavlefshme');
    const rows=payload.items.filter(r=>r.data===date&&String(r.aktiv).toUpperCase()==='TRUE');
    if(rows.length!==1)throw Error('Nuk ka një material unik për '+date);
    const r=rows[0];
    if(!r.ajeti_arabisht||!r.ajeti_sq||!r.sure_ajet)throw Error('Ajeti nuk është plotësuar');
    return r;
  }
  function cards(r){
    const ayah=String(r.shenim||'').match(/Transliterimi i ajetit:\s*([\s\S]*?)(?=\s*Gjermanisht|$)/i);
    const hadith=String(r.burimi_hadithit||'').match(/Transliterim:\s*([\s\S]*)/i);
    return [
      ['Ajeti i Ditës',r.ajeti_arabisht,ayah?.[1],r.ajeti_sq,r.sure_ajet],
      ['Hadithi i Ditës',r.hadithi_ar,hadith?.[1],r.hadithi_sq,String(r.burimi_hadithit||'').split(/Transliterim:/i)[0]],
      ['Thënia e Ditës','','',r.thenia_e_dites,r.autori_burimi],
      ['Këshilla e Ditës','','',r.keshilla_e_dites,''],
      ['Lutja e Ditës',r.duaja_ar,r.transliterimi,r.duaja_sq,''],
      ['Kurioziteti','','',r.kuriozitet_islam,''],
      ['Ngjarja Historike','','',r.ngjarje_islame,'']
    ];
  }
  root.XhamiaDrita={dateKey,selectDay,cards};
  if(typeof document==='undefined')return;
  const box=document.getElementById('dritaLive');if(!box)return;
  let displayed='',loading=false;
  async function refresh(){
    const date=dateKey();
    if(loading)return;
    if(displayed!==date){box.replaceChildren();box.textContent='Po ngarkohet Drita e Ditës për '+date+'…';}
    loading=true;
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch(API+'?_='+Date.now(),{cache:'no-store',signal:controller.signal});
      if(!response.ok)throw Error('HTTP '+response.status);
      const row=selectDay(await response.json(),date);
      if(dateKey()!==date)return;
      const fragment=document.createDocumentFragment();
      for(const [title,arabic,transcription,text,source] of cards(row)){
        const card=document.createElement('article');card.className='news-card drita-card';
        const h=document.createElement('h3');h.textContent=title;card.append(h);
        for(const [value,cls] of [[arabic,'drita-arabic'],[transcription,'drita-transcription'],[text,'drita-text'],[source,'drita-source']]){
          if(!value)continue;const p=document.createElement('p');p.className=cls;p.textContent=value;
          if(cls==='drita-arabic'){p.lang='ar';p.dir='rtl';}card.append(p);
        }
        if(!text){const p=document.createElement('p');p.textContent='Përmbajtja nuk është plotësuar në burimin e sotëm.';card.append(p);}
        fragment.append(card);
      }
      box.replaceChildren(fragment);displayed=date;
      document.getElementById('dritaDate').textContent=date+' · LIVE';
    }catch(error){
      if(displayed!==date){box.textContent='Drita e Ditës për '+date+' nuk u ngarkua. Sistemi do të provojë përsëri.';}
      console.warn('Drita e Ditës:',error.message);
    }finally{clearTimeout(timeout);loading=false;}
  }
  refresh();
  setInterval(()=>{if(displayed!==dateKey())refresh();},15000);
  setInterval(refresh,300000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})(typeof window==='undefined'?globalThis:window);
