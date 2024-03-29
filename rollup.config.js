import json from '@rollup/plugin-json' // 解析.json文件
import resolve from '@rollup/plugin-node-resolve' // 允许加载在node_modules中的第三方模块
import commonjs from '@rollup/plugin-commonjs' // 将commonJs模块转换为es6
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import clear from 'rollup-plugin-clear'
import cleanup from 'rollup-plugin-cleanup'
import size from 'rollup-plugin-sizes'
import { visualizer } from 'rollup-plugin-visualizer'
const GYMITO = 'GYMITO'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified')
}
// 是否生成声明文件
const isDeclaration = process.env.TYPES !== 'false'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const masterVersion = require('./package.json').version
const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const packageDirDist = process.env.LOCALDIR === 'undefined' ? `${packageDir}/dist` : process.env.LOCALDIR
// package => file name
const name = path.basename(packageDir)
// const pathResolve = (p) => path.resolve(packageDir, p)

// major name
const M = '@gymito/monitor'
const packageDirs = fs.readdirSync(packagesDir)
const paths = {}
packageDirs.forEach((dir) => {
  // filter hidden files
  if (dir.startsWith('.')) return
  // paths[`${M}/${dir}`] = [`${packagesDir}/${dir}/src`]
  paths[`@gymito/monitor-${dir}`] = [`${packagesDir}/${dir}/src`]
})



const common = {
  input: `${packageDir}/src/index.ts`,
  output: {
    banner: `/* ${M}-${name} version ' + ${masterVersion} */`,
    footer: '/* follow me on Github! @gymito */'
  },
  external: [...Object.keys(paths)],
  plugins: [
    resolve(),
    size(),
    visualizer({
      title: `${M} analyzer`,
      filename: 'analyzer.html'
    }),
    commonjs({
      exclude: 'node_modules'
    }),
    json(),
    cleanup({
      comments: 'none'
    }),
    typescript({
      tsconfig: 'tsconfig.build.json',
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          declaration: isDeclaration,
          declarationMap: isDeclaration,
          declarationDir: `${packageDirDist}/packages/`, // 类型声明文件的输出目录
          module: 'ES2015',
          paths
        }
      },
      include: ['*.ts+(|x)', '**/*.ts+(|x)', '../**/*.ts+(|x)']
    })
  ]
}
const esmPackage = {
  ...common,
  output: {
    file: `${packageDirDist}/${name}.esm.js`,
    format: 'es',
    name: GYMITO,
    sourcemap: true,
    ...common.output
  },
  plugins: [
    ...common.plugins,
    clear({
      targets: [packageDirDist]
    })
  ]
}
const cjsPackage = {
  ...common,
  external: [],
  output: {
    file: `${packageDirDist}/${name}.js`,
    format: 'cjs',
    name: GYMITO,
    sourcemap: true,
    minifyInternalExports: true,
    ...common.output
  },
  plugins: [...common.plugins]
}

const iifePackage = {
  ...common,
  external: [],
  output: {
    file: `${packageDirDist}/${name}.min.js`,
    format: 'iife',
    name: GYMITO,
    ...common.output
  },
  plugins: [...common.plugins, terser()]
}
const total = {
  esmPackage,
  iifePackage,
  cjsPackage
}
let result = total
export default [...Object.values(result)]
