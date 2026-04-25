import { obtenerComentarios, guardarComentario, formatearFecha } from '../services/comentarios.js';

/* ──────────────────────────────────────────
   GALERÍA
────────────────────────────────────────── */
const galeriaItems = document.querySelectorAll('.galeria__item');
const modalOverlay  = document.getElementById('modalOverlay');
const modalImg      = document.getElementById('modalImg');
const modalCaption  = document.getElementById('modalCaption');
const modalClose    = document.getElementById('modalClose');

galeriaItems.forEach(item => {
  item.addEventListener('click', () => {
    const img     = item.querySelector('img');
    const caption = item.querySelector('figcaption');
    modalImg.src        = img.src;
    modalImg.alt        = img.alt;
    modalCaption.textContent = caption ? caption.textContent : '';
    modalOverlay.classList.add('modal--activo');
    modalOverlay.setAttribute('aria-hidden', 'false');
    modalClose.focus();
  });
});

modalClose.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) cerrarModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal();
});

function cerrarModal() {
  modalOverlay.classList.remove('modal--activo');
  modalOverlay.setAttribute('aria-hidden', 'true');
}

/* ──────────────────────────────────────────
   COMENTARIOS — CARGAR
────────────────────────────────────────── */
const listaComentarios = document.getElementById('listaComentarios');
const loadingMsg       = document.getElementById('loadingMsg');
const emptyMsg         = document.getElementById('emptyMsg');
const errorMsg         = document.getElementById('errorMsg');

async function cargarComentarios() {
  loadingMsg.hidden = false;
  emptyMsg.hidden   = true;
  errorMsg.hidden   = true;

  // Limpiar comentarios previos (excepto los mensajes de estado)
  const tarjetas = listaComentarios.querySelectorAll('.comentario-card');
  tarjetas.forEach(c => c.remove());

  try {
    const comentarios = await obtenerComentarios();
    loadingMsg.hidden = true;

    if (comentarios.length === 0) {
      emptyMsg.hidden = false;
      return;
    }

    // Mostrar del más reciente al más antiguo
    const ordenados = [...comentarios].reverse();
    ordenados.forEach(c => {
      listaComentarios.appendChild(crearTarjeta(c));
    });
  } catch {
    loadingMsg.hidden = true;
    errorMsg.hidden   = false;
  }
}

function crearTarjeta({ nombreCompleto, comentario, fecha }) {
  const article = document.createElement('article');
  article.className = 'comentario-card';
  article.setAttribute('role', 'article');

  const avatar = nombreCompleto.charAt(0).toUpperCase();

  article.innerHTML = `
    <div class="comentario-card__avatar" aria-hidden="true">${avatar}</div>
    <div class="comentario-card__body">
      <header class="comentario-card__header">
        <strong class="comentario-card__nombre">${escaparHTML(nombreCompleto)}</strong>
        <time class="comentario-card__fecha" datetime="${fecha}">
          ${formatearFecha(fecha)}
        </time>
      </header>
      <p class="comentario-card__texto">${escaparHTML(comentario)}</p>
    </div>
  `;
  return article;
}

function escaparHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ──────────────────────────────────────────
   COMENTARIOS — FORMULARIO
────────────────────────────────────────── */
const form          = document.getElementById('formComentario');
const inputNombre   = document.getElementById('nombreCompleto');
const inputComent   = document.getElementById('comentario');
const btnEnviar     = document.getElementById('btnEnviar');
const mensajeExito  = document.getElementById('mensajeExito');
const mensajeError  = document.getElementById('mensajeError');
const charCount     = document.getElementById('charCount');
const MAX_CHARS     = 300;

// Contador de caracteres
inputComent.addEventListener('input', () => {
  const restantes = MAX_CHARS - inputComent.value.length;
  charCount.textContent = `${inputComent.value.length}/${MAX_CHARS}`;
  charCount.style.color = restantes < 30 ? 'var(--color-alerta)' : 'var(--color-texto-suave)';
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  ocultarMensajes();

  const nombre   = inputNombre.value.trim();
  const comentar = inputComent.value.trim();

  if (!nombre || !comentar) return;

  btnEnviar.disabled      = true;
  btnEnviar.textContent   = 'Enviando…';
  btnEnviar.setAttribute('aria-busy', 'true');

  try {
    await guardarComentario(nombre, comentar);
    form.reset();
    charCount.textContent = `0/${MAX_CHARS}`;
    mensajeExito.hidden   = false;
    mensajeExito.focus();
    await cargarComentarios();          // Recargar lista
  } catch {
    mensajeError.hidden = false;
    mensajeError.focus();
  } finally {
    btnEnviar.disabled    = false;
    btnEnviar.textContent = 'Publicar comentario';
    btnEnviar.removeAttribute('aria-busy');
  }
});

function ocultarMensajes() {
  mensajeExito.hidden = true;
  mensajeError.hidden = true;
}

/* ──────────────────────────────────────────
   NAVEGACIÓN ACTIVA AL HACER SCROLL
────────────────────────────────────────── */
const secciones = document.querySelectorAll('main section[id]');
const navLinks  = document.querySelectorAll('.nav__link');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle(
          'nav__link--activo',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    }
  });
}, { threshold: 0.4 });

secciones.forEach(s => observer.observe(s));

/* ──────────────────────────────────────────
   MENÚ MOBILE
────────────────────────────────────────── */
const btnMenu  = document.getElementById('btnMenu');
const navMenu  = document.getElementById('navMenu');

btnMenu.addEventListener('click', () => {
  const abierto = navMenu.classList.toggle('nav__menu--abierto');
  btnMenu.setAttribute('aria-expanded', abierto);
});

/* ──────────────────────────────────────────
   INICIO
────────────────────────────────────────── */
cargarComentarios();
