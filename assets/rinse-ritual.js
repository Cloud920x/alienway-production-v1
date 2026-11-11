
(function () {
  "use strict";

  const STORAGE_KEY = "rinseRitualDemo_v1";
  const SERVICES = [
    {id:"quick",name:"Quick Reset",price:149,duration:25,description:"Foam pre-wash, careful exterior hand wash, wheels and a clean dry-down."},
    {id:"signature",name:"Signature Hand Wash",price:259,duration:45,description:"Two-bucket hand wash, detailed wheels, clean glass and a hand-finished shine."},
    {id:"interior",name:"Interior Revival",price:389,duration:60,description:"Thorough vacuum, dash and trim care, refreshed mats and interior glass."},
    {id:"full",name:"Full Revival",price:699,duration:90,description:"A complete inside-and-out refresh with careful attention to detail."},
    {id:"ceramic",name:"Ceramic Shield",price:1490,duration:150,description:"Paint preparation finished with a ceramic spray sealant for added gloss."}
  ];
  const ADDONS = [
    {id:"petHair",name:"Pet-hair removal",price:90},
    {id:"engineBay",name:"Engine-bay refresh",price:120},
    {id:"odour",name:"Odour treatment",price:70},
    {id:"tyres",name:"Tyre dressing",price:45},
    {id:"childSeat",name:"Child-seat surface refresh",price:80}
  ];
  const MEMBERSHIP_DETAILS = {
    "Fresh Pass": {price:249,saving:49,items:["2 Quick Resets each month","10% off selected extras"]},
    "Ritual Plus": {price:649,saving:167,items:["2 Signature Hand Washes each month","2 Quick Resets each month","10% off selected extras"]},
    "All Access": {price:1099,saving:326,items:["4 Signature Hand Washes each month","1 Interior Revival each month","15% off selected extras"]}
  };
  const VEHICLES = {
    hatch:{label:"Hatchback / Compact",multiplier:.9},
    sedan:{label:"Sedan",multiplier:1},
    suv:{label:"SUV / Crossover",multiplier:1.25},
    bakkie:{label:"Bakkie / Double Cab",multiplier:1.3},
    van:{label:"Van / 7-Seater",multiplier:1.45}
  };
  const SLOTS = ["07:30","08:30","09:30","10:30","11:30","12:30","13:30","14:30","15:30","16:30"];
  const BAYS = ["Bay 01","Bay 02","Bay 03"];
  const OWNER_NAV = [
    {id:"overview",icon:"◫",label:"Overview"},
    {id:"live",icon:"◉",label:"Live wash board"},
    {id:"bookings",icon:"▤",label:"Bookings"},
    {id:"customers",icon:"♙",label:"Customers & members"},
    {id:"inventory",icon:"▦",label:"Stock & chemicals"},
    {id:"team",icon:"♧",label:"Team & wash bays"},
    {id:"reports",icon:"▥",label:"Revenue & reports"},
    {id:"settings",icon:"⚙",label:"Services & settings"}
  ];
  const MANAGER_NAV = OWNER_NAV.slice(0,4);
  const $ = function (selector, root) { return (root || document).querySelector(selector); };
  const $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };
  const money = function (amount) { return "R " + Math.round(Number(amount) || 0).toLocaleString("en-ZA"); };
  const escapeHTML = function (value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  };
  const dateKey = function (date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  };
  const offsetDate = function (offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return dateKey(d);
  };
  const prettyDate = function (value) {
    if (!value) return "—";
    const d = new Date(value + "T12:00:00");
    return d.toLocaleDateString("en-ZA", {day:"numeric",month:"short"});
  };
  const dateLabel = function (value) {
    if (!value) return "—";
    const d = new Date(value + "T12:00:00");
    return d.toLocaleDateString("en-ZA", {weekday:"short",day:"numeric",month:"short"});
  };
  const makeSeed = function () {
    return {
      bookings: [
        {id:"RR-26041",name:"Mia Jacobs",phone:"082 *** 0141",email:"",vehicle:"SUV",serviceId:"signature",serviceName:"Signature Hand Wash",date:offsetDate(0),time:"07:30",price:324,status:"completed",bay:"",createdAt:Date.now()-7200000},
        {id:"RR-26042",name:"Luca Daniels",phone:"082 *** 0142",email:"",vehicle:"Sedan",serviceId:"full",serviceName:"Full Revival",date:offsetDate(0),time:"08:30",price:699,status:"washing",bay:"Bay 02",createdAt:Date.now()-5400000},
        {id:"RR-26043",name:"Ava Petersen",phone:"082 *** 0143",email:"",vehicle:"Hatchback",serviceId:"quick",serviceName:"Quick Reset",date:offsetDate(0),time:"09:30",price:134,status:"checked-in",bay:"",createdAt:Date.now()-3600000},
        {id:"RR-26044",name:"Noah Williams",phone:"082 *** 0144",email:"",vehicle:"Bakkie",serviceId:"interior",serviceName:"Interior Revival",date:offsetDate(0),time:"10:30",price:506,status:"booked",bay:"",createdAt:Date.now()-1800000},
        {id:"RR-26045",name:"Zara Adams",phone:"082 *** 0145",email:"",vehicle:"Sedan",serviceId:"ceramic",serviceName:"Ceramic Shield",date:offsetDate(0),time:"13:30",price:1490,status:"ready",bay:"Bay 03",createdAt:Date.now()-900000},
        {id:"RR-26046",name:"Ethan Fortuin",phone:"082 *** 0146",email:"",vehicle:"SUV",serviceId:"signature",serviceName:"Signature Hand Wash",date:offsetDate(1),time:"09:30",price:324,status:"booked",bay:"",createdAt:Date.now()},
        {id:"RR-26047",name:"Amara Smith",phone:"082 *** 0147",email:"",vehicle:"Sedan",serviceId:"full",serviceName:"Full Revival",date:offsetDate(-1),time:"11:30",price:699,status:"completed",bay:"",createdAt:Date.now()-86400000},
        {id:"RR-26048",name:"Kai September",phone:"082 *** 0148",email:"",vehicle:"Hatchback",serviceId:"interior",serviceName:"Interior Revival",date:offsetDate(-2),time:"14:30",price:350,status:"completed",bay:"",createdAt:Date.now()-172800000},
        {id:"RR-26049",name:"Leah Botha",phone:"082 *** 0149",email:"",vehicle:"SUV",serviceId:"ceramic",serviceName:"Ceramic Shield",date:offsetDate(-3),time:"08:30",price:1863,status:"completed",bay:"",createdAt:Date.now()-259200000},
        {id:"RR-26050",name:"Mason Williams",phone:"082 *** 0150",email:"",vehicle:"Sedan",serviceId:"signature",serviceName:"Signature Hand Wash",date:offsetDate(-4),time:"10:30",price:259,status:"completed",bay:"",createdAt:Date.now()-345600000},
        {id:"RR-26051",name:"Isla Petersen",phone:"082 *** 0151",email:"",vehicle:"Bakkie",serviceId:"full",serviceName:"Full Revival",date:offsetDate(-5),time:"13:30",price:909,status:"completed",bay:"",createdAt:Date.now()-432000000},
        {id:"RR-26052",name:"Theo Jacobs",phone:"082 *** 0152",email:"",vehicle:"Sedan",serviceId:"quick",serviceName:"Quick Reset",date:offsetDate(-6),time:"15:30",price:149,status:"completed",bay:"",createdAt:Date.now()-518400000}
      ],
      inventory: [
        {id:"foam",name:"Snow foam concentrate",unit:"5L canisters",stock:8,min:4},
        {id:"shampoo",name:"pH-neutral shampoo",unit:"5L bottles",stock:3,min:5},
        {id:"microfiber",name:"Microfibre towels",unit:"packs of 10",stock:12,min:4},
        {id:"tyre",name:"Tyre dressing",unit:"1L bottles",stock:2,min:4},
        {id:"interior",name:"Interior cleaner",unit:"1L bottles",stock:7,min:3},
        {id:"ceramic",name:"Ceramic spray sealant",unit:"500ml bottles",stock:4,min:3}
      ],
      staff: [
        {id:"staff1",name:"Jordan Adams",role:"Wash lead",shift:"07:00–16:00",active:true},
        {id:"staff2",name:"Sihle Mbeki",role:"Detail technician",shift:"08:00–17:00",active:true},
        {id:"staff3",name:"Riley Jacobs",role:"Wash technician",shift:"08:00–17:00",active:true},
        {id:"staff4",name:"Taylor Daniels",role:"Customer desk",shift:"09:00–18:00",active:false}
      ],
      memberships: [],
      prices: {}
    };
  };
  const loadState = function () {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.bookings) && Array.isArray(parsed.inventory)) return parsed;
      }
    } catch (error) {}
    const initial = makeSeed();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(initial)); } catch (error) {}
    return initial;
  };
  let state = loadState();
  let currentRole = "";
  let currentPage = "overview";
  let bookingSearch = "";
  let bookingFilter = "all";
  let toastTimer = null;
  let lastModalTrigger = null;
  let lastOpsTrigger = null;

  const saveState = function () {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (error) { showToast("This browser could not save the demo data. Try a different browser."); }
  };
  const getService = function (id) { return SERVICES.find(function (service) { return service.id === id; }) || SERVICES[0]; };
  const getPrice = function (id) {
    const service = getService(id);
    return state.prices && state.prices[id] != null ? Number(state.prices[id]) : service.price;
  };
  const getSelectedAddons = function () {
    return $$(".rr-addon input:checked").map(function (input) { return ADDONS.find(function (addon) { return addon.id === input.value; }); }).filter(Boolean);
  };
  const calculateQuote = function () {
    const serviceId = $("#bookingService") ? $("#bookingService").value : "signature";
    const vehicleId = $("#vehicleType") ? $("#vehicleType").value : "sedan";
    const service = getService(serviceId);
    const vehicle = VEHICLES[vehicleId] || VEHICLES.sedan;
    const base = Math.round(getPrice(serviceId) * vehicle.multiplier);
    const extras = getSelectedAddons().reduce(function (total, addon) { return total + addon.price; }, 0);
    return {service:service,vehicle:vehicle,base:base,extras:extras,total:base+extras};
  };
  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("show"); }, 3400);
  }
  function updateQuote() {
    const quote = calculateQuote();
    $("#quoteService").textContent = quote.service.name;
    $("#quoteVehicle").textContent = quote.vehicle.label;
    $("#quoteDuration").textContent = quote.service.duration + " min";
    $("#quoteAddons").textContent = money(quote.extras);
    $("#quoteTotal").textContent = money(quote.total);
    $("[data-service-price]").forEach(function (node) { node.innerHTML = money(getPrice(node.dataset.servicePrice)) + "<small>FROM · " + getService(node.dataset.servicePrice).duration + " MIN</small>"; });
    $("[data-select-service]").forEach(function (card) {
      const selected = card.dataset.selectService === quote.service.id;
      card.setAttribute("aria-pressed", String(selected));
      card.classList.toggle("selected", selected);
    });
  }
  function renderSlots() {
    const dateInput = $("#bookingDate");
    const grid = $("#timeSlots");
    if (!dateInput || !grid) return;
    const selectedDate = dateInput.value || dateKey(new Date());
    const selectedInput = $("#selectedSlot");
    const chosen = selectedInput.value;
    grid.innerHTML = "";
    let firstAvailable = "";
    SLOTS.forEach(function (slot) {
      const count = state.bookings.filter(function (booking) {
        return booking.date === selectedDate && booking.time === slot && booking.status !== "cancelled";
      }).length;
      const now = new Date();
      const currentTime = String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0");
      const past = selectedDate === dateKey(now) && slot <= currentTime;
      const full = count >= 3 || past;
      if (!full && !firstAvailable) firstAvailable = slot;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rr-slot";
      button.textContent = slot;
      button.disabled = full;
      button.setAttribute("aria-pressed", String(!full && slot === chosen));
      button.setAttribute("data-slot", slot);
      button.title = full ? "This arrival slot is full" : (3-count) + " spaces available";
      grid.appendChild(button);
    });
    const nowForCheck = new Date();
    const currentTimeForCheck = String(nowForCheck.getHours()).padStart(2,"0") + ":" + String(nowForCheck.getMinutes()).padStart(2,"0");
    const stillAvailable = SLOTS.some(function (slot) {
      const past = selectedDate === dateKey(nowForCheck) && slot <= currentTimeForCheck;
      return slot === chosen && !past && state.bookings.filter(function (booking) {
        return booking.date === selectedDate && booking.time === slot && booking.status !== "cancelled";
      }).length < 3;
    });
    if (!stillAvailable) selectedInput.value = firstAvailable;
    if (!selectedInput.value) {
      selectedInput.value = "";
      grid.insertAdjacentHTML("beforeend", '<span class="rr-demo-note">No arrival slots are available on this date. Please choose another day.</span>');
    }
    $$("[data-slot]", grid).forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.slot === selectedInput.value));
    });
  }
  function updateBookingForm() {
    updateQuote();
    renderSlots();
  }

  function bookingId() {
    return "RR-" + String(Date.now()).slice(-6) + String(Math.floor(Math.random()*9));
  }
  function addBooking(event) {
    event.preventDefault();
    const form = $("#bookingForm");
    if (!form.reportValidity()) return;
    const date = $("#bookingDate").value;
    if (date < dateKey(new Date())) { showToast("Please choose today or a future date."); return; }
    const slot = $("#selectedSlot").value;
    if (!slot) { showToast("Please choose an available arrival time."); return; }
    const now = new Date();
    const currentTime = String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0");
    if (date === dateKey(now) && slot <= currentTime) { renderSlots(); showToast("That arrival time has already passed. Choose a later slot."); return; }
    const taken = state.bookings.filter(function (booking) {
      return booking.date === date && booking.time === slot && booking.status !== "cancelled";
    }).length;
    if (taken >= 3) { renderSlots(); showToast("That arrival slot has just filled. Choose another time."); return; }
    const quote = calculateQuote();
    const name = $("#customerName").value.trim();
    const phone = $("#customerPhone").value.trim();
    const email = $("#customerEmail").value.trim();
    const vehicle = VEHICLES[$("#vehicleType").value].label;
    const booking = {
      id:bookingId(),name:name,phone:phone,email:email,vehicle:vehicle,
      serviceId:quote.service.id,serviceName:quote.service.name,date:date,time:slot,
      price:quote.total,status:"booked",bay:"",createdAt:Date.now(),
      addons:getSelectedAddons().map(function (addon) { return addon.name; })
    };
    state.bookings.unshift(booking);
    saveState();
    $("#confirmationRef").textContent = booking.id;
    $("#confirmationDetails").textContent = booking.serviceName + " · " + vehicle + " · " + dateLabel(date) + " at " + slot + " · " + money(booking.price) + ". This demo entry is saved in this browser only.";
    $("#bookingConfirmation").hidden = false;
    form.reset();
    $("#bookingService").value = "signature";
    $("#vehicleType").value = "sedan";
    $("#bookingDate").value = dateKey(new Date());
    $("#selectedSlot").value = "09:30";
    updateBookingForm();
  }
  function openOps() {
    $("#membershipModal").hidden = true;
    $("#bookingConfirmation").hidden = true;
    $("#opsApp").hidden = false;
    $("#opsLogin").hidden = false;
    $("#opsShell").hidden = true;
    document.body.classList.add("ops-open");
    window.scrollTo(0,0);
  }
  function closeOps() {
    $("#opsApp").hidden = true;
    document.body.classList.remove("ops-open");
  }
  function enterRole(role) {
    currentRole = role === "manager" ? "manager" : "owner";
    currentPage = "overview";
    bookingSearch = "";
    bookingFilter = "all";
    $("#opsLogin").hidden = true;
    $("#opsShell").hidden = false;
    $("#rolePill").textContent = currentRole === "owner" ? "OWNER · FULL ACCESS" : "MANAGER · DAILY OPS";
    renderNav();
    renderOpsPage("overview");
  }
  function renderNav() {
    const nav = $("#opsNav");
    const items = currentRole === "owner" ? OWNER_NAV : MANAGER_NAV;
    nav.innerHTML = items.map(function (item) {
      return '<button type="button" data-ops-page="' + item.id + '" class="' + (item.id === currentPage ? "active" : "") + '"><span>' + item.icon + '</span>' + item.label + '</button>';
    }).join("");
  }
  function pageHeader(title, description, action) {
    return '<div class="rr-ops-page-head"><div><div class="rr-eyebrow">RINSE / RITUAL · ' + (currentRole === "owner" ? "OWNER WORKSPACE" : "DAILY OPERATIONS") + '</div><h1>' + title + '</h1><p>' + description + '</p></div>' + (action || "") + '</div>';
  }
  function statusPill(status) {
    const labels = {"booked":"Booked","checked-in":"Checked in","washing":"Washing","ready":"Ready","completed":"Completed","cancelled":"Cancelled"};
    return '<span class="rr-status ' + escapeHTML(status) + '">' + (labels[status] || escapeHTML(status)) + '</span>';
  }
  function bookingActionButtons(booking) {
    const id = escapeHTML(booking.id);
    if (booking.status === "booked") return '<button class="rr-action" data-booking-action="checkin" data-booking-id="' + id + '">Check in</button><button class="rr-action danger" data-booking-action="cancel" data-booking-id="' + id + '">Cancel</button>';
    if (booking.status === "checked-in") return '<button class="rr-action" data-booking-action="start" data-booking-id="' + id + '">Start wash</button><button class="rr-action danger" data-booking-action="cancel" data-booking-id="' + id + '">Cancel</button>';
    if (booking.status === "washing") return '<button class="rr-action" data-booking-action="ready" data-booking-id="' + id + '">Mark ready</button>';
    if (booking.status === "ready") return '<button class="rr-action" data-booking-action="complete" data-booking-id="' + id + '">Complete job</button>';
    return '<span class="rr-table-secondary">No action</span>';
  }
  function bookingTable(rows) {
    if (!rows.length) return '<div class="rr-empty-state">No bookings match this view yet.</div>';
    return '<div class="rr-ops-table-wrap"><table class="rr-ops-table"><thead><tr><th>Customer</th><th>Service</th><th>Arrival</th><th>Vehicle</th><th>Value</th><th>Status</th><th>Action</th></tr></thead><tbody>' + rows.map(function (booking) {
      return '<tr><td><span class="rr-table-primary">' + escapeHTML(booking.name) + '</span><span class="rr-table-secondary">' + escapeHTML(booking.phone) + '</span></td><td>' + escapeHTML(booking.serviceName) + '</td><td><span class="rr-table-primary">' + escapeHTML(booking.time) + '</span><span class="rr-table-secondary">' + prettyDate(booking.date) + '</span></td><td>' + escapeHTML(booking.vehicle) + '</td><td><strong>' + money(booking.price) + '</strong></td><td>' + statusPill(booking.status) + '</td><td><div class="rr-action-row">' + bookingActionButtons(booking) + '</div></td></tr>';
    }).join("") + '</tbody></table></div>';
  }
  function renderBookingTableArea() {
    const area = $("#bookingTableArea");
    if (!area) return;
    let rows = state.bookings.slice().sort(function (a,b) { return (b.date + b.time).localeCompare(a.date + a.time); });
    if (bookingFilter !== "all") rows = rows.filter(function (booking) { return booking.status === bookingFilter; });
    if (bookingSearch) {
      const q = bookingSearch.toLowerCase();
      rows = rows.filter(function (booking) { return [booking.name,booking.phone,booking.id,booking.serviceName].join(" ").toLowerCase().includes(q); });
    }
    area.innerHTML = bookingTable(rows);
  }
  function renderOverview() {
    const today = dateKey(new Date());
    const todays = state.bookings.filter(function (b) { return b.date === today && b.status !== "cancelled"; });
    const completed = todays.filter(function (b) { return b.status === "completed"; });
    const revenue = completed.reduce(function (sum,b) { return sum + Number(b.price); },0);
    const active = state.bookings.filter(function (b) { return (b.status === "washing" || b.status === "ready") && b.date === today; });
    const waiting = state.bookings.filter(function (b) { return b.date === today && b.status === "checked-in"; });
    const ready = state.bookings.filter(function (b) { return b.date === today && b.status === "ready"; });
    const customers = getCustomers();
    const lowStock = state.inventory.filter(function (item) { return item.stock <= item.min; }).length;
    const rows = state.bookings.filter(function (b) { return b.date === today; }).slice().sort(function (a,b) { return a.time.localeCompare(b.time); }).slice(0,5);
    let kpis;
    let pulse;
    if (currentRole === "owner") {
      kpis = [
        ["BOOKINGS TODAY",todays.length,"Scheduled arrivals"],
        ["REVENUE COLLECTED",money(revenue),"Completed jobs only"],
        ["ACTIVE WASHES",active.length,"On the wash floor"],
        ["CUSTOMER PROFILES",customers.length,"Across demo bookings"]
      ];
      pulse = '<div class="rr-staff-row"><div><strong>Wash bays occupied</strong><small class="rr-table-secondary">Live floor activity</small></div><b>' + active.length + ' / 3</b></div><div class="rr-staff-row"><div><strong>Memberships active</strong><small class="rr-table-secondary">Sample member accounts</small></div><b>' + state.memberships.length + '</b></div><div class="rr-staff-row"><div><strong>Stock items to watch</strong><small class="rr-table-secondary">At or below minimum level</small></div><b>' + lowStock + '</b></div><div class="rr-staff-row"><div><strong>Staff on shift</strong><small class="rr-table-secondary">Team availability</small></div><b>' + state.staff.filter(function (s) { return s.active; }).length + ' / ' + state.staff.length + '</b></div>';
    } else {
      kpis = [
        ["BOOKINGS TODAY",todays.length,"Scheduled arrivals"],
        ["VEHICLES IN WASH",active.length,"Currently on the wash floor"],
        ["WAITING FOR A BAY",waiting.length,"Checked in and queued"],
        ["READY TO COLLECT",ready.length,"Completed wash, awaiting pickup"]
      ];
      pulse = '<div class="rr-staff-row"><div><strong>Wash bays occupied</strong><small class="rr-table-secondary">Live floor activity</small></div><b>' + active.length + ' / 3</b></div><div class="rr-staff-row"><div><strong>Customers waiting</strong><small class="rr-table-secondary">Checked in, not yet assigned</small></div><b>' + waiting.length + '</b></div><div class="rr-staff-row"><div><strong>Vehicles ready</strong><small class="rr-table-secondary">Awaiting customer collection</small></div><b>' + ready.length + '</b></div><div class="rr-staff-row"><div><strong>Customer profiles</strong><small class="rr-table-secondary">For service and check-in support</small></div><b>' + customers.length + '</b></div>';
    }
    return pageHeader("Good morning, team.","Here is the pulse of the studio today.") +
      '<div class="rr-ops-grid">' + kpis.map(function (k) { return '<div class="rr-kpi"><span>' + k[0] + '</span><strong>' + k[1] + '</strong><small>' + k[2] + '</small></div>'; }).join("") + '</div>' +
      '<div class="rr-ops-two-col"><section class="rr-ops-panel"><h3>Today&#39;s wash schedule</h3>' + bookingTable(rows) + '</section><section class="rr-ops-panel"><h3>Studio pulse</h3>' + pulse + '<button class="rr-btn rr-btn-dark rr-btn-small" style="margin-top:15px" data-ops-page="live">OPEN LIVE WASH BOARD ↗</button></section></div>';
  }
  function renderLive() {
    const active = state.bookings.filter(function (b) { return b.date === dateKey(new Date()) && (b.status === "washing" || b.status === "ready"); });
    const queue = state.bookings.filter(function (b) { return b.date === dateKey(new Date()) && b.status === "checked-in"; });
    const bays = BAYS.map(function (bay) {
      const booking = active.find(function (b) { return b.bay === bay; });
      return '<article class="rr-bay"><div class="rr-bay-top"><strong>' + bay + '</strong><span>' + (booking ? "IN USE" : "AVAILABLE") + '</span></div>' + (booking ? '<div class="rr-bay-customer"><strong>' + escapeHTML(booking.name) + '</strong><small>' + escapeHTML(booking.serviceName) + ' · ' + escapeHTML(booking.time) + '</small>' + statusPill(booking.status) + '<div class="rr-action-row" style="margin-top:13px">' + bookingActionButtons(booking) + '</div></div>' : '<div class="rr-bay-empty">Ready for the next vehicle.</div>') + '</article>';
    }).join("");
    return pageHeader("Live wash board","Track every bay from check-in to collection.") +
      '<section class="rr-ops-panel"><h3>Bay status · ' + dateLabel(dateKey(new Date())) + '</h3><div class="rr-bay-grid">' + bays + '</div></section>' +
      '<section class="rr-ops-panel" style="margin-top:13px"><h3>Checked in · waiting for a bay</h3>' + (queue.length ? bookingTable(queue) : '<div class="rr-empty-state">No vehicles waiting for a bay.</div>') + '</section>';
  }
  function renderBookings() {
    const statuses = ["all","booked","checked-in","washing","ready","completed","cancelled"];
    return pageHeader("Bookings & arrivals","Search, check in customers and move every wash through the workflow.") +
      '<section class="rr-ops-panel"><div class="rr-ops-controls" style="margin-bottom:17px"><input id="bookingSearch" type="search" placeholder="Search customer, service or reference…" value="' + escapeHTML(bookingSearch) + '"><select id="bookingFilter">' + statuses.map(function (s) { return '<option value="' + s + '"' + (bookingFilter === s ? " selected" : "") + '>' + (s === "all" ? "All statuses" : s.replace("-"," ")) + '</option>'; }).join("") + '</select><span class="rr-table-secondary">Actions update the live wash board.</span></div><div id="bookingTableArea"></div></section>';
  }
  function getCustomers() {
    const map = {};
    state.bookings.forEach(function (booking) {
      const key = booking.phone || booking.name;
      if (!map[key]) map[key] = {name:booking.name,phone:booking.phone,visits:0,spend:0,last:booking.date};
      if (booking.status === "completed") { map[key].visits += 1; map[key].spend += Number(booking.price); }
      if (booking.date > map[key].last) map[key].last = booking.date;
    });
    state.memberships.forEach(function (member) {
      const key = member.phone || member.name;
      if (!map[key]) map[key] = {name:member.name,phone:member.phone,visits:0,spend:0,last:member.joined};
      map[key].membership = member.plan;
    });
    return Object.keys(map).map(function (key) { return map[key]; }).sort(function (a,b) { return b.visits - a.visits; });
  }
  function renderCustomers() {
    const customers = getCustomers();
    const members = state.memberships.length;
    const completedVisits = state.bookings.filter(function (b) { return b.status === "completed"; }).length;
    const lifetimeValue = customers.reduce(function (sum,c) { return sum+c.spend; },0);
    const ownerView = currentRole === "owner";
    const metrics = ownerView
      ? [["KNOWN CUSTOMERS",customers.length,"Demo customer profiles"],["MEMBERSHIPS",members,"Sample member sign-ups"],["COMPLETED VISITS",completedVisits,"Across the sample history"],["REPEAT VALUE",money(lifetimeValue),"Completed wash revenue"]]
      : [["CUSTOMER PROFILES",customers.length,"For service and check-in support"],["MEMBERSHIPS",members,"Sample member sign-ups"],["COMPLETED VISITS",completedVisits,"Across the sample history"],["TODAY'S ARRIVALS",state.bookings.filter(function (b) { return b.date === dateKey(new Date()) && b.status !== "cancelled"; }).length,"Scheduled customer visits"]];
    const spendHeading = ownerView ? "<th>Lifetime spend</th>" : "";
    return pageHeader("Customers & members","Understand repeat visits, customer value and your regulars club.") +
      '<div class="rr-ops-grid">' + metrics.map(function (metric) { return '<div class="rr-kpi"><span>' + metric[0] + '</span><strong>' + metric[1] + '</strong><small>' + metric[2] + '</small></div>'; }).join("") + '</div>' +
      '<section class="rr-ops-panel" style="margin-top:13px"><h3>Customer register</h3><div class="rr-ops-table-wrap"><table class="rr-ops-table"><thead><tr><th>Customer</th><th>Mobile</th><th>Completed visits</th>' + spendHeading + '<th>Last activity</th><th>Membership</th></tr></thead><tbody>' + customers.map(function (c) {
        const spendCell = ownerView ? '<td><strong>' + money(c.spend) + '</strong></td>' : "";
        return '<tr><td><span class="rr-table-primary">' + escapeHTML(c.name) + '</span></td><td>' + escapeHTML(c.phone) + '</td><td>' + c.visits + '</td>' + spendCell + '<td>' + prettyDate(c.last) + '</td><td>' + (c.membership ? '<span class="rr-status completed">' + escapeHTML(c.membership) + '</span>' : '<span class="rr-table-secondary">—</span>') + '</td></tr>';
      }).join("") + '</tbody></table></div></section>';
  }
  function renderInventory() {
    return pageHeader("Stock & chemicals","Keep consumables visible before they interrupt a wash.") +
      '<div class="rr-stock-grid">' + state.inventory.map(function (item) {
        const low = item.stock <= item.min;
        return '<article class="rr-stock-card"><strong>' + escapeHTML(item.name) + '</strong><small>' + escapeHTML(item.unit) + '</small><div class="rr-stock-count">' + item.stock + '</div><span class="' + (low ? "rr-stock-low" : "rr-table-secondary") + '">' + (low ? "LOW STOCK · MIN " + item.min : "STOCK LEVEL HEALTHY") + '</span><div class="rr-stock-actions"><button type="button" data-stock-action="use" data-stock-id="' + escapeHTML(item.id) + '">− USE 1</button><button type="button" data-stock-action="add" data-stock-id="' + escapeHTML(item.id) + '">+ RESTOCK 5</button></div></article>';
      }).join("") + '</div><p class="rr-demo-note">Inventory actions update the local demo. A live client system can add supplier records, purchase orders, stock movement history and cost-of-goods tracking.</p>';
  }
  function renderTeam() {
    return pageHeader("Team & wash bays","See who is on shift and how the wash floor is staffed.") +
      '<section class="rr-ops-panel"><h3>Today&#39;s team roster</h3>' + state.staff.map(function (person) {
        return '<div class="rr-staff-row"><div class="rr-staff-person"><span class="rr-avatar">' + escapeHTML(person.name.split(" ").map(function (x) { return x[0]; }).join("").slice(0,2)) + '</span><span><strong>' + escapeHTML(person.name) + '</strong><small>' + escapeHTML(person.role) + ' · ' + escapeHTML(person.shift) + '</small></span></div><div class="rr-action-row"><span class="rr-status ' + (person.active ? "completed" : "cancelled") + '">' + (person.active ? "On shift" : "Off shift") + '</span><button class="rr-action" data-staff-toggle="' + escapeHTML(person.id) + '">' + (person.active ? "Clock out" : "Clock in") + '</button></div></div>';
      }).join("") + '</section><section class="rr-ops-panel" style="margin-top:13px"><h3>Wash bay setup</h3><div class="rr-bay-grid">' + BAYS.map(function (bay,index) { return '<article class="rr-bay"><div class="rr-bay-top"><strong>' + bay + '</strong><span>' + ["EXPRESS","DETAIL","PROTECTION"][index] + '</span></div><div class="rr-bay-empty">' + ["Quick Reset and Signature Hand Wash","Interior Revival and Full Revival","Ceramic Shield and specialist treatments"][index] + '</div></article>'; }).join("") + '</div></section>';
  }
  function renderReports() {
    const days = [];
    for (let i=6;i>=0;i--) {
      const day = offsetDate(-i);
      const value = state.bookings.filter(function (b) { return b.date === day && b.status === "completed"; }).reduce(function (sum,b) { return sum + Number(b.price); },0);
      days.push({date:day,value:value});
    }
    const max = Math.max.apply(null,days.map(function (d) { return d.value; }).concat([1]));
    const total = days.reduce(function (sum,d) { return sum+d.value; },0);
    const serviceTotals = {};
    state.bookings.filter(function (b) { return b.status === "completed"; }).forEach(function (b) { serviceTotals[b.serviceName] = (serviceTotals[b.serviceName] || 0) + Number(b.price); });
    const services = Object.keys(serviceTotals).sort(function (a,b) { return serviceTotals[b]-serviceTotals[a]; });
    return pageHeader("Revenue & reports","A simple operating picture for the owner: revenue, service mix and completed work.") +
      '<div class="rr-ops-grid"><div class="rr-kpi"><span>7-DAY REVENUE</span><strong>' + money(total) + '</strong><small>Completed jobs in sample period</small></div><div class="rr-kpi"><span>COMPLETED JOBS</span><strong>' + state.bookings.filter(function (b) { return b.status === "completed"; }).length + '</strong><small>All demo history</small></div><div class="rr-kpi"><span>AVERAGE TICKET</span><strong>' + money(state.bookings.filter(function (b) { return b.status === "completed"; }).length ? state.bookings.filter(function (b) { return b.status === "completed"; }).reduce(function (s,b) { return s+Number(b.price); },0)/state.bookings.filter(function (b) { return b.status === "completed"; }).length : 0) + '</strong><small>Per completed wash</small></div><div class="rr-kpi"><span>MEMBER BASE</span><strong>' + state.memberships.length + '</strong><small>Sample sign-ups</small></div></div>' +
      '<div class="rr-ops-two-col"><section class="rr-ops-panel"><h3>Revenue · last 7 days</h3><div class="rr-bar-chart">' + days.map(function (d) { const height = Math.max(5,Math.round(d.value/max*100)); return '<div class="rr-bar-col"><small>' + (d.value ? Math.round(d.value/100)/10 + "k" : "—") + '</small><div class="rr-bar" style="--bar-height:' + height + '%"></div><span>' + new Date(d.date+"T12:00:00").toLocaleDateString("en-ZA",{weekday:"short"}) + '</span></div>'; }).join("") + '</div></section><section class="rr-ops-panel"><h3>Service mix · revenue</h3>' + (services.length ? services.map(function (name) { return '<div class="rr-staff-row"><div><strong>' + escapeHTML(name) + '</strong><small class="rr-table-secondary">Completed services</small></div><b>' + money(serviceTotals[name]) + '</b></div>'; }).join("") : '<div class="rr-empty-state">Complete a demo booking to see service mix.</div>') + '</section></div>';
  }
  function renderSettings() {
    return pageHeader("Services & settings","Adjust demonstration prices and restore the sample workspace when needed.") +
      '<section class="rr-ops-panel"><h3>Wash menu pricing · sedan base price</h3>' + SERVICES.map(function (service) {
        return '<div class="rr-price-control"><div><strong>' + escapeHTML(service.name) + '</strong><small>' + service.duration + ' minute estimate</small></div><b>' + money(getPrice(service.id)) + '</b><button class="rr-action" data-price-adjust="-25" data-service-id="' + service.id + '">− R25</button><button class="rr-action" data-price-adjust="25" data-service-id="' + service.id + '">+ R25</button></div>';
      }).join("") + '</section><section class="rr-reset-box"><strong>RESET THE DEMONSTRATION WORKSPACE</strong><p>Restore the original sample bookings, team roster, stock levels and prices. Any bookings or membership previews created in this browser will be cleared.</p><button class="rr-action danger" type="button" data-reset-demo>RESET SAMPLE DATA</button></section>';
  }
  function renderOpsPage(page) {
    const allowed = currentRole === "owner" ? OWNER_NAV.map(function (x) { return x.id; }) : MANAGER_NAV.map(function (x) { return x.id; });
    if (allowed.indexOf(page) === -1) page = "overview";
    currentPage = page;
    renderNav();
    const renderers = {overview:renderOverview,live:renderLive,bookings:renderBookings,customers:renderCustomers,inventory:renderInventory,team:renderTeam,reports:renderReports,settings:renderSettings};
    $("#opsContent").innerHTML = renderers[page]();
    if (page === "bookings") renderBookingTableArea();
  }
  function updateBookingStatus(id, action) {
    const booking = state.bookings.find(function (b) { return b.id === id; });
    if (!booking) return;
    if ((action === "checkin" || action === "start") && booking.date !== dateKey(new Date())) { showToast(booking.date > dateKey(new Date()) ? "This booking is scheduled for a future date." : "This booking date has passed. Review it before checking in."); return; }
    if (action === "checkin" && booking.status === "booked") booking.status = "checked-in";
    if (action === "start" && booking.status === "checked-in") {
      const occupied = state.bookings.filter(function (b) { return (b.status === "washing" || b.status === "ready") && b.date === dateKey(new Date()); }).map(function (b) { return b.bay; });
      const free = BAYS.find(function (bay) { return occupied.indexOf(bay) === -1; });
      if (!free) { showToast("All wash bays are occupied. Finish a job before assigning another vehicle."); return; }
      booking.status = "washing";
      booking.bay = free;
    }
    if (action === "ready" && booking.status === "washing") booking.status = "ready";
    if (action === "complete" && booking.status === "ready") { booking.status = "completed"; booking.bay = ""; }
    if (action === "cancel" && (booking.status === "booked" || booking.status === "checked-in")) { booking.status = "cancelled"; booking.bay = ""; }
    saveState();
    renderOpsPage(currentPage);
    showToast("Booking " + booking.id + " updated.");
  }
  function openMembership(plan) {
    $("#membershipPlan").value = plan;
    $("#membershipIntro").textContent = "Preview a " + plan + " sign-up. No payment is taken and the sample member is stored only in this browser.";
    $("#membershipModal").hidden = false;
  }
  function addMembership(event) {
    event.preventDefault();
    const form = $("#membershipForm");
    if (!form.reportValidity()) return;
    const name = $("#memberName").value.trim();
    const phone = $("#memberPhone").value.trim();
    const plan = $("#membershipPlan").value;
    state.memberships.unshift({id:"MEM-" + String(Date.now()).slice(-6),name:name,phone:phone,plan:plan,joined:dateKey(new Date())});
    saveState();
    form.reset();
    $("#membershipModal").hidden = true;
    showToast(plan + " sample membership added to the demo workspace.");
  }

  document.addEventListener("click", function (event) {
    const openButton = event.target.closest("[data-open-ops]");
    if (openButton) { event.preventDefault(); openOps(); return; }
    const closeButton = event.target.closest("[data-close-ops]");
    if (closeButton) { closeOps(); return; }
    const roleButton = event.target.closest("[data-enter-role]");
    if (roleButton) { enterRole(roleButton.dataset.enterRole); return; }
    const serviceButton = event.target.closest("[data-select-service]");
    if (serviceButton) {
      $("#bookingService").value = serviceButton.dataset.selectService;
      updateQuote();
      $("#book").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
      return;
    }
    const slotButton = event.target.closest("[data-slot]");
    if (slotButton && !slotButton.disabled) {
      $("#selectedSlot").value = slotButton.dataset.slot;
      renderSlots();
      return;
    }
    const joinButton = event.target.closest("[data-join-membership]");
    if (joinButton) { openMembership(joinButton.dataset.joinMembership); return; }
    const closeModal = event.target.closest("[data-close-modal]");
    if (closeModal) { closeModalDialog(closeModal.closest(".rr-modal")); return; }
    if (event.target.classList.contains("rr-modal")) { closeModalDialog(event.target); return; }
    const opsPageButton = event.target.closest("[data-ops-page]");
    if (opsPageButton) { renderOpsPage(opsPageButton.dataset.opsPage); return; }
    const bookingAction = event.target.closest("[data-booking-action]");
    if (bookingAction) { updateBookingStatus(bookingAction.dataset.bookingId,bookingAction.dataset.bookingAction); return; }
    const stockAction = event.target.closest("[data-stock-action]");
    if (stockAction && currentRole === "owner") {
      const item = state.inventory.find(function (x) { return x.id === stockAction.dataset.stockId; });
      if (item) { item.stock = Math.max(0,item.stock + (stockAction.dataset.stockAction === "add" ? 5 : -1)); saveState(); renderOpsPage(currentPage); showToast(item.name + " stock updated."); }
      return;
    }
    const staffAction = event.target.closest("[data-staff-toggle]");
    if (staffAction && currentRole === "owner") {
      const person = state.staff.find(function (x) { return x.id === staffAction.dataset.staffToggle; });
      if (person) { person.active = !person.active; saveState(); renderOpsPage(currentPage); showToast(person.name + (person.active ? " clocked in." : " clocked out.")); }
      return;
    }
    const priceAction = event.target.closest("[data-price-adjust]");
    if (priceAction && currentRole === "owner") {
      const id = priceAction.dataset.serviceId;
      state.prices[id] = Math.max(50,getPrice(id) + Number(priceAction.dataset.priceAdjust));
      saveState(); updateQuote(); renderOpsPage(currentPage); showToast("Demo service price updated.");
      return;
    }
    const resetButton = event.target.closest("[data-reset-demo]");
    if (resetButton && currentRole === "owner") {
      if (window.confirm("Reset all local Rinse / Ritual demo data to the original sample workspace?")) {
        state = makeSeed(); saveState(); updateQuote(); renderOpsPage("overview"); showToast("Demo workspace restored.");
      }
    }
  });
  document.addEventListener("input", function (event) {
    if (event.target.id === "bookingSearch") { bookingSearch = event.target.value; renderBookingTableArea(); }
  });
  document.addEventListener("change", function (event) {
    if (event.target.id === "bookingFilter") { bookingFilter = event.target.value; renderBookingTableArea(); }
    if (event.target.id === "bookingService" || event.target.id === "vehicleType" || event.target.matches(".rr-addon input")) updateBookingForm();
    if (event.target.id === "bookingDate") { renderSlots(); }
  });
  $("#bookingForm").addEventListener("submit",addBooking);
  $("#membershipForm").addEventListener("submit",addMembership);
  $("#menuToggle").addEventListener("click",function () {
    const nav = $("#mainNav");
    const open = nav.classList.toggle("open");
    $("#menuToggle").classList.toggle("is-open",open);
    $("#menuToggle").setAttribute("aria-expanded",String(open));
    $("#menuToggle").setAttribute("aria-label",open ? "Close navigation" : "Open navigation");
  });
  $("#mainNav a").forEach(function (link) {
    link.addEventListener("click",function () {
      $("#mainNav").classList.remove("open");
      $("#menuToggle").classList.remove("is-open");
      $("#menuToggle").setAttribute("aria-expanded","false");
      $("#menuToggle").setAttribute("aria-label","Open navigation");
    });
  });
  $("#bookingDate").min = dateKey(new Date());
  $("#bookingDate").value = dateKey(new Date());
  $("#selectedSlot").value = "09:30";
  updateBookingForm();

  /* Native-scroll story progress: no scroll-jacking or extra library required. */
  (function initRitualScrollStory() {
    const panels = Array.from(document.querySelectorAll("[data-ritual-step]"));
    const progress = document.getElementById("ritualProgress");
    const progressFill = document.getElementById("ritualProgressFill");
    const stepCount = document.getElementById("ritualStepCount");
    const currentLabel = document.getElementById("ritualCurrentLabel");
    if (!panels.length) return;

    const setActive = function (panel) {
      const step = Number(panel.dataset.ritualStep) || 1;
      const title = panel.dataset.ritualTitle || "Your ritual";
      panels.forEach(function (item) {
        const active = item === panel;
        item.classList.toggle("is-active", active);
        if (active) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
      if (stepCount) stepCount.textContent = String(step).padStart(2, "0");
      if (progressFill) progressFill.style.width = ((step / panels.length) * 100) + "%";
      if (progress) {
        progress.setAttribute("aria-valuenow", String(step));
        progress.setAttribute("aria-valuetext", "Step " + step + " of " + panels.length + ": " + title);
      }
      if (currentLabel) currentLabel.textContent = String(step).padStart(2, "0") + " · " + title.toUpperCase();
    };

    setActive(panels[0]);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion && "IntersectionObserver" in window) {
      document.documentElement.classList.add("rr-motion-ready");
    }
    if ("IntersectionObserver" in window) {
      const visibleRatios = new Map();
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            visibleRatios.set(entry.target, entry.intersectionRatio);
            entry.target.classList.add("is-visible");
          } else {
            visibleRatios.delete(entry.target);
          }
        });
        const mostVisible = Array.from(visibleRatios.entries()).sort(function (a, b) {
          return b[1] - a[1];
        })[0];
        if (mostVisible) setActive(mostVisible[0]);
      }, {
        root: null,
        rootMargin: "-16% 0px -16% 0px",
        threshold: [0.05, 0.2, 0.4, 0.6, 0.8]
      });
      panels.forEach(function (panel) { observer.observe(panel); });
    } else {
      panels.forEach(function (panel) { panel.classList.add("is-visible"); });
    }
  
  /* Accessible overlay management and return-focus behaviour. */
  function setPublicSiteInert(active) {
    const site = $("#publicSite");
    if (!site) return;
    site.inert = !!active;
    if (active) site.setAttribute("aria-hidden","true");
    else site.removeAttribute("aria-hidden");
  }
  function restoreFocus(target) {
    if (target && document.contains(target) && !target.closest("[hidden]")) {
      try { target.focus({preventScroll:true}); } catch (error) { target.focus(); }
    }
  }
  function closeModalDialog(modal) {
    if (!modal) return;
    modal.hidden = true;
    const opsOpen = $("#opsApp") && !$("#opsApp").hidden;
    const otherModalOpen = ($("#membershipModal") && !$("#membershipModal").hidden) || ($("#bookingConfirmation") && !$("#bookingConfirmation").hidden);
    if (!opsOpen && !otherModalOpen) setPublicSiteInert(false);
    const trigger = lastModalTrigger;
    lastModalTrigger = null;
    if (!opsOpen && !otherModalOpen) restoreFocus(trigger);
  }
  function getDialogFocusables(dialog) {
    return Array.from(dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      .filter(function (element) { return !element.closest("[hidden]") && element.getClientRects().length > 0; });
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function openMembership(plan) {
    const details = MEMBERSHIP_DETAILS[plan] || MEMBERSHIP_DETAILS["Fresh Pass"];
    lastModalTrigger = document.activeElement;
    $("#membershipPlan").value = plan;
    $("#membershipIntro").textContent = "Preview the " + plan + " plan. No payment is taken and this sample sign-up stays in this browser.";
    $("#membershipSummary").innerHTML = '<strong>' + money(details.price) + ' <small>/ month</small></strong><small>Save ' + money(details.saving) + ' against individual visits.</small><ul>' + details.items.map(function (item) { return '<li>' + escapeHTML(item) + '</li>'; }).join("") + '</ul>';
    setPublicSiteInert(true);
    $("#membershipModal").hidden = false;
    requestAnimationFrame(function () { $("#memberName").focus({preventScroll:true}); });
  }

  function openOps() {
    const active = document.activeElement;
    lastOpsTrigger = active && active.closest(".rr-modal") ? $("#opsLaunch") : active;
    $("#membershipModal").hidden = true;
    $("#bookingConfirmation").hidden = true;
    lastModalTrigger = null;
    setPublicSiteInert(true);
    $("#opsApp").hidden = false;
    $("#opsLogin").hidden = false;
    $("#opsShell").hidden = true;
    currentRole = "";
    document.body.classList.add("ops-open");
    window.scrollTo(0,0);
    requestAnimationFrame(function () {
      const firstRole = $("#opsLogin").querySelector("[data-enter-role]");
      if (firstRole) firstRole.focus({preventScroll:true});
      else $("#opsApp").focus({preventScroll:true});
    });
  }

  function closeOps() {
    $("#opsApp").hidden = true;
    document.body.classList.remove("ops-open");
    currentRole = "";
    setPublicSiteInert(false);
    const trigger = lastOpsTrigger;
    lastOpsTrigger = null;
    restoreFocus(trigger);
  }

  function enterRole(role) {
    currentRole = role === "manager" ? "manager" : "owner";
    currentPage = "overview";
    bookingSearch = "";
    bookingFilter = "all";
    $("#opsLogin").hidden = true;
    $("#opsShell").hidden = false;
    $("#rolePill").textContent = currentRole === "owner" ? "OWNER · FULL ACCESS" : "MANAGER · DAILY OPS";
    renderNav();
    renderOpsPage("overview");
    requestAnimationFrame(function () {
      const firstNav = $("#opsNav").querySelector("button");
      if (firstNav) firstNav.focus({preventScroll:true});
    });
  }

  function renderNav() {
    const nav = $("#opsNav");
    const items = currentRole === "owner" ? OWNER_NAV : MANAGER_NAV;
    nav.innerHTML = items.map(function (item) {
      const active = item.id === currentPage;
      return '<button type="button" data-ops-page="' + item.id + '" class="' + (active ? "active" : "") + '"' + (active ? ' aria-current="page"' : "") + ' title="' + escapeHTML(item.label) + '"><span class="rr-nav-icon" aria-hidden="true">' + item.icon + '</span><span>' + escapeHTML(item.label) + '</span></button>';
    }).join("");
  }

  function pageHeader(title, description, action) {
    return '<div class="rr-ops-page-head"><div><div class="rr-eyebrow">RINSE / RITUAL · ' + (currentRole === "owner" ? "OWNER WORKSPACE" : "DAILY OPERATIONS") + '</div><h1 id="opsPageTitle">' + escapeHTML(title) + '</h1><p>' + escapeHTML(description) + '</p></div>' + (action || "") + '</div>';
  }

  function renderOverview() {
    const today = dateKey(new Date());
    const todays = state.bookings.filter(function (b) { return b.date === today && b.status !== "cancelled"; });
    const completed = todays.filter(function (b) { return b.status === "completed"; });
    const revenue = completed.reduce(function (sum,b) { return sum + Number(b.price); },0);
    const active = state.bookings.filter(function (b) { return (b.status === "washing" || b.status === "ready") && b.date === today; });
    const waiting = state.bookings.filter(function (b) { return b.date === today && b.status === "checked-in"; });
    const ready = state.bookings.filter(function (b) { return b.date === today && b.status === "ready"; });
    const customers = getCustomers();
    const lowStock = state.inventory.filter(function (item) { return item.stock <= item.min; }).length;
    const rows = state.bookings.filter(function (b) { return b.date === today && b.status !== "cancelled"; }).slice().sort(function (a,b) { return a.time.localeCompare(b.time); }).slice(0,5);
    let kpis;
    let pulse;
    if (currentRole === "owner") {
      kpis = [
        ["BOOKINGS TODAY",todays.length,"Scheduled arrivals"],
        ["REVENUE COLLECTED",money(revenue),"Completed jobs only"],
        ["VEHICLES IN BAYS",active.length,"Assigned to a wash bay"],
        ["CUSTOMER PROFILES",customers.length,"Across demo bookings"]
      ];
      pulse = '<div class="rr-staff-row"><div><strong>Wash bays occupied</strong><small class="rr-table-secondary">Vehicles currently assigned to a bay</small></div><b>' + active.length + ' / 3</b></div><div class="rr-staff-row"><div><strong>Memberships active</strong><small class="rr-table-secondary">Sample member accounts</small></div><b>' + state.memberships.length + '</b></div><div class="rr-staff-row"><div><strong>Stock items to watch</strong><small class="rr-table-secondary">At or below minimum level</small></div><b>' + lowStock + '</b></div><div class="rr-staff-row"><div><strong>Staff on shift</strong><small class="rr-table-secondary">Team availability</small></div><b>' + state.staff.filter(function (s) { return s.active; }).length + ' / ' + state.staff.length + '</b></div>';
    } else {
      kpis = [
        ["BOOKINGS TODAY",todays.length,"Scheduled arrivals"],
        ["VEHICLES IN BAYS",active.length,"Currently on the wash floor"],
        ["WAITING FOR A BAY",waiting.length,"Checked in and queued"],
        ["READY TO COLLECT",ready.length,"Awaiting customer collection"]
      ];
      pulse = '<div class="rr-staff-row"><div><strong>Wash bays occupied</strong><small class="rr-table-secondary">Vehicles currently assigned to a bay</small></div><b>' + active.length + ' / 3</b></div><div class="rr-staff-row"><div><strong>Customers waiting</strong><small class="rr-table-secondary">Checked in, not yet assigned</small></div><b>' + waiting.length + '</b></div><div class="rr-staff-row"><div><strong>Vehicles ready</strong><small class="rr-table-secondary">Awaiting customer collection</small></div><b>' + ready.length + '</b></div><div class="rr-staff-row"><div><strong>Customer profiles</strong><small class="rr-table-secondary">For service and check-in support</small></div><b>' + customers.length + '</b></div>';
    }
    return pageHeader(getGreeting() + ", team.", "Here is the studio at a glance.") +
      '<div class="rr-ops-grid">' + kpis.map(function (k) { return '<div class="rr-kpi"><span>' + k[0] + '</span><strong>' + k[1] + '</strong><small>' + k[2] + '</small></div>'; }).join("") + '</div>' +
      '<div class="rr-ops-two-col"><section class="rr-ops-panel"><h3>Today&#39;s wash schedule</h3>' + bookingTable(rows) + '</section><section class="rr-ops-panel"><h3>Studio pulse</h3>' + pulse + '<button class="rr-btn rr-btn-dark rr-btn-small" style="margin-top:15px" data-ops-page="live">OPEN WASH FLOOR ↗</button></section></div>';
  }

  function renderLive() {
    const active = state.bookings.filter(function (b) { return b.date === dateKey(new Date()) && (b.status === "washing" || b.status === "ready"); });
    const queue = state.bookings.filter(function (b) { return b.date === dateKey(new Date()) && b.status === "checked-in"; });
    const bays = BAYS.map(function (bay) {
      const booking = active.find(function (b) { return b.bay === bay; });
      return '<article class="rr-bay"><div class="rr-bay-top"><strong>' + bay + '</strong><span>' + (booking ? "IN USE" : "AVAILABLE") + '</span></div>' + (booking ? '<div class="rr-bay-customer"><strong>' + escapeHTML(booking.name) + '</strong><small>' + escapeHTML(booking.serviceName) + ' · ' + escapeHTML(booking.time) + '</small>' + statusPill(booking.status) + '<div class="rr-action-row" style="margin-top:13px">' + bookingActionButtons(booking) + '</div></div>' : '<div class="rr-bay-empty">Ready for the next vehicle.</div>') + '</article>';
    }).join("");
    return pageHeader("Wash floor","Follow each vehicle from check-in through the wash to collection.") +
      '<section class="rr-ops-panel"><h3>Bay status · ' + dateLabel(dateKey(new Date())) + '</h3><div class="rr-bay-grid">' + bays + '</div></section>' +
      '<section class="rr-ops-panel" style="margin-top:13px"><h3>Checked in · waiting for a bay</h3>' + (queue.length ? bookingTable(queue) : '<div class="rr-empty-state">No vehicles waiting for a bay.</div>') + '</section>';
  }

  function renderBookings() {
    const statuses = ["all","booked","checked-in","washing","ready","completed","cancelled"];
    return pageHeader("Bookings & arrivals","Find an arrival, check a vehicle in and move each job through the wash.") +
      '<section class="rr-ops-panel"><div class="rr-ops-controls rr-ops-controls-polished"><div class="rr-field"><label class="rr-sr-only" for="bookingSearch">Search bookings by customer, service or reference</label><input id="bookingSearch" type="search" aria-label="Search bookings by customer, service or reference" placeholder="Search name, service or reference…" value="' + escapeHTML(bookingSearch) + '"></div><div class="rr-field"><label class="rr-sr-only" for="bookingFilter">Filter bookings by status</label><select id="bookingFilter" aria-label="Filter bookings by status">' + statuses.map(function (s) { return '<option value="' + s + '"' + (bookingFilter === s ? " selected" : "") + '>' + (s === "all" ? "All statuses" : s.replace("-"," ")) + '</option>'; }).join("") + '</select></div><span class="rr-table-secondary">Status changes appear on the wash floor.</span></div><div id="bookingTableArea"></div></section>';
  }

  function bookingTable(rows) {
    if (!rows.length) return '<div class="rr-empty-state">No bookings match this view yet.</div>';
    return '<div class="rr-ops-table-wrap" role="region" aria-label="Booking records" tabindex="0"><table class="rr-ops-table"><thead><tr><th>Customer</th><th>Service</th><th>Arrival</th><th>Vehicle</th><th>Estimate</th><th>Status</th><th>Actions</th></tr></thead><tbody>' + rows.map(function (booking) {
      return '<tr><td data-label="Customer"><span class="rr-table-primary">' + escapeHTML(booking.name) + '</span><span class="rr-table-secondary">' + escapeHTML(booking.phone) + '</span></td><td data-label="Service">' + escapeHTML(booking.serviceName) + '</td><td data-label="Arrival"><span class="rr-table-primary">' + escapeHTML(booking.time) + '</span><span class="rr-table-secondary">' + prettyDate(booking.date) + '</span></td><td data-label="Vehicle">' + escapeHTML(booking.vehicle) + '</td><td data-label="Estimate"><strong>' + money(booking.price) + '</strong></td><td data-label="Status">' + statusPill(booking.status) + '</td><td data-label="Actions"><div class="rr-action-row">' + bookingActionButtons(booking) + '</div></td></tr>';
    }).join("") + '</tbody></table></div>';
  }

  function bookingActionButtons(booking) {
    const id = escapeHTML(booking.id);
    const name = escapeHTML(booking.name);
    if (booking.status === "booked") return '<button class="rr-action" data-booking-action="checkin" data-booking-id="' + id + '" aria-label="Check in ' + name + '">Check in</button><button class="rr-action danger" data-booking-action="cancel" data-booking-id="' + id + '" aria-label="Cancel booking ' + id + ' for ' + name + '">Cancel</button>';
    if (booking.status === "checked-in") return '<button class="rr-action" data-booking-action="start" data-booking-id="' + id + '" aria-label="Start wash for ' + name + '">Start wash</button><button class="rr-action danger" data-booking-action="cancel" data-booking-id="' + id + '" aria-label="Cancel booking ' + id + ' for ' + name + '">Cancel</button>';
    if (booking.status === "washing") return '<button class="rr-action" data-booking-action="ready" data-booking-id="' + id + '" aria-label="Mark ' + name + '&#39;s wash ready">Mark ready</button>';
    if (booking.status === "ready") return '<button class="rr-action" data-booking-action="complete" data-booking-id="' + id + '" aria-label="Complete the wash for ' + name + '">Complete job</button>';
    return '<span class="rr-table-secondary">No action</span>';
  }

  function renderCustomers() {
    const customers = getCustomers();
    const members = state.memberships.length;
    const completedVisits = state.bookings.filter(function (b) { return b.status === "completed"; }).length;
    const lifetimeValue = customers.reduce(function (sum,c) { return sum+c.spend; },0);
    const ownerView = currentRole === "owner";
    const metrics = ownerView
      ? [["KNOWN CUSTOMERS",customers.length,"Demo customer profiles"],["MEMBERSHIPS",members,"Sample member sign-ups"],["COMPLETED VISITS",completedVisits,"Across the sample history"],["COMPLETED REVENUE",money(lifetimeValue),"Completed wash revenue"]]
      : [["CUSTOMER PROFILES",customers.length,"For service and check-in support"],["MEMBERSHIPS",members,"Sample member sign-ups"],["COMPLETED VISITS",completedVisits,"Across the sample history"],["TODAY'S ARRIVALS",state.bookings.filter(function (b) { return b.date === dateKey(new Date()) && b.status !== "cancelled"; }).length,"Scheduled customer visits"]];
    const spendHeading = ownerView ? "<th>Lifetime spend</th>" : "";
    return pageHeader("Customers & members","A clear view of sample visits, memberships and customer value.") +
      '<div class="rr-ops-grid">' + metrics.map(function (metric) { return '<div class="rr-kpi"><span>' + metric[0] + '</span><strong>' + metric[1] + '</strong><small>' + metric[2] + '</small></div>'; }).join("") + '</div>' +
      '<section class="rr-ops-panel rr-ops-panel-gap"><h3>Customer register</h3><div class="rr-ops-table-wrap" role="region" aria-label="Customer records" tabindex="0"><table class="rr-ops-table"><thead><tr><th>Customer</th><th>Mobile</th><th>Completed visits</th>' + spendHeading + '<th>Last activity</th><th>Membership</th></tr></thead><tbody>' + customers.map(function (c) {
        const spendCell = ownerView ? '<td data-label="Lifetime spend"><strong>' + money(c.spend) + '</strong></td>' : "";
        return '<tr><td data-label="Customer"><span class="rr-table-primary">' + escapeHTML(c.name) + '</span></td><td data-label="Mobile">' + escapeHTML(c.phone) + '</td><td data-label="Completed visits">' + c.visits + '</td>' + spendCell + '<td data-label="Last activity">' + prettyDate(c.last) + '</td><td data-label="Membership">' + (c.membership ? '<span class="rr-status completed">' + escapeHTML(c.membership) + '</span>' : '<span class="rr-table-secondary">—</span>') + '</td></tr>';
      }).join("") + '</tbody></table></div></section>';
  }

  function renderInventory() {
    return pageHeader("Stock & supplies","Keep the products and consumables ready for the next vehicle.") +
      '<div class="rr-stock-grid">' + state.inventory.map(function (item) {
        const low = item.stock <= item.min;
        return '<article class="rr-stock-card"><strong>' + escapeHTML(item.name) + '</strong><small>' + escapeHTML(item.unit) + '</small><div class="rr-stock-count">' + item.stock + '</div><span class="' + (low ? "rr-stock-low" : "rr-table-secondary") + '">' + (low ? "LOW STOCK · MIN " + item.min : "STOCK LEVEL HEALTHY") + '</span><div class="rr-stock-actions"><button type="button" data-stock-action="use" data-stock-id="' + escapeHTML(item.id) + '" aria-label="Use one unit of ' + escapeHTML(item.name) + '">− USE 1</button><button type="button" data-stock-action="add" data-stock-id="' + escapeHTML(item.id) + '" aria-label="Restock five units of ' + escapeHTML(item.name) + '">+ RESTOCK 5</button></div></article>';
      }).join("") + '</div><p class="rr-demo-note">Inventory actions update this local demo. A live client system can add supplier records, purchase orders, stock movement history and cost-of-goods tracking.</p>';
  }

  function renderTeam() {
    return pageHeader("Team & wash bays","See who is on shift and how each bay is set up.") +
      '<section class="rr-ops-panel"><h3>Today&#39;s team roster</h3>' + state.staff.map(function (person) {
        const initials = person.name.split(" ").map(function (x) { return x[0]; }).join("").slice(0,2);
        return '<div class="rr-staff-row"><div class="rr-staff-person"><span class="rr-avatar" aria-hidden="true">' + escapeHTML(initials) + '</span><span><strong>' + escapeHTML(person.name) + '</strong><small>' + escapeHTML(person.role) + ' · ' + escapeHTML(person.shift) + '</small></span></div><div class="rr-action-row"><span class="rr-status ' + (person.active ? "completed" : "cancelled") + '">' + (person.active ? "On shift" : "Off shift") + '</span><button class="rr-action" data-staff-toggle="' + escapeHTML(person.id) + '" aria-label="' + (person.active ? "Clock out " : "Clock in ") + escapeHTML(person.name) + '">' + (person.active ? "Clock out" : "Clock in") + '</button></div></div>';
      }).join("") + '</section><section class="rr-ops-panel rr-ops-panel-gap"><h3>Wash bay setup</h3><div class="rr-bay-grid">' + BAYS.map(function (bay,index) { return '<article class="rr-bay"><div class="rr-bay-top"><strong>' + bay + '</strong><span>' + ["EXPRESS","DETAIL","PROTECTION"][index] + '</span></div><div class="rr-bay-empty">' + ["Quick Reset and Signature Hand Wash","Interior Revival and Full Revival","Ceramic Shield and specialist treatments"][index] + '</div></article>'; }).join("") + '</div></section>';
  }

  function renderReports() {
    const days = [];
    for (let i=6;i>=0;i--) {
      const day = offsetDate(-i);
      const value = state.bookings.filter(function (b) { return b.date === day && b.status === "completed"; }).reduce(function (sum,b) { return sum + Number(b.price); },0);
      days.push({date:day,value:value});
    }
    const max = Math.max.apply(null,days.map(function (d) { return d.value; }).concat([1]));
    const total = days.reduce(function (sum,d) { return sum+d.value; },0);
    const completed = state.bookings.filter(function (b) { return b.status === "completed"; });
    const completedRevenue = completed.reduce(function (sum,b) { return sum + Number(b.price); },0);
    const average = completed.length ? completedRevenue / completed.length : 0;
    const serviceTotals = {};
    completed.forEach(function (b) { serviceTotals[b.serviceName] = (serviceTotals[b.serviceName] || 0) + Number(b.price); });
    const services = Object.keys(serviceTotals).sort(function (a,b) { return serviceTotals[b]-serviceTotals[a]; });
    const chartDescription = days.map(function (d) { return new Date(d.date+"T12:00:00").toLocaleDateString("en-ZA",{weekday:"long"}) + ": " + money(d.value); }).join("; ");
    return pageHeader("Revenue & reports","Review completed work, sample revenue and the services driving the mix.") +
      '<div class="rr-ops-grid"><div class="rr-kpi"><span>7-DAY REVENUE</span><strong>' + money(total) + '</strong><small>Completed sample jobs in period</small></div><div class="rr-kpi"><span>COMPLETED JOBS</span><strong>' + completed.length + '</strong><small>All demo history</small></div><div class="rr-kpi"><span>AVERAGE TICKET</span><strong>' + money(average) + '</strong><small>Per completed wash</small></div><div class="rr-kpi"><span>MEMBER BASE</span><strong>' + state.memberships.length + '</strong><small>Sample sign-ups</small></div></div>' +
      '<div class="rr-ops-two-col"><section class="rr-ops-panel"><h3>Revenue · last 7 days</h3><div class="rr-bar-chart" role="img" aria-label="Sample revenue by day for the last seven days. ' + escapeHTML(chartDescription) + '">' + days.map(function (d) { const height = Math.max(5,Math.round(d.value/max*100)); const label = new Date(d.date+"T12:00:00").toLocaleDateString("en-ZA",{weekday:"short"}); return '<div class="rr-bar-col" aria-hidden="true"><small>' + (d.value ? Math.round(d.value/100)/10 + "k" : "—") + '</small><div class="rr-bar" style="--bar-height:' + height + '%"></div><span>' + label + '</span></div>'; }).join("") + '</div></section><section class="rr-ops-panel"><h3>Service mix · revenue</h3>' + (services.length ? services.map(function (name) { return '<div class="rr-staff-row"><div><strong>' + escapeHTML(name) + '</strong><small class="rr-table-secondary">Completed sample services</small></div><b>' + money(serviceTotals[name]) + '</b></div>'; }).join("") : '<div class="rr-empty-state">Complete a sample booking to see the service mix.</div>') + '</section></div>';
  }

  function renderSettings() {
    return pageHeader("Services & settings","Adjust sample service prices or restore the original demonstration workspace.") +
      '<section class="rr-ops-panel"><h3>Wash menu pricing · sedan base price</h3>' + SERVICES.map(function (service) {
        return '<div class="rr-price-control"><div><strong>' + escapeHTML(service.name) + '</strong><small>' + service.duration + ' minute estimate</small></div><b>' + money(getPrice(service.id)) + '</b><button class="rr-action" data-price-adjust="-25" data-service-id="' + service.id + '" aria-label="Reduce ' + escapeHTML(service.name) + ' price by R25">− R25</button><button class="rr-action" data-price-adjust="25" data-service-id="' + service.id + '" aria-label="Increase ' + escapeHTML(service.name) + ' price by R25">+ R25</button></div>';
      }).join("") + '</section><section class="rr-reset-box"><strong>RESET THE DEMONSTRATION WORKSPACE</strong><p>Restore the original sample bookings, team roster, stock levels and prices. Any sample bookings or membership previews created in this browser will be cleared.</p><button class="rr-action danger" type="button" data-reset-demo>RESET SAMPLE DATA</button></section>';
  }

  function updateBookingStatus(id, action) {
    const booking = state.bookings.find(function (b) { return b.id === id; });
    if (!booking) return;
    if (action === "cancel" && !window.confirm("Cancel sample booking " + booking.id + " for " + booking.name + "?")) return;
    if ((action === "checkin" || action === "start") && booking.date !== dateKey(new Date())) { showToast(booking.date > dateKey(new Date()) ? "This booking is scheduled for a future date." : "This booking date has passed. Review it before checking in."); return; }
    if (action === "checkin" && booking.status === "booked") booking.status = "checked-in";
    if (action === "start" && booking.status === "checked-in") {
      const occupied = state.bookings.filter(function (b) { return (b.status === "washing" || b.status === "ready") && b.date === dateKey(new Date()); }).map(function (b) { return b.bay; });
      const free = BAYS.find(function (bay) { return occupied.indexOf(bay) === -1; });
      if (!free) { showToast("All wash bays are occupied. Finish a job before assigning another vehicle."); return; }
      booking.status = "washing";
      booking.bay = free;
    }
    if (action === "ready" && booking.status === "washing") booking.status = "ready";
    if (action === "complete" && booking.status === "ready") { booking.status = "completed"; booking.bay = ""; }
    if (action === "cancel" && (booking.status === "booked" || booking.status === "checked-in")) { booking.status = "cancelled"; booking.bay = ""; }
    saveState();
    renderOpsPage(currentPage);
    showToast("Booking " + booking.id + " updated.");
  }

  function addBooking(event) {
    event.preventDefault();
    const form = $("#bookingForm");
    if (!form.reportValidity()) return;
    const date = $("#bookingDate").value;
    if (date < dateKey(new Date())) { showToast("Please choose today or a future date."); return; }
    const slot = $("#selectedSlot").value;
    if (!slot) { showToast("Please choose an available arrival time."); return; }
    const now = new Date();
    const currentTime = String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0");
    if (date === dateKey(now) && slot <= currentTime) { renderSlots(); showToast("That arrival time has already passed. Choose a later slot."); return; }
    const taken = state.bookings.filter(function (booking) { return booking.date === date && booking.time === slot && booking.status !== "cancelled"; }).length;
    if (taken >= 3) { renderSlots(); showToast("That arrival slot has just filled. Choose another time."); return; }
    const quote = calculateQuote();
    const name = $("#customerName").value.trim();
    const phone = $("#customerPhone").value.trim();
    const email = $("#customerEmail").value.trim();
    const vehicle = VEHICLES[$("#vehicleType").value].label;
    const booking = {
      id:bookingId(),name:name,phone:phone,email:email,vehicle:vehicle,
      serviceId:quote.service.id,serviceName:quote.service.name,date:date,time:slot,
      price:quote.total,status:"booked",bay:"",createdAt:Date.now(),
      addons:getSelectedAddons().map(function (addon) { return addon.name; })
    };
    state.bookings.unshift(booking);
    saveState();
    $("#confirmationRef").textContent = booking.id;
    $("#confirmationDetails").textContent = booking.serviceName + " · " + vehicle + " · " + dateLabel(date) + " at " + slot + " · " + money(booking.price) + ". This sample entry is saved in this browser only.";
    lastModalTrigger = document.activeElement;
    setPublicSiteInert(true);
    $("#bookingConfirmation").hidden = false;
    form.reset();
    $("#bookingService").value = "signature";
    $("#vehicleType").value = "sedan";
    $("#bookingDate").value = dateKey(new Date());
    $("#selectedSlot").value = "09:30";
    updateBookingForm();
    requestAnimationFrame(function () {
      const close = $("#bookingConfirmation").querySelector("[data-close-modal]");
      if (close) close.focus({preventScroll:true});
    });
  }

  function addMembership(event) {
    event.preventDefault();
    const form = $("#membershipForm");
    if (!form.reportValidity()) return;
    const name = $("#memberName").value.trim();
    const phone = $("#memberPhone").value.trim();
    const plan = $("#membershipPlan").value;
    state.memberships.unshift({id:"MEM-" + String(Date.now()).slice(-6),name:name,phone:phone,plan:plan,joined:dateKey(new Date())});
    saveState();
    form.reset();
    closeModalDialog($("#membershipModal"));
    showToast(plan + " sample membership added to the demo workspace.");
  }

  document.addEventListener("keydown", function (event) {
    const ops = $("#opsApp");
    const membership = $("#membershipModal");
    const confirmation = $("#bookingConfirmation");
    const activeDialog = ops && !ops.hidden ? ops : confirmation && !confirmation.hidden ? confirmation : membership && !membership.hidden ? membership : null;
    if (!activeDialog) return;
    if (event.key === "Escape") {
      event.preventDefault();
      if (activeDialog === ops) closeOps();
      else closeModalDialog(activeDialog);
      return;
    }
    if (event.key !== "Tab") return;
    const focusables = getDialogFocusables(activeDialog);
    if (!focusables.length) {
      event.preventDefault();
      activeDialog.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && (document.activeElement === first || !activeDialog.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !activeDialog.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  });

})();

  /* Pointer-reactive studio light and restrained 3D card tilt on fine pointers. */
  (function initHeroReaction() {
    const hero = document.querySelector(".rr-hero");
    const card = hero && hero.querySelector(".rr-hero-glass");
    if (!hero || !card) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reducedMotion || !finePointer) return;

    let frame = 0;
    hero.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        const rect = hero.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
        hero.style.setProperty("--rr-pointer-x", x.toFixed(1) + "%");
        hero.style.setProperty("--rr-pointer-y", y.toFixed(1) + "%");
        frame = 0;
      });
    }, { passive: true });

    hero.addEventListener("pointerleave", function () {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      hero.style.setProperty("--rr-pointer-x", "76%");
      hero.style.setProperty("--rr-pointer-y", "42%");
      card.style.setProperty("--rr-tilt-x", "0deg");
      card.style.setProperty("--rr-tilt-y", "0deg");
    });

    card.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      card.style.setProperty("--rr-tilt-x", ((0.5 - y) * 4).toFixed(2) + "deg");
      card.style.setProperty("--rr-tilt-y", ((x - 0.5) * 5).toFixed(2) + "deg");
    }, { passive: true });

    card.addEventListener("pointerleave", function () {
      card.style.setProperty("--rr-tilt-x", "0deg");
      card.style.setProperty("--rr-tilt-y", "0deg");
    });
  })();
})();
