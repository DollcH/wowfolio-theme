document.addEventListener('DOMContentLoaded', () => {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const q = (sel, root = document) => root.querySelector(sel);

 
  const boom = (x, y) => {
    const d = document.createElement('div');
    Object.assign(d.style, {
      position: 'fixed', left: x + 'px', top: y + 'px',
      width: '22vmax', height: '22vmax',
      transform: 'translate(-50%,-50%) scale(0)', borderRadius: '9999px',
      pointerEvents: 'none', zIndex: 9999, mixBlendMode: 'screen',
      background: 'radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(255,210,0,.65) 35%, rgba(255,0,128,.25) 60%, rgba(255,255,255,0) 70%)',
      boxShadow: '0 0 80px rgba(255,150,0,.35), 0 0 160px rgba(255,0,128,.25)'
    });
    document.body.appendChild(d);
    d.animate(
      [
        { transform:'translate(-50%,-50%) scale(0)',   opacity:.95 },
        { transform:'translate(-50%,-50%) scale(1)',   opacity:.65, offset:.6 },
        { transform:'translate(-50%,-50%) scale(1.45)',opacity:0 }
      ],
      { duration:900, easing:'cubic-bezier(.2,.7,.2,1)' }
    );
    setTimeout(() => d.remove(), 950);
  };

  
  const onloads = Array.from(document.querySelectorAll('.reveal-onload'));
  const showSeq = () => {
    onloads.forEach((el, i) => {
      el.classList.remove('is-visible');   
      void el.offsetWidth;                 
      setTimeout(() => {
       
        requestAnimationFrame(() =>
          requestAnimationFrame(() => el.classList.add('is-visible'))
        );
      }, i === 0 ? 1000 : 2000);           
    });
  };
  showSeq();

 
  const headline = q('.headline'); const subhead = q('.subhead');
  if (headline) headline.style.color = '#121723';
  if (subhead)  subhead.style.color  = '#121723';

  
  const h2   = q('.section-dark .reveal-on-scroll.from-left');
  const lead = q('.section-dark .lead');
  if (!h2) return;

  let revealed = false;

  const triggerReveal = () => {
    if (revealed) return;
    revealed = true;

    
    h2.classList.remove('is-visible');
    void h2.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      h2.classList.add('is-visible'); 
      setTimeout(() => {
        const r = h2.getBoundingClientRect();
        boom(r.left + r.width / 2, r.top + r.height / 2);
        lead?.classList.add('boom-in'); 
      }, 1000);
    }));

    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener('scroll', onInteract);
    window.removeEventListener('touchstart', onInteract);
    window.removeEventListener('touchmove', onInteract);
    window.removeEventListener('resize', onInteract);
    window.removeEventListener('orientationchange', onInteract);
  };

  const visibleRatio = (el) => {
    const rect = el.getBoundingClientRect();
    const vh   = window.innerHeight || document.documentElement.clientHeight;
    const visiblePx = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
    return rect.height > 0 ? Math.min(1, visiblePx / rect.height) : 0;
  };

  const onInteract = () => {
    if (revealed) return;
    const ratio = visibleRatio(h2);
    if (isMobile && ratio > 0) {                 
      triggerReveal(); return;
    }
    if (!isMobile && ratio >= 0.4) {             
      triggerReveal();
    }
  };

  
  const hasIO = 'IntersectionObserver' in window;
  if (hasIO) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (revealed || !entry.isIntersecting) return;

        if (!isMobile && entry.intersectionRatio >= 0.4) {
          triggerReveal();
          io.unobserve(h2);
        } else if (isMobile && entry.intersectionRatio > 0.001) {
          
          const once = () => { triggerReveal(); window.removeEventListener('scroll', once); window.removeEventListener('touchstart', once); };
          window.addEventListener('scroll', once, { passive:true });
          window.addEventListener('touchstart', once, { passive:true });
          
          setTimeout(() => { if (!revealed) triggerReveal(); }, 3000);
          io.unobserve(h2);
        }
      });
    }, { threshold: [0.001, 0.1, 0.4, 1], rootMargin: '0px' });
    io.observe(h2);
  } else {
    window.addEventListener('scroll', onInteract, { passive:true });
  }

  
  window.addEventListener('scroll', onInteract, { passive:true });
  window.addEventListener('touchstart', onInteract, { passive:true });
  window.addEventListener('touchmove', onInteract, { passive:true });
  window.addEventListener('resize', onInteract);
  window.addEventListener('orientationchange', onInteract);

  
  if (isMobile && visibleRatio(h2) > 0) {
    setTimeout(() => { if (!revealed) triggerReveal(); }, 3000);
  }

  
  const hint = q('.scroll-hint'); const next = q('#next');
  if (hint && next) {
    hint.style.cursor = 'pointer';
    hint.addEventListener('click', () => next.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  
  const reviewCard  = q('.t-card');
  const reviewText  = q('.t-text[data-typewriter]');
  const reviewLinks = q('.t-links');

  
  const typewriter = (el, totalMs = 8000) => {
    if (!el) return;
    const full = el.textContent.replace(/\s+\n/g, '\n').replace(/\n{2,}/g, '\n\n');
    el.textContent = '';

    const len = full.length || 1;
    const fps = 60;
    const steps = Math.max(Math.round((totalMs / 1000) * fps), len); 
    let i = 0;

    const tick = () => {
      const chunk = Math.ceil((len / steps) || 1);
      el.textContent += full.slice(i, i + chunk);
      i += chunk;
      if (i < len) {
        setTimeout(tick, totalMs / steps);
      } else {
        el.textContent = full;
        reviewLinks?.classList.add('links-visible'); 
      }
    };

    setTimeout(tick, 250); 
  };

  if (reviewCard) {
    const ioRev = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;

        reviewCard.classList.add('is-visible');

        if (reviewText && !reviewText.dataset._typed) {
          reviewText.dataset._typed = '1';
          typewriter(reviewText, 8000);
        }
        ioRev.unobserve(reviewCard);
      });
    }, { threshold: 0.3 });
    ioRev.observe(reviewCard);
  }
});
