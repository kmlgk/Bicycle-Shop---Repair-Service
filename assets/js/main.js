/* ==========================================================================
   Spoke & Gear Bicycle Co. — main.js
   Theme / RTL / nav / forms / mock auth + repair-tracking dashboard
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     0. Page loader
     --------------------------------------------------------------------- */
  window.addEventListener("load", function () {
    var loader = document.getElementById("page-loader");
    if (loader) setTimeout(function () { loader.classList.add("loaded"); }, 250);
  });

  /* ---------------------------------------------------------------------
     1. Theme (dark/light) — persisted in localStorage
     --------------------------------------------------------------------- */
  var root = document.documentElement;
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    root.classList.toggle("dark", t === "dark");
    localStorage.setItem("sg_theme", t);
    document.querySelectorAll("[data-theme-icon]").forEach(function (el) {
      el.innerHTML = t === "dark" ? ICON_SUN : ICON_MOON;
    });
  }
  var ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  var ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';

  var savedTheme = localStorage.getItem("sg_theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(savedTheme);

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-theme-toggle]")) {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    }
  });

  /* ---------------------------------------------------------------------
     2. RTL / LTR — persisted in localStorage
     --------------------------------------------------------------------- */
  function applyDir(d) {
    document.documentElement.setAttribute("dir", d);
    localStorage.setItem("sg_dir", d);
    document.querySelectorAll("[data-dir-label]").forEach(function (el) {
      el.textContent = d === "rtl" ? "LTR" : "RTL";
    });
  }
  applyDir(localStorage.getItem("sg_dir") || "ltr");
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-dir-toggle]")) {
      applyDir(document.documentElement.getAttribute("dir") === "rtl" ? "ltr" : "rtl");
    }
  });

  /* ---------------------------------------------------------------------
     3. Header: always-visible sticky bar (shadow once scrolled) + mobile slide-down panel
     --------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 12);
    var btt = document.getElementById("back-to-top");
    if (btt) btt.classList.toggle("show", y > 480);
  }, { passive: true });

  var hamburger = document.getElementById("hamburger-btn");
  var mobilePanel = document.getElementById("mobile-panel");
  if (hamburger && mobilePanel) {
    hamburger.addEventListener("click", function () {
      var open = mobilePanel.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
      hamburger.classList.toggle("is-open", open);
    });
    mobilePanel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobilePanel.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Active nav link */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link,.mobile-link,.dropdown-link").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here) a.classList.add("active");
  });
  if (here === "index.html" || here === "home-2.html" || here === "") {
    document.querySelectorAll("[data-dropdown-btn]").forEach(function (b) { b.classList.add("active"); });
  }

  /* "Home" nav dropdown — hover handled in CSS; click toggles for touch, outside-click/Escape close */
  document.querySelectorAll("[data-dropdown-btn]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var wrap = btn.closest("[data-dropdown]");
      var open = wrap.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll("[data-dropdown].open").forEach(function (wrap) {
      wrap.classList.remove("open");
      wrap.querySelector("[data-dropdown-btn]").setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll("[data-dropdown].open").forEach(function (wrap) {
      wrap.classList.remove("open");
      wrap.querySelector("[data-dropdown-btn]").setAttribute("aria-expanded", "false");
    });
  });

  /* ---------------------------------------------------------------------
     4. Back to top
     --------------------------------------------------------------------- */
  var backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     5. Toast helper
     --------------------------------------------------------------------- */
  window.sgToast = function (msg) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.classList.remove("show"); }, 3200);
  };

  /* ---------------------------------------------------------------------
     6. Reveal-on-scroll (AOS init if present)
     --------------------------------------------------------------------- */
  if (window.AOS) { AOS.init({ duration: 700, once: true, offset: 60, easing: "ease-out-cubic" }); }

  /* Route-draw SVG animation */
  var routePaths = document.querySelectorAll(".route-path");
  if (routePaths.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("drawn"); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    routePaths.forEach(function (p) { io.observe(p); });
  }

  /* CountUp stats */
  document.querySelectorAll("[data-countup]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-countup"));
    var suffix = el.getAttribute("data-suffix") || "";
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io2.unobserve(en.target);
        var start = 0, dur = 1600, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var val = (1 - Math.pow(1 - p, 3)) * target;
          el.textContent = (target % 1 !== 0 ? val.toFixed(1) : Math.floor(val)) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io2.observe(el);
  });

  /* Typed hero headline */
  var typedEl = document.getElementById("typed-headline");
  if (typedEl && window.Typed) {
    new Typed("#typed-headline", {
      strings: ["Road.", "Mountain.", "Kids'.", "Repaired &amp; Ready."],
      typeSpeed: 55, backSpeed: 30, backDelay: 1400, loop: true,
      smartBackspace: true
    });
  }

  /* GLightbox init */
  if (window.GLightbox) { GLightbox({ selector: ".glightbox" }); }

  /* ---------------------------------------------------------------------
     7. Accordion (FAQ, service details)
     --------------------------------------------------------------------- */
  document.querySelectorAll(".accordion-btn").forEach(function (btn) {
    if (btn.getAttribute("aria-expanded") === "true") {
      var openPanel = document.getElementById(btn.getAttribute("aria-controls"));
      if (openPanel) openPanel.style.maxHeight = openPanel.scrollHeight + "px";
    }
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var expanded = btn.getAttribute("aria-expanded") === "true";
      // close siblings within the same group
      var group = btn.closest("[data-accordion-group]");
      if (group) {
        group.querySelectorAll(".accordion-btn").forEach(function (b) {
          if (b !== btn) {
            b.setAttribute("aria-expanded", "false");
            var p = document.getElementById(b.getAttribute("aria-controls"));
            if (p) p.style.maxHeight = null;
          }
        });
      }
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (!expanded) panel.style.maxHeight = panel.scrollHeight + "px";
      else panel.style.maxHeight = null;
    });
  });

  /* ---------------------------------------------------------------------
     8. Tabs (bikes categories, dashboard tabs)
     --------------------------------------------------------------------- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var buttons = group.querySelectorAll(".tab-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
        btn.setAttribute("aria-selected", "true");
        var target = btn.getAttribute("data-tab-target");
        group.querySelectorAll("[data-tab-panel]").forEach(function (panel) {
          panel.classList.toggle("hidden", panel.getAttribute("data-tab-panel") !== target);
        });
      });
    });
  });

  /* ---------------------------------------------------------------------
     9. Category filter + client-side pagination (bikes.html, gallery.html —
        any page with [data-filter-btn] tabs, a [data-paginate] grid and a
        [data-pagination-nav] container)
     --------------------------------------------------------------------- */
  var filterButtons = document.querySelectorAll("[data-filter-btn]");
  var paginateWrap = document.querySelector("[data-paginate]");
  if (filterButtons.length) {
    var pageSize = paginateWrap ? (parseInt(paginateWrap.getAttribute("data-page-size"), 10) || 6) : 0;
    var pagerEl = document.querySelector("[data-pagination-nav]");
    var currentPage = 1;

    function activeFilterValue() {
      var activeBtn = document.querySelector('[data-filter-btn].is-active');
      return activeBtn ? activeBtn.getAttribute("data-filter-btn") : "all";
    }

    function matchingCards() {
      var val = activeFilterValue();
      return Array.prototype.filter.call(document.querySelectorAll("[data-filter-card]"), function (c) {
        return val === "all" || c.getAttribute("data-filter-card") === val;
      });
    }

    function renderCatalog() {
      var matches = matchingCards();
      document.querySelectorAll("[data-filter-card]").forEach(function (c) { c.style.display = "none"; });

      if (!paginateWrap) {
        matches.forEach(function (c) { c.style.display = ""; });
        return;
      }
      var totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      var start = (currentPage - 1) * pageSize;
      matches.forEach(function (c, i) {
        c.style.display = (i >= start && i < start + pageSize) ? "" : "none";
      });
      if (!pagerEl) return;
      if (totalPages <= 1) { pagerEl.innerHTML = ""; pagerEl.style.display = "none"; return; }
      pagerEl.style.display = "flex";
      var html = '<button class="page-btn" data-page-nav="prev"' + (currentPage === 1 ? " disabled" : "") + ' aria-label="Previous page">&larr;</button>';
      for (var p = 1; p <= totalPages; p++) {
        html += '<button class="page-btn' + (p === currentPage ? " is-active" : "") + '" data-page-go="' + p + '" aria-label="Page ' + p + '">' + p + '</button>';
      }
      html += '<button class="page-btn" data-page-nav="next"' + (currentPage === totalPages ? " disabled" : "") + ' aria-label="Next page">&rarr;</button>';
      pagerEl.innerHTML = html;
    }

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        currentPage = 1;
        renderCatalog();
      });
    });

    if (pagerEl) {
      pagerEl.addEventListener("click", function (e) {
        var goBtn = e.target.closest("[data-page-go]");
        var navBtn = e.target.closest("[data-page-nav]");
        if (goBtn) currentPage = parseInt(goBtn.getAttribute("data-page-go"), 10);
        else if (navBtn) currentPage += navBtn.getAttribute("data-page-nav") === "next" ? 1 : -1;
        else return;
        renderCatalog();
        paginateWrap.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    renderCatalog();
    // Pagination just changed page height (cards hidden/shown), which shifts every
    // section below the fold. AOS cached its trigger offsets before this ran, so
    // anything lower on the page (testimonials, financing band) would otherwise
    // stay stuck at opacity:0 — recalculate now that the layout has settled.
    if (window.AOS) AOS.refresh();
  }

  /* ---------------------------------------------------------------------
     10. Generic form validation helper
     --------------------------------------------------------------------- */
  function validateField(field) {
    var wrap = field.closest(".field-wrap") || field.parentElement;
    var valid = field.checkValidity();
    if (field.hasAttribute("data-min-len")) {
      valid = valid && field.value.trim().length >= parseInt(field.getAttribute("data-min-len"), 10);
    }
    wrap.classList.toggle("field-invalid", !valid);
    if (valid) field.classList.add("field-success"); else field.classList.remove("field-success");
    return valid;
  }
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    var fields = form.querySelectorAll("input[required],textarea[required],select[required]");
    fields.forEach(function (f) {
      f.addEventListener("blur", function () { validateField(f); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allValid = true;
      fields.forEach(function (f) { if (!validateField(f)) allValid = false; });
      if (!allValid) { sgToast("Please fix the highlighted fields."); return; }
      var successMsg = form.getAttribute("data-success-message") || "Submitted successfully.";
      var successEl = form.querySelector("[data-form-success]");
      if (successEl) {
        form.reset();
        form.classList.add("hidden");
        successEl.classList.remove("hidden");
      } else {
        sgToast(successMsg);
        form.reset();
      }
    });
  });

  /* Password visibility toggle */
  document.querySelectorAll("[data-toggle-password]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = document.getElementById(btn.getAttribute("data-toggle-password"));
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "Show" : "Hide";
    });
  });

  /* ---------------------------------------------------------------------
     11. Mock auth + repair-tracking data layer
     --------------------------------------------------------------------- */
  var DB_USERS = "sg_users", DB_SESSION = "sg_session", DB_REPAIRS = "sg_repairs", SEEDED = "sg_seeded";

  function seedData() {
    if (localStorage.getItem(SEEDED)) return;
    var users = [{
      name: "Priya Anand", email: "demo@spokeandgear.com", password: "demo1234", phone: "+1 (555) 019-2244"
    }];
    var repairs = [
      {
        id: "r1", ticketNo: "SG-10482", customerEmail: "demo@spokeandgear.com",
        bike: "Velostrada Alu Road (2023)", service: "Full Tune-Up + Brake Bleed",
        dateIn: "2026-08-06", estPickup: "2026-08-09", cost: 129,
        status: "queue", mechanic: "Assigned at check-in",
        history: [{ status: "queue", date: "2026-08-06 10:14 AM", note: "Bike checked in, waiting for a bay to open up." }]
      },
      {
        id: "r2", ticketNo: "SG-10471", customerEmail: "demo@spokeandgear.com",
        bike: "Ridgeback Trailhawk MTB", service: "Suspension Service + Drivetrain Clean",
        dateIn: "2026-08-04", estPickup: "2026-08-08", cost: 215,
        status: "service", mechanic: "Marcus O.",
        history: [
          { status: "queue", date: "2026-08-04 09:02 AM", note: "Bike checked in." },
          { status: "service", date: "2026-08-05 11:40 AM", note: "Fork lowers off, cleaning stanchions and replacing seals." }
        ]
      },
      {
        id: "r3", ticketNo: "SG-10459", customerEmail: "demo@spokeandgear.com",
        bike: "Little Ranger 16\" Kids Bike", service: "Training Wheel Fit + Safety Check",
        dateIn: "2026-08-02", estPickup: "2026-08-03", cost: 35,
        status: "ready", mechanic: "Dana K.",
        history: [
          { status: "queue", date: "2026-08-02 02:10 PM", note: "Bike checked in." },
          { status: "service", date: "2026-08-02 03:45 PM", note: "Fitting training wheels, torquing bolts, checking brakes." },
          { status: "ready", date: "2026-08-03 10:20 AM", note: "All done — ready for pickup at the front counter." }
        ]
      },
      {
        id: "r4", ticketNo: "SG-10390", customerEmail: "demo@spokeandgear.com",
        bike: "Velostrada Alu Road (2023)", service: "Flat Repair + Tube Replacement",
        dateIn: "2026-07-18", estPickup: "2026-07-18", cost: 22,
        status: "picked-up", mechanic: "Dana K.", pickedUpDate: "2026-07-18",
        history: [
          { status: "queue", date: "2026-07-18 08:30 AM", note: "Walk-in flat repair." },
          { status: "service", date: "2026-07-18 08:45 AM", note: "Rear tube replaced, tyre inspected for debris." },
          { status: "ready", date: "2026-07-18 09:10 AM", note: "Ready for pickup." },
          { status: "picked-up", date: "2026-07-18 05:50 PM", note: "Picked up by customer." }
        ]
      },
      {
        id: "r5", ticketNo: "SG-10225", customerEmail: "demo@spokeandgear.com",
        bike: "Ridgeback Trailhawk MTB", service: "Annual Overhaul",
        dateIn: "2026-05-11", estPickup: "2026-05-14", cost: 189,
        status: "picked-up", mechanic: "Marcus O.", pickedUpDate: "2026-05-14",
        history: [
          { status: "queue", date: "2026-05-11 09:00 AM", note: "Bike checked in for annual overhaul." },
          { status: "service", date: "2026-05-12 01:00 PM", note: "Full strip-down, new cables and housing fitted." },
          { status: "ready", date: "2026-05-14 11:00 AM", note: "Ready for pickup." },
          { status: "picked-up", date: "2026-05-14 04:15 PM", note: "Picked up by customer." }
        ]
      }
    ];
    localStorage.setItem(DB_USERS, JSON.stringify(users));
    localStorage.setItem(DB_REPAIRS, JSON.stringify(repairs));
    localStorage.setItem(SEEDED, "1");
  }
  seedData();

  function getUsers() { return JSON.parse(localStorage.getItem(DB_USERS) || "[]"); }
  function getRepairs() { return JSON.parse(localStorage.getItem(DB_REPAIRS) || "[]"); }
  function currentUser() {
    var email = localStorage.getItem(DB_SESSION);
    if (!email) return null;
    return getUsers().find(function (u) { return u.email === email; }) || null;
  }

  /* Reflect auth state in header (Login link <-> Account/logout) */
  function paintAuthUI() {
    var user = currentUser();
    document.querySelectorAll("[data-auth-slot]").forEach(function (slot) {
      if (user) {
        slot.innerHTML = '<a href="dashboard.html" class="btn btn-outline btn-sm" aria-label="Go to your dashboard"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg><span>' + user.name.split(" ")[0] + "</span></a>";
      } else {
        slot.innerHTML = '<a href="login.html" class="btn btn-outline btn-sm">Track My Repair</a>';
      }
    });
  }
  paintAuthUI();

  /* Login form (login.html) */
  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("login-email").value.trim().toLowerCase();
      var pass = document.getElementById("login-password").value;
      var errorBox = document.getElementById("login-error");
      var user = getUsers().find(function (u) { return u.email.toLowerCase() === email && u.password === pass; });
      if (!user) {
        errorBox.textContent = "We couldn't match that email and password. Try the demo account below, or double-check your details.";
        errorBox.classList.remove("hidden");
        return;
      }
      errorBox.classList.add("hidden");
      localStorage.setItem(DB_SESSION, user.email);
      sgToast("Welcome back, " + user.name.split(" ")[0] + "!");
      setTimeout(function () { location.href = "dashboard.html"; }, 500);
    });
  }
  document.querySelectorAll("[data-fill-demo]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.getElementById("login-email").value = "demo@spokeandgear.com";
      document.getElementById("login-password").value = "demo1234";
    });
  });

  /* Register form (register.html) */
  var registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("reg-name").value.trim();
      var email = document.getElementById("reg-email").value.trim().toLowerCase();
      var phone = document.getElementById("reg-phone").value.trim();
      var pass = document.getElementById("reg-password").value;
      var fields = registerForm.querySelectorAll("input[required]");
      var valid = true;
      fields.forEach(function (f) { if (!validateField(f)) valid = false; });
      if (!valid) { sgToast("Please fix the highlighted fields."); return; }
      var users = getUsers();
      if (users.some(function (u) { return u.email.toLowerCase() === email; })) {
        sgToast("An account with that email already exists — try logging in instead.");
        return;
      }
      users.push({ name: name, email: email, password: pass, phone: phone });
      localStorage.setItem(DB_USERS, JSON.stringify(users));
      localStorage.setItem(DB_SESSION, email);
      sgToast("Account created — welcome to Spoke & Gear!");
      setTimeout(function () { location.href = "dashboard.html"; }, 600);
    });
  }

  /* Logout */
  document.querySelectorAll("[data-logout]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      localStorage.removeItem(DB_SESSION);
      sgToast("You've been signed out.");
      setTimeout(function () { location.href = "index.html"; }, 500);
    });
  });

  /* ---------------------------------------------------------------------
     12. Dashboard rendering (dashboard.html)
     --------------------------------------------------------------------- */
  var dashRoot = document.getElementById("dashboard-root");
  if (dashRoot) {
    var user = currentUser();
    if (!user) {
      location.href = "login.html?redirect=dashboard";
    } else {
      renderDashboard(user);
    }
  }

  var STATUS_META = {
    "queue": { label: "In Queue", cls: "status-queue", step: 0 },
    "service": { label: "Being Serviced", cls: "status-service", step: 1 },
    "ready": { label: "Ready for Pickup", cls: "status-ready", step: 2 },
    "picked-up": { label: "Picked Up", cls: "status-ready", step: 3 }
  };

  function renderDashboard(user) {
    document.getElementById("dash-name").textContent = user.name.split(" ")[0];
    document.getElementById("dash-email").textContent = user.email;
    var all = getRepairs().filter(function (r) { return r.customerEmail === user.email; });
    var active = all.filter(function (r) { return r.status !== "picked-up"; });
    var history = all.filter(function (r) { return r.status === "picked-up"; });

    document.getElementById("dash-stat-active").textContent = active.length;
    document.getElementById("dash-stat-history").textContent = history.length;
    var ready = all.filter(function (r) { return r.status === "ready"; });
    document.getElementById("dash-stat-ready").textContent = ready.length;
    var totalSpent = history.reduce(function (s, r) { return s + r.cost; }, 0);
    document.getElementById("dash-stat-spent").textContent = "$" + totalSpent;

    var activeWrap = document.getElementById("active-repairs");
    var historyWrap = document.getElementById("repair-history");
    activeWrap.innerHTML = "";
    historyWrap.innerHTML = "";

    var bikesWrap = document.getElementById("your-bikes");
    if (bikesWrap) {
      var byBike = {};
      all.forEach(function (r) { byBike[r.bike] = (byBike[r.bike] || 0) + 1; });
      var names = Object.keys(byBike);
      bikesWrap.innerHTML = names.length ? names.map(function (name) {
        return '<div class="flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] px-4 py-3 bg-[rgb(var(--surface))]">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="rgb(var(--secondary))" stroke-width="1.6" class="shrink-0"><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 17l4-9h5l3 9M10 8h3M6 17l7-6"/></svg>' +
          '<div><p class="font-semibold text-sm">' + name + '</p><p class="text-xs text-[rgb(var(--ink-soft))]">' + byBike[name] + ' service record' + (byBike[name] > 1 ? 's' : '') + '</p></div></div>';
      }).join("") : '<p class="text-sm text-[rgb(var(--ink-soft))]">No bikes on file yet.</p>';
    }

    if (!active.length) {
      activeWrap.innerHTML = '<div class="spoke-card p-8 text-center col-span-full"><p class="text-[rgb(var(--ink-soft))]">No active repairs right now. Drop your bike at the counter or <a href="contact.html" class="text-[rgb(var(--secondary))] font-semibold underline">book a service</a> to start tracking it here.</p></div>';
    } else {
      active.forEach(function (r) { activeWrap.insertAdjacentHTML("beforeend", repairCard(r)); });
    }

    if (!history.length) {
      historyWrap.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-[rgb(var(--ink-soft))]">No completed repairs yet.</td></tr>';
    } else {
      history.forEach(function (r) { historyWrap.insertAdjacentHTML("beforeend", historyRow(r)); });
    }

    dashRoot.querySelectorAll("[data-receipt-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () { openReceipt(btn.getAttribute("data-receipt-btn")); });
    });
    var closeReceipt = document.getElementById("receipt-close");
    if (closeReceipt) closeReceipt.addEventListener("click", function () {
      document.getElementById("receipt-modal").classList.add("hidden");
    });
    var printBtn = document.getElementById("receipt-print");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    function openReceipt(id) {
      var r = all.find(function (x) { return x.id === id; });
      if (!r) return;
      var meta = STATUS_META[r.status];
      document.getElementById("receipt-body").innerHTML =
        '<div class="flex justify-between items-start mb-4"><div><p class="font-mono text-xs text-[rgb(var(--ink-soft))]">TICKET</p><p class="font-mono font-bold text-lg">' + r.ticketNo + '</p></div><span class="status-pill ' + meta.cls + '"><span class="dot"></span>' + meta.label + '</span></div>' +
        '<dl class="grid grid-cols-2 gap-y-2 text-sm mb-4">' +
        '<dt class="text-[rgb(var(--ink-soft))]">Bicycle</dt><dd class="text-right font-semibold">' + r.bike + '</dd>' +
        '<dt class="text-[rgb(var(--ink-soft))]">Service</dt><dd class="text-right font-semibold">' + r.service + '</dd>' +
        '<dt class="text-[rgb(var(--ink-soft))]">Checked in</dt><dd class="text-right">' + r.dateIn + '</dd>' +
        '<dt class="text-[rgb(var(--ink-soft))]">Mechanic</dt><dd class="text-right">' + r.mechanic + '</dd>' +
        '</dl><div class="border-t border-[rgb(var(--border))] pt-3 flex justify-between items-center"><span class="font-semibold">Total</span><span class="font-mono font-bold text-xl">$' + r.cost.toFixed(2) + '</span></div>' +
        '<div class="mt-5"><p class="text-xs font-bold uppercase tracking-wide text-[rgb(var(--ink-soft))] mb-2">Timeline</p><ul class="space-y-2 text-sm">' +
        r.history.map(function (h) { return '<li class="flex gap-2"><span class="font-mono text-xs text-[rgb(var(--ink-soft))] w-32 shrink-0">' + h.date + '</span><span>' + h.note + '</span></li>'; }).join("") +
        '</ul></div>';
      document.getElementById("receipt-modal").classList.remove("hidden");
    }
  }

  function repairCard(r) {
    var meta = STATUS_META[r.status];
    var steps = ["Queue", "Servicing", "Ready"];
    var railHtml = steps.map(function (s, i) {
      var node = '<div class="node ' + (i < meta.step ? "done" : i === meta.step ? "active" : "") + '">' + (i < meta.step ? "&#10003;" : i + 1) + '</div>';
      var seg = i < steps.length - 1 ? '<div class="seg ' + (i < meta.step ? "filled" : "") + '"></div>' : "";
      return node + seg;
    }).join("");
    return '<div class="spoke-card cat-repair p-6">' +
      '<div class="accent-bar"></div>' +
      '<div class="flex items-start justify-between gap-3 mb-3">' +
      '<div><p class="font-mono text-xs text-[rgb(var(--ink-soft))]">' + r.ticketNo + '</p><h3 class="font-bold text-lg leading-snug">' + r.bike + '</h3></div>' +
      '<span class="status-pill ' + meta.cls + '"><span class="dot"></span>' + meta.label + '</span></div>' +
      '<p class="text-sm text-[rgb(var(--ink-soft))] mb-4">' + r.service + '</p>' +
      '<div class="repair-rail mb-4">' + railHtml + '</div>' +
      '<div class="flex items-center justify-between text-sm">' +
      '<span class="text-[rgb(var(--ink-soft))]">Est. pickup: <strong class="text-[rgb(var(--ink))]">' + r.estPickup + '</strong></span>' +
      '<button class="text-[rgb(var(--secondary))] font-semibold" data-receipt-btn="' + r.id + '">View details &rarr;</button>' +
      '</div></div>';
  }

  function historyRow(r) {
    return '<tr class="border-b border-[rgb(var(--border))] last:border-0">' +
      '<td class="py-3 font-mono text-xs">' + r.ticketNo + '</td>' +
      '<td class="py-3 font-semibold">' + r.bike + '</td>' +
      '<td class="py-3 text-[rgb(var(--ink-soft))]">' + r.service + '</td>' +
      '<td class="py-3">' + r.pickedUpDate + '</td>' +
      '<td class="py-3 font-mono">$' + r.cost.toFixed(2) + '</td>' +
      '<td class="py-3 text-right"><button class="text-[rgb(var(--secondary))] font-semibold" data-receipt-btn="' + r.id + '">Receipt</button></td>' +
      '</tr>';
  }

  /* Ticket lookup (footer quick tool + contact) */
  var lookupForm = document.getElementById("ticket-lookup-form");
  if (lookupForm) {
    lookupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = document.getElementById("ticket-lookup-input").value.trim();
      if (!val) return;
      sgToast("Sign in to view live status for ticket " + val + ".");
      setTimeout(function () { location.href = "login.html"; }, 700);
    });
  }
})();
