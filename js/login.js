const form = document.getElementById("formRol");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const rol = document.querySelector('input[name="rol"]:checked');

    if (!rol) {
        alert("Seleccioná un rol");
        return;
    }

    localStorage.setItem("rol", rol.value);

    switch (rol.value) {
        case "admin":
            window.location.href = "./panel-admin.html";
            break;

        case "cliente":
            window.location.href = "../index.html";
            break;
    }
});