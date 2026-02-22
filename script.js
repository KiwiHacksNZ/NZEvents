let events = [];

function renderEvents(filter, region) {
  filter = filter || 'all';
  region = region || 'all';

  const grid = document.getElementById('events-grid');
  const noResults = document.getElementById('no-results');

  const filtered = events.filter(function (e) {
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

  filtered.sort(function (a, b) {
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    return new Date(a.date) - new Date(b.date);
  });

  grid.innerHTML = filtered.map(function (e) {
    var dateObj = new Date(e.date + 'T00:00:00');
    var isDate = !isNaN(dateObj.getTime());
    var dateStr = isDate
      ? dateObj.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
      : e.date;
    var daysLeft = isDate ? Math.ceil((dateObj - new Date()) / 86400000) : null;
    var urgent = (daysLeft !== null && daysLeft <= 14 && daysLeft > 0)
      ? '<span class="event-urgent">' + daysLeft + ' days left</span>'
      : '';
    const contact = e.contact
      ? '<span><a href="mailto:' + e.contact + '">' + e.contact + '</a></span>'
      : '';
    const category = e.category.charAt(0).toUpperCase() + e.category.slice(1);
    const region = formatRegion(e.region);

    return '<article class="event-card">' +
      '<div class="event-card-header">' +
        '<span class="event-badge ' + e.category + '">' + category + '</span>' +
        urgent +
      '</div>' +
      '<h3>' + e.name + '</h3>' +
      '<p class="event-org">' + e.org + '</p>' +
      '<p class="event-desc">' + e.description + '</p>' +
      '<div class="event-meta">' +
        '<span>' + dateStr + '</span>' +
        '<span>' + region + '</span>' +
        '<span>' + e.years + '</span>' +
        contact +
      '</div>' +
      '<div class="event-link">' +
        '<a href="' + e.link + '" target="_blank" rel="noopener">Learn more</a>' +
      '</div>' +
    '</article>';
  }).join('');
}

function formatRegion(r) {
  var map = {
    'online': 'Nationwide / Online',
    'northland': 'Northland',
    'auckland': 'Auckland',
    'waikato': 'Waikato',
    'bay-of-plenty': 'Bay of Plenty',
    'gisborne': 'Gisborne',
    'hawkes-bay': "Hawke's Bay",
    'taranaki': 'Taranaki',
    'manawatu': 'Manawatu-Whanganui',
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

document.addEventListener('DOMContentLoaded', async function () {
  var activeCategory = 'all';
  var activeRegion = 'all';

  try {
    var res = await fetch('events.json');
    events = await res.json();
  } catch (err) {
    console.error('Failed to load events.json:', err);
  }

  renderEvents();

  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      renderEvents(activeCategory, activeRegion);
    });
  });

  document.getElementById('region-filter').addEventListener('change', function (e) {
    activeRegion = e.target.value;
    renderEvents(activeCategory, activeRegion);
  });

  document.querySelector('.mobile-menu').addEventListener('click', function () {
    document.querySelector('.nav-links').classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () {
      document.querySelector('.nav-links').classList.remove('open');
    });
  });
});
