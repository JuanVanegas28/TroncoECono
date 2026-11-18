/* =========================================================
   TRONCO E' CONO — CONFIGURACIÓN
   Todo lo que cambia con el negocio se edita AQUÍ.
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
};

/* ---------------------------------------------------------
   CATEGORÍAS (los filtros del menú)
   --------------------------------------------------------- */
const CATEGORIAS = [
  { id: "todo", nombre: "Todo" },
  { id: "conos", nombre: "Los troncos del vacile" },
  { id: "cayeyes", nombre: "Cayeyes pa' cucharear" },
];

/* ---------------------------------------------------------
   ADICIONALES (se pueden sumar a cualquier producto con
   adicionales: true). Precio por unidad del producto.
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
   - opciones + precios: cuando el precio depende de lo que
     se escoja. La llave es "valor1|valor2" en el orden de
     las opciones. Una combinación sin precio no se ofrece.
   - imagen: ruta a la foto real (ej. "assets/tronquito.jpg").
     Si está vacía se muestra una ilustración de la marca.
   - ilustracion: "cono" | "cono-xl" | "vaso"
   --------------------------------------------------------- */
const MENU = [
  {
    id: "tronquito",
    categoria: "conos",
    etiqueta: "Los troncos del vacile",
    nombre: "El Tronquito",
    descripcion: "Cono de patacón crocante relleno a tu gusto. Escoge el tamaño y la proteína.",
    medida: "12 · 15 cm",
    ilustracion: "cono",
    imagen: "",
    adicionales: true,
    opciones: [
      { nombre: "Tamaño", valores: ["12 cm", "15 cm"] },
      {
        nombre: "Relleno",
        valores: ["Carne desmechada", "Pollo desmechado", "Fajitas de pollo", "Fajitas de cerdo", "Ranchero"],
      },
    ],
    precios: {
      "12 cm|Carne desmechada": 18000,
      "12 cm|Pollo desmechado": 15000,
      "12 cm|Fajitas de pollo": 14000,
      "12 cm|Fajitas de cerdo": 16000,
      "12 cm|Ranchero": 17000,
      "15 cm|Carne desmechada": 21000,
      "15 cm|Pollo desmechado": 17000,
      "15 cm|Fajitas de pollo": 17000,
      "15 cm|Fajitas de cerdo": 18000,
    },
    nota: "Ranchero disponible en 12 cm.",
  },
  {
    id: "tronco-mixto",
    categoria: "conos",
    etiqueta: "Los troncos del vacile",
    nombre: "El Tronco Mixto",
    descripcion: "El cono más grande de la casa: 20 cm, mixto y con todo el vacile. Pa' compartir… o no.",
    medida: "20 cm",
    ilustracion: "cono-xl",
    imagen: "",
    adicionales: true,
    precio: 35000,
  },
  {
    id: "aja-de-siempre",
    categoria: "cayeyes",
    etiqueta: "Cayeyes pa' cucharear",
    nombre: "El Ajá de Siempre",
    descripcion: "Cayeye cuchareable de 10 oz, bien costeño, en la versión que más te provoque.",
    medida: "10 oz",
    ilustracion: "vaso",
    imagen: "",
    adicionales: true,
    opciones: [
      {
        nombre: "Versión",
        valores: [
          "Maíz y tocineta",
          "Salchicha / ranchero",
          "Chicharrón",
          "Pollo desmechado",
          "Fajitas de pollo",
          "Fajitas de cerdo",
          "Chorizo",
          "Carne desmechada",
        ],
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
];
