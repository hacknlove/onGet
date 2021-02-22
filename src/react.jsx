import React, {
  createContext, useContext, useEffect, useMemo, useState
} from 'react'

import SharedState from '.'

export const ContextState = createContext({})

export function OnGetProvider ({ children, plugins = [], conf = {}, testContextRef }) {
  const value = useMemo(() => {
    const sharedState = new SharedState({ plugins, conf })

    if (testContextRef) {
      testContextRef.sharedState = sharedState
    }

    return sharedState
  }, [])

  return <ContextState.Provider value={value}>{children}</ContextState.Provider>
}

export function WithOnGetValue ({ url, children }) {
  const [value, setValue, resource] = useOnGetValue(url, null)

  return children({
    value, setValue, resource
  })
}

export function useOnGetValue (resource, options) {
  if (typeof resource === 'string') {
    resource = useOnGetResource(resource, options)
  }
  const [value, set] = useState(resource.value)

  useOnGetChange(resource.url, (value) => set(value), null)

  return [
    value,
    (newValue) => resource.setValue(newValue),
    resource
  ]
}

export function useOnGetResource (url, options) {
  const sharedState = useContext(ContextState)
  return sharedState.getResource(url, options)
}

export function useOnGetChange (url, callback, options) {
  const sharedState = useContext(ContextState)

  useEffect(() => sharedState.onChange(url, callback, options), [url])
}

export function useOnGetState () {
  return useContext(ContextState)
}
