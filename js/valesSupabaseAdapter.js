// =======================================================
// ADAPTADOR DE VALES PARA SUPABASE
// =======================================================

function obtenerClienteSupabase() {
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

function prepararProductosParaSupabase(
    productos
) {
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

// =======================================================
// GUARDAR VALE SIN MODIFICAR SALDO
// Compatibilidad con usuarios locales antiguos
// =======================================================

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
                error:
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
            error:
                error.message
        };
    }
}

// =======================================================
// COMPRA ATÓMICA
// Descuenta saldo, crea vale y registra movimiento
// =======================================================

async function realizarCompraConValeSupabase(
    vale,
    almacenId
) {
    if (
        typeof almacenId !== "string" ||
        almacenId.trim() === ""
    ) {
        return {
            correcto: false,

            resultado:
                "almacen_invalido",

            error:
                "seleccioná un almacén"
        };
    }

    try {
        const cliente =
            obtenerClienteSupabase();

        const productos =
            prepararProductosParaSupabase(
                vale.productos
            );

        const respuesta =
            await cliente.rpc(
                "realizar_compra_con_vale",
                {
                    p_codigo:
                        vale.id,

                    p_total:
                        vale.total,

                    p_vence_en:
                        vale.fechaVencimiento,

                    p_productos:
                        productos,

                    p_almacen_id:
                        almacenId
                }
            );

        if (respuesta.error) {
            console.error(
                "Error al realizar la compra:",
                respuesta.error
            );

            return {
                correcto: false,

                resultado:
                    "error_supabase",

                error:
                    respuesta.error.message
            };
        }

        const datos =
            respuesta.data;

        if (
            datos === null ||
            datos.resultado !==
                "compra_realizada"
        ) {
            return {
                correcto: false,

                resultado:
                    datos?.resultado ||
                    "respuesta_invalida",

                datos:
                    datos
            };
        }

        const valeRemoto =
            datos.vale;

        return {
            correcto: true,

            resultado:
                datos.resultado,

            saldo:
                Number(
                    datos.saldo
                ),

            vale: {
                ...vale,

                id:
                    valeRemoto.codigo,

                idInterno:
                    valeRemoto.id,

                tokenPublico:
                    valeRemoto
                        .token_publico,

                estado:
                    valeRemoto.estado,

                total:
                    Number(
                        valeRemoto.total
                    ),

                fechaCreacion:
                    valeRemoto
                        .creado_en,

                fechaVencimiento:
                    valeRemoto
                        .vence_en,

                almacenId:
                    valeRemoto
                        .almacen_id ||
                    almacenId
            }
        };
    } catch (error) {
        console.error(
            "Error inesperado al realizar la compra:",
            error
        );

        return {
            correcto: false,

            resultado:
                "error_inesperado",

            error:
                error.message
        };
    }
}

// =======================================================
// CONSULTAR VALE
// =======================================================

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
                error:
                    respuesta.error.message
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
            vale:
                respuesta.data
        };
    } catch (error) {
        console.error(
            "Error inesperado al consultar el vale:",
            error
        );

        return {
            correcto: false,
            error:
                error.message
        };
    }
}

// =======================================================
// UTILIZAR VALE
// =======================================================

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
                error:
                    respuesta.error.message
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
            error:
                error.message
        };
    }
}

window.valesSupabaseAdapter = {
    guardarVale:
        guardarValeSupabase,

    realizarCompraConVale:
        realizarCompraConValeSupabase,

    obtenerVale:
        obtenerValeSupabase,

    marcarValeComoUsado:
        marcarValeComoUsadoSupabase
};





// =======================================================
// RECUPERAR ÚLTIMO VALE PENDIENTE DEL TITULAR
// =======================================================

async function obtenerMiUltimoValePendienteSupabase() {
    try {
        const cliente =
            obtenerClienteSupabase();

        const respuesta =
            await cliente.rpc(
                "obtener_mi_ultimo_vale_pendiente"
            );

        if (respuesta.error) {
            console.error(
                "Error al recuperar el vale pendiente:",
                respuesta.error
            );

            return {
                correcto: false,

                existe:
                    false,

                mensaje:
                    respuesta.error.message
            };
        }

        const datos =
            respuesta.data;

        if (
            datos === null ||
            datos.resultado !==
                "correcto"
        ) {
            return {
                correcto: false,

                existe:
                    false,

                resultado:
                    datos?.resultado ||
                    "respuesta_invalida",

                mensaje:
                    "no se pudo recuperar el vale pendiente"
            };
        }

        if (
            datos.existe !== true ||
            datos.vale === null
        ) {
            return {
                correcto: true,

                existe:
                    false
            };
        }

        const valeOriginal =
            datos.vale;

        const productosOriginales =
            Array.isArray(
                valeOriginal.productos
            )
                ? valeOriginal.productos
                : [];

        const productos = [];

        for (
            let i = 0;
            i < productosOriginales.length;
            i++
        ) {
            const producto =
                productosOriginales[i];

            productos.push({
                nombre:
                    producto.nombre,

                cantidad:
                    Number(
                        producto.cantidad
                    ),

                precioUnitario:
                    Number(
                        producto
                            .precio_unitario
                    ),

                subtotal:
                    Number(
                        producto.subtotal
                    )
            });
        }

        return {
            correcto: true,

            existe:
                true,

            vale: {
                id:
                    valeOriginal.codigo,

                idInterno:
                    valeOriginal.id,

                tokenPublico:
                    valeOriginal
                        .token_publico,

                titularNombre:
                    valeOriginal
                        .titular_nombre,

                estado:
                    valeOriginal.estado,

                total:
                    Number(
                        valeOriginal.total
                    ),

                fechaCreacion:
                    valeOriginal
                        .creado_en,

                fechaVencimiento:
                    valeOriginal
                        .vence_en,

                almacenId:
                    valeOriginal
                        .almacen_id,

                productos:
                    productos
            }
        };
    } catch (error) {
        console.error(
            "Error inesperado al recuperar el vale pendiente:",
            error
        );

        return {
            correcto: false,

            existe:
                false,

            mensaje:
                "no se pudo conectar con Supabase"
        };
    }
}

window.valesSupabaseAdapter
    .obtenerMiUltimoValePendiente =
    obtenerMiUltimoValePendienteSupabase;