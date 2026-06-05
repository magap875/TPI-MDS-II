const API_USUARIOS = "https://69e616eace4e908a155ef130.mockapi.io/usuario";

const API_PEDIDOS = "https://69fbceecfce564e25916ed52.mockapi.io/pedido";

document
    .getElementById("btnHistorialPedidos")
    .addEventListener("click", abrirModalHistorial);

function abrirModalHistorial() {

    const modalHTML = `
    <div class="modal fade" id="modalHistorial" tabindex="-1">

        <div class="modal-dialog modal-dialog-centered">

            <div class="modal-content">

                <div class="modal-header">

                    <h5 class="modal-title">
                        Historial de mis pedidos
                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal">
                    </button>

                </div>

                <div class="modal-body" id="contenidoHistorial">

                    <label class="form-label">
                        DNI
                    </label>

                    <input
                        type="text"
                        id="dniHistorial"
                        class="form-control mb-3"
                        placeholder="Ingrese su DNI">

                    <label class="form-label">
                        Contraseña
                    </label>

                    <input
                        type="password"
                        id="passwordHistorial"
                        class="form-control mb-3"
                        placeholder="Ingrese su contraseña">

                    <button
                        class="btn btn-dark w-100"
                        id="btnBuscarHistorial">
                        Buscar
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
        document.getElementById("modalHistorial");

    const modal =
        new bootstrap.Modal(modalElemento);

    modal.show();

    document
        .getElementById("btnBuscarHistorial")
        .addEventListener(
            "click",
            async () => {

                const dni =
                    document
                        .getElementById(
                            "dniHistorial"
                        )
                        .value
                        .trim();

                const password =
                    document
                        .getElementById(
                            "passwordHistorial"
                        )
                        .value;

                if (!/^\d+$/.test(dni)) {

                    Swal.fire({
                        icon: "error",
                        title: "DNI inválido",
                        text: "Solo se permiten números"
                    });

                    return;
                }

                const cliente =
                    await validarCliente(
                        dni,
                        password
                    );

                if (!cliente) return;

                await mostrarHistorial(
                    cliente.id
                );
            }
        );

    modalElemento.addEventListener(
        "hidden.bs.modal",
        () => {
            modalElemento.remove();
        }
    );
}

async function validarCliente(
    dni,
    password
) {

    try {

        const response =
            await fetch(API_USUARIOS);

        const usuarios =
            await response.json();

        const cliente =
            usuarios.find(
                usuario =>
                    String(usuario.dni)
                    === String(dni)
            );

        if (!cliente) {

            Swal.fire({
                icon: "error",
                title: "Usuario no encontrado"
            });

            return null;
        }

        if (
            cliente.password
            !== password
        ) {

            Swal.fire({
                icon: "error",
                title: "Contraseña incorrecta"
            });

            return null;
        }

        return cliente;

    } catch {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo validar el cliente"
        });

        return null;
    }
}

async function mostrarHistorial(
    clienteId
) {

    try {

        const response =
            await fetch(API_PEDIDOS);

        const pedidos =
            await response.json();

        const pedidosCliente =
            pedidos
                .filter(
                    pedido =>
                        String(
                            pedido.clienteId
                        )
                        === String(clienteId)
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.fechaPedido
                        )
                        -
                        new Date(
                            a.fechaPedido
                        )
                );

        const contenedor =
            document.getElementById(
                "contenidoHistorial"
            );

        if (
            pedidosCliente.length === 0
        ) {

            contenedor.innerHTML = `
                <div class="alert alert-danger">
                    No existen pedidos registrados.
                </div>
            `;

            return;
        }

        let html = ``;

        pedidosCliente.forEach(
            pedido => {

                html += `
                <div class="card mb-3 shadow-sm">

                    <div class="card-body">

                        <h6>
                            Pedido #${pedido.idPedido || pedido.id}
                        </h6>

                        <p class="mb-1">
                            <strong>Fecha:</strong>
                            ${new Date(
                                pedido.fechaPedido
                            ).toLocaleString()}
                        </p>

                        <p class="mb-1">
                            <strong>Total:</strong>
                            $${pedido.total}
                        </p>

                        <p class="mb-1">
                            <strong>Forma de pago:</strong>
                            ${pedido.formaPago}
                        </p>

                        <p class="mb-2">
                            <strong>Estado:</strong>
                            ${pedido.estadoPedido}
                        </p>

                        <button
                            class="btn btn-outline-dark btn-sm btn-detalle-pedido"
                            data-pedido='${JSON.stringify(pedido)}'>
                            Ver detalle
                        </button>

                    </div>

                </div>
                `;
            }
        );

        contenedor.innerHTML =
            html;

        document
            .querySelectorAll(
                ".btn-detalle-pedido"
            )
            .forEach(
                boton => {

                    boton.addEventListener(
                        "click",
                        () => {

                            const pedido =
                                JSON.parse(
                                    boton.dataset.pedido
                                );

                            mostrarDetallePedido(
                                pedido
                            );
                        }
                    );
                }
            );

    } catch {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los pedidos"
        });
    }
}

function mostrarDetallePedido(
    pedido
) {

    let detallesHTML = "";

    pedido.detalles.forEach(
        item => {

            detallesHTML += `
            <div class="border rounded p-2 mb-2">

                <div>
                    <strong>
                        ${item.nombreProducto}
                    </strong>
                </div>

                <div>
                    Cantidad:
                    ${item.cantidad}
                </div>

                <div>
                    Precio:
                    $${item.precioUnitario}
                </div>

                <div>
                    Subtotal:
                    $${item.subtotal}
                </div>

            </div>
            `;
        }
    );

    Swal.fire({

        width: 800,

        title:
            `Pedido #${pedido.idPedido || pedido.id}`,

        html: `

            <div class="text-start">

                <p>
                    <strong>Fecha:</strong>
                    ${new Date(
                        pedido.fechaPedido
                    ).toLocaleString()}
                </p>

                <p>
                    <strong>Estado:</strong>
                    ${pedido.estadoPedido}
                </p>

                <p>
                    <strong>Forma de pago:</strong>
                    ${pedido.formaPago}
                </p>

                <p>
                    <strong>Domicilio:</strong>
                    ${pedido.domicilioEnvio}
                </p>

                ${
                    pedido.motivoCancelacion
                        ?
                        `
                        <p class="text-danger">
                            <strong>
                                Motivo cancelación:
                            </strong>
                            ${pedido.motivoCancelacion}
                        </p>
                        `
                        :
                        ""
                }

                <hr>

                ${detallesHTML}

                <hr>

                <h5>
                    Total:
                    $${pedido.total}
                </h5>

            </div>
        `
    });
}