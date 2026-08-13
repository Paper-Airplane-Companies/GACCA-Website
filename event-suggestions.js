const EVENT_SUPABASE_URL='https://taitdelrltjbqcbtqfwv.supabase.co';
const EVENT_SUPABASE_KEY='sb_publishable_mn0vcranLN8jHFYNIVWBcQ_vT304sJe';

const calendarState={
  current:new Date(new Date().getFullYear(),new Date().getMonth(),1),
  events:[]
};

document.addEventListener('DOMContentLoaded',()=>{
  buildCalendarShell();
  loadPublishedEvents();
  wireEventSuggestionForm();
});

function wireEventSuggestionForm(){
  const form=document.getElementById('eventSuggestionForm');
  if(!form)return;
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const status=document.getElementById('eventFormStatus');
    const button=form.querySelector('button[type="submit"]');
    status.textContent='Submitting your idea...';
    button.disabled=true;
    const data=new FormData(form);
    const payload={
      event_title:data.get('event_title'),
      event_type:data.get('event_type'),
      value_to_members:data.get('value_to_members'),
      suggested_speaker:data.get('suggested_speaker')||null,
      preferred_timing:data.get('preferred_timing')||null,
      sponsor_interest:data.get('sponsor_interest')==='on',
      organizer_interest:data.get('organizer_interest')==='on',
      contact_name:data.get('contact_name'),
      company_name:data.get('company_name'),
      email:data.get('email'),
      phone:data.get('phone')||null,
      status:'Submitted'
    };
    try{
      const response=await fetch(`${EVENT_SUPABASE_URL}/rest/v1/event_suggestions`,{
        method:'POST',
        headers:{apikey:EVENT_SUPABASE_KEY,Authorization:`Bearer ${EVENT_SUPABASE_KEY}`,'Content-Type':'application/json',Prefer:'return=minimal'},
        body:JSON.stringify(payload)
      });
      if(!response.ok)throw new Error('Submission failed');
      form.reset();
      status.textContent='Thank you. Your event idea has been submitted to GACCA for review.';
    }catch(error){
      console.error(error);
      status.textContent='We could not submit your idea right now. Please try again later.';
    }finally{
      button.disabled=false;
    }
  });
}

function buildCalendarShell(){
  const calendarSection=document.getElementById('calendar');
  if(!calendarSection)return;
  const container=calendarSection.querySelector('.container');
  const eventGrid=container?.querySelector('.event-grid');
  if(!container||!eventGrid)return;

  const style=document.createElement('style');
  style.textContent=`
    .gacca-calendar{margin:34px 0 48px;border:1px solid #d8e0e6;background:#fff}
    .gacca-calendar-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 24px;background:#0d2943;color:#fff;border-bottom:5px solid #f37021}
    .gacca-calendar-head h3{margin:0;font-family:"Barlow Condensed",Arial,sans-serif;font-size:2.2rem;line-height:1;text-transform:uppercase}
    .gacca-calendar-controls{display:flex;gap:8px}
    .gacca-calendar-controls button{border:1px solid rgba(255,255,255,.5);background:transparent;color:#fff;width:42px;height:42px;font-size:1.35rem;font-weight:800;cursor:pointer}
    .gacca-calendar-controls button:hover{border-color:#f37021;color:#f37021}
    .gacca-calendar-weekdays,.gacca-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr)}
    .gacca-calendar-weekdays div{padding:11px 8px;background:#eef2f5;color:#24415d;text-align:center;font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-right:1px solid #d8e0e6}
    .gacca-calendar-day{position:relative;min-height:112px;padding:10px;border-right:1px solid #e1e6ea;border-bottom:1px solid #e1e6ea;background:#fff}
    .gacca-calendar-day.is-outside{background:#f8fafb;color:#a4adb5}
    .gacca-calendar-day.is-today .day-number{background:#f37021;color:#fff}
    .day-number{display:grid;place-items:center;width:29px;height:29px;border-radius:50%;font-weight:800;color:#18344f}
    .calendar-event{display:block;margin-top:7px;padding:6px 8px;border-left:4px solid #f37021;background:#eaf1f7;color:#123d65;font-size:.75rem;font-weight:800;line-height:1.2;cursor:pointer}
    .calendar-event:hover{background:#dce9f3}
    .calendar-tooltip{position:absolute;left:8px;right:8px;top:70px;z-index:12;display:none;padding:12px;background:#0d2943;color:#fff;border-top:4px solid #f37021;box-shadow:0 12px 25px rgba(0,0,0,.2);font-size:.78rem}
    .calendar-event:focus + .calendar-tooltip,.calendar-event:hover + .calendar-tooltip{display:block}
    .calendar-tooltip strong{display:block;font-family:"Barlow Condensed",Arial,sans-serif;font-size:1.2rem;text-transform:uppercase}
    .calendar-tooltip span{display:block;margin-top:4px;color:#d8e4ec}
    .calendar-empty{padding:20px 24px;color:#65717d;font-size:.9rem;border-top:1px solid #e1e6ea}
    @media(max-width:780px){.gacca-calendar-day{min-height:82px;padding:6px}.calendar-event{font-size:.65rem;padding:5px}.gacca-calendar-head{align-items:flex-start}.gacca-calendar-head h3{font-size:1.8rem}.gacca-calendar-weekdays div{font-size:.58rem;padding:8px 2px}.day-number{width:25px;height:25px}}
    @media(max-width:520px){.gacca-calendar{overflow-x:auto}.gacca-calendar-inner{min-width:700px}}
  `;
  document.head.appendChild(style);

  const shell=document.createElement('div');
  shell.className='gacca-calendar';
  shell.innerHTML=`
    <div class="gacca-calendar-inner">
      <div class="gacca-calendar-head">
        <div>
          <div style="color:#f37021;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase">GACCA Calendar</div>
          <h3 id="calendarMonthLabel"></h3>
        </div>
        <div class="gacca-calendar-controls">
          <button type="button" id="calendarPrev" aria-label="Previous month">‹</button>
          <button type="button" id="calendarToday" aria-label="Go to current month" style="width:auto;padding:0 12px;font-size:.75rem;text-transform:uppercase">Today</button>
          <button type="button" id="calendarNext" aria-label="Next month">›</button>
        </div>
      </div>
      <div class="gacca-calendar-weekdays"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div>
      <div id="calendarGrid" class="gacca-calendar-grid" aria-live="polite"></div>
      <div id="calendarEmpty" class="calendar-empty">Scheduled GACCA events will appear here as they are approved and published.</div>
    </div>`;
  container.insertBefore(shell,eventGrid);

  document.getElementById('calendarPrev').addEventListener('click',()=>changeMonth(-1));
  document.getElementById('calendarNext').addEventListener('click',()=>changeMonth(1));
  document.getElementById('calendarToday').addEventListener('click',()=>{
    const now=new Date();
    calendarState.current=new Date(now.getFullYear(),now.getMonth(),1);
    renderCalendar();
  });
  renderCalendar();
}

async function loadPublishedEvents(){
  try{
    const response=await fetch(`${EVENT_SUPABASE_URL}/rest/v1/published_events?select=id,title,event_type,event_date,start_time,end_time,location,sponsor,description,registration_url&is_public=eq.true&order=event_date.asc`,{
      headers:{apikey:EVENT_SUPABASE_KEY,Authorization:`Bearer ${EVENT_SUPABASE_KEY}`}
    });
    if(!response.ok)throw new Error('Unable to load events');
    calendarState.events=await response.json();
    renderCalendar();
  }catch(error){
    console.error(error);
    const empty=document.getElementById('calendarEmpty');
    if(empty)empty.textContent='The event calendar is temporarily unavailable.';
  }
}

function changeMonth(delta){
  calendarState.current=new Date(calendarState.current.getFullYear(),calendarState.current.getMonth()+delta,1);
  renderCalendar();
}

function renderCalendar(){
  const grid=document.getElementById('calendarGrid');
  const label=document.getElementById('calendarMonthLabel');
  const empty=document.getElementById('calendarEmpty');
  if(!grid||!label)return;

  const year=calendarState.current.getFullYear();
  const month=calendarState.current.getMonth();
  label.textContent=calendarState.current.toLocaleDateString('en-US',{month:'long',year:'numeric'});

  const firstDay=new Date(year,month,1);
  const start=new Date(year,month,1-firstDay.getDay());
  const today=new Date();
  const cells=[];

  for(let i=0;i<42;i++){
    const date=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);
    const iso=toLocalISO(date);
    const dayEvents=calendarState.events.filter(event=>event.event_date===iso);
    const outside=date.getMonth()!==month;
    const isToday=date.getFullYear()===today.getFullYear()&&date.getMonth()===today.getMonth()&&date.getDate()===today.getDate();

    const eventsHtml=dayEvents.map(event=>{
      const time=formatTime(event.start_time);
      const detailParts=[time,event.location,event.sponsor?`Sponsored by ${event.sponsor}`:null].filter(Boolean);
      return `<div class="calendar-event" tabindex="0">${escapeCalendarHtml(event.title)}</div><div class="calendar-tooltip"><strong>${escapeCalendarHtml(event.title)}</strong>${detailParts.map(x=>`<span>${escapeCalendarHtml(x)}</span>`).join('')}${event.description?`<span>${escapeCalendarHtml(event.description)}</span>`:''}${event.registration_url?`<span>Registration available</span>`:''}</div>`;
    }).join('');

    cells.push(`<div class="gacca-calendar-day${outside?' is-outside':''}${isToday?' is-today':''}"><span class="day-number">${date.getDate()}</span>${eventsHtml}</div>`);
  }

  grid.innerHTML=cells.join('');
  const monthHasEvents=calendarState.events.some(event=>{
    const d=new Date(`${event.event_date}T12:00:00`);
    return d.getFullYear()===year&&d.getMonth()===month;
  });
  if(empty)empty.style.display=monthHasEvents?'none':'block';
}

function toLocalISO(date){
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,'0');
  const d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

function formatTime(value){
  if(!value)return '';
  const [h,m]=value.split(':').map(Number);
  const suffix=h>=12?'PM':'AM';
  const hour=((h+11)%12)+1;
  return `${hour}:${String(m).padStart(2,'0')} ${suffix}`;
}

function escapeCalendarHtml(value){
  return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
}
