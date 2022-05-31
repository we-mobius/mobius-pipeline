<p align="center">
  <a href="#" target="_blank" rel="noopener noreferrer">
    <img width="150" src="./public/assets/thoughts-daily.jpg" alt="Thoughts Daily Logo"/>
  </a>
</p>

<p align="center">
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly"></a>
  <a href="https://www.jsdelivr.com/package/gh/we-mobius/mobius-pipeline"><img src="https://data.jsdelivr.com/v1/package/gh/we-mobius/mobius-pipeline/badge" alt="Distributed on jsDelivr"></a>
</p>

<p align="center">
  <span style="font-weight: bold; color: hsla(96, 100%, 50%, 100%);">📜 English Doc </span>
  &nbsp;|&nbsp;
  <a href="./docs/readme_zh.md" style="color: hsla(264, 100%, 50%, 100%);">📜 中文文档</a>
</p>

<h1 align="center">Mobius Pipeline</h1>

🖇️ Nothing but another next generation JavaScript tool chain.

## Details

...

## Documentation

### How to use?

Using `npm install @we-mobius/mobius-pipeline -D` to install it in local or using `npm install @we-mobius/mobius-pipeline -g` to install it in global.

```bash
# locally use
npx mow run ./path/to/ts/file
# globally use
mow run ./path/to/ts/file
```

### How to dev?

Clone the repo to your local machine and initialize it via `npm install`.

Since you are prepared, run `npm run build-loader` at first, you will get an esm-loader for Node.js interpreter.

Then you can use that loader to run any TypeScript file directly via Node.js. For example:

```bash
node --loader file://D://Root//Files//CodeSpace//mobius-project-workspace//mobius-pipeline//dist//support/loader.js .\\src\\executables\\build.ts
```

If you execute the command above, you've got a simpler runner, which can run any TypeScript file directly as well, in a nicer way.

```bash
node ./bin/mow.js run .\\public\\examples\\main.ts
```

As the `mow.js` is declared as a executable in `package.json`'s `bin` field, you can register it as a global command using `npm install -g ./`. Then it can be invoked by `mow`. For example:

```bash
mow run .\\public\\examples\\main.ts
```

## Built With

- [Mobius Utils](https://github.com/we-mobius/mobius-utils) 🤞
- somthing else...

## Author

- **Cigaret** - kcigaret@outlook.com

## License

This project is licensed under the **GPL-3.0** License - see the [LICENSE](LICENSE) file for details.
