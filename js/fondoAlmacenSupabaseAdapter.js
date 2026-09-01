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

// =======================================================
// CONSULTAR FONDO
// =======================================================

async function consultarFondoAlmacenSupabase() {
    try {
        const cliente =
            obtenerClienteFondoAlmacenSupabase();

        const respuesta =
            await cliente.rpc(
                "consultar_fondo_almacen"
            );

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
    monto
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

        const respuesta =
            await cliente.rpc(
                "cargar_fondo_almacen",
                {
                    p_monto:
                        montoNumerico
                }
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
// API PÚBLICA DEL ADAPTADOR
// =======================================================

window.fondoAlmacenSupabaseAdapter = {
    consultarFondo:
        consultarFondoAlmacenSupabase,

    cargarFondo:
        cargarFondoAlmacenSupabase
};