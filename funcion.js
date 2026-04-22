// bloque datos iniciales del sistema

let usuarios = [
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

let administradores = [
    {
        id: 1,
        tipo: "admin",
        usuario: "marcosadm",
        nombre: "Marcos",
        contrasena: "1234"
    }
];

let productos = [
    { id: 1, nombre: "manzana", precio: 40 },
    { id: 2, nombre: "barra de cereal", precio: 55 },
    { id: 3, nombre: "yogur", precio: 65 },
    { id: 4, nombre: "jugo natural", precio: 70 },
    { id: 5, nombre: "sandwich saludable", precio: 120 }
];

let siguienteIdUsuario = 2;
let siguienteIdAdmin = 2;
let siguienteIdProducto = 6;

let configuracionSistema = {
    saldoInicialUsuarios: 0,
    registroPublicoHabilitado: true
};

let sesion = {
    tipo: "",
    usuarioId: null,
    adminId: null
};

let carrito = [];

// bloque configuracion de backend para admin superior
// estos endpoints deben existir en tu backend o funcion serverless
// el correo autorizado nunca debe quedar expuesto en el frontend

const URL_ENVIAR_CODIGO_ADMIN_SUPERIOR = "/api/admin-superior/enviar-codigo";
const URL_VALIDAR_CODIGO_ADMIN_SUPERIOR = "/api/admin-superior/validar-codigo";

let codigoAdminSuperiorEnviado = false;

// bloque referencias del dom

const pantallaInicio = document.querySelector("#pantallaInicio");
const pantallaRegistro = document.querySelector("#pantallaRegistro");
const pantallaBilletera = document.querySelector("#pantallaBilletera");
const pantallaAdmin = document.querySelector("#pantallaAdmin");
const pantallaAdminSuperior = document.querySelector("#pantallaAdminSuperior");

const inputUsuarioIngreso = document.querySelector("#inputUsuarioIngreso");
const inputContrasenaIngreso = document.querySelector("#inputContrasenaIngreso");
const botonIngresarSistema = document.querySelector("#botonIngresarSistema");
const botonIrRegistro = document.querySelector("#botonIrRegistro");
const mensajeInicio = document.querySelector("#mensajeInicio");

const botonRecuperarAcceso = document.querySelector("#botonRecuperarAcceso");
const botonSoporte = document.querySelector("#botonSoporte");

const selectTipoRegistro = document.querySelector("#selectTipoRegistro");
const inputUsuarioRegistro = document.querySelector("#inputUsuarioRegistro");
const inputNombreRegistro = document.querySelector("#inputNombreRegistro");
const inputCursoRegistro = document.querySelector("#inputCursoRegistro");
const inputContrasenaRegistro = document.querySelector("#inputContrasenaRegistro");
const bloqueCursoRegistro = document.querySelector("#bloqueCursoRegistro");
const bloqueAdminSuperiorCodigo = document.querySelector("#bloqueAdminSuperiorCodigo");
const inputCodigoAdminSuperior = document.querySelector("#inputCodigoAdminSuperior");
const botonEnviarCodigoAdminSuperior = document.querySelector("#botonEnviarCodigoAdminSuperior");
const mensajeAdminSuperiorRegistro = document.querySelector("#mensajeAdminSuperiorRegistro");
const botonRegistrarCuenta = document.querySelector("#botonRegistrarCuenta");
const botonVolverInicioDesdeRegistro = document.querySelector("#botonVolverInicioDesdeRegistro");
const mensajeRegistro = document.querySelector("#mensajeRegistro");

const textoUsuarioActual = document.querySelector("#textoUsuarioActual");
const nombreTitular = document.querySelector("#nombreTitular");
const cursoTitular = document.querySelector("#cursoTitular");
const saldoDisponible = document.querySelector("#saldoDisponible");
const estadoTitular = document.querySelector("#estadoTitular");
const listaProductos = document.querySelector("#listaProductos");
const listaCarrito = document.querySelector("#listaCarrito");
const totalCarrito = document.querySelector("#totalCarrito");
const botonConfirmarCompra = document.querySelector("#botonConfirmarCompra");
const botonVaciarCarrito = document.querySelector("#botonVaciarCarrito");
const botonSalirSistema = document.querySelector("#botonSalirSistema");
const mensajeCompra = document.querySelector("#mensajeCompra");
const listaHistorial = document.querySelector("#listaHistorial");

const textoAdminActual = document.querySelector("#textoAdminActual");
const botonSalirAdmin = document.querySelector("#botonSalirAdmin");
const listaUsuariosAdmin = document.querySelector("#listaUsuariosAdmin");
const inputNombreProducto = document.querySelector("#inputNombreProducto");
const inputPrecioProducto = document.querySelector("#inputPrecioProducto");
const botonAgregarProducto = document.querySelector("#botonAgregarProducto");
const listaProductosAdmin = document.querySelector("#listaProductosAdmin");
const listaHistorialAdmin = document.querySelector("#listaHistorialAdmin");

const textoAdminSuperiorActual = document.querySelector("#textoAdminSuperiorActual");
const botonSalirAdminSuperior = document.querySelector("#botonSalirAdminSuperior");
const listaAdministradoresAdminSuperior = document.querySelector("#listaAdministradoresAdminSuperior");
const inputSaldoInicialSistema = document.querySelector("#inputSaldoInicialSistema");
const botonGuardarSaldoInicialSistema = document.querySelector("#botonGuardarSaldoInicialSistema");
const botonAlternarRegistroPublico = document.querySelector("#botonAlternarRegistroPublico");
const mensajeAdminSuperiorPanel = document.querySelector("#mensajeAdminSuperiorPanel");
const listaHistorialGlobalAdminSuperior = document.querySelector("#listaHistorialGlobalAdminSuperior");
const panelEstadisticasAdminSuperior = document.querySelector("#panelEstadisticasAdminSuperior");





// bloque funciones de utilidad general


function mostrarPantalla(idPantalla) {
    pantallaInicio.classList.add("oculto");
    pantallaRegistro.classList.add("oculto");
    pantallaBilletera.classList.add("oculto");
    pantallaAdmin.classList.add("oculto");
    pantallaAdminSuperior.classList.add("oculto");

    document.querySelector(idPantalla).classList.remove("oculto");
}

function obtenerFechaActual() {
    return new Date().toLocaleString("es-UY");
}

function formatearMoneda(valor) {
    return "$ " + valor;
}

function mostrarMensaje(elemento, texto, color) {
    elemento.textContent = texto;
    elemento.style.color = color;
}

function limpiarMensaje(elemento) {
    elemento.textContent = "";
    elemento.style.color = "";
}

function limpiarMensajesPrincipales() {
    limpiarMensaje(mensajeInicio);
    limpiarMensaje(mensajeRegistro);
    limpiarMensaje(mensajeCompra);
    limpiarMensaje(estadoTitular);
    limpiarMensaje(mensajeAdminSuperiorRegistro);
    limpiarMensaje(mensajeAdminSuperiorPanel);
}

function buscarUsuarioPorId(idBuscado) {
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].id === idBuscado) {
            return usuarios[i];
        }
    }

    return null;
}

function buscarUsuarioPorNombreUsuario(nombreBuscado) {
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].usuario.toLowerCase() === nombreBuscado.toLowerCase()) {
            return usuarios[i];
        }
    }

    return null;
}

function buscarAdministradorPorNombreUsuario(nombreBuscado) {
    for (let i = 0; i < administradores.length; i++) {
        if (administradores[i].usuario.toLowerCase() === nombreBuscado.toLowerCase()) {
            return administradores[i];
        }
    }

    return null;
}

function buscarAdministradorPorId(idBuscado) {
    for (let i = 0; i < administradores.length; i++) {
        if (administradores[i].id === idBuscado) {
            return administradores[i];
        }
    }

    return null;
}

function buscarProductoPorId(idBuscado) {
    for (let i = 0; i < productos.length; i++) {
        if (productos[i].id === idBuscado) {
            return productos[i];
        }
    }

    return null;
}

function registrarMovimientoUsuario(idUsuario, tipo, detalle, monto, saldoResultante) {
    const usuario = buscarUsuarioPorId(idUsuario);

    if (usuario === null) {
        return;
    }

    usuario.historial.unshift({
        tipo: tipo,
        detalle: detalle,
        monto: monto,
        saldoResultante: saldoResultante,
        fecha: obtenerFechaActual()
    });
}

function obtenerUsuarioActivo() {
    if (sesion.tipo !== "titular") {
        return null;
    }

    return buscarUsuarioPorId(sesion.usuarioId);
}

function obtenerAdministradorActivo() {
    if (sesion.tipo !== "admin" && sesion.tipo !== "adminSuperior") {
        return null;
    }

    return buscarAdministradorPorId(sesion.adminId);
}

function calcularTotalCarrito() {
    let total = 0;

    for (let i = 0; i < carrito.length; i++) {
        total += carrito[i].precio;
    }

    return total;
}

function existeUsuarioRepetido(nombreUsuario) {
    if (buscarUsuarioPorNombreUsuario(nombreUsuario) !== null) {
        return true;
    }

    if (buscarAdministradorPorNombreUsuario(nombreUsuario) !== null) {
        return true;
    }

    return false;
}



// bloque funciones de almacenamiento temporal admin superior

function guardarCodigoAdminSuperiorLocal(nombreUsuario, codigo) {
    localStorage.setItem(
        "adminSuperiorTemporal",
        JSON.stringify({
            usuario: String(nombreUsuario).trim(),
            codigo: String(codigo).trim()
        })
    );
}






function obtenerCodigoAdminSuperiorLocal() {
    const datosGuardados = localStorage.getItem("adminSuperiorTemporal");

    if (datosGuardados === null) {
        return null;
    }

    return JSON.parse(datosGuardados);
}




function limpiarCodigoAdminSuperiorLocal() {
    localStorage.removeItem("adminSuperiorTemporal");
}












// bloque funciones de interfaz de registro

function actualizarFormularioRegistro() {
    const tipoSeleccionado = selectTipoRegistro.value;

    if (tipoSeleccionado === "titular") {
        bloqueCursoRegistro.classList.remove("oculto");
    } else {
        bloqueCursoRegistro.classList.add("oculto");
    }

    if (tipoSeleccionado === "adminSuperior") {
        bloqueAdminSuperiorCodigo.classList.remove("oculto");
    } else {
        bloqueAdminSuperiorCodigo.classList.add("oculto");
        inputCodigoAdminSuperior.value = "";
        codigoAdminSuperiorEnviado = false;
        limpiarMensaje(mensajeAdminSuperiorRegistro);
    }
}

// bloque funciones backend admin superior


// bloque funciones backend admin superior

async function enviarCodigoAdminSuperior() {
    const nombreUsuario = inputUsuarioRegistro.value.trim();
    const nombreVisible = inputNombreRegistro.value.trim();

    if (nombreUsuario === "" || nombreVisible === "") {
        mostrarMensaje(
            mensajeAdminSuperiorRegistro,
            "completá primero usuario y nombre antes de enviar el código",
            "var(--color-error)"
        );
        return;
    }

    try {
        botonEnviarCodigoAdminSuperior.disabled = true;

        const respuesta = await fetch(URL_ENVIAR_CODIGO_ADMIN_SUPERIOR, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: nombreUsuario
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.detalle || datos.mensaje || "no se pudo enviar el código");
        }

        guardarCodigoAdminSuperiorLocal(nombreUsuario, datos.codigo);

        codigoAdminSuperiorEnviado = true;
        mostrarMensaje(
            mensajeAdminSuperiorRegistro,
            "código enviado correctamente al correo autorizado",
            "var(--color-exito)"
        );
    } catch (error) {
        codigoAdminSuperiorEnviado = false;
        mostrarMensaje(
            mensajeAdminSuperiorRegistro,
            error.message,
            "var(--color-error)"
        );
    } finally {
        botonEnviarCodigoAdminSuperior.disabled = false;
    }
}



async function validarCodigoAdminSuperiorConBackend(nombreUsuario, codigoIngresado) {
    const datosTemporales = obtenerCodigoAdminSuperiorLocal();

    if (datosTemporales === null) {
        throw new Error("no hay código guardado en localStorage");
    }

    const usuarioGuardado = String(datosTemporales.usuario).trim();
    const codigoGuardado = String(datosTemporales.codigo).trim();
    const usuarioActual = String(nombreUsuario).trim();
    const codigoActual = String(codigoIngresado).trim();

    if (usuarioGuardado !== usuarioActual) {
        throw new Error(
            "usuario distinto. guardado: [" + usuarioGuardado + "] actual: [" + usuarioActual + "]"
        );
    }

    if (codigoGuardado !== codigoActual) {
        throw new Error(
            "código distinto. guardado: [" + codigoGuardado + "] ingresado: [" + codigoActual + "]"
        );
    }

    return {
        ok: true
    };
}
// bloque funciones de render de titular

function renderizarResumenBilletera() {
    const usuarioActivo = obtenerUsuarioActivo();

    if (usuarioActivo === null) {
        return;
    }

    textoUsuarioActual.textContent = "usuario activo: " + usuarioActivo.nombre + " (" + usuarioActivo.usuario + ")";
    nombreTitular.textContent = usuarioActivo.nombre;
    cursoTitular.textContent = usuarioActivo.curso;
    saldoDisponible.textContent = formatearMoneda(usuarioActivo.saldo);

    if (usuarioActivo.bloqueado) {
        mostrarMensaje(estadoTitular, "usuario bloqueado: no puede hacer transacciones", "var(--color-advertencia)");
    } else {
        mostrarMensaje(estadoTitular, "usuario habilitado para operar", "var(--color-exito)");
    }
}

function renderizarProductos() {
    listaProductos.innerHTML = "";

    if (productos.length === 0) {
        listaProductos.innerHTML = '<p class="lista-vacia">no hay productos disponibles</p>';
        return;
    }

    for (let i = 0; i < productos.length; i++) {
        const producto = productos[i];

        listaProductos.innerHTML += `
            <div class="producto">
                <p class="producto-nombre">${producto.nombre}</p>
                <p class="producto-precio">${formatearMoneda(producto.precio)}</p>
                <button class="boton" onclick="agregarProductoAlCarrito(${producto.id})">agregar al carrito</button>
            </div>
        `;
    }
}

function renderizarCarrito() {
    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<p class="lista-vacia">el carrito está vacío</p>';
        totalCarrito.textContent = formatearMoneda(0);
        return;
    }

    for (let i = 0; i < carrito.length; i++) {
        const productoCarrito = carrito[i];

        listaCarrito.innerHTML += `
            <div class="item-carrito">
                <p class="carrito-nombre">${productoCarrito.nombre}</p>
                <p class="carrito-precio">${formatearMoneda(productoCarrito.precio)}</p>
                <button class="boton boton-secundario" onclick="quitarProductoDelCarrito(${i})">quitar</button>
            </div>
        `;
    }

    totalCarrito.textContent = formatearMoneda(calcularTotalCarrito());
}

function renderizarHistorialTitular() {
    const usuarioActivo = obtenerUsuarioActivo();

    listaHistorial.innerHTML = "";

    if (usuarioActivo === null || usuarioActivo.historial.length === 0) {
        listaHistorial.innerHTML = '<p class="lista-vacia">todavía no hay movimientos registrados</p>';
        return;
    }

    for (let i = 0; i < usuarioActivo.historial.length; i++) {
        const movimiento = usuarioActivo.historial[i];

        listaHistorial.innerHTML += `
            <div class="item-historial">
                <p class="historial-detalle">${movimiento.detalle}</p>
                <p class="historial-monto">tipo: ${movimiento.tipo}</p>
                <p class="historial-monto">monto: ${formatearMoneda(movimiento.monto)}</p>
                <p class="historial-monto">saldo resultante: ${formatearMoneda(movimiento.saldoResultante)}</p>
                <p class="historial-fecha">${movimiento.fecha}</p>
            </div>
        `;
    }
}

// bloque funciones de render administrador comun

function renderizarAdministradorActivo() {
    const adminActivo = obtenerAdministradorActivo();

    if (adminActivo === null) {
        textoAdminActual.textContent = "sin administrador activo";
        return;
    }

    textoAdminActual.textContent = "administrador activo: " + adminActivo.nombre + " (" + adminActivo.usuario + ")";
}

function renderizarUsuariosAdmin() {
    listaUsuariosAdmin.innerHTML = "";

    if (usuarios.length === 0) {
        listaUsuariosAdmin.innerHTML = '<p class="lista-vacia">no hay usuarios registrados</p>';
        return;
    }

    for (let i = 0; i < usuarios.length; i++) {
        const usuario = usuarios[i];
        const claseBloqueado = usuario.bloqueado ? "item-usuario-admin usuario-bloqueado" : "item-usuario-admin";
        const textoBloqueo = usuario.bloqueado ? "desbloquear usuario" : "bloquear usuario";

        listaUsuariosAdmin.innerHTML += `
            <div class="${claseBloqueado}">
                <p class="usuario-admin-nombre">${usuario.nombre}</p>
                <p class="usuario-admin-dato">usuario: ${usuario.usuario}</p>
                <p class="usuario-admin-dato">curso: ${usuario.curso}</p>
                <p class="usuario-admin-dato">saldo: ${formatearMoneda(usuario.saldo)}</p>
                <p class="usuario-admin-dato">estado: ${usuario.bloqueado ? "bloqueado" : "activo"}</p>

                <div class="acciones-usuario-admin">
                    <button class="boton boton-chico" onclick="agregarDineroAUsuario(${usuario.id})">agregar dinero</button>
                    <button class="boton boton-advertencia boton-chico" onclick="alternarBloqueoUsuario(${usuario.id})">${textoBloqueo}</button>
                    <button class="boton boton-peligro boton-chico" onclick="borrarUsuario(${usuario.id})">borrar usuario</button>
                </div>
            </div>
        `;
    }
}

function renderizarProductosAdmin() {
    listaProductosAdmin.innerHTML = "";

    if (productos.length === 0) {
        listaProductosAdmin.innerHTML = '<p class="lista-vacia">no hay productos cargados</p>';
        return;
    }

    for (let i = 0; i < productos.length; i++) {
        const producto = productos[i];

        listaProductosAdmin.innerHTML += `
            <div class="item-producto-admin">
                <p class="producto-nombre">${producto.nombre}</p>
                <p class="producto-precio">${formatearMoneda(producto.precio)}</p>
                <button class="boton boton-peligro boton-chico" onclick="quitarProducto(${producto.id})">quitar producto</button>
            </div>
        `;
    }
}

function renderizarHistorialAdmin() {
    listaHistorialAdmin.innerHTML = "";

    let hayMovimientos = false;

    for (let i = 0; i < usuarios.length; i++) {
        const usuario = usuarios[i];

        for (let j = 0; j < usuario.historial.length; j++) {
            const movimiento = usuario.historial[j];
            hayMovimientos = true;

            listaHistorialAdmin.innerHTML += `
                <div class="item-historial">
                    <p class="historial-detalle">${usuario.nombre}: ${movimiento.detalle}</p>
                    <p class="historial-monto">tipo: ${movimiento.tipo}</p>
                    <p class="historial-monto">monto: ${formatearMoneda(movimiento.monto)}</p>
                    <p class="historial-monto">saldo resultante: ${formatearMoneda(movimiento.saldoResultante)}</p>
                    <p class="historial-fecha">${movimiento.fecha}</p>
                </div>
            `;
        }
    }

    if (!hayMovimientos) {
        listaHistorialAdmin.innerHTML = '<p class="lista-vacia">todavía no hay movimientos registrados</p>';
    }
}

function renderizarTodoAdmin() {
    renderizarAdministradorActivo();
    renderizarUsuariosAdmin();
    renderizarProductosAdmin();
    renderizarHistorialAdmin();
}

// bloque funciones de render admin superior

function renderizarAdminSuperiorActivo() {
    const adminActivo = obtenerAdministradorActivo();

    if (adminActivo === null) {
        textoAdminSuperiorActual.textContent = "sin admin superior activo";
        return;
    }

    textoAdminSuperiorActual.textContent = "admin superior activo: " + adminActivo.nombre + " (" + adminActivo.usuario + ")";
}

function renderizarAdministradoresAdminSuperior() {
    listaAdministradoresAdminSuperior.innerHTML = "";

    let cantidadAdminsComunes = 0;

    for (let i = 0; i < administradores.length; i++) {
        const admin = administradores[i];

        if (admin.tipo === "admin") {
            cantidadAdminsComunes++;

            listaAdministradoresAdminSuperior.innerHTML += `
                <div class="item-admin-superior">
                    <p class="admin-superior-nombre">${admin.nombre}</p>
                    <p class="admin-superior-dato">usuario: ${admin.usuario}</p>
                    <p class="admin-superior-dato">tipo: ${admin.tipo}</p>

                    <div class="acciones-usuario-admin">
                        <button class="boton boton-chico" onclick="resetearContrasenaAdministrador(${admin.id})">resetear contraseña</button>
                        <button class="boton boton-peligro boton-chico" onclick="borrarAdministradorComun(${admin.id})">borrar admin</button>
                    </div>
                </div>
            `;
        }
    }

    if (cantidadAdminsComunes === 0) {
        listaAdministradoresAdminSuperior.innerHTML = '<p class="lista-vacia">no hay administradores comunes registrados</p>';
    }
}

function renderizarHistorialGlobalAdminSuperior() {
    listaHistorialGlobalAdminSuperior.innerHTML = "";

    let hayMovimientos = false;

    for (let i = 0; i < usuarios.length; i++) {
        const usuario = usuarios[i];

        for (let j = 0; j < usuario.historial.length; j++) {
            const movimiento = usuario.historial[j];
            hayMovimientos = true;

            listaHistorialGlobalAdminSuperior.innerHTML += `
                <div class="item-historial">
                    <p class="historial-detalle">${usuario.nombre}: ${movimiento.detalle}</p>
                    <p class="historial-monto">tipo: ${movimiento.tipo}</p>
                    <p class="historial-monto">monto: ${formatearMoneda(movimiento.monto)}</p>
                    <p class="historial-monto">saldo resultante: ${formatearMoneda(movimiento.saldoResultante)}</p>
                    <p class="historial-fecha">${movimiento.fecha}</p>
                </div>
            `;
        }
    }

    if (!hayMovimientos) {
        listaHistorialGlobalAdminSuperior.innerHTML = '<p class="lista-vacia">todavía no hay movimientos globales registrados</p>';
    }
}

function renderizarEstadisticasAdminSuperior() {
    panelEstadisticasAdminSuperior.innerHTML = "";

    let cantidadUsuarios = usuarios.length;
    let cantidadAdmins = 0;
    let cantidadAdminsSuperiores = 0;
    let cantidadUsuariosBloqueados = 0;
    let saldoTotalUsuarios = 0;

    for (let i = 0; i < administradores.length; i++) {
        if (administradores[i].tipo === "admin") {
            cantidadAdmins++;
        }

        if (administradores[i].tipo === "adminSuperior") {
            cantidadAdminsSuperiores++;
        }
    }

    for (let i = 0; i < usuarios.length; i++) {
        saldoTotalUsuarios += usuarios[i].saldo;

        if (usuarios[i].bloqueado) {
            cantidadUsuariosBloqueados++;
        }
    }

    panelEstadisticasAdminSuperior.innerHTML += `
        <div class="item-estadistica-admin-superior">
            <p>usuarios registrados</p>
            <p class="estadistica-valor">${cantidadUsuarios}</p>
        </div>
    `;

    panelEstadisticasAdminSuperior.innerHTML += `
        <div class="item-estadistica-admin-superior">
            <p>administradores comunes</p>
            <p class="estadistica-valor">${cantidadAdmins}</p>
        </div>
    `;

    panelEstadisticasAdminSuperior.innerHTML += `
        <div class="item-estadistica-admin-superior">
            <p>admins superiores</p>
            <p class="estadistica-valor">${cantidadAdminsSuperiores}</p>
        </div>
    `;

    panelEstadisticasAdminSuperior.innerHTML += `
        <div class="item-estadistica-admin-superior">
            <p>usuarios bloqueados</p>
            <p class="estadistica-valor">${cantidadUsuariosBloqueados}</p>
        </div>
    `;

    panelEstadisticasAdminSuperior.innerHTML += `
        <div class="item-estadistica-admin-superior">
            <p>saldo total de usuarios</p>
            <p class="estadistica-valor">${formatearMoneda(saldoTotalUsuarios)}</p>
        </div>
    `;
}

function renderizarTodoAdminSuperior() {
    renderizarAdminSuperiorActivo();
    renderizarAdministradoresAdminSuperior();
    renderizarHistorialGlobalAdminSuperior();
    renderizarEstadisticasAdminSuperior();
}

// bloque funciones de navegación

function irARegistro() {
    limpiarMensajesPrincipales();
    mostrarPantalla("#pantallaRegistro");
}

function volverAInicio() {
    limpiarMensajesPrincipales();
    inputCodigoAdminSuperior.value = "";
    codigoAdminSuperiorEnviado = false;
    limpiarCodigoAdminSuperiorLocal();
    mostrarPantalla("#pantallaInicio");
}

function abrirBilletera() {
    renderizarTodoTitular();
    mostrarPantalla("#pantallaBilletera");
}

function abrirPanelAdmin() {
    renderizarTodoAdmin();
    mostrarPantalla("#pantallaAdmin");
}

function abrirPanelAdminSuperior() {
    renderizarTodoAdminSuperior();
    mostrarPantalla("#pantallaAdminSuperior");
}

function salirSistema() {
    sesion.tipo = "";
    sesion.usuarioId = null;
    sesion.adminId = null;
    carrito = [];
    inputUsuarioIngreso.value = "";
    inputContrasenaIngreso.value = "";
    limpiarMensajesPrincipales();
    mostrarPantalla("#pantallaInicio");
}

// bloque funciones de registro

async function registrarCuenta() {
    const tipoCuenta = selectTipoRegistro.value;
    const nombreUsuario = inputUsuarioRegistro.value.trim();
    const nombreVisible = inputNombreRegistro.value.trim();
    const curso = inputCursoRegistro.value.trim();
    const contrasena = inputContrasenaRegistro.value.trim();

    if (!configuracionSistema.registroPublicoHabilitado) {
        mostrarMensaje(mensajeRegistro, "el registro público está deshabilitado", "var(--color-error)");
        return;
    }

    if (nombreUsuario === "" || nombreVisible === "" || contrasena === "") {
        mostrarMensaje(mensajeRegistro, "completá los campos obligatorios", "var(--color-error)");
        return;
    }

    if (existeUsuarioRepetido(nombreUsuario)) {
        mostrarMensaje(mensajeRegistro, "ese nombre de usuario ya existe", "var(--color-error)");
        return;
    }

    if (tipoCuenta === "titular") {
        if (curso === "") {
            mostrarMensaje(mensajeRegistro, "ingresá curso o grupo", "var(--color-error)");
            return;
        }

        usuarios.push({
            id: siguienteIdUsuario,
            tipo: "titular",
            usuario: nombreUsuario,
            nombre: nombreVisible,
            curso: curso,
            contrasena: contrasena,
            saldo: configuracionSistema.saldoInicialUsuarios,
            bloqueado: false,
            historial: []
        });

        registrarMovimientoUsuario(
            siguienteIdUsuario,
            "registro_usuario",
            "se registró el usuario " + nombreVisible,
            0,
            configuracionSistema.saldoInicialUsuarios
        );

        siguienteIdUsuario++;
    } else if (tipoCuenta === "admin") {
        administradores.push({
            id: siguienteIdAdmin,
            tipo: "admin",
            usuario: nombreUsuario,
            nombre: nombreVisible,
            contrasena: contrasena
        });

        siguienteIdAdmin++;
    } else if (tipoCuenta === "adminSuperior") {
        const codigoIngresado = inputCodigoAdminSuperior.value.trim();

        if (!codigoAdminSuperiorEnviado) {
            mostrarMensaje(
                mensajeRegistro,
                "primero debés enviar el código de validación",
                "var(--color-error)"
            );
            return;
        }

        if (codigoIngresado === "") {
            mostrarMensaje(
                mensajeRegistro,
                "ingresá el código recibido en el correo autorizado",
                "var(--color-error)"
            );
            return;
        }

        try {
            await validarCodigoAdminSuperiorConBackend(nombreUsuario, codigoIngresado);

            administradores.push({
                id: siguienteIdAdmin,
                tipo: "adminSuperior",
                usuario: nombreUsuario,
                nombre: nombreVisible,
                contrasena: contrasena
            });

            siguienteIdAdmin++;
            codigoAdminSuperiorEnviado = false;
            inputCodigoAdminSuperior.value = "";
            limpiarCodigoAdminSuperiorLocal();
            limpiarMensaje(mensajeAdminSuperiorRegistro);
        } catch (error) {
            mostrarMensaje(mensajeRegistro, error.message, "var(--color-error)");
            return;
        }
    }

    inputUsuarioRegistro.value = "";
    inputNombreRegistro.value = "";
    inputCursoRegistro.value = "";
    inputContrasenaRegistro.value = "";

    mostrarMensaje(mensajeRegistro, "registro guardado correctamente", "var(--color-exito)");
}

// bloque funciones de login automatico

function ingresarAlSistema() {
    const nombreUsuario = inputUsuarioIngreso.value.trim();
    const contrasena = inputContrasenaIngreso.value.trim();

    if (nombreUsuario === "" || contrasena === "") {
        mostrarMensaje(mensajeInicio, "completá usuario y contraseña", "var(--color-error)");
        return;
    }

    const adminEncontrado = buscarAdministradorPorNombreUsuario(nombreUsuario);

    if (adminEncontrado !== null) {
        if (adminEncontrado.contrasena !== contrasena) {
            mostrarMensaje(mensajeInicio, "contraseña incorrecta", "var(--color-error)");
            return;
        }

        sesion.adminId = adminEncontrado.id;
        sesion.usuarioId = null;

        if (adminEncontrado.tipo === "adminSuperior") {
            sesion.tipo = "adminSuperior";
            limpiarMensaje(mensajeInicio);
            abrirPanelAdminSuperior();
            return;
        }

        sesion.tipo = "admin";
        limpiarMensaje(mensajeInicio);
        abrirPanelAdmin();
        return;
    }

    const usuarioEncontrado = buscarUsuarioPorNombreUsuario(nombreUsuario);

    if (usuarioEncontrado !== null) {
        if (usuarioEncontrado.contrasena !== contrasena) {
            mostrarMensaje(mensajeInicio, "contraseña incorrecta", "var(--color-error)");
            return;
        }

        sesion.tipo = "titular";
        sesion.usuarioId = usuarioEncontrado.id;
        sesion.adminId = null;
        carrito = [];
        limpiarMensaje(mensajeInicio);
        abrirBilletera();
        return;
    }

    mostrarMensaje(mensajeInicio, "usuario no encontrado", "var(--color-error)");
}

// bloque funciones del titular

function agregarProductoAlCarrito(idProducto) {
    const usuarioActivo = obtenerUsuarioActivo();

    if (usuarioActivo === null) {
        return;
    }

    if (usuarioActivo.bloqueado) {
        mostrarMensaje(mensajeCompra, "usuario bloqueado: no puede hacer transacciones", "var(--color-error)");
        return;
    }

    const producto = buscarProductoPorId(idProducto);

    if (producto === null) {
        mostrarMensaje(mensajeCompra, "producto no encontrado", "var(--color-error)");
        return;
    }

    carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio
    });

    limpiarMensaje(mensajeCompra);
    renderizarCarrito();
}

function quitarProductoDelCarrito(indice) {
    carrito.splice(indice, 1);
    renderizarCarrito();
}

function vaciarCarrito() {
    carrito = [];
    renderizarCarrito();
}

function confirmarCompra() {
    const usuarioActivo = obtenerUsuarioActivo();

    if (usuarioActivo === null) {
        return;
    }

    if (usuarioActivo.bloqueado) {
        mostrarMensaje(mensajeCompra, "usuario bloqueado: no puede realizar compras", "var(--color-error)");
        return;
    }

    const total = calcularTotalCarrito();

    if (carrito.length === 0) {
        mostrarMensaje(mensajeCompra, "no hay productos en el carrito", "var(--color-error)");
        return;
    }

    if (total > usuarioActivo.saldo) {
        mostrarMensaje(mensajeCompra, "saldo insuficiente", "var(--color-error)");
        return;
    }

    usuarioActivo.saldo = usuarioActivo.saldo - total;

    registrarMovimientoUsuario(
        usuarioActivo.id,
        "compra",
        "compra realizada por " + usuarioActivo.nombre + " por " + formatearMoneda(total),
        -total,
        usuarioActivo.saldo
    );

    carrito = [];
    renderizarTodoTitular();
    mostrarMensaje(mensajeCompra, "compra aprobada correctamente", "var(--color-exito)");
}

function renderizarTodoTitular() {
    renderizarResumenBilletera();
    renderizarProductos();
    renderizarCarrito();
    renderizarHistorialTitular();
}

// bloque funciones del administrador comun

function agregarDineroAUsuario(idUsuario) {
    const usuario = buscarUsuarioPorId(idUsuario);

    if (usuario === null) {
        return;
    }

    const montoTexto = prompt("ingresá el monto a agregar");

    if (montoTexto === null) {
        return;
    }

    const monto = Number(montoTexto);

    if (isNaN(monto) || monto <= 0) {
        return;
    }

    usuario.saldo = usuario.saldo + monto;

    registrarMovimientoUsuario(
        usuario.id,
        "agregar_saldo",
        "el administrador agregó saldo por " + formatearMoneda(monto),
        monto,
        usuario.saldo
    );

    renderizarTodoAdmin();
}

function alternarBloqueoUsuario(idUsuario) {
    const usuario = buscarUsuarioPorId(idUsuario);

    if (usuario === null) {
        return;
    }

    usuario.bloqueado = !usuario.bloqueado;

    registrarMovimientoUsuario(
        usuario.id,
        usuario.bloqueado ? "bloqueo_usuario" : "desbloqueo_usuario",
        usuario.bloqueado ? "el administrador bloqueó el usuario" : "el administrador desbloqueó el usuario",
        0,
        usuario.saldo
    );

    renderizarTodoAdmin();

    const usuarioActivo = obtenerUsuarioActivo();

    if (usuarioActivo !== null && usuarioActivo.id === usuario.id) {
        renderizarTodoTitular();
    }
}

function borrarUsuario(idUsuario) {
    const usuarioActivo = obtenerUsuarioActivo();

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].id === idUsuario) {
            usuarios.splice(i, 1);
            break;
        }
    }

    if (usuarioActivo !== null && usuarioActivo.id === idUsuario) {
        salirSistema();
        return;
    }

    renderizarTodoAdmin();
}

function agregarProducto() {
    const nombre = inputNombreProducto.value.trim();
    const precio = Number(inputPrecioProducto.value);

    if (nombre === "" || isNaN(precio) || precio <= 0) {
        return;
    }

    productos.push({
        id: siguienteIdProducto,
        nombre: nombre,
        precio: precio
    });

    siguienteIdProducto++;

    inputNombreProducto.value = "";
    inputPrecioProducto.value = "";

    if (sesion.tipo === "adminSuperior") {
        renderizarTodoAdminSuperior();
        return;
    }

    renderizarTodoAdmin();
}

function quitarProducto(idProducto) {
    for (let i = 0; i < productos.length; i++) {
        if (productos[i].id === idProducto) {
            productos.splice(i, 1);
            break;
        }
    }

    if (sesion.tipo === "adminSuperior") {
        renderizarTodoAdminSuperior();
    } else {
        renderizarTodoAdmin();
    }

    if (sesion.tipo === "titular") {
        renderizarProductos();
    }
}

// bloque funciones del admin superior

function guardarSaldoInicialSistema() {
    const monto = Number(inputSaldoInicialSistema.value);

    if (isNaN(monto) || monto < 0) {
        mostrarMensaje(mensajeAdminSuperiorPanel, "ingresá un saldo inicial válido", "var(--color-error)");
        return;
    }

    configuracionSistema.saldoInicialUsuarios = monto;
    inputSaldoInicialSistema.value = "";

    mostrarMensaje(mensajeAdminSuperiorPanel, "saldo inicial guardado correctamente", "var(--color-exito)");
}

function alternarRegistroPublico() {
    configuracionSistema.registroPublicoHabilitado = !configuracionSistema.registroPublicoHabilitado;

    if (configuracionSistema.registroPublicoHabilitado) {
        mostrarMensaje(mensajeAdminSuperiorPanel, "registro público habilitado", "var(--color-exito)");
    } else {
        mostrarMensaje(mensajeAdminSuperiorPanel, "registro público deshabilitado", "var(--color-advertencia)");
    }
}

function resetearContrasenaAdministrador(idAdministrador) {
    for (let i = 0; i < administradores.length; i++) {
        if (administradores[i].id === idAdministrador && administradores[i].tipo === "admin") {
            administradores[i].contrasena = "1234";
            break;
        }
    }

    renderizarTodoAdminSuperior();
}

function borrarAdministradorComun(idAdministrador) {
    for (let i = 0; i < administradores.length; i++) {
        if (administradores[i].id === idAdministrador && administradores[i].tipo === "admin") {
            administradores.splice(i, 1);
            break;
        }
    }

    renderizarTodoAdminSuperior();
}

// bloque funciones de apoyo

function recuperarAcceso() {
    mostrarMensaje(mensajeInicio, "pedí apoyo al docente administrador", "var(--color-principal)");
}

function mostrarSoporte() {
    mostrarMensaje(mensajeInicio, "soporte del proyecto escolar disponible con el docente", "var(--color-principal)");
}

// bloque eventos de inicio

botonIngresarSistema.addEventListener("click", ingresarAlSistema);
botonIrRegistro.addEventListener("click", irARegistro);
botonRecuperarAcceso.addEventListener("click", recuperarAcceso);
botonSoporte.addEventListener("click", mostrarSoporte);

// bloque eventos de registro

selectTipoRegistro.addEventListener("change", actualizarFormularioRegistro);
botonEnviarCodigoAdminSuperior.addEventListener("click", enviarCodigoAdminSuperior);
botonRegistrarCuenta.addEventListener("click", registrarCuenta);
botonVolverInicioDesdeRegistro.addEventListener("click", volverAInicio);

// bloque eventos de titular

botonConfirmarCompra.addEventListener("click", confirmarCompra);
botonVaciarCarrito.addEventListener("click", vaciarCarrito);
botonSalirSistema.addEventListener("click", salirSistema);

// bloque eventos de administrador comun

botonSalirAdmin.addEventListener("click", salirSistema);
botonAgregarProducto.addEventListener("click", agregarProducto);

// bloque eventos de admin superior

botonSalirAdminSuperior.addEventListener("click", salirSistema);
botonGuardarSaldoInicialSistema.addEventListener("click", guardarSaldoInicialSistema);
botonAlternarRegistroPublico.addEventListener("click", alternarRegistroPublico);

// bloque inicio de la aplicación

actualizarFormularioRegistro();
mostrarPantalla("#pantallaInicio");