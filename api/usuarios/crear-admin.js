/* =======================================================
   ARCHIVO: api/usuarios/crear-admin.js
   CREACIÓN SEGURA DE ADMINISTRADORES COMUNES
======================================================= */

const DOMINIO_INTERNO =
    "billetera.test";

const MAXIMO_ADMINISTRADORES =
    3;

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
        .replaceAll("-", "");
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
        return {};
    }
}

async function eliminarUsuarioAuth(
    supabaseUrl,
    claveSecreta,
    usuarioId
) {
    try {
        await fetch(
            supabaseUrl +
                "/auth/v1/admin/users/" +
                usuarioId,
            {
                method:
                    "DELETE",

                headers: {
                    apikey:
                        claveSecreta,

                    Authorization:
                        "Bearer " +
                        claveSecreta
                }
            }
        );
    } catch (error) {
        console.error(
            "No se pudo revertir el usuario:",
            error
        );
    }
}

export default async function handler(
    req,
    res
) {
    if (req.method !== "POST") {
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
                "no autorizado"
        });
    }

    try {
        /* -----------------------------------------------
           VERIFICAR LA SESIÓN DEL SOLICITANTE
        ------------------------------------------------ */

        const respuestaSesion =
            await fetch(
                supabaseUrl +
                    "/auth/v1/user",
                {
                    method:
                        "GET",

                    headers: {
                        apikey:
                            claveSecreta,

                        Authorization:
                            autorizacion
                    }
                }
            );

        const datosSesion =
            await convertirRespuestaJson(
                respuestaSesion
            );

        if (
            !respuestaSesion.ok ||
            !datosSesion.id
        ) {
            return res.status(401).json({
                ok: false,

                mensaje:
                    "sesión inválida"
            });
        }

        /* -----------------------------------------------
           VERIFICAR ROL ADMIN SUPERIOR
        ------------------------------------------------ */

        const respuestaPerfil =
            await fetch(
                supabaseUrl +
                    "/rest/v1/perfiles" +
                    "?id=eq." +
                    encodeURIComponent(
                        datosSesion.id
                    ) +
                    "&select=id,rol" +
                    "&limit=1",
                {
                    method:
                        "GET",

                    headers: {
                        apikey:
                            claveSecreta,

                        Authorization:
                            "Bearer " +
                            claveSecreta
                    }
                }
            );

        const perfiles =
            await convertirRespuestaJson(
                respuestaPerfil
            );

        const perfil =
            Array.isArray(perfiles)
                ? perfiles[0]
                : null;

        if (
            !respuestaPerfil.ok ||
            perfil === null
        ) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "no autorizado"
            });
        }

        const rolSolicitante =
            normalizarRol(
                perfil.rol
            );

        if (
            rolSolicitante !==
            "adminsuperior"
        ) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "solo el administrador superior puede crear administradores"
            });
        }

   

        /* -----------------------------------------------
           VALIDAR DATOS DEL NUEVO ADMIN
        ------------------------------------------------ */

        const cuerpo =
            req.body || {};

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
                    "el usuario debe tener entre 3 y 40 caracteres"
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
            contrasena.length < 3 ||
            contrasena.length > 72
        ) {
            return res.status(400).json({
                ok: false,

                mensaje:
                    "la contraseña debe tener entre 3 y 72 caracteres"
            });
        }

        /* -----------------------------------------------
           CONTROLAR EL LÍMITE DE ADMINISTRADORES
        ------------------------------------------------ */

        const respuestaAdmins =
            await fetch(
                supabaseUrl +
                    "/rest/v1/perfiles" +
                    "?rol=eq.admin" +
                    "&select=id",
                {
                    method:
                        "GET",

                    headers: {
                        apikey:
                            claveSecreta,

                        Authorization:
                            "Bearer " +
                            claveSecreta
                    }
                }
            );

        const adminsActuales =
            await convertirRespuestaJson(
                respuestaAdmins
            );

        if (!respuestaAdmins.ok) {
            return res.status(500).json({
                ok: false,

                mensaje:
                    "no se pudo verificar la cantidad de administradores"
            });
        }

        const cantidadAdmins =
            Array.isArray(
                adminsActuales
            )
                ? adminsActuales.length
                : 0;

        if (
            cantidadAdmins >=
            MAXIMO_ADMINISTRADORES
        ) {
            return res.status(409).json({
                ok: false,

                mensaje:
                    "se alcanzó el máximo de administradores permitidos"
            });
        }

        /* -----------------------------------------------
           CREAR USUARIO EN SUPABASE AUTH
        ------------------------------------------------ */

        const correoInterno =
            construirCorreoInterno(
                usuario
            );

        const encabezadosSupabase = {
            apikey:
                claveSecreta,

            Authorization:
                "Bearer " +
                claveSecreta,

            "Content-Type":
                "application/json"
        };

        const respuestaAuth =
            await fetch(
                supabaseUrl +
                    "/auth/v1/admin/users",
                {
                    method:
                        "POST",

                    headers:
                        encabezadosSupabase,

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

                                rol:
                                    "admin"
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
                mensajeAuth.includes(
                    "already"
                ) ||
                mensajeAuth.includes(
                    "registered"
                )
            ) {
                return res
                    .status(409)
                    .json({
                        ok: false,

                        mensaje:
                            "ese nombre de usuario ya existe"
                    });
            }

            return res.status(500).json({
                ok: false,

                mensaje:
                    datosAuth.message ||
                    "no se pudo crear el administrador"
            });
        }

        const usuarioId =
            datosAuth.id ||
            datosAuth.user?.id;

        if (!usuarioId) {
            return res.status(500).json({
                ok: false,

                mensaje:
                    "respuesta inválida del servidor"
            });
        }

        /* -----------------------------------------------
           CREAR PERFIL CON ROL ADMIN
        ------------------------------------------------ */

        const respuestaCrearPerfil =
            await fetch(
                supabaseUrl +
                    "/rest/v1/rpc/crear_usuario_billetera",
                {
                    method:
                        "POST",

                    headers:
                        encabezadosSupabase,

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
                                "admin",

                            p_saldo_inicial:
                                0
                        })
                }
            );

        const datosPerfilCreado =
            await convertirRespuestaJson(
                respuestaCrearPerfil
            );

        if (
            !respuestaCrearPerfil.ok ||
            datosPerfilCreado.resultado !==
                "creado_correctamente"
        ) {
            await eliminarUsuarioAuth(
                supabaseUrl,
                claveSecreta,
                usuarioId
            );

            if (
                datosPerfilCreado.resultado ===
                "usuario_duplicado"
            ) {
                return res
                    .status(409)
                    .json({
                        ok: false,

                        mensaje:
                            "ese nombre de usuario ya existe"
                    });
            }

            return res.status(500).json({
                ok: false,

                mensaje:
                    "no se pudo crear el perfil del administrador"
            });
        }

        return res.status(201).json({
            ok: true,

            mensaje:
                "administrador creado correctamente",

            administrador: {
                id:
                    usuarioId,

                tipo:
                    "admin",

                usuario:
                    usuario,

                nombre:
                    nombre,

                curso:
                    "",

                saldo:
                    0,

                bloqueado:
                    false
            }
        });
    } catch (error) {
        console.error(
            "Error al crear administrador:",
            error
        );

        return res.status(500).json({
            ok: false,

            mensaje:
                "error interno del servidor"
        });
    }
}