import {projectUrl, publishableKey} from './config.js';

const el = id => document.getElementById(id);
const message = words => { el('message').textContent = words; };
const statusNames = {new:'New', callback:'Call back', approved:'Approved', declined:'Declined'};
let token = '';
let offset = 0;
let revision = 0;

function signedIn(active) {
  el('desk').hidden = !active;
  el('logout').hidden = !active;
  el('login').hidden = active;
  if (!active) {
    token = '';
    revision++;
    el('list').replaceChildren();
    el('add').reset();
  }
}

async function request(path, method = 'GET', body, prefer) {
  const headers = {apikey:publishableKey, 'Content-Type':'application/json'};
  if (token) headers.Authorization = 'Bearer ' + token;
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(projectUrl + path, {method, headers, body:JSON.stringify(body), cache:'no-store'});
  if (response.status === 401 && token) {
    signedIn(false);
    throw Error('Your session expired. Sign in again.');
  }
  if (!response.ok) throw Error(path.includes('/token') ? 'Sign-in failed. Check your staff credentials.' : 'Request failed. Refresh to check the latest saved details.');
  const data = await response.text();
  return data ? JSON.parse(data) : null;
}

function action(control, event, task) {
  control.addEventListener(event, async e => {
    e.preventDefault();
    const button = e.submitter || control;
    if (button.disabled) return;
    button.disabled = true;
    message('');
    try { await task(); } catch (error) { message(error.message); }
    finally { button.disabled = false; }
  });
}

function node(tag, words) {
  const item = document.createElement(tag);
  item.textContent = words;
  return item;
}

function businessCard(lead) {
  const card = node('article','');
  const info = lead.callback_at ? ' · ' + new Date(lead.callback_at).toLocaleString('en-ZA') : '';
  const dial = node('a','Call ' + lead.phone);
  dial.href = 'tel:' + lead.phone;
  dial.className = 'dial';
  card.append(node('h2',lead.business), node('small',statusNames[lead.status] + info), node('p',lead.details), dial);
  const actions = node('div','');
  actions.className = 'actions';
  const schedule = node('form','');
  schedule.hidden = true;
  const label = node('label','Callback date and time');
  const time = document.createElement('input');
  time.type = 'datetime-local';
  time.required = true;
  label.append(time);
  schedule.append(label,node('button','Save callback'));
  async function save(status, callback_at = null) {
    const match = new URLSearchParams({id:'eq.'+lead.id,updated_at:'eq.'+lead.updated_at,select:'id'});
    const rows = await request('/rest/v1/call_leads?'+match,'PATCH',{status,callback_at},'return=representation');
    await load();
    message(rows.length ? lead.business + ' · ' + statusNames[status] : 'Someone already updated this business. The list has been refreshed.');
  }
  action(schedule,'submit',async () => {
    const when = new Date(time.value);
    if (when <= new Date()) throw Error('Choose a future callback time.');
    await save('callback',when.toISOString());
  });
  for (const [value, title] of [['declined','Decline'],['callback','Call back'],['approved','Approve']]) {
    const button = node('button',title);
    action(button,'click',async () => {
      if (value === 'callback') { schedule.hidden = false; time.focus(); }
      else await save(value);
    });
    actions.append(button);
  }
  card.append(actions,schedule);
  return card;
}

async function load(append = false) {
  const version = ++revision;
  const start = append ? offset : 0;
  const filter = el('filter').value;
  const params = new URLSearchParams({select:'*',order:'callback_at.asc.nullslast,business.asc,id.asc',limit:'51',offset:String(start)});
  if (filter === 'queue') params.set('or','(status.eq.new,and(status.eq.callback,callback_at.lte.'+new Date().toISOString()+'))');
  else params.set('status','eq.'+filter);
  const rows = await request('/rest/v1/call_leads?'+params);
  if (version !== revision) return;
  if (!append) el('list').replaceChildren();
  for (const row of rows.slice(0,50)) el('list').append(businessCard(row));
  offset = start + Math.min(rows.length,50);
  el('more').hidden = rows.length <= 50;
  if (!offset) el('list').append(node('p','No businesses in this list.'));
}

action(el('login'),'submit',async () => {
  if (!publishableKey) throw Error('Staff access is awaiting backend activation.');
  const data = Object.fromEntries(new FormData(el('login')));
  const auth = await request('/auth/v1/token?grant_type=password','POST',data);
  if (!['sales','owner'].includes(auth.user?.app_metadata?.agency_role)) throw Error('This account needs staff access.');
  token = auth.access_token;
  signedIn(true);
  el('login').reset();
  await load();
});
action(el('logout'),'click',async () => {
  try { await request('/auth/v1/logout?scope=local','POST'); } finally { signedIn(false); }
});
action(el('add'),'submit',async () => {
  const data = Object.fromEntries(new FormData(el('add')));
  data.business = data.business.trim();
  data.phone = data.phone.replace(/[\s().-]/g,'');
  if (!data.business || !/^\+?\d{7,15}$/.test(data.phone)) throw Error('Enter a business name and a valid contact number.');
  await request('/rest/v1/call_leads','POST',data);
  el('add').reset();
  await load();
  message('Business saved to the call list.');
});
action(el('filter'),'change',() => load());
action(el('refresh'),'click',() => load());
action(el('more'),'click',() => load(true));
