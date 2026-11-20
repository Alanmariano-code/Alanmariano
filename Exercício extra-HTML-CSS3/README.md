# ALESSIO'S PIZZARIA

Website responsivo e profissional para uma pizzaria italiana premium, desenvolvido com HTML5, CSS3 e JavaScript puro.

## Estrutura

- `index.html` - estrutura semântica do site
- `css/style.css` - identidade visual, responsividade e animações
- `js/script.js` - menu, carrinho, localStorage, galeria e animações
- `assets/images` - fotografias utilizadas no projeto
- `assets/icons` - diretório reservado para ícones

## Funcionalidades

- Menu fixo e navegação responsiva
- 12 pizzas no cardápio
- Carrinho com adição, remoção e alteração de quantidade
- Persistência do carrinho em `localStorage`
- Cálculo automático do subtotal
- Galeria com lightbox
- Animações de entrada com suporte a `prefers-reduced-motion`
- Layout adaptado a desktops, tablets e smartphones

## Dados editáveis

Os valores do cardápio são exemplos visuais e estão armazenados nos atributos `data-price` dos cards em `index.html`. Os dados de endereço, telefone, e-mail, WhatsApp e redes sociais devem ser substituídos pelas informações oficiais da pizzaria.

Também podem ser configurados no arquivo `js/script.js`:

- Número do WhatsApp usado no checkout
- Número usado no botão de contato

## Execução

Abra o arquivo `index.html` diretamente no navegador ou utilize uma extensão de servidor local no VS Code.
