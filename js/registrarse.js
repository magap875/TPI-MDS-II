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

    try {
        Swal.fire({
            title: "Registrando usuario...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const checkEmail = await fetch("https://69e616eace4e908a155ef130.mockapi.io/usuario");
        const usuarios = await checkEmail.json();

        const emailNormalizado = email.trim().toLowerCase();

        const existeEmail = usuarios.some(
            usuario => usuario.email.trim().toLowerCase() === emailNormalizado
        );

        if (existeEmail) {
            Swal.fire({
                icon: "error",
                title: "Email ya registrado",
                text: "Probá con otro correo"
            });
            return;
        }

        const resp = await fetch("https://69e616eace4e908a155ef130.mockapi.io/usuario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoCliente)
        });

        if (!resp.ok) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `No se pudo registrar ${rol}`
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: `${rol} registrado correctamente`,
            text: "El usuario fue creado con éxito",
            confirmButtonText: "OK"
        }).then(() => {
            window.location.href = "./login.html";
        });

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error inesperado",
            text: `No se pudo registrar ${rol}`
        });
    }
});