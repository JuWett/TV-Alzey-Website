const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
const header = document.querySelector('.site-header');

function closeMenu() {
  nav?.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
}

toggle?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(Boolean(open)));
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

document.addEventListener('click', (event) => {
  if (!nav?.classList.contains('open')) return;
  if (!nav.contains(event.target) && !toggle?.contains(event.target)) closeMenu();
});

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Lokaler Wettkampfkalender
const calendarRoot = document.querySelector('#competition-calendar');
if (calendarRoot) {
  const searchInput = document.querySelector('#event-search');
  const monthFilter = document.querySelector('#month-filter');
  const resetButton = document.querySelector('#reset-calendar');
  const eventCount = document.querySelector('#event-count');
  const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  let events = [];

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const validUrl = (value = '') => /^https?:\/\//i.test(value) ? value : '';

  function renderCalendar() {
    const term = searchInput.value.trim().toLocaleLowerCase('de');
    const month = monthFilter.value;
    const filtered = events.filter((event) => {
      const haystack = `${event.veranstaltung || ''} ${event.ort || ''} ${event.plz || ''} ${event.kategorie || ''} ${event.meisterschaft || ''}`.toLocaleLowerCase('de');
      return (!term || haystack.includes(term)) && (month === 'all' || event.datum.slice(5,7) === month);
    });

    eventCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'Termin' : 'Termine'}`;
    if (!filtered.length) {
      calendarRoot.innerHTML = '<div class="calendar-empty">Keine passenden Veranstaltungen gefunden.</div>';
      return;
    }

    const grouped = filtered.reduce((acc, event) => {
      const key = event.datum.slice(0,7);
      (acc[key] ||= []).push(event);
      return acc;
    }, {});

    calendarRoot.innerHTML = Object.entries(grouped).map(([key, monthEvents]) => {
      const monthIndex = Number(key.slice(5,7)) - 1;
      return `<section class="calendar-month">
        <div class="calendar-month-heading"><h3>${monthNames[monthIndex]} ${key.slice(0,4)}</h3><span>${monthEvents.length}</span></div>
        <div class="event-list">${monthEvents.map((event) => {
          const date = new Date(`${event.datum}T12:00:00`);
          const day = String(date.getDate()).padStart(2,'0');
          const monthShort = monthNames[date.getMonth()].slice(0,3);
          const url = validUrl(event.website);
          const badges = [
            event.kategorie ? `<span class="event-badge">${escapeHtml(event.kategorie)}</span>` : '',
            event.distanz_km ? `<span class="event-badge">${escapeHtml(event.distanz_km)} km</span>` : '',
            event.hoehenmeter ? `<span class="event-badge">${escapeHtml(event.hoehenmeter)} Hm</span>` : '',
            event.meisterschaft ? `<span class="event-badge highlight">${escapeHtml(event.meisterschaft)}</span>` : ''
          ].join('');
          return `<article class="event-card">
            <div class="event-date"><b>${day}</b><span>${monthShort}</span></div>
            <div class="event-content">
              <h4>${escapeHtml(event.veranstaltung)}</h4>
              <div class="event-meta">
                <span>${escapeHtml(event.wochentag || '')}${event.uhrzeit ? ` · ${escapeHtml(event.uhrzeit)} Uhr` : ''}</span>
                <span>${escapeHtml([event.plz,event.ort].filter(Boolean).join(' '))}</span>
                ${event.veranstalter ? `<span>${escapeHtml(event.veranstalter)}</span>` : ''}
              </div>
              ${badges ? `<div class="event-badges">${badges}</div>` : ''}
            </div>
            ${url ? `<a class="event-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">Zur Veranstaltung →</a>` : '<span class="event-link disabled">Noch kein Link</span>'}
          </article>`;
        }).join('')}</div>
      </section>`;
    }).join('');
  }

  fetch('laufveranstaltungen.json')
    .then((response) => {
      if (!response.ok) throw new Error('Daten konnten nicht geladen werden.');
      return response.json();
    })
    .then((data) => {
      events = data
        .filter((event) => event && /^\d{4}-\d{2}-\d{2}$/.test(event.datum || ''))
        .sort((a,b) => `${a.datum} ${a.uhrzeit || ''}`.localeCompare(`${b.datum} ${b.uhrzeit || ''}`));
      const months = [...new Set(events.map((event) => event.datum.slice(5,7)))];
      monthFilter.insertAdjacentHTML('beforeend', months.map((value) => `<option value="${value}">${monthNames[Number(value)-1]}</option>`).join(''));
      renderCalendar();
    })
    .catch(() => {
      calendarRoot.innerHTML = '<div class="calendar-error">Die Wettkampfdaten konnten nicht geladen werden. Bitte die Datei „laufveranstaltungen.json“ gemeinsam mit der Website hochladen.</div>';
      eventCount.textContent = 'Kalender nicht verfügbar';
    });

  searchInput.addEventListener('input', renderCalendar);
  monthFilter.addEventListener('change', renderCalendar);
  resetButton.addEventListener('click', () => { searchInput.value = ''; monthFilter.value = 'all'; renderCalendar(); searchInput.focus(); });
}
