(function () {
  'use strict';

  const REGEX_CORREO = /^[\w.+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
  const REGEX_SOLO_LETRAS = /^[A-Za-zÀ-ÖØ-öø-ÿñÑ\s]+$/;

  // Mapa de comunas según región seleccionada (FALTABA ESTO)
  const COMUNAS_POR_REGION = {
    coquimbo: [
      { valor: 'laserena', texto: 'La Serena' },
      { valor: 'coquimbo', texto: 'Coquimbo' },
      { valor: 'ovalle', texto: 'Ovalle' },
      { valor: 'illapel', texto: 'Illapel' },
      { valor: 'vicuna', texto: 'Vicuña' }
    ],
    metropolitana: [
      { valor: 'santiago', texto: 'Santiago Centro' },
      { valor: 'providencia', texto: 'Providencia' },
      { valor: 'lascondes', texto: 'Las Condes' },
      { valor: 'maipu', texto: 'Maipú' },
      { valor: 'puentealto', texto: 'Puente Alto' }
    ],
    valparaiso: [
      { valor: 'valparaiso', texto: 'Valparaíso' },
      { valor: 'vinadelmar', texto: 'Viña del Mar' },
      { valor: 'quilpue', texto: 'Quilpué' },
      { valor: 'villaalemana', texto: 'Villa Alemana' },
      { valor: 'quillota', texto: 'Quillota' }
    ]
  };

  function validarRut(valor) {
    const rut = valor.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rut.length < 7 || rut.length > 9) return false;

    const cuerpo = rut.slice(0, -1);
    const dvIngresado = rut.slice(-1);

    if (!/^\d+$/.test(cuerpo)) return false;

    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    const resto = 11 - (suma % 11);
    const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);

    return dvIngresado === dvEsperado;
  }

  function mostrarError(input, spanError, mensaje) {
    input.classList.add('campo-invalido');
    input.classList.remove('campo-valido');
    input.setAttribute('aria-invalid', 'true');
    if (spanError) spanError.textContent = mensaje;
  }

  function limpiarError(input, spanError) {
    input.classList.remove('campo-invalido');
    input.classList.add('campo-valido');
    input.setAttribute('aria-invalid', 'false');
    if (spanError) spanError.textContent = '';
  }

  function validarCampo(input, spanError, reglas) {
    const valor = input.value.trim();
    for (const regla of reglas) {
      if (!regla.test(valor, input)) {
        mostrarError(input, spanError, regla.mensaje);
        return false;
      }
    }
    limpiarError(input, spanError);
    return true;
  }

  const requerido = (mensaje) => ({
    test: (valor) => valor.length > 0,
    mensaje: mensaje || 'Este campo es obligatorio.',
  });

  const longitud = (min, max, mensaje) => ({
    test: (valor) => valor.length === 0 || (valor.length >= min && valor.length <= max),
    mensaje: mensaje || `Debe tener entre ${min} y ${max} caracteres.`,
  });

  const soloLetras = (mensaje) => ({
    test: (valor) => valor.length === 0 || REGEX_SOLO_LETRAS.test(valor),
    mensaje: mensaje || 'Solo se permiten letras y espacios.',
  });

  const correoValido = (mensaje) => ({
    test: (valor) => REGEX_CORREO.test(valor),
    mensaje: mensaje || 'Ingresa un correo válido de dominio @duoc.cl, @profesor.duoc.cl o @gmail.com.',
  });

  const rutValido = (mensaje) => ({
    test: (valor) => validarRut(valor),
    mensaje: mensaje || 'RUN inválido. Verifica el número y el dígito verificador (ej: 12345678K).',
  });

  const numeroMinimo = (min, mensaje) => ({
    test: (valor) => valor.length === 0 || (!isNaN(valor) && Number(valor) >= min),
    mensaje: mensaje || `Debe ser un número mayor o igual a ${min}.`,
  });

  const enteroMinimo = (min, mensaje) => ({
    test: (valor) => valor.length === 0 || (/^\d+$/.test(valor) && Number(valor) >= min),
    mensaje: mensaje || `Debe ser un número entero mayor o igual a ${min}.`,
  });

  const seleccionObligatoria = (mensaje) => ({
    test: (valor) => valor !== '',
    mensaje: mensaje || 'Selecciona una opción.',
  });

  const coincideCon = (obtenerValorReferencia, mensaje) => ({
    test: (valor) => valor === obtenerValorReferencia(),
    mensaje: mensaje || 'Los valores no coinciden.',
  });

  function inicializarFormulario(form, campos, alEnviar) {
    if (!form) return;

    campos.forEach(({ input, error, reglas }) => {
      if (!input) return;
      input.addEventListener('blur', () => validarCampo(input, error, reglas));
      input.addEventListener('input', () => {
        if (input.classList.contains('campo-invalido')) {
          validarCampo(input, error, reglas);
        }
      });
    });

    form.addEventListener('submit', (evento) => {
      evento.preventDefault();

      let formularioValido = true;
      let primerCampoInvalido = null;

      campos.forEach(({ input, error, reglas }) => {
        if (!input) return;
        const esValido = validarCampo(input, error, reglas);
        if (!esValido) {
          formularioValido = false;
          if (!primerCampoInvalido) primerCampoInvalido = input;
        }
      });

      if (!formularioValido) {
        if (primerCampoInvalido) primerCampoInvalido.focus();
        return;
      }

      if (typeof alEnviar === 'function') alEnviar(form);
    });
  }

  // --- LÓGICA DINÁMICA DE REGIONES Y COMUNAS (FALTABA ESTO) ---
  const selectRegion = document.getElementById('select-region');
  const selectComuna = document.getElementById('select-comuna');

  if (selectRegion && selectComuna) {
    selectRegion.addEventListener('change', () => {
      const region = selectRegion.value;
      selectComuna.innerHTML = '<option value="">- Seleccione la comuna -</option>';

      if (region && COMUNAS_POR_REGION[region]) {
        selectComuna.disabled = false;
        COMUNAS_POR_REGION[region].forEach((c) => {
          const opcion = document.createElement('option');
          opcion.value = c.valor;
          opcion.textContent = c.texto;
          selectComuna.appendChild(opcion);
        });
      } else {
        selectComuna.disabled = true;
      }
    });
  }

  // --- FORMULARIO DE LOGIN ---
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    const correo = document.getElementById('login-correo');
    const password = document.getElementById('login-password');

    inicializarFormulario(
      formLogin,
      [
        {
          input: correo,
          error: document.getElementById('error-login-correo'),
          reglas: [requerido('Ingresa tu correo electrónico.'), correoValido()],
        },
        {
          input: password,
          error: document.getElementById('error-login-password'),
          reglas: [
            requerido('Ingresa tu contraseña.'),
            longitud(4, 10, 'La contraseña debe tener entre 4 y 10 caracteres.'),
          ],
        },
      ],
      () => {
        const valorCorreo = (correo.value || '').trim().toLowerCase();
        if (valorCorreo === 'admin@duoc.cl' || valorCorreo.includes('admin')) {
          alert('Bienvenido al panel de administración');
          window.location.href = 'admin/admin-home.html';
        } else {
          alert('Inicio de sesión exitoso');
          window.location.href = 'index.html';
        }
      }
    );
  }

  // --- FORMULARIO DE REGISTRO ---
  const formRegistro = document.getElementById('form-registro');
  if (formRegistro) {
    const run = document.getElementById('reg-run');
    const nombre = document.getElementById('reg-nombre');
    const apellidos = document.getElementById('reg-apellidos');
    const correo = document.getElementById('reg-correo');
    const password = document.getElementById('reg-password');
    const confirmPassword = document.getElementById('reg-confirm-password');
    const region = document.getElementById('select-region');
    const comuna = document.getElementById('select-comuna');
    const direccion = document.getElementById('reg-direccion');

    inicializarFormulario(
      formRegistro,
      [
        {
          input: run,
          error: document.getElementById('error-run'),
          reglas: [
            requerido('Ingresa tu RUN.'),
            longitud(7, 9, 'El RUN debe tener entre 7 y 9 caracteres.'),
            rutValido(),
          ],
        },
        {
          input: nombre,
          error: document.getElementById('error-reg-nombre'),
          reglas: [requerido('Ingresa tu nombre.'), soloLetras('El nombre solo puede contener letras.')],
        },
        {
          input: apellidos,
          error: document.getElementById('error-reg-apellidos'),
          reglas: [requerido('Ingresa tus apellidos.'), soloLetras('Los apellidos solo pueden contener letras.')],
        },
        {
          input: correo,
          error: document.getElementById('error-reg-correo'),
          reglas: [requerido('Ingresa tu correo electrónico.'), correoValido()],
        },
        {
          input: password,
          error: document.getElementById('error-reg-password'),
          reglas: [
            requerido('Crea una contraseña.'),
            longitud(4, 10, 'La contraseña debe tener entre 4 y 10 caracteres.'),
          ],
        },
        {
          input: confirmPassword,
          error: document.getElementById('error-reg-confirm'),
          reglas: [
            requerido('Por favor repite tu contraseña.'),
            coincideCon(() => password.value.trim(), 'Las contraseñas no coinciden.'),
          ],
        },
        {
          input: region,
          error: null,
          reglas: [seleccionObligatoria('Por favor selecciona tu región.')],
        },
        {
          input: comuna,
          error: null,
          reglas: [seleccionObligatoria('Por favor selecciona tu comuna.')],
        },
        {
          input: direccion,
          error: document.getElementById('error-reg-direccion'),
          reglas: [
            requerido('Ingresa tu dirección.'),
            longitud(5, 300, 'La dirección debe tener al menos 5 caracteres.'),
          ],
        },
      ],
      () => {
        alert('¡Registro completado con éxito! Ya puedes iniciar sesión.');
        formRegistro.reset();
        if (selectComuna) {
          selectComuna.innerHTML = '<option value="">- Seleccione primero una región -</option>';
          selectComuna.disabled = true;
        }
        formRegistro.querySelectorAll('.campo-invalido, .campo-valido').forEach((el) => {
          el.classList.remove('campo-invalido', 'campo-valido');
        });
      }
    );

    if (password && confirmPassword) {
      password.addEventListener('input', () => {
        if (confirmPassword.value.trim().length > 0) {
          validarCampo(confirmPassword, document.getElementById('error-reg-confirm'), [
            requerido('Por favor repite tu contraseña.'),
            coincideCon(() => password.value.trim(), 'Las contraseñas no coinciden.'),
          ]);
        }
      });
    }
  }

  // --- FORMULARIO DE CONTACTO ---
  const formContacto = document.getElementById('form-contacto');
  if (formContacto) {
    const nombre = document.getElementById('nombre-contacto');
    const correo = document.getElementById('correo-contacto');
    const mensaje = document.getElementById('mensaje-contacto');
    const contadorChars = document.getElementById('chars-mensaje');
    const alertaExito = document.getElementById('alerta-exito-contacto');

    if (mensaje && contadorChars) {
      contadorChars.textContent = mensaje.value.length;
      mensaje.addEventListener('input', () => {
        contadorChars.textContent = mensaje.value.length;
      });
    }

    inicializarFormulario(
      formContacto,
      [
        {
          input: nombre,
          error: document.getElementById('error-nombre'),
          reglas: [requerido('Ingresa tu nombre completo.'), soloLetras('El nombre solo puede contener letras.')],
        },
        {
          input: correo,
          error: document.getElementById('error-correo'),
          reglas: [requerido('Ingresa tu correo electrónico.'), correoValido()],
        },
        {
          input: mensaje,
          error: document.getElementById('error-mensaje'),
          reglas: [
            requerido('Escribe tu consulta o comentario.'),
            longitud(10, 500, 'El mensaje debe tener entre 10 y 500 caracteres.'),
          ],
        },
      ],
      () => {
        if (alertaExito) alertaExito.style.display = 'block';
        formContacto.reset();
        if (contadorChars) contadorChars.textContent = '0';
        formContacto.querySelectorAll('.campo-invalido, .campo-valido').forEach((el) => {
          el.classList.remove('campo-invalido', 'campo-valido');
        });
      }
    );
  }

  // --- FORMULARIO NUEVO PRODUCTO (ADMIN) ---
  const formNuevoProducto = document.getElementById('form-nuevo-producto');
  if (formNuevoProducto) {
    const codigo = document.getElementById('prod-codigo');
    const nombre = document.getElementById('prod-nombre');
    const precio = document.getElementById('prod-precio');
    const categoria = document.getElementById('prod-categoria');
    const stock = document.getElementById('prod-stock');
    const stockCritico = document.getElementById('prod-stock-critico');

    inicializarFormulario(
      formNuevoProducto,
      [
        {
          input: codigo,
          error: document.getElementById('error-prod-codigo'),
          reglas: [
            requerido('Ingresa el código del producto.'),
            longitud(3, 20, 'El código debe tener al menos 3 caracteres.'),
          ],
        },
        {
          input: nombre,
          error: document.getElementById('error-prod-nombre'),
          reglas: [
            requerido('Ingresa el nombre del producto.'),
            longitud(1, 100, 'El nombre no puede superar los 100 caracteres.'),
          ],
        },
        {
          input: precio,
          error: document.getElementById('error-prod-precio'),
          reglas: [requerido('Ingresa el precio del producto.'), numeroMinimo(0, 'El precio no puede ser negativo.')],
        },
        {
          input: categoria,
          error: document.getElementById('error-prod-categoria'),
          reglas: [seleccionObligatoria('Selecciona una categoría.')],
        },
        {
          input: stock,
          error: document.getElementById('error-prod-stock'),
          reglas: [
            requerido('Ingresa el stock inicial.'),
            enteroMinimo(0, 'El stock debe ser un número entero mayor o igual a 0.'),
          ],
        },
      ],
      () => {
        alert('Producto fue guardado exitosamente (Datos de prueba, sin backend conectado)');
        formNuevoProducto.reset();
        formNuevoProducto.querySelectorAll('.campo-invalido, .campo-valido').forEach((el) => {
          el.classList.remove('campo-invalido', 'campo-valido');
        });
      }
    );

    if (stockCritico) {
      stockCritico.addEventListener('blur', () => {
        if (stockCritico.value.trim().length > 0 && !/^\d+$/.test(stockCritico.value.trim())) {
          stockCritico.classList.add('campo-invalido');
        } else {
          stockCritico.classList.remove('campo-invalido');
        }
      });
    }
  }

  // --- FORMULARIO NUEVO USUARIO (ADMIN) ---
  const formNuevoUsuarioAdmin = document.getElementById('form-admin-nuevo-usuario');
  if (formNuevoUsuarioAdmin) {
    const run = document.getElementById('admin-user-run');
    const rol = document.getElementById('admin-user-rol');
    const nombre = document.getElementById('admin-user-nombre');
    const apellidos = document.getElementById('admin-user-apellidos');
    const correo = document.getElementById('admin-user-correo');
    const password = document.getElementById('admin-user-pass');
    const direccion = document.getElementById('admin-user-direccion');

    inicializarFormulario(
      formNuevoUsuarioAdmin,
      [
        {
          input: run,
          error: document.getElementById('error-admin-run'),
          reglas: [
            requerido('Ingresa el RUN del usuario.'),
            longitud(7, 9, 'El RUN debe tener entre 7 y 9 caracteres.'),
            rutValido(),
          ],
        },
        {
          input: rol,
          error: document.getElementById('error-admin-rol'),
          reglas: [seleccionObligatoria('Selecciona un rol.')],
        },
        {
          input: nombre,
          error: document.getElementById('error-admin-nombre'),
          reglas: [requerido('Ingresa el nombre.'), soloLetras('El nombre solo puede contener letras.')],
        },
        {
          input: apellidos,
          error: document.getElementById('error-admin-apellidos'),
          reglas: [requerido('Ingresa los apellidos.'), soloLetras('Los apellidos solo pueden contener letras.')],
        },
        {
          input: correo,
          error: document.getElementById('error-admin-correo'),
          reglas: [requerido('Ingresa el correo electrónico.'), correoValido()],
        },
        {
          input: password,
          error: document.getElementById('error-admin-pass'),
          reglas: [
            requerido('Ingresa una contraseña provisoria.'),
            longitud(4, 10, 'La contraseña debe tener entre 4 y 10 caracteres.'),
          ],
        },
        {
          input: direccion,
          error: document.getElementById('error-admin-direccion'),
          reglas: [requerido('Ingresa la dirección.'), longitud(5, 300, 'La dirección debe tener al menos 5 caracteres.')],
        },
      ],
      () => {
        alert('Usuario creado de manera correcta (Datos de prueba, sin backend conectado)');
        formNuevoUsuarioAdmin.reset();
        formNuevoUsuarioAdmin.querySelectorAll('.campo-invalido, .campo-valido').forEach((el) => {
          el.classList.remove('campo-invalido', 'campo-valido');
        });
      }
    );
  }

  // --- BOTONES DE ELIMINAR EN TABLAS ADMIN (FALTABA ESTO) ---
  const botonesEliminar = document.querySelectorAll('.btn-accion-eliminar');
  botonesEliminar.forEach((boton) => {
    boton.addEventListener('click', (e) => {
      const fila = e.target.closest('tr');
      const nombreItem = fila.querySelector('td:nth-child(2)')?.textContent?.trim() || 'este elemento';

      if (confirm(`¿Estás seguro de que deseas eliminar "${nombreItem}"?`)) {
        fila.remove();
        alert(`"${nombreItem}" ha sido eliminado exitosamente.`);
      }
    });
  });

})();