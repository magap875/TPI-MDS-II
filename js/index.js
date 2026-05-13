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
            tipoProducto: producto.tipoProducto || "SIMPLE",
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
const inputFiltro = document.getElementById("filtro");

if (inputFiltro) {
    inputFiltro.addEventListener("input", () => {
        const texto = inputFiltro.value.trim().toLowerCase();

        const filtrados = productosGlobal.filter(p =>
            p.activo !== false &&
            p.nombre.toLowerCase().includes(texto)
        );

        if (filtrados.length === 0) {
            document.getElementById("cont-productos").innerHTML =
                "<p class='text-center w-100 text-muted'>No se encontraron productos con ese nombre.</p>";
            return;
        }

        mostrarProductos(filtrados);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarYRenderizar();
    actualizarContadorCarrito();
});