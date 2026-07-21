c/* =======================================================
   ARCHIVO: api/usuarios/resetear-contrasena.js
   RESETEO SEGURO DE CONTRASEÑAS
======================================================= */

const CONTRASENA_TEMPORAL =
    "cambio321";

const DURACION_CONTRASENA_TEMPORAL =
    2 * 60 * 1000;

// =======================================================
// UTILIDADES
// =======================================================

function normalizarTexto(valor) {
    if (typeof valor !== "string") {
        return "";
    }

    return valor.trim();
}

function normalizarRol(valor) {
    return normalizarTexto(valor)
        .toLowerCase()
        .replaceAll("_", "")
        .replaceAll("-", "")
        .replaceAll(" ", "");
}

async function convertirRespuestaJson(
    respuesta
) {
    const texto =
        await respuesta.text();

    if (texto === "") {
        return {};
    }

    try {
        return JSON.parse(texto);
    } catch (error) {
        return {
            textoOriginal:
                texto
        };
    }
}

function obtenerCuerpoPeticion(req) {
    if (
        req.body !== null &&
        typeof req.body === "object"
    ) {
        return req.body;
    }

    if (
        typeof req.body === "string"
    ) {
        try {
            return JSON.parse(
                req.body
            );
        } catch (error) {
            return {};
        }
    }

    return {};
}

// =======================================================
// ENCABEZADOS DE SUPABASE
// =======================================================

function crearEncabezadosSecretos(
    claveSecreta,
    incluirContenido = false
) {
    const encabezados = {
        apikey:
            claveSecreta,

        Accept:
            "application/json"
    };

    if (
        !claveSecreta.startsWith(
            "sb_secret_"
        )
    ) {
        encabezados.Authorization =
            "Bearer " +
            claveSecreta;
    }

    if (incluirContenido) {
        encabezados["Content-Type"] =
            "application/json";
    }

    return encabezados;
}

function crearEncabezadosUsuario(
    claveApi,
    tokenUsuario
) {
    return {
        apikey:
            claveApi,

        Authorization:
            "Bearer " +
            tokenUsuario,

        Accept:
            "application/json"
    };
}

// =======================================================
// RESTAURAR ESTADO DEL PERFIL SI FALLA AUTH
// =======================================================

async function restaurarEstadoPerfil(
    supabaseUrl,
    claveSecreta,
    usuarioId,
    estadoAnterior
) {
    try {
        await fetch(
            supabaseUrl +
                "/rest/v1/perfiles" +
                "?id=eq." +
                encodeURIComponent(
                    usuarioId
                ),
            {
                method:
                    "PATCH",

                headers:
                    crearEncabezadosSecretos(
                        claveSecreta,
                        true
                    ),

                body:
                    JSON.stringify({
                        debe_cambiar_contrasena:
                            estadoAnterior
                                .debeCambiarContrasena,

                        contrasena_temporal_expira_en:
                            estadoAnterior
                                .expiracion
                    })
            }
        );
    } catch (error) {
        console.error(
            "No se pudo restaurar el perfil:",
            error
        );
    }
}

// =======================================================
// CONTROLADOR PRINCIPAL
// =======================================================

export default async function handler(
    req,
    res
) {
    if (req.method !== "POST") {
        res.setHeader(
            "Allow",
            "POST"
        );

        return res.status(405).json({
            ok: false,

            mensaje:
                "método no permitido"
        });
    }

    const supabaseUrl =
        normalizarTexto(
            process.env.SUPABASE_URL
        ).replace(/\/+$/, "");

    const claveSecreta =
        normalizarTexto(
            process.env
                .SUPABASE_SECRET_KEY ||
            process.env
                .SUPABASE_SERVICE_ROLE_KEY
        );

    if (
        supabaseUrl === "" ||
        claveSecreta === ""
    ) {
        return res.status(500).json({
            ok: false,

            mensaje:
                "el servidor no está configurado"
        });
    }

    const autorizacion =
        normalizarTexto(
            req.headers.authorization
        );

    if (
        !autorizacion.startsWith(
            "Bearer "
        )
    ) {
        return res.status(401).json({
            ok: false,

            mensaje:
                "sesión no encontrada"
        });
    }

    const tokenUsuario =
        autorizacion
            .slice(7)
            .trim();

    if (tokenUsuario === "") {
        return res.status(401).json({
            ok: false,

            mensaje:
                "sesión inválida"
        });
    }

    try {
        // ===============================================
        // VERIFICAR SESIÓN
        // ===============================================

        const respuestaSesion =
            await fetch(
                supabaseUrl +
                    "/auth/v1/user",
                {
                    method:
                        "GET",

                    headers:
                        crearEncabezadosUsuario(
                            claveSecreta,
                            tokenUsuario
                        )
                }
            );

        const datosSesion =
            await convertirRespuestaJson(
                respuestaSesion
            );

        if (
            !respuestaSesion.ok ||
            typeof datosSesion.id !==
                "string"
        ) {
            return res.status(401).json({
                ok: false,

                mensaje:
                    "la sesión venció; iniciá sesión nuevamente"
            });
        }

        const solicitanteId =
            datosSesion.id;

        // ===============================================
        // VERIFICAR ADMIN SUPERIOR
        // ===============================================

        const respuestaSolicitante =
            await fetch(
                supabaseUrl +
                    "/rest/v1/perfiles" +
                    "?id=eq." +
                    encodeURIComponent(
                        solicitanteId
                    ) +
                    "&select=id,rol" +
                    "&limit=1",
                {
                    method:
                        "GET",

                    headers:
                        crearEncabezadosSecretos(
                            claveSecreta
                        )
                }
            );

        const perfilesSolicitante =
            await convertirRespuestaJson(
                respuestaSolicitante
            );

        const perfilSolicitante =
            Array.isArray(
                perfilesSolicitante
            ) &&
            perfilesSolicitante.length > 0
                ? perfilesSolicitante[0]
                : null;

        if (
            !respuestaSolicitante.ok ||
            perfilSolicitante === null
        ) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "no se pudo verificar el administrador"
            });
        }

        if (
            normalizarRol(
                perfilSolicitante.rol
            ) !== "adminsuperior"
        ) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "solo el administrador superior puede resetear contraseñas"
            });
        }

        // ===============================================
        // OBTENER CUENTA OBJETIVO
        // ===============================================

        const cuerpo =
            obtenerCuerpoPeticion(
                req
            );

        const usuarioId =
            normalizarTexto(
                cuerpo.usuarioId
            );

        if (usuarioId === "") {
            return res.status(400).json({
                ok: false,

                mensaje:
                    "cuenta inválida"
            });
        }

        const respuestaObjetivo =
            await fetch(
                supabaseUrl +
                    "/rest/v1/perfiles" +
                    "?id=eq." +
                    encodeURIComponent(
                        usuarioId
                    ) +
                    "&select=id,rol,debe_cambiar_contrasena,contrasena_temporal_expira_en" +
                    "&limit=1",
                {
                    method:
                        "GET",

                    headers:
                        crearEncabezadosSecretos(
                            claveSecreta
                        )
                }
            );

        const perfilesObjetivo =
            await convertirRespuestaJson(
                respuestaObjetivo
            );

        const perfilObjetivo =
            Array.isArray(
                perfilesObjetivo
            ) &&
            perfilesObjetivo.length > 0
                ? perfilesObjetivo[0]
                : null;

        if (
            !respuestaObjetivo.ok ||
            perfilObjetivo === null
        ) {
            return res.status(404).json({
                ok: false,

                mensaje:
                    "la cuenta no fue encontrada"
            });
        }

        const rolObjetivo =
            normalizarRol(
                perfilObjetivo.rol
            );

        const rolPermitido =
            rolObjetivo === "titular" ||
            rolObjetivo === "admin" ||
            rolObjetivo ===
                "operadorvales" ||
            (
                rolObjetivo ===
                    "adminsuperior" &&
                usuarioId ===
                    solicitanteId
            );

        if (!rolPermitido) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "no se puede resetear esa cuenta"
            });
        }

        // ===============================================
        // GUARDAR VENCIMIENTO DE DOS MINUTOS
        // ===============================================

        const fechaExpiracion =
            new Date(
                Date.now() +
                DURACION_CONTRASENA_TEMPORAL
            ).toISOString();

        const estadoAnterior = {
            debeCambiarContrasena:
                perfilObjetivo
                    .debe_cambiar_contrasena ===
                true,

            expiracion:
                perfilObjetivo
                    .contrasena_temporal_expira_en ||
                null
        };

        const encabezadosPerfil =
            crearEncabezadosSecretos(
                claveSecreta,
                true
            );

        encabezadosPerfil.Prefer =
            "return=representation";

        const respuestaPerfil =
            await fetch(
                supabaseUrl +
                    "/rest/v1/perfiles" +
                    "?id=eq." +
                    encodeURIComponent(
                        usuarioId
                    ) +
                    "&select=id,debe_cambiar_contrasena,contrasena_temporal_expira_en",
                {
                    method:
                        "PATCH",

                    headers:
                        encabezadosPerfil,

                    body:
                        JSON.stringify({
                            debe_cambiar_contrasena:
                                true,

                            contrasena_temporal_expira_en:
                                fechaExpiracion
                        })
                }
            );

        const datosPerfil =
            await convertirRespuestaJson(
                respuestaPerfil
            );

        if (
            !respuestaPerfil.ok ||
            !Array.isArray(
                datosPerfil
            ) ||
            datosPerfil.length === 0
        ) {
            console.error(
                "Error al preparar contraseña temporal:",
                respuestaPerfil.status,
                datosPerfil
            );

            return res.status(500).json({
                ok: false,

                mensaje:
                    "no se pudo preparar el reseteo"
            });
        }

        // ===============================================
        // CAMBIAR CONTRASEÑA REAL EN SUPABASE AUTH
        // ===============================================

        const respuestaAuth =
            await fetch(
                supabaseUrl +
                    "/auth/v1/admin/users/" +
                    encodeURIComponent(
                        usuarioId
                    ),
                {
                    method:
                        "PUT",

                    headers:
                        crearEncabezadosSecretos(
                            claveSecreta,
                            true
                        ),

                    body:
                        JSON.stringify({
                            password:
                                CONTRASENA_TEMPORAL
                        })
                }
            );

        const datosAuth =
            await convertirRespuestaJson(
                respuestaAuth
            );

        if (!respuestaAuth.ok) {
            console.error(
                "Error al resetear contraseña:",
                respuestaAuth.status,
                datosAuth
            );

            await restaurarEstadoPerfil(
                supabaseUrl,
                claveSecreta,
                usuarioId,
                estadoAnterior
            );

            return res.status(500).json({
                ok: false,

                mensaje:
                    datosAuth.message ||
                    datosAuth.msg ||
                    "no se pudo resetear la contraseña"
            });
        }

        return res.status(200).json({
            ok: true,

            mensaje:
                "contraseña reseteada a cambio321 por 2 minutos",

            expiraEn:
                fechaExpiracion
        });
    } catch (error) {
        console.error(
            "Error inesperado al resetear contraseña:",
            error
        );

        return res.status(500).json({
            ok: false,

            mensaje:
                "error interno del servidor"
        });
    }
}