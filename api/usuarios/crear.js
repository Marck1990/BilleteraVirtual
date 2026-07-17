/* =======================================================
   ARCHIVO: api/usuarios/crear.js
   BLOQUE: CREACIÓN SEGURA DE TITULARES EN SUPABASE
======================================================= */

const DOMINIO_INTERNO =
    "billetera.test";

function normalizarTexto(valor) {
    if (typeof valor !== "string") {
        return "";
    }

    return valor.trim();
}

function construirCorreoInterno(usuario) {
    return (
        usuario +
        "@" +
        DOMINIO_INTERNO
    );
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
                method: "DELETE",

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
        console.error(
            "Faltan variables de Supabase."
        );

        return res.status(500).json({
            ok: false,
            mensaje:
                "el servidor no está configurado"
        });
    }

    try {
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

        const curso =
            normalizarTexto(
                cuerpo.curso
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
            curso === "" ||
            curso.length > 100
        ) {
            return res.status(400).json({
                ok: false,
                mensaje:
                    "curso inválido"
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
                    method: "POST",

                    headers:
                        encabezadosSupabase,

                    body: JSON.stringify({
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
                                curso,

                            rol:
                                "titular"
                        }
                    })
                }
            );

        const textoAuth =
            await respuestaAuth.text();

        let datosAuth = {};

        try {
            datosAuth =
                JSON.parse(textoAuth);
        } catch (error) {
            datosAuth = {};
        }

        if (!respuestaAuth.ok) {
            console.error(
                "Error de Auth:",
                respuestaAuth.status,
                textoAuth
            );

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
                    "no se pudo crear la cuenta"
            });
        }

        const usuarioId =
            datosAuth.id ||
            datosAuth.user?.id;

        if (!usuarioId) {
            console.error(
                "Auth no devolvió el ID:",
                datosAuth
            );

            return res.status(500).json({
                ok: false,
                mensaje:
                    "respuesta inválida del servidor"
            });
        }

        const respuestaPerfil =
            await fetch(
                supabaseUrl +
                    "/rest/v1/rpc/crear_usuario_billetera",
                {
                    method: "POST",

                    headers:
                        encabezadosSupabase,

                    body: JSON.stringify({
                        p_id:
                            usuarioId,

                        p_usuario:
                            usuario,

                        p_nombre:
                            nombre,

                        p_curso:
                            curso,

                        p_rol:
                            "titular",

                        p_saldo_inicial:
                            0
                    })
                }
            );

        const textoPerfil =
            await respuestaPerfil.text();

        let datosPerfil = {};

        try {
            datosPerfil =
                JSON.parse(
                    textoPerfil
                );
        } catch (error) {
            datosPerfil = {};
        }

        if (
            !respuestaPerfil.ok ||
            datosPerfil.resultado !==
                "creado_correctamente"
        ) {
            console.error(
                "Error al crear perfil:",
                respuestaPerfil.status,
                textoPerfil
            );

            await eliminarUsuarioAuth(
                supabaseUrl,
                claveSecreta,
                usuarioId
            );

            if (
                datosPerfil.resultado ===
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
                    "no se pudo crear la billetera"
            });
        }

        return res.status(201).json({
            ok: true,

            mensaje:
                "usuario creado correctamente",

            usuario: {
                id:
                    usuarioId,

                tipo:
                    "titular",

                usuario:
                    usuario,

                nombre:
                    nombre,

                curso:
                    curso,

                saldo:
                    0,

                bloqueado:
                    false,

                historial:
                    []
            }
        });
    } catch (error) {
        console.error(
            "Error al crear usuario:",
            error
        );

        return res.status(500).json({
            ok: false,
            mensaje:
                "error interno del servidor"
        });
    }
}