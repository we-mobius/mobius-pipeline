## Node.js ESM Loaders

Loaders 只支持指定 `.js` 文件，如果要实现整个项目都使用 TypeScript 的目标的话，势必存在一个将 Loaders 从 TypeScript 版本转译为 JavaScript 版本的步骤。这个步骤跟发布阶段的打包如出一辙，但由于只是一个前置步骤，所以不应该做得非常复杂，它应该是简单的，开箱即用的。复杂性主要来自于多样的模块导入方式，我们可以通过一些约束来限制复杂度：

- Loaders 相关的源文件，不应该以 Node.js 原生不支持的模块导入方式引用任何外部代码。
- Loaders 应该被打包成单一文件。

    <aside>
    💡 TypeScript 支持使用不带后缀名的路径标识，如果将这些 TypeScript 文件打包成多个 JavaScript 文件，Node.js 就无法识别，需要在运行的时候加上 `-experimental-specifier-resolution=node` flag。

    </aside>

- 打包命令可以写成 NPM scripts，也可以使用单一的 JavaScript 脚本文件，无论哪种方式，打包的配置文件都不应该单独存在，所以推荐使用后一种方式，以 Programmatic 的方式调用打包器，并手动传入打包配置项。
