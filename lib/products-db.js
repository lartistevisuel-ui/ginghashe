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

// Récupère un produit par son id (null si absent / non configuré)
export async function getProductByIdFromDB(id) {
  if (!isDbConfigured()) return null;
  try {
    const res = await fetch(
      `${URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=*`,
      { headers: baseHeaders(), cache: "no-store" }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

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

// Upload une image dans le bucket Storage "products" et renvoie son URL publique
export async function uploadImageToStorage(fileName, arrayBuffer, contentType) {
  if (!isDbConfigured()) {
    throw new Error("Base de données non configurée.");
  }
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
  const res = await fetch(`${URL}/storage/v1/object/products/${path}`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": contentType || "application/octet-stream",
      "x-upsert": "true",
    },
    body: Buffer.from(arrayBuffer),
  });
  if (!res.ok) {
    throw new Error(`Storage ${res.status}: ${await res.text()}`);
  }
  return `${URL}/storage/v1/object/public/products/${path}`;
}

/* ---------- AVIS ---------- */

export async function getReviewsFromDB(productId, onlyApproved) {
  if (!isDbConfigured()) return null;
  try {
    let q = `${URL}/rest/v1/reviews?select=*&order=created_at.desc`;
    if (productId) q += `&product_id=eq.${encodeURIComponent(productId)}`;
    if (onlyApproved) q += `&approved=eq.true`;
    const res = await fetch(q, { headers: baseHeaders(), cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function setReviewApproved(id, approved) {
  if (!isDbConfigured()) return null;
  const res = await fetch(
    `${URL}/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { ...baseHeaders(), Prefer: "return=representation" },
      body: JSON.stringify({ approved }),
    }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function addReviewToDB(review) {
  if (!isDbConfigured()) {
    throw new Error("Base de données non configurée.");
  }
  const res = await fetch(`${URL}/rest/v1/reviews`, {
    method: "POST",
    headers: { ...baseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(review),
  });
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function deleteReviewFromDB(id) {
  if (!isDbConfigured()) {
    throw new Error("Base de données non configurée.");
  }
  const res = await fetch(
    `${URL}/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`,
    { method: "DELETE", headers: baseHeaders() }
  );
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  }
  return true;
}

/* ---------- COMMANDES ---------- */

export async function addOrderToDB(order) {
  if (!isDbConfigured()) return null;
  try {
    const res = await fetch(`${URL}/rest/v1/orders`, {
      method: "POST",
      headers: { ...baseHeaders(), Prefer: "return=representation" },
      body: JSON.stringify(order),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) ? rows[0] : rows;
  } catch {
    return null;
  }
}

export async function getOrdersByIds(ids) {
  if (!isDbConfigured() || !ids.length) return [];
  try {
    const inList = ids.map(encodeURIComponent).join(",");
    const res = await fetch(
      `${URL}/rest/v1/orders?id=in.(${inList})&select=id,status`,
      { headers: baseHeaders(), cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function setOrderStatus(id, status) {
  if (!isDbConfigured()) return null;
  const res = await fetch(
    `${URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { ...baseHeaders(), Prefer: "return=representation" },
      body: JSON.stringify({ status }),
    }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

/* ---------- TCHAT ---------- */

export async function getChatMessages() {
  if (!isDbConfigured()) return null;
  try {
    const res = await fetch(
      `${URL}/rest/v1/chat?select=*&order=created_at.asc&limit=200`,
      { headers: baseHeaders(), cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function addChatMessage(m) {
  if (!isDbConfigured()) throw new Error("Base de données non configurée.");
  const res = await fetch(`${URL}/rest/v1/chat`, {
    method: "POST",
    headers: { ...baseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(m),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function deleteChatMessage(id) {
  if (!isDbConfigured()) throw new Error("Base de données non configurée.");
  const res = await fetch(
    `${URL}/rest/v1/chat?id=eq.${encodeURIComponent(id)}`,
    { method: "DELETE", headers: baseHeaders() }
  );
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return true;
}

/* ---------- PRODUITS ---------- */

// Supprime un produit par son id
export async function deleteProductFromDB(id) {
  if (!isDbConfigured()) {
    throw new Error("Base de données non configurée.");
  }
  const res = await fetch(
    `${URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`,
    { method: "DELETE", headers: baseHeaders() }
  );
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  }
  return true;
}

// Met à jour un produit (champs partiels) et renvoie la ligne modifiée
export async function updateProductInDB(id, fields) {
  if (!isDbConfigured()) {
    throw new Error("Base de données non configurée.");
  }
  const res = await fetch(
    `${URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { ...baseHeaders(), Prefer: "return=representation" },
      body: JSON.stringify(fields),
    }
  );
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
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
