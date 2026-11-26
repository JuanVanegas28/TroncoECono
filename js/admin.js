/* =========================================================
   TRONCO E' CONO — Panel de administración
   Botón de perfil → iniciar sesión / crear contraseña →
   editar precios y disponibilidad → Guardar cambios.
   ========================================================= */
const Admin = (() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const { fmt, esc, toast } = App;
  const num = (s) => {
    const d = String(s).replace(/\D/g, "");
    return d === "" ? null : Number(d);
  };
  const dots = (n) => (n == null ? "" : new Intl.NumberFormat("es-CO").format(n));

  const profileBtn = $("#profileBtn");
  const authModal = $("#authModal");
  const panel = $("#adminPanel");

  /* =========================================================
     INICIO DE SESIÓN
     ========================================================= */
  let view = "login";
  let lastEmail = "";

  const field = (name, label, type, extra = "") => `
    <label class="af">${label}
      <span class="af__wrap">
        <input name="${name}" type="${type}" required ${extra} />
        ${type === "password" ? `<button type="button" class="af__eye" data-eye aria-label="Mostrar contraseña">Ver</button>` : ""}
      </span>
    </label>`;

  function renderAuth(msg = "", kind = "error") {
    const demo = Store.mode === "demo";
    const head = `<img class="auth__logo" src="assets/logo-sm.png" alt="" width="56" height="80" />`;
    const note = msg ? `<p class="auth__msg auth__msg--${kind}" role="alert">${esc(msg)}</p>` : "";
    const demoNote = demo
      ? `<p class="auth__demo"><strong>Modo demostración.</strong> Los cambios solo se guardan en este navegador. Conecta Firebase para publicarlos a todos (ver README).</p>`
      : "";
    let body = "";

    if (Store.mode === "firebase" && !Store.adminEmailSet()) {
      body = `<h3>Falta configurar el acceso</h3>
        <p class="muted">Escribe el correo de la dueña en <code>adminEmail</code> dentro de <code>js/config.js</code>.</p>
        <div class="auth__actions"><button type="button" class="btn btn--ghost-dark" data-close>Cerrar</button></div>`;
    } else if (view === "login") {
      body = `<h3>Administración</h3>
        <p class="muted">Entra para cambiar los precios del menú.</p>
        ${note}
        <form data-form="login" novalidate>
          ${field("email", "Correo", "email", `autocomplete="username" value="${esc(lastEmail)}"`)}
          ${field("password", "Contraseña", "password", 'autocomplete="current-password"')}
          <button class="btn btn--yellow btn--block" type="submit">Entrar</button>
        </form>
        <div class="auth__links">
          <button type="button" class="link" data-view="register">¿Primera vez? Crea tu contraseña</button>
          <button type="button" class="link" data-view="reset">Olvidé mi contraseña</button>
        </div>`;
    } else if (view === "register") {
      body = `<h3>Crea tu contraseña</h3>
        <p class="muted">Usa el correo registrado del negocio y una contraseña de al menos 8 caracteres.</p>
        ${note}
        <form data-form="register" novalidate>
          ${field("email", "Correo", "email", `autocomplete="username" value="${esc(lastEmail)}"`)}
          ${field("password", "Contraseña nueva", "password", 'autocomplete="new-password" minlength="8"')}
          ${field("confirm", "Repite la contraseña", "password", 'autocomplete="new-password" minlength="8"')}
          <button class="btn btn--yellow btn--block" type="submit">Crear contraseña</button>
        </form>
        <div class="auth__links"><button type="button" class="link" data-view="login">Ya tengo contraseña</button></div>`;
    } else if (view === "reset") {
      body = `<h3>Recuperar contraseña</h3>
        <p class="muted">${demo ? "En modo demostración se borra la contraseña guardada en este navegador para que crees una nueva." : "Te enviaremos un correo con un enlace para crear una contraseña nueva."}</p>
        ${note}
        <form data-form="reset" novalidate>
          ${field("email", "Correo", "email", `autocomplete="username" value="${esc(lastEmail)}"`)}
          <button class="btn btn--yellow btn--block" type="submit">${demo ? "Borrar contraseña" : "Enviar enlace"}</button>
        </form>
        <div class="auth__links"><button type="button" class="link" data-view="login">Volver a iniciar sesión</button></div>`;
    } else if (view === "verify") {
      const u = Store.currentUser();
      body = `<h3>Confirma tu correo</h3>
        ${note}
        <p class="muted">Te enviamos un correo a <strong>${esc(u?.email || lastEmail)}</strong>. Ábrelo y toca el enlace para activar tu acceso (revisa también la carpeta de spam).</p>
        <button class="btn btn--yellow btn--block" type="button" data-act="verified">Ya lo confirmé</button>
        <div class="auth__links">
          <button type="button" class="link" data-act="resend">Reenviar correo</button>
          <button type="button" class="link" data-act="logout">Salir</button>
        </div>`;
    }

    $("#authBody").innerHTML = `${head}${body}${demoNote}`;
    const first = $("#authBody input:not([value]), #authBody input[value='']") || $("#authBody input");
    if (first && authModal.open) first.focus();
  }

  function openAuth(v = "login", msg = "", kind) {
    view = v;
    renderAuth(msg, kind);
    if (!authModal.open) authModal.showModal();
    const first = $("#authBody input[value='']") || $("#authBody input");
    if (first) first.focus();
  }

  async function busy(btn, fn) {
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Un momento…";
    try { return await fn(); } finally { btn.disabled = false; btn.textContent = label; }
  }

  authModal.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const data = Object.fromEntries(new FormData(f).entries());
    const btn = f.querySelector("[type=submit]");
    lastEmail = (data.email || "").trim();
    if (!lastEmail || !/^\S+@\S+\.\S+$/.test(lastEmail)) return renderAuth("Escribe un correo válido.");
    try {
      if (f.dataset.form === "login") {
        if (!data.password) return renderAuth("Escribe tu contraseña.");
        const u = await busy(btn, () => Store.login(lastEmail, data.password));
        if (u.verified) { authModal.close(); openPanel(); }
        else openAuth("verify", "Tu correo aún no está confirmado.", "info");
      } else if (f.dataset.form === "register") {
        if (String(data.password).length < 8) return renderAuth("La contraseña debe tener al menos 8 caracteres.");
        if (data.password !== data.confirm) return renderAuth("Las contraseñas no coinciden.");
        const u = await busy(btn, () => Store.register(lastEmail, data.password));
        if (u.verified) { authModal.close(); openPanel(); toast("Contraseña creada. ¡Bienvenida!"); }
        else openAuth("verify", "¡Contraseña creada! Falta un paso.", "ok");
      } else if (f.dataset.form === "reset") {
        const r = await busy(btn, () => Store.resetPassword(lastEmail));
        if (r === "demo") openAuth("register", "Listo. Crea tu nueva contraseña.", "ok");
        else openAuth("login", "Te enviamos un correo para crear una contraseña nueva.", "ok");
      }
    } catch (err) {
      renderAuth(err.message);
    }
  });

  authModal.addEventListener("click", async (e) => {
    if (e.target === authModal || e.target.closest("[data-close]")) return authModal.close();
    const eye = e.target.closest("[data-eye]");
    if (eye) {
      const input = eye.previousElementSibling;
      input.type = input.type === "password" ? "text" : "password";
      eye.textContent = input.type === "password" ? "Ver" : "Ocultar";
      return;
    }
    const v = e.target.closest("[data-view]");
    if (v) {
      const typed = $("#authBody input[name=email]");
      if (typed) lastEmail = typed.value.trim();
      return openAuth(v.dataset.view);
    }
    const act = e.target.closest("[data-act]")?.dataset.act;
    try {
      if (act === "verified") {
        const u = await busy(e.target, () => Store.refreshUser());
        if (u?.verified) { authModal.close(); openPanel(); toast("¡Correo confirmado!"); }
        else renderAuth("Todavía no vemos la confirmación. Abre el enlace del correo y vuelve a intentarlo.", "info");
      } else if (act === "resend") {
        await busy(e.target, () => Store.resendVerification());
        renderAuth("Te reenviamos el correo de confirmación.", "ok");
      } else if (act === "logout") {
        await Store.logout();
        openAuth("login");
      }
    } catch (err) { renderAuth(err.message); }
  });
  $("#authClose").addEventListener("click", () => authModal.close());

  profileBtn.addEventListener("click", () => {
    const u = Store.currentUser();
    if (u && u.verified) openPanel();
    else openAuth(u ? "verify" : "login");
  });

  /* =========================================================
     PANEL DE PRECIOS
     ========================================================= */
  let baseline = null; // lo que está publicado
  let draft = null; // lo que se está editando

  function snapshot() {
    const s = { productos: {}, adicionales: {} };
    MENU.forEach((p) => {
      const o = { agotado: !!p.agotado };
      if (typeof p.precio === "number") o.precio = p.precio;
      if (p.precios) o.precios = { ...p.precios };
      s.productos[p.id] = o;
    });
    ADICIONALES.forEach((a) => (s.adicionales[a.id] = { precio: a.precio, agotado: !!a.agotado }));
    return s;
  }
  function factory() {
    const s = { productos: {}, adicionales: {} };
    Store.base.MENU.forEach((p) => {
      const o = { agotado: false };
      if (typeof p.precio === "number") o.precio = p.precio;
      if (p.precios) o.precios = { ...p.precios };
      s.productos[p.id] = o;
    });
    Store.base.ADICIONALES.forEach((a) => (s.adicionales[a.id] = { precio: a.precio, agotado: false }));
    return s;
  }
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // Lista plana de valores para comparar
  function flat(s) {
    const out = {};
    for (const [id, o] of Object.entries(s.productos)) {
      out[`p|${id}|agotado`] = o.agotado;
      if ("precio" in o) out[`p|${id}|precio`] = o.precio;
      for (const [k, v] of Object.entries(o.precios || {})) out[`p|${id}|precios|${k}`] = v;
    }
    for (const [id, o] of Object.entries(s.adicionales)) {
      out[`a|${id}|precio`] = o.precio;
      out[`a|${id}|agotado`] = o.agotado;
    }
    return out;
  }
  function changedKeys() {
    const a = flat(baseline), b = flat(draft);
    return Object.keys(b).filter((k) => a[k] !== b[k]);
  }
  function setPath(s, path, val) {
    const [t, id, field, ...rest] = path.split("|");
    const o = t === "p" ? s.productos[id] : s.adicionales[id];
    if (field === "precios") o.precios[rest.join("|")] = val;
    else o[field] = val;
  }

  const moneyInput = (path, value) => `
    <span class="money"><i>$</i><input inputmode="numeric" autocomplete="off" data-path="${esc(path)}" value="${dots(value)}" aria-label="Precio" /></span>`;
  const switchInput = (path, agotado, label = "Disponible") => `
    <label class="switch"><input type="checkbox" data-avail="${esc(path)}" ${agotado ? "" : "checked"} /><span class="switch__ui" aria-hidden="true"></span><span class="switch__txt">${agotado ? "Agotado" : label}</span></label>`;

  function productCard(p) {
    const d = draft.productos[p.id];
    const rows = [];
    if ("precio" in d) rows.push(`<label class="pf"><span>Precio</span>${moneyInput(`p|${p.id}|precio`, d.precio)}</label>`);
    for (const k of Object.keys(d.precios || {})) {
      rows.push(`<label class="pf"><span>${esc(k.split("|").join(" · "))}</span>${moneyInput(`p|${p.id}|precios|${k}`, d.precios[k])}</label>`);
    }
    return `
    <article class="ap ${d.agotado ? "is-off" : ""}" data-card="p|${p.id}">
      <header class="ap__head">
        <img src="${esc(p.imagen)}" alt="" width="56" height="56" loading="lazy" />
        <div class="ap__title">
          <h4>${esc(p.nombre)}</h4>
          <p>${esc([p.medida, (p.opciones || []).map((g) => g.nombre).join(" y ")].filter(Boolean).join(" · ") || "Precio único")}</p>
        </div>
        ${switchInput(`p|${p.id}|agotado`, d.agotado)}
      </header>
      <div class="ap__prices">${rows.join("")}</div>
    </article>`;
  }

  function renderPanel() {
    const u = Store.currentUser();
    const cats = CATEGORIAS.filter((c) => c.id !== "todo");
    const sections = cats
      .map((c) => {
        const items = MENU.filter((m) => m.categoria === c.id);
        if (!items.length) return "";
        return `<section class="as"><h3 class="as__title">${esc(c.nombre)}</h3><div class="as__grid">${items.map(productCard).join("")}</div></section>`;
      })
      .join("");
    const extras = `
      <section class="as">
        <h3 class="as__title">Adicionales</h3>
        <div class="ap ap--extras">
          ${ADICIONALES.map((a) => {
            const d = draft.adicionales[a.id];
            return `<div class="xr ${d.agotado ? "is-off" : ""}" data-card="a|${a.id}">
              <span class="xr__name">${esc(a.nombre)}</span>
              ${moneyInput(`a|${a.id}|precio`, d.precio)}
              ${switchInput(`a|${a.id}|agotado`, d.agotado, "Hay")}
            </div>`;
          }).join("")}
        </div>
      </section>`;

    const when = Store.lastUpdated();
    panel.innerHTML = `
      <header class="admin__bar">
        <div class="admin__brand">
          <img src="assets/logo-sm.png" alt="" width="34" height="48" />
          <div><h2 id="adminTitle">Panel de precios</h2><p>${esc(u?.email || "")}</p></div>
        </div>
        <div class="admin__tools">
          <span class="badge ${Store.mode === "firebase" ? "badge--live" : "badge--demo"}">${Store.mode === "firebase" ? "En línea" : "Demostración"}</span>
          <button type="button" class="btn btn--ghost-dark btn--sm" data-a="logout"><span class="hide-sm">Cerrar sesión</span><span class="show-sm">Salir</span></button>
          <button type="button" class="icon-btn" data-a="close" aria-label="Volver a la página">✕</button>
        </div>
      </header>
      <div class="admin__wrap">
        ${Store.mode === "demo" ? `<p class="admin__note"><strong>Modo demostración:</strong> los cambios se guardan solo en este navegador. Cuando conectes Firebase, se verán al instante en el celular de cada cliente.</p>` : ""}
        <p class="admin__help">Cambia los precios y toca <strong>Guardar cambios</strong>. Apaga <em>Disponible</em> para marcar un producto como agotado.</p>
        ${sections}
        ${extras}
        <p class="admin__meta">${when ? `Última actualización: ${when.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}` : "Aún no se han guardado cambios: se usan los precios iniciales."}
          · <button type="button" class="link" data-a="factory">Restaurar precios iniciales</button></p>
      </div>
      <footer class="admin__save">
        <p class="admin__status" id="adminStatus"></p>
        <div class="admin__btns">
          <button type="button" class="btn btn--ghost-dark" data-a="discard">Descartar</button>
          <button type="button" class="btn btn--yellow" data-a="save" id="adminSave">Guardar cambios</button>
        </div>
      </footer>`;
    updateStatus();
  }

  function updateStatus() {
    const changed = changedKeys();
    const invalid = panel.querySelectorAll(".money.is-invalid").length;
    panel.querySelectorAll("[data-card]").forEach((card) => {
      const pre = card.dataset.card + "|";
      card.classList.toggle("is-changed", changed.some((k) => k.startsWith(pre)));
    });
    panel.querySelectorAll("[data-path]").forEach((inp) => {
      inp.closest(".money").classList.toggle("is-dirty", changed.includes(inp.dataset.path));
    });
    const st = $("#adminStatus");
    const save = $("#adminSave");
    if (invalid) {
      st.textContent = "Revisa los precios marcados en rojo.";
      st.className = "admin__status is-error";
    } else if (changed.length) {
      st.textContent = `${changed.length} cambio${changed.length > 1 ? "s" : ""} sin guardar`;
      st.className = "admin__status is-dirty";
    } else {
      st.textContent = "Todo guardado ✓";
      st.className = "admin__status";
    }
    save.disabled = !changed.length || !!invalid;
    $('[data-a="discard"]', panel).disabled = !changed.length;
  }

  panel.addEventListener("input", (e) => {
    const inp = e.target.closest("[data-path]");
    if (!inp) return;
    const n = num(inp.value);
    inp.value = dots(n);
    const ok = n != null && n >= 100 && n <= 10000000;
    inp.closest(".money").classList.toggle("is-invalid", !ok);
    setPath(draft, inp.dataset.path, ok ? n : NaN);
    updateStatus();
  });
  panel.addEventListener("focusin", (e) => {
    if (e.target.matches("[data-path]")) e.target.select();
  });

  panel.addEventListener("change", (e) => {
    const sw = e.target.closest("[data-avail]");
    if (!sw) return;
    const agotado = !sw.checked;
    setPath(draft, sw.dataset.avail, agotado);
    sw.parentElement.querySelector(".switch__txt").textContent = agotado ? "Agotado" : sw.dataset.avail.startsWith("a|") ? "Hay" : "Disponible";
    const [t, id] = sw.dataset.avail.split("|");
    panel.querySelector(`[data-card="${t}|${id}"]`).classList.toggle("is-off", agotado);
    updateStatus();
  });

  panel.addEventListener("click", async (e) => {
    const a = e.target.closest("[data-a]")?.dataset.a;
    if (!a) return;
    if (a === "close") return closePanel();
    if (a === "discard") {
      draft = clone(baseline);
      renderPanel();
      return;
    }
    if (a === "factory") {
      draft = factory();
      renderPanel();
      toast("Precios iniciales cargados. Toca Guardar cambios para publicarlos.");
      return;
    }
    if (a === "logout") {
      if (changedKeys().length && !confirm("Tienes cambios sin guardar. ¿Salir de todas formas?")) return;
      await Store.logout();
      closePanel(true);
      toast("Sesión cerrada");
      return;
    }
    if (a === "save") {
      const btn = e.target.closest("button");
      try {
        await busy(btn, () => Store.save(clone(draft)));
        baseline = snapshot();
        draft = clone(baseline);
        renderPanel();
        toast("¡Listo! Los precios ya se ven en la página");
      } catch (err) {
        const st = $("#adminStatus");
        st.textContent = err.message;
        st.className = "admin__status is-error";
      }
    }
  });

  function openPanel() {
    baseline = snapshot();
    draft = clone(baseline);
    renderPanel();
    panel.hidden = false;
    document.body.classList.add("admin-open");
    requestAnimationFrame(() => panel.classList.add("open"));
    panel.focus();
  }

  function closePanel(force = false) {
    if (!force && changedKeys().length && !confirm("Tienes cambios sin guardar. ¿Cerrar de todas formas?")) return;
    panel.classList.remove("open");
    panel.hidden = true;
    document.body.classList.remove("admin-open");
    baseline = draft = null;
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden && !authModal.open) closePanel();
  });
  window.addEventListener("beforeunload", (e) => {
    if (!panel.hidden && draft && changedKeys().length) { e.preventDefault(); e.returnValue = ""; }
  });

  // Si llegan precios nuevos (otro dispositivo) y no hay cambios locales, refresca el panel
  Store.onPrices(() => {
    if (panel.hidden || !draft) return;
    const hadChanges = changedKeys().length > 0;
    baseline = snapshot();
    if (!hadChanges) { draft = clone(baseline); renderPanel(); }
    else updateStatus();
  });

  Store.onAuth((u) => {
    profileBtn.classList.toggle("is-in", !!(u && u.verified));
    profileBtn.setAttribute("aria-label", u && u.verified ? "Abrir panel de precios" : "Iniciar sesión (administración)");
    if (!u && !panel.hidden) closePanel(true);
  });

  return { openPanel };
})();
