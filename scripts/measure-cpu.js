/**
 * medir-costo-raf.js — diagnóstico temporal de costo de CPU.
 *
 * Qué hace: intercepta requestAnimationFrame y mide cuánto tiempo tardan
 * de verdad los callbacks que se ejecutan en cada frame (incluye tu script
 * de murciélagos y cualquier otra animación que use rAF en la página).
 *
 * Uso:
 *   1. Pega esto en la consola del navegador (o agrégalo como <script>
 *      justo ANTES de cargar bats.js / tu script de animación).
 *   2. Espera unos segundos: cada 2s imprime en consola el % de CPU usado.
 *   3. Para apagar la medición: window.stopMedicionRAF()
 *
 * No modifica tu animación, solo cronometra los callbacks que ya existen.
 */
(function () {
  const realRAF = window.requestAnimationFrame.bind(window);
  let totalBusy = 0;
  let callbacks = 0;
  let active = true;

  window.requestAnimationFrame = function (cb) {
    return realRAF(function (ts) {
      if (!active) return cb(ts);
      const t0 = performance.now();
      cb(ts);
      totalBusy += performance.now() - t0;
      callbacks++;
    });
  };

  function reportLoop() {
    if (!active) return;
    const windowMs = 2000;
    setTimeout(() => {
      const pct = (totalBusy / windowMs) * 100;
      console.log(
        `[medir-costo-raf] ${totalBusy.toFixed(1)}ms de CPU en ${windowMs}ms ` +
        `≈ ${pct.toFixed(2)}% del hilo principal | ${callbacks} callbacks/${(windowMs/1000)}s`
      );
      totalBusy = 0;
      callbacks = 0;
      reportLoop();
    }, windowMs);
  }

  window.stopMedicionRAF = function () {
    active = false;
    window.requestAnimationFrame = realRAF;
    console.log('[medir-costo-raf] medición detenida, rAF restaurado.');
  };

  console.log('[medir-costo-raf] midiendo... (window.stopMedicionRAF() para detener)');
  reportLoop();
})();
