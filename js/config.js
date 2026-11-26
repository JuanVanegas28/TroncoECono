/* =========================================================
   TRONCO E' CONO — CONFIGURACIÓN
   Aquí están los datos del negocio, el menú y los precios
   INICIALES. Una vez el sitio esté publicado, la dueña cambia
   los precios desde el panel de administración (botón de
   perfil arriba a la derecha) y esos cambios mandan sobre
   los valores de este archivo.
   ========================================================= */

const CONFIG = {
  // WhatsApp con indicativo de país (57 = Colombia), solo dígitos.
  whatsapp: "573122449857",
  whatsappVisible: "312 244 9857",

  redes: {
    instagram: { url: "https://www.instagram.com/troncoecono.sm/", usuario: "@troncoecono.sm" },
    tiktok: { url: "https://www.tiktok.com/@tronco.e.cono", usuario: "@tronco.e.cono" },
  },

  // Costo de domicilio. null = "se confirma por WhatsApp"
  domicilio: null,

  /* ---------------- ADMINISTRACIÓN ----------------
     Correo de la dueña: es el ÚNICO que puede entrar al panel
     y cambiar precios. */
  adminEmail: "troncoecono.ceo@gmail.com",

  /* Proyecto de Firebase "TroncoECono" (troncoecono-59523).
     Guarda los precios y el acceso de la dueña; los cambios se
     ven al instante para todos. Estas claves son públicas por
     diseño: la seguridad está en las reglas de Firestore
     (firestore.rules). Si se vacían, el panel vuelve a
     MODO DEMOSTRACIÓN (solo guarda en ese navegador). */
  firebase: {
    apiKey: "AIzaSyCXLAjaDuHCvDHwrxEHUDNqlLB21uepOsc",
    authDomain: "troncoecono-59523.firebaseapp.com",
    projectId: "troncoecono-59523",
    storageBucket: "troncoecono-59523.firebasestorage.app",
    messagingSenderId: "545662261434",
    appId: "1:545662261434:web:ac5cc491d0c43f7c810a83",
  },
};

/* ---------------------------------------------------------
   CATEGORÍAS (filtros del menú)
   --------------------------------------------------------- */
const CATEGORIAS = [
  { id: "todo", nombre: "Todo" },
  { id: "conos", nombre: "Los troncos del vacile" },
  { id: "cayeyes", nombre: "Cayeyes" },
  { id: "bowls", nombre: "Bowls" },
  { id: "bebidas", nombre: "Bebidas" },
];

/* ---------------------------------------------------------
   ADICIONALES (se suman a productos con adicionales: true)
   --------------------------------------------------------- */
const ADICIONALES = [
  { id: "queso-costeno", nombre: "Queso costeño", precio: 5000 },
  { id: "pico-de-gallo", nombre: "Pico de gallo", precio: 5000 },
  { id: "maiz-dulce", nombre: "Maíz dulce", precio: 5000 },
  { id: "carne-desmechada", nombre: "Carne desmechada", precio: 5000 },
  { id: "pollo-desmechado", nombre: "Pollo desmechado", precio: 5000 },
  { id: "salchicha-ranchera", nombre: "Salchicha ranchera", precio: 4000 },
  { id: "guacamole", nombre: "Guacamole", precio: 3000 },
  { id: "suero-costeno", nombre: "Suero costeño", precio: 3000 },
  { id: "salsas", nombre: "Salsas", precio: 2000 },
  { id: "salsa-tartara", nombre: "Salsa tártara", precio: 2000 },
  { id: "papa-chongo", nombre: "Papa (chongo)", precio: 2000 },
];

/* ---------------------------------------------------------
   MENÚ
   - precio: precio fijo (número sin puntos)
   - opciones + precios: el precio depende de lo que se escoja.
     La llave de "precios" es el valor escogido (o "valor1|valor2"
     si hay dos grupos de opciones).
   - imagen: foto del producto en assets/productos/
   - estilo: "lista" muestra el producto en formato lista (bowls)
   --------------------------------------------------------- */
const MENU = [
  /* ---------- CONOS ---------- */
  {
    id: "tronquito",
    categoria: "conos",
    etiqueta: "Los troncos del vacile",
    nombre: "El Tronquito",
    descripcion: "Cono de patacón crocante de 12 cm, relleno con la proteína que más te guste.",
    medida: "12 cm",
    imagen: "assets/productos/el-tronquito.jpg",
    adicionales: true,
    opciones: [
      { nombre: "Relleno", valores: ["Carne desmechada", "Pollo desmechado", "Fajitas de pollo", "Fajitas de cerdo", "Ranchero"] },
    ],
    precios: {
      "Carne desmechada": 18000,
      "Pollo desmechado": 15000,
      "Fajitas de pollo": 14000,
      "Fajitas de cerdo": 16000,
      "Ranchero": 17000,
    },
  },
  {
    id: "tronco-bacano",
    categoria: "conos",
    etiqueta: "Los troncos del vacile",
    nombre: "Tronco Bacano",
    descripcion: "El hermano mayor: cono de patacón de 15 cm, más relleno y más sabor.",
    medida: "15 cm",
    imagen: "assets/productos/tronco-bacano.jpg",
    adicionales: true,
    opciones: [
      { nombre: "Relleno", valores: ["Carne desmechada", "Pollo desmechado", "Fajitas de pollo", "Fajitas de cerdo"] },
    ],
    precios: {
      "Carne desmechada": 21000,
      "Pollo desmechado": 17000,
      "Fajitas de pollo": 17000,
      "Fajitas de cerdo": 18000,
    },
  },
  {
    id: "tronco-e-cono",
    categoria: "conos",
    etiqueta: "El de la casa",
    nombre: "Tronco E' Cono",
    descripcion: "El cono mixto de 20 cm que lleva el nombre de la casa. Pa' compartir… o no.",
    medida: "20 cm",
    imagen: "assets/productos/tronco-e-cono.jpg",
    adicionales: true,
    precio: 35000,
    destacado: true,
  },

  /* ---------- CAYEYES ---------- */
  {
    id: "aja-de-siempre",
    categoria: "cayeyes",
    etiqueta: "Cayeyes pa' cucharear",
    nombre: "El Ajá de Siempre",
    descripcion: "Cayeye cuchareable de 10 oz, bien costeño, en la versión que más te provoque.",
    medida: "10 oz",
    imagen: "assets/productos/el-aja-de-siempre.jpg",
    adicionales: true,
    opciones: [
      {
        nombre: "Versión",
        valores: ["Maíz y tocineta", "Salchicha / ranchero", "Chicharrón", "Pollo desmechado", "Fajitas de pollo", "Fajitas de cerdo", "Chorizo", "Carne desmechada"],
      },
    ],
    precios: {
      "Maíz y tocineta": 15000,
      "Salchicha / ranchero": 15000,
      "Chicharrón": 16000,
      "Pollo desmechado": 16000,
      "Fajitas de pollo": 16000,
      "Fajitas de cerdo": 17000,
      "Chorizo": 17000,
      "Carne desmechada": 18000,
    },
  },

  /* ---------- BEBIDAS ---------- */
  {
    id: "jugos-naturales",
    categoria: "bebidas",
    etiqueta: "Pa' refrescar el vacile",
    nombre: "Jugos naturales",
    descripcion: "Jugos 100% naturales de 300 ml, bien fríos pa' acompañar el antojo.",
    medida: "300 ml",
    imagen: "assets/productos/jugos-naturales.jpg",
    opciones: [{ nombre: "Sabor", valores: ["Corozo", "Frutos amarillos", "Tamarindo", "Guayaba agria"] }],
    precios: {
      "Corozo": 6000,
      "Frutos amarillos": 6000,
      "Tamarindo": 6000,
      "Guayaba agria": 6000,
    },
  },

  /* ---------- BOWLS ---------- */
  {
    id: "bowl-paisita",
    categoria: "bowls",
    estilo: "lista",
    nombre: "Bowl Paisita",
    descripcion: "¡Lo mejor de la tradición paisa con el sabor de nuestra tierra!",
    ingredientes: "Arroz blanco, fríjol, maíz dulce, plátano maduro, chicharrón, chorizo, aguacate y cilantro.",
    imagen: "assets/productos/bowl-paisita.jpg",
    opciones: [{ nombre: "Presentación", valores: ["750 g", "1.000 g"] }],
    precios: { "750 g": 23000, "1.000 g": 23000 },
  },
  {
    id: "bowl-balance",
    categoria: "bowls",
    estilo: "lista",
    nombre: "Balance",
    descripcion: "¡El equilibrio perfecto entre frescura y sabor! Texturas suaves y crocantes en un solo bowl.",
    ingredientes: "Arroz integral, chips de plátano verde, fajitas de cerdo a la plancha, lechuga, pico de gallo y aguacate.",
    imagen: "assets/productos/bowl-balance.jpg",
    opciones: [{ nombre: "Presentación", valores: ["750 g", "1.000 g"] }],
    precios: { "750 g": 23000, "1.000 g": 23000 },
  },
  {
    id: "bowl-sabor-de-casa",
    categoria: "bowls",
    estilo: "lista",
    nombre: "Sabor de Casa",
    descripcion: "¡El sabor de casa servido en un solo bowl! Tradición, texturas y sabores auténticos que recuerdan esos almuerzos caseros hechos con amor.",
    imagen: "assets/productos/bowl-sabor-de-casa.jpg",
    opciones: [{ nombre: "Presentación", valores: ["750 g", "1.000 g"] }],
    precios: { "750 g": 23000, "1.000 g": 23000 },
  },
  {
    id: "bowl-pasta-vegetales",
    categoria: "bowls",
    estilo: "lista",
    nombre: "Bowl de Pasta y Vegetales",
    descripcion: "¡Un viaje de sabores! Una comida completa, llena de color y con un toque especial.",
    ingredientes: "Pasta, pechuga de pollo en fajitas, tomate cherry, brócoli, coliflor y queso parmesano.",
    imagen: "assets/productos/bowl-pasta-y-vegetales.jpg",
    opciones: [{ nombre: "Presentación", valores: ["750 g", "1.000 g"] }],
    precios: { "750 g": 23000, "1.000 g": 23000 },
  },
];
