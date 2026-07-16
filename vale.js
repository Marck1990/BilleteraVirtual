// =======================================================
// ESTADOS Y ALMACENAMIENTO
// =======================================================

const ESTADOS_VALE = Object.freeze({
    PENDIENTE: "pendiente",
    UTILIZADO: "utilizado",
    VENCIDO: "vencido"
});

const CLAVE_VALES = "bve_vales_v1";

let valeActual = null;
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

    mensajeError.textContent = texto;
}

function mostrarMensajeAccion(
    texto,
    tipo
) {
    mensajeAccionVale.textContent = texto;

    mensajeAccionVale.className =
        "mensaje-accion mensaje-" + tipo;
}

function limpiarMensajeAccion() {
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
// DECODIFICACIÓN DEL VALE
// =======================================================

function decodificarBase64Url(textoCodificado) {
    try {
        let base64 =
            textoCodificado
                .split("-")
                .join("+")
                .split("_")
                .join("/");

        while (base64.length % 4 !== 0) {
            base64 += "=";
        }

        const binario = atob(base64);

        const bytes =
            new Uint8Array(
                binario.length
            );

        for (
            let i = 0;
            i < binario.length;
            i++
        ) {
            bytes[i] =
                binario.charCodeAt(i);
        }

        return new TextDecoder()
            .decode(bytes);
    } catch (error) {
        console.error(
            "Error al decodificar:",
            error
        );

        return null;
    }
}

function leerDatosDesdeUrl() {
    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const datosCodificados =
        parametros.get("datos");

    if (
        datosCodificados === null ||
        datosCodificados.trim() === ""
    ) {
        return null;
    }

    const texto =
        decodificarBase64Url(
            datosCodificados
        );

    if (texto === null) {
        return null;
    }

    try {
        return JSON.parse(texto);
    } catch (error) {
        console.error(
            "Error al interpretar el vale:",
            error
        );

        return null;
    }
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
// ALMACENAMIENTO LOCAL DEL ESTADO
// =======================================================

function listarValesLocales() {
    try {
        const contenido =
            localStorage.getItem(
                CLAVE_VALES
            );

        if (contenido === null) {
            return [];
        }

        const lista =
            JSON.parse(contenido);

        if (!Array.isArray(lista)) {
            return [];
        }

        return lista;
    } catch (error) {
        console.error(
            "Error al leer los vales locales:",
            error
        );

        return [];
    }
}

function guardarListaValesLocales(lista) {
    try {
        localStorage.setItem(
            CLAVE_VALES,
            JSON.stringify(lista)
        );

        return true;
    } catch (error) {
        console.error(
            "Error al guardar el vale:",
            error
        );

        return false;
    }
}

function buscarValeLocal(idVale) {
    const lista =
        listarValesLocales();

    for (
        let i = 0;
        i < lista.length;
        i++
    ) {
        if (lista[i].id === idVale) {
            return lista[i];
        }
    }

    return null;
}

function guardarValeLocal(vale) {
    const lista =
        listarValesLocales();

    let encontrado = false;

    for (
        let i = 0;
        i < lista.length;
        i++
    ) {
        if (lista[i].id === vale.id) {
            lista[i] = vale;
            encontrado = true;
            break;
        }
    }

    if (!encontrado) {
        lista.push(vale);
    }

    return guardarListaValesLocales(
        lista
    );
}

function combinarEstadoLocal(
    valeUrl,
    valeLocal
) {
    const combinado = {
        ...valeUrl
    };

    combinado.fechaUtilizacion =
        valeUrl.fechaUtilizacion || null;

    if (valeLocal === null) {
        return combinado;
    }

    if (
        valeLocal.estado ===
        ESTADOS_VALE.UTILIZADO
    ) {
        combinado.estado =
            ESTADOS_VALE.UTILIZADO;

        combinado.fechaUtilizacion =
            valeLocal.fechaUtilizacion ||
            combinado.fechaUtilizacion;
    } else if (
        valeLocal.estado ===
        ESTADOS_VALE.VENCIDO
    ) {
        combinado.estado =
            ESTADOS_VALE.VENCIDO;
    }

    return combinado;
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

    if (Date.now() >= vencimiento) {
        valeActual.estado =
            ESTADOS_VALE.VENCIDO;

        guardarValeLocal(
            valeActual
        );
    } else {
        valeActual.estado =
            ESTADOS_VALE.PENDIENTE;
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
// ACCIONES
// =======================================================

function marcarValeComoUtilizado() {
    actualizarEstadoValeActual();

    if (
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

    valeActual.estado =
        ESTADOS_VALE.UTILIZADO;

    valeActual.fechaUtilizacion =
        new Date().toISOString();

    const guardado =
        guardarValeLocal(
            valeActual
        );

    if (!guardado) {
        mostrarMensajeAccion(
            "No se pudo guardar el estado del vale.",
            "error"
        );

        return;
    }

    mostrarMensajeAccion(
        "Vale marcado como utilizado correctamente.",
        "exito"
    );

    actualizarInformacionEstado();
}

function actualizarComprobante() {
    limpiarMensajeAccion();

    const valeLocal =
        buscarValeLocal(
            valeActual.id
        );

    valeActual =
        combinarEstadoLocal(
            valeActual,
            valeLocal
        );

    actualizarInformacionEstado();

    mostrarMensajeAccion(
        "Estado actualizado.",
        "exito"
    );
}

// =======================================================
// INICIO
// =======================================================

function iniciarVale() {
    const datosUrl =
        leerDatosDesdeUrl();

    if (datosUrl === null) {
        mostrarError(
            "El enlace no contiene la información necesaria."
        );

        return;
    }

    if (!validarDatosVale(datosUrl)) {
        mostrarError(
            "Los datos del comprobante están incompletos o fueron modificados."
        );

        return;
    }

    const valeLocal =
        buscarValeLocal(
            datosUrl.id
        );

    valeActual =
        combinarEstadoLocal(
            datosUrl,
            valeLocal
        );

    actualizarEstadoValeActual();

    guardarValeLocal(
        valeActual
    );

    renderizarComprobante();
    iniciarCuentaRegresiva();
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