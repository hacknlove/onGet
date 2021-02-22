import e,{createContext as t,useMemo as s,useState as r,useContext as u,useEffect as n}from"react";class i{constructor(e,t={}){this.url=e,this.cached=t.firstValue,this.defaultValue=t.defaultValue,this.subscriptions=new Map,this.totalSubscriptionsCount=0}setValue(e){this.cached=e,this.triggerSubscriptions()}getValue(){return this.cached??this.defaultValue}triggerSubscriptions(){for(const e of this.subscriptions.values())e(this.value,this)}get value(){return this.getValue()}set value(e){this.setValue(e)}onChange(e){const t=this.totalSubscriptionsCount++;return this.subscriptions.set(t,e),()=>this.subscriptions.delete(t)}}class o{newResource(e,t){return new i(e,t)}}o.protocol="var";const l={},c={get:(e,t)=>e.getValue(t),deleteProperty(e,t){e.deleteReource(t)},set:(e,t,s)=>(e.setValue(t,s),!0)};class a{constructor({plugins:e=[],conf:t={}}){this.plugins=new Map(e.map(e=>[e.protocol,new e(this)])),this.plugins.has("var")||this.plugins.set("var",new o(this)),this.conf={...l,...t},this.resources=new Map,this.proxy=new Proxy(this,c)}findPlugin(e){return this.plugins.get(e.split(":",1))||this.plugins.get("var")}getResource(e,t={}){let s=this.resources.get(e);if(s)return s;return s=this.findPlugin(e).newResource(e,t,this),this.resources.set(e,s),s}getValue(e,t={}){return this.getResource(e,t).value}setValue(e,t,s={}){this.getResource(e,s).setValue(t,s)}deleteReource(e){this.getResource(e).delete(),this.resources.delete(e)}onChange(e,t,s){return this.getResource(e).onChange(t,s)}}var h=t({});function g(t){var r=t.children,u=t.plugins,n=void 0===u?[]:u,i=t.conf,o=void 0===i?{}:i,l=t.testContextRef,c=s((function(){var e=new a({plugins:n,conf:o});return l&&(l.sharedState=e),e}),[]);return e.createElement(h.Provider,{value:c},r)}function p(e){var t=e.url,s=e.children,r=f(t,null);return s({value:r[0],setValue:r[1],resource:r[2]})}function f(e,t){"string"==typeof e&&(e=v(e,t));var s=r(e.value),u=s[0],n=s[1];return d(e.url,(function(e){return n(e)}),null),[u,function(t){return e.setValue(t)},e]}function v(e,t){return u(h).getResource(e,t)}function d(e,t,s){var r=u(h);n((function(){return r.onChange(e,t,s)}),[e])}function V(){return u(h)}export{h as ContextState,g as OnGetProvider,p as WithOnGetValue,d as useOnGetChange,v as useOnGetResource,V as useOnGetState,f as useOnGetValue};
