const menuToggle = document.querySelector("#menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const searchInput = document.querySelector("#book-search");
const searchForm = document.querySelector("#search-form");
const bookCards = [...document.querySelectorAll(".book-card")];
const categoryControls = [...document.querySelectorAll("[data-category]")];
const emptyState = document.querySelector("#empty-state");
const catalogStatus = document.querySelector("#catalog-status");
const cartDialog = document.querySelector("#cart-dialog");
const loginDialog = document.querySelector("#login-dialog");
const cartItemsContainer = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartSummary = document.querySelector("#cart-summary");
const cartCount = document.querySelector("#cart-count");
const toast = document.querySelector("#toast");

const products = new Map(
  bookCards.map((card) => [
    card.dataset.id,
    {
      id: card.dataset.id,
      title: card.dataset.title,
      author: card.dataset.author,
      category: card.dataset.category,
      priceCents: Number(card.dataset.priceCents),
      price: Number(card.dataset.price),
    },
  ]),
);

const cart = new Map();
let activeCategory = "todos";
let toastTimeout;

const formatPrice = (priceCents) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceCents / 100);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function filterBooks() {
  const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  let visibleCount = 0;

  bookCards.forEach((card) => {
    const matchesQuery = `${card.dataset.title} ${card.dataset.author}`.toLocaleLowerCase("pt-BR").includes(query);
    const matchesCategory = activeCategory === "todos" || card.dataset.category === activeCategory;
    const isVisible = matchesQuery && matchesCategory;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
  catalogStatus.textContent = `${visibleCount} ${visibleCount === 1 ? "livro encontrado" : "livros encontrados"}.`;
}

function setCategory(category) {
  activeCategory = category;
  categoryControls.forEach((control) => {
    const isActive = control.dataset.category === category;
    control.classList.toggle("is-active", isActive);
    if (control.matches(".filter-chip")) control.setAttribute("aria-pressed", String(isActive));
  });
  filterBooks();
}

function updateCart() {
  const totalQuantity = [...cart.values()].reduce((total, item) => total + item.quantity, 0);
  const totalCents = [...cart.values()].reduce(
    (total, item) => total + products.get(item.id).priceCents * item.quantity,
    0,
  );
  cartCount.textContent = String(totalQuantity);
  document.querySelector("#cart-open").setAttribute(
    "aria-label",
    `Abrir carrinho, ${totalQuantity} ${totalQuantity === 1 ? "item" : "itens"}`,
  );
  document.querySelector("#cart-title-count").textContent = `(${totalQuantity})`;
  cartItemsContainer.replaceChildren();

  cart.forEach((item, id) => {
    const product = products.get(id);
    const row = document.createElement("article");
    row.className = "cart-item";
    row.innerHTML = `
      <span class="cart-item-cover" aria-hidden="true"><i class="fa-solid fa-book-open"></i></span>
      <div>
        <h3 class="cart-item-title"></h3>
        <p class="cart-item-author"></p>
        <p class="cart-item-price">${formatPrice(product.priceCents * item.quantity)}</p>
      </div>
      <div class="cart-item-controls" aria-label="Quantidade de ${product.title}">
        <button class="quantity-button" type="button" data-cart-action="decrease" data-id="${id}" aria-label="Diminuir quantidade de ${product.title}"><i class="fa-solid fa-minus" aria-hidden="true"></i></button>
        <span class="cart-item-quantity">${item.quantity}</span>
        <button class="quantity-button" type="button" data-cart-action="increase" data-id="${id}" aria-label="Aumentar quantidade de ${product.title}"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
      </div>`;
    row.querySelector(".cart-item-title").textContent = product.title;
    row.querySelector(".cart-item-author").textContent = product.author;
    cartItemsContainer.append(row);
  });

  const isEmpty = cart.size === 0;
  cartEmpty.hidden = !isEmpty;
  cartSummary.hidden = isEmpty;
  document.querySelector("#cart-subtotal").textContent = formatPrice(totalCents);
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  menuToggle.innerHTML = `<i class="fa-solid ${isOpen ? "fa-bars" : "fa-xmark"}" aria-hidden="true"></i>`;
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  }
});

searchInput.addEventListener("input", filterBooks);
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" });
});

categoryControls.forEach((control) => {
  control.addEventListener("click", () => {
    setCategory(control.dataset.category);
    document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("#show-all-books").addEventListener("click", () => {
  searchInput.value = "";
  setCategory("todos");
});

document.querySelector("[data-filter-sale]").addEventListener("click", () => {
  searchInput.value = "";
  setCategory("todos");
});

document.querySelector("#book-grid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-to-cart]");
  if (!button) return;

  const id = button.closest(".book-card").dataset.id;
  const item = cart.get(id);
  cart.set(id, { id, quantity: (item?.quantity ?? 0) + 1 });
  updateCart();
  showToast(`${products.get(id).title} foi adicionado à sua sacola.`);
});

document.querySelector("#cart-open").addEventListener("click", () => cartDialog.showModal());
document.querySelector("#login-open").addEventListener("click", () => loginDialog.showModal());

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.closeDialog}`).close());
});

cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) cartDialog.close();
});

loginDialog.addEventListener("click", (event) => {
  if (event.target === loginDialog) loginDialog.close();
});

cartItemsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;

  const { id } = button.dataset;
  const item = cart.get(id);
  if (!item) return;

  if (button.dataset.cartAction === "increase") {
    cart.set(id, { ...item, quantity: item.quantity + 1 });
  } else if (item.quantity === 1) {
    cart.delete(id);
  } else {
    cart.set(id, { ...item, quantity: item.quantity - 1 });
  }
  updateCart();
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  showToast("Esta demonstração não processa pagamentos.");
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#newsletter-message").textContent =
    "Cadastro demonstrativo concluído. Nenhuma inscrição foi enviada a um servidor.";
  event.currentTarget.reset();
});

document.querySelector("#login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#login-message").textContent = "Formulário demonstrativo: sua conta não foi acessada.";
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
updateCart();
