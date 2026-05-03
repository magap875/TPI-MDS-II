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
                <button class="btn btn-carrito mt-auto">
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
}

async function cargarYRenderizar() {
    productosGlobal = await obtenerProductos();
    mostrarProductos(productosGlobal);
}

/* filtro en tiempo real */
const inputFiltro = document.getElementById("filtro");

if (inputFiltro) {
    inputFiltro.addEventListener("input", () => {
        const texto = inputFiltro.value.trim().toLowerCase();

        const filtrados = productosGlobal.filter(p =>
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

document.addEventListener("DOMContentLoaded", cargarYRenderizar);