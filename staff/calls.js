import {projectUrl, publishableKey} from './config.js';

const el = id => document.getElementById(id);
const message = words => { el('message').textContent = words; };
const statusNames = {new:'New', callback:'Call back', approved:'Interested', declined:'Not interested'};
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
    resetWorkspace();
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
  for (const [value, title] of [['approved','Interested'],['callback','Call back later'],['declined','Not interested']]) {
    const button = node('button',title);
    action(button,'click',async () => {
      if (value === 'callback') { schedule.hidden = false; time.focus(); }
      else await save(value);
    });
    actions.append(button);
  }
  const notePanel=node('details','');
  const noteForm=node('form',''), noteLabel=node('label','Call notes');
  const notes=document.createElement('textarea');
  notes.value=lead.details; notes.maxLength=2000;noteLabel.append(notes);
  noteForm.append(noteLabel,node('button','Save notes'));
  action(noteForm,'submit',async()=>{
    const match=new URLSearchParams({id:'eq.'+lead.id,updated_at:'eq.'+lead.updated_at,select:'id'});
    const result=await request('/rest/v1/call_leads?'+match,'PATCH',{details:notes.value},'return=representation');
    await refreshList(result.length?'Call notes saved.':'Another person updated this business. Review the latest notes.');
  });
  notePanel.append(node('summary','Edit call notes'),noteForm);
  const nextSteps=node('div','');
  nextSteps.className='actions secondary';
  nextSteps.append(command('Book meeting',()=>startForLead('meetings','book',lead.id)));
  if(role==='owner' && lead.status==='approved') nextSteps.append(command('Create quote',()=>startForLead('projects','quote',lead.id)));
  card.append(node('h3','How did the call go?'),actions,schedule,nextSteps,notePanel);
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
  const params = new URLSearchParams({select:'*',order:'callback_at.asc.nullslast,created_at.asc,business.asc,id.asc',limit:'51',offset:String(start)});
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
    const user = await request('/auth/v1/user');
    checkStaff(user);
    role = user.app_metadata.agency_role;
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
  await enterWorkspace();
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

action(el('jump-add'),'click',async()=>{
  el('add-panel').open=true;
  el('add').elements.business.focus();
});
action(el('add'),'submit',async () => {
  const data = Object.fromEntries(new FormData(el('add')));
  data.business = data.business.trim();
  data.phone = data.phone.replace(/[\s().-]/g,'');
  if (!data.business || !/^\+?\d{7,15}$/.test(data.phone)) throw Error('Enter a business name and a valid contact number.');
  await request('/rest/v1/call_leads','POST',data);
  el('add').reset();
  el('add-panel').open = false;
  el('filter').value = 'queue';
  await refreshList('Business saved at the end of the call list.');
});
action(el('filter'),'change',() => refreshList());
action(el('refresh'),'click',() => refreshList());
action(el('more'),'click',() => load(true));

let role = '';
let view = 'overview';
let generation = 0;
let data;
const titles = {overview:'Today',calls:'Calls',meetings:'Meetings',projects:'Projects',money:'Payments'};
const stages = ['Quoted','Accepted','In build','In review','Approved','Live'];
const money = value => new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(value);
const stamp = value => new Date(value).toLocaleString('en-ZA',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
function localDay(date=new Date()) {
  return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10);
}
function resetWorkspace() {
  role = '';
  el('growth').textContent='';
  generation++;
  data = null;
  el('page-title').textContent = 'Staff sign in';
  for (const id of Object.keys(titles)) el(id).hidden = true;
  for (const id of ['metrics','agenda','pipeline','balances','meeting-list','project-list','payments-list','tabs']) el(id).replaceChildren();
  for (const id of ['quote','book','payment']) {
    el(id).reset();
    delete el(id).dataset.id;
    el(id).querySelector('select').replaceChildren();
  }
}
function command(label, task) {
  const button = node('button',label);
  button.type = 'button';
  action(button,'click',task);
  return button;
}
async function enterWorkspace() {
  el('page-title').textContent = role === 'owner' ? 'Owner dashboard' : 'Sales dashboard';
  el('workdate').textContent = new Date().toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long'});
  el('tabs').replaceChildren();
  for (const [id,label] of Object.entries(titles)) {
    if (role !== 'owner' && ['projects','money'].includes(id)) continue;
    const button = command(label,()=>navigate(id));
    button.dataset.view = id;
    el('tabs').append(button);
  }
  el('tabs').append(command('Refresh',()=>navigate(view)));
  await navigate('overview');
}
async function allRows(table,columns='*') {
  const rows = [];
  while (true) {
    const batch = await request('/rest/v1/'+table+'?order=id&select='+columns+'&limit=200&offset='+rows.length);
    rows.push(...batch);
    if (batch.length < 200) return rows;
  }
}
async function navigate(id,filter) {
  if (!role || (['projects','money'].includes(id) && role!=='owner')) return;
  const current = ++generation;
  view = id;
  for (const section of Object.keys(titles)) el(section).hidden = section !== id;
  for (const button of el('tabs').querySelectorAll('[data-view]')) button.setAttribute('aria-pressed',String(button.dataset.view===id));
  if (id === 'calls') {
    if (filter) el('filter').value = filter;
    await refreshList();
    return;
  }
  message('Updating dashboard…');
  try {
    const [leads,meetings,projects,payments] = await Promise.all([
      allRows('call_leads','id,business,status,callback_at'),allRows('agency_meetings'),
      role==='owner'?allRows('agency_projects'):[],role==='owner'?allRows('agency_payments'):[]
    ]);
    if (current!==generation) return;
    data={leads,meetings,projects,payments};
    message('');
    renderWorkspace();
  } catch {
    if (current===generation) message('Dashboard could not refresh. Tap Refresh to retry.');
  }
}
async function startForLead(page,formId,leadId) {
  await navigate(page);
  if (!role || view!==page) return;
  const form=el(formId);
  form.elements.lead_id.value=leadId;
  form.closest('details').open=true;
  form.scrollIntoView({block:'center'});
}
function fillSelect(select,items,label) {
  const selected=select.value;
  select.replaceChildren(new Option('Select…',''));
  for (const item of items) select.add(new Option(label(item),item.id));
  select.value=items.some(item=>item.id===selected)?selected:'';
}
function business(id) { return data.leads.find(l=>l.id===id)?.business || 'Business'; }
function paid(project) { return data.payments.filter(p=>p.project_id===project.id).reduce((sum,p)=>sum+Math.round(Number(p.amount)*100),0)/100; }
function total(project) { return Number(project.build_fee)+Number(project.extras); }
function deposit(project) { return Math.round(Number(project.build_fee)*50)/100+Number(project.extras); }
function entry(title,description) {
  const row=node('article','');
  row.append(node('h3',title),node('p',description));
  return row;
}
function empty(id,copy) { if (!el(id).childElementCount) el(id).append(node('p',copy)); }
function renderWorkspace() {
  const {leads,meetings,projects,payments}=data;
  leads.sort((a,b)=>a.business.localeCompare(b.business));
  meetings.sort((a,b)=>a.starts_at.localeCompare(b.starts_at));
  projects.sort((a,b)=>b.created_at.localeCompare(a.created_at));
  fillSelect(el('book').elements.lead_id,leads,l=>l.business);
  if (role==='owner') {
    fillSelect(el('quote').elements.lead_id,leads,l=>l.business);
    fillSelect(el('payment').elements.project_id,projects,p=>business(p.lead_id)+' · '+p.title);
    if (!el('payment').elements.received_at.value) el('payment').elements.received_at.value=localDay();
  }
  if (view==='overview') drawToday();
  if (view==='meetings') {
    el('meeting-list').replaceChildren();
    for (const m of meetings) {
      const row=entry(business(m.lead_id),stamp(m.starts_at)+' · '+(m.completed?'Completed':'Scheduled')+'\n'+m.notes);
      row.append(command(m.completed?'Reopen meeting':'Mark complete',async()=>{
        await request('/rest/v1/agency_meetings?id=eq.'+m.id,'PATCH',{completed:!m.completed});
        await navigate('meetings');
      }));
      el('meeting-list').append(row);
    }
    empty('meeting-list','Scheduled meetings will appear here. Add a business in Call queue to book its first meeting.');
  }
  if (view==='projects') {
    el('project-list').replaceChildren();
    for (const p of projects) {
      const row=entry(p.title,business(p.lead_id)+' · '+p.stage+'\n'+p.scope);
      row.append(node('p','Quote '+money(total(p))+' · Upfront '+money(deposit(p))+' · Monthly '+money(p.monthly)));
      const form=node('form',''), label=node('label','Project stage'), select=document.createElement('select');
      for (const stage of stages) select.add(new Option(stage,stage));
      select.value=p.stage;label.append(select);
      const renewal=node('label','Domain renewal'),date=document.createElement('input');
      date.type='date'; date.value=p.renewal || '';renewal.append(date);
      form.append(label,renewal,node('button','Save changes'));
      action(form,'submit',async()=>{
        const match=new URLSearchParams({id:'eq.'+p.id,stage:'eq.'+p.stage,renewal:p.renewal?'eq.'+p.renewal:'is.null',select:'id'});
        const rows=await request('/rest/v1/agency_projects?'+match,'PATCH',{stage:select.value,renewal:date.value||null},'return=representation');
        await navigate('projects');
        if (!rows.length) message('Project changed on another device. Review the latest details.');
      });
      row.append(form);el('project-list').append(row);
    }
    empty('project-list','Create your first quote for a business from the call queue.');
  }
  if (view==='money') {
    el('balances').replaceChildren();el('payments-list').replaceChildren();
    for (const p of projects) el('balances').append(entry(p.title,'Received '+money(paid(p))+' · Balance '+money(total(p)-paid(p))+' · Upfront still due '+money(Math.max(0,deposit(p)-paid(p)))));
    for (const pay of payments.slice().sort((a,b)=>b.received_at.localeCompare(a.received_at))) {
      const p=projects.find(p=>p.id===pay.project_id);
      el('payments-list').append(entry(money(pay.amount)+' · '+(p?.title||'Project'),pay.received_at+' · '+pay.reference));
    }
    empty('payments-list','Recorded EFTs and deposits will appear here.');
  }
}
function drawToday() {
  const {leads,meetings,projects}=data;
  const callbacks=leads.filter(l=>l.status==='callback').sort((a,b)=>a.callback_at.localeCompare(b.callback_at));
  const due=callbacks.filter(l=>Date.parse(l.callback_at)<=Date.now());
  const open=meetings.filter(m=>!m.completed);
  const count=status=>leads.filter(l=>l.status===status).length;
  const calls=due.length+count('new');
  const awaiting=projects.filter(p=>p.stage==='Accepted' && paid(p)<deposit(p));
  const owner=role==='owner';
  el('hero-title').textContent=owner?'Agency overview':'Sales desk';
  const priority=owner&&awaiting.length?'payments':due.length?'callback':calls?'queue':open.length?'meetings':'queue';
  const actions={
    payments:[awaiting.length+(awaiting.length===1?' project needs a deposit.':' projects need deposits.'),'Review deposits','money'],
    callback:[due.length+(due.length===1?' callback is due now.':' callbacks are due now.'),'View calls due','calls','queue'],
    queue:[calls?calls+(calls===1?' business is ready to call.':' businesses are ready to call.'):'Your call list is clear. Add a business when you’re ready.','Open call list','calls','queue'],
    meetings:['Next meeting: '+(open[0]?business(open[0].lead_id):'')+'.','View meetings','meetings']
  };
  const [description,label,destination,filter]=actions[priority];
  el('priority').textContent=description;
  const primary=command(label+' →',()=>navigate(destination,filter));primary.id='primary';el('primary').replaceWith(primary);
  const metrics=[['To call',calls,'calls','queue'],['Callbacks',callbacks.length,'calls','callback'],['Meetings',open.length,'meetings']];
  if(owner) metrics.push(['Active projects',projects.filter(p=>!['Quoted','Live'].includes(p.stage)).length,'projects']);
  else metrics.push(['Interested',count('approved'),'calls','approved']);
  el('metrics').replaceChildren();
  for(const [name,value,page,choice] of metrics) {
    const tile=command('',()=>navigate(page,choice));tile.append(node('strong',String(value)),node('span',name+' ↗'));el('metrics').append(tile);
  }
  el('agenda').replaceChildren();
  const agenda=[...callbacks.map(l=>[l.callback_at,business(l.id),'Callback','calls','callback']),...open.map(m=>[m.starts_at,business(m.lead_id),'Meeting','meetings'])];
  if(owner) for(const p of projects.filter(p=>p.renewal)) agenda.push([p.renewal+'T09:00:00',p.title,'Domain renewal','projects']);
  for(const [when,name,kind,page,choice] of agenda.sort((a,b)=>Date.parse(a[0])-Date.parse(b[0])).slice(0,6)) {
    el('agenda').append(command(kind+' · '+name+' · '+stamp(when),()=>navigate(page,choice)));
  }
  empty('agenda','Your callbacks and meetings will appear here.');
  const reviewed=count('approved')+count('declined');
  el('growth').textContent=reviewed
    ? count('approved')+' of '+reviewed+' businesses with a decision were interested ('+Math.round(100*count('approved')/reviewed)+'%).'
    : 'Record a call outcome to start tracking interest.';
  if(owner && projects.length) {
    const live=projects.filter(p=>p.stage==='Live');
    el('growth').textContent+=' Live monthly care: '+money(live.reduce((sum,p)=>sum+Number(p.monthly),0))+'.';
  }
  el('pipeline').replaceChildren();
  for(const status of ['new','callback','approved','declined']) {
    const n=count(status),row=command('',()=>navigate('calls',status));
    row.append(node('span',statusNames[status]),node('b',String(n)));
    const meter=document.createElement('progress');meter.max=Math.max(1,leads.length);meter.value=n;row.append(meter);el('pipeline').append(row);
  }
}
for(const [formId,table,page] of [['book','agency_meetings','meetings'],['quote','agency_projects','projects'],['payment','agency_payments','money']]) {
  const form=el(formId);
  action(form,'submit',async()=>{
    const fields=Object.fromEntries(new FormData(form));
    if(formId==='book') fields.starts_at=new Date(fields.starts_at).toISOString();
    if(formId==='quote') fields.renewal=fields.renewal || null;
    const id=form.dataset.id ||= crypto.randomUUID();
    const prior=await request('/rest/v1/'+table+'?select=id&id=eq.'+id);
    if(!prior.length) await request('/rest/v1/'+table,'POST',{...fields,id});
    form.reset();delete form.dataset.id;form.closest('details').open=false;
    await navigate(page);
  });
}
resume().catch(error=>{signedIn(false);message(error.message);});
