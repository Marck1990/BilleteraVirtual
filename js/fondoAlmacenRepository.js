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
// CONSULTAR FONDO
// =======================================================

async function consultarFondoAlmacenRepositorio() {
    const adaptador =
        obtenerAdaptadorFondoAlmacen();

    return await adaptador
        .consultarFondo();
}

// =======================================================
// CARGAR FONDO
// =======================================================

async function cargarFondoAlmacenRepositorio(
    monto
) {
    const adaptador =
        obtenerAdaptadorFondoAlmacen();

    return await adaptador
        .cargarFondo(
            monto
        );
}

// =======================================================
// API PÚBLICA DEL REPOSITORIO
// =======================================================

window.fondoAlmacenRepository = {
    consultarFondo:
        consultarFondoAlmacenRepositorio,

    cargarFondo:
        cargarFondoAlmacenRepositorio
};