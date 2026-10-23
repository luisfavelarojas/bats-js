# bats-js

Efecto de murciélagos animados sobre `<canvas>`, al estilo de los clásicos
scripts de "nieve cayendo" (`snow.js`), pero con aleteo. Sin dependencias.

## Instalación

```bash
npm install bats-js
```

O directo desde un CDN, sin build:

```html
<script src="https://unpkg.com/bats-js/dist/bats.global.js"></script>
```

## Uso

### Con `<script>` (navegador, sin bundler)

```html
<canvas id="bats-canvas" style="width:100%;height:100%"></canvas>
<script src="https://unpkg.com/bats-js/dist/bats.global.js"></script>
<script>
  Bats.init(document.getElementById('bats-canvas'), {
    count: 18,
    color: '#111111',
    minSize: 14,
    maxSize: 34,
  });
</script>
```

### Con un bundler (ESM / TypeScript)

```ts
import { init } from 'bats-js';

const canvas = document.querySelector<HTMLCanvasElement>('#bats-canvas')!;
const bats = init(canvas, { count: 20, color: '#1a1a1a' });

// bats.stop();
// bats.start();
// bats.setCount(40);
```

### Con CommonJS

```js
const { init } = require('bats-js');
```

## Opciones

| Opción       | Tipo               | Default     | Descripción                                   |
|--------------|---------------------|-------------|------------------------------------------------|
| `count`      | `number`            | `15`        | Cantidad de murciélagos en pantalla            |
| `color`      | `string`            | `'#111111'` | Color de la silueta (cualquier valor CSS)      |
| `minSize`    | `number`            | `14`        | Tamaño mínimo, en px                           |
| `maxSize`    | `number`            | `32`        | Tamaño máximo, en px                           |
| `background` | `string \| null`    | `null`      | Color de fondo a repintar cada frame, o `null` |

## API

`init(canvas, options?)` devuelve un controlador:

- `stop()` — detiene la animación.
- `start()` — la reanuda.
- `setCount(n)` — cambia la cantidad de murciélagos.

## Rendimiento

Con la configuración por defecto (15–20 murciélagos) el costo de CPU medido
es de ~0.8% del hilo principal por segundo — imperceptible en la práctica.

## Desarrollo

```bash
npm install
npm run build   # genera dist/bats.js, dist/bats.cjs, dist/bats.global.js, dist/bats.d.ts
npm run dev     # build en modo watch
```

## Licencia

MIT
