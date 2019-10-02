import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import commonjs from 'rollup-plugin-commonjs'

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
  },

  // ES for Browsers
  {
    input: 'src/index.js',
    output: {
      file: 'dist/onGet.es.min.js',
      format: 'es',
      indent: false
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
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
      file: 'dist/onGet.umd.js',
      format: 'umd',
      name: 'onGet',
      indent: false,
      globals: {
        '@hacknlove/deepobject': 'deepObject',
        isdifferent: 'isDifferent',
        react: 'React'
      }
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      babel(babelConfiguration)
    ]
  },

  // UMD Production
  {
    input: 'src/index.js',
    output: {
      file: 'dist/onGet.umd.min.js',
      format: 'umd',
      name: 'onGet',
      indent: false,
      globals: {
        '@hacknlove/deepobject': 'deepObject',
        isdifferent: 'isDifferent',
        react: 'React'
      }
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
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
  },
]
