// Smooth mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
	navToggle.addEventListener('click', () => {
		const open = navLinks.classList.toggle('open');
		navToggle.setAttribute('aria-expanded', String(open));
	});
}

// Close nav when clicking a link (mobile)
navLinks?.addEventListener('click', (e) => {
	const target = e.target;
	if (target instanceof HTMLElement && target.tagName === 'A' && navLinks.classList.contains('open')) {
		navLinks.classList.remove('open');
		navToggle?.setAttribute('aria-expanded', 'false');
	}
});

// Sticky header shadow on scroll
const siteHeader = document.querySelector('.site-header');
const toggleHeaderShadow = () => {
	if (!siteHeader) return;
	const scrolled = window.scrollY > 6;
	siteHeader.style.boxShadow = scrolled ? '0 6px 30px rgba(0,0,0,0.25)' : 'none';
};
window.addEventListener('scroll', toggleHeaderShadow);
toggleHeaderShadow();

// IntersectionObserver for fade-in/slide-up animations
const observer = new IntersectionObserver((entries) => {
	for (const entry of entries) {
		if (entry.isIntersecting) {
			entry.target.classList.add('show');
			observer.unobserve(entry.target);
		}
	}
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.aos, .section .container > *').forEach((el) => observer.observe(el));

document.getElementById('year').textContent = new Date().getFullYear().toString();

// Smooth scroll for internal links with offset
const OFFSET = 70;
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener('click', function (e) {
		const href = (this instanceof HTMLAnchorElement) ? this.getAttribute('href') : null;
		if (!href || href === '#' || href.length < 2) return;
		e.preventDefault();
		const id = href.substring(1);
		const el = document.getElementById(id);
		if (!el) return;
		const y = el.getBoundingClientRect().top + window.pageYOffset - OFFSET;
		window.scrollTo({ top: y, behavior: 'smooth' });
	});
});

// Lazy load images with data-src (projects + designs)
const lazyImgs = document.querySelectorAll('img[data-src]');
const imgObserver = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (!entry.isIntersecting) return;
		const img = entry.target;
		const src = img.getAttribute('data-src');
		if (src && src.length > 4) {
			img.src = src;
			img.removeAttribute('data-src');
		}
		imgObserver.unobserve(img);
	});
}, { rootMargin: '100px' });
lazyImgs.forEach((img) => imgObserver.observe(img));

// Project card click behavior: open App Store or go to detail page
document.querySelectorAll('.project-card').forEach((card) => {
	card.addEventListener('click', (e) => {
		const isButton = (e.target instanceof HTMLElement) && e.target.closest('.btn');
		if (isButton) return; // buttons handle their own links
		const app = card.getAttribute('data-app');
		if (app) {
			window.open(app, '_blank');
			return;
		}
		// fallback to detail page
		const title = card.querySelector('.project-title')?.textContent?.trim() || 'Project';
		const desc = card.querySelector('.project-desc')?.textContent?.trim() || '';
		const img = card.querySelector('.project-media img');
		const image = img?.getAttribute('data-src') || img?.getAttribute('src') || '';
		const tags = Array.from(card.querySelectorAll('.project-tags span')).map(s=>s.textContent.trim()).join(',');
		const demo = card.querySelector('.project-links a.btn.small.ghost')?.getAttribute('href') || 'https://github.com/naeemAkee';
		const params = new URLSearchParams({ title, desc, image, tags, app: app || '', demo });
		window.location.href = `project.html?${params.toString()}`;
	});
});

// Basic carousel for designs (swipe + arrows + dots)
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-track]');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('[data-prev]');
    const nextBtn = carousel.querySelector('[data-next]');
    const dotsWrap = carousel.querySelector('[data-dots]');
    if (!track || slides.length === 0 || !dotsWrap) return;

    let index = 0;
    const to = (i) => {
        index = (i + slides.length) % slides.length;
        const x = -index * carousel.clientWidth;
        track.style.transform = `translateX(${x}px)`;
        dotsWrap.querySelectorAll('button').forEach((b, bi) => b.classList.toggle('active', bi === index));
    };

    // dots
    slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.addEventListener('click', () => to(i));
        dotsWrap.appendChild(b);
    });
    to(0);

    prevBtn?.addEventListener('click', () => to(index - 1));
    nextBtn?.addEventListener('click', () => to(index + 1));

    // resize
    window.addEventListener('resize', () => to(index));

    // drag/swipe
    let startX = 0; let currentX = 0; let dragging = false; let startTime = 0;
    const start = (x) => { dragging = true; startX = x; currentX = x; startTime = Date.now(); track.style.transition = 'none'; };
    const move = (x) => { if (!dragging) return; currentX = x; const dx = currentX - startX; track.style.transform = `translateX(${-index * carousel.clientWidth + dx}px)`; };
    const end = () => {
        if (!dragging) return; dragging = false; track.style.transition = '';
        const dx = currentX - startX; const dt = Date.now() - startTime;
        const threshold = Math.min(120, carousel.clientWidth * 0.25);
        if (dx > threshold || (dx > 40 && dt < 250)) to(index - 1);
        else if (dx < -threshold || (dx < -40 && dt < 250)) to(index + 1);
        else to(index);
    };
    // mouse
    track.addEventListener('mousedown', (e) => start(e.clientX));
    window.addEventListener('mousemove', (e) => move(e.clientX));
    window.addEventListener('mouseup', end);
    // touch
    track.addEventListener('touchstart', (e) => start(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', (e) => move(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchend', end);
});

// Toast helper
const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    // force reflow then show
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Contact form: direct submit via FormSubmit (no email client)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
	contactForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const form = e.currentTarget;
		const name = form.querySelector('input[name="name"]').value.trim();
		const email = form.querySelector('input[name="email"]').value.trim();
		const message = form.querySelector('textarea[name="message"]').value.trim();
		if (!name || !email || !message) {
			showToast('Please fill in all fields.', 'error');
			return;
		}
		const payload = {
			name,
			email,
			message,
			_replyto: email,
			_subject: `Portfolio contact from ${name}`,
			_captcha: 'false'
		};
		const endpoint = 'https://formsubmit.co/ajax/naeem.akee@gmail.com';
		fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
			body: JSON.stringify(payload)
		}).then(async (res) => {
			if (!res.ok) throw new Error('Failed');
			showToast('Message sent successfully!');
			form.reset();
		}).catch(() => {
			showToast('Failed to send. Please try again later.', 'error');
		});
	});
}

// Scrollspy to highlight active nav link
const sectionIds = ['about','skills','experience','designs','projects','education','contact'];
const idToNavLink = new Map(sectionIds.map((id) => [id, document.querySelector(`.nav-links a[href="#${id}"]`)]));
const spyObserver = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		const id = entry.target.id;
		const link = idToNavLink.get(id);
		if (!link) return;
		if (entry.isIntersecting) {
			// clear others
			idToNavLink.forEach((l) => l?.classList.remove('active'));
			link.classList.add('active');
		}
	});
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 });

sectionIds.forEach((id) => {
	const el = document.getElementById(id);
	if (el) spyObserver.observe(el);
});
