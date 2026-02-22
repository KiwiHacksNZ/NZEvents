// ============================================
// NZ Events — No frameworks. No nonsense.
// ============================================

// ---- Event Data (loaded from events.json) ----
let events = [];

// ---- Render Events ----
function renderEvents(filter = 'all', region = 'all') {
  const grid = document.getElementById('events-grid');
  const noResults = document.getElementById('no-results');

  const filtered = events.filter(e => {
    const catMatch = filter === 'all' || e.category === filter;
    const regMatch = region === 'all' || e.region === region;
    return catMatch && regMatch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';

  // Sort: urgent first, then by date
  filtered.sort((a, b) => {
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    return new Date(a.date) - new Date(b.date);
  });

  grid.innerHTML = filtered.map(e => {
    const dateObj = new Date(e.date + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
    const daysLeft = Math.ceil((dateObj - new Date()) / (1000 * 60 * 60 * 24));
    const urgentTag = (daysLeft <= 14 && daysLeft > 0) ? `<span class="event-urgent">${daysLeft} days left</span>` : '';
    const regionLabel = formatRegion(e.region);

    return `
      <article class="event-card" data-category="${e.category}" data-region="${e.region}">
        <div class="event-card-header">
          <span class="event-badge ${e.category}">${capitalise(e.category)}</span>
          ${urgentTag}
        </div>
        <h3>${e.name}</h3>
        <p class="event-org">${e.org}</p>
        <p class="event-desc">${e.description}</p>
        <div class="event-meta">
          <span>${dateStr}</span>
          <span>${regionLabel}</span>
          <span>${e.years}</span>
          ${e.contact ? `<span><a href="mailto:${e.contact}">${e.contact}</a></span>` : ''}
        </div>
        <div class="event-link">
          <a href="${e.link}" target="_blank" rel="noopener">Learn more</a>
        </div>
      </article>
    `;
  }).join('');
}

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatRegion(r) {
  const map = {
    'online': 'Nationwide / Online',
    'northland': 'Northland',
    'auckland': 'Auckland',
    'waikato': 'Waikato',
    'bay-of-plenty': 'Bay of Plenty',
    'gisborne': 'Gisborne',
    'hawkes-bay': "Hawke's Bay",
    'taranaki': 'Taranaki',
    'manawatu': 'Manawatū-Whanganui',
    'wellington': 'Wellington',
    'tasman': 'Tasman',
    'nelson': 'Nelson',
    'marlborough': 'Marlborough',
    'west-coast': 'West Coast',
    'canterbury': 'Canterbury',
    'otago': 'Otago',
    'southland': 'Southland'
  };
  return map[r] || r;
}

// ---- Filter Handlers ----
document.addEventListener('DOMContentLoaded', async () => {
  let activeCategory = 'all';
  let activeRegion = 'all';

  // Load events from JSON
  try {
    const res = await fetch('events.json');
    events = await res.json();
  } catch (e) {
    console.error('Failed to load events.json:', e);
  }

  renderEvents();
  animateStats();

  // Category filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      renderEvents(activeCategory, activeRegion);
    });
  });

  // Region filter
  document.getElementById('region-filter').addEventListener('change', (e) => {
    activeRegion = e.target.value;
    renderEvents(activeCategory, activeRegion);
  });

  // Mobile menu
  document.querySelector('.mobile-menu').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.querySelector('.nav-links').classList.remove('open');
    });
  });

});

// ---- Stat Counter Animation ----
function animateStats() {
  const statNums = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        animateCount(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
}

function animateCount(el, target) {
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(eased * target);

    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
