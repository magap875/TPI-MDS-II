const url = "https://69fbceecfce564e25916ed52.mockapi.io/pedido";

const contenedor = document.getElementById("contenedor-pedidos");
const filtroEstado = document.getElementById("filtro-estado");

async function obtenerPedidos() {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        return [];
    }
}

function renderProductos(detalles) {

    if (!detalles || detalles.length === 0) {
        return "<p>Sin productos</p>";
    }

    return `
        <div class="d-flex flex-column gap-2">
            ${detalles.map(item => `

                <div class="border rounded p-2">

                    <div class="d-flex justify-content-between align-items-center">

                        <div>

                            <div class="fw-semibold">
                                ${item.cantidad}x ${item.nombreProducto}
                            </div>

                            <small class="text-muted">
                                Precio unitario: $${item.precioUnitario}
                            </small>

                        </div>

                        <div class="fw-semibold">
                        Subtotal:
                            $${item.subtotal}
                        </div>

                    </div>

                </div>

            `).join("")}
        </div>
    `;
}

async function renderizarPedidos() {
    const pedidos = await obtenerPedidos();

    contenedor.innerHTML = "";

    const estadoSeleccionado = filtroEstado.value;

    let pedidosFiltrados = pedidos;

    // FILTRAR
    if (estadoSeleccionado !== "Todos") {
        pedidosFiltrados = pedidos.filter(
            pedido => pedido.estadoPedido === estadoSeleccionado
        );
    } else {
        // Mostrar todos
        pedidosFiltrados = pedidos
    }

    // SI NO HAY PEDIDOS
    if (pedidosFiltrados.length === 0) {
        contenedor.innerHTML = `
            <p class="text-muted text-center">
                No hay pedidos para mostrar.
            </p>
        `;
        return;
    }

    pedidosFiltrados.forEach(pedido => {

        let botonSiguiente = "";
        let colorBadge = "bg-secondary";

        // PENDIENTE
        if (pedido.estadoPedido === "Pendiente") {

            botonSiguiente = `
                <button 
                    class="btn btn-primary btn-actualizar"
                    data-id="${pedido.idPedido}"
                    data-nuevo="Listo">
                    Marcar como Listo
                </button>
            `;

            colorBadge = "bg-warning text-dark";
        }

        // LISTO
        else if (pedido.estadoPedido === "Listo") {

            botonSiguiente = `
                <button 
                    class="btn btn-info btn-actualizar"
                    data-id="${pedido.idPedido}"
                    data-nuevo="Retirado">
                    Paquete Retirado
                </button>
            `;

            colorBadge = "bg-primary";
        }

        // RETIRADO
        else if (pedido.estadoPedido === "Retirado") {

            botonSiguiente = `
                <button 
                    class="btn btn-success btn-actualizar"
                    data-id="${pedido.idPedido}"
                    data-nuevo="Entregado">
                    Confirmar Entrega
                </button>
            `;

            colorBadge = "bg-info text-dark";
        }

        // ENTREGADO
        else if (pedido.estadoPedido === "Entregado") {
            colorBadge = "bg-success";
        }

        // CANCELADO
        else if (pedido.estadoPedido === "Cancelado") {
            colorBadge = "bg-danger";
        }

        contenedor.innerHTML += `
            <div class="card shadow-sm border-0 mb-3">

                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-start">

                        <div>
                        <h5 class="fw-bold">
                            Cliente: ${pedido.clienteNombre} ${pedido.clienteApellido}
                        </h5>

                        <p class="mb-1">
                            <strong>Domicilio:</strong>
                            ${pedido.domicilioEnvio}
                        </p>
                        <p>Email: ${pedido.clienteEmail} </p>
                        </div>

                        <span class="badge ${colorBadge}">
                            Estado actual: ${pedido.estadoPedido}
                        </span>

                    </div>

                    <hr>

                    <p class="mb-1">
                        <strong>Productos:</strong>
                        ${renderProductos(pedido.detalles)}
                    </p>

                    <div class="d-flex justify-content-between align-items-end border-top pt-3 mt-3 flex-wrap gap-3">

                    <div class="d-flex gap-2 flex-wrap">

                        ${botonSiguiente}

                                    ${pedido.estadoPedido !== "Cancelado" &&
                pedido.estadoPedido !== "Entregado"
                ? `
                                                <button 
                                                    class="btn btn-outline-danger btn-cancelar"
                                                    data-id="${pedido.idPedido}"
                                                    data-estado="${pedido.estadoPedido}">
                                                    Cancelar
                                                </button>
                                            `
                : ""
            }

                    </div>

                        <div class="text-end">

                            <small class="text-muted d-block">
                                Total del pedido
                            </small>

                            <span class="fw-bold fs-3 text-dark">
                                $${pedido.total}
                            </span>

                            <span class="text-success fw-bold d-block">
                                 ${pedido.formaPago}
                            </span>

                        </div>

                    </div>

                </div>

            </div>
        `;
    });

    activarEventosActualizar();
    activarEventosCancelar();
}

function activarEventosActualizar() {
    document.querySelectorAll(".btn-actualizar").forEach(btn => {

        btn.addEventListener("click", async () => {
            
            const id = btn.dataset.id;
            const nuevoEstado = btn.dataset.nuevo;

            const confirmacion = await Swal.fire({
                title: `¿Cambiar a ${nuevoEstado}?`,
                text: `El pedido pasará a estado: ${nuevoEstado}`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, actualizar"
            });

            if (confirmacion.isConfirmed) {
                await ejecutarActualizacion(id, {
                    estadoPedido: nuevoEstado
                });
            }
        });
    });
}

function activarEventosCancelar() {
    document.querySelectorAll(".btn-cancelar").forEach(btn => {

        btn.addEventListener("click", async () => {
        
            const id = btn.dataset.id;
            const estado = btn.dataset.estado;

            if (estado !== "Pendiente") {
                
                Swal.fire({
                    title: "No permitido",
                    text: "Solo se permite cancelar pedidos pendientes",
                    icon: "warning"
                });

                return;
            
            }

            const { value: motivo } = await Swal.fire({
                title: "Cancelar entrega",
                input: "text",
                inputLabel: "Motivo de cancelación",
                inputPlaceholder: "Ej: Falta de stock",
                showCancelButton: true,
                confirmButtonText: "Confirmar Cancelación",
                cancelButtonText: "Volver"
            });

            if (motivo) {

                await ejecutarActualizacion(id, {
                    estadoPedido: "Cancelado",
                    motivoCancelacion: motivo
                });

            } else if (motivo === "") {

                Swal.fire(
                    "Error",
                    "Debe ingresar un motivo para cancelar",
                    "error"
                );
            }
        });
    });
}

async function ejecutarActualizacion(id, datos) {
    try {

        const resp = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (resp.ok) {

            Swal.fire(
                "¡Éxito!",
                "El estado ha sido actualizado",
                "success"
            );

            renderizarPedidos();

        } else {
            throw new Error();
        }

    } catch (error) {

        Swal.fire(
            "Error",
            "No se pudo actualizar el pedido",
            "error"
        );
    }
}

// productos mas vendidos
document
    .querySelector(".ver-reportes")
    .addEventListener("click", (e) => {

        e.preventDefault();

        mostrarModalReportes();
    });

function mostrarModalReportes() {

    const modalHTML = `
        <div class="modal fade" id="modalReportes" tabindex="3">

            <div class="modal-dialog modal-lg">

                <div class="modal-content">

                    <div class="modal-header">

                        <h5 class="modal-title">
                            Productos más vendidos
                        </h5>

                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal">
                        </button>

                    </div>

                    <div class="modal-body">

                        <div class="row">

                            <div class="col-md-6">
                                <label>Mes</label>

                                <select
                                    class="form-select"
                                    id="mesReporte">

                                    <option value="1">Enero</option>
                                    <option value="2">Febrero</option>
                                    <option value="3">Marzo</option>
                                    <option value="4">Abril</option>
                                    <option value="5">Mayo</option>
                                    <option value="6">Junio</option>
                                    <option value="7">Julio</option>
                                    <option value="8">Agosto</option>
                                    <option value="9">Septiembre</option>
                                    <option value="10">Octubre</option>
                                    <option value="11">Noviembre</option>
                                    <option value="12">Diciembre</option>

                                </select>
                            </div>

                            <div class="col-md-6">
                                <label>Año</label>

                                <select
                                    class="form-select"
                                    id="anioReporte">
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>

                                </select>
                            </div>

                        </div>

                        <button
                            class="btn mt-3"
                            id="btnGenerarReporte"
                            style="background-color: #c084fc; color: white; width: 100%;">

                            Generar Reporte

                        </button>

                        <div
                            id="resultadoReporte"
                            class="mt-4">
                        </div>

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
            "modalReportes"
        );

    const modal =
        new bootstrap.Modal(
            modalElemento
        );

    modal.show();
    document
        .getElementById("btnGenerarReporte")
        .addEventListener("click", generarReporte);

}    


async function generarReporte() {

    const mes = Number(
        document.getElementById("mesReporte").value
    );

    const anio = Number(
        document.getElementById("anioReporte").value
    );

    const respuesta = await fetch(
        "https://69fbceecfce564e25916ed52.mockapi.io/pedido"
    );

    const pedidos = await respuesta.json();

    const pedidosFiltrados = pedidos.filter(pedido => {

        const fecha = new Date(pedido.fechaPedido);

        return (
            fecha.getMonth() + 1 === mes &&
            fecha.getFullYear() === anio
        );
    });

    calcularRanking(pedidosFiltrados);
}

function calcularRanking(pedidos) {

    const ventas = {};

    pedidos.forEach(pedido => {

        pedido.detalles.forEach(detalle => {

            const nombre = detalle.nombreProducto;

            if (!ventas[nombre]) {
                ventas[nombre] = 0;
            }

            ventas[nombre] += detalle.cantidad;
        });
    });

    const ranking = Object.entries(ventas)
        .sort((a, b) => b[1] - a[1]);

    mostrarRanking(ranking);
}

function mostrarRanking(ranking) {

    const resultado =
        document.getElementById(
            "resultadoReporte"
        );

    if (ranking.length === 0) {

        resultado.innerHTML = `
            <p class="text-muted text-center">
                No existen ventas en el periodo seleccionado.
            </p>
        `;

        return;
    }

    resultado.innerHTML = `
        <table class="table table-striped">

            <thead>

                <tr>
                    <th>Producto</th>
                    <th>Cantidad vendida</th>
                </tr>

            </thead>

            <tbody>

                ${ranking.map(item => `
                    <tr>
                        <td>${item[0]}</td>
                        <td>${item[1]}</td>
                    </tr>
                `).join("")}

            </tbody>

        </table>
    `;
}

// EVENTO FILTRO
filtroEstado.addEventListener("change", renderizarPedidos);

// INICIO APP
renderizarPedidos();