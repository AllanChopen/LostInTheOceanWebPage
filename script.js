/* === script v3 (nav + hero canvas + video + contact form + blog reveal) === */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  const yearEl = document.getElementById('year');
  const playBtn = document.querySelector('.play-btn');
  const videoAspect = document.querySelector('.video-aspect');
  const iframe = videoAspect?.querySelector('iframe');

  /* Contact form */
  const contactForm = document.querySelector('.contact-form');
  const formMessage = contactForm?.querySelector('.form-message');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Header hide/show on scroll */
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 10) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    if (y - lastScroll > 14 && y > 140) {
      header.style.transform = 'translateY(-110%)';
    } else if (lastScroll - y > 14 || y < 140) {
      header.style.transform = 'translateY(0)';
    }
    lastScroll = y;
  }, { passive: true });

  /* Mobile nav */
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navToggle.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.classList.toggle('nav-open');
  });

  nav?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      }
    });
  });

  /* Smooth scroll for internal links */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });

  /* Video */
  playBtn?.addEventListener('click', () => {
    if (!iframe) return;
    iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0';
    videoAspect.classList.add('playing');
  });

  /* Contact Form */
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateContact()) return;
    setFormMessage('Sending...', 'pending');
    setTimeout(() => {
      setFormMessage('Message sent! We will reply soon.', 'success');
      contactForm.reset();
      clearValid();
    }, 1100);
  });

  function validateContact() {
    if (!contactForm) return false;
    let valid = true;
    const { name, email, subject, message } = contactForm;
    clearErrors();
    if (!name.value.trim()) markInvalid(name, 'Name required.'), valid = false;
    if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) markInvalid(email, 'Valid email required.'), valid = false;
    if (!subject.value.trim()) markInvalid(subject, 'Subject required.'), valid = false;
    if (!message.value.trim() || message.value.trim().length < 10)
      markInvalid(message, 'Min 10 characters.'), valid = false;
    if (!valid) setFormMessage('Please fix the highlighted fields.', 'error'); else setFormMessage('', '');
    return valid;
  }

  function markInvalid(field, msg) {
    field.classList.remove('valid');
    field.classList.add('invalid');
    let note = field.parentElement.querySelector('.field-msg');
    if (!note) {
      note = document.createElement('div');
      note.className = 'field-msg';
      note.style.cssText = 'font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:#c84552;margin-top:.2rem;';
      field.parentElement.appendChild(note);
    }
    note.textContent = msg;
  }

  function clearErrors() {
    contactForm?.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    contactForm?.querySelectorAll('.field-msg').forEach(n => n.remove());
  }
  function clearValid() { contactForm?.querySelectorAll('.valid').forEach(el => el.classList.remove('valid')); }

  ['input','textarea'].forEach(evt => {
    contactForm?.addEventListener(evt, e => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.matches('input,textarea')) {
        if (t.name === 'email') toggleValid(t, /^\S+@\S+\.\S+$/.test(t.value.trim()));
        else if (t.name === 'message') toggleValid(t, t.value.trim().length >= 10);
        else toggleValid(t, t.value.trim().length > 0);
      }
    }, true);
  });

  function toggleValid(el, state) {
    el.classList.toggle('valid', state);
    if (!state) el.classList.remove('valid');
  }

  function setFormMessage(msg, state) {
    if (!formMessage) return;
    formMessage.textContent = msg;
    formMessage.className = 'form-message ' + state;
    if (state === 'success') formMessage.style.color = 'var(--brand-accent)';
    else if (state === 'error') formMessage.style.color = '#c84552';
    else formMessage.style.color = 'var(--text-faint)';
  }

  /* Canvas + reveal */
  initHeroCanvas();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.section, .merch-item, .tour-item, .contact-card, .blog-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
});

/* Canvas background */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  let particles = [];
  let lines = [];
  let tick = 0;
  const P_COUNT = 85;
  const LINE_COUNT = 4;
  const DPR = window.devicePixelRatio || 1;

  function resize() {
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(DPR, DPR);
  }
  window.addEventListener('resize', resize);
  resize();

  function init() {
    particles.length = 0;
    lines.length = 0;
    for (let i=0;i<P_COUNT;i++) {
      particles.push({
        x: Math.random()*w,
        y: Math.random()*h,
        z: Math.random(),
        r: Math.random()*2 + .3,
        vx: (Math.random()-.5)*0.25,
        vy: (Math.random()-.5)*0.25,
        hue: 315 + Math.random()*40
      });
    }
    for (let i=0;i<LINE_COUNT;i++) {
      lines.push({
        y: (h/(LINE_COUNT+1))*(i+1),
        amp: 40 + Math.random()*80,
        speed: .4 + Math.random()*.25,
        offset: Math.random()*Math.PI*2,
        hue: 250 + i*25
      });
    }
  }
  init();

  function render() {
    tick += 0.005;
    ctx.clearRect(0,0,w,h);
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,'rgba(32,16,28,0.20)');
    g.addColorStop(1,'rgba(12,6,10,0.25)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    ctx.lineWidth = 1.2;
    lines.forEach(line => {
      ctx.beginPath();
      for (let x=0; x<=w; x+=22) {
        const y = line.y + Math.sin((x*0.004)+tick*line.speed+line.offset)*line.amp;
        if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      const grad = ctx.createLinearGradient(0,line.y-line.amp,0,line.y+line.amp);
      grad.addColorStop(0,`hsla(${line.hue},55%,62%,0)`);
      grad.addColorStop(.5,`hsla(${line.hue},55%,60%,.34)`);
      grad.addColorStop(1,`hsla(${line.hue+30},55%,62%,0)`);
      ctx.strokeStyle = grad;
      ctx.stroke();
    });

    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -50) p.x = w + 50;
      if (p.x > w + 50) p.x = -50;
      if (p.y < -50) p.y = h + 50;
      if (p.y > h + 50) p.y = -50;
      const alpha = 0.14 + (1 - p.z)*0.33;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue},50%,65%,${alpha})`;
      ctx.arc(p.x,p.y,p.r + (1-p.z)*1.5,0,Math.PI*2);
      ctx.fill();
    });

    requestAnimationFrame(render);
  }
  render();
}