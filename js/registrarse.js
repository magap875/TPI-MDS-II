
const form = document.getElementById("form-registro");
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const piso = Number(document.getElementById("piso").value);
    const dpto = Number(document.getElementById("departamento").value);
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

    if (!rol) {
    alert("Seleccioná un rol");
    return;
    }
    if (!nombre.trim()) {
    alert("El nombre es obligatorio");
    return;
}

if (!apellido.trim()) {
    alert("El apellido es obligatorio");
    return;
}



if (!regexEmail.test(email)) {
    alert("Email inválido");
    return;
}
if (!email.trim()) {
    alert("El email es obligatorio");
    return;
}


if (!dni.trim() || isNaN(dni)) {
    alert("DNI inválido");
    return;
}

if (!telefono.trim() || isNaN(telefono)) {
    alert("Teléfono inválido");
    return;
}

if (!pais.trim()) {
    alert("El país es obligatorio");
    return;
}

if (!provincia.trim()) {
    alert("La provincia es obligatoria");
    return;
}

if (!localidad.trim()) {
    alert("La localidad es obligatoria");
    return;
}

if (!calle.trim()) {
    alert("La calle es obligatoria");
    return;
}

if (!numero.trim()) {
    alert("numero obligatorio");
    return;
}

if (numero && isNaN(numero)) {
    alert("El numero debe ser numérico");
    return;
}


if (piso && isNaN(piso)) {
    alert("El piso debe ser numérico");
    return;
}

if (dpto && isNaN(dpto)) {
    alert("El departamento debe ser numérico");
    return;
}

if (!rol) {
    alert("Seleccioná un rol");
    return;
}

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

