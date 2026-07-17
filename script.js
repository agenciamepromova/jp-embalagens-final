const menu=document.querySelector('.menu');
const nav=document.querySelector('.nav');
menu?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')});
},{threshold:.12});
document.querySelectorAll('.reveal,.product-card,.benefits div,.steps div,.masonry img').forEach(el=>{
  el.classList.add('reveal');obs.observe(el);
});

// Lightbox do portfólio: clique/toque abre, setas navegam e swipe funciona no celular.
const items=[...document.querySelectorAll('.portfolio-grid figure')];
const lightbox=document.querySelector('#portfolio-lightbox');
const lightboxImg=lightbox?.querySelector('img');
const lightboxCaption=lightbox?.querySelector('figcaption');
const closeBtn=lightbox?.querySelector('.lightbox-close');
const prevBtn=lightbox?.querySelector('.lightbox-prev');
const nextBtn=lightbox?.querySelector('.lightbox-next');
let currentIndex=0;
let touchStartX=0;

function showItem(index){
  if(!items.length||!lightbox||!lightboxImg||!lightboxCaption)return;
  currentIndex=(index+items.length)%items.length;
  const img=items[currentIndex].querySelector('img');
  const caption=items[currentIndex].querySelector('figcaption');
  lightboxImg.src=img?.src||'';
  lightboxImg.alt=img?.alt||'';
  lightboxCaption.textContent=caption?.textContent||'';
}
function openLightbox(index){
  showItem(index);
  lightbox?.classList.add('open');
  lightbox?.setAttribute('aria-hidden','false');
  document.body.classList.add('lightbox-open');
  closeBtn?.focus();
}
function closeLightbox(){
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden','true');
  document.body.classList.remove('lightbox-open');
  items[currentIndex]?.focus();
}
items.forEach((item,index)=>{
  item.tabIndex=0;
  item.setAttribute('role','button');
  item.setAttribute('aria-label',`Ampliar: ${item.querySelector('figcaption')?.textContent||'imagem do portfólio'}`);
  item.addEventListener('click',()=>openLightbox(index));
  item.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLightbox(index)}});
});
closeBtn?.addEventListener('click',closeLightbox);
prevBtn?.addEventListener('click',()=>showItem(currentIndex-1));
nextBtn?.addEventListener('click',()=>showItem(currentIndex+1));
lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
lightbox?.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX},{passive:true});
lightbox?.addEventListener('touchend',e=>{
  const delta=e.changedTouches[0].clientX-touchStartX;
  if(Math.abs(delta)>55)showItem(currentIndex+(delta<0?1:-1));
},{passive:true});
document.addEventListener('keydown',e=>{
  if(!lightbox?.classList.contains('open'))return;
  if(e.key==='Escape')closeLightbox();
  if(e.key==='ArrowLeft')showItem(currentIndex-1);
  if(e.key==='ArrowRight')showItem(currentIndex+1);
});

// Eventos padronizados enviados ao dataLayer para GA4, Google Ads e Meta Ads via GTM.
window.dataLayer = window.dataLayer || [];
function trackEvent(eventName, parameters = {}) {
  window.dataLayer.push({ event: eventName, ...parameters });
}

// Cliques em canais de contato.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href') || '';
  const label = (link.textContent || link.getAttribute('aria-label') || '').trim();

  if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(href)) {
    trackEvent('click_whatsapp', {
      link_url: link.href,
      link_text: label,
      page_location: window.location.href
    });
  } else if (href.startsWith('tel:')) {
    trackEvent('click_phone', {
      link_url: link.href,
      link_text: label,
      page_location: window.location.href
    });
  } else if (href.startsWith('mailto:')) {
    trackEvent('click_email', {
      link_url: link.href,
      link_text: label,
      page_location: window.location.href
    });
  }
});

// Envio de formulários presentes ou adicionados futuramente ao site.
document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  trackEvent('generate_lead', {
    form_id: form.id || '',
    form_name: form.getAttribute('name') || '',
    page_location: window.location.href
  });
});

// Engajamento de 60 segundos (evento secundário, não deve ser usado como lead principal).
setTimeout(() => {
  trackEvent('engaged_60_seconds', { page_location: window.location.href });
}, 60000);

// Scroll de 90%, disparado uma única vez.
let scroll90Sent = false;
window.addEventListener('scroll', () => {
  if (scroll90Sent) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable > 0 && window.scrollY / scrollable >= 0.9) {
    scroll90Sent = true;
    trackEvent('scroll_90', { page_location: window.location.href });
  }
}, { passive: true });
