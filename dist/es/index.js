class e{constructor(e,t={}){this.url=e,this.cached=t.firstValue,this.defaultValue=t.defaultValue,this.subscriptions=new Map,this.totalSubscriptionsCount=0}setValue(e){this.cached=e,this.triggerSubscriptions()}getValue(){return this.cached??this.defaultValue}triggerSubscriptions(){for(const e of this.subscriptions.values())e(this.value,this)}get value(){return this.getValue()}set value(e){this.setValue(e)}onChange(e){const t=this.totalSubscriptionsCount++;return this.subscriptions.set(t,e),()=>this.subscriptions.delete(t)}}class t{newResource(t,s){return new e(t,s)}}t.protocol="var";const s={},i={get:(e,t)=>e.getValue(t),deleteProperty(e,t){e.deleteReource(t)},set:(e,t,s)=>(e.setValue(t,s),!0)};export default class{constructor({plugins:e=[],conf:r={}}){this.plugins=new Map(e.map(e=>[e.protocol,new e(this)])),this.plugins.has("var")||this.plugins.set("var",new t(this)),this.conf={...s,...r},this.resources=new Map,this.proxy=new Proxy(this,i)}findPlugin(e){return this.plugins.get(e.split(":",1))||this.plugins.get("var")}getResource(e,t={}){let s=this.resources.get(e);if(s)return s;return s=this.findPlugin(e).newResource(e,t,this),this.resources.set(e,s),s}getValue(e,t={}){return this.getResource(e,t).value}setValue(e,t,s={}){this.getResource(e,s).setValue(t,s)}deleteReource(e){this.getResource(e).delete(),this.resources.delete(e)}onChange(e,t,s){return this.getResource(e).onChange(t,s)}}
