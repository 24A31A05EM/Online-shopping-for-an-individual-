import re

with open("app.js", "r", encoding="utf-8") as f:
    js = f.read()

# 1. Toast Implementation
toast_code = """
// ─── TOAST NOTIFICATIONS
function showToast(msg, type='success'){
  const cont = document.getElementById('toastContainer');
  if(!cont) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = type==='success'?'✓':type==='error'?'✕':'i';
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${msg}</span>`;
  cont.appendChild(toast);
  setTimeout(()=>{
    toast.classList.add('removing');
    toast.addEventListener('animationend', ()=>toast.remove());
  }, 3000);
}
"""
js = toast_code + js

# 2. Add To Cart & Clear
old_addToCart = """function addToCart(product){
  const ex=cart.find(i=>i.id===product.id);
  if(ex) ex.qty++;
  else cart.push({...product,qty:1});
  saveCart(); // Persist
  updateCart();
  document.querySelectorAll(`[data-id="${product.id}"]`).forEach(b=>{
    b.classList.add('added');b.textContent='✓ Added';
    setTimeout(()=>{b.classList.remove('added');b.textContent='Add to Cart';},1500);
  });
}
function removeFromCart(id){
    cart=cart.filter(i=>i.id!==id);
    saveCart(); // Persist
    updateCart();
}"""

new_addToCart = """function addToCart(product, qtyToAdd=1){
  const ex=cart.find(i=>i.id===product.id);
  if(ex) ex.qty += qtyToAdd;
  else cart.push({...product,qty:qtyToAdd});
  saveCart(); // Persist
  updateCart();
  showToast(`${qtyToAdd} ${product.name} added to cart`);
  document.querySelectorAll(`[data-id="${product.id}"]`).forEach(b=>{
    b.classList.add('added');b.textContent='✓ Added';
    setTimeout(()=>{b.classList.remove('added');b.textContent='Add to Cart';},1500);
  });
}
function removeFromCart(id){
    cart=cart.filter(i=>i.id!==id);
    saveCart(); // Persist
    updateCart();
    // if in checkout, update totals
    if(document.getElementById('checkoutPage').classList.contains('open')) renderCheckoutSummary();
}
function updateCartItemQty(id, delta){
  const item = cart.find(i=>i.id===id);
  if(item) {
    item.qty += delta;
    if(item.qty <= 0) removeFromCart(id);
    else { 
      saveCart(); updateCart(); 
      if(document.getElementById('checkoutPage').classList.contains('open')) renderCheckoutSummary();
    }
  }
}
function clearCart(){
  cart=[]; saveCart(); updateCart(); showToast('Cart cleared', 'info');
}"""
js = js.replace(old_addToCart, new_addToCart)

# 3. Update Cart HTML for quantity
old_cartHtml = """el.innerHTML=`<div class="cart-item-icon">${item.emoji}</div><div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-price">${fmt(item.price)} × ${item.qty}</div></div><button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>`;"""
new_cartHtml = """el.innerHTML=`
      <div class="cart-item-icon">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-qty-row">
          <button class="cart-item-qty-btn" onclick="updateCartItemQty(${item.id}, -1)">-</button>
          <span class="cart-item-qty-val">${item.qty}</span>
          <button class="cart-item-qty-btn" onclick="updateCartItemQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;">
        <button class="cart-item-remove" style="margin-bottom:8px" onclick="removeFromCart(${item.id})">✕</button>
        <div class="cart-item-price" style="font-size:12px">${fmt(item.price * item.qty)}</div>
      </div>`;"""
js = js.replace(old_cartHtml, new_cartHtml)

# 4. Search and Sort
search_sort_code = """
let currentFilter = 'All';
let currentSearch = '';
let currentSort = 'default';

function handleSearch() {
  currentSearch = document.getElementById('searchInput').value.toLowerCase();
  renderProducts();
}

function handleSort() {
  currentSort = document.getElementById('sortSelect').value;
  renderProducts();
}

// ─── PRODUCTS RENDER
function renderProducts(cat){
  if(cat !== undefined) currentFilter = cat;
  const grid=document.getElementById('productsGrid');
  let filtered=currentFilter==='All'?products:products.filter(p=>p.category===currentFilter);
  
  if(currentSearch) {
    filtered = filtered.filter(p=>p.name.toLowerCase().includes(currentSearch) || p.desc.toLowerCase().includes(currentSearch));
  }
  
  if(currentSort === 'price-low') {
    filtered.sort((a,b)=>a.price-b.price);
  } else if(currentSort === 'price-high') {
    filtered.sort((a,b)=>b.price-a.price);
  }
  
  if(filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">No items match your criteria.</div>';
    return;
  }
  
  grid.innerHTML=filtered.map(p=>{
"""
old_renderProducts = """// ─── PRODUCTS RENDER
function renderProducts(filter='All'){
  const grid=document.getElementById('productsGrid');
  const filtered=filter==='All'?products:products.filter(p=>p.category===filter);
  grid.innerHTML=filtered.map(p=>{"""
js = js.replace(old_renderProducts, search_sort_code)

old_filterProducts = """function filterProducts(cat){
  renderProducts(cat);
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.classList.toggle('active',btn.textContent.trim()===cat||(cat==='All'&&btn.textContent.trim()==='All'));
  });
  document.getElementById('products').scrollIntoView({behavior:'smooth'});
}"""
new_filterProducts = """function filterProducts(cat){
  renderProducts(cat);
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.classList.toggle('active',btn.textContent.trim()===cat||(cat==='All'&&btn.textContent.trim()==='All'));
  });
  const el = document.getElementById('products');
  if(el) el.scrollIntoView({behavior:'smooth'});
}"""
js = js.replace(old_filterProducts, new_filterProducts)

# 5. Product Detail Modal Quantity
modal_qty_code = """
let currentModalQty = 1;
function updateModalQty(delta){
  currentModalQty += delta;
  if(currentModalQty<1) currentModalQty=1;
  document.getElementById('modalQtyVal').textContent = currentModalQty;
}
"""
js = js.replace("let currentModalProductId = null;", modal_qty_code + "\nlet currentModalProductId = null;")

js = js.replace("currentModalProductId = id;", "currentModalProductId = id;\n  currentModalQty = 1;\n  document.getElementById('modalQtyVal').textContent = 1;")

js = js.replace("if(p) addToCart({id:p.id,name:p.name,price:p.price,emoji:p.emoji,category:p.category});", 
               "if(p) addToCart({id:p.id,name:p.name,price:p.price,emoji:p.emoji,category:p.category}, currentModalQty);")

# 6. Reorder items fix
old_reorder = """function reorderItems(idx){
  const order=orderHistory[idx];
  order.items.forEach(item=>{
    const prod=products.find(p=>p.name===item.name);
    if(prod) addToCart({id:prod.id,name:prod.name,price:prod.price,emoji:prod.emoji,category:prod.category});
    else { cart.push({id:Date.now(),name:item.name,price:item.price,emoji:item.emoji,qty:item.qty}); saveCart(); } // Persist custom item
  });
  updateCart();
  closePage('ordersPage');
  toggleCart();
}"""
new_reorder = """function reorderItems(idx){
  const order=orderHistory[idx];
  order.items.forEach(item=>{
    const prod=products.find(p=>p.name===item.name);
    if(prod) addToCart({id:prod.id,name:prod.name,price:prod.price,emoji:prod.emoji,category:prod.category}, item.qty);
    else { 
      const ex = cart.find(i=>i.name===item.name);
      if(ex) ex.qty += item.qty;
      else cart.push({id:Date.now()+Math.floor(Math.random()*1000),name:item.name,price:item.price,emoji:item.emoji,qty:item.qty}); 
      saveCart(); 
    }
  });
  updateCart();
  closePage('ordersPage');
  toggleCart();
  showToast('Order duplicated into cart');
}"""
js = js.replace(old_reorder, new_reorder)

# 7. Wishlist Toast
js = js.replace("saveWishlist(); // Persist\n  updateWishlistUI();\n  renderFavorites();",
               "saveWishlist(); \n  updateWishlistUI();\n  renderFavorites();\n  showToast(idx>-1 ? 'Removed from wishlist' : 'Added to wishlist', 'info');")

# 8. Add inline html updates for products mapping to trigger correctly
old_onclick = "onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,emoji:p.emoji,category:p.category})})'"
new_onclick = "onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,emoji:p.emoji,category:p.category})})'" 
# No change needed here, qtyToAdd defaults to 1. But wait, it's inside `map`.

with open("app.js", "w", encoding="utf-8") as f:
    f.write(js)
