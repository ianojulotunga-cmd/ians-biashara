const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
let cat = "all", q = "";
const PH = "assets/img/placeholder.svg";
const art = p => p.image
  ? `<img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${PH}'">`
  : `<div class="svc" role="img" aria-label="IT service"><svg viewBox="0 0 24 24"><path d="M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9z"/></svg></div>`;
const stock = p => p.stock === null ? '<span class="ok">Available</span>' : p.stock === 0 ? '<span class="out">Out of stock</span>'
  : p.stock <= 8 ? `<span class="low">Only ${p.stock} left</span>` : '<span class="ok">In stock</span>';
const card = p => `<article class="card"><button class="thumb" data-view="${p.id}" aria-label="View ${p.name}">${art(p)}</button>
<div class="body"><span class="cat">${CATS[p.cat]}</span><h3>${p.name}</h3><p>${p.desc}</p><div>${stock(p)}</div>
<div class="row"><strong>${fmt(p.price)}</strong><button class="btn" data-add="${p.id}" ${p.stock === 0 ? "disabled" : ""}>${p.cat === "service" ? "Book" : "Add to cart"}</button></div>
<button class="link" data-view="${p.id}">View details</button></div></article>`;
const fill = (sel, list) => $(sel).innerHTML = list.map(card).join("");

function drawShop() {
  const list = PRODUCTS.filter(p => (cat === "all" || p.cat === cat) &&
    (p.name + " " + p.desc + " " + CATS[p.cat]).toLowerCase().includes(q));
  fill("#grid", list);
  $("#result").textContent = list.length ? `${list.length} item${list.length > 1 ? "s" : ""}` : "";
  if (!list.length) $("#grid").innerHTML = '<p class="none">No items match your search. Try another word or choose All.</p>';
  $$("#nav button").forEach(b => b.classList.toggle("on", b.dataset.f === cat));
}
function drawCart() {
  const L = Cart.lines();
  $("#count").textContent = Cart.count();
  $("#items").innerHTML = L.length ? L.map(({p, qty}) => `<div class="li"><div class="lt">${art(p)}</div>
    <div class="ld"><b>${p.name}</b><span>${fmt(p.price)}</span>
    <div class="qty"><button data-dec="${p.id}" aria-label="Decrease">−</button><span>${qty}</span><button data-inc="${p.id}" aria-label="Increase">+</button>
    <button class="link" data-rm="${p.id}">Remove</button></div></div><b>${fmt(p.price * qty)}</b></div>`).join("")
    : '<p class="mut pad">Your cart is empty. Add something from the shop.</p>';
  $("#sub").textContent = fmt(Cart.subtotal());
  $("#co").classList.toggle("off", !L.length);
}
function view(id) {
  const p = PRODUCTS.find(x => x.id == id);
  $("#dbody").innerHTML = `<div class="dimg">${art(p)}</div><div><span class="cat">${CATS[p.cat]}</span><h2>${p.name}</h2><p>${p.desc}</p>
  <p>${stock(p)}</p><p class="price">${fmt(p.price)}</p><button class="btn big" data-add="${p.id}" ${p.stock === 0 ? "disabled" : ""}>${p.cat === "service" ? "Book service" : "Add to cart"}</button></div>`;
  $("#detail").showModal();
}
function go(f) { cat = f; q = ""; $("#q").value = ""; drawShop(); $("#shop").scrollIntoView(); }
document.addEventListener("click", e => {
  const d = e.target.closest("[data-add],[data-view],[data-inc],[data-dec],[data-rm],[data-f]");
  if (!d) return;
  const s = d.dataset;
  if (s.add) { Cart.add(s.add); drawCart(); $("#detail").open && $("#detail").close(); $("#drawer").hidden = false; }
  else if (s.view) view(s.view);
  else if (s.inc) { Cart.add(s.inc); drawCart(); }
  else if (s.dec) { Cart.set(s.dec, (Cart.get()[s.dec] || 0) - 1); drawCart(); }
  else if (s.rm) { Cart.set(s.rm, 0); drawCart(); }
  else if (s.f) go(s.f);
});
$("#q").oninput = e => { q = e.target.value.toLowerCase().trim(); cat = "all"; drawShop(); };
$("#sf").onsubmit = e => { e.preventDefault(); $("#shop").scrollIntoView(); };
$("#cartBtn").onclick = () => $("#drawer").hidden = !$("#drawer").hidden;
$("#close").onclick = () => $("#drawer").hidden = true;
$("#dclose").onclick = () => $("#detail").close();
$("#co").onclick = e => { if (!Cart.count()) e.preventDefault(); };
fill("#featured", PRODUCTS.filter(p => p.tags.includes("F")).slice(0, 4));
fill("#popular", PRODUCTS.filter(p => p.tags.includes("P")).slice(0, 4));
fill("#svc", PRODUCTS.filter(p => p.cat === "service"));
$("#hero").innerHTML = [11, 1, 5].map(id => `<div>${art(PRODUCTS.find(p => p.id === id))}</div>`).join("");
drawShop(); drawCart();
