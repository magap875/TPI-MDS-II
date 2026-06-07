const API_USUARIOS = "https://69e616eace4e908a155ef130.mockapi.io/usuario";

const API_PEDIDOS = "https://69fbceecfce564e25916ed52.mockapi.io/pedido";

window.API_CUPONES = "https://69e61843ce4e908a155ef3b7.mockapi.io/cupon";

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
                            class="btn btn-outline-dark btn-sm btn-detalle-pedido w-100"
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

async function mostrarDetallePedido(pedido) {

    // ── 1. Cupón ──────────────────────────────────────────────────────────────
    let cuponEncontrado = null;

    if (pedido.cupon) {
        try {
            const resCupones = await fetch(window.API_CUPONES);
            const cupones    = await resCupones.json();
            cuponEncontrado  = cupones.find(c => c.codigo === pedido.cupon) ?? null;
        } catch {
            console.warn("No se pudieron cargar los cupones.");
        }
    }

    // ── 2. Helpers ────────────────────────────────────────────────────────────
    const formatFecha  = iso =>
        new Date(iso).toLocaleString("es-AR", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });

    const formatMoney  = n =>
        "$" + Number(n).toLocaleString("es-AR");

    const estadoClass  = estado => {
        const e = estado.toLowerCase();
        if (e.includes("entregado"))                    return "color:#2e7d32;background:#e8f5e9";
        if (e.includes("cancelado"))                    return "color:#c62828;background:#ffebee";
        if (e.includes("proceso") || e.includes("preparación")) return "color:#1565c0;background:#e3f2fd";
        return "color:#e65100;background:#fff3e0";
    };

    const descuentoLabel = c =>
        c.tipoDescuento === "PORCENTAJE"
            ? `${c.valorDescuento}%`
            : formatMoney(c.valorDescuento);

    // ── Cálculo del resumen de cuenta ─────────────────────────────────────────
    const subtotalProductos = pedido.detalles.reduce(
        (acc, item) => acc + Number(item.subtotal), 0
    );

    const montoDescuento = cuponEncontrado
        ? cuponEncontrado.tipoDescuento === "PORCENTAJE"
            ? subtotalProductos * (cuponEncontrado.valorDescuento / 100)
            : Number(cuponEncontrado.valorDescuento)
        : 0;

    // ── 3. HTML de ítems ──────────────────────────────────────────────────────
    const itemsHTML = pedido.detalles.map(item => `
        <div style="
            display:flex; justify-content:space-between; align-items:center;
            padding:10px 12px; border-radius:8px;
            background:white; margin-bottom:8px; border:1px solid black"">

            <div style="text-align:left">
                <div style="font-weight:500; font-size:14px; color:#111">
                    ${item.nombreProducto}
                </div>
                <div style="font-size:12px; color:#777; margin-top:2px">
                    ${item.cantidad} × ${formatMoney(item.precioUnitario)}
                </div>
            </div>

            <div style="font-weight:500; font-size:14px; color:white;white-space:nowrap">
                ${formatMoney(item.subtotal)}
            </div>

        </div>
    `).join("");

    // ── 4. HTML del cupón (opcional) ──────────────────────────────────────────
    const cuponHTML = cuponEncontrado ? `
        <div style="
            display:flex; align-items:center; gap:10px;
            background:#e3f2fd; border-radius:8px;
            padding:10px 14px; font-size:13px; color:#1565c0;">

            <span>
                Cupón <strong>${cuponEncontrado.codigo}</strong> aplicado
                — descuento de <strong>${descuentoLabel(cuponEncontrado)}</strong>
            </span>

        </div>
    ` : "";

    // ── 5. HTML del resumen de cuenta ─────────────────────────────────────────
    const resumenHTML = `
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px">

            <!-- Subtotal productos -->
            <div style="display:flex; justify-content:space-between; font-size:13px; color:#555">
                <span>Subtotal productos</span>
                <span>${formatMoney(subtotalProductos)}</span>
            </div>

            <!-- Descuento (solo si hay cupón) -->
            ${cuponEncontrado ? `
            <div style="display:flex; justify-content:space-between; font-size:13px; color:#1565c0">
                <span>Descuento (${descuentoLabel(cuponEncontrado)})</span>
                <span>− ${formatMoney(montoDescuento)}</span>
            </div>
            ` : ""}

            <!-- Divisor fino -->
            <hr style="border:none; border-top:1px solid #eee; margin:2px 0">

            <!-- Total pagado -->
            <div style="display:flex; justify-content:space-between; align-items:center">
                <span style="font-size:15px; font-weight:500; color:#111">Total pagado</span>
                <span style="font-size:20px; font-weight:600; color:#111">${formatMoney(pedido.total)}</span>
            </div>

        </div>
    `;

    // ── 6. HTML completo del Swal ──────────────────────────────────────────────
    const html = `
        <div style="text-align:left; font-family:inherit">

            <!-- Metadata -->
            <div style="
                display:grid; grid-template-columns:1fr 1fr;
                gap:10px; margin-bottom:20px;">

                <div style="background:white; border-radius:8px; padding:10px 14px; border:1px solid black"">
                    <div style="font-size:11px; font-weight:600; color:#888;
                                text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px">
                        Fecha
                    </div>
                    <div style="font-size:13px; color:#111">
                        ${formatFecha(pedido.fechaPedido)}
                    </div>
                </div>

                <div style="background:white; border-radius:8px; padding:10px 14px; border:1px solid black"">
                    <div style="font-size:11px; font-weight:600; color:#888;
                                text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px">
                        Estado
                    </div>
                    <span style="
                        font-size:12px; font-weight:500;
                        padding:3px 10px; border-radius:20px;
                        ${estadoClass(pedido.estadoPedido)}">
                        ${pedido.estadoPedido}
                    </span>
                </div>

                <div style="background:white; border-radius:8px; padding:10px 14px; border:1px solid black"">
                    <div style="font-size:11px; font-weight:600; color:#888;
                                text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px">
                        Forma de pago
                    </div>
                    <div style="font-size:13px; color:#111">
                        ${pedido.formaPago}
                    </div>
                </div>

                <div style="background:white; border-radius:8px; padding:10px 14px; border:1px solid black"">
                    <div style="font-size:11px; font-weight:600; color:#888;
                                text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px">
                        Domicilio
                    </div>
                    <div style="font-size:12px; color:#111;line-height:1.4">
                        ${pedido.domicilioEnvio}
                    </div>
                </div>

            </div>

            <!-- Divisor -->
            <hr style="border:none; border-top:1px solid #eee; margin:0 0 16px">

            <!-- Ítems -->
            <div style="font-size:11px; font-weight:600; color:#888;
                        text-transform:uppercase; letter-spacing:.05em; margin-bottom:10px;">
                Productos
            </div>

            ${itemsHTML}

            <!-- Cupón -->
            ${cuponEncontrado ? `<div style="margin-top:12px">${cuponHTML}</div>` : ""}

            <!-- Divisor -->
            <hr style="border:none; border-top:1px solid #eee; margin:16px 0 0">

            <!-- Resumen de cuenta -->
            ${resumenHTML}

        </div>
    `;

    // ── 7. Swal ───────────────────────────────────────────────────────────────
    Swal.fire({
        width:           640,
        title:           `Pedido #${pedido.idPedido || pedido.id}`,
        html:            html,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#111",
        showClass:       { popup: "swal2-show" },
        hideClass:       { popup: "swal2-hide" }
    });
}