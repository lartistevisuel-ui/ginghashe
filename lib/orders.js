// Suivi des commandes du client (localStorage, avec statut synchronisé depuis la base)
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

function save(orders) {
  localStorage.setItem(KEY, JSON.stringify(orders.slice(0, 50)));
  window.dispatchEvent(new Event("orders-changed"));
}

export function addOrder(order) {
  const orders = getOrders();
  orders.unshift({
    date: Date.now(),
    status: "pending",
    ...order, // contient id (base), items, total, mode
  });
  save(orders);
}

// Met à jour les statuts depuis la base : rows = [{id, status}]
export function updateStatuses(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  const map = Object.fromEntries(rows.map((r) => [r.id, r.status]));
  const orders = getOrders();
  let changed = false;
  const next = orders.map((o) => {
    if (o.id && map[o.id] && map[o.id] !== o.status) {
      changed = true;
      return { ...o, status: map[o.id] };
    }
    return o;
  });
  if (changed) save(next);
  return changed;
}

export function orderIds() {
  return getOrders()
    .map((o) => o.id)
    .filter(Boolean);
}

// Point rouge : une commande dont le statut (id:status) n'a pas encore été vu
export function hasUnseenOrders() {
  if (typeof window === "undefined") return false;
  let seen = {};
  try {
    seen = JSON.parse(localStorage.getItem(SEEN)) || {};
  } catch {
    seen = {};
  }
  return getOrders().some((o) => seen[o.id || o.date] !== o.status);
}

export function markOrdersSeen() {
  if (typeof window === "undefined") return;
  const map = {};
  getOrders().forEach((o) => {
    map[o.id || o.date] = o.status;
  });
  localStorage.setItem(SEEN, JSON.stringify(map));
  window.dispatchEvent(new Event("orders-changed"));
}
