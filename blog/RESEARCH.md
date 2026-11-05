# MARGIN — research translated into a working demo

Research reviewed 5 November 2026. MARGIN is a fictional independent journal. Its sample author identities, comments and business metrics are illustrative. Original essays are written for this demo, not copied from research sources.

## What the research suggests
- Blogging involves much more than writing: editorial judgement, photography, distribution, business administration and maintaining an audience relationship. Nomadic Matt’s first-person account and Pinch of Yum’s retrospective illustrate different paths, not representative earnings.
- Orbit Media’s 2026 survey of 1,042 content marketers reports an average writing time of 3 hours 20 minutes and reduced confidence in results. This is self-reported content-marketer data, not a promise about an independent blogger’s outcomes.
- Patreon’s 2025 State of Create surveyed over 1,000 creators and 2,000 fans. It describes pressure to publish, unreliable access to followers and unpredictable income. It is a platform-sponsored, broader-creator survey, not a blogger-only census.
- Direct audience relationships deserve a visible place in the design. A considered newsletter invitation can coexist with a calm reading experience.
- Ghost’s publishing model connects web, newsletter and membership outcomes. Measuring only raw views misses parts of the reader relationship.
- Google’s people-first guidance supports clear authorship and genuinely useful content. It does not guarantee search rankings.
- W3C reflow and text-spacing guidance inform narrow layouts, adjustable reading type and avoiding fixed-height text containers.

## Product decisions
| Need | Implemented response |
| --- | --- |
| Reader discovery | Category filtering, full-text search, sorting and related stories |
| Reader retention | Saved articles, a direct-link story per seed article and newsletter demo |
| Comfortable reading | Reading progress, table of contents, text sizing, paper/night modes, print view |
| Creative workload | Drafts, review queue, planned dates, writing preview and tab-session recovery |
| Editorial trust | Author/date information, image descriptions, sponsorship labels and original sample essays |
| Community administration | Local reader comments and approval/hide moderation |
| Business visibility | Owner-only illustrative revenue/cost report and CSV export |
| Ownership | Local JSON backup and a clearly confirmed reset |
| Team workflows | Owner and editor views; editors cannot publish, change published posts or access business/settings controls in the UI |
| Realistic demos | Explicit browser-only persistence; no fake sending, charging, tracking or secure authentication |

Planned dates do not execute in the background. The owner manually publishes them. Local demo edits do not update the shared GitHub deployment. A production implementation needs server-enforced identity and roles, a content database, backups, an email provider and payment/analytics integrations if required. None are implied to exist here.

## Sources
1. Orbit Media, Blogging Statistics 2026: https://www.orbitmedia.com/blog/blogging-statistics/
2. Patreon, State of Create 2025: https://stateofcreate.co/
3. Nomadic Matt, 20 Things I Learned From 12 Years Blogging: https://www.nomadicmatt.com/travel-blogs/10-years-blogging/
4. Pinch of Yum, Income Reports: What We Learned, and Why We’re Stopping (historical retrospective): https://pinchofyum.com/what-we-learned-why-were-stopping
5. ProBlogger, Can You Really Make Money Blogging? (historical practitioner account; not used as current income statistics): https://problogger.com/podcast/can-you-really-make-money-blogging/
6. Ghost, Post analytics: https://ghost.org/help/post-analytics/
7. The Minimalists, newsletter: https://www.theminimalists.com/subscribe/
8. Google Search Central, Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
9. W3C, Understanding Reflow: https://www.w3.org/WAI/WCAG21/Understanding/reflow
10. W3C, Understanding Text Spacing: https://www.w3.org/WAI/WCAG22/Understanding/text-spacing

## Visual references translated, not copied
An editorial masthead, a large cover story and distinct story photography establish a magazine identity. A restrained rust/forest/paper palette and subtle paper texture keep backgrounds intentional. Animation is limited to cover images, card feedback and the Alienway exit; reduced-motion preferences are respected.

## Operation
Open index.html through a static web server. No install or build step. studio.html provides demo operations. Local storage key: margin-demo-v1. Writing recovery: sessionStorage margin-writing. Fonts: Google Fonts. Photography: Unsplash image URLs.
