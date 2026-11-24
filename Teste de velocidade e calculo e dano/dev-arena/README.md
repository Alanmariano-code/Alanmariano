# ANIME ARENA — The Awakening

Experiência web responsiva de fantasia e RPG de ação, com personagens ilustrados em SVG, arena animada e combate em JavaScript puro. Sem frameworks ou dependências de execução.

## Executar

Abra `index.html` em um navegador moderno. Não é necessário instalar dependências nem iniciar um servidor.

## Funcionalidades

- **Teste de velocidade:** compara dois veículos, anima a corrida e destaca o vencedor ou o empate.
- **Batalha de anime:** personalize herói e guardião, escolha entre Chama do Dragão, Corte Celestial, Explosão Arcana e Tempestade Divina; cada habilidade tem identidade visual e animação próprias.
- **Combate:** mantém as regras de dano originais: ataque acima da defesa causa a diferença; o escudo reduz esse dano pela metade; ataque menor ou igual à defesa causa zero. Atualiza vida, registra rounds e anuncia a vitória.
- **Efeitos de batalha:** avanço do herói, impacto, dano flutuante, defesa de escudo e animação de vitória, feitos com SVG e CSS originais.
- **Desafio extra:** compara a velocidade de dois veículos, anima a corrida e destaca vitória ou empate.
- **Reiniciar combate:** restaura a vida inicial da batalha e limpa o histórico.
- Validação de nomes e valores numéricos não negativos.
- Interface adaptável a telas menores, navegação por teclado, anúncios para leitores de tela e respeito à preferência por movimento reduzido.

## Estrutura

```text
dev-arena/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── README.md
```
