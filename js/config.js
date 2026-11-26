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
     Correos que pueden entrar al panel y cambiar el menú.
     Si agregas o quitas uno, cámbialo también en las reglas de
     Firestore (firestore.rules y en la consola de Firebase). */
  adminEmails: ["troncoecono.ceo@gmail.com", "pipejuan777@gmail.com"],

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
  { id: "conos", nombre: "Conos y canastas" },
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
   - opciones con varias: true: el cliente marca una o varias y el
     precio no cambia (usa precio fijo).
     La llave de "precios" es el valor escogido (o "valor1|valor2"
     si hay dos grupos de opciones).
   - imagen: foto del producto en assets/productos/
   - estilo: "lista" muestra el producto en formato lista (bowls)
   - insignia: etiqueta amarilla sobre la foto (ej. "Premium")
   El orden de este arreglo es el orden en el celular y en el panel.
   El nombre, la descripción y la foto los puede cambiar la dueña
   desde el panel; lo de aquí es el valor inicial.
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
    id: "tronquito-canasta",
    categoria: "conos",
    etiqueta: "Las canastas del vacile",
    nombre: "Tronquito Canasta",
    descripcion: "Igualito al Tronquito, pero en canasta de patacón crocante: relleno con la proteína que más te guste.",
    imagen: "assets/productos/tronquito-canasta.jpg",
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
    id: "canasta-caribena-premium",
    categoria: "conos",
    etiqueta: "Las canastas del vacile",
    nombre: "Canasta Caribeña Premium",
    descripcion: "La canasta más cargada de la casa, con las proteínas que tú escojas.",
    imagen: "assets/productos/canasta-caribena-premium.jpg",
    adicionales: true,
    insignia: "Premium",
    precio: 30000,
    // varias: true → el cliente marca una o varias (sin cambiar el precio).
    // Para poner un límite, agrega por ejemplo  maximo: 3
    opciones: [
      { nombre: "Proteínas", varias: true, valores: ["Carne desmechada", "Pollo desmechado", "Fajitas de pollo", "Fajitas de cerdo", "Chicharrón"] },
    ],
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
    insignia: "El de la casa",
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
    medida: "750 g",
    precio: 23000,
  },
  {
    id: "bowl-balance",
    categoria: "bowls",
    estilo: "lista",
    nombre: "Balance",
    descripcion: "¡El equilibrio perfecto entre frescura y sabor! Texturas suaves y crocantes en un solo bowl.",
    ingredientes: "Arroz integral, chips de plátano verde, fajitas de cerdo a la plancha, lechuga, pico de gallo y aguacate.",
    imagen: "assets/productos/bowl-balance.jpg",
    medida: "750 g",
    precio: 23000,
  },
  {
    id: "bowl-sabor-de-casa",
    categoria: "bowls",
    estilo: "lista",
    nombre: "Sabor de Casa",
    descripcion: "¡El sabor de casa servido en un solo bowl! Tradición, texturas y sabores auténticos que recuerdan esos almuerzos caseros hechos con amor.",
    imagen: "assets/productos/bowl-sabor-de-casa.jpg",
    medida: "750 g",
    precio: 23000,
  },
  {
    id: "bowl-pasta-vegetales",
    categoria: "bowls",
    estilo: "lista",
    nombre: "Bowl de Pasta y Vegetales",
    descripcion: "¡Un viaje de sabores! Una comida completa, llena de color y con un toque especial.",
    ingredientes: "Pasta, pechuga de pollo en fajitas, tomate cherry, brócoli, coliflor y queso parmesano.",
    imagen: "assets/productos/bowl-pasta-y-vegetales.jpg",
    medida: "750 g",
    precio: 23000,
  },
];

/* ---------------------------------------------------------
   ORDEN DE LAS TARJETAS EN PANTALLAS GRANDES
   Así cada canasta queda DEBAJO de su cono:
     Computador (3 columnas)         Tablet (2 columnas)
     Tronquito | Bacano  | E' Cono   Tronquito | Bacano
     T.Canasta | Premium | Ajá       T.Canasta | Premium
     Jugos     | (bowls)             E' Cono   | Ajá ...
   En el celular (1 columna) se usa el orden del MENU.
   --------------------------------------------------------- */
const ORDEN_TARJETAS = {
  computador: ["tronquito", "tronco-bacano", "tronco-e-cono", "tronquito-canasta", "canasta-caribena-premium", "aja-de-siempre", "jugos-naturales"],
  tablet: ["tronquito", "tronco-bacano", "tronquito-canasta", "canasta-caribena-premium", "tronco-e-cono", "aja-de-siempre", "jugos-naturales"],
};
