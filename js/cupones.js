const API_USUARIOS = "https://69e616eace4e908a155ef130.mockapi.io/usuario";

const API_CUPONES = "https://69e61843ce4e908a155ef3b7.mockapi.io/cupon";

const API_PRODUCTOS = "https://69e616eace4e908a155ef130.mockapi.io/producto";

function formatearFecha(fechaISO) {
    const [year, month, day] = fechaISO.split("-");
    return `${day}/${month}/${year}`;
}

document
    .getElementById("btnGenerarCupon")
    .addEventListener("click", abrirModalCupon);

async function abrirModalCupon() {

    const response =
        await fetch(API_USUARIOS);
    const responseProductos =
        await fetch(API_PRODUCTOS);

    const productos =
        await responseProductos.json();

    let opcionesProductos = "";

    productos.forEach(producto => {

        opcionesProductos += `
        <option value="${producto.id}">
            ${producto.nombre}
        </option>
    `;
    });

    const clientes =
        await response.json();

    let opcionesClientes = "";

    clientes.forEach(cliente => {

        opcionesClientes += `
            <option value="${cliente.id}">
                ${cliente.nombre} ${cliente.apellido}
            </option>
        `;
    });

    const modalHTML = `
    <div class="modal fade" id="modalCupon">

        <div class="modal-dialog modal-lg">

            <div class="modal-content">

                <div class="modal-header">

                    <h5 class="modal-title">
                        Generar Cupón
                    </h5>

                    <button
                        class="btn-close"
                        data-bs-dismiss="modal">
                    </button>

                </div>

                <div class="modal-body">

                    <label class="form-label">
                        Clientes
                    </label>

                    <select
                        multiple
                        class="form-select mb-3"
                        id="clientesCupon">

                        ${opcionesClientes}

                    </select>

                    <label class="form-label">
                        Productos alcanzados
                        </label>

                        <select
                            multiple
                            class="form-select mb-3"
                            id="productosCupon">

                            ${opcionesProductos}

                        </select>

                    <label class="form-label">
                        Tipo de descuento
                    </label>

                    <select
                        class="form-select mb-3"
                        id="tipoDescuento">

                        <option value="PORCENTAJE">
                            Porcentaje
                        </option>

                        <option value="MONTO">
                            Monto Fijo
                        </option>

                    </select>

                    <label
                        class="form-label"
                        id="lblValor">
                        Porcentaje (%)
                    </label>

                    <input
                        type="number"
                        step="0.01"
                        id="valorDescuento"
                        class="form-control mb-3">

                    <label class="form-label">
                        Fecha Desde
                    </label>

                    <input
                        type="date"
                        id="fechaDesde"
                        class="form-control mb-3">

                    <label class="form-label">
                        Fecha Hasta
                    </label>

                    <input
                        type="date"
                        id="fechaHasta"
                        class="form-control mb-3">

                    <button
                        class="btn btn-dark w-100"
                        id="btnGuardarCupon">

                        Generar Cupón

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
            "modalCupon"
        );

    const modal =
        new bootstrap.Modal(
            modalElemento
        );

    const hoy = new Date()
        .toISOString()
        .split("T")[0];

    document.getElementById(
        "fechaDesde"
    ).min = hoy;

    document.getElementById(
        "fechaHasta"
    ).min = hoy;

    document
        .getElementById(
            "tipoDescuento"
        )
        .addEventListener(
            "change",
            function () {

                document.getElementById(
                    "lblValor"
                ).textContent =
                    this.value ===
                        "PORCENTAJE"
                        ? "Porcentaje (%)"
                        : "Monto ($)";
            }
        );

    modal.show();

    document
        .getElementById(
            "btnGuardarCupon"
        )
        .addEventListener(
            "click",
            guardarCupon
        );

    modalElemento.addEventListener(
        "hidden.bs.modal",
        () => modalElemento.remove()
    );
}

async function generarCodigoUnico() {

    const response =
        await fetch(API_CUPONES);

    const cupones =
        await response.json();

    let codigo;

    do {

        codigo =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();

    } while (
        cupones.some(
            cupon =>
                cupon.codigo === codigo
        )
    );

    return codigo;
}

async function guardarCupon() {

    const clientesSeleccionados =
        [...document.getElementById(
            "clientesCupon"
        ).selectedOptions]
            .map(op => op.value);

    const tipoDescuento =
        document.getElementById(
            "tipoDescuento"
        ).value;

    const valorDescuento =
        document.getElementById(
            "valorDescuento"
        ).value.trim();

    const fechaDesde =
        document.getElementById(
            "fechaDesde"
        ).value;

    const fechaHasta =
        document.getElementById(
            "fechaHasta"
        ).value;

    const productosSeleccionados =
        [...document.getElementById("productosCupon").selectedOptions]
            .map(op => op.value);

    if (
        productosSeleccionados.length === 0
    ) {

        Swal.fire({
            icon: "error",
            title:
                "Seleccione al menos un producto",
            confirmButtonColor: "#000"
        });

        return;
    }

    if (
        clientesSeleccionados.length === 0
    ) {

        Swal.fire({
            icon: "error",
            title:
                "Seleccione al menos un cliente",
            confirmButtonColor: "#000"
        });

        return;
    }

    if (
        !valorDescuento ||
        Number(valorDescuento) <= 0.99
    ) {

        Swal.fire({
            icon: "error",
            title: "Monto inválido",
            text: "El descuento debe ser mayor o igual a 1.",
            confirmButtonColor: "#000"
        });

        return;
    }

    if (
        tipoDescuento === "PORCENTAJE" &&
        (
            Number(valorDescuento) <= 0.99 ||
            Number(valorDescuento) > 100
        )
    ) {

        Swal.fire({
            icon: "error",
            title:
                "Porcentaje inválido",
            text:
                "Ingrese un porcentaje mayor o igual a 1 y menor o igual a 100.",
            confirmButtonColor: "#000"
        });

        return;
    }

    if (!fechaDesde || !fechaHasta) {

        Swal.fire({
            icon: "error",
            title: "Debe completar ambas fechas",
            confirmButtonColor: "#000"
        });

        return;
    }

    const hoy = new Date()
        .toISOString()
        .split("T")[0];

    if (fechaDesde < hoy) {

        Swal.fire({
            icon: "error",
            title:
                "Fecha inválida",
            text:
                "La fecha desde no puede ser anterior a hoy.",
            confirmButtonColor: "#000"
        });

        return;
    }

    if (fechaDesde > fechaHasta) {

        Swal.fire({
            icon: "error",
            title:
                "Fechas inválidas",
            text:
                "La fecha desde no puede ser mayor que la fecha hasta.",
            confirmButtonColor: "#000"
        });

        return;
    }

    const codigo =
        await generarCodigoUnico();

    const nuevoCupon = {

        codigo,

        tipoDescuento,

        valorDescuento:
            Number(valorDescuento),

        fechaDesde,

        fechaHasta,

        clientes:
            clientesSeleccionados,

        productos:
            productosSeleccionados,
            
        usado: false,

        fechaCreacion:
            new Date().toISOString()
    };

    const response =
        await fetch(
            API_CUPONES,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        nuevoCupon
                    )
            }
        );

    if (response.ok) {

        const descuentoMostrado =
            tipoDescuento === "PORCENTAJE"
                ? `${valorDescuento}%`
                : `$${valorDescuento}`;

        Swal.fire({
            icon: "success",
            title:
                "Cupón generado correctamente",
            html: `
                <p>
                    <strong>Código:</strong>
                    ${codigo}
                </p>

                <p>
                    <strong>Descuento:</strong>
                    ${descuentoMostrado}
                </p>

                <p>
                    <strong>Vigencia:</strong>
                    ${formatearFecha(fechaDesde)} al ${formatearFecha(fechaHasta)}
                </p>
            `,
            confirmButtonColor: "#000"
        });

        bootstrap
            .Modal
            .getInstance(
                document.getElementById(
                    "modalCupon"
                )
            )
            .hide();
    }
}
