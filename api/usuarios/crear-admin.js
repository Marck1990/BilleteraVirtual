/* =======================================================
   ARCHIVO: api/usuarios/crear-admin.js
   CREACIÓN SEGURA DE ADMINISTRADORES COMUNES
======================================================= */

const DOMINIO_INTERNO =
    "billetera.test";

const MAXIMO_ADMINISTRADORES =
    3;

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
// ELIMINAR USUARIO DE AUTH SI FALLA EL PERFIL
// =======================================================

async function eliminarUsuarioAuth(
    supabaseUrl,
    claveSecreta,
    usuarioId
) {
    try {
        const respuesta =
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

        if (!respuesta.ok) {
            const datosError =
                await convertirRespuestaJson(
                    respuesta
                );

            console.error(
                "No se pudo revertir el usuario:",
                respuesta.status,
                datosError
            );
        }
    } catch (error) {
        console.error(
            "No se pudo revertir el usuario:",
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

    // ===================================================
    // CONFIGURACIÓN DEL SERVIDOR
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
        console.error(
            "Faltan las variables de entorno de Supabase."
        );

        return res.status(500).json({
            ok: false,

            mensaje:
                "el servidor no está configurado"
        });
    }

    // ===================================================
    // OBTENER TOKEN DEL ADMIN SUPERIOR
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

    try {
        // ===================================================
        // VERIFICAR TOKEN CON SUPABASE AUTH
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
            console.error(
                "Error al verificar sesión:",
                respuestaSesion.status,
                datosSesion
            );

            return res.status(401).json({
                ok: false,

                mensaje:
                    "la sesión venció; iniciá sesión nuevamente"
            });
        }

        const solicitanteId =
            datosSesion.id;

        // ===================================================
        // VERIFICAR PERFIL Y ROL ADMIN SUPERIOR
        // ===================================================

        const urlPerfil =
            supabaseUrl +
            "/rest/v1/perfiles" +
            "?id=eq." +
            encodeURIComponent(
                solicitanteId
            ) +
            "&select=id,usuario,nombre,rol" +
            "&limit=1";

        const respuestaPerfil =
            await fetch(
                urlPerfil,
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

        if (!respuestaPerfil.ok) {
            console.error(
                "Error al consultar perfil:",
                respuestaPerfil.status,
                perfiles
            );

            return res.status(500).json({
                ok: false,

                mensaje:
                    "no se pudo verificar el perfil"
            });
        }

        const perfilSolicitante =
            Array.isArray(perfiles) &&
            perfiles.length > 0
                ? perfiles[0]
                : null;

        if (perfilSolicitante === null) {
            return res.status(403).json({
                ok: false,

                mensaje:
                    "el usuario no tiene un perfil autorizado"
            });
        }

        const rolSolicitante =
            normalizarRol(
                perfilSolicitante.rol
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

        // ===================================================
        // VALIDAR DATOS DEL ADMINISTRADOR NUEVO
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
            contrasena.length < 3 ||
            contrasena.length > 72
        ) {
            return res.status(400).json({
                ok: false,

                mensaje:
                    "la contraseña debe tener entre 3 y 72 caracteres"
            });
        }

        // ===================================================
        // VERIFICAR USUARIO REPETIDO
        // ===================================================

        const respuestaUsuarioExistente =
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

        const usuariosExistentes =
            await convertirRespuestaJson(
                respuestaUsuarioExistente
            );

        if (
            !respuestaUsuarioExistente.ok
        ) {
            console.error(
                "Error al verificar usuario repetido:",
                respuestaUsuarioExistente.status,
                usuariosExistentes
            );

            return res.status(500).json({
                ok: false,

                mensaje:
                    "no se pudo verificar el nombre de usuario"
            });
        }

        if (
            Array.isArray(
                usuariosExistentes
            ) &&
            usuariosExistentes.length > 0
        ) {
            return res.status(409).json({
                ok: false,

                mensaje:
                    "ese nombre de usuario ya existe"
            });
        }

        // ===================================================
        // CONTROLAR CANTIDAD MÁXIMA DE ADMINISTRADORES
        // ===================================================

        const respuestaAdmins =
            await fetch(
                supabaseUrl +
                    "/rest/v1/perfiles" +
                    "?rol=eq.admin" +
                    "&select=id",
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

        const adminsActuales =
            await convertirRespuestaJson(
                respuestaAdmins
            );

        if (!respuestaAdmins.ok) {
            console.error(
                "Error al contar administradores:",
                respuestaAdmins.status,
                adminsActuales
            );

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

        // ===================================================
        // CREAR ADMINISTRADOR EN SUPABASE AUTH
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
                                    "admin",

                                debe_cambiar_contrasena:
                                    true
                            }
                        })
                }
            );

        const datosAuth =
            await convertirRespuestaJson(
                respuestaAuth
            );

        if (!respuestaAuth.ok) {
            console.error(
                "Error al crear usuario en Auth:",
                respuestaAuth.status,
                datosAuth
            );

            const mensajeAuth =
                String(
                    datosAuth.message ||
                    datosAuth.msg ||
                    datosAuth.error_description ||
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
                    datosAuth.message ||
                    "no se pudo crear el administrador"
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
            console.error(
                "Auth no devolvió un ID:",
                datosAuth
            );

            return res.status(500).json({
                ok: false,

                mensaje:
                    "respuesta inválida del servidor"
            });
        }

        // ===================================================
        // CREAR PERFIL Y BILLETERA CON ROL ADMIN
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
            console.error(
                "Error al crear perfil:",
                respuestaCrearPerfil.status,
                datosPerfilCreado
            );

            await eliminarUsuarioAuth(
                supabaseUrl,
                claveSecreta,
                usuarioId
            );

            if (
                datosPerfilCreado.resultado ===
                "usuario_duplicado"
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
                    "no se pudo crear el perfil del administrador"
            });
        }

        // ===================================================
        // MARCAR CONTRASEÑA COMO TEMPORAL
        // ===================================================

        const encabezadosCambioContrasena =
            crearEncabezadosSecretos(
                claveSecreta,
                true
            );

        encabezadosCambioContrasena.Prefer =
            "return=representation";

        const respuestaCambioContrasena =
            await fetch(
                supabaseUrl +
                    "/rest/v1/perfiles" +
                    "?id=eq." +
                    encodeURIComponent(
                        usuarioId
                    ) +
                    "&select=id,debe_cambiar_contrasena",
                {
                    method:
                        "PATCH",

                    headers:
                        encabezadosCambioContrasena,

                    body:
                        JSON.stringify({
                            debe_cambiar_contrasena:
                                true
                        })
                }
            );

        const datosCambioContrasena =
            await convertirRespuestaJson(
                respuestaCambioContrasena
            );

        const perfilActualizado =
            Array.isArray(
                datosCambioContrasena
            ) &&
            datosCambioContrasena
                .length > 0
                ? datosCambioContrasena[0]
                : null;

        if (
            !respuestaCambioContrasena.ok ||
            perfilActualizado === null ||
            perfilActualizado
                .debe_cambiar_contrasena !==
                true
        ) {
            console.error(
                "Error al marcar contraseña temporal:",
                respuestaCambioContrasena.status,
                datosCambioContrasena
            );

            await eliminarUsuarioAuth(
                supabaseUrl,
                claveSecreta,
                usuarioId
            );

            return res.status(500).json({
                ok: false,

                mensaje:
                    "no se pudo configurar la contraseña temporal"
            });
        }

        // ===================================================
        // RESPUESTA CORRECTA
        // ===================================================

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
                    false,

                debeCambiarContrasena:
                    true,

                autenticacion:
                    "supabase"
            }
        });
    } catch (error) {
        console.error(
            "Error inesperado al crear administrador:",
            error
        );

        return res.status(500).json({
            ok: false,

            mensaje:
                "error interno del servidor"
        });
    }
}