// =======================================================
// ADAPTADOR DE PRODUCTOS PARA SUPABASE
// =======================================================

function obtenerClienteProductosSupabase() {
    if (
        typeof window.supabaseCliente ===
            "undefined" ||
        window.supabaseCliente === null
    ) {
        throw new Error(
            "El cliente de Supabase no está disponible."
        );
    }

    return window.supabaseCliente;
}

function normalizarProductoSupabase(
    producto
) {
    if (
        producto === null ||
        typeof producto !== "object"
    ) {
        return null;
    }

    return {
        id:
            Number(
                producto.id
            ),

        nombre:
            typeof producto.nombre ===
                "string"
                ? producto.nombre
                : "",

        precio:
            Number(
                producto.precio || 0
            ),

        activo:
            producto.activo !== false,

        creadoEn:
            producto.creado_en || null,

        actualizadoEn:
            producto.actualizado_en || null,

        almacenamiento:
            "supabase"
    };
}

// =======================================================
// LISTAR PRODUCTOS
// =======================================================

async function listarProductosSupabase(
    incluirInactivos = false
) {
    try {
        const cliente =
            obtenerClienteProductosSupabase();

        const respuesta =
            await cliente.rpc(
                "listar_productos",
                {
                    p_incluir_inactivos:
                        incluirInactivos ===
                        true
                }
            );

        if (respuesta.error) {
            console.error(
                "Error al listar productos:",
                respuesta.error
            );

            return {
                correcto: false,

                mensaje:
                    respuesta.error.message,

                productos: []
            };
        }

        if (
            respuesta.data === null ||
            respuesta.data.resultado !==
                "correcto"
        ) {
            return {
                correcto: false,

                resultado:
                    respuesta.data
                        ?.resultado ||
                    "respuesta_invalida",

                mensaje:
                    "no se pudieron obtener los productos",

                productos: []
            };
        }

        const listaOriginal =
            Array.isArray(
                respuesta.data.productos
            )
                ? respuesta.data.productos
                : [];

        const productos = [];

        for (
            let i = 0;
            i < listaOriginal.length;
            i++
        ) {
            const producto =
                normalizarProductoSupabase(
                    listaOriginal[i]
                );

            if (producto !== null) {
                productos.push(
                    producto
                );
            }
        }

        return {
            correcto: true,

            productos:
                productos
        };
    } catch (error) {
        console.error(
            "Error inesperado al listar productos:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudo conectar con Supabase",

            productos: []
        };
    }
}

// =======================================================
// CREAR PRODUCTO
// =======================================================

async function crearProductoSupabase(
    nombre,
    precio
) {
    try {
        const cliente =
            obtenerClienteProductosSupabase();

        const respuesta =
            await cliente.rpc(
                "crear_producto",
                {
                    p_nombre:
                        nombre,

                    p_precio:
                        precio
                }
            );

        if (respuesta.error) {
            console.error(
                "Error al crear producto:",
                respuesta.error
            );

            return {
                correcto: false,

                mensaje:
                    respuesta.error.message
            };
        }

        if (
            respuesta.data === null ||
            respuesta.data.resultado !==
                "creado_correctamente"
        ) {
            return {
                correcto: false,

                resultado:
                    respuesta.data
                        ?.resultado ||
                    "respuesta_invalida",

                mensaje:
                    respuesta.data
                        ?.resultado ===
                        "producto_duplicado"
                        ? "ese producto ya existe"
                        : "no se pudo crear el producto"
            };
        }

        return {
            correcto: true,

            resultado:
                respuesta.data.resultado,

            producto:
                normalizarProductoSupabase(
                    respuesta.data.producto
                )
        };
    } catch (error) {
        console.error(
            "Error inesperado al crear producto:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudo conectar con Supabase"
        };
    }
}

// =======================================================
// ACTUALIZAR PRODUCTO
// =======================================================

async function actualizarProductoSupabase(
    id,
    nombre,
    precio,
    activo
) {
    try {
        const cliente =
            obtenerClienteProductosSupabase();

        const respuesta =
            await cliente.rpc(
                "actualizar_producto",
                {
                    p_id:
                        Number(id),

                    p_nombre:
                        nombre,

                    p_precio:
                        precio,

                    p_activo:
                        activo === true
                }
            );

        if (respuesta.error) {
            console.error(
                "Error al actualizar producto:",
                respuesta.error
            );

            return {
                correcto: false,

                mensaje:
                    respuesta.error.message
            };
        }

        if (
            respuesta.data === null ||
            respuesta.data.resultado !==
                "actualizado_correctamente"
        ) {
            return {
                correcto: false,

                resultado:
                    respuesta.data
                        ?.resultado ||
                    "respuesta_invalida",

                mensaje:
                    respuesta.data
                        ?.resultado ===
                        "producto_duplicado"
                        ? "ya existe otro producto con ese nombre"
                        : "no se pudo actualizar el producto"
            };
        }

        return {
            correcto: true,

            resultado:
                respuesta.data.resultado,

            producto:
                normalizarProductoSupabase(
                    respuesta.data.producto
                )
        };
    } catch (error) {
        console.error(
            "Error inesperado al actualizar producto:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudo conectar con Supabase"
        };
    }
}

// =======================================================
// DESACTIVAR PRODUCTO
// =======================================================

async function eliminarProductoSupabase(
    id
) {
    try {
        const cliente =
            obtenerClienteProductosSupabase();

        const respuesta =
            await cliente.rpc(
                "eliminar_producto",
                {
                    p_id:
                        Number(id)
                }
            );

        if (respuesta.error) {
            console.error(
                "Error al eliminar producto:",
                respuesta.error
            );

            return {
                correcto: false,

                mensaje:
                    respuesta.error.message
            };
        }

        return {
            correcto:
                respuesta.data
                    ?.resultado ===
                "eliminado_correctamente",

            resultado:
                respuesta.data
                    ?.resultado ||
                "respuesta_invalida",

            mensaje:
                respuesta.data
                    ?.resultado ===
                    "eliminado_correctamente"
                    ? ""
                    : "no se pudo desactivar el producto"
        };
    } catch (error) {
        console.error(
            "Error inesperado al eliminar producto:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudo conectar con Supabase"
        };
    }
}

// =======================================================
// API PÚBLICA DEL ADAPTADOR
// =======================================================

window.productosSupabaseAdapter = {
    listarProductos:
        listarProductosSupabase,

    crearProducto:
        crearProductoSupabase,

    actualizarProducto:
        actualizarProductoSupabase,

    eliminarProducto:
        eliminarProductoSupabase
};