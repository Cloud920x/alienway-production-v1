(() => {
  const $ = id => document.getElementById(id);
  const access = {owner:['overview','projects','team','materials','finance','clients'],manager:['overview','projects','team','materials','clients'],employee:['projects'],store:['materials'],client:['clients']};
  const names = {owner:'Jordan Mitchell',manager:'Alex Daniels',employee:'Jamie Williams',store:'Chris Mokoena',client:'Taylor Morgan'};
  const views = [...document.querySelectorAll('.view')];
  const nav = [...document.querySelectorAll('[data-view]')];
  let role = 'owner', action = '', lowOnly = false, timer;
  function toast(message) {
    const el = $('toast'); el.textContent = message; el.style.opacity = '1'; el.style.transform = 'translate(-50%,0)';
    clearTimeout(timer); timer = setTimeout(() => {el.style.opacity='0';}, 5000);
  }
  function showView(id) {
    if (!access[role].includes(id)) return;
    views.forEach(v => v.classList.toggle('active', v.id === id));
    nav.forEach(n => n.classList.toggle('active', n.dataset.view === id));
    $('crumb').textContent = nav.find(n=>n.dataset.view===id).textContent.replace(/^[^A-Za-z]+/,'');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  // Mark financial summaries and project budgets as owner-only presentation.
  const budgetCard = document.querySelector('#overview .stats .stat:nth-child(3)');
  budgetCard.dataset.ownerOnly = '';
  document.querySelector('#overview .middle > :last-child').dataset.ownerOnly = '';
  document.querySelectorAll('#materials .stats .stat:nth-child(n+3), #projectTable tr > :nth-child(4)').forEach(e=>e.dataset.ownerOnly='');
  function applyRole() {
    role = $('role').value;
    document.querySelector('.profile b').textContent=names[role];
    document.querySelector('.profile small').textContent=role+' · Demo';
    document.querySelector('#overview h1').textContent='Welcome, '+names[role].split(' ')[0]+'.';
    nav.forEach(n=>n.hidden=!access[role].includes(n.dataset.view));
    document.querySelectorAll('[data-go]').forEach(n=>n.hidden=!access[role].includes(n.dataset.go));
    document.querySelectorAll('[data-owner-only]').forEach(n=>n.hidden=role!=='owner');
    document.querySelectorAll('[data-action]').forEach(n=>n.hidden=!canEdit(n.dataset.action));
    showView(access[role][0]);
  }
  function canEdit(kind) {
    return role==='owner' || (role==='manager' && ['project','team','stock','client'].includes(kind)) || (role==='store' && kind==='stock');
  }
  nav.forEach(n=>n.addEventListener('click',()=>showView(n.dataset.view)));
  document.querySelectorAll('[data-go]').forEach(n=>n.addEventListener('click',()=>showView(n.dataset.go)));
  $('role').addEventListener('change',applyRole);
  function filterProjects() {
    const q=document.querySelector('[data-filter="projectTable"]').value.toLowerCase();
    [...$('projectTable').tBodies[0].rows].forEach(row=>row.hidden=!(row.textContent.toLowerCase().includes(q)&&(!$('projectStatus').value||row.cells[4].textContent===$('projectStatus').value)));
  }
  function filterStock() {
    const q=document.querySelector('[data-filter="stockTable"]').value.toLowerCase();
    [...$('stockTable').tBodies[0].rows].forEach(row=>row.hidden=!(row.textContent.toLowerCase().includes(q)&&(!$('stockLocation').value||row.cells[1].textContent===$('stockLocation').value)&&(!lowOnly||row.cells[4].textContent==='Reorder')));
  }
  document.querySelector('[data-filter="projectTable"]').addEventListener('input',filterProjects);
  document.querySelector('[data-filter="stockTable"]').addEventListener('input',filterStock);
  $('projectStatus').addEventListener('change',filterProjects);$('stockLocation').addEventListener('change',filterStock);
  $('lowStock').addEventListener('click',()=>{lowOnly=!lowOnly;$('lowStock').setAttribute('aria-pressed',String(lowOnly));filterStock();});
  document.querySelectorAll('.task').forEach((t,i)=>{const input=t.querySelector('input');input.id='task-'+i;t.querySelector('label').htmlFor=input.id;input.addEventListener('change',()=>t.classList.toggle('done',input.checked));});
  $('resetTasks').addEventListener('click',()=>{document.querySelectorAll('.task').forEach(t=>{t.querySelector('input').checked=false;t.classList.remove('done');});toast('Sample task list reset.');});
  document.querySelector('.notify').addEventListener('click',()=>toast('Sample alerts: 3 materials need reordering; Claremont has a material delay; 3 client decisions await approval.'));
  const schemas = {
    project: {title:'Add sample project',fields:[['name','Project name'],['manager','Manager'],['budget','Budget (R)','number'],['status','Status',['Planning','On track','Material delay','Finishing']]]},
    team: {title:'Add sample team member',fields:[['name','Name'],['role','Role',['Project manager','Site supervisor','Storekeeper','Field team']],['site','Assigned site']]},
    stock: {title:'Record sample stock',fields:[['name','Material'],['location','Location',['Central store','Sea Point site','Claremont site','Constantia site']],['quantity','Quantity','number'],['unit','Unit'],['minimum','Reorder level','number']]},
    expense: {title:'Record sample expense',fields:[['project','Project'],['description','Description'],['amount','Amount (R)','number']]},
    client: {title:'Add sample client',fields:[['name','Client name'],['project','Project'],['update','Approved update']]}
  };
  const dialog=$('entryDialog');
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{
    action=button.dataset.action;if(!canEdit(action))return;
    $('entryTitle').textContent=schemas[action].title;$('entryFields').replaceChildren();
    schemas[action].fields.forEach(([name,label,type])=>{
      if(action==='project'&&name==='budget'&&role!=='owner')return;
      const wrapper=document.createElement('label');wrapper.textContent=label;
      const input=document.createElement(Array.isArray(type)?'select':'input');input.name=name;input.required=true;
      if(Array.isArray(type))type.forEach(text=>input.add(new Option(text,text)));else{input.type=type||'text';if(type==='number'){input.min='0';input.max='1000000000';input.step='0.01';}else input.maxLength=160;}
      wrapper.append(input);$('entryFields').append(wrapper);
    });dialog.showModal();
  }));
  $('cancelEntry').addEventListener('click',()=>dialog.close());
  function addRow(table,values) {
    const row=table.tBodies[0].insertRow(0);values.forEach(value=>{row.insertCell().textContent=value;});return row;
  }
  function makeTable(container,id,headings) {
    if($(id))return $(id);
    const wrap=document.createElement('div');wrap.className='card panel table-wrap';wrap.style.marginTop='16px';
    const title=document.createElement('h2');title.textContent='Entries added in this demo session';wrap.append(title);
    const table=document.createElement('table');table.id=id;table.className='data-table';
    const row=table.createTHead().insertRow();headings.forEach(text=>{const th=document.createElement('th');th.textContent=text;row.append(th);});table.createTBody();wrap.append(table);container.append(wrap);return table;
  }
  const money=n=>'R '+Number(n).toLocaleString('en-ZA',{maximumFractionDigits:2});
  $('entryForm').addEventListener('submit',event=>{
    event.preventDefault();if(!canEdit(action))return;
    const d=Object.fromEntries(new FormData(event.target));
    if(action==='project') {
      const row=addRow($('projectTable'),[d.name,d.manager,'0%',d.budget?money(d.budget):'Not set',d.status]);row.cells[3].dataset.ownerOnly='';row.cells[3].hidden=role!=='owner';filterProjects();
    } else if(action==='team')addRow(document.querySelector('#team table'),[d.name,d.role,d.site,'Sample entry']);
    else if(action==='stock'){addRow($('stockTable'),[d.name,d.location,d.quantity+' '+d.unit,d.minimum+' '+d.unit,Number(d.quantity)<Number(d.minimum)?'Reorder':'Healthy']);filterStock();}
    else if(action==='expense')addRow(makeTable($('finance'),'demoExpenses',['Project','Description','Amount']),[d.project,d.description,money(d.amount)]);
    else if(action==='client')addRow(makeTable($('clients'),'demoClients',['Client','Project','Approved update']),[d.name,d.project,d.update]);
    dialog.close();toast('Sample entry added for this session. Overview figures remain an illustrative snapshot; no real records or invitations were sent.');
  });
  applyRole();
})();
