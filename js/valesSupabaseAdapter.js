// =======================================================
// ADAPTADOR DE VALES PARA SUPABASE
// =======================================================

function obtenerClienteSupabase() {
    if (
        typeof window.supabaseCliente === "undefined" ||
        window.supabaseCliente === null
    ) {
        throw new Error(
            "El cliente de Supabase no está disponible."
        );
    }

    return window.supabaseCliente;
}

function prepararProductosParaSupabase(productos) {
    const productosPreparados = [];

    for (
        let i = 0;
        i < productos.length;
        i++
    ) {
        productosPreparados.push({
            producto_nombre:
                productos[i].nombre,

            cantidad:
                productos[i].cantidad,

            precio_unitario:
                productos[i].precioUnitario
        });
    }

    return productosPreparados;
}

async function guardarValeSupabase(vale) {
    try {
        const cliente =
            obtenerClienteSupabase();

        const productos =
            prepararProductosParaSupabase(
                vale.productos
            );

        const respuesta =
            await cliente.rpc(
                "crear_vale",
                {
                    p_codigo:
                        vale.id,

                    p_titular_nombre:
                        vale.titularNombre,

                    p_total:
                        vale.total,

                    p_vence_en:
                        vale.fechaVencimiento,

                    p_productos:
                        productos
                }
            );

        if (respuesta.error) {
            console.error(
                "Error al guardar el vale:",
                respuesta.error
            );

            return {
                correcto: false,
                error: respuesta.error.message
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
                    respuesta.data?.resultado ||
                    "respuesta_invalida"
            };
        }

        return {
            correcto: true,

            vale: {
                ...vale,

                idInterno:
                    respuesta.data.id,

                tokenPublico:
                    respuesta.data
                        .token_publico,

                estado:
                    respuesta.data.estado,

                fechaCreacion:
                    respuesta.data
                        .creado_en,

                fechaVencimiento:
                    respuesta.data
                        .vence_en
            }
        };
    } catch (error) {
        console.error(
            "Error inesperado al guardar el vale:",
            error
        );

        return {
            correcto: false,
            error: error.message
        };
    }
}

async function obtenerValeSupabase(
    tokenPublico
) {
    try {
        const cliente =
            obtenerClienteSupabase();

        const respuesta =
            await cliente.rpc(
                "consultar_vale_publico",
                {
                    p_token:
                        tokenPublico
                }
            );

        if (respuesta.error) {
            console.error(
                "Error al consultar el vale:",
                respuesta.error
            );

            return {
                correcto: false,
                error: respuesta.error.message
            };
        }

        if (
            respuesta.data === null ||
            respuesta.data.existe !== true
        ) {
            return {
                correcto: true,
                existe: false,
                vale: null
            };
        }

        return {
            correcto: true,
            existe: true,
            vale: respuesta.data
        };
    } catch (error) {
        console.error(
            "Error inesperado al consultar el vale:",
            error
        );

        return {
            correcto: false,
            error: error.message
        };
    }
}

async function marcarValeComoUsadoSupabase(
    tokenPublico
) {
    try {
        const cliente =
            obtenerClienteSupabase();

        const respuesta =
            await cliente.rpc(
                "utilizar_vale",
                {
                    p_token:
                        tokenPublico
                }
            );

        if (respuesta.error) {
            console.error(
                "Error al utilizar el vale:",
                respuesta.error
            );

            return {
                correcto: false,
                error: respuesta.error.message
            };
        }

        return {
            correcto:
                respuesta.data?.resultado ===
                "utilizado_correctamente",

            resultado:
                respuesta.data?.resultado ||
                "respuesta_invalida",

            datos:
                respuesta.data
        };
    } catch (error) {
        console.error(
            "Error inesperado al utilizar el vale:",
            error
        );

        return {
            correcto: false,
            error: error.message
        };
    }
}

window.valesSupabaseAdapter = {
    guardarVale:
        guardarValeSupabase,

    obtenerVale:
        obtenerValeSupabase,

    marcarValeComoUsado:
        marcarValeComoUsadoSupabase
};