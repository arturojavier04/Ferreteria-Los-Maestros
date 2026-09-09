(function () {
  'use strict';

  const CLAVE_CARRITO = 'ferreteria-carrito';

  // Cupones de descuento de ejemplo (solo para esta demo sin backend).
  const CUPONES = {
    MAESTRO10: 0.10,
    BIENVENIDO5: 0.05,
  };

  let descuentoAplicado = 0;

  function leerCarrito() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
      return Array.isArray(datos) ? datos : [];
    } catch (e) {
      return [];
    }
  }

  function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    actualizarContadorCarrito();
  }

  function actualizarContadorCarrito() {
    const totalUnidades = leerCarrito().reduce((acc, item) => acc + item.cantidad, 0);
    document.querySelectorAll('#cant-carrito').forEach((span) => {
      span.textContent = totalUnidades;
    });
  }

  function formatearCLP(numero) {
    const redondeado = Math.round(numero);
    return '$' + redondeado.toLocaleString('es-CL');
  }

  function agregarAlCarrito(producto) {
    const carrito = leerCarrito();
    const existente = carrito.find((item) => item.id === producto.id);
    if (existente) {
      existente.cantidad += producto.cantidad;
    } else {
      carrito.push(producto);
    }
    guardarCarrito(carrito);
  }
  actualizarContadorCarrito();

  document.querySelectorAll('.tarjeta-producto').forEach((tarjeta) => {
    const boton = tarjeta.querySelector('.boton-agregar-carrito');
    if (!boton) return;

    boton.addEventListener('click', () => {
      const producto = {
        id: tarjeta.dataset.id,
        nombre: tarjeta.dataset.nombre,
        precio: Number(tarjeta.dataset.precio),
        imagen: tarjeta.dataset.imagen,
        cantidad: 1,
      };
      agregarAlCarrito(producto);

      const textoOriginal = boton.textContent;
      boton.textContent = '✓ Agregado';
      boton.disabled = true;
      setTimeout(() => {
        boton.textContent = textoOriginal;
        boton.disabled = false;
      }, 900);
    });
  });

  const botonAnadirGrande = document.querySelector('.boton-anadir-grande');
  if (botonAnadirGrande) {
    botonAnadirGrande.addEventListener('click', () => {
      const contenedorInfo = document.querySelector('.info-compra-producto');
      const nombreEl = document.getElementById('nombre-producto');
      const precioEl = document.querySelector('.precio-grande');
      const cantidadEl = document.getElementById('cantidad-producto');
      const imagenEl = document.getElementById('img-principal');

      if (!nombreEl || !precioEl) return;

      const cantidad = Math.max(1, parseInt(cantidadEl ? cantidadEl.value : '1', 10) || 1);

      agregarAlCarrito({
        id: (contenedorInfo && contenedorInfo.dataset.id) || nombreEl.textContent.trim(),
        nombre: nombreEl.textContent.trim(),
        precio: Number(precioEl.textContent.replace(/[^\d]/g, '')),
        imagen: imagenEl ? imagenEl.getAttribute('src') : '',
        cantidad: cantidad,
      });

      alert('Producto agregado al carrito.');
    });
  }

  const contenedorItems = document.getElementById('contenedor-items-carrito');
  if (contenedorItems) {
    const montoTotalEl = document.getElementById('monto-total');
    const formCupon = document.querySelector('.form-cupon');
    const botonPagar = document.querySelector('.boton-pagar');

    function calcularTotales(carrito) {
      const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
      const total = subtotal - subtotal * descuentoAplicado;
      return { subtotal, total };
    }

    function renderizarCarrito() {
      const carrito = leerCarrito();
      contenedorItems.innerHTML = '';

      if (carrito.length === 0) {
        contenedorItems.innerHTML =
          '<p class="carrito-vacio">Tu carrito está vacío. <a href="productos.html">Ver productos</a></p>';
      } else {
        carrito.forEach((item) => {
          const articulo = document.createElement('article');
          articulo.className = 'item-carrito';
          articulo.dataset.id = item.id;
          articulo.innerHTML = `
            <img src="${item.imagen || ''}" alt="${item.nombre}">
            <div class="detalle-item">
              <h3>${item.nombre}</h3>
              <p class="precio-unitario">${formatearCLP(item.precio)} c/u</p>
            </div>
            <div class="controles-cantidad">
              <button type="button" class="btn-cantidad btn-restar" aria-label="Disminuir cantidad de ${item.nombre}">-</button>
              <input type="number" value="${item.cantidad}" min="1" readonly class="input-cantidad">
              <button type="button" class="btn-cantidad btn-sumar" aria-label="Aumentar cantidad de ${item.nombre}">+</button>
            </div>
            <div class="subtotal-item">
              <strong>${formatearCLP(item.precio * item.cantidad)}</strong>
              <button type="button" class="btn-quitar-item" aria-label="Quitar ${item.nombre} del carrito">🗑 Quitar</button>
            </div>
          `;
          contenedorItems.appendChild(articulo);
        });
      }

      const { total } = calcularTotales(carrito);
      if (montoTotalEl) montoTotalEl.innerHTML = `<strong>${formatearCLP(total)}</strong>`;
    }

    contenedorItems.addEventListener('click', (evento) => {
      const boton = evento.target.closest('button');
      if (!boton) return;

      const articulo = boton.closest('.item-carrito');
      if (!articulo) return;

      const id = articulo.dataset.id;
      const carrito = leerCarrito();
      const indice = carrito.findIndex((item) => item.id === id);
      if (indice === -1) return;

      if (boton.classList.contains('btn-sumar')) {
        carrito[indice].cantidad += 1;
      } else if (boton.classList.contains('btn-restar')) {
        carrito[indice].cantidad -= 1;
        if (carrito[indice].cantidad <= 0) carrito.splice(indice, 1);
      } else if (boton.classList.contains('btn-quitar-item')) {
        carrito.splice(indice, 1);
      } else {
        return;
      }

      guardarCarrito(carrito);
      renderizarCarrito();
    });

    if (formCupon) {
      const inputCupon = formCupon.querySelector('#cupon');
      const botonAplicar = formCupon.querySelector('.boton-secundario');

      if (botonAplicar) {
        botonAplicar.addEventListener('click', () => {
          const codigo = (inputCupon.value || '').trim().toUpperCase();

          if (!codigo) {
            alert('Ingrese un cupón de descuento antes de aplicar.');
            return;
          }

          if (Object.prototype.hasOwnProperty.call(CUPONES, codigo)) {
            descuentoAplicado = CUPONES[codigo];
            alert(`Cupón aplicado: ${descuentoAplicado * 100}% de descuento.`);
          } else {
            descuentoAplicado = 0;
            alert('El cupón ingresado no es válido.');
          }
          renderizarCarrito();
        });
      }
    }

    if (botonPagar) {
      botonPagar.addEventListener('click', () => {
        const carrito = leerCarrito();
        if (carrito.length === 0) {
          alert('Tu carrito está vacío. Agrega los productos antes de pagar.');
          return;
        }
        const { total } = calcularTotales(carrito);
        alert(`¡Gracias por tu compra! Total pagado: ${formatearCLP(total)}`);
        guardarCarrito([]);
        descuentoAplicado = 0;
        window.location.href = 'index.html';
      });
    }

    renderizarCarrito();
  }
})();