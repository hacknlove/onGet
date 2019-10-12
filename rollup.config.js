import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

import pkg from './package.json'


export default [
  // CommonJS
  {
    input: 'src/index.js',
    output: { file: 'dist/onGet.cjs.js', format: 'cjs', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  },

  // ES
  {
    input: 'src/index.js',
    output: { file: 'dist/onGet.es.js', format: 'es', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  }
]
