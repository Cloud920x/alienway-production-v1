# Alienway Production website audit — 12 November 2026

## Scope

Repository baseline: `5af581c` (main after the car-wash polish merge). Reviewed 65 HTML files, including the archived About backup. Browser route and responsive checks covered the 64 active HTML pages: Home, Services, Work, About, Contact, industry collections, restaurant concepts, automotive, construction, retail, professional services, MARGIN and real estate, including their workspace pages.

## Repairs

- Connected the restaurant, automotive and construction Work cards to their collections; added access to the complete professional collection.
- Fixed the café's root-level return link.
- Added current-page navigation cues and larger mobile navigation targets to the five main pages; completed the Services document closing tags.
- Preserved selected industry, template, service, vehicle and finance-estimate context in the AWP enquiry form. Added visible field labels, honest email-draft wording, copy support and a selectable fallback. The existing `hello@alienway.com` destination is unchanged.
- Corrected the Atelier contact form's misleading email claim; submitting now produces a visible, copyable local enquiry preview.
- Replaced Atelier dashboard placeholder creation buttons with session-only sample project, team, stock, expense and client-entry forms. User-entered content is inserted as text. Wired status, location and low-stock filters, task labels and notifications. Added an explicit demo notice, a site-return link, and a direct particle-effect exit to AWP.
- Restricted Atelier financial summaries and project-budget columns to the owner preview; constrained navigation and entry actions by the selected demo role. Employees, storekeepers and clients start in their relevant views.
- Fixed grocery product-detail Add to basket and Save actions. Added Escape dismissal, named detail/close controls, and hid closed overlays from keyboard/accessibility navigation.
- Fixed grocery manager navigation: a second display loop had re-exposed owner-only buttons. Moved the agency exit away from the header and repaired its malformed backdrop CSS.
- Fixed repeated Price rows in electronics product comparison; labelled sorting and close controls, and hid the closed cart drawer.
- Fixed fashion colour names in product options and the bag; removed raw CSS printed at the bottom of its dashboard and placed it inside a style element.
- Made retail newsletter confirmations explicitly describe a demo preview instead of implying a real subscription.
- Corrected narrow-screen overflow in the main site, fashion header, grocery department grid and Atelier toolbar. Standardised Rand spacing in premium automotive listing prices and Keystone's price formatter.

The About story and restaurant package wording were preserved.

## Validation performed

- Static scan of all 65 HTML pages: no missing local href/src targets, invalid local fragment targets or duplicate IDs found after repairs.
- Node syntax checks of standalone JavaScript and inline scripts/modules: passed.
- `git diff --check`: passed.
- Browser route/layout sweep: 64 active pages at 320, 768 and 1366 px iframe widths (192 page/width combinations), with mobile interactions also inspected at 390 px. Desktop scrollbar gutters reduce the measured content width by 15 px. Detected page overflow was corrected and rechecked; intentional scrolling tables and navigation strips remain scrollable.
- Loaded and checked 142 distinct Unsplash photo IDs referenced directly or composed in source: all returned HTTP 200 image responses at the time of the audit. This does not guarantee future third-party availability or certify image licensing.
- Exercised Work → automotive collection → AWP enquiry, selected-demo retention, required form fields, copy fallback, and the café/Atelier return paths.
- Exercised Atelier enquiry preview, manager project creation, project-status filtering, storekeeper low-stock filtering, owner sample expense entry and client-view restrictions.
- Exercised fashion search, product detail/size selection, cart addition and simulated checkout; electronics category selection and two-product comparison; grocery product-popup addition/save and manager Orders navigation.
- Exercised automotive search/quick view and finance-estimate handoff. Verified car-wash manager wash-status progression and separate owner navigation.
- Exercised Ledger appointment preview, Caldwell enquiry preview, MARGIN newsletter preview and studio goal progress.
- Exercised Keystone photo/detail enquiry and Stacked Level 17 expansion, gallery navigation, room-specific pricing, enquiry handoff and Waterline experience content in scenic mode.

## Limits and client-launch considerations

This was a front-end audit with representative interactive journeys, not exhaustive testing of every possible input, every workspace mutation, every browser or every physical device. No emails, real bookings, real payments or external invitations were sent.

The cloud test browser disables WebGL. Stacked's scenic fallback and HTML interactions worked, but its animated 3D tower still requires a check on a WebGL-capable phone and desktop. No 3D rendering changes were made in this pass.

The demonstration workspaces use sample data and local/session state. Role selectors are presentation controls, not security boundaries. This audit does not certify authentication, data isolation, load capacity, production booking/payment integrations or security of a deployed backend. Existing client-side stored data and dynamic rendering need a separate security review before accepting real customer data.

The AWP form opens an email draft; delivery depends on the visitor's email application and the existing mailbox. Mailbox ownership/delivery were not verified. Phone/map/contact details labelled illustrative or unconfigured in fictional demos remain examples; no real business details were invented.

Atelier entries last until reload and are shown in their relevant tables. Its overview metrics are explicitly labelled an illustrative snapshot, not recalculated accounting totals.
