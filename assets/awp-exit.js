(() => {
  "use strict";

  const script = document.currentScript;
  const home = script && script.dataset.home ? script.dataset.home : "../../index.html";
  const reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Pages that already have their own Alienway exit control should not get a duplicate.
  if (document.querySelector("[data-aw-exit], .alienway-exit, .awp-exit-button")) return;

  const style = document.createElement("style");
  style.id = "awp-exit-style";
  style.textContent = `
    .awp-exit-button {
      position: fixed; right: 18px; bottom: 18px; z-index: 10001;
      display: inline-flex; align-items: center; gap: 9px;
      max-width: calc(100vw - 24px); padding: 12px 15px;
      border: 1px solid rgba(255,255,255,.36); border-radius: 12px;
      background: rgba(10,16,24,.30); color: #fff; text-decoration: none;
      box-shadow: 0 8px 28px rgba(0,0,0,.18);
      -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
      font: 900 9px/1.3 Arial,sans-serif; letter-spacing: .9px;
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .awp-exit-button:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,.25); }
    .awp-exit-button:focus-visible { outline: 3px solid #74e8ff; outline-offset: 4px; }
    .awp-exit-mark { color: #74e8ff; font-size: 15px; line-height: 1; }
    .awp-exit-overlay {
      position: fixed; inset: 0; z-index: 100000; pointer-events: none;
      overflow: hidden; display: grid; place-items: center;
      background: rgba(5,9,14,.16); -webkit-backdrop-filter: blur(2px);
      backdrop-filter: blur(2px); animation: awp-overlay-in .18s ease-out both;
    }
    .awp-exit-title {
      position: relative; z-index: 3; max-width: calc(100vw - 32px);
      padding: 15px 22px; border: 1px solid rgba(255,255,255,.65);
      border-radius: 12px; background: rgba(8,15,22,.88); color: #fff;
      font: 900 11px/1.4 Arial,sans-serif; letter-spacing: 2px; text-align: center;
      box-shadow: 0 18px 55px rgba(0,0,0,.32);
      animation: awp-title .9s ease both;
    }
    .awp-exit-shard {
      position: absolute; z-index: 1; left: var(--left); top: var(--top);
      width: calc(100% / 7 + 3px); height: calc(100% / 6 + 3px);
      clip-path: polygon(0 0,100% 8%,82% 100%,12% 82%);
      background: linear-gradient(135deg,var(--shard),rgba(255,255,255,.12));
      border: 1px solid rgba(255,255,255,.4); -webkit-backdrop-filter: blur(3px);
      backdrop-filter: blur(3px); box-shadow: 0 8px 25px rgba(0,0,0,.12);
      transform-origin: center; animation: awp-shatter .92s cubic-bezier(.16,.72,.18,1) var(--delay) both;
    }
    @keyframes awp-overlay-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes awp-title {
      0% { opacity: 0; transform: scale(.7) translateY(12px); }
      24% { opacity: 1; transform: scale(1) translateY(0); }
      78% { opacity: 1; }
      100% { opacity: 0; transform: scale(.94) translateY(-8px); }
    }
    @keyframes awp-shatter {
      0% { opacity: 0; transform: translate3d(0,0,0) rotate(0) scale(.9); }
      12% { opacity: 1; }
      100% { opacity: 0; transform: translate3d(var(--tx),var(--ty),0) rotate(var(--rot)) scale(.18); }
    }
    @media (max-width: 600px) {
      .awp-exit-button { right: 10px; bottom: 10px; padding: 10px 12px; font-size: 8px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .awp-exit-button { transition: none; }
      .awp-exit-overlay, .awp-exit-shard, .awp-exit-title { animation: none !important; }
    }
  `;
  document.head.appendChild(style);

  const link = document.createElement("a");
  link.className = "awp-exit-button";
  link.href = home;
  link.setAttribute("data-aw-exit", "");
  link.setAttribute("aria-label", "Return to Alienway Production");
  const mark = document.createElement("span");
  mark.className = "awp-exit-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = "↗";
  const label = document.createElement("span");
  label.textContent = "BACK TO ALIENWAY PRODUCTION";
  link.append(mark, label);
  document.body.appendChild(link);

  let leaving = false;
  link.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;

    const destination = link.href || home;
    if (reducedMotion) {
      window.location.assign(destination);
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "awp-exit-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const title = document.createElement("div");
    title.className = "awp-exit-title";
    title.textContent = "RETURNING TO ALIENWAY PRODUCTION";
    overlay.appendChild(title);

    const colors = [
      "rgba(255,255,255,.78)", "rgba(120,220,255,.58)",
      "rgba(210,255,110,.58)", "rgba(255,190,120,.50)",
      "rgba(190,170,255,.55)"
    ];

    for (let i = 0; i < 42; i++) {
      const shard = document.createElement("i");
      const column = i % 7;
      const row = Math.floor(i / 7);
      shard.className = "awp-exit-shard";
      shard.style.setProperty("--left", (column * 100 / 7) + "%");
      shard.style.setProperty("--top", (row * 100 / 6) + "%");
      shard.style.setProperty("--tx", ((column - 3) * 19 + (Math.random() * 150 - 75)) + "vw");
      shard.style.setProperty("--ty", ((row - 2.5) * 21 + (Math.random() * 150 - 75)) + "vh");
      shard.style.setProperty("--rot", (Math.random() * 260 - 130) + "deg");
      shard.style.setProperty("--delay", (Math.random() * .16) + "s");
      shard.style.setProperty("--shard", colors[i % colors.length]);
      if (i % 2) shard.style.clipPath = "polygon(14% 0,100% 20%,74% 100%,0 68%)";
      overlay.appendChild(shard);
    }

    document.body.appendChild(overlay);
    document.documentElement.style.overflow = "hidden";
    window.setTimeout(() => window.location.assign(destination), 1120);
  });
})();