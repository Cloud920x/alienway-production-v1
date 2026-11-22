const designs = {
  "cafe-demo": {
    "name": "Café & Coffee Shop",
    "demo": "cafe-demo.html",
    "t": 0,
    "scope": "Your menu, opening hours, directions and a WhatsApp button.",
    "opts": [
      "carousel"
    ],
    "custom": ""
  },
  "bite-club": {
    "name": "Bite Club",
    "demo": "bite-club.html",
    "t": 0,
    "scope": "A takeaway menu with prices and a WhatsApp link for orders.",
    "opts": [
      "tabs"
    ],
    "custom": "Online checkout and delivery tracking"
  },
  "olive": {
    "name": "OLIVE",
    "demo": "olive/index.html",
    "t": 0,
    "scope": "A restaurant menu, contact form and WhatsApp bookings. Your team replies to each guest.",
    "opts": [
      "intro",
      "scroll",
      "tabs",
      "faq",
      "reservation"
    ],
    "custom": "Live table availability, online ordering and payments"
  },
  "automotive-car-wash": {
    "name": "Rinse / Ritual",
    "demo": "automotive/car-wash/index.html",
    "t": 1,
    "scope": "Customers request a wash. Staff can view the requests and confirm or reschedule them.",
    "opts": [
      "faq"
    ],
    "custom": "Recurring memberships, live slot availability and fleet accounts"
  },
  "automotive-medium": {
    "name": "Auto Plus",
    "demo": "automotive/medium/index.html",
    "t": 0,
    "scope": "A vehicle catalogue with photos, prices and an enquiry form.",
    "opts": [
      "filter",
      "gallery"
    ],
    "custom": "Live vehicle stock feeds"
  },
  "automotive-premium": {
    "name": "Automotive Signature",
    "demo": "automotive/premium/index.html",
    "t": 2,
    "scope": "Manage vehicle stock and sales enquiries with separate owner and manager views and a sales report.",
    "opts": [
      "intro",
      "scroll"
    ],
    "custom": "Finance calculators, returns and lender connections"
  },
  "construction-cheap": {
    "name": "Essential Contractor",
    "demo": "construction/cheap/index.html",
    "t": 0,
    "scope": "A service list, project photos and a form for customers to request a quote.",
    "opts": [],
    "custom": ""
  },
  "construction-medium": {
    "name": "Project Showcase",
    "demo": "construction/medium/index.html",
    "t": 0,
    "scope": "A portfolio of finished projects with testimonials and a basic quote form.",
    "opts": [
      "filter",
      "scroll",
      "form"
    ],
    "custom": ""
  },
  "construction-premium": {
    "name": "Atelier Structures",
    "demo": "construction/premium/index.html",
    "t": 2,
    "scope": "Track project tasks and material requests. Owners and managers can check progress in one report.",
    "opts": [],
    "custom": "Supplier purchasing, employee portals and client logins"
  },
  "retail-fashion": {
    "name": "Thread Theory",
    "demo": "retail/fashion/index.html",
    "t": 0,
    "scope": "A clothing catalogue with photos, prices and a WhatsApp enquiry button.",
    "opts": [
      "filter"
    ],
    "custom": "Shopping basket, live checkout and stock sync"
  },
  "retail-electronics": {
    "name": "NEXT",
    "demo": "retail/electronics/index.html",
    "t": 2,
    "scope": "Manage stock and orders with owner and manager views and one sales report.",
    "opts": [
      "filter"
    ],
    "custom": "Product comparisons, saved favourites and live checkout"
  },
  "retail-grocery": {
    "name": "Market & Meadow",
    "demo": "retail/grocery/index.html",
    "t": 2,
    "scope": "Manage grocery stock and customer orders with owner and manager views and one sales report.",
    "opts": [
      "filter",
      "tabs"
    ],
    "custom": "Live checkout, delivery slots and till connections"
  },
  "real-estate-stacked": {
    "name": "STACKED · Beza’s Hotel",
    "demo": "real-estate/stacked/index.html",
    "t": 2,
    "scope": "Handle room enquiries and track room status. Owner and manager views include one agreed report.",
    "opts": [
      "gallery"
    ],
    "custom": "Interactive 3D tower, live availability and booking platform connections"
  },
  "real-estate-marketplace": {
    "name": "Keystone",
    "demo": "real-estate/marketplace/index.html",
    "t": 1,
    "scope": "Show properties and send enquiries to a staff screen where agents can follow up.",
    "opts": [
      "filter",
      "gallery"
    ],
    "custom": "Bond calculators, saved comparisons and multi-agency accounts"
  },
  "professional-caldwell-legal": {
    "name": "Caldwell Legal",
    "demo": "professional/caldwell-legal/index.html",
    "t": 0,
    "scope": "Introduce the practice, list legal services and let visitors request a consultation.",
    "opts": [
      "intro",
      "scroll"
    ],
    "custom": "Private client portal"
  },
  "professional-ledger-co": {
    "name": "Ledger & Co.",
    "demo": "professional/ledger-co/index.html",
    "t": 0,
    "scope": "Explain your accounting services and collect consultation enquiries.",
    "opts": [
      "faq",
      "scroll"
    ],
    "custom": "Secure document uploads and accounting software connections"
  },
  "blog": {
    "name": "MARGIN",
    "demo": "blog/index.html",
    "t": 1,
    "scope": "Publish stories through a staff editing screen and organise them into a journal.",
    "opts": [
      "video",
      "scroll"
    ],
    "custom": "Reader accounts, saved stories and custom analytics"
  }
};
const monthlyCare = 465;
const packages = [["Starter", 3500, 3, 15, 20, 30], ["Business", 7500, 6, 30, 40, 60], ["Stacked", 15000, 8, 50, 60, 120]];
const extras = {
  "intro": [
    "Animated opening",
    350
  ],
  "scroll": [
    "Sections that animate as you scroll · one page",
    450
  ],
  "tabs": [
    "Switchable category tabs",
    500
  ],
  "faq": [
    "Questions that expand when tapped",
    200
  ],
  "reservation": [
    "Reservation request sent to your inbox",
    750
  ],
  "filter": [
    "Search and filter one catalogue",
    950
  ],
  "gallery": [
    "Full-screen photo gallery",
    450
  ],
  "carousel": [
    "Swipeable photo gallery",
    400
  ],
  "form": [
    "Second enquiry form",
    450
  ],
  "video": [
    "Supplied video as a background",
    450
  ]
};
const get = id => document.getElementById(id);
const money = value => 'R ' + value.toLocaleString('en-ZA').replace(/[^0-9]/g, ',');
const units = [['Extra pages', 650], ['Extra photos', 25], ['Extra simple items', 15]];
const design = get('design');
const simple = get('simple');
const selected = new URLSearchParams(location.search).get('design');
if (Object.hasOwn(designs, selected)) design.value = selected;

function render() {
  get('unavailable').hidden = true;
  get('configuration').hidden = false;
  get('receipt').hidden = false;
  const item = designs[design.value];
  const tier = simple.checked ? 0 : item.t;
  const [label, base, pages, photos, items, minutes] = packages[tier];
  get('name').textContent = item.name;
  get('preview').href = item.demo;
  get('simpleRow').hidden = item.t === 0 && !item.opts.length;
  get('scope').textContent = simple.checked ? 'Use this look for a simple site with your services, photos and direct enquiries. Staff tools are separate.' : item.scope;
  get('limits').textContent = label + ' covers up to ' + pages + ' pages, ' + photos + ' supplied photos and ' + items + ' simple listings.';
  get('custom').textContent = item.custom ? 'Priced separately if needed: ' + item.custom + '. We confirm the cost before you commit.' : '';
  get('options').replaceChildren();
  const included = simple.checked ? [] : item.opts;
  const suggestedTotal = included.reduce((sum, key) => sum + extras[key][1], base);
  get('headlinePrice').textContent = money(suggestedTotal) + ' once-off';
  get('example').textContent = included.length ? 'These features are selected in the advertised package. Untick any you don’t need.' : 'Your website is ready at the base price. Choose an extra only if you need it.';
  const more = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Other extras you can choose';
  more.append(summary);
  for (const [key, [name, cost]] of Object.entries(extras)) {
    if (key === 'reservation' && !simple.checked && ['automotive-car-wash', 'real-estate-stacked'].includes(design.value)) continue;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = key;
    input.checked = included.includes(key);
    const row = document.createElement('label');
    row.append(input, name + ' · +' + money(cost));
    (item.opts.includes(key) ? get('options') : more).append(row);
  }
  get('options').append(more);
  get('quantity').replaceChildren();
  for (const [name, cost] of units) {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 0;
    input.step = 1;
    input.value = 0;
    const row = document.createElement('label');
    row.append(name + ' · ' + money(cost) + ' each ', input);
    get('quantity').append(row);
  }
  get('baseLabel').textContent = label + ' website';
  get('base').textContent = money(base);
  get('monthly').textContent = money(monthlyCare);
  get('care').textContent = 'Monthly care includes ' + minutes + ' minutes of content updates. Fixes to delivered features are included separately.';
  update();
}

function update() {
  const item = designs[design.value];
  const [tier, base] = packages[simple.checked ? 0 : item.t];
  let added = 0;
  const lines = [];
  for (const input of get('options').querySelectorAll(':checked')) {
    const [label, cost] = extras[input.value];
    added += cost;
    lines.push(label + ' ' + money(cost));
  }
  let valid = true;
  get('quantity').querySelectorAll('input').forEach((input, index) => {
    const count = Number(input.value);
    if (!input.validity.valid || !Number.isSafeInteger(count) || count < 0 || count > 1000000) valid = false;
    if (count > 0) {
      const [label, rate] = units[index];
      added += count * rate;
      lines.push(count + ' ' + label.toLowerCase() + ' ' + money(count * rate));
    }
  });
  get('headlinePrice').textContent = valid ? money(base + added) + ' once-off' : 'Check quantities';
  get('extra').textContent = valid ? money(added) : 'Check quantities';
  get('total').textContent = valid ? money(base + added) : 'Enter whole quantities from 0 to 1,000,000';
  const enquiry = get('enquire');
  if (!valid) {
    enquiry.removeAttribute('href');
    return;
  }
  const query = new URLSearchParams({template:item.name, package:tier + ' · ' + money(base + added) + ' once-off + ' + money(monthlyCare) + '/month', extras:lines.join(' / ') || 'None selected'});
  enquiry.href = 'start-project.html?' + query;
}
design.addEventListener('change', () => {
  simple.checked = false;
  history.replaceState(null, '', '?design=' + design.value);
  render();
});
simple.addEventListener('change', render);
get('options').addEventListener('change', update);
get('quantity').addEventListener('input', update);
if (selected && !Object.hasOwn(designs, selected)) {
  get('unavailable').hidden = false;
  design.selectedIndex = -1;
  get('configuration').hidden = true;
  get('receipt').hidden = true;
} else {
  render();
}
