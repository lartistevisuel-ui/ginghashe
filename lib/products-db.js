// Accès base de données Supabase via son API REST (aucune dépendance npm).
// Tout se passe côté serveur : la clé n'est jamais exposée au navigateur.

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isDbConfigured() {
  return Boolean(URL && KEY);
}

const baseHeaders = () => ({
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
});

// Récupère tous les produits (null si base non configurée ou erreur -> repli statique)
export async function getProductsFromDB() {
  if (!isDbConfigured()) return null;
  try {
    const res = await fetch(
      `${URL}/rest/v1/products?select=*&order=created_at.desc`,
      { headers: baseHeaders(), cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Ajoute un produit et renvoie la ligne créée
export async function addProductToDB(product) {
  if (!isDbConfigured()) {
    throw new Error("Base de données non configurée (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants).");
  }
  const res = await fetch(`${URL}/rest/v1/products`, {
    method: "POST",
    headers: { ...baseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}
