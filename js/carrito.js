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
        Swal.fire({
            icon: "error",
            title: "Carrito vacío",
            text: "El carrito está vacío"
        });
        return;
    }
    // ATRIBUTOS DEL OBJETO
    //calcula el total
    let clienteId;
    let clienteNombre;
    let clienteApellido;
    let clienteDirecciones = [];
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

    <div class="border rounded p-3 mb-2 shadow-sm bg-white">

        <div class="d-flex justify-content-between align-items-start mb-3">

            <div>
                <h6 class="mb-1 fw-bold">
                    ${item.nombreProducto}
                </h6>
            </div>

            <div class="text-end">
                <small class="text-muted d-block">
                    Cantidad
                </small>

                <span class="fw-semibold">
                    x${item.cantidad}
                </span>
            </div>

        </div>

        <div class="d-flex justify-content-between align-items-center border-top pt-2">

            <div>
                <small class="text-muted d-block">
                    Precio Unitario
                </small>

                <span class="fw-semibold">
                    $${item.precioUnitario}
                </span>
            </div>

            <div class="text-end">
                <small class="text-muted d-block">
                    Subtotal
                </small>

                <span class="fw-bold fs-7">
                    $${item.subtotal}
                </span>
            </div>

        </div>

    </div>

`).join("");
    // Crear modal
    const modalHTML = `
        <div class="modal fade" id="modalCliente" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">
                            Buscar cliente
                        </h5>

                        <button 
                            type="button" 
                            class="btn-close" 
                            data-bs-dismiss="modal">
                        </button>
                    </div>

                    <div class="modal-body">

                        <label class="form-label">
                            Ingrese su DNI
                        </label>

                        <input 
                            type="text"
                            class="form-control mb-3"
                            id="inputDni"
                            placeholder="Ej: 46209670"
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

            if (!/^\d+$/.test(dni)) {

                Swal.fire(
                    {   icon: "error",
                        title: "Entrada inválida",
                        text: "El DNI solo puede contener números"});

                return;
            }

            await buscarCliente(dni);
            if (clienteId != null) {

                const direcciones =
                    clienteDirecciones;

                let opcionesDirecciones = "";

                if (direcciones.length > 0) {

                    opcionesDirecciones =
                        direcciones.map(dir => `
                            <option value="${dir.id}">
                            ${dir.calle} ${dir.numero}
                            ${dir.piso ? ` Piso ${dir.piso}` : ""}
                            ${dir.dpto ? ` Dpto ${dir.dpto}` : ""}
                            - ${dir.localidad}, ${dir.provincia}
                            </option>

                        `).join("");

                } else {

                    opcionesDirecciones = `
                            <option disabled selected>
                                No tiene direcciones cargadas
                            </option>
                        `;
                }

                document.getElementById("resultadoCliente").innerHTML = `
                        <hr>

                        <div class="card border-0 shadow-sm p-3 factura-box">

                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 class="mb-0 fw-bold">Resumen del Pedido</h5>
                                </div>
                            </div>

                            <div class="border rounded p-3 mb-3 bg-light">

                                <h6 class="fw-bold mb-3">
                                    Datos del Cliente
                                </h6>

                                <p class="mb-1">
                                    <strong>Nombre:</strong>
                                    ${clienteNombre} ${clienteApellido}
                                </p>

                                <p class="mb-1">
                                    <strong>Email:</strong>
                                    ${clienteEmail}
                                </p>

                                <label class="form-label fw-semibold mt-3">
                                    Dirección de envío
                                </label>

                                <select
                                    class="form-select mb-2"
                                    id="selectDireccion">
                                    ${opcionesDirecciones}
                                </select>

                                <button
                                    class="btn btn-outline-dark w-100"
                                    id="btnAgregarDireccion">
                                    + Agregar dirección
                                </button>

                            </div>

                            <div class="border rounded p-3 mb-3">

                                <h6 class="fw-bold mb-3">
                                    Productos
                                </h6>

                                ${detallesHTML}

                            </div>

                            <div class="border-top pt-3">

                                <div class="d-flex justify-content-between mb-2">
                                    <span>Forma de pago</span>
                                    <strong>${formaPago}</strong>
                                </div>

                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">Total</h5>

                                    <h4 class="mb-0 text-success fw-bold">
                                        $${total}
                                    </h4>
                                </div>

                            </div>

                            <button 
                                class="btn btn-success w-100 mt-4 py-2"
                                id="btnAceptarPedido">
                                Confirmar pedido
                            </button>

                        </div>
                        `;
                document
                    .getElementById("btnAgregarDireccion")
                    .addEventListener("click", () => {

                        mostrarModalDireccion(clienteId, clienteDirecciones);
                    });

                const btnAceptarPedido = document.getElementById("btnAceptarPedido");

                btnAceptarPedido.addEventListener("click", async () => {
                    const indexDireccion =
                        document.getElementById(
                            "selectDireccion"
                        ).selectedIndex;

                    const direccionSeleccionada =
                        direcciones[indexDireccion];

                    const nuevoPedido = {
                        clienteId,
                        clienteNombre,
                        clienteApellido,
                        clienteEmail,
                        fechaPedido,
                        estadoPedido,
                        formaPago,
                        domicilioEnvio: `
                        ${direccionSeleccionada.calle} ${direccionSeleccionada.numero}
                        ${direccionSeleccionada.piso ? ` Piso ${direccionSeleccionada.piso}` : ""}
                        ${direccionSeleccionada.dpto ? ` Dpto ${direccionSeleccionada.dpto}` : ""}
                        - ${direccionSeleccionada.localidad}, ${direccionSeleccionada.provincia}
                    `.replace(/\s+/g, " ").trim(),
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
    async function buscarCliente(dni) {
        try {
            const response = await fetch("https://69e616eace4e908a155ef130.mockapi.io/usuario");

            if (!response.ok) {
                throw new Error("Error al obtener clientes");
            }

            const clientes = await response.json();

            // Buscar cliente por DNI
            const cliente = clientes.find(c => String(c.dni) === String(dni));

            if (!cliente) {
                Swal.fire({
                    icon: "error",
                    title: "Usuario no Registrado"
                });
                document.getElementById("inputDni").value = "";
                return;
            }

            // Guardar datos del cliente
            clienteId = cliente.id;
            clienteNombre = cliente.nombre;
            clienteApellido = cliente.apellido;
            clienteEmail = cliente.email;

            clienteDirecciones =
                cliente.direcciones || [];

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al obtener clientes"
            });
        }
    }

    async function guardarPedido(nuevoPedido) {
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

            Swal.fire({
                icon: "success",
                title: "Pedido registrado",
                showConfirmButton: false,
                timer: 1500
            });


            localStorage.removeItem("carrito");
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al guardar el pedido"
            });
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
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Error al obtener producto"
                    });
                    continue;
                }
                const producto = await response.json();

                // Calcular nuevo stock
                const nuevoStock = producto.stock - item.cantidad;

                if (nuevoStock < 0) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Stock insuficiente"
                    });
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
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Error al actualizar producto"
                    });
                }

            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error al actualizar stock"
                });
            }
        }
    }
}
);

//FIN GUARDADO DE PEDIDO

async function iniciar() {

    await obtenerProductos();

    renderizarCarrito();
}

iniciar();

// Registrar dirección de envío

function validarDireccion(direccion) {

    if (
        !direccion.pais ||
        !direccion.provincia ||
        !direccion.localidad ||
        !direccion.calle ||
        !direccion.numero
    ) {

        return "Complete todos los datos obligatorios";
    }

    if (
        isNaN(direccion.numero) ||
        Number(direccion.numero) <= 0
    ) {

        return "Número inválido";
    }

    return null;
}

async function registrarDireccion(
    clienteId,
    direccion
) {

    const response = await fetch(
        `https://69e616eace4e908a155ef130.mockapi.io/usuario/${clienteId}`
    );

    const cliente = await response.json();

    // VALIDAR
    const error =
        validarDireccion(direccion);

    if (error) {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: error
        });
        return;
    }

    // SI NO EXISTE ARRAY
    if (!cliente.direcciones) {

        cliente.direcciones = [];
    }

    // VALIDAR DUPLICADA
    const existe =
        cliente.direcciones.some(dir =>

            dir.calle.toLowerCase()
            === direccion.calle.toLowerCase()

            &&

            String(dir.numero)
            === String(direccion.numero)

            &&

            dir.localidad.toLowerCase()
            === direccion.localidad.toLowerCase()
        );

    if (existe) {

        Swal.fire({
            icon: "warning",
            title: "Dirección duplicada",
            text: "Ya existe una dirección con los mismos datos"
        });

        return;
    }

    // AGREGAR
    direccion.id = crypto.randomUUID();

    cliente.direcciones.push(direccion);

    // ACTUALIZAR USUARIO
    const updateResponse = await fetch(
        `https://69e616eace4e908a155ef130.mockapi.io/usuario/${clienteId}`,
        {

            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(cliente)
        }
    );

    if (updateResponse.ok) {

        return true;

    } else {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al registrar dirección"
        });

        return false;
    }
}

function mostrarModalDireccion(
    clienteId,
    clienteDirecciones
) {

    const modalHTML = `

    <div
        class="modal fade"
        id="modalDireccion"
        tabindex="-1"
    >

        <div class="modal-dialog">

            <div class="modal-content">

                <div class="modal-header">

                    <h5 class="modal-title">
                        Agregar Dirección
                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                    ></button>

                </div>

                <div class="modal-body">

                    <input
                        type="text"
                        id="pais"
                        class="form-control mb-2"
                        placeholder="País"
                    >

                    <input
                        type="text"
                        id="provincia"
                        class="form-control mb-2"
                        placeholder="Provincia"
                    >

                    <input
                        type="text"
                        id="localidad"
                        class="form-control mb-2"
                        placeholder="Localidad"
                    >

                    <input
                        type="text"
                        id="calle"
                        class="form-control mb-2"
                        placeholder="Calle"
                    >

                    <input
                        type="number"
                        id="numero"
                        class="form-control mb-2"
                        placeholder="Número"
                    >

                    <input
                        type="text"
                        id="piso"
                        class="form-control mb-2"
                        placeholder="Piso"
                    >

                    <input
                        type="text"
                        id="dpto"
                        class="form-control mb-2"
                        placeholder="Departamento"
                    >

                    <button
                        class="btn btn-success w-100"
                        id="btnGuardarDireccion"
                    >
                        Guardar Dirección
                    </button>

                </div>

            </div>

        </div>

    </div>
    `;

    document.body.insertAdjacentHTML(
        "beforeend",
        modalHTML
    );

    const modalElemento =
        document.getElementById(
            "modalDireccion"
        );

    const modal =
        new bootstrap.Modal(
            modalElemento
        );

    modal.show();

    document
        .getElementById("btnGuardarDireccion")
        .addEventListener("click", async () => {

            const pais = document.getElementById("pais").value.trim();
            const provincia = document.getElementById("provincia").value.trim();
            const localidad = document.getElementById("localidad").value.trim();
            const calle = document.getElementById("calle").value.trim();
            const numero = document.getElementById("numero").value.trim();
            const piso = document.getElementById("piso").value.trim();
            const dpto = document.getElementById("dpto").value.trim();

            const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
            const letrasNumeros = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;

            if (!pais || !provincia || !localidad || !calle || !numero) {
                Swal.fire({
                    icon: "error",
                    title: "Campos incompletos",
                    text: "País, provincia, localidad, calle y número son obligatorios"
                });
                return;
            }

            if (!soloLetras.test(pais)) {
                Swal.fire({
                    icon: "error",
                    title: "Entrada inválida",
                    text: "El país solo puede contener letras"
                });
                return;
            }

            if (!soloLetras.test(provincia)) {
                Swal.fire({
                    icon: "error",
                    title: "Entrada inválida",
                    text: "La provincia solo puede contener letras"
                });
                return;
            }

            if (!soloLetras.test(localidad)) {
                Swal.fire({
                    icon: "error",
                    title: "Entrada inválida",
                    text: "La localidad solo puede contener letras"
                });
                return;
            }

            if (!letrasNumeros.test(calle)) {
                Swal.fire({
                    icon: "error",
                    title: "Entrada inválida",
                    text: "La calle solo puede contener letras y números"
                });
                return;
            }

            if (Number(numero) <= 0) {
                Swal.fire({
                    icon: "error",
                    title: "Entrada inválida",
                    text: "El número debe ser mayor a 0"
                });
                return;
            }

            if (piso && !letrasNumeros.test(piso)) {
                Swal.fire({
                    icon: "error",
                    title: "Entrada inválida",
                    text: "El piso solo puede contener letras y números"
                });
                return;
            }

            if (dpto && !letrasNumeros.test(dpto)) {
                Swal.fire({
                    icon: "error",
                    title: "Entrada inválida",
                    text: "El departamento solo puede contener letras y números"
                });
                return;
            }

            const direccion = {
                pais,
                provincia,
                localidad,
                calle,
                numero,
                piso,
                dpto,
                predeterminada: false
            };

            const direccionGuardada =
                await registrarDireccion(clienteId, direccion);

            clienteDirecciones.push(direccion);

            if (direccionGuardada) {

                const selectDireccion =
                    document.getElementById("selectDireccion");

                selectDireccion.innerHTML += `
                <option selected>
                    ${direccion.calle} ${direccion.numero}
                    ${direccion.piso ? ` Piso ${direccion.piso}` : ""}
                    ${direccion.dpto ? ` Dpto ${direccion.dpto}` : ""}
                    - ${direccion.localidad}, ${direccion.provincia}
                </option>
            `;

                modal.hide();

                Swal.fire({
                    icon: "success",
                    title: "Dirección registrada correctamente"
                });
            }
        });

    modalElemento.addEventListener(
        "hidden.bs.modal",
        () => {

            modalElemento.remove();
        }
    );
}

