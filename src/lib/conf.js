/**
 * @namespace
 * @property {number} CACHE_SIZE - The garbage colector is inactive when the amount of resources is less than CACHE_SIZE
 */
export const conf = {
  CACHE_SIZE: 100
}

export const resources = {}
export const plugins = []
export const setHooks = {
  before: [],
  after: []
}

export const serverInstances = []
