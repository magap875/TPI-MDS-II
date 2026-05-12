const url = "https://69fbceecfce564e25916ed52.mockapi.io/pedido";
const contenedor = document.getElementById("contenedor-pedidos");

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
    if (!detalles || detalles.length === 0) return "Sin productos";
    return detalles.map(item => `${item.cantidad}x ${item.nombreProducto}`).join(" - ");
}

async function renderizarPedidos() {
    const pedidos = await obtenerPedidos();
    contenedor.innerHTML = "";

    // Filtramos para mostrar solo los que NO están terminados (Entregados o Cancelados)
    const pedidosActivos = pedidos.filter(p => 
        p.estadoPedido !== "Cancelado" && p.estadoPedido !== "Entregado"
    );

    if (pedidosActivos.length === 0) {
        contenedor.innerHTML = `<p class="text-muted text-center">No hay pedidos activos para procesar.</p>`;
        return;
    }

    pedidosActivos.forEach(pedido => {
        // Lógica para determinar el siguiente paso según el estado actual
        let botonSiguiente = "";
        let colorBadge = "bg-secondary";

        if (pedido.estadoPedido === "Pendiente") {
            botonSiguiente = `<button class="btn btn-primary btn-actualizar" data-id="${pedido.idPedido}" data-nuevo="Listo">Marcar como Listo</button>`;
            colorBadge = "bg-warning text-dark";
        } else if (pedido.estadoPedido === "Listo") {
            botonSiguiente = `<button class="btn btn-info btn-actualizar" data-id="${pedido.idPedido}" data-nuevo="Retirado">Paquete Retirado</button>`;
            colorBadge = "bg-primary";
        } else if (pedido.estadoPedido === "Retirado") {
            botonSiguiente = `<button class="btn btn-success btn-actualizar" data-id="${pedido.idPedido}" data-nuevo="Entregado">Confirmar Entrega</button>`;
            colorBadge = "bg-info text-dark";
        }

        contenedor.innerHTML += `
            <div class="card shadow-sm border-0 mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="fw-bold">Cliente: ${pedido.clienteNombre}</h5>
                        <span class="badge ${colorBadge}">${pedido.estadoPedido}</span>
                    </div>
                    <hr>
                    <p class="mb-1"><strong>Productos:</strong> ${renderProductos(pedido.detalles)}</p>
                    <p class="mb-1"><strong>Domicilio:</strong> ${pedido.domicilioEnvio}</p>
                    <p class="mb-3"><strong>Total:</strong> $${pedido.total}</p>
                    
                    <div class="d-flex gap-2">
                        ${botonSiguiente}
                        <button class="btn btn-outline-danger btn-cancelar" data-id="${pedido.idPedido}">
                            Cancelar
                        </button>
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
                await ejecutarActualizacion(id, { estadoPedido: nuevoEstado });
            }
        });
    });
}

function activarEventosCancelar() {
    document.querySelectorAll(".btn-cancelar").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
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
                Swal.fire("Error", "Debe ingresar un motivo para cancelar", "error");
            }
        });
    });
}

async function ejecutarActualizacion(id, datos) {
    try {
        const resp = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (resp.ok) {
            Swal.fire("¡Éxito!", "El estado ha sido actualizado", "success");
            renderizarPedidos();
        } else {
            throw new Error();
        }
    } catch (error) {
        Swal.fire("Error", "No se pudo actualizar el pedido", "error");
    }
}

// Inicio de la aplicación
renderizarPedidos();