# Tronco E' Cono — Sitio web

Sitio estático (HTML + CSS + JavaScript, sin frameworks ni base de datos) con menú, adicionales, carrito y envío del pedido por WhatsApp al **312 244 9857**.

## Estructura
```
index.html        → estructura de la página
css/styles.css    → estilos (colores en :root)
js/config.js      → WhatsApp, redes, MENÚ y ADICIONALES  ← lo que se edita
js/app.js         → lógica del menú, opciones y carrito
assets/           → logo (logo.webp, logo-sm.png), favicon, imagen para compartir
```

## Cambiar precios o productos (`js/config.js`)
- **Producto con precio fijo**: `precio: 35000`.
- **Producto con opciones** (tamaño, relleno, versión): lista `opciones` + tabla `precios`
  con la llave `"valor1|valor2"`. Ej: `"15 cm|Carne desmechada": 21000`.
  Si una combinación no está en la tabla, no se puede escoger (ej. Ranchero 15 cm).
- **Adicionales**: arreglo `ADICIONALES`. Aparecen en todos los productos con `adicionales: true`.
- **Domicilio**: `domicilio: 4000` para sumarlo al total; `null` = se confirma por WhatsApp.

## Fotos reales
Cada producto muestra una ilustración de la marca mientras no tenga foto.
Para usar foto: guárdala en `assets/` (ej. `assets/tronquito.jpg`, idealmente 1200×900 px)
y ponla en `imagen: "assets/tronquito.jpg"`.

## Cómo funciona el pedido
1. El cliente toca **Pedir**, escoge tamaño / relleno / versión, adicionales y cantidad.
2. El pedido se guarda en su navegador (localStorage), no necesita servidor.
3. Llena nombre, entrega (domicilio o recoger), dirección, pago y notas.
4. **Enviar pedido por WhatsApp** abre el chat con el pedido ya redactado y el total.

## Publicar
Subir la carpeta a GitHub y desplegar en Vercel (o Netlify) como sitio estático; no requiere build.
Después de publicar, cambia en `index.html` la etiqueta `og:image` por la URL completa
(ej. `https://troncoecono.vercel.app/assets/og-image.jpg`) para que la vista previa del enlace
salga con el logo al compartirlo por WhatsApp.
