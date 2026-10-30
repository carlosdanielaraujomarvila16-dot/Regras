# Vibe Carioca Roleplay — versão GitHub Pages

Esta versão foi adaptada para **GitHub Pages** e não precisa de Node.js.

## Arquivos que devem ficar na raiz do repositório

- `index.html`
- `style.css`
- `script.js`
- `config.js`
- `rules.json`
- `.nojekyll`

## Como publicar

1. Crie um repositório no GitHub.
2. Envie todos os arquivos desta pasta para a raiz.
3. Abra `Settings` no repositório.
4. Entre em `Pages`.
5. Em **Build and deployment**, escolha **Deploy from a branch**.
6. Selecione `main` e `/(root)`.
7. Salve.

O endereço normalmente ficará assim:

`https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/`

## Login ADM

O GitHub Pages é uma hospedagem estática. Não é seguro colocar o usuário
`IceeDev` e a senha diretamente no `script.js`, porque qualquer visitante
conseguiria visualizar o código.

Por isso, o botão **Login ADM** desta versão usa o próprio GitHub:

- ele abre `rules.json` no editor do repositório;
- o GitHub exige login;
- só contas com permissão de escrita conseguem salvar alterações.

Isso mantém a autenticação fora do código público do site.

## Se usar domínio personalizado

Edite `config.js`:

```js
window.VBC_CONFIG = {
  githubOwner: "SEU_USUARIO",
  githubRepo: "SEU_REPOSITORIO",
  githubBranch: "main",
  rulesFile: "rules.json"
};
```

No endereço padrão `usuario.github.io/repositorio/`, o site tenta detectar
usuário e repositório automaticamente.

## Como editar regras

Abra `rules.json`.

Uma categoria:

```json
{
  "id": "roleplay",
  "name": "Roleplay",
  "description": "Descrição",
  "updatedAt": "2026-10-30T14:30:00.000Z",
  "rules": []
}
```

Uma regra:

```json
{
  "id": "roleplay-1",
  "title": "Metagaming",
  "content": "Texto da regra"
}
```

A numeração `1°`, `2°`, `3°...` é automática pela ordem no arquivo.

A formatação continua funcionando:

```text
teste de exemplo:a;b;c;e
d.
```

fica:

```text
teste de exemplo:
a

b

c

e
d.
```

## Compilador de URL

O painel ADM contém um compilador que converte um caminho local para o endereço
público correspondente no seu GitHub Pages.

Exemplo:

`file:///C:/Users/carlo/Documents/projeto%20site/index.html`

depois de publicado pode virar:

`https://seuusuario.github.io/vibe-server/`

Ele não cria URLs falsas em domínios de terceiros.

## Teste local

Use Live Server ou:

```bash
python -m http.server 8000
```

Depois abra:

`http://localhost:8000/`

Abrir diretamente com `file:///` pode impedir o navegador de carregar
`rules.json`.
