import {projectUrl, publishableKey} from './config.js';
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.119.2';

const el = id => document.getElementById(id);
const message = words => { el('message').textContent = words; };
const statusNames = {new:'New', callback:'Call back', approved:'Interested', declined:'Not interested'};
let token = '';
let offset = 0;
let revision = 0;

const sessionKey = 'alienway.staff.session';
const authClient = createClient(projectUrl,publishableKey,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});
let expiryTimer;
let mfaPending = null;
let authEpoch = 0;
let localSignOutPromise = Promise.resolve();
function signOutLocally() {
  localSignOutPromise = localSignOutPromise
    .catch(()=>{})
    .then(()=>authClient.auth.signOut({scope:'local'}))
    .catch(()=>{});
  return localSignOutPromise;
}
const passwordToggles = document.querySelectorAll('.password-toggle input');
function syncPasswordVisibility(toggle) {
  el(toggle.getAttribute('aria-controls')).type = toggle.checked ? 'text' : 'password';
}
for (const toggle of passwordToggles) {
  toggle.addEventListener('change', () => syncPasswordVisibility(toggle));
}
function screen(name) {
  for (const toggle of passwordToggles) {
    toggle.checked = false;
    syncPasswordVisibility(toggle);
  }
  for (const id of ['login','send','verify','choose','recovery-mfa']) el(id).hidden = id !== name;
}
function clearMfaTransient() {
  mfaPending = null;
  el('mfa-code-form').reset();
  el('mfa-code-form').hidden = true;
  el('mfa-setup-details').hidden = true;
  el('mfa-qr').removeAttribute('src');
  el('mfa-secret').textContent = '';
  el('recovery-mfa').reset();
}
function clearMfaUi() {
  clearMfaTransient();
  el('mfa-start').hidden = false;
  el('mfa-challenge-start').hidden = true;
  el('mfa-status').textContent = 'Sign in to check authenticator status.';
}
async function abortIfSignedOut(epoch) {
  if (epoch === authEpoch) return;
  await signOutLocally();
  token = '';
  sessionStorage.removeItem(sessionKey);
  clearMfaUi();
  throw Error('You were signed out during verification. Sign in again.');
}
function signedIn(active) {
  screen(active ? '' : 'login');
  el('desk').hidden = !active;
  el('logout').hidden = !active;
  el('login').hidden = active;
  if (!active) {
    authEpoch++;
    clearMfaUi();
    clearTimeout(expiryTimer);
    sessionStorage.removeItem(sessionKey);
    void signOutLocally();
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
  if (!response.ok && path === '/auth/v1/user' && method === 'PUT' && (response.status === 401 || response.status === 403)) {
    const details = await response.clone().json().catch(()=>({}));
    if (details.code === 'insufficient_aal' || /insufficient.?aal/i.test(details.msg || details.message || '')) {
      throw Error('Verify your authenticator before saving a new password.');
    }
  }
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

function deleteBusinessButton(business) {
  return command('Delete business', async () => {
    if (!window.confirm('Permanently delete ' + business.business + ' and its call notes?')) return;
    const result = await request('/rest/v1/rpc/delete_business', 'POST', {
      business_id: business.id, expected_updated_at: business.updated_at
    });
    if (result === 'linked_history') {
      message('This business has a meeting, quote, project or package on record. Its history has been kept.');
      return;
    }
    const feedback = result === 'deleted' ? business.business + ' deleted.' : 'The business changed or was already removed. Check the refreshed list.';
    if (view === 'calls') await refreshList(feedback);
    else if (view === 'clients') {
      await navigate('clients');
      if (!el('message').textContent) message(feedback);
    }
  });
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
  if (role === 'owner') card.append(deleteBusinessButton(lead));
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
  const params = new URLSearchParams({select:'*',is_client:'eq.false',order:'callback_at.asc.nullslast,created_at.asc,business.asc,id.asc',limit:'51',offset:String(start)});
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

function verifiedTotp(factors) {
  return (factors?.totp || []).find(factor => factor.status === 'verified') || null;
}
async function refreshMfaStatus() {
  const [{data:aal,error:aalError},{data:factors,error:factorError}] = await Promise.all([
    authClient.auth.mfa.getAuthenticatorAssuranceLevel(),
    authClient.auth.mfa.listFactors()
  ]);
  if(aalError) throw Error(aalError.message || 'Could not check the MFA session.');
  if(factorError) throw Error(factorError.message || 'Could not list authenticator factors.');
  const factor = verifiedTotp(factors);
  el('mfa-status').textContent = !factor
    ? 'No verified authenticator is enrolled. Set one up before sending staff invitations.'
    : aal.currentLevel === 'aal2'
      ? 'Authenticator verified for this session. Staff invitations are unlocked.'
      : 'Authenticator enrolled. Verify a fresh code before sending staff invitations.';
  el('mfa-start').hidden = Boolean(factor);
  el('mfa-challenge-start').hidden = !factor || aal.currentLevel === 'aal2';
  return {aal,factor};
}
async function beginMfaEnrollment() {
  const epoch = authEpoch;
  const {data:factors,error:listError} = await authClient.auth.mfa.listFactors();
  await abortIfSignedOut(epoch);
  if(listError) throw Error(listError.message || 'Could not check existing authenticator setup.');
  const abandoned = (factors?.totp || []).filter(factor =>
    factor.status === 'unverified' && factor.friendly_name === 'Alienway Production Owner'
  );
  for (const factor of abandoned) {
    const {error:removeError} = await authClient.auth.mfa.unenroll({factorId:factor.id});
    await abortIfSignedOut(epoch);
    if(removeError) throw Error(removeError.message || 'Could not clear an unfinished authenticator setup.');
  }
  const {data,error} = await authClient.auth.mfa.enroll({
    factorType:'totp',
    friendlyName:'Alienway Production Owner'
  });
  await abortIfSignedOut(epoch);
  if(error || !data?.id || !data?.totp?.qr_code) throw Error(error?.message || 'Could not start authenticator setup.');
  const challenge = await authClient.auth.mfa.challenge({factorId:data.id});
  await abortIfSignedOut(epoch);
  if(challenge.error || !challenge.data?.id) throw Error(challenge.error?.message || 'Could not start authenticator verification.');
  mfaPending = {factorId:data.id,challengeId:challenge.data.id,kind:'enroll'};
  el('mfa-qr').src = data.totp.qr_code;
  el('mfa-secret').textContent = data.totp.secret;
  el('mfa-setup-details').hidden = false;
  el('mfa-code-form').hidden = false;
  el('mfa-start').hidden = true;
  el('mfa-challenge-start').hidden = true;
  el('mfa-code-form').elements.code.focus();
}
async function beginMfaChallenge(factorId, kind = 'challenge') {
  const epoch = authEpoch;
  const challenge = await authClient.auth.mfa.challenge({factorId});
  await abortIfSignedOut(epoch);
  if(challenge.error || !challenge.data?.id) throw Error(challenge.error?.message || 'Could not start authenticator verification.');
  mfaPending = {factorId,challengeId:challenge.data.id,kind};
  if (kind === 'recovery') {
    screen('recovery-mfa');
    el('recovery-mfa').elements.code.focus();
    return;
  }
  el('mfa-setup-details').hidden = true;
  el('mfa-code-form').hidden = false;
  el('mfa-start').hidden = true;
  el('mfa-challenge-start').hidden = true;
  el('mfa-code-form').elements.code.focus();
}
async function ensureAal2ForInvite() {
  const {data:aal,error:aalError} = await authClient.auth.mfa.getAuthenticatorAssuranceLevel();
  if(aalError) throw Error(aalError.message || 'Could not verify your security level.');
  if(aal.currentLevel === 'aal2') return;
  const {data:factors,error:factorError} = await authClient.auth.mfa.listFactors();
  if(factorError) throw Error(factorError.message || 'Could not check your authenticator.');
  const factor = verifiedTotp(factors);
  if(!factor) {
    await beginMfaEnrollment();
    throw Error('Scan the QR code with an authenticator app, then enter its six-digit code below.');
  }
  await beginMfaChallenge(factor.id);
  throw Error('Enter the six-digit code from your authenticator app to unlock staff invitations.');
}
action(el('mfa-start'),'click',async()=>{
  await beginMfaEnrollment();
  message('Scan the QR code with an authenticator app. Keep the setup key private.');
});
action(el('mfa-challenge-start'),'click',async()=>{
  const {factor} = await refreshMfaStatus();
  if(!factor) throw Error('Set up an authenticator first.');
  await beginMfaChallenge(factor.id);
  message('Enter the six-digit code from your authenticator app.');
});
async function verifyPendingMfa(code) {
  if(!mfaPending) throw Error('Start authenticator setup or verification first.');
  const epoch = authEpoch;
  const pending = {...mfaPending};
  const {error} = await authClient.auth.mfa.verify({
    factorId:pending.factorId,
    challengeId:pending.challengeId,
    code
  });
  await abortIfSignedOut(epoch);
  if(error) {
    const expired = error.code === 'challenge_expired' || error.code === 'mfa_challenge_expired' || /challenge.{0,30}expired|expired.{0,30}challenge/i.test(error.message || '');
    if(expired) {
      const challenge = await authClient.auth.mfa.challenge({factorId:pending.factorId});
      await abortIfSignedOut(epoch);
      if(challenge.error || !challenge.data?.id) throw Error(challenge.error?.message || 'The verification request expired and a new one could not be started. Please try again.');
      mfaPending = {...pending,challengeId:challenge.data.id};
      const codeField = pending.kind === 'recovery'
        ? el('recovery-mfa').elements.code
        : el('mfa-code-form').elements.code;
      codeField.value = '';
      throw Error('That verification request expired. A fresh challenge is ready; enter the latest six-digit code.');
    }
    throw Error(error.message || 'That authenticator code could not be verified.');
  }
  await syncAuthSession();
  await abortIfSignedOut(epoch);
  const {data:aal,error:aalError} = await authClient.auth.mfa.getAuthenticatorAssuranceLevel();
  await abortIfSignedOut(epoch);
  if(aalError || aal.currentLevel !== 'aal2') throw Error('The code was accepted but the session did not reach MFA level. Sign in again and retry.');
  return pending.kind;
}
action(el('mfa-code-form'),'submit',async()=>{
  const kind = await verifyPendingMfa(el('mfa-code-form').elements.code.value.trim());
  if(kind === 'recovery') throw Error('Use the recovery verification form to finish setting your password.');
  clearMfaTransient();
  await refreshMfaStatus();
  message('MFA verified for this session. You can now send the staff invitation.');
});
action(el('recovery-mfa'),'submit',async()=>{
  const kind = await verifyPendingMfa(el('recovery-mfa').elements.code.value.trim());
  if(kind !== 'recovery') throw Error('This verification request is no longer active. Start the password recovery process again.');
  clearMfaTransient();
  screen('choose');
  el('choose').elements.password.focus();
  message('Authenticator verified. You can now choose your new password.');
});

async function persistAuthSession(session) {
  if (!session?.access_token || !session?.refresh_token) throw Error('Your session needs a fresh sign-in. Please sign in again.');
  token = session.access_token;
  const expiresAt = (session.expires_at || (Date.now()/1000 + (session.expires_in || 3600))) * 1000;
  sessionStorage.setItem(sessionKey, JSON.stringify({
    accessToken:session.access_token,
    refreshToken:session.refresh_token,
    expiresAt
  }));
  clearTimeout(expiryTimer);
  expiryTimer = setTimeout(() => {
    signedIn(false);
    message('Session expired. Please sign in again.');
  }, Math.max(0,expiresAt-Date.now()));
}
async function syncAuthSession() {
  const {data,error} = await authClient.auth.getSession();
  if(error || !data.session) throw Error('Your secure session could not be refreshed. Sign in again.');
  await persistAuthSession(data.session);
}
async function openDesk(accessToken, refreshToken) {
  const epoch = authEpoch;
  try {
    if (!accessToken || !refreshToken) throw Error('Please sign in again to refresh your secure session.');
    await signOutLocally();
    await abortIfSignedOut(epoch);
    const {data:sessionData,error:sessionError} = await authClient.auth.setSession({
      access_token:accessToken,
      refresh_token:refreshToken
    });
    await abortIfSignedOut(epoch);
    if(sessionError || !sessionData.session) throw Error('Your session expired. Please sign in again.');
    await persistAuthSession(sessionData.session);
    await abortIfSignedOut(epoch);
    const user = await request('/auth/v1/user');
    await abortIfSignedOut(epoch);
    checkStaff(user);
    role = user.app_metadata.agency_role;
  } catch (error) {
    signedIn(false);
    throw error;
  }
  signedIn(true);
  await enterWorkspace();
}

action(el('login'),'submit',async () => {
  const fields = el('login').elements;
  const auth = await request('/auth/v1/token?grant_type=password','POST',{
    email:fields.email.value.trim(), password:fields.password.value
  });
  fields.password.value = '';
  await openDesk(auth.access_token, auth.refresh_token);
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
async function choosePassword(authSession) {
  const epoch = authEpoch;
  const accessToken = typeof authSession === 'string' ? authSession : authSession?.access_token;
  const refreshToken = typeof authSession === 'string' ? '' : authSession?.refresh_token;
  if (!accessToken || !refreshToken) throw Error('That setup session is incomplete. Request a fresh password setup email.');
  clearTimeout(expiryTimer);
  sessionStorage.removeItem(sessionKey);
  token = '';
  clearMfaUi();
  await signOutLocally();
  await abortIfSignedOut(epoch);
  const {data:sessionData,error:sessionError} = await authClient.auth.setSession({
    access_token:accessToken,
    refresh_token:refreshToken
  });
  await abortIfSignedOut(epoch);
  if(sessionError || !sessionData.session) throw Error('That setup session has expired. Request a fresh password setup email.');
  token = sessionData.session.access_token;
  try {
    const recoveryUser = await request('/auth/v1/user');
    await abortIfSignedOut(epoch);
    checkStaff(recoveryUser);
    const {data:factors,error:factorError} = await authClient.auth.mfa.listFactors();
    await abortIfSignedOut(epoch);
    if(factorError) throw Error(factorError.message || 'Could not check your authenticator before password setup.');
    const factor = verifiedTotp(factors);
    if(factor) {
      const {data:aal,error:aalError} = await authClient.auth.mfa.getAuthenticatorAssuranceLevel();
      await abortIfSignedOut(epoch);
      if(aalError) throw Error(aalError.message || 'Could not check your recovery session security level.');
      if(aal.currentLevel !== 'aal2') {
        await beginMfaChallenge(factor.id,'recovery');
        message('Your account has an authenticator. Enter its current six-digit code before choosing a new password.');
        return;
      }
    }
  } catch (error) {
    signedIn(false);
    throw error;
  }
  screen('choose');
  el('choose').elements.password.focus();
}
action(el('verify'),'submit',async () => {
  const epoch = authEpoch;
  const auth = await request('/auth/v1/verify','POST',{
    email:el('send').elements.email.value.trim(),token:el('verify').elements.token.value.trim(),type:'email'
  });
  await abortIfSignedOut(epoch);
  el('verify').reset();
  await choosePassword(auth);
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
action(el('staff-invite'),'submit',async () => {
  await ensureAal2ForInvite();
  const email = el('staff-invite').elements.email.value.trim();
  const response = await fetch(projectUrl + '/functions/v1/invite-staff', {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({email}),
    cache: 'no-store'
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(result.error || 'The invitation could not be sent. Please try again.');
  el('staff-invite').reset();
  message(result.message || 'Invitation sent.');
});
async function resume() {
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.has('access_token') || hash.has('error') || hash.has('error_code')) {
    history.replaceState(null,'',location.pathname + location.search);
    if (!hash.get('access_token')) throw Error('That email link expired. Request a fresh one.');
    await choosePassword({access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token')});
    return;
  }
  const saved = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
  if (saved && saved.expiresAt > Date.now() && saved.refreshToken) await openDesk(saved.accessToken,saved.refreshToken);
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
const titles = {overview:'Today',calls:'Calls',meetings:'Meetings',clients:'Clients',packages:'Packages',projects:'Projects',money:'Payments',staff:'Staff access'};
const stages = ['Quoted','Accepted','In build','In review','Approved','Live'];
const money = value => new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(value);
const stamp = value => new Date(value).toLocaleString('en-ZA',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
function localDay(date=new Date()) {
  return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10);
}
function resetWorkspace() {
  for(const id of ['client-list','package-list']) el(id).replaceChildren();
  for(const id of ['client-form','package-form','assign-form']) {
    const form=el(id);form.reset();delete form.dataset.id;
    for(const select of form.querySelectorAll('select')) select.replaceChildren();
  }
  el('client-search').value='';
  el('client-entry').hidden=true;
  mfaPending = null;
  el('mfa-code-form').reset();
  el('mfa-code-form').hidden = true;
  el('mfa-setup-details').hidden = true;
  el('mfa-qr').removeAttribute('src');
  el('mfa-secret').textContent = '';
  el('mfa-start').hidden = false;
  el('mfa-challenge-start').hidden = true;
  el('mfa-status').textContent = 'Sign in to check authenticator status.';
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
    if (role !== 'owner' && ['packages','projects','money','staff'].includes(id)) continue;
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
  if (!role || (['packages','projects','money','staff'].includes(id) && role!=='owner')) return;
  const current = ++generation;
  view = id;
  for (const section of Object.keys(titles)) el(section).hidden = section !== id;
  for (const button of el('tabs').querySelectorAll('[data-view]')) button.setAttribute('aria-pressed',String(button.dataset.view===id));
  if (id === 'staff') { message(''); await refreshMfaStatus(); return; }
  if (id === 'calls') {
    if (filter) el('filter').value = filter;
    await refreshList();
    return;
  }
  message('Updating dashboard…');
  try {
    const [leads,meetings,projects,payments] = await Promise.all([
      allRows('call_leads',id==='clients'?'id,business,phone,details,status,callback_at,is_client,updated_at':'id,business,status,callback_at,is_client'),allRows('agency_meetings'),
      role==='owner'?allRows('agency_projects'):[],role==='owner'?allRows('agency_payments'):[]
    ]);
    if (current!==generation) return;
    let catalogue=[],agreements=[],services=[];
    if(role==='owner' && ['clients','packages','projects'].includes(id)) {
      [catalogue,agreements]=await Promise.all([allRows('agency_packages'),id==='projects'?[]:allRows('client_packages')]);
    }
    if(current!==generation) return;
    if(role==='sales' && id==='clients') {
      for(let offset=0;;offset+=200) {
        const batch=await request('/rest/v1/rpc/client_service_summaries?order=client_id&limit=200&offset='+offset);
        services.push(...batch);if(batch.length<200) break;
      }
    }
    if(current!==generation) return;
    data={leads,meetings,projects,payments,catalogue,agreements,services};
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
  if (view==='clients' || view==='packages') drawClientWorkspace();
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
    fillSelect(el('quote-package'),data.catalogue,p=>p.name+' · '+money(p.setup_fee));
    el('quote-package').options[0].textContent='Custom quote';
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
  const callbacks=leads.filter(l=>!l.is_client && l.status==='callback').sort((a,b)=>a.callback_at.localeCompare(b.callback_at));
  const due=callbacks.filter(l=>Date.parse(l.callback_at)<=Date.now());
  const open=meetings.filter(m=>!m.completed);
  const count=status=>leads.filter(l=>!l.is_client && l.status===status).length;
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
el('quote-package').addEventListener('change',event=>{
  const offer=data?.catalogue.find(item=>item.id===event.target.value);
  if (!offer) return;
  const fields=el('quote').elements;
  fields.title.value=offer.name;
  fields.scope.value=offer.inclusions;
  fields.build_fee.value=offer.setup_fee;
  fields.monthly.value=offer.monthly_fee;
});
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
function contactMode() {
  const form=el('client-form'), manual=!form.elements.existing.value;
  el('client-contact').hidden=!manual;
  for(const field of el('client-contact').querySelectorAll('input,textarea')) field.disabled=!manual;
}
function packagePrice(offer,agreement) {
  const once=Number(offer.setup_fee)+Number(agreement?.extra_once||0);
  const monthly=Number(offer.monthly_fee)+Number(agreement?.extra_monthly||0);
  return money(once)+' once-off · '+money(monthly)+' per month';
}
function drawClientWorkspace() {
  const owner=role==='owner';
  const clients=data.leads.filter(l=>l.is_client);
  if(view==='packages') {
    const assign=el('assign-form').elements;
    fillSelect(assign.client_id,clients,l=>l.business);
    fillSelect(assign.package_id,data.catalogue,p=>p.name+' · '+money(p.monthly_fee)+'/month');
    if(!assign.starts_on.value) assign.starts_on.value=localDay();
    el('package-list').replaceChildren();
    for(const offer of data.catalogue.slice().sort((a,b)=>a.name.localeCompare(b.name))) {
      el('package-list').append(entry(offer.name,packagePrice(offer)+'\n'+offer.inclusions));
    }
    empty('package-list','Create a package with your agreed services and prices, then assign it to a client.');
    return;
  }
  el('client-entry').hidden=!owner;
  if(owner) {
    const select=el('client-form').elements.existing;
    fillSelect(select,data.leads.filter(l=>!l.is_client),l=>l.business);
    select.options[0].text='Enter a new business';
    contactMode();
  }
  const query=el('client-search').value.trim().toLowerCase();
  el('client-list').replaceChildren();
  for(const client of clients.filter(l=>(l.business+' '+l.phone).toLowerCase().includes(query))) {
    const row=document.createElement('details');
    row.append(node('summary',client.business));
    const dial=node('a','Call '+client.phone);
    dial.className='dial';dial.href='tel:'+client.phone;
    row.append(dial,node('p',client.details));
    row.append(command('Book meeting',()=>startForLead('meetings','book',client.id)));
    if(!owner) {
      const service=data.services.find(s=>s.client_id===client.id);
      row.append(entry(service?.package_name || 'No active package',service?[service.inclusions,service.addons].filter(Boolean).join('\n'):''));
    }
    if(owner) {
      const history=data.agreements.filter(a=>a.client_id===client.id).sort((a,b)=>b.starts_on.localeCompare(a.starts_on));
      const active=history.find(a=>a.starts_on<=localDay());
      row.append(node('h3','Package agreement'));
      if(!active) row.append(node('p','No active package.'));
      for(const agreement of history) {
        const offer=data.catalogue.find(p=>p.id===agreement.package_id);
        if(!offer) continue;
        const state=agreement===active?'Active':agreement.starts_on>localDay()?'Scheduled':'Previous';
        row.append(entry(offer.name,state+' from '+agreement.starts_on+'\n'+packagePrice(offer,agreement)+'\n'+offer.inclusions+(agreement.addons?'\nAdd-ons: '+agreement.addons:'')));
      }
      row.append(command(active?'Change package':'Assign package',async()=>{
        await navigate('packages');
        if(view!=='packages'||role!=='owner'||!data?.catalogue) return;
        if(!data.catalogue.length) {
          el('package-form').closest('details').open=true;el('package-form').elements.name.focus();
          message('Create your first package, then assign it to this client.');return;
        }
        el('assignment').open=true;el('assign-form').elements.client_id.value=client.id;el('assign-form').elements.package_id.focus();
      }));
      for(const project of data.projects.filter(p=>p.lead_id===client.id)) row.append(entry(project.title,project.stage+' · Balance '+money(total(project)-paid(project))));
    }
    if (owner) row.append(deleteBusinessButton(client));
    el('client-list').append(row);
  }
  empty('client-list',query?'No matching clients.':owner?'Add an existing client or accept a project quote to start your client list.':'Your existing clients will appear here.');
}
el('client-form').elements.existing.addEventListener('change',contactMode);
el('client-search').addEventListener('input',()=>{if(data && view==='clients') drawClientWorkspace();});
action(el('client-form'),'submit',async()=>{
  const form=el('client-form'), fields=form.elements;
  const existing=fields.existing.value;
  const payload={business_id:existing || (form.dataset.id ||=crypto.randomUUID())};
  if(!existing) {
    const phone=fields.phone.value.replace(/[\s().-]/g,'');
    if(!/^\+?\d{7,15}$/.test(phone)) throw Error('Enter a valid contact number.');
    Object.assign(payload,{business_name:fields.business.value.trim(),contact_phone:phone,contact_notes:fields.notes.value.trim()});
  }
  await request('/rest/v1/rpc/save_agency_client','POST',payload);
  form.reset();delete form.dataset.id;el('client-entry').open=false;el('client-search').value='';
  await navigate('clients');
});
for(const [formId,table] of [['package-form','agency_packages'],['assign-form','client_packages']]) {
  const form=el(formId);
  action(form,'submit',async()=>{
    const values=Object.fromEntries(new FormData(form));
    const id=form.dataset.id ||=crypto.randomUUID();
    const saved=await request('/rest/v1/'+table+'?select=id&id=eq.'+id);
    if(!saved.length) {
      if(formId==='assign-form') {
        const existing=await request('/rest/v1/client_packages?select=id&client_id=eq.'+values.client_id+'&starts_on=eq.'+values.starts_on);
        if(existing.length) throw Error('This client already has an agreement starting on that date. Choose the date the new terms begin.');
      }
      await request('/rest/v1/'+table,'POST',{id,...values});
    }
    form.reset();delete form.dataset.id;form.closest('details').open=false;
    await navigate(formId==='assign-form'?'clients':'packages');
  });
}
if (location.hostname === 'alienway.co.za') {
  resume().catch(error=>{signedIn(false);message(error.message);});
} else {
  signedIn(false);
  el('login').hidden = true;
  message('The staff workspace is available only on the official Alienway domain.');
}
