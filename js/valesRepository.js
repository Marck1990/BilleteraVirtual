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

async function guardarValeRepositorio(
    vale
) {
    const adaptador =
        obtenerAdaptadorVales();

    return await adaptador.guardarVale(
        vale
    );
}

async function obtenerValeRepositorio(
    tokenPublico
) {
    const adaptador =
        obtenerAdaptadorVales();

    return await adaptador.obtenerVale(
        tokenPublico
    );
}

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

    obtenerVale:
        obtenerValeRepositorio,

    marcarValeComoUsado:
        marcarValeComoUsadoRepositorio
};