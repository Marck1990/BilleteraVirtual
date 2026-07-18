// =======================================================
// CONFIGURACIÓN DE EMAILJS
// =======================================================

const EMAILJS_SERVICE_ID = "service_5h4pn6h";
const EMAILJS_TEMPLATE_ID = "template_mwaapxi";
const EMAILJS_PUBLIC_KEY = "1BU6oQ7MVJSt1f0To";

if (typeof emailjs !== "undefined") {
    emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY
    });
}

// =======================================================
// DATOS INICIALES
// =======================================================

const USUARIOS_INICIALES = [
    {
        id: 1,
        tipo: "titular",
        usuario: "equipo1",
        nombre: "equipo ganador",
        curso: "1ro 1",
        contrasena: "1234",
        saldo: 500,
        bloqueado: false,
        historial: []
    }
];

const ADMINISTRADORES_INICIALES = [
    {
        id: 1,
        tipo: "admin",
        usuario: "marcosadm",
        nombre: "Marcos",
        contrasena: "1234"
    }
];

const PRODUCTOS_INICIALES = [
    {
        id: 1,
        nombre: "manzana",
        precio: 40
    },
    {
        id: 2,
        nombre: "barra de cereal",
        precio: 55
    },
    {
        id: 3,
        nombre: "yogur",
        precio: 65
    },
    {
        id: 4,
        nombre: "jugo natural",
        precio: 70
    },
    {
        id: 5,
        nombre: "sandwich saludable",
        precio: 120
    }
];

const ESTADOS_VALE = Object.freeze({
    PENDIENTE: "pendiente",
    UTILIZADO: "utilizado",
    VENCIDO: "vencido"
});

const CONFIGURACION_PREDETERMINADA = Object.freeze({
    saldoInicialUsuarios: 0,
    registroPublicoHabilitado: true,

    vales: {
        maximoComprasDiarias: 2,
        vigenciaMinutos: 25,
        maximoValesPendientesPorTitular: 1
    }
});

const CLAVES_ALMACENAMIENTO = Object.freeze({
    USUARIOS: "bve_usuarios_v1",
    ADMINISTRADORES: "bve_administradores_v1",
    PRODUCTOS: "bve_productos_v1",
    VALES: "bve_vales_v1",
    CONFIGURACION: "bve_configuracion_v1",
    SECUENCIAS_VALES: "bve_secuencias_vales_v1"
});

// =======================================================
// ESTADO DE LA APLICACIÓN
// =======================================================

let usuarios = [];
let administradores = [];
let productos = [];

let configuracionSistema =
    crearConfiguracionPredeterminada();

let siguienteIdUsuario = 1;
let siguienteIdAdmin = 1;
let siguienteIdProducto = 1;

let sesion = {
    tipo: "",
    usuarioId: null,
    adminId: null
};

let carrito = [];

let palabraAdminSuperiorActual = "";
let usuarioAdminSuperiorValidado = "";
let codigoAdminSuperiorEnviado = false;

let idValeMostradoActualmente = null;
let intervaloCuentaRegresivaVale = null;

const palabrasValidacion = [
    "campo",
    "escuela",
    "merienda",
    "semilla",
    "arroyo",
    "sendero",
    "huerta",
    "pradera",
    "ceibo",
    "hornero"
];

// =======================================================
// REFERENCIAS DEL DOM
// =======================================================

const pantallaInicio =
    document.querySelector("#pantallaInicio");

const pantallaRegistro =
    document.querySelector("#pantallaRegistro");

const pantallaBilletera =
    document.querySelector("#pantallaBilletera");

const pantallaAdmin =
    document.querySelector("#pantallaAdmin");

const pantallaAdminSuperior =
    document.querySelector("#pantallaAdminSuperior");

// inicio

const inputUsuarioIngreso =
    document.querySelector("#inputUsuarioIngreso");

const inputContrasenaIngreso =
    document.querySelector("#inputContrasenaIngreso");

const botonIngresarSistema =
    document.querySelector("#botonIngresarSistema");

const botonIrRegistro =
    document.querySelector("#botonIrRegistro");

const botonRecuperarAcceso =
    document.querySelector("#botonRecuperarAcceso");

const botonSoporte =
    document.querySelector("#botonSoporte");

const mensajeInicio =
    document.querySelector("#mensajeInicio");

// registro

const selectTipoRegistro =
    document.querySelector("#selectTipoRegistro");

const inputUsuarioRegistro =
    document.querySelector("#inputUsuarioRegistro");

const inputNombreRegistro =
    document.querySelector("#inputNombreRegistro");

const inputCursoRegistro =
    document.querySelector("#inputCursoRegistro");

const inputContrasenaRegistro =
    document.querySelector("#inputContrasenaRegistro");

const bloqueCursoRegistro =
    document.querySelector("#bloqueCursoRegistro");

const bloqueAdminSuperiorCodigo =
    document.querySelector("#bloqueAdminSuperiorCodigo");

const inputCodigoAdminSuperior =
    document.querySelector("#inputCodigoAdminSuperior");

const botonEnviarCodigoAdminSuperior =
    document.querySelector("#botonEnviarCodigoAdminSuperior");

const mensajeAdminSuperiorRegistro =
    document.querySelector("#mensajeAdminSuperiorRegistro");

const botonRegistrarCuenta =
    document.querySelector("#botonRegistrarCuenta");

const botonVolverInicioDesdeRegistro =
    document.querySelector("#botonVolverInicioDesdeRegistro");

const mensajeRegistro =
    document.querySelector("#mensajeRegistro");

// titular

const textoUsuarioActual =
    document.querySelector("#textoUsuarioActual");

const nombreTitular =
    document.querySelector("#nombreTitular");

const cursoTitular =
    document.querySelector("#cursoTitular");

const saldoDisponible =
    document.querySelector("#saldoDisponible");

const estadoTitular =
    document.querySelector("#estadoTitular");

const listaProductos =
    document.querySelector("#listaProductos");

const listaCarrito =
    document.querySelector("#listaCarrito");

const totalCarrito =
    document.querySelector("#totalCarrito");

const botonConfirmarCompra =
    document.querySelector("#botonConfirmarCompra");

const botonVaciarCarrito =
    document.querySelector("#botonVaciarCarrito");

const botonSalirSistema =
    document.querySelector("#botonSalirSistema");

const mensajeCompra =
    document.querySelector("#mensajeCompra");

const listaHistorial =
    document.querySelector("#listaHistorial");

const inputMensajeAyudaAlumno =
    document.querySelector("#inputMensajeAyudaAlumno");

const botonEnviarAyudaAlumno =
    document.querySelector("#botonEnviarAyudaAlumno");

const mensajeAyudaAlumno =
    document.querySelector("#mensajeAyudaAlumno");

// vale y QR

const panelValeGenerado =
    document.querySelector("#panelValeGenerado");

const codigoValeGenerado =
    document.querySelector("#codigoValeGenerado");

const estadoValeGenerado =
    document.querySelector("#estadoValeGenerado");

const tiempoRestanteVale =
    document.querySelector("#tiempoRestanteVale");

const contenedorQrVale =
    document.querySelector("#contenedorQrVale");

const enlaceAbrirComprobanteVale =
    document.querySelector("#enlaceAbrirComprobanteVale");

const botonCerrarValeGenerado =
    document.querySelector("#botonCerrarValeGenerado");

// administrador común

const textoAdminActual =
    document.querySelector("#textoAdminActual");

const botonSalirAdmin =
    document.querySelector("#botonSalirAdmin");

const listaUsuariosAdmin =
    document.querySelector("#listaUsuariosAdmin");

const inputNombreProducto =
    document.querySelector("#inputNombreProducto");

const inputPrecioProducto =
    document.querySelector("#inputPrecioProducto");

const botonAgregarProducto =
    document.querySelector("#botonAgregarProducto");

const listaProductosAdmin =
    document.querySelector("#listaProductosAdmin");

const listaHistorialAdmin =
    document.querySelector("#listaHistorialAdmin");

// administrador superior

const textoAdminSuperiorActual =
    document.querySelector("#textoAdminSuperiorActual");

const botonSalirAdminSuperior =
    document.querySelector("#botonSalirAdminSuperior");

const listaCuentasAdminSuperior =
    document.querySelector("#listaCuentasAdminSuperior");

const mensajeAccionesAdminSuperior =
    document.querySelector("#mensajeAccionesAdminSuperior");

const listaAdministradoresAdminSuperior =
    document.querySelector(
        "#listaAdministradoresAdminSuperior"
    );

const inputSaldoInicialSistema =
    document.querySelector("#inputSaldoInicialSistema");

const botonGuardarSaldoInicialSistema =
    document.querySelector(
        "#botonGuardarSaldoInicialSistema"
    );

const botonAlternarRegistroPublico =
    document.querySelector(
        "#botonAlternarRegistroPublico"
    );

const mensajeAdminSuperiorPanel =
    document.querySelector("#mensajeAdminSuperiorPanel");

const listaHistorialGlobalAdminSuperior =
    document.querySelector(
        "#listaHistorialGlobalAdminSuperior"
    );

const panelEstadisticasAdminSuperior =
    document.querySelector(
        "#panelEstadisticasAdminSuperior"
    );

// configuración de vales

const inputMaximoComprasDiarias =
    document.querySelector("#inputMaximoComprasDiarias");

const inputVigenciaValesMinutos =
    document.querySelector("#inputVigenciaValesMinutos");

const inputMaximoValesPendientes =
    document.querySelector("#inputMaximoValesPendientes");

const botonGuardarConfiguracionVales =
    document.querySelector(
        "#botonGuardarConfiguracionVales"
    );

const resumenConfiguracionVales =
    document.querySelector("#resumenConfiguracionVales");

// =======================================================
// UTILIDADES GENERALES
// =======================================================

function clonarDato(valor) {
    return JSON.parse(
        JSON.stringify(valor)
    );
}

function crearConfiguracionPredeterminada() {
    return clonarDato(
        CONFIGURACION_PREDETERMINADA
    );
}

function escuchar(
    elemento,
    evento,
    funcion
) {
    if (elemento !== null) {
        elemento.addEventListener(
            evento,
            funcion
        );
    }
}

function mostrarPantalla(idPantalla) {
    const pantallas = [
        pantallaInicio,
        pantallaRegistro,
        pantallaBilletera,
        pantallaAdmin,
        pantallaAdminSuperior
    ];

    for (
        let i = 0;
        i < pantallas.length;
        i++
    ) {
        if (pantallas[i] !== null) {
            pantallas[i].classList.add(
                "oculto"
            );
        }
    }

    const pantallaSeleccionada =
        document.querySelector(idPantalla);

    if (pantallaSeleccionada !== null) {
        pantallaSeleccionada.classList.remove(
            "oculto"
        );
    }
}

function mostrarMensaje(
    elemento,
    texto,
    color
) {
    if (elemento === null) {
        return;
    }

    elemento.textContent = texto;
    elemento.style.color = color || "";
}

function limpiarMensaje(elemento) {
    mostrarMensaje(
        elemento,
        "",
        ""
    );
}

function limpiarMensajesPrincipales() {
    limpiarMensaje(mensajeInicio);
    limpiarMensaje(mensajeRegistro);
    limpiarMensaje(mensajeCompra);
    limpiarMensaje(estadoTitular);

    limpiarMensaje(
        mensajeAdminSuperiorRegistro
    );

    limpiarMensaje(
        mensajeAdminSuperiorPanel
    );

    limpiarMensaje(
        mensajeAccionesAdminSuperior
    );

    limpiarMensaje(
        mensajeAyudaAlumno
    );
}

function obtenerFechaActual() {
    return new Date().toLocaleString(
        "es-UY"
    );
}

function formatearMoneda(valor) {
    return (
        "$ " +
        Number(valor).toFixed(0)
    );
}

function obtenerClaveFecha(fecha) {
    const anio = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return "" + anio + mes + dia;
}

function obtenerSiguienteId(lista) {
    let idMayor = 0;

    for (
        let i = 0;
        i < lista.length;
        i++
    ) {
        if (
            Number(lista[i].id) >
            idMayor
        ) {
            idMayor = Number(
                lista[i].id
            );
        }
    }

    return idMayor + 1;
}

// =======================================================
// ADAPTADOR DE ALMACENAMIENTO
// =======================================================

function leerDatoAlmacenado(
    clave,
    valorPredeterminado
) {
    try {
        const contenido =
            localStorage.getItem(clave);

        if (contenido === null) {
            return clonarDato(
                valorPredeterminado
            );
        }

        return JSON.parse(contenido);
    } catch (error) {
        console.error(
            "Error al leer almacenamiento:",
            clave,
            error
        );

        return clonarDato(
            valorPredeterminado
        );
    }
}

function guardarDatoAlmacenado(
    clave,
    valor
) {
    try {
        localStorage.setItem(
            clave,
            JSON.stringify(valor)
        );

        return true;
    } catch (error) {
        console.error(
            "Error al guardar almacenamiento:",
            clave,
            error
        );

        return false;
    }
}

function cargarLista(
    clave,
    datosIniciales
) {
    const datos = leerDatoAlmacenado(
        clave,
        datosIniciales
    );

    if (!Array.isArray(datos)) {
        guardarDatoAlmacenado(
            clave,
            datosIniciales
        );

        return clonarDato(
            datosIniciales
        );
    }

    return datos;
}

function guardarUsuarios(lista) {
    return guardarDatoAlmacenado(
        CLAVES_ALMACENAMIENTO.USUARIOS,
        lista
    );
}

function guardarAdministradores(lista) {
    return guardarDatoAlmacenado(
        CLAVES_ALMACENAMIENTO.ADMINISTRADORES,
        lista
    );
}

function guardarProductos(lista) {
    return guardarDatoAlmacenado(
        CLAVES_ALMACENAMIENTO.PRODUCTOS,
        lista
    );
}

function listarVales() {
    return cargarLista(
        CLAVES_ALMACENAMIENTO.VALES,
        []
    );
}

function guardarListaVales(lista) {
    return guardarDatoAlmacenado(
        CLAVES_ALMACENAMIENTO.VALES,
        lista
    );
}

function obtenerVale(idVale) {
    const vales = listarVales();

    for (
        let i = 0;
        i < vales.length;
        i++
    ) {
        if (vales[i].id === idVale) {
            return vales[i];
        }
    }

    return null;
}

function guardarVale(vale) {
    if (
        vale === null ||
        typeof vale !== "object" ||
        typeof vale.id !== "string" ||
        vale.id.trim() === ""
    ) {
        return false;
    }

    const vales = listarVales();
    let encontrado = false;

    for (
        let i = 0;
        i < vales.length;
        i++
    ) {
        if (vales[i].id === vale.id) {
            vales[i] = vale;
            encontrado = true;
            break;
        }
    }

    if (!encontrado) {
        vales.push(vale);
    }

    return guardarListaVales(vales);
}

function actualizarVale(vale) {
    return guardarVale(vale);
}

function eliminarVale(idVale) {
    const vales = listarVales();

    for (
        let i = 0;
        i < vales.length;
        i++
    ) {
        if (vales[i].id === idVale) {
            vales.splice(i, 1);

            return guardarListaVales(
                vales
            );
        }
    }

    return false;
}

function guardarConfiguracion(
    configuracion
) {
    return guardarDatoAlmacenado(
        CLAVES_ALMACENAMIENTO.CONFIGURACION,
        configuracion
    );
}

function obtenerConfiguracion() {
    const predeterminada =
        crearConfiguracionPredeterminada();

    const guardada =
        leerDatoAlmacenado(
            CLAVES_ALMACENAMIENTO.CONFIGURACION,
            predeterminada
        );

    if (
        guardada === null ||
        typeof guardada !== "object"
    ) {
        return predeterminada;
    }

    const vales =
        guardada.vales || {};

    return {
        saldoInicialUsuarios:
            Number(
                guardada.saldoInicialUsuarios
            ) >= 0
                ? Number(
                    guardada.saldoInicialUsuarios
                )
                : predeterminada
                    .saldoInicialUsuarios,

        registroPublicoHabilitado:
            guardada
                .registroPublicoHabilitado !==
            false,

        vales: {
            maximoComprasDiarias:
                Number(
                    vales.maximoComprasDiarias
                ) > 0
                    ? Math.floor(
                        Number(
                            vales.maximoComprasDiarias
                        )
                    )
                    : predeterminada
                        .vales
                        .maximoComprasDiarias,

            vigenciaMinutos:
                Number(
                    vales.vigenciaMinutos
                ) > 0
                    ? Math.floor(
                        Number(
                            vales.vigenciaMinutos
                        )
                    )
                    : predeterminada
                        .vales
                        .vigenciaMinutos,

            maximoValesPendientesPorTitular:
                Number(
                    vales
                        .maximoValesPendientesPorTitular
                ) > 0
                    ? Math.floor(
                        Number(
                            vales
                                .maximoValesPendientesPorTitular
                        )
                    )
                    : predeterminada
                        .vales
                        .maximoValesPendientesPorTitular
        }
    };
}

function obtenerSiguienteNumeroVale(
    fechaClave
) {
    const secuencias =
        leerDatoAlmacenado(
            CLAVES_ALMACENAMIENTO
                .SECUENCIAS_VALES,
            {}
        );

    let numeroActual = Number(
        secuencias[fechaClave]
    );

    if (
        Number.isNaN(numeroActual) ||
        numeroActual < 0
    ) {
        numeroActual = 0;
    }

    const siguienteNumero =
        numeroActual + 1;

    secuencias[fechaClave] =
        siguienteNumero;

    if (
        !guardarDatoAlmacenado(
            CLAVES_ALMACENAMIENTO
                .SECUENCIAS_VALES,
            secuencias
        )
    ) {
        return null;
    }

    return siguienteNumero;
}

function guardarResultadoCompra(
    vale,
    listaUsuarios
) {
    const valesAnteriores =
        listarVales();

    const usuariosAnteriores =
        leerDatoAlmacenado(
            CLAVES_ALMACENAMIENTO.USUARIOS,
            USUARIOS_INICIALES
        );

    if (!guardarVale(vale)) {
        return false;
    }

    if (!guardarUsuarios(listaUsuarios)) {
        guardarListaVales(
            valesAnteriores
        );

        guardarUsuarios(
            usuariosAnteriores
        );

        return false;
    }

    return true;
}

// =======================================================
// BÚSQUEDAS Y SESIÓN
// =======================================================

function buscarUsuarioPorId(
    idBuscado
) {
    for (
        let i = 0;
        i < usuarios.length;
        i++
    ) {
        if (
            usuarios[i].id ===
            idBuscado
        ) {
            return usuarios[i];
        }
    }

    return null;
}

function buscarUsuarioPorNombreUsuario(
    nombreBuscado
) {
    for (
        let i = 0;
        i < usuarios.length;
        i++
    ) {
        if (
            usuarios[i]
                .usuario
                .toLowerCase() ===
            nombreBuscado.toLowerCase()
        ) {
            return usuarios[i];
        }
    }

    return null;
}

function buscarAdministradorPorId(
    idBuscado
) {
    for (
        let i = 0;
        i < administradores.length;
        i++
    ) {
        if (
            administradores[i].id ===
            idBuscado
        ) {
            return administradores[i];
        }
    }

    return null;
}

function buscarAdministradorPorNombreUsuario(
    nombreBuscado
) {
    for (
        let i = 0;
        i < administradores.length;
        i++
    ) {
        if (
            administradores[i]
                .usuario
                .toLowerCase() ===
            nombreBuscado.toLowerCase()
        ) {
            return administradores[i];
        }
    }

    return null;
}

function buscarProductoPorId(
    idBuscado
) {
    for (
        let i = 0;
        i < productos.length;
        i++
    ) {
        if (
            productos[i].id ===
            idBuscado
        ) {
            return productos[i];
        }
    }

    return null;
}

function existeUsuarioRepetido(
    nombreUsuario
) {
    return (
        buscarUsuarioPorNombreUsuario(
            nombreUsuario
        ) !== null ||
        buscarAdministradorPorNombreUsuario(
            nombreUsuario
        ) !== null
    );
}

function obtenerUsuarioActivo() {
    if (sesion.tipo !== "titular") {
        return null;
    }

    return buscarUsuarioPorId(
        sesion.usuarioId
    );
}

function obtenerAdministradorActivo() {
    if (
        sesion.tipo !== "admin" &&
        sesion.tipo !== "adminSuperior"
    ) {
        return null;
    }

    return buscarAdministradorPorId(
        sesion.adminId
    );
}

function esAdministradorSuperiorPropio(
    origen,
    idCuenta
) {
    return (
        sesion.tipo ===
            "adminSuperior" &&
        origen ===
            "administradores" &&
        sesion.adminId ===
            idCuenta
    );
}

// =======================================================
// HISTORIAL Y CARRITO
// =======================================================

function registrarMovimientoUsuario(
    idUsuario,
    tipo,
    detalle,
    monto,
    saldoResultante
) {
    const usuario =
        buscarUsuarioPorId(idUsuario);

    if (usuario === null) {
        return;
    }

    usuario.historial.unshift({
        tipo: tipo,
        detalle: detalle,
        monto: monto,
        saldoResultante:
            saldoResultante,
        fecha:
            obtenerFechaActual()
    });
}

function calcularTotalCarrito() {
    let total = 0;

    for (
        let i = 0;
        i < carrito.length;
        i++
    ) {
        total += Number(
            carrito[i].precio
        );
    }

    return total;
}

function agruparProductosDelCarrito() {
    const agrupados = [];

    for (
        let i = 0;
        i < carrito.length;
        i++
    ) {
        const producto = carrito[i];
        let encontrado = null;

        for (
            let j = 0;
            j < agrupados.length;
            j++
        ) {
            if (
                agrupados[j].productoId ===
                producto.id
            ) {
                encontrado =
                    agrupados[j];

                break;
            }
        }

        if (encontrado === null) {
            agrupados.push({
                productoId:
                    producto.id,

                nombre:
                    producto.nombre,

                cantidad: 1,

                precioUnitario:
                    producto.precio,

                subtotal:
                    producto.precio
            });
        } else {
            encontrado.cantidad++;

            encontrado.subtotal =
                encontrado.cantidad *
                encontrado.precioUnitario;
        }
    }

    return agrupados;
}

// =======================================================
// MODELO Y REGLAS DE VALES
// =======================================================

function calcularFechaVencimiento(
    fechaCreacion,
    vigenciaMinutos
) {
    const fecha =
        new Date(fechaCreacion);

    fecha.setMinutes(
        fecha.getMinutes() +
        vigenciaMinutos
    );

    return fecha.toISOString();
}

function generarIdVale() {
    const fechaClave =
        obtenerClaveFecha(new Date());

    for (
        let intento = 0;
        intento < 100;
        intento++
    ) {
        const numero =
            obtenerSiguienteNumeroVale(
                fechaClave
            );

        if (numero === null) {
            return null;
        }

        const id =
            "VAL-" +
            fechaClave +
            "-" +
            String(numero).padStart(
                5,
                "0"
            );

        if (obtenerVale(id) === null) {
            return id;
        }
    }

    return null;
}

function crearVale(datosCompra) {
    const fechaCreacion =
        datosCompra.fechaCreacion;

    const vigencia =
        configuracionSistema
            .vales
            .vigenciaMinutos;

    return {
        id:
            datosCompra.id,

        titularId:
            datosCompra.titular.id,

        titularNombre:
            datosCompra.titular.nombre,

        fechaClave:
            obtenerClaveFecha(
                new Date(fechaCreacion)
            ),

        fechaCreacion:
            fechaCreacion,

        fechaVencimiento:
            calcularFechaVencimiento(
                fechaCreacion,
                vigencia
            ),

        fechaUtilizacion:
            null,

        vigenciaMinutosAplicada:
            vigencia,

        estado:
            ESTADOS_VALE.PENDIENTE,

        productos:
            datosCompra.productos,

        total:
            datosCompra.total
    };
}

function actualizarEstadoPorVencimiento(
    vale
) {
    if (
        vale === null ||
        vale.estado !==
            ESTADOS_VALE.PENDIENTE
    ) {
        return false;
    }

    const vencimiento =
        new Date(
            vale.fechaVencimiento
        ).getTime();

    if (
        Number.isNaN(vencimiento) ||
        Date.now() < vencimiento
    ) {
        return false;
    }

    vale.estado =
        ESTADOS_VALE.VENCIDO;

    return true;
}

function actualizarValesVencidos() {
    const vales = listarVales();
    let huboCambios = false;

    for (
        let i = 0;
        i < vales.length;
        i++
    ) {
        if (
            actualizarEstadoPorVencimiento(
                vales[i]
            )
        ) {
            huboCambios = true;
        }
    }

    if (huboCambios) {
        guardarListaVales(vales);
    }
}

function marcarValeComoUsado(
    idVale
) {
    actualizarValesVencidos();

    const vale =
        obtenerVale(idVale);

    if (
        vale === null ||
        vale.estado !==
            ESTADOS_VALE.PENDIENTE
    ) {
        return null;
    }

    vale.estado =
        ESTADOS_VALE.UTILIZADO;

    vale.fechaUtilizacion =
        new Date().toISOString();

    return guardarVale(vale)
        ? vale
        : null;
}

function obtenerValesPendientesDelTitular(
    idTitular
) {
    actualizarValesVencidos();

    const vales = listarVales();
    const pendientes = [];

    for (
        let i = 0;
        i < vales.length;
        i++
    ) {
        if (
            vales[i].titularId ===
                idTitular &&
            vales[i].estado ===
                ESTADOS_VALE.PENDIENTE
        ) {
            pendientes.push(
                vales[i]
            );
        }
    }

    return pendientes;
}

function contarComprasDiariasDelTitular(
    idTitular,
    fechaClave
) {
    const vales = listarVales();
    let cantidad = 0;

    for (
        let i = 0;
        i < vales.length;
        i++
    ) {
        const claveVale =
            vales[i].fechaClave ||
            obtenerClaveFecha(
                new Date(
                    vales[i].fechaCreacion
                )
            );

        if (
            vales[i].titularId ===
                idTitular &&
            claveVale === fechaClave
        ) {
            cantidad++;
        }
    }

    return cantidad;
}

function validarCompraParaVale(
    usuarioActivo
) {
    if (usuarioActivo === null) {
        return {
            valida: false,
            mensaje:
                "no hay un titular activo"
        };
    }

    if (usuarioActivo.bloqueado) {
        return {
            valida: false,
            mensaje:
                "usuario bloqueado: no puede realizar compras"
        };
    }

    if (carrito.length === 0) {
        return {
            valida: false,
            mensaje:
                "no hay productos en el carrito"
        };
    }

    const total =
        calcularTotalCarrito();

    if (total > usuarioActivo.saldo) {
        return {
            valida: false,
            mensaje:
                "saldo insuficiente"
        };
    }

    const comprasHoy =
        contarComprasDiariasDelTitular(
            usuarioActivo.id,
            obtenerClaveFecha(
                new Date()
            )
        );

    if (
        comprasHoy >=
        configuracionSistema
            .vales
            .maximoComprasDiarias
    ) {
        return {
            valida: false,
            mensaje:
                "alcanzaste el máximo de compras permitidas por hoy"
        };
    }

    const pendientes =
        obtenerValesPendientesDelTitular(
            usuarioActivo.id
        );

    if (
        pendientes.length >=
        configuracionSistema
            .vales
            .maximoValesPendientesPorTitular
    ) {
        return {
            valida: false,
            mensaje:
                "ya tenés el máximo de vales pendientes permitidos"
        };
    }

    return {
        valida: true,
        mensaje: "",
        total: total
    };
}






async function sincronizarValesLocalesConSupabase() {
    if (
        typeof window.valesRepository ===
        "undefined"
    ) {
        return false;
    }

    const vales =
        listarVales();

    let huboCambios = false;

    try {
        for (
            let i = 0;
            i < vales.length;
            i++
        ) {
            const vale =
                vales[i];

            if (
                vale.estado !==
                    ESTADOS_VALE.PENDIENTE ||
                typeof vale.tokenPublico !==
                    "string" ||
                vale.tokenPublico.trim() ===
                    ""
            ) {
                continue;
            }

            const resultado =
                await window
                    .valesRepository
                    .obtenerVale(
                        vale.tokenPublico
                    );

            if (
                !resultado.correcto ||
                !resultado.existe ||
                resultado.vale === null
            ) {
                continue;
            }

            let datosRemotos =
                resultado.vale;

            if (
                datosRemotos.vale !== null &&
                typeof datosRemotos.vale ===
                    "object"
            ) {
                datosRemotos =
                    datosRemotos.vale;
            }

            const estadoRemoto =
                String(
                    datosRemotos.estado || ""
                ).toLowerCase();

            if (
                estadoRemoto === "used" ||
                estadoRemoto === "usado" ||
                estadoRemoto === "utilizado"
            ) {
                vale.estado =
                    ESTADOS_VALE.UTILIZADO;

                vale.fechaUtilizacion =
                    datosRemotos.utilizado_en ||
                    datosRemotos.fechaUtilizacion ||
                    vale.fechaUtilizacion ||
                    null;

                huboCambios = true;
            } else if (
                estadoRemoto === "expired" ||
                estadoRemoto === "vencido"
            ) {
                vale.estado =
                    ESTADOS_VALE.VENCIDO;

                huboCambios = true;
            }
        }

        if (huboCambios) {
            guardarListaVales(
                vales
            );
        }

        return true;
    } catch (error) {
        console.error(
            "Error al sincronizar vales:",
            error
        );

        return false;
    }
}














async function procesarCompraConVale() {
    const usuarioActivo =
        obtenerUsuarioActivo();

    await sincronizarValesLocalesConSupabase();

    actualizarValesVencidos();

    const validacion =
        validarCompraParaVale(
            usuarioActivo
        );

    if (!validacion.valida) {
        mostrarMensaje(
            mensajeCompra,
            validacion.mensaje,
            "var(--color-error)"
        );

        return null;
    }

    const idVale =
        generarIdVale();

    if (idVale === null) {
        mostrarMensaje(
            mensajeCompra,
            "no se pudo generar el código del vale",
            "var(--color-error)"
        );

        return null;
    }

    const vale = crearVale({
        id: idVale,
        titular: usuarioActivo,
        fechaCreacion:
            new Date().toISOString(),
        productos:
            agruparProductosDelCarrito(),
        total: validacion.total
    });

    const saldoAnterior =
        usuarioActivo.saldo;

    const historialAnterior =
        clonarDato(
            usuarioActivo.historial
        );

    usuarioActivo.saldo -=
        validacion.total;

    registrarMovimientoUsuario(
        usuarioActivo.id,
        "compra",
        "compra " +
            vale.id +
            " por " +
            formatearMoneda(
                vale.total
            ),
        -vale.total,
        usuarioActivo.saldo
    );

    if (!guardarUsuarios(usuarios)) {
        usuarioActivo.saldo =
            saldoAnterior;

        usuarioActivo.historial =
            historialAnterior;

        mostrarMensaje(
            mensajeCompra,
            "no se pudo guardar el saldo",
            "var(--color-error)"
        );

        return null;
    }

    const resultadoSupabase =
        await window.valesRepository
            .guardarVale(vale);

    if (!resultadoSupabase.correcto) {
        usuarioActivo.saldo =
            saldoAnterior;

        usuarioActivo.historial =
            historialAnterior;

        guardarUsuarios(usuarios);

        mostrarMensaje(
            mensajeCompra,
            "no se pudo guardar el vale en Supabase",
            "var(--color-error)"
        );

        return null;
    }

    const valeGuardado =
        resultadoSupabase.vale;

    guardarVale(valeGuardado);

    carrito = [];

    renderizarTodoTitular();

    mostrarMensaje(
        mensajeCompra,
        "compra aprobada. Vale generado: " +
            valeGuardado.id,
        "var(--color-exito)"
    );

    mostrarValeGenerado(
        valeGuardado
    );

    return valeGuardado;
}
// =======================================================
// GENERACIÓN DEL QR
// =======================================================

function crearDatosPublicosVale(
    vale
) {
    return {
        version: 1,

        id:
            vale.id,

        titularNombre:
            vale.titularNombre,

        fechaCreacion:
            vale.fechaCreacion,

        fechaVencimiento:
            vale.fechaVencimiento,

        vigenciaMinutosAplicada:
            vale.vigenciaMinutosAplicada,

        estado:
            vale.estado,

        productos:
            clonarDato(
                vale.productos
            ),

        total:
            vale.total
    };
}

function codificarDatosVale(datos) {
    try {
        const texto =
            JSON.stringify(datos);

        const bytes =
            new TextEncoder().encode(
                texto
            );

        let binario = "";

        for (
            let i = 0;
            i < bytes.length;
            i++
        ) {
            binario +=
                String.fromCharCode(
                    bytes[i]
                );
        }

        let resultado =
            btoa(binario);

        resultado =
            resultado
                .split("+")
                .join("-");

        resultado =
            resultado
                .split("/")
                .join("_");

        while (
            resultado.endsWith("=")
        ) {
            resultado =
                resultado.slice(
                    0,
                    -1
                );
        }

        return resultado;
    } catch (error) {
        console.error(
            "Error al codificar el vale:",
            error
        );

        return null;
    }
}

function construirUrlComprobante(vale) {
    if (
        vale === null ||
        typeof vale.tokenPublico !== "string" ||
        vale.tokenPublico.trim() === ""
    ) {
        return null;
    }

    const url = new URL(
        "vale.html",
        window.location.href
    );

    url.searchParams.set(
        "token",
        vale.tokenPublico
    );

    return url.toString();
}

function generarCodigoQR(
    urlComprobante
) {
    if (contenedorQrVale === null) {
        return false;
    }

    contenedorQrVale.innerHTML = "";

    if (
        typeof QRCode ===
        "undefined"
    ) {
        contenedorQrVale.textContent =
            "No se pudo cargar el generador QR.";

        return false;
    }

    try {
        new QRCode(
            contenedorQrVale,
            {
                text:
                    urlComprobante,

                width:
                    240,

                height:
                    240,

                correctLevel:
                    QRCode.CorrectLevel.M
            }
        );

        return true;
    } catch (error) {
        console.error(
            "Error al generar el QR:",
            error
        );

        contenedorQrVale.textContent =
            "No se pudo generar el código QR.";

        return false;
    }
}

function obtenerTextoEstadoVale(
    estado
) {
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
        String(minutos).padStart(
            2,
            "0"
        ) +
        ":" +
        String(segundos).padStart(
            2,
            "0"
        )
    );
}

function actualizarPanelValeGenerado() {
    if (
        idValeMostradoActualmente ===
        null
    ) {
        return;
    }

    const vale =
        obtenerVale(
            idValeMostradoActualmente
        );

    if (vale === null) {
        cerrarValeGenerado();
        return;
    }

    if (
        actualizarEstadoPorVencimiento(
            vale
        )
    ) {
        guardarVale(vale);
    }

    if (
        codigoValeGenerado !==
        null
    ) {
        codigoValeGenerado.textContent =
            vale.id;
    }

    if (
        estadoValeGenerado !==
        null
    ) {
        estadoValeGenerado.textContent =
            obtenerTextoEstadoVale(
                vale.estado
            );

        estadoValeGenerado.className =
            "estado-vale estado-vale-" +
            vale.estado;
    }

    if (
        tiempoRestanteVale !==
        null
    ) {
        if (
            vale.estado ===
            ESTADOS_VALE.UTILIZADO
        ) {
            tiempoRestanteVale.textContent =
                "Vale utilizado";
        } else if (
            vale.estado ===
            ESTADOS_VALE.VENCIDO
        ) {
            tiempoRestanteVale.textContent =
                "Vale vencido";
        } else {
            const restante =
                new Date(
                    vale.fechaVencimiento
                ).getTime() -
                Date.now();

            tiempoRestanteVale.textContent =
                "Tiempo restante: " +
                formatearTiempoRestante(
                    restante
                );
        }
    }
}

function iniciarCuentaRegresivaVale() {
    if (
        intervaloCuentaRegresivaVale !==
        null
    ) {
        clearInterval(
            intervaloCuentaRegresivaVale
        );
    }

    actualizarPanelValeGenerado();

    intervaloCuentaRegresivaVale =
        setInterval(
            actualizarPanelValeGenerado,
            1000
        );
}

function mostrarValeGenerado(vale) {
    const url =
        construirUrlComprobante(
            vale
        );

    if (url === null) {
        mostrarMensaje(
            mensajeCompra,
            "el vale se guardó, pero no se pudo crear el comprobante",
            "var(--color-error)"
        );

        return;
    }

    idValeMostradoActualmente =
        vale.id;

    if (
        panelValeGenerado !==
        null
    ) {
        panelValeGenerado.classList.remove(
            "oculto"
        );
    }

    if (
        enlaceAbrirComprobanteVale !==
        null
    ) {
        enlaceAbrirComprobanteVale.href =
            url;
    }

    generarCodigoQR(url);
    iniciarCuentaRegresivaVale();

    if (
        panelValeGenerado !==
        null
    ) {
        panelValeGenerado.scrollIntoView({
            behavior:
                "smooth",

            block:
                "center"
        });
    }
}

function cerrarValeGenerado() {
    idValeMostradoActualmente =
        null;

    if (
        intervaloCuentaRegresivaVale !==
        null
    ) {
        clearInterval(
            intervaloCuentaRegresivaVale
        );

        intervaloCuentaRegresivaVale =
            null;
    }

    if (
        panelValeGenerado !==
        null
    ) {
        panelValeGenerado.classList.add(
            "oculto"
        );
    }

    if (
        contenedorQrVale !==
        null
    ) {
        contenedorQrVale.innerHTML =
            "";
    }

    if (
        enlaceAbrirComprobanteVale !==
        null
    ) {
        enlaceAbrirComprobanteVale
            .removeAttribute(
                "href"
            );
    }
}

// =======================================================
// REGISTRO Y EMAILJS
// =======================================================

function reiniciarValidacionAdminSuperior() {
    palabraAdminSuperiorActual = "";
    usuarioAdminSuperiorValidado = "";
    codigoAdminSuperiorEnviado = false;

    if (
        inputCodigoAdminSuperior !==
        null
    ) {
        inputCodigoAdminSuperior.value =
            "";
    }
}

function generarPalabraValidacion() {
    const posicion =
        Math.floor(
            Math.random() *
            palabrasValidacion.length
        );

    const numero =
        Math.floor(
            Math.random() * 9000
        ) + 1000;

    return (
        palabrasValidacion[posicion] +
        numero
    );
}

function actualizarFormularioRegistro() {
    if (
        selectTipoRegistro ===
        null
    ) {
        return;
    }

    const tipo =
        selectTipoRegistro.value;

    if (
        bloqueCursoRegistro !==
        null
    ) {
        bloqueCursoRegistro
            .classList
            .toggle(
                "oculto",
                tipo !== "titular"
            );
    }

    if (
        bloqueAdminSuperiorCodigo !==
        null
    ) {
        bloqueAdminSuperiorCodigo
            .classList
            .toggle(
                "oculto",
                tipo !== "adminSuperior"
            );
    }

    if (
        tipo !==
        "adminSuperior"
    ) {
        reiniciarValidacionAdminSuperior();

        limpiarMensaje(
            mensajeAdminSuperiorRegistro
        );
    }
}

async function enviarCodigoAdminSuperior() {
    const nombreUsuario =
        inputUsuarioRegistro
            .value
            .trim();

    const nombreVisible =
        inputNombreRegistro
            .value
            .trim();

    if (
        nombreUsuario === "" ||
        nombreVisible === ""
    ) {
        mostrarMensaje(
            mensajeAdminSuperiorRegistro,
            "completá primero usuario y nombre",
            "var(--color-error)"
        );

        return;
    }

    if (
        typeof emailjs ===
        "undefined"
    ) {
        mostrarMensaje(
            mensajeAdminSuperiorRegistro,
            "EmailJS no está cargado correctamente",
            "var(--color-error)"
        );

        return;
    }

    const palabra =
        generarPalabraValidacion();

    try {
        botonEnviarCodigoAdminSuperior.disabled =
            true;

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                usuario:
                    nombreUsuario,

                nombre:
                    nombreVisible,

                palabra:
                    palabra
            }
        );

        palabraAdminSuperiorActual =
            palabra;

        usuarioAdminSuperiorValidado =
            nombreUsuario;

        codigoAdminSuperiorEnviado =
            true;

        mostrarMensaje(
            mensajeAdminSuperiorRegistro,
            "palabra enviada al correo autorizado",
            "var(--color-exito)"
        );
    } catch (error) {
        reiniciarValidacionAdminSuperior();

        mostrarMensaje(
            mensajeAdminSuperiorRegistro,

            error?.text ||
            error?.message ||
            "no se pudo enviar el correo",

            "var(--color-error)"
        );

        console.error(
            "Error de EmailJS:",
            error
        );
    } finally {
        botonEnviarCodigoAdminSuperior.disabled =
            false;
    }
}

function validarPalabraAdminSuperior(
    nombreUsuario,
    palabraIngresada
) {
    return (
        codigoAdminSuperiorEnviado &&

        nombreUsuario
            .trim()
            .toLowerCase() ===
        usuarioAdminSuperiorValidado
            .trim()
            .toLowerCase() &&

        palabraIngresada
            .trim()
            .toLowerCase() ===
        palabraAdminSuperiorActual
            .trim()
            .toLowerCase()
    );
}

async function registrarCuenta() {
    const tipo =
        selectTipoRegistro.value;

    const nombreUsuario =
        inputUsuarioRegistro
            .value
            .trim();

    const nombre =
        inputNombreRegistro
            .value
            .trim();

    const curso =
        inputCursoRegistro
            .value
            .trim();

    const contrasena =
        inputContrasenaRegistro
            .value
            .trim();

    limpiarMensaje(
        mensajeRegistro
    );

    if (
        !configuracionSistema
            .registroPublicoHabilitado
    ) {
        mostrarMensaje(
            mensajeRegistro,
            "el registro público está deshabilitado",
            "var(--color-error)"
        );

        return;
    }

    if (
        nombreUsuario === "" ||
        nombre === "" ||
        contrasena === ""
    ) {
        mostrarMensaje(
            mensajeRegistro,
            "completá los campos obligatorios",
            "var(--color-error)"
        );

        return;
    }

    if (
        existeUsuarioRepetido(
            nombreUsuario
        )
    ) {
        mostrarMensaje(
            mensajeRegistro,
            "ese nombre de usuario ya existe",
            "var(--color-error)"
        );

        return;
    }

    if (tipo === "titular") {
        if (curso === "") {
            mostrarMensaje(
                mensajeRegistro,
                "ingresá curso o grupo",
                "var(--color-error)"
            );

            return;
        }

        if (
            typeof window.usuariosRepository ===
            "undefined"
        ) {
            mostrarMensaje(
                mensajeRegistro,
                "el servicio de usuarios no está disponible",
                "var(--color-error)"
            );

            return;
        }

        botonRegistrarCuenta.disabled =
            true;

        try {
            const resultado =
                await window
                    .usuariosRepository
                    .crearTitular({
                        usuario:
                            nombreUsuario,

                        nombre:
                            nombre,

                        curso:
                            curso,

                        contrasena:
                            contrasena
                    });

            if (!resultado.correcto) {
                mostrarMensaje(
                    mensajeRegistro,
                    resultado.mensaje,
                    "var(--color-error)"
                );

                return;
            }
        } finally {
            botonRegistrarCuenta.disabled =
                false;
        }
    } else if (
        tipo === "admin"
    ) {
        administradores.push({
            id:
                siguienteIdAdmin,

            tipo:
                "admin",

            usuario:
                nombreUsuario,

            nombre:
                nombre,

            contrasena:
                contrasena
        });

        siguienteIdAdmin++;

        guardarAdministradores(
            administradores
        );
    } else if (
        tipo ===
        "adminSuperior"
    ) {
        const palabra =
            inputCodigoAdminSuperior
                .value
                .trim();

        if (
            !validarPalabraAdminSuperior(
                nombreUsuario,
                palabra
            )
        ) {
            mostrarMensaje(
                mensajeRegistro,
                "la palabra ingresada es incorrecta",
                "var(--color-error)"
            );

            return;
        }

        administradores.push({
            id:
                siguienteIdAdmin,

            tipo:
                "adminSuperior",

            usuario:
                nombreUsuario,

            nombre:
                nombre,

            contrasena:
                contrasena
        });

        siguienteIdAdmin++;

        guardarAdministradores(
            administradores
        );

        reiniciarValidacionAdminSuperior();
    }

    inputUsuarioRegistro.value = "";
    inputNombreRegistro.value = "";
    inputCursoRegistro.value = "";
    inputContrasenaRegistro.value = "";

    mostrarMensaje(
        mensajeRegistro,
        "registro guardado correctamente",
        "var(--color-exito)"
    );
}
// =======================================================
// LOGIN Y NAVEGACIÓN
// =======================================================

async function ingresarAlSistema() {
    const nombreUsuario =
        inputUsuarioIngreso
            .value
            .trim();

    const contrasena =
        inputContrasenaIngreso
            .value
            .trim();

    if (
        nombreUsuario === "" ||
        contrasena === ""
    ) {
        mostrarMensaje(
            mensajeInicio,
            "completá usuario y contraseña",
            "var(--color-error)"
        );

        return;
    }

    limpiarMensaje(
        mensajeInicio
    );

    // ===================================================
    // CUENTAS LOCALES ANTIGUAS
    // ===================================================

    if (!nombreUsuario.includes("@")) {
        const adminLocal =
            buscarAdministradorPorNombreUsuario(
                nombreUsuario
            );

        if (
            adminLocal !== null &&
            adminLocal.autenticacion !==
                "supabase"
        ) {
            if (
                adminLocal.contrasena !==
                contrasena
            ) {
                mostrarMensaje(
                    mensajeInicio,
                    "contraseña incorrecta",
                    "var(--color-error)"
                );

                return;
            }

            sesion.tipo =
                adminLocal.tipo;

            sesion.adminId =
                adminLocal.id;

            sesion.usuarioId =
                null;

            sesion.origen =
                "local";

            if (
                adminLocal.tipo ===
                "adminSuperior"
            ) {
                abrirPanelAdminSuperior();
            } else {
                abrirPanelAdmin();
            }

            return;
        }

        const usuarioLocal =
            buscarUsuarioPorNombreUsuario(
                nombreUsuario
            );

        if (
            usuarioLocal !== null &&
            usuarioLocal.autenticacion !==
                "supabase"
        ) {
            if (
                usuarioLocal.contrasena !==
                contrasena
            ) {
                mostrarMensaje(
                    mensajeInicio,
                    "contraseña incorrecta",
                    "var(--color-error)"
                );

                return;
            }

            if (usuarioLocal.bloqueado) {
                mostrarMensaje(
                    mensajeInicio,
                    "usuario bloqueado",
                    "var(--color-error)"
                );

                return;
            }

            sesion.tipo =
                "titular";

            sesion.usuarioId =
                usuarioLocal.id;

            sesion.adminId =
                null;

            sesion.origen =
                "local";

            carrito = [];

            abrirBilletera();

            return;
        }
    }

    // ===================================================
    // CUENTAS DE SUPABASE
    // ===================================================

    if (
        typeof window.usuariosRepository ===
        "undefined"
    ) {
        mostrarMensaje(
            mensajeInicio,
            "el servicio de usuarios no está disponible",
            "var(--color-error)"
        );

        return;
    }

    botonIngresarSistema.disabled =
        true;

    try {
        const resultado =
            await window
                .usuariosRepository
                .iniciarSesion(
                    nombreUsuario,
                    contrasena
                );

        if (!resultado.correcto) {
            mostrarMensaje(
                mensajeInicio,
                resultado.mensaje,
                "var(--color-error)"
            );

            return;
        }

        const usuarioSupabase =
            resultado.usuario;

        if (
            usuarioSupabase === null ||
            typeof usuarioSupabase !==
                "object"
        ) {
            mostrarMensaje(
                mensajeInicio,
                "no se pudo obtener el perfil",
                "var(--color-error)"
            );

            return;
        }

        // ===============================================
        // TITULAR DE SUPABASE
        // ===============================================

        if (
            usuarioSupabase.tipo ===
            "titular"
        ) {
            if (
                usuarioSupabase.bloqueado
            ) {
                await window
                    .usuariosRepository
                    .cerrarSesion();

                mostrarMensaje(
                    mensajeInicio,
                    "usuario bloqueado",
                    "var(--color-error)"
                );

                return;
            }

            const usuarioAplicacion = {
                id:
                    usuarioSupabase.id,

                tipo:
                    "titular",

                usuario:
                    usuarioSupabase.usuario,

                nombre:
                    usuarioSupabase.nombre,

                curso:
                    usuarioSupabase.curso,

                contrasena:
                    "",

                saldo:
                    usuarioSupabase.saldo,

                bloqueado:
                    usuarioSupabase.bloqueado,

                historial:
                    usuarioSupabase.historial,

                autenticacion:
                    "supabase"
            };

            let indiceUsuario = -1;

            for (
                let i = 0;
                i < usuarios.length;
                i++
            ) {
                if (
                    usuarios[i].id ===
                        usuarioAplicacion.id ||
                    usuarios[i].usuario
                        .toLowerCase() ===
                        usuarioAplicacion.usuario
                            .toLowerCase()
                ) {
                    indiceUsuario = i;
                    break;
                }
            }

            if (indiceUsuario === -1) {
                usuarios.push(
                    usuarioAplicacion
                );
            } else {
                usuarios[indiceUsuario] =
                    usuarioAplicacion;
            }

            sesion.tipo =
                "titular";

            sesion.usuarioId =
                usuarioAplicacion.id;

            sesion.adminId =
                null;

            sesion.origen =
                "supabase";

            carrito = [];

            abrirBilletera();

            return;
        }

        // ===============================================
        // ADMINISTRADORES DE SUPABASE
        // ===============================================

        let tipoAdministrador = "";

        if (
            usuarioSupabase.tipo ===
            "admin_superior"
        ) {
            tipoAdministrador =
                "adminSuperior";
        } else if (
            usuarioSupabase.tipo ===
                "admin" ||
            usuarioSupabase.tipo ===
                "operador_vales"
        ) {
            tipoAdministrador =
                "admin";
        }

        if (tipoAdministrador === "") {
            await window
                .usuariosRepository
                .cerrarSesion();

            mostrarMensaje(
                mensajeInicio,
                "la cuenta no tiene permisos",
                "var(--color-error)"
            );

            return;
        }

        let adminAplicacion =
            buscarAdministradorPorNombreUsuario(
                nombreUsuario
            );

        if (adminAplicacion === null) {
            adminAplicacion = {
                id:
                    siguienteIdAdmin,

                tipo:
                    tipoAdministrador,

                usuario:
                    nombreUsuario,

                nombre:
                    usuarioSupabase.nombre,

                contrasena:
                    "",

                autenticacion:
                    "supabase"
            };

            administradores.push(
                adminAplicacion
            );

            siguienteIdAdmin++;
        } else {
            adminAplicacion.tipo =
                tipoAdministrador;

            adminAplicacion.nombre =
                usuarioSupabase.nombre;

            adminAplicacion.autenticacion =
                "supabase";
        }

        sesion.tipo =
            tipoAdministrador;

        sesion.adminId =
            adminAplicacion.id;

        sesion.usuarioId =
            null;

        sesion.origen =
            "supabase";

        if (
            tipoAdministrador ===
            "adminSuperior"
        ) {
            abrirPanelAdminSuperior();
        } else {
            abrirPanelAdmin();
        }
    } catch (error) {
        console.error(
            "Error al ingresar:",
            error
        );

        mostrarMensaje(
            mensajeInicio,
            "no se pudo conectar con Supabase",
            "var(--color-error)"
        );
    } finally {
        botonIngresarSistema.disabled =
            false;
    }
}

function irARegistro() {
    limpiarMensajesPrincipales();
    actualizarFormularioRegistro();

    mostrarPantalla(
        "#pantallaRegistro"
    );
}

function volverAInicio() {
    limpiarMensajesPrincipales();
    reiniciarValidacionAdminSuperior();

    mostrarPantalla(
        "#pantallaInicio"
    );
}

function abrirBilletera() {
    actualizarValesVencidos();
    renderizarTodoTitular();

    mostrarPantalla(
        "#pantallaBilletera"
    );
}



async function cargarUsuariosParaAdministracion() {
    if (
        sesion.origen !== "supabase" ||
        typeof window.usuariosRepository ===
            "undefined"
    ) {
        return true;
    }

    const resultado =
        await window
            .usuariosRepository
            .listarUsuarios();

    if (!resultado.correcto) {
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            resultado.mensaje,
            "var(--color-error)"
        );

        return false;
    }

    const usuariosRemotos =
        resultado.usuarios;

    const usuariosCombinados = [];

    for (
        let i = 0;
        i < usuarios.length;
        i++
    ) {
        let existeEnSupabase = false;

        for (
            let j = 0;
            j < usuariosRemotos.length;
            j++
        ) {
            if (
                usuarios[i].usuario
                    .toLowerCase() ===
                usuariosRemotos[j].usuario
                    .toLowerCase()
            ) {
                existeEnSupabase = true;
                break;
            }
        }

        if (
            usuarios[i].autenticacion !==
                "supabase" &&
            !existeEnSupabase
        ) {
            usuariosCombinados.push(
                usuarios[i]
            );
        }
    }

    for (
        let i = 0;
        i < usuariosRemotos.length;
        i++
    ) {
        usuariosCombinados.push({
            ...usuariosRemotos[i],
            autenticacion:
                "supabase"
        });
    }

    usuarios = usuariosCombinados;

    return true;
}






async function abrirPanelAdmin() {
    await cargarUsuariosParaAdministracion();

    renderizarTodoAdmin();

    mostrarPantalla(
        "#pantallaAdmin"
    );
}

async function abrirPanelAdminSuperior() {
    actualizarValesVencidos();

    await cargarUsuariosParaAdministracion();

    renderizarTodoAdminSuperior();

    mostrarPantalla(
        "#pantallaAdminSuperior"
    );
}






async function salirSistema() {
    if (
        typeof window.supabaseCliente !==
        "undefined"
    ) {
        await window
            .supabaseCliente
            .auth
            .signOut();
    }

    sesion.tipo = "";
    sesion.usuarioId = null;
    sesion.adminId = null;

    carrito = [];

    cerrarValeGenerado();

    inputUsuarioIngreso.value = "";
    inputContrasenaIngreso.value = "";

    limpiarMensajesPrincipales();

    mostrarPantalla(
        "#pantallaInicio"
    );
}

// =======================================================
// RENDER DEL TITULAR
// =======================================================

function renderizarResumenBilletera() {
    const usuario =
        obtenerUsuarioActivo();

    if (usuario === null) {
        return;
    }

    textoUsuarioActual.textContent =
        "¡Hola, " +
        usuario.nombre +
        "!";

    nombreTitular.textContent =
        usuario.nombre;

    cursoTitular.textContent =
        usuario.curso;

    saldoDisponible.textContent =
        formatearMoneda(
            usuario.saldo
        );

    mostrarMensaje(
        estadoTitular,

        usuario.bloqueado
            ? "usuario bloqueado: no puede hacer transacciones"
            : "usuario habilitado para operar",

        usuario.bloqueado
            ? "var(--color-advertencia)"
            : "var(--color-exito)"
    );
}

function renderizarProductos() {
    listaProductos.innerHTML = "";

    if (productos.length === 0) {
        listaProductos.innerHTML =
            '<p class="lista-vacia">no hay productos disponibles</p>';

        return;
    }

    for (
        let i = 0;
        i < productos.length;
        i++
    ) {
        const producto =
            productos[i];

        listaProductos.innerHTML += `
            <div class="producto">

                <p class="producto-nombre">
                    ${producto.nombre}
                </p>

                <p class="producto-precio">
                    ${formatearMoneda(producto.precio)}
                </p>

                <button
                    type="button"
                    class="boton"
                    onclick="agregarProductoAlCarrito(${producto.id})"
                >
                    agregar al carrito
                </button>

            </div>
        `;
    }
}

function renderizarCarrito() {
    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        listaCarrito.innerHTML =
            '<p class="lista-vacia">el carrito está vacío</p>';

        totalCarrito.textContent =
            formatearMoneda(0);

        return;
    }

    for (
        let i = 0;
        i < carrito.length;
        i++
    ) {
        listaCarrito.innerHTML += `
            <div class="item-carrito">

                <p class="carrito-nombre">
                    ${carrito[i].nombre}
                </p>

                <p class="carrito-precio">
                    ${formatearMoneda(carrito[i].precio)}
                </p>

                <button
                    type="button"
                    class="boton boton-secundario"
                    onclick="quitarProductoDelCarrito(${i})"
                >
                    quitar
                </button>

            </div>
        `;
    }

    totalCarrito.textContent =
        formatearMoneda(
            calcularTotalCarrito()
        );
}

function renderizarHistorialTitular() {
    const usuario =
        obtenerUsuarioActivo();

    listaHistorial.innerHTML = "";

    if (
        usuario === null ||
        usuario.historial.length === 0
    ) {
        listaHistorial.innerHTML =
            '<p class="lista-vacia">todavía no hay movimientos registrados</p>';

        return;
    }

    for (
        let i = 0;
        i < usuario.historial.length;
        i++
    ) {
        const movimiento =
            usuario.historial[i];

        listaHistorial.innerHTML += `
            <div class="item-historial">

                <p class="historial-detalle">
                    ${movimiento.detalle}
                </p>

                <p class="historial-monto">
                    tipo:
                    ${movimiento.tipo}
                </p>

                <p class="historial-monto">
                    monto:
                    ${formatearMoneda(movimiento.monto)}
                </p>

                <p class="historial-monto">
                    saldo resultante:
                    ${formatearMoneda(movimiento.saldoResultante)}
                </p>

                <p class="historial-fecha">
                    ${movimiento.fecha}
                </p>

            </div>
        `;
    }
}

function renderizarTodoTitular() {
    renderizarResumenBilletera();
    renderizarProductos();
    renderizarCarrito();
    renderizarHistorialTitular();
}

// =======================================================
// RENDER DEL ADMINISTRADOR
// =======================================================

function renderizarAdministradorActivo() {
    const admin =
        obtenerAdministradorActivo();

    textoAdminActual.textContent =
        admin === null
            ? "sin administrador activo"
            : "administrador activo: " +
              admin.nombre +
              " (" +
              admin.usuario +
              ")";
}

function renderizarUsuariosAdmin() {
    listaUsuariosAdmin.innerHTML = "";

    if (usuarios.length === 0) {
        listaUsuariosAdmin.innerHTML =
            '<p class="lista-vacia">no hay usuarios registrados</p>';

        return;
    }

    for (
        let i = 0;
        i < usuarios.length;
        i++
    ) {
        const usuario =
            usuarios[i];

        listaUsuariosAdmin.innerHTML += `
            <div
                class="item-usuario-admin
                ${usuario.bloqueado ? "usuario-bloqueado" : ""}"
            >

                <p class="usuario-admin-nombre">
                    ${usuario.nombre}
                </p>

                <p class="usuario-admin-dato">
                    usuario:
                    ${usuario.usuario}
                </p>

                <p class="usuario-admin-dato">
                    curso:
                    ${usuario.curso}
                </p>

                <p class="usuario-admin-dato">
                    saldo:
                    ${formatearMoneda(usuario.saldo)}
                </p>

                <p class="usuario-admin-dato">
                    estado:
                    ${usuario.bloqueado ? "bloqueado" : "activo"}
                </p>

                <div class="acciones-usuario-admin">

                    <button
                        class="boton boton-chico"
                        onclick="agregarDineroAUsuario(${usuario.id})"
                    >
                        agregar dinero
                    </button>

                    <button
                        class="boton boton-advertencia boton-chico"
                        onclick="alternarBloqueoUsuario(${usuario.id})"
                    >
                        ${usuario.bloqueado ? "desbloquear usuario" : "bloquear usuario"}
                    </button>

                    <button
                        class="boton boton-peligro boton-chico"
                        onclick="borrarUsuario(${usuario.id})"
                    >
                        borrar usuario
                    </button>

                </div>

            </div>
        `;
    }
}

function renderizarProductosAdmin() {
    listaProductosAdmin.innerHTML = "";

    if (productos.length === 0) {
        listaProductosAdmin.innerHTML =
            '<p class="lista-vacia">no hay productos cargados</p>';

        return;
    }

    for (
        let i = 0;
        i < productos.length;
        i++
    ) {
        const producto =
            productos[i];

        listaProductosAdmin.innerHTML += `
            <div class="item-producto-admin">

                <p class="producto-nombre">
                    ${producto.nombre}
                </p>

                <p class="producto-precio">
                    ${formatearMoneda(producto.precio)}
                </p>

                <button
                    class="boton boton-peligro boton-chico"
                    onclick="quitarProducto(${producto.id})"
                >
                    quitar producto
                </button>

            </div>
        `;
    }
}

function renderizarHistorialEnContenedor(
    contenedor
) {
    if (contenedor === null) {
        return;
    }

    contenedor.innerHTML = "";

    let hayMovimientos = false;

    for (
        let i = 0;
        i < usuarios.length;
        i++
    ) {
        for (
            let j = 0;
            j < usuarios[i].historial.length;
            j++
        ) {
            const movimiento =
                usuarios[i].historial[j];

            hayMovimientos = true;

            contenedor.innerHTML += `
                <div class="item-historial">

                    <p class="historial-detalle">
                        ${usuarios[i].nombre}:
                        ${movimiento.detalle}
                    </p>

                    <p class="historial-monto">
                        tipo:
                        ${movimiento.tipo}
                    </p>

                    <p class="historial-monto">
                        monto:
                        ${formatearMoneda(movimiento.monto)}
                    </p>

                    <p class="historial-monto">
                        saldo resultante:
                        ${formatearMoneda(movimiento.saldoResultante)}
                    </p>

                    <p class="historial-fecha">
                        ${movimiento.fecha}
                    </p>

                </div>
            `;
        }
    }

    if (!hayMovimientos) {
        contenedor.innerHTML =
            '<p class="lista-vacia">todavía no hay movimientos registrados</p>';
    }
}

function renderizarTodoAdmin() {
    renderizarAdministradorActivo();
    renderizarUsuariosAdmin();
    renderizarProductosAdmin();

    renderizarHistorialEnContenedor(
        listaHistorialAdmin
    );
}

// =======================================================
// RENDER DEL ADMIN SUPERIOR
// =======================================================

function renderizarAdminSuperiorActivo() {
    const admin =
        obtenerAdministradorActivo();

    textoAdminSuperiorActual.textContent =
        admin === null
            ? "sin admin superior activo"
            : "admin superior activo: " +
              admin.nombre +
              " (" +
              admin.usuario +
              ")";
}

function obtenerTodasLasCuentasDelSistema() {
    const cuentas = [];

    for (
        let i = 0;
        i < usuarios.length;
        i++
    ) {
        cuentas.push({
            origen:
                "usuarios",

            id:
                usuarios[i].id,

            tipo:
                usuarios[i].tipo,

            usuario:
                usuarios[i].usuario,

            nombre:
                usuarios[i].nombre,

            curso:
                usuarios[i].curso,

            saldo:
                usuarios[i].saldo,

            bloqueado:
                usuarios[i].bloqueado
        });
    }

    for (
        let i = 0;
        i < administradores.length;
        i++
    ) {
        cuentas.push({
            origen:
                "administradores",

            id:
                administradores[i].id,

            tipo:
                administradores[i].tipo,

            usuario:
                administradores[i].usuario,

            nombre:
                administradores[i].nombre,

            curso:
                "-",

            saldo:
                0,

            bloqueado:
                false
        });
    }

    return cuentas;
}

function renderizarCuentasAdminSuperior() {
    const cuentas =
        obtenerTodasLasCuentasDelSistema();

    listaCuentasAdminSuperior.innerHTML =
        "";

    for (
        let i = 0;
        i < cuentas.length;
        i++
    ) {
        const cuenta = cuentas[i];
        let acciones = "";

        if (
            cuenta.tipo ===
            "titular"
        ) {
            acciones = `
                <div class="acciones-usuario-admin">

                    <button
                        class="boton boton-chico"
                        onclick="agregarSaldoDesdeAdminSuperior(${cuenta.id})"
                    >
                        agregar saldo
                    </button>

                    <button
                        class="boton boton-chico"
                        onclick="descontarSaldoDesdeAdminSuperior(${cuenta.id})"
                    >
                        descontar saldo
                    </button>

                    <button
                        class="boton boton-advertencia boton-chico"
                        onclick="alternarBloqueoDesdeAdminSuperior(${cuenta.id})"
                    >
                        ${cuenta.bloqueado ? "desbloquear" : "bloquear"}
                    </button>

                    <button
                        class="boton boton-secundario boton-chico"
                        onclick="resetearContrasenaDesdeAdminSuperior('usuarios', ${cuenta.id})"
                    >
                        resetear contraseña
                    </button>

                    <button
                        class="boton boton-peligro boton-chico"
                        onclick="eliminarCuentaDesdeAdminSuperior('usuarios', ${cuenta.id})"
                    >
                        eliminar cuenta
                    </button>

                </div>
            `;
        } else if (
            cuenta.tipo ===
            "admin"
        ) {
            acciones = `
                <div class="acciones-usuario-admin">

                    <button
                        class="boton boton-secundario boton-chico"
                        onclick="resetearContrasenaDesdeAdminSuperior('administradores', ${cuenta.id})"
                    >
                        resetear contraseña
                    </button>

                    <button
                        class="boton boton-peligro boton-chico"
                        onclick="eliminarCuentaDesdeAdminSuperior('administradores', ${cuenta.id})"
                    >
                        eliminar cuenta
                    </button>

                </div>
            `;
        } else if (
            esAdministradorSuperiorPropio(
                cuenta.origen,
                cuenta.id
            )
        ) {
            acciones = `
                <div class="acciones-usuario-admin">

                    <button
                        class="boton boton-secundario boton-chico"
                        onclick="resetearContrasenaDesdeAdminSuperior('administradores', ${cuenta.id})"
                    >
                        resetear mi contraseña
                    </button>

                </div>
            `;
        } else {
            acciones = `
                <p class="texto-ayuda-panel">
                    otro admin superior protegido
                </p>
            `;
        }

        listaCuentasAdminSuperior.innerHTML += `
            <div class="item-admin-superior">

                <p class="admin-superior-nombre">
                    ${cuenta.nombre}
                </p>

                <p class="admin-superior-dato">
                    tipo:
                    ${cuenta.tipo}
                </p>

                <p class="admin-superior-dato">
                    usuario:
                    ${cuenta.usuario}
                </p>

                <p class="admin-superior-dato">
                    curso:
                    ${cuenta.curso}
                </p>

                <p class="admin-superior-dato">
                    saldo:
                    ${
                        cuenta.tipo === "titular"
                            ? formatearMoneda(cuenta.saldo)
                            : "-"
                    }
                </p>

                <p class="admin-superior-dato">
                    estado:
                    ${
                        cuenta.tipo === "titular" &&
                        cuenta.bloqueado
                            ? "bloqueado"
                            : "activo"
                    }
                </p>

                ${acciones}

            </div>
        `;
    }
}

function renderizarAdministradoresAdminSuperior() {
    listaAdministradoresAdminSuperior.innerHTML =
        "";

    let cantidad = 0;

    for (
        let i = 0;
        i < administradores.length;
        i++
    ) {
        if (
            administradores[i].tipo !==
            "admin"
        ) {
            continue;
        }

        cantidad++;

        const admin =
            administradores[i];

        listaAdministradoresAdminSuperior.innerHTML += `
            <div class="item-admin-superior">

                <p class="admin-superior-nombre">
                    ${admin.nombre}
                </p>

                <p class="admin-superior-dato">
                    usuario:
                    ${admin.usuario}
                </p>

                <p class="admin-superior-dato">
                    tipo:
                    ${admin.tipo}
                </p>

                <div class="acciones-usuario-admin">

                    <button
                        class="boton boton-chico"
                        onclick="resetearContrasenaAdministrador(${admin.id})"
                    >
                        resetear contraseña
                    </button>

                    <button
                        class="boton boton-peligro boton-chico"
                        onclick="borrarAdministradorComun(${admin.id})"
                    >
                        borrar admin
                    </button>

                </div>

            </div>
        `;
    }

    if (cantidad === 0) {
        listaAdministradoresAdminSuperior.innerHTML =
            '<p class="lista-vacia">no hay administradores comunes registrados</p>';
    }
}

function renderizarEstadisticasAdminSuperior() {
    let admins = 0;
    let adminsSuperiores = 0;
    let bloqueados = 0;
    let saldoTotal = 0;

    for (
        let i = 0;
        i < administradores.length;
        i++
    ) {
        if (
            administradores[i].tipo ===
            "admin"
        ) {
            admins++;
        } else if (
            administradores[i].tipo ===
            "adminSuperior"
        ) {
            adminsSuperiores++;
        }
    }

    for (
        let i = 0;
        i < usuarios.length;
        i++
    ) {
        saldoTotal +=
            usuarios[i].saldo;

        if (usuarios[i].bloqueado) {
            bloqueados++;
        }
    }

    panelEstadisticasAdminSuperior.innerHTML = `
        <div class="item-estadistica-admin-superior">
            <p>usuarios registrados</p>
            <p class="estadistica-valor">
                ${usuarios.length}
            </p>
        </div>

        <div class="item-estadistica-admin-superior">
            <p>administradores comunes</p>
            <p class="estadistica-valor">
                ${admins}
            </p>
        </div>

        <div class="item-estadistica-admin-superior">
            <p>admins superiores</p>
            <p class="estadistica-valor">
                ${adminsSuperiores}
            </p>
        </div>

        <div class="item-estadistica-admin-superior">
            <p>usuarios bloqueados</p>
            <p class="estadistica-valor">
                ${bloqueados}
            </p>
        </div>

        <div class="item-estadistica-admin-superior">
            <p>saldo total de usuarios</p>
            <p class="estadistica-valor">
                ${formatearMoneda(saldoTotal)}
            </p>
        </div>
    `;
}

function renderizarConfiguracionValesAdminSuperior() {
    if (
        inputMaximoComprasDiarias !==
        null
    ) {
        inputMaximoComprasDiarias.value =
            configuracionSistema
                .vales
                .maximoComprasDiarias;
    }

    if (
        inputVigenciaValesMinutos !==
        null
    ) {
        inputVigenciaValesMinutos.value =
            configuracionSistema
                .vales
                .vigenciaMinutos;
    }

    if (
        inputMaximoValesPendientes !==
        null
    ) {
        inputMaximoValesPendientes.value =
            configuracionSistema
                .vales
                .maximoValesPendientesPorTitular;
    }

    if (
        resumenConfiguracionVales !==
        null
    ) {
        resumenConfiguracionVales.textContent =
            "Máximo diario: " +
            configuracionSistema
                .vales
                .maximoComprasDiarias +
            " | Vigencia: " +
            configuracionSistema
                .vales
                .vigenciaMinutos +
            " minutos | Vales pendientes: " +
            configuracionSistema
                .vales
                .maximoValesPendientesPorTitular;
    }
}

function renderizarTodoAdminSuperior() {
    renderizarAdminSuperiorActivo();
    renderizarCuentasAdminSuperior();

    renderizarAdministradoresAdminSuperior();

    renderizarHistorialEnContenedor(
        listaHistorialGlobalAdminSuperior
    );

    renderizarEstadisticasAdminSuperior();

    renderizarConfiguracionValesAdminSuperior();
}

// =======================================================
// ACCIONES DEL TITULAR
// =======================================================

function agregarProductoAlCarrito(
    idProducto
) {
    const usuario =
        obtenerUsuarioActivo();

    const producto =
        buscarProductoPorId(
            idProducto
        );

    if (
        usuario === null ||
        producto === null
    ) {
        return;
    }

    if (usuario.bloqueado) {
        mostrarMensaje(
            mensajeCompra,
            "usuario bloqueado: no puede hacer transacciones",
            "var(--color-error)"
        );

        return;
    }

    carrito.push(
        clonarDato(producto)
    );

    limpiarMensaje(
        mensajeCompra
    );

    renderizarCarrito();
}

function quitarProductoDelCarrito(
    indice
) {
    if (
        indice < 0 ||
        indice >= carrito.length
    ) {
        return;
    }

    carrito.splice(
        indice,
        1
    );

    renderizarCarrito();
}

function vaciarCarrito() {
    carrito = [];

    limpiarMensaje(
        mensajeCompra
    );

    renderizarCarrito();
}

function confirmarCompra() {
    procesarCompraConVale();
}

function enviarAyudaAlumno() {
    const texto =
        inputMensajeAyudaAlumno
            .value
            .trim();

    if (texto === "") {
        mostrarMensaje(
            mensajeAyudaAlumno,
            "escribí un mensaje antes de enviarlo",
            "var(--color-error)"
        );

        return;
    }

    inputMensajeAyudaAlumno.value =
        "";

    mostrarMensaje(
        mensajeAyudaAlumno,
        "mensaje enviado al administrador",
        "var(--color-exito)"
    );
}

// =======================================================
// ACCIONES DEL ADMINISTRADOR
// =======================================================

function agregarDineroAUsuario(
    idUsuario
) {
    const usuario =
        buscarUsuarioPorId(
            idUsuario
        );

    const texto = prompt(
        "ingresá el monto a agregar"
    );

    if (
        usuario === null ||
        texto === null
    ) {
        return;
    }

    const monto =
        Number(texto);

    if (
        Number.isNaN(monto) ||
        monto <= 0
    ) {
        return;
    }

    usuario.saldo += monto;

    registrarMovimientoUsuario(
        usuario.id,

        "agregar_saldo",

        "el administrador agregó saldo por " +
            formatearMoneda(monto),

        monto,

        usuario.saldo
    );

    guardarUsuarios(usuarios);

    renderizarTodoAdmin();
}

function alternarBloqueoUsuario(
    idUsuario
) {
    const usuario =
        buscarUsuarioPorId(
            idUsuario
        );

    if (usuario === null) {
        return;
    }

    usuario.bloqueado =
        !usuario.bloqueado;

    registrarMovimientoUsuario(
        usuario.id,

        usuario.bloqueado
            ? "bloqueo_usuario"
            : "desbloqueo_usuario",

        usuario.bloqueado
            ? "el administrador bloqueó el usuario"
            : "el administrador desbloqueó el usuario",

        0,

        usuario.saldo
    );

    guardarUsuarios(usuarios);

    renderizarTodoAdmin();
}

function borrarUsuario(
    idUsuario
) {
    for (
        let i = 0;
        i < usuarios.length;
        i++
    ) {
        if (
            usuarios[i].id ===
            idUsuario
        ) {
            usuarios.splice(
                i,
                1
            );

            break;
        }
    }

    guardarUsuarios(usuarios);

    renderizarTodoAdmin();
}

function agregarProducto() {
    const nombre =
        inputNombreProducto
            .value
            .trim();

    const precio =
        Number(
            inputPrecioProducto.value
        );

    if (
        nombre === "" ||
        Number.isNaN(precio) ||
        precio <= 0
    ) {
        return;
    }

    productos.push({
        id:
            siguienteIdProducto,

        nombre:
            nombre,

        precio:
            precio
    });

    siguienteIdProducto++;

    guardarProductos(
        productos
    );

    inputNombreProducto.value =
        "";

    inputPrecioProducto.value =
        "";

    renderizarTodoAdmin();
}

function quitarProducto(
    idProducto
) {
    for (
        let i = 0;
        i < productos.length;
        i++
    ) {
        if (
            productos[i].id ===
            idProducto
        ) {
            productos.splice(
                i,
                1
            );

            break;
        }
    }

    guardarProductos(
        productos
    );

    renderizarTodoAdmin();
}

// =======================================================
// ACCIONES DEL ADMIN SUPERIOR
// =======================================================

function guardarSaldoInicialSistema() {
    const monto =
        Number(
            inputSaldoInicialSistema.value
        );

    if (
        Number.isNaN(monto) ||
        monto < 0
    ) {
        mostrarMensaje(
            mensajeAdminSuperiorPanel,
            "ingresá un saldo inicial válido",
            "var(--color-error)"
        );

        return;
    }

    configuracionSistema
        .saldoInicialUsuarios =
        monto;

    if (
        !guardarConfiguracion(
            configuracionSistema
        )
    ) {
        mostrarMensaje(
            mensajeAdminSuperiorPanel,
            "no se pudo guardar la configuración",
            "var(--color-error)"
        );

        return;
    }

    inputSaldoInicialSistema.value =
        "";

    mostrarMensaje(
        mensajeAdminSuperiorPanel,
        "saldo inicial guardado correctamente",
        "var(--color-exito)"
    );
}

function alternarRegistroPublico() {
    const valorAnterior =
        configuracionSistema
            .registroPublicoHabilitado;

    configuracionSistema
        .registroPublicoHabilitado =
        !valorAnterior;

    if (
        !guardarConfiguracion(
            configuracionSistema
        )
    ) {
        configuracionSistema
            .registroPublicoHabilitado =
            valorAnterior;

        mostrarMensaje(
            mensajeAdminSuperiorPanel,
            "no se pudo guardar la configuración",
            "var(--color-error)"
        );

        return;
    }

    mostrarMensaje(
        mensajeAdminSuperiorPanel,

        configuracionSistema
            .registroPublicoHabilitado
            ? "registro público habilitado"
            : "registro público deshabilitado",

        configuracionSistema
            .registroPublicoHabilitado
            ? "var(--color-exito)"
            : "var(--color-advertencia)"
    );
}

function guardarConfiguracionValesDesdePanel() {
    const maximoDiario =
        Number(
            inputMaximoComprasDiarias.value
        );

    const vigencia =
        Number(
            inputVigenciaValesMinutos.value
        );

    const pendientes =
        Number(
            inputMaximoValesPendientes.value
        );

    if (
        !Number.isInteger(
            maximoDiario
        ) ||
        maximoDiario < 1 ||

        !Number.isInteger(
            vigencia
        ) ||
        vigencia < 1 ||

        !Number.isInteger(
            pendientes
        ) ||
        pendientes < 1
    ) {
        mostrarMensaje(
            mensajeAdminSuperiorPanel,
            "los valores deben ser enteros mayores a cero",
            "var(--color-error)"
        );

        return;
    }

    const anterior =
        clonarDato(
            configuracionSistema.vales
        );

    configuracionSistema
        .vales
        .maximoComprasDiarias =
        maximoDiario;

    configuracionSistema
        .vales
        .vigenciaMinutos =
        vigencia;

    configuracionSistema
        .vales
        .maximoValesPendientesPorTitular =
        pendientes;

    if (
        !guardarConfiguracion(
            configuracionSistema
        )
    ) {
        configuracionSistema.vales =
            anterior;

        mostrarMensaje(
            mensajeAdminSuperiorPanel,
            "no se pudo guardar la configuración de vales",
            "var(--color-error)"
        );

        return;
    }

    renderizarConfiguracionValesAdminSuperior();

    mostrarMensaje(
        mensajeAdminSuperiorPanel,
        "configuración de vales guardada correctamente",
        "var(--color-exito)"
    );
}

function agregarSaldoDesdeAdminSuperior(
    idUsuario
) {
    const usuario =
        buscarUsuarioPorId(
            idUsuario
        );

    const texto = prompt(
        "ingresá el monto a agregar"
    );

    if (
        usuario === null ||
        texto === null
    ) {
        return;
    }

    const monto =
        Number(texto);

    if (
        Number.isNaN(monto) ||
        monto <= 0
    ) {
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "monto inválido",
            "var(--color-error)"
        );

        return;
    }

    usuario.saldo += monto;

    registrarMovimientoUsuario(
        usuario.id,

        "agregar_saldo_admin_superior",

        "el admin superior agregó " +
            formatearMoneda(monto),

        monto,

        usuario.saldo
    );

    guardarUsuarios(usuarios);

    renderizarTodoAdminSuperior();
}

function descontarSaldoDesdeAdminSuperior(
    idUsuario
) {
    const usuario =
        buscarUsuarioPorId(
            idUsuario
        );

    const texto = prompt(
        "ingresá el monto a descontar"
    );

    if (
        usuario === null ||
        texto === null
    ) {
        return;
    }

    const monto =
        Number(texto);

    if (
        Number.isNaN(monto) ||
        monto <= 0 ||
        monto > usuario.saldo
    ) {
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "monto inválido o superior al saldo disponible",
            "var(--color-error)"
        );

        return;
    }

    usuario.saldo -= monto;

    registrarMovimientoUsuario(
        usuario.id,

        "descuento_saldo_admin_superior",

        "el admin superior descontó " +
            formatearMoneda(monto),

        -monto,

        usuario.saldo
    );

    guardarUsuarios(usuarios);

    renderizarTodoAdminSuperior();
}

function alternarBloqueoDesdeAdminSuperior(
    idUsuario
) {
    const usuario =
        buscarUsuarioPorId(
            idUsuario
        );

    if (usuario === null) {
        return;
    }

    usuario.bloqueado =
        !usuario.bloqueado;

    registrarMovimientoUsuario(
        usuario.id,

        usuario.bloqueado
            ? "bloqueo_admin_superior"
            : "desbloqueo_admin_superior",

        usuario.bloqueado
            ? "el admin superior bloqueó transacciones"
            : "el admin superior desbloqueó transacciones",

        0,

        usuario.saldo
    );

    guardarUsuarios(usuarios);

    renderizarTodoAdminSuperior();
}

function resetearContrasenaDesdeAdminSuperior(
    origen,
    idCuenta
) {
    let cuenta = null;

    if (origen === "usuarios") {
        cuenta =
            buscarUsuarioPorId(
                idCuenta
            );
    } else {
        cuenta =
            buscarAdministradorPorId(
                idCuenta
            );
    }

    if (cuenta === null) {
        return;
    }

    if (
        origen ===
            "administradores" &&

        cuenta.tipo ===
            "adminSuperior" &&

        !esAdministradorSuperiorPropio(
            origen,
            idCuenta
        )
    ) {
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "no se puede resetear la contraseña de otro admin superior",
            "var(--color-error)"
        );

        return;
    }

    cuenta.contrasena =
        "1234";

    if (origen === "usuarios") {
        guardarUsuarios(usuarios);
    } else {
        guardarAdministradores(
            administradores
        );
    }

    mostrarMensaje(
        mensajeAccionesAdminSuperior,
        "contraseña reseteada correctamente a 1234",
        "var(--color-exito)"
    );

    renderizarTodoAdminSuperior();
}

function eliminarCuentaDesdeAdminSuperior(
    origen,
    idCuenta
) {
    if (origen === "usuarios") {
        for (
            let i = 0;
            i < usuarios.length;
            i++
        ) {
            if (
                usuarios[i].id ===
                idCuenta
            ) {
                usuarios.splice(
                    i,
                    1
                );

                break;
            }
        }

        guardarUsuarios(usuarios);

        renderizarTodoAdminSuperior();

        return;
    }

    const admin =
        buscarAdministradorPorId(
            idCuenta
        );

    if (
        admin === null ||
        admin.tipo ===
            "adminSuperior"
    ) {
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "no se puede eliminar una cuenta de admin superior",
            "var(--color-error)"
        );

        return;
    }

    for (
        let i = 0;
        i < administradores.length;
        i++
    ) {
        if (
            administradores[i].id ===
            idCuenta
        ) {
            administradores.splice(
                i,
                1
            );

            break;
        }
    }

    guardarAdministradores(
        administradores
    );

    renderizarTodoAdminSuperior();
}

function resetearContrasenaAdministrador(
    idAdministrador
) {
    resetearContrasenaDesdeAdminSuperior(
        "administradores",
        idAdministrador
    );
}

function borrarAdministradorComun(
    idAdministrador
) {
    eliminarCuentaDesdeAdminSuperior(
        "administradores",
        idAdministrador
    );
}

// =======================================================
// APOYO
// =======================================================

function recuperarAcceso() {
    mostrarMensaje(
        mensajeInicio,
        "pedí apoyo al docente administrador",
        "var(--color-principal)"
    );
}

function mostrarSoporte() {
    mostrarMensaje(
        mensajeInicio,
        "soporte del proyecto escolar disponible con el docente",
        "var(--color-principal)"
    );
}

// =======================================================
// EVENTOS
// =======================================================

escuchar(
    botonIngresarSistema,
    "click",
    ingresarAlSistema
);

escuchar(
    botonIrRegistro,
    "click",
    irARegistro
);

escuchar(
    botonRecuperarAcceso,
    "click",
    recuperarAcceso
);

escuchar(
    botonSoporte,
    "click",
    mostrarSoporte
);

escuchar(
    selectTipoRegistro,
    "change",
    actualizarFormularioRegistro
);

escuchar(
    botonEnviarCodigoAdminSuperior,
    "click",
    enviarCodigoAdminSuperior
);

escuchar(
    botonRegistrarCuenta,
    "click",
    registrarCuenta
);

escuchar(
    botonVolverInicioDesdeRegistro,
    "click",
    volverAInicio
);

escuchar(
    botonConfirmarCompra,
    "click",
    confirmarCompra
);

escuchar(
    botonVaciarCarrito,
    "click",
    vaciarCarrito
);

escuchar(
    botonSalirSistema,
    "click",
    salirSistema
);

escuchar(
    botonEnviarAyudaAlumno,
    "click",
    enviarAyudaAlumno
);

escuchar(
    botonCerrarValeGenerado,
    "click",
    cerrarValeGenerado
);

escuchar(
    botonSalirAdmin,
    "click",
    salirSistema
);

escuchar(
    botonAgregarProducto,
    "click",
    agregarProducto
);

escuchar(
    botonSalirAdminSuperior,
    "click",
    salirSistema
);

escuchar(
    botonGuardarSaldoInicialSistema,
    "click",
    guardarSaldoInicialSistema
);

escuchar(
    botonAlternarRegistroPublico,
    "click",
    alternarRegistroPublico
);

escuchar(
    botonGuardarConfiguracionVales,
    "click",
    guardarConfiguracionValesDesdePanel
);

// =======================================================
// INICIO DE LA APLICACIÓN
// =======================================================

function iniciarAplicacion() {
    usuarios = cargarLista(
        CLAVES_ALMACENAMIENTO.USUARIOS,
        USUARIOS_INICIALES
    );

    administradores = cargarLista(
        CLAVES_ALMACENAMIENTO.ADMINISTRADORES,
        ADMINISTRADORES_INICIALES
    );

    productos = cargarLista(
        CLAVES_ALMACENAMIENTO.PRODUCTOS,
        PRODUCTOS_INICIALES
    );

    configuracionSistema =
        obtenerConfiguracion();

    siguienteIdUsuario =
        obtenerSiguienteId(
            usuarios
        );

    siguienteIdAdmin =
        obtenerSiguienteId(
            administradores
        );

    siguienteIdProducto =
        obtenerSiguienteId(
            productos
        );

    actualizarValesVencidos();

    actualizarFormularioRegistro();

    mostrarPantalla(
        "#pantallaInicio"
    );

    setInterval(
        actualizarValesVencidos,
        60000
    );
}

iniciarAplicacion();