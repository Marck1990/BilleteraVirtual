/* =======================================================
   ARCHIVO: api/usuarios/eliminar-cuenta.js
   ELIMINACIÓN SEGURA DE CUENTAS
======================================================= */

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

function esUuid(valor) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        .test(valor);
}

function obtenerCuerpoPeticion(req) {
    if (
        req.body !== null &&
        typeof req.body === "object"
    ) {
        return req.body;
    }

    if (typeof req.body === "string") {
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

    // ===================================================
    // CONFIGURACIÓN
    // ===================================================

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

    // ===================================================
    // TOKEN DEL SOLICITANTE
    // ===================================================

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

    const cuerpo =
        obtenerCuerpoPeticion(
            req
        );

    const usuarioId =
        normalizarTexto(
            cuerpo.usuarioId
        );

    if (!esUuid(usuarioId)) {
        return res.status(400).json({
            ok: false,

            mensaje:
                "identificador de cuenta inválido"
        });
    }

    try {
        // ===================================================
        // VERIFICAR SESIÓN
        // ===================================================

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
                "string" ||
            datosSesion.id === ""
        ) {
            return res.status(401).json({
                ok: false,

                mensaje:
                    "la sesión venció; iniciá sesión nuevamente"
            });
        }

        const solicitanteId =
            datosSesion.id;

        // ===================================================
        // CONSULTAR PERFIL DEL SOLICITANTE
        // ===================================================

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
                        crearEncabezadosUsuario(
                            claveSecreta,
                            tokenUsuario
                        )
                }
            );

        const perfilesSolicitante =
            await convertirRespuestaJson(
                respuestaSolicitante
            );

        if (!respuestaSolicitante.ok) {
            console.error(
                "Error al verificar solicitante:",
                respuestaSolicitante.status,
                perfilesSolicitante
            );

            return res.status(500).json({
                ok: false,

                mensaje:
                    "no se pudo verificar el perfil"
            });
        }

        const perfilSolicitante =
            Array.isArray(
                perfilesSolicitante
            ) &&
            perfilesSolicitante.length > 0
                ? perfilesSolicitante[0]
                : null;

        if (perfilSolicitante === null) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "perfil no autorizado"
            });
        }

        const rolSolicitante =
            normalizarRol(
                perfilSolicitante.rol
            );

        // ===================================================
        // CONSULTAR CUENTA A ELIMINAR
        // ===================================================

        const respuestaObjetivo =
            await fetch(
                supabaseUrl +
                    "/rest/v1/perfiles" +
                    "?id=eq." +
                    encodeURIComponent(
                        usuarioId
                    ) +
                    "&select=id,usuario,nombre,rol" +
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

        if (!respuestaObjetivo.ok) {
            console.error(
                "Error al consultar cuenta:",
                respuestaObjetivo.status,
                perfilesObjetivo
            );

            return res.status(500).json({
                ok: false,

                mensaje:
                    "no se pudo verificar la cuenta"
            });
        }

        const perfilObjetivo =
            Array.isArray(
                perfilesObjetivo
            ) &&
            perfilesObjetivo.length > 0
                ? perfilesObjetivo[0]
                : null;

        if (perfilObjetivo === null) {
            return res.status(404).json({
                ok: false,

                mensaje:
                    "la cuenta no existe"
            });
        }

        const rolObjetivo =
            normalizarRol(
                perfilObjetivo.rol
            );

        // ===================================================
        // VALIDAR PERMISOS
        // ===================================================

        if (solicitanteId === usuarioId) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "no podés eliminar tu propia cuenta"
            });
        }

        if (
            rolObjetivo ===
            "adminsuperior"
        ) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "no se puede eliminar un administrador superior"
            });
        }

        const esAdminComun =
            rolSolicitante ===
                "admin";
          
        const esAdminSuperior =
            rolSolicitante ===
            "adminsuperior";

        if (
            !esAdminComun &&
            !esAdminSuperior
        ) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "no tenés permiso para eliminar cuentas"
            });
        }

        if (
            esAdminComun &&
            rolObjetivo !==
                "titular"
        ) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "un administrador común solo puede eliminar titulares"
            });
        }

        if (
            esAdminSuperior &&
            rolObjetivo !==
                "titular" &&
            rolObjetivo !==
                "admin" &&
            rolObjetivo !==
                "operadorvales"
        ) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "esa cuenta no puede ser eliminada"
            });
        }

        // ===================================================
        // ELIMINAR CUENTA DE SUPABASE AUTH
        // ===================================================

        const respuestaEliminarAuth =
            await fetch(
                supabaseUrl +
                    "/auth/v1/admin/users/" +
                    encodeURIComponent(
                        usuarioId
                    ),
                {
                    method:
                        "DELETE",

                    headers:
                        crearEncabezadosSecretos(
                            claveSecreta
                        )
                }
            );

        const datosEliminarAuth =
            await convertirRespuestaJson(
                respuestaEliminarAuth
            );

        if (
            !respuestaEliminarAuth.ok &&
            respuestaEliminarAuth.status !==
                404
        ) {
            console.error(
                "Error al eliminar de Auth:",
                respuestaEliminarAuth.status,
                datosEliminarAuth
            );

            return res.status(500).json({
                ok: false,

                mensaje:
                    datosEliminarAuth.message ||
                    datosEliminarAuth.msg ||
                    "no se pudo eliminar la cuenta de acceso"
            });
        }

        // ===================================================
        // LIMPIAR PERFIL SI NO FUE BORRADO POR CASCADA
        // ===================================================

        const encabezadosEliminarPerfil =
            crearEncabezadosSecretos(
                claveSecreta
            );

        encabezadosEliminarPerfil.Prefer =
            "return=minimal";

        const respuestaEliminarPerfil =
            await fetch(
                supabaseUrl +
                    "/rest/v1/perfiles" +
                    "?id=eq." +
                    encodeURIComponent(
                        usuarioId
                    ),
                {
                    method:
                        "DELETE",

                    headers:
                        encabezadosEliminarPerfil
                }
            );

        const datosEliminarPerfil =
            await convertirRespuestaJson(
                respuestaEliminarPerfil
            );

        if (!respuestaEliminarPerfil.ok) {
            console.error(
                "Error al limpiar perfil:",
                respuestaEliminarPerfil.status,
                datosEliminarPerfil
            );

            return res.status(500).json({
                ok: false,

                mensaje:
                    "la cuenta de acceso fue eliminada, pero no se pudo limpiar el perfil"
            });
        }

        return res.status(200).json({
            ok: true,

            mensaje:
                "cuenta eliminada correctamente",

            cuenta: {
                id:
                    usuarioId,

                usuario:
                    perfilObjetivo.usuario,

                nombre:
                    perfilObjetivo.nombre,

                rol:
                    perfilObjetivo.rol
            }
        });
    } catch (error) {
        console.error(
            "Error inesperado al eliminar cuenta:",
            error
        );

        return res.status(500).json({
            ok: false,

            mensaje:
                "error interno del servidor"
        });
    }
}