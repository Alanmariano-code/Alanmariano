// Executa o menu até que a pessoa escolha encerrar ou cancele o prompt.
function iniciarMenuInterativo() {
  let executando = true;

  while (executando) {
    const escolha = prompt(
      "MENU INTERATIVO\n\n1. Opção 1\n2. Opção 2\n3. Opção 3\n4. Opção 4\n5. Encerrar\n\nDigite o número da opção:"
    );

    if (escolha === null) {
      alert("Menu encerrado.");
      break;
    }

    switch (escolha.trim()) {
      case "1":
      case "2":
      case "3":
      case "4":
        alert(`Você escolheu a opção ${escolha.trim()}.`);
        break;
      case "5":
        alert("Programa encerrado. Até mais!");
        executando = false;
        break;
      default:
        alert("Opção inválida. Escolha um número de 1 a 5.");
    }
  }
}
