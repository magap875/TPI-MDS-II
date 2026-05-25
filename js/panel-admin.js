let productosGlobal = [];

// SUBIDA DE IMAGEN A CLAUDINARY
async function subirImagen(file) {
    const url = "https://api.cloudinary.com/v1_1/dl0iojce6/image/upload";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "producto");

    const res = await fetch(url, {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    return data.secure_url;
}

// REGISTRO DE PRODUCTOS
const form = document.querySelector('form[name="registroProducto"]');

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementsByName("nombre")[0].value;
    const precio = Number(document.getElementsByName("precio")[0].value);
    const marca = document.getElementsByName("marca")[0].value;
    const stock = Number(document.getElementsByName("stock")[0].value);
    const stockMinimo = Number(document.getElementsByName("stockMinimo")[0].value);
    const file = document.getElementsByName("imagen")[0].files[0];

    if (!Number.isInteger(stockMinimo) || stockMinimo <= 0) {
        Swal.fire({
            icon: "error",
            title: "Stock mínimo inválido",
            text: "Debe ser un número entero positivo"
        });

        return;
    }

    if (!file) {
        Swal.fire({
            icon: "warning",
            title: "Falta imagen",
            text: "Tenés que subir una imagen"
        });
        return;
    }

    if (!file.type.includes("image/jpeg") && !file.type.includes("image/png")) {
        Swal.fire({
            icon: "error",
            title: "Formato inválido",
            text: "Solo se permiten imágenes JPG o PNG"
        });
        return;
    }

    try {
        Swal.fire({
            title: "Cargando producto...",
            text: "Por favor esperá",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // subir imagen
        const imageUrl = await subirImagen(file);

        const nuevoProducto = {
            nombre,
            precio,
            marca,
            stock,
            stockMinimo,
            activo: true,
            url: imageUrl
        };

        const productos = await obtenerProductos();
        const nombreNormalizado = nombre.trim().toLowerCase();
        const marcaNormalizada = marca.trim().toLowerCase();

        const existeProducto = productos.some(p =>
            p.nombre.trim().toLowerCase() === nombreNormalizado &&
            p.marca.trim().toLowerCase() === marcaNormalizada
        );

        if (existeProducto) {
            Swal.fire({
                icon: "error",
                title: "Producto duplicado",
                text: "Ese producto ya existe"
            });
            form.reset();
            previewNombre.textContent = "Nombre producto";
            previewPrecio.textContent = "Precio";
            previewMarca.textContent = "Marca";
            previewStock.textContent = "Stock";
            previewImgContainer.innerHTML = "";
            return;
        }

        const resp = await fetch("https://69e616eace4e908a155ef130.mockapi.io/producto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoProducto)
        });

        if (!resp.ok) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo registrar el producto"
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Producto registrado",
            showConfirmButton: false,
            timer: 1500
        });

        setTimeout(() => {
            location.reload();
        }, 1500);

    } catch (error) {
        console.error(error);

        Swal.fire({
            icon: "error",
            title: "Error inesperado",
            text: "Ocurrió un problema al registrar el producto"
        });
    }
});

function formatearTexto(texto) {
    return texto
        .toLowerCase()
        .split(" ")
        .filter(p => p.length > 0)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}

// OBTENCION DE PRODUCTOS
const URL = "https://69e616eace4e908a155ef130.mockapi.io/producto";

async function obtenerProductos() {
    const res = await fetch(URL);
    return await res.json();
}

// RENDERIZAR PRODUCTOS
async function renderizarProductos() {
    productosGlobal = await obtenerProductos();
    const productosActivos = productosGlobal.filter(p => p.activo !== false);
    mostrarProductos(productosActivos);
}

// MOSTRAR PRODUCTOS
function mostrarProductos(productos) {
    const contenedor = document.getElementById("contenedor-productos");

    contenedor.innerHTML = "";

    productos.forEach(p => {
        const stockBajo =
            Number(p.stock) <= Number(p.stockMinimo);

        const esInactivo = p.activo === false;

        const col = document.createElement("div");
        col.className = "w-100";

        col.innerHTML = `
        <div class="card shadow-sm border-0 mb-2">
        <div class="row g-0 align-items-center">

            <div class="col-md-2 p-2">
            <img src="${p.url}" 
                class="img-fluid rounded shadow" 
                style="height: 100px; width: 100%; object-fit: cover;"
                alt="${p.nombre}">
            </div>

            <div class="col-md-7">
            <div class="card-body py-2">
                <h5 class="card-title mb-2 fw-bold">${p.nombre}</h5>

                <div class="d-flex flex-wrap gap-3 small text-muted">
                <span><strong>ID:</strong> ${p.id}</span>
                <span><strong>Marca:</strong> ${p.marca}</span>
                </div>

                <div class="d-flex flex-wrap gap-3 mt-2 align-items-center">

                <span>Precio: $${p.precio}</span>

                <div class="d-flex gap-2 flex-wrap">

                <span class="badge ${stockBajo ? 'stock-alerta' : 'stock-ok'}">
                    Stock: ${p.stock}
                </span>

                <span class="badge stock-min-badge">
                    S. Mínimo: ${p.stockMinimo}
                </span>

                </div>
                </div>

            </div>
            </div>

            <div class="col-md-3 text-end px-3">
            <div class="d-flex justify-content-end gap-2">

            <button class="btn btn-sm btn-editar"
            data-id="${p.id}"
            data-stock-minimo="${p.stockMinimo}">
            <i class="fa-solid fa-pen"></i>
            </button>

            ${esInactivo
                ? `
            <button class="btn btn-sm btn-reactivar"
            data-id="${p.id}">
            <i class="fa-solid fa-rotate-left"></i>
            </button>
            `
                : `
            <button class="btn btn-sm btn-eliminar"
            data-id="${p.id}"
            data-activo="${p.activo}">
            <i class="fa-solid fa-trash"></i>
            </button>
            `
            }

            </div>
            </div>

        </div>
        </div>
        `;
        contenedor.appendChild(col);
    });
}

renderizarProductos();

document.addEventListener("click", async (e) => {
    const btnEliminar = e.target.closest(".btn-eliminar");

    if (!btnEliminar) return;

    const id = btnEliminar.dataset.id;
    const activo = btnEliminar.dataset.activo === "true";

    if (!activo) {

        Swal.fire({
            icon: "error",
            title: "Producto ya dado de baja"
        });

        return;
    }

    const confirmar = await Swal.fire({
        icon: "warning",
        title: "¿Dar de baja producto?",
        text: "El producto dejará de estar disponible",
        showCancelButton: true,
        confirmButtonText: "Sí, dar de baja",
        cancelButtonText: "Cancelar"
    });

    if (!confirmar.isConfirmed) return;

    const resp = await fetch(`${URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...productosGlobal.find(p => p.id === id),
            activo: false
        })
    });

    if (!resp.ok) {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo dar de baja"
        });

        return;
    }

    Swal.fire({
        icon: "success",
        title: "Producto dado de baja",
        showConfirmButton: false,
        timer: 1500
    });

    setTimeout(() => {
        location.reload();
    }, 1500);
});

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

        case "stock-asc":
            filtrados.sort((a, b) => a.stock - b.stock);
            break;

        case "stock-desc":
            filtrados.sort((a, b) => b.stock - a.stock);
            break;

        case "stock-bajo":
            filtrados = filtrados.filter(
                p => Number(p.stock) <= Number(p.stockMinimo)
            );
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

// PREVIEW PRODUCTO
const formPreview = document.forms["registroProducto"];
const inputNombre = formPreview.nombre;
const inputPrecio = formPreview.precio;
const inputMarca = formPreview.marca;
const inputStock = formPreview.stock;
const inputImagen = formPreview.imagen;
const inputStockMinimo = formPreview.stockMinimo;
const previewStockMinimo = document.getElementById("preview-stock-minimo");
const previewNombre = document.getElementById("preview-nombre");
const previewPrecio = document.getElementById("preview-precio");
const previewMarca = document.getElementById("preview-marca");
const previewStock = document.getElementById("preview-stock");
const previewImgContainer = document.querySelector(".img-preview");

// actualiza el texto
inputNombre.addEventListener("input", () => {
    previewNombre.textContent = formatearTexto(inputNombre.value) || "Nombre del producto";
});

inputPrecio.addEventListener("input", () => {
    previewPrecio.textContent = inputPrecio.value
        ? `Precio: $${inputPrecio.value}`
        : "Precio";
});

inputMarca.addEventListener("input", () => {
    previewMarca.textContent = inputMarca.value
        ? `Marca: ${inputMarca.value}`
        : "Marca";
});

inputStock.addEventListener("input", () => {
    previewStock.textContent = inputStock.value
        ? `Stock: ${inputStock.value}`
        : "Stock";
});

inputStockMinimo.addEventListener("input", () => {
    previewStockMinimo.textContent = inputStockMinimo.value
        ? `Stock mínimo: ${inputStockMinimo.value}`
        : "Stock mínimo";
});

// imagen
inputImagen.addEventListener("change", () => {
    const file = inputImagen.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        previewImgContainer.innerHTML = `
            <img src="${e.target.result}">
        `;
    };

    reader.readAsDataURL(file);
});

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-editar");
    if (!btn) return;

    const id = btn.dataset.id;
    const producto = productosGlobal.find(p => p.id === id);

    if (!producto) return;

    // guardar id
    document.getElementById("editar-id").value = producto.id;

    // cargar form
    document.getElementById("editar-nombre").value = producto.nombre;
    document.getElementById("editar-precio").value = producto.precio;
    document.getElementById("editar-marca").value = producto.marca;
    document.getElementById("editar-stock").value = producto.stock;
    document.getElementById("editar-stockMinimo").value = producto.stockMinimo;

    // imagen arriba
    const img = document.getElementById("editar-img");
    img.src = producto.url;

    new bootstrap.Modal(document.getElementById("modalEditarProducto")).show();
});

document.getElementById("guardar-edicion").addEventListener("click", async () => {
    const id = document.getElementById("editar-id").value;
    const productoActual = productosGlobal.find(p => p.id === id);
    const nombre = document.getElementById("editar-nombre").value.trim();
    const precio = Number(document.getElementById("editar-precio").value);
    const marca = document.getElementById("editar-marca").value.trim();
    const stock = Number(document.getElementById("editar-stock").value);
    const stockMinimo = Number(document.getElementById("editar-stockMinimo").value);
    const file = document.getElementById("editar-imagen").files[0];

    if (!nombre || !marca) {
        Swal.fire({
            icon: "error",
            title: "Campos vacíos",
            text: "Nombre y marca son obligatorios"
        });
        return;
    }

    if (Number.isNaN(precio) || precio <= 0) {
        Swal.fire({
            icon: "error",
            title: "Precio inválido",
            text: "El precio debe ser mayor a 0"
        });
        return;
    }

    if (Number.isNaN(stock) || stock <= 0) {
        Swal.fire({
            icon: "error",
            title: "Stock inválido",
            text: "El stock tiene que ser un número entero positivo"
        });
        return;
    }

    if (Number.isNaN(stockMinimo) || stockMinimo <= 0 || !Number.isInteger(stockMinimo)) {
        Swal.fire({
            icon: "error",
            title: "Stock mínimo inválido",
            text: "Debe ser un número entero mayor a 0"
        });
        return;
    }

    let imageUrl;

    // NOMAS si cambia imagen
    if (file) {
        imageUrl = await subirImagen(file);
    }

    const productoEditado = {
        nombre,
        precio,
        marca,
        stock,
        stockMinimo,
        url: imageUrl || productoActual.url
    };

    await fetch(`${URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoEditado)
    });

    Swal.fire("OK", "Producto actualizado", "success");

    bootstrap.Modal.getInstance(document.getElementById("modalEditarProducto")).hide();

    renderizarProductos();
});

const inputEditImg = document.getElementById("editar-imagen");
const imgPreviewEdit = document.getElementById("editar-img");

inputEditImg.addEventListener("change", () => {
    const file = inputEditImg.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        imgPreviewEdit.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

// REACTIVAR EL PRODUCTO DADO DE BAJA (NO HA US, ES UN PLUS JEJE)
document.addEventListener("click", async (e) => {

    const btnReactivar = e.target.closest(".btn-reactivar");

    if (!btnReactivar) return;

    const id = btnReactivar.dataset.id;
    const producto = productosGlobal.find(p => p.id === id);
    const resp = await fetch(`${URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...producto,
            activo: true
        })
    });

    if (!resp.ok) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo reactivar"
        });
        return;
    }

    Swal.fire({
        icon: "success",
        title: "Producto reactivado",
        timer: 1500,
        showConfirmButton: false
    });

    productosGlobal = await obtenerProductos();
    aplicarFiltros();
});