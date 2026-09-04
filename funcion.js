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
// ESTADO DEL LECTOR QR DEL ALMACENERO
// =======================================================

let lectorQrAlmacenero = null;
let lectorQrAlmaceneroActivo = false;
let lectorQrAlmaceneroIniciando = false;
let qrAlmaceneroProcesado = false;



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

let almacenTitularSeleccionadoId =
    null;

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

const pantallaCambioContrasena =
    document.querySelector(
        "#pantallaCambioContrasena"
    );

const pantallaBilletera =
    document.querySelector("#pantallaBilletera");

const pantallaAdmin =
    document.querySelector("#pantallaAdmin");

const pantallaAdminSuperior =
    document.querySelector("#pantallaAdminSuperior");

let pantallaAlmacenero =
    document.querySelector("#pantallaAlmacenero");

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

// cambio obligatorio de contraseña

const inputNuevaContrasenaObligatoria =
    document.querySelector(
        "#inputNuevaContrasenaObligatoria"
    );

const inputConfirmarContrasenaObligatoria =
    document.querySelector(
        "#inputConfirmarContrasenaObligatoria"
    );

const botonGuardarContrasenaObligatoria =
    document.querySelector(
        "#botonGuardarContrasenaObligatoria"
    );

const botonSalirCambioContrasena =
    document.querySelector(
        "#botonSalirCambioContrasena"
    );

const mensajeCambioContrasena =
    document.querySelector(
        "#mensajeCambioContrasena"
    );

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


const selectAlmacenTitular =
    document.querySelector(
        "#selectAlmacenTitular"
    );

const mensajeAlmacenTitular =
    document.querySelector(
        "#mensajeAlmacenTitular"
    );


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


// =======================================================
// REFERENCIAS DEL FONDO POR ALMACÉN
// =======================================================

const selectAlmacenFondoAdmin =
    document.querySelector(
        "#selectAlmacenFondoAdmin"
    );

const saldoAlmacenSeleccionadoAdmin =
    document.querySelector(
        "#saldoAlmacenSeleccionadoAdmin"
    );

const inputMontoFondoAdmin =
    document.querySelector(
        "#inputMontoFondoAdmin"
    );

const botonCargarFondoAdmin =
    document.querySelector(
        "#botonCargarFondoAdmin"
    );


const botonRetirarFondoAdmin =
    document.querySelector(
        "#botonRetirarFondoAdmin"
    );



const botonActualizarAlmacenesAdmin =
    document.querySelector(
        "#botonActualizarAlmacenesAdmin"
    );

const mensajeFondoAdmin =
    document.querySelector(
        "#mensajeFondoAdmin"
    );


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

// almaceneros

const inputUsuarioNuevoAlmacenero =
    document.querySelector(
        "#inputUsuarioNuevoAlmacenero"
    );

const inputNombreNuevoAlmacenero =
    document.querySelector(
        "#inputNombreNuevoAlmacenero"
    );

const inputContrasenaNuevoAlmacenero =
    document.querySelector(
        "#inputContrasenaNuevoAlmacenero"
    );

const botonCrearNuevoAlmacenero =
    document.querySelector(
        "#botonCrearNuevoAlmacenero"
    );

const mensajeCrearNuevoAlmacenero =
    document.querySelector(
        "#mensajeCrearNuevoAlmacenero"
    );

const listaAlmacenerosAdminSuperior =
    document.querySelector(
        "#listaAlmacenerosAdminSuperior"
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
        pantallaCambioContrasena,
        pantallaBilletera,
        pantallaAdmin,
        pantallaAdminSuperior,
        pantallaAlmacenero
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
    limpiarMensaje(mensajeCambioContrasena);

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

    limpiarMensaje(
        mensajeCrearNuevoAlmacenero
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
        sesion.tipo !== "adminSuperior" &&
        sesion.tipo !== "operadorVales"
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

    if (
        typeof almacenTitularSeleccionadoId !==
        "string" ||
        almacenTitularSeleccionadoId.trim() ===
        ""
    ) {
        mostrarMensaje(
            mensajeCompra,
            "seleccioná un almacén antes de comprar",
            "var(--color-error)"
        );

        return null;
    }

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

    const esUsuarioSupabase =
        sesion.origen === "supabase" ||
        usuarioActivo.autenticacion ===
        "supabase";

    botonConfirmarCompra.disabled =
        true;

    try {
        let valeGuardado = null;

        if (esUsuarioSupabase) {
            if (
                typeof window.valesRepository ===
                "undefined" ||
                typeof window
                    .valesRepository
                    .realizarCompraConVale !==
                "function"
            ) {
                mostrarMensaje(
                    mensajeCompra,
                    "el servicio de compras no está disponible",
                    "var(--color-error)"
                );

                return null;
            }

            let resultadoSupabase = null;
            let vale = null;

            for (
                let intento = 0;
                intento < 100;
                intento++
            ) {
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

                vale = crearVale({
                    id:
                        idVale,

                    titular:
                        usuarioActivo,

                    fechaCreacion:
                        new Date()
                            .toISOString(),

                    productos:
                        agruparProductosDelCarrito(),

                    total:
                        validacion.total
                });

                vale.almacenId =
                    almacenTitularSeleccionadoId;

                resultadoSupabase =
                    await window
                        .valesRepository
                        .realizarCompraConVale(
                            vale,
                            almacenTitularSeleccionadoId
                        );

                if (
                    resultadoSupabase.correcto
                ) {
                    break;
                }

                if (
                    resultadoSupabase.resultado !==
                    "codigo_duplicado"
                ) {
                    break;
                }
            }

            if (
                resultadoSupabase === null ||
                !resultadoSupabase.correcto
            ) {
                let mensajeError =
                    "no se pudo realizar la compra";

                const resultadoError =
                    resultadoSupabase
                        ?.resultado;

                if (
                    resultadoError ===
                    "saldo_insuficiente"
                ) {
                    mensajeError =
                        "saldo insuficiente";
                } else if (
                    resultadoError ===
                    "billetera_bloqueada"
                ) {
                    mensajeError =
                        "usuario bloqueado: no puede realizar compras";
                } else if (
                    resultadoError ===
                    "usuario_inactivo"
                ) {
                    mensajeError =
                        "la cuenta está deshabilitada";
                } else if (
                    resultadoError ===
                    "no_autenticado"
                ) {
                    mensajeError =
                        "la sesión venció. Iniciá sesión nuevamente";
                } else if (
                    resultadoError ===
                    "almacen_invalido" ||
                    resultadoError ===
                    "almacen_no_encontrado"
                ) {
                    mensajeError =
                        "el almacén seleccionado ya no está disponible";
                } else if (
                    resultadoError ===
                    "codigo_duplicado"
                ) {
                    mensajeError =
                        "no se pudo generar un código de vale disponible";
                }

                mostrarMensaje(
                    mensajeCompra,
                    mensajeError,
                    "var(--color-error)"
                );

                return null;
            }

            usuarioActivo.saldo =
                resultadoSupabase.saldo;

            registrarMovimientoUsuario(
                usuarioActivo.id,

                "compra",

                "compra " +
                resultadoSupabase
                    .vale
                    .id +
                " por " +
                formatearMoneda(
                    resultadoSupabase
                        .vale
                        .total
                ),

                -resultadoSupabase
                    .vale
                    .total,

                usuarioActivo.saldo
            );

            valeGuardado =
                resultadoSupabase.vale;
        } else {
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
                id:
                    idVale,

                titular:
                    usuarioActivo,

                fechaCreacion:
                    new Date()
                        .toISOString(),

                productos:
                    agruparProductosDelCarrito(),

                total:
                    validacion.total
            });

            vale.almacenId =
                almacenTitularSeleccionadoId;

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

            if (
                !guardarUsuarios(
                    usuarios
                )
            ) {
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
                await window
                    .valesRepository
                    .guardarVale(
                        vale
                    );

            if (
                !resultadoSupabase.correcto
            ) {
                usuarioActivo.saldo =
                    saldoAnterior;

                usuarioActivo.historial =
                    historialAnterior;

                guardarUsuarios(
                    usuarios
                );

                mostrarMensaje(
                    mensajeCompra,
                    "no se pudo guardar el vale en Supabase",
                    "var(--color-error)"
                );

                return null;
            }

            valeGuardado =
                resultadoSupabase.vale;
        }

        guardarVale(
            valeGuardado
        );

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
    } catch (error) {
        console.error(
            "Error al procesar la compra:",
            error
        );

        mostrarMensaje(
            mensajeCompra,
            "ocurrió un error al procesar la compra",
            "var(--color-error)"
        );

        return null;
    } finally {
        botonConfirmarCompra.disabled =
            false;
    }
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
            } else if (
                adminLocal.tipo ===
                "operadorVales"
            ) {
                abrirPanelAlmacenero();
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

        if (usuarioSupabase === null ||
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

                debeCambiarContrasena:
                    usuarioSupabase
                        .debeCambiarContrasena ===
                    true,

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

            if (
                usuarioAplicacion
                    .debeCambiarContrasena
            ) {
                abrirCambioContrasenaObligatorio();
                return;
            }

            abrirBilletera();

            return;
        }

        let tipoAdministrador = "";

        if (
            usuarioSupabase.tipo ===
            "admin_superior"
        ) {
            tipoAdministrador =
                "adminSuperior";
        } else if (
            usuarioSupabase.tipo ===
            "admin"
        ) {
            tipoAdministrador =
                "admin";
        } else if (
            usuarioSupabase.tipo ===
            "operador_vales"
        ) {
            tipoAdministrador =
                "operadorVales";
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

                debeCambiarContrasena:
                    usuarioSupabase
                        .debeCambiarContrasena ===
                    true,

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

            adminAplicacion.debeCambiarContrasena =
                usuarioSupabase
                    .debeCambiarContrasena ===
                true;

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
            adminAplicacion
                .debeCambiarContrasena
        ) {
            abrirCambioContrasenaObligatorio();
            return;
        }

        if (
            tipoAdministrador ===
            "adminSuperior"
        ) {
            abrirPanelAdminSuperior();
        } else if (
            tipoAdministrador ===
            "operadorVales"
        ) {
            abrirPanelAlmacenero();
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

function abrirCambioContrasenaObligatorio() {
    inputNuevaContrasenaObligatoria.value =
        "";

    inputConfirmarContrasenaObligatoria.value =
        "";

    limpiarMensaje(
        mensajeCambioContrasena
    );

    mostrarPantalla(
        "#pantallaCambioContrasena"
    );
}

async function guardarContrasenaObligatoria() {
    const nuevaContrasena =
        inputNuevaContrasenaObligatoria
            .value;

    const confirmacion =
        inputConfirmarContrasenaObligatoria
            .value;

    limpiarMensaje(
        mensajeCambioContrasena
    );

    if (
        nuevaContrasena.length < 6 ||
        nuevaContrasena.length > 72
    ) {
        mostrarMensaje(
            mensajeCambioContrasena,
            "la contraseña debe tener entre 6 y 72 caracteres",
            "var(--color-error)"
        );

        return;
    }

    if (
        nuevaContrasena !==
        confirmacion
    ) {
        mostrarMensaje(
            mensajeCambioContrasena,
            "las contraseñas no coinciden",
            "var(--color-error)"
        );

        return;
    }

    botonGuardarContrasenaObligatoria.disabled =
        true;

    try {
        const resultado =
            await window
                .usuariosRepository
                .cambiarContrasenaObligatoria(
                    nuevaContrasena
                );

        if (!resultado.correcto) {
            mostrarMensaje(
                mensajeCambioContrasena,
                resultado.mensaje,
                "var(--color-error)"
            );

            return;
        }

        const usuarioActivo =
            obtenerUsuarioActivo();

        if (usuarioActivo !== null) {
            usuarioActivo
                .debeCambiarContrasena =
                false;
        }

        const administradorActivo =
            obtenerAdministradorActivo();

        if (
            administradorActivo !==
            null
        ) {
            administradorActivo
                .debeCambiarContrasena =
                false;
        }

        inputNuevaContrasenaObligatoria.value =
            "";

        inputConfirmarContrasenaObligatoria.value =
            "";

        alert(
            "contraseña actualizada correctamente"
        );

        if (
            sesion.tipo ===
            "titular"
        ) {
            await abrirBilletera();
        } else if (
            sesion.tipo ===
            "adminSuperior"
        ) {
            await abrirPanelAdminSuperior();
        } else if (
            sesion.tipo ===
            "operadorVales"
        ) {
            abrirPanelAlmacenero();
        } else {
            await abrirPanelAdmin();
        }
    } catch (error) {
        console.error(
            "Error al guardar contraseña:",
            error
        );

        mostrarMensaje(
            mensajeCambioContrasena,
            "no se pudo cambiar la contraseña",
            "var(--color-error)"
        );
    } finally {
        botonGuardarContrasenaObligatoria.disabled =
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


// =======================================================
// MENSAJES DEL LECTOR QR
// =======================================================

function mostrarMensajeLectorQrAlmacenero(
    texto,
    tipo = ""
) {
    const mensaje =
        document.querySelector(
            "#mensajeQrAlmacenero"
        );

    if (mensaje === null) {
        return;
    }

    mensaje.textContent =
        texto;

    mensaje.className =
        "mensaje";

    if (tipo !== "") {
        mensaje.classList.add(
            "mensaje-" + tipo
        );
    }
}

// =======================================================
// OBTENER TOKEN DESDE EL QR
// =======================================================

function obtenerTokenDesdeQrAlmacenero(
    contenidoQr
) {
    const texto =
        String(
            contenidoQr || ""
        ).trim();

    if (texto === "") {
        return null;
    }

    try {
        const direccion =
            new URL(
                texto,
                window.location.href
            );

        const token =
            direccion.searchParams.get(
                "token"
            );

        if (
            token === null ||
            token.trim() === ""
        ) {
            return null;
        }

        return token.trim();
    } catch (error) {
        return null;
    }
}

// =======================================================
// DETENER LECTOR QR
// =======================================================

async function detenerLectorQrAlmacenero() {
    const contenedor =
        document.querySelector(
            "#lectorQrAlmacenero"
        );

    const botonIniciar =
        document.querySelector(
            "#botonIniciarLectorQrAlmacenero"
        );

    const botonDetener =
        document.querySelector(
            "#botonDetenerLectorQrAlmacenero"
        );

    if (lectorQrAlmacenero !== null) {
        try {
            if (lectorQrAlmaceneroActivo) {
                await lectorQrAlmacenero
                    .stop();
            }
        } catch (error) {
            console.error(
                "Error al detener el lector QR:",
                error
            );
        }

        try {
            lectorQrAlmacenero.clear();
        } catch (error) {
            console.error(
                "Error al limpiar el lector QR:",
                error
            );
        }
    }

    lectorQrAlmacenero = null;
    lectorQrAlmaceneroActivo = false;
    lectorQrAlmaceneroIniciando = false;
    qrAlmaceneroProcesado = false;

    if (contenedor !== null) {
        contenedor.innerHTML = "";
        contenedor.classList.add(
            "oculto"
        );
    }

    if (botonIniciar !== null) {
        botonIniciar.disabled =
            false;
    }

    if (botonDetener !== null) {
        botonDetener.classList.add(
            "oculto"
        );
    }
}

// =======================================================
// PROCESAR CÓDIGO QR
// =======================================================

async function procesarQrAlmacenero(
    contenidoQr
) {
    if (qrAlmaceneroProcesado) {
        return;
    }

    const token =
        obtenerTokenDesdeQrAlmacenero(
            contenidoQr
        );

    if (token === null) {
        mostrarMensajeLectorQrAlmacenero(
            "El código QR no corresponde a un vale válido.",
            "error"
        );

        return;
    }

    qrAlmaceneroProcesado =
        true;

    mostrarMensajeLectorQrAlmacenero(
        "Vale encontrado. Abriendo comprobante...",
        "exito"
    );

    await detenerLectorQrAlmacenero();

    const direccionVale =
        new URL(
            "vale.html",
            window.location.href
        );

    direccionVale.searchParams.set(
        "token",
        token
    );

    window.location.assign(
        direccionVale.toString()
    );
}

// =======================================================
// INICIAR LECTOR QR
// =======================================================

async function iniciarLectorQrAlmacenero() {
    if (
        lectorQrAlmaceneroActivo ||
        lectorQrAlmaceneroIniciando
    ) {
        return;
    }

    const contenedor =
        document.querySelector(
            "#lectorQrAlmacenero"
        );

    const botonIniciar =
        document.querySelector(
            "#botonIniciarLectorQrAlmacenero"
        );

    const botonDetener =
        document.querySelector(
            "#botonDetenerLectorQrAlmacenero"
        );

    if (
        contenedor === null ||
        botonIniciar === null ||
        botonDetener === null
    ) {
        return;
    }

    if (
        typeof window.Html5Qrcode ===
        "undefined"
    ) {
        mostrarMensajeLectorQrAlmacenero(
            "El lector QR no está disponible.",
            "error"
        );

        return;
    }

    lectorQrAlmaceneroIniciando =
        true;

    qrAlmaceneroProcesado =
        false;

    botonIniciar.disabled =
        true;

    contenedor.classList.remove(
        "oculto"
    );

    mostrarMensajeLectorQrAlmacenero(
        "Permití el acceso a la cámara."
    );

    try {
        lectorQrAlmacenero =
            new window.Html5Qrcode(
                "lectorQrAlmacenero",
                {
                    formatsToSupport: [
                        window
                            .Html5QrcodeSupportedFormats
                            .QR_CODE
                    ]
                }
            );

        await lectorQrAlmacenero.start(
            {
                facingMode:
                    "environment"
            },
            {
                fps:
                    10,

                qrbox: {
                    width:
                        220,

                    height:
                        220
                }
            },
            procesarQrAlmacenero,
            function () {
                // La cámara continúa buscando un QR.
            }
        );

        lectorQrAlmaceneroActivo =
            true;

        botonDetener.classList.remove(
            "oculto"
        );

        mostrarMensajeLectorQrAlmacenero(
            "Apuntá la cámara al código QR del vale."
        );
    } catch (error) {
        console.error(
            "Error al iniciar el lector QR:",
            error
        );

        if (lectorQrAlmacenero !== null) {
            try {
                lectorQrAlmacenero.clear();
            } catch (errorLimpieza) {
                console.error(
                    "Error al limpiar el lector:",
                    errorLimpieza
                );
            }
        }

        lectorQrAlmacenero = null;
        lectorQrAlmaceneroActivo = false;

        contenedor.innerHTML = "";
        contenedor.classList.add(
            "oculto"
        );

        botonIniciar.disabled =
            false;

        mostrarMensajeLectorQrAlmacenero(
            "No se pudo abrir la cámara. Revisá sus permisos.",
            "error"
        );
    } finally {
        lectorQrAlmaceneroIniciando =
            false;
    }
}

// =======================================================
// DETENER LECTOR DESDE EL BOTÓN
// =======================================================

async function detenerLectorQrDesdeBoton() {
    await detenerLectorQrAlmacenero();

    mostrarMensajeLectorQrAlmacenero(
        "Lector detenido."
    );
}

// =======================================================
// SALIR DEL PANEL DEL ALMACENERO
// =======================================================

async function salirDesdePanelAlmacenero() {
    await detenerLectorQrAlmacenero();

    salirSistema();
}




// =======================================================
// PANEL DEL ALMACENERO
// =======================================================

function asegurarPantallaAlmacenero() {
    if (pantallaAlmacenero !== null) {
        return true;
    }

    const aplicacion =
        document.querySelector(
            ".aplicacion"
        );

    if (aplicacion === null) {
        return false;
    }

    const seccion =
        document.createElement(
            "section"
        );

    seccion.id =
        "pantallaAlmacenero";

    seccion.className =
        "pantalla oculto";

    seccion.innerHTML = `
        <div class="contenedor-principal">

            <header class="encabezado-billetera">

                <div>

                    <h2 class="titulo-seccion">
                        panel almacenero
                    </h2>

                    <p
                        id="textoAlmaceneroActual"
                        class="texto-suave"
                    >
                        sin almacenero activo
                    </p>

                </div>

                <button
                    type="button"
                    id="botonSalirAlmacenero"
                    class="boton boton-secundario"
                >
                    cerrar sesión
                </button>

            </header>

            <div class="grid-admin">

                <article class="tarjeta">

                    <h3 class="subtitulo-seccion">
                        fondo disponible
                    </h3>

                    <p class="texto-suave">
                        dinero disponible para respaldar
                        las ventas del almacén
                    </p>

                    <p
                        id="saldoFondoAlmacen"
                        class="saldo-disponible"
                    >
                        $ 0
                    </p>

                    <p
                        id="fechaFondoAlmacen"
                        class="texto-ayuda-panel"
                    >
                        sin actualización registrada
                    </p>

                    <button
                        type="button"
                        id="botonActualizarFondoAlmacen"
                        class="boton boton-secundario"
                    >
                        actualizar fondo
                    </button>

                    <p
                        id="mensajeFondoAlmacen"
                        class="mensaje"
                        aria-live="polite"
                    ></p>

                </article>

                <article class="tarjeta">

                    <h3 class="subtitulo-seccion">
                        gestionar productos
                    </h3>

                    <label for="inputNombreProductoAlmacenero">
                        nombre del producto
                    </label>

                    <input
                        type="text"
                        id="inputNombreProductoAlmacenero"
                        maxlength="120"
                        placeholder="ejemplo: jugo natural"
                    >

                    <label for="inputPrecioProductoAlmacenero">
                        precio
                    </label>

                    <input
                        type="number"
                        id="inputPrecioProductoAlmacenero"
                        min="1"
                        step="1"
                        placeholder="ingresá el precio"
                    >

                    <button
                        type="button"
                        id="botonAgregarProductoAlmacenero"
                        class="boton"
                    >
                        agregar producto
                    </button>

                    <button
                        type="button"
                        id="botonActualizarProductosAlmacenero"
                        class="boton boton-secundario"
                    >
                        actualizar lista
                    </button>

                    <p
                        id="mensajeProductosAlmacenero"
                        class="mensaje"
                        aria-live="polite"
                    ></p>

                    <div
                        id="listaProductosAlmacenero"
                        class="lista-productos-admin"
                    ></div>

                </article>

                <article class="tarjeta">

                    <h3 class="subtitulo-seccion">
                        validar vales
                    </h3>

                    <p class="texto-suave">
                        escaneá el código QR que te muestre
                        el estudiante
                    </p>

                    <p class="texto-suave">
                        podrás consultar los datos del vale
                        y marcarlo como utilizado
                    </p>

                    <button
                        type="button"
                        id="botonIniciarLectorQrAlmacenero"
                        class="boton"
                    >
                        abrir cámara
                    </button>

                    <button
                        type="button"
                        id="botonDetenerLectorQrAlmacenero"
                        class="boton boton-secundario oculto"
                    >
                        detener cámara
                    </button>

                    <div
                        id="lectorQrAlmacenero"
                        class="lector-qr-almacenero oculto"
                    ></div>

                    <p
                        id="mensajeQrAlmacenero"
                        class="mensaje"
                        aria-live="polite"
                    ></p>

                </article>

            </div>

        </div>
    `;

    aplicacion.appendChild(
        seccion
    );

    pantallaAlmacenero =
        seccion;

    const botonSalir =
        seccion.querySelector(
            "#botonSalirAlmacenero"
        );

    const botonActualizarFondo =
        seccion.querySelector(
            "#botonActualizarFondoAlmacen"
        );

    const botonAgregarProducto =
        seccion.querySelector(
            "#botonAgregarProductoAlmacenero"
        );

    const botonActualizarProductos =
        seccion.querySelector(
            "#botonActualizarProductosAlmacenero"
        );

    const botonIniciarLectorQr =
        seccion.querySelector(
            "#botonIniciarLectorQrAlmacenero"
        );

    const botonDetenerLectorQr =
        seccion.querySelector(
            "#botonDetenerLectorQrAlmacenero"
        );

    escuchar(
        botonSalir,
        "click",
        salirDesdePanelAlmacenero
    );

    escuchar(
        botonActualizarFondo,
        "click",
        cargarFondoAlmacenero
    );

    escuchar(
        botonAgregarProducto,
        "click",
        agregarProductoDesdeAlmacenero
    );

    escuchar(
        botonActualizarProductos,
        "click",
        actualizarListaProductosAlmacenero
    );

    escuchar(
        botonIniciarLectorQr,
        "click",
        iniciarLectorQrAlmacenero
    );

    escuchar(
        botonDetenerLectorQr,
        "click",
        detenerLectorQrDesdeBoton
    );

    return true;
}






function renderizarAlmaceneroActivo() {
    if (!asegurarPantallaAlmacenero()) {
        return;
    }

    const texto =
        document.querySelector(
            "#textoAlmaceneroActual"
        );

    if (texto === null) {
        return;
    }

    const almacenero =
        obtenerAdministradorActivo();

    texto.textContent =
        almacenero === null
            ? "sin almacenero activo"
            : "almacenero activo: " +
            almacenero.nombre +
            " (" +
            almacenero.usuario +
            ")";
}

function formatearFechaFondoAlmacen(
    fechaTexto
) {
    if (
        typeof fechaTexto !== "string" ||
        fechaTexto.trim() === ""
    ) {
        return "sin actualización registrada";
    }

    const fecha =
        new Date(
            fechaTexto
        );

    if (
        Number.isNaN(
            fecha.getTime()
        )
    ) {
        return "sin actualización registrada";
    }

    return (
        "última actualización: " +
        fecha.toLocaleString(
            "es-UY",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        )
    );
}

async function cargarFondoAlmacenero() {
    const saldo =
        document.querySelector(
            "#saldoFondoAlmacen"
        );

    const fecha =
        document.querySelector(
            "#fechaFondoAlmacen"
        );

    const boton =
        document.querySelector(
            "#botonActualizarFondoAlmacen"
        );

    const mensaje =
        document.querySelector(
            "#mensajeFondoAlmacen"
        );

    if (
        saldo === null ||
        fecha === null ||
        boton === null ||
        mensaje === null
    ) {
        return;
    }

    limpiarMensaje(
        mensaje
    );

    if (
        typeof window.fondoAlmacenRepository ===
        "undefined"
    ) {
        mostrarMensaje(
            mensaje,
            "el servicio del fondo no está disponible",
            "var(--color-error)"
        );

        return;
    }

    boton.disabled =
        true;

    try {
        const resultado =
            await window
                .fondoAlmacenRepository
                .consultarFondo();

        if (!resultado.correcto) {
            mostrarMensaje(
                mensaje,
                resultado.mensaje ||
                "no se pudo consultar el fondo",
                "var(--color-error)"
            );

            return;
        }

        saldo.textContent =
            formatearMoneda(
                resultado.saldo
            );

        fecha.textContent =
            formatearFechaFondoAlmacen(
                resultado.actualizadoEn
            );
    } catch (error) {
        console.error(
            "Error al cargar el fondo:",
            error
        );

        mostrarMensaje(
            mensaje,
            "no se pudo consultar el fondo",
            "var(--color-error)"
        );
    } finally {
        boton.disabled =
            false;
    }
}



// =======================================================
// PRODUCTOS DEL ALMACENERO
// =======================================================

function renderizarProductosAlmacenero() {
    const contenedor =
        document.querySelector(
            "#listaProductosAlmacenero"
        );

    if (contenedor === null) {
        return;
    }

    contenedor.innerHTML =
        "";

    if (productos.length === 0) {
        contenedor.innerHTML =
            '<p class="lista-vacia">no hay productos registrados</p>';

        return;
    }

    for (
        let i = 0;
        i < productos.length;
        i++
    ) {
        const producto =
            productos[i];

        contenedor.innerHTML += `
            <div class="item-producto-admin">

                <p class="producto-nombre">
                    ${producto.nombre}
                </p>

                <label
                    for="precioProductoAlmacenero-${producto.id}"
                >
                    precio
                </label>

                <input
                    type="number"
                    id="precioProductoAlmacenero-${producto.id}"
                    min="1"
                    step="1"
                    value="${Number(producto.precio)}"
                >

                <div class="acciones-usuario-admin">

                    <button
                        type="button"
                        class="boton boton-chico"
                        onclick="actualizarPrecioProductoAlmacenero(${producto.id})"
                    >
                        guardar precio
                    </button>

                    <button
                        type="button"
                        class="boton boton-peligro boton-chico"
                        onclick="quitarProductoDesdeAlmacenero(${producto.id})"
                    >
                        quitar producto
                    </button>

                </div>

            </div>
        `;
    }
}

// =======================================================
// ACTUALIZAR LISTA DE PRODUCTOS
// =======================================================

async function actualizarListaProductosAlmacenero() {
    const mensaje =
        document.querySelector(
            "#mensajeProductosAlmacenero"
        );

    const boton =
        document.querySelector(
            "#botonActualizarProductosAlmacenero"
        );

    if (
        mensaje === null ||
        boton === null
    ) {
        return;
    }

    limpiarMensaje(
        mensaje
    );

    boton.disabled =
        true;

    try {
        const cargados =
            await cargarProductosDesdeSupabase();

        if (!cargados) {
            mostrarMensaje(
                mensaje,
                "no se pudieron cargar los productos",
                "var(--color-error)"
            );

            return;
        }

        renderizarProductosAlmacenero();

        mostrarMensaje(
            mensaje,
            "lista actualizada correctamente",
            "var(--color-exito)"
        );
    } finally {
        boton.disabled =
            false;
    }
}

// =======================================================
// AGREGAR PRODUCTO DESDE ALMACENERO
// =======================================================

async function agregarProductoDesdeAlmacenero() {
    const inputNombre =
        document.querySelector(
            "#inputNombreProductoAlmacenero"
        );

    const inputPrecio =
        document.querySelector(
            "#inputPrecioProductoAlmacenero"
        );

    const boton =
        document.querySelector(
            "#botonAgregarProductoAlmacenero"
        );

    const mensaje =
        document.querySelector(
            "#mensajeProductosAlmacenero"
        );

    if (
        inputNombre === null ||
        inputPrecio === null ||
        boton === null ||
        mensaje === null
    ) {
        return;
    }

    const nombre =
        inputNombre.value.trim();

    const precio =
        Number(
            inputPrecio.value
        );

    limpiarMensaje(
        mensaje
    );

    if (
        nombre === "" ||
        Number.isNaN(precio) ||
        precio <= 0
    ) {
        mostrarMensaje(
            mensaje,
            "ingresá un nombre y un precio válido",
            "var(--color-error)"
        );

        return;
    }

    if (
        typeof window.productosRepository ===
        "undefined"
    ) {
        mostrarMensaje(
            mensaje,
            "el servicio de productos no está disponible",
            "var(--color-error)"
        );

        return;
    }

    boton.disabled =
        true;

    try {
        const resultado =
            await window
                .productosRepository
                .crearProducto(
                    nombre,
                    precio
                );

        if (!resultado.correcto) {
            mostrarMensaje(
                mensaje,
                resultado.mensaje ||
                "no se pudo crear el producto",
                "var(--color-error)"
            );

            return;
        }

        inputNombre.value =
            "";

        inputPrecio.value =
            "";

        await cargarProductosDesdeSupabase();

        renderizarProductosAlmacenero();

        mostrarMensaje(
            mensaje,
            "producto agregado correctamente",
            "var(--color-exito)"
        );
    } catch (error) {
        console.error(
            "Error al crear producto desde almacenero:",
            error
        );

        mostrarMensaje(
            mensaje,
            "no se pudo crear el producto",
            "var(--color-error)"
        );
    } finally {
        boton.disabled =
            false;
    }
}

// =======================================================
// ACTUALIZAR PRECIO DESDE ALMACENERO
// =======================================================

async function actualizarPrecioProductoAlmacenero(
    idProducto
) {
    const producto =
        buscarProductoPorId(
            idProducto
        );

    const input =
        document.querySelector(
            "#precioProductoAlmacenero-" +
            idProducto
        );

    const mensaje =
        document.querySelector(
            "#mensajeProductosAlmacenero"
        );

    if (
        producto === null ||
        input === null ||
        mensaje === null
    ) {
        return;
    }

    const precio =
        Number(
            input.value
        );

    limpiarMensaje(
        mensaje
    );

    if (
        Number.isNaN(precio) ||
        precio <= 0
    ) {
        mostrarMensaje(
            mensaje,
            "ingresá un precio válido",
            "var(--color-error)"
        );

        return;
    }

    const resultado =
        await window
            .productosRepository
            .actualizarProducto(
                producto.id,
                producto.nombre,
                precio,
                true
            );

    if (!resultado.correcto) {
        mostrarMensaje(
            mensaje,
            resultado.mensaje ||
            "no se pudo actualizar el precio",
            "var(--color-error)"
        );

        return;
    }

    await cargarProductosDesdeSupabase();

    renderizarProductosAlmacenero();

    mostrarMensaje(
        mensaje,
        "precio actualizado correctamente",
        "var(--color-exito)"
    );
}

// =======================================================
// QUITAR PRODUCTO DESDE ALMACENERO
// =======================================================

async function quitarProductoDesdeAlmacenero(
    idProducto
) {
    const producto =
        buscarProductoPorId(
            idProducto
        );

    const mensaje =
        document.querySelector(
            "#mensajeProductosAlmacenero"
        );

    if (
        producto === null ||
        mensaje === null
    ) {
        return
    }

    const confirmado =
        confirm(
            "¿Quitar el producto " +
            producto.nombre +
            "?"
        );

    if (!confirmado) {
        return;
    }

    limpiarMensaje(
        mensaje
    );

    const resultado =
        await window
            .productosRepository
            .eliminarProducto(
                producto.id
            );

    if (!resultado.correcto) {
        mostrarMensaje(
            mensaje,
            resultado.mensaje ||
            "no se pudo quitar el producto",
            "var(--color-error)"
        );

        return;
    }

    await cargarProductosDesdeSupabase();

    renderizarProductosAlmacenero();

    mostrarMensaje(
        mensaje,
        "producto quitado correctamente",
        "var(--color-exito)"
    );
}




async function abrirPanelAlmacenero() {
    if (!asegurarPantallaAlmacenero()) {
        mostrarMensaje(
            mensajeInicio,
            "no se pudo abrir el panel del almacenero",
            "var(--color-error)"
        );

        return;
    }

    renderizarAlmaceneroActivo();

    mostrarPantalla(
        "#pantallaAlmacenero"
    );

    const productosCargados =
        await cargarProductosDesdeSupabase();

    renderizarProductosAlmacenero();

    if (!productosCargados) {
        const mensajeProductos =
            document.querySelector(
                "#mensajeProductosAlmacenero"
            );

        mostrarMensaje(
            mensajeProductos,
            "no se pudieron cargar los productos",
            "var(--color-error)"
        );
    }

    await cargarFondoAlmacenero();
}
// =======================================================
// CARGA DESDE SUPABASE
// =======================================================

async function cargarProductosDesdeSupabase() {
    if (
        typeof window.productosRepository ===
        "undefined"
    ) {
        return false;
    }

    const resultado =
        await window
            .productosRepository
            .listarProductos(false);

    if (!resultado.correcto) {
        console.error(
            "No se pudieron cargar los productos:",
            resultado
        );

        return false;
    }

    productos =
        resultado.productos;

    siguienteIdProducto =
        obtenerSiguienteId(productos);

    return true;
}



// =======================================================
// ALMACÉN SELECCIONADO POR EL TITULAR
// =======================================================

async function cargarProductosAlmacenTitular() {
    productos = [];

    renderizarProductos();

    if (
        almacenTitularSeleccionadoId ===
        null
    ) {
        mostrarMensaje(
            mensajeAlmacenTitular,
            "seleccioná un almacén",
            "var(--color-advertencia)"
        );

        return false;
    }

    if (
        typeof window.productosRepository ===
        "undefined" ||
        typeof window
            .productosRepository
            .listarProductosPorAlmacen !==
        "function"
    ) {
        mostrarMensaje(
            mensajeAlmacenTitular,
            "el servicio de productos no está disponible",
            "var(--color-error)"
        );

        return false;
    }

    limpiarMensaje(
        mensajeAlmacenTitular
    );

    const resultado =
        await window
            .productosRepository
            .listarProductosPorAlmacen(
                almacenTitularSeleccionadoId
            );

    if (!resultado.correcto) {
        mostrarMensaje(
            mensajeAlmacenTitular,
            resultado.mensaje ||
            "no se pudieron cargar los productos",
            "var(--color-error)"
        );

        return false;
    }

    productos =
        resultado.productos;

    siguienteIdProducto =
        obtenerSiguienteId(
            productos
        );

    renderizarProductos();

    return true;
}

async function cargarAlmacenesTitular() {
    if (selectAlmacenTitular === null) {
        return false;
    }

    selectAlmacenTitular.disabled =
        true;

    selectAlmacenTitular.innerHTML =
        "";

    const opcionCargando =
        document.createElement(
            "option"
        );

    opcionCargando.value =
        "";

    opcionCargando.textContent =
        "cargando almacenes...";

    selectAlmacenTitular.appendChild(
        opcionCargando
    );

    if (
        typeof window.fondoAlmacenRepository ===
        "undefined" ||
        typeof window
            .fondoAlmacenRepository
            .listarAlmacenes !==
        "function"
    ) {
        opcionCargando.textContent =
            "servicio no disponible";

        mostrarMensaje(
            mensajeAlmacenTitular,
            "no se pudieron consultar los almacenes",
            "var(--color-error)"
        );

        return false;
    }

    const resultado =
        await window
            .fondoAlmacenRepository
            .listarAlmacenes();

    if (
        !resultado.correcto ||
        resultado.almacenes.length === 0
    ) {
        opcionCargando.textContent =
            "no hay almacenes disponibles";

        mostrarMensaje(
            mensajeAlmacenTitular,
            resultado.mensaje ||
            "no hay almacenes disponibles",
            "var(--color-advertencia)"
        );

        return false;
    }

    selectAlmacenTitular.innerHTML =
        "";

    for (
        let i = 0;
        i < resultado.almacenes.length;
        i++
    ) {
        const almacen =
            resultado.almacenes[i];

        const opcion =
            document.createElement(
                "option"
            );

        opcion.value =
            almacen.id;

        opcion.textContent =
            almacen.nombre;

        selectAlmacenTitular.appendChild(
            opcion
        );
    }

    almacenTitularSeleccionadoId =
        resultado.almacenes[0].id;

    selectAlmacenTitular.value =
        almacenTitularSeleccionadoId;

    selectAlmacenTitular.disabled =
        false;

    return await cargarProductosAlmacenTitular();
}

async function cambiarAlmacenTitular() {
    if (selectAlmacenTitular === null) {
        return;
    }

    const nuevoAlmacenId =
        selectAlmacenTitular
            .value
            .trim();

    if (
        nuevoAlmacenId === "" ||
        nuevoAlmacenId ===
        almacenTitularSeleccionadoId
    ) {
        return;
    }

    almacenTitularSeleccionadoId =
        nuevoAlmacenId;

    carrito = [];

    renderizarCarrito();

    const productosCargados =
        await cargarProductosAlmacenTitular();

    if (productosCargados) {
        mostrarMensaje(
            mensajeAlmacenTitular,
            "almacén actualizado y carrito vaciado",
            "var(--color-exito)"
        );
    }
}






async function abrirBilletera() {
    actualizarValesVencidos();

    almacenTitularSeleccionadoId =
        null;

    productos = [];

    renderizarTodoTitular();

    mostrarPantalla(
        "#pantallaBilletera"
    );

    await cargarAlmacenesTitular();
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

async function cargarAdministradoresDesdeSupabase() {
    if (
        sesion.tipo !==
        "adminSuperior" ||
        sesion.origen !==
        "supabase"
    ) {
        return true;
    }

    if (
        typeof window.supabaseCliente ===
        "undefined"
    ) {
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "el servicio de Supabase no está disponible",
            "var(--color-error)"
        );

        return false;
    }

    try {
        const respuesta =
            await window
                .supabaseCliente
                .rpc(
                    "listar_administradores_admin_superior"
                );

        if (respuesta.error) {
            console.error(
                "Error al cargar administradores:",
                respuesta.error
            );

            mostrarMensaje(
                mensajeAccionesAdminSuperior,
                "no se pudieron cargar los administradores",
                "var(--color-error)"
            );

            return false;
        }

        const administradoresRemotos =
            Array.isArray(
                respuesta.data
            )
                ? respuesta.data
                : [];

        const administradoresCombinados =
            [];

        for (
            let i = 0;
            i < administradores.length;
            i++
        ) {
            const adminActual =
                administradores[i];

            if (
                adminActual.tipo ===
                "adminSuperior"
            ) {
                administradoresCombinados.push(
                    adminActual
                );

                continue;
            }

            if (
                adminActual.tipo ===
                "operadorVales"
            ) {
                administradoresCombinados.push(
                    adminActual
                );

                continue;
            }

            if (
                adminActual.tipo ===
                "admin" &&
                adminActual.autenticacion !==
                "supabase"
            ) {
                let existeRemoto =
                    false;

                for (
                    let j = 0;
                    j <
                    administradoresRemotos
                        .length;
                    j++
                ) {
                    if (
                        String(
                            administradoresRemotos[j]
                                .usuario
                        ).toLowerCase() ===
                        String(
                            adminActual.usuario
                        ).toLowerCase()
                    ) {
                        existeRemoto =
                            true;

                        break;
                    }
                }

                if (!existeRemoto) {
                    administradoresCombinados.push(
                        adminActual
                    );
                }
            }
        }

        for (
            let i = 0;
            i <
            administradoresRemotos.length;
            i++
        ) {
            const adminRemoto =
                administradoresRemotos[i];

            administradoresCombinados.push({
                id:
                    adminRemoto.id,

                tipo:
                    "admin",

                usuario:
                    adminRemoto.usuario,

                nombre:
                    adminRemoto.nombre,

                contrasena:
                    "",

                debeCambiarContrasena:
                    adminRemoto
                        .debe_cambiar_contrasena ===
                    true,

                autenticacion:
                    "supabase"
            });
        }

        administradores =
            administradoresCombinados;

        return true;
    } catch (error) {
        console.error(
            "Error inesperado al cargar administradores:",
            error
        );

        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "no se pudo conectar con Supabase",
            "var(--color-error)"
        );

        return false;
    }
}

async function cargarAlmacenerosDesdeSupabase() {
    if (
        sesion.tipo !==
        "adminSuperior" ||
        sesion.origen !==
        "supabase"
    ) {
        return true;
    }

    if (
        typeof window.supabaseCliente ===
        "undefined"
    ) {
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "el servicio de Supabase no está disponible",
            "var(--color-error)"
        );

        return false;
    }

    try {
        const respuesta =
            await window
                .supabaseCliente
                .from(
                    "perfiles"
                )
                .select(
                    "id,usuario,nombre,activo,debe_cambiar_contrasena"
                )
                .eq(
                    "rol",
                    "operador_vales"
                )
                .order(
                    "nombre",
                    {
                        ascending: true
                    }
                );

        if (respuesta.error) {
            console.error(
                "Error al cargar almaceneros:",
                respuesta.error
            );

            mostrarMensaje(
                mensajeAccionesAdminSuperior,
                "no se pudieron cargar los almaceneros",
                "var(--color-error)"
            );

            return false;
        }

        const almacenerosRemotos =
            Array.isArray(
                respuesta.data
            )
                ? respuesta.data
                : [];

        const administradoresCombinados =
            [];

        for (
            let i = 0;
            i < administradores.length;
            i++
        ) {
            const cuenta =
                administradores[i];

            if (
                cuenta.tipo !==
                "operadorVales"
            ) {
                administradoresCombinados.push(
                    cuenta
                );

                continue;
            }

            if (
                cuenta.autenticacion !==
                "supabase"
            ) {
                let existeRemoto =
                    false;

                for (
                    let j = 0;
                    j <
                    almacenerosRemotos.length;
                    j++
                ) {
                    if (
                        String(
                            almacenerosRemotos[j]
                                .usuario
                        ).toLowerCase() ===
                        String(
                            cuenta.usuario
                        ).toLowerCase()
                    ) {
                        existeRemoto =
                            true;

                        break;
                    }
                }

                if (!existeRemoto) {
                    administradoresCombinados.push(
                        cuenta
                    );
                }
            }
        }

        for (
            let i = 0;
            i < almacenerosRemotos.length;
            i++
        ) {
            const almacenero =
                almacenerosRemotos[i];

            administradoresCombinados.push({
                id:
                    almacenero.id,

                tipo:
                    "operadorVales",

                usuario:
                    almacenero.usuario,

                nombre:
                    almacenero.nombre,

                contrasena:
                    "",

                activo:
                    almacenero.activo !==
                    false,

                debeCambiarContrasena:
                    almacenero
                        .debe_cambiar_contrasena ===
                    true,

                autenticacion:
                    "supabase"
            });
        }

        administradores =
            administradoresCombinados;

        return true;
    } catch (error) {
        console.error(
            "Error inesperado al cargar almaceneros:",
            error
        );

        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "no se pudo conectar con Supabase",
            "var(--color-error)"
        );

        return false;
    }
}

async function abrirPanelAdmin() {
    await cargarUsuariosParaAdministracion();
    await cargarProductosDesdeSupabase();

    renderizarTodoAdmin();

    mostrarPantalla(
        "#pantallaAdmin"
    );
}

async function abrirPanelAdminSuperior() {
    actualizarValesVencidos();

    await cargarUsuariosParaAdministracion();

    await cargarAdministradoresDesdeSupabase();

    await cargarAlmacenerosDesdeSupabase();

    await cargarProductosDesdeSupabase();

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
    sesion.origen = "";

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

    const movimientosVisibles =
        usuario.historial.slice(
            0,
            3
        );

    for (
        let i = 0;
        i < movimientosVisibles.length;
        i++
    ) {
        const movimiento =
            movimientosVisibles[i];

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
// MENSAJES DEL FONDO DEL ADMINISTRADOR
// =======================================================

function mostrarMensajeFondoAdmin(
    texto,
    tipo = ""
) {
    if (mensajeFondoAdmin === null) {
        return;
    }

    mensajeFondoAdmin.textContent =
        texto;

    mensajeFondoAdmin.className =
        "mensaje";

    if (tipo !== "") {
        mensajeFondoAdmin.classList.add(
            "mensaje-" + tipo
        );
    }
}

function formatearFondoAdmin(valor) {
    const numero =
        Number(valor);

    return new Intl.NumberFormat(
        "es-UY",
        {
            style:
                "currency",

            currency:
                "UYU",

            maximumFractionDigits:
                0
        }
    ).format(
        Number.isFinite(numero)
            ? numero
            : 0
    );
}

// =======================================================
// CONSULTAR FONDO DEL ALMACÉN SELECCIONADO
// =======================================================

async function consultarFondoSeleccionadoAdmin() {
    if (
        selectAlmacenFondoAdmin === null ||
        saldoAlmacenSeleccionadoAdmin ===
        null
    ) {
        return;
    }

    const almacenId =
        selectAlmacenFondoAdmin
            .value
            .trim();

    if (almacenId === "") {
        saldoAlmacenSeleccionadoAdmin
            .textContent =
            "seleccioná un almacén para consultar su fondo";

        if (botonCargarFondoAdmin !== null) {
            botonCargarFondoAdmin.disabled =
                true;
        }

        return;
    }

    if (botonCargarFondoAdmin !== null) {
        botonCargarFondoAdmin.disabled =
            true;
    }

    saldoAlmacenSeleccionadoAdmin
        .textContent =
        "consultando fondo...";

    const resultado =
        await window
            .fondoAlmacenRepository
            .consultarFondo(
                almacenId
            );

    if (!resultado.correcto) {
        saldoAlmacenSeleccionadoAdmin
            .textContent =
            "no se pudo consultar el fondo";

        mostrarMensajeFondoAdmin(
            resultado.mensaje ||
            "no se pudo consultar el fondo",
            "error"
        );

        return;
    }

    const opcionSeleccionada =
        selectAlmacenFondoAdmin
            .options[
        selectAlmacenFondoAdmin
            .selectedIndex
        ];

    const nombreAlmacen =
        resultado.almacenNombre ||
        opcionSeleccionada?.textContent ||
        "almacén";

    saldoAlmacenSeleccionadoAdmin
        .textContent =
        "fondo disponible en " +
        nombreAlmacen +
        ": " +
        formatearFondoAdmin(
            resultado.saldo
        );

    mostrarMensajeFondoAdmin(
        ""
    );

    if (botonCargarFondoAdmin !== null) {
        botonCargarFondoAdmin.disabled =
            false;
    }
}

// =======================================================
// LISTAR ALMACENES EN EL PANEL
// =======================================================

async function cargarAlmacenesFondoAdmin() {
    if (
        selectAlmacenFondoAdmin === null ||
        typeof window
            .fondoAlmacenRepository ===
        "undefined"
    ) {
        return;
    }

    const almacenAnterior =
        selectAlmacenFondoAdmin.value;

    selectAlmacenFondoAdmin.disabled =
        true;

    if (
        botonActualizarAlmacenesAdmin !==
        null
    ) {
        botonActualizarAlmacenesAdmin
            .disabled =
            true;
    }

    const resultado =
        await window
            .fondoAlmacenRepository
            .listarAlmacenes();

    selectAlmacenFondoAdmin.innerHTML =
        "";

    const opcionInicial =
        document.createElement(
            "option"
        );

    opcionInicial.value =
        "";

    opcionInicial.textContent =
        "seleccioná un almacén";

    selectAlmacenFondoAdmin.appendChild(
        opcionInicial
    );

    if (!resultado.correcto) {
        selectAlmacenFondoAdmin.disabled =
            false;

        if (
            botonActualizarAlmacenesAdmin !==
            null
        ) {
            botonActualizarAlmacenesAdmin
                .disabled =
                false;
        }

        mostrarMensajeFondoAdmin(
            resultado.mensaje ||
            "no se pudieron obtener los almacenes",
            "error"
        );

        return;
    }

    for (
        let i = 0;
        i < resultado.almacenes.length;
        i++
    ) {
        const almacen =
            resultado.almacenes[i];

        const opcion =
            document.createElement(
                "option"
            );

        opcion.value =
            almacen.id;

        opcion.textContent =
            almacen.nombre;

        selectAlmacenFondoAdmin.appendChild(
            opcion
        );
    }

    const almacenAnteriorExiste =
        resultado.almacenes.some(
            function (almacen) {
                return (
                    almacen.id ===
                    almacenAnterior
                );
            }
        );

    if (almacenAnteriorExiste) {
        selectAlmacenFondoAdmin.value =
            almacenAnterior;
    } else if (
        resultado.almacenes.length === 1
    ) {
        selectAlmacenFondoAdmin.value =
            resultado.almacenes[0].id;
    }

    selectAlmacenFondoAdmin.disabled =
        false;

    if (
        botonActualizarAlmacenesAdmin !==
        null
    ) {
        botonActualizarAlmacenesAdmin
            .disabled =
            false;
    }

    if (
        resultado.almacenes.length === 0
    ) {
        mostrarMensajeFondoAdmin(
            "no hay almacenes disponibles",
            "error"
        );
    } else {
        mostrarMensajeFondoAdmin(
            ""
        );
    }

    await consultarFondoSeleccionadoAdmin();
}

// =======================================================
// CARGAR DINERO AL ALMACÉN
// =======================================================

async function cargarFondoDesdeAdministrador() {
    if (
        selectAlmacenFondoAdmin === null ||
        inputMontoFondoAdmin === null ||
        botonCargarFondoAdmin === null ||
        botonRetirarFondoAdmin === null
    ) {
        return;
    }

    const almacenId =
        selectAlmacenFondoAdmin
            .value
            .trim();

    const monto =
        Number(
            inputMontoFondoAdmin.value
        );

    if (almacenId === "") {
        mostrarMensajeFondoAdmin(
            "seleccioná un almacén",
            "error"
        );

        return;
    }

    if (
        !Number.isFinite(monto) ||
        monto <= 0
    ) {
        mostrarMensajeFondoAdmin(
            "ingresá un monto mayor que cero",
            "error"
        );

        return;
    }

    const confirmado =
        confirm(
            "¿Confirmás la carga de " +
            formatearFondoAdmin(monto) +
            " al almacén seleccionado?"
        );

    if (!confirmado) {
        return;
    }

    botonCargarFondoAdmin.disabled =
        true;

    botonRetirarFondoAdmin.disabled =
        true;

    mostrarMensajeFondoAdmin(
        "cargando fondo..."
    );

    try {
        const resultado =
            await window
                .fondoAlmacenRepository
                .cargarFondo(
                    monto,
                    almacenId
                );

        if (!resultado.correcto) {
            let mensaje =
                resultado.mensaje ||
                "no se pudo cargar el fondo";

            if (
                resultado.resultado ===
                "sin_permiso"
            ) {
                mensaje =
                    "solo un administrador común puede cargar fondos";
            }

            if (
                resultado.resultado ===
                "almacen_no_encontrado"
            ) {
                mensaje =
                    "el almacén seleccionado no está disponible";
            }

            mostrarMensajeFondoAdmin(
                mensaje,
                "error"
            );

            return;
        }

        inputMontoFondoAdmin.value =
            "";

        await consultarFondoSeleccionadoAdmin();

        mostrarMensajeFondoAdmin(
            "fondo cargado correctamente",
            "exito"
        );
    } catch (error) {
        console.error(
            "Error al cargar fondo:",
            error
        );

        mostrarMensajeFondoAdmin(
            "no se pudo cargar el fondo",
            "error"
        );
    } finally {
        botonCargarFondoAdmin.disabled =
            false;

        botonRetirarFondoAdmin.disabled =
            false;
    }
}




async function retirarFondoDesdeAdministrador() {
    if (
        selectAlmacenFondoAdmin === null ||
        inputMontoFondoAdmin === null ||
        botonCargarFondoAdmin === null ||
        botonRetirarFondoAdmin === null
    ) {
        return;
    }

    const almacenId =
        selectAlmacenFondoAdmin
            .value
            .trim();

    const monto =
        Number(
            inputMontoFondoAdmin.value
        );

    if (almacenId === "") {
        mostrarMensajeFondoAdmin(
            "seleccioná un almacén",
            "error"
        );

        return;
    }

    if (
        !Number.isFinite(monto) ||
        monto <= 0
    ) {
        mostrarMensajeFondoAdmin(
            "ingresá un monto mayor que cero",
            "error"
        );

        return;
    }

    const confirmado =
        confirm(
            "¿Confirmás el retiro de " +
            formatearFondoAdmin(monto) +
            " del almacén seleccionado?"
        );

    if (!confirmado) {
        return;
    }

    botonCargarFondoAdmin.disabled =
        true;

    botonRetirarFondoAdmin.disabled =
        true;

    mostrarMensajeFondoAdmin(
        "retirando fondo..."
    );

    try {
        const resultado =
            await window
                .fondoAlmacenRepository
                .retirarFondo(
                    monto,
                    almacenId
                );

        if (!resultado.correcto) {
            let mensaje =
                resultado.mensaje ||
                "no se pudo retirar el fondo";

            if (
                resultado.resultado ===
                "sin_permiso"
            ) {
                mensaje =
                    "solo un administrador común puede retirar fondos";
            } else if (
                resultado.resultado ===
                "almacen_no_encontrado"
            ) {
                mensaje =
                    "el almacén seleccionado no está disponible";
            } else if (
                resultado.resultado ===
                "fondo_comprometido"
            ) {
                mensaje =
                    "no se puede retirar ese monto. Disponible: " +
                    formatearFondoAdmin(
                        resultado.saldoDisponible
                    ) +
                    ". Reservado para vales pendientes: " +
                    formatearFondoAdmin(
                        resultado.saldoReservado
                    );
            }

            mostrarMensajeFondoAdmin(
                mensaje,
                "error"
            );

            return;
        }

        inputMontoFondoAdmin.value =
            "";

        await consultarFondoSeleccionadoAdmin();

        mostrarMensajeFondoAdmin(
            "fondo retirado correctamente",
            "exito"
        );
    } catch (error) {
        console.error(
            "Error al retirar fondo:",
            error
        );

        mostrarMensajeFondoAdmin(
            "no se pudo retirar el fondo",
            "error"
        );
    } finally {
        botonCargarFondoAdmin.disabled =
            false;

        botonRetirarFondoAdmin.disabled =
            false;
    }
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
            : "Hola!! Bienvenido!!! administrador activo: " +
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
        const usuario = usuarios[i];

        const textoBloqueo =
            usuario.bloqueado
                ? "desbloquear usuario"
                : "bloquear usuario";

        listaUsuariosAdmin.innerHTML += `
            <div
                class="item-usuario-admin
                ${usuario.bloqueado ? "usuario-bloqueado" : ""}"
            >
                <p class="usuario-admin-nombre">
                    ${usuario.nombre}
                </p>

                <p class="usuario-admin-dato">
                    usuario: ${usuario.usuario}
                </p>

                <p class="usuario-admin-dato">
                    curso: ${usuario.curso}
                </p>

                <p class="usuario-admin-dato">
                    saldo: ${formatearMoneda(usuario.saldo)}
                </p>

                <p class="usuario-admin-dato">
                    estado:
                    ${usuario.bloqueado ? "bloqueado" : "activo"}
                </p>

                <div class="acciones-usuario-admin">
                    <button
                        class="boton boton-chico"
                        onclick="agregarDineroAUsuario('${usuario.id}')"
                    >
                        agregar dinero
                    </button>

                    <button
                        class="boton boton-advertencia boton-chico"
                        onclick="alternarBloqueoUsuario('${usuario.id}')"
                    >
                        ${textoBloqueo}
                    </button>

                    <button
                        class="boton boton-peligro boton-chico"
                        onclick="borrarUsuario('${usuario.id}')"
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
        const cuenta =
            cuentas[i];

        const idCuentaSeguro =
            typeof cuenta.id === "number"
                ? cuenta.id
                : "'" + cuenta.id + "'";

        let acciones = "";

        if (
            cuenta.tipo ===
            "titular"
        ) {
            acciones = `
                <div class="acciones-usuario-admin">

                    <button
                        class="boton boton-chico"
                        onclick="agregarSaldoDesdeAdminSuperior(${idCuentaSeguro})"
                    >
                        agregar saldo
                    </button>

                    <button
                        class="boton boton-chico"
                        onclick="descontarSaldoDesdeAdminSuperior(${idCuentaSeguro})"
                    >
                        descontar saldo
                    </button>

                    <button
                        class="boton boton-advertencia boton-chico"
                        onclick="alternarBloqueoDesdeAdminSuperior(${idCuentaSeguro})"
                    >
                        ${cuenta.bloqueado
                    ? "desbloquear"
                    : "bloquear"
                }
                    </button>

                    <button
                        class="boton boton-secundario boton-chico"
                        onclick="resetearContrasenaDesdeAdminSuperior('usuarios', ${idCuentaSeguro})"
                    >
                        resetear contraseña
                    </button>

                    <button
                        class="boton boton-peligro boton-chico"
                        onclick="eliminarCuentaDesdeAdminSuperior('usuarios', ${idCuentaSeguro})"
                    >
                        eliminar cuenta
                    </button>

                </div>
            `;
        } else if (
            cuenta.tipo ===
            "admin" ||
            cuenta.tipo ===
            "operadorVales"
        ) {
            acciones = `
                <div class="acciones-usuario-admin">

                    <button
                        class="boton boton-secundario boton-chico"
                        onclick="resetearContrasenaDesdeAdminSuperior('administradores', ${idCuentaSeguro})"
                    >
                        resetear contraseña
                    </button>

                    <button
                        class="boton boton-peligro boton-chico"
                        onclick="eliminarCuentaDesdeAdminSuperior('administradores', ${idCuentaSeguro})"
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
                        onclick="resetearContrasenaDesdeAdminSuperior('administradores', ${idCuentaSeguro})"
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

        const tipoVisible =
            cuenta.tipo ===
                "operadorVales"
                ? "almacenero"
                : cuenta.tipo;

        listaCuentasAdminSuperior.innerHTML += `
            <div class="item-admin-superior">

                <p class="admin-superior-nombre">
                    ${cuenta.nombre}
                </p>

                <p class="admin-superior-dato">
                    tipo:
                    ${tipoVisible}
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
                    ${cuenta.tipo === "titular"
                ? formatearMoneda(
                    cuenta.saldo
                )
                : "-"
            }
                </p>

                <p class="admin-superior-dato">
                    estado:
                    ${cuenta.tipo ===
                "titular" &&
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

        const idAdministradorSeguro =
            JSON.stringify(
                admin.id
            );

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
                        onclick='resetearContrasenaAdministrador(${idAdministradorSeguro})'
                    >
                        resetear contraseña
                    </button>

                    <button
                        class="boton boton-peligro boton-chico"
                        onclick='borrarAdministradorComun(${idAdministradorSeguro})'
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

function renderizarAlmacenerosAdminSuperior() {
    if (
        listaAlmacenerosAdminSuperior ===
        null
    ) {
        return;
    }

    listaAlmacenerosAdminSuperior.innerHTML =
        "";

    let cantidad = 0;

    for (
        let i = 0;
        i < administradores.length;
        i++
    ) {
        if (
            administradores[i].tipo !==
            "operadorVales"
        ) {
            continue;
        }

        cantidad++;

        const almacenero =
            administradores[i];

        const idSeguro =
            JSON.stringify(
                almacenero.id
            );

        listaAlmacenerosAdminSuperior.innerHTML += `
            <div class="item-admin-superior">

                <p class="admin-superior-nombre">
                    ${almacenero.nombre}
                </p>

                <p class="admin-superior-dato">
                    usuario:
                    ${almacenero.usuario}
                </p>

                <p class="admin-superior-dato">
                    tipo: almacenero
                </p>

                <p class="admin-superior-dato">
                    permiso: validar vales
                </p>

                <div class="acciones-usuario-admin">

                    <button
                        class="boton boton-chico"
                        onclick='resetearContrasenaAlmacenero(${idSeguro})'
                    >
                        resetear contraseña
                    </button>

                    <button
                        class="boton boton-peligro boton-chico"
                        onclick='borrarAlmacenero(${idSeguro})'
                    >
                        borrar almacenero
                    </button>

                </div>

            </div>
        `;
    }

    if (cantidad === 0) {
        listaAlmacenerosAdminSuperior.innerHTML =
            '<p class="lista-vacia">no hay almaceneros registrados</p>';
    }
}

function renderizarEstadisticasAdminSuperior() {
    let admins = 0;
    let adminsSuperiores = 0;
    let almaceneros = 0;
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
        } else if (
            administradores[i].tipo ===
            "operadorVales"
        ) {
            almaceneros++;
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
            <p>almaceneros</p>
            <p class="estadistica-valor">
                ${almaceneros}
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

    renderizarAlmacenerosAdminSuperior();

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

async function enviarAyudaAlumno() {
    const texto =
        inputMensajeAyudaAlumno
            .value
            .trim();

    limpiarMensaje(
        mensajeAyudaAlumno
    );

    if (texto === "") {
        mostrarMensaje(
            mensajeAyudaAlumno,
            "escribí un mensaje antes de enviarlo",
            "var(--color-error)"
        );

        return;
    }

    botonEnviarAyudaAlumno.disabled =
        true;

    mostrarMensaje(
        mensajeAyudaAlumno,
        "la inteligencia artificial está revisando tu consulta...",
        "var(--color-texto-suave)"
    );

    try {
        const respuesta =
            await fetch(
                "/api/consultas/evaluar",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            consulta:
                                texto
                        })
                }
            );

        const resultado =
            await respuesta.json();

        if (
            !respuesta.ok ||
            resultado.ok !== true
        ) {
            mostrarMensaje(
                mensajeAyudaAlumno,
                resultado.mensaje ||
                resultado.devolucion ||
                "no se pudo evaluar la consulta",
                "var(--color-error)"
            );

            return;
        }

        if (
            resultado.aprobada !==
            true
        ) {
            mostrarMensaje(
                mensajeAyudaAlumno,
                resultado.devolucion ||
                "la consulta necesita más información antes de enviarse",
                "var(--color-error)"
            );

            return;
        }

        mostrarMensaje(
            mensajeAyudaAlumno,
            "consulta bien estructurada. Está lista para enviarse",
            "var(--color-exito)"
        );
    } catch (error) {
        console.error(
            "Error al evaluar consulta:",
            error
        );

        mostrarMensaje(
            mensajeAyudaAlumno,
            "no se pudo conectar con el servicio de evaluación",
            "var(--color-error)"
        );
    } finally {
        botonEnviarAyudaAlumno.disabled =
            false;
    }
}

// =======================================================
// ACCIONES DEL ADMINISTRADOR
// =======================================================

async function agregarDineroAUsuario(
    idUsuario
) {
    const usuario =
        buscarUsuarioPorId(
            idUsuario
        );

    if (usuario === null) {
        return;
    }

    const montoTexto = prompt(
        "ingresá el monto a agregar"
    );

    if (montoTexto === null) {
        return;
    }

    const monto =
        Number(montoTexto);

    if (
        Number.isNaN(monto) ||
        monto <= 0
    ) {
        return;
    }

    const resultado =
        await window
            .usuariosSupabaseAdapter
            .modificarSaldo(
                idUsuario,
                monto,
                "el administrador agregó saldo"
            );

    if (!resultado.correcto) {
        alert(
            resultado.mensaje ||
            "no se pudo agregar el saldo"
        );

        return;
    }

    await cargarUsuariosParaAdministracion();

    renderizarTodoAdmin();
}

async function alternarBloqueoUsuario(
    idUsuario
) {
    const usuario =
        buscarUsuarioPorId(
            idUsuario
        );

    if (usuario === null) {
        return;
    }

    const nuevoEstado =
        !usuario.bloqueado;

    const resultado =
        await window
            .usuariosSupabaseAdapter
            .cambiarBloqueo(
                idUsuario,
                nuevoEstado
            );

    if (!resultado.correcto) {
        alert(
            resultado.mensaje ||
            "no se pudo modificar el estado"
        );

        return;
    }

    await cargarUsuariosParaAdministracion();

    renderizarTodoAdmin();
}

async function eliminarCuentaRealSupabase(
    idCuenta
) {
    if (
        typeof window.supabaseCliente ===
        "undefined"
    ) {
        return {
            correcto: false,

            mensaje:
                "el servicio de Supabase no está disponible"
        };
    }

    try {
        const respuestaSesion =
            await window
                .supabaseCliente
                .auth
                .getSession();

        const sesionSupabase =
            respuestaSesion
                .data
                ?.session;

        if (
            respuestaSesion.error ||
            !sesionSupabase
        ) {
            return {
                correcto: false,

                mensaje:
                    "la sesión no es válida"
            };
        }

        const respuesta =
            await fetch(
                "/api/usuarios/eliminar-cuenta",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            "Bearer " +
                            sesionSupabase
                                .access_token
                    },

                    body:
                        JSON.stringify({
                            usuarioId:
                                idCuenta
                        })
                }
            );

        let resultado = {};

        try {
            resultado =
                await respuesta.json();
        } catch (error) {
            resultado = {};
        }

        if (
            !respuesta.ok ||
            resultado.ok !== true
        ) {
            return {
                correcto: false,

                mensaje:
                    resultado.mensaje ||
                    "no se pudo eliminar la cuenta"
            };
        }

        return {
            correcto: true,

            mensaje:
                resultado.mensaje
        };
    } catch (error) {
        console.error(
            "Error al eliminar cuenta:",
            error
        );

        return {
            correcto: false,

            mensaje:
                "no se pudo conectar con el servidor"
        };
    }
}

async function borrarUsuario(
    idUsuario
) {
    const usuario =
        buscarUsuarioPorId(
            idUsuario
        );

    if (usuario === null) {
        return;
    }

    const confirmado =
        confirm(
            "¿Seguro que querés eliminar la cuenta de " +
            usuario.nombre +
            "? Esta acción no se puede deshacer."
        );

    if (!confirmado) {
        return;
    }

    if (
        usuario.autenticacion ===
        "supabase"
    ) {
        const resultado =
            await eliminarCuentaRealSupabase(
                usuario.id
            );

        if (!resultado.correcto) {
            alert(
                resultado.mensaje
            );

            return;
        }

        await cargarUsuariosParaAdministracion();

        if (
            sesion.tipo ===
            "adminSuperior"
        ) {
            renderizarTodoAdminSuperior();
        } else {
            renderizarTodoAdmin();
        }

        alert(
            "usuario eliminado correctamente"
        );

        return;
    }

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

    guardarUsuarios(
        usuarios
    );

    renderizarTodoAdmin();
}

async function agregarProducto() {
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

    if (
        typeof window.productosRepository !==
        "undefined"
    ) {
        const resultado =
            await window
                .productosRepository
                .crearProducto(
                    nombre,
                    precio
                );

        if (!resultado.correcto) {
            alert(
                resultado.mensaje ||
                "no se pudo crear el producto"
            );

            return;
        }

        await cargarProductosDesdeSupabase();
    } else {
        productos.push({
            id:
                siguienteIdProducto,

            nombre:
                nombre,

            precio:
                precio,

            activo:
                true
        });

        siguienteIdProducto++;

        guardarProductos(
            productos
        );
    }

    inputNombreProducto.value =
        "";

    inputPrecioProducto.value =
        "";

    renderizarTodoAdmin();
}

async function quitarProducto(
    idProducto
) {
    if (
        typeof window.productosRepository !==
        "undefined"
    ) {
        const resultado =
            await window
                .productosRepository
                .eliminarProducto(
                    idProducto
                );

        if (!resultado.correcto) {
            alert(
                resultado.mensaje ||
                "no se pudo quitar el producto"
            );

            return;
        }

        await cargarProductosDesdeSupabase();
    } else {
        for (
            let i = 0;
            i < productos.length;
            i++
        ) {
            if (
                Number(productos[i].id) ===
                Number(idProducto)
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
    }

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
        vigencia < 1 || !Number.isInteger(
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

async function agregarSaldoDesdeAdminSuperior(
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

    if (
        usuario.autenticacion ===
        "supabase"
    ) {
        const resultado =
            await window
                .usuariosRepository
                .modificarSaldo(
                    usuario.id,
                    monto,
                    "el admin superior agregó saldo"
                );

        if (!resultado.correcto) {
            mostrarMensaje(
                mensajeAccionesAdminSuperior,
                resultado.mensaje ||
                resultado.resultado,
                "var(--color-error)"
            );

            return;
        }

        usuario.saldo =
            resultado.saldo;

        await cargarUsuariosParaAdministracion();

        renderizarTodoAdminSuperior();

        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "saldo agregado correctamente",
            "var(--color-exito)"
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

async function descontarSaldoDesdeAdminSuperior(
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
        monto <= 0
    ) {
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "monto inválido",
            "var(--color-error)"
        );

        return;
    }

    if (
        usuario.autenticacion ===
        "supabase"
    ) {
        const resultado =
            await window
                .usuariosRepository
                .modificarSaldo(
                    usuario.id,
                    -monto,
                    "el admin superior descontó saldo"
                );

        if (!resultado.correcto) {
            const mensaje =
                resultado.resultado ===
                    "saldo_insuficiente"
                    ? "monto superior al saldo disponible"
                    : resultado.mensaje ||
                    resultado.resultado;

            mostrarMensaje(
                mensajeAccionesAdminSuperior,
                mensaje,
                "var(--color-error)"
            );

            return;
        }

        usuario.saldo =
            resultado.saldo;

        await cargarUsuariosParaAdministracion();

        renderizarTodoAdminSuperior();

        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "saldo descontado correctamente",
            "var(--color-exito)"
        );

        return;
    }

    if (monto > usuario.saldo) {
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "monto superior al saldo disponible",
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

async function alternarBloqueoDesdeAdminSuperior(
    idUsuario
) {
    const usuario =
        buscarUsuarioPorId(
            idUsuario
        );

    if (usuario === null) {
        return;
    }

    const nuevoEstado =
        !usuario.bloqueado;

    if (
        usuario.autenticacion ===
        "supabase"
    ) {
        const resultado =
            await window
                .usuariosRepository
                .cambiarBloqueo(
                    usuario.id,
                    nuevoEstado
                );

        if (!resultado.correcto) {
            mostrarMensaje(
                mensajeAccionesAdminSuperior,
                resultado.mensaje ||
                resultado.resultado,
                "var(--color-error)"
            );

            return;
        }

        await cargarUsuariosParaAdministracion();

        renderizarTodoAdminSuperior();

        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            nuevoEstado
                ? "usuario bloqueado correctamente"
                : "usuario desbloqueado correctamente",
            "var(--color-exito)"
        );

        return;
    }

    usuario.bloqueado =
        nuevoEstado;

    registrarMovimientoUsuario(
        usuario.id,

        nuevoEstado
            ? "bloqueo_admin_superior"
            : "desbloqueo_admin_superior",

        nuevoEstado
            ? "el admin superior bloqueó transacciones"
            : "el admin superior desbloqueó transacciones",

        0,

        usuario.saldo
    );

    guardarUsuarios(
        usuarios
    );

    renderizarTodoAdminSuperior();
}

async function resetearContrasenaDesdeAdminSuperior(
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
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "la cuenta no fue encontrada",
            "var(--color-error)"
        );

        return;
    }

    if (
        origen === "administradores" &&
        cuenta.tipo === "adminSuperior" &&
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

    const confirmado =
        confirm(
            "¿Resetear la contraseña de " +
            cuenta.nombre +
            " a cambio321?"
        );

    if (!confirmado) {
        return;
    }

    if (
        cuenta.autenticacion ===
        "supabase"
    ) {
        try {
            const respuestaSesion =
                await window
                    .supabaseCliente
                    .auth
                    .getSession();

            const sesionSupabase =
                respuestaSesion
                    .data
                    ?.session;

            if (
                respuestaSesion.error ||
                !sesionSupabase
            ) {
                mostrarMensaje(
                    mensajeAccionesAdminSuperior,
                    "la sesión no es válida",
                    "var(--color-error)"
                );

                return;
            }

            const respuesta =
                await fetch(
                    "/api/usuarios/resetear-contrasena",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                "Bearer " +
                                sesionSupabase
                                    .access_token
                        },

                        body:
                            JSON.stringify({
                                usuarioId:
                                    cuenta.id
                            })
                    }
                );

            let resultado = {};

            try {
                resultado =
                    await respuesta.json();
            } catch (error) {
                resultado = {};
            }

            if (
                !respuesta.ok ||
                resultado.ok !== true
            ) {
                mostrarMensaje(
                    mensajeAccionesAdminSuperior,
                    resultado.mensaje ||
                    "no se pudo resetear la contraseña",
                    "var(--color-error)"
                );

                return;
            }

            cuenta.debeCambiarContrasena =
                true;

            await cargarUsuariosParaAdministracion();

            await cargarAdministradoresDesdeSupabase();

            await cargarAlmacenerosDesdeSupabase();

            renderizarTodoAdminSuperior();

            mostrarMensaje(
                mensajeAccionesAdminSuperior,
                "contraseña reseteada a cambio321. Válida durante 2 minutos",
                "var(--color-exito)"
            );

            return;
        } catch (error) {
            console.error(
                "Error al resetear contraseña:",
                error
            );

            mostrarMensaje(
                mensajeAccionesAdminSuperior,
                "no se pudo conectar con el servidor",
                "var(--color-error)"
            );

            return;
        }
    }

    cuenta.contrasena =
        "1234";

    if (origen === "usuarios") {
        guardarUsuarios(
            usuarios
        );
    } else {
        guardarAdministradores(
            administradores
        );
    }

    mostrarMensaje(
        mensajeAccionesAdminSuperior,
        "contraseña local reseteada a 1234",
        "var(--color-exito)"
    );

    renderizarTodoAdminSuperior();
}

async function eliminarCuentaDesdeAdminSuperior(
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
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "la cuenta no fue encontrada",
            "var(--color-error)"
        );

        return;
    }

    if (
        origen ===
        "administradores" &&
        cuenta.tipo ===
        "adminSuperior"
    ) {
        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "no se puede eliminar una cuenta de admin superior",
            "var(--color-error)"
        );

        return;
    }

    const confirmado =
        confirm(
            "¿Seguro que querés eliminar la cuenta de " +
            cuenta.nombre +
            "? Esta acción no se puede deshacer."
        );

    if (!confirmado) {
        return;
    }

    if (
        cuenta.autenticacion ===
        "supabase"
    ) {
        const resultado =
            await eliminarCuentaRealSupabase(
                cuenta.id
            );

        if (!resultado.correcto) {
            mostrarMensaje(
                mensajeAccionesAdminSuperior,
                resultado.mensaje,
                "var(--color-error)"
            );

            return;
        }

        await cargarUsuariosParaAdministracion();

        await cargarAdministradoresDesdeSupabase();

        await cargarAlmacenerosDesdeSupabase();

        renderizarTodoAdminSuperior();

        mostrarMensaje(
            mensajeAccionesAdminSuperior,
            "cuenta eliminada correctamente",
            "var(--color-exito)"
        );

        return;
    }

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

        guardarUsuarios(
            usuarios
        );
    } else {
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
    }

    renderizarTodoAdminSuperior();

    mostrarMensaje(
        mensajeAccionesAdminSuperior,
        "cuenta local eliminada correctamente",
        "var(--color-exito)"
    );
}

function resetearContrasenaAdministrador(
    idAdministrador
) {
    resetearContrasenaDesdeAdminSuperior(
        "administradores",
        idAdministrador
    );
}

async function borrarAdministradorComun(
    idAdministrador
) {
    await eliminarCuentaDesdeAdminSuperior(
        "administradores",
        idAdministrador
    );
}

function resetearContrasenaAlmacenero(
    idAlmacenero
) {
    resetearContrasenaDesdeAdminSuperior(
        "administradores",
        idAlmacenero
    );
}

async function borrarAlmacenero(
    idAlmacenero
) {
    await eliminarCuentaDesdeAdminSuperior(
        "administradores",
        idAlmacenero
    );
}

async function crearAdministradorDesdePanelSuperior() {
    const inputUsuario =
        document.querySelector(
            "#inputUsuarioNuevoAdmin"
        );

    const inputNombre =
        document.querySelector(
            "#inputNombreNuevoAdmin"
        );

    const inputContrasena =
        document.querySelector(
            "#inputContrasenaNuevoAdmin"
        );

    const boton =
        document.querySelector(
            "#botonCrearNuevoAdmin"
        );

    const mensaje =
        document.querySelector(
            "#mensajeCrearNuevoAdmin"
        );

    if (
        inputUsuario === null ||
        inputNombre === null ||
        inputContrasena === null ||
        boton === null ||
        mensaje === null
    ) {
        return;
    }

    const usuario =
        inputUsuario.value
            .trim()
            .toLowerCase();

    const nombre =
        inputNombre.value.trim();

    const contrasena =
        inputContrasena.value.trim();

    limpiarMensaje(
        mensaje
    );

    if (
        usuario === "" ||
        nombre === "" ||
        contrasena === ""
    ) {
        mostrarMensaje(
            mensaje,
            "completá todos los campos",
            "var(--color-error)"
        );

        return;
    }

    boton.disabled =
        true;

    try {
        const respuestaSesion =
            await window
                .supabaseCliente
                .auth
                .getSession();

        const sesionSupabase =
            respuestaSesion
                .data
                ?.session;

        if (
            respuestaSesion.error ||
            !sesionSupabase
        ) {
            mostrarMensaje(
                mensaje,
                "la sesión del administrador superior no es válida",
                "var(--color-error)"
            );

            return;
        }

        const respuesta =
            await fetch(
                "/api/usuarios/crear-admin",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            "Bearer " +
                            sesionSupabase
                                .access_token
                    },

                    body:
                        JSON.stringify({
                            usuario:
                                usuario,

                            nombre:
                                nombre,

                            contrasena:
                                contrasena
                        })
                }
            );

        const resultado =
            await respuesta.json();

        if (
            !respuesta.ok ||
            resultado.ok !== true
        ) {
            mostrarMensaje(
                mensaje,
                resultado.mensaje ||
                "no se pudo crear el administrador",
                "var(--color-error)"
            );

            return;
        }

        inputUsuario.value =
            "";

        inputNombre.value =
            "";

        inputContrasena.value =
            "";

        await cargarAdministradoresDesdeSupabase();

        await cargarAlmacenerosDesdeSupabase();

        renderizarTodoAdminSuperior();

        mostrarMensaje(
            mensaje,
            "administrador creado correctamente",
            "var(--color-exito)"
        );
    } catch (error) {
        console.error(
            "Error al crear administrador:",
            error
        );

        mostrarMensaje(
            mensaje,
            "no se pudo conectar con el servidor",
            "var(--color-error)"
        );
    } finally {
        boton.disabled =
            false;
    }
}

// =======================================================
// CREAR ALMACENERO DESDE ADMIN SUPERIOR
// =======================================================

async function crearAlmaceneroDesdePanelSuperior() {
    if (
        inputUsuarioNuevoAlmacenero ===
        null ||
        inputNombreNuevoAlmacenero ===
        null ||
        inputContrasenaNuevoAlmacenero ===
        null ||
        botonCrearNuevoAlmacenero ===
        null ||
        mensajeCrearNuevoAlmacenero ===
        null
    ) {
        return;
    }

    const usuario =
        inputUsuarioNuevoAlmacenero
            .value
            .trim()
            .toLowerCase();

    const nombre =
        inputNombreNuevoAlmacenero
            .value
            .trim();

    const contrasena =
        inputContrasenaNuevoAlmacenero
            .value
            .trim();

    limpiarMensaje(
        mensajeCrearNuevoAlmacenero
    );

    if (
        usuario === "" ||
        nombre === "" ||
        contrasena === ""
    ) {
        mostrarMensaje(
            mensajeCrearNuevoAlmacenero,
            "completá todos los campos",
            "var(--color-error)"
        );

        return;
    }

    botonCrearNuevoAlmacenero.disabled =
        true;

    try {
        if (
            typeof window.supabaseCliente ===
            "undefined"
        ) {
            mostrarMensaje(
                mensajeCrearNuevoAlmacenero,
                "el servicio de Supabase no está disponible",
                "var(--color-error)"
            );

            return;
        }

        const respuestaSesion =
            await window
                .supabaseCliente
                .auth
                .getSession();

        const sesionSupabase =
            respuestaSesion
                .data
                ?.session;

        if (
            respuestaSesion.error ||
            !sesionSupabase
        ) {
            mostrarMensaje(
                mensajeCrearNuevoAlmacenero,
                "la sesión del administrador superior no es válida",
                "var(--color-error)"
            );

            return;
        }

        const respuesta =
            await fetch(
                "/api/usuarios/crear-almacenero",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            "Bearer " +
                            sesionSupabase
                                .access_token
                    },

                    body:
                        JSON.stringify({
                            usuario:
                                usuario,

                            nombre:
                                nombre,

                            contrasena:
                                contrasena
                        })
                }
            );

        let resultado = {};

        try {
            resultado =
                await respuesta.json();
        } catch (error) {
            resultado = {};
        }

        if (
            !respuesta.ok ||
            resultado.ok !== true
        ) {
            mostrarMensaje(
                mensajeCrearNuevoAlmacenero,
                resultado.mensaje ||
                "no se pudo crear el almacenero",
                "var(--color-error)"
            );

            return;
        }

        const datosAlmacenero =
            resultado.almacenero;

        if (
            datosAlmacenero !== null &&
            typeof datosAlmacenero ===
            "object"
        ) {
            let encontrado =
                false;

            for (
                let i = 0;
                i < administradores.length;
                i++
            ) {
                if (
                    administradores[i].id ===
                    datosAlmacenero.id ||
                    String(
                        administradores[i]
                            .usuario
                    ).toLowerCase() ===
                    usuario
                ) {
                    administradores[i] = {
                        id:
                            datosAlmacenero.id,

                        tipo:
                            "operadorVales",

                        usuario:
                            usuario,

                        nombre:
                            nombre,

                        contrasena:
                            "",

                        debeCambiarContrasena:
                            false,

                        autenticacion:
                            "supabase"
                    };

                    encontrado =
                        true;

                    break;
                }
            }

            if (!encontrado) {
                administradores.push({
                    id:
                        datosAlmacenero.id,

                    tipo:
                        "operadorVales",

                    usuario:
                        usuario,

                    nombre:
                        nombre,

                    contrasena:
                        "",

                    debeCambiarContrasena:
                        false,

                    autenticacion:
                        "supabase"
                });
            }
        }

        inputUsuarioNuevoAlmacenero.value =
            "";

        inputNombreNuevoAlmacenero.value =
            "";

        inputContrasenaNuevoAlmacenero.value =
            "";

        await cargarAlmacenerosDesdeSupabase();

        renderizarTodoAdminSuperior();

        mostrarMensaje(
            mensajeCrearNuevoAlmacenero,
            "almacenero creado correctamente",
            "var(--color-exito)"
        );
    } catch (error) {
        console.error(
            "Error al crear almacenero:",
            error
        );

        mostrarMensaje(
            mensajeCrearNuevoAlmacenero,
            "no se pudo conectar con el servidor",
            "var(--color-error)"
        );
    } finally {
        botonCrearNuevoAlmacenero.disabled =
            false;
    }
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
        "soporte del proyecto estudiantil disponible con el docente",
        "var(--color-principal)"
    );
}

// =======================================================
// EVENTOS
// =======================================================

escuchar(
    selectAlmacenTitular,
    "change",
    cambiarAlmacenTitular
);


escuchar(
    botonGuardarContrasenaObligatoria,
    "click",
    guardarContrasenaObligatoria
);

escuchar(
    botonSalirCambioContrasena,
    "click",
    salirSistema
);

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

escuchar(
    botonCrearNuevoAlmacenero,
    "click",
    crearAlmaceneroDesdePanelSuperior
);


escuchar(
    selectAlmacenFondoAdmin,
    "change",
    consultarFondoSeleccionadoAdmin
);

escuchar(
    botonCargarFondoAdmin,
    "click",
    cargarFondoDesdeAdministrador
);


escuchar(
    botonRetirarFondoAdmin,
    "click",
    retirarFondoDesdeAdministrador
);



escuchar(
    botonActualizarAlmacenesAdmin,
    "click",
    cargarAlmacenesFondoAdmin
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

const botonCrearNuevoAdmin =
    document.querySelector(
        "#botonCrearNuevoAdmin"
    );

if (botonCrearNuevoAdmin !== null) {
    botonCrearNuevoAdmin.addEventListener(
        "click",
        crearAdministradorDesdePanelSuperior
    );
}



// =======================================================
// RESTAURAR PANEL DEL ALMACENERO
// =======================================================

let restauracionAlmaceneroEnCurso =
    false;

async function aplicarSesionAlmaceneroRestaurada(
    usuarioSupabase
) {
    if (
        usuarioSupabase === null ||
        typeof usuarioSupabase !==
        "object" ||
        usuarioSupabase.tipo !==
        "operador_vales"
    ) {
        return false;
    }

    let almacenero =
        buscarAdministradorPorNombreUsuario(
            usuarioSupabase.usuario
        );

    if (almacenero === null) {
        almacenero = {
            id:
                siguienteIdAdmin,

            tipo:
                "operadorVales",

            usuario:
                usuarioSupabase.usuario,

            nombre:
                usuarioSupabase.nombre,

            contrasena:
                "",

            debeCambiarContrasena:
                usuarioSupabase
                    .debeCambiarContrasena ===
                true,

            autenticacion:
                "supabase"
        };

        administradores.push(
            almacenero
        );

        siguienteIdAdmin++;
    } else {
        almacenero.tipo =
            "operadorVales";

        almacenero.nombre =
            usuarioSupabase.nombre;

        almacenero.debeCambiarContrasena =
            usuarioSupabase
                .debeCambiarContrasena ===
            true;

        almacenero.autenticacion =
            "supabase";
    }

    sesion.tipo =
        "operadorVales";

    sesion.adminId =
        almacenero.id;

    sesion.usuarioId =
        null;

    sesion.origen =
        "supabase";

    if (
        almacenero
            .debeCambiarContrasena
    ) {
        abrirCambioContrasenaObligatorio();

        return true;
    }

    await abrirPanelAlmacenero();

    return true;
}

async function restaurarAlmaceneroAlVolver() {
    if (restauracionAlmaceneroEnCurso) {
        return;
    }

    if (
        typeof window.usuariosRepository ===
        "undefined" ||
        typeof window
            .usuariosRepository
            .restaurarSesion !==
        "function"
    ) {
        return;
    }

    restauracionAlmaceneroEnCurso =
        true;

    try {
        const resultado =
            await window
                .usuariosRepository
                .restaurarSesion();

        if (
            !resultado.correcto ||
            !resultado.sesionEncontrada
        ) {
            return;
        }

        await aplicarSesionAlmaceneroRestaurada(
            resultado.usuario
        );
    } catch (error) {
        console.error(
            "Error al recuperar al almacenero:",
            error
        );
    } finally {
        restauracionAlmaceneroEnCurso =
            false;
    }
}

// =======================================================
// RECUPERAR SESIÓN AL VOLVER DESDE EL VALE EN CELULAR
// =======================================================

let temporizadorRestauracionAlmacenero =
    null;

function programarRestauracionAlmacenero() {
    if (
        document.visibilityState ===
        "hidden"
    ) {
        return;
    }

    if (
        temporizadorRestauracionAlmacenero !==
        null
    ) {
        clearTimeout(
            temporizadorRestauracionAlmacenero
        );
    }

    temporizadorRestauracionAlmacenero =
        setTimeout(
            function () {
                temporizadorRestauracionAlmacenero =
                    null;

                restaurarAlmaceneroAlVolver();
            },
            150
        );
}

window.addEventListener(
    "pageshow",
    programarRestauracionAlmacenero
);

window.addEventListener(
    "focus",
    programarRestauracionAlmacenero
);

document.addEventListener(
    "visibilitychange",
    function () {
        if (
            document.visibilityState ===
            "visible"
        ) {
            programarRestauracionAlmacenero();
        }
    }
);

programarRestauracionAlmacenero();
