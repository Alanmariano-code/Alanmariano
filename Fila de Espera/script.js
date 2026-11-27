"use strict";

const patients = [
  { id: 1, name: "Ana Oliveira", reason: "Consulta de rotina", arrival: "09:12", color: "mint" },
  { id: 2, name: "Carlos Mendes", reason: "Retorno", arrival: "09:18", color: "lavender" },
  { id: 3, name: "Beatriz Santos", reason: "Exame de sangue", arrival: "09:24", color: "peach" },
  { id: 4, name: "Roberto Lima", reason: "Consulta de rotina", arrival: "09:31", color: "blue" }
];
const servedPatients = [];
let nextPatientId = patients.length + 1;
let audioContext;

const elements = {
  patientList: document.querySelector("#patient-list"),
  totalPatients: document.querySelector("#total-patients"),
  nextPatient: document.querySelector("#next-patient"),
  nextWait: document.querySelector("#next-wait"),
  servedPatients: document.querySelector("#served-patients"),
  queueStatus: document.querySelector("#queue-status"),
  queueStatusDot: document.querySelector("#queue-status-dot"),
  queueBadge: document.querySelector("#queue-badge"),
  queueSummary: document.querySelector("#queue-summary"),
  sidebarCount: document.querySelector("#sidebar-count"),
  activityList: document.querySelector("#activity-list"),
  dialog: document.querySelector("#patient-dialog"),
  form: document.querySelector("#patient-form"),
  nameInput: document.querySelector("#patient-name"),
  reasonInput: document.querySelector("#patient-reason"),
  toastRegion: document.querySelector("#toast-region")
};

const avatarColors = {
  mint: { background: "#e7f6ef", color: "#248768" },
  lavender: { background: "#f0ebf8", color: "#7964ad" },
  peach: { background: "#fff0e8", color: "#c27b58" },
  blue: { background: "#eaf3f8", color: "#5686a3" }
};

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getInitials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function renderQueue() {
  const count = patients.length;
  elements.totalPatients.textContent = String(count);
  elements.nextPatient.textContent = count ? patients[0].name : "—";
  elements.nextWait.textContent = count ? `Posição 1 · Chegou às ${patients[0].arrival}` : "Nenhum paciente aguardando";
  elements.servedPatients.textContent = String(servedPatients.length);
  elements.queueStatus.textContent = count ? "Em atendimento" : "Vazia";
  elements.queueStatusDot.parentElement.classList.toggle("is-empty", count === 0);
  elements.queueBadge.textContent = `${count} ${count === 1 ? "paciente" : "pacientes"}`;
  elements.queueSummary.textContent = `Mostrando ${count} ${count === 1 ? "paciente" : "pacientes"}`;
  elements.sidebarCount.textContent = String(count);

  if (!count) {
    elements.patientList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon"><i data-lucide="users-round" aria-hidden="true"></i></span>
        <strong>Nenhum paciente na fila</strong>
        <p>Quando você adicionar um paciente, ele aparecerá aqui para acompanhamento.</p>
        <button class="button button-primary" type="button" data-action="add-patient"><i data-lucide="plus" aria-hidden="true"></i>Adicionar paciente</button>
      </div>`;
  } else {
    elements.patientList.innerHTML = patients.map((patient, index) => {
      const safeName = escapeHtml(patient.name);
      const safeReason = escapeHtml(patient.reason || "Consulta geral");
      const style = avatarColors[patient.color] || avatarColors.mint;
      return `
        <article class="patient-row${index === 0 ? " first-patient" : ""}">
          <div class="position-cell"><span class="position-number">${index + 1}</span>${index === 0 ? '<span class="first-label">Próximo</span>' : ""}</div>
          <div class="patient-person">
            <span class="patient-avatar" style="background:${style.background};color:${style.color}">${escapeHtml(getInitials(patient.name))}</span>
            <span class="patient-details"><strong>${safeName}</strong><span>Paciente</span></span>
          </div>
          <span class="arrival-cell"><i data-lucide="clock-3" aria-hidden="true"></i>${escapeHtml(patient.arrival)}</span>
          <span class="reason-cell">${safeReason}</span>
          <span class="status-cell"><span class="status-pill">${index === 0 ? "Próximo" : "Aguardando"}</span></span>
        </article>`;
    }).join("");
  }
  refreshIcons();
}

function renderActivity() {
  if (!servedPatients.length) {
    elements.activityList.innerHTML = '<p class="activity-empty">Os atendimentos concluídos aparecerão aqui.</p>';
    return;
  }
  elements.activityList.innerHTML = servedPatients.slice(0, 4).map((patient) => `
    <div class="activity-item">
      <span class="activity-avatar">${escapeHtml(getInitials(patient.name))}</span>
      <span class="activity-copy"><strong>${escapeHtml(patient.name)} foi atendido(a)</strong><span>${escapeHtml(patient.reason || "Consulta geral")}</span></span>
      <span class="activity-time">${escapeHtml(patient.servedAt)}</span>
    </div>`).join("");
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function playCallSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  audioContext = audioContext || new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(660, now);
  oscillator.frequency.setValueAtTime(880, now + 0.12);
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.linearRampToValueAtTime(0.12, now + 0.02);
  volume.gain.linearRampToValueAtTime(0.0001, now + 0.11);
  volume.gain.linearRampToValueAtTime(0.1, now + 0.14);
  volume.gain.linearRampToValueAtTime(0.0001, now + 0.3);
  oscillator.connect(volume);
  volume.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.31);
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast${type === "error" ? " error" : ""}`;
  const icon = type === "error" ? "circle-alert" : "circle-check";
  toast.innerHTML = `<span class="toast-icon"><i data-lucide="${icon}" aria-hidden="true"></i></span><span></span>`;
  toast.querySelector("span:last-child").textContent = message;
  elements.toastRegion.append(toast);
  refreshIcons();
  window.setTimeout(() => {
    toast.classList.add("removing");
    window.setTimeout(() => toast.remove(), 220);
  }, 3500);
}

function openPatientDialog() {
  elements.dialog.showModal();
  window.setTimeout(() => elements.nameInput.focus(), 0);
}

function closePatientDialog() {
  elements.dialog.close();
}

function addPatient(event) {
  event.preventDefault();
  const name = elements.nameInput.value.trim();
  if (!name) {
    showToast("Informe o nome do paciente para continuar.", "error");
    elements.nameInput.focus();
    return;
  }
  const colors = Object.keys(avatarColors);
  const patient = {
    id: nextPatientId++,
    name,
    reason: elements.reasonInput.value.trim(),
    arrival: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    color: colors[(nextPatientId - 2) % colors.length]
  };
  patients.push(patient);
  elements.form.reset();
  closePatientDialog();
  renderQueue();
  showToast(`${patient.name} foi adicionado(a) à fila.`);
}

function callNextPatient() {
  if (!patients.length) {
    showToast("A fila está vazia. Adicione um paciente primeiro.", "error");
    return;
  }
  const patient = patients.shift();
  patient.servedAt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
  servedPatients.unshift(patient);
  renderQueue();
  renderActivity();
  playCallSound();
  showToast(`${patient.name} foi chamado(a) para atendimento.`);
}

function clearQueue() {
  if (!patients.length) {
    showToast("A fila já está vazia.", "error");
    return;
  }
  const confirmed = window.confirm(`Deseja realmente limpar a fila de ${patients.length} ${patients.length === 1 ? "paciente" : "pacientes"}? Esta ação não pode ser desfeita.`);
  if (!confirmed) return;
  patients.length = 0;
  renderQueue();
  showToast("A fila foi limpa com sucesso.");
}

function setCurrentDate() {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(today);
  document.querySelector("#current-date").textContent = formattedDate;
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(today);
  document.querySelector(".eyebrow").innerHTML = `<span class="eyebrow-line"></span>${escapeHtml(weekday.toLocaleUpperCase("pt-BR"))}, <span id="current-date">${escapeHtml(formattedDate)}</span>`;
}

document.querySelector("#open-patient-modal").addEventListener("click", openPatientDialog);
document.querySelector("#close-patient-modal").addEventListener("click", closePatientDialog);
document.querySelector("#cancel-patient").addEventListener("click", closePatientDialog);
document.querySelector("#call-next").addEventListener("click", callNextPatient);
document.querySelector("#clear-queue").addEventListener("click", clearQueue);
elements.form.addEventListener("submit", addPatient);
elements.patientList.addEventListener("click", (event) => {
  if (event.target.closest('[data-action="add-patient"]')) openPatientDialog();
});
elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) closePatientDialog();
});
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

setCurrentDate();
renderQueue();
renderActivity();
refreshIcons();
