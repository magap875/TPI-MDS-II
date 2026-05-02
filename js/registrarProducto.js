const form = document.querySelector('form[name="registroProducto"]');

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementsByName("nombre")[0].value;
    const precio = Number(document.getElementsByName("precio")[0].value);
    const marca = document.getElementsByName("marca")[0].value;
    const stock = Number(document.getElementsByName("stock")[0].value);
    const url = document.getElementsByName("imagen")[0].value;

    const nuevoProducto = {
        nombre,
        precio,
        marca,
        stock,
        url
    };

    // agregar control de registro de producto vendido, para solicitar imagen en caso de no registrar venta.



    // registro de producto
    try {
        const resp = await fetch("https://69e616eace4e908a155ef130.mockapi.io/producto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoProducto)
        });

        if (!resp.ok) {
            alert("Error al registrar producto");
            return;
        }

        alert("Producto registrado con éxito");
        location.reload();

    } catch (error) {
        console.error(error);
        alert("Error al registrar producto");
    }
});