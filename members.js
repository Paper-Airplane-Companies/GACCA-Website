const SUPABASE_URL = 'https://taitdelrltjbqcbtqfwv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_mn0vcranLN8jHFYNIVWBcQ_vT304sJe';

async function loadMembers() {
  const grid = document.getElementById('memberGrid');
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
    renderMembers(members);
    if (count) count.textContent = `${members.length} active members`;
    if (status) status.textContent = '';
  } catch (error) {
    if (status) status.textContent = 'Member directory is temporarily unavailable.';
    console.error(error);
  }
}

function renderMembers(members) {
  const grid = document.getElementById('memberGrid');
  if (!grid) return;

  if (!members.length) {
    grid.innerHTML = '<p>No members found.</p>';
    return;
  }

  grid.innerHTML = members.map(member => `
    <article class="member-card" data-category="${member.category}">
      <span class="member-category">${member.category}</span>
      <h3>${escapeHtml(member.name)}</h3>
      <p>${member.category === 'Contractor' ? 'HVAC contractor member' : member.category === 'Associate' ? 'Industry partner member' : 'Honorary member'}</p>
      ${member.website_url ? `<a class="member-link" href="${escapeAttribute(member.website_url)}" target="_blank" rel="noopener noreferrer">Visit Website</a>` : '<span class="member-link member-link-muted">Website coming soon</span>'}
    </article>
  `).join('');
}

function filterMembers(category, button) {
  const members = window.gaccaMembers || [];
  const filtered = category === 'All' ? members : members.filter(member => member.category === category);
  renderMembers(filtered);
  document.querySelectorAll('.directory-filter button').forEach(btn => btn.classList.remove('active'));
  if (button) button.classList.add('active');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));
}
function escapeAttribute(value) { return escapeHtml(value); }

document.addEventListener('DOMContentLoaded', loadMembers);
