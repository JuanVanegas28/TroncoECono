# TroncoEcono — Sitio web de Tronco E' Cono

Menú con carrito y pedido por WhatsApp (**312 244 9857**) + panel de administración
para que la dueña cambie precios y marque productos agotados en tiempo real.

HTML + CSS + JavaScript sin frameworks. Los precios editables se guardan en
**Firebase** (gratis), así que no hace falta servidor ni hosting de pago.

## Estructura
```
index.html          → la página
css/styles.css      → estilos
js/config.js        → WhatsApp, redes, correo admin, Firebase, MENÚ y precios iniciales
js/store.js         → guarda/lee precios (Firebase o modo demostración) y la sesión
js/app.js           → menú, opciones, carrito y mensaje de WhatsApp
js/admin.js         → inicio de sesión y panel de precios
firestore.rules     → reglas de seguridad para pegar en Firebase
assets/             → logo, favicon, imagen para compartir y fotos de productos
```

## Menú actual
| Producto | Tamaño | Precio |
|---|---|---|
| El Tronquito | 12 cm | $14.000 – $18.000 según relleno |
| Tronco Bacano | 15 cm | $17.000 – $21.000 según relleno |
| Tronco E' Cono (mixto) | 20 cm | $35.000 |
| El Ajá de Siempre (cayeye) | 10 oz | $15.000 – $18.000 según versión |
| Jugos naturales (corozo, frutos amarillos, tamarindo, guayaba agria) | 300 ml | $6.000 |
| Bowls: Paisita, Balance, Sabor de Casa, Pasta y Vegetales | 750 g / 1.000 g | $23.000 |
| Adicionales | — | $2.000 – $5.000 |

---

## Firebase (ya configurado)
- Proyecto: **TroncoECono** (`troncoecono-59523`), en la cuenta de Google de Juan David.
- Acceso con correo y contraseña: activado.
- Base de datos Firestore con las reglas de `firestore.rules` publicadas:
  todos pueden **leer** los precios; solo **troncoecono.ceo@gmail.com** (con el correo confirmado) puede **cambiarlos**.
- App web "TroncoEcono Web" registrada; sus claves ya están en `js/config.js`.
- Dominio autorizado: `troncoecono.vercel.app`.

Cada vez que la dueña toca **Guardar cambios**, los precios se actualizan al instante en la
página de todos los clientes (incluso en los que ya la tienen abierta) y quedan así hasta el próximo cambio.

> Si algún día se vacían las claves de `firebase` en `js/config.js`, el panel vuelve a
> **modo demostración** (los cambios solo se guardan en ese navegador).

### Primer ingreso de la dueña
1. Ícono de perfil → **¿Primera vez? Crea tu contraseña** → su correo + contraseña (mín. 8).
2. Le llega un correo de confirmación → toca el enlace → vuelve y toca **Ya lo confirmé**.
3. Listo. Las próximas veces solo entra con correo y contraseña.
   Si la olvida: **Olvidé mi contraseña** → le llega un enlace para crear una nueva.

> Hazlo apenas publiques el sitio. Aunque alguien más intentara registrar ese correo,
> las reglas exigen confirmarlo desde la bandeja de la dueña, así que no podría cambiar precios.

## Qué puede hacer la dueña en el panel
- Cambiar el precio de cada producto, de cada relleno/versión/sabor/presentación y de cada adicional.
- Apagar **Disponible** para marcar un producto o adicional como **agotado** (no se puede pedir).
- Ver cuántos cambios lleva, **Descartar** o **Guardar cambios**.
- **Restaurar precios iniciales** (los de `js/config.js`).

## Publicar en Vercel con el enlace TroncoEcono
1. Sube la carpeta a un repositorio de GitHub llamado `TroncoEcono`.
2. En <https://vercel.com> → Add New → Project → importa `TroncoEcono`.
3. En **Project Name** escribe `troncoecono` → Deploy (no necesita build).
4. Queda en **https://troncoecono.vercel.app** (Vercel siempre usa minúsculas en el enlace).
   Si ese nombre ya estuviera tomado, cambia también las etiquetas `og:url` y `og:image`
   de `index.html` y el dominio autorizado en Firebase.
5. Si después compran un dominio (ej. `troncoecono.com`), se conecta en Vercel → Settings → Domains.

## Agregar o quitar productos
Eso se hace en `js/config.js` (arreglo `MENU`). El panel solo cambia precios y disponibilidad.
Fotos nuevas: guárdalas en `assets/productos/` (idealmente 1200×900 px) y pon la ruta en `imagen`.
