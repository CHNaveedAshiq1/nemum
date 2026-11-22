/* NEMUM, hero tilt and parallax, scroll reveals, counters, bag. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- header state ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- hero tilt + parallax ---------- */
  var hero = document.getElementById("hero");
  var tilt = document.getElementById("heroTilt");
  var word = document.querySelector(".hero-word");
  var glow = document.querySelector(".hero-glow");

  if (hero && tilt && finePointer && !reduceMotion) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    function loop() {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      tilt.style.transform =
        "rotateY(" + (cx * 14).toFixed(2) + "deg) rotateX(" + (-cy * 10).toFixed(2) + "deg)";
      if (word) {
        word.style.transform =
          "translate(calc(-50% + " + (cx * -22).toFixed(1) + "px), calc(-50% + " + (cy * -14).toFixed(1) + "px))";
      }
      if (glow) {
        glow.style.translate = (cx * 26).toFixed(1) + "px " + (cy * 18).toFixed(1) + "px";
      }
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    });
    hero.addEventListener("pointerleave", function () {
      tx = 0; ty = 0; kick();
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- stat counters ---------- */
  var counters = document.querySelectorAll(".count");
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- bag + toast ---------- */
  var bagCount = document.getElementById("bagCount");
  var bagBtn = document.getElementById("bagBtn");
  var toast = document.getElementById("toast");
  var count = 0;
  var toastTimer = null;

  function showToast(name) {
    toast.innerHTML = "Added <b>" + name + "</b> to your bag";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2400);
  }

  function flyToBag(fromEl) {
    if (reduceMotion || !fromEl.animate) return;
    var a = fromEl.getBoundingClientRect();
    var b = bagBtn.getBoundingClientRect();
    var dot = document.createElement("span");
    dot.className = "fly-dot";
    dot.style.left = (a.left + a.width / 2 - 8) + "px";
    dot.style.top = (a.top + a.height / 2 - 8) + "px";
    document.body.appendChild(dot);
    var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    var anim = dot.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: "translate(" + dx * 0.5 + "px," + (dy - 90) + "px) scale(.85)", opacity: 1, offset: 0.55 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.25)", opacity: 0.6 }
    ], { duration: 750, easing: "cubic-bezier(.22,.9,.28,1)" });
    anim.onfinish = function () { dot.remove(); };
  }

  document.querySelectorAll(".add-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      count += 1;
      bagCount.textContent = count;
      var name = btn.getAttribute("data-name") || "Sneaker";
      flyToBag(btn);
      bagBtn.classList.remove("pop");
      void bagBtn.offsetWidth;
      setTimeout(function () { bagBtn.classList.add("pop"); }, reduceMotion ? 0 : 560);
      showToast(name);
      btn.classList.add("added");
      var original = btn.firstChild.textContent;
      btn.firstChild.textContent = "Added ";
      setTimeout(function () {
        btn.classList.remove("added");
        btn.firstChild.textContent = original;
      }, 1600);
    });
  });
})();

/* ---------- product detail sheet ---------- */
(function(){
  var SPECS = {
    "Cloudrunner Aero":{story:"Our lightest road shoe. The Aero was drawn for runners who want the road to disappear: a feather knit upper on a plate that returns energy with every step.",inside:["One piece engineered knit upper, woven from recycled yarn","Nitrogen infused foam midsole with a nylon propulsion plate","Continental rubber outsole, wet grip compound"],made:["The knit is woven in one piece, so there are no seams to rub","Foam is infused with nitrogen for a softer, springier ride","Each pair is weighed by hand; over 212 g and it does not ship"],data:["212 g per shoe","8 mm drop","87% energy return","Road surface"],price:"€39.99",img:"img/shoe-cloudrunner.webp",cat:"Road Running"},
    "Velocity Knit":{story:"A tempo day shoe that still forgives. The Velocity Knit holds the midfoot like a sock and lets the toes splay when the pace rises.",inside:["Sock fit knit collar with locked in laces","Dual density foam, soft inside, firm outside","Reflective thread woven through the heel"],made:["Knit tension is mapped from pressure scans of 400 runners","The collar is knitted, not sewn, for a one piece fit","Tested over 500 km before the design was frozen"],data:["228 g per shoe","7 mm drop","Tempo days","Road surface"],price:"€34.99",img:"img/shoe-velocity.webp",cat:"Tempo Training"},
    "Court Classic":{story:"Full grain leather, cut like the originals from the seventies and finished by hand. The Classic is the one pair that goes with everything you own.",inside:["Full grain leather upper, vegetable tanned","Cork bed insole that moulds to your foot","Natural rubber cupsole, stitched not just glued"],made:["Leather is cut by hand and lasted for a full day","The cupsole is stitched through, so it can be resoled","Each pair is polished and checked before boxing"],data:["310 g per shoe","Flat court profile","Leather upper","Everyday wear"],price:"€29.99",img:"img/shoe-court.webp",cat:"Everyday Leather"},
    "Phantom Flex":{story:"Built for the runs that start after dark. The Phantom Flex wraps the foot in a flexible knit and lights up under headlights from every angle.",inside:["360 degree reflective knit upper","Flexible grooved midsole that moves with the foot","High grip outsole for wet pavements"],made:["Reflective yarn is woven in, never printed on","Flex grooves are cut after moulding for a natural bend","Night tested on wet city loops for a full winter"],data:["224 g per shoe","8 mm drop","Reflective knit","Night running"],price:"€36.99",img:"img/shoe-phantom.webp",cat:"Night Running"},
    "Stratus Motion":{story:"The chunky one, with a cloud under it. Stratus Motion stacks our softest foam into a sculpted sole that still feels stable at walking pace.",inside:["Double stack of our softest EVA foam","Suede and mesh layered upper","Wide base for a stable, relaxed ride"],made:["The sole is sculpted, then sanded smooth by hand","Foam densities differ front to back for a rolling step","Each colourway is dyed in small batches"],data:["286 g per shoe","10 mm drop","Max cushion","Lifestyle"],price:"€37.99",img:"img/shoe-stratus.webp",cat:"Lifestyle Chunky"},
    "Drift Runner":{story:"A retro profile in suede and nylon, rebuilt on a modern sole. The Drift looks vintage and walks like it was made this morning, because it was.",inside:["Pigskin suede and ripstop nylon upper","Modern EVA midsole hidden in a vintage shape","Gum rubber outsole with the original tread pattern"],made:["Panels are cut from the 1978 pattern, graded to modern sizes","Suede is brushed and waterproofed by hand","The sole unit is modern foam, dyed to match the era"],data:["268 g per shoe","9 mm drop","Suede upper","Retro style"],price:"€32.99",img:"img/shoe-drift.webp",cat:"Retro Suede"}
  };
  var sheet = document.getElementById("detailSheet"), scrim = document.getElementById("detailScrim");
  var current = null, size = "43";
  function openSheet(name){
    var d = SPECS[name]; if (!d) return;
    current = name; size = "43";
    document.getElementById("dImg").src = d.img;
    document.getElementById("dImg").alt = name;
    document.getElementById("dCat").textContent = d.cat;
    document.getElementById("dName").textContent = name;
    document.getElementById("dStory").textContent = d.story;
    document.getElementById("dInside").innerHTML = d.inside.map(function(x){return "<li>"+x+"</li>";}).join("");
    document.getElementById("dMade").innerHTML = d.made.map(function(x){return "<li>"+x+"</li>";}).join("");
    document.getElementById("dData").innerHTML = d.data.map(function(x){return "<span>"+x+"</span>";}).join("");
    document.getElementById("dPrice").textContent = d.price;
    var opts = document.getElementById("dOpts");
    opts.innerHTML = ["40","41","42","43","44","45","46"].map(function(z){
      return '<button type="button" data-size="'+z+'"'+(z===size?' class="is-active"':"")+">EU "+z+"</button>";
    }).join("");
    opts.querySelectorAll("button").forEach(function(b){ b.addEventListener("click", function(){
      size = b.getAttribute("data-size");
      opts.querySelectorAll("button").forEach(function(x){x.classList.toggle("is-active", x===b);});
    });});
    scrim.hidden = false;
    var showSheet = function(){ scrim.classList.add("show"); sheet.classList.add("open"); };
    requestAnimationFrame(showSheet); setTimeout(showSheet, 70);
    sheet.setAttribute("aria-hidden","false");
  }
  function closeSheet(){
    scrim.classList.remove("show"); sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden","true");
    setTimeout(function(){ scrim.hidden = true; }, 380);
  }
  document.querySelectorAll(".card").forEach(function(card){
    card.addEventListener("click", function(e){
      if (e.target.closest(".add-btn")) return;
      var btn = card.querySelector(".add-btn");
      if (btn) openSheet(btn.getAttribute("data-name"));
    });
  });
  document.getElementById("detailClose").addEventListener("click", closeSheet);
  scrim.addEventListener("click", closeSheet);
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeSheet(); });
  document.getElementById("dAdd").addEventListener("click", function(){
    if (!current) return;
    var btn = document.querySelector('.add-btn[data-name="'+current+'"]');
    if (btn) btn.click();
    showToast(current + ", EU " + size);
    closeSheet();
  });
})();

/* ---------- craft stat drill-downs ---------- */
(function(){
  var DATA = {
    weight:{title:"212 g, where every gram sits", body:"Weighed per shoe in EU 43, the lightest in the range: knit upper 68 g, nitrogen foam midsole 92 g, rubber outsole 34 g, insole, laces and trims 18 g. 68 + 92 + 34 + 18 = 212 g exactly. Any pair that weighs over the mark does not ship."},
    energy:{title:"87% energy return, how it is measured", body:"In the lab, a press loads the midsole and measures what comes back: of every 100 units of force the shoe takes in, 87 are returned to the runner. The foam on its own returns 91; the propulsion plate and the grip outsole give back 4 in stiffness and traction, landing the whole shoe at 87."},
    recycled:{title:"72% recycled upper, thread by thread", body:"Counted across the whole upper by weight of yarn: the main knit panels are 100% recycled yarn, the laces 100%, the lining 60% and the structural overlays 40%. Weighted together across every thread in the upper, that lands at 72%."}
  };
  var box = document.getElementById("drillBox"), openKey = null;
  function open(key){
    var d = DATA[key]; if (!d) return;
    openKey = key;
    document.getElementById("drillTitle").textContent = d.title;
    document.getElementById("drillBody").textContent = d.body;
    box.hidden = false;
    document.querySelectorAll("[data-drill]").forEach(function(el){ el.classList.toggle("is-active", el.getAttribute("data-drill") === key); });
  }
  document.querySelectorAll("[data-drill]").forEach(function(el){
    el.addEventListener("click", function(){ open(el.getAttribute("data-drill")); });
    el.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el.getAttribute("data-drill")); } });
  });
})();
