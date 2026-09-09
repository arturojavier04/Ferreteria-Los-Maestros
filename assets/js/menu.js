const botonMenu = document.getElementById('boton-menu');
const menuPrincipal = document.getElementById('menu-principal');

botonMenu.addEventListener('click', () => {

  const menuAbierto =
    menuPrincipal.classList.toggle('menu-abierto');

  botonMenu.setAttribute(
    'aria-expanded',
    String(menuAbierto)
  );

});