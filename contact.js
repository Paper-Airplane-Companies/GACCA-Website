const CONTACT_SUPABASE_URL = 'https://taitdelrltjbqcbtqfwv.supabase.co';
const CONTACT_SUPABASE_KEY = 'sb_publishable_mn0vcranLN8jHFYNIVWBcQ_vT304sJe';

const contactHeaders = {
  apikey: CONTACT_SUPABASE_KEY,
  Authorization: `Bearer ${CONTACT_SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

async function submitContactInquiry(form) {
  const message = document.querySelector('#contact-form-message');
  const button = form.querySelector('button[type="submit"]');
  const data = new FormData(form);

  const record = {
    name: data.get('name')?.trim(),
    company_name: data.get('company')?.trim() || null,
    email: data.get('email')?.trim(),
    interest: data.get('interest'),
    message: data.get('message')?.trim(),
    status: 'Submitted'
  };

  button.disabled = true;
  button.textContent = 'Sending...';
  message.className = 'form-message';
  message.textContent = '';

  try {
    const response = await fetch(`${CONTACT_SUPABASE_URL}/rest/v1/contact_inquiries`, {
      method: 'POST',
      headers: { ...contactHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify(record)
    });

    if (!response.ok) throw new Error(await response.text());

    form.reset();
    message.className = 'form-message success';
    message.textContent = 'Thank you. Your message has been sent to GACCA for follow-up.';
  } catch (error) {
    console.error(error);
    message.className = 'form-message error';
    message.textContent = 'We could not send your message right now. Please try again later.';
  } finally {
    button.disabled = false;
    button.textContent = 'Send Message';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const interest = params.get('interest');
  const select = form.querySelector('[name="interest"]');
  if (interest && select) {
    const matching = Array.from(select.options).find(option => option.value.toLowerCase() === interest.toLowerCase());
    if (matching) select.value = matching.value;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    submitContactInquiry(form);
  });
});
