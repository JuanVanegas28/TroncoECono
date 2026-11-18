/* =========================================================
   TRONCO E' CONO — Lógica (menú, carrito, pedido WhatsApp)
   Sin frameworks ni base de datos. El pedido se guarda en
   el navegador del cliente (localStorage).
   ========================================================= */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const STORAGE_KEY = "troncoecono_cart_v2";
  const MAX_QTY = 50;
  const WA = String(CONFIG.whatsapp || "").replace(/\D/g, "");

  const fmt = (n) => "$" + new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const product = (id) => MENU.find((m) => m.id === id);
  const extra = (id) => ADICIONALES.find((a) => a.id === id);

  /* ---------------- Precios ---------------- */
  // Precio base según las opciones elegidas (array de valores en orden)
  function basePrice(p, sel = []) {
    if (typeof p.precio === "number") return p.precio;
    if (!p.precios) return null;
    const v = p.precios[sel.join("|")];
    return typeof v === "number" ? v : null;
  }
  function minPrice(p) {
    if (typeof p.precio === "number") return p.precio;
    const vals = Object.values(p.precios || {});
    return vals.length ? Math.min(...vals) : null;
  }
  function priceTag(p) {
    if (typeof p.precio === "number") return fmt(p.precio);
    const vals = Object.values(p.precios || {});
    if (!vals.length) return "Consultar precio";
    const min = Math.min(...vals), max = Math.max(...vals);
    return min === max ? fmt(min) : `Desde ${fmt(min)}`;
  }
  // ¿Existe alguna combinación con precio que empiece por este prefijo?
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

  /* ---------------- Ilustraciones (cuando no hay foto) ---------------- */
  function illustration(kind) {
    const toppings = (cx, cy, s = 1) => `
      <g transform="translate(${cx} ${cy}) scale(${s})">
        <path d="M-40 4c-6-14 6-22 14-16 2-12 18-14 22-4 6-10 22-8 22 4 10-6 24 2 18 16z" fill="#6DB33F" stroke="#1B4332" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="-18" cy="-4" r="7" fill="#D94B3D" stroke="#1B4332" stroke-width="2.5"/>
        <rect x="-4" y="-14" width="11" height="11" rx="2" fill="#7A4A2A" stroke="#1B4332" stroke-width="2.5" transform="rotate(12)"/>
        <circle cx="16" cy="-6" r="6" fill="#F4C430" stroke="#1B4332" stroke-width="2.5"/>
        <rect x="22" y="-4" width="10" height="10" rx="2" fill="#B7DB8A" stroke="#1B4332" stroke-width="2.5" transform="rotate(-10)"/>
        <circle cx="-30" cy="0" r="4.5" fill="#F4C430" stroke="#1B4332" stroke-width="2"/>
      </g>`;
    const cone = (s) => `
      <g transform="translate(100 78) scale(${s}) rotate(-10)">
        <defs><clipPath id="cc${s}"><path d="M-34 -18 L34 -18 L2 62 Q0 66 -2 62 Z"/></clipPath></defs>
        <path d="M-34 -18 L34 -18 L2 62 Q0 66 -2 62 Z" fill="#E9B44C"/>
        <g clip-path="url(#cc${s})" stroke="#C98E2B" stroke-width="2.5" opacity=".75">
          <path d="M-40 0 L40 -16 M-40 16 L40 0 M-40 32 L40 16 M-40 48 L40 32"/>
        </g>
        <path d="M-34 -18 L34 -18 L2 62 Q0 66 -2 62 Z" fill="none" stroke="#1B4332" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M-20 -16c2 10 8 6 9 16 1 8 8 8 8-1 0-8 6-10 8-15z" fill="#F7C531" stroke="#1B4332" stroke-width="2.5" stroke-linejoin="round"/>
        ${toppings(0, -18)}
      </g>`;
    if (kind === "vaso") {
      return `<svg viewBox="0 0 200 150" aria-hidden="true">
        <ellipse cx="100" cy="134" rx="46" ry="6" fill="#1B4332" opacity=".12"/>
        <path d="M124 30 L146 8" stroke="#1B4332" stroke-width="9" stroke-linecap="round"/>
        <path d="M124 30 L146 8" stroke="#D9A86C" stroke-width="5" stroke-linecap="round"/>
        <path d="M64 52c-2-22 18-30 36-30s38 8 36 30z" fill="#EAD47E" stroke="#1B4332" stroke-width="3.5" stroke-linejoin="round"/>
        ${toppings(100, 46, 0.85)}
        <path d="M60 54 L140 54 L130 130 Q129 134 125 134 L75 134 Q71 134 70 130 Z" fill="#FFFDF6" stroke="#1B4332" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M64 76 L136 76 L133 100 L67 100 Z" fill="#1B4332"/>
        <text x="100" y="94" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="800" font-size="15" fill="#F0C04A">T'C</text>
      </svg>`;
    }
    const xl = kind === "cono-xl";
    return `<svg viewBox="0 0 200 150" aria-hidden="true">
      <ellipse cx="100" cy="140" rx="${xl ? 30 : 22}" ry="4" fill="#1B4332" opacity=".12"/>
      ${xl ? `<g transform="translate(-30 4)">${cone(0.78)}</g><g transform="translate(14 -14)">${cone(1.12)}</g>` : cone(1)}
    </svg>`;
  }

  /* ---------------- Estado del carrito ---------------- */
  let cart = load();
  let filtro = "todo";

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(data)) return [];
      // Descarta líneas cuyo producto o combinación ya no exista
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

  function renderMenu() {
    const items = MENU.filter((m) => filtro === "todo" || m.categoria === filtro);
    $("#menuGrid").innerHTML = items
      .map((m, i) => {
        const media = m.imagen
          ? `<img src="${esc(m.imagen)}" alt="${esc(m.nombre)}" loading="lazy" />`
          : illustration(m.ilustracion);
        const opts = (m.opciones || [])
          .map((g) => `<p class="card__opts"><strong>${esc(g.nombre)}:</strong> ${g.valores.map(esc).join(" · ")}</p>`)
          .join("");
        return `
        <article class="card" style="animation-delay:${i * 60}ms">
          <div class="card__img ${m.imagen ? "" : "is-art"}">
            ${media}
            ${m.medida ? `<span class="card__size">${esc(m.medida)}</span>` : ""}
          </div>
          <div class="card__body">
            <p class="card__tag">${esc(m.etiqueta)}</p>
            <h3 class="card__name">${esc(m.nombre)}</h3>
            <p class="card__desc">${esc(m.descripcion)}</p>
            ${opts}
            ${m.nota ? `<p class="card__note">${esc(m.nota)}</p>` : ""}
            <div class="card__foot">
              <span class="card__price">${priceTag(m)}</span>
              <button class="btn btn--yellow btn--sm" data-add="${m.id}">Pedir</button>
            </div>
          </div>
        </article>`;
      })
      .join("");
  }

  function renderExtras() {
    $("#extrasList").innerHTML = ADICIONALES.map(
      (a) => `<li><span>${esc(a.nombre)}</span><span class="dots" aria-hidden="true"></span><strong>${fmt(a.precio)}</strong></li>`
    ).join("");
  }

  /* ---------------- Modal de opciones ---------------- */
  const modal = $("#optionsModal");
  let draft = null; // { id, sel: [], extras: Set, qty }

  function openOptions(id) {
    const p = product(id);
    if (!p) return;
    const sel = [];
    (p.opciones || []).forEach((g, gi) => {
      sel[gi] = g.valores.find((v) => prefixAvailable(p, [...sel.slice(0, gi), v]));
    });
    draft = { id, sel, extras: new Set(), qty: 1 };
    $("#optionsTitle").textContent = p.nombre;
    $("#optionsSub").textContent = [p.medida, p.descripcion].filter(Boolean).join(" · ");
    $("#optionsQty").textContent = "1";
    renderOptions();
    modal.showModal();
  }

  function renderOptions() {
    const p = product(draft.id);
    const groups = (p.opciones || []).map((g, gi) => {
      const buttons = g.valores
        .map((v) => {
          const prefix = [...draft.sel.slice(0, gi), v];
          const enabled = prefixAvailable(p, prefix);
          // Precio que tendría el producto si se escoge este valor
          const trial = [...draft.sel];
          trial[gi] = v;
          const price = basePrice(p, trial);
          const checked = draft.sel[gi] === v;
          return `<label class="${enabled ? "" : "is-off"}">
            <input type="radio" name="g${gi}" value="${esc(v)}" ${checked ? "checked" : ""} ${enabled ? "" : "disabled"} data-group="${gi}" />
            <span><b>${esc(v)}</b>${enabled ? (price != null ? `<small>${fmt(price)}</small>` : "") : "<small>No disponible</small>"}</span>
          </label>`;
        })
        .join("");
      return `<fieldset class="opt-group"><legend>${esc(g.nombre)}</legend><div class="seg seg--opts">${buttons}</div></fieldset>`;
    });

    if (p.adicionales) {
      groups.push(`<fieldset class="opt-group">
        <legend>Adicionales <span class="muted">(opcional)</span></legend>
        <div class="checks">
          ${ADICIONALES.map(
            (a) => `<label><input type="checkbox" value="${a.id}" data-extra ${draft.extras.has(a.id) ? "checked" : ""} />
              <span>${esc(a.nombre)}</span><small>+ ${fmt(a.precio)}</small></label>`
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
      // Corrige las opciones siguientes si la combinación quedó inválida
      for (let j = gi + 1; j < (p.opciones || []).length; j++) {
        if (!prefixAvailable(p, draft.sel.slice(0, j + 1))) {
          draft.sel[j] = p.opciones[j].valores.find((v) => prefixAvailable(p, [...draft.sel.slice(0, j), v]));
        }
      }
      const scroll = $(".modal__scroll", modal).scrollTop;
      renderOptions();
      $(".modal__scroll", modal).scrollTop = scroll;
    } else if (t.matches("[data-extra]")) {
      t.checked ? draft.extras.add(t.value) : draft.extras.delete(t.value);
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
    if (e.target === modal) modal.close("cancel"); // clic fuera del cuadro
  });

  modal.addEventListener("close", () => {
    if (modal.returnValue === "ok" && draft) addToCart(draft.id, draft.sel, [...draft.extras], draft.qty);
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
        const thumb = p.imagen ? `<img src="${esc(p.imagen)}" alt="" />` : illustration(p.ilustracion);
        return `
        <div class="line" data-key="${esc(l.key)}">
          <div class="line__thumb">${thumb}</div>
          <div>
            <p class="line__name">${esc(p.nombre)}</p>
            ${opts ? `<p class="line__meta">${esc(opts)}</p>` : ""}
            ${ex.length ? `<p class="line__meta">+ ${ex.map(esc).join(", ")}</p>` : ""}
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

    $("#cartTotal").textContent = fmt(t);
    $("#totalHint").textContent =
      CONFIG.domicilio == null ? "El valor del domicilio se confirma por WhatsApp." : `Incluye domicilio de ${fmt(CONFIG.domicilio)} si aplica.`;
    if (CONFIG.domicilio != null) $("#cartTotal").textContent = fmt(t + (deliveryChosen() ? CONFIG.domicilio : 0));
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
  const deliveryChosen = () => (form.elements.entrega?.value || "Domicilio") === "Domicilio";
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
      if (p.medida && !opts.includes("cm")) s += ` ${p.medida}`;
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
    const data = readForm();
    if (!data) return;
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(buildMessage(data))}`;
    const w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url; // si el navegador bloquea la ventana nueva
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
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------------- Eventos ---------------- */
  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-cat]");
    if (!chip) return;
    filtro = chip.dataset.cat;
    renderFilters();
    renderMenu();
  });
  $("#menuGrid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (b) openOptions(b.dataset.add);
  });

  /* ---------------- Inicio ---------------- */
  renderFilters();
  renderMenu();
  renderExtras();
  renderCart();
  renderChannels();
})();
