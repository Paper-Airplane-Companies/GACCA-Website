const SUPABASE_URL = 'https://taitdelrltjbqcbtqfwv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_mn0vcranLN8jHFYNIVWBcQ_vT304sJe';

const categoryLabels = {
  Contractor: 'Contractor Member',
  Associate: 'Industry Partner',
  Honorary: 'Honorary / Education Partner'
};

let activeCategory = 'All';
let searchTerm = '';

async function loadMembers() {
  const count = document.getElementById('memberCount');
  const status = document.getElementById('memberStatus');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/members?select=id,name,category,website_url&is_active=eq.true&order=category.asc,name.asc`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) throw new Error('Unable to load members');
    const members = await response.json();
    window.gaccaMembers = members;
    applyDirectoryFilters();
    if (status) status.textContent = '';
  } catch (error) {
    if (count) count.textContent = '';
    if (status) status.textContent = 'Member directory is temporarily unavailable.';
    console.error(error);
  }
}

function renderMembers(members) {
  const grid = document.getElementById('memberGrid');
  if (!grid) return;

  if (!members.length) {
    grid.innerHTML = '<div class="directory-empty"><strong>No members found.</strong><p>Try another company name or choose a different member category.</p></div>';
    return;
  }

  grid.innerHTML = members.map(member => {
    const website = safeUrl(member.website_url);
    return `
    <article class="member-card" data-category="${escapeAttribute(member.category)}">
      <span class="member-category">${categoryLabels[member.category] || escapeHtml(member.category)}</span>
      <h3>${escapeHtml(member.name)}</h3>
      <p>${member.category === 'Contractor'
        ? 'GACCA Contractor Member supporting the HVAC trade and communities across our region.'
        : member.category === 'Associate'
          ? 'GACCA Industry Partner supporting contractors, workforce development and the HVAC trade.'
          : 'Education, community or honorary partner supporting GACCA and the industry.'}</p>
      ${website !== '#'
        ? `<a class="member-link" href="${escapeAttribute(website)}" target="_blank" rel="noopener noreferrer">Visit Company Website</a>`
        : '<span class="member-link member-link-muted">Website confirmation pending</span>'}
    </article>`;
  }).join('');
}

function applyDirectoryFilters() {
  const members = window.gaccaMembers || [];
  const filtered = members.filter(member => {
    const categoryMatch = activeCategory === 'All' || member.category === activeCategory;
    const searchMatch = !searchTerm || member.name.toLowerCase().includes(searchTerm);
    return categoryMatch && searchMatch;
  });

  renderMembers(filtered);
  updateCount(filtered.length, members.length);
}

function updateCount(visible, total) {
  const count = document.getElementById('memberCount');
  if (!count) return;
  count.textContent = visible === total
    ? `${total} active GACCA members and partners`
    : `${visible} of ${total} active GACCA members and partners shown`;
}

function filterMembers(category, button) {
  activeCategory = category;
  document.querySelectorAll('.directory-filter button').forEach(btn => btn.classList.remove('active'));
  if (button) button.classList.add('active');
  applyDirectoryFilters();
}

function setupSearch() {
  const search = document.getElementById('memberSearch');
  if (!search) return;
  search.addEventListener('input', event => {
    searchTerm = event.target.value.trim().toLowerCase();
    applyDirectoryFilters();
  });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));
}
function escapeAttribute(value) { return escapeHtml(value); }
function safeUrl(value = '') {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
  } catch {
    return '#';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupSearch();
  loadMembers();
});
