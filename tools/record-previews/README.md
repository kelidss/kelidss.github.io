# Gravador de prévias dos projetos

Entra no site de cada projeto com o Chrome (headless), grava ~8 s navegando
pela página e salva em `assets/<projeto>/preview.webm`. Os cards do portfólio
tocam esse vídeo quando aparecem na tela.

## Uso

```bash
cd tools/record-previews
npm run setup          # uma vez: instala o Playwright e o ffmpeg dele
npm run record         # grava todos
npm run record -- orfeu leticia   # só alguns (slugs em record.js)
```

Precisa do Google Chrome instalado (usa o canal `chrome`, sem baixar navegador).

- Páginas com rolagem: rola até 4 telas e volta ao topo.
- Páginas sem rolagem (login): zoom lento com o cursor passeando.
- `maxScreens` limita quantas telas rolar (ex.: MentalClean, página da loja).
- Frames de conferência ficam em `.qa/<slug>/` (ignorados no git).

Para trocar a URL de um projeto ou adicionar um novo, edite a lista
`PROJECTS` em `record.js` e inclua o `<video>` no card em `index.html`.
