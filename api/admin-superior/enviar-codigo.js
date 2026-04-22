/* =======================================================
   ARCHIVO: api/admin-superior/enviar-codigo.js
   BLOQUE: ENVIO DE CODIGO POR EMAILJS
======================================================= */

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            ok: false,
            mensaje: "metodo no permitido"
        });
    }

    try {
        const { usuario } = req.body;

        if (!usuario || usuario.trim() === "") {
            return res.status(400).json({
                ok: false,
                mensaje: "falta el usuario"
            });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        global.codigoAdminSuperior = codigo;

        /* bloque logs iniciales */
        console.log("usuario recibido:", usuario);
        console.log("codigo generado:", codigo);

        const respuestaEmail = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                service_id: "service_srwsovo",
                template_id: "template_iin7u88",
                user_id: "1BU6oQ7MVJSt1f0To",
                template_params: {
                    name: usuario,
                    message: codigo,
                    email: "pirotec50@gmail.com"
                }
            })
        });

        const textoRespuesta = await respuestaEmail.text();

        /* bloque logs respuesta emailjs */
        console.log("status emailjs:", respuestaEmail.status);
        console.log("respuesta emailjs:", textoRespuesta);

        if (!respuestaEmail.ok) {
            return res.status(500).json({
                ok: false,
                mensaje: "emailjs devolvio error",
                detalle: textoRespuesta
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: "codigo enviado correctamente",
            detalle: textoRespuesta
        });

    } catch (error) {

        console.log("error catch:", error.message);

        return res.status(500).json({
            ok: false,
            mensaje: "error al enviar codigo",
            detalle: error.message
        });
    }
}