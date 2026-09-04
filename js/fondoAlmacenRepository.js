// =======================================================
// REPOSITORIO CENTRAL DEL FONDO DEL ALMACÉN
// =======================================================

function obtenerAdaptadorFondoAlmacen() {
    if (
        typeof window.fondoAlmacenSupabaseAdapter ===
        "undefined"
    ) {
        throw new Error(
            "El adaptador del fondo del almacén no está disponible."
        );
    }

    return window.fondoAlmacenSupabaseAdapter;
}

// =======================================================
// LISTAR ALMACENES
// =======================================================

async function listarAlmacenesRepositorio() {
    const adaptador =
        obtenerAdaptadorFondoAlmacen();

    return await adaptador
        .listarAlmacenes();
}

// =======================================================
// CONSULTAR FONDO
// =======================================================

async function consultarFondoAlmacenRepositorio(
    almacenId = null
) {
    const adaptador =
        obtenerAdaptadorFondoAlmacen();

    return await adaptador
        .consultarFondo(
            almacenId
        );
}

// =======================================================
// CARGAR FONDO
// =======================================================

async function cargarFondoAlmacenRepositorio(
    monto,
    almacenId = null
) {
    const adaptador =
        obtenerAdaptadorFondoAlmacen();

    return await adaptador
        .cargarFondo(
            monto,
            almacenId
        );
}




// =======================================================
// RETIRAR FONDO
// =======================================================

async function retirarFondoAlmacenRepositorio(
    monto,
    almacenId
) {
    const adaptador =
        obtenerAdaptadorFondoAlmacen();

    return await adaptador
        .retirarFondo(
            monto,
            almacenId
        );
}





// =======================================================
// API PÚBLICA DEL REPOSITORIO
// =======================================================

window.fondoAlmacenRepository = {
    listarAlmacenes:
        listarAlmacenesRepositorio,

    consultarFondo:
        consultarFondoAlmacenRepositorio,

    cargarFondo:
        cargarFondoAlmacenRepositorio,

    retirarFondo:
        retirarFondoAlmacenRepositorio
};