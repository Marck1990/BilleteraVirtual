/* =======================================================
   ARCHIVO: api/admin-superior/validar-codigo.js
   BLOQUE: VALIDACION DEL CODIGO INGRESADO
======================================================= */

export default function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ ok: false });
    }

    const { codigo } = req.body;

    if (codigo === global.codigoAdminSuperior) {

        global.codigoAdminSuperior = null;

        return res.status(200).json({
            ok: true,
            mensaje: "codigo correcto"
        });
    }

    return res.status(401).json({
        ok: false,
        mensaje: "codigo incorrecto"
    });
}