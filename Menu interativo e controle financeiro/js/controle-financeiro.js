// Converte uma entrada monetária em número e rejeita valores inválidos ou negativos.
function solicitarValor(mensagem) {
  while (true) {
    const entrada = prompt(mensagem);

    if (entrada === null) {
      return null;
    }

    const texto = entrada.trim();
    const valor = Number(texto.replace(",", "."));
    if (texto !== "" && Number.isFinite(valor) && valor >= 0) {
      return valor;
    }

    alert("Digite um valor numérico igual ou maior que zero.");
  }
}

function iniciarControleFinanceiro() {
  let saldo = solicitarValor("Quanto dinheiro você possui inicialmente?");
  if (saldo === null) {
    alert("Controle financeiro encerrado.");
    return;
  }

  while (true) {
    const escolha = prompt(
      `CONTROLE FINANCEIRO\n\nSaldo atual: R$ ${saldo.toFixed(2)}\n\n1. Adicionar dinheiro\n2. Remover dinheiro\n3. Sair\n\nDigite o número da opção:`
    );

    if (escolha === null) {
      alert(`Controle financeiro encerrado. Saldo final: R$ ${saldo.toFixed(2)}.`);
      return;
    }

    switch (escolha.trim()) {
      case "1": {
        const valor = solicitarValor("Quanto deseja adicionar?");
        if (valor === null) {
          break;
        }
        saldo += valor;
        alert(`Valor adicionado. Saldo atual: R$ ${saldo.toFixed(2)}.`);
        break;
      }
      case "2": {
        const valor = solicitarValor("Quanto deseja remover?");
        if (valor === null) {
          break;
        }
        if (valor > saldo) {
          alert("Não é possível retirar mais dinheiro do que existe no saldo.");
          break;
        }
        saldo -= valor;
        alert(`Valor removido. Saldo atual: R$ ${saldo.toFixed(2)}.`);
        break;
      }
      case "3":
        alert(`Controle financeiro encerrado. Saldo final: R$ ${saldo.toFixed(2)}.`);
        return;
      default:
        alert("Opção inválida. Escolha 1, 2 ou 3.");
    }
  }
}
