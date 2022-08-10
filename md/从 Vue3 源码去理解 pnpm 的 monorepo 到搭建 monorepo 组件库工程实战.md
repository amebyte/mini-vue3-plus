# 从 Vue3 源码入门理解 pnpm 的 monorepo 到以 pnpm 构建 monorepo 方式搭建组件库工程化实战


monorepo 是把多个项目的所有代码放到一个 git 仓库中进行管理，多个项目中会有共享的代码则可以分包引用。整个项目就是有 root 管理的 dependencies 加上多个 packages，每个 package 也可以在自己的作用域引入自己的 dependencies。

