/* =========================================================
   TRONCO E' CONO — Página pública (menú, carrito, WhatsApp)
   ========================================================= */
const App = (() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const STORAGE_KEY = "troncoecono_cart_v3";
  const MAX_QTY = 50;
  const WA = String(CONFIG.whatsapp || "").replace(/\D/g, "");

  const fmt = (n) => "$" + new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const product = (id) => MENU.find((m) => m.id === id);
  const extra = (id) => ADICIONALES.find((a) => a.id === id);

  /* ---------------- Precios ---------------- */
  function basePrice(p, sel = []) {
    if (typeof p.precio === "number") return p.precio;
    if (!p.precios) return null;
    const v = p.precios[sel.join("|")];
    return typeof v === "number" ? v : null;
  }
  function priceTag(p) {
    if (typeof p.precio === "number") return fmt(p.precio);
    const vals = Object.values(p.precios || {});
    if (!vals.length) return "Consultar precio";
    const min = Math.min(...vals), max = Math.max(...vals);
    return min === max ? fmt(min) : `Desde ${fmt(min)}`;
  }
  function prefixAvailable(p, prefix) {
    if (!p.precios) return true;
    const pre = prefix.join("|");
    return Object.keys(p.precios).some((k) => k === pre || k.startsWith(pre + "|"));
  }
  function unitPrice(line) {
    const p = product(line.id);
    const base = basePrice(p, line.sel) || 0;
    const extras = (line.extras || []).reduce((s, id) => s + (extra(id)?.precio || 0), 0);
    return base + extras;
  }

  /* ---------------- Estado del carrito ---------------- */
  let cart = load();
  let filtro = "todo";

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(data)) return [];
      return data.filter((l) => {
        const p = product(l.id);
        return p && basePrice(p, l.sel || []) != null && Number.isInteger(l.qty) && l.qty > 0;
      });
    } catch { return []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* modo privado */ }
  }
  const lineKey = (id, sel, extras) => [id, sel.join("+"), [...extras].sort().join("+")].join("|");

  /* ---------------- Menú ---------------- */
  function renderFilters() {
    $("#filters").innerHTML = CATEGORIAS.filter((c) => c.id === "todo" || MENU.some((m) => m.categoria === c.id))
      .map((c) => `<button class="chip" role="tab" data-cat="${c.id}" aria-selected="${c.id === filtro}">${esc(c.nombre)}</button>`)
      .join("");
  }

  const visible = (m) => filtro === "todo" || m.categoria === filtro;
  const pedirBtn = (m) =>
    m.agotado
      ? `<button class="btn btn--sm btn--off" disabled>Agotado</button>`
      : `<button class="btn btn--yellow btn--sm" data-add="${m.id}">Pedir</button>`;
  const priceHtml = (m) => `<span class="price" data-price-of="${m.id}">${Store.isReady() ? priceTag(m) : '<span class="skel"></span>'}</span>`;

  function renderMenu() {
    // Tarjetas
    const cards = MENU.filter((m) => m.estilo !== "lista" && visible(m)).map((m, i) => {
      const opts = (m.opciones || [])
        .map((g) => `<p class="card__opts"><strong>${esc(g.nombre)}:</strong> ${g.valores.map(esc).join(" · ")}</p>`)
        .join("");
      return `
      <article class="card ${m.agotado ? "is-soldout" : ""} ${m.destacado ? "card--star" : ""}" style="animation-delay:${i * 60}ms">
        <div class="card__img">
          <img src="${esc(m.imagen)}" alt="${esc(m.nombre)}" loading="lazy" width="1000" height="750" />
          ${m.medida ? `<span class="card__size">${esc(m.medida)}</span>` : ""}
          ${m.destacado ? `<span class="card__star">El de la casa</span>` : ""}
          ${m.agotado ? `<span class="soldout">Agotado por hoy</span>` : ""}
        </div>
        <div class="card__body">
          <p class="card__tag">${esc(m.etiqueta || "")}</p>
          <h3 class="card__name">${esc(m.nombre)}</h3>
          <p class="card__desc">${esc(m.descripcion)}</p>
          ${opts}
          <div class="card__foot">${priceHtml(m)}${pedirBtn(m)}</div>
        </div>
      </article>`;
    });

    const bowls = MENU.filter((m) => m.estilo === "lista");
    if (filtro === "todo" && bowls.length) {
      const min = Math.min(...bowls.flatMap((b) => (typeof b.precio === "number" ? [b.precio] : Object.values(b.precios || {}))));
      cards.push(`
      <a class="card card--promo" href="#bowls" style="animation-delay:${cards.length * 60}ms">
        <img src="${esc(bowls.find((b) => b.id === "bowl-sabor-de-casa")?.imagen || bowls[0].imagen)}" alt="" loading="lazy" />
        <div class="card--promo__body">
          <p class="eyebrow eyebrow--yellow">¿Con más hambre?</p>
          <h3>Bowls para todos los gustos</h3>
          <p>${bowls.length} bowls completos en 750 g o 1.000 g.</p>
          <span class="btn btn--yellow btn--sm">Ver bowls · ${Store.isReady() ? fmt(min) : "…"}</span>
        </div>
      </a>`);
    }
    $("#menuGrid").innerHTML = cards.join("");
    $("#menuGrid").hidden = cards.length === 0;

    // Bowls en lista
    const list = bowls.filter(visible);
    $("#bowls").hidden = list.length === 0;
    $("#bowlList").innerHTML = list
      .map(
        (m) => `
      <article class="row ${m.agotado ? "is-soldout" : ""}">
        <div class="row__body">
          <h3 class="row__name">${esc(m.nombre)} ${m.agotado ? '<span class="badge-off">Agotado</span>' : ""}</h3>
          <p class="row__desc">${esc(m.descripcion)}</p>
          ${m.ingredientes ? `<p class="row__ing"><strong>Ingredientes:</strong> ${esc(m.ingredientes)}</p>` : ""}
          ${(m.opciones || []).map((g) => `<p class="row__ing"><strong>${esc(g.nombre)}:</strong> ${g.valores.map(esc).join(" o ")}</p>`).join("")}
          <div class="row__foot">${priceHtml(m)}${pedirBtn(m)}</div>
        </div>
        <img class="row__img" src="${esc(m.imagen)}" alt="${esc(m.nombre)}" loading="lazy" width="300" height="300" />
      </article>`
      )
      .join("");

    // Si una foto no carga, se muestra el logo
    document.querySelectorAll(".card__img img, .row__img, .card--promo img").forEach((img) => {
      img.addEventListener("error", () => { img.src = "assets/logo.webp"; img.classList.add("img-fallback"); }, { once: true });
    });
  }

  function renderExtras() {
    $("#extrasList").innerHTML = ADICIONALES.map(
      (a) => `<li class="${a.agotado ? "is-off" : ""}"><span>${esc(a.nombre)}</span><span class="dots" aria-hidden="true"></span><strong>${
        a.agotado ? "Agotado" : Store.isReady() ? fmt(a.precio) : "…"
      }</strong></li>`
    ).join("");
  }

  /* ---------------- Modal de opciones ---------------- */
  const modal = $("#optionsModal");
  let draft = null;

  function openOptions(id) {
    const p = product(id);
    if (!p || p.agotado) return;
    const sel = [];
    (p.opciones || []).forEach((g, gi) => {
      sel[gi] = g.valores.find((v) => prefixAvailable(p, [...sel.slice(0, gi), v]));
    });
    draft = { id, sel, extras: new Set(), qty: 1 };
    $("#optionsTitle").textContent = p.nombre;
    $("#optionsSub").textContent = [p.medida, p.descripcion].filter(Boolean).join(" · ");
    $("#optionsImg").src = p.imagen;
    $("#optionsImg").alt = p.nombre;
    $("#optionsQty").textContent = "1";
    renderOptions();
    modal.showModal();
    $(".modal__scroll", modal).scrollTop = 0;
  }

  function renderOptions() {
    const p = product(draft.id);
    const groups = (p.opciones || []).map((g, gi) => {
      const buttons = g.valores
        .map((v) => {
          const enabled = prefixAvailable(p, [...draft.sel.slice(0, gi), v]);
          const trial = [...draft.sel];
          trial[gi] = v;
          const price = basePrice(p, trial);
          return `<label class="${enabled ? "" : "is-off"}">
            <input type="radio" name="g${gi}" value="${esc(v)}" ${draft.sel[gi] === v ? "checked" : ""} ${enabled ? "" : "disabled"} data-group="${gi}" />
            <span><b>${esc(v)}</b>${enabled ? (price != null ? `<small>${fmt(price)}</small>` : "") : "<small>No disponible</small>"}</span>
          </label>`;
        })
        .join("");
      return `<fieldset class="opt-group"><legend>${esc(g.nombre)}</legend><div class="seg seg--opts">${buttons}</div></fieldset>`;
    });

    if (p.adicionales) {
      // Quita adicionales que se agotaron mientras el modal estaba abierto
      draft.extras.forEach((id) => { if (extra(id)?.agotado) draft.extras.delete(id); });
      groups.push(`<fieldset class="opt-group">
        <legend>Adicionales <span class="muted">(opcional)</span></legend>
        <div class="checks">
          ${ADICIONALES.map(
            (a) => `<label class="${a.agotado ? "is-off" : ""}"><input type="checkbox" value="${a.id}" data-extra ${draft.extras.has(a.id) ? "checked" : ""} ${a.agotado ? "disabled" : ""} />
              <span>${esc(a.nombre)}</span><small>${a.agotado ? "Agotado" : "+ " + fmt(a.precio)}</small></label>`
          ).join("")}
        </div>
      </fieldset>`);
    }
    $("#optionsBody").innerHTML = groups.join("");
    updateDraftTotal();
  }

  function updateDraftTotal() {
    const unit = unitPrice({ id: draft.id, sel: draft.sel, extras: [...draft.extras] });
    $("#optionsConfirm").textContent = `Agregar · ${fmt(unit * draft.qty)}`;
  }

  modal.addEventListener("change", (e) => {
    if (!draft) return;
    const t = e.target;
    if (t.dataset.group != null) {
      const gi = Number(t.dataset.group);
      const p = product(draft.id);
      draft.sel[gi] = t.value;
      for (let j = gi + 1; j < (p.opciones || []).length; j++) {
        if (!prefixAvailable(p, draft.sel.slice(0, j + 1))) {
          draft.sel[j] = p.opciones[j].valores.find((v) => prefixAvailable(p, [...draft.sel.slice(0, j), v]));
        }
      }
      const sc = $(".modal__scroll", modal).scrollTop;
      renderOptions();
      $(".modal__scroll", modal).scrollTop = sc;
    } else if (t.matches("[data-extra]")) {
      t.checked ? draft.extras.add(t.value) : draft.extras.delete(t.value);
      t.closest("label").classList.toggle("is-on", t.checked);
      updateDraftTotal();
    }
  });

  modal.addEventListener("click", (e) => {
    const step = e.target.closest("[data-step]");
    if (step && draft) {
      draft.qty = Math.max(1, Math.min(MAX_QTY, draft.qty + Number(step.dataset.step)));
      $("#optionsQty").textContent = draft.qty;
      updateDraftTotal();
    }
    if (e.target === modal) modal.close("cancel");
  });

  modal.addEventListener("close", () => {
    if (modal.returnValue === "ok" && draft) {
      const p = product(draft.id);
      if (p.agotado) toast(`${p.nombre} se acaba de agotar`);
      else addToCart(draft.id, draft.sel, [...draft.extras], draft.qty);
    }
    draft = null;
    modal.returnValue = "";
  });

  /* ---------------- Carrito ---------------- */
  function addToCart(id, sel, extras, qty) {
    const key = lineKey(id, sel, extras);
    const found = cart.find((l) => l.key === key);
    if (found) found.qty = Math.min(MAX_QTY, found.qty + qty);
    else cart.push({ key, id, sel: [...sel], extras: [...extras], qty });
    save();
    renderCart();
    toast(`${product(id).nombre} agregado a tu pedido`);
    const btn = $("#openCart");
    btn.classList.remove("bump");
    void btn.offsetWidth;
    btn.classList.add("bump");
  }

  const lineBlocked = (l) => product(l.id).agotado || (l.extras || []).some((id) => extra(id)?.agotado);
  const total = () => cart.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
  const units = () => cart.reduce((s, l) => s + l.qty, 0);

  function describe(line) {
    const p = product(line.id);
    const opts = (line.sel || []).join(", ");
    const ex = (line.extras || []).map((id) => extra(id)?.nombre).filter(Boolean);
    return { p, opts, ex };
  }

  function renderCart() {
    const n = units(), t = total();
    $("#cartCount").textContent = n;
    $("#mbarCount").textContent = n;
    $("#mbarTotal").textContent = fmt(t);
    $("#mbar").hidden = n === 0;
    document.body.classList.toggle("has-mbar", n > 0);

    const empty = cart.length === 0;
    $("#cartEmpty").hidden = !empty;
    $("#checkout").hidden = empty;
    $("#drawerFoot").hidden = empty;

    $("#cartItems").innerHTML = cart
      .map((l) => {
        const { p, opts, ex } = describe(l);
        const blocked = lineBlocked(l);
        return `
        <div class="line ${blocked ? "is-blocked" : ""}" data-key="${esc(l.key)}">
          <img class="line__thumb" src="${esc(p.imagen)}" alt="" />
          <div>
            <p class="line__name">${esc(p.nombre)}${p.medida ? ` <span class="line__size">${esc(p.medida)}</span>` : ""}</p>
            ${opts ? `<p class="line__meta">${esc(opts)}</p>` : ""}
            ${ex.length ? `<p class="line__meta">+ ${ex.map(esc).join(", ")}</p>` : ""}
            ${blocked ? `<p class="line__warn">Agotado: quítalo para enviar el pedido</p>` : ""}
            <p class="line__price">${fmt(unitPrice(l) * l.qty)}${l.qty > 1 ? ` <span>(${fmt(unitPrice(l))} c/u)</span>` : ""}</p>
          </div>
          <div class="line__right">
            <div class="qty">
              <button type="button" data-qty="-1" aria-label="Quitar uno">−</button>
              <output>${l.qty}</output>
              <button type="button" data-qty="1" aria-label="Agregar uno">+</button>
            </div>
            <button type="button" class="remove" data-remove>Quitar</button>
          </div>
        </div>`;
      })
      .join("");

    const withDelivery = CONFIG.domicilio != null && deliveryChosen();
    $("#cartTotal").textContent = fmt(t + (withDelivery ? CONFIG.domicilio : 0));
    $("#totalHint").textContent =
      CONFIG.domicilio == null ? "El valor del domicilio se confirma por WhatsApp." : withDelivery ? `Incluye domicilio de ${fmt(CONFIG.domicilio)}.` : "";
  }

  $("#cartItems").addEventListener("click", (e) => {
    const row = e.target.closest(".line");
    if (!row) return;
    const line = cart.find((l) => l.key === row.dataset.key);
    if (!line) return;
    const q = e.target.closest("[data-qty]");
    if (q) {
      line.qty += Number(q.dataset.qty);
      if (line.qty < 1) cart = cart.filter((l) => l !== line);
      else line.qty = Math.min(MAX_QTY, line.qty);
    }
    if (e.target.closest("[data-remove]")) cart = cart.filter((l) => l !== line);
    save();
    renderCart();
  });

  $("#clearCart").addEventListener("click", () => {
    if (!confirm("¿Vaciar todo el pedido?")) return;
    cart = [];
    save();
    renderCart();
  });

  /* ---------------- Drawer ---------------- */
  const drawer = $("#drawer"), overlay = $("#overlay");
  function openCart() {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    $("#closeCart").focus();
  }
  function closeCart() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    document.body.style.overflow = "";
  }
  $("#openCart").addEventListener("click", openCart);
  $("#mbar").addEventListener("click", openCart);
  document.querySelectorAll("[data-open-cart]").forEach((b) => b.addEventListener("click", openCart));
  $("#closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  $("#emptyToMenu").addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open") && !modal.open) closeCart();
  });

  const form = $("#checkout");
  function deliveryChosen() { return (form.elements.entrega?.value || "Domicilio") === "Domicilio"; }
  form.addEventListener("change", (e) => {
    if (e.target.name === "entrega") {
      $(".addr", form).hidden = !deliveryChosen();
      renderCart();
    }
  });
  form.addEventListener("input", (e) => e.target.classList.remove("invalid"));

  /* ---------------- Mensaje de WhatsApp ---------------- */
  function buildMessage(data) {
    const lines = cart.map((l) => {
      const { p, opts, ex } = describe(l);
      let s = `• ${l.qty} x ${p.nombre}`;
      if (p.medida) s += ` ${p.medida}`;
      if (opts) s += ` (${opts})`;
      if (ex.length) s += `\n   + ${ex.join(", ")}`;
      s += ` — ${fmt(unitPrice(l) * l.qty)}`;
      return s;
    });
    const domicilio = data.entrega !== "Domicilio" ? "No aplica" : CONFIG.domicilio == null ? "Por confirmar" : fmt(CONFIG.domicilio);
    const totalFinal = total() + (data.entrega === "Domicilio" && CONFIG.domicilio != null ? CONFIG.domicilio : 0);

    const msg = [
      "¡Hola, Tronco E' Cono! 🌿 Quiero hacer este pedido:",
      "",
      ...lines,
      "",
      `*Productos:* ${fmt(total())}`,
      `*Domicilio:* ${domicilio}`,
      `*Total:* ${fmt(totalFinal)}${data.entrega === "Domicilio" && CONFIG.domicilio == null ? " + domicilio" : ""}`,
      "",
      `👤 *Nombre:* ${data.nombre}`,
      `🛵 *Entrega:* ${data.entrega}`,
    ];
    if (data.entrega === "Domicilio") msg.push(`📍 *Dirección:* ${data.direccion}`);
    msg.push(`💳 *Pago:* ${data.pago}`);
    if (data.notas) msg.push(`📝 *Notas:* ${data.notas}`);
    return msg.join("\n");
  }

  function readForm() {
    const fd = new FormData(form);
    const data = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v).trim()]));
    const nombre = form.elements.nombre, dir = form.elements.direccion;
    let ok = true;
    if (!data.nombre) { nombre.classList.add("invalid"); ok = false; }
    if (data.entrega === "Domicilio" && !data.direccion) { dir.classList.add("invalid"); ok = false; }
    if (!ok) {
      toast("Completa tu nombre" + (data.entrega === "Domicilio" ? " y dirección" : ""));
      (data.nombre ? dir : nombre).focus();
      return null;
    }
    return data;
  }

  $("#sendOrder").addEventListener("click", () => {
    if (!cart.length) return;
    if (cart.some(lineBlocked)) { toast("Quita los productos agotados para enviar tu pedido"); return; }
    const data = readForm();
    if (!data) return;
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(buildMessage(data))}`;
    const w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url;
  });

  /* ---------------- Contacto y redes ---------------- */
  const ICONS = {
    instagram: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2"/></svg>`,
    tiktok: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 3c.4 2.2 1.8 3.6 4 3.8v3.1a7 7 0 0 1-4-1.3v6.3A5.9 5.9 0 1 1 10.7 9v3.2a2.8 2.8 0 1 0 2.8 2.8V3h3.1Z"/></svg>`,
    whatsapp: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#wa"/></svg>`,
  };

  function renderChannels() {
    const hello = encodeURIComponent("¡Hola, Tronco E' Cono! Tengo una pregunta 🙂");
    $("#ctaWhatsapp").href = `https://wa.me/${WA}?text=${hello}`;
    $("#waVisible").textContent = CONFIG.whatsappVisible || WA;
    const items = [
      ["instagram", CONFIG.redes.instagram?.url, CONFIG.redes.instagram?.usuario],
      ["tiktok", CONFIG.redes.tiktok?.url, CONFIG.redes.tiktok?.usuario],
      ["whatsapp", `https://wa.me/${WA}`, CONFIG.whatsappVisible],
    ].filter(([, url]) => url);
    $("#socials").innerHTML = items
      .map(([k, url, label]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${k}: ${esc(label)}">${ICONS[k]}<span>${esc(label)}</span></a>`)
      .join("");
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------------- Eventos ---------------- */
  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-cat]");
    if (!chip) return;
    filtro = chip.dataset.cat;
    renderFilters();
    renderMenu();
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (b) openOptions(b.dataset.add);
  });

  /* ---------------- Precios en tiempo real ---------------- */
  function refreshPrices() {
    renderMenu();
    renderExtras();
    renderCart();
    if (draft && modal.open) {
      const p = product(draft.id);
      if (p.agotado) { modal.close("cancel"); toast(`${p.nombre} se acaba de agotar`); }
      else renderOptions();
    }
  }

  /* ---------------- Inicio ---------------- */
  renderFilters();
  renderMenu();
  renderExtras();
  renderCart();
  renderChannels();
  Store.onPrices(refreshPrices);
  Store.init();

  return { toast, fmt, esc };
})();
