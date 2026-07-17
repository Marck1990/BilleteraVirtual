const SUPABASE_URL =
    "https://hiksrtlgtcrmudiekgis.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_U_NsDzxxyGdnnZqaPa278w_5qAx-MJr";

if (typeof window.supabase === "undefined") {
    throw new Error(
        "La librería de Supabase no está cargada."
    );
}

window.supabaseCliente =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );