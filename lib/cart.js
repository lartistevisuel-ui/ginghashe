// Panier côté client (localStorage)
const KEY = "kinghash_cart";

export function getCart() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function save(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-changed"));
}

export function addToCart(item) {
  const cart = getCart();
  const key = `${item.id}|${item.weight || ""}`;
  const existing = cart.find((c) => c.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      key,
      id: item.id,
      name: item.name,
      image: item.image || "",
      weight: item.weight || "",
      price: item.price || "",
      qty: 1,
    });
  }
  save(cart);
  return cart;
}

export function setQty(key, qty) {
  const cart = getCart()
    .map((c) => (c.key === key ? { ...c, qty: Math.max(0, qty) } : c))
    .filter((c) => c.qty > 0);
  save(cart);
  return cart;
}

export function removeFromCart(key) {
  save(getCart().filter((c) => c.key !== key));
}

export function clearCart() {
  save([]);
}

export function cartCount() {
  return getCart().reduce((n, c) => n + c.qty, 0);
}

// Extrait la valeur numérique d'un prix ("30.00 €", "50€", "70,00 €")
export function parsePrice(str) {
  if (!str) return 0;
  const m = String(str).replace(/\s/g, "").replace(",", ".").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

export function cartTotal() {
  return getCart().reduce((t, c) => t + parsePrice(c.price) * c.qty, 0);
}
