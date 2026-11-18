# Alienway Production — whole-site final polish

**Date:** 18 November 2026  
**Branch:** `polish/whole-site-final-pass-2026-11-18`  
**Base:** `main`

## Scope

This pass covers the ten main Alienway Production agency pages: Home, About, Services, Work/Portfolio, Contact, Start Your Project, and the Automotive, Construction, Restaurant and Retail industry collections. The independent client-facing demos retain their separate art direction.

## Changes

- Standardised the footer across all ten agency pages with the animated/reveal treatment, consistent brand lockup, useful Explore and Connect navigation, working project-builder links and a back-to-top control.
- Elevated the brand promise into a distinct illuminated glass statement panel across all ten agency footers: a larger high-contrast headline with a blue-highlighted “WAY.”, a small promise kicker and brighter, more readable supporting copy. Added responsive sizing and refreshed the footer stylesheet cache version.
- Preserved the About page story and its line, “Some people wait for a way. We create one.”
- Routed the main About, Services and Portfolio conversion buttons to the dedicated three-step Project Builder instead of the general Contact page.
- Routed both restaurant collection template CTAs to the Project Builder with the selected restaurant template carried in the URL.
- Added the missing About link to the Automotive and Restaurant collection navigation and gave all collection navigation landmarks an accessible name.
- Removed the global Google Fonts CSS import. Fredoka now loads only on the homepage where it is used, with font/image preconnects and swap behaviour.
- Reduced idle animation work on touch-first screens: decorative card scenes pause while idle and still play their designed reactions when tapped. The trust gallery no longer animates an expensive shadow filter, and only its active mobile card swings.
- Added older Safari-compatible change-listener fallbacks for reduced-motion preferences.
- Added a semantic `main` landmark and page-level `h1` to Start Your Project, while preserving its visual heading treatment.
- Refreshed homepage asset query versions so browsers do not keep stale card, footer or CTA assets after deployment.

## Validation performed

- JavaScript syntax compilation passed for the four updated card controllers plus the shared footer and project-CTA controllers.
- CSS brace-balance checks passed for the global stylesheet and the affected story, approach, industry, process, why-deck, footer and CTA stylesheets.
- Rechecked local links, local assets and in-page fragments across the ten changed agency pages: no missing targets found.
- Confirmed each of the ten pages has exactly one shared footer, a valid back-to-top target, and the footer CSS/JS references.
- Confirmed all four industry collections expose the full main navigation, including About.
- Confirmed the About narrative copy was not edited.
- Ran a live Chromium smoke sweep against the published main-branch site: all ten in-scope routes returned HTTP 200 at 320, 768 and 1366 px (30 page/viewport combinations). No horizontal overflow, JavaScript console errors, uncaught page errors or failed network requests were detected. This exposed the Project Builder's missing `main`/`h1`, which is corrected on this branch.

## Validation limits

The published-main browser sweep was performed before these branch changes, so it validates the existing live layout rather than the new shared footers and touch-motion rules. Those changes—including the new brand statement panel—still need a fresh visual check after PR #33 is merged and deployed, ideally on physical phones/tablets as well as desktop. The earlier 12 November audit documented a broader 64-page browser/layout sweep. No real emails, payments, bookings or external integrations were exercised in this pass.
