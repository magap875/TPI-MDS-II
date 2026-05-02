
const form = document.getElementById("form-registro");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementsByName("nombre")[0].value;
    const apellido = document.getElementsByName("apellido")[0].value;
    const email = document.getElementsByName("email")[0].value;
    const dni = document.getElementsByName("dni")[0].value;
    const telefono = document.getElementsByName("telefono")[0].value;
    const pais = document.getElementsByName("pais")[0].value;
    const provincia = document.getElementsByName("provincia")[0].value;
    const localidad = document.getElementsByName("localidad")[0].value;
    const calle = document.getElementsByName("calle")[0].value;
    const numero = document.getElementsByName("numero")[0].value;
    const piso = document.getElementsByName("piso")[0].value;
    const dpto = document.getElementsByName("departamento")[0].value;
    const rol = document.querySelector('input[name="inlineRadioOptions"]:checked')?.value;

    const nuevoCliente = {
        nombre,
        apellido,
        dni,
        email,
        pais,
        provincia,
        localidad,
        telefono,
        calle,
        numero,
        piso,
        dpto,
        rol
    };

    const checkDni = await fetch(
        "https://69e616eace4e908a155ef130.mockapi.io/usuario"
    );

    const usuarios = await checkDni.json();

    const dniNormalizado = dni.trim();

    const existeDni = usuarios.some(
        usuario => usuario.dni.trim() === dniNormalizado
    );

    if (existeDni) {
        alert("El DNI ya está registrado");
        return;
    }
    // const checkDni = await fetch(`https://69e616eace4e908a155ef130.mockapi.io/usuario?dni=${dni}`);
    // const dataDni = await checkDni.json();
    // console.log(dataDni);

    // if (dataDni.length > 0) {
    //     alert("El DNI ya está registrado");
    //     return;
    // }



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

