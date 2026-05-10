const contenedor = document.getElementById("contenedor-carrito");
const totalCarrito = document.getElementById("total-carrito");

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function renderizarCarrito() {
    const carrito = obtenerCarrito();

    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p class='text-muted'>El carrito está vacío.</p>";
        totalCarrito.textContent = "";
        return;
    }

    let total = 0;

    // foreach para llenar el carrito con la tarjeta de cada objeto
    carrito.forEach((item, index) => {
        total += item.subtotal;

        contenedor.innerHTML += `
        <div class="card mb-3 shadow-sm border-0 carrito-card">
            <div class="card-body">
                <div class="row align-items-center g-3">

                    <div class="col-12 col-md-3">
                        <img src="${item.imagen}" 
                             alt="${item.nombreProducto}" 
                             class="img-fluid rounded carrito-img">
                    </div>

                    <div class="col-12 col-md-5">
                        <h5 class="mb-2">${item.nombreProducto}</h5>
                        <p class="text-muted mb-1">Precio unitario: $${item.precioUnitario}</p>
                        <p class="fw-semibold mb-0">Subtotal: $${item.subtotal}</p>
                    </div>

                    <div class="col-12 col-md-4">
                        <div class="d-flex align-items-center justify-content-md-end gap-2">
                            <button class="btn btn-outline-dark btn-sm btn-restar" data-index="${index}">
                                -
                            </button>

                            <span class="px-2 fw-semibold">${item.cantidad}</span>

                            <button class="btn btn-outline-dark btn-sm btn-sumar" data-index="${index}">
                                +
                            </button>

                            <button class="btn btn-outline-danger btn-sm ms-2 btn-eliminar" data-index="${index}">
                                Eliminar
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
    });

    totalCarrito.textContent = `$${total}`;

    activarEventosCarrito();
}

// instancia los eventos para cuando hagan click en sumar, restar o eliminar

function activarEventosCarrito() {
    document.querySelectorAll(".btn-sumar").forEach(btn => {
        btn.addEventListener("click", () => sumarCantidad(btn.dataset.index));
    });

    document.querySelectorAll(".btn-restar").forEach(btn => {
        btn.addEventListener("click", () => restarCantidad(btn.dataset.index));
    });

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => eliminarProducto(btn.dataset.index));
    });

}

function sumarCantidad(index) {
    const carrito = obtenerCarrito();

    carrito[index].cantidad++;
    carrito[index].subtotal = carrito[index].cantidad * carrito[index].precioUnitario;

    guardarCarrito(carrito);
    renderizarCarrito();
}

function restarCantidad(index) {
    const carrito = obtenerCarrito();

    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
        carrito[index].subtotal = carrito[index].cantidad * carrito[index].precioUnitario;
    } else {
        carrito.splice(index, 1);
    }

    guardarCarrito(carrito);
    renderizarCarrito();
}

function eliminarProducto(index) {
    const carrito = obtenerCarrito();

    carrito.splice(index, 1);

    guardarCarrito(carrito);
    renderizarCarrito();
}

renderizarCarrito();

// CONFIRMAR PEDIDO
const btnConfirmarPedido = document.getElementById("btn-confirmar-pedido");
btnConfirmarPedido.addEventListener("click", confirmarPedido);

async function confirmarPedido() {
    const carrito = obtenerCarrito();
    console.log(carrito);

    // ATRIBUTOS DEL OBJETO
    //calcula el total
    let clienteId;
    let clienteNombre;
    let clienteEmail;
    const fechaPedido = new Date();
    let domicilioEnvio;
    const estadoPedido = "Pendiente";
    const formaPago = "EFECTIVO CONTRA ENTREGA ";
    let total = 0;
    carrito.forEach((item) => {
        total += item.subtotal;
    });
    const motivoCancelacion = "";
    const detalles = carrito;

    // solicitar un dni para cargar datos de envio
    const dni = prompt("Ingrese su DNI:");

    try {
        const response = await fetch("https://69e616eace4e908a155ef130.mockapi.io/usuario");

        if (!response.ok) {
            throw new Error("Error al obtener clientes");
        }

        const clientes = await response.json();

        // Buscar cliente por DNI
        const cliente = clientes.find(c => c.dni === dni);

        if (!cliente) {
            alert("Usuario no Registrado")
            console.log("Usuario no registrado");
            return;
        }

        // Guardar datos del cliente
        clienteId = cliente.id;
        clienteNombre = cliente.nombre;
        clienteEmail = cliente.email;
        domicilioEnvio = cliente.calle + " " + cliente.numero;

    } catch (error) {
        console.error("Error:", error.message);
    }
    //}

    // crear el objeto para guardar en la api
    const nuevoPedido = {
        clienteId,
        clienteNombre,
        clienteEmail,
        fechaPedido,
        estadoPedido,
        formaPago,
        domicilioEnvio,
        total,
        motivoCancelacion,
        detalles
    };

    // guardar el pedido en la api
    const resp = await fetch("https://69fbceecfce564e25916ed52.mockapi.io/pedido", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoPedido)
    });

    // si guarda correctamente borra el contenido del carrito y recarga la pagina, en caso de falla no borra nada, y da un mensaje por consola
    if (resp.ok) {
        alert("Pediro registrado exitosamente")
        localStorage.removeItem("carrito");
        location.reload();

    } else {
        console.log("Error al guardar el pedido");
    }

}

// HASTA ACA LA CONFIRMACION