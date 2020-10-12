/**
 * @namespace
 * @property {number} CACHE_SIZE - The garbage colector is inactive when the amount of resources is less than CACHE_SIZE
 * @property {object} plugins - Stores the plugins configuration
 * @property {object} plugins.fetch - The configuration for the fetch plugin
 * @property {number} plugins.fetch.checkInterval - Size of the interval, in milliseconds, to check for new values doing a GET request
 * @property {number} plugins.fetch.threshold - Size of the windows, in milliseconds, in which a call to `get`, `onGet`, `refresh` or `useOnGet` will use the cached value instead of make a fetch
 * @property {object} plugins.anyCustomPluginName - Whatever configuration object that were needed by the plugin named `anyCustomPluginName`
 */
export const conf = {
  CACHE_SIZE: 100,
  plugins: {
    fetch: {
      checkInterval: 30000,
      threshold: 500
    }
  }
}

export const resources = {}
export const plugins = []
export const setHooks = {
  beforeSet: [],
  afterSet: [],
  afterRefetch: [],
  beforeRefetch: []
}

export const serverInstances = []
export const debouncedSets = {}
