/* =======================================================
   MANTENIMIENTO DE ACTIVIDAD EN SUPABASE
======================================================= */

function normalizarTexto(valor) {
    if (typeof valor !== "string") {
        return "";
    }

    return valor.trim();
}

export default async function handler(
    req,
    res
) {
    if (req.method !== "GET") {
        res.setHeader(
            "Allow",
            "GET"
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

    const claveSupabase =
        normalizarTexto(
            process.env.SUPABASE_SECRET_KEY
        );

    const cronSecret =
        normalizarTexto(
            process.env.CRON_SECRET
        );

    const autorizacion =
        normalizarTexto(
            req.headers.authorization
        );

    if (
        supabaseUrl === "" ||
        claveSupabase === "" ||
        cronSecret === ""
    ) {
        return res.status(500).json({
            ok: false,
            mensaje:
                "faltan variables de entorno"
        });
    }

    if (
        autorizacion !==
        "Bearer " + cronSecret
    ) {
        return res.status(401).json({
            ok: false,
            mensaje:
                "acceso no autorizado"
        });
    }

    const encabezados = {
        apikey:
            claveSupabase,

        Accept:
            "application/json"
    };

    if (
        !claveSupabase.startsWith(
            "sb_secret_"
        )
    ) {
        encabezados.Authorization =
            "Bearer " +
            claveSupabase;
    }

    try {
        const respuesta =
            await fetch(
                supabaseUrl +
                    "/rest/v1/perfiles" +
                    "?select=id" +
                    "&limit=1",
                {
                    method:
                        "GET",

                    headers:
                        encabezados
                }
            );

        if (!respuesta.ok) {
            const detalle =
                await respuesta.text();

            console.error(
                "Error de mantenimiento Supabase:",
                respuesta.status,
                detalle
            );

            return res.status(500).json({
                ok: false,
                mensaje:
                    "Supabase no respondió correctamente"
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje:
                "actividad de Supabase registrada",
            fecha:
                new Date().toISOString()
        });
    } catch (error) {
        console.error(
            "Error al consultar Supabase:",
            error
        );

        return res.status(500).json({
            ok: false,
            mensaje:
                "no se pudo conectar con Supabase"
        });
    }
}