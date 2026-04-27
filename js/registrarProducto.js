const form = document.getElementById("registroProducto"); // captura el formulario

const btnRegistrarProducto = document.getElementById("btnRegistrar"); // registra el producto


form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const precio = Number(document.getElementById("precio").value);
    const marca = document.getElementById("marca").value;
    const stock = Number(document.getElementById("stock").value);
    const url = document.getElementById("imagen").value;

    const nuevoProducto = {
        nombre,
        precio,
        marca,
        stock,
        url
    };

    try {
        const resp = await fetch("https://69e616eace4e908a155ef130.mockapi.io/producto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoProducto)
        });

        if (!resp.ok) alert("Error al registrar Producto");

        alert("Producto registrado con exito");
        location.reload();

    } catch (error) {
        alert("Error al registrar Producto");
    }

}); 