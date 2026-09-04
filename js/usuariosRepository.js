// =======================================================
// REPOSITORIO CENTRAL DE USUARIOS
// =======================================================

function obtenerAdaptadorUsuarios() {
    if (
        typeof window.usuariosSupabaseAdapter ===
        "undefined"
    ) {
        throw new Error(
            "El adaptador de usuarios de Supabase no está disponible."
        );
    }

    return window.usuariosSupabaseAdapter;
}

async function crearTitularRepositorio(
    datosUsuario
) {
    const adaptador =
        obtenerAdaptadorUsuarios();

    return await adaptador.crearTitular(
        datosUsuario
    );
}

async function iniciarSesionRepositorio(
    usuario,
    contrasena
) {
    const adaptador =
        obtenerAdaptadorUsuarios();

    return await adaptador.iniciarSesion(
        usuario,
        contrasena
    );
}

async function cerrarSesionRepositorio() {
    const adaptador =
        obtenerAdaptadorUsuarios();

    return await adaptador.cerrarSesion();
}

async function obtenerMiBilleteraRepositorio() {
    const adaptador =
        obtenerAdaptadorUsuarios();

    return await adaptador
        .obtenerMiBilletera();
}

async function listarUsuariosRepositorio() {
    const adaptador =
        obtenerAdaptadorUsuarios();

    return await adaptador
        .listarUsuarios();
}

async function modificarSaldoRepositorio(
    perfilId,
    monto,
    detalle
) {
    const adaptador =
        obtenerAdaptadorUsuarios();

    return await adaptador.modificarSaldo(
        perfilId,
        monto,
        detalle
    );
}

async function cambiarBloqueoRepositorio(
    perfilId,
    bloqueada
) {
    const adaptador =
        obtenerAdaptadorUsuarios();

    return await adaptador.cambiarBloqueo(
        perfilId,
        bloqueada
    );
}

async function cambiarContrasenaObligatoriaRepositorio(
    nuevaContrasena
) {
    const adaptador =
        obtenerAdaptadorUsuarios();

    return await adaptador
        .cambiarContrasenaObligatoria(
            nuevaContrasena
        );
}

window.usuariosRepository = {
    crearTitular:
        crearTitularRepositorio,

    iniciarSesion:
        iniciarSesionRepositorio,

    cerrarSesion:
        cerrarSesionRepositorio,

    obtenerMiBilletera:
        obtenerMiBilleteraRepositorio,

    listarUsuarios:
        listarUsuariosRepositorio,

    modificarSaldo:
        modificarSaldoRepositorio,

    cambiarBloqueo:
        cambiarBloqueoRepositorio,

    cambiarContrasenaObligatoria:
        cambiarContrasenaObligatoriaRepositorio
};

// =======================================================
// RESTAURAR SESIÓN EXISTENTE
// =======================================================

async function restaurarSesionRepositorio() {
    const adaptador =
        obtenerAdaptadorUsuarios();

    return await adaptador
        .restaurarSesion();
}

window.usuariosRepository
    .restaurarSesion =
    restaurarSesionRepositorio;