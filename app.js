/* ==========================================================
   app.js — খাঁটি ফসল (ডেমো)
   Vanilla JS। .NET MVC তে কনভার্ট করার নোট:
   - PRODUCTS / CATEGORIES  -> Controller থেকে JSON (বা Razor foreach)
   - Cart                   -> Session / Database (CartController API)
   - placeOrder()           -> POST /Order/Create
   ========================================================== */

(function () {
  "use strict";

  /* ---------- কনফিগ ---------- */
  const CONFIG = {
    currency: "৳",
    freeShipOver: 1500,
    shipFee: 80,
    storageKey: "khati_fosol_cart_v1",
    coupons: { DEMO10: 10, WELCOME10: 10, EID15: 15 } // শতাংশ ছাড়
  };

  /* ---------- স্টেট ---------- */
  const state = {
    category: "all",
    search: "",
    sort: "default",
    cart: loadCart(),     // [{key, id, weightLabel, factor, qty}]
    coupon: null          // {code, percent}
  };

  /* ---------- হেল্পার ---------- */
  const $  = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const BN = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
  const bn = (n) => String(n).replace(/\d/g, (d) => BN[d]);
  const money = (n) => CONFIG.currency + bn(Math.round(n).toLocaleString("en-US"));
  const catName = (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || "";
  const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
  const unitPrice = (p, factor) => Math.round(p.price * factor);
  const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || []; }
    catch (e) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.cart)); } catch (e) { /* ignore */ }
  }

  /* ---------- টোস্ট ---------- */
  function toast(msg, type = "ok") {
    const el = document.createElement("div");
    el.className = "toast " + type;
    el.textContent = msg;
    $("#toastWrap").appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* ==========================================================
     ক্যাটাগরি ও ফিল্টার
     ========================================================== */
  function renderCategories() {
    const icons = { ghee: "🧈", honey: "🍯", nuts: "🌰", raisin: "🍇", dry: "🍑", dates: "🌴" };
    $("#catGrid").innerHTML = CATEGORIES.filter((c) => c.id !== "all").map((c) => {
      const count = PRODUCTS.filter((p) => p.cat === c.id).length;
      return `<div class="cat-card" data-cat="${c.id}" tabindex="0" role="button">
        <span>${icons[c.id]}</span><h3>${c.name}</h3><small>${bn(count)}টি পণ্য</small></div>`;
    }).join("");
  }

  function renderFilters() {
    $("#filters").innerHTML = CATEGORIES.map((c) =>
      `<button class="filter-btn ${c.id === state.category ? "active" : ""}" data-cat="${c.id}">${c.name}</button>`
    ).join("");
  }

  /* ==========================================================
     প্রোডাক্ট গ্রিড
     ========================================================== */
  function getVisibleProducts() {
    let list = PRODUCTS.filter((p) => state.category === "all" || p.cat === state.category);
    const q = state.search.trim().toLowerCase();
    if (q) list = list.filter((p) => (p.name + " " + p.en + " " + catName(p.cat)).toLowerCase().includes(q));

    const sorters = {
      priceAsc:  (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      rating:    (a, b) => b.rating - a.rating,
      name:      (a, b) => a.name.localeCompare(b.name, "bn")
    };
    if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
    return list;
  }

  function weightOptions(p) {
    return WEIGHTS[p.weights].map((w, i) =>
      `<option value="${i}">${w.label} — ${money(unitPrice(p, w.factor))}</option>`).join("");
  }

  function productCard(p, i) {
    const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    return `
      <article class="card" data-id="${p.id}" style="animation-delay:${Math.min(i, 12) * 40}ms">
        <div class="card__img" style="background:${p.bg}" data-quick="${p.id}">
          ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
          ${off ? `<span class="discount">-${bn(off)}%</span>` : ""}
          <span>${p.emoji}</span>
        </div>
        <div class="card__body">
          <div class="card__cat">${catName(p.cat)}</div>
          <h3 class="card__title" data-quick="${p.id}">${esc(p.name)}</h3>
          <div class="rating">${stars(p.rating)} <small>${bn(p.rating)} (${bn(p.reviews)})</small></div>
          <div class="price"><b>${money(p.price)}</b>${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}<small>/কেজি</small></div>
          <div class="card__row">
            <select class="weight-select" aria-label="ওজন">${weightOptions(p)}</select>
            <button class="add-btn" data-add="${p.id}">🛒 কার্টে যোগ</button>
          </div>
        </div>
      </article>`;
  }

  function renderProducts() {
    const list = getVisibleProducts();
    $("#productGrid").innerHTML = list.map(productCard).join("");
    $("#emptyState").hidden = list.length > 0;
    $("#resultInfo").textContent = list.length ? `${bn(list.length)}টি পণ্য দেখানো হচ্ছে` : "";
  }

  /* ==========================================================
     কুইক ভিউ
     ========================================================== */
  function openQuick(id) {
    const p = getProduct(id);
    if (!p) return;
    $("#quickBody").innerHTML = `
      <button class="icon-btn modal__close" data-close-modal aria-label="বন্ধ করুন">✕</button>
      <div class="quick" data-id="${p.id}">
        <div class="quick__img" style="background:${p.bg}">${p.emoji}</div>
        <div>
          <div class="card__cat">${catName(p.cat)} • ${esc(p.en)}</div>
          <h3>${esc(p.name)}</h3>
          <div class="rating">${stars(p.rating)} <small>${bn(p.rating)} (${bn(p.reviews)} রিভিউ)</small></div>
          <p>${esc(p.desc)}</p>
          <div class="price"><b>${money(p.price)}</b>${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}<small>/কেজি</small></div>
          <div class="quick__row">
            <select class="weight-select" id="quickWeight" style="flex:none;min-width:170px">${weightOptions(p)}</select>
            <div class="qty"><button data-qq="-1">−</button><span id="quickQty">১</span><button data-qq="1">+</button></div>
            <button class="btn btn--primary" id="quickAdd" data-id="${p.id}">কার্টে যোগ করুন</button>
          </div>
        </div>
      </div>`;
    openModal("quickModal");
  }

  /* ==========================================================
     কার্ট লজিক
     ========================================================== */
  function addToCart(id, weightIdx, qty = 1) {
    const p = getProduct(id);
    const w = WEIGHTS[p.weights][weightIdx];
    const key = id + "|" + w.label;
    const found = state.cart.find((i) => i.key === key);
    if (found) found.qty += qty;
    else state.cart.push({ key, id, weightLabel: w.label, factor: w.factor, qty });
    saveCart();
    renderCart();
    bumpCart();
    toast(`${p.name} (${w.label}) কার্টে যোগ হয়েছে`);
  }

  function changeQty(key, delta) {
    const item = state.cart.find((i) => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) return removeItem(key);
    if (item.qty > 20) { item.qty = 20; toast("একটি পণ্য সর্বোচ্চ ২০টি নেওয়া যাবে", "warn"); }
    saveCart(); renderCart();
  }

  function removeItem(key) {
    state.cart = state.cart.filter((i) => i.key !== key);
    saveCart(); renderCart();
  }

  function clearCart() {
    state.cart = []; state.coupon = null;
    saveCart(); renderCart();
  }

  function bumpCart() {
    const b = $("#cartBtn");
    b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
  }

  function calcTotals() {
    const subtotal = state.cart.reduce((s, i) => s + unitPrice(getProduct(i.id), i.factor) * i.qty, 0);
    const discount = state.coupon ? Math.round(subtotal * state.coupon.percent / 100) : 0;
    const after = subtotal - discount;
    const shipping = subtotal === 0 ? 0 : (after >= CONFIG.freeShipOver ? 0 : CONFIG.shipFee);
    return { subtotal, discount, shipping, total: after + shipping, after };
  }

  function renderCart() {
    const count = state.cart.reduce((s, i) => s + i.qty, 0);
    $("#cartCount").textContent = bn(count);

    const box = $("#cartItems");
    const foot = $("#cartFoot");

    if (!state.cart.length) {
      box.innerHTML = `<div class="cart-empty"><span>🛒</span><p>আপনার কার্ট খালি</p>
        <a href="#products" class="btn btn--primary" data-close-cart>পণ্য দেখুন</a></div>`;
      foot.hidden = true;
      return;
    }
    foot.hidden = false;

    box.innerHTML = state.cart.map((i) => {
      const p = getProduct(i.id);
      const line = unitPrice(p, i.factor) * i.qty;
      return `<div class="cart-item" data-key="${esc(i.key)}">
        <div class="cart-item__img" style="background:${p.bg}">${p.emoji}</div>
        <div>
          <h4>${esc(p.name)}</h4>
          <small>${i.weightLabel} × ${money(unitPrice(p, i.factor))}</small>
          <div class="qty"><button data-dec>−</button><span>${bn(i.qty)}</span><button data-inc>+</button></div>
        </div>
        <div class="cart-item__right"><b>${money(line)}</b>
          <button class="remove-btn" data-remove>🗑 মুছুন</button></div>
      </div>`;
    }).join("");

    const t = calcTotals();
    $("#subTotal").textContent = money(t.subtotal);
    $("#discountRow").hidden = !t.discount;
    $("#discountAmt").textContent = "-" + money(t.discount);
    $("#shipAmt").textContent = t.shipping ? money(t.shipping) : "ফ্রি";
    $("#grandTotal").textContent = money(t.total);

    const left = CONFIG.freeShipOver - t.after;
    $("#freeShipText").textContent = left > 0
      ? `আর ${money(left)} কিনলেই ফ্রি ডেলিভারি! 🚚`
      : "🎉 অভিনন্দন! আপনার অর্ডারে ডেলিভারি ফ্রি";
    $("#freeShipBar").style.width = Math.min(100, (t.after / CONFIG.freeShipOver) * 100) + "%";
  }

  function applyCoupon() {
    const code = $("#couponInput").value.trim().toUpperCase();
    if (!code) return toast("কুপন কোড লিখুন", "warn");
    if (CONFIG.coupons[code]) {
      state.coupon = { code, percent: CONFIG.coupons[code] };
      toast(`কুপন প্রয়োগ হয়েছে: ${bn(state.coupon.percent)}% ছাড়`);
    } else {
      state.coupon = null;
      toast("কুপন কোডটি সঠিক নয়", "warn");
    }
    renderCart();
  }

  /* ==========================================================
     ড্রয়ার ও মডাল
     ========================================================== */
  function openCart() {
    $("#cartDrawer").classList.add("open");
    $("#cartDrawer").setAttribute("aria-hidden", "false");
    $("#overlay").classList.add("show");
    document.body.classList.add("no-scroll");
  }
  function closeCart() {
    $("#cartDrawer").classList.remove("open");
    $("#cartDrawer").setAttribute("aria-hidden", "true");
    $("#overlay").classList.remove("show");
    document.body.classList.remove("no-scroll");
  }
  function openModal(id) {
    $("#" + id).classList.add("show");
    $("#" + id).setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }
  function closeModals() {
    $$(".modal.show").forEach((m) => { m.classList.remove("show"); m.setAttribute("aria-hidden", "true"); });
    document.body.classList.remove("no-scroll");
  }

  /* ==========================================================
     চেকআউট
     ========================================================== */
  function openCheckout() {
    if (!state.cart.length) return toast("কার্ট খালি!", "warn");
    closeCart();
    const t = calcTotals();
    $("#orderSummary").innerHTML =
      state.cart.map((i) => {
        const p = getProduct(i.id);
        return `<div><span>${esc(p.name)} (${i.weightLabel}) × ${bn(i.qty)}</span><span>${money(unitPrice(p, i.factor) * i.qty)}</span></div>`;
      }).join("") +
      (t.discount ? `<div><span>ছাড় (${state.coupon.code})</span><span>-${money(t.discount)}</span></div>` : "") +
      `<div><span>ডেলিভারি</span><span>${t.shipping ? money(t.shipping) : "ফ্রি"}</span></div>
       <div class="grand"><span>সর্বমোট</span><span>${money(t.total)}</span></div>`;
    $("#checkoutView").hidden = false;
    $("#successView").hidden = true;
    $("#formError").hidden = true;
    openModal("checkoutModal");
  }

  function placeOrder(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());
    $$("input, textarea", form).forEach((f) => f.classList.remove("invalid"));

    const errors = [];
    if (data.name.trim().length < 3) { errors.push("সঠিক নাম লিখুন"); form.name.classList.add("invalid"); }
    if (!/^01[3-9]\d{8}$/.test(data.phone.trim())) { errors.push("সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)"); form.phone.classList.add("invalid"); }
    if (data.address.trim().length < 10) { errors.push("পূর্ণ ঠিকানা লিখুন"); form.address.classList.add("invalid"); }

    const err = $("#formError");
    if (errors.length) { err.textContent = errors.join(" • "); err.hidden = false; return; }
    err.hidden = true;

    /* ডেমো: এখানে সার্ভারে POST করার কথা (fetch('/Order/Create', ...)) */
    const order = {
      no: "KF" + Date.now().toString().slice(-7),
      customer: data,
      items: state.cart,
      totals: calcTotals()
    };
    console.log("ORDER (demo):", order);

    $("#orderNo").textContent = "KF" + bn(order.no.slice(2));
    $("#checkoutView").hidden = true;
    $("#successView").hidden = false;
    form.reset();
    clearCart();
  }

  /* ==========================================================
     ইভেন্ট
     ========================================================== */
  function bindEvents() {
    /* ক্যাটাগরি কার্ড */
    $("#catGrid").addEventListener("click", (e) => {
      const c = e.target.closest("[data-cat]");
      if (!c) return;
      state.category = c.dataset.cat; state.search = ""; $("#searchInput").value = "";
      renderFilters(); renderProducts();
      $("#products").scrollIntoView({ behavior: "smooth" });
    });
    $("#catGrid").addEventListener("keydown", (e) => { if (e.key === "Enter") e.target.click(); });

    /* ফিল্টার */
    $("#filters").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      state.category = b.dataset.cat;
      renderFilters(); renderProducts();
    });

    $("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; renderProducts(); });

    /* সার্চ (debounce) */
    let t;
    $("#searchInput").addEventListener("input", (e) => {
      clearTimeout(t);
      t = setTimeout(() => {
        state.search = e.target.value; state.category = "all";
        renderFilters(); renderProducts();
        if (state.search) $("#products").scrollIntoView({ behavior: "smooth" });
      }, 250);
    });

    /* প্রোডাক্ট গ্রিড */
    $("#productGrid").addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) {
        const card = add.closest(".card");
        addToCart(+add.dataset.add, +$(".weight-select", card).value);
        return;
      }
      const q = e.target.closest("[data-quick]");
      if (q) openQuick(+q.dataset.quick);
    });

    /* কুইক ভিউ */
    let qq = 1;
    $("#quickBody").addEventListener("click", (e) => {
      const d = e.target.closest("[data-qq]");
      if (d) {
        qq = Math.min(20, Math.max(1, qq + +d.dataset.qq));
        $("#quickQty").textContent = bn(qq);
        return;
      }
      if (e.target.id === "quickAdd") {
        addToCart(+e.target.dataset.id, +$("#quickWeight").value, qq);
        qq = 1; closeModals(); openCart();
      }
    });
    $("#quickModal").addEventListener("transitionend", () => { if (!$("#quickModal").classList.contains("show")) qq = 1; });

    /* কার্ট */
    $("#cartBtn").addEventListener("click", openCart);
    $("#closeCart").addEventListener("click", closeCart);
    $("#overlay").addEventListener("click", closeCart);
    $("#cartDrawer").addEventListener("click", (e) => {
      if (e.target.closest("[data-close-cart]")) return closeCart();
      const row = e.target.closest(".cart-item");
      if (!row) return;
      const key = row.dataset.key;
      if (e.target.closest("[data-inc]")) changeQty(key, 1);
      else if (e.target.closest("[data-dec]")) changeQty(key, -1);
      else if (e.target.closest("[data-remove]")) removeItem(key);
    });
    $("#applyCoupon").addEventListener("click", applyCoupon);
    $("#couponInput").addEventListener("keydown", (e) => { if (e.key === "Enter") applyCoupon(); });
    $("#clearCart").addEventListener("click", () => { if (confirm("কার্ট খালি করবেন?")) clearCart(); });
    $("#checkoutBtn").addEventListener("click", openCheckout);

    /* চেকআউট ও মডাল */
    $("#checkoutForm").addEventListener("submit", placeOrder);
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-close-modal]")) closeModals();
      if (e.target.classList && e.target.classList.contains("modal")) closeModals();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModals(); closeCart(); } });

    /* নিউজলেটার */
    $("#newsletterForm").addEventListener("submit", (e) => {
      e.preventDefault();
      toast("ধন্যবাদ! কুপন কোড: DEMO10 🎁");
      e.target.reset();
    });

    /* মোবাইল মেনু */
    $("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("open"));
    $("#nav").addEventListener("click", (e) => { if (e.target.tagName === "A") $("#nav").classList.remove("open"); });

    /* স্ক্রল */
    window.addEventListener("scroll", () => {
      $("#header").classList.toggle("scrolled", window.scrollY > 10);
      $("#toTop").classList.toggle("show", window.scrollY > 500);
    }, { passive: true });
    $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- রিভিউ (ডেমো) ---------- */
  function renderReviews() {
    const data = [
      { n: "রাফিয়া সুলতানা", c: "ঢাকা", t: "গাওয়া ঘী-এর ঘ্রাণ একদম আসল! বাচ্চারাও পরোটা খেয়ে মুগ্ধ। নিয়মিত অর্ডার করব।" },
      { n: "তানভীর আহমেদ", c: "চট্টগ্রাম", t: "সুন্দরবনের মধু খাঁটি কি না আগে সন্দেহ ছিল, কিন্তু স্বাদ ও ঘনত্বে বুঝেছি এটা আসল। প্যাকেজিংও দারুণ।" },
      { n: "নুসরাত জাহান", c: "সিলেট", t: "বাদাম ও কিসমিস একদম সতেজ ছিল। দুই দিনেই ডেলিভারি পেয়েছি। ধন্যবাদ!" }
    ];
    $("#reviewGrid").innerHTML = data.map((r) => `
      <article class="review">
        <div class="rating">★★★★★</div>
        <p>“${r.t}”</p>
        <div class="review__who"><div class="avatar">${r.n[0]}</div><div><b>${r.n}</b><small>${r.c}</small></div></div>
      </article>`).join("");
  }

  /* ---------- শুরু ---------- */
  function init() {
    renderCategories();
    renderFilters();
    renderProducts();
    renderReviews();
    renderCart();
    bindEvents();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
