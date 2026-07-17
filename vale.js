// =======================================================
// ESTADOS DEL VALE
// =======================================================

const ESTADOS_VALE = Object.freeze({
    PENDIENTE: "pendiente",
    UTILIZADO: "utilizado",
    VENCIDO: "vencido"
});

let valeActual = null;
let tokenValeActual = null;
let intervaloCuentaRegresiva = null;

// =======================================================
// REFERENCIAS DEL DOM
// =======================================================

const panelError =
    document.querySelector("#panelError");

const mensajeError =
    document.querySelector("#mensajeError");

const contenidoVale =
    document.querySelector("#contenidoVale");

const estadoVale =
    document.querySelector("#estadoVale");

const codigoVale =
    document.querySelector("#codigoVale");

const titularVale =
    document.querySelector("#titularVale");

const fechaCreacionVale =
    document.querySelector("#fechaCreacionVale");

const fechaVencimientoVale =
    document.querySelector("#fechaVencimientoVale");

const bloqueFechaUtilizacion =
    document.querySelector("#bloqueFechaUtilizacion");

const fechaUtilizacionVale =
    document.querySelector("#fechaUtilizacionVale");

const tiempoRestanteVale =
    document.querySelector("#tiempoRestanteVale");

const listaProductosVale =
    document.querySelector("#listaProductosVale");

const totalVale =
    document.querySelector("#totalVale");

const botonMarcarUtilizado =
    document.querySelector("#botonMarcarUtilizado");

const botonActualizarEstado =
    document.querySelector("#botonActualizarEstado");

const mensajeAccionVale =
    document.querySelector("#mensajeAccionVale");

// =======================================================
// FUNCIONES GENERALES
// =======================================================

function mostrarElemento(elemento) {
    if (elemento !== null) {
        elemento.classList.remove("oculto");
    }
}

function ocultarElemento(elemento) {
    if (elemento !== null) {
        elemento.classList.add("oculto");
    }
}

function mostrarError(texto) {
    ocultarElemento(contenidoVale);
    mostrarElemento(panelError);

    if (mensajeError !== null) {
        mensajeError.textContent = texto;
    }
}

function mostrarMensajeAccion(
    texto,
    tipo
) {
    if (mensajeAccionVale === null) {
        return;
    }

    mensajeAccionVale.textContent = texto;

    mensajeAccionVale.className =
        "mensaje-accion mensaje-" + tipo;
}

function limpiarMensajeAccion() {
    if (mensajeAccionVale === null) {
        return;
    }

    mensajeAccionVale.textContent = "";
    mensajeAccionVale.className =
        "mensaje-accion";
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat(
        "es-UY",
        {
            style: "currency",
            currency: "UYU",
            maximumFractionDigits: 0
        }
    ).format(Number(valor));
}

function formatearFecha(fechaTexto) {
    const fecha = new Date(fechaTexto);

    if (Number.isNaN(fecha.getTime())) {
        return "-";
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

function formatearTiempoRestante(
    milisegundos
) {
    if (milisegundos <= 0) {
        return "00:00";
    }

    const segundosTotales =
        Math.floor(
            milisegundos / 1000
        );

    const minutos =
        Math.floor(
            segundosTotales / 60
        );

    const segundos =
        segundosTotales % 60;

    return (
        String(minutos).padStart(2, "0") +
        ":" +
        String(segundos).padStart(2, "0")
    );
}

// =======================================================
// LECTURA DEL TOKEN
// =======================================================

function leerTokenDesdeUrl() {
    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const token =
        parametros.get("token");

    if (
        token === null ||
        token.trim() === ""
    ) {
        return null;
    }

    return token.trim();
}

// =======================================================
// NORMALIZACIÓN DE DATOS DE SUPABASE
// =======================================================

function obtenerPrimerValorValido(
    valores
) {
    for (
        let i = 0;
        i < valores.length;
        i++
    ) {
        if (
            valores[i] !== undefined &&
            valores[i] !== null
        ) {
            return valores[i];
        }
    }

    return null;
}

function normalizarEstado(
    estado,
    fechaVencimiento
) {
    const textoEstado =
        String(
            estado || ""
        ).toLowerCase();

    if (
        textoEstado === "utilizado" ||
        textoEstado === "usado" ||
        textoEstado === "used"
    ) {
        return ESTADOS_VALE.UTILIZADO;
    }

    if (
        textoEstado === "vencido" ||
        textoEstado === "expired"
    ) {
        return ESTADOS_VALE.VENCIDO;
    }

    const vencimiento =
        new Date(
            fechaVencimiento
        ).getTime();

    if (
        !Number.isNaN(vencimiento) &&
        Date.now() >= vencimiento
    ) {
        return ESTADOS_VALE.VENCIDO;
    }

    return ESTADOS_VALE.PENDIENTE;
}

function normalizarProducto(
    producto
) {
    const nombre =
        obtenerPrimerValorValido([
            producto.nombre,
            producto.producto_nombre,
            producto.nombre_producto
        ]);

    const cantidad =
        Number(
            obtenerPrimerValorValido([
                producto.cantidad
            ])
        );

    const precioUnitario =
        Number(
            obtenerPrimerValorValido([
                producto.precioUnitario,
                producto.precio_unitario,
                producto.precio
            ])
        );

    let subtotal =
        Number(
            obtenerPrimerValorValido([
                producto.subtotal
            ])
        );

    if (!Number.isFinite(subtotal)) {
        subtotal =
            cantidad *
            precioUnitario;
    }

    return {
        nombre: String(nombre || ""),
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        subtotal: subtotal
    };
}

function normalizarDatosVale(
    respuesta
) {
    if (
        respuesta === null ||
        typeof respuesta !== "object"
    ) {
        return null;
    }

    let origen = respuesta;

    if (
        respuesta.vale !== null &&
        typeof respuesta.vale === "object"
    ) {
        origen = respuesta.vale;
    }

    const fechaCreacion =
        obtenerPrimerValorValido([
            origen.fechaCreacion,
            origen.creado_en,
            origen.fecha_creacion,
            respuesta.creado_en
        ]);

    const fechaVencimiento =
        obtenerPrimerValorValido([
            origen.fechaVencimiento,
            origen.vence_en,
            origen.fecha_vencimiento,
            respuesta.vence_en
        ]);

    const fechaUtilizacion =
        obtenerPrimerValorValido([
            origen.fechaUtilizacion,
            origen.utilizado_en,
            origen.fecha_utilizacion,
            respuesta.utilizado_en
        ]);

    const productosOriginales =
        obtenerPrimerValorValido([
            origen.productos,
            origen.detalles,
            origen.vale_detalles,
            respuesta.productos,
            respuesta.detalles
        ]);

    const productos = [];

    if (Array.isArray(productosOriginales)) {
        for (
            let i = 0;
            i < productosOriginales.length;
            i++
        ) {
            productos.push(
                normalizarProducto(
                    productosOriginales[i]
                )
            );
        }
    }

    const estadoOriginal =
        obtenerPrimerValorValido([
            origen.estado,
            respuesta.estado
        ]);

    return {
        id: String(
            obtenerPrimerValorValido([
                origen.codigo,
                origen.id,
                respuesta.codigo
            ]) || ""
        ),

        tokenPublico:
            obtenerPrimerValorValido([
                origen.tokenPublico,
                origen.token_publico,
                respuesta.token_publico,
                tokenValeActual
            ]),

        titularNombre: String(
            obtenerPrimerValorValido([
                origen.titularNombre,
                origen.titular_nombre,
                origen.titular,
                respuesta.titular_nombre
            ]) || ""
        ),

        estado:
            normalizarEstado(
                estadoOriginal,
                fechaVencimiento
            ),

        fechaCreacion:
            fechaCreacion,

        fechaVencimiento:
            fechaVencimiento,

        fechaUtilizacion:
            fechaUtilizacion,

        productos:
            productos,

        total:
            Number(
                obtenerPrimerValorValido([
                    origen.total,
                    respuesta.total
                ])
            )
    };
}

// =======================================================
// VALIDACIÓN DEL COMPROBANTE
// =======================================================

function esNumeroValido(valor) {
    return (
        typeof valor === "number" &&
        Number.isFinite(valor) &&
        valor >= 0
    );
}

function validarProductoVale(producto) {
    if (
        producto === null ||
        typeof producto !== "object"
    ) {
        return false;
    }

    if (
        typeof producto.nombre !== "string" ||
        producto.nombre.trim() === ""
    ) {
        return false;
    }

    if (
        !Number.isInteger(
            producto.cantidad
        ) ||
        producto.cantidad < 1
    ) {
        return false;
    }

    if (
        !esNumeroValido(
            producto.precioUnitario
        )
    ) {
        return false;
    }

    if (
        !esNumeroValido(
            producto.subtotal
        )
    ) {
        return false;
    }

    const subtotalCalculado =
        producto.cantidad *
        producto.precioUnitario;

    return (
        Math.abs(
            subtotalCalculado -
            producto.subtotal
        ) < 0.01
    );
}

function validarDatosVale(vale) {
    if (
        vale === null ||
        typeof vale !== "object"
    ) {
        return false;
    }

    if (
        typeof vale.id !== "string" ||
        vale.id.trim() === ""
    ) {
        return false;
    }

    if (
        typeof vale.titularNombre !== "string" ||
        vale.titularNombre.trim() === ""
    ) {
        return false;
    }

    const fechaCreacion =
        new Date(
            vale.fechaCreacion
        );

    const fechaVencimiento =
        new Date(
            vale.fechaVencimiento
        );

    if (
        Number.isNaN(
            fechaCreacion.getTime()
        ) ||
        Number.isNaN(
            fechaVencimiento.getTime()
        )
    ) {
        return false;
    }

    if (
        fechaVencimiento.getTime() <=
        fechaCreacion.getTime()
    ) {
        return false;
    }

    if (!Array.isArray(vale.productos)) {
        return false;
    }

    if (vale.productos.length === 0) {
        return false;
    }

    let totalCalculado = 0;

    for (
        let i = 0;
        i < vale.productos.length;
        i++
    ) {
        if (
            !validarProductoVale(
                vale.productos[i]
            )
        ) {
            return false;
        }

        totalCalculado +=
            vale.productos[i].subtotal;
    }

    if (!esNumeroValido(vale.total)) {
        return false;
    }

    if (
        Math.abs(
            totalCalculado -
            vale.total
        ) >= 0.01
    ) {
        return false;
    }

    return true;
}

// =======================================================
// ESTADO DEL VALE
// =======================================================

function actualizarEstadoValeActual() {
    if (valeActual === null) {
        return;
    }

    if (
        valeActual.estado ===
        ESTADOS_VALE.UTILIZADO
    ) {
        return;
    }

    const vencimiento =
        new Date(
            valeActual.fechaVencimiento
        ).getTime();

    if (
        !Number.isNaN(vencimiento) &&
        Date.now() >= vencimiento
    ) {
        valeActual.estado =
            ESTADOS_VALE.VENCIDO;
    }
}

function obtenerTextoEstado(estado) {
    if (
        estado ===
        ESTADOS_VALE.UTILIZADO
    ) {
        return "UTILIZADO";
    }

    if (
        estado ===
        ESTADOS_VALE.VENCIDO
    ) {
        return "VENCIDO";
    }

    return "PENDIENTE";
}

function aplicarClaseEstado(estado) {
    estadoVale.className =
        "estado-vale";

    if (
        estado ===
        ESTADOS_VALE.UTILIZADO
    ) {
        estadoVale.classList.add(
            "estado-utilizado"
        );
    } else if (
        estado ===
        ESTADOS_VALE.VENCIDO
    ) {
        estadoVale.classList.add(
            "estado-vencido"
        );
    } else {
        estadoVale.classList.add(
            "estado-pendiente"
        );
    }

    estadoVale.textContent =
        obtenerTextoEstado(estado);
}

// =======================================================
// RENDER DEL COMPROBANTE
// =======================================================

function renderizarProductosVale() {
    listaProductosVale.innerHTML = "";

    for (
        let i = 0;
        i < valeActual.productos.length;
        i++
    ) {
        const producto =
            valeActual.productos[i];

        const fila =
            document.createElement("tr");

        const celdaNombre =
            document.createElement("td");

        const celdaCantidad =
            document.createElement("td");

        const celdaPrecio =
            document.createElement("td");

        const celdaSubtotal =
            document.createElement("td");

        celdaNombre.textContent =
            producto.nombre;

        celdaCantidad.textContent =
            producto.cantidad;

        celdaPrecio.textContent =
            formatearMoneda(
                producto.precioUnitario
            );

        celdaSubtotal.textContent =
            formatearMoneda(
                producto.subtotal
            );

        celdaCantidad.className =
            "celda-numero";

        celdaPrecio.className =
            "celda-numero";

        celdaSubtotal.className =
            "celda-numero";

        fila.appendChild(
            celdaNombre
        );

        fila.appendChild(
            celdaCantidad
        );

        fila.appendChild(
            celdaPrecio
        );

        fila.appendChild(
            celdaSubtotal
        );

        listaProductosVale.appendChild(
            fila
        );
    }
}

function actualizarInformacionEstado() {
    actualizarEstadoValeActual();

    aplicarClaseEstado(
        valeActual.estado
    );

    if (
        valeActual.estado ===
        ESTADOS_VALE.UTILIZADO
    ) {
        tiempoRestanteVale.textContent =
            "Vale utilizado";

        botonMarcarUtilizado.disabled =
            true;

        botonMarcarUtilizado.textContent =
            "vale utilizado";

        mostrarElemento(
            bloqueFechaUtilizacion
        );

        fechaUtilizacionVale.textContent =
            formatearFecha(
                valeActual.fechaUtilizacion
            );

        return;
    }

    ocultarElemento(
        bloqueFechaUtilizacion
    );

    if (
        valeActual.estado ===
        ESTADOS_VALE.VENCIDO
    ) {
        tiempoRestanteVale.textContent =
            "Vale vencido";

        botonMarcarUtilizado.disabled =
            true;

        botonMarcarUtilizado.textContent =
            "vale vencido";

        return;
    }

    const tiempoRestante =
        new Date(
            valeActual.fechaVencimiento
        ).getTime() -
        Date.now();

    tiempoRestanteVale.textContent =
        "Tiempo restante: " +
        formatearTiempoRestante(
            tiempoRestante
        );

    botonMarcarUtilizado.disabled =
        false;

    botonMarcarUtilizado.textContent =
        "marcar como utilizado";
}

function renderizarComprobante() {
    ocultarElemento(panelError);
    mostrarElemento(contenidoVale);

    codigoVale.textContent =
        valeActual.id;

    titularVale.textContent =
        valeActual.titularNombre;

    fechaCreacionVale.textContent =
        formatearFecha(
            valeActual.fechaCreacion
        );

    fechaVencimientoVale.textContent =
        formatearFecha(
            valeActual.fechaVencimiento
        );

    totalVale.textContent =
        formatearMoneda(
            valeActual.total
        );

    renderizarProductosVale();
    actualizarInformacionEstado();
}

function iniciarCuentaRegresiva() {
    if (
        intervaloCuentaRegresiva !== null
    ) {
        clearInterval(
            intervaloCuentaRegresiva
        );
    }

    intervaloCuentaRegresiva =
        setInterval(
            actualizarInformacionEstado,
            1000
        );
}

// =======================================================
// CONSULTA A SUPABASE
// =======================================================

async function consultarValeSupabase() {
    if (
        typeof window.valesRepository ===
        "undefined"
    ) {
        return {
            correcto: false,
            mensaje:
                "El servicio de vales no está disponible."
        };
    }

    const resultado =
        await window.valesRepository
            .obtenerVale(
                tokenValeActual
            );

    if (!resultado.correcto) {
        return {
            correcto: false,
            mensaje:
                "No se pudo consultar el vale."
        };
    }

    if (!resultado.existe) {
        return {
            correcto: false,
            mensaje:
                "El vale no existe o el enlace no es válido."
        };
    }

    const valeNormalizado =
        normalizarDatosVale(
            resultado.vale
        );

    if (
        !validarDatosVale(
            valeNormalizado
        )
    ) {
        return {
            correcto: false,
            mensaje:
                "Los datos del comprobante están incompletos."
        };
    }

    return {
        correcto: true,
        vale: valeNormalizado
    };
}

async function cargarValeDesdeSupabase() {
    botonActualizarEstado.disabled =
        true;

    botonMarcarUtilizado.disabled =
        true;

    const resultado =
        await consultarValeSupabase();

    botonActualizarEstado.disabled =
        false;

    if (!resultado.correcto) {
        mostrarError(
            resultado.mensaje
        );

        return false;
    }

    valeActual =
        resultado.vale;

    renderizarComprobante();
    iniciarCuentaRegresiva();

    return true;
}

// =======================================================
// ACCIONES
// =======================================================

function obtenerMensajeResultadoUtilizacion(
    resultado
) {
    if (
        resultado === "no_autenticado"
    ) {
        return "Debés iniciar sesión para utilizar el vale.";
    }

    if (
        resultado === "sin_permiso"
    ) {
        return "Tu usuario no tiene permiso para utilizar vales.";
    }

    if (
        resultado === "vale_no_encontrado"
    ) {
        return "El vale no existe.";
    }

    if (
        resultado === "vale_utilizado" ||
        resultado === "ya_utilizado"
    ) {
        return "El vale ya fue utilizado.";
    }

    if (
        resultado === "vale_vencido"
    ) {
        return "El vale está vencido.";
    }

    return "No se pudo marcar el vale como utilizado.";
}

async function marcarValeComoUtilizado() {
    limpiarMensajeAccion();
    actualizarEstadoValeActual();

    if (
        valeActual === null ||
        valeActual.estado !==
        ESTADOS_VALE.PENDIENTE
    ) {
        actualizarInformacionEstado();
        return;
    }

    const confirmado =
        confirm(
            "¿Confirmás que este vale fue entregado?"
        );

    if (!confirmado) {
        return;
    }

    botonMarcarUtilizado.disabled =
        true;

    botonActualizarEstado.disabled =
        true;

    const resultado =
        await window.valesRepository
            .marcarValeComoUsado(
                tokenValeActual
            );

    botonActualizarEstado.disabled =
        false;

    if (!resultado.correcto) {
        mostrarMensajeAccion(
            obtenerMensajeResultadoUtilizacion(
                resultado.resultado
            ),
            "error"
        );

        actualizarInformacionEstado();
        return;
    }

    await cargarValeDesdeSupabase();

    mostrarMensajeAccion(
        "Vale marcado como utilizado correctamente.",
        "exito"
    );
}

async function actualizarComprobante() {
    limpiarMensajeAccion();

    const actualizado =
        await cargarValeDesdeSupabase();

    if (actualizado) {
        mostrarMensajeAccion(
            "Estado actualizado.",
            "exito"
        );
    }
}

// =======================================================
// INICIO
// =======================================================

async function iniciarVale() {
    tokenValeActual =
        leerTokenDesdeUrl();

    if (tokenValeActual === null) {
        mostrarError(
            "El enlace no contiene el token del vale."
        );

        return;
    }

    await cargarValeDesdeSupabase();
}

botonMarcarUtilizado.addEventListener(
    "click",
    marcarValeComoUtilizado
);

botonActualizarEstado.addEventListener(
    "click",
    actualizarComprobante
);

window.addEventListener(
    "beforeunload",
    function () {
        if (
            intervaloCuentaRegresiva !==
            null
        ) {
            clearInterval(
                intervaloCuentaRegresiva
            );
        }
    }
);

iniciarVale();