# a mini vue3.0 study by cuixiaorui
### setup环境-集成jest做单元测试-集成 ts

#### 基础集成

初始化项目

```javascript
npm init -y
```
集成typescript
```javascript
yarn add typescript --dev
npx tsc --init
```
引入jest
```javascript
yarn add jest @types/jest --dev
```
在tsconfig.json里配件jest
```javascript
// tsconfig.json
"types": ["jest"], 
```
在package.json的scripts里面配置jest启动脚本命令
```javascript
  "scripts": {
    "test": "jest"
  },
```
我们的代码运行在nodeJS环境下，node默认的模块的规范是commonJS，我们使用import的是ES规范，所以使用babel进行转换。

#### 使用 Babel[#](https://jestjs.io/zh-Hans/docs/getting-started#使用-babel)

如果需要使用 [Babel](https://babeljs.io/)，可以通过 `yarn`来安装所需的依赖。
```javascript
yarn add --dev babel-jest @babel/core @babel/preset-env
```

可以在工程的根目录下创建一个`babel.config.js`文件用于配置与你当前Node版本兼容的Babel：

```javascript
// babel.config.js
module.exports = {
  presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
};
```
*Babel的配置取决于具体的项目使用场景* ，可以查阅 [Babel官方文档](https://babeljs.io/docs/en/)来获取更多详细的信息。



#### 使用 TypeScript

Jest可以通过Babel支持TypeScript。 首先，在项目中正确的使用[Babel](https://jestjs.io/zh-Hans/docs/getting-started#using-babel)。 其次，使用Yarn或者Npm安装 `@babel/preset-typescript`
```javascript
yarn add --dev @babel/preset-typescript
```

你需要添加`@babel/preset-typescript`的预设到`babel.config.js`.

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
+    '@babel/preset-typescript',
  ],
};
```

不过，在配合使用TypeScript与Babel时，仍然有一些 [注意事项](https://babeljs.io/docs/en/babel-plugin-transform-typescript#caveats) 。 因为Babel对Typescrip的支持是纯编译形式（无类型校验），因此Jest在运行测试时不会对它们进行类型检查。 如果需要类型校验，可以改用[ts-jest](https://github.com/kulshekhar/ts-jest)，也可以单独运行TypeScript编译器 [tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html) （或作为构建过程的一部分）。

您可能还想为所使用的Jest版本安装[@ types / jest](https://www.npmjs.com/package/@types/jest)模块。 使用TypeScript编写测试时，这将有助于提供完整的键入内容。

> 在使用 `@types/*` 时，我们推荐使用与依赖包相同版本的类型包 例如，若你使用 `26.4.0` 版本的`jest` ，最好也使用`26.4.x` 的`@types/jest` 。 通常需要尽可能的匹配主版本号 (`26`) 和次版本号 (`4`)。
```javascript
yarn add --dev @types/jest
```

因为我们是在开发测试阶段，为了方便配置ts类型允许写any类型
```javascript
// tsconfig.json 允许写any类型
 "noImplicitAny": false

// tsconfig.json
 "lib": ["DOM", "ES6"],   
```

### 使用rollup打包库

安装rollup库

```javascript
yarn add rollup --dev
```

添加rollup.config.js，注意：rollup天然就支持esm

```javascript
yarn add @rollup/plugin-typescript --dev
```

```javascript
import typescript from "@rollup/plugin-typescript"
export default {
    input: "./src/index.ts",
    output: [
        // cjs => commonjs
        // esm
        {
            format: "cjs",
            file: "lib/mini-vue.cjs.js"
        },
        {
            format: "es",
            file: "lib/mini-vue.esm.js"
        }
    ],
    plugins:[typescript()]
}
```

配置命令

```javascript
"script":{
    "build": "rollup -c rollup.config.js"
}
```
修改tsconfig.json配置文件
```javascript
// 将"module": "commonjs",改成"module": "esnext"
"module": "esnext", 
"moduleResolution": "node", 
```

添加tslib

```javascript
yarn add tslib --dev
```

