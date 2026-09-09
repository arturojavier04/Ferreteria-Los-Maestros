(function () {
  'use strict';

  const botonMenu = document.getElementById('boton-menu');
  const menuPrincipal = document.getElementById('menu-principal');

  if (botonMenu && menuPrincipal) {
    botonMenu.addEventListener('click', () => {
      // Alterna ambas clases para asegurar compatibilidad total con cualquier regla CSS
      menuPrincipal.classList.toggle('activo');
      const menuAbierto = menuPrincipal.classList.toggle('menu-abierto');
      
      // Actualiza el atributo de accesibilidad para lectores de pantalla
      botonMenu.setAttribute('aria-expanded', String(menuAbierto));
    });
  }
})();