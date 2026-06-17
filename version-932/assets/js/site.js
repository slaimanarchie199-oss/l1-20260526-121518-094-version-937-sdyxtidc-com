const menuButton = document.querySelector('[data-menu-toggle]');
const mainNav = document.querySelector('[data-main-nav]');

if (menuButton && mainNav) {
    menuButton.addEventListener('click', () => {
        mainNav.classList.toggle('is-open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.heroDot || 0));
        });
    });

    if (slides.length > 1) {
        setInterval(() => showSlide(current + 1), 5200);
    }
}

const params = new URLSearchParams(window.location.search);
const queryFromUrl = params.get('q');
const searchInput = document.querySelector('[data-filter-search]');

if (queryFromUrl && searchInput) {
    searchInput.value = queryFromUrl;
}

const normalize = (value) => String(value || '').trim().toLowerCase();

const applyFilters = () => {
    const cards = Array.from(document.querySelectorAll('.filter-grid .movie-card'));
    if (!cards.length) {
        return;
    }

    const keyword = normalize(document.querySelector('[data-filter-search]')?.value);
    const category = normalize(document.querySelector('[data-filter-category]')?.value);
    const region = normalize(document.querySelector('[data-filter-region]')?.value);
    const year = normalize(document.querySelector('[data-filter-year]')?.value);
    let visible = 0;

    cards.forEach((card) => {
        const text = normalize(`${card.dataset.title} ${card.dataset.genre} ${card.dataset.region} ${card.dataset.year} ${card.dataset.category}`);
        const matchKeyword = !keyword || text.includes(keyword);
        const matchCategory = !category || normalize(card.dataset.category) === category;
        const matchRegion = !region || normalize(card.dataset.region).includes(region);
        const matchYear = !year || normalize(card.dataset.year) === year;
        const matched = matchKeyword && matchCategory && matchRegion && matchYear;
        card.style.display = matched ? '' : 'none';
        if (matched) {
            visible += 1;
        }
    });

    const empty = document.querySelector('[data-empty-state]');
    if (empty) {
        empty.style.display = visible ? 'none' : 'block';
    }
};

document.querySelectorAll('[data-filter-search], [data-filter-category], [data-filter-region], [data-filter-year]').forEach((control) => {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
});

applyFilters();
