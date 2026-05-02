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
    console.log("SUBMIT FUNCIONANDO");

    const nombre = document.getElementsByName("nombre")[0].value;
    const precio = Number(document.getElementsByName("precio")[0].value);
    const marca = document.getElementsByName("marca")[0].value;
    const stock = Number(document.getElementsByName("stock")[0].value);
    const file = document.getElementsByName("imagen")[0].files[0];

    if (!file) {
        alert("Tenés que subir una imagen");
        return;
    }

    if (!file.type.includes("image/jpeg") && !file.type.includes("image/png")) {
        alert("Solo se permiten imágenes JPG o PNG");
        return;
    }

    try {
        // subir la imagen
        const imageUrl = await subirImagen(file);

        const nuevoProducto = {
            nombre,
            precio,
            marca,
            stock,
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
            alert("El producto ya existe.");
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
            alert("Error al registrar producto.");
            return;
        }

        alert("Producto registrado con éxito.");
        location.reload();

    } catch (error) {
        console.error(error);
        alert("Error al registrar producto.");
    }
});


// OBTENCION DE PRODUCTOS
const URL = "https://69e616eace4e908a155ef130.mockapi.io/producto";

async function obtenerProductos() {
    const res = await fetch(URL);
    return await res.json();
}

async function renderizarProductos() {
    productosGlobal = await obtenerProductos();
    mostrarProductos(productosGlobal);
}

function mostrarProductos(productos) {
    const contenedor = document.getElementById("contenedor-productos");

    contenedor.innerHTML = "";

    productos.forEach(p => {
        const col = document.createElement("div");
        col.className = "w-100";

        col.innerHTML = `
        <div class="card shadow-sm border-0 mb-2">
        <div class="row g-0 align-items-center">

            <!-- vista imagen -->
            <div class="col-md-2 p-2">
            <img src="${p.url}" 
                class="img-fluid rounded shadow" 
                style="height: 100px; width: 100%; object-fit: cover;"
                alt="${p.nombre}">
            </div>

            <!-- infora del producto -->
            <div class="col-md-7">
            <div class="card-body py-2">
                <h5 class="card-title mb-2 fw-bold">${p.nombre}</h5>

                <div class="d-flex flex-wrap gap-3 small text-muted">
                <span><strong>ID:</strong> ${p.id}</span>
                <span><strong>Marca:</strong> ${p.marca}</span>
                </div>

                <div class="d-flex flex-wrap gap-3 mt-2">
                <span>Precio: $${p.precio}</span>
                <span>Stock: ${p.stock}</span>
                </div>
            </div>
            </div>

            <!-- botones para otro sprint -->
            <div class="col-md-3 text-end px-3">
            <div class="d-flex justify-content-end gap-2">

                <button class="btn btn-sm btn-editar">
                <i class="fa-solid fa-pen"></i>
                </button>

                <button class="btn btn-sm btn-eliminar">
                <i class="fa-solid fa-trash"></i>
                </button>

            </div>
            </div>

        </div>
        </div>
        `;

        contenedor.appendChild(col);
    });
}

renderizarProductos();

// FILTRO BUSQUEDA PRODUCTOS
const inputFiltro = document.getElementById("filtro-productos");

inputFiltro.addEventListener("input", () => {
    const texto = inputFiltro.value.trim().toLowerCase();

    const filtrados = productosGlobal.filter(p =>
        p.nombre.toLowerCase().includes(texto)
    );

    if (filtrados.length === 0) {
        document.getElementById("contenedor-productos").innerHTML =
            "<p class='text-center w-100 text-muted'>No se encontraron productos con ese nombre.</p>";
        return;
    }

    mostrarProductos(filtrados);
});

// PREVIEW PRODUCTO
const formPreview = document.forms["registroProducto"];

const inputNombre = formPreview.nombre;
const inputPrecio = formPreview.precio;
const inputMarca = formPreview.marca;
const inputStock = formPreview.stock;
const inputImagen = formPreview.imagen;

const previewNombre = document.getElementById("preview-nombre");
const previewPrecio = document.getElementById("preview-precio");
const previewMarca = document.getElementById("preview-marca");
const previewStock = document.getElementById("preview-stock");
const previewImgContainer = document.querySelector(".img-preview");

// actualiza el texto
inputNombre.addEventListener("input", () => {
    previewNombre.textContent = inputNombre.value || "Nombre producto";
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