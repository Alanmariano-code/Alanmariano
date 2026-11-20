const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const cartDrawer = document.querySelector('.cart-drawer');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItemsElement = document.querySelector('.cart-items');
const cartCountElement = document.querySelector('.cart-count');
const cartTotalElement = document.querySelector('.cart-total strong');
const toast = document.querySelector('.toast');
let cart = JSON.parse(localStorage.getItem('alessios-cart')) || [];

const formatCurrency = value =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

function saveAndRenderCart() {
  localStorage.setItem('alessios-cart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCountElement.textContent = itemCount;
  cartCountElement.setAttribute('aria-label', `${itemCount} itens no carrinho`);
  cartTotalElement.textContent = formatCurrency(subtotal);

  if (!cart.length) {
    cartItemsElement.innerHTML = '<p class="cart-empty">Seu carrinho está vazio.<br>Adicione uma pizza deliciosa!</p>';
    return;
  }

  cartItemsElement.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image}" alt="">
      <div>
        <h3>${item.name}</h3>
        <span class="cart-item-price">${formatCurrency(item.price)}</span>
        <div class="quantity">
          <button type="button" class="decrease" aria-label="Diminuir quantidade de ${item.name}">−</button>
          <span>${item.quantity}</span>
          <button type="button" class="increase" aria-label="Aumentar quantidade de ${item.name}">+</button>
        </div>
      </div>
      <button type="button" class="remove-item" aria-label="Remover ${item.name}">×</button>
    </div>
  `).join('');
}

function openCart() {
  cartDrawer.classList.add('active');
  cartOverlay.classList.add('active');
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lock');
  document.querySelector('.cart-close').focus();
}

function closeCart() {
  cartDrawer.classList.remove('active');
  cartOverlay.classList.remove('active');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lock');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2200);
}

document.querySelectorAll('.add-button').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.pizza-card');
    const product = {
      id: card.dataset.id,
      name: card.dataset.name,
      price: Number(card.dataset.price),
      image: card.dataset.image,
      quantity: 1
    };
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push(product);
    saveAndRenderCart();
    showToast(`${product.name} adicionada ao pedido`);
  });
});

cartItemsElement.addEventListener('click', event => {
  const itemElement = event.target.closest('.cart-item');
  if (!itemElement) return;
  const item = cart.find(entry => entry.id === itemElement.dataset.id);
  if (event.target.classList.contains('increase')) item.quantity += 1;
  if (event.target.classList.contains('decrease')) {
    item.quantity -= 1;
    if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== item.id);
  }
  if (event.target.classList.contains('remove-item')) {
    cart = cart.filter(entry => entry.id !== item.id);
  }
  saveAndRenderCart();
});

document.querySelector('.cart-button').addEventListener('click', openCart);
document.querySelector('.cart-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.querySelector('.checkout-button').addEventListener('click', () => {
  if (!cart.length) {
    showToast('Adicione pizzas antes de finalizar');
    return;
  }
  const lines = cart.map(item => `${item.quantity}x ${item.name}`);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = encodeURIComponent(`Olá! Gostaria de fazer o pedido:\n\n${lines.join('\n')}\n\nSubtotal: ${formatCurrency(total)}`);
  window.open(`https://wa.me/551100000000?text=${message}`, '_blank', 'noopener');
});

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 30), { passive: true });

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav a');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-45% 0px -45% 0px' });
sections.forEach(section => sectionObserver.observe(section));

const lightbox = document.querySelector('.lightbox');
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const image = lightbox.querySelector('img');
    image.src = item.dataset.full;
    image.alt = item.querySelector('img').alt;
    lightbox.showModal();
  });
});
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) lightbox.close();
});

document.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && cartDrawer.classList.contains('active')) closeCart();
});
document.querySelector('#year').textContent = new Date().getFullYear();
renderCart();
