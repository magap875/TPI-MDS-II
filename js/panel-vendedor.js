const url = "https://69fbceecfce564e25916ed52.mockapi.io/pedido";
const contenedor = document.getElementById("contenedor-pedidos");

async function obtenerPedidos() {
    const res = await fetch(url);
    return await res.json();
}

function renderProductos(detalles) {
    if (!detalles || detalles.length === 0) {
        return "Sin productos";
    }
    return detalles
        .map(item =>
            `${item.cantidad}x ${item.nombreProducto}`
        )
        .join(" - ");
}

async function renderizarPedidos() {
    const pedidos = await obtenerPedidos();
    contenedor.innerHTML = "";

    // Solo pedidos pendientes
    const pedidosPendientes = pedidos.filter(p =>
        p.estadoPedido === "Pendiente"
    );

    if (pedidosPendientes.length === 0) {

        contenedor.innerHTML = `
            <p class="text-muted">
                No hay pedidos pendientes.
            </p>
        `;

        return;
    }

    pedidosPendientes.forEach(pedido => {

        contenedor.innerHTML += `
            <div class="card shadow-sm border-0 mb-3">
                <div class="card-body">
                    <h5 class="fw-bold">
                        Cliente: ${pedido.clienteNombre}
                    </h5>
                    <p class="mb-1">
                        <strong>Email:</strong>
                        ${pedido.clienteEmail}
                    </p>
                    <p class="mb-1">
                        <strong>Productos:</strong>
                        ${renderProductos(pedido.detalles)}
                    </p>
                    <p class="mb-1">
                        <strong>Domicilio:</strong>
                        ${pedido.domicilioEnvio}
                    </p>
                    <p class="mb-1">
                        <strong>Forma de pago:</strong>
                        ${pedido.formaPago}
                    </p>
                    <p class="mb-3">
                        <strong>Total:</strong>
                        $${pedido.total}
                    </p>
                    <button 
                        class="btn btn-danger btn-cancelar"
                        data-id="${pedido.idPedido}"
                    >
                        Cancelar entrega
                    </button>

                </div>
            </div>
        `;
    });
    activarEventosCancelar();
}

function activarEventosCancelar() {
    const botones = document.querySelectorAll(".btn-cancelar");
    
    botones.forEach(btn => {
        btn.addEventListener("click", async () => {
            const idPedido = btn.dataset.id;
            const { value: motivo } = await Swal.fire({
                title: "Cancelar entrega",
                input: "text",
                inputLabel: "Motivo de cancelación",
                inputPlaceholder: "Ingrese un motivo",
                showCancelButton: true,
                confirmButtonText: "Cancelar pedido",
                cancelButtonText: "Volver"
            });

            if (!motivo) {
                Swal.fire({
                    icon: "warning",
                    title: "Motivo obligatorio",
                    text: "Debe ingresar un motivo"
                });
                return;
            }

            try {
                const resp = await fetch(`${url}/${idPedido}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        estadoPedido: "Cancelado",
                        motivoCancelacion: motivo
                    })
                });

                if (!resp.ok) {
                    throw new Error("No se pudo actualizar");
                }

                Swal.fire({
                    icon: "success",
                    title: "Entrega cancelada"
                });

                renderizarPedidos();

            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo cancelar el pedido"
                });
                console.error(error);
            }
        });
    });
}

renderizarPedidos();