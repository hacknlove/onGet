class t{constructor(t,s={}){this.url=t,this.cached=s.firstValue,this.defaultValue=s.defaultValue,this.subscriptions=new Map,this.totalSubscriptionsCount=0}setValue(t){this.cached=t,this.triggerSubscriptions()}getValue(){return this.cached??this.defaultValue}triggerSubscriptions(){for(const t of this.subscriptions.values())t(this.value,this)}get value(){return this.getValue()}set value(t){this.setValue(t)}onChange(t){const s=this.totalSubscriptionsCount++;return this.subscriptions.set(s,t),()=>this.subscriptions.delete(s)}}class s{newResource(s,e){return new t(s,e)}}s.protocol="var";export default s;export{t as VarResource};
