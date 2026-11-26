/* =========================================================
   TRONCO E' CONO — Datos y sesión
   - Con Firebase configurado: precios, nombres y descripciones en
     Firestore (doc tienda/precios), fotos nuevas en la colección
     "imagenes" (una por producto), todo en tiempo real para los
     visitantes. Acceso con Firebase Auth.
   - Sin Firebase: MODO DEMOSTRACIÓN. Precios y contraseña se
     guardan solo en este navegador (sirve para mostrarle el
     panel al cliente antes de publicar).
   ========================================================= */
const Store = (() => {
  "use strict";

  const FB_VERSION = "10.12.2";
  const KEYS = {
    cache: "tc_precios_cache_v1",
    imgCache: "tc_img_cache_v1",
    demoData: "tc_demo_precios_v1",
    demoImages: "tc_demo_imagenes_v1",
    demoAccount: "tc_demo_admin_v1",
    demoSession: "tc_demo_session_v1",
  };

  // Copia intacta del menú de config.js (precios de fábrica)
  const BASE = JSON.parse(JSON.stringify({ MENU, ADICIONALES }));
  const fbCfg = CONFIG.firebase || {};
  const mode = fbCfg.apiKey && fbCfg.projectId ? "firebase" : "demo";

  let overrides = {};
  let imagenes = {}; // id → foto (data URL) subida desde el panel
  let gotPrices = false;
  let gotImages = false;
  let ready = false;
  const priceListeners = [];
  const authListeners = [];
  let user = null; // { email, verified }
  let fb = null; // { auth, db, doc }

  /* ---------------- Utilidades ---------------- */
  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* */ } },
  };
  const ss = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch { /* */ } },
  };
  const validPrice = (n) => Number.isInteger(n) && n >= 0 && n <= 10000000;
  const cleanText = (t, max) => (typeof t === "string" ? t.trim().slice(0, max) : "");
  const validImg = (src) => typeof src === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(src) && src.length < 1000000;
  const norm = (e) => String(e || "").trim().toLowerCase();

  function isAdminEmail(email) {
    const admin = norm(CONFIG.adminEmail);
    if (!admin) return mode === "demo"; // en demo, cualquier correo
    return norm(email) === admin;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("No se pudo cargar " + src));
      document.head.appendChild(s);
    });
  }

  /* ---------------- Aplicar cambios al menú ---------------- */
  function apply() {
    const op = overrides.productos || {};
    MENU.forEach((p) => {
      const b = BASE.MENU.find((x) => x.id === p.id) || {};
      const o = op[p.id] || {};
      if (typeof b.precio === "number") p.precio = validPrice(o.precio) ? o.precio : b.precio;
      if (b.precios) {
        p.precios = { ...b.precios };
        Object.keys(b.precios).forEach((k) => {
          if (o.precios && validPrice(o.precios[k])) p.precios[k] = o.precios[k];
        });
      }
      p.agotado = !!o.agotado;
      p.nombre = cleanText(o.nombre, 60) || b.nombre;
      p.descripcion = cleanText(o.descripcion, 300) || b.descripcion;
      p.fotoPropia = validImg(imagenes[p.id]);
      p.imagen = p.fotoPropia ? imagenes[p.id] : b.imagen;
    });
    const oa = overrides.adicionales || {};
    ADICIONALES.forEach((a) => {
      const b = BASE.ADICIONALES.find((x) => x.id === a.id) || {};
      const o = oa[a.id] || {};
      a.precio = validPrice(o.precio) ? o.precio : b.precio;
      a.agotado = !!o.agotado;
    });
  }

  function emitPrices() {
    priceListeners.forEach((cb) => { try { cb(overrides); } catch (e) { console.error(e); } });
  }
  // Solo se pinta cuando llegaron precios Y fotos (evita ver la foto vieja un instante)
  function update() {
    apply();
    if (gotPrices && gotImages) ready = true;
    if (ready) emitPrices();
  }
  function receivePrices(ov) {
    overrides = ov && typeof ov === "object" ? ov : {};
    gotPrices = true;
    if (mode === "firebase") ls.set(KEYS.cache, overrides);
    update();
  }
  function receiveImages(map) {
    imagenes = map && typeof map === "object" ? map : {};
    gotImages = true;
    if (mode === "firebase") ls.set(KEYS.imgCache, imagenes); // si no cabe, no pasa nada
    update();
  }
  function emitAuth() {
    authListeners.forEach((cb) => { try { cb(user); } catch (e) { console.error(e); } });
  }

  /* ---------------- Mensajes de error en español ---------------- */
  function niceError(err) {
    const code = (err && (err.code || err.message)) || "";
    const map = {
      "auth/invalid-credential": "Correo o contraseña incorrectos.",
      "auth/wrong-password": "Correo o contraseña incorrectos.",
      "auth/user-not-found": "Aún no hay una contraseña creada para este correo. Toca «Crear contraseña».",
      "auth/invalid-email": "Ese correo no es válido.",
      "auth/email-already-in-use": "Este correo ya tiene contraseña. Inicia sesión o usa «Olvidé mi contraseña».",
      "auth/weak-password": "La contraseña es muy débil. Usa al menos 8 caracteres.",
      "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
      "auth/network-request-failed": "Sin conexión a internet. Revisa tu red.",
      "permission-denied": "No tienes permiso para guardar. Verifica tu correo e inicia sesión de nuevo.",
      "unavailable": "Sin conexión con el servidor. Inténtalo de nuevo.",
    };
    for (const k in map) if (code.includes(k)) return new Error(map[k]);
    return err instanceof Error ? err : new Error(String(err));
  }

  /* ================= FIREBASE ================= */
  async function initFirebase() {
    const base = `https://www.gstatic.com/firebasejs/${FB_VERSION}/`;
    await loadScript(base + "firebase-app-compat.js");
    await Promise.all([loadScript(base + "firebase-auth-compat.js"), loadScript(base + "firebase-firestore-compat.js")]);
    const app = firebase.initializeApp(fbCfg);
    const auth = app.auth();
    auth.languageCode = "es";
    const db = app.firestore();
    const doc = db.doc("tienda/precios");
    fb = { auth, db, doc };

    doc.onSnapshot(
      (snap) => receivePrices(snap.exists ? snap.data() : {}),
      (err) => { console.error("Firestore:", err); if (!gotPrices) receivePrices(ls.get(KEYS.cache) || {}); }
    );
    db.collection("imagenes").onSnapshot(
      (qs) => {
        const map = {};
        qs.forEach((d) => { const src = d.data().src; if (validImg(src)) map[d.id] = src; });
        receiveImages(map);
      },
      (err) => { console.error("Firestore imágenes:", err); if (!gotImages) receiveImages(ls.get(KEYS.imgCache) || {}); }
    );
    auth.onAuthStateChanged((u) => {
      user = u ? { email: u.email, verified: u.emailVerified } : null;
      emitAuth();
    });
  }

  /* ================= DEMO (solo este navegador) ================= */
  async function hash(text) {
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("tc::" + text));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      let h = 0;
      for (const c of "tc::" + text) h = (h * 31 + c.charCodeAt(0)) | 0;
      return "x" + h;
    }
  }
  function initDemo() {
    receiveImages(ls.get(KEYS.demoImages) || {});
    receivePrices(ls.get(KEYS.demoData) || {});
    const email = ss.get(KEYS.demoSession);
    const acc = ls.get(KEYS.demoAccount);
    user = email && acc && norm(acc.email) === norm(email) ? { email, verified: true } : null;
    emitAuth();
    // Otras pestañas del mismo navegador se actualizan al instante
    window.addEventListener("storage", (e) => {
      if (e.key === KEYS.demoData) receivePrices(ls.get(KEYS.demoData) || {});
      if (e.key === KEYS.demoImages) receiveImages(ls.get(KEYS.demoImages) || {});
    });
  }

  /* ================= API pública ================= */
  async function init() {
    if (mode === "demo") return initDemo();
    // Pinta de una vez con lo último que se vio en este celular
    const cached = ls.get(KEYS.cache);
    if (cached) {
      overrides = cached;
      imagenes = ls.get(KEYS.imgCache) || {};
      ready = true;
      update();
    }
    const fallback = () => {
      if (!gotPrices) receivePrices(ls.get(KEYS.cache) || {});
      if (!gotImages) receiveImages(ls.get(KEYS.imgCache) || {});
    };
    try {
      await initFirebase();
    } catch (e) {
      console.error(e);
      fallback();
    }
    // Si Firestore tarda demasiado, se muestra lo que haya
    setTimeout(fallback, 5000);
  }

  function needFb() {
    if (!fb) throw new Error("No hay conexión con el servidor. Revisa tu internet y recarga la página.");
  }

  async function login(email, password) {
    if (!isAdminEmail(email)) throw new Error("Este correo no tiene acceso de administración.");
    if (mode === "demo") {
      const acc = ls.get(KEYS.demoAccount);
      if (!acc || norm(acc.email) !== norm(email)) throw new Error("Aún no hay una contraseña creada para este correo. Toca «Crear contraseña».");
      if (acc.hash !== (await hash(password))) throw new Error("Correo o contraseña incorrectos.");
      ss.set(KEYS.demoSession, acc.email);
      user = { email: acc.email, verified: true };
      emitAuth();
      return user;
    }
    needFb();
    try {
      const { user: u } = await fb.auth.signInWithEmailAndPassword(email.trim(), password);
      await u.reload();
      if (u.emailVerified) await u.getIdToken(true);
      user = { email: u.email, verified: u.emailVerified };
      emitAuth();
      return user;
    } catch (e) { throw niceError(e); }
  }

  async function register(email, password) {
    if (!isAdminEmail(email)) throw new Error("Solo el correo de la dueña puede crear la contraseña de administración.");
    if (String(password).length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres.");
    if (mode === "demo") {
      const acc = ls.get(KEYS.demoAccount);
      if (acc) throw new Error("Ya hay una contraseña creada. Inicia sesión o usa «Olvidé mi contraseña».");
      ls.set(KEYS.demoAccount, { email: email.trim(), hash: await hash(password) });
      ss.set(KEYS.demoSession, email.trim());
      user = { email: email.trim(), verified: true };
      emitAuth();
      return user;
    }
    needFb();
    try {
      const { user: u } = await fb.auth.createUserWithEmailAndPassword(email.trim(), password);
      await u.sendEmailVerification();
      user = { email: u.email, verified: false };
      emitAuth();
      return user;
    } catch (e) { throw niceError(e); }
  }

  async function resetPassword(email) {
    if (!isAdminEmail(email)) throw new Error("Este correo no tiene acceso de administración.");
    if (mode === "demo") {
      ls.del(KEYS.demoAccount);
      ss.del(KEYS.demoSession);
      return "demo";
    }
    needFb();
    try { await fb.auth.sendPasswordResetEmail(email.trim()); return "email"; } catch (e) { throw niceError(e); }
  }

  async function resendVerification() {
    if (mode === "demo" || !fb || !fb.auth.currentUser) return;
    try { await fb.auth.currentUser.sendEmailVerification(); } catch (e) { throw niceError(e); }
  }

  async function refreshUser() {
    if (mode === "demo" || !fb || !fb.auth.currentUser) return user;
    const u = fb.auth.currentUser;
    await u.reload();
    if (u.emailVerified) await u.getIdToken(true);
    user = { email: u.email, verified: u.emailVerified };
    emitAuth();
    return user;
  }

  async function logout() {
    if (mode === "demo") ss.del(KEYS.demoSession);
    else if (fb) await fb.auth.signOut();
    user = null;
    emitAuth();
  }

  /* data: { productos, adicionales }
     fotos: { idProducto: "data:image/jpeg;base64,..." | null }  (null = volver a la foto original) */
  async function save(data, fotos = {}) {
    if (!user || !user.verified) throw new Error("Inicia sesión para guardar los cambios.");
    const clean = { productos: data.productos || {}, adicionales: data.adicionales || {} };
    if (mode === "demo") {
      const imgs = { ...(ls.get(KEYS.demoImages) || {}) };
      for (const [id, src] of Object.entries(fotos)) {
        if (src) imgs[id] = src; else delete imgs[id];
      }
      if (Object.keys(fotos).length && !ls.set(KEYS.demoImages, imgs)) {
        throw new Error("En modo demostración no caben más fotos en este navegador. Con Firebase no hay este límite.");
      }
      clean.actualizado = Date.now();
      clean.actualizadoPor = user.email;
      ls.set(KEYS.demoData, clean);
      imagenes = imgs;
      receivePrices(clean);
      return;
    }
    needFb();
    try {
      const ts = firebase.firestore.FieldValue.serverTimestamp();
      const batch = fb.db.batch();
      batch.set(fb.doc, { ...clean, actualizado: ts, actualizadoPor: user.email });
      for (const [id, src] of Object.entries(fotos)) {
        const ref = fb.db.collection("imagenes").doc(id);
        if (src) batch.set(ref, { src, actualizado: ts, actualizadoPor: user.email });
        else batch.delete(ref);
      }
      await batch.commit();
    } catch (e) { throw niceError(e); }
  }

  function lastUpdated() {
    const t = overrides.actualizado;
    if (!t) return null;
    if (typeof t === "number") return new Date(t);
    if (t.toDate) return t.toDate();
    if (t.seconds) return new Date(t.seconds * 1000);
    return null;
  }

  return {
    mode,
    base: BASE,
    init,
    isReady: () => ready,
    onPrices: (cb) => priceListeners.push(cb),
    onAuth: (cb) => { authListeners.push(cb); cb(user); },
    currentUser: () => user,
    isAdminEmail,
    adminEmailSet: () => !!norm(CONFIG.adminEmail),
    login, register, resetPassword, resendVerification, refreshUser, logout, save, lastUpdated,
  };
})();
