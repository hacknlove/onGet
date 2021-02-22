import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { babel } from '@rollup/plugin-babel';

export default [
  // CommonJS
  {
    input: 'src/index.js',
    output: [
      { file: 'dist/cjs/index.js', format: 'cjs', indent: false },
      { file: 'dist/index.js', format: 'es', indent: false }
    ],
    external: [],
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled' })
    ]
  },
  {
    input: 'src/plugins/var.js',
    output: [
      { file: 'dist/cjs/var.js', format: 'cjs', indent: false },
      { file: 'dist/var.js', format: 'es', indent: false }
    ],
    external: [],
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled' })
    ]
  },
  {
    input: 'src/plugins/api.js',
    output: [
      { file: 'dist/cjs/api.js', format: 'cjs', indent: false },
      { file: 'dist/api.js', format: 'es', indent: false }
    ],
    external: [],
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled' })
    ]
  },
  {
    input: 'src/plugins/com.js',
    output: [
      { file: 'dist/cjs/com.js', format: 'cjs', indent: false },
      { file: 'dist/com.js', format: 'es', indent: false }
    ],
    external: [],
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled' })
    ]
  },
  {
    input: 'src/plugins/dot.js',
    output: [
      { file: 'dist/cjs/dot.js', format: 'cjs', indent: false },
      { file: 'dist/dot.js', format: 'es', indent: false }
    ],
    external: ['@hacknlove/deepobject', 'proxy-deep'],
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled' })
    ]
  },
  {
    input: 'src/react.jsx',
    output: [
      { file: 'dist/cjs/react.js', format: 'cjs', indent: false },
      { file: 'dist/react.js', format: 'es', indent: false }
    ],
    external: ['react'],
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled' })
    ]
  }
]
