let productosGlobal = [];

document.addEventListener("DOMContentLoaded", async () => {
    productosGlobal = await obtenerProductos();
    mostrarProductos(productosGlobal);
});