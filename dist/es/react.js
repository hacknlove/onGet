import React, { createContext, useMemo, useState, useContext, useEffect } from 'react';

class VarResource {
  constructor (url, options = {}) {
    this.url = url;
    this.cached = options.firstValue;
    this.defaultValue = options.defaultValue;
    this.subscriptions = new Map();
    this.totalSubscriptionsCount = 0;
  }

  setValue (value) {
    this.cached = value;
    this.triggerSubscriptions();
  }

  getValue () {
    return this.cached ?? this.defaultValue
  }

  triggerSubscriptions () {
    for (const subscription of this.subscriptions.values()) {
      subscription(this.value, this);
    }
  }

  get value () {
    return this.getValue()
  }

  set value (value) {
    this.setValue(value);
  }

  onChange (callback) {
    const key = this.totalSubscriptionsCount++;

    this.subscriptions.set(key, callback);
    return () => this.subscriptions.delete(key)
  }
}

class VarPlugin {
  newResource (url, options) {
    return new VarResource(url, options)
  }
}

VarPlugin.protocol = 'var';

const defaultConf = {};

const proxyHandler = {
  get (target, url) {
    return target.getValue(url)
  },

  deleteProperty (target, url) {
    target.deleteReource(url);
  },

  set (target, url, value) {
    target.setValue(url, value);
    return true
  }
};

class SharedState {
  constructor ({ plugins = [], conf = {} }) {
    this.plugins = new Map(plugins.map(Plugin => [Plugin.protocol, new Plugin(this)]));

    if (!this.plugins.has('var')) {
      this.plugins.set('var', new VarPlugin(this));
    }

    this.conf = { ...defaultConf, ...conf };
    this.resources = new Map();

    this.proxy = new Proxy(this, proxyHandler);
  }

  findPlugin (url) {
    return this.plugins.get(url.split(':', 1)) || this.plugins.get('var')
  }

  getResource (url, options = {}) {
    let resource = this.resources.get(url);

    if (resource) {
      return resource
    }

    const plugin = this.findPlugin(url);

    resource = plugin.newResource(url, options, this);

    this.resources.set(url, resource);

    return resource
  }

  getValue (url, options = {}) {
    return this.getResource(url, options).value
  }

  setValue (url, value, options = {}) {
    const resource = this.getResource(url, options);

    resource.setValue(value, options);
  }

  deleteReource (url) {
    const resource = this.getResource(url);

    resource.delete();

    this.resources.delete(url);
  }

  onChange (url, callback, options) {
    return this.getResource(url).onChange(callback, options)
  }
}

var ContextState = createContext({});
function OnGetProvider(_a) {
    var children = _a.children, _b = _a.plugins, plugins = _b === void 0 ? [] : _b, _c = _a.conf, conf = _c === void 0 ? {} : _c, testContextRef = _a.testContextRef;
    var value = useMemo(function () {
        var sharedState = new SharedState({ plugins: plugins, conf: conf });
        if (testContextRef) {
            testContextRef.sharedState = sharedState;
        }
        return sharedState;
    }, []);
    return React.createElement(ContextState.Provider, { value: value }, children);
}
function WithOnGetValue(_a) {
    var url = _a.url, children = _a.children;
    var _b = useOnGetValue(url, null), value = _b[0], setValue = _b[1], resource = _b[2];
    return children({
        value: value, setValue: setValue, resource: resource
    });
}
function useOnGetValue(resource, options) {
    if (typeof resource === 'string') {
        resource = useOnGetResource(resource, options);
    }
    var _a = useState(resource.value), value = _a[0], set = _a[1];
    useOnGetChange(resource.url, function (value) { return set(value); }, null);
    return [
        value,
        function (newValue) { return resource.setValue(newValue); },
        resource
    ];
}
function useOnGetResource(url, options) {
    var sharedState = useContext(ContextState);
    return sharedState.getResource(url, options);
}
function useOnGetChange(url, callback, options) {
    var sharedState = useContext(ContextState);
    useEffect(function () { return sharedState.onChange(url, callback, options); }, [url]);
}
function useOnGetState() {
    return useContext(ContextState);
}

export { ContextState, OnGetProvider, WithOnGetValue, useOnGetChange, useOnGetResource, useOnGetState, useOnGetValue };
