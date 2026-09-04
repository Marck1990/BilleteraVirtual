// =======================================================
// ADAPTADOR DEL FONDO DEL ALMACÉN PARA SUPABASE
// =======================================================

function obtenerClienteFondoAlmacenSupabase() {
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

function convertirNumeroFondo(valor) {
    const numero =
        Number(valor);

    if (Number.isNaN(numero)) {
        return 0;
    }

    return numero;
}

function normalizarAlmacenFondo(
    almacen
) {
    if (
        almacen === null ||
        typeof almacen !== "object"
    ) {
        return null;
    }

    if (
        typeof almacen.id !== "string" ||
        almacen.id.trim() === ""
    ) {
        return null;
    }

    return {
        id:
            almacen.id.trim(),

        nombre:
            typeof almacen.nombre ===
                "string"
                ? almacen.nombre
                : ""
    };
}

// =======================================================
// LISTAR ALMACENES
// =======================================================

async function listarAlmacenesSupabase() {
    try {
        const cliente =
            obtenerClienteFondoAlmacenSupabase();

        const respuesta =
            await cliente.rpc(
                "listar_almacenes"
            );

        if (respuesta.error) {
            console.error(
                "Error al listar almacenes:",
                respuesta.error
            );

            return {
                correcto: false,

                mensaje:
                    respuesta.error.message,

                almacenes: []
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
                    "no se pudieron obtener los almacenes",

                almacenes: []
            };
        }

        const listaOriginal =
            Array.isArray(
                respuesta.data.almacenes
            )
                ? respuesta.data.almacenes
                : [];

        const almacenes = [];

        for (
            let i = 0;
            i < listaOriginal.length;
            i++
        ) {
            const almacen =
                normalizarAlmacenFondo(
                    listaOriginal[i]
                );

            if (almacen !== null) {
                almacenes.push(
                    almacen
                );
            }
        }

        return {
            correcto: true,

            resultado:
                respuesta.data.resultado,

            almacenes:
                almacenes
        };
    } catch (error) {
        console.error(
            "Error inesperado al listar almacenes:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudo conectar con Supabase",

            almacenes: []
        };
    }
}

// =======================================================
// CONSULTAR FONDO
// =======================================================

async function consultarFondoAlmacenSupabase(
    almacenId = null
) {
    try {
        const cliente =
            obtenerClienteFondoAlmacenSupabase();

        const idNormalizado =
            typeof almacenId === "string"
                ? almacenId.trim()
                : "";

        let respuesta;

        if (idNormalizado === "") {
            respuesta =
                await cliente.rpc(
                    "consultar_fondo_almacen"
                );
        } else {
            respuesta =
                await cliente.rpc(
                    "consultar_fondo_almacen",
                    {
                        p_almacen_id:
                            idNormalizado
                    }
                );
        }

        if (respuesta.error) {
            console.error(
                "Error al consultar el fondo:",
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
                "correcto"
        ) {
            return {
                correcto: false,

                resultado:
                    respuesta.data
                        ?.resultado ||
                    "respuesta_invalida",

                mensaje:
                    "no se pudo consultar el fondo"
            };
        }

        return {
            correcto: true,

            resultado:
                respuesta.data.resultado,

            almacenId:
                respuesta.data
                    .almacen_id ||
                idNormalizado ||
                null,

            almacenNombre:
                respuesta.data
                    .almacen_nombre ||
                "",

            saldo:
                convertirNumeroFondo(
                    respuesta.data.saldo
                ),

            actualizadoEn:
                respuesta.data
                    .actualizado_en ||
                null
        };
    } catch (error) {
        console.error(
            "Error inesperado al consultar el fondo:",
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
// CARGAR FONDO
// =======================================================

async function cargarFondoAlmacenSupabase(
    monto,
    almacenId = null
) {
    const montoNumerico =
        Number(monto);

    if (
        !Number.isFinite(
            montoNumerico
        ) ||
        montoNumerico <= 0
    ) {
        return {
            correcto: false,

            resultado:
                "monto_invalido",

            mensaje:
                "el monto debe ser mayor que cero"
        };
    }

    try {
        const cliente =
            obtenerClienteFondoAlmacenSupabase();

        const idNormalizado =
            typeof almacenId === "string"
                ? almacenId.trim()
                : "";

        const parametros = {
            p_monto:
                montoNumerico
        };

        if (idNormalizado !== "") {
            parametros.p_almacen_id =
                idNormalizado;
        }

        const respuesta =
            await cliente.rpc(
                "cargar_fondo_almacen",
                parametros
            );

        if (respuesta.error) {
            console.error(
                "Error al cargar el fondo:",
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
                "carga_correcta"
        ) {
            return {
                correcto: false,

                resultado:
                    respuesta.data
                        ?.resultado ||
                    "respuesta_invalida",

                mensaje:
                    "no se pudo cargar el fondo"
            };
        }

        return {
            correcto: true,

            resultado:
                respuesta.data.resultado,

            almacenId:
                respuesta.data
                    .almacen_id ||
                idNormalizado ||
                null,

            almacenNombre:
                respuesta.data
                    .almacen_nombre ||
                "",

            monto:
                convertirNumeroFondo(
                    respuesta.data.monto
                ),

            saldo:
                convertirNumeroFondo(
                    respuesta.data.saldo
                )
        };
    } catch (error) {
        console.error(
            "Error inesperado al cargar el fondo:",
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
// RETIRAR FONDO
// =======================================================

async function retirarFondoAlmacenSupabase(
    monto,
    almacenId
) {
    const montoNumerico =
        Number(monto);

    const idNormalizado =
        typeof almacenId === "string"
            ? almacenId.trim()
            : "";

    if (
        !Number.isFinite(
            montoNumerico
        ) ||
        montoNumerico <= 0
    ) {
        return {
            correcto: false,

            resultado:
                "monto_invalido",

            mensaje:
                "el monto debe ser mayor que cero"
        };
    }

    if (idNormalizado === "") {
        return {
            correcto: false,

            resultado:
                "almacen_invalido",

            mensaje:
                "seleccioná un almacén"
        };
    }

    try {
        const cliente =
            obtenerClienteFondoAlmacenSupabase();

        const respuesta =
            await cliente.rpc(
                "retirar_fondo_almacen",
                {
                    p_almacen_id:
                        idNormalizado,

                    p_monto:
                        montoNumerico
                }
            );

        if (respuesta.error) {
            console.error(
                "Error al retirar el fondo:",
                respuesta.error
            );

            return {
                correcto: false,

                resultado:
                    "error_supabase",

                mensaje:
                    respuesta.error.message
            };
        }

        const datos =
            respuesta.data;

        if (
            datos === null ||
            datos.resultado !==
                "retiro_correcto"
        ) {
            return {
                correcto: false,

                resultado:
                    datos?.resultado ||
                    "respuesta_invalida",

                saldoActual:
                    convertirNumeroFondo(
                        datos?.saldo_actual
                    ),

                saldoReservado:
                    convertirNumeroFondo(
                        datos?.saldo_reservado
                    ),

                saldoDisponible:
                    convertirNumeroFondo(
                        datos?.saldo_disponible
                    ),

                mensaje:
                    "no se pudo retirar el fondo"
            };
        }

        return {
            correcto: true,

            resultado:
                datos.resultado,

            almacenId:
                idNormalizado,

            monto:
                convertirNumeroFondo(
                    datos.monto
                ),

            saldo:
                convertirNumeroFondo(
                    datos.saldo
                ),

            saldoReservado:
                convertirNumeroFondo(
                    datos.saldo_reservado
                )
        };
    } catch (error) {
        console.error(
            "Error inesperado al retirar el fondo:",
            error
        );

        return {
            correcto: false,

            resultado:
                "error_inesperado",

            mensaje:
                "no se pudo conectar con Supabase"
        };
    }
}







// =======================================================
// API PÚBLICA DEL ADAPTADOR
// =======================================================

window.fondoAlmacenSupabaseAdapter = {
    listarAlmacenes:
        listarAlmacenesSupabase,

    consultarFondo:
        consultarFondoAlmacenSupabase,

    cargarFondo:
        cargarFondoAlmacenSupabase,

    retirarFondo:
        retirarFondoAlmacenSupabase
};