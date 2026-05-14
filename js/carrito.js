const API_PRODUCTOS = "https://69e616eace4e908a155ef130.mockapi.io/producto";
let productosGlobal = [];
const contenedor = document.getElementById("contenedor-carrito");
const totalCarrito = document.getElementById("total-carrito");

async function obtenerProductos() {
    const res = await fetch(API_PRODUCTOS);
    productosGlobal = await res.json();
    return productosGlobal;
    
    console.log(productosGlobal);
}



async function cargarProductos() {
    productosGlobal = await obtenerProductos();
}

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

    const item = carrito[index];

    const producto = productosGlobal.find(
        p => p.id == item.productoId
    );

    if (!producto) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Producto no encontrado"
        });
        return;
    }

    if (item.cantidad >= producto.stock) {
        Swal.fire({
            icon: "warning",
            title: "Stock insuficiente",
            text: "No hay más stock disponible"
        });
        return;
    }

    item.cantidad++;

    item.subtotal =
        item.cantidad * item.precioUnitario;

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

async function eliminarProducto(index) {

    const resultado = await Swal.fire({
        title: "¿Eliminar producto?",
        text: "El producto se quitará del carrito",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
    });

    if (!resultado.isConfirmed) return;

    const carrito = obtenerCarrito();

    carrito.splice(index, 1);

    guardarCarrito(carrito);

    renderizarCarrito();

    Swal.fire({
        icon: "success",
        title: "Producto eliminado",
        timer: 1200,
        showConfirmButton: false
    });
}


// GUARDADO DE PEDIDO

const btnVerCliente = document.getElementById("btn-confirmar-pedido");

btnVerCliente.addEventListener("click", () => {

    const carrito = obtenerCarrito();
        console.log(carrito);
        if (carrito.length === 0) {
            alertaModal("El carrito está vacío");
        return;
    }
      // ATRIBUTOS DEL OBJETO
    //calcula el total
    let clienteId;
    let clienteNombre;
    let clienteEmail;
    const fechaPedido = new Date();
    let calle;
    let numCalle;
    let dni;
    const estadoPedido = "Pendiente";
    const formaPago = "EFECTIVO CONTRA ENTREGA";
    let total = 0;
    carrito.forEach((item) => {
        total += item.subtotal;
    });
    const motivoCancelacion = "";
    const detalles = carrito;
    const detallesHTML = detalles.map(item => `
        <div class="border rounded p-2 mb-2">

            <p>
                <strong>Producto:</strong> 
                ${item.nombreProducto}
            </p>

            <p>
                <strong>Cantidad:</strong> 
                ${item.cantidad}
            </p>

            <p>
                <strong>Precio Unitario:</strong> 
                $${item.precioUnitario}
            </p>

            <p>
                <strong>Subtotal:</strong> 
                $${item.subtotal}
            </p>

        </div>
    `).join("");
    // Crear modal
    const modalHTML = `
        <div class="modal fade" id="modalCliente" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">
                            Buscar Cliente
                        </h5>

                        <button 
                            type="button" 
                            class="btn-close" 
                            data-bs-dismiss="modal">
                        </button>
                    </div>

                    <div class="modal-body">

                        <label class="form-label">
                            Ingrese DNI
                        </label>

                        <input 
                            type="text"
                            class="form-control mb-3"
                            id="inputDni"
                            placeholder="Ej: 40111222"
                        >

                        <button 
                            class="btn btn-primary w-100 btn-editar"
                            id="btnBuscarCliente">
                            Buscar
                        </button>

                        <div id="resultadoCliente" class="mt-4"></div>

                    </div>

                </div>
            </div>
        </div>
    `;

    // Insertar modal
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Obtener elemento modal
    const modalElemento = document.getElementById("modalCliente");

    // Crear modal bootstrap
    const modal = new bootstrap.Modal(modalElemento);

    // Mostrar modal
    modal.show();

    // Evento buscar
    document
        .getElementById("btnBuscarCliente")
        .addEventListener("click", async () => {

        dni = document.getElementById("inputDni").value;

            await buscarCliente(dni);
            if (clienteId != null){
                document.getElementById("resultadoCliente").innerHTML = `
                <hr>

                <p>
                    <strong>ID Cliente:</strong> 
                    ${clienteId}
                </p>

                <p>
                    <strong>Nombre:</strong> 
                    ${clienteNombre}
                </p>

                <p>
                    <strong>Domicilio de Envio:</strong> 
                    ${calle} ${numCalle}
                </p>

                <p>
                    <strong>Email:</strong> 
                    ${clienteEmail}
                </p>
            
                                <p>
                    <strong>Forma de Pago:</strong> 
                    ${formaPago}
                </p>
                <div>
                    <strong>DETALLE DE PEDIDO</strong> 
                
                    ${detallesHTML}
                </div>

                <p>
                    <strong>TOTAL:</strong> 
                    ${total}
                </p>

                <button 
                    class="btn btn-success w-100"
                    id="btnAceptarPedido">
                    Aceptar
                </button>
            `;
            const btnAceptarPedido = document.getElementById("btnAceptarPedido");

            btnAceptarPedido.addEventListener("click", async () => {

                const nuevoPedido = {
                    clienteId,
                    clienteNombre,
                    clienteEmail,
                    fechaPedido,
                    estadoPedido,
                    formaPago,
                    domicilioEnvio: calle + " " + numCalle,
                    total,
                    motivoCancelacion,
                    detalles
                };

                console.log(nuevoPedido);

                await guardarPedido(nuevoPedido);

            });
            }
        });

    // Eliminar modal al cerrar
    modalElemento.addEventListener("hidden.bs.modal", () => {
        modalElemento.remove();
    });
    async function buscarCliente(dni){
        try {
            const response = await fetch("https://69e616eace4e908a155ef130.mockapi.io/usuario");

            if (!response.ok) {
                throw new Error("Error al obtener clientes");
            }

            const clientes = await response.json();

            // Buscar cliente por DNI
            const cliente = clientes.find(c => String(c.dni) === String(dni));

            if (!cliente) {
                
                console.log("Usuario no registrado");
                alertaModal("Usuario no Registrado");
                document.getElementById("inputDni").value = "";
                return;
            }

            // Guardar datos del cliente
            clienteId = cliente.id;
            clienteNombre = cliente.nombre;
            clienteEmail = cliente.email;
            calle = cliente.calle;
            numCalle = cliente.numero;

        } catch (error) {
            console.error("Error:", error.message);
        }
    }

    async function guardarPedido(nuevoPedido){
        const resp = await fetch("https://69fbceecfce564e25916ed52.mockapi.io/pedido", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoPedido)
        });

        // si guarda correctamente borra el contenido del carrito y recarga la pagina, en caso de falla no borra nada, y da un mensaje por consola
        if (resp.ok) { 

            await actualizarStockProductos(detalles);
            modal.hide();

            alertaModal("Pedido registrado exitosamente");

            localStorage.removeItem("carrito");

        } else {
            console.log("Error al guardar el pedido");
        }
    }

    async function actualizarStockProductos(detalles) {

        for (const item of detalles) {

            try {

                // Obtener producto actual
                const response = await fetch(
                    `https://69e616eace4e908a155ef130.mockapi.io/producto/${item.productoId}`
                );

                if (!response.ok) {
                    console.log("Error al obtener producto");
                    continue;
                }
                const producto = await response.json();

                // Calcular nuevo stock
                const nuevoStock = producto.stock - item.cantidad;

                if (nuevoStock < 0) {
                    console.log("Stock insuficiente");
                    continue;
                }
                // Actualizar stock
                const updateResponse = await fetch(
                    `https://69e616eace4e908a155ef130.mockapi.io/producto/${item.productoId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            stock: nuevoStock
                        })
                    }
                );
                if (!updateResponse.ok) {
                    console.log("Error al actualizar producto");
                }

            } catch (error) {
                console.log("Error al actualizar stock:", error);
            }
        }
    }

    function alertaModal(texto){
    const modalExistente = document.getElementById("Alerta");
    if (modalExistente) {
        modalExistente.remove();
    }
    const modalHTML = `
        <div class="modal fade" id="Alerta" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">
                            ALERTA
                        </h5>

                        <button 
                            type="button" 
                            class="btn-close" 
                            data-bs-dismiss="modal">
                        </button>
                    </div>

                    <div class="modal-body">

                        <p>${texto}</p>

                        <button 
                            class="btn btn-primary w-100"
                            data-bs-dismiss="modal"
                            id="aceptarMensaje">
                            ACEPTAR
                        </button>

                    </div>

                </div>
            </div>
        </div>
    `;

    // Insertar modal
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Obtener modal
    const modalElemento = document.getElementById("Alerta");

    // Crear instancia bootstrap
    const modal = new bootstrap.Modal(modalElemento);

    // Mostrar
    modal.show();

    if (texto === "Pedido registrado exitosamente"){
        document
    .getElementById("aceptarMensaje")
    .addEventListener("click", () => {

        location.reload();

    });}

    // Eliminar del DOM al cerrar
    modalElemento.addEventListener("hidden.bs.modal", () => {
        modalElemento.remove();
    });
        }
});

//FIN GUARDADO DE PEDIDO

async function iniciar() {

    await obtenerProductos();

    renderizarCarrito();
}

iniciar();