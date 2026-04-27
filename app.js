
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
// ─── CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
function animateCursor(){
  cursor.style.transform=`translate(${mx-5}px,${my-5}px)`;
  rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12;
  ring.style.transform=`translate(${rx-18}px,${ry-18}px)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();
function attachCursor(){
  document.querySelectorAll('a,button,.category-card,.product-card,.payment-method,.crypto-option').forEach(el=>{
    el.addEventListener('mouseenter',()=>{cursor.classList.add('hover');ring.classList.add('hover');});
    el.addEventListener('mouseleave',()=>{cursor.classList.remove('hover');ring.classList.remove('hover');});
  });
}
attachCursor();

// Close profile dropdown when clicking outside
document.addEventListener('click',e=>{
  const pd=document.getElementById('profileDropdown');
  const pb=document.getElementById('profileBtn');
  if(pd.classList.contains('open')&&!pd.contains(e.target)&&!pb.contains(e.target)){
    pd.classList.remove('open');
  }
});

// ─── PRODUCTS DATA (₹ prices)
const products = [
  // Electronics
  {id:1,name:'Wireless Earbuds',category:'Electronics',price:8999,emoji:'🎵',desc:'True wireless earbuds with active noise cancellation and 28-hour battery life.',badge:'Best Seller'},
  {id:2,name:'Smart Watch',category:'Electronics',price:24999,emoji:'⌚',desc:'AMOLED display, health monitoring, GPS. Premium wearable for modern life.',badge:'New'},
  {id:3,name:'Noise-Cancel Headphones',category:'Electronics',price:14999,emoji:'🎧',desc:'Studio-grade sound with 30-hour battery and multi-device pairing.',badge:null},
  {id:4,name:'Portable Speaker',category:'Electronics',price:5499,emoji:'🔊',desc:'360° surround sound, waterproof, 20-hour playtime. Goes everywhere.',badge:null},
  {id:5,name:'USB-C Laptop Hub',category:'Electronics',price:3299,emoji:'🔌',desc:'7-in-1 hub: HDMI 4K, USB 3.0 × 3, SD card, 100W PD charging.',badge:'Sale',originalPrice:4499},
  {id:6,name:'Smart Desk Lamp',category:'Electronics',price:4499,emoji:'💡',desc:'Adaptive brightness, warm-to-cool spectrum, wireless phone charging base.',badge:null},
  // Beauty
  {id:7,name:'Rose Face Serum',category:'Beauty',price:10299,emoji:'🧴',desc:'Bulgarian rose otto facial serum. Luxury skin restoration and hydration.',badge:'New'},
  {id:8,name:'Silk Scrunchie Set',category:'Beauty',price:1849,emoji:'🎀',desc:'Pure Mulberry silk. Gentle on hair, gorgeous every time.',badge:'Sale',originalPrice:2899},
  {id:9,name:'Amber Candle',category:'Home',price:3999,emoji:'🕯️',desc:'Hand-poured soy wax with warm amber and sandalwood notes.',badge:'Best Seller'},
  // Home
  {id:11,name:'Ceramic Mug',category:'Home',price:3199,emoji:'☕',desc:'Artisan-thrown mug with matte speckled glaze. For mindful mornings.',badge:null},
  {id:12,name:'Reed Diffuser',category:'Home',price:4699,emoji:'🌿',desc:'Cedarwood and vetiver. Subtle, sophisticated sillage for any room.',badge:null},
  // Jewellery
  {id:13,name:'Lapis Bracelet',category:'Jewellery',price:7499,emoji:'📿',desc:'Hand-strung lapis lazuli with 18k gold accents. Timeless elegance.',badge:null},
  {id:14,name:'Gold Ring',category:'Jewellery',price:18299,emoji:'💍',desc:'Minimalist 14k gold band. Wear stacked or solo.',badge:'New'},
  // Fashion
  {id:15,name:'Linen Tote',category:'Fashion',price:5499,emoji:'👜',desc:'Heavyweight French linen in natural ecru. Roomy and refined.',badge:null},
  {id:16,name:'Cashmere Wrap',category:'Fashion',price:16299,emoji:'🧣',desc:'Grade-A Mongolian cashmere. Featherlight yet wonderfully warm.',badge:null},
];

// ─── STATE (With LocalStorage Persistence)
let cart = JSON.parse(localStorage.getItem('maison_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('maison_wishlist')) || [];
let currentUser = JSON.parse(localStorage.getItem('maison_user')) || null;

function saveCart() { localStorage.setItem('maison_cart', JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem('maison_wishlist', JSON.stringify(wishlist)); }

// ─── CURRENCY
const fmt = n => '₹'+n.toLocaleString('en-IN');

// ─── CART
function addToCart(product, qtyToAdd=1){
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
}
function updateCart(){
  const count=cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartCount').textContent=count;
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById('cartTotal').textContent=fmt(total);
  const empty=document.getElementById('cartEmpty');
  const items=document.getElementById('cartItems');
  empty.style.display=cart.length?'none':'block';
  items.querySelectorAll('.cart-item').forEach(el=>el.remove());
  cart.forEach(item=>{
    const el=document.createElement('div');
    el.className='cart-item';
    el.innerHTML=`
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
      </div>`;
    items.appendChild(el);
  });
}
function toggleCart(){
  document.getElementById('cartPanel').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

// ─── WISHLIST
function toggleWishlist(id){ 
  const prod=products.find(p=>p.id===id);
  if(!prod) return;
  const idx=wishlist.findIndex(w=>w.id===id);
  if(idx>-1){ wishlist.splice(idx,1); }
  else { wishlist.push(prod); }
  saveWishlist(); 
  updateWishlistUI();
  renderFavorites();
  showToast(idx>-1 ? 'Removed from wishlist' : 'Added to wishlist', 'info');
}
function updateWishlistUI(){
  const c=wishlist.length;
  const badge=document.getElementById('favCount');
  badge.textContent=c;
  badge.style.display=c>0?'flex':'none';
  // Update all heart buttons in grid
  document.querySelectorAll('.wishlist-btn').forEach(btn=>{
    const id=parseInt(btn.dataset.pid);
    if(wishlist.find(w=>w.id===id)) btn.classList.add('wishlisted');
    else btn.classList.remove('wishlisted');
  });
}
function renderFavorites(){
  const grid=document.getElementById('favGrid');
  const empty=document.getElementById('favEmpty');
  if(wishlist.length===0){empty.style.display='block';grid.innerHTML='';return;}
  empty.style.display='none';
  grid.innerHTML=wishlist.map(p=>`
    <div class="product-card">
      <div class="product-image">
        ${p.badge?`<span class="product-badge">${p.badge}</span>`:''}
        <div class="product-actions" style="opacity:1;transform:none">
          <button class="action-btn wishlisted" data-pid="${p.id}" onclick="toggleWishlist(${p.id});renderFavorites()" title="Remove">♥</button>
        </div>
        ${p.emoji}
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price">${fmt(p.price)}${p.originalPrice?`<span class="original">${fmt(p.originalPrice)}</span>`:''}</div>
          <button class="add-to-cart" data-id="${p.id}" onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,emoji:p.emoji,category:p.category})})'>Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
  attachCursor();
}


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

    const isWished=wishlist.find(w=>w.id===p.id);
    return `
    <div class="product-card" data-category="${p.category}">
      <div class="product-image">
        ${p.badge?`<span class="product-badge">${p.badge}</span>`:''}
        <div class="product-actions">
          <button class="action-btn wishlist-btn ${isWished?'wishlisted':''}" data-pid="${p.id}" onclick="toggleWishlist(${p.id})" title="${isWished?'Remove':'Save'}">${isWished?'♥':'♡'}</button>
          <button class="action-btn" onclick="openProductModal(${p.id})" title="View Details" style="font-size:12px">👁</button>
        </div>
        ${p.emoji}
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price">${fmt(p.price)}${p.originalPrice?`<span class="original">${fmt(p.originalPrice)}</span>`:''}</div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            <button class="add-to-cart" data-id="${p.id}" onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,emoji:p.emoji,category:p.category})})'>Add to Cart</button>
            <button style="background:none;border:none;color:var(--text-muted);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;cursor:none;transition:color 0.3s;padding:2px 0" onmouseover="this.style.color='var(--gold)'" onmouseout="this.style.color='var(--text-muted)'" onclick="openProductModal(${p.id})">View Details →</button>
          </div>
        </div>
      </div>
    </div>`}).join('');
  attachCursor();
}
function filterProducts(cat){
  renderProducts(cat);
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.classList.toggle('active',btn.textContent.trim()===cat||(cat==='All'&&btn.textContent.trim()==='All'));
  });
  const el = document.getElementById('products');
  if(el) el.scrollIntoView({behavior:'smooth'});
}

// ─── PRODUCT DETAIL MODAL
const productSpecs = {
  1:{warranty:'1 Year',connectivity:'Bluetooth 5.2',battery:'28 hrs',weight:'45g'},
  2:{display:'1.8" AMOLED',battery:'7 days',connectivity:'Bluetooth 5.3',waterproof:'IP68'},
  3:{warranty:'1 Year',connectivity:'Bluetooth 5.2',battery:'30 hrs',weight:'250g'},
  4:{warranty:'1 Year',output:'20W RMS',battery:'20 hrs',waterproof:'IPX7'},
  5:{ports:'7-in-1',power:'100W PD',video:'4K HDMI',usb:'USB 3.0 × 3'},
  6:{brightness:'5 levels',colortemp:'2700K–6500K',charging:'10W wireless',material:'ABS + aluminium'},
  7:{type:'Essential Oil Serum',volume:'30ml',skin:'All skin types',fragrance:'Bulgarian Rose'},
  8:{material:'100% Mulberry Silk',pack:'Set of 3',size:'One size fits all',color:'Ivory'},
  9:{type:'Soy Wax',burntime:'45 hours',scent:'Amber & Sandalwood',weight:'200g'},
  11:{material:'Stoneware',volume:'350ml',dishwasher:'Safe',origin:'Handmade'},
  12:{volume:'100ml',duration:'8–10 weeks',scent:'Cedarwood & Vetiver',reeds:'8 reeds'},
  13:{material:'Lapis Lazuli',metal:'18k Gold Plated',size:'Adjustable',origin:'Handcrafted'},
  14:{metal:'14k Gold',style:'Minimalist Band',size:'Adjustable',hallmark:'Hallmarked'},
  15:{material:'French Linen',dimensions:'40×35 cm',closure:'Magnetic snap',origin:'Ethically made'},
  16:{material:'100% Mongolian Cashmere',dimensions:'180×60 cm',weight:'220g',care:'Dry clean'},
};

let currentModalQty = 1;
function updateModalQty(delta){
  currentModalQty += delta;
  if(currentModalQty<1) currentModalQty=1;
  document.getElementById('modalQtyVal').textContent = currentModalQty;
}

let currentModalProductId = null;
function openProductModal(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  currentModalProductId = id;
  currentModalQty = 1;
  document.getElementById('modalQtyVal').textContent = 1;
  document.getElementById('modalEmoji').textContent = p.emoji;
  document.getElementById('modalCategory').textContent = p.category;
  document.getElementById('modalName').innerHTML = p.name.replace(' ',' <em>') + (p.name.includes(' ')?'</em>':'');
  document.getElementById('modalDesc').textContent = p.desc;
  document.getElementById('modalPrice').textContent = fmt(p.price);
  const origEl = document.getElementById('modalOrigPrice');
  if(p.originalPrice){ origEl.textContent = fmt(p.originalPrice); origEl.style.display='inline'; }
  else { origEl.style.display='none'; }
  const badgeEl = document.getElementById('modalBadge');
  if(p.badge){ badgeEl.textContent = p.badge; badgeEl.style.display='block'; }
  else { badgeEl.style.display='none'; }
  // Specs
  const specs = productSpecs[id] || {};
  document.getElementById('modalSpecs').innerHTML = Object.entries(specs).map(([k,v])=>`
    <div class="modal-spec-row">
      <span class="modal-spec-key">${k.replace(/([A-Z])/g,' $1').trim()}</span>
      <span class="modal-spec-val">${v}</span>
    </div>`).join('');
  // Wishlist button state
  const wishBtn = document.getElementById('modalWishBtn');
  wishBtn.textContent = wishlist.find(w=>w.id===id) ? '♥' : '♡';
  wishBtn.classList.toggle('wishlisted', !!wishlist.find(w=>w.id===id));
  document.getElementById('productModalOverlay').classList.add('open');
  document.body.style.overflow='hidden';
  attachCursor();
}
function closeProductModalDirect(){
  document.getElementById('productModalOverlay').classList.remove('open');
  document.body.style.overflow='';
  currentModalProductId=null;
}
function closeProductModal(e){
  if(e.target===document.getElementById('productModalOverlay')) closeProductModalDirect();
}
function modalAddToCart(){
  if(!currentModalProductId) return;
  const p=products.find(x=>x.id===currentModalProductId);
  if(p) addToCart({id:p.id,name:p.name,price:p.price,emoji:p.emoji,category:p.category}, currentModalQty);
  const btn=document.getElementById('modalAddBtn');
  btn.textContent='✓ Added!';
  setTimeout(()=>{btn.textContent='Add to Cart';},1500);
}
function modalToggleWish(){
  if(!currentModalProductId) return;
  toggleWishlist(currentModalProductId);
  const wishBtn=document.getElementById('modalWishBtn');
  const isWished=!!wishlist.find(w=>w.id===currentModalProductId);
  wishBtn.textContent=isWished?'♥':'♡';
  wishBtn.classList.toggle('wishlisted',isWished);
}

// ─── ORDER HISTORY
let orderHistory = JSON.parse(localStorage.getItem('maison_orders')) || [
  { id:'MN-2026-4721', date:'12 Feb 2026', status:'delivered', payment:'UPI', items:[{emoji:'🎧',name:'Sony WH-1000XM5',qty:1,price:29990},{emoji:'🕯️',name:'Amber Candle',qty:2,price:3999}], total:37988, trackStep:3 },
  { id:'MN-2026-3819', date:'28 Jan 2026', status:'delivered', payment:'Credit Card', items:[{emoji:'📿',name:'Lapis Bracelet',qty:1,price:7499},{emoji:'🧴',name:'Rose Face Serum',qty:1,price:10299}], total:17798, trackStep:3 },
  { id:'MN-2026-5503', date:'5 Mar 2026', status:'shipped', payment:'UPI', items:[{emoji:'⌚',name:'Smart Watch',qty:1,price:24999}], total:24999, trackStep:2 },
];
function saveOrders() { localStorage.setItem('maison_orders', JSON.stringify(orderHistory)); }

function openOrdersPage(){
  renderOrders();
  openPage('ordersPage');
}
function renderOrders(){
  const list=document.getElementById('ordersList');
  const empty=document.getElementById('ordersEmpty');
  if(orderHistory.length===0){ empty.style.display='block'; list.innerHTML=''; return; }
  empty.style.display='none';
  list.innerHTML = orderHistory.map((o,idx)=>`
    <div class="order-card">
      <div class="order-card-header" onclick="toggleOrderBody(${idx})">
        <span class="order-num-badge">#${o.id}</span>
        <div class="order-card-meta">
          <div class="order-meta-item"><span class="order-meta-label">Date</span><span class="order-meta-value">${o.date}</span></div>
          <div class="order-meta-item"><span class="order-meta-label">Items</span><span class="order-meta-value">${o.items.reduce((s,i)=>s+i.qty,0)} item${o.items.reduce((s,i)=>s+i.qty,0)>1?'s':''}</span></div>
          <div class="order-meta-item"><span class="order-meta-label">Total</span><span class="order-meta-value">${fmt(o.total)}</span></div>
          <div class="order-meta-item"><span class="order-meta-label">Payment</span><span class="order-meta-value">${o.payment}</span></div>
          <span class="order-status ${o.status}">${o.status}</span>
        </div>
        <button class="order-toggle-btn" id="order-toggle-${idx}" title="Expand">▾</button>
      </div>
      <div class="order-card-body" id="order-body-${idx}">
        <div class="order-tracking-bar">
          ${['Ordered','Packed','Shipped','Delivered'].map((label,i)=>`
            <div class="track-step ${i<o.trackStep?'done':''} ${i===o.trackStep?'active':''}">
              <div class="track-dot">${i<o.trackStep?'✓':['📋','📦','🚚','🏠'][i]}</div>
              <span class="track-label">${label}</span>
            </div>${i<3?'':''}
          `).join('')}
        </div>
        <div class="order-items-list">
          ${o.items.map(item=>`
            <div class="order-item-row">
              <div class="order-item-icon">${item.emoji}</div>
              <span class="order-item-name">${item.name}</span>
              <span class="order-item-qty">× ${item.qty}</span>
              <span class="order-item-price">${fmt(item.price * item.qty)}</span>
            </div>`).join('')}
        </div>
        <div class="order-card-footer">
          <div class="order-total-line">
            <span class="order-total-label">Order Total</span>
            <span class="order-total-val">${fmt(o.total)}</span>
          </div>
          <button class="order-reorder-btn" onclick="reorderItems(${idx})">Reorder →</button>
        </div>
      </div>
    </div>`).join('');
  attachCursor();
}
function toggleOrderBody(idx){
  const body=document.getElementById('order-body-'+idx);
  const btn=document.getElementById('order-toggle-'+idx);
  body.classList.toggle('open');
  btn.classList.toggle('open');
}
function reorderItems(idx){
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
}
function saveOrderToHistory(orderNum){
  if(cart.length===0) return;
  const now=new Date();
  const dateStr=now.getDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]+' '+now.getFullYear();
  orderHistory.unshift({
    id:orderNum, date:dateStr, status:'processing',
    payment: selectedPayment==='card'?'Credit Card':selectedPayment==='upi'?'UPI':selectedPayment==='netbanking'?'Net Banking':selectedPayment==='cod'?'Cash on Delivery':'Crypto',
    items: cart.map(i=>({emoji:i.emoji,name:i.name,qty:i.qty,price:i.price})),
    total: cart.reduce((s,i)=>s+i.price*i.qty,0),
    trackStep: 1
  });
  saveOrders(); // Persist
}

// ─── PAGES
function openPage(id){
  document.getElementById(id).classList.add('open');
  document.body.style.overflow='hidden';
}
function closePage(id){
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow='';
}

// ─── LOGIN
function switchLoginTab(tab){
  document.querySelectorAll('.login-tab').forEach((t,i)=>t.classList.toggle('active',(i===0&&tab==='signin')||(i===1&&tab==='register')));
  document.getElementById('panel-signin').classList.toggle('active',tab==='signin');
  document.getElementById('panel-register').classList.toggle('active',tab==='register');
}
function handleSignIn(){
  const email=document.getElementById('signin-email').value.trim();
  const pass=document.getElementById('signin-pass').value;
  const errEl=document.getElementById('signin-error');
  if(!email||!pass){errEl.textContent='Please fill in all fields.';errEl.style.display='block';return;}
  if(!email.includes('@')){errEl.textContent='Please enter a valid email.';errEl.style.display='block';return;}
  errEl.style.display='none';
  // Simulate sign-in — use stored user if exists
  const stored=localStorage.getItem('maison_user');
  if(stored){
    const u=JSON.parse(stored);
    if(u.email===email){loginSuccess(u);return;}
  }
  // Fallback: create session from email
  const name=email.split('@')[0];
  loginSuccess({name:capitalise(name),email:email,phone:'',avatar:'👤'});
}
function handleRegister(){
  const fname=document.getElementById('reg-fname').value.trim();
  const lname=document.getElementById('reg-lname').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const phone=document.getElementById('reg-phone').value.trim();
  const pass=document.getElementById('reg-pass').value;
  const errEl=document.getElementById('register-error');
  const sucEl=document.getElementById('register-success');
  if(!fname||!email||!pass){errEl.textContent='Please fill required fields.';errEl.style.display='block';sucEl.style.display='none';return;}
  if(!email.includes('@')){errEl.textContent='Invalid email address.';errEl.style.display='block';return;}
  if(pass.length<6){errEl.textContent='Password must be at least 6 characters.';errEl.style.display='block';return;}
  errEl.style.display='none';
  const user={name:fname+(lname?' '+lname:''),email,phone,avatar:'👤'};
  localStorage.setItem('maison_user',JSON.stringify(user));
  sucEl.textContent='Account created! Signing you in…';sucEl.style.display='block';
  setTimeout(()=>loginSuccess(user),800);
}
function handleSocialLogin(provider){
  loginSuccess({name:provider+' User',email:'user@'+provider.toLowerCase()+'.com',phone:'',avatar:'👤'});
}
function loginSuccess(user){
  currentUser=user;
  localStorage.setItem('maison_user',JSON.stringify(user));
  document.getElementById('dropName').textContent=user.name;
  document.getElementById('dropEmail').textContent=user.email;
  document.getElementById('dropLoggedOut').style.display='none';
  document.getElementById('dropLoggedIn').style.display='block';
  document.getElementById('profileBtn').textContent='';
  document.getElementById('profileBtn').innerHTML=`<span style="font-size:18px">${user.avatar}</span>`;
  closePage('loginPage');
}
function handleSignOut(){
  currentUser=null;
  localStorage.removeItem('maison_user');
  document.getElementById('dropLoggedOut').style.display='block';
  document.getElementById('dropLoggedIn').style.display='none';
  document.getElementById('profileBtn').textContent='👤';
  closeDropdown();
}
function capitalise(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function toggleProfileDropdown(){
  document.getElementById('profileDropdown').classList.toggle('open');
}
function closeDropdown(){document.getElementById('profileDropdown').classList.remove('open');}
function openLoginFromDropdown(){closeDropdown();openPage('loginPage');}

// ─── CHECKOUT
function handleCheckout(){if(cart.length===0)return;openCheckout();}
function openCheckout(){
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('checkoutPage').classList.add('open');
  document.body.style.overflow='hidden';
  renderCheckoutSummary();
  goToStep(1);
  // Pre-fill from logged in user
  if(currentUser){
    const parts=currentUser.name.split(' ');
    document.getElementById('f-firstname').value=parts[0]||'';
    document.getElementById('f-lastname').value=parts[1]||'';
    document.getElementById('f-email').value=currentUser.email||'';
    document.getElementById('f-phone').value=currentUser.phone||'';
  }
}
function closeCheckout(){
  document.getElementById('checkoutPage').classList.remove('open');
  document.body.style.overflow='';
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}
function finishCheckout(){
  document.getElementById('checkoutPage').classList.remove('open');
  document.body.style.overflow='';
  cart=[]; saveCart(); updateCart();
}
let currentStep=1;
function goToStep(step){
  if(step===2){
    let isValid=true;
    document.querySelectorAll('#checkout-step-1 .form-input, #checkout-step-1 .form-select').forEach(inp=>{
      if(!inp.value.trim()&&!(inp.placeholder||'').toLowerCase().includes('optional')){
        inp.style.borderColor='var(--terracotta)';
        inp.addEventListener('input',()=>inp.style.borderColor='',{once:true});
        if(inp.tagName==='SELECT') inp.addEventListener('change',()=>inp.style.borderColor='',{once:true});
        isValid=false;
      }
    });
    if(!isValid) return;
  }
  if(step===3){
    const n='MN-'+new Date().getFullYear()+'-'+Math.floor(1000+Math.random()*9000);
    document.getElementById('confirmOrderNum').textContent='ORDER #'+n;
    document.getElementById('confirmEmail').textContent=document.getElementById('f-email').value||'your email';
    saveOrderToHistory(n);
  }
  currentStep=step;
  document.querySelectorAll('.checkout-step-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('checkout-step-'+step).classList.add('active');
  [1,2,3].forEach(i=>{
    const el=document.getElementById('step-indicator-'+i);
    el.classList.remove('active','done');
    if(i<step)el.classList.add('done'); else if(i===step)el.classList.add('active');
  });
  document.getElementById('checkoutPage').scrollTo({top:0,behavior:'smooth'});
}
function renderCheckoutSummary(){
  document.getElementById('checkoutSummaryItems').innerHTML=cart.map(item=>`
    <div class="summary-item">
      <div class="summary-item-icon">${item.emoji}<div class="qty-badge">${item.qty}</div></div>
      <span class="summary-item-name">${item.name}</span>
      <span class="summary-item-price">${fmt(item.price*item.qty)}</span>
    </div>`).join('');
  updateCheckoutTotals();
}
let promoApplied=false;
function updateCheckoutTotals(){
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const ship=sub>=999?0:99;
  const disc=promoApplied?Math.round(sub*0.1):0;
  const tax=Math.round((sub-disc+ship)*0.18);
  const total=sub-disc+ship+tax;
  document.getElementById('summarySubtotal').textContent=fmt(sub);
  document.getElementById('summaryShipping').textContent=ship===0?'Free':fmt(ship);
  document.getElementById('summaryTax').textContent=fmt(tax);
  document.getElementById('summaryTotal').textContent=fmt(total);
  if(promoApplied){document.getElementById('promoLine').style.display='flex';document.getElementById('promoAmount').textContent='-'+fmt(disc);}
}
function applyPromo(){
  const code=document.getElementById('promoInput').value.trim().toUpperCase();
  if(code==='MAISON10'&&!promoApplied){
    promoApplied=true;
    document.getElementById('promoInput').value='✓ MAISON10 applied';
    document.getElementById('promoInput').style.borderColor='var(--sage)';
    document.getElementById('promoInput').disabled=true;
    updateCheckoutTotals();
  } else if(promoApplied){document.getElementById('promoInput').value='✓ Already applied';}
  else{document.getElementById('promoInput').style.borderColor='var(--terracotta)';document.getElementById('promoInput').value='';document.getElementById('promoInput').placeholder='Invalid code';}
}

// ─── PAYMENT
let selectedPayment='card';
function selectPayment(el,type){
  selectedPayment=type;
  document.querySelectorAll('.payment-method').forEach(m=>m.classList.remove('selected'));
  el.classList.add('selected');
  ['card-form','upi-form','netbanking-form','cod-form','crypto-form'].forEach(id=>document.getElementById(id).classList.remove('show'));
  const map={card:'card-form',upi:'upi-form',netbanking:'netbanking-form',cod:'cod-form',crypto:'crypto-form'};
  document.getElementById(map[type]).classList.add('show');
}
function selectCrypto(el){document.querySelectorAll('.crypto-option').forEach(o=>o.classList.remove('selected'));el.classList.add('selected');}
function formatCard(input){
  let v=input.value.replace(/\D/g,'').substring(0,16);
  input.value=v.replace(/(.{4})/g,'$1 ').trim();
  const d=v.padEnd(16,'•').replace(/(.{4})/g,'$1 ').trim();
  document.getElementById('display-card-num').textContent=d||'•••• •••• •••• ••••';
}
function formatExp(input){
  let v=input.value.replace(/\D/g,'').substring(0,4);
  if(v.length>=2)v=v.substring(0,2)+' / '+v.substring(2);
  input.value=v;
  document.getElementById('display-card-exp').textContent=input.value||'MM / YY';
}

// ─── SCROLL REVEAL
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});
},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// ─── NEWSLETTER
function handleSubscribe(){
  const input=document.getElementById('emailInput');
  if(!input.value.includes('@')){input.style.borderColor='var(--terracotta)';return;}
  input.value='✓ You\'re on the list!';input.style.borderColor='var(--sage)';input.disabled=true;
}

// ─── STARTUP HYDRATION
function initApp() {
  renderProducts();
  updateCart();
  updateWishlistUI();
  if(currentUser) loginSuccess(currentUser);
}
initApp();
