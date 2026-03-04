/* ============================================================
   Beauty Shop – Main Script
   ============================================================ */

(function () {
  'use strict';

  /* ---- Back to top ---- */
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---- Sticky header ---- */
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
    backToTop.classList.toggle('visible', window.scrollY > 300);
  });

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.getElementById('navToggle');
  const nav       = document.querySelector('.nav');
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    const open = nav.classList.contains('open');
    navToggle.querySelector('i').className = open
      ? 'fa-solid fa-xmark'
      : 'fa-solid fa-bars';
  });
  // Close nav when a link is clicked
  nav.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.querySelector('i').className = 'fa-solid fa-bars';
    })
  );

  /* ---- Search toggle ---- */
  const searchToggle = document.getElementById('searchToggle');
  const searchBar    = document.getElementById('searchBar');
  const searchInput  = document.getElementById('searchInput');
  searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('open');
    if (searchBar.classList.contains('open')) searchInput.focus();
  });

  /* ---- Product filtering ---- */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      productCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  // Category card click -> filter matching tab
  document.querySelectorAll('.category-card').forEach(cat => {
    cat.addEventListener('click', e => {
      e.preventDefault();
      const filter = cat.dataset.filter;
      document.querySelector(`.filter-tab[data-filter="${filter}"]`)?.click();
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---- Search filtering ---- */
  document.getElementById('searchBtn').addEventListener('click', runSearch);
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });

  function runSearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return;
    filterTabs.forEach(t => t.classList.remove('active'));
    document.querySelector('.filter-tab[data-filter="all"]').classList.add('active');
    productCards.forEach(card => {
      const name = card.querySelector('h3').textContent.toLowerCase();
      card.classList.toggle('hidden', !name.includes(q));
    });
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    searchBar.classList.remove('open');
  }

  /* ---- Cart ---- */
  let cart = [];

  const cartToggle  = document.getElementById('cartToggle');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose   = document.getElementById('cartClose');
  const cartBadge   = document.getElementById('cartBadge');
  const cartItems   = document.getElementById('cartItems');
  const cartEmpty   = document.getElementById('cartEmpty');
  const cartFooter  = document.getElementById('cartFooter');
  const cartTotal   = document.getElementById('cartTotal');

  function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  function formatPrice(n) {
    return n.toLocaleString('vi-VN') + '₫';
  }

  function renderCart() {
    // Clear existing items (but keep empty state element)
    Array.from(cartItems.children).forEach(child => {
      if (!child.id) child.remove();
    });

    if (cart.length === 0) {
      cartEmpty.style.display = 'flex';
      cartFooter.style.display = 'none';
      return;
    }

    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';

    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.dataset.id = item.id;
      el.innerHTML = `
        <div class="cart-item__icon"><i class="fa-solid fa-bottle-droplet"></i></div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">${formatPrice(item.price)}</div>
        </div>
        <div class="cart-item__qty">
          <button class="qty-minus" aria-label="Giảm số lượng">-</button>
          <span>${item.qty}</span>
          <button class="qty-plus" aria-label="Tăng số lượng">+</button>
        </div>
        <button class="cart-item__remove" aria-label="Xóa sản phẩm">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;
      cartItems.appendChild(el);
    });

    cartTotal.textContent = formatPrice(total);
    cartBadge.textContent = cart.reduce((s, i) => s + i.qty, 0);
  }

  // Delegate cart item events
  cartItems.addEventListener('click', e => {
    const item = e.target.closest('.cart-item');
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.closest('.qty-minus')) {
      const idx = cart.findIndex(i => i.id === id);
      if (idx !== -1) {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
        renderCart();
      }
    } else if (e.target.closest('.qty-plus')) {
      const idx = cart.findIndex(i => i.id === id);
      if (idx !== -1) { cart[idx].qty++; renderCart(); }
    } else if (e.target.closest('.cart-item__remove')) {
      cart = cart.filter(i => i.id !== id);
      renderCart();
    }
  });

  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const name  = btn.dataset.name;
      const price = parseInt(btn.dataset.price, 10);
      const id    = name.toLowerCase().replace(/\s+/g, '-');

      const existing = cart.find(i => i.id === id);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ id, name, price, qty: 1 });
      }

      renderCart();
      openCart();
      showToast(`<i class="fa-solid fa-check"></i> Đã thêm "${name}" vào giỏ`);

      // Bounce badge
      cartBadge.classList.remove('bounce');
      void cartBadge.offsetWidth; // reflow
      cartBadge.classList.add('bounce');
      setTimeout(() => cartBadge.classList.remove('bounce'), 350);
    });
  });

  /* ---- Toast ---- */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    toast.innerHTML = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /* ---- Contact form ---- */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    formSuccess.classList.add('show');
    contactForm.reset();
    setTimeout(() => formSuccess.classList.remove('show'), 5000);
  });

  /* ---- Newsletter form ---- */
  document.getElementById('newsletterForm').addEventListener('submit', e => {
    e.preventDefault();
    showToast('<i class="fa-solid fa-check"></i> Đăng ký nhận tin thành công!');
    e.target.reset();
  });

})();
