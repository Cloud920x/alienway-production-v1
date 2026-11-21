import {projectUrl, publishableKey} from './config.js';

const el = id => document.getElementById(id);
const message = words => { el('message').textContent = words; };
const statusNames = {new:'New', callback:'Call back', approved:'Approved', declined:'Declined'};
let token = '';
let offset = 0;
let revision = 0;

const sessionKey = 'alienway.staff.session';
let expiryTimer;
function screen(name) {
  for (const id of ['login','send','verify','choose']) el(id).hidden = id !== name;
}
function signedIn(active) {
  screen(active ? '' : 'login');
  el('desk').hidden = !active;
  el('logout').hidden = !active;
  el('login').hidden = active;
  if (!active) {
    clearTimeout(expiryTimer);
    sessionStorage.removeItem(sessionKey);
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
  if (!response.ok) {
    if (response.status === 429) throw Error('Too many requests. Please try again later.');
    if (path.startsWith('/auth/v1/token')) throw Error('Sign-in failed. Check your email and password.');
    if (path === '/auth/v1/user' && method === 'PUT') throw Error('Password could not be saved. Check the password or request a fresh setup email.');
    if (path.endsWith('/verify')) throw Error('That PIN could not be verified. Check the code or request a new one.');
    if (path.startsWith('/auth/v1/otp')) throw Error('Unable to send a PIN. Check your staff email or contact the owner.');
    throw Error('Request failed. Refresh to check the latest saved details.');
  }
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
    await refreshList(rows.length ? lead.business + ' · ' + statusNames[status] : 'Someone already updated this business. Check the latest status below.');
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

async function refreshList(successMessage = '') {
  const version = revision + 1;
  try {
    await load();
    if (version === revision) message(successMessage);
  } catch (error) {
    if (!token) throw error;
    if (version !== revision) return;
    el('list').replaceChildren();
    el('more').hidden = true;
    message([successMessage, 'Could not load the call list. Tap Refresh to try again.'].filter(Boolean).join(' '));
  }
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

function checkStaff(user) {
  if (!['sales','owner'].includes(user?.app_metadata?.agency_role)) throw Error('This account needs staff access.');
}

async function openDesk(accessToken, expiresAt) {
  token = accessToken;
  try {
    checkStaff(await request('/auth/v1/user'));
    if (!(expiresAt > Date.now())) throw Error('Session expired. Please sign in again.');
    sessionStorage.setItem(sessionKey, JSON.stringify({accessToken, expiresAt}));
  } catch (error) {
    signedIn(false);
    throw error;
  }
  signedIn(true);
  clearTimeout(expiryTimer);
  expiryTimer = setTimeout(() => {
    signedIn(false);
    message('Session expired. Please sign in again.');
  }, expiresAt - Date.now());
  await refreshList();
}

action(el('login'),'submit',async () => {
  const fields = el('login').elements;
  const auth = await request('/auth/v1/token?grant_type=password','POST',{
    email:fields.email.value.trim(), password:fields.password.value
  });
  fields.password.value = '';
  await openDesk(auth.access_token, Date.now() + auth.expires_in * 1000);
});
action(el('setup'),'click',async () => {
  el('send').elements.email.value = el('login').elements.email.value;
  screen('send');
  el('send').elements.email.focus();
});
for (const button of document.querySelectorAll('.cancel')) {
  action(button,'click',async () => {
    signedIn(false);
    el('choose').reset();
    el('verify').reset();
  });
}
action(el('send'),'submit',async () => {
  const email = el('send').elements.email.value.trim();
  const redirect = new URL('./',location.href).href;
  await request('/auth/v1/otp?redirect_to='+encodeURIComponent(redirect),'POST',{email,create_user:false});
  screen('verify');
  el('verify').elements.token.focus();
});
async function choosePassword(accessToken) {
  token = accessToken;
  try { checkStaff(await request('/auth/v1/user')); }
  catch (error) { signedIn(false); throw error; }
  screen('choose');
  el('choose').elements.password.focus();
}
action(el('verify'),'submit',async () => {
  const auth = await request('/auth/v1/verify','POST',{
    email:el('send').elements.email.value.trim(),token:el('verify').elements.token.value.trim(),type:'email'
  });
  el('verify').reset();
  await choosePassword(auth.access_token);
});
action(el('choose'),'submit',async () => {
  await request('/auth/v1/user','PUT',{password:el('choose').elements.password.value});
  el('choose').reset();
  try { await request('/auth/v1/logout?scope=local','POST'); }
  finally { signedIn(false); message('Password saved. Sign in with your staff email and password.'); }
});
action(el('logout'),'click',async () => {
  try { await request('/auth/v1/logout?scope=local','POST'); } finally { signedIn(false); }
});
async function resume() {
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.has('access_token') || hash.has('error') || hash.has('error_code')) {
    history.replaceState(null,'',location.pathname + location.search);
    signedIn(false);
    if (!hash.get('access_token')) throw Error('That email link expired. Request a fresh one.');
    await choosePassword(hash.get('access_token'));
    return;
  }
  const saved = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
  if (saved && saved.expiresAt > Date.now()) await openDesk(saved.accessToken,saved.expiresAt);
  else signedIn(false);
}
resume().catch(error => { signedIn(false); message(error.message); });
action(el('add'),'submit',async () => {
  const data = Object.fromEntries(new FormData(el('add')));
  data.business = data.business.trim();
  data.phone = data.phone.replace(/[\s().-]/g,'');
  if (!data.business || !/^\+?\d{7,15}$/.test(data.phone)) throw Error('Enter a business name and a valid contact number.');
  await request('/rest/v1/call_leads','POST',data);
  el('add').reset();
  el('filter').value = 'queue';
  await refreshList('Business saved. Showing the call queue.');
});
action(el('filter'),'change',() => refreshList());
action(el('refresh'),'click',() => refreshList());
action(el('more'),'click',() => load(true));
