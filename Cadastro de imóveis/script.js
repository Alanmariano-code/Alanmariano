"use strict";

const STORAGE_KEY = "morada-properties";

const propertyForm = document.querySelector("#property-form");
const toast = document.querySelector("#toast");
const sidebar = document.querySelector("#sidebar");
const backdrop = document.querySelector("#sidebar-backdrop");
const mobileMenuButton = document.querySelector("#mobile-menu");
let properties = loadProperties();
let toastTimeout;

const propertyImages = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80"
];
const inspirationCaptions = ["Arquitetura contemporânea", "Casas de alto padrão", "Design sofisticado"];
const homeIcon = `
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m3.5 10 8.5-6.5 8.5 6.5v9a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
  </svg>`;
const bedIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 19v-8.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2V19M3 15h18M6 8.5V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const bathIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2ZM6 12V6a2 2 0 0 1 2-2h1M8 20v1M16 20v1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const carIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 11 1.8-5.4A2.2 2.2 0 0 1 8.9 4h6.2a2.2 2.2 0 0 1 2.1 1.6L19 11M4 11h16v8H4v-8ZM7 19v1.5M17 19v1.5M7 14.5h2M15 14.5h2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Keep saved data resilient: malformed or unavailable LocalStorage starts an empty list.
function loadProperties() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((property) =>
      property &&
      typeof property.id === "string" &&
      typeof property.owner === "string" &&
      Number.isInteger(property.bedrooms) &&
      Number.isInteger(property.bathrooms) &&
      typeof property.garage === "boolean"
    );
  } catch (error) {
    console.error("Não foi possível carregar os imóveis salvos.", error);
    return [];
  }
}

function saveProperties() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    return true;
  } catch (error) {
    console.error("Não foi possível salvar os imóveis.", error);
    showToast("Não foi possível salvar. Verifique o espaço disponível no navegador.", true);
    return false;
  }
}

function updateDashboard() {
  document.querySelector("#total-properties").textContent = properties.length;
  document.querySelector("#total-bedrooms").textContent = properties.reduce((sum, property) => sum + property.bedrooms, 0);
  document.querySelector("#total-bathrooms").textContent = properties.reduce((sum, property) => sum + property.bathrooms, 0);
  document.querySelector("#total-garages").textContent = properties.filter((property) => property.garage).length;
  document.querySelector("#nav-count").textContent = properties.length;
  document.querySelector("#listing-total").textContent = `${properties.length} ${properties.length === 1 ? "imóvel" : "imóveis"}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Data não disponível";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function garageBadge(hasGarage) {
  return `<span class="garage-tag${hasGarage ? "" : " no-garage"}">${carIcon}${hasGarage ? "Com garagem" : "Sem garagem"}</span>`;
}

function getPropertyImage(property) {
  const imageNumber = Array.from(property.id).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return propertyImages[imageNumber % propertyImages.length];
}

function renderRecentProperties() {
  const recentList = document.querySelector("#recent-list");
  const latestProperties = [...properties].slice(-3).reverse();

  if (latestProperties.length === 0) {
    recentList.innerHTML = `
      <div class="empty-state">
        <div class="empty-illustration">${homeIcon}</div>
        <strong>Sua carteira começa aqui</strong>
        <p>Cadastre seu primeiro imóvel para acompanhar tudo por aqui.</p>
      </div>`;
    return;
  }

  recentList.innerHTML = latestProperties.map((property) => `
    <div class="recent-row">
      <div class="recent-owner"><span class="property-mini-icon"><img src="${getPropertyImage(property)}" alt="" loading="lazy"></span><strong>${escapeHTML(property.owner)}</strong></div>
      <div class="recent-detail"><span>Quartos</span><strong>${property.bedrooms}</strong></div>
      <div class="recent-detail"><span>Banheiros</span><strong>${property.bathrooms}</strong></div>
      <div class="recent-detail"><span>Garagem</span>${garageBadge(property.garage)}</div>
    </div>`).join("");
}

function renderPropertyCards() {
  const propertyGrid = document.querySelector("#property-grid");

  if (properties.length === 0) {
    propertyGrid.innerHTML = `
      <div class="panel empty-state">
        <div class="empty-illustration">${homeIcon}</div>
        <strong>Nenhum imóvel cadastrado ainda</strong>
        <p>Adicione seu primeiro imóvel para começar a organizar sua carteira.</p>
      </div>`;
    return;
  }

  propertyGrid.innerHTML = [...properties].reverse().map((property) => `
    <article class="property-card">
      <div class="property-card-cover"><img src="${getPropertyImage(property)}" alt="Imóvel de alto padrão" loading="lazy"></div>
      <div class="property-card-body">
        <div class="property-card-title">
          <div><h3>${escapeHTML(property.owner)}</h3><p>Proprietário</p></div>
          <span class="property-card-date">${formatDate(property.createdAt)}</span>
        </div>
        <div class="property-amenities">
          <span class="amenity">${bedIcon}${property.bedrooms} ${property.bedrooms === 1 ? "quarto" : "quartos"}</span>
          <span class="amenity">${bathIcon}${property.bathrooms} ${property.bathrooms === 1 ? "banheiro" : "banheiros"}</span>
          ${garageBadge(property.garage)}
        </div>
        <div class="card-bottom"><span></span><button class="delete-button" type="button" data-delete-id="${escapeHTML(property.id)}" aria-label="Excluir imóvel de ${escapeHTML(property.owner)}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 13h11l1-13M9 7V4h6v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>Excluir</button></div>
      </div>
    </article>`).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function renderAll() {
  updateDashboard();
  renderInspirationGallery();
  renderRecentProperties();
  renderPropertyCards();
}

function renderInspirationGallery() {
  const gallery = document.querySelector("#inspiration-gallery");
  gallery.innerHTML = propertyImages.map((image, index) => `
    <div class="inspiration-tile">
      <img src="${image}" alt="${inspirationCaptions[index]}" loading="lazy">
      <span>${inspirationCaptions[index]}</span>
    </div>`).join("");
}

function showView(viewName) {
  const validViews = ["dashboard", "form", "listings"];
  if (!validViews.includes(viewName)) return;

  document.querySelectorAll(".view").forEach((view) => {
    const isActive = view.id === `view-${viewName}`;
    view.hidden = !isActive;
    view.classList.toggle("is-visible", isActive);
  });
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    if (link.classList.contains("nav-link")) {
      link.classList.toggle("is-active", link.dataset.viewLink === viewName);
    }
  });

  const labels = { dashboard: "Dashboard", form: "Cadastrar imóvel", listings: "Imóveis cadastrados" };
  document.querySelector("#breadcrumb-current").textContent = labels[viewName];
  closeMobileMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message, isError) {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.toggle("is-error", Boolean(isError));
  toast.classList.add("is-visible");
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3500);
}

function setFieldError(fieldName, message) {
  const error = document.querySelector(`#${fieldName}-error`);
  if (error) error.textContent = message;

  if (fieldName === "garage") {
    document.querySelector(".garage-field").classList.toggle("has-error", Boolean(message));
  } else {
    const inputId = fieldName === "owner" ? "owner-name" : fieldName;
    document.querySelector(`#${inputId}`).closest(".input-wrap").classList.toggle("has-error", Boolean(message));
  }
}

function validateForm(formData) {
  let isValid = true;
  const owner = String(formData.get("owner") || "").trim();
  const bedroomsValue = String(formData.get("bedrooms") || "").trim();
  const bathroomsValue = String(formData.get("bathrooms") || "").trim();
  const bedrooms = Number(bedroomsValue);
  const bathrooms = Number(bathroomsValue);
  const garage = formData.get("garage");

  setFieldError("owner", "");
  setFieldError("bedrooms", "");
  setFieldError("bathrooms", "");
  setFieldError("garage", "");

  if (!owner) {
    setFieldError("owner", "Informe o nome do proprietário.");
    isValid = false;
  }
  if (!bedroomsValue || !Number.isInteger(bedrooms) || bedrooms < 0 || bedrooms > 99) {
    setFieldError("bedrooms", "Informe um número inteiro entre 0 e 99.");
    isValid = false;
  }
  if (!bathroomsValue || !Number.isInteger(bathrooms) || bathrooms < 0 || bathrooms > 99) {
    setFieldError("bathrooms", "Informe um número inteiro entre 0 e 99.");
    isValid = false;
  }
  if (garage !== "yes" && garage !== "no") {
    setFieldError("garage", "Selecione se o imóvel possui garagem.");
    isValid = false;
  }

  return isValid ? { owner, bedrooms, bathrooms, garage: garage === "yes" } : null;
}

function closeMobileMenu() {
  sidebar.classList.remove("is-open");
  backdrop.classList.remove("is-visible");
  mobileMenuButton.setAttribute("aria-expanded", "false");
}

propertyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const propertyData = validateForm(new FormData(propertyForm));
  if (!propertyData) return;

  const property = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...propertyData,
    createdAt: new Date().toISOString()
  };
  properties.push(property);

  if (!saveProperties()) {
    properties = properties.filter((item) => item.id !== property.id);
    return;
  }

  propertyForm.reset();
  renderAll();
  showView("listings");
  showToast("Imóvel cadastrado com sucesso!");
});

propertyForm.addEventListener("reset", () => {
  window.setTimeout(() => {
    ["owner", "bedrooms", "bathrooms", "garage"].forEach((field) => setFieldError(field, ""));
  }, 0);
});

document.addEventListener("click", (event) => {
  const viewLink = event.target.closest("[data-view-link]");
  if (viewLink) {
    event.preventDefault();
    showView(viewLink.dataset.viewLink);
  }

  const deleteButton = event.target.closest("[data-delete-id]");
  if (deleteButton) {
    const property = properties.find((item) => item.id === deleteButton.dataset.deleteId);
    if (!property) return;

    properties = properties.filter((item) => item.id !== property.id);
    if (!saveProperties()) {
      properties.push(property);
      return;
    }

    renderAll();
    showToast("Imóvel removido da sua carteira.");
  }
});

mobileMenuButton.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("is-open");
  backdrop.classList.toggle("is-visible", isOpen);
  mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
});

backdrop.addEventListener("click", closeMobileMenu);

document.querySelector("#today-date").textContent = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
}).format(new Date());
document.querySelector("#current-year").textContent = new Date().getFullYear();

renderAll();
