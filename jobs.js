const SUPABASE_URL = 'https://taitdelrltjbqcbtqfwv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_mn0vcranLN8jHFYNIVWBcQ_vT304sJe';

const apiHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeUrl(value = '') {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
  } catch {
    return '#';
  }
}

async function submitJob(form) {
  const message = document.querySelector('#form-message');
  const button = form.querySelector('button[type="submit"]');
  const data = new FormData(form);

  const record = {
    company_name: data.get('company')?.trim(),
    job_title: data.get('title')?.trim(),
    location: data.get('location')?.trim(),
    employment_type: data.get('type') || null,
    pay_range: data.get('compensation')?.trim() || null,
    summary: data.get('summary')?.trim(),
    qualifications: data.get('qualifications')?.trim() || null,
    benefits: data.get('benefits')?.trim() || null,
    apply_url: data.get('apply')?.trim(),
    contact_email: data.get('email')?.trim() || null,
    expiration_date: data.get('expiration') || null,
    status: 'pending',
    featured: false
  };

  button.disabled = true;
  button.textContent = 'Submitting...';
  message.className = 'form-message';
  message.textContent = '';

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs`, {
      method: 'POST',
      headers: { ...apiHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify(record)
    });

    if (!response.ok) throw new Error(await response.text());

    form.reset();
    message.className = 'form-message success';
    message.textContent = 'Thank you. Your job has been submitted to GACCA for review. It will not appear publicly until it is approved.';
  } catch (error) {
    console.error(error);
    message.className = 'form-message error';
    message.textContent = 'We could not submit the job right now. Please try again or contact GACCA.';
  } finally {
    button.disabled = false;
    button.textContent = 'Submit for Review';
  }
}

function renderJobs(jobs) {
  const container = document.querySelector('#jobs-list');
  const count = document.querySelector('#jobs-count');
  if (!container) return;
  container.setAttribute('aria-busy', 'false');

  if (count) count.textContent = `${jobs.length} active ${jobs.length === 1 ? 'opportunity' : 'opportunities'}`;

  if (!jobs.length) {
    container.innerHTML = `
      <article class="job-card placeholder">
        <span class="job-type">GACCA Careers</span>
        <h3>No approved openings are posted right now.</h3>
        <p>GACCA member companies choose the positions they want us to promote through this careers hub. New approved openings will appear here.</p>
      </article>`;
    return;
  }

  container.innerHTML = jobs.map(job => {
    const pay = job.pay_range ? `<span>${escapeHtml(job.pay_range)}</span>` : '';
    const type = job.employment_type ? escapeHtml(job.employment_type) : 'HVAC Career';
    const apply = safeUrl(job.apply_url);
    const featured = job.featured ? '<span class="featured-badge">Featured</span>' : '';
    return `
      <article class="job-card ${job.featured ? 'featured-job' : ''}">
        <div class="job-card-top"><span class="job-type">${type}</span>${featured}</div>
        <h3>${escapeHtml(job.job_title)}</h3>
        <strong class="job-company">${escapeHtml(job.company_name)}</strong>
        <p>${escapeHtml(job.summary)}</p>
        <div class="job-meta"><span>${escapeHtml(job.location)}</span>${pay}</div>
        <a class="btn btn-primary job-apply" href="${apply}" target="_blank" rel="noopener noreferrer">Apply with Employer</a>
      </article>`;
  }).join('');
}

async function loadJobs() {
  const container = document.querySelector('#jobs-list');
  const count = document.querySelector('#jobs-count');
  if (!container) return;
  container.setAttribute('aria-busy', 'true');
  container.innerHTML = '<div class="jobs-loading">Loading current opportunities...</div>';

  try {
    const query = new URLSearchParams({
      select: 'id,company_name,job_title,location,employment_type,pay_range,summary,apply_url,expiration_date,featured,created_at',
      status: 'eq.approved',
      order: 'featured.desc,created_at.desc'
    });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs?${query}`, { headers: apiHeaders });
    if (!response.ok) throw new Error(await response.text());
    const jobs = await response.json();
    renderJobs(jobs);
  } catch (error) {
    console.error(error);
    container.setAttribute('aria-busy', 'false');
    if (count) count.textContent = 'Current opportunities unavailable';
    container.innerHTML = '<div class="form-message error">We could not load current jobs. Please refresh the page or try again later.</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#job-submission-form');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    submitJob(form);
  });
  loadJobs();
});
