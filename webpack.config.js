const path = require('path')

var config = {
  mode: process.env.MODE,
  entry: path.resolve(__dirname, 'src/index.js'),
  plugins: [],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'onGet.js',
    library: 'onGet',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: 'this'
  },
  externals: {
    '@hacknlove/deepobject': {
      commonjs: '@hacknlove/deepobject',
      commonjs2: '@hacknlove/deepobject',
      amd: '@hacknlove/deepobject',
      root: 'deepObject'
    },
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React'
    },
    isdifferent: {
      commonjs: 'isdifferent',
      commonjs2: 'isdifferent',
      amd: 'isdifferent',
      root: 'isDifferent'
    }
  }
}

if (config.mode === 'production') {
  config.optimization = {
    minimize: true
  }
  config.output.filename = 'onGet.min.js'
} else {
  config.devtool = 'source-map'
}

module.exports = config
