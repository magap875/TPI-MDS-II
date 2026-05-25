let productosGlobal = [];

const URL = "https://69e616eace4e908a155ef130.mockapi.io/producto";

// mostrar carrito si es cliente
const rol = localStorage.getItem("rol");
const carrito = document.getElementById("icono-carrito");

if (rol === "cliente" && carrito) {
    carrito.classList.remove("d-none");
}

async function obtenerProductos() {
    const res = await fetch(URL);
    return await res.json();
}

/* RENDER */
function mostrarProductos(productos) {
    const contenedor = document.getElementById("cont-productos");

    contenedor.innerHTML = "";

    productos.forEach(p => {

        //boton carrito solo para clientes
        let botonCarrito = "";

        if (rol === "cliente") {
            botonCarrito = `
                <button class="btn btn-carrito mt-auto" data-id="${p.id}">
                Agregar al carrito
                </button>
            `;
        }

        contenedor.innerHTML += `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="card shadow-sm h-100 border-0">

                    <img src="${p.url}" class="card-img-top" style="height:180px; object-fit:cover;" alt="${p.nombre}">

                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${p.nombre}</h5>
                        <p class="card-text mb-1">Marca: ${p.marca}</p>
                        <p class="card-text mb-1">Precio: $${p.precio}</p>
                        ${botonCarrito}
                    </div>

                </div>
            </div>
        `;
    });
    activarBotonesCarrito();
}

async function cargarYRenderizar() {
    productosGlobal = await obtenerProductos();
    const productosActivos = productosGlobal.filter(p => p.activo !== false);
    mostrarProductos(productosActivos);
}

function activarBotonesCarrito() {

    const botones = document.querySelectorAll(".btn-carrito");

    botones.forEach(boton => {

        boton.addEventListener("click", () => {

            const idProducto = boton.dataset.id;

            agregarAlCarrito(idProducto);

        });

    });

}

function agregarAlCarrito(idProducto) {

    const producto = productosGlobal.find(p => p.id == idProducto);

    if (!producto) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Producto no encontrado"
        });
        return;
    }

    // VALIDAR STOCK 0
    if (producto.stock <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Sin stock",
            text: "Este producto no tiene stock disponible"
        });
        return;
    }

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const itemExistente = carrito.find(item => item.productoId == producto.id);

    if (itemExistente) {
        if (itemExistente.cantidad >= producto.stock) {
            Swal.fire({
                icon: "warning",
                title: "Stock insuficiente",
                text: "No hay más stock disponible"
            });
            return;
        }
        itemExistente.cantidad++;
        itemExistente.subtotal = itemExistente.cantidad * itemExistente.precioUnitario;
    } else {
        carrito.push({
            productoId: producto.id,
            nombreProducto: producto.nombre,
            imagen: producto.url,
            cantidad: 1,
            precioUnitario: Number(producto.precio),
            subtotal: Number(producto.precio)
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    actualizarContadorCarrito();

    Swal.fire({
        icon: "success",
        title: "Producto agregado",
        text: "El producto se agregó al carrito",
        timer: 1500,
        showConfirmButton: false
    });
}

function actualizarContadorCarrito() {

    const contador = document.getElementById("contador-carrito");

    if (!contador) return;

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    contador.textContent = cantidadTotal;
}


/* filtro en tiempo real */
// FILTRO BUSQUEDA PRODUCTOS
function aplicarFiltros() {
    const texto = document.getElementById("filtro-texto").value.trim().toLowerCase();
    const marca = document.getElementById("filtro-marca").value.trim().toLowerCase();
    const precioMinInput = document.getElementById("filtro-precio-min").value;
    const precioMaxInput = document.getElementById("filtro-precio-max").value;
    const precioMin = precioMinInput === "" ? null : Number(precioMinInput);
    const precioMax = precioMaxInput === "" ? null : Number(precioMaxInput);
    const orden = document.getElementById("ordenar").value;
    let base = productosGlobal;

    if (orden === "inactivos") {
        base = productosGlobal.filter(p => p.activo === false);
    } else {
        base = productosGlobal.filter(p => p.activo !== false);
    }

    let filtrados = base.filter(p => {
        const coincideTexto = p.nombre.toLowerCase().includes(texto);

        const coincideMarca =
            !marca || p.marca.toLowerCase().includes(marca);

        const coincidePrecioMin =
            precioMin === null || p.precio >= precioMin;

        const coincidePrecioMax =
            precioMax === null || p.precio <= precioMax;

        return (
            coincideTexto &&
            coincideMarca &&
            coincidePrecioMin &&
            coincidePrecioMax
        );
    });

    switch (orden) {
        case "precio-asc":
            filtrados.sort((a, b) => a.precio - b.precio);
            break;

        case "precio-desc":
            filtrados.sort((a, b) => b.precio - a.precio);
            break;
    }

    if (filtrados.length === 0) {
        document.getElementById("contenedor-productos").innerHTML =
            "<p class='text-center text-muted w-100'>No hay productos con esos filtros.</p>";
        return;
    }
    mostrarProductos(filtrados);
}

document.querySelectorAll(
    "#filtro-texto, #filtro-marca, #filtro-precio-min, #filtro-precio-max, #ordenar"
).forEach(input => {
    input.addEventListener("input", aplicarFiltros);
    input.addEventListener("change", aplicarFiltros);
});

document.addEventListener("DOMContentLoaded", () => {
    cargarYRenderizar();
    actualizarContadorCarrito();
});