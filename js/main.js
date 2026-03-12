/**
 * js/main.js
 * Contains the logic for dynamically loading HTML components, scroll events, and the Carousel.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
});

/**
 * Dynamically loads the HTML components into their respective placeholders.
 */
async function loadComponents() {
    try {
        // Load outer structural elements
        await loadHTML('header.html', 'header-placeholder');
        await loadHTML('main.html', 'main-placeholder');
        await loadHTML('footer.html', 'footer-placeholder');

        // Load inner sections into main
        await loadHTML('hero.html', 'hero-placeholder');
        await loadHTML('news.html', 'news-placeholder');
        await loadHTML('panel.html', 'panel-placeholder');

        // Setup JS Logic
        initCarousel();
        setupLogoClick();
        setupScrollListener();
        setupMobileMenu();

        // Fix page starting at bottom: Force browser to scroll to top after all paints
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }, 50);

    } catch (error) {
        console.error('Error loading components:', error);
    }
}

/**
 * Helper function to fetch HTML and replace a placeholder ID completely using outerHTML.
 * This flattens the DOM preventing nested elements that break scroll-snapping.
 */
async function loadHTML(url, placeholderId) {
    const res = await fetch(url);
    if (!res.ok) {
        console.warn(`Failed to fetch ${url}`);
        return;
    }
    const html = await res.text();
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) {
        placeholder.outerHTML = html; 
    }
}

function setupLogoClick() {
    const logo = document.getElementById('nav-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

function setupScrollListener() {
    const header = document.getElementById('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        // If window is scrolled past 50% of the viewport height, add the solid background
        if (window.scrollY > window.innerHeight * 0.5) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    });

    // Also trigger immediately to check initial scroll position
    window.dispatchEvent(new Event('scroll'));
}

function setupMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    const links = document.querySelectorAll('.nav__link');
    const logo = document.getElementById('nav-logo');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        
        if (logo) logo.classList.toggle('nav__logo--hidden');
        
        // Prevent scrolling on body when menu is open
        if (menu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            if (logo) logo.classList.remove('nav__logo--hidden');
            document.body.style.overflow = '';
        });
    });
}

function initCarousel() {
    const track = document.getElementById('carousel-track');
    const nav = document.getElementById('carousel-nav');
    
    if (!track || !nav) return;

    const imagesData = [
        { url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1200' },
        { url: 'https://images.unsplash.com/photo-1620641653896-ee34d284fbf7?auto=format&fit=crop&q=80&w=1200' },
        { url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200' }
    ];

    buildCarouselDom(imagesData, track, nav);
    setupCarouselLogic(track, nav);
}

function buildCarouselDom(dataArray, trackElem, navElem) {
    dataArray.forEach((data, index) => {
        const li = document.createElement('li');
        li.classList.add('carousel__slide');
        if (index === 0) li.classList.add('current-slide');
        
        const img = document.createElement('img');
        img.src = data.url;
        img.alt = `Showcase Artwork ${index + 1}`;
        img.classList.add('carousel__img');
        
        li.appendChild(img);
        trackElem.appendChild(li);

        const btn = document.createElement('button');
        btn.classList.add('carousel__indicator');
        if (index === 0) btn.classList.add('current-slide');
        btn.setAttribute('aria-label', `Go to slide ${index + 1}`);
        btn.dataset.slideIndex = index;
        
        navElem.appendChild(btn);
    });
}

function setupCarouselLogic(track, nav) {
    const slides = Array.from(track.children);
    const dots = Array.from(nav.children);
    
    const nextButton = document.querySelector('.carousel__btn--next');
    const prevButton = document.querySelector('.carousel__btn--prev');

    let currentIndex = 0;

    const updateSlidePosition = () => {
        if (!slides.length) return;
        const slideWidth = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    };

    const updateClasses = () => {
        slides.forEach(slide => slide.classList.remove('current-slide'));
        dots.forEach(dot => dot.classList.remove('current-slide'));
        
        slides[currentIndex].classList.add('current-slide');
        dots[currentIndex].classList.add('current-slide');
    };

    const moveToSlide = (index) => {
        if (index < 0) {
            currentIndex = slides.length - 1; 
        } else if (index >= slides.length) {
            currentIndex = 0; 
        } else {
            currentIndex = index;
        }
        updateSlidePosition();
        updateClasses();
    };

    nextButton.addEventListener('click', () => moveToSlide(currentIndex + 1));
    prevButton.addEventListener('click', () => moveToSlide(currentIndex - 1));

    nav.addEventListener('click', e => {
        const targetDot = e.target.closest('.carousel__indicator');
        if (!targetDot) return;
        const targetIndex = parseInt(targetDot.dataset.slideIndex, 10);
        moveToSlide(targetIndex);
    });

    window.addEventListener('resize', () => {
        track.style.transition = 'none';
        updateSlidePosition();
        setTimeout(() => {
            track.style.transition = ''; 
        }, 50);
    });

    setInterval(() => {
        moveToSlide(currentIndex + 1);
    }, 6000); 
}
