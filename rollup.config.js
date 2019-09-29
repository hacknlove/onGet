import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const babelConfiguration = {
  babelrc: false,
  runtimeHelpers: true,
  exclude: 'node_modules/**',
  presets: [['@babel/env', {
    modules: false,
    loose: true,
    targets: {
      browsers: ['ie >= 11']
    }
  }]],
  plugins: ['@babel/proposal-object-rest-spread']
}

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
      nodeResolve()
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
      nodeResolve()
    ]
  },

  // ES for Browsers
  {
    input: 'src/index.js',
    output: { file: 'dist/onGet.es.min.js', format: 'es', indent: false },
    plugins: [
      nodeResolve({
        extensions: ['.ts']
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  },

  // UMD Development
  {
    input: 'src/index.js',
    output: {
      file: 'dist/onGet.cjs.js',
      format: 'umd',
      name: 'onGet',
      indent: false
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve(),
      babel(babelConfiguration)
    ]
  },

  // UMD Production
  {
    input: 'src/index.js',
    output: {
      file: 'dist/onGet.cjs.min.js',
      format: 'umd',
      name: 'onGet',
      indent: false
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve(),
      babel(babelConfiguration),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  }
]
