
const form = document.getElementById("form-registro");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const email = document.getElementById("email").value;
    const dni = document.getElementById("dni").value;
    const telefono = document.getElementById("telefono").value;
    const pais = document.getElementById("pais").value;
    const provincia = document.getElementById("provincia").value;
    const localidad = document.getElementById("localidad").value;
    const calle = document.getElementById("calle").value;
    const numero = document.getElementById("numero").value;
    const piso = document.getElementById("piso").value;
    const dpto = document.getElementById("departamento").value;
    const rol = document.querySelector('input[name="inlineRadioOptions"]:checked')?.value;

    const nuevoCliente = {
        nombre,
        apellido,
        email,
        pais,
        provincia,
        localidad,
        calle,
        numero,
        piso,
        dpto,
        rol
    };

    const checkDni = await fetch(`https://69e616eace4e908a155ef130.mockapi.io/usuario?dni=${dni}`);
    const dataDni = await checkDni.json();

    if (dataDni.length > 0) {
        alert("El DNI ya está registrado");
        return;
    }

    try {
        const resp = await fetch("https://69e616eace4e908a155ef130.mockapi.io/usuario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoCliente)
        });

        if (!resp.ok) {
            alert(`Error al registrar ${rol}`);
            return;
        }

        alert(`${rol} registrado con éxito`);
        location.reload();

    } catch (error) {
        alert(`Error al registrar ${rol}`);
    }
});

