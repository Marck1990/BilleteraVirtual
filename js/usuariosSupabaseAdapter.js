// =======================================================
// ADAPTADOR DE USUARIOS PARA SUPABASE
// =======================================================

const DOMINIO_USUARIOS_SUPABASE =
    "billetera.test";

// =======================================================
// FUNCIONES AUXILIARES
// =======================================================

function obtenerClienteUsuariosSupabase() {
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

function normalizarNombreUsuario(
    usuario
) {
    if (typeof usuario !== "string") {
        return "";
    }

    return usuario
        .trim()
        .toLowerCase();
}

function construirCorreoSupabase(
    usuario
) {
    const usuarioNormalizado =
        normalizarNombreUsuario(
            usuario
        );

    if (
        usuarioNormalizado.includes("@")
    ) {
        return usuarioNormalizado;
    }

    return (
        usuarioNormalizado +
        "@" +
        DOMINIO_USUARIOS_SUPABASE
    );
}

async function leerRespuestaJson(
    respuesta
) {
    try {
        return await respuesta.json();
    } catch (error) {
        return {};
    }
}

function convertirNumeroSeguro(
    valor
) {
    const numero =
        Number(valor);

    if (Number.isNaN(numero)) {
        return 0;
    }

    return numero;
}

function formatearFechaMovimientoSupabase(
    fechaTexto
) {
    if (
        typeof fechaTexto !== "string" ||
        fechaTexto.trim() === ""
    ) {
        return "";
    }

    const fecha =
        new Date(
            fechaTexto
        );

    if (
        Number.isNaN(
            fecha.getTime()
        )
    ) {
        return fechaTexto;
    }

    return fecha.toLocaleString(
        "es-UY",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function normalizarMovimientoSupabase(
    movimiento
) {
    if (
        movimiento === null ||
        typeof movimiento !== "object"
    ) {
        return null;
    }

    const detalle =
        typeof movimiento.detalle ===
            "string"
            ? movimiento.detalle
            : "";

    const fechaOriginal =
        movimiento.creado_en ||
        movimiento.creadoEn ||
        movimiento.fecha ||
        "";

    return {
        id:
            movimiento.id || null,

        tipo:
            movimiento.tipo || "",

        detalle:
            detalle,

        descripcion:
            detalle,

        monto:
            convertirNumeroSeguro(
                movimiento.monto
            ),

        saldoResultante:
            convertirNumeroSeguro(
                movimiento
                    .saldo_resultante ??
                movimiento
                    .saldoResultante
            ),

        fecha:
            formatearFechaMovimientoSupabase(
                fechaOriginal
            ),

        creadoEn:
            fechaOriginal
    };
}

function normalizarListaMovimientosSupabase(
    movimientosOriginales
) {
    const movimientos = [];

    if (
        !Array.isArray(
            movimientosOriginales
        )
    ) {
        return movimientos;
    }

    for (
        let i = 0;
        i < movimientosOriginales.length;
        i++
    ) {
        const movimiento =
            normalizarMovimientoSupabase(
                movimientosOriginales[i]
            );

        if (movimiento !== null) {
            movimientos.push(
                movimiento
            );
        }
    }

    return movimientos;
}

async function obtenerMovimientosAdministracion(
    cliente
) {
    try {
        const respuesta =
            await cliente
                .from(
                    "movimientos_billetera"
                )
                .select(
                    "id, perfil_id, tipo, detalle, monto, saldo_resultante, creado_en"
                )
                .order(
                    "creado_en",
                    {
                        ascending: false
                    }
                )
                .limit(1000);

        if (respuesta.error) {
            console.error(
                "Error al consultar movimientos:",
                respuesta.error
            );

            return {
                correcto: false,
                movimientosPorPerfil: {}
            };
        }

        const movimientosOriginales =
            Array.isArray(
                respuesta.data
            )
                ? respuesta.data
                : [];

        const movimientosPorPerfil = {};

        for (
            let i = 0;
            i < movimientosOriginales.length;
            i++
        ) {
            const movimientoOriginal =
                movimientosOriginales[i];

            const perfilId =
                movimientoOriginal
                    .perfil_id;

            if (
                typeof perfilId !==
                    "string" ||
                perfilId.trim() ===
                    ""
            ) {
                continue;
            }

            if (
                !Array.isArray(
                    movimientosPorPerfil[
                        perfilId
                    ]
                )
            ) {
                movimientosPorPerfil[
                    perfilId
                ] = [];
            }

            const movimiento =
                normalizarMovimientoSupabase(
                    movimientoOriginal
                );

            if (movimiento !== null) {
                movimientosPorPerfil[
                    perfilId
                ].push(
                    movimiento
                );
            }
        }

        return {
            correcto: true,
            movimientosPorPerfil:
                movimientosPorPerfil
        };
    } catch (error) {
        console.error(
            "Error al cargar movimientos administrativos:",
            error
        );

        return {
            correcto: false,
            movimientosPorPerfil: {}
        };
    }
}

// =======================================================
// CREACIÓN DE TITULARES
// =======================================================

async function crearTitularSupabase(
    datosUsuario
) {
    try {
        const respuesta =
            await fetch(
                "/api/usuarios/crear",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        usuario:
                            datosUsuario.usuario,

                        nombre:
                            datosUsuario.nombre,

                        curso:
                            datosUsuario.curso,

                        contrasena:
                            datosUsuario.contrasena
                    })
                }
            );

        const datos =
            await leerRespuestaJson(
                respuesta
            );

        if (
            !respuesta.ok ||
            datos.ok !== true
        ) {
            return {
                correcto: false,

                mensaje:
                    datos.mensaje ||
                    "no se pudo crear el usuario"
            };
        }

        return {
            correcto: true,

            mensaje:
                datos.mensaje,

            usuario:
                datos.usuario
        };
    } catch (error) {
        console.error(
            "Error al crear el titular:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudo conectar con el servidor"
        };
    }
}

// =======================================================
// AUTENTICACIÓN
// =======================================================

async function iniciarSesionSupabase(
    usuario,
    contrasena
) {
    try {
        const cliente =
            obtenerClienteUsuariosSupabase();

        const correo =
            construirCorreoSupabase(
                usuario
            );

        const respuesta =
            await cliente
                .auth
                .signInWithPassword({
                    email:
                        correo,

                    password:
                        contrasena
                });

        if (respuesta.error) {
            return {
                correcto: false,

                mensaje:
                    "usuario o contraseña incorrectos"
            };
        }

        const resultadoBilletera =
            await obtenerMiBilleteraSupabase();

        if (!resultadoBilletera.correcto) {
            await cliente
                .auth
                .signOut();

            return {
                correcto: false,

                mensaje:
                    resultadoBilletera
                        .mensaje
            };
        }

        return {
            correcto: true,

            sesion:
                respuesta.data.session,

            usuario:
                resultadoBilletera.usuario
        };
    } catch (error) {
        console.error(
            "Error al iniciar sesión:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudo conectar con Supabase"
        };
    }
}

async function cerrarSesionSupabase() {
    try {
        const cliente =
            obtenerClienteUsuariosSupabase();

        const respuesta =
            await cliente
                .auth
                .signOut();

        return {
            correcto:
                respuesta.error === null,

            mensaje:
                respuesta.error
                    ? respuesta.error.message
                    : ""
        };
    } catch (error) {
        console.error(
            "Error al cerrar sesión:",
            error
        );

        return {
            correcto: false,

            mensaje:
                error.message
        };
    }
}

// =======================================================
// MI BILLETERA
// =======================================================

async function obtenerMiBilleteraSupabase() {
    try {
        const cliente =
            obtenerClienteUsuariosSupabase();

        const respuesta =
            await cliente.rpc(
                "obtener_mi_billetera"
            );

        if (respuesta.error) {
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

                mensaje:
                    respuesta.data
                        ?.resultado ||
                    "no se pudo obtener la billetera"
            };
        }

        const perfil =
            respuesta.data.perfil;

        const billetera =
            respuesta.data.billetera;

        const movimientos =
            normalizarListaMovimientosSupabase(
                respuesta.data.movimientos
            );

        return {
            correcto: true,

            usuario: {
                id:
                    perfil.id,

                tipo:
                    perfil.rol,

                usuario:
                    perfil.usuario,

                nombre:
                    perfil.nombre,

                curso:
                    perfil.curso || "",

                saldo:
                    convertirNumeroSeguro(
                        billetera?.saldo
                    ),

                bloqueado:
                    billetera?.bloqueada ===
                    true,

                historial:
                    movimientos
            }
        };
    } catch (error) {
        console.error(
            "Error al obtener la billetera:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudo consultar la billetera"
        };
    }
}

// =======================================================
// ADMINISTRACIÓN DE TITULARES
// =======================================================

async function listarUsuariosSupabase() {
    try {
        const cliente =
            obtenerClienteUsuariosSupabase();

        const respuesta =
            await cliente.rpc(
                "listar_usuarios_billeteras"
            );

        if (respuesta.error) {
            return {
                correcto: false,

                mensaje:
                    respuesta.error.message,

                usuarios: []
            };
        }

        if (
            respuesta.data === null ||
            respuesta.data.resultado !==
                "correcto"
        ) {
            return {
                correcto: false,

                mensaje:
                    respuesta.data
                        ?.resultado ||
                    "no se pudieron listar los usuarios",

                usuarios: []
            };
        }

        const listaOriginal =
            Array.isArray(
                respuesta.data.usuarios
            )
                ? respuesta.data.usuarios
                : [];

        const resultadoMovimientos =
            await obtenerMovimientosAdministracion(
                cliente
            );

        const movimientosPorPerfil =
            resultadoMovimientos
                .movimientosPorPerfil;

        const usuarios = [];

        for (
            let i = 0;
            i < listaOriginal.length;
            i++
        ) {
            const usuarioOriginal =
                listaOriginal[i];

            const historial =
                Array.isArray(
                    movimientosPorPerfil[
                        usuarioOriginal.id
                    ]
                )
                    ? movimientosPorPerfil[
                        usuarioOriginal.id
                    ]
                    : [];

            usuarios.push({
                id:
                    usuarioOriginal.id,

                tipo:
                    "titular",

                usuario:
                    usuarioOriginal
                        .usuario,

                nombre:
                    usuarioOriginal
                        .nombre,

                curso:
                    usuarioOriginal
                        .curso || "",

                saldo:
                    convertirNumeroSeguro(
                        usuarioOriginal.saldo
                    ),

                bloqueado:
                    usuarioOriginal
                        .bloqueada === true,

                activo:
                    usuarioOriginal
                        .activo !== false,

                historial:
                    historial
            });
        }

        return {
            correcto: true,

            usuarios:
                usuarios
        };
    } catch (error) {
        console.error(
            "Error al listar usuarios:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudieron consultar los usuarios",

            usuarios: []
        };
    }
}

// =======================================================
// MODIFICAR SALDO
// =======================================================

async function modificarSaldoSupabase(
    perfilId,
    monto,
    detalle
) {
    try {
        const cliente =
            obtenerClienteUsuariosSupabase();

        const respuesta =
            await cliente.rpc(
                "modificar_saldo_billetera",
                {
                    p_perfil_id:
                        perfilId,

                    p_monto:
                        monto,

                    p_detalle:
                        detalle || ""
                }
            );

        if (respuesta.error) {
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
                "modificado_correctamente",

            resultado:
                respuesta.data
                    ?.resultado,

            saldo:
                convertirNumeroSeguro(
                    respuesta.data?.saldo
                )
        };
    } catch (error) {
        console.error(
            "Error al modificar saldo:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudo modificar el saldo"
        };
    }
}

// =======================================================
// BLOQUEAR O DESBLOQUEAR
// =======================================================

async function cambiarBloqueoSupabase(
    perfilId,
    bloqueada
) {
    try {
        const cliente =
            obtenerClienteUsuariosSupabase();

        const respuesta =
            await cliente.rpc(
                "cambiar_bloqueo_billetera",
                {
                    p_perfil_id:
                        perfilId,

                    p_bloqueada:
                        bloqueada
                }
            );

        if (respuesta.error) {
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
                "modificado_correctamente",

            resultado:
                respuesta.data
                    ?.resultado,

            bloqueada:
                respuesta.data
                    ?.bloqueada === true
        };
    } catch (error) {
        console.error(
            "Error al cambiar el bloqueo:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudo modificar el estado"
        };
    }
}

// =======================================================
// API PÚBLICA DEL ADAPTADOR
// =======================================================

window.usuariosSupabaseAdapter = {
    crearTitular:
        crearTitularSupabase,

    iniciarSesion:
        iniciarSesionSupabase,

    cerrarSesion:
        cerrarSesionSupabase,

    obtenerMiBilletera:
        obtenerMiBilleteraSupabase,

    listarUsuarios:
        listarUsuariosSupabase,

    modificarSaldo:
        modificarSaldoSupabase,

    cambiarBloqueo:
        cambiarBloqueoSupabase
};