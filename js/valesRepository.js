// =======================================================
// REPOSITORIO CENTRAL DE VALES
// =======================================================

const FUENTES_VALES = Object.freeze({
    SUPABASE: "supabase"
});

let fuenteValesActual =
    FUENTES_VALES.SUPABASE;

function obtenerAdaptadorVales() {
    if (
        fuenteValesActual ===
        FUENTES_VALES.SUPABASE
    ) {
        if (
            typeof window.valesSupabaseAdapter ===
            "undefined"
        ) {
            throw new Error(
                "El adaptador de vales de Supabase no está disponible."
            );
        }

        return window.valesSupabaseAdapter;
    }

    throw new Error(
        "La fuente de vales configurada no es válida."
    );
}

// =======================================================
// GUARDAR VALE
// Compatibilidad con usuarios locales antiguos
// =======================================================

async function guardarValeRepositorio(
    vale
) {
    const adaptador =
        obtenerAdaptadorVales();

    return await adaptador.guardarVale(
        vale
    );
}

// =======================================================
// COMPRA ATÓMICA
// Descuenta saldo y crea el vale en Supabase
// =======================================================

async function realizarCompraConValeRepositorio(
    vale,
    almacenId
) {
    const adaptador =
        obtenerAdaptadorVales();

    if (
        typeof adaptador.realizarCompraConVale !==
        "function"
    ) {
        return {
            correcto: false,

            resultado:
                "operacion_no_disponible"
        };
    }

    return await adaptador
        .realizarCompraConVale(
            vale,
            almacenId
        );
}

// =======================================================
// CONSULTAR VALE
// =======================================================

async function obtenerValeRepositorio(
    tokenPublico
) {
    const adaptador =
        obtenerAdaptadorVales();

    return await adaptador.obtenerVale(
        tokenPublico
    );
}

// =======================================================
// UTILIZAR VALE
// =======================================================

async function marcarValeComoUsadoRepositorio(
    tokenPublico
) {
    const adaptador =
        obtenerAdaptadorVales();

    return await adaptador
        .marcarValeComoUsado(
            tokenPublico
        );
}

window.valesRepository = {
    guardarVale:
        guardarValeRepositorio,

    realizarCompraConVale:
        realizarCompraConValeRepositorio,

    obtenerVale:
        obtenerValeRepositorio,

    marcarValeComoUsado:
        marcarValeComoUsadoRepositorio
};