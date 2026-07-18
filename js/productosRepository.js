// =======================================================
// REPOSITORIO CENTRAL DE PRODUCTOS
// =======================================================

function obtenerAdaptadorProductos() {
    if (
        typeof window.productosSupabaseAdapter ===
        "undefined"
    ) {
        throw new Error(
            "El adaptador de productos de Supabase no está disponible."
        );
    }

    return window.productosSupabaseAdapter;
}

// =======================================================
// LISTAR PRODUCTOS
// =======================================================

async function listarProductosRepositorio(
    incluirInactivos = false
) {
    const adaptador =
        obtenerAdaptadorProductos();

    return await adaptador.listarProductos(
        incluirInactivos
    );
}

// =======================================================
// CREAR PRODUCTO
// =======================================================

async function crearProductoRepositorio(
    nombre,
    precio
) {
    const adaptador =
        obtenerAdaptadorProductos();

    return await adaptador.crearProducto(
        nombre,
        precio
    );
}

// =======================================================
// ACTUALIZAR PRODUCTO
// =======================================================

async function actualizarProductoRepositorio(
    id,
    nombre,
    precio,
    activo
) {
    const adaptador =
        obtenerAdaptadorProductos();

    return await adaptador.actualizarProducto(
        id,
        nombre,
        precio,
        activo
    );
}

// =======================================================
// DESACTIVAR PRODUCTO
// =======================================================

async function eliminarProductoRepositorio(
    id
) {
    const adaptador =
        obtenerAdaptadorProductos();

    return await adaptador.eliminarProducto(
        id
    );
}

// =======================================================
// API PÚBLICA DEL REPOSITORIO
// =======================================================

window.productosRepository = {
    listarProductos:
        listarProductosRepositorio,

    crearProducto:
        crearProductoRepositorio,

    actualizarProducto:
        actualizarProductoRepositorio,

    eliminarProducto:
        eliminarProductoRepositorio
};