// Suivi des commandes du client (localStorage, par appareil)
const KEY = "kinghash_orders";
const SEEN = "kinghash_orders_seen";

export function getOrders() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function addOrder(order) {
  const orders = getOrders();
  orders.unshift({
    id: Date.now().toString(36),
    date: Date.now(),
    status: "En attente",
    ...order,
  });
  localStorage.setItem(KEY, JSON.stringify(orders.slice(0, 50)));
  window.dispatchEvent(new Event("orders-changed"));
}

// Y a-t-il des commandes non encore vues (pour le point rouge) ?
export function hasUnseenOrders() {
  if (typeof window === "undefined") return false;
  const seen = Number(localStorage.getItem(SEEN) || 0);
  return getOrders().some((o) => o.date > seen);
}

export function markOrdersSeen() {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEN, String(Date.now()));
  window.dispatchEvent(new Event("orders-changed"));
}
