/* ============================================================
   PLÁSTICOS CORTAZARENSES — Comportamiento compartido
   1. Menú móvil
   2. Envío real de formularios de contacto (FormSubmit)
   3. Respaldo: si el navegador no anima, el contenido se muestra igual
   ============================================================ */

/* ── CONFIGURACIÓN ──────────────────────────────────────────
   Correo que recibe las cotizaciones.
   Tras la primera activación, FormSubmit te manda un código
   aleatorio (ej. "a1b2c3d4e5..."). Si lo pones aquí en lugar del
   correo, la dirección deja de verse en el código de la página.  */
var PC_FORM_DESTINO = 'pauloruizm14@gmail.com';
var PC_TELEFONO     = '411 115 4776';
var PC_TEL_LINK     = 'tel:+524111154776';
/* ─────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── 1. MENÚ MÓVIL ── */
  function iniciarMenu() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var links = nav.querySelector('.nav-links');
    var cta   = nav.querySelector(':scope > .nav-cta');
    if (!links) return;

    if (!links.id) links.id = 'menu-principal';

    // Agrupa "Cotizar" + botón de menú a la derecha
    var derecha = document.createElement('div');
    derecha.className = 'nav-derecha';
    if (cta) { nav.insertBefore(derecha, cta); derecha.appendChild(cta); }
    else { nav.appendChild(derecha); }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-controls', links.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menú');
    btn.innerHTML = '<span></span><span></span><span></span>';
    derecha.appendChild(btn);

    // "Cotizar" también dentro del menú (en celular se oculta de la barra)
    if (cta) {
      var li = document.createElement('li');
      li.className = 'nav-cta-movil';
      var a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent;
      li.appendChild(a);
      links.appendChild(li);
    }

    function cerrar() {
      nav.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menú');
    }
    function abrir() {
      nav.classList.add('nav-open');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Cerrar menú');
    }
    btn.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? cerrar() : abrir();
    });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) cerrar(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) { cerrar(); btn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('nav-open') && !nav.contains(e.target)) cerrar();
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100) cerrar(); });
  }

  /* ── 2. FORMULARIOS ── */
  function estado(form, tipo, html) {
    var box = form.querySelector('.form-estado');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-estado';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      form.appendChild(box);
    }
    box.className = 'form-estado visible ' + tipo;
    box.innerHTML = html;
  }

  function iniciarFormularios() {
    var forms = document.querySelectorAll('form.js-contacto');
    Array.prototype.forEach.call(forms, function (form) {
      // Honeypot anti-spam: los bots lo llenan, las personas no lo ven
      if (!form.querySelector('input[name="_honey"]')) {
        var hp = document.createElement('input');
        hp.type = 'text'; hp.name = '_honey'; hp.tabIndex = -1;
        hp.autocomplete = 'off'; hp.className = 'hp-campo';
        hp.setAttribute('aria-hidden', 'true');
        form.appendChild(hp);
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var btn = form.querySelector('button[type="submit"]');
        var textoOriginal = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Enviando…';

        var datos = new FormData(form);
        var tipo = datos.get('Tipo de consulta') || 'Solicitud desde el sitio web';
        var empresa = datos.get('Empresa');
        datos.append('_subject', tipo + (empresa ? ' — ' + empresa : ''));
        datos.append('_template', 'table');
        datos.append('_captcha', 'false');

        fetch('https://formsubmit.co/ajax/' + PC_FORM_DESTINO, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: datos
        })
        .then(function (r) { return r.json().catch(function(){ return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          var exito = res.ok && (res.j.success === true || res.j.success === 'true');
          if (!exito) throw new Error(res.j.message || 'Respuesta no válida');
          form.reset();
          estado(form, 'ok',
            '<strong>¡Listo, recibimos tu mensaje!</strong><br>' +
            'Te respondemos en menos de 24 horas en días hábiles. ' +
            'Si es urgente, llámanos al <a href="' + PC_TEL_LINK + '">' + PC_TELEFONO + '</a>.');
        })
        .catch(function () {
          estado(form, 'error',
            '<strong>No pudimos enviar tu mensaje.</strong><br>' +
            'Tus datos siguen en el formulario: inténtalo de nuevo en un momento, ' +
            'o llámanos al <a href="' + PC_TEL_LINK + '">' + PC_TELEFONO + '</a>.');
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = textoOriginal;
        });
      });
    });
  }

  /* ── 3. RESPALDO DE ANIMACIONES ── */
  function respaldoAnimaciones() {
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(document.querySelectorAll('.fade-in'), function (el) {
        el.classList.add('visible');
      });
    }
  }

  function iniciar() { iniciarMenu(); iniciarFormularios(); respaldoAnimaciones(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
