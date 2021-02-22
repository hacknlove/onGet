import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

export default [
  // CommonJS
  {
    input: 'src/index.js',
    output: [
      { file: 'dist/cjs/index.js', format: 'cjs', indent: false },
      { file: 'dist/es/index.js', format: 'es', indent: false }
    ],
    external: [],
    plugins: [
      nodeResolve(),
      commonjs(),
      terser()
    ]
  },
  {
    input: 'src/plugins/var.js',
    output: [
      { file: 'dist/cjs/var.js', format: 'cjs', indent: false },
      { file: 'dist/es/var.js', format: 'es', indent: false }
    ],
    external: [],
    plugins: [
      nodeResolve(),
      commonjs(),
      terser()
    ]
  },
  {
    input: 'src/plugins/api.js',
    output: [
      { file: 'dist/cjs/api.js', format: 'cjs', indent: false },
      { file: 'dist/es/api.js', format: 'es', indent: false }
    ],
    external: [],
    plugins: [
      nodeResolve(),
      commonjs(),
      terser()
    ]
  },
  {
    input: 'src/plugins/com.js',
    output: [
      { file: 'dist/cjs/com.js', format: 'cjs', indent: false },
      { file: 'dist/es/com.js', format: 'es', indent: false }
    ],
    external: [],
    plugins: [
      nodeResolve(),
      commonjs(),
      terser()
    ]
  },
  {
    input: 'src/plugins/dot.js',
    output: [
      { file: 'dist/cjs/dot.js', format: 'cjs', indent: false },
      { file: 'dist/es/dot.js', format: 'es', indent: false }
    ],
    external: ['@hacknlove/deepobject', 'proxy-deep'],
    plugins: [
      nodeResolve(),
      commonjs(),
      terser()
    ]
  },
  {
    input: 'src/react.tsx',
    output: [
      { file: 'dist/cjs/react.js', format: 'cjs', indent: false },
      { file: 'dist/es/react.js', format: 'es', indent: false }
    ],
    external: ['react'],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ useTsconfigDeclarationDir: true }),
      terser()
    ]
  }
]
