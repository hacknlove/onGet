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

export default SharedState;
