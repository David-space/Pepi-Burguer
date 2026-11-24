document.addEventListener('DOMContentLoaded', () => {

  // ⚠️ Cambia este número por el WhatsApp del negocio (código de país + número, sin + ni espacios)
  const NUMERO_WHATSAPP = '573013436916';

  const pedido = [];   // [{ nombre, precio, imagen, cantidad }]

  const contador   = document.getElementById('contador-pedido');
  const btnPedido  = document.getElementById('btn-pedido');
  const panel      = document.getElementById('panel-pedido');
  const overlay    = document.getElementById('panel-overlay');
  const btnCerrar  = document.getElementById('panel-cerrar');
  const lista      = document.getElementById('panel-items');
  const pie        = document.getElementById('panel-foot');
  const totalEl    = document.getElementById('panel-total');
  const btnWhats   = document.getElementById('btn-whatsapp');

  /* ---------- Utilidades ---------- */
  const formato = n => '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const precioANumero = texto => parseInt(texto.replace(/\D/g, ''), 10) || 0;
  const escapar = t => t.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  const iconoMenos = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>';
  const iconoMas   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  const iconoBasura = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>';
  const iconoBolsa = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

  /* ---------- Abrir / cerrar ---------- */
  let temporizador;

  function abrirPanel() {
    clearTimeout(temporizador);
    overlay.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      panel.classList.add('is-open');
    });
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    btnCerrar.focus();
  }

  function cerrarPanel() {
    overlay.classList.remove('is-open');
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    temporizador = setTimeout(() => { overlay.hidden = true; }, 250);
    btnPedido.focus();
  }

  btnPedido.addEventListener('click', abrirPanel);
  btnCerrar.addEventListener('click', cerrarPanel);
  overlay.addEventListener('click', cerrarPanel);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) cerrarPanel();
  });

  /* ---------- Agregar desde el menú ---------- */
  document.querySelectorAll('.btn-add').forEach(boton => {
    boton.addEventListener('click', () => {
      const tarjeta = boton.closest('.card');
      const nombre  = tarjeta.querySelector('h3').textContent.trim();
      const precio  = precioANumero(tarjeta.querySelector('.card__price').textContent);
      const imagen  = tarjeta.querySelector('img').getAttribute('src');

      const existente = pedido.find(p => p.nombre === nombre);
      if (existente) existente.cantidad++;
      else pedido.push({ nombre, precio, imagen, cantidad: 1 });

      actualizar();

      const texto = boton.querySelector('span');
      boton.classList.add('is-added');
      texto.textContent = 'Agregado';
      setTimeout(() => {
        boton.classList.remove('is-added');
        texto.textContent = 'Agregar al pedido';
      }, 1500);
    });
  });

  /* ---------- Sumar, restar y quitar (delegación de eventos) ---------- */
  lista.addEventListener('click', e => {
    const btn = e.target.closest('[data-accion]');
    if (!btn) return;
    const indice = pedido.findIndex(p => p.nombre === btn.dataset.nombre);
    if (indice === -1) return;

    if (btn.dataset.accion === 'mas') {
      pedido[indice].cantidad++;
    } else {
      pedido[indice].cantidad--;
      if (pedido[indice].cantidad === 0) pedido.splice(indice, 1);   // al llegar a 0 se quita
    }
    actualizar();
  });

  /* ---------- Pintar el panel ---------- */
  function actualizar() {
    const unidades = pedido.reduce((s, p) => s + p.cantidad, 0);
    const total    = pedido.reduce((s, p) => s + p.cantidad * p.precio, 0);

    // Círculo del botón "Mi pedido"
    contador.textContent = unidades;
    contador.style.display = unidades > 0 ? 'flex' : 'none';

    if (pedido.length === 0) {
      lista.innerHTML = `
        <div class="panel__empty">
          <div class="panel__empty-icon">${iconoBolsa}</div>
          <h3>Tu pedido está vacío</h3>
          <p>Agrega algo brutal del menú.</p>
        </div>`;
      pie.hidden = true;
      return;
    }

    lista.innerHTML = pedido.map(p => {
      const nombre = escapar(p.nombre);
      return `
        <div class="item">
          <img class="item__img" src="${escapar(p.imagen)}" alt="${nombre}">
          <div class="item__info">
            <div class="item__top"><span>${nombre}</span><span>${formato(p.precio * p.cantidad)}</span></div>
            <div class="qty">
              <button type="button" class="qty__btn" data-accion="menos" data-nombre="${nombre}"
                aria-label="${p.cantidad === 1 ? 'Quitar' : 'Disminuir'} ${nombre}">${p.cantidad === 1 ? iconoBasura : iconoMenos}</button>
              <span>${p.cantidad}</span>
              <button type="button" class="qty__btn qty__btn--plus" data-accion="mas" data-nombre="${nombre}"
                aria-label="Aumentar ${nombre}">${iconoMas}</button>
            </div>
          </div>
        </div>`;
    }).join('');

    totalEl.textContent = formato(total);
    pie.hidden = false;
  }

  /* ---------- Pedir por WhatsApp ---------- */
  btnWhats.addEventListener('click', () => {
    if (pedido.length === 0) return;
    const total = pedido.reduce((s, p) => s + p.cantidad * p.precio, 0);
    const lineas = pedido.map(p => `• ${p.cantidad} x ${p.nombre} — ${formato(p.cantidad * p.precio)}`);
    const mensaje = `Hola, quiero hacer este pedido:\n\n${lineas.join('\n')}\n\nTotal productos: ${formato(total)}\n\n¿Me confirman el valor del domicilio y el tiempo?`;
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`, '_blank');
  });

  actualizar();   // pinta el estado vacío al cargar
});