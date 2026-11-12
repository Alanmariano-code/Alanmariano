// Valida o formulário, aplica a máscara do telefone e atualiza o contador.
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#signup-form");
    const nome = document.querySelector("#nome");
    const email = document.querySelector("#email");
    const telefone = document.querySelector("#whatsapp");
    const observacoes = document.querySelector("#observacoes");
    const contador = document.querySelector("#char-count");
    const mensagem = document.querySelector("#form-message");
    const radiosArea = [...form.querySelectorAll('input[name="area"]')];

    function mostrarErro(campo, elementoErro, texto) {
        campo.classList.toggle("invalid", Boolean(texto));
        campo.setAttribute("aria-invalid", texto ? "true" : "false");
        elementoErro.textContent = texto;
    }

    function validarNome() {
        const erro = nome.value.trim() ? "" : "Informe seu nome.";
        mostrarErro(nome, document.querySelector("#nome-error"), erro);
        return !erro;
    }

    function validarEmail() {
        const erro = email.value.trim() && email.validity.valid ? "" : "Informe um email válido.";
        mostrarErro(email, document.querySelector("#email-error"), erro);
        return !erro;
    }

    function validarArea() {
        const selecionada = radiosArea.some((radio) => radio.checked);
        const erro = selecionada ? "" : "Selecione uma área de atuação.";
        document.querySelector("#area-error").textContent = erro;
        document.querySelector(".area-field").classList.toggle("invalid", !selecionada);
        radiosArea.forEach((radio) => radio.setAttribute("aria-invalid", selecionada ? "false" : "true"));
        return selecionada;
    }

    // Formata até 11 dígitos como (00) 00000-0000.
    telefone.addEventListener("input", () => {
        const digitos = telefone.value.replace(/\D/g, "").slice(0, 11);
        if (digitos.length <= 2) {
            telefone.value = digitos.length ? `(${digitos}` : "";
        } else if (digitos.length <= 6) {
            telefone.value = `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
        } else if (digitos.length <= 10) {
            telefone.value = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
        } else {
            telefone.value = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
        }
    });

    observacoes.addEventListener("input", () => {
        contador.textContent = `${observacoes.value.length}/500`;
    });

    nome.addEventListener("input", validarNome);
    email.addEventListener("input", validarEmail);
    radiosArea.forEach((radio) => radio.addEventListener("change", validarArea));

    form.addEventListener("submit", (event) => {
        // Impede o envio a um servidor: esta versão funciona apenas no navegador.
        event.preventDefault();
        mensagem.hidden = true;

        const nomeValido = validarNome();
        const emailValido = validarEmail();
        const areaValida = validarArea();
        const valido = nomeValido && emailValido && areaValida;
        if (!valido) {
            const primeiroCampoInvalido = form.querySelector(".invalid");
            primeiroCampoInvalido.scrollIntoView({ behavior: "smooth", block: "center" });
            (primeiroCampoInvalido.matches("fieldset") ? radiosArea[0] : primeiroCampoInvalido).focus();
            return;
        }

        const primeiroNome = nome.value.trim().split(/\s+/)[0];
        form.reset();
        contador.textContent = "0/500";
        nome.setAttribute("aria-invalid", "false");
        email.setAttribute("aria-invalid", "false");
        radiosArea.forEach((radio) => radio.setAttribute("aria-invalid", "false"));
        document.querySelector("#nome-error").textContent = "";
        document.querySelector("#email-error").textContent = "";
        document.querySelector("#area-error").textContent = "";
        document.querySelector(".area-field").classList.remove("invalid");

        mensagem.className = "message message-sucesso";
        mensagem.textContent = `Inscrição realizada com sucesso, ${primeiroNome}! Esta é uma demonstração local; os dados não foram enviados.`;
        mensagem.hidden = false;
        mensagem.scrollIntoView({ behavior: "smooth", block: "center" });
    });
});
