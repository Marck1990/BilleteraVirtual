/* =======================================================
   ARCHIVO: api/usuarios/crear-almacenero.js
   CREACIÓN SEGURA DE OPERADORES DE VALES / ALMACENEROS
======================================================= */

const DOMINIO_INTERNO =
    "billetera.test";

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

function construirCorreoInterno(
    usuario
) {
    return (
        usuario +
        "@" +
        DOMINIO_INTERNO
    );
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
    tokenUsuario,
    incluirContenido = false
) {
    const encabezados = {
        apikey:
            claveApi,

        Authorization:
            "Bearer " +
            tokenUsuario,

        Accept:
            "application/json"
    };

    if (incluirContenido) {
        encabezados["Content-Type"] =
            "application/json";
    }

    return encabezados;
}

// =======================================================
// REVERTIR AUTH SI FALLA EL PERFIL
// =======================================================

async function eliminarUsuarioAuth(
    supabaseUrl,
    claveSecreta,
    usuarioId
) {
    try {
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
    } catch (error) {
        console.error(
            "No se pudo revertir el almacenero:",
            error
        );
    }
}

// =======================================================
// CONTROLADOR
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

        // ===================================================
        // COMPROBAR ADMIN SUPERIOR
        // ===================================================

        const solicitanteId =
            datosSesion.id;

        const respuestaPerfil =
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

        const perfiles =
            await convertirRespuestaJson(
                respuestaPerfil
            );

        const perfilSolicitante =
            Array.isArray(perfiles) &&
            perfiles.length > 0
                ? perfiles[0]
                : null;

        if (
            !respuestaPerfil.ok ||
            perfilSolicitante === null
        ) {
            return res.status(403).json({
                ok: false,
                mensaje:
                    "el usuario no tiene un perfil autorizado"
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
                    "solo el administrador superior puede crear almaceneros"
            });
        }

        // ===================================================
        // VALIDAR DATOS
        // ===================================================

        const cuerpo =
            obtenerCuerpoPeticion(
                req
            );

        const usuario =
            normalizarTexto(
                cuerpo.usuario
            ).toLowerCase();

        const nombre =
            normalizarTexto(
                cuerpo.nombre
            );

        const contrasena =
            normalizarTexto(
                cuerpo.contrasena
            );

        if (
            !/^[a-z0-9._-]{3,40}$/
                .test(usuario)
        ) {
            return res.status(400).json({
                ok: false,
                mensaje:
                    "el usuario debe tener entre 3 y 40 caracteres y usar solo letras, números, punto, guion o guion bajo"
            });
        }

        if (
            nombre === "" ||
            nombre.length > 150
        ) {
            return res.status(400).json({
                ok: false,
                mensaje:
                    "nombre inválido"
            });
        }

        if (
            contrasena.length < 6 ||
            contrasena.length > 72
        ) {
            return res.status(400).json({
                ok: false,
                mensaje:
                    "la contraseña debe tener entre 6 y 72 caracteres"
            });
        }

        // ===================================================
        // VERIFICAR USUARIO DUPLICADO
        // ===================================================

        const respuestaExistente =
            await fetch(
                supabaseUrl +
                    "/rest/v1/perfiles" +
                    "?usuario=ilike." +
                    encodeURIComponent(
                        usuario
                    ) +
                    "&select=id" +
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

        const existentes =
            await convertirRespuestaJson(
                respuestaExistente
            );

        if (!respuestaExistente.ok) {
            return res.status(500).json({
                ok: false,
                mensaje:
                    "no se pudo verificar el nombre de usuario"
            });
        }

        if (
            Array.isArray(existentes) &&
            existentes.length > 0
        ) {
            return res.status(409).json({
                ok: false,
                mensaje:
                    "ese nombre de usuario ya existe"
            });
        }

        // ===================================================
        // CREAR USUARIO EN AUTH
        // ===================================================

        const correoInterno =
            construirCorreoInterno(
                usuario
            );

        const respuestaAuth =
            await fetch(
                supabaseUrl +
                    "/auth/v1/admin/users",
                {
                    method:
                        "POST",

                    headers:
                        crearEncabezadosSecretos(
                            claveSecreta,
                            true
                        ),

                    body:
                        JSON.stringify({
                            email:
                                correoInterno,

                            password:
                                contrasena,

                            email_confirm:
                                true,

                            user_metadata: {
                                usuario:
                                    usuario,

                                nombre:
                                    nombre,

                                curso:
                                    "",

                                rol:
                                    "operador_vales",

                                debe_cambiar_contrasena:
                                    false
                            }
                        })
                }
            );

        const datosAuth =
            await convertirRespuestaJson(
                respuestaAuth
            );

        if (!respuestaAuth.ok) {
            const mensajeAuth =
                String(
                    datosAuth.message ||
                    datosAuth.msg ||
                    ""
                ).toLowerCase();

            if (
                respuestaAuth.status ===
                    422 ||
                respuestaAuth.status ===
                    409 ||
                mensajeAuth.includes(
                    "already"
                ) ||
                mensajeAuth.includes(
                    "registered"
                ) ||
                mensajeAuth.includes(
                    "exists"
                )
            ) {
                return res.status(409).json({
                    ok: false,
                    mensaje:
                        "ese nombre de usuario ya existe"
                });
            }

            return res.status(500).json({
                ok: false,
                mensaje:
                    "no se pudo crear el almacenero"
            });
        }

        const usuarioId =
            datosAuth.id ||
            datosAuth.user?.id;

        if (
            typeof usuarioId !==
                "string" ||
            usuarioId === ""
        ) {
            return res.status(500).json({
                ok: false,
                mensaje:
                    "respuesta inválida del servidor"
            });
        }

        // ===================================================
        // CREAR PERFIL operador_vales
        // ===================================================

        const respuestaCrearPerfil =
            await fetch(
                supabaseUrl +
                    "/rest/v1/rpc/crear_usuario_billetera",
                {
                    method:
                        "POST",

                    headers:
                        crearEncabezadosSecretos(
                            claveSecreta,
                            true
                        ),

                    body:
                        JSON.stringify({
                            p_id:
                                usuarioId,

                            p_usuario:
                                usuario,

                            p_nombre:
                                nombre,

                            p_curso:
                                "",

                            p_rol:
                                "operador_vales",

                            p_saldo_inicial:
                                0
                        })
                }
            );

        const datosPerfil =
            await convertirRespuestaJson(
                respuestaCrearPerfil
            );

        if (
            !respuestaCrearPerfil.ok ||
            datosPerfil.resultado !==
                "creado_correctamente"
        ) {
            await eliminarUsuarioAuth(
                supabaseUrl,
                claveSecreta,
                usuarioId
            );

            return res.status(500).json({
                ok: false,
                mensaje:
                    "no se pudo crear el perfil del almacenero"
            });
        }

        // ===================================================
        // RESPUESTA
        // ===================================================

        return res.status(201).json({
            ok: true,

            mensaje:
                "almacenero creado correctamente",

            almacenero: {
                id:
                    usuarioId,

                tipo:
                    "operador_vales",

                usuario:
                    usuario,

                nombre:
                    nombre,

                autenticacion:
                    "supabase"
            }
        });
    } catch (error) {
        console.error(
            "Error inesperado al crear almacenero:",
            error
        );

        return res.status(500).json({
            ok: false,
            mensaje:
                "error interno del servidor"
        });
    }
}