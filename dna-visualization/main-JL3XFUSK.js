var Lp=Object.defineProperty,Fp=Object.defineProperties;var Vp=Object.getOwnPropertyDescriptors;var ll=Object.getOwnPropertySymbols;var jp=Object.prototype.hasOwnProperty,Hp=Object.prototype.propertyIsEnumerable;var ul=(t,e,n)=>e in t?Lp(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,te=(t,e)=>{for(var n in e||={})jp.call(e,n)&&ul(t,n,e[n]);if(ll)for(var n of ll(e))Hp.call(e,n)&&ul(t,n,e[n]);return t},oe=(t,e)=>Fp(t,Vp(e));var ie=null,eo=!1,ds=1,Bp=null,se=Symbol("SIGNAL");function E(t){let e=ie;return ie=t,e}function no(){return ie}var Xn={version:0,lastCleanEpoch:0,dirty:!1,producers:void 0,producersTail:void 0,consumers:void 0,consumersTail:void 0,recomputing:!1,consumerAllowSignalWrites:!1,consumerIsAlwaysLive:!1,kind:"unknown",producerMustRecompute:()=>!1,producerRecomputeValue:()=>{},consumerMarkedDirty:()=>{},consumerOnSignalRead:()=>{}};function Kn(t){if(eo)throw new Error("");if(ie===null)return;ie.consumerOnSignalRead(t);let e=ie.producersTail;if(e!==void 0&&e.producer===t)return;let n,r=ie.recomputing;if(r&&(n=e!==void 0?e.nextProducer:ie.producers,n!==void 0&&n.producer===t)){ie.producersTail=n,n.lastReadVersion=t.version;return}let o=t.consumersTail;if(o!==void 0&&o.consumer===ie&&(!r||$p(o,ie)))return;let i=gn(ie),s={producer:t,consumer:ie,nextProducer:n,prevConsumer:o,lastReadVersion:t.version,nextConsumer:void 0};ie.producersTail=s,e!==void 0?e.nextProducer=s:ie.producers=s,i&&hl(t,s)}function dl(){ds++}function fs(t){if(!(gn(t)&&!t.dirty)&&!(!t.dirty&&t.lastCleanEpoch===ds)){if(!t.producerMustRecompute(t)&&!oo(t)){us(t);return}t.producerRecomputeValue(t),us(t)}}function ps(t){if(t.consumers===void 0)return;let e=eo;eo=!0;try{for(let n=t.consumers;n!==void 0;n=n.nextConsumer){let r=n.consumer;r.dirty||Up(r)}}finally{eo=e}}function hs(){return ie?.consumerAllowSignalWrites!==!1}function Up(t){t.dirty=!0,ps(t),t.consumerMarkedDirty?.(t)}function us(t){t.dirty=!1,t.lastCleanEpoch=ds}function Jn(t){return t&&fl(t),E(t)}function fl(t){t.producersTail=void 0,t.recomputing=!0}function ro(t,e){E(e),t&&pl(t)}function pl(t){t.recomputing=!1;let e=t.producersTail,n=e!==void 0?e.nextProducer:t.producers;if(n!==void 0){if(gn(t))do n=ms(n);while(n!==void 0);e!==void 0?e.nextProducer=void 0:t.producers=void 0}}function oo(t){for(let e=t.producers;e!==void 0;e=e.nextProducer){let n=e.producer,r=e.lastReadVersion;if(r!==n.version||(fs(n),r!==n.version))return!0}return!1}function er(t){if(gn(t)){let e=t.producers;for(;e!==void 0;)e=ms(e)}t.producers=void 0,t.producersTail=void 0,t.consumers=void 0,t.consumersTail=void 0}function hl(t,e){let n=t.consumersTail,r=gn(t);if(n!==void 0?(e.nextConsumer=n.nextConsumer,n.nextConsumer=e):(e.nextConsumer=void 0,t.consumers=e),e.prevConsumer=n,t.consumersTail=e,!r)for(let o=t.producers;o!==void 0;o=o.nextProducer)hl(o.producer,o)}function ms(t){let e=t.producer,n=t.nextProducer,r=t.nextConsumer,o=t.prevConsumer;if(t.nextConsumer=void 0,t.prevConsumer=void 0,r!==void 0?r.prevConsumer=o:e.consumersTail=o,o!==void 0)o.nextConsumer=r;else if(e.consumers=r,!gn(e)){let i=e.producers;for(;i!==void 0;)i=ms(i)}return n}function gn(t){return t.consumerIsAlwaysLive||t.consumers!==void 0}function gs(t){Bp?.(t)}function $p(t,e){let n=e.producersTail;if(n!==void 0){let r=e.producers;do{if(r===t)return!0;if(r===n)break;r=r.nextProducer}while(r!==void 0)}return!1}function vs(t,e){return Object.is(t,e)}function tr(t,e){let n=Object.create(zp);n.computation=t,e!==void 0&&(n.equal=e);let r=()=>{if(fs(n),Kn(n),n.value===to)throw n.error;return n.value};return r[se]=n,gs(n),r}var cs=Symbol("UNSET"),ls=Symbol("COMPUTING"),to=Symbol("ERRORED"),zp=oe(te({},Xn),{value:cs,dirty:!0,error:null,equal:vs,kind:"computed",producerMustRecompute(t){return t.value===cs||t.value===ls},producerRecomputeValue(t){if(t.value===ls)throw new Error("");let e=t.value;t.value=ls;let n=Jn(t),r,o=!1;try{r=t.computation(),E(null),o=e!==cs&&e!==to&&r!==to&&t.equal(e,r)}catch(i){r=to,t.error=i}finally{ro(t,n)}if(o){t.value=e;return}t.value=r,t.version++}});function Gp(){throw new Error}var ml=Gp;function gl(t){ml(t)}function ys(t){ml=t}var Wp=null;function bs(t,e){let n=Object.create(io);n.value=t,e!==void 0&&(n.equal=e);let r=()=>vl(n);return r[se]=n,gs(n),[r,s=>nr(n,s),s=>yl(n,s)]}function vl(t){return Kn(t),t.value}function nr(t,e){hs()||gl(t),t.equal(t.value,e)||(t.value=e,qp(t))}function yl(t,e){hs()||gl(t),nr(t,e(t.value))}var io=oe(te({},Xn),{equal:vs,value:void 0,kind:"signal"});function qp(t){t.version++,dl(),ps(t),Wp?.(t)}function pe(t){return typeof t=="function"}function so(t){let n=t(r=>{Error.call(r),r.stack=new Error().stack});return n.prototype=Object.create(Error.prototype),n.prototype.constructor=n,n}var ao=so(t=>function(n){t(this),this.message=n?`${n.length} errors occurred during unsubscription:
${n.map((r,o)=>`${o+1}) ${r.toString()}`).join(`
  `)}`:"",this.name="UnsubscriptionError",this.errors=n});function rr(t,e){if(t){let n=t.indexOf(e);0<=n&&t.splice(n,1)}}var ue=class t{constructor(e){this.initialTeardown=e,this.closed=!1,this._parentage=null,this._finalizers=null}unsubscribe(){let e;if(!this.closed){this.closed=!0;let{_parentage:n}=this;if(n)if(this._parentage=null,Array.isArray(n))for(let i of n)i.remove(this);else n.remove(this);let{initialTeardown:r}=this;if(pe(r))try{r()}catch(i){e=i instanceof ao?i.errors:[i]}let{_finalizers:o}=this;if(o){this._finalizers=null;for(let i of o)try{bl(i)}catch(s){e=e??[],s instanceof ao?e=[...e,...s.errors]:e.push(s)}}if(e)throw new ao(e)}}add(e){var n;if(e&&e!==this)if(this.closed)bl(e);else{if(e instanceof t){if(e.closed||e._hasParent(this))return;e._addParent(this)}(this._finalizers=(n=this._finalizers)!==null&&n!==void 0?n:[]).push(e)}}_hasParent(e){let{_parentage:n}=this;return n===e||Array.isArray(n)&&n.includes(e)}_addParent(e){let{_parentage:n}=this;this._parentage=Array.isArray(n)?(n.push(e),n):n?[n,e]:e}_removeParent(e){let{_parentage:n}=this;n===e?this._parentage=null:Array.isArray(n)&&rr(n,e)}remove(e){let{_finalizers:n}=this;n&&rr(n,e),e instanceof t&&e._removeParent(this)}};ue.EMPTY=(()=>{let t=new ue;return t.closed=!0,t})();var Es=ue.EMPTY;function co(t){return t instanceof ue||t&&"closed"in t&&pe(t.remove)&&pe(t.add)&&pe(t.unsubscribe)}function bl(t){pe(t)?t():t.unsubscribe()}var je={onUnhandledError:null,onStoppedNotification:null,Promise:void 0,useDeprecatedSynchronousErrorHandling:!1,useDeprecatedNextContext:!1};var vn={setTimeout(t,e,...n){let{delegate:r}=vn;return r?.setTimeout?r.setTimeout(t,e,...n):setTimeout(t,e,...n)},clearTimeout(t){let{delegate:e}=vn;return(e?.clearTimeout||clearTimeout)(t)},delegate:void 0};function El(t){vn.setTimeout(()=>{let{onUnhandledError:e}=je;if(e)e(t);else throw t})}function ws(){}var wl=Is("C",void 0,void 0);function Il(t){return Is("E",void 0,t)}function Dl(t){return Is("N",t,void 0)}function Is(t,e,n){return{kind:t,value:e,error:n}}var Ht=null;function yn(t){if(je.useDeprecatedSynchronousErrorHandling){let e=!Ht;if(e&&(Ht={errorThrown:!1,error:null}),t(),e){let{errorThrown:n,error:r}=Ht;if(Ht=null,n)throw r}}else t()}function Tl(t){je.useDeprecatedSynchronousErrorHandling&&Ht&&(Ht.errorThrown=!0,Ht.error=t)}var Bt=class extends ue{constructor(e){super(),this.isStopped=!1,e?(this.destination=e,co(e)&&e.add(this)):this.destination=Qp}static create(e,n,r){return new bn(e,n,r)}next(e){this.isStopped?Ts(Dl(e),this):this._next(e)}error(e){this.isStopped?Ts(Il(e),this):(this.isStopped=!0,this._error(e))}complete(){this.isStopped?Ts(wl,this):(this.isStopped=!0,this._complete())}unsubscribe(){this.closed||(this.isStopped=!0,super.unsubscribe(),this.destination=null)}_next(e){this.destination.next(e)}_error(e){try{this.destination.error(e)}finally{this.unsubscribe()}}_complete(){try{this.destination.complete()}finally{this.unsubscribe()}}},Yp=Function.prototype.bind;function Ds(t,e){return Yp.call(t,e)}var Cs=class{constructor(e){this.partialObserver=e}next(e){let{partialObserver:n}=this;if(n.next)try{n.next(e)}catch(r){lo(r)}}error(e){let{partialObserver:n}=this;if(n.error)try{n.error(e)}catch(r){lo(r)}else lo(e)}complete(){let{partialObserver:e}=this;if(e.complete)try{e.complete()}catch(n){lo(n)}}},bn=class extends Bt{constructor(e,n,r){super();let o;if(pe(e)||!e)o={next:e??void 0,error:n??void 0,complete:r??void 0};else{let i;this&&je.useDeprecatedNextContext?(i=Object.create(e),i.unsubscribe=()=>this.unsubscribe(),o={next:e.next&&Ds(e.next,i),error:e.error&&Ds(e.error,i),complete:e.complete&&Ds(e.complete,i)}):o=e}this.destination=new Cs(o)}};function lo(t){je.useDeprecatedSynchronousErrorHandling?Tl(t):El(t)}function Zp(t){throw t}function Ts(t,e){let{onStoppedNotification:n}=je;n&&vn.setTimeout(()=>n(t,e))}var Qp={closed:!0,next:ws,error:Zp,complete:ws};var Cl=typeof Symbol=="function"&&Symbol.observable||"@@observable";function Ml(t){return t}function Sl(t){return t.length===0?Ml:t.length===1?t[0]:function(n){return t.reduce((r,o)=>o(r),n)}}var En=(()=>{class t{constructor(n){n&&(this._subscribe=n)}lift(n){let r=new t;return r.source=this,r.operator=n,r}subscribe(n,r,o){let i=Kp(n)?n:new bn(n,r,o);return yn(()=>{let{operator:s,source:a}=this;i.add(s?s.call(i,a):a?this._subscribe(i):this._trySubscribe(i))}),i}_trySubscribe(n){try{return this._subscribe(n)}catch(r){n.error(r)}}forEach(n,r){return r=xl(r),new r((o,i)=>{let s=new bn({next:a=>{try{n(a)}catch(c){i(c),s.unsubscribe()}},error:i,complete:o});this.subscribe(s)})}_subscribe(n){var r;return(r=this.source)===null||r===void 0?void 0:r.subscribe(n)}[Cl](){return this}pipe(...n){return Sl(n)(this)}toPromise(n){return n=xl(n),new n((r,o)=>{let i;this.subscribe(s=>i=s,s=>o(s),()=>r(i))})}}return t.create=e=>new t(e),t})();function xl(t){var e;return(e=t??je.Promise)!==null&&e!==void 0?e:Promise}function Xp(t){return t&&pe(t.next)&&pe(t.error)&&pe(t.complete)}function Kp(t){return t&&t instanceof Bt||Xp(t)&&co(t)}function Jp(t){return pe(t?.lift)}function _l(t){return e=>{if(Jp(e))return e.lift(function(n){try{return t(n,this)}catch(r){this.error(r)}});throw new TypeError("Unable to lift unknown Observable type")}}function Nl(t,e,n,r,o){return new Ms(t,e,n,r,o)}var Ms=class extends Bt{constructor(e,n,r,o,i,s){super(e),this.onFinalize=i,this.shouldUnsubscribe=s,this._next=n?function(a){try{n(a)}catch(c){e.error(c)}}:super._next,this._error=o?function(a){try{o(a)}catch(c){e.error(c)}finally{this.unsubscribe()}}:super._error,this._complete=r?function(){try{r()}catch(a){e.error(a)}finally{this.unsubscribe()}}:super._complete}unsubscribe(){var e;if(!this.shouldUnsubscribe||this.shouldUnsubscribe()){let{closed:n}=this;super.unsubscribe(),!n&&((e=this.onFinalize)===null||e===void 0||e.call(this))}}};var Al=so(t=>function(){t(this),this.name="ObjectUnsubscribedError",this.message="object unsubscribed"});var it=(()=>{class t extends En{constructor(){super(),this.closed=!1,this.currentObservers=null,this.observers=[],this.isStopped=!1,this.hasError=!1,this.thrownError=null}lift(n){let r=new uo(this,this);return r.operator=n,r}_throwIfClosed(){if(this.closed)throw new Al}next(n){yn(()=>{if(this._throwIfClosed(),!this.isStopped){this.currentObservers||(this.currentObservers=Array.from(this.observers));for(let r of this.currentObservers)r.next(n)}})}error(n){yn(()=>{if(this._throwIfClosed(),!this.isStopped){this.hasError=this.isStopped=!0,this.thrownError=n;let{observers:r}=this;for(;r.length;)r.shift().error(n)}})}complete(){yn(()=>{if(this._throwIfClosed(),!this.isStopped){this.isStopped=!0;let{observers:n}=this;for(;n.length;)n.shift().complete()}})}unsubscribe(){this.isStopped=this.closed=!0,this.observers=this.currentObservers=null}get observed(){var n;return((n=this.observers)===null||n===void 0?void 0:n.length)>0}_trySubscribe(n){return this._throwIfClosed(),super._trySubscribe(n)}_subscribe(n){return this._throwIfClosed(),this._checkFinalizedStatuses(n),this._innerSubscribe(n)}_innerSubscribe(n){let{hasError:r,isStopped:o,observers:i}=this;return r||o?Es:(this.currentObservers=null,i.push(n),new ue(()=>{this.currentObservers=null,rr(i,n)}))}_checkFinalizedStatuses(n){let{hasError:r,thrownError:o,isStopped:i}=this;r?n.error(o):i&&n.complete()}asObservable(){let n=new En;return n.source=this,n}}return t.create=(e,n)=>new uo(e,n),t})(),uo=class extends it{constructor(e,n){super(),this.destination=e,this.source=n}next(e){var n,r;(r=(n=this.destination)===null||n===void 0?void 0:n.next)===null||r===void 0||r.call(n,e)}error(e){var n,r;(r=(n=this.destination)===null||n===void 0?void 0:n.error)===null||r===void 0||r.call(n,e)}complete(){var e,n;(n=(e=this.destination)===null||e===void 0?void 0:e.complete)===null||n===void 0||n.call(e)}_subscribe(e){var n,r;return(r=(n=this.source)===null||n===void 0?void 0:n.subscribe(e))!==null&&r!==void 0?r:Es}};var or=class extends it{constructor(e){super(),this._value=e}get value(){return this.getValue()}_subscribe(e){let n=super._subscribe(e);return!n.closed&&e.next(this._value),n}getValue(){let{hasError:e,thrownError:n,_value:r}=this;if(e)throw n;return this._throwIfClosed(),r}next(e){super.next(this._value=e)}};function Ss(t,e){return _l((n,r)=>{let o=0;n.subscribe(Nl(r,i=>{r.next(t.call(e,i,o++))}))})}var xs;function fo(){return xs}function Xe(t){let e=xs;return xs=t,e}var Rl=Symbol("NotFound");function wn(t){return t===Rl||t?.name==="\u0275NotFound"}var zs="https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss",M=class extends Error{code;constructor(e,n){super(lr(e,n)),this.code=e}};function nh(t){return`NG0${Math.abs(t)}`}function lr(t,e){return`${nh(t)}${e?": "+e:""}`}function V(t){for(let e in t)if(t[e]===V)return e;throw Error("")}function yo(t){if(typeof t=="string")return t;if(Array.isArray(t))return`[${t.map(yo).join(", ")}]`;if(t==null)return""+t;let e=t.overriddenName||t.name;if(e)return`${e}`;let n=t.toString();if(n==null)return""+n;let r=n.indexOf(`
`);return r>=0?n.slice(0,r):n}function Gs(t,e){return t?e?`${t} ${e}`:t:e||""}var rh=V({__forward_ref__:V});function bo(t){return t.__forward_ref__=bo,t}function we(t){return Fl(t)?t():t}function Fl(t){return typeof t=="function"&&t.hasOwnProperty(rh)&&t.__forward_ref__===bo}function Q(t){return{token:t.token,providedIn:t.providedIn||null,factory:t.factory,value:void 0}}function Eo(t){return oh(t,wo)}function oh(t,e){return t.hasOwnProperty(e)&&t[e]||null}function ih(t){let e=t?.[wo]??null;return e||null}function Ns(t){return t&&t.hasOwnProperty(ho)?t[ho]:null}var wo=V({\u0275prov:V}),ho=V({\u0275inj:V}),A=class{_desc;ngMetadataName="InjectionToken";\u0275prov;constructor(e,n){this._desc=e,this.\u0275prov=void 0,typeof n=="number"?this.__NG_ELEMENT_ID__=n:n!==void 0&&(this.\u0275prov=Q({token:this,providedIn:n.providedIn||"root",factory:n.factory}))}get multi(){return this}toString(){return`InjectionToken ${this._desc}`}};function Ws(t){return t&&!!t.\u0275providers}var qs=V({\u0275cmp:V}),Ys=V({\u0275dir:V}),Zs=V({\u0275pipe:V});var As=V({\u0275fac:V}),Gt=V({__NG_ELEMENT_ID__:V}),Pl=V({__NG_ENV_ID__:V});function Wt(t){return Xs(t,"@Component"),t[qs]||null}function Qs(t){return Xs(t,"@Directive"),t[Ys]||null}function Vl(t){return Xs(t,"@Pipe"),t[Zs]||null}function Xs(t,e){if(t==null)throw new M(-919,!1)}function ur(t){return typeof t=="string"?t:t==null?"":String(t)}var jl=V({ngErrorCode:V}),sh=V({ngErrorMessage:V}),ah=V({ngTokenPath:V});function Ks(t,e){return Hl("",-200,e)}function Io(t,e){throw new M(-201,!1)}function Hl(t,e,n){let r=new M(e,t);return r[jl]=e,r[sh]=t,n&&(r[ah]=n),r}function ch(t){return t[jl]}var Rs;function Bl(){return Rs}function Ee(t){let e=Rs;return Rs=t,e}function Js(t,e,n){let r=Eo(t);if(r&&r.providedIn=="root")return r.value===void 0?r.value=r.factory():r.value;if(n&8)return null;if(e!==void 0)return e;Io(t,"")}var lh={},Ut=lh,uh="__NG_DI_FLAG__",Ps=class{injector;constructor(e){this.injector=e}retrieve(e,n){let r=$t(n)||0;try{return this.injector.get(e,r&8?null:Ut,r)}catch(o){if(wn(o))return o;throw o}}};function dh(t,e=0){let n=fo();if(n===void 0)throw new M(-203,!1);if(n===null)return Js(t,void 0,e);{let r=fh(e),o=n.retrieve(t,r);if(wn(o)){if(r.optional)return null;throw o}return o}}function j(t,e=0){return(Bl()||dh)(we(t),e)}function S(t,e){return j(t,$t(e))}function $t(t){return typeof t>"u"||typeof t=="number"?t:0|(t.optional&&8)|(t.host&&1)|(t.self&&2)|(t.skipSelf&&4)}function fh(t){return{optional:!!(t&8),host:!!(t&1),self:!!(t&2),skipSelf:!!(t&4)}}function ks(t){let e=[];for(let n=0;n<t.length;n++){let r=we(t[n]);if(Array.isArray(r)){if(r.length===0)throw new M(900,!1);let o,i=0;for(let s=0;s<r.length;s++){let a=r[s],c=ph(a);typeof c=="number"?c===-1?o=a.token:i|=c:o=a}e.push(j(o,i))}else e.push(j(r))}return e}function ph(t){return t[uh]}function Dn(t,e){let n=t.hasOwnProperty(As);return n?t[As]:null}function Ul(t,e,n){if(t.length!==e.length)return!1;for(let r=0;r<t.length;r++){let o=t[r],i=e[r];if(n&&(o=n(o),i=n(i)),i!==o)return!1}return!0}function $l(t){return t.flat(Number.POSITIVE_INFINITY)}function Do(t,e){t.forEach(n=>Array.isArray(n)?Do(n,e):e(n))}function ea(t,e,n){e>=t.length?t.push(n):t.splice(e,0,n)}function dr(t,e){return e>=t.length-1?t.pop():t.splice(e,1)[0]}function zl(t,e,n,r){let o=t.length;if(o==e)t.push(n,r);else if(o===1)t.push(r,t[0]),t[0]=n;else{for(o--,t.push(t[o-1],t[o]);o>e;){let i=o-2;t[o]=t[i],o--}t[e]=n,t[e+1]=r}}function Gl(t,e,n){let r=Cn(t,e);return r>=0?t[r|1]=n:(r=~r,zl(t,r,e,n)),r}function To(t,e){let n=Cn(t,e);if(n>=0)return t[n|1]}function Cn(t,e){return hh(t,e,1)}function hh(t,e,n){let r=0,o=t.length>>n;for(;o!==r;){let i=r+(o-r>>1),s=t[i<<n];if(e===s)return i<<n;s>e?o=i:r=i+1}return~(o<<n)}var qt={},ct=[],Mn=new A(""),ta=new A("",-1),na=new A(""),sr=class{get(e,n=Ut){if(n===Ut){let o=Hl("",-201);throw o.name="\u0275NotFound",o}return n}};function fr(t){return{\u0275providers:t}}function Wl(t){return fr([{provide:Mn,multi:!0,useValue:t}])}function ql(...t){return{\u0275providers:ra(!0,t),\u0275fromNgModule:!0}}function ra(t,...e){let n=[],r=new Set,o,i=s=>{n.push(s)};return Do(e,s=>{let a=s;mo(a,i,[],r)&&(o||=[],o.push(a))}),o!==void 0&&Yl(o,i),n}function Yl(t,e){for(let n=0;n<t.length;n++){let{ngModule:r,providers:o}=t[n];oa(o,i=>{e(i,r)})}}function mo(t,e,n,r){if(t=we(t),!t)return!1;let o=null,i=Ns(t),s=!i&&Wt(t);if(!i&&!s){let c=t.ngModule;if(i=Ns(c),i)o=c;else return!1}else{if(s&&!s.standalone)return!1;o=t}let a=r.has(o);if(s){if(a)return!1;if(r.add(o),s.dependencies){let c=typeof s.dependencies=="function"?s.dependencies():s.dependencies;for(let l of c)mo(l,e,n,r)}}else if(i){if(i.imports!=null&&!a){r.add(o);let l;Do(i.imports,u=>{mo(u,e,n,r)&&(l||=[],l.push(u))}),l!==void 0&&Yl(l,e)}if(!a){let l=Dn(o)||(()=>new o);e({provide:o,useFactory:l,deps:ct},o),e({provide:na,useValue:o,multi:!0},o),e({provide:Mn,useValue:()=>j(o),multi:!0},o)}let c=i.providers;if(c!=null&&!a){let l=t;oa(c,u=>{e(u,l)})}}else return!1;return o!==t&&t.providers!==void 0}function oa(t,e){for(let n of t)Ws(n)&&(n=n.\u0275providers),Array.isArray(n)?oa(n,e):e(n)}var mh=V({provide:String,useValue:V});function Zl(t){return t!==null&&typeof t=="object"&&mh in t}function gh(t){return!!(t&&t.useExisting)}function vh(t){return!!(t&&t.useFactory)}function go(t){return typeof t=="function"}var pr=new A(""),po={},kl={},_s;function hr(){return _s===void 0&&(_s=new sr),_s}var Se=class{},zt=class extends Se{parent;source;scopes;records=new Map;_ngOnDestroyHooks=new Set;_onDestroyHooks=[];get destroyed(){return this._destroyed}_destroyed=!1;injectorDefTypes;constructor(e,n,r,o){super(),this.parent=n,this.source=r,this.scopes=o,Ls(e,s=>this.processProvider(s)),this.records.set(ta,In(void 0,this)),o.has("environment")&&this.records.set(Se,In(void 0,this));let i=this.records.get(pr);i!=null&&typeof i.value=="string"&&this.scopes.add(i.value),this.injectorDefTypes=new Set(this.get(na,ct,{self:!0}))}retrieve(e,n){let r=$t(n)||0;try{return this.get(e,Ut,r)}catch(o){if(wn(o))return o;throw o}}destroy(){ir(this),this._destroyed=!0;let e=E(null);try{for(let r of this._ngOnDestroyHooks)r.ngOnDestroy();let n=this._onDestroyHooks;this._onDestroyHooks=[];for(let r of n)r()}finally{this.records.clear(),this._ngOnDestroyHooks.clear(),this.injectorDefTypes.clear(),E(e)}}onDestroy(e){return ir(this),this._onDestroyHooks.push(e),()=>this.removeOnDestroy(e)}runInContext(e){ir(this);let n=Xe(this),r=Ee(void 0),o;try{return e()}finally{Xe(n),Ee(r)}}get(e,n=Ut,r){if(ir(this),e.hasOwnProperty(Pl))return e[Pl](this);let o=$t(r),i,s=Xe(this),a=Ee(void 0);try{if(!(o&4)){let l=this.records.get(e);if(l===void 0){let u=Ih(e)&&Eo(e);u&&this.injectableDefInScope(u)?l=In(Os(e),po):l=null,this.records.set(e,l)}if(l!=null)return this.hydrate(e,l,o)}let c=o&2?hr():this.parent;return n=o&8&&n===Ut?null:n,c.get(e,n)}catch(c){let l=ch(c);throw l===-200||l===-201?new M(l,null):c}finally{Ee(a),Xe(s)}}resolveInjectorInitializers(){let e=E(null),n=Xe(this),r=Ee(void 0),o;try{let i=this.get(Mn,ct,{self:!0});for(let s of i)s()}finally{Xe(n),Ee(r),E(e)}}toString(){return"R3Injector[...]"}processProvider(e){e=we(e);let n=go(e)?e:we(e&&e.provide),r=bh(e);if(!go(e)&&e.multi===!0){let o=this.records.get(n);o||(o=In(void 0,po,!0),o.factory=()=>ks(o.multi),this.records.set(n,o)),n=e,o.multi.push(e)}this.records.set(n,r)}hydrate(e,n,r){let o=E(null);try{if(n.value===kl)throw Ks("");return n.value===po&&(n.value=kl,n.value=n.factory(void 0,r)),typeof n.value=="object"&&n.value&&wh(n.value)&&this._ngOnDestroyHooks.add(n.value),n.value}finally{E(o)}}injectableDefInScope(e){if(!e.providedIn)return!1;let n=we(e.providedIn);return typeof n=="string"?n==="any"||this.scopes.has(n):this.injectorDefTypes.has(n)}removeOnDestroy(e){let n=this._onDestroyHooks.indexOf(e);n!==-1&&this._onDestroyHooks.splice(n,1)}};function Os(t){let e=Eo(t),n=e!==null?e.factory:Dn(t);if(n!==null)return n;if(t instanceof A)throw new M(-204,!1);if(t instanceof Function)return yh(t);throw new M(-204,!1)}function yh(t){if(t.length>0)throw new M(-204,!1);let n=ih(t);return n!==null?()=>n.factory(t):()=>new t}function bh(t){if(Zl(t))return In(void 0,t.useValue);{let e=Ql(t);return In(e,po)}}function Ql(t,e,n){let r;if(go(t)){let o=we(t);return Dn(o)||Os(o)}else if(Zl(t))r=()=>we(t.useValue);else if(vh(t))r=()=>t.useFactory(...ks(t.deps||[]));else if(gh(t))r=(o,i)=>j(we(t.useExisting),i!==void 0&&i&8?8:void 0);else{let o=we(t&&(t.useClass||t.provide));if(Eh(t))r=()=>new o(...ks(t.deps));else return Dn(o)||Os(o)}return r}function ir(t){if(t.destroyed)throw new M(-205,!1)}function In(t,e,n=!1){return{factory:t,value:e,multi:n?[]:void 0}}function Eh(t){return!!t.deps}function wh(t){return t!==null&&typeof t=="object"&&typeof t.ngOnDestroy=="function"}function Ih(t){return typeof t=="function"||typeof t=="object"&&t.ngMetadataName==="InjectionToken"}function Ls(t,e){for(let n of t)Array.isArray(n)?Ls(n,e):n&&Ws(n)?Ls(n.\u0275providers,e):e(n)}function Co(t,e){let n;t instanceof zt?(ir(t),n=t):n=new Ps(t);let r,o=Xe(n),i=Ee(void 0);try{return e()}finally{Xe(o),Ee(i)}}function Xl(){return Bl()!==void 0||fo()!=null}var Be=0,w=1,T=2,J=3,_e=4,Ne=5,Sn=6,xn=7,q=8,lt=9,Ke=10,Y=11,_n=12,ia=13,Yt=14,Ae=15,Mt=16,Zt=17,Je=18,ut=19,sa=20,at=21,Mo=22,mr=23,Ie=24,So=25,St=26,re=27,Kl=1,aa=6,xt=7,gr=8,Qt=9,G=10;function _t(t){return Array.isArray(t)&&typeof t[Kl]=="object"}function Ue(t){return Array.isArray(t)&&t[Kl]===!0}function ca(t){return(t.flags&4)!==0}function Nt(t){return t.componentOffset>-1}function xo(t){return(t.flags&1)===1}function Xt(t){return!!t.template}function Nn(t){return(t[T]&512)!==0}function Kt(t){return(t[T]&256)===256}var Jl="svg",eu="math";function Re(t){for(;Array.isArray(t);)t=t[Be];return t}function la(t,e){return Re(e[t])}function $e(t,e){return Re(e[t.index])}function _o(t,e){return t.data[e]}function et(t,e){let n=e[t];return _t(n)?n:n[Be]}function No(t){return(t[T]&128)===128}function tu(t){return Ue(t[J])}function tt(t,e){return e==null?null:t[e]}function ua(t){t[Zt]=0}function da(t){t[T]&1024||(t[T]|=1024,No(t)&&yr(t))}function nu(t,e){for(;t>0;)e=e[Yt],t--;return e}function vr(t){return!!(t[T]&9216||t[Ie]?.dirty)}function Ao(t){t[Ke].changeDetectionScheduler?.notify(8),t[T]&64&&(t[T]|=1024),vr(t)&&yr(t)}function yr(t){t[Ke].changeDetectionScheduler?.notify(0);let e=Tt(t);for(;e!==null&&!(e[T]&8192||(e[T]|=8192,!No(e)));)e=Tt(e)}function fa(t,e){if(Kt(t))throw new M(911,!1);t[at]===null&&(t[at]=[]),t[at].push(e)}function ru(t,e){if(t[at]===null)return;let n=t[at].indexOf(e);n!==-1&&t[at].splice(n,1)}function Tt(t){let e=t[J];return Ue(e)?e[J]:e}function pa(t){return t[xn]??=[]}function ha(t){return t.cleanup??=[]}function ou(t,e,n,r){let o=pa(e);o.push(n),t.firstCreatePass&&ha(t).push(r,o.length-1)}var C={lFrame:Eu(null),bindingsEnabled:!0,skipHydrationRootTNode:null};var Fs=!1;function iu(){return C.lFrame.elementDepthCount}function su(){C.lFrame.elementDepthCount++}function ma(){C.lFrame.elementDepthCount--}function au(){return C.bindingsEnabled}function cu(){return C.skipHydrationRootTNode!==null}function ga(t){return C.skipHydrationRootTNode===t}function va(){C.skipHydrationRootTNode=null}function O(){return C.lFrame.lView}function De(){return C.lFrame.tView}function An(t){return C.lFrame.contextLView=t,t[q]}function Rn(t){return C.lFrame.contextLView=null,t}function ze(){let t=ya();for(;t!==null&&t.type===64;)t=t.parent;return t}function ya(){return C.lFrame.currentTNode}function lu(){let t=C.lFrame,e=t.currentTNode;return t.isParent?e:e.parent}function Pn(t,e){let n=C.lFrame;n.currentTNode=t,n.isParent=e}function ba(){return C.lFrame.isParent}function uu(){C.lFrame.isParent=!1}function Ea(){return Fs}function wa(t){let e=Fs;return Fs=t,e}function du(){let t=C.lFrame,e=t.bindingRootIndex;return e===-1&&(e=t.bindingRootIndex=t.tView.bindingStartIndex),e}function fu(){return C.lFrame.bindingIndex}function pu(t){return C.lFrame.bindingIndex=t}function kn(){return C.lFrame.bindingIndex++}function Ia(t){let e=C.lFrame,n=e.bindingIndex;return e.bindingIndex=e.bindingIndex+t,n}function hu(){return C.lFrame.inI18n}function mu(t,e){let n=C.lFrame;n.bindingIndex=n.bindingRootIndex=t,Ro(e)}function gu(){return C.lFrame.currentDirectiveIndex}function Ro(t){C.lFrame.currentDirectiveIndex=t}function vu(t){let e=C.lFrame.currentDirectiveIndex;return e===-1?null:t[e]}function yu(){return C.lFrame.currentQueryIndex}function Po(t){C.lFrame.currentQueryIndex=t}function Dh(t){let e=t[w];return e.type===2?e.declTNode:e.type===1?t[Ne]:null}function Da(t,e,n){if(n&4){let o=e,i=t;for(;o=o.parent,o===null&&!(n&1);)if(o=Dh(i),o===null||(i=i[Yt],o.type&10))break;if(o===null)return!1;e=o,t=i}let r=C.lFrame=bu();return r.currentTNode=e,r.lView=t,!0}function ko(t){let e=bu(),n=t[w];C.lFrame=e,e.currentTNode=n.firstChild,e.lView=t,e.tView=n,e.contextLView=t,e.bindingIndex=n.bindingStartIndex,e.inI18n=!1}function bu(){let t=C.lFrame,e=t===null?null:t.child;return e===null?Eu(t):e}function Eu(t){let e={currentTNode:null,isParent:!0,lView:null,tView:null,selectedIndex:-1,contextLView:null,elementDepthCount:0,currentNamespace:null,currentDirectiveIndex:-1,bindingRootIndex:-1,bindingIndex:-1,currentQueryIndex:0,parent:t,child:null,inI18n:!1};return t!==null&&(t.child=e),e}function wu(){let t=C.lFrame;return C.lFrame=t.parent,t.currentTNode=null,t.lView=null,t}var Ta=wu;function Oo(){let t=wu();t.isParent=!0,t.tView=null,t.selectedIndex=-1,t.contextLView=null,t.elementDepthCount=0,t.currentDirectiveIndex=-1,t.currentNamespace=null,t.bindingRootIndex=-1,t.bindingIndex=-1,t.currentQueryIndex=0}function Iu(t){return(C.lFrame.contextLView=nu(t,C.lFrame.contextLView))[q]}function dt(){return C.lFrame.selectedIndex}function At(t){C.lFrame.selectedIndex=t}function Ca(){let t=C.lFrame;return _o(t.tView,t.selectedIndex)}function Ma(){return C.lFrame.currentNamespace}var Du=!0;function Lo(){return Du}function Fo(t){Du=t}function Vs(t,e=null,n=null,r){let o=Tu(t,e,n,r);return o.resolveInjectorInitializers(),o}function Tu(t,e=null,n=null,r,o=new Set){let i=[n||ct,ql(t)],s;return new zt(i,e||hr(),s||null,o)}var Ct=class t{static THROW_IF_NOT_FOUND=Ut;static NULL=new sr;static create(e,n){if(Array.isArray(e))return Vs({name:""},n,e,"");{let r=e.name??"";return Vs({name:r},e.parent,e.providers,r)}}static \u0275prov=Q({token:t,providedIn:"any",factory:()=>j(ta)});static __NG_ELEMENT_ID__=-1},Pe=new A(""),Jt=(()=>{class t{static __NG_ELEMENT_ID__=Th;static __NG_ENV_ID__=n=>n}return t})(),js=class extends Jt{_lView;constructor(e){super(),this._lView=e}get destroyed(){return Kt(this._lView)}onDestroy(e){let n=this._lView;return fa(n,e),()=>ru(n,e)}};function Th(){return new js(O())}var Cu=!1,Mu=new A(""),On=(()=>{class t{taskId=0;pendingTasks=new Set;destroyed=!1;pendingTask=new or(!1);debugTaskTracker=S(Mu,{optional:!0});get hasPendingTasks(){return this.destroyed?!1:this.pendingTask.value}get hasPendingTasksObservable(){return this.destroyed?new En(n=>{n.next(!1),n.complete()}):this.pendingTask}add(){!this.hasPendingTasks&&!this.destroyed&&this.pendingTask.next(!0);let n=this.taskId++;return this.pendingTasks.add(n),this.debugTaskTracker?.add(n),n}has(n){return this.pendingTasks.has(n)}remove(n){this.pendingTasks.delete(n),this.debugTaskTracker?.remove(n),this.pendingTasks.size===0&&this.hasPendingTasks&&this.pendingTask.next(!1)}ngOnDestroy(){this.pendingTasks.clear(),this.hasPendingTasks&&this.pendingTask.next(!1),this.destroyed=!0,this.pendingTask.unsubscribe()}static \u0275prov=Q({token:t,providedIn:"root",factory:()=>new t})}return t})(),Hs=class extends it{__isAsync;destroyRef=void 0;pendingTasks=void 0;constructor(e=!1){super(),this.__isAsync=e,Xl()&&(this.destroyRef=S(Jt,{optional:!0})??void 0,this.pendingTasks=S(On,{optional:!0})??void 0)}emit(e){let n=E(null);try{super.next(e)}finally{E(n)}}subscribe(e,n,r){let o=e,i=n||(()=>null),s=r;if(e&&typeof e=="object"){let c=e;o=c.next?.bind(c),i=c.error?.bind(c),s=c.complete?.bind(c)}this.__isAsync&&(i=this.wrapInTimeout(i),o&&(o=this.wrapInTimeout(o)),s&&(s=this.wrapInTimeout(s)));let a=super.subscribe({next:o,error:i,complete:s});return e instanceof ue&&e.add(a),a}wrapInTimeout(e){return n=>{let r=this.pendingTasks?.add();setTimeout(()=>{try{e(n)}finally{r!==void 0&&this.pendingTasks?.remove(r)}})}}},st=Hs;function vo(...t){}function Sa(t){let e,n;function r(){t=vo;try{n!==void 0&&typeof cancelAnimationFrame=="function"&&cancelAnimationFrame(n),e!==void 0&&clearTimeout(e)}catch{}}return e=setTimeout(()=>{t(),r()}),typeof requestAnimationFrame=="function"&&(n=requestAnimationFrame(()=>{t(),r()})),()=>r()}function Su(t){return queueMicrotask(()=>t()),()=>{t=vo}}var xa="isAngularZone",ar=xa+"_ID",Ch=0,xe=class t{hasPendingMacrotasks=!1;hasPendingMicrotasks=!1;isStable=!0;onUnstable=new st(!1);onMicrotaskEmpty=new st(!1);onStable=new st(!1);onError=new st(!1);constructor(e){let{enableLongStackTrace:n=!1,shouldCoalesceEventChangeDetection:r=!1,shouldCoalesceRunChangeDetection:o=!1,scheduleInRootZone:i=Cu}=e;if(typeof Zone>"u")throw new M(908,!1);Zone.assertZonePatched();let s=this;s._nesting=0,s._outer=s._inner=Zone.current,Zone.TaskTrackingZoneSpec&&(s._inner=s._inner.fork(new Zone.TaskTrackingZoneSpec)),n&&Zone.longStackTraceZoneSpec&&(s._inner=s._inner.fork(Zone.longStackTraceZoneSpec)),s.shouldCoalesceEventChangeDetection=!o&&r,s.shouldCoalesceRunChangeDetection=o,s.callbackScheduled=!1,s.scheduleInRootZone=i,xh(s)}static isInAngularZone(){return typeof Zone<"u"&&Zone.current.get(xa)===!0}static assertInAngularZone(){if(!t.isInAngularZone())throw new M(909,!1)}static assertNotInAngularZone(){if(t.isInAngularZone())throw new M(909,!1)}run(e,n,r){return this._inner.run(e,n,r)}runTask(e,n,r,o){let i=this._inner,s=i.scheduleEventTask("NgZoneEvent: "+o,e,Mh,vo,vo);try{return i.runTask(s,n,r)}finally{i.cancelTask(s)}}runGuarded(e,n,r){return this._inner.runGuarded(e,n,r)}runOutsideAngular(e){return this._outer.run(e)}},Mh={};function _a(t){if(t._nesting==0&&!t.hasPendingMicrotasks&&!t.isStable)try{t._nesting++,t.onMicrotaskEmpty.emit(null)}finally{if(t._nesting--,!t.hasPendingMicrotasks)try{t.runOutsideAngular(()=>t.onStable.emit(null))}finally{t.isStable=!0}}}function Sh(t){if(t.isCheckStableRunning||t.callbackScheduled)return;t.callbackScheduled=!0;function e(){Sa(()=>{t.callbackScheduled=!1,Bs(t),t.isCheckStableRunning=!0,_a(t),t.isCheckStableRunning=!1})}t.scheduleInRootZone?Zone.root.run(()=>{e()}):t._outer.run(()=>{e()}),Bs(t)}function xh(t){let e=()=>{Sh(t)},n=Ch++;t._inner=t._inner.fork({name:"angular",properties:{[xa]:!0,[ar]:n,[ar+n]:!0},onInvokeTask:(r,o,i,s,a,c)=>{if(_h(c))return r.invokeTask(i,s,a,c);try{return Ol(t),r.invokeTask(i,s,a,c)}finally{(t.shouldCoalesceEventChangeDetection&&s.type==="eventTask"||t.shouldCoalesceRunChangeDetection)&&e(),Ll(t)}},onInvoke:(r,o,i,s,a,c,l)=>{try{return Ol(t),r.invoke(i,s,a,c,l)}finally{t.shouldCoalesceRunChangeDetection&&!t.callbackScheduled&&!Nh(c)&&e(),Ll(t)}},onHasTask:(r,o,i,s)=>{r.hasTask(i,s),o===i&&(s.change=="microTask"?(t._hasPendingMicrotasks=s.microTask,Bs(t),_a(t)):s.change=="macroTask"&&(t.hasPendingMacrotasks=s.macroTask))},onHandleError:(r,o,i,s)=>(r.handleError(i,s),t.runOutsideAngular(()=>t.onError.emit(s)),!1)})}function Bs(t){t._hasPendingMicrotasks||(t.shouldCoalesceEventChangeDetection||t.shouldCoalesceRunChangeDetection)&&t.callbackScheduled===!0?t.hasPendingMicrotasks=!0:t.hasPendingMicrotasks=!1}function Ol(t){t._nesting++,t.isStable&&(t.isStable=!1,t.onUnstable.emit(null))}function Ll(t){t._nesting--,_a(t)}var cr=class{hasPendingMicrotasks=!1;hasPendingMacrotasks=!1;isStable=!0;onUnstable=new st;onMicrotaskEmpty=new st;onStable=new st;onError=new st;run(e,n,r){return e.apply(n,r)}runGuarded(e,n,r){return e.apply(n,r)}runOutsideAngular(e){return e()}runTask(e,n,r,o){return e.apply(n,r)}};function _h(t){return xu(t,"__ignore_ng_zone__")}function Nh(t){return xu(t,"__scheduler_tick__")}function xu(t,e){return!Array.isArray(t)||t.length!==1?!1:t[0]?.data?.[e]===!0}var He=class{_console=console;handleError(e){this._console.error("ERROR",e)}},en=new A("",{factory:()=>{let t=S(xe),e=S(Se),n;return r=>{t.runOutsideAngular(()=>{e.destroyed&&!n?setTimeout(()=>{throw r}):(n??=e.get(He),n.handleError(r))})}}}),_u={provide:Mn,useValue:()=>{let t=S(He,{optional:!0})},multi:!0},Ah=new A("",{factory:()=>{let t=S(Pe).defaultView;if(!t)return;let e=S(en),n=i=>{e(i.reason),i.preventDefault()},r=i=>{i.error?e(i.error):e(new Error(i.message,{cause:i})),i.preventDefault()},o=()=>{t.addEventListener("unhandledrejection",n),t.addEventListener("error",r)};typeof Zone<"u"?Zone.root.run(o):o(),S(Jt).onDestroy(()=>{t.removeEventListener("error",r),t.removeEventListener("unhandledrejection",n)})}});function Na(){return fr([Wl(()=>{S(Ah)})])}function Ge(t,e){let[n,r,o]=bs(t,e?.equal),i=n,s=i[se];return i.set=r,i.update=o,i.asReadonly=Aa.bind(i),i}function Aa(){let t=this[se];if(t.readonlyFn===void 0){let e=()=>this();e[se]=t,t.readonlyFn=e}return t.readonlyFn}var Tn=class{},br=new A("",{factory:()=>!0});var Ra=new A("");var Pa=(()=>{class t{static \u0275prov=Q({token:t,providedIn:"root",factory:()=>new Us})}return t})(),Us=class{dirtyEffectCount=0;queues=new Map;add(e){this.enqueue(e),this.schedule(e)}schedule(e){e.dirty&&this.dirtyEffectCount++}remove(e){let n=e.zone,r=this.queues.get(n);r.has(e)&&(r.delete(e),e.dirty&&this.dirtyEffectCount--)}enqueue(e){let n=e.zone;this.queues.has(n)||this.queues.set(n,new Set);let r=this.queues.get(n);r.has(e)||r.add(e)}flush(){for(;this.dirtyEffectCount>0;){let e=!1;for(let[n,r]of this.queues)n===null?e||=this.flushQueue(r):e||=n.run(()=>this.flushQueue(r));e||(this.dirtyEffectCount=0)}}flushQueue(e){let n=!1;for(let r of e)r.dirty&&(this.dirtyEffectCount--,n=!0,r.run());return n}},$s=class{[se];constructor(e){this[se]=e}destroy(){this[se].destroy()}};function ad(t){return{toString:t}.toString()}function Gh(t){return typeof t=="function"}function cd(t,e,n,r){e!==null?e.applyValueToInputSignal(e,r):t[n]=r}var zo=class{previousValue;currentValue;firstChange;constructor(e,n,r){this.previousValue=e,this.currentValue=n,this.firstChange=r}isFirstChange(){return this.firstChange}};function Wh(t){return t.type.prototype.ngOnChanges&&(t.setInput=Yh),qh}function qh(){let t=ud(this),e=t?.current;if(e){let n=t.previous;if(n===qt)t.previous=e;else for(let r in e)n[r]=e[r];t.current=null,this.ngOnChanges(e)}}function Yh(t,e,n,r,o){let i=this.declaredInputs[r],s=ud(t)||Zh(t,{previous:qt,current:null}),a=s.current||(s.current={}),c=s.previous,l=c[i];a[i]=new zo(l&&l.currentValue,n,c===qt),cd(t,e,o,n)}var ld="__ngSimpleChanges__";function ud(t){return t[ld]||null}function Zh(t,e){return t[ld]=e}var Nu=[];var H=function(t,e=null,n){for(let r=0;r<Nu.length;r++){let o=Nu[r];o(t,e,n)}},L=(function(t){return t[t.TemplateCreateStart=0]="TemplateCreateStart",t[t.TemplateCreateEnd=1]="TemplateCreateEnd",t[t.TemplateUpdateStart=2]="TemplateUpdateStart",t[t.TemplateUpdateEnd=3]="TemplateUpdateEnd",t[t.LifecycleHookStart=4]="LifecycleHookStart",t[t.LifecycleHookEnd=5]="LifecycleHookEnd",t[t.OutputStart=6]="OutputStart",t[t.OutputEnd=7]="OutputEnd",t[t.BootstrapApplicationStart=8]="BootstrapApplicationStart",t[t.BootstrapApplicationEnd=9]="BootstrapApplicationEnd",t[t.BootstrapComponentStart=10]="BootstrapComponentStart",t[t.BootstrapComponentEnd=11]="BootstrapComponentEnd",t[t.ChangeDetectionStart=12]="ChangeDetectionStart",t[t.ChangeDetectionEnd=13]="ChangeDetectionEnd",t[t.ChangeDetectionSyncStart=14]="ChangeDetectionSyncStart",t[t.ChangeDetectionSyncEnd=15]="ChangeDetectionSyncEnd",t[t.AfterRenderHooksStart=16]="AfterRenderHooksStart",t[t.AfterRenderHooksEnd=17]="AfterRenderHooksEnd",t[t.ComponentStart=18]="ComponentStart",t[t.ComponentEnd=19]="ComponentEnd",t[t.DeferBlockStateStart=20]="DeferBlockStateStart",t[t.DeferBlockStateEnd=21]="DeferBlockStateEnd",t[t.DynamicComponentStart=22]="DynamicComponentStart",t[t.DynamicComponentEnd=23]="DynamicComponentEnd",t[t.HostBindingsUpdateStart=24]="HostBindingsUpdateStart",t[t.HostBindingsUpdateEnd=25]="HostBindingsUpdateEnd",t})(L||{});function Qh(t,e,n){let{ngOnChanges:r,ngOnInit:o,ngDoCheck:i}=e.type.prototype;if(r){let s=Wh(e);(n.preOrderHooks??=[]).push(t,s),(n.preOrderCheckHooks??=[]).push(t,s)}o&&(n.preOrderHooks??=[]).push(0-t,o),i&&((n.preOrderHooks??=[]).push(t,i),(n.preOrderCheckHooks??=[]).push(t,i))}function Xh(t,e){for(let n=e.directiveStart,r=e.directiveEnd;n<r;n++){let i=t.data[n].type.prototype,{ngAfterContentInit:s,ngAfterContentChecked:a,ngAfterViewInit:c,ngAfterViewChecked:l,ngOnDestroy:u}=i;s&&(t.contentHooks??=[]).push(-n,s),a&&((t.contentHooks??=[]).push(n,a),(t.contentCheckHooks??=[]).push(n,a)),c&&(t.viewHooks??=[]).push(-n,c),l&&((t.viewHooks??=[]).push(n,l),(t.viewCheckHooks??=[]).push(n,l)),u!=null&&(t.destroyHooks??=[]).push(n,u)}}function jo(t,e,n){dd(t,e,3,n)}function Ho(t,e,n,r){(t[T]&3)===n&&dd(t,e,n,r)}function ka(t,e){let n=t[T];(n&3)===e&&(n&=16383,n+=1,t[T]=n)}function dd(t,e,n,r){let o=r!==void 0?t[Zt]&65535:0,i=r??-1,s=e.length-1,a=0;for(let c=o;c<s;c++)if(typeof e[c+1]=="number"){if(a=e[c],r!=null&&a>=r)break}else e[c]<0&&(t[Zt]+=65536),(a<i||i==-1)&&(Kh(t,n,e,c),t[Zt]=(t[Zt]&4294901760)+c+2),c++}function Au(t,e){H(L.LifecycleHookStart,t,e);let n=E(null);try{e.call(t)}finally{E(n),H(L.LifecycleHookEnd,t,e)}}function Kh(t,e,n,r){let o=n[r]<0,i=n[r+1],s=o?-n[r]:n[r],a=t[s];o?t[T]>>14<t[Zt]>>16&&(t[T]&3)===e&&(t[T]+=16384,Au(a,i)):Au(a,i)}var Fn=-1,Dr=class{factory;name;injectImpl;resolving=!1;canSeeViewProviders;multi;componentProviders;index;providerFactory;constructor(e,n,r,o){this.factory=e,this.name=o,this.canSeeViewProviders=n,this.injectImpl=r}};function Jh(t){return(t.flags&8)!==0}function em(t){return(t.flags&16)!==0}function tm(t,e,n){let r=0;for(;r<n.length;){let o=n[r];if(typeof o=="number"){if(o!==0)break;r++;let i=n[r++],s=n[r++],a=n[r++];t.setAttribute(e,s,a,i)}else{let i=o,s=n[++r];rm(i)?t.setProperty(e,i,s):t.setAttribute(e,i,s),r++}}return r}function nm(t){return t===3||t===4||t===6}function rm(t){return t.charCodeAt(0)===64}function ri(t,e){if(!(e===null||e.length===0))if(t===null||t.length===0)t=e.slice();else{let n=-1;for(let r=0;r<e.length;r++){let o=e[r];typeof o=="number"?n=o:n===0||(n===-1||n===2?Ru(t,n,o,null,e[++r]):Ru(t,n,o,null,null))}}return t}function Ru(t,e,n,r,o){let i=0,s=t.length;if(e===-1)s=-1;else for(;i<t.length;){let a=t[i++];if(typeof a=="number"){if(a===e){s=-1;break}else if(a>e){s=i-1;break}}}for(;i<t.length;){let a=t[i];if(typeof a=="number")break;if(a===n){o!==null&&(t[i+1]=o);return}i++,o!==null&&i++}s!==-1&&(t.splice(s,0,e),i=s+1),t.splice(i++,0,n),o!==null&&t.splice(i++,0,o)}function fd(t){return t!==Fn}function Go(t){return t&32767}function om(t){return t>>16}function Wo(t,e){let n=om(t),r=e;for(;n>0;)r=r[Yt],n--;return r}var Ba=!0;function Pu(t){let e=Ba;return Ba=t,e}var im=256,pd=im-1,hd=5,sm=0,nt={};function am(t,e,n){let r;typeof n=="string"?r=n.charCodeAt(0)||0:n.hasOwnProperty(Gt)&&(r=n[Gt]),r==null&&(r=n[Gt]=sm++);let o=r&pd,i=1<<o;e.data[t+(o>>hd)]|=i}function md(t,e){let n=gd(t,e);if(n!==-1)return n;let r=e[w];r.firstCreatePass&&(t.injectorIndex=e.length,Oa(r.data,t),Oa(e,null),Oa(r.blueprint,null));let o=mc(t,e),i=t.injectorIndex;if(fd(o)){let s=Go(o),a=Wo(o,e),c=a[w].data;for(let l=0;l<8;l++)e[i+l]=a[s+l]|c[s+l]}return e[i+8]=o,i}function Oa(t,e){t.push(0,0,0,0,0,0,0,0,e)}function gd(t,e){return t.injectorIndex===-1||t.parent&&t.parent.injectorIndex===t.injectorIndex||e[t.injectorIndex+8]===null?-1:t.injectorIndex}function mc(t,e){if(t.parent&&t.parent.injectorIndex!==-1)return t.parent.injectorIndex;let n=0,r=null,o=e;for(;o!==null;){if(r=wd(o),r===null)return Fn;if(n++,o=o[Yt],r.injectorIndex!==-1)return r.injectorIndex|n<<16}return Fn}function cm(t,e,n){am(t,e,n)}function vd(t,e,n){if(n&8||t!==void 0)return t;Io(e,"NodeInjector")}function yd(t,e,n,r){if(n&8&&r===void 0&&(r=null),(n&3)===0){let o=t[lt],i=Ee(void 0);try{return o?o.get(e,r,n&8):Js(e,r,n&8)}finally{Ee(i)}}return vd(r,e,n)}function bd(t,e,n,r=0,o){if(t!==null){if(e[T]&2048&&!(r&2)){let s=fm(t,e,n,r,nt);if(s!==nt)return s}let i=Ed(t,e,n,r,nt);if(i!==nt)return i}return yd(e,n,r,o)}function Ed(t,e,n,r,o){let i=um(n);if(typeof i=="function"){if(!Da(e,t,r))return r&1?vd(o,n,r):yd(e,n,r,o);try{let s;if(s=i(r),s==null&&!(r&8))Io(n);else return s}finally{Ta()}}else if(typeof i=="number"){let s=null,a=gd(t,e),c=Fn,l=r&1?e[Ae][Ne]:null;for((a===-1||r&4)&&(c=a===-1?mc(t,e):e[a+8],c===Fn||!Ou(r,!1)?a=-1:(s=e[w],a=Go(c),e=Wo(c,e)));a!==-1;){let u=e[w];if(ku(i,a,u.data)){let d=lm(a,e,n,s,r,l);if(d!==nt)return d}c=e[a+8],c!==Fn&&Ou(r,e[w].data[a+8]===l)&&ku(i,a,e)?(s=u,a=Go(c),e=Wo(c,e)):a=-1}}return o}function lm(t,e,n,r,o,i){let s=e[w],a=s.data[t+8],c=r==null?Nt(a)&&Ba:r!=s&&(a.type&3)!==0,l=o&1&&i===a,u=Bo(a,s,n,c,l);return u!==null?qo(e,s,u,a,o):nt}function Bo(t,e,n,r,o){let i=t.providerIndexes,s=e.data,a=i&1048575,c=t.directiveStart,l=t.directiveEnd,u=i>>20,d=r?a:a+u,f=o?a+u:l;for(let p=d;p<f;p++){let h=s[p];if(p<c&&n===h||p>=c&&h.type===n)return p}if(o){let p=s[c];if(p&&Xt(p)&&p.type===n)return c}return null}function qo(t,e,n,r,o){let i=t[n],s=e.data;if(i instanceof Dr){let a=i;if(a.resolving)throw Ks("");let c=Pu(a.canSeeViewProviders);a.resolving=!0;let l=s[n].type||s[n],u,d=a.injectImpl?Ee(a.injectImpl):null,f=Da(t,r,0);try{i=t[n]=a.factory(void 0,o,s,t,r),e.firstCreatePass&&n>=r.directiveStart&&Qh(n,s[n],e)}finally{d!==null&&Ee(d),Pu(c),a.resolving=!1,Ta()}}return i}function um(t){if(typeof t=="string")return t.charCodeAt(0)||0;let e=t.hasOwnProperty(Gt)?t[Gt]:void 0;return typeof e=="number"?e>=0?e&pd:dm:e}function ku(t,e,n){let r=1<<t;return!!(n[e+(t>>hd)]&r)}function Ou(t,e){return!(t&2)&&!(t&1&&e)}var tn=class{_tNode;_lView;constructor(e,n){this._tNode=e,this._lView=n}get(e,n,r){return bd(this._tNode,this._lView,e,$t(r),n)}};function dm(){return new tn(ze(),O())}function fm(t,e,n,r,o){let i=t,s=e;for(;i!==null&&s!==null&&s[T]&2048&&!Nn(s);){let a=Ed(i,s,n,r|2,nt);if(a!==nt)return a;let c=i.parent;if(!c){let l=s[sa];if(l){let u=l.get(n,nt,r&-5);if(u!==nt)return u}c=wd(s),s=s[Yt]}i=c}return o}function wd(t){let e=t[w],n=e.type;return n===2?e.declTNode:n===1?t[Ne]:null}function pm(){return Bn(ze(),O())}function Bn(t,e){return new Ar($e(t,e))}var Ar=(()=>{class t{nativeElement;constructor(n){this.nativeElement=n}static __NG_ELEMENT_ID__=pm}return t})();function hm(t){return t instanceof Ar?t.nativeElement:t}function mm(){return this._results[Symbol.iterator]()}var Yo=class{_emitDistinctChangesOnly;dirty=!0;_onDirty=void 0;_results=[];_changesDetected=!1;_changes=void 0;length=0;first=void 0;last=void 0;get changes(){return this._changes??=new it}constructor(e=!1){this._emitDistinctChangesOnly=e}get(e){return this._results[e]}map(e){return this._results.map(e)}filter(e){return this._results.filter(e)}find(e){return this._results.find(e)}reduce(e,n){return this._results.reduce(e,n)}forEach(e){this._results.forEach(e)}some(e){return this._results.some(e)}toArray(){return this._results.slice()}toString(){return this._results.toString()}reset(e,n){this.dirty=!1;let r=$l(e);(this._changesDetected=!Ul(this._results,r,n))&&(this._results=r,this.length=r.length,this.last=r[this.length-1],this.first=r[0])}notifyOnChanges(){this._changes!==void 0&&(this._changesDetected||!this._emitDistinctChangesOnly)&&this._changes.next(this)}onDirty(e){this._onDirty=e}setDirty(){this.dirty=!0,this._onDirty?.()}destroy(){this._changes!==void 0&&(this._changes.complete(),this._changes.unsubscribe())}[Symbol.iterator]=mm};function Id(t){return(t.flags&128)===128}var gc=(function(t){return t[t.OnPush=0]="OnPush",t[t.Eager=1]="Eager",t[t.Default=1]="Default",t})(gc||{}),Dd=new Map,gm=0;function vm(){return gm++}function ym(t){Dd.set(t[ut],t)}function Ua(t){Dd.delete(t[ut])}var Lu="__ngContext__";function Vn(t,e){_t(e)?(t[Lu]=e[ut],ym(e)):t[Lu]=e}function Td(t){return Md(t[_n])}function Cd(t){return Md(t[_e])}function Md(t){for(;t!==null&&!Ue(t);)t=t[_e];return t}var bm;function vc(t){bm=t}var oi=new A("",{factory:()=>Em}),Em="ng";var ii=new A(""),Rr=new A("",{providedIn:"platform",factory:()=>"unknown"});var si=new A("",{factory:()=>S(Pe).body?.querySelector("[ngCspNonce]")?.getAttribute("ngCspNonce")||null});var Sd="r";var xd="di";var _d=!1,Nd=new A("",{factory:()=>_d});var Fu=new WeakMap;function wm(t,e){if(t==null||typeof t!="object")return;let n=Fu.get(t);n||(n=new WeakSet,Fu.set(t,n)),n.add(e)}var Im=(t,e,n,r)=>{};function Dm(t,e,n,r){Im(t,e,n,r)}function yc(t){return(t.flags&32)===32}var Tm=()=>null;function Ad(t,e,n=!1){return Tm(t,e,n)}function Rd(t,e){let n=t.contentQueries;if(n!==null){let r=E(null);try{for(let o=0;o<n.length;o+=2){let i=n[o],s=n[o+1];if(s!==-1){let a=t.data[s];Po(i),a.contentQueries(2,e[s],s)}}}finally{E(r)}}}function $a(t,e,n){Po(0);let r=E(null);try{e(t,n)}finally{E(r)}}function Pd(t,e,n){if(ca(e)){let r=E(null);try{let o=e.directiveStart,i=e.directiveEnd;for(let s=o;s<i;s++){let a=t.data[s];if(a.contentQueries){let c=n[s];a.contentQueries(1,c,s)}}}finally{E(r)}}}var qe=(function(t){return t[t.Emulated=0]="Emulated",t[t.None=2]="None",t[t.ShadowDom=3]="ShadowDom",t[t.ExperimentalIsolatedShadowDom=4]="ExperimentalIsolatedShadowDom",t})(qe||{});var za=class{changingThisBreaksApplicationSecurity;constructor(e){this.changingThisBreaksApplicationSecurity=e}toString(){return`SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${zs})`}};function kd(t){return t instanceof za?t.changingThisBreaksApplicationSecurity:t}function Cm(t,e){return t.createText(e)}function Mm(t,e,n){t.setValue(e,n)}function Od(t,e,n){return t.createElement(e,n)}function Zo(t,e,n,r,o){t.insertBefore(e,n,r,o)}function Ld(t,e,n){t.appendChild(e,n)}function Vu(t,e,n,r,o){r!==null?Zo(t,e,n,r,o):Ld(t,e,n)}function Fd(t,e,n,r){t.removeChild(null,e,n,r)}function Sm(t,e,n){t.setAttribute(e,"style",n)}function xm(t,e,n){n===""?t.removeAttribute(e,"class"):t.setAttribute(e,"class",n)}function Vd(t,e,n){let{mergedAttrs:r,classes:o,styles:i}=n;r!==null&&tm(t,e,r),o!==null&&xm(t,e,o),i!==null&&Sm(t,e,i)}function _m(t,e,n){let r=t.length;for(;;){let o=t.indexOf(e,n);if(o===-1)return o;if(o===0||t.charCodeAt(o-1)<=32){let i=e.length;if(o+i===r||t.charCodeAt(o+i)<=32)return o}n=o+1}}var jd="ng-template";function Nm(t,e,n,r){let o=0;if(r){for(;o<e.length&&typeof e[o]=="string";o+=2)if(e[o]==="class"&&_m(e[o+1].toLowerCase(),n,0)!==-1)return!0}else if(bc(t))return!1;if(o=e.indexOf(1,o),o>-1){let i;for(;++o<e.length&&typeof(i=e[o])=="string";)if(i.toLowerCase()===n)return!0}return!1}function bc(t){return t.type===4&&t.value!==jd}function Am(t,e,n){let r=t.type===4&&!n?jd:t.value;return e===r}function Rm(t,e,n){let r=4,o=t.attrs,i=o!==null?Om(o):0,s=!1;for(let a=0;a<e.length;a++){let c=e[a];if(typeof c=="number"){if(!s&&!We(r)&&!We(c))return!1;if(s&&We(c))continue;s=!1,r=c|r&1;continue}if(!s)if(r&4){if(r=2|r&1,c!==""&&!Am(t,c,n)||c===""&&e.length===1){if(We(r))return!1;s=!0}}else if(r&8){if(o===null||!Nm(t,o,c,n)){if(We(r))return!1;s=!0}}else{let l=e[++a],u=Pm(c,o,bc(t),n);if(u===-1){if(We(r))return!1;s=!0;continue}if(l!==""){let d;if(u>i?d="":d=o[u+1].toLowerCase(),r&2&&l!==d){if(We(r))return!1;s=!0}}}}return We(r)||s}function We(t){return(t&1)===0}function Pm(t,e,n,r){if(e===null)return-1;let o=0;if(r||!n){let i=!1;for(;o<e.length;){let s=e[o];if(s===t)return o;if(s===3||s===6)i=!0;else if(s===1||s===2){let a=e[++o];for(;typeof a=="string";)a=e[++o];continue}else{if(s===4)break;if(s===0){o+=4;continue}}o+=i?1:2}return-1}else return Lm(e,t)}function km(t,e,n=!1){for(let r=0;r<e.length;r++)if(Rm(t,e[r],n))return!0;return!1}function Om(t){for(let e=0;e<t.length;e++){let n=t[e];if(nm(n))return e}return t.length}function Lm(t,e){let n=t.indexOf(4);if(n>-1)for(n++;n<t.length;){let r=t[n];if(typeof r=="number")return-1;if(r===e)return n;n++}return-1}function ju(t,e){return t?":not("+e.trim()+")":e}function Fm(t){let e=t[0],n=1,r=2,o="",i=!1;for(;n<t.length;){let s=t[n];if(typeof s=="string")if(r&2){let a=t[++n];o+="["+s+(a.length>0?'="'+a+'"':"")+"]"}else r&8?o+="."+s:r&4&&(o+=" "+s);else o!==""&&!We(s)&&(e+=ju(i,o),o=""),r=s,i=i||!We(r);n++}return o!==""&&(e+=ju(i,o)),e}function Vm(t){return t.map(Fm).join(",")}function jm(t){let e=[],n=[],r=1,o=2;for(;r<t.length;){let i=t[r];if(typeof i=="string")o===2?i!==""&&e.push(i,t[++r]):o===8&&n.push(i);else{if(!We(o))break;o=i}r++}return n.length&&e.push(1,...n),e}var ke={};function Ec(t,e,n,r,o,i,s,a,c,l,u){let d=re+r,f=d+o,p=Hm(d,f),h=typeof l=="function"?l():l;return p[w]={type:t,blueprint:p,template:n,queries:null,viewQuery:a,declTNode:e,data:p.slice().fill(null,d),bindingStartIndex:d,expandoStartIndex:f,hostBindingOpCodes:null,firstCreatePass:!0,firstUpdatePass:!0,staticViewQueries:!1,staticContentQueries:!1,preOrderHooks:null,preOrderCheckHooks:null,contentHooks:null,contentCheckHooks:null,viewHooks:null,viewCheckHooks:null,destroyHooks:null,cleanup:null,contentQueries:null,components:null,directiveRegistry:typeof i=="function"?i():i,pipeRegistry:typeof s=="function"?s():s,firstChild:null,schemas:c,consts:h,incompleteFirstPass:!1,ssrId:u}}function Hm(t,e){let n=[];for(let r=0;r<e;r++)n.push(r<t?null:ke);return n}function Bm(t){let e=t.tView;return e===null||e.incompleteFirstPass?t.tView=Ec(1,null,t.template,t.decls,t.vars,t.directiveDefs,t.pipeDefs,t.viewQuery,t.schemas,t.consts,t.id):e}function wc(t,e,n,r,o,i,s,a,c,l,u){let d=e.blueprint.slice();return d[Be]=o,d[T]=r|4|128|8|64|1024,(l!==null||t&&t[T]&2048)&&(d[T]|=2048),ua(d),d[J]=d[Yt]=t,d[q]=n,d[Ke]=s||t&&t[Ke],d[Y]=a||t&&t[Y],d[lt]=c||t&&t[lt]||null,d[Ne]=i,d[ut]=vm(),d[Sn]=u,d[sa]=l,d[Ae]=e.type==2?t[Ae]:d,d}function Um(t,e,n){let r=$e(e,t),o=Bm(n),i=t[Ke].rendererFactory,s=Ic(t,wc(t,o,null,Hd(n),r,e,null,i.createRenderer(r,n),null,null,null));return t[e.index]=s}function Hd(t){let e=16;return t.signals?e=4096:t.onPush&&(e=64),e}function Bd(t,e,n,r){if(n===0)return-1;let o=e.length;for(let i=0;i<n;i++)e.push(r),t.blueprint.push(r),t.data.push(null);return o}function Ic(t,e){return t[_n]?t[ia][_e]=e:t[_n]=e,t[ia]=e,e}function x(t=1){Ud(De(),O(),dt()+t,!1)}function Ud(t,e,n,r){if(!r)if((e[T]&3)===3){let i=t.preOrderCheckHooks;i!==null&&jo(e,i,n)}else{let i=t.preOrderHooks;i!==null&&Ho(e,i,0,n)}At(n)}var ai=(function(t){return t[t.None=0]="None",t[t.SignalBased=1]="SignalBased",t[t.HasDecoratorInputTransform=2]="HasDecoratorInputTransform",t})(ai||{});function Ga(t,e,n,r){let o=E(null);try{let[i,s,a]=t.inputs[n],c=null;(s&ai.SignalBased)!==0&&(c=e[i][se]),c!==null&&c.transformFn!==void 0?r=c.transformFn(r):a!==null&&(r=a.call(e,r)),t.setInput!==null?t.setInput(e,c,r,n,i):cd(e,c,i,r)}finally{E(o)}}var ft=(function(t){return t[t.Important=1]="Important",t[t.DashCase=2]="DashCase",t})(ft||{}),$m;function Dc(t,e){return $m(t,e)}var vI=typeof document<"u"&&typeof document?.documentElement?.getAnimations=="function";var Wa=new WeakMap,Er=new WeakSet;function zm(t,e){let n=Wa.get(t);if(!n||n.length===0)return;let r=e.parentNode,o=e.previousSibling;for(let i=n.length-1;i>=0;i--){let s=n[i],a=s.parentNode;s===e?(n.splice(i,1),Er.add(s),s.dispatchEvent(new CustomEvent("animationend",{detail:{cancel:!0}}))):(o&&s===o||a&&r&&a!==r)&&(n.splice(i,1),s.dispatchEvent(new CustomEvent("animationend",{detail:{cancel:!0}})),s.parentNode?.removeChild(s))}}function Gm(t,e){let n=Wa.get(t);n?n.includes(e)||n.push(e):Wa.set(t,[e])}var nn=new Set,Tc=(function(t){return t[t.CHANGE_DETECTION=0]="CHANGE_DETECTION",t[t.AFTER_NEXT_RENDER=1]="AFTER_NEXT_RENDER",t})(Tc||{}),Un=new A(""),Hu=new Set;function sn(t){Hu.has(t)||(Hu.add(t),performance?.mark?.("mark_feature_usage",{detail:{feature:t}}))}var $d=(()=>{class t{impl=null;execute(){this.impl?.execute()}static \u0275prov=Q({token:t,providedIn:"root",factory:()=>new t})}return t})();var zd=new A("",{factory:()=>({queue:new Set,isScheduled:!1,scheduler:null,injector:S(Se)})});function Gd(t,e,n){let r=t.get(zd);if(Array.isArray(e))for(let o of e)r.queue.add(o),n?.detachedLeaveAnimationFns?.push(o);else r.queue.add(e),n?.detachedLeaveAnimationFns?.push(e);r.scheduler&&r.scheduler(t)}function Wm(t,e){let n=t.get(zd);if(e.detachedLeaveAnimationFns){for(let r of e.detachedLeaveAnimationFns)n.queue.delete(r);e.detachedLeaveAnimationFns=void 0}}function qm(t,e){for(let[n,r]of e)Gd(t,r.animateFns)}function Bu(t,e,n,r){let o=t?.[St]?.enter;e!==null&&o&&o.has(n.index)&&qm(r,o)}function Ln(t,e,n,r,o,i,s,a){if(o!=null){let c,l=!1;Ue(o)?c=o:_t(o)&&(l=!0,o=o[Be]);let u=Re(o);t===0&&r!==null?(Bu(a,r,i,n),s==null?Ld(e,r,u):Zo(e,r,u,s||null,!0)):t===1&&r!==null?(Bu(a,r,i,n),Zo(e,r,u,s||null,!0),zm(i,u)):t===2?(a?.[St]?.leave?.has(i.index)&&Gm(i,u),Er.delete(u),Uu(a,i,n,d=>{if(Er.has(u)){Er.delete(u);return}Fd(e,u,l,d)})):t===3&&(Er.delete(u),Uu(a,i,n,()=>{e.destroyNode(u)})),c!=null&&sg(e,t,n,c,i,r,s)}}function Ym(t,e){Wd(t,e),e[Be]=null,e[Ne]=null}function Zm(t,e,n,r,o,i){r[Be]=o,r[Ne]=e,li(t,r,n,1,o,i)}function Wd(t,e){e[Ke].changeDetectionScheduler?.notify(9),li(t,e,e[Y],2,null,null)}function Qm(t){let e=t[_n];if(!e)return La(t[w],t);for(;e;){let n=null;if(_t(e))n=e[_n];else{let r=e[G];r&&(n=r)}if(!n){for(;e&&!e[_e]&&e!==t;)_t(e)&&La(e[w],e),e=e[J];e===null&&(e=t),_t(e)&&La(e[w],e),n=e&&e[_e]}e=n}}function Cc(t,e){let n=t[Qt],r=n.indexOf(e);n.splice(r,1)}function ci(t,e){if(Kt(e))return;let n=e[Y];n.destroyNode&&li(t,e,n,3,null,null),Qm(e)}function La(t,e){if(Kt(e))return;let n=E(null);try{e[T]&=-129,e[T]|=256,e[Ie]&&er(e[Ie]),Jm(t,e),Km(t,e),e[w].type===1&&e[Y].destroy();let r=e[Mt];if(r!==null&&Ue(e[J])){r!==e[J]&&Cc(r,e);let o=e[Je];o!==null&&o.detachView(t)}Ua(e)}finally{E(n)}}function Uu(t,e,n,r){let o=t?.[St];if(o==null||o.leave==null||!o.leave.has(e.index))return r(!1);t&&nn.add(t[ut]),Gd(n,()=>{if(o.leave&&o.leave.has(e.index)){let s=o.leave.get(e.index),a=[];if(s){for(let c=0;c<s.animateFns.length;c++){let l=s.animateFns[c],{promise:u}=l();a.push(u)}o.detachedLeaveAnimationFns=void 0}o.running=Promise.allSettled(a),Xm(t,r)}else t&&nn.delete(t[ut]),r(!1)},o)}function Xm(t,e){let n=t[St]?.running;if(n){n.then(()=>{t[St].running=void 0,nn.delete(t[ut]),e(!0)});return}e(!1)}function Km(t,e){let n=t.cleanup,r=e[xn];if(n!==null)for(let s=0;s<n.length-1;s+=2)if(typeof n[s]=="string"){let a=n[s+3];a>=0?r[a]():r[-a].unsubscribe(),s+=2}else{let a=r[n[s+1]];n[s].call(a)}r!==null&&(e[xn]=null);let o=e[at];if(o!==null){e[at]=null;for(let s=0;s<o.length;s++){let a=o[s];a()}}let i=e[mr];if(i!==null){e[mr]=null;for(let s of i)s.destroy()}}function Jm(t,e){let n;if(t!=null&&(n=t.destroyHooks)!=null)for(let r=0;r<n.length;r+=2){let o=e[n[r]];if(!(o instanceof Dr)){let i=n[r+1];if(Array.isArray(i))for(let s=0;s<i.length;s+=2){let a=o[i[s]],c=i[s+1];H(L.LifecycleHookStart,a,c);try{c.call(a)}finally{H(L.LifecycleHookEnd,a,c)}}else{H(L.LifecycleHookStart,o,i);try{i.call(o)}finally{H(L.LifecycleHookEnd,o,i)}}}}}function eg(t,e,n){return tg(t,e.parent,n)}function tg(t,e,n){let r=e;for(;r!==null&&r.type&168;)e=r,r=e.parent;if(r===null)return n[Be];if(Nt(r)){let{encapsulation:o}=t.data[r.directiveStart+r.componentOffset];if(o===qe.None||o===qe.Emulated)return null}return $e(r,n)}function ng(t,e,n){return og(t,e,n)}function rg(t,e,n){return t.type&40?$e(t,n):null}var og=rg,$u;function Mc(t,e,n,r){let o=eg(t,r,e),i=e[Y],s=r.parent||e[Ne],a=ng(s,r,e);if(o!=null)if(Array.isArray(n))for(let c=0;c<n.length;c++)Vu(i,o,n[c],a,!1);else Vu(i,o,n,a,!1);$u!==void 0&&$u(i,r,e,n,o)}function wr(t,e){if(e!==null){let n=e.type;if(n&3)return $e(e,t);if(n&4)return qa(-1,t[e.index]);if(n&8){let r=e.child;if(r!==null)return wr(t,r);{let o=t[e.index];return Ue(o)?qa(-1,o):Re(o)}}else{if(n&128)return wr(t,e.next);if(n&32)return Dc(e,t)()||Re(t[e.index]);{let r=qd(t,e);if(r!==null){if(Array.isArray(r))return r[0];let o=Tt(t[Ae]);return wr(o,r)}else return wr(t,e.next)}}}return null}function qd(t,e){if(e!==null){let r=t[Ae][Ne],o=e.projection;return r.projection[o]}return null}function qa(t,e){let n=G+t+1;if(n<e.length){let r=e[n],o=r[w].firstChild;if(o!==null)return wr(r,o)}return e[xt]}function Sc(t,e,n,r,o,i,s){for(;n!=null;){let a=r[lt];if(n.type===128){n=n.next;continue}let c=r[n.index],l=n.type;if(s&&e===0&&(c&&Vn(Re(c),r),n.flags|=2),!yc(n))if(l&8)Sc(t,e,n.child,r,o,i,!1),Ln(e,t,a,o,c,n,i,r);else if(l&32){let u=Dc(n,r),d;for(;d=u();)Ln(e,t,a,o,d,n,i,r);Ln(e,t,a,o,c,n,i,r)}else l&16?ig(t,e,r,n,o,i):Ln(e,t,a,o,c,n,i,r);n=s?n.projectionNext:n.next}}function li(t,e,n,r,o,i){Sc(n,r,t.firstChild,e,o,i,!1)}function ig(t,e,n,r,o,i){let s=n[Ae],c=s[Ne].projection[r.projection];if(Array.isArray(c))for(let l=0;l<c.length;l++){let u=c[l];Ln(e,t,n[lt],o,u,r,i,n)}else{let l=c,u=s[J];Id(r)&&(l.flags|=128),Sc(t,e,l,u,o,i,!0)}}function sg(t,e,n,r,o,i,s){let a=r[xt],c=Re(r);a!==c&&Ln(e,t,n,i,a,o,s);for(let l=G;l<r.length;l++){let u=r[l];li(u[w],u,t,e,i,a)}}function ag(t,e,n,r,o){if(e)o?t.addClass(n,r):t.removeClass(n,r);else{let i=r.indexOf("-")===-1?void 0:ft.DashCase;o==null?t.removeStyle(n,r,i):(typeof o=="string"&&o.endsWith("!important")&&(o=o.slice(0,-10),i|=ft.Important),t.setStyle(n,r,o,i))}}function Yd(t,e,n,r,o){let i=dt(),s=r&2;try{At(-1),s&&e.length>re&&Ud(t,e,re,!1);let a=s?L.TemplateUpdateStart:L.TemplateCreateStart;H(a,o,n),n(r,o)}finally{At(i);let a=s?L.TemplateUpdateEnd:L.TemplateCreateEnd;H(a,o,n)}}function Zd(t,e,n){mg(t,e,n),(n.flags&64)===64&&gg(t,e,n)}function xc(t,e,n=$e){let r=e.localNames;if(r!==null){let o=e.index+1;for(let i=0;i<r.length;i+=2){let s=r[i+1],a=s===-1?n(e,t):t[s];t[o++]=a}}}function cg(t,e,n,r){let i=r.get(Nd,_d)||n===qe.ShadowDom||n===qe.ExperimentalIsolatedShadowDom,s=t.selectRootElement(e,i);return lg(s),s}function lg(t){ug(t)}var ug=()=>null;function dg(t){return t==="class"?"className":t==="for"?"htmlFor":t==="formaction"?"formAction":t==="innerHtml"?"innerHTML":t==="readonly"?"readOnly":t==="tabindex"?"tabIndex":t}function fg(t,e,n,r,o,i){let s=e[w];if(_c(t,s,e,n,r)){Nt(t)&&hg(e,t.index);return}t.type&3&&(n=dg(n)),pg(t,e,n,r,o,i)}function pg(t,e,n,r,o,i){if(t.type&3){let s=$e(t,e);r=i!=null?i(r,t.value||"",n):r,o.setProperty(s,n,r)}else t.type&12}function hg(t,e){let n=et(e,t);n[T]&16||(n[T]|=64)}function mg(t,e,n){let r=n.directiveStart,o=n.directiveEnd;Nt(n)&&Um(e,n,t.data[r+n.componentOffset]),t.firstCreatePass||md(n,e);let i=n.initialInputs;for(let s=r;s<o;s++){let a=t.data[s],c=qo(e,t,s,n);if(Vn(c,e),i!==null&&wg(e,s-r,c,a,n,i),Xt(a)){let l=et(n.index,e);l[q]=qo(e,t,s,n)}}}function gg(t,e,n){let r=n.directiveStart,o=n.directiveEnd,i=n.index,s=gu();try{At(i);for(let a=r;a<o;a++){let c=t.data[a],l=e[a];Ro(a),(c.hostBindings!==null||c.hostVars!==0||c.hostAttrs!==null)&&vg(c,l)}}finally{At(-1),Ro(s)}}function vg(t,e){t.hostBindings!==null&&t.hostBindings(1,e)}function yg(t,e){let n=t.directiveRegistry,r=null;if(n)for(let o=0;o<n.length;o++){let i=n[o];km(e,i.selectors,!1)&&(r??=[],Xt(i)?r.unshift(i):r.push(i))}return r}function bg(t,e,n,r,o,i){let s=$e(t,e);Eg(e[Y],s,i,t.value,n,r,o)}function Eg(t,e,n,r,o,i,s){if(i==null)t.removeAttribute(e,o,n);else{let a=s==null?ur(i):s(i,r||"",o);t.setAttribute(e,o,a,n)}}function wg(t,e,n,r,o,i){let s=i[e];if(s!==null)for(let a=0;a<s.length;a+=2){let c=s[a],l=s[a+1];Ga(r,n,c,l)}}function Qd(t,e,n,r,o){let i=re+n,s=e[w],a=o(s,e,t,r,n);e[i]=a,Pn(t,!0);let c=t.type===2;return c?(Vd(e[Y],a,t),(iu()===0||xo(t))&&Vn(a,e),su()):Vn(a,e),Lo()&&(!c||!yc(t))&&Mc(s,e,a,t),t}function Xd(t){let e=t;return ba()?uu():(e=e.parent,Pn(e,!1)),e}function Ig(t,e){let n=t[lt];if(!n)return;let r;try{r=n.get(en,null)}catch{r=null}r?.(e)}function _c(t,e,n,r,o){let i=t.inputs?.[r],s=t.hostDirectiveInputs?.[r],a=!1;if(s)for(let c=0;c<s.length;c+=2){let l=s[c],u=s[c+1],d=e.data[l];Ga(d,n[l],u,o),a=!0}if(i)for(let c of i){let l=n[c],u=e.data[c];Ga(u,l,r,o),a=!0}return a}function Dg(t,e){let n=et(e,t),r=n[w];Tg(r,n);let o=n[Be];o!==null&&n[Sn]===null&&(n[Sn]=Ad(o,n[lt])),H(L.ComponentStart);try{Nc(r,n,n[q])}finally{H(L.ComponentEnd,n[q])}}function Tg(t,e){for(let n=e.length;n<t.blueprint.length;n++)e.push(t.blueprint[n])}function Nc(t,e,n){ko(e);try{let r=t.viewQuery;r!==null&&$a(1,r,n);let o=t.template;o!==null&&Yd(t,e,o,1,n),t.firstCreatePass&&(t.firstCreatePass=!1),e[Je]?.finishViewCreation(t),t.staticContentQueries&&Rd(t,e),t.staticViewQueries&&$a(2,t.viewQuery,n);let i=t.components;i!==null&&Cg(e,i)}catch(r){throw t.firstCreatePass&&(t.incompleteFirstPass=!0,t.firstCreatePass=!1),r}finally{e[T]&=-5,Oo()}}function Cg(t,e){for(let n=0;n<e.length;n++)Dg(t,e[n])}function ui(t,e,n,r){let o=E(null);try{let i=e.tView,a=t[T]&4096?4096:16,c=wc(t,i,n,a,null,e,null,null,r?.injector??null,r?.embeddedViewInjector??null,r?.dehydratedView??null),l=t[e.index];c[Mt]=l;let u=t[Je];return u!==null&&(c[Je]=u.createEmbeddedView(i)),Nc(i,c,n),c}finally{E(o)}}function Tr(t,e){return!e||e.firstChild===null||Id(t)}function Cr(t,e,n,r,o=!1){for(;n!==null;){if(n.type===128){n=o?n.projectionNext:n.next;continue}let i=e[n.index];i!==null&&r.push(Re(i)),Ue(i)&&Kd(i,r);let s=n.type;if(s&8)Cr(t,e,n.child,r);else if(s&32){let a=Dc(n,e),c;for(;c=a();)r.push(c)}else if(s&16){let a=qd(e,n);if(Array.isArray(a))r.push(...a);else{let c=Tt(e[Ae]);Cr(c[w],c,a,r,!0)}}n=o?n.projectionNext:n.next}return r}function Kd(t,e){for(let n=G;n<t.length;n++){let r=t[n],o=r[w].firstChild;o!==null&&Cr(r[w],r,o,e)}t[xt]!==t[Be]&&e.push(t[xt])}function Jd(t){if(t[So]!==null){for(let e of t[So])e.impl.addSequence(e);t[So].length=0}}var ef=[];function Mg(t){return t[Ie]??Sg(t)}function Sg(t){let e=ef.pop()??Object.create(_g);return e.lView=t,e}function xg(t){t.lView[Ie]!==t&&(t.lView=null,ef.push(t))}var _g=oe(te({},Xn),{consumerIsAlwaysLive:!0,kind:"template",consumerMarkedDirty:t=>{yr(t.lView)},consumerOnSignalRead(){this.lView[Ie]=this}});function Ng(t){let e=t[Ie]??Object.create(Ag);return e.lView=t,e}var Ag=oe(te({},Xn),{consumerIsAlwaysLive:!0,kind:"template",consumerMarkedDirty:t=>{let e=Tt(t.lView);for(;e&&!tf(e[w]);)e=Tt(e);e&&da(e)},consumerOnSignalRead(){this.lView[Ie]=this}});function tf(t){return t.type!==2}function nf(t){if(t[mr]===null)return;let e=!0;for(;e;){let n=!1;for(let r of t[mr])r.dirty&&(n=!0,r.zone===null||Zone.current===r.zone?r.run():r.zone.run(()=>r.run()));e=n&&!!(t[T]&8192)}}var Rg=100;function rf(t,e=0){let r=t[Ke].rendererFactory,o=!1;o||r.begin?.();try{Pg(t,e)}finally{o||r.end?.()}}function Pg(t,e){let n=Ea();try{wa(!0),Ya(t,e);let r=0;for(;vr(t);){if(r===Rg)throw new M(103,!1);r++,Ya(t,1)}}finally{wa(n)}}function kg(t,e,n,r){if(Kt(e))return;let o=e[T],i=!1,s=!1;ko(e);let a=!0,c=null,l=null;i||(tf(t)?(l=Mg(e),c=Jn(l)):no()===null?(a=!1,l=Ng(e),c=Jn(l)):e[Ie]&&(er(e[Ie]),e[Ie]=null));try{ua(e),pu(t.bindingStartIndex),n!==null&&Yd(t,e,n,2,r);let u=(o&3)===3;if(!i)if(u){let p=t.preOrderCheckHooks;p!==null&&jo(e,p,null)}else{let p=t.preOrderHooks;p!==null&&Ho(e,p,0,null),ka(e,0)}if(s||Og(e),nf(e),of(e,0),t.contentQueries!==null&&Rd(t,e),!i)if(u){let p=t.contentCheckHooks;p!==null&&jo(e,p)}else{let p=t.contentHooks;p!==null&&Ho(e,p,1),ka(e,1)}Fg(t,e);let d=t.components;d!==null&&af(e,d,0);let f=t.viewQuery;if(f!==null&&$a(2,f,r),!i)if(u){let p=t.viewCheckHooks;p!==null&&jo(e,p)}else{let p=t.viewHooks;p!==null&&Ho(e,p,2),ka(e,2)}if(t.firstUpdatePass===!0&&(t.firstUpdatePass=!1),e[Mo]){for(let p of e[Mo])p();e[Mo]=null}i||(Jd(e),e[T]&=-73)}catch(u){throw i||yr(e),u}finally{l!==null&&(ro(l,c),a&&xg(l)),Oo()}}function of(t,e){for(let n=Td(t);n!==null;n=Cd(n))for(let r=G;r<n.length;r++){let o=n[r];sf(o,e)}}function Og(t){for(let e=Td(t);e!==null;e=Cd(e)){if(!(e[T]&2))continue;let n=e[Qt];for(let r=0;r<n.length;r++){let o=n[r];da(o)}}}function Lg(t,e,n){H(L.ComponentStart);let r=et(e,t);try{sf(r,n)}finally{H(L.ComponentEnd,r[q])}}function sf(t,e){No(t)&&Ya(t,e)}function Ya(t,e){let r=t[w],o=t[T],i=t[Ie],s=!!(e===0&&o&16);if(s||=!!(o&64&&e===0),s||=!!(o&1024),s||=!!(i?.dirty&&oo(i)),s||=!1,i&&(i.dirty=!1),t[T]&=-9217,s)kg(r,t,r.template,t[q]);else if(o&8192){let a=E(null);try{nf(t),of(t,1);let c=r.components;c!==null&&af(t,c,1),Jd(t)}finally{E(a)}}}function af(t,e,n){for(let r=0;r<e.length;r++)Lg(t,e[r],n)}function Fg(t,e){let n=t.hostBindingOpCodes;if(n!==null)try{for(let r=0;r<n.length;r++){let o=n[r];if(o<0)At(~o);else{let i=o,s=n[++r],a=n[++r];mu(s,i);let c=e[i];H(L.HostBindingsUpdateStart,c);try{a(2,c)}finally{H(L.HostBindingsUpdateEnd,c)}}}}finally{At(-1)}}function Ac(t,e){let n=Ea()?64:1088;for(t[Ke].changeDetectionScheduler?.notify(e);t;){t[T]|=n;let r=Tt(t);if(Nn(t)&&!r)return t;t=r}return null}function cf(t,e,n,r){return[t,!0,0,e,null,r,null,n,null,null]}function lf(t,e){let n=G+e;if(n<t.length)return t[n]}function di(t,e,n,r=!0){let o=e[w];if(Vg(o,e,t,n),r){let s=qa(n,t),a=e[Y],c=a.parentNode(t[xt]);c!==null&&Zm(o,t[Ne],a,e,c,s)}let i=e[Sn];i!==null&&i.firstChild!==null&&(i.firstChild=null)}function uf(t,e){let n=Mr(t,e);return n!==void 0&&ci(n[w],n),n}function Mr(t,e){if(t.length<=G)return;let n=G+e,r=t[n];if(r){let o=r[Mt];o!==null&&o!==t&&Cc(o,r),e>0&&(t[n-1][_e]=r[_e]);let i=dr(t,G+e);Ym(r[w],r);let s=i[Je];s!==null&&s.detachView(i[w]),r[J]=null,r[_e]=null,r[T]&=-129}return r}function Vg(t,e,n,r){let o=G+r,i=n.length;r>0&&(n[o-1][_e]=e),r<i-G?(e[_e]=n[o],ea(n,G+r,e)):(n.push(e),e[_e]=null),e[J]=n;let s=e[Mt];s!==null&&n!==s&&df(s,e);let a=e[Je];a!==null&&a.insertView(t),Ao(e),e[T]|=128}function df(t,e){let n=t[Qt],r=e[J];if(_t(r))t[T]|=2;else{let o=r[J][Ae];e[Ae]!==o&&(t[T]|=2)}n===null?t[Qt]=[e]:n.push(e)}var jn=class{_lView;_cdRefInjectingView;_appRef=null;_attachedToViewContainer=!1;exhaustive;get rootNodes(){let e=this._lView,n=e[w];return Cr(n,e,n.firstChild,[])}constructor(e,n){this._lView=e,this._cdRefInjectingView=n}get context(){return this._lView[q]}set context(e){this._lView[q]=e}get destroyed(){return Kt(this._lView)}destroy(){if(this._appRef)this._appRef.detachView(this);else if(this._attachedToViewContainer){let e=this._lView[J];if(Ue(e)){let n=e[gr],r=n?n.indexOf(this):-1;r>-1&&(Mr(e,r),dr(n,r))}this._attachedToViewContainer=!1}ci(this._lView[w],this._lView)}onDestroy(e){fa(this._lView,e)}markForCheck(){Ac(this._cdRefInjectingView||this._lView,4)}detach(){this._lView[T]&=-129}reattach(){Ao(this._lView),this._lView[T]|=128}detectChanges(){this._lView[T]|=1024,rf(this._lView)}checkNoChanges(){}attachToViewContainerRef(){if(this._appRef)throw new M(902,!1);this._attachedToViewContainer=!0}detachFromAppRef(){this._appRef=null;let e=Nn(this._lView),n=this._lView[Mt];n!==null&&!e&&Cc(n,this._lView),Wd(this._lView[w],this._lView)}attachToAppRef(e){if(this._attachedToViewContainer)throw new M(902,!1);this._appRef=e;let n=Nn(this._lView),r=this._lView[Mt];r!==null&&!n&&df(r,this._lView),Ao(this._lView)}};var Sr=(()=>{class t{_declarationLView;_declarationTContainer;elementRef;static __NG_ELEMENT_ID__=jg;constructor(n,r,o){this._declarationLView=n,this._declarationTContainer=r,this.elementRef=o}get ssrId(){return this._declarationTContainer.tView?.ssrId||null}createEmbeddedView(n,r){return this.createEmbeddedViewImpl(n,r)}createEmbeddedViewImpl(n,r,o){let i=ui(this._declarationLView,this._declarationTContainer,n,{embeddedViewInjector:r,dehydratedView:o});return new jn(i)}}return t})();function jg(){return Rc(ze(),O())}function Rc(t,e){return t.type&4?new Sr(e,t,Bn(t,e)):null}function fi(t,e,n,r,o){let i=t.data[e];if(i===null)i=Hg(t,e,n,r,o),hu()&&(i.flags|=32);else if(i.type&64){i.type=n,i.value=r,i.attrs=o;let s=lu();i.injectorIndex=s===null?-1:s.injectorIndex}return Pn(i,!0),i}function Hg(t,e,n,r,o){let i=ya(),s=ba(),a=s?i:i&&i.parent,c=t.data[e]=Ug(t,a,n,e,r,o);return Bg(t,c,i,s),c}function Bg(t,e,n,r){t.firstChild===null&&(t.firstChild=e),n!==null&&(r?n.child==null&&e.parent!==null&&(n.child=e):n.next===null&&(n.next=e,e.prev=n))}function Ug(t,e,n,r,o,i){let s=e?e.injectorIndex:-1,a=0;return cu()&&(a|=128),{type:n,index:r,insertBeforeIndex:null,injectorIndex:s,directiveStart:-1,directiveEnd:-1,directiveStylingLast:-1,componentOffset:-1,controlDirectiveIndex:-1,customControlIndex:-1,propertyBindings:null,flags:a,providerIndexes:0,value:o,namespace:Ma(),attrs:i,mergedAttrs:null,localNames:null,initialInputs:null,inputs:null,hostDirectiveInputs:null,outputs:null,hostDirectiveOutputs:null,directiveToIndex:null,tView:null,next:null,prev:null,projectionNext:null,child:null,parent:e,projection:null,styles:null,stylesWithoutHost:null,residualStyles:void 0,classes:null,classesWithoutHost:null,residualClasses:void 0,classBindings:0,styleBindings:0}}function $g(t){let e=t[aa]??[],r=t[J][Y],o=[];for(let i of e)i.data[xd]!==void 0?o.push(i):zg(i,r);t[aa]=o}function zg(t,e){let n=0,r=t.firstChild;if(r){let o=t.data[Sd];for(;n<o;){let i=r.nextSibling;Fd(e,r,!1),r=i,n++}}}var Gg=()=>null,Wg=()=>null;function Za(t,e){return Gg(t,e)}function ff(t,e,n){return Wg(t,e,n)}var pf=class{},pi=class{},Qa=class{resolveComponentFactory(e){throw new M(917,!1)}},hi=class{static NULL=new Qa},rn=class{};var hf=(()=>{class t{static \u0275prov=Q({token:t,providedIn:"root",factory:()=>null})}return t})();var Uo={},Xa=class{injector;parentInjector;constructor(e,n){this.injector=e,this.parentInjector=n}get(e,n,r){let o=this.injector.get(e,Uo,r);return o!==Uo||n===Uo?o:this.parentInjector.get(e,n,r)}};function Qo(t,e,n){let r=n?t.styles:null,o=n?t.classes:null,i=0;if(e!==null)for(let s=0;s<e.length;s++){let a=e[s];if(typeof a=="number")i=a;else if(i==1)o=Gs(o,a);else if(i==2){let c=a,l=e[++s];r=Gs(r,c+": "+l+";")}}n?t.styles=r:t.stylesWithoutHost=r,n?t.classes=o:t.classesWithoutHost=o}function mf(t,e=0){let n=O();if(n===null)return j(t,e);let r=ze();return bd(r,n,we(t),e)}function qg(t,e,n,r,o){let i=r===null?null:{"":-1},s=o(t,n);if(s!==null){let a=s,c=null,l=null;for(let u of s)if(u.resolveHostDirectives!==null){[a,c,l]=u.resolveHostDirectives(s);break}Qg(t,e,n,a,i,c,l)}i!==null&&r!==null&&Yg(n,r,i)}function Yg(t,e,n){let r=t.localNames=[];for(let o=0;o<e.length;o+=2){let i=n[e[o+1]];if(i==null)throw new M(-301,!1);r.push(e[o],i)}}function Zg(t,e,n){e.componentOffset=n,(t.components??=[]).push(e.index)}function Qg(t,e,n,r,o,i,s){let a=r.length,c=null;for(let f=0;f<a;f++){let p=r[f];c===null&&Xt(p)&&(c=p,Zg(t,n,f)),cm(md(n,e),t,p.type)}nv(n,t.data.length,a),c?.viewProvidersResolver&&c.viewProvidersResolver(c);for(let f=0;f<a;f++){let p=r[f];p.providersResolver&&p.providersResolver(p)}let l=!1,u=!1,d=Bd(t,e,a,null);a>0&&(n.directiveToIndex=new Map);for(let f=0;f<a;f++){let p=r[f];if(n.mergedAttrs=ri(n.mergedAttrs,p.hostAttrs),Kg(t,n,e,d,p),tv(d,p,o),s!==null&&s.has(p)){let[m,v]=s.get(p);n.directiveToIndex.set(p.type,[d,m+n.directiveStart,v+n.directiveStart])}else(i===null||!i.has(p))&&n.directiveToIndex.set(p.type,d);p.contentQueries!==null&&(n.flags|=4),(p.hostBindings!==null||p.hostAttrs!==null||p.hostVars!==0)&&(n.flags|=64);let h=p.type.prototype;!l&&(h.ngOnChanges||h.ngOnInit||h.ngDoCheck)&&((t.preOrderHooks??=[]).push(n.index),l=!0),!u&&(h.ngOnChanges||h.ngDoCheck)&&((t.preOrderCheckHooks??=[]).push(n.index),u=!0),d++}Xg(t,n,i)}function Xg(t,e,n){for(let r=e.directiveStart;r<e.directiveEnd;r++){let o=t.data[r];if(n===null||!n.has(o))zu(0,e,o,r),zu(1,e,o,r),Wu(e,r,!1);else{let i=n.get(o);Gu(0,e,i,r),Gu(1,e,i,r),Wu(e,r,!0)}}}function zu(t,e,n,r){let o=t===0?n.inputs:n.outputs;for(let i in o)if(o.hasOwnProperty(i)){let s;t===0?s=e.inputs??={}:s=e.outputs??={},s[i]??=[],s[i].push(r),gf(e,i)}}function Gu(t,e,n,r){let o=t===0?n.inputs:n.outputs;for(let i in o)if(o.hasOwnProperty(i)){let s=o[i],a;t===0?a=e.hostDirectiveInputs??={}:a=e.hostDirectiveOutputs??={},a[s]??=[],a[s].push(r,i),gf(e,s)}}function gf(t,e){e==="class"?t.flags|=8:e==="style"&&(t.flags|=16)}function Wu(t,e,n){let{attrs:r,inputs:o,hostDirectiveInputs:i}=t;if(r===null||!n&&o===null||n&&i===null||bc(t)){t.initialInputs??=[],t.initialInputs.push(null);return}let s=null,a=0;for(;a<r.length;){let c=r[a];if(c===0){a+=4;continue}else if(c===5){a+=2;continue}else if(typeof c=="number")break;if(!n&&o.hasOwnProperty(c)){let l=o[c];for(let u of l)if(u===e){s??=[],s.push(c,r[a+1]);break}}else if(n&&i.hasOwnProperty(c)){let l=i[c];for(let u=0;u<l.length;u+=2)if(l[u]===e){s??=[],s.push(l[u+1],r[a+1]);break}}a+=2}t.initialInputs??=[],t.initialInputs.push(s)}function Kg(t,e,n,r,o){t.data[r]=o;let i=o.factory||(o.factory=Dn(o.type,!0)),s=new Dr(i,Xt(o),mf,null);t.blueprint[r]=s,n[r]=s,Jg(t,e,r,Bd(t,n,o.hostVars,ke),o)}function Jg(t,e,n,r,o){let i=o.hostBindings;if(i){let s=t.hostBindingOpCodes;s===null&&(s=t.hostBindingOpCodes=[]);let a=~e.index;ev(s)!=a&&s.push(a),s.push(n,r,i)}}function ev(t){let e=t.length;for(;e>0;){let n=t[--e];if(typeof n=="number"&&n<0)return n}return 0}function tv(t,e,n){if(n){if(e.exportAs)for(let r=0;r<e.exportAs.length;r++)n[e.exportAs[r]]=t;Xt(e)&&(n[""]=t)}}function nv(t,e,n){t.flags|=1,t.directiveStart=e,t.directiveEnd=e+n,t.providerIndexes=e}function vf(t,e,n,r,o,i,s,a){let c=e[w],l=c.consts,u=tt(l,s),d=fi(c,t,n,r,u);return i&&qg(c,e,d,tt(l,a),o),d.mergedAttrs=ri(d.mergedAttrs,d.attrs),d.attrs!==null&&Qo(d,d.attrs,!1),d.mergedAttrs!==null&&Qo(d,d.mergedAttrs,!0),c.queries!==null&&c.queries.elementStart(c,d),d}function yf(t,e){Xh(t,e),ca(e)&&t.queries.elementEnd(e)}function rv(t,e,n,r,o,i){let s=e.consts,a=tt(s,o),c=fi(e,t,n,r,a);if(c.mergedAttrs=ri(c.mergedAttrs,c.attrs),i!=null){let l=tt(s,i);c.localNames=[];for(let u=0;u<l.length;u+=2)c.localNames.push(l[u],-1)}return c.attrs!==null&&Qo(c,c.attrs,!1),c.mergedAttrs!==null&&Qo(c,c.mergedAttrs,!0),e.queries!==null&&e.queries.elementStart(e,c),c}function ov(t,e,n){return t[e]=n}function pt(t,e,n){if(n===ke)return!1;let r=t[e];return Object.is(r,n)?!1:(t[e]=n,!0)}function iv(t,e,n,r){let o=pt(t,e,n);return pt(t,e+1,r)||o}function $o(t,e,n){return function r(o){let i=r.__ngNativeEl__;i!==void 0&&wm(o,i);let s=Nt(t)?et(t.index,e):e;Ac(s,5);let a=e[q],c=qu(e,a,n,o),l=r.__ngNextListenerFn__;for(;l;)c=qu(e,a,l,o)&&c,l=l.__ngNextListenerFn__;return c}}function qu(t,e,n,r){let o=E(null);try{return H(L.OutputStart,e,n),n(r)!==!1}catch(i){return Ig(t,i),!1}finally{H(L.OutputEnd,e,n),E(o)}}function bf(t,e,n,r,o,i,s,a){let c=xo(t),l=!1,u=null;if(!r&&c&&(u=av(e,n,i,t.index)),u!==null){let d=u.__ngLastListenerFn__||u;d.__ngNextListenerFn__=s,u.__ngLastListenerFn__=s,l=!0}else{let d=$e(t,n),f=r?r(d):d;Dm(n,f,i,a),r||(a.__ngNativeEl__=d);let p=o.listen(f,i,a);if(!sv(i)){let h=r?m=>r(Re(m[t.index])):t.index;Ef(h,e,n,i,a,p,!1)}}return l}function sv(t){return t.startsWith("animation")||t.startsWith("transition")}function av(t,e,n,r){let o=t.cleanup;if(o!=null)for(let i=0;i<o.length-1;i+=2){let s=o[i];if(s===n&&o[i+1]===r){let a=e[xn],c=o[i+2];return a&&a.length>c?a[c]:null}typeof s=="string"&&(i+=2)}return null}function Ef(t,e,n,r,o,i,s){let a=e.firstCreatePass?ha(e):null,c=pa(n),l=c.length;c.push(o,i),a&&a.push(r,t,l,(l+1)*(s?-1:1))}function Yu(t,e,n,r,o,i){let s=e[n],a=e[w],l=a.data[n].outputs[r],d=s[l].subscribe(i);Ef(t.index,a,e,o,i,d,!0)}var Ka=Symbol("BINDING");function wf(t){return t.debugInfo?.className||t.type.name||null}var Ja=class extends hi{ngModule;constructor(e){super(),this.ngModule=e}resolveComponentFactory(e){let n=Wt(e);return new xr(n,this.ngModule)}};function cv(t){return Object.keys(t).map(e=>{let[n,r,o]=t[e],i={propName:n,templateName:e,isSignal:(r&ai.SignalBased)!==0};return o&&(i.transform=o),i})}function lv(t){return Object.keys(t).map(e=>({propName:t[e],templateName:e}))}function uv(t,e,n){let r=e instanceof Se?e:e?.injector;return r&&t.getStandaloneInjector!==null&&(r=t.getStandaloneInjector(r)||r),r?new Xa(n,r):n}function dv(t){let e=t.get(rn,null);if(e===null)throw new M(407,!1);let n=t.get(hf,null),r=t.get(Tn,null),o=t.get(Un,null,{optional:!0});return{rendererFactory:e,sanitizer:n,changeDetectionScheduler:r,ngReflect:!1,tracingService:o}}function fv(t,e){let n=If(t);return Od(e,n,n==="svg"?Jl:n==="math"?eu:null)}function pv(t){if(t?.toLowerCase()==="script")throw new M(905,!1)}function If(t){return(t.selectors[0][0]||"div").toLowerCase()}var xr=class extends pi{componentDef;ngModule;selector;componentType;ngContentSelectors;isBoundToModule;cachedInputs=null;cachedOutputs=null;get inputs(){return this.cachedInputs??=cv(this.componentDef.inputs),this.cachedInputs}get outputs(){return this.cachedOutputs??=lv(this.componentDef.outputs),this.cachedOutputs}constructor(e,n){super(),this.componentDef=e,this.ngModule=n,this.componentType=e.type,this.selector=Vm(e.selectors),this.ngContentSelectors=e.ngContentSelectors??[],this.isBoundToModule=!!n}create(e,n,r,o,i,s){H(L.DynamicComponentStart);let a=E(null);try{let c=this.componentDef,l=uv(c,o||this.ngModule,e),u=dv(l),d=u.tracingService;return d&&d.componentCreate?d.componentCreate(wf(c),()=>this.createComponentRef(u,l,n,r,i,s)):this.createComponentRef(u,l,n,r,i,s)}finally{E(a)}}createComponentRef(e,n,r,o,i,s){let a=this.componentDef,c=hv(o,a,s,i),l=e.rendererFactory.createRenderer(null,a),u=o?cg(l,o,a.encapsulation,n):fv(a,l);pv(u?.tagName);let d=s?.some(Zu)||i?.some(h=>typeof h!="function"&&h.bindings.some(Zu)),f=wc(null,c,null,512|Hd(a),null,null,e,l,n,null,Ad(u,n,!0));f[re]=u,ko(f);let p=null;try{let h=vf(re,f,2,"#host",()=>c.directiveRegistry,!0,0);Vd(l,u,h),Vn(u,f),Zd(c,f,h),Pd(c,h,f),yf(c,h),r!==void 0&&gv(h,this.ngContentSelectors,r),p=et(h.index,f),f[q]=p[q],Nc(c,f,null)}catch(h){throw p!==null&&Ua(p),Ua(f),h}finally{H(L.DynamicComponentEnd),Oo()}return new Xo(this.componentType,f,!!d)}};function hv(t,e,n,r){let o=t?["ng-version","21.2.20"]:jm(e.selectors[0]),i=null,s=null,a=0;if(n)for(let u of n)a+=u[Ka].requiredVars,u.create&&(u.targetIdx=0,(i??=[]).push(u)),u.update&&(u.targetIdx=0,(s??=[]).push(u));if(r)for(let u=0;u<r.length;u++){let d=r[u];if(typeof d!="function")for(let f of d.bindings){a+=f[Ka].requiredVars;let p=u+1;f.create&&(f.targetIdx=p,(i??=[]).push(f)),f.update&&(f.targetIdx=p,(s??=[]).push(f))}}let c=[e];if(r)for(let u of r){let d=typeof u=="function"?u:u.type,f=Qs(d);c.push(f)}return Ec(0,null,mv(i,s),1,a,c,null,null,null,[o],null)}function mv(t,e){return!t&&!e?null:n=>{if(n&1&&t)for(let r of t)r.create();if(n&2&&e)for(let r of e)r.update()}}function Zu(t){let e=t[Ka].kind;return e==="input"||e==="twoWay"}var Xo=class extends pf{_rootLView;_hasInputBindings;instance;hostView;changeDetectorRef;componentType;location;previousInputValues=null;_tNode;constructor(e,n,r){super(),this._rootLView=n,this._hasInputBindings=r,this._tNode=_o(n[w],re),this.location=Bn(this._tNode,n),this.instance=et(this._tNode.index,n)[q],this.hostView=this.changeDetectorRef=new jn(n,void 0),this.componentType=e}setInput(e,n){this._hasInputBindings;let r=this._tNode;if(this.previousInputValues??=new Map,this.previousInputValues.has(e)&&Object.is(this.previousInputValues.get(e),n))return;let o=this._rootLView,i=_c(r,o[w],o,e,n);this.previousInputValues.set(e,n);let s=et(r.index,o);Ac(s,1)}get injector(){return new tn(this._tNode,this._rootLView)}destroy(){this.hostView.destroy()}onDestroy(e){this.hostView.onDestroy(e)}};function gv(t,e,n){let r=t.projection=[];for(let o=0;o<e.length;o++){let i=n[o];r.push(i!=null&&i.length?Array.from(i):null)}}var mi=(()=>{class t{static __NG_ELEMENT_ID__=vv}return t})();function vv(){let t=ze();return Df(t,O())}var ec=class t extends mi{_lContainer;_hostTNode;_hostLView;constructor(e,n,r){super(),this._lContainer=e,this._hostTNode=n,this._hostLView=r}get element(){return Bn(this._hostTNode,this._hostLView)}get injector(){return new tn(this._hostTNode,this._hostLView)}get parentInjector(){let e=mc(this._hostTNode,this._hostLView);if(fd(e)){let n=Wo(e,this._hostLView),r=Go(e),o=n[w].data[r+8];return new tn(o,n)}else return new tn(null,this._hostLView)}clear(){for(;this.length>0;)this.remove(this.length-1)}get(e){let n=Qu(this._lContainer);return n!==null&&n[e]||null}get length(){return this._lContainer.length-G}createEmbeddedView(e,n,r){let o,i;typeof r=="number"?o=r:r!=null&&(o=r.index,i=r.injector);let s=Za(this._lContainer,e.ssrId),a=e.createEmbeddedViewImpl(n||{},i,s);return this.insertImpl(a,o,Tr(this._hostTNode,s)),a}createComponent(e,n,r,o,i,s,a){let c=e&&!Gh(e),l;if(c)l=n;else{let v=n||{};l=v.index,r=v.injector,o=v.projectableNodes,i=v.environmentInjector||v.ngModuleRef,s=v.directives,a=v.bindings}let u=c?e:new xr(Wt(e)),d=r||this.parentInjector;if(!i&&u.ngModule==null){let y=(c?d:this.parentInjector).get(Se,null);y&&(i=y)}let f=Wt(u.componentType??{}),p=Za(this._lContainer,f?.id??null),h=p?.firstChild??null,m=u.create(d,o,h,i,s,a);return this.insertImpl(m.hostView,l,Tr(this._hostTNode,p)),m}insert(e,n){return this.insertImpl(e,n,!0)}insertImpl(e,n,r){let o=e._lView;if(tu(o)){let a=this.indexOf(e);if(a!==-1)this.detach(a);else{let c=o[J],l=new t(c,c[Ne],c[J]);l.detach(l.indexOf(e))}}let i=this._adjustIndex(n),s=this._lContainer;return di(s,o,i,r),e.attachToViewContainerRef(),ea(Fa(s),i,e),e}move(e,n){return this.insert(e,n)}indexOf(e){let n=Qu(this._lContainer);return n!==null?n.indexOf(e):-1}remove(e){let n=this._adjustIndex(e,-1),r=Mr(this._lContainer,n);r&&(dr(Fa(this._lContainer),n),ci(r[w],r))}detach(e){let n=this._adjustIndex(e,-1),r=Mr(this._lContainer,n);return r&&dr(Fa(this._lContainer),n)!=null?new jn(r):null}_adjustIndex(e,n=0){return e??this.length+n}};function Qu(t){return t[gr]}function Fa(t){return t[gr]||(t[gr]=[])}function Df(t,e){let n,r=e[t.index];return Ue(r)?n=r:(n=cf(r,e,null,t),e[t.index]=n,Ic(e,n)),bv(n,e,t,r),new ec(n,t,e)}function yv(t,e){let n=t[Y],r=n.createComment(""),o=$e(e,t),i=n.parentNode(o);return Zo(n,i,r,n.nextSibling(o),!1),r}var bv=Iv,Ev=()=>!1;function wv(t,e,n){return Ev(t,e,n)}function Iv(t,e,n,r){if(t[xt])return;let o;n.type&8?o=Re(r):o=yv(e,n),t[xt]=o}var tc=class t{queryList;matches=null;constructor(e){this.queryList=e}clone(){return new t(this.queryList)}setDirty(){this.queryList.setDirty()}},nc=class t{queries;constructor(e=[]){this.queries=e}createEmbeddedView(e){let n=e.queries;if(n!==null){let r=e.contentQueries!==null?e.contentQueries[0]:n.length,o=[];for(let i=0;i<r;i++){let s=n.getByIndex(i),a=this.queries[s.indexInDeclarationView];o.push(a.clone())}return new t(o)}return null}insertView(e){this.dirtyQueriesWithMatches(e)}detachView(e){this.dirtyQueriesWithMatches(e)}finishViewCreation(e){this.dirtyQueriesWithMatches(e)}dirtyQueriesWithMatches(e){for(let n=0;n<this.queries.length;n++)Mf(e,n).matches!==null&&this.queries[n].setDirty()}},rc=class{flags;read;predicate;constructor(e,n,r=null){this.flags=n,this.read=r,typeof e=="string"?this.predicate=_v(e):this.predicate=e}},oc=class t{queries;constructor(e=[]){this.queries=e}elementStart(e,n){for(let r=0;r<this.queries.length;r++)this.queries[r].elementStart(e,n)}elementEnd(e){for(let n=0;n<this.queries.length;n++)this.queries[n].elementEnd(e)}embeddedTView(e){let n=null;for(let r=0;r<this.length;r++){let o=n!==null?n.length:0,i=this.getByIndex(r).embeddedTView(e,o);i&&(i.indexInDeclarationView=r,n!==null?n.push(i):n=[i])}return n!==null?new t(n):null}template(e,n){for(let r=0;r<this.queries.length;r++)this.queries[r].template(e,n)}getByIndex(e){return this.queries[e]}get length(){return this.queries.length}track(e){this.queries.push(e)}},ic=class t{metadata;matches=null;indexInDeclarationView=-1;crossesNgTemplate=!1;_declarationNodeIndex;_appliesToNextNode=!0;constructor(e,n=-1){this.metadata=e,this._declarationNodeIndex=n}elementStart(e,n){this.isApplyingToNode(n)&&this.matchTNode(e,n)}elementEnd(e){this._declarationNodeIndex===e.index&&(this._appliesToNextNode=!1)}template(e,n){this.elementStart(e,n)}embeddedTView(e,n){return this.isApplyingToNode(e)?(this.crossesNgTemplate=!0,this.addMatch(-e.index,n),new t(this.metadata)):null}isApplyingToNode(e){if(this._appliesToNextNode&&(this.metadata.flags&1)!==1){let n=this._declarationNodeIndex,r=e.parent;for(;r!==null&&r.type&8&&r.index!==n;)r=r.parent;return n===(r!==null?r.index:-1)}return this._appliesToNextNode}matchTNode(e,n){let r=this.metadata.predicate;if(Array.isArray(r))for(let o=0;o<r.length;o++){let i=r[o];this.matchTNodeWithReadOption(e,n,Dv(n,i)),this.matchTNodeWithReadOption(e,n,Bo(n,e,i,!1,!1))}else r===Sr?n.type&4&&this.matchTNodeWithReadOption(e,n,-1):this.matchTNodeWithReadOption(e,n,Bo(n,e,r,!1,!1))}matchTNodeWithReadOption(e,n,r){if(r!==null){let o=this.metadata.read;if(o!==null)if(o===Ar||o===mi||o===Sr&&n.type&4)this.addMatch(n.index,-2);else{let i=Bo(n,e,o,!1,!1);i!==null&&this.addMatch(n.index,i)}else this.addMatch(n.index,r)}}addMatch(e,n){this.matches===null?this.matches=[e,n]:this.matches.push(e,n)}};function Dv(t,e){let n=t.localNames;if(n!==null){for(let r=0;r<n.length;r+=2)if(n[r]===e)return n[r+1]}return null}function Tv(t,e){return t.type&11?Bn(t,e):t.type&4?Rc(t,e):null}function Cv(t,e,n,r){return n===-1?Tv(e,t):n===-2?Mv(t,e,r):qo(t,t[w],n,e)}function Mv(t,e,n){if(n===Ar)return Bn(e,t);if(n===Sr)return Rc(e,t);if(n===mi)return Df(e,t)}function Tf(t,e,n,r){let o=e[Je].queries[r];if(o.matches===null){let i=t.data,s=n.matches,a=[];for(let c=0;s!==null&&c<s.length;c+=2){let l=s[c];if(l<0)a.push(null);else{let u=i[l];a.push(Cv(e,u,s[c+1],n.metadata.read))}}o.matches=a}return o.matches}function sc(t,e,n,r){let o=t.queries.getByIndex(n),i=o.matches;if(i!==null){let s=Tf(t,e,o,n);for(let a=0;a<i.length;a+=2){let c=i[a];if(c>0)r.push(s[a/2]);else{let l=i[a+1],u=e[-c];for(let d=G;d<u.length;d++){let f=u[d];f[Mt]===f[J]&&sc(f[w],f,l,r)}if(u[Qt]!==null){let d=u[Qt];for(let f=0;f<d.length;f++){let p=d[f];sc(p[w],p,l,r)}}}}}return r}function Cf(t,e){return t[Je].queries[e].queryList}function Sv(t,e,n){let r=new Yo((n&4)===4);return ou(t,e,r,r.destroy),(e[Je]??=new nc).queries.push(new tc(r))-1}function xv(t,e,n){let r=De();return r.firstCreatePass&&(Nv(r,new rc(t,e,n),-1),(e&2)===2&&(r.staticViewQueries=!0)),Sv(r,O(),e)}function _v(t){return t.split(",").map(e=>e.trim())}function Nv(t,e,n){t.queries===null&&(t.queries=new oc),t.queries.track(new ic(e,n))}function Mf(t,e){return t.queries.getByIndex(e)}function Av(t,e){let n=t[w],r=Mf(n,e);return r.crossesNgTemplate?sc(n,t,e,[]):Tf(n,t,r,e)}function Sf(t,e,n){let r,o=tr(()=>{r._dirtyCounter();let i=Pv(r,t);if(e&&i===void 0)throw new M(-951,!1);return i});return r=o[se],r._dirtyCounter=Ge(0),r._flatValue=void 0,o}function xf(t){return Sf(!0,!1,t)}function _f(t){return Sf(!0,!0,t)}function Rv(t,e){let n=t[se];n._lView=O(),n._queryIndex=e,n._queryList=Cf(n._lView,e),n._queryList.onDirty(()=>n._dirtyCounter.update(r=>r+1))}function Pv(t,e){let n=t._lView,r=t._queryIndex;if(n===void 0||r===void 0||n[T]&4)return e?void 0:ct;let o=Cf(n,r),i=Av(n,r);return o.reset(i,hm),e?o.first:o._changesDetected||t._flatValue===void 0?t._flatValue=o.toArray():t._flatValue}var Ko=class{};var _r=class extends Ko{injector;componentFactoryResolver=new Ja(this);instance=null;constructor(e){super();let n=new zt([...e.providers,{provide:Ko,useValue:this},{provide:hi,useValue:this.componentFactoryResolver}],e.parent||hr(),e.debugName,new Set(["environment"]));this.injector=n,e.runEnvironmentInitializers&&n.resolveInjectorInitializers()}destroy(){this.injector.destroy()}onDestroy(e){this.injector.onDestroy(e)}};function Nf(t,e,n=null){return new _r({providers:t,parent:e,debugName:n,runEnvironmentInitializers:!0}).injector}var kv=(()=>{class t{_injector;cachedInjectors=new Map;constructor(n){this._injector=n}getOrCreateStandaloneInjector(n){if(!n.standalone)return null;if(!this.cachedInjectors.has(n)){let r=ra(!1,n.type),o=r.length>0?Nf([r],this._injector,""):null;this.cachedInjectors.set(n,o)}return this.cachedInjectors.get(n)}ngOnDestroy(){try{for(let n of this.cachedInjectors.values())n!==null&&n.destroy()}finally{this.cachedInjectors.clear()}}static \u0275prov=Q({token:t,providedIn:"environment",factory:()=>new t(j(Se))})}return t})();function Ye(t){return ad(()=>{let e=Vv(t),n=oe(te({},e),{decls:t.decls,vars:t.vars,template:t.template,consts:t.consts||null,ngContentSelectors:t.ngContentSelectors,onPush:t.changeDetection===gc.OnPush,directiveDefs:null,pipeDefs:null,dependencies:e.standalone&&t.dependencies||null,getStandaloneInjector:e.standalone?o=>o.get(kv).getOrCreateStandaloneInjector(n):null,getExternalStyles:null,signals:t.signals??!1,data:t.data||{},encapsulation:t.encapsulation||qe.Emulated,styles:t.styles||ct,_:null,schemas:t.schemas||null,tView:null,id:""});e.standalone&&sn("NgStandalone"),jv(n);let r=t.dependencies;return n.directiveDefs=Xu(r,Ov),n.pipeDefs=Xu(r,Vl),n.id=Hv(n),n})}function Ov(t){return Wt(t)||Qs(t)}function Lv(t,e){if(t==null)return qt;let n={};for(let r in t)if(t.hasOwnProperty(r)){let o=t[r],i,s,a,c;Array.isArray(o)?(a=o[0],i=o[1],s=o[2]??i,c=o[3]||null):(i=o,s=o,a=ai.None,c=null),n[i]=[r,a,c],e[i]=s}return n}function Fv(t){if(t==null)return qt;let e={};for(let n in t)t.hasOwnProperty(n)&&(e[t[n]]=n);return e}function Vv(t){let e={};return{type:t.type,providersResolver:null,viewProvidersResolver:null,factory:null,hostBindings:t.hostBindings||null,hostVars:t.hostVars||0,hostAttrs:t.hostAttrs||null,contentQueries:t.contentQueries||null,declaredInputs:e,inputConfig:t.inputs||qt,exportAs:t.exportAs||null,standalone:t.standalone??!0,signals:t.signals===!0,selectors:t.selectors||ct,viewQuery:t.viewQuery||null,features:t.features||null,setInput:null,resolveHostDirectives:null,hostDirectives:null,controlDef:null,inputs:Lv(t.inputs,e),outputs:Fv(t.outputs),debugInfo:null}}function jv(t){t.features?.forEach(e=>e(t))}function Xu(t,e){return t?()=>{let n=typeof t=="function"?t():t,r=[];for(let o of n){let i=e(o);i!==null&&r.push(i)}return r}:null}function Hv(t){let e=0,n=typeof t.consts=="function"?"":t.consts,r=[t.selectors,t.ngContentSelectors,t.hostVars,t.hostAttrs,n,t.vars,t.decls,t.encapsulation,t.standalone,t.signals,t.exportAs,JSON.stringify(t.inputs),JSON.stringify(t.outputs),Object.getOwnPropertyNames(t.type.prototype),!!t.contentQueries,!!t.viewQuery];for(let i of r.join("|"))e=Math.imul(31,e)+i.charCodeAt(0)<<0;return e+=2147483648,"c"+e}function Bv(t,e,n,r,o,i,s,a){if(n.firstCreatePass){t.mergedAttrs=ri(t.mergedAttrs,t.attrs);let u=t.tView=Ec(2,t,o,i,s,n.directiveRegistry,n.pipeRegistry,null,n.schemas,n.consts,null);n.queries!==null&&(n.queries.template(n,t),u.queries=n.queries.embeddedTView(t))}a&&(t.flags|=a),Pn(t,!1);let c=Uv(n,e,t,r);Lo()&&Mc(n,e,c,t),Vn(c,e);let l=cf(c,e,c,t);e[r+re]=l,Ic(e,l),wv(l,t,e)}function Jo(t,e,n,r,o,i,s,a,c,l,u){let d=n+re,f;if(e.firstCreatePass){if(f=fi(e,d,4,s||null,a||null),l!=null){let p=tt(e.consts,l);f.localNames=[];for(let h=0;h<p.length;h+=2)f.localNames.push(p[h],-1)}}else f=e.data[d];return Bv(f,t,e,n,r,o,i,c),l!=null&&xc(t,f,u),f}var Uv=$v;function $v(t,e,n,r){return Fo(!0),e[Y].createComment("")}var Pc=new A("");function kc(t){return!!t&&typeof t.then=="function"}function Af(t){return!!t&&typeof t.subscribe=="function"}var Rf=new A("");var Oc=(()=>{class t{resolve;reject;initialized=!1;done=!1;donePromise=new Promise((n,r)=>{this.resolve=n,this.reject=r});appInits=S(Rf,{optional:!0})??[];injector=S(Ct);constructor(){}runInitializers(){if(this.initialized)return;let n=[];for(let o of this.appInits){let i=Co(this.injector,o);if(kc(i))n.push(i);else if(Af(i)){let s=new Promise((a,c)=>{i.subscribe({complete:a,error:c})});n.push(s)}}let r=()=>{this.done=!0,this.resolve()};Promise.all(n).then(()=>{r()}).catch(o=>{this.reject(o)}),n.length===0&&r(),this.initialized=!0}static \u0275fac=function(r){return new(r||t)};static \u0275prov=Q({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})(),Pf=new A("");function kf(){ys(()=>{let t="";throw new M(600,t)})}function Of(t){return t.isBoundToModule}var zv=10;var gi=(()=>{class t{_runningTick=!1;_destroyed=!1;_destroyListeners=[];_views=[];internalErrorHandler=S(en);afterRenderManager=S($d);zonelessEnabled=S(br);rootEffectScheduler=S(Pa);dirtyFlags=0;tracingSnapshot=null;allTestViews=new Set;autoDetectTestViews=new Set;includeAllTestViews=!1;afterTick=new it;get allViews(){return[...(this.includeAllTestViews?this.allTestViews:this.autoDetectTestViews).keys(),...this._views]}get destroyed(){return this._destroyed}componentTypes=[];components=[];internalPendingTask=S(On);get isStable(){return this.internalPendingTask.hasPendingTasksObservable.pipe(Ss(n=>!n))}constructor(){S(Un,{optional:!0})}whenStable(){let n;return new Promise(r=>{n=this.isStable.subscribe({next:o=>{o&&r()}})}).finally(()=>{n.unsubscribe()})}_injector=S(Se);_rendererFactory=null;get injector(){return this._injector}bootstrap(n,r){return this.bootstrapImpl(n,r)}bootstrapImpl(n,r,o=Ct.NULL){return this._injector.get(xe).run(()=>{H(L.BootstrapComponentStart);let s=n instanceof pi;if(!this._injector.get(Oc).done){let h="";throw new M(405,h)}let c;s?c=n:c=this._injector.get(hi).resolveComponentFactory(n),this.componentTypes.push(c.componentType);let l=Of(c)?void 0:this._injector.get(Ko),u=r||c.selector,d=c.create(o,[],u,l),f=d.location.nativeElement,p=d.injector.get(Pc,null);return p?.registerApplication(f),d.onDestroy(()=>{this.detachView(d.hostView),Ir(this.components,d),p?.unregisterApplication(f)}),this._loadComponent(d),H(L.BootstrapComponentEnd,d),d})}tick(){this.zonelessEnabled||(this.dirtyFlags|=1),this._tick()}_tick(){H(L.ChangeDetectionStart),this.tracingSnapshot!==null?this.tracingSnapshot.run(Tc.CHANGE_DETECTION,this.tickImpl):this.tickImpl()}tickImpl=()=>{if(this._runningTick)throw H(L.ChangeDetectionEnd),new M(101,!1);let n=E(null);try{this._runningTick=!0,this.synchronize()}finally{this._runningTick=!1,this.tracingSnapshot?.dispose(),this.tracingSnapshot=null,E(n),this.afterTick.next(),H(L.ChangeDetectionEnd)}};synchronize(){this._rendererFactory===null&&!this._injector.destroyed&&(this._rendererFactory=this._injector.get(rn,null,{optional:!0}));let n=0;for(;this.dirtyFlags!==0&&n++<zv;){H(L.ChangeDetectionSyncStart);try{this.synchronizeOnce()}finally{H(L.ChangeDetectionSyncEnd)}}}synchronizeOnce(){this.dirtyFlags&16&&(this.dirtyFlags&=-17,this.rootEffectScheduler.flush());let n=!1;if(this.dirtyFlags&7){let r=!!(this.dirtyFlags&1);this.dirtyFlags&=-8,this.dirtyFlags|=8;for(let{_lView:o}of this.allViews){if(!r&&!vr(o))continue;let i=r&&!this.zonelessEnabled?0:1;rf(o,i),n=!0}if(this.dirtyFlags&=-5,this.syncDirtyFlagsWithViews(),this.dirtyFlags&23)return}n||(this._rendererFactory?.begin?.(),this._rendererFactory?.end?.()),this.dirtyFlags&8&&(this.dirtyFlags&=-9,this.afterRenderManager.execute()),this.syncDirtyFlagsWithViews()}syncDirtyFlagsWithViews(){if(this.allViews.some(({_lView:n})=>vr(n))){this.dirtyFlags|=2;return}else this.dirtyFlags&=-8}attachView(n){let r=n;this._views.push(r),r.attachToAppRef(this)}detachView(n){let r=n;Ir(this._views,r),r.detachFromAppRef()}_loadComponent(n){this.attachView(n.hostView);try{this.tick()}catch(o){this.internalErrorHandler(o)}this.components.push(n),this._injector.get(Pf,[]).forEach(o=>o(n))}ngOnDestroy(){if(!this._destroyed)try{this._destroyListeners.forEach(n=>n()),this._views.slice().forEach(n=>n.destroy())}finally{this._destroyed=!0,this._views=[],this._destroyListeners=[]}}onDestroy(n){return this._destroyListeners.push(n),()=>Ir(this._destroyListeners,n)}destroy(){if(this._destroyed)throw new M(406,!1);let n=this._injector;n.destroy&&!n.destroyed&&n.destroy()}get viewCount(){return this._views.length}static \u0275fac=function(r){return new(r||t)};static \u0275prov=Q({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function Ir(t,e){let n=t.indexOf(e);n>-1&&t.splice(n,1)}function vi(t,e,n,r){let o=O(),i=kn();if(pt(o,i,e)){let s=De(),a=Ca();bg(a,o,t,e,n,r)}return vi}var ac=class{destroy(e){}updateValue(e,n){}swap(e,n){let r=Math.min(e,n),o=Math.max(e,n),i=this.detach(o);if(o-r>1){let s=this.detach(r);this.attach(r,i),this.attach(o,s)}else this.attach(r,i)}move(e,n){this.attach(n,this.detach(e))}};function Va(t,e,n,r,o){return t===n&&Object.is(e,r)?1:Object.is(o(t,e),o(n,r))?-1:0}function Gv(t,e,n,r){let o,i,s=0,a=t.length-1,c=void 0;if(Array.isArray(e)){E(r);let l=e.length-1;for(E(null);s<=a&&s<=l;){let u=t.at(s),d=e[s],f=Va(s,u,s,d,n);if(f!==0){f<0&&t.updateValue(s,d),s++;continue}let p=t.at(a),h=e[l],m=Va(a,p,l,h,n);if(m!==0){m<0&&t.updateValue(a,h),a--,l--;continue}let v=n(s,u),y=n(a,p),D=n(s,d);if(Object.is(D,y)){let b=n(l,h);Object.is(b,v)?(t.swap(s,a),t.updateValue(a,h),l--,a--):t.move(a,s),t.updateValue(s,d),s++;continue}if(o??=new ei,i??=Ju(t,s,a,n),cc(t,o,s,D))t.updateValue(s,d),s++,a++;else if(i.has(D))o.set(v,t.detach(s)),a--;else{let b=t.create(s,e[s]);t.attach(s,b),s++,a++}}for(;s<=l;)Ku(t,o,n,s,e[s]),s++}else if(e!=null){E(r);let l=e[Symbol.iterator]();E(null);let u=l.next();for(;!u.done&&s<=a;){let d=t.at(s),f=u.value,p=Va(s,d,s,f,n);if(p!==0)p<0&&t.updateValue(s,f),s++,u=l.next();else{o??=new ei,i??=Ju(t,s,a,n);let h=n(s,f);if(cc(t,o,s,h))t.updateValue(s,f),s++,a++,u=l.next();else if(!i.has(h))t.attach(s,t.create(s,f)),s++,a++,u=l.next();else{let m=n(s,d);o.set(m,t.detach(s)),a--}}}for(;!u.done;)Ku(t,o,n,t.length,u.value),u=l.next()}for(;s<=a;)t.destroy(t.detach(a--));o?.forEach(l=>{t.destroy(l)})}function cc(t,e,n,r){return e!==void 0&&e.has(r)?(t.attach(n,e.get(r)),e.delete(r),!0):!1}function Ku(t,e,n,r,o){if(cc(t,e,r,n(r,o)))t.updateValue(r,o);else{let i=t.create(r,o);t.attach(r,i)}}function Ju(t,e,n,r){let o=new Set;for(let i=e;i<=n;i++)o.add(r(i,t.at(i)));return o}var ei=class{kvMap=new Map;_vMap=void 0;has(e){return this.kvMap.has(e)}delete(e){if(!this.has(e))return!1;let n=this.kvMap.get(e);return this._vMap!==void 0&&this._vMap.has(n)?(this.kvMap.set(e,this._vMap.get(n)),this._vMap.delete(n)):this.kvMap.delete(e),!0}get(e){return this.kvMap.get(e)}set(e,n){if(this.kvMap.has(e)){let r=this.kvMap.get(e);this._vMap===void 0&&(this._vMap=new Map);let o=this._vMap;for(;o.has(r);)r=o.get(r);o.set(r,n)}else this.kvMap.set(e,n)}forEach(e){for(let[n,r]of this.kvMap)if(e(r,n),this._vMap!==void 0){let o=this._vMap;for(;o.has(r);)r=o.get(r),e(r,n)}}};function Rt(t,e,n,r,o,i,s,a){sn("NgControlFlow");let c=O(),l=De(),u=tt(l.consts,i);return Jo(c,l,t,e,n,r,o,u,256,s,a),Lc}function Lc(t,e,n,r,o,i,s,a){sn("NgControlFlow");let c=O(),l=De(),u=tt(l.consts,i);return Jo(c,l,t,e,n,r,o,u,512,s,a),Lc}function Pt(t,e){sn("NgControlFlow");let n=O(),r=kn(),o=n[r]!==ke?n[r]:-1,i=o!==-1?ti(n,re+o):void 0,s=0;if(pt(n,r,t)){let a=E(null);try{if(i!==void 0&&uf(i,s),t!==-1){let c=re+t,l=ti(n,c),u=fc(n[w],c),d=ff(l,u,n),f=ui(n,u,e,{dehydratedView:d});di(l,f,s,Tr(u,d))}}finally{E(a)}}else if(i!==void 0){let a=lf(i,s);a!==void 0&&(a[q]=e)}}var lc=class{lContainer;$implicit;$index;constructor(e,n,r){this.lContainer=e,this.$implicit=n,this.$index=r}get $count(){return this.lContainer.length-G}};function Fc(t){return t}function Vc(t,e){return e}var uc=class{hasEmptyBlock;trackByFn;liveCollection;constructor(e,n,r){this.hasEmptyBlock=e,this.trackByFn=n,this.liveCollection=r}};function ht(t,e,n,r,o,i,s,a,c,l,u,d,f){sn("NgControlFlow");let p=O(),h=De(),m=c!==void 0,v=O(),y=a?s.bind(v[Ae][q]):s,D=new uc(m,y);v[re+t]=D,Jo(p,h,t+1,e,n,r,o,tt(h.consts,i),256),m&&Jo(p,h,t+2,c,l,u,d,tt(h.consts,f),512)}var dc=class extends ac{lContainer;hostLView;templateTNode;operationsCounter=void 0;needsIndexUpdate=!1;constructor(e,n,r){super(),this.lContainer=e,this.hostLView=n,this.templateTNode=r}get length(){return this.lContainer.length-G}at(e){return this.getLView(e)[q].$implicit}attach(e,n){let r=n[Sn];this.needsIndexUpdate||=e!==this.length,di(this.lContainer,n,e,Tr(this.templateTNode,r)),Wv(this.lContainer,e)}detach(e){return this.needsIndexUpdate||=e!==this.length-1,qv(this.lContainer,e),Yv(this.lContainer,e)}create(e,n){let r=Za(this.lContainer,this.templateTNode.tView.ssrId);return ui(this.hostLView,this.templateTNode,new lc(this.lContainer,n,e),{dehydratedView:r})}destroy(e){ci(e[w],e)}updateValue(e,n){this.getLView(e)[q].$implicit=n}reset(){this.needsIndexUpdate=!1}updateIndexes(){if(this.needsIndexUpdate)for(let e=0;e<this.length;e++)this.getLView(e)[q].$index=e}getLView(e){return Zv(this.lContainer,e)}};function mt(t){let e=E(null),n=dt();try{let r=O(),o=r[w],i=r[n],s=n+1,a=ti(r,s);if(i.liveCollection===void 0){let l=fc(o,s);i.liveCollection=new dc(a,r,l)}else i.liveCollection.reset();let c=i.liveCollection;if(Gv(c,t,i.trackByFn,e),c.updateIndexes(),i.hasEmptyBlock){let l=kn(),u=c.length===0;if(pt(r,l,u)){let d=n+2,f=ti(r,d);if(u){let p=fc(o,d),h=ff(f,p,r),m=ui(r,p,void 0,{dehydratedView:h});di(f,m,0,Tr(p,h))}else o.firstUpdatePass&&$g(f),uf(f,0)}}}finally{E(e)}}function ti(t,e){return t[e]}function Wv(t,e){if(t.length<=G)return;let n=G+e,r=t[n],o=r?r[St]:void 0;if(r&&o&&o.detachedLeaveAnimationFns&&o.detachedLeaveAnimationFns.length>0){let i=r[lt];Wm(i,o),nn.delete(r[ut]),o.detachedLeaveAnimationFns=void 0}}function qv(t,e){if(t.length<=G)return;let n=G+e,r=t[n],o=r?r[St]:void 0;o&&o.leave&&o.leave.size>0&&(o.detachedLeaveAnimationFns=[])}function Yv(t,e){return Mr(t,e)}function Zv(t,e){return lf(t,e)}function fc(t,e){return _o(t,e)}function an(t,e,n){let r=O(),o=kn();if(pt(r,o,e)){let i=De(),s=Ca();fg(s,r,t,e,r[Y],n)}return an}function ed(t,e,n,r,o){_c(e,t,n,o?"class":"style",r)}function ae(t,e,n,r){let o=O(),i=o[w],s=t+re,a=i.firstCreatePass?vf(s,o,2,e,yg,au(),n,r):i.data[s];if(Nt(a)){let c=o[Ke].tracingService;if(c&&c.componentCreate){let l=i.data[a.directiveStart+a.componentOffset];return c.componentCreate(wf(l),()=>(td(t,e,o,a,r),ae))}}return td(t,e,o,a,r),ae}function td(t,e,n,r,o){if(Qd(r,n,t,e,Lf),xo(r)){let i=n[w];Zd(i,n,r),Pd(i,r,n)}o!=null&&xc(n,r)}function de(){let t=De(),e=ze(),n=Xd(e);return t.firstCreatePass&&yf(t,n),ga(n)&&va(),ma(),n.classesWithoutHost!=null&&Jh(n)&&ed(t,n,O(),n.classesWithoutHost,!0),n.stylesWithoutHost!=null&&em(n)&&ed(t,n,O(),n.stylesWithoutHost,!1),de}function Pr(t,e,n,r){return ae(t,e,n,r),de(),Pr}function B(t,e,n,r){let o=O(),i=o[w],s=t+re,a=i.firstCreatePass?rv(s,i,2,e,n,r):i.data[s];return Qd(a,o,t,e,Lf),r!=null&&xc(o,a),B}function F(){let t=ze(),e=Xd(t);return ga(e)&&va(),ma(),F}function cn(t,e,n,r){return B(t,e,n,r),F(),cn}var Lf=(t,e,n,r,o)=>(Fo(!0),Od(e[Y],r,Ma()));function kr(){return O()}var Or="en-US";var Qv=Or;function Ff(t){typeof t=="string"&&(Qv=t.toLowerCase().replace(/_/g,"-"))}function yi(t,e,n){let r=O(),o=De(),i=ze();return Xv(o,r,r[Y],i,t,e,n),yi}function bi(t,e,n){let r=O(),o=De(),i=ze();return(i.type&3||n)&&bf(i,o,r,n,r[Y],t,e,$o(i,r,e)),bi}function Xv(t,e,n,r,o,i,s){let a=!0,c=null;if((r.type&3||s)&&(c??=$o(r,e,i),bf(r,t,e,s,n,o,i,c)&&(a=!1)),a){let l=r.outputs?.[o],u=r.hostDirectiveOutputs?.[o];if(u&&u.length)for(let d=0;d<u.length;d+=2){let f=u[d],p=u[d+1];c??=$o(r,e,i),Yu(r,e,f,p,o,c)}if(l&&l.length)for(let d of l)c??=$o(r,e,i),Yu(r,e,d,o,o,c)}}function he(t=1){return Iu(t)}function Ei(t,e,n,r){return Rv(t,xv(e,n,r)),Ei}function jc(t=1){Po(yu()+t)}function Vo(t,e){return t<<17|e<<2}function on(t){return t>>17&32767}function Kv(t){return(t&2)==2}function Jv(t,e){return t&131071|e<<17}function pc(t){return t|2}function Hn(t){return(t&131068)>>2}function ja(t,e){return t&-131069|e<<2}function ey(t){return(t&1)===1}function hc(t){return t|1}function ty(t,e,n,r,o,i){let s=i?e.classBindings:e.styleBindings,a=on(s),c=Hn(s);t[r]=n;let l=!1,u;if(Array.isArray(n)){let d=n;u=d[1],(u===null||Cn(d,u)>0)&&(l=!0)}else u=n;if(o)if(c!==0){let f=on(t[a+1]);t[r+1]=Vo(f,a),f!==0&&(t[f+1]=ja(t[f+1],r)),t[a+1]=Jv(t[a+1],r)}else t[r+1]=Vo(a,0),a!==0&&(t[a+1]=ja(t[a+1],r)),a=r;else t[r+1]=Vo(c,0),a===0?a=r:t[c+1]=ja(t[c+1],r),c=r;l&&(t[r+1]=pc(t[r+1])),nd(t,u,r,!0),nd(t,u,r,!1),ny(e,u,t,r,i),s=Vo(a,c),i?e.classBindings=s:e.styleBindings=s}function ny(t,e,n,r,o){let i=o?t.residualClasses:t.residualStyles;i!=null&&typeof e=="string"&&Cn(i,e)>=0&&(n[r+1]=hc(n[r+1]))}function nd(t,e,n,r){let o=t[n+1],i=e===null,s=r?on(o):Hn(o),a=!1;for(;s!==0&&(a===!1||i);){let c=t[s],l=t[s+1];ry(c,e)&&(a=!0,t[s+1]=r?hc(l):pc(l)),s=r?on(l):Hn(l)}a&&(t[n+1]=r?pc(o):hc(o))}function ry(t,e){return t===null||e==null||(Array.isArray(t)?t[1]:t)===e?!0:Array.isArray(t)&&typeof e=="string"?Cn(t,e)>=0:!1}function kt(t,e,n){return Vf(t,e,n,!1),kt}function Ze(t,e){return Vf(t,e,null,!0),Ze}function Vf(t,e,n,r){let o=O(),i=De(),s=Ia(2);if(i.firstUpdatePass&&iy(i,t,s,r),e!==ke&&pt(o,s,e)){let a=i.data[dt()];uy(i,a,o,o[Y],t,o[s+1]=dy(e,n),r,s)}}function oy(t,e){return e>=t.expandoStartIndex}function iy(t,e,n,r){let o=t.data;if(o[n+1]===null){let i=o[dt()],s=oy(t,n);fy(i,r)&&e===null&&!s&&(e=!1),e=sy(o,i,e,r),ty(o,i,e,n,s,r)}}function sy(t,e,n,r){let o=vu(t),i=r?e.residualClasses:e.residualStyles;if(o===null)(r?e.classBindings:e.styleBindings)===0&&(n=Ha(null,t,e,n,r),n=Nr(n,e.attrs,r),i=null);else{let s=e.directiveStylingLast;if(s===-1||t[s]!==o)if(n=Ha(o,t,e,n,r),i===null){let c=ay(t,e,r);c!==void 0&&Array.isArray(c)&&(c=Ha(null,t,e,c[1],r),c=Nr(c,e.attrs,r),cy(t,e,r,c))}else i=ly(t,e,r)}return i!==void 0&&(r?e.residualClasses=i:e.residualStyles=i),n}function ay(t,e,n){let r=n?e.classBindings:e.styleBindings;if(Hn(r)!==0)return t[on(r)]}function cy(t,e,n,r){let o=n?e.classBindings:e.styleBindings;t[on(o)]=r}function ly(t,e,n){let r,o=e.directiveEnd;for(let i=1+e.directiveStylingLast;i<o;i++){let s=t[i].hostAttrs;r=Nr(r,s,n)}return Nr(r,e.attrs,n)}function Ha(t,e,n,r,o){let i=null,s=n.directiveEnd,a=n.directiveStylingLast;for(a===-1?a=n.directiveStart:a++;a<s&&(i=e[a],r=Nr(r,i.hostAttrs,o),i!==t);)a++;return t!==null&&(n.directiveStylingLast=a),r}function Nr(t,e,n){let r=n?1:2,o=-1;if(e!==null)for(let i=0;i<e.length;i++){let s=e[i];typeof s=="number"?o=s:o===r&&(Array.isArray(t)||(t=t===void 0?[]:["",t]),Gl(t,s,n?!0:e[++i]))}return t===void 0?null:t}function uy(t,e,n,r,o,i,s,a){if(!(e.type&3))return;let c=t.data,l=c[a+1],u=ey(l)?rd(c,e,n,o,Hn(l),s):void 0;if(!ni(u)){ni(i)||Kv(l)&&(i=rd(c,null,n,o,a,s));let d=la(dt(),n);ag(r,s,d,o,i)}}function rd(t,e,n,r,o,i){let s=e===null,a;for(;o>0;){let c=t[o],l=Array.isArray(c),u=l?c[1]:c,d=u===null,f=n[o+1];f===ke&&(f=d?ct:void 0);let p=d?To(f,r):u===r?f:void 0;if(l&&!ni(p)&&(p=To(c,r)),ni(p)&&(a=p,s))return a;let h=t[o+1];o=s?on(h):Hn(h)}if(e!==null){let c=i?e.residualClasses:e.residualStyles;c!=null&&(a=To(c,r))}return a}function ni(t){return t!==void 0}function dy(t,e){return t==null||t===""||(typeof e=="string"?t=t+e:typeof t=="object"&&(t=yo(kd(t)))),t}function fy(t,e){return(t.flags&(e?8:16))!==0}function R(t,e=""){let n=O(),r=De(),o=t+re,i=r.firstCreatePass?fi(r,o,1,e,null):r.data[o],s=py(r,n,i,e);n[o]=s,Lo()&&Mc(r,n,s,i),Pn(i,!1)}var py=(t,e,n,r)=>(Fo(!0),Cm(e[Y],r));function hy(t,e,n,r=""){return pt(t,kn(),n)?e+ur(n)+r:ke}function my(t,e,n,r,o,i=""){let s=fu(),a=iv(t,s,n,o);return Ia(2),a?e+ur(n)+r+ur(o)+i:ke}function Oe(t){return Le("",t),Oe}function Le(t,e,n){let r=O(),o=hy(r,t,e,n);return o!==ke&&jf(r,dt(),o),Le}function wi(t,e,n,r,o){let i=O(),s=my(i,t,e,n,r,o);return s!==ke&&jf(i,dt(),s),wi}function jf(t,e,n){let r=la(e,t);Mm(t[Y],r,n)}function Hc(t,e,n){return vy(O(),du(),t,e,n)}function gy(t,e){let n=t[e];return n===ke?void 0:n}function vy(t,e,n,r,o,i){let s=e+n;return pt(t,s,o)?ov(t,s+1,i?r.call(i,o):r(o)):gy(t,s+1)}var Hf=(()=>{class t{applicationErrorHandler=S(en);appRef=S(gi);taskService=S(On);ngZone=S(xe);zonelessEnabled=S(br);tracing=S(Un,{optional:!0});zoneIsDefined=typeof Zone<"u"&&!!Zone.root.run;schedulerTickApplyArgs=[{data:{__scheduler_tick__:!0}}];subscriptions=new ue;angularZoneId=this.zoneIsDefined?this.ngZone._inner?.get(ar):null;scheduleInRootZone=!this.zonelessEnabled&&this.zoneIsDefined&&(S(Ra,{optional:!0})??!1);cancelScheduledCallback=null;useMicrotaskScheduler=!1;runningTick=!1;pendingRenderTaskId=null;constructor(){this.subscriptions.add(this.appRef.afterTick.subscribe(()=>{let n=this.taskService.add();if(!this.runningTick&&(this.cleanup(),!this.zonelessEnabled||this.appRef.includeAllTestViews)){this.taskService.remove(n);return}this.switchToMicrotaskScheduler(),this.taskService.remove(n)})),this.subscriptions.add(this.ngZone.onUnstable.subscribe(()=>{this.runningTick||this.cleanup()}))}switchToMicrotaskScheduler(){this.ngZone.runOutsideAngular(()=>{let n=this.taskService.add();this.useMicrotaskScheduler=!0,queueMicrotask(()=>{this.useMicrotaskScheduler=!1,this.taskService.remove(n)})})}notify(n){if(!this.zonelessEnabled&&n===5)return;switch(n){case 0:{this.appRef.dirtyFlags|=2;break}case 3:case 2:case 4:case 5:case 1:{this.appRef.dirtyFlags|=4;break}case 6:{this.appRef.dirtyFlags|=2;break}case 12:{this.appRef.dirtyFlags|=16;break}case 13:{this.appRef.dirtyFlags|=2;break}case 11:break;default:this.appRef.dirtyFlags|=8}if(this.appRef.tracingSnapshot=this.tracing?.snapshot(this.appRef.tracingSnapshot)??null,!this.shouldScheduleTick())return;let r=this.useMicrotaskScheduler?Su:Sa;this.pendingRenderTaskId=this.taskService.add(),this.scheduleInRootZone?this.cancelScheduledCallback=Zone.root.run(()=>r(()=>this.tick())):this.cancelScheduledCallback=this.ngZone.runOutsideAngular(()=>r(()=>this.tick()))}shouldScheduleTick(){return!(this.appRef.destroyed||this.pendingRenderTaskId!==null||this.runningTick||this.appRef._runningTick||!this.zonelessEnabled&&this.zoneIsDefined&&Zone.current.get(ar+this.angularZoneId))}tick(){if(this.runningTick||this.appRef.destroyed)return;if(this.appRef.dirtyFlags===0){this.cleanup();return}!this.zonelessEnabled&&this.appRef.dirtyFlags&7&&(this.appRef.dirtyFlags|=1);let n=this.taskService.add();try{this.ngZone.run(()=>{this.runningTick=!0,this.appRef._tick()},void 0,this.schedulerTickApplyArgs)}catch(r){this.applicationErrorHandler(r)}finally{this.taskService.remove(n),this.cleanup()}}ngOnDestroy(){this.subscriptions.unsubscribe(),this.cleanup()}cleanup(){if(this.runningTick=!1,this.cancelScheduledCallback?.(),this.cancelScheduledCallback=null,this.pendingRenderTaskId!==null){let n=this.pendingRenderTaskId;this.pendingRenderTaskId=null,this.taskService.remove(n)}}static \u0275fac=function(r){return new(r||t)};static \u0275prov=Q({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function Bc(){return sn("NgZoneless"),fr([...Uc(),[]])}function Uc(){return[{provide:Tn,useExisting:Hf},{provide:xe,useClass:cr},{provide:br,useValue:!0}]}function yy(){return typeof $localize<"u"&&$localize.locale||Or}var $c=new A("",{factory:()=>S($c,{optional:!0,skipSelf:!0})||yy()});var Ii=class{destroyed=!1;listeners=null;errorHandler=S(He,{optional:!0});destroyRef=S(Jt);constructor(){this.destroyRef.onDestroy(()=>{this.destroyed=!0,this.listeners=null})}subscribe(e){if(this.destroyed)throw new M(953,!1);return(this.listeners??=[]).push(e),{unsubscribe:()=>{let n=this.listeners?.indexOf(e);n!==void 0&&n!==-1&&this.listeners?.splice(n,1)}}}emit(e){if(this.destroyed){console.warn(lr(953,!1));return}if(this.listeners===null)return;let n=E(null);try{for(let r of this.listeners)try{r(e)}catch(o){this.errorHandler?.handleError(o)}}finally{E(n)}}};function rt(t,e){return tr(t,e?.equal)}var $f=Symbol("InputSignalNode#UNSET"),Cy=oe(te({},io),{transformFn:void 0,applyValueToInputSignal(t,e){nr(t,e)}});function zf(t,e){let n=Object.create(Cy);n.value=t,n.transformFn=e?.transform;function r(){if(Kn(n),n.value===$f){let o=null;throw new M(-950,o)}return n.value}return r[se]=n,r}function Gf(t){return new Ii}function Bf(t,e){return zf(t,e)}function My(t){return zf($f,t)}var ee=(Bf.required=My,Bf);function Uf(t,e){return xf(e)}function Sy(t,e){return _f(e)}var Wf=(Uf.required=Sy,Uf);var zc=new A(""),xy=new A("");function Lr(t){return!t.moduleRef}function _y(t){let e=Lr(t)?t.r3Injector:t.moduleRef.injector,n=e.get(xe);return n.run(()=>{Lr(t)?t.r3Injector.resolveInjectorInitializers():t.moduleRef.resolveInjectorInitializers();let r=e.get(en),o;if(n.runOutsideAngular(()=>{o=n.onError.subscribe({next:r})}),Lr(t)){let i=()=>e.destroy(),s=t.platformInjector.get(zc);s.add(i),e.onDestroy(()=>{o.unsubscribe(),s.delete(i)})}else{let i=()=>t.moduleRef.destroy(),s=t.platformInjector.get(zc);s.add(i),t.moduleRef.onDestroy(()=>{Ir(t.allPlatformModules,t.moduleRef),o.unsubscribe(),s.delete(i)})}return Ay(r,n,()=>{let i=e.get(On),s=i.add(),a=e.get(Oc);return a.runInitializers(),a.donePromise.then(()=>{let c=e.get($c,Or);if(Ff(c||Or),!e.get(xy,!0))return Lr(t)?e.get(gi):(t.allPlatformModules.push(t.moduleRef),t.moduleRef);if(Lr(t)){let u=e.get(gi);return t.rootComponent!==void 0&&u.bootstrap(t.rootComponent),u}else return Ny?.(t.moduleRef,t.allPlatformModules),t.moduleRef}).finally(()=>{i.remove(s)})})})}var Ny;function Ay(t,e,n){try{let r=n();return kc(r)?r.catch(o=>{throw e.runOutsideAngular(()=>t(o)),o}):r}catch(r){throw e.runOutsideAngular(()=>t(r)),r}}var Di=null;function Ry(t=[],e){return Ct.create({name:e,providers:[{provide:pr,useValue:"platform"},{provide:zc,useValue:new Set([()=>Di=null])},...t]})}function Py(t=[]){if(Di)return Di;let e=Ry(t);return Di=e,kf(),ky(e),e}function ky(t){let e=t.get(ii,null);Co(t,()=>{e?.forEach(n=>n())})}var Oy=1e4;var b_=Oy-1e3;function qf(t){let{rootComponent:e,appProviders:n,platformProviders:r,platformRef:o}=t;H(L.BootstrapApplicationStart);try{let i=o?.injector??Py(r),s=[Uc(),_u,...n||[]],a=new _r({providers:s,parent:i,debugName:"",runEnvironmentInitializers:!1});return _y({r3Injector:a.injector,platformInjector:i,rootComponent:e})}catch(i){return Promise.reject(i)}finally{H(L.BootstrapApplicationEnd)}}var Yf=null;function jr(){return Yf}function Gc(t){Yf??=t}var Vr=class{};function Wc(t,e){e=encodeURIComponent(e);for(let n of t.split(";")){let r=n.indexOf("="),[o,i]=r==-1?[n,""]:[n.slice(0,r),n.slice(r+1)];if(o.trim()===e)return decodeURIComponent(i)}return null}var Hr=class{};var Zf="browser";var Br=class{_doc;constructor(e){this._doc=e}manager},Ti=(()=>{class t extends Br{constructor(n){super(n)}supports(n){return!0}addEventListener(n,r,o,i){return n.addEventListener(r,o,i),()=>this.removeEventListener(n,r,o,i)}removeEventListener(n,r,o,i){return n.removeEventListener(r,o,i)}static \u0275fac=function(r){return new(r||t)(j(Pe))};static \u0275prov=Q({token:t,factory:t.\u0275fac})}return t})(),Si=new A(""),Qc=(()=>{class t{_zone;_plugins;_eventNameToPlugin=new Map;constructor(n,r){this._zone=r,n.forEach(s=>{s.manager=this});let o=n.filter(s=>!(s instanceof Ti));this._plugins=o.slice().reverse();let i=n.find(s=>s instanceof Ti);i&&this._plugins.push(i)}addEventListener(n,r,o,i){return this._findPluginFor(r).addEventListener(n,r,o,i)}getZone(){return this._zone}_findPluginFor(n){let r=this._eventNameToPlugin.get(n);if(r)return r;if(r=this._plugins.find(i=>i.supports(n)),!r)throw new M(5101,!1);return this._eventNameToPlugin.set(n,r),r}static \u0275fac=function(r){return new(r||t)(j(Si),j(xe))};static \u0275prov=Q({token:t,factory:t.\u0275fac})}return t})(),qc="ng-app-id";function Qf(t){for(let e of t)e.remove()}function Xf(t,e){let n=e.createElement("style");return n.textContent=t,n}function Ly(t,e,n,r){let o=t.head?.querySelectorAll(`style[${qc}="${e}"],link[${qc}="${e}"]`);if(o)for(let i of o)i.removeAttribute(qc),i instanceof HTMLLinkElement?r.set(i.href.slice(i.href.lastIndexOf("/")+1),{usage:0,elements:[i]}):i.textContent&&n.set(i.textContent,{usage:0,elements:[i]})}function Zc(t,e){let n=e.createElement("link");return n.setAttribute("rel","stylesheet"),n.setAttribute("href",t),n}var Xc=(()=>{class t{doc;appId;nonce;inline=new Map;external=new Map;hosts=new Set;constructor(n,r,o,i={}){this.doc=n,this.appId=r,this.nonce=o,Ly(n,r,this.inline,this.external),this.hosts.add(n.head)}addStyles(n,r){for(let o of n)this.addUsage(o,this.inline,Xf);r?.forEach(o=>this.addUsage(o,this.external,Zc))}removeStyles(n,r){for(let o of n)this.removeUsage(o,this.inline);r?.forEach(o=>this.removeUsage(o,this.external))}addUsage(n,r,o){let i=r.get(n);i?i.usage++:r.set(n,{usage:1,elements:[...this.hosts].map(s=>this.addElement(s,o(n,this.doc)))})}removeUsage(n,r){let o=r.get(n);o&&(o.usage--,o.usage<=0&&(Qf(o.elements),r.delete(n)))}ngOnDestroy(){for(let[,{elements:n}]of[...this.inline,...this.external])Qf(n);this.hosts.clear()}addHost(n){this.hosts.add(n);for(let[r,{elements:o}]of this.inline)o.push(this.addElement(n,Xf(r,this.doc)));for(let[r,{elements:o}]of this.external)o.push(this.addElement(n,Zc(r,this.doc)))}removeHost(n){this.hosts.delete(n)}addElement(n,r){return this.nonce&&r.setAttribute("nonce",this.nonce),n.appendChild(r)}static \u0275fac=function(r){return new(r||t)(j(Pe),j(oi),j(si,8),j(Rr))};static \u0275prov=Q({token:t,factory:t.\u0275fac})}return t})(),Yc={svg:"http://www.w3.org/2000/svg",xhtml:"http://www.w3.org/1999/xhtml",xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/",math:"http://www.w3.org/1998/Math/MathML"},Kc=/%COMP%/g;var Jf="%COMP%",Fy=`_nghost-${Jf}`,Vy=`_ngcontent-${Jf}`,jy=!0,Hy=new A("",{factory:()=>jy});function By(t){return Vy.replace(Kc,t)}function Uy(t){return Fy.replace(Kc,t)}function ep(t,e){return e.map(n=>n.replace(Kc,t))}var Jc=(()=>{class t{eventManager;sharedStylesHost;appId;removeStylesOnCompDestroy;doc;ngZone;nonce;tracingService;rendererByCompId=new Map;defaultRenderer;constructor(n,r,o,i,s,a,c=null,l=null){this.eventManager=n,this.sharedStylesHost=r,this.appId=o,this.removeStylesOnCompDestroy=i,this.doc=s,this.ngZone=a,this.nonce=c,this.tracingService=l,this.defaultRenderer=new Ur(n,s,a,this.tracingService)}createRenderer(n,r){if(!n||!r)return this.defaultRenderer;let o=this.getOrCreateRenderer(n,r);return o instanceof Mi?o.applyToHost(n):o instanceof $r&&o.applyStyles(),o}getOrCreateRenderer(n,r){let o=this.rendererByCompId,i=o.get(r.id);if(!i){let s=this.doc,a=this.ngZone,c=this.eventManager,l=this.sharedStylesHost,u=this.removeStylesOnCompDestroy,d=this.tracingService;switch(r.encapsulation){case qe.Emulated:i=new Mi(c,l,r,this.appId,u,s,a,d);break;case qe.ShadowDom:return new Ci(c,n,r,s,a,this.nonce,d,l);case qe.ExperimentalIsolatedShadowDom:return new Ci(c,n,r,s,a,this.nonce,d);default:i=new $r(c,l,r,u,s,a,d);break}o.set(r.id,i)}return i}ngOnDestroy(){this.rendererByCompId.clear()}componentReplaced(n){this.rendererByCompId.delete(n)}static \u0275fac=function(r){return new(r||t)(j(Qc),j(Xc),j(oi),j(Hy),j(Pe),j(xe),j(si),j(Un,8))};static \u0275prov=Q({token:t,factory:t.\u0275fac})}return t})(),Ur=class{eventManager;doc;ngZone;tracingService;data=Object.create(null);throwOnSyntheticProps=!0;constructor(e,n,r,o){this.eventManager=e,this.doc=n,this.ngZone=r,this.tracingService=o}destroy(){}destroyNode=null;createElement(e,n){return n?this.doc.createElementNS(Yc[n]||n,e):this.doc.createElement(e)}createComment(e){return this.doc.createComment(e)}createText(e){return this.doc.createTextNode(e)}appendChild(e,n){(Kf(e)?e.content:e).appendChild(n)}insertBefore(e,n,r){e&&(Kf(e)?e.content:e).insertBefore(n,r)}removeChild(e,n){n.remove()}selectRootElement(e,n){let r=typeof e=="string"?this.doc.querySelector(e):e;if(!r)throw new M(-5104,!1);return n||(r.textContent=""),r}parentNode(e){return e.parentNode}nextSibling(e){return e.nextSibling}setAttribute(e,n,r,o){if(o){n=o+":"+n;let i=Yc[o];i?e.setAttributeNS(i,n,r):e.setAttribute(n,r)}else e.setAttribute(n,r)}removeAttribute(e,n,r){if(r){let o=Yc[r];o?e.removeAttributeNS(o,n):e.removeAttribute(`${r}:${n}`)}else e.removeAttribute(n)}addClass(e,n){e.classList.add(n)}removeClass(e,n){e.classList.remove(n)}setStyle(e,n,r,o){o&(ft.DashCase|ft.Important)?e.style.setProperty(n,r,o&ft.Important?"important":""):e.style[n]=r}removeStyle(e,n,r){r&ft.DashCase?e.style.removeProperty(n):e.style[n]=""}setProperty(e,n,r){e!=null&&(e[n]=r)}setValue(e,n){e.nodeValue=n}listen(e,n,r,o){if(typeof e=="string"&&(e=jr().getGlobalEventTarget(this.doc,e),!e))throw new M(5102,!1);let i=this.decoratePreventDefault(r);return this.tracingService?.wrapEventListener&&(i=this.tracingService.wrapEventListener(e,n,i)),this.eventManager.addEventListener(e,n,i,o)}decoratePreventDefault(e){return n=>{if(n==="__ngUnwrap__")return e;e(n)===!1&&n.preventDefault()}}};function Kf(t){return t.tagName==="TEMPLATE"&&t.content!==void 0}var Ci=class extends Ur{hostEl;sharedStylesHost;shadowRoot;constructor(e,n,r,o,i,s,a,c){super(e,o,i,a),this.hostEl=n,this.sharedStylesHost=c,this.shadowRoot=n.attachShadow({mode:"open"}),this.sharedStylesHost&&this.sharedStylesHost.addHost(this.shadowRoot);let l=r.styles;l=ep(r.id,l);for(let d of l){let f=document.createElement("style");s&&f.setAttribute("nonce",s),f.textContent=d,this.shadowRoot.appendChild(f)}let u=r.getExternalStyles?.();if(u)for(let d of u){let f=Zc(d,o);s&&f.setAttribute("nonce",s),this.shadowRoot.appendChild(f)}}nodeOrShadowRoot(e){return e===this.hostEl?this.shadowRoot:e}appendChild(e,n){return super.appendChild(this.nodeOrShadowRoot(e),n)}insertBefore(e,n,r){return super.insertBefore(this.nodeOrShadowRoot(e),n,r)}removeChild(e,n){return super.removeChild(null,n)}parentNode(e){return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(e)))}destroy(){this.sharedStylesHost&&this.sharedStylesHost.removeHost(this.shadowRoot)}},$r=class extends Ur{sharedStylesHost;removeStylesOnCompDestroy;styles;styleUrls;constructor(e,n,r,o,i,s,a,c){super(e,i,s,a),this.sharedStylesHost=n,this.removeStylesOnCompDestroy=o;let l=r.styles;this.styles=c?ep(c,l):l,this.styleUrls=r.getExternalStyles?.(c)}applyStyles(){this.sharedStylesHost.addStyles(this.styles,this.styleUrls)}destroy(){this.removeStylesOnCompDestroy&&nn.size===0&&this.sharedStylesHost.removeStyles(this.styles,this.styleUrls)}},Mi=class extends $r{contentAttr;hostAttr;constructor(e,n,r,o,i,s,a,c){let l=o+"-"+r.id;super(e,n,r,i,s,a,c,l),this.contentAttr=By(l),this.hostAttr=Uy(l)}applyToHost(e){this.applyStyles(),this.setAttribute(e,this.hostAttr,"")}createElement(e,n){let r=super.createElement(e,n);return super.setAttribute(r,this.contentAttr,""),r}};var xi=class t extends Vr{supportsDOMEvents=!0;static makeCurrent(){Gc(new t)}onAndCancel(e,n,r,o){return e.addEventListener(n,r,o),()=>{e.removeEventListener(n,r,o)}}dispatchEvent(e,n){e.dispatchEvent(n)}remove(e){e.remove()}createElement(e,n){return n=n||this.getDefaultDocument(),n.createElement(e)}createHtmlDocument(){return document.implementation.createHTMLDocument("fakeTitle")}getDefaultDocument(){return document}isElementNode(e){return e.nodeType===Node.ELEMENT_NODE}isShadowRoot(e){return e instanceof DocumentFragment}getGlobalEventTarget(e,n){return n==="window"?window:n==="document"?e:n==="body"?e.body:null}getBaseHref(e){let n=$y();return n==null?null:zy(n)}resetBaseElement(){zr=null}getUserAgent(){return window.navigator.userAgent}getCookie(e){return Wc(document.cookie,e)}},zr=null;function $y(){return zr=zr||document.head.querySelector("base"),zr?zr.getAttribute("href"):null}function zy(t){return new URL(t,document.baseURI).pathname}var Gy=(()=>{class t{build(){return new XMLHttpRequest}static \u0275fac=function(r){return new(r||t)};static \u0275prov=Q({token:t,factory:t.\u0275fac})}return t})(),tp=["alt","control","meta","shift"],Wy={"\b":"Backspace","	":"Tab","\x7F":"Delete","\x1B":"Escape",Del:"Delete",Esc:"Escape",Left:"ArrowLeft",Right:"ArrowRight",Up:"ArrowUp",Down:"ArrowDown",Menu:"ContextMenu",Scroll:"ScrollLock",Win:"OS"},qy={alt:t=>t.altKey,control:t=>t.ctrlKey,meta:t=>t.metaKey,shift:t=>t.shiftKey},np=(()=>{class t extends Br{constructor(n){super(n)}supports(n){return t.parseEventName(n)!=null}addEventListener(n,r,o,i){let s=t.parseEventName(r),a=t.eventCallback(s.fullKey,o,this.manager.getZone());return this.manager.getZone().runOutsideAngular(()=>jr().onAndCancel(n,s.domEventName,a,i))}static parseEventName(n){let r=n.toLowerCase().split("."),o=r.shift();if(r.length===0||!(o==="keydown"||o==="keyup"))return null;let i=t._normalizeKey(r.pop()),s="",a=r.indexOf("code");if(a>-1&&(r.splice(a,1),s="code."),tp.forEach(l=>{let u=r.indexOf(l);u>-1&&(r.splice(u,1),s+=l+".")}),s+=i,r.length!=0||i.length===0)return null;let c={};return c.domEventName=o,c.fullKey=s,c}static matchEventFullKeyCode(n,r){let o=Wy[n.key]||n.key,i="";return r.indexOf("code.")>-1&&(o=n.code,i="code."),o==null||!o?!1:(o=o.toLowerCase(),o===" "?o="space":o==="."&&(o="dot"),tp.forEach(s=>{if(s!==o){let a=qy[s];a(n)&&(i+=s+".")}}),i+=o,i===r)}static eventCallback(n,r,o){return i=>{t.matchEventFullKeyCode(i,n)&&o.runGuarded(()=>r(i))}}static _normalizeKey(n){return n==="esc"?"escape":n}static \u0275fac=function(r){return new(r||t)(j(Pe))};static \u0275prov=Q({token:t,factory:t.\u0275fac})}return t})();async function el(t,e,n){let r=te({rootComponent:t},Yy(e,n));return qf(r)}function Yy(t,e){return{platformRef:e?.platformRef,appProviders:[...Jy,...t?.providers??[]],platformProviders:Ky}}function Zy(){xi.makeCurrent()}function Qy(){return new He}function Xy(){return vc(document),document}var Ky=[{provide:Rr,useValue:Zf},{provide:ii,useValue:Zy,multi:!0},{provide:Pe,useFactory:Xy}];var Jy=[{provide:pr,useValue:"root"},{provide:He,useFactory:Qy},{provide:Si,useClass:Ti,multi:!0},{provide:Si,useClass:np,multi:!0},Jc,Xc,Qc,{provide:rn,useExisting:Jc},{provide:Hr,useClass:Gy},[]];function Z(){let t=new Float32Array(16);return t[0]=t[5]=t[10]=t[15]=1,t}function rp(t,e,n,r,o){let i=1/Math.tan(e/2);return t.fill(0),t[0]=i/n,t[5]=i,t[10]=(o+r)/(r-o),t[11]=-1,t[14]=2*o*r/(r-o),t}function op(t,e,n,r){let o=e[0]-n[0],i=e[1]-n[1],s=e[2]-n[2],a=Math.hypot(o,i,s);a<1e-8?(o=0,i=0,s=1):(o/=a,i/=a,s/=a);let c=r[1]*s-r[2]*i,l=r[2]*o-r[0]*s,u=r[0]*i-r[1]*o;a=Math.hypot(c,l,u),a<1e-8?(c=1,l=0,u=0):(c/=a,l/=a,u/=a);let d=i*u-s*l,f=s*c-o*u,p=o*l-i*c;return t[0]=c,t[1]=d,t[2]=o,t[3]=0,t[4]=l,t[5]=f,t[6]=i,t[7]=0,t[8]=u,t[9]=p,t[10]=s,t[11]=0,t[12]=-(c*e[0]+l*e[1]+u*e[2]),t[13]=-(d*e[0]+f*e[1]+p*e[2]),t[14]=-(o*e[0]+i*e[1]+s*e[2]),t[15]=1,t}function ip(t,e,n){let r=e[0],o=e[1],i=e[2],s=e[3],a=e[4],c=e[5],l=e[6],u=e[7],d=e[8],f=e[9],p=e[10],h=e[11],m=e[12],v=e[13],y=e[14],D=e[15];for(let b=0;b<4;b++){let I=n[b*4],k=n[b*4+1],N=n[b*4+2],z=n[b*4+3];t[b*4]=I*r+k*a+N*d+z*m,t[b*4+1]=I*o+k*c+N*f+z*v,t[b*4+2]=I*i+k*l+N*p+z*y,t[b*4+3]=I*s+k*u+N*h+z*D}return t}function ce(t,e,n,r,o,i){let s=Math.cos(o)*i,a=Math.sin(o)*i;return t[0]=s,t[1]=0,t[2]=-a,t[3]=0,t[4]=0,t[5]=i,t[6]=0,t[7]=0,t[8]=a,t[9]=0,t[10]=s,t[11]=0,t[12]=e,t[13]=n,t[14]=r,t[15]=1,t}var sN=Z();var Fe=(t,e,n)=>t<e?e:t>n?n:t,un=t=>Fe(t,0,1),gt=(t,e,n)=>t+(e-t)*n;function me(t,e,n){let r=un((n-t)/(e-t||1e-8));return r*r*(3-2*r)}function vt(t,e,n,r){return gt(e,t,Math.exp(-n*r))}function ne(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var _i=class{position=[0,0,6];target=[0,0,0];up=[0,1,0];fov=46*Math.PI/180;near=.05;far=260;view=Z();projection=Z();viewProjection=Z();parallaxX=0;parallaxY=0;update(e,n,r,o,i){this.parallaxX=vt(this.parallaxX,n*.16,3.5,i),this.parallaxY=vt(this.parallaxY,r*.1,3.5,i);let s=Math.sin(o*.11)*.022,a=Math.sin(o*.083)*.017,c=this.parallaxX+s,l=this.parallaxY+a,u=6;this.position[0]=Math.sin(c)*Math.cos(l)*u,this.position[1]=Math.sin(l)*u,this.position[2]=Math.cos(c)*Math.cos(l)*u,rp(this.projection,this.fov,e,this.near,this.far),op(this.view,this.position,this.target,this.up),ip(this.viewProjection,this.projection,this.view)}};var $=`#version 300 es
precision highp float;
precision highp int;
`,P=`#version 300 es
precision highp float;
precision highp int;
`,Gr=`
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

vec3 hash31(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yzz) * p3.zyx);
}

float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}
`,Ve=`
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p, int octaves) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    sum += amp * snoise(p * freq);
    freq *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

/**
 * Divergence-free flow field. Cytoplasm and hydration-shell particles ride this
 * instead of straight noise so they swirl and never bunch into dead spots.
 */
vec3 curlNoise(vec3 p) {
  const float e = 0.12;
  float x1 = snoise(vec3(p.x, p.y + e, p.z)) - snoise(vec3(p.x, p.y - e, p.z));
  float x2 = snoise(vec3(p.x, p.y, p.z + e)) - snoise(vec3(p.x, p.y, p.z - e));
  float y1 = snoise(vec3(p.x, p.y, p.z + e)) - snoise(vec3(p.x, p.y, p.z - e));
  float y2 = snoise(vec3(p.x + e, p.y, p.z)) - snoise(vec3(p.x - e, p.y, p.z));
  float z1 = snoise(vec3(p.x + e, p.y, p.z)) - snoise(vec3(p.x - e, p.y, p.z));
  float z2 = snoise(vec3(p.x, p.y + e, p.z)) - snoise(vec3(p.x, p.y - e, p.z));
  return normalize(vec3(x1 - x2, y1 - y2, z1 - z2) / (2.0 * e));
}
`,Qe=`
mat2 rot2(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

mat3 rotAxis(vec3 axis, float angle) {
  float c = cos(angle), s = sin(angle);
  float t = 1.0 - c;
  vec3 a = normalize(axis);
  return mat3(
    t * a.x * a.x + c,       t * a.x * a.y + s * a.z, t * a.x * a.z - s * a.y,
    t * a.x * a.y - s * a.z, t * a.y * a.y + c,       t * a.y * a.z + s * a.x,
    t * a.x * a.z + s * a.y, t * a.y * a.z - s * a.x, t * a.z * a.z + c
  );
}

/**
 * Build a stable frame around a tangent without a reference up-vector flip.
 * Picks whichever world axis is least aligned with the tangent, so a curve can
 * loop through vertical without the tube suddenly twisting 180 degrees.
 */
void frameFromTangent(vec3 tangent, out vec3 nrm, out vec3 bin) {
  vec3 t = normalize(tangent);
  vec3 ref = abs(t.y) < 0.85 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  bin = normalize(cross(t, ref));
  nrm = normalize(cross(bin, t));
}

/** Map a unit cylinder (y in 0..1, radius 1) onto an arbitrary segment. */
void bondTransform(vec3 a, vec3 b, float radius, vec3 localPos, vec3 localNrm,
                   out vec3 worldPos, out vec3 worldNrm) {
  vec3 dir = b - a;
  float len = length(dir);
  vec3 t = len > 1e-6 ? dir / len : vec3(0.0, 1.0, 0.0);
  vec3 n, bi;
  frameFromTangent(t, n, bi);
  mat3 basis = mat3(bi, t, n);
  worldPos = a + basis * vec3(localPos.x * radius, localPos.y * len, localPos.z * radius);
  worldNrm = normalize(basis * vec3(localNrm.x, localNrm.y, localNrm.z));
}
`,dn=`
uniform float uRise;          // axial rise per base pair
uniform float uTwist;         // radians of twist per base pair
uniform float uRadius;        // backbone radius
uniform float uStrandOffset;  // angular offset of strand B
uniform float uBend;          // amplitude of the solution sway

/*
 * Centre of the helix axis at base pair index bp.
 *
 * The sway lives here rather than in each strand, so the axis, both backbones
 * and every base rung bend together as one molecule instead of drifting apart.
 */
vec3 helixAxisPoint(float bp) {
  float y = bp * uRise;
  vec3 p = vec3(0.0, y, 0.0);
  p.xz += uBend * vec2(sin(y * 0.9), cos(y * 0.75)) * uRadius;
  return p;
}

/* Outward radial direction from the axis toward a strand, in the pair plane. */
vec3 strandOutward(float bp, float strand) {
  float angle = bp * uTwist + strand * uStrandOffset;
  return vec3(cos(angle), 0.0, sin(angle));
}

/* Phosphate position for base pair index bp, on strand 0 or 1. */
vec3 backbonePoint(float bp, float strand) {
  return helixAxisPoint(bp) + strandOutward(bp, strand) * uRadius;
}
`,X=`
const vec3 KEY_DIR   = normalize(vec3(0.45, 0.78, 0.44));
const vec3 FILL_DIR  = normalize(vec3(-0.62, 0.18, 0.36));
const vec3 RIM_DIR   = normalize(vec3(-0.15, -0.55, -0.82));

const vec3 KEY_COLOR  = vec3(1.00, 0.96, 0.92);
const vec3 FILL_COLOR = vec3(0.28, 0.52, 0.86);
const vec3 RIM_COLOR  = vec3(0.42, 0.86, 1.00);

float fresnel(vec3 n, vec3 v, float power) {
  return pow(clamp(1.0 - dot(normalize(n), normalize(v)), 0.0, 1.0), power);
}

/** Wrapped diffuse: light bleeds past the terminator, faking translucency. */
float wrapDiffuse(vec3 n, vec3 l, float wrap) {
  return clamp((dot(n, l) + wrap) / (1.0 + wrap), 0.0, 1.0);
}

float specular(vec3 n, vec3 l, vec3 v, float roughness) {
  vec3 h = normalize(l + v);
  float a = max(roughness * roughness, 1e-3);
  float ndoth = max(dot(n, h), 0.0);
  float d = a / (3.14159265 * pow(ndoth * ndoth * (a - 1.0) + 1.0, 2.0));
  return d * 0.25;
}

vec3 shadeMolecular(vec3 albedo, vec3 N, vec3 V, float roughness, float translucency, vec3 emissive) {
  N = normalize(N);
  V = normalize(V);

  vec3 lit = vec3(0.0);
  lit += albedo * KEY_COLOR  * wrapDiffuse(N, KEY_DIR, translucency) * 0.95;
  lit += albedo * FILL_COLOR * wrapDiffuse(N, FILL_DIR, translucency) * 0.42;
  lit += albedo * RIM_COLOR  * wrapDiffuse(N, RIM_DIR, translucency) * 0.22;

  // Ambient tinted by facing direction \u2014 cool from below, warmer up top.
  vec3 ambient = mix(vec3(0.04, 0.07, 0.13), vec3(0.10, 0.14, 0.20), N.y * 0.5 + 0.5);
  lit += albedo * ambient;

  float spec = specular(N, KEY_DIR, V, roughness) * 1.6
             + specular(N, FILL_DIR, V, roughness) * 0.5;
  lit += KEY_COLOR * spec;

  float rim = fresnel(N, V, 3.2);
  lit += RIM_COLOR * rim * 0.55 * (0.4 + translucency);

  return lit + emissive;
}
`,sp=`
vec3 acesFilmic(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

vec3 linearToSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(max(c, 1e-5), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

/** Reconstruct view-space distance from a non-linear depth sample. */
float linearizeDepth(float depth, float near, float far) {
  float z = depth * 2.0 - 1.0;
  return (2.0 * near * far) / (far + near - z * (far - near));
}
`,Ot=`${$}
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;var _=class{constructor(e,n,r,o){this.gl=e;this.label=o;let i=ap(e,e.VERTEX_SHADER,n,`${o}:vertex`),s=ap(e,e.FRAGMENT_SHADER,r,`${o}:fragment`),a=e.createProgram();if(!a)throw new Error(`[${o}] createProgram failed`);if(e.attachShader(a,i),e.attachShader(a,s),e.linkProgram(a),e.deleteShader(i),e.deleteShader(s),!e.getProgramParameter(a,e.LINK_STATUS)){let c=e.getProgramInfoLog(a);throw e.deleteProgram(a),new Error(`[${o}] link failed:
${c}`)}this.program=a}gl;label;program;locations=new Map;use(){return this.gl.useProgram(this.program),this}loc(e){let n=this.locations.get(e);return n===void 0&&(n=this.gl.getUniformLocation(this.program,e),this.locations.set(e,n)),n}f(e,n){return this.gl.uniform1f(this.loc(e),n),this}i(e,n){return this.gl.uniform1i(this.loc(e),n),this}v2(e,n,r){return this.gl.uniform2f(this.loc(e),n,r),this}v3(e,n,r,o){return this.gl.uniform3f(this.loc(e),n,r,o),this}v3a(e,n){return this.gl.uniform3f(this.loc(e),n[0],n[1],n[2]),this}v4(e,n,r,o,i){return this.gl.uniform4f(this.loc(e),n,r,o,i),this}m4(e,n){return this.gl.uniformMatrix4fv(this.loc(e),!1,n),this}m3(e,n){return this.gl.uniformMatrix3fv(this.loc(e),!1,n),this}tex(e,n,r){let o=this.gl;return o.activeTexture(o.TEXTURE0+n),o.bindTexture(o.TEXTURE_2D,r),o.uniform1i(this.loc(e),n),this}dispose(){this.gl.deleteProgram(this.program),this.locations.clear()}toString(){return`Program(${this.label})`}};function ap(t,e,n,r){let o=t.createShader(e);if(!o)throw new Error(`[${r}] createShader failed`);if(t.shaderSource(o,n),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)??"";throw t.deleteShader(o),new Error(`[${r}] compile failed:
${i}

${eb(i,n)}`)}return o}function eb(t,e){let n=e.split(`
`),r=new Set;for(let a of t.matchAll(/ERROR:\s*\d+:(\d+)/g))r.add(Number(a[1]));let o=new Set;for(let a of r)for(let c=a-4;c<=a+4;c++)c>=1&&c<=n.length&&o.add(c);if(o.size===0)return n.map((a,c)=>`${cp(c+1)}| ${a}`).join(`
`);let i=[],s=0;for(let a of[...o].sort((c,l)=>c-l))a!==s+1&&i.push("    \u22EF"),i.push(`${cp(a)}|${r.has(a)?">":" "} ${n[a-1]}`),s=a;return i.join(`
`)}var cp=t=>String(t).padStart(4," ");function tl(t){let e=!!t.getExtension("EXT_color_buffer_half_float")||!!t.getExtension("EXT_color_buffer_float"),n=!!t.getExtension("OES_texture_float_linear")||e;return{halfFloat:e,halfFloatLinear:n,maxSamples:t.getParameter(t.MAX_SAMPLES)}}var yt=class{constructor(e,n,r={}){this.gl=e;this.options=r;let o=!!r.hdr&&n.halfFloat;this.internalFormat=o?e.RGBA16F:e.RGBA8,this.type=o?e.HALF_FLOAT:e.UNSIGNED_BYTE;let i=r.filter!=="nearest";this.filter=i&&(!o||n.halfFloatLinear)?e.LINEAR:e.NEAREST,this.wrap=r.wrap??e.CLAMP_TO_EDGE;let s=e.createFramebuffer(),a=e.createTexture();if(!s||!a)throw new Error("render target allocation failed");this.framebuffer=s,this.texture=a}gl;options;framebuffer;texture;depth=null;width=0;height=0;internalFormat;type;filter;wrap;resize(e,n){if(e=Math.max(1,e|0),n=Math.max(1,n|0),e===this.width&&n===this.height)return;this.width=e,this.height=n;let r=this.gl;r.bindTexture(r.TEXTURE_2D,this.texture),r.texImage2D(r.TEXTURE_2D,0,this.internalFormat,e,n,0,r.RGBA,this.type,null),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,this.filter),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,this.filter),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,this.wrap),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,this.wrap),r.bindFramebuffer(r.FRAMEBUFFER,this.framebuffer),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,this.texture,0),this.options.depth&&(this.options.depthTexture?(this.depth instanceof WebGLTexture||(this.depth&&r.deleteRenderbuffer(this.depth),this.depth=r.createTexture()),r.bindTexture(r.TEXTURE_2D,this.depth),r.texImage2D(r.TEXTURE_2D,0,r.DEPTH_COMPONENT24,e,n,0,r.DEPTH_COMPONENT,r.UNSIGNED_INT,null),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,this.depth,0)):(this.depth||(this.depth=r.createRenderbuffer()),r.bindRenderbuffer(r.RENDERBUFFER,this.depth),r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_COMPONENT24,e,n),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.RENDERBUFFER,this.depth))),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindTexture(r.TEXTURE_2D,null)}bind(){let e=this.gl;e.bindFramebuffer(e.FRAMEBUFFER,this.framebuffer),e.viewport(0,0,this.width,this.height)}dispose(){let e=this.gl;e.deleteFramebuffer(this.framebuffer),e.deleteTexture(this.texture),this.depth instanceof WebGLTexture?e.deleteTexture(this.depth):this.depth&&e.deleteRenderbuffer(this.depth),this.depth=null}};var Ni=6,tb=`${P}
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uScene;
uniform float uThreshold;
uniform float uKnee;

void main() {
  vec3 c = texture(uScene, vUv).rgb;

  // Soft knee: fade contribution in across a band around the threshold rather
  // than clipping at it, so a highlight drifting past the cutoff doesn't pop.
  float brightness = max(c.r, max(c.g, c.b));
  float soft = brightness - uThreshold + uKnee;
  soft = clamp(soft, 0.0, 2.0 * uKnee);
  soft = soft * soft / (4.0 * uKnee + 1e-5);
  float weight = max(soft, brightness - uThreshold) / max(brightness, 1e-5);

  fragColor = vec4(c * weight, 1.0);
}
`,nb=`${P}
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uTexel;

void main() {
  vec2 t = uTexel;

  vec3 a = texture(uSource, vUv + t * vec2(-2.0,  2.0)).rgb;
  vec3 b = texture(uSource, vUv + t * vec2( 0.0,  2.0)).rgb;
  vec3 c = texture(uSource, vUv + t * vec2( 2.0,  2.0)).rgb;
  vec3 d = texture(uSource, vUv + t * vec2(-2.0,  0.0)).rgb;
  vec3 e = texture(uSource, vUv).rgb;
  vec3 f = texture(uSource, vUv + t * vec2( 2.0,  0.0)).rgb;
  vec3 g = texture(uSource, vUv + t * vec2(-2.0, -2.0)).rgb;
  vec3 h = texture(uSource, vUv + t * vec2( 0.0, -2.0)).rgb;
  vec3 i = texture(uSource, vUv + t * vec2( 2.0, -2.0)).rgb;
  vec3 j = texture(uSource, vUv + t * vec2(-1.0,  1.0)).rgb;
  vec3 k = texture(uSource, vUv + t * vec2( 1.0,  1.0)).rgb;
  vec3 l = texture(uSource, vUv + t * vec2(-1.0, -1.0)).rgb;
  vec3 m = texture(uSource, vUv + t * vec2( 1.0, -1.0)).rgb;

  vec3 result = e * 0.125;
  result += (a + c + g + i) * 0.03125;
  result += (b + d + f + h) * 0.0625;
  result += (j + k + l + m) * 0.125;

  fragColor = vec4(result, 1.0);
}
`,rb=`${P}
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uRadius;

void main() {
  vec2 t = uTexel * uRadius;

  vec3 a = texture(uSource, vUv + t * vec2(-1.0,  1.0)).rgb;
  vec3 b = texture(uSource, vUv + t * vec2( 0.0,  1.0)).rgb;
  vec3 c = texture(uSource, vUv + t * vec2( 1.0,  1.0)).rgb;
  vec3 d = texture(uSource, vUv + t * vec2(-1.0,  0.0)).rgb;
  vec3 e = texture(uSource, vUv).rgb;
  vec3 f = texture(uSource, vUv + t * vec2( 1.0,  0.0)).rgb;
  vec3 g = texture(uSource, vUv + t * vec2(-1.0, -1.0)).rgb;
  vec3 h = texture(uSource, vUv + t * vec2( 0.0, -1.0)).rgb;
  vec3 i = texture(uSource, vUv + t * vec2( 1.0, -1.0)).rgb;

  vec3 result = e * 4.0;
  result += (b + d + f + h) * 2.0;
  result += (a + c + g + i);
  fragColor = vec4(result / 16.0, 1.0);
}
`,ob=`${P}
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uDirection;

void main() {
  // 9-tap gaussian collapsed to 5 texture fetches using linear-filter tricks.
  const float o1 = 1.3846153846;
  const float o2 = 3.2307692308;
  const float w0 = 0.2270270270;
  const float w1 = 0.3162162162;
  const float w2 = 0.0702702703;

  vec3 result = texture(uSource, vUv).rgb * w0;
  result += texture(uSource, vUv + uDirection * o1).rgb * w1;
  result += texture(uSource, vUv - uDirection * o1).rgb * w1;
  result += texture(uSource, vUv + uDirection * o2).rgb * w2;
  result += texture(uSource, vUv - uDirection * o2).rgb * w2;

  fragColor = vec4(result, 1.0);
}
`,ib=`${P}
${Gr}
${sp}

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform sampler2D uBlurred;
uniform sampler2D uDepth;

uniform float uTime;
uniform float uBloomIntensity;
uniform float uExposure;
uniform float uAberration;
uniform float uVignette;
uniform float uGrain;
uniform float uFocusDistance;
uniform float uAperture;
uniform float uNear;
uniform float uFar;
uniform vec2 uResolution;

void main() {
  vec2 uv = vUv;
  vec2 centred = uv - 0.5;
  float r2 = dot(centred, centred);

  // Circle of confusion from linear view depth. Sky/background (depth 1) is
  // pinned to full blur rather than being treated as an object at the far plane.
  float rawDepth = texture(uDepth, uv).r;
  float viewZ = linearizeDepth(rawDepth, uNear, uFar);
  float coc = clamp(abs(viewZ - uFocusDistance) / max(uAperture, 1e-3), 0.0, 1.0);
  coc = rawDepth >= 0.9999 ? max(coc, 0.55) : coc;
  coc = smoothstep(0.0, 1.0, coc);

  // Lateral chromatic aberration: the offset grows with radius, so the centre
  // of frame \u2014 where the subject is \u2014 stays clean.
  vec2 ca = centred * uAberration * (0.35 + r2);

  vec3 sharp;
  sharp.r = texture(uScene, uv + ca).r;
  sharp.g = texture(uScene, uv).g;
  sharp.b = texture(uScene, uv - ca).b;

  vec3 soft;
  soft.r = texture(uBlurred, uv + ca).r;
  soft.g = texture(uBlurred, uv).g;
  soft.b = texture(uBlurred, uv - ca).b;

  vec3 color = mix(sharp, soft, coc);
  color += texture(uBloom, uv).rgb * uBloomIntensity;

  color *= uExposure;
  color = acesFilmic(color);

  float vignette = 1.0 - smoothstep(0.18, 0.95, r2 * 2.0);
  color *= mix(1.0, vignette, uVignette);

  // Grain in sRGB space, scaled down in highlights so it reads as sensor noise
  // rather than dirt on the lens.
  float grain = hash13(vec3(gl_FragCoord.xy, uTime * 60.0)) - 0.5;
  color = linearToSrgb(color);
  color += grain * uGrain * (1.0 - dot(color, vec3(0.2126, 0.7152, 0.0722)) * 0.7);

  fragColor = vec4(color, 1.0);
}
`,Wr=class{constructor(e,n){this.gl=e;this.prefilter=new _(e,Ot,tb,"post:prefilter"),this.downsample=new _(e,Ot,nb,"post:downsample"),this.upsample=new _(e,Ot,rb,"post:upsample"),this.blur=new _(e,Ot,ob,"post:blur"),this.composite=new _(e,Ot,ib,"post:composite");for(let r=0;r<Ni;r++)this.mips.push(new yt(e,n,{hdr:!0,filter:"linear"}));this.blurA=new yt(e,n,{hdr:!0,filter:"linear"}),this.blurB=new yt(e,n,{hdr:!0,filter:"linear"})}gl;prefilter;downsample;upsample;blur;composite;mips=[];blurA;blurB;width=1;height=1;resize(e,n){this.width=e,this.height=n;for(let r=0;r<Ni;r++){let o=2<<r;this.mips[r].resize(Math.max(1,Math.floor(e/o)),Math.max(1,Math.floor(n/o)))}this.blurA.resize(Math.max(1,e>>1),Math.max(1,n>>1)),this.blurB.resize(Math.max(1,e>>1),Math.max(1,n>>1))}render(e,n){let r=this.gl;r.disable(r.DEPTH_TEST),r.disable(r.BLEND),r.depthMask(!1),this.mips[0].bind(),this.prefilter.use().f("uThreshold",n.bloomThreshold).f("uKnee",.55).tex("uScene",0,e.texture),Lt(r);for(let i=1;i<Ni;i++){let s=this.mips[i-1];this.mips[i].bind(),this.downsample.use().v2("uTexel",1/s.width,1/s.height).tex("uSource",0,s.texture),Lt(r)}r.enable(r.BLEND),r.blendFunc(r.ONE,r.ONE);for(let i=Ni-1;i>0;i--){let s=this.mips[i];this.mips[i-1].bind(),this.upsample.use().v2("uTexel",1/s.width,1/s.height).f("uRadius",1).tex("uSource",0,s.texture),Lt(r)}r.disable(r.BLEND),this.blurA.bind(),this.blur.use().v2("uDirection",1/this.blurA.width,0).tex("uSource",0,e.texture),Lt(r),this.blurB.bind(),this.blur.use().v2("uDirection",0,1/this.blurB.height).tex("uSource",0,this.blurA.texture),Lt(r),r.bindFramebuffer(r.FRAMEBUFFER,null),r.viewport(0,0,this.width,this.height),this.composite.use().f("uTime",n.time).f("uBloomIntensity",n.bloomIntensity).f("uExposure",n.exposure).f("uAberration",n.aberration).f("uVignette",n.vignette).f("uGrain",n.grain).f("uFocusDistance",n.focusDistance).f("uAperture",n.aperture).f("uNear",n.near).f("uFar",n.far).v2("uResolution",this.width,this.height).tex("uScene",0,e.texture).tex("uBloom",1,this.mips[0].texture).tex("uBlurred",2,this.blurB.texture).tex("uDepth",3,e.depth instanceof WebGLTexture?e.depth:null),Lt(r),r.depthMask(!0),r.enable(r.DEPTH_TEST)}dispose(){this.prefilter.dispose(),this.downsample.dispose(),this.upsample.dispose(),this.blur.dispose(),this.composite.dispose();for(let e of this.mips)e.dispose();this.blurA.dispose(),this.blurB.dispose()}};function Lt(t){t.drawArrays(t.TRIANGLES,0,3)}var Ai=class{constructor(e,n,r={}){this.canvas=e;this.stages=n;this.callbacks=r;let o=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!0,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1,desynchronized:!0});if(!o)throw new Error("WebGL2 is not available in this browser.");this.gl=o,this.caps=tl(o),this.sceneTarget=new yt(o,this.caps,{hdr:!0,depth:!0,depthTexture:!0,filter:"linear"}),this.post=new Wr(o,this.caps),e.addEventListener("webglcontextlost",this.handleContextLost),e.addEventListener("webglcontextrestored",this.handleContextRestored)}canvas;stages;callbacks;gl;caps;camera=new _i;post;sceneTarget;initialised=new Set;rafHandle=0;running=!1;lastFrameTime=0;elapsed=0;targetProgress=0;smoothProgress=0;pointerX=0;pointerY=0;smoothPointerX=0;smoothPointerY=0;dpr=0;maxDpr=2;width=1;height=1;quality=1;frameMs=16.7;statsTimer=0;currentStage=-1;focusDistance=6;aperture=9;contextLost=!1;get stageCount(){return this.stages.length}get progress(){return this.smoothProgress}setProgress(e){this.targetProgress=Fe(e,0,1)}snapProgress(e){this.targetProgress=Fe(e,0,1),this.smoothProgress=this.targetProgress}setPointer(e,n){this.pointerX=Fe(e,-1,1),this.pointerY=Fe(n,-1,1)}resize(e,n,r){this.maxDpr=Fe(r,1,2),this.dpr=this.dpr===0?this.maxDpr:Math.min(this.dpr,this.maxDpr),this.applySize(e,n)}cssWidth=1;cssHeight=1;applySize(e,n){this.cssWidth=Math.max(1,e),this.cssHeight=Math.max(1,n);let r=Math.max(1,Math.round(this.cssWidth*this.dpr)),o=Math.max(1,Math.round(this.cssHeight*this.dpr));r===this.width&&o===this.height||(this.width=r,this.height=o,this.canvas.width=r,this.canvas.height=o,this.sceneTarget.resize(r,o),this.post.resize(r,o))}start(){this.running||(this.running=!0,this.lastFrameTime=performance.now(),this.rafHandle=requestAnimationFrame(this.frame))}stop(){this.running=!1,this.rafHandle&&cancelAnimationFrame(this.rafHandle),this.rafHandle=0}dispose(){this.stop(),this.canvas.removeEventListener("webglcontextlost",this.handleContextLost),this.canvas.removeEventListener("webglcontextrestored",this.handleContextRestored);for(let e of this.initialised)e.dispose();this.initialised.clear(),this.post.dispose(),this.sceneTarget.dispose()}handleContextLost=e=>{e.preventDefault(),this.contextLost=!0,this.stop(),this.initialised.clear(),this.callbacks.onContextLost?.()};handleContextRestored=()=>{this.contextLost=!1,this.post.dispose(),this.sceneTarget.dispose(),this.caps=tl(this.gl),this.sceneTarget=new yt(this.gl,this.caps,{hdr:!0,depth:!0,depthTexture:!0,filter:"linear"}),this.post=new Wr(this.gl,this.caps),this.width=0,this.height=0,this.applySize(this.cssWidth,this.cssHeight),this.callbacks.onContextRestored?.(),this.start()};frame=e=>{if(!this.running||this.contextLost)return;this.rafHandle=requestAnimationFrame(this.frame);let n=(e-this.lastFrameTime)/1e3;this.lastFrameTime=e;let r=Fe(n,5e-4,.05);this.elapsed+=r,this.trackPerformance(n*1e3,r),this.render(r)};trackPerformance(e,n){this.frameMs=gt(this.frameMs,Fe(e,1,100),.08),this.frameMs>24?(this.quality=Math.max(.45,this.quality-n*.6),this.quality<=.5&&this.dpr>1&&(this.dpr=Math.max(1,this.dpr-n*.5),this.applySize(this.cssWidth,this.cssHeight))):this.frameMs<14&&(this.quality=Math.min(1,this.quality+n*.25),this.quality>=.99&&this.dpr<this.maxDpr&&(this.dpr=Math.min(this.maxDpr,this.dpr+n*.2),this.applySize(this.cssWidth,this.cssHeight))),this.statsTimer+=n,this.statsTimer>.4&&(this.statsTimer=0,this.callbacks.onStats?.(1e3/Math.max(this.frameMs,.001),this.quality))}render(e){let n=this.gl;this.smoothProgress=vt(this.smoothProgress,this.targetProgress,4.2,e),this.smoothPointerX=vt(this.smoothPointerX,this.pointerX,6,e),this.smoothPointerY=vt(this.smoothPointerY,this.pointerY,6,e),this.camera.update(this.width/this.height,this.smoothPointerX,this.smoothPointerY,this.elapsed,e);let r=this.stages.length,o=this.smoothProgress*r,i=Fe(Math.floor(o),0,r-1);i!==this.currentStage&&(this.currentStage=i,this.callbacks.onStageChange?.(i)),this.callbacks.onProgress?.(this.smoothProgress),this.sceneTarget.bind(),n.clearColor(.006,.011,.024,1),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT);let s=0,a=0,c=0;for(let l=r-1;l>=0;l--){let u=this.stages[l],d=o-l;if(d<-.5||d>1.55)continue;let f=l===0?1:me(-.45,-.02,d),p=l===r-1?1:1-me(1.02,1.5,d),h=f*p;if(h<=.002)continue;this.initialised.has(u)||(u.init(n),this.initialised.add(u));let m={gl:n,camera:this.camera,time:this.elapsed,dt:e,local:d,alpha:h,progress:this.smoothProgress,pointerX:this.smoothPointerX,pointerY:this.smoothPointerY,quality:this.quality,width:this.width,height:this.height};this.resetDrawState(),n.clear(n.DEPTH_BUFFER_BIT),u.update(m),u.render(m);let v=u.focus?.(m);v&&(s+=v.distance*h,a+=v.aperture*h,c+=h)}c>.001&&(this.focusDistance=vt(this.focusDistance,s/c,5,e),this.aperture=vt(this.aperture,a/c,5,e)),this.resetDrawState(),this.post.render(this.sceneTarget,{time:this.elapsed,exposure:.92,bloomIntensity:.46,bloomThreshold:.88,aberration:.0022,vignette:.65,grain:.028,focusDistance:this.focusDistance,aperture:this.aperture,near:this.camera.near,far:this.camera.far})}resetDrawState(){let e=this.gl;e.viewport(0,0,this.width,this.height),e.enable(e.DEPTH_TEST),e.depthFunc(e.LEQUAL),e.depthMask(!0),e.enable(e.BLEND),e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA),e.enable(e.CULL_FACE),e.cullFace(e.BACK)}};function $n(t,e,n,r){let o=e[0]-t[0],i=e[1]-t[1],s=Math.hypot(o,i),a=s/2/Math.tan(Math.PI/n),c=r?-1:1,l=-i/s*c,u=o/s*c,d=(t[0]+e[0])/2+l*a,f=(t[1]+e[1])/2+u*a,p=Math.hypot(t[0]-d,t[1]-f),h=Math.atan2(t[1]-f,t[0]-d),m=Math.atan2(e[1]-f,e[0]-d)-h;for(;m>Math.PI;)m-=Math.PI*2;for(;m<-Math.PI;)m+=Math.PI*2;let v=Math.sign(m)*(Math.PI*2/n),y=[];for(let D=0;D<n;D++)y.push([d+p*Math.cos(h+v*D),f+p*Math.sin(h+v*D)]);return y}function qr(t){let e=0,n=0;for(let r of t)e+=r[0],n+=r[1];return[e/t.length,n/t.length]}function Ft(t,e,n){let r=t[0]-e[0],o=t[1]-e[1],i=Math.hypot(r,o)||1;return[t[0]+r/i*n,t[1]+o/i*n]}function sb(){let t=[1.39*Math.cos(-Math.PI/3),1.39*Math.sin(-Math.PI/3)];return $n([0,0],t,6,!1)}function ab(){let t=[1.39*Math.cos(-Math.PI*.4),1.39*Math.sin(-Math.PI*.4)],e=$n([0,0],t,5,!1),n=e[2],r=e[3],o=e[4],i=qr(e),s=$n(o,r,6,!1);return lp(qr(s),i)<lp(qr($n(o,r,6,!0)),i)&&(s=$n(o,r,6,!0)),[e[0],e[1],n,r,o,s[2],s[3],s[4],s[5]]}function lp(t,e){return Math.hypot(t[0]-e[0],t[1]-e[1])}function cb(t){let e=[Math.cos(t)*1.47,Math.sin(t)*1.47],n=[e[0]+Math.cos(t-1.2)*1.53,e[1]+Math.sin(t-1.2)*1.53],r=$n(e,n,5,!1),o=["C1'","C2'","C3'","C4'","O4'"],i=["C","C","C","C","O"];return{atoms:r.map((c,l)=>({x:c[0],y:c[1],element:i[l],name:o[l]})),bonds:[[0,1],[1,2],[2,3],[3,4],[4,0]]}}function up(t){let e=[],n=[],r=[],o=(l,u,d)=>(e.push({x:l[0],y:l[1],element:u,name:d}),e.length-1);if(t==="A"||t==="G"){let l=ab(),u=["N9","C8","N7","C5","C4","C6","N1","C2","N3"],d=["N","C","N","C","C","C","N","C","N"],f={};l.forEach((h,m)=>{f[u[m]]=o(h,d[m],u[m])});for(let[h,m]of[["N9","C8"],["C8","N7"],["N7","C5"],["C5","C4"],["C4","N9"],["C5","C6"],["C6","N1"],["N1","C2"],["C2","N3"],["N3","C4"]])n.push([f[h],f[m]]);let p=qr(l);if(t==="A"){let h=o(Ft(l[5],p,1.28),"N","N6");n.push([f.C6,h]),r.push(h,f.N1)}else{let h=o(Ft(l[5],p,1.28),"O","O6"),m=o(Ft(l[7],p,1.28),"N","N2");n.push([f.C6,h],[f.C2,m]),r.push(h,f.N1,m)}}else{let l=sb(),u=["N1","C2","N3","C4","C5","C6"],d=["N","C","N","C","C","C"],f={};l.forEach((h,m)=>{f[u[m]]=o(h,d[m],u[m])});for(let h=0;h<6;h++)n.push([h,(h+1)%6]);let p=qr(l);if(t==="T"){let h=o(Ft(l[3],p,1.28),"O","O4"),m=o(Ft(l[1],p,1.28),"O","O2"),v=o(Ft(l[4],p,1.5),"C","C7");n.push([f.C4,h],[f.C2,m],[f.C5,v]),r.push(h,f.N3)}else{let h=o(Ft(l[3],p,1.28),"N","N4"),m=o(Ft(l[1],p,1.28),"O","O2");n.push([f.C4,h],[f.C2,m]),r.push(h,f.N3,m)}}let{atoms:s,bonds:a}=cb(Math.PI),c=e.length;e.push(...s);for(let[l,u]of a)n.push([c+l,c+u]);return n.push([0,c]),{atoms:e,bonds:n,hbondAtoms:r,glycosidic:0}}function dp(t,e){let n=up(t),r=up(e),o=p=>p.hbondAtoms.reduce((h,m)=>h+p.atoms[m].x,0)/p.hbondAtoms.length,i=10.5/2,s=i-2.9/2-o(n),a=i+2.9/2+o(r),c=[],l=[];for(let p of n.atoms)c.push(oe(te({},p),{x:p.x+s,strand:0}));for(let[p,h]of n.bonds)l.push([p,h]);let u=c.length;for(let p of r.atoms)c.push(oe(te({},p),{x:a-p.x,y:-p.y,strand:1}));for(let[p,h]of r.bonds)l.push([u+p,u+h]);let d=[],f=Math.min(n.hbondAtoms.length,r.hbondAtoms.length);for(let p=0;p<f;p++)d.push([n.hbondAtoms[p],u+r.hbondAtoms[p]]);return{atoms:c,bonds:l,hbonds:d,senseBase:t,antiBase:e}}var lb={F:"TTC",L:"CTG",I:"ATC",M:"ATG",V:"GTG",S:"AGC",P:"CCC",T:"ACC",A:"GCC",Y:"TAC",H:"CAC",Q:"CAG",N:"AAC",K:"AAG",D:"GAC",E:"GAG",C:"TGC",W:"TGG",R:"CGG",G:"GGC","*":"TGA"},fp={A:{code:"A",abbr:"Ala",name:"Alanine",cls:"hydrophobic",hydropathy:1.8},R:{code:"R",abbr:"Arg",name:"Arginine",cls:"positive",hydropathy:-4.5},N:{code:"N",abbr:"Asn",name:"Asparagine",cls:"polar",hydropathy:-3.5},D:{code:"D",abbr:"Asp",name:"Aspartate",cls:"negative",hydropathy:-3.5},C:{code:"C",abbr:"Cys",name:"Cysteine",cls:"polar",hydropathy:2.5},Q:{code:"Q",abbr:"Gln",name:"Glutamine",cls:"polar",hydropathy:-3.5},E:{code:"E",abbr:"Glu",name:"Glutamate",cls:"negative",hydropathy:-3.5},G:{code:"G",abbr:"Gly",name:"Glycine",cls:"special",hydropathy:-.4},H:{code:"H",abbr:"His",name:"Histidine",cls:"positive",hydropathy:-3.2},I:{code:"I",abbr:"Ile",name:"Isoleucine",cls:"hydrophobic",hydropathy:4.5},L:{code:"L",abbr:"Leu",name:"Leucine",cls:"hydrophobic",hydropathy:3.8},K:{code:"K",abbr:"Lys",name:"Lysine",cls:"positive",hydropathy:-3.9},M:{code:"M",abbr:"Met",name:"Methionine",cls:"hydrophobic",hydropathy:1.9},F:{code:"F",abbr:"Phe",name:"Phenylalanine",cls:"hydrophobic",hydropathy:2.8},P:{code:"P",abbr:"Pro",name:"Proline",cls:"special",hydropathy:-1.6},S:{code:"S",abbr:"Ser",name:"Serine",cls:"polar",hydropathy:-.8},T:{code:"T",abbr:"Thr",name:"Threonine",cls:"polar",hydropathy:-.7},W:{code:"W",abbr:"Trp",name:"Tryptophan",cls:"hydrophobic",hydropathy:-.9},Y:{code:"Y",abbr:"Tyr",name:"Tyrosine",cls:"polar",hydropathy:-1.3},V:{code:"V",abbr:"Val",name:"Valine",cls:"hydrophobic",hydropathy:4.2}},Vt="MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGP",pp=[18,22,25];function zn(t){switch(t){case"A":return"T";case"T":return"A";case"U":return"A";case"G":return"C";case"C":return"G"}}function ub(t){let e="";for(let n of t)e+=lb[n]??"NNN";return e}var Te=ub(Vt),hp=Array.from({length:Vt.length},(t,e)=>({codon:Te.slice(e*3,e*3+3),residue:Vt[e]})),bt={A:[1,.66,.24],T:[1,.34,.47],G:[.28,1,.62],C:[.32,.68,1],U:[.86,.45,1]},mp={hydrophobic:[1,.74,.36],polar:[.52,.92,.98],positive:[.44,.62,1],negative:[1,.42,.52],special:[.74,.78,.86]},fn={C:[.62,.66,.72],N:[.36,.55,1],O:[1,.36,.38],P:[1,.62,.22],H:[.9,.94,1]},ge={rise:3.4,bpPerTurn:10.5,backboneRadius:10,strandOffset:3.93},pn=Math.PI*2/ge.bpPerTurn;var db=`${P}
${Ve}

in vec2 vUv;
out vec4 fragColor;

uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uGlow;
uniform float uTime;
uniform float uAlpha;
uniform float uDensity;
uniform float uAspect;
uniform vec2 uGlowPos;

void main() {
  vec2 uv = vUv;
  vec3 base = mix(uBottom, uTop, smoothstep(0.0, 1.0, uv.y));

  // Two noise layers drifting at different rates: the slow one gives large
  // soft masses, the fast one keeps the field from ever looking static.
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
  float slow = fbm(vec3(p * 1.6, uTime * 0.014), 4);
  float fast = fbm(vec3(p * 4.1 + 11.3, uTime * 0.041), 3);
  float cloud = smoothstep(-0.35, 0.75, slow * 0.75 + fast * 0.25);

  // These coefficients are deliberately small. ACES plus the sRGB transfer
  // lift dark values hard on the way to the screen \u2014 a linear 0.4 here comes
  // out around sRGB 0.76 \u2014 so a backdrop that looks conservative in linear
  // space still reads as a bright wash, and overlay text dies on it.
  base += uGlow * cloud * uDensity * 0.15;

  // A soft off-centre light source so the frame has a direction.
  float d = length((p - uGlowPos) * vec2(1.0, 1.25));
  base += uGlow * exp(-d * 2.4) * 0.09;

  // Keep the corners dark; the graded vignette later reinforces this.
  base *= 1.0 - 0.35 * smoothstep(0.25, 0.95, length(p) * 1.35);

  fragColor = vec4(base, uAlpha);
}
`,K=class{program=null;init(e){this.program?.dispose(),this.program=new _(e,Ot,db,"backdrop")}render(e,n,r,o,i){this.program&&(e.disable(e.DEPTH_TEST),e.depthMask(!1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),this.program.use().v3a("uTop",n.top).v3a("uBottom",n.bottom).v3a("uGlow",n.glow).f("uDensity",n.density).v2("uGlowPos",n.glowX,n.glowY).f("uTime",r).f("uAlpha",o).f("uAspect",i),Lt(e),e.enable(e.DEPTH_TEST),e.depthMask(!0))}dispose(){this.program?.dispose(),this.program=null}};function Yr(t,e){return e>65535?new Uint32Array(t):new Uint16Array(t)}function ot(t=2){let e=(1+Math.sqrt(5))/2,n=[[-1,e,0],[1,e,0],[-1,-e,0],[1,-e,0],[0,-1,e],[0,1,e],[0,-1,-e],[0,1,-e],[e,0,-1],[e,0,1],[-e,0,-1],[-e,0,1]].map(gp),r=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]],o=new Map,i=(a,c)=>{let l=a<c?a*100003+c:c*100003+a,u=o.get(l);if(u!==void 0)return u;let d=n[a],f=n[c];n.push(gp([d[0]+f[0],d[1]+f[1],d[2]+f[2]]));let p=n.length-1;return o.set(l,p),p};for(let a=0;a<t;a++){let c=[];for(let[l,u,d]of r){let f=i(l,u),p=i(u,d),h=i(d,l);c.push([l,f,h],[u,p,f],[d,h,p],[f,p,h])}r=c}let s=new Float32Array(n.length*3);for(let a=0;a<n.length;a++)s[a*3]=n[a][0],s[a*3+1]=n[a][1],s[a*3+2]=n[a][2];return{positions:s,normals:s.slice(),indices:Yr(r.flat(),n.length)}}function vp(t=12,e=!1){let n=[],r=[],o=[];for(let s=0;s<=1;s++)for(let a=0;a<=t;a++){let c=a/t*Math.PI*2,l=Math.cos(c),u=Math.sin(c);n.push(l,s,u),r.push(l,0,u)}let i=t+1;for(let s=0;s<t;s++){let a=s,c=s+1,l=s+i,u=s+i+1;o.push(a,l,c,c,l,u)}if(e)for(let s=0;s<=1;s++){let a=n.length/3;n.push(0,s,0),r.push(0,s===0?-1:1,0);let c=n.length/3;for(let l=0;l<=t;l++){let u=l/t*Math.PI*2;n.push(Math.cos(u),s,Math.sin(u)),r.push(0,s===0?-1:1,0)}for(let l=0;l<t;l++)s===0?o.push(a,c+l+1,c+l):o.push(a,c+l,c+l+1)}return{positions:new Float32Array(n),normals:new Float32Array(r),indices:Yr(o,n.length/3)}}function hn(t,e){let n=[],r=[];for(let s=0;s<=t;s++){let a=s/t;for(let c=0;c<=e;c++)n.push(a,c/e*Math.PI*2)}let o=e+1;for(let s=0;s<t;s++)for(let a=0;a<e;a++){let c=s*o+a,l=c+1,u=c+o,d=u+1;r.push(c,l,u,l,d,u)}let i=n.length/2;return{positions:new Float32Array(0),normals:new Float32Array(0),params:new Float32Array(n),indices:Yr(r,i)}}function yp(t=1,e=.25,n=32,r=10){let o=[],i=[],s=[];for(let c=0;c<=n;c++){let l=c/n*Math.PI*2,u=Math.cos(l),d=Math.sin(l);for(let f=0;f<=r;f++){let p=f/r*Math.PI*2,h=Math.cos(p),m=Math.sin(p);o.push((t+e*h)*u,e*m,(t+e*h)*d),i.push(h*u,m,h*d)}}let a=r+1;for(let c=0;c<n;c++)for(let l=0;l<r;l++){let u=c*a+l,d=u+1,f=u+a,p=f+1;s.push(u,d,f,d,p,f)}return{positions:new Float32Array(o),normals:new Float32Array(i),indices:Yr(s,o.length/3)}}function Ri(){let t=[],e=[],n=[],r=[[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]],[[1,0,0],[0,0,-1],[0,1,0]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[1,0,0],[0,0,-1]],[[0,-1,0],[1,0,0],[0,0,1]]];for(let[o,i,s]of r){let a=t.length/3;for(let[c,l]of[[-1,-1],[1,-1],[1,1],[-1,1]])t.push((o[0]+c*i[0]+l*s[0])*.5,(o[1]+c*i[1]+l*s[1])*.5,(o[2]+c*i[2]+l*s[2])*.5),e.push(o[0],o[1],o[2]);n.push(a,a+1,a+2,a,a+2,a+3)}return{positions:new Float32Array(t),normals:new Float32Array(e),indices:Yr(n,t.length/3)}}function gp(t){let e=Math.hypot(t[0],t[1],t[2])||1;return[t[0]/e,t[1]/e,t[2]/e]}var U=class t{constructor(e){this.gl=e;let n=e.createVertexArray();if(!n)throw new Error("createVertexArray failed");this.vao=n,this.indexType=e.UNSIGNED_SHORT}gl;vao;attributes=new Map;indexBuffer=null;indexCount=0;indexType;static fromData(e,n,r){let o=new t(e);return r.position!==void 0&&n.positions.length&&o.attribute("position",r.position,n.positions,3),r.normal!==void 0&&n.normals.length&&o.attribute("normal",r.normal,n.normals,3),r.param!==void 0&&n.params?.length&&o.attribute("param",r.param,n.params,2),o.indices(n.indices),o}attribute(e,n,r,o,i=0,s){let a=this.gl;a.bindVertexArray(this.vao);let c=this.attributes.get(e);if(!c){let l=a.createBuffer();if(!l)throw new Error(`createBuffer failed for attribute "${e}"`);c={buffer:l,location:n,size:o,divisor:i,capacity:0},this.attributes.set(e,c)}return a.bindBuffer(a.ARRAY_BUFFER,c.buffer),a.bufferData(a.ARRAY_BUFFER,r,s??(i?a.DYNAMIC_DRAW:a.STATIC_DRAW)),c.capacity=r.length,a.enableVertexAttribArray(n),a.vertexAttribPointer(n,o,a.FLOAT,!1,0,0),a.vertexAttribDivisor(n,i),a.bindVertexArray(null),this}update(e,n){let r=this.attributes.get(e);if(!r)throw new Error(`unknown attribute "${e}"`);let o=this.gl;return o.bindBuffer(o.ARRAY_BUFFER,r.buffer),n.length<=r.capacity?o.bufferSubData(o.ARRAY_BUFFER,0,n):(o.bufferData(o.ARRAY_BUFFER,n,o.DYNAMIC_DRAW),r.capacity=n.length),this}indices(e){let n=this.gl;if(n.bindVertexArray(this.vao),!this.indexBuffer&&(this.indexBuffer=n.createBuffer(),!this.indexBuffer))throw new Error("createBuffer failed for indices");return n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,this.indexBuffer),n.bufferData(n.ELEMENT_ARRAY_BUFFER,e,n.STATIC_DRAW),this.indexCount=e.length,this.indexType=e instanceof Uint32Array?n.UNSIGNED_INT:n.UNSIGNED_SHORT,n.bindVertexArray(null),this}draw(e=0){if(this.indexCount===0||e<0)return;let n=this.gl;n.bindVertexArray(this.vao),e===0?n.drawElements(n.TRIANGLES,this.indexCount,this.indexType,0):n.drawElementsInstanced(n.TRIANGLES,this.indexCount,this.indexType,0,e),n.bindVertexArray(null)}dispose(){let e=this.gl;for(let{buffer:n}of this.attributes.values())e.deleteBuffer(n);this.attributes.clear(),this.indexBuffer&&e.deleteBuffer(this.indexBuffer),e.deleteVertexArray(this.vao)}},g={position:0,normal:1,param:2,instance0:3,instance1:4,instance2:5,instance3:6};var ve=8,fe=12,fb=`${$}
layout(location = ${g.position}) in vec3 aPosition;
layout(location = ${g.instance0}) in vec4 aSphere;
layout(location = ${g.instance1}) in vec4 aColor;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;

out vec3 vNormal;
out vec3 vView;
out vec3 vColor;
out float vGlow;

void main() {
  vec3 local = aSphere.xyz + aPosition * aSphere.w;
  vec4 world = uModel * vec4(local, 1.0);

  // uModel is always translation + uniform scale here, so the linear part can
  // transform the normal directly without an inverse-transpose.
  vNormal = normalize(mat3(uModel) * aPosition);
  vView = uCameraPos - world.xyz;
  vColor = aColor.rgb;
  vGlow = aColor.w;

  gl_Position = uViewProjection * world;
}
`,pb=`${P}
${X}

in vec3 vNormal;
in vec3 vView;
in vec3 vColor;
in float vGlow;

out vec4 fragColor;

uniform float uAlpha;
uniform float uRoughness;
uniform float uTranslucency;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  vec3 lit = shadeMolecular(vColor, N, V, uRoughness, uTranslucency, vColor * vGlow);
  fragColor = vec4(lit, uAlpha);
}
`,hb=`${$}
${Qe}

layout(location = ${g.position}) in vec3 aPosition;
layout(location = ${g.normal}) in vec3 aNormal;
layout(location = ${g.instance0}) in vec4 aStart;
layout(location = ${g.instance1}) in vec4 aEnd;
layout(location = ${g.instance2}) in vec4 aColor;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;

out vec3 vNormal;
out vec3 vView;
out vec3 vColor;
out float vGlow;
out float vAlpha;

void main() {
  vec3 localPos, localNrm;
  bondTransform(aStart.xyz, aEnd.xyz, aStart.w, aPosition, aNormal, localPos, localNrm);

  vec4 world = uModel * vec4(localPos, 1.0);
  vNormal = normalize(mat3(uModel) * localNrm);
  vView = uCameraPos - world.xyz;
  vColor = aColor.rgb;
  vGlow = aEnd.w;
  vAlpha = aColor.w;

  gl_Position = uViewProjection * world;
}
`,mb=`${P}
${X}

in vec3 vNormal;
in vec3 vView;
in vec3 vColor;
in float vGlow;
in float vAlpha;

out vec4 fragColor;

uniform float uAlpha;
uniform float uRoughness;
uniform float uTranslucency;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  vec3 lit = shadeMolecular(vColor, N, V, uRoughness, uTranslucency, vColor * vGlow);
  fragColor = vec4(lit, uAlpha * vAlpha);
}
`,Ce=class{constructor(e=2){this.subdivisions=e}subdivisions;program=null;mesh=null;count=0;init(e){this.dispose(),this.program=new _(e,fb,pb,"molecule:atoms"),this.mesh=U.fromData(e,ot(this.subdivisions),{position:g.position}),this.mesh.attribute("sphere",g.instance0,new Float32Array(4),4,1),this.mesh.attribute("color",g.instance1,new Float32Array(4),4,1),this.count=0}spheres=new Float32Array(0);colors=new Float32Array(0);upload(e,n){if(!this.mesh)return;let r=n*4>this.spheres.length;r&&(this.spheres=new Float32Array(n*4),this.colors=new Float32Array(n*4));let o=this.spheres,i=this.colors;for(let s=0;s<n;s++){let a=s*ve;o[s*4]=e[a],o[s*4+1]=e[a+1],o[s*4+2]=e[a+2],o[s*4+3]=e[a+3],i[s*4]=e[a+4],i[s*4+1]=e[a+5],i[s*4+2]=e[a+6],i[s*4+3]=e[a+7]}r||this.count===0?(this.mesh.attribute("sphere",g.instance0,o,4,1),this.mesh.attribute("color",g.instance1,i,4,1)):(this.mesh.update("sphere",o),this.mesh.update("color",i)),this.count=n}draw(e,n,r,o={}){!this.program||!this.mesh||this.count===0||(this.program.use().m4("uModel",n).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",r).f("uRoughness",o.roughness??.34).f("uTranslucency",o.translucency??.35),this.mesh.draw(this.count))}dispose(){this.program?.dispose(),this.program=null,this.mesh?.dispose(),this.mesh=null,this.count=0}},ye=class{constructor(e=8){this.radialSegments=e}radialSegments;program=null;mesh=null;count=0;init(e){this.dispose(),this.program=new _(e,hb,mb,"molecule:bonds"),this.mesh=U.fromData(e,vp(this.radialSegments,!1),{position:g.position,normal:g.normal}),this.mesh.attribute("start",g.instance0,new Float32Array(4),4,1),this.mesh.attribute("end",g.instance1,new Float32Array(4),4,1),this.mesh.attribute("color",g.instance2,new Float32Array(4),4,1),this.count=0}starts=new Float32Array(0);ends=new Float32Array(0);colors=new Float32Array(0);upload(e,n){if(!this.mesh)return;let r=n*4>this.starts.length;r&&(this.starts=new Float32Array(n*4),this.ends=new Float32Array(n*4),this.colors=new Float32Array(n*4));let o=this.starts,i=this.ends,s=this.colors;for(let a=0;a<n;a++){let c=a*fe;o[a*4]=e[c],o[a*4+1]=e[c+1],o[a*4+2]=e[c+2],o[a*4+3]=e[c+3],i[a*4]=e[c+4],i[a*4+1]=e[c+5],i[a*4+2]=e[c+6],i[a*4+3]=e[c+7],s[a*4]=e[c+8],s[a*4+1]=e[c+9],s[a*4+2]=e[c+10],s[a*4+3]=e[c+11]}r||this.count===0?(this.mesh.attribute("start",g.instance0,o,4,1),this.mesh.attribute("end",g.instance1,i,4,1),this.mesh.attribute("color",g.instance2,s,4,1)):(this.mesh.update("start",o),this.mesh.update("end",i),this.mesh.update("color",s)),this.count=n}draw(e,n,r,o={}){!this.program||!this.mesh||this.count===0||(this.program.use().m4("uModel",n).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",r).f("uRoughness",o.roughness??.4).f("uTranslucency",o.translucency??.25),this.mesh.draw(this.count))}dispose(){this.program?.dispose(),this.program=null,this.mesh?.dispose(),this.mesh=null,this.count=0}},Me=class{constructor(e){this.data=e}data;cursor=0;get count(){return this.cursor/ve}reset(){this.cursor=0}push(e,n,r,o,i,s=0){if(this.cursor+ve>this.data.length)return;let a=this.data;a[this.cursor++]=e,a[this.cursor++]=n,a[this.cursor++]=r,a[this.cursor++]=o,a[this.cursor++]=i[0],a[this.cursor++]=i[1],a[this.cursor++]=i[2],a[this.cursor++]=s}},be=class{constructor(e){this.data=e}data;cursor=0;get count(){return this.cursor/fe}reset(){this.cursor=0}push(e,n,r,o,i,s,a,c,l=0,u=1){if(this.cursor+fe>this.data.length)return;let d=this.data;d[this.cursor++]=e,d[this.cursor++]=n,d[this.cursor++]=r,d[this.cursor++]=a,d[this.cursor++]=o,d[this.cursor++]=i,d[this.cursor++]=s,d[this.cursor++]=l,d[this.cursor++]=c[0],d[this.cursor++]=c[1],d[this.cursor++]=c[2],d[this.cursor++]=u}};var W=8,gb=`${$}
${Ve}

layout(location = ${g.position}) in vec3 aCorner;
layout(location = ${g.instance0}) in vec4 aHome;
layout(location = ${g.instance1}) in vec4 aStyle;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uViewProjection;
uniform float uTime;
uniform float uDrift;
uniform float uSwirl;

out vec2 vCorner;
out vec3 vColor;
out float vTwinkle;

void main() {
  float seed = aStyle.w;

  // Curl flow, sampled at the particle's home so neighbours move together in
  // sheets rather than as independent specks.
  vec3 flow = curlNoise(aHome.xyz * uSwirl + vec3(0.0, 0.0, uTime * 0.05) + seed);
  vec3 local = aHome.xyz + flow * uDrift;

  vec4 world = uModel * vec4(local, 1.0);

  // Billboard using the view matrix's basis rows, so quads always face us.
  vec3 right = vec3(uView[0][0], uView[1][0], uView[2][0]);
  vec3 up    = vec3(uView[0][1], uView[1][1], uView[2][1]);

  float scale = aHome.w * (0.75 + 0.25 * sin(uTime * 1.7 + seed * 9.1));
  world.xyz += (right * aCorner.x + up * aCorner.y) * scale;

  vCorner = aCorner.xy;
  vColor = aStyle.rgb;
  vTwinkle = 0.55 + 0.45 * sin(uTime * 2.3 + seed * 21.7);

  gl_Position = uViewProjection * world;
}
`,vb=`${P}

in vec2 vCorner;
in vec3 vColor;
in float vTwinkle;

out vec4 fragColor;

uniform float uAlpha;

void main() {
  // Gaussian-ish falloff. Squaring the smoothstep keeps a tight bright core
  // with a long tail, which is what the bloom pass wants to catch.
  float d = length(vCorner) * 2.0;
  float falloff = 1.0 - smoothstep(0.0, 1.0, d);
  falloff *= falloff;
  if (falloff < 0.004) discard;

  fragColor = vec4(vColor * falloff * vTwinkle * uAlpha, 1.0);
}
`;function yb(){return{positions:new Float32Array([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0]),normals:new Float32Array(12),indices:new Uint16Array([0,1,2,0,2,3])}}var le=class{program=null;mesh=null;count=0;init(e){this.dispose(),this.program=new _(e,gb,vb,"particles"),this.mesh=U.fromData(e,yb(),{position:g.position}),this.mesh.attribute("home",g.instance0,new Float32Array(4),4,1),this.mesh.attribute("style",g.instance1,new Float32Array(4),4,1)}upload(e,n){if(!this.mesh)return;this.count=n;let r=new Float32Array(n*4),o=new Float32Array(n*4);for(let i=0;i<n;i++){let s=i*W;r[i*4]=e[s],r[i*4+1]=e[s+1],r[i*4+2]=e[s+2],r[i*4+3]=e[s+3],o[i*4]=e[s+4],o[i*4+1]=e[s+5],o[i*4+2]=e[s+6],o[i*4+3]=e[s+7]}this.mesh.attribute("home",g.instance0,r,4,1),this.mesh.attribute("style",g.instance1,o,4,1)}draw(e,n,r,o={},i=-1){if(!this.program||!this.mesh||this.count===0)return;let s=e.gl;s.enable(s.BLEND),s.blendFunc(s.SRC_ALPHA,s.ONE),s.depthMask(!1),s.disable(s.CULL_FACE),this.program.use().m4("uModel",n).m4("uView",e.camera.view).m4("uViewProjection",e.camera.viewProjection).f("uTime",e.time).f("uAlpha",r).f("uDrift",o.drift??.35).f("uSwirl",o.swirl??.35),this.mesh.draw(i<0?this.count:Math.min(i,this.count)),s.depthMask(!0),s.enable(s.CULL_FACE),s.blendFunc(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA)}dispose(){this.program?.dispose(),this.program=null,this.mesh?.dispose(),this.mesh=null,this.count=0}};var Gn=7,Pi=500,Wn=.1,Eb={C:.3,N:.3,O:.29,P:.36},ki=class{id="basepairs";label="Base pairs";scale="10\u207B\xB9\u2070 m";caption="A pairs with T across two hydrogen bonds; G pairs with C across three. A purine always faces a pyrimidine, which is why the duplex stays exactly 20 \xE5ngstr\xF6m wide whatever the sequence says.";detail="C \xB7 N \xB7 O coloured by element \xB7 H-bonds dashed";atoms=new Ce(2);bonds=new ye(7);hbonds=new ye(5);water=new le;backdrop=new K;model=Z();init(e){this.dispose(),this.atoms.init(e),this.bonds.init(e),this.hbonds.init(e),this.water.init(e),this.backdrop.init(e);let n=new Me(new Float32Array(Gn*64*ve)),r=new be(new Float32Array(Gn*72*fe)),o=new be(new Float32Array(Gn*12*fe)),i=Math.floor(Gn/2);for(let c=0;c<Gn;c++){let l=Te[(c+12)%Te.length],u=zn(l),d=dp(l,u),f=c-i,p=f*pn,h=f*ge.rise*Wn,m=(c%2===0?1:-1)*11*Math.PI/180,v=(y,D)=>{let b=(y-10.5/2)*Wn,I=D*Wn,k=I*Math.cos(m),N=I*Math.sin(m);return[b*Math.cos(p)-N*Math.sin(p),h+k,b*Math.sin(p)+N*Math.cos(p)]};for(let y of d.atoms){let[D,b,I]=v(y.x,y.y),k=fn[y.element]??fn.C,N=(Eb[y.element]??.3)*Wn*2.4,z=y.element==="N"||y.element==="O"?.28:.08;n.push(D,b,I,N,k,z)}for(let[y,D]of d.bonds){let b=d.atoms[y],I=d.atoms[D],[k,N,z]=v(b.x,b.y),[Xr,Kr,Jr]=v(I.x,I.y),jt=fn[b.element]??fn.C,Dt=fn[I.element]??fn.C;r.push(k,N,z,Xr,Kr,Jr,.026,[(jt[0]+Dt[0])/2,(jt[1]+Dt[1])/2,(jt[2]+Dt[2])/2],.05,1)}for(let[y,D]of d.hbonds){let b=d.atoms[y],I=d.atoms[D],[k,N,z]=v(b.x,b.y),[Xr,Kr,Jr]=v(I.x,I.y),jt=4;for(let Dt=0;Dt<jt;Dt++){let ss=Dt/jt+.06,as=(Dt+1)/jt-.06;o.push(k+(Xr-k)*ss,N+(Kr-N)*ss,z+(Jr-z)*ss,k+(Xr-k)*as,N+(Kr-N)*as,z+(Jr-z)*as,.011,[.72,.94,1],.85,.9)}}}this.atoms.upload(n.data,n.count),this.bonds.upload(r.data,r.count),this.hbonds.upload(o.data,o.count);let s=ne(684514),a=new Float32Array(Pi*W);for(let c=0;c<Pi;c++){let l=(s()-.5)*Gn,u=s()*Math.PI*2,d=ge.backboneRadius*Wn*(.9+s()*1.1),f=c*W;a[f]=Math.cos(u)*d,a[f+1]=l*ge.rise*Wn,a[f+2]=Math.sin(u)*d,a[f+3]=.014+s()*.016,a[f+4]=.45,a[f+5]=.8,a[f+6]=1,a[f+7]=s()*70}this.water.upload(a,Pi)}update(e){let n=Math.pow(2,.4+e.local*1.2),r=-.6+e.local*3.2;ce(this.model,0,0,r,e.time*.1+e.local*.8,n)}render(e){this.backdrop.render(e.gl,{top:[.016,.026,.058],bottom:[.003,.006,.016],glow:[.1,.3,.55],density:.6,glowX:-.3,glowY:-.1},e.time,e.alpha,e.width/e.height),this.bonds.draw(e,this.model,e.alpha,{roughness:.42,translucency:.15}),this.atoms.draw(e,this.model,e.alpha,{roughness:.24,translucency:.3}),this.hbonds.draw(e,this.model,e.alpha,{roughness:.6,translucency:.6}),this.water.draw(e,this.model,e.alpha*.4,{drift:.04,swirl:1.4},Math.round(Pi*e.quality))}focus(e){return{distance:6-e.local*.9,aperture:1.6}}dispose(){this.atoms.dispose(),this.bonds.dispose(),this.hbonds.dispose(),this.water.dispose(),this.backdrop.dispose()}};var bp=170,Ep=84,Oi=1100,wb=`${$}
${Ve}

layout(location = ${g.position}) in vec3 aPosition;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uTime;

out vec3 vNormal;
out vec3 vView;
out vec3 vLocal;

/** Lipid-bilayer ripple: two scales, both slowly travelling. */
float ripple(vec3 dir) {
  return snoise(dir * 2.1 + vec3(0.0, uTime * 0.13, 0.0)) * 0.055
       + snoise(dir * 6.4 - vec3(uTime * 0.09, 0.0, 0.0)) * 0.018;
}

void main() {
  vec3 dir = normalize(aPosition);

  vec3 ref = abs(dir.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(dir, ref));
  vec3 t2 = cross(dir, t1);
  const float eps = 0.03;

  vec3 p0 = dir * (1.0 + ripple(dir));
  vec3 p1 = normalize(dir + t1 * eps) * (1.0 + ripple(normalize(dir + t1 * eps)));
  vec3 p2 = normalize(dir + t2 * eps) * (1.0 + ripple(normalize(dir + t2 * eps)));

  vec3 n = normalize(cross(p1 - p0, p2 - p0));
  n *= sign(dot(n, dir));

  vec4 world = uModel * vec4(p0, 1.0);
  vNormal = normalize(mat3(uModel) * n);
  vView = uCameraPos - world.xyz;
  vLocal = dir;

  gl_Position = uViewProjection * world;
}
`,Ib=`${P}
${Ve}
${X}

in vec3 vNormal;
in vec3 vView;
in vec3 vLocal;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  // Two-sided: we fly through this surface, so the back face has to light
  // correctly rather than going black the moment the camera crosses it.
  if (!gl_FrontFacing) N = -N;

  float facing = clamp(dot(N, V), 0.0, 1.0);
  float rim = pow(1.0 - facing, 2.2);

  vec3 albedo = vec3(0.16, 0.34, 0.62);
  vec3 lit = shadeMolecular(albedo, N, V, 0.28, 0.9, vec3(0.0));

  // Embedded membrane proteins, scattered as bright specks in the bilayer.
  float speck = snoise(vLocal * 26.0);
  lit += vec3(0.5, 0.95, 1.0) * smoothstep(0.55, 0.92, speck) * 0.5;

  // Thin-film shimmer across the surface.
  float film = 0.5 + 0.5 * sin(snoise(vLocal * 3.4 + uTime * 0.07) * 6.0);
  lit += mix(vec3(0.18, 0.42, 0.9), vec3(0.36, 0.9, 0.75), film) * rim * 0.7;

  // Mostly transparent face-on so the interior reads through the membrane.
  float alpha = uAlpha * (0.10 + 0.72 * rim);
  fragColor = vec4(lit, clamp(alpha, 0.0, 1.0));
}
`,Li=class{id="cell";label="Cell";scale="10\u207B\u2075 m";caption="Inside the membrane: mitochondria generating ATP, vesicles in transit along the cytoskeleton, and the nucleus holding the genome apart from all of it.";detail="Eukaryotic cell \xB7 organelles and cytoskeleton";membraneProgram=null;membraneMesh=null;backdrop=new K;organelles=new Ce(2);filaments=new ye(6);motes=new le;model=Z();init(e){this.dispose(),this.membraneProgram=new _(e,wb,Ib,"cell:membrane"),this.membraneMesh=U.fromData(e,ot(4),{position:g.position}),this.backdrop.init(e),this.organelles.init(e),this.filaments.init(e),this.motes.init(e);let n=ne(52753),r=new Me(new Float32Array(bp*ve));r.push(0,0,0,.34,[.42,.66,1],.55),r.push(.08,.05,.04,.11,[.75,.86,1],.9);for(let s=2;s<bp;s++){let[a,c,l]=Zr(n,.42,.94),u=n();u<.18?r.push(a,c,l,.035+n()*.022,[1,.62,.34],.12):u<.34?r.push(a,c,l,.022+n()*.014,[.68,1,.72],.1):r.push(a,c,l,.015+n()*.02,[.55,.82,1],.06)}this.organelles.upload(r.data,r.count);let o=new be(new Float32Array(Ep*fe));for(let s=0;s<26;s++){let[a,c,l]=Zr(n,.46,.88),u=Zr(n,1,1),d=.06+n()*.05;o.push(a-u[0]*d,c-u[1]*d,l-u[2]*d,a+u[0]*d,c+u[1]*d,l+u[2]*d,.028+n()*.012,[1,.72,.42],.35,1)}for(let s=26;s<Ep;s++){let a=Zr(n,.36,.44),c=2+n()*.35;o.push(a[0],a[1],a[2],a[0]*c,a[1]*c,a[2]*c,.0035+n()*.0025,[.46,.78,.96],.06,.55)}this.filaments.upload(o.data,o.count);let i=new Float32Array(Oi*W);for(let s=0;s<Oi;s++){let[a,c,l]=Zr(n,.38,.97),u=s*W;i[u]=a,i[u+1]=c,i[u+2]=l,i[u+3]=.012+n()*.022;let d=n()<.35;i[u+4]=d?.95:.38,i[u+5]=d?.72:.78,i[u+6]=d?.45:1,i[u+7]=n()*80}this.motes.upload(i,Oi)}update(e){let n=Math.pow(2,-1.7+e.local*3.6),r=-6+e.local*9.4;ce(this.model,0,0,r,e.time*.045+e.local*.5,n)}render(e){let{gl:n}=e;this.backdrop.render(n,{top:[.02,.042,.082],bottom:[.006,.012,.028],glow:[.14,.34,.7],density:1,glowX:-.22,glowY:.06},e.time,e.alpha,e.width/e.height),this.organelles.draw(e,this.model,e.alpha,{roughness:.3,translucency:.5}),this.filaments.draw(e,this.model,e.alpha,{roughness:.45,translucency:.2});let r=Math.round(Oi*e.quality);this.motes.draw(e,this.model,e.alpha*.75,{drift:.05,swirl:1.7},r),this.membraneProgram&&this.membraneMesh&&(n.disable(n.CULL_FACE),n.depthMask(!1),this.membraneProgram.use().m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uTime",e.time).f("uAlpha",e.alpha),this.membraneMesh.draw(),n.depthMask(!0),n.enable(n.CULL_FACE))}focus(e){return{distance:6-e.local*.8,aperture:4.5}}dispose(){this.membraneProgram?.dispose(),this.membraneProgram=null,this.membraneMesh?.dispose(),this.membraneMesh=null,this.backdrop.dispose(),this.organelles.dispose(),this.filaments.dispose(),this.motes.dispose()}};function Zr(t,e,n){let r=t()*2-1,o=Math.sqrt(Math.max(0,1-r*r)),i=t()*Math.PI*2,s=e+(n-e)*Math.cbrt(t());return[o*Math.cos(i)*s,o*Math.sin(i)*s,r*s]}var Fi=120,Db=2600,Tb=6,wp=`
uniform float uCount;
uniform float uOpen;
uniform float uSpacing;
uniform float uCoilRadius;
uniform float uSuperRadius;
uniform float uTime;

vec3 fiberPoint(float i) {
  float centred = i - uCount * 0.5;

  // Extended: a lazily waving string of beads.
  vec3 extended = vec3(
    sin(i * 0.21) * 0.10 + sin(i * 0.061) * 0.30,
    centred * uSpacing,
    cos(i * 0.19) * 0.10 + cos(i * 0.053) * 0.30
  );

  // Condensed: the 30 nm solenoid, roughly six nucleosomes per turn, itself
  // wound into a higher-order coil \u2014 the packing that makes a metaphase
  // chromosome compact enough to see down a light microscope.
  float a = i * (6.2831853 / 6.0);
  float y = centred * uSpacing * 0.13;
  vec3 solenoid = vec3(cos(a) * uCoilRadius, y, sin(a) * uCoilRadius);
  float a2 = y * 6.0;
  solenoid.xz += vec2(cos(a2), sin(a2)) * uSuperRadius;

  vec3 p = mix(solenoid, extended, uOpen);

  // Brownian shiver, stronger once the fibre is open and free in solution.
  p += vec3(
    sin(uTime * 0.9 + i * 0.37),
    sin(uTime * 1.1 + i * 0.29),
    cos(uTime * 0.8 + i * 0.41)
  ) * 0.006 * (0.3 + uOpen);

  return p;
}
`,Cb=`${$}
${wp}

layout(location = ${g.position}) in vec3 aPosition;
layout(location = ${g.instance0}) in float aIndex;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uBeadRadius;

out vec3 vNormal;
out vec3 vView;
out float vIndex;

void main() {
  vec3 centre = fiberPoint(aIndex);
  vec3 local = centre + aPosition * uBeadRadius;

  vec4 world = uModel * vec4(local, 1.0);
  vNormal = normalize(mat3(uModel) * aPosition);
  vView = uCameraPos - world.xyz;
  vIndex = aIndex;

  gl_Position = uViewProjection * world;
}
`,Mb=`${P}
${X}

in vec3 vNormal;
in vec3 vView;
in float vIndex;

out vec4 fragColor;

uniform float uAlpha;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  // Histone octamers: eight proteins, so give them a faintly banded tint
  // instead of a single flat colour.
  float band = 0.5 + 0.5 * sin(vIndex * 1.7);
  vec3 albedo = mix(vec3(0.72, 0.60, 0.86), vec3(0.92, 0.74, 0.64), band);

  vec3 lit = shadeMolecular(albedo, N, V, 0.38, 0.3, albedo * 0.08);
  fragColor = vec4(lit, uAlpha);
}
`,Sb=`${$}
${Qe}
${wp}

layout(location = ${g.param}) in vec2 aParam; // x = t along fibre, y = angle

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uTubeRadius;
uniform float uWrapRadius;
uniform float uTurnsPerBead;

out vec3 vNormal;
out vec3 vView;
out float vT;

/** The DNA duplex itself: wound around the bead path 1.65 turns per histone. */
vec3 wrappedPoint(float t) {
  float i = t * uCount;
  vec3 spine = fiberPoint(i);

  vec3 ahead = fiberPoint(i + 0.5);
  vec3 behind = fiberPoint(i - 0.5);
  vec3 n, bi;
  frameFromTangent(ahead - behind, n, bi);

  float phi = i * uTurnsPerBead * 6.2831853;
  return spine + (n * cos(phi) + bi * sin(phi)) * uWrapRadius;
}

void main() {
  float t = aParam.x;
  float step = 0.35 / uCount;

  vec3 p = wrappedPoint(t);
  vec3 tangent = wrappedPoint(t + step) - wrappedPoint(t - step);

  vec3 n, bi;
  frameFromTangent(tangent, n, bi);
  vec3 offset = n * cos(aParam.y) + bi * sin(aParam.y);

  vec3 local = p + offset * uTubeRadius;
  vec4 world = uModel * vec4(local, 1.0);

  vNormal = normalize(mat3(uModel) * offset);
  vView = uCameraPos - world.xyz;
  vT = t;

  gl_Position = uViewProjection * world;
}
`,xb=`${P}
${X}

in vec3 vNormal;
in vec3 vView;
in float vT;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  vec3 albedo = vec3(0.34, 0.78, 0.92);

  // A slow pulse travelling the length of the fibre, so the strand reads as
  // one continuous molecule rather than a static pipe.
  float pulse = smoothstep(0.94, 1.0, sin(vT * 22.0 - uTime * 1.4) * 0.5 + 0.5);
  vec3 emissive = vec3(0.25, 0.85, 1.0) * pulse * 0.7;

  vec3 lit = shadeMolecular(albedo, N, V, 0.3, 0.25, emissive);
  fragColor = vec4(lit, uAlpha);
}
`,Vi=class{id="chromatin";label="Chromatin";scale="10\u207B\u2078 m";caption="DNA does not float free. Every 147 bases wind 1.65 turns around a histone octamer, and those beads coil again into the fibre that condenses into a chromosome.";detail="Nucleosome \xB7 147 bp per histone core";beadProgram=null;beadMesh=null;tubeProgram=null;tubeMesh=null;backdrop=new K;model=Z();open=0;init(e){this.dispose(),this.beadProgram=new _(e,Cb,Mb,"chromatin:beads"),this.beadMesh=U.fromData(e,ot(2),{position:g.position});let n=new Float32Array(Fi);for(let r=0;r<Fi;r++)n[r]=r;this.beadMesh.attribute("index",g.instance0,n,1,1),this.tubeProgram=new _(e,Sb,xb,"chromatin:dna"),this.tubeMesh=U.fromData(e,hn(Db,Tb),{param:g.param}),this.backdrop.init(e)}update(e){this.open=me(.12,.78,e.local);let n=Math.pow(2,-.6+e.local*2.3),r=-3.4+e.local*6.2;ce(this.model,0,0,r,e.time*.06+e.local*.9,n)}render(e){let{gl:n}=e;this.backdrop.render(n,{top:[.028,.03,.078],bottom:[.008,.008,.026],glow:[.3,.24,.72],density:.9,glowX:-.18,glowY:.2},e.time,e.alpha,e.width/e.height);let r=o=>o.m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",e.alpha).f("uTime",e.time).f("uCount",Fi).f("uOpen",this.open).f("uSpacing",.075).f("uCoilRadius",.16).f("uSuperRadius",.3);this.tubeProgram&&this.tubeMesh&&(r(this.tubeProgram.use()).f("uTubeRadius",.009).f("uWrapRadius",.041).f("uTurnsPerBead",1.65),this.tubeMesh.draw()),this.beadProgram&&this.beadMesh&&(r(this.beadProgram.use()).f("uBeadRadius",.032),this.beadMesh.draw(Fi))}focus(e){return{distance:6.2-e.local*1.4,aperture:3.2}}dispose(){this.beadProgram?.dispose(),this.beadProgram=null,this.beadMesh?.dispose(),this.beadMesh=null,this.tubeProgram?.dispose(),this.tubeProgram=null,this.tubeMesh?.dispose(),this.tubeMesh=null,this.backdrop.dispose()}};var Et=46,_b=900,Nb=10,ji=900,Ip=.1,nl=ge.rise*Ip,Hi=ge.backboneRadius*Ip,Ab=`${$}
${Qe}
${dn}

layout(location = ${g.param}) in vec2 aParam; // x = t along strand, y = tube angle

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uBpCount;
uniform float uStrand;
uniform float uTubeRadius;

out vec3 vNormal;
out vec3 vView;
out float vBp;

void main() {
  // Centred on zero to match the base instances, which are built around the
  // middle of the sequence. Running 0..count here would stack the backbones a
  // full helix-length above the rungs they are supposed to be carrying.
  float bp = (aParam.x - 0.5) * uBpCount;

  vec3 p = backbonePoint(bp, uStrand);

  // Central difference for the tangent: the sway makes the analytic derivative
  // messier than it is worth, and half a base pair is a tight enough step.
  vec3 ahead = backbonePoint(bp + 0.5, uStrand);
  vec3 behind = backbonePoint(bp - 0.5, uStrand);

  vec3 n, bi;
  frameFromTangent(ahead - behind, n, bi);
  vec3 offset = n * cos(aParam.y) + bi * sin(aParam.y);

  vec3 local = p + offset * uTubeRadius;
  vec4 world = uModel * vec4(local, 1.0);

  vNormal = normalize(mat3(uModel) * offset);
  vView = uCameraPos - world.xyz;
  vBp = bp;

  gl_Position = uViewProjection * world;
}
`,Rb=`${P}
${X}

in vec3 vNormal;
in vec3 vView;
in float vBp;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;
uniform float uBpCount;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  // Sugar-phosphate backbone: cold, wet, faintly metallic.
  vec3 albedo = vec3(0.30, 0.62, 0.80);

  // A charge pulse running 5' to 3'. Two harmonics so it never looks like a
  // single sine crawling along a pipe.
  float phase = vBp * 0.55 - uTime * 2.4;
  float pulse = pow(max(sin(phase) * 0.5 + 0.5, 0.0), 12.0)
              + pow(max(sin(phase * 0.5 + 1.7) * 0.5 + 0.5, 0.0), 20.0) * 0.6;

  vec3 emissive = vec3(0.30, 0.92, 1.0) * pulse * 0.9;

  vec3 lit = shadeMolecular(albedo, N, V, 0.22, 0.2, emissive);
  fragColor = vec4(lit, uAlpha);
}
`,Pb=`${$}
${dn}

layout(location = ${g.position}) in vec3 aPosition;
layout(location = ${g.normal}) in vec3 aNormal;
layout(location = ${g.instance0}) in vec4 aBase;  // x = bp index, y = strand, z = purine, w = spare
layout(location = ${g.instance1}) in vec4 aColor;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uInnerRadius;
uniform float uThickness;
uniform float uWidth;

out vec3 vNormal;
out vec3 vView;
out vec3 vColor;
out float vBp;
out float vSpan;

void main() {
  float bp = aBase.x;
  float strand = aBase.y;

  vec3 axis = helixAxisPoint(bp);
  vec3 outward = strandOutward(bp, strand);
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 side = normalize(cross(up, outward));
  vec3 planeUp = normalize(cross(outward, side));

  // Purines (A, G) are two fused rings and reach further across the duplex
  // than the single-ring pyrimidines (T, C) \u2014 the reason a purine always
  // pairs with a pyrimidine and the helix keeps a constant 20 \xC5 width.
  float inner = mix(uInnerRadius * 1.32, uInnerRadius, aBase.z);
  float span = uRadius - inner;

  // Box x spans [-0.5, 0.5]; remap so 0 sits at the backbone end.
  float along = aPosition.x + 0.5;
  vec3 local = axis
    + outward * (uRadius - along * span)
    + planeUp * (aPosition.y * uThickness)
    + side * (aPosition.z * uWidth);

  vec4 world = uModel * vec4(local, 1.0);

  vec3 nrm = outward * -aNormal.x + planeUp * aNormal.y + side * aNormal.z;
  vNormal = normalize(mat3(uModel) * nrm);
  vView = uCameraPos - world.xyz;
  vColor = aColor.rgb;
  vBp = bp;
  vSpan = along;

  gl_Position = uViewProjection * world;
}
`,kb=`${P}
${X}

in vec3 vNormal;
in vec3 vView;
in vec3 vColor;
in float vBp;
in float vSpan;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;
uniform float uReadHead;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  // Brightest at the inner tip, where the hydrogen bonds are.
  float tip = smoothstep(0.35, 1.0, vSpan);
  vec3 emissive = vColor * (0.22 + tip * 0.75);

  // A reading head sweeping the sequence, as a polymerase would.
  float head = exp(-pow((vBp - uReadHead) * 0.55, 2.0));
  emissive += vColor * head * 1.6;
  emissive += vec3(1.0) * head * tip * 0.5;

  vec3 lit = shadeMolecular(vColor * 0.55, N, V, 0.3, 0.45, emissive);
  fragColor = vec4(lit, uAlpha);
}
`,Bi=class{id="helix";label="Double helix";scale="10\u207B\u2079 m";caption="B-DNA: ten and a half base pairs per turn, rising 3.4 \xE5ngstr\xF6m each. The two backbones run antiparallel and sit 225\xB0 apart, cutting one wide groove and one narrow one.";detail="TP53 coding sequence \xB7 A\u2013T and G\u2013C";backboneProgram=null;backboneMesh=null;baseProgram=null;baseMesh=null;backdrop=new K;hydration=new le;model=Z();readHead=0;init(e){this.dispose(),this.backboneProgram=new _(e,Ab,Rb,"helix:backbone"),this.backboneMesh=U.fromData(e,hn(_b,Nb),{param:g.param}),this.baseProgram=new _(e,Pb,kb,"helix:bases"),this.baseMesh=U.fromData(e,Ri(),{position:g.position,normal:g.normal});let n=new Float32Array(Et*2*4),r=new Float32Array(Et*2*4);for(let s=0;s<Et;s++){let a=Te[s%Te.length],c=zn(a);for(let[l,u]of[[0,a],[1,c]]){let d=(s*2+l)*4;n[d]=s-Et/2,n[d+1]=l,n[d+2]=u==="A"||u==="G"?1:0,n[d+3]=0;let f=bt[u];r[d]=f[0],r[d+1]=f[1],r[d+2]=f[2],r[d+3]=1}}this.baseMesh.attribute("base",g.instance0,n,4,1),this.baseMesh.attribute("color",g.instance1,r,4,1),this.backdrop.init(e),this.hydration.init(e);let o=ne(3402),i=new Float32Array(ji*W);for(let s=0;s<ji;s++){let a=(o()-.5)*Et,c=o()*Math.PI*2,l=Hi*(1.15+o()*1.5),u=s*W;i[u]=Math.cos(c)*l,i[u+1]=a*nl,i[u+2]=Math.sin(c)*l,i[u+3]=.012+o()*.02;let d=o()<.18;i[u+4]=d?1:.35,i[u+5]=d?.78:.72,i[u+6]=d?.42:1,i[u+7]=o()*90}this.hydration.upload(i,ji)}update(e){this.readHead=(e.local*1.25-.15)*Et-Et/2;let n=Math.pow(2,-.35+e.local*1.5),r=-1.8+e.local*4.4;ce(this.model,0,0,r,e.time*.14+e.local*1.2,n)}render(e){let{gl:n}=e;this.backdrop.render(n,{top:[.02,.032,.07],bottom:[.004,.008,.02],glow:[.12,.36,.62],density:.75,glowX:.28,glowY:.18},e.time,e.alpha,e.width/e.height);let r=.035;if(this.backboneProgram&&this.backboneMesh){let o=this.backboneProgram.use().m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",e.alpha).f("uTime",e.time).f("uRise",nl).f("uTwist",pn).f("uRadius",Hi).f("uStrandOffset",ge.strandOffset).f("uBend",r).f("uBpCount",Et).f("uTubeRadius",.085);for(let i of[0,1])o.f("uStrand",i),this.backboneMesh.draw()}this.baseProgram&&this.baseMesh&&(this.baseProgram.use().m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",e.alpha).f("uTime",e.time).f("uRise",nl).f("uTwist",pn).f("uRadius",Hi).f("uStrandOffset",ge.strandOffset).f("uBend",r).f("uInnerRadius",Hi*.2).f("uThickness",.055).f("uWidth",.16).f("uReadHead",this.readHead),this.baseMesh.draw(Et*2)),this.hydration.draw(e,this.model,e.alpha*.55,{drift:.06,swirl:1.1},Math.round(ji*e.quality))}focus(e){return{distance:6-e.local*1.2,aperture:2.4}}dispose(){this.backboneProgram?.dispose(),this.backboneProgram=null,this.backboneMesh?.dispose(),this.backboneMesh=null,this.baseProgram?.dispose(),this.baseProgram=null,this.baseMesh?.dispose(),this.baseMesh=null,this.backdrop.dispose(),this.hydration.dispose()}};var Ui=44,Ob=8,Dp='600 24px "IBM Plex Sans", system-ui, -apple-system, sans-serif',Lb=`${$}
layout(location = ${g.position}) in vec3 aCorner;
layout(location = ${g.instance0}) in vec4 aAnchor; // xyz = world position, w = scale
layout(location = ${g.instance1}) in vec4 aRect;   // uv rect in the atlas
layout(location = ${g.instance2}) in vec4 aStyle;  // rgb tint, a = opacity

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uViewProjection;
uniform float uAtlasAspect;

out vec2 vUv;
out vec4 vStyle;

void main() {
  vec4 world = uModel * vec4(aAnchor.xyz, 1.0);

  vec3 right = vec3(uView[0][0], uView[1][0], uView[2][0]);
  vec3 up    = vec3(uView[0][1], uView[1][1], uView[2][1]);

  // aRect.zw is the label's size in *normalised* atlas units, so recovering
  // the pixel aspect needs the atlas's own aspect folded back in. Without this
  // every label would stretch to the same width regardless of its length.
  float width = aAnchor.w * (aRect.z / aRect.w) * uAtlasAspect;
  world.xyz += right * (aCorner.x * width) + up * (aCorner.y * aAnchor.w);

  vUv = vec2(aRect.x + (aCorner.x + 0.5) * aRect.z, aRect.y + (0.5 - aCorner.y) * aRect.w);
  vStyle = aStyle;

  gl_Position = uViewProjection * world;
}
`,Fb=`${P}
in vec2 vUv;
in vec4 vStyle;
out vec4 fragColor;

uniform sampler2D uAtlas;

void main() {
  float mask = texture(uAtlas, vUv).a;
  if (mask < 0.02) discard;

  // Additive so labels read as emissive readouts and pick up bloom.
  fragColor = vec4(vStyle.rgb * mask * vStyle.a, 1.0);
}
`;function Vb(){return{positions:new Float32Array([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0]),normals:new Float32Array(12),indices:new Uint16Array([0,1,2,0,2,3])}}var $i=class{constructor(e){this.labels=e}labels;program=null;mesh=null;texture=null;entries=new Map;count=0;atlasWidth=1;atlasHeight=1;textureOwner=null;init(e){this.dispose(),this.textureOwner=e,this.program=new _(e,Lb,Fb,"labels"),this.mesh=U.fromData(e,Vb(),{position:g.position}),this.mesh.attribute("anchor",g.instance0,new Float32Array(4),4,1),this.mesh.attribute("rect",g.instance1,new Float32Array(4),4,1),this.mesh.attribute("style",g.instance2,new Float32Array(4),4,1),this.buildAtlas(e)}buildAtlas(e){let n=document.createElement("canvas"),r=n.getContext("2d");if(!r)return;r.font=Dp;let o=this.labels.map(c=>Math.ceil(r.measureText(c).width)+Ob*2),i=Math.max(64,...o);n.width=Tp(i),n.height=Tp(Ui*this.labels.length),this.atlasWidth=n.width,this.atlasHeight=n.height;let s=n.getContext("2d");if(!s)return;s.clearRect(0,0,n.width,n.height),s.font=Dp,s.textBaseline="middle",s.textAlign="center",s.fillStyle="#ffffff",this.entries.clear(),this.labels.forEach((c,l)=>{let u=l*Ui,d=o[l];s.fillText(c,n.width/2,u+Ui/2),this.entries.set(c,{rect:[(n.width/2-d/2)/n.width,u/n.height,d/n.width,Ui/n.height]})});let a=e.createTexture();a&&(e.bindTexture(e.TEXTURE_2D,a),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.generateMipmap(e.TEXTURE_2D),this.texture=a)}aspectOf(e){let n=this.entries.get(e);return n?n.rect[2]*this.atlasWidth/(n.rect[3]*this.atlasHeight):1}place(e){if(!this.mesh)return;let n=new Float32Array(e.length*4),r=new Float32Array(e.length*4),o=new Float32Array(e.length*4),i=0;for(let s of e){let a=this.entries.get(s.label);if(!a)continue;let c=i++;n[c*4]=s.x,n[c*4+1]=s.y,n[c*4+2]=s.z,n[c*4+3]=s.size,r.set(a.rect,c*4),o[c*4]=s.color[0],o[c*4+1]=s.color[1],o[c*4+2]=s.color[2],o[c*4+3]=s.opacity}this.count=i,this.mesh.attribute("anchor",g.instance0,n,4,1),this.mesh.attribute("rect",g.instance1,r,4,1),this.mesh.attribute("style",g.instance2,o,4,1)}draw(e,n){if(!this.program||!this.mesh||!this.texture||this.count===0)return;let r=e.gl;r.enable(r.BLEND),r.blendFunc(r.SRC_ALPHA,r.ONE),r.depthMask(!1),r.disable(r.CULL_FACE),this.program.use().m4("uModel",n).m4("uView",e.camera.view).m4("uViewProjection",e.camera.viewProjection).f("uAtlasAspect",this.atlasWidth/this.atlasHeight).tex("uAtlas",0,this.texture),this.mesh.draw(this.count),r.depthMask(!0),r.enable(r.CULL_FACE),r.blendFunc(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA)}dispose(){this.program?.dispose(),this.program=null,this.mesh?.dispose(),this.mesh=null,this.texture&&(this.textureOwner?.deleteTexture(this.texture),this.texture=null),this.entries.clear(),this.count=0,this.textureOwner=null}};function Tp(t){let e=1;for(;e<t;)e*=2;return e}var wt=[{id:"TP53",role:"hub",note:"the transcription factor itself"},{id:"ATM",role:"sensor",note:"senses double-strand breaks"},{id:"ATR",role:"sensor",note:"senses replication stress"},{id:"CHEK2",role:"sensor",note:"kinase relaying the damage signal"},{id:"TP53BP1",role:"sensor",note:"damage-site adaptor"},{id:"MDM2",role:"regulator",note:"ubiquitin ligase, marks p53 for destruction"},{id:"MDM4",role:"regulator",note:"blocks p53 transactivation"},{id:"USP7",role:"regulator",note:"deubiquitinase, rescues both"},{id:"CREBBP",role:"regulator",note:"acetylates and activates"},{id:"SIRT1",role:"regulator",note:"deacetylates and quiets"},{id:"CDKN1A",role:"effector",note:"p21 \u2014 halts the cell cycle"},{id:"GADD45A",role:"effector",note:"growth arrest and repair"},{id:"SFN",role:"effector",note:"14-3-3\u03C3 \u2014 holds the G2 arrest"},{id:"BAX",role:"effector",note:"punches holes in mitochondria"},{id:"BBC3",role:"effector",note:"PUMA \u2014 commits to apoptosis"},{id:"PTEN",role:"effector",note:"dampens survival signalling"}],qn=[["ATM","TP53","activates"],["ATM","CHEK2","activates"],["ATR","TP53","activates"],["ATR","CHEK2","activates"],["CHEK2","TP53","activates"],["TP53BP1","TP53","activates"],["ATM","TP53BP1","activates"],["ATM","MDM2","inhibits"],["MDM2","TP53","inhibits"],["MDM4","TP53","inhibits"],["MDM2","MDM4","inhibits"],["USP7","MDM2","activates"],["USP7","TP53","activates"],["CREBBP","TP53","activates"],["SIRT1","TP53","inhibits"],["TP53","MDM2","transcribes"],["TP53","CDKN1A","transcribes"],["TP53","GADD45A","transcribes"],["TP53","SFN","transcribes"],["TP53","BAX","transcribes"],["TP53","BBC3","transcribes"],["TP53","PTEN","transcribes"],["CDKN1A","GADD45A","activates"],["BBC3","BAX","activates"],["PTEN","MDM2","inhibits"]],Cp={hub:[1,.78,.34],sensor:[.42,.86,1],regulator:[1,.44,.56],effector:[.4,1,.7]},Mp={activates:[.36,.78,1],inhibits:[1,.4,.52],transcribes:[.44,1,.72]},rl=3,zi=class{id="interactome";label="Connections";scale="10\u207B\u2078 m";caption="One gene never acts alone. Damage sensors switch p53 on, p53 switches on the genes that arrest or kill the cell \u2014 and one of them, MDM2, switches p53 back off.";detail="p53 network \xB7 sensors, regulators, effectors";nodes=new Ce(3);edges=new ye(6);pulses=new le;labels=new $i(wt.map(e=>e.id));backdrop=new K;model=Z();positions=[];degree=new Map;nodeWriter=new Me(new Float32Array(wt.length*ve));edgeWriter=new be(new Float32Array(qn.length*fe));pulseData=new Float32Array(qn.length*rl*W);init(e){this.dispose(),this.nodes.init(e),this.edges.init(e),this.pulses.init(e),this.labels.init(e),this.backdrop.init(e),this.layout()}layout(){let e=ne(40509),n=wt.length,r=[];for(let c=0;c<n;c++){if(wt[c].role==="hub"){r.push([0,0,0]);continue}let l=1-c/(n-1)*2,u=Math.sqrt(Math.max(0,1-l*l)),d=c*2.399963229728653;r.push([Math.cos(d)*u*1.4+(e()-.5)*.1,l*1.4+(e()-.5)*.1,Math.sin(d)*u*1.4+(e()-.5)*.1])}let o=new Map;wt.forEach((c,l)=>o.set(c.id,l));for(let[c,l]of qn)this.degree.set(c,(this.degree.get(c)??0)+1),this.degree.set(l,(this.degree.get(l)??0)+1);let i=r.map(()=>[0,0,0]);for(let c=0;c<400;c++){let l=1-c/400;for(let u=0;u<n;u++){let d=i[u],f=r[u];for(let m=u+1;m<n;m++){let v=r[m],y=f[0]-v[0],D=f[1]-v[1],b=f[2]-v[2],I=y*y+D*D+b*b;I<1e-4&&(y=e()-.5,D=e()-.5,b=e()-.5,I=.01);let k=.55/I,N=Math.sqrt(I),z=i[m];d[0]+=y/N*k,d[1]+=D/N*k,d[2]+=b/N*k,z[0]-=y/N*k,z[1]-=D/N*k,z[2]-=b/N*k}let p=Math.hypot(f[0],f[1],f[2]),h=.06*p;p>1e-5&&(d[0]-=f[0]/p*h,d[1]-=f[1]/p*h,d[2]-=f[2]/p*h)}for(let[u,d]of qn){let f=o.get(u),p=o.get(d),h=r[f],m=r[p],v=m[0]-h[0],y=m[1]-h[1],D=m[2]-h[2],b=Math.hypot(v,y,D)||1e-4,I=(b-1.25)*.09,k=i[f],N=i[p];k[0]+=v/b*I,k[1]+=y/b*I,k[2]+=D/b*I,N[0]-=v/b*I,N[1]-=y/b*I,N[2]-=D/b*I}for(let u=0;u<n;u++){let d=i[u],f=r[u],p=wt[u].role==="hub"?.06:1;f[0]+=d[0]*.055*l*p,f[1]+=d[1]*.055*l*p,f[2]+=d[2]*.055*l*p,d[0]*=.72,d[1]*=.72,d[2]*=.72}}let s=0;for(let c of r)s=Math.max(s,Math.hypot(c[0],c[1],c[2]));let a=s>1e-4?1.85/s:1;for(let c of r)c[0]*=a,c[1]*=a,c[2]*=a;this.positions.length=0,this.positions.push(...r)}nodePosition(e,n){let r=this.positions[e];return[r[0]+Math.sin(n*.5+e*1.7)*.03,r[1]+Math.sin(n*.43+e*2.3)*.03,r[2]+Math.cos(n*.47+e*1.1)*.03]}update(e){let n=me(0,.45,e.local),r=new Map;wt.forEach((l,u)=>r.set(l.id,u));let o=this.nodeWriter;o.reset(),wt.forEach((l,u)=>{let[d,f,p]=this.nodePosition(u,e.time),h=this.degree.get(l.id)??1,m=.05+Math.sqrt(h)*.026,v=l.role==="hub"?.5+.35*Math.sin(e.time*1.6):.22,y=un((n-u*.02)*4);o.push(d,f,p,m*y,Cp[l.role],v)}),this.nodes.upload(o.data,o.count);let i=this.edgeWriter;i.reset(),qn.forEach(([l,u,d],f)=>{let p=r.get(l),h=r.get(u),m=this.nodePosition(p,e.time),v=this.nodePosition(h,e.time),y=un((n-.12-f*.012)*3.5);y<=.001||i.push(m[0],m[1],m[2],m[0]+(v[0]-m[0])*y,m[1]+(v[1]-m[1])*y,m[2]+(v[2]-m[2])*y,d==="transcribes"?.0075:.006,Mp[d],.35,.5*y)}),this.edges.upload(i.data,i.count);let s=this.pulseData,a=0;qn.forEach(([l,u,d],f)=>{let p=r.get(l),h=r.get(u),m=this.nodePosition(p,e.time),v=this.nodePosition(h,e.time),y=Mp[d];for(let D=0;D<rl;D++){let b=(e.time*.32+f*.17+D/rl)%1,I=a*W;s[I]=m[0]+(v[0]-m[0])*b,s[I+1]=m[1]+(v[1]-m[1])*b,s[I+2]=m[2]+(v[2]-m[2])*b,s[I+3]=.03*Math.sin(b*Math.PI)*n,s[I+4]=y[0],s[I+5]=y[1],s[I+6]=y[2],s[I+7]=f*3.1+D,a++}}),this.pulses.upload(s,a),this.labels.place(wt.map((l,u)=>{let[d,f,p]=this.nodePosition(u,e.time),h=this.degree.get(l.id)??1;return{label:l.id,x:d,y:f+.05+Math.sqrt(h)*.026,z:p,size:l.role==="hub"?.115:.082,color:Cp[l.role],opacity:un((n-.25-u*.015)*4)*.95}}));let c=Math.pow(2,-.1+e.local*.55);ce(this.model,0,0,-.4+e.local*1.6,e.time*.08,c)}render(e){this.backdrop.render(e.gl,{top:[.016,.03,.07],bottom:[.003,.007,.02],glow:[.16,.34,.64],density:.7,glowX:0,glowY:0},e.time,e.alpha,e.width/e.height),this.edges.draw(e,this.model,e.alpha,{roughness:.55,translucency:.6}),this.nodes.draw(e,this.model,e.alpha,{roughness:.26,translucency:.45}),this.pulses.draw(e,this.model,e.alpha*.9,{drift:0,swirl:.1}),this.labels.draw(e,this.model)}focus(){return{distance:6,aperture:5.5}}dispose(){this.nodes.dispose(),this.edges.dispose(),this.pulses.dispose(),this.labels.dispose(),this.backdrop.dispose(),this.degree.clear()}};var Yn=23,Gi=150,Wi=2600,Sp=640,jb=`${$}
layout(location = ${g.position}) in vec3 aPosition;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;

out vec3 vNormal;
out vec3 vView;
out vec3 vLocal;

void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vNormal = normalize(mat3(uModel) * aPosition);
  vView = uCameraPos - world.xyz;
  vLocal = aPosition;
  gl_Position = uViewProjection * world;
}
`,Hb=`${P}
${Ve}
${X}

in vec3 vNormal;
in vec3 vView;
in vec3 vLocal;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  if (!gl_FrontFacing) N = -N;

  float facing = clamp(dot(N, V), 0.0, 1.0);
  float rim = pow(1.0 - facing, 2.0);

  vec3 lit = shadeMolecular(vec3(0.13, 0.26, 0.5), N, V, 0.3, 0.85, vec3(0.0));

  // The double membrane reads as two offset shimmer bands.
  float band = snoise(vLocal * 8.0 + uTime * 0.05);
  lit += vec3(0.34, 0.72, 1.0) * smoothstep(0.3, 0.9, band) * 0.18;
  lit += vec3(0.4, 0.85, 1.0) * rim * 0.85;

  fragColor = vec4(lit, uAlpha * (0.07 + 0.68 * rim));
}
`,Bb=`${$}
${Qe}

layout(location = ${g.position}) in vec3 aPosition;
layout(location = ${g.normal}) in vec3 aNormal;
layout(location = ${g.instance0}) in vec4 aPore; // xyz = surface normal, w = scale

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uRadius;

out vec3 vNormal;
out vec3 vView;

void main() {
  // The torus is built around +Y; rotate that axis onto the surface normal so
  // each pore complex sits flat in the envelope.
  vec3 axis = normalize(aPore.xyz);
  vec3 n, bi;
  frameFromTangent(axis, n, bi);
  mat3 basis = mat3(bi, axis, n);

  vec3 local = axis * uRadius + basis * (aPosition * aPore.w);
  vec4 world = uModel * vec4(local, 1.0);

  vNormal = normalize(mat3(uModel) * (basis * aNormal));
  vView = uCameraPos - world.xyz;
  gl_Position = uViewProjection * world;
}
`,Ub=`${P}
${X}

in vec3 vNormal;
in vec3 vView;
out vec4 fragColor;

uniform float uAlpha;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  vec3 lit = shadeMolecular(vec3(0.45, 0.78, 0.95), N, V, 0.35, 0.3, vec3(0.06, 0.14, 0.2));
  fragColor = vec4(lit, uAlpha * 0.9);
}
`,qi=class{id="nucleus";label="Nucleus";scale="10\u207B\u2076 m";caption="Two metres of DNA folded into six micrometres. Each chromosome keeps to its own territory, and every molecule entering or leaving passes through one of a few thousand nuclear pores.";detail="23 chromosome territories \xB7 nuclear pore complexes";envelopeProgram=null;envelopeMesh=null;poreProgram=null;poreMesh=null;backdrop=new K;chromatin=new le;strands=new ye(5);model=Z();init(e){this.dispose(),this.envelopeProgram=new _(e,jb,Hb,"nucleus:envelope"),this.envelopeMesh=U.fromData(e,ot(3),{position:g.position}),this.poreProgram=new _(e,Bb,Ub,"nucleus:pores"),this.poreMesh=U.fromData(e,yp(1,.34,14,7),{position:g.position,normal:g.normal}),this.backdrop.init(e),this.chromatin.init(e),this.strands.init(e);let n=ne(6060),r=new Float32Array(Gi*4);for(let l=0;l<Gi;l++){let u=1-l/(Gi-1)*2,d=Math.sqrt(Math.max(0,1-u*u)),f=l*2.399963229728653;r[l*4]=Math.cos(f)*d,r[l*4+1]=u,r[l*4+2]=Math.sin(f)*d,r[l*4+3]=.032+n()*.012}this.poreInstances=r;let o=new Float32Array(Wi*W),i=[],s=[];for(let l=0;l<Yn;l++){let u=1-l/(Yn-1)*2,d=Math.sqrt(Math.max(0,1-u*u)),f=l*2.399963229728653,p=.34+n()*.38;i.push([Math.cos(f)*d*p,u*p,Math.sin(f)*d*p]),s.push($b(l/Yn))}for(let l=0;l<Wi;l++){let u=l%Yn,d=i[u],f=s[u],p=.11+n()*.14,h=l*W;o[h]=d[0]+(n()*2-1)*p,o[h+1]=d[1]+(n()*2-1)*p,o[h+2]=d[2]+(n()*2-1)*p,o[h+3]=.008+n()*.017,o[h+4]=f[0],o[h+5]=f[1],o[h+6]=f[2],o[h+7]=n()*60}this.chromatin.upload(o,Wi);let a=new be(new Float32Array(Sp*fe)),c=Math.floor(Sp/Yn);for(let l=0;l<Yn;l++){let u=i[l],d=s[l],f=u[0],p=u[1],h=u[2],m=n()*2-1,v=n()*2-1,y=n()*2-1;for(let D=0;D<c;D++){m+=(n()*2-1)*.7,v+=(n()*2-1)*.7,y+=(n()*2-1)*.7;let b=Math.hypot(m,v,y)||1,I=.045,k=f+m/b*I,N=p+v/b*I,z=h+y/b*I;a.push(f,p,h,k,N,z,.006,d,.25,.85),f=k,p=N,h=z,m+=(u[0]-f)*2.4,v+=(u[1]-p)*2.4,y+=(u[2]-h)*2.4}}this.strands.upload(a.data,a.count)}poreInstances=null;poreMeshReady=!1;update(e){let n=Math.pow(2,-1.4+e.local*3.2),r=-5.2+e.local*8.6;ce(this.model,0,0,r,e.time*.035-e.local*.4,n)}render(e){let{gl:n}=e;this.backdrop.render(n,{top:[.024,.036,.088],bottom:[.006,.01,.03],glow:[.2,.28,.76],density:1.1,glowX:.24,glowY:-.14},e.time,e.alpha,e.width/e.height),this.strands.draw(e,this.model,e.alpha*.9,{roughness:.5,translucency:.4});let r=Math.round(Wi*e.quality);this.chromatin.draw(e,this.model,e.alpha*.62,{drift:.035,swirl:2.4},r),this.poreProgram&&this.poreMesh&&this.poreInstances&&(this.poreMeshReady||(this.poreMesh.attribute("pore",g.instance0,this.poreInstances,4,1),this.poreMeshReady=!0),this.poreProgram.use().m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uRadius",1).f("uAlpha",e.alpha),this.poreMesh.draw(Gi)),this.envelopeProgram&&this.envelopeMesh&&(n.disable(n.CULL_FACE),n.depthMask(!1),this.envelopeProgram.use().m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uTime",e.time).f("uAlpha",e.alpha),this.envelopeMesh.draw(),n.depthMask(!0),n.enable(n.CULL_FACE))}focus(e){return{distance:5.8-e.local*.7,aperture:4}}dispose(){this.envelopeProgram?.dispose(),this.envelopeProgram=null,this.envelopeMesh?.dispose(),this.envelopeMesh=null,this.poreProgram?.dispose(),this.poreProgram=null,this.poreMesh?.dispose(),this.poreMesh=null,this.poreMeshReady=!1,this.poreInstances=null,this.backdrop.dispose(),this.chromatin.dispose(),this.strands.dispose()}};function $b(t){let e=t*Math.PI*2;return[.45+.4*Math.sin(e),.6+.3*Math.sin(e+2.1),.8+.2*Math.sin(e+4.2)]}var Qr=260,zb=`${$}
${Gr}
${Ve}

layout(location = ${g.position}) in vec3 aPosition;
layout(location = ${g.instance0}) in vec4 aCell;   // xyz = centre, w = radius
layout(location = ${g.instance1}) in vec4 aTraits; // x = seed, yzw = tint

uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uTime;
uniform float uZoom;
uniform float uDepthOffset;
uniform float uWobble;

out vec3 vNormal;
out vec3 vView;
out vec3 vTint;
out float vSeed;
out float vFade;

/** Radial displacement of the membrane at a point on the unit sphere. */
float membrane(vec3 dir, float seed) {
  float slow = snoise(dir * 1.7 + vec3(seed, seed * 0.7, uTime * 0.16));
  float fine = snoise(dir * 4.3 + vec3(seed * 2.1, uTime * 0.24, seed));
  return (slow * 0.72 + fine * 0.28) * uWobble;
}

void main() {
  vec3 dir = normalize(aPosition);
  float seed = aTraits.x;

  // Finite-difference the displacement across two tangents so the normal stays
  // smooth. Deriving it in the fragment shader instead would facet the surface
  // at this triangle density, and these cells are mostly rim light.
  vec3 ref = abs(dir.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(dir, ref));
  vec3 t2 = cross(dir, t1);
  const float eps = 0.045;

  float d0 = membrane(dir, seed);
  float d1 = membrane(normalize(dir + t1 * eps), seed);
  float d2 = membrane(normalize(dir + t2 * eps), seed);

  vec3 p0 = dir * (1.0 + d0);
  vec3 p1 = normalize(dir + t1 * eps) * (1.0 + d1);
  vec3 p2 = normalize(dir + t2 * eps) * (1.0 + d2);
  vec3 localNormal = normalize(cross(p1 - p0, p2 - p0));
  // cross() above can flip depending on tangent handedness; align to the sphere.
  localNormal *= sign(dot(localNormal, dir));

  float radius = aCell.w * uZoom;
  vec3 centre = aCell.xyz * uZoom + vec3(0.0, 0.0, uDepthOffset);
  vec3 world = centre + p0 * radius;

  vNormal = localNormal;
  vView = uCameraPos - world;
  vTint = aTraits.yzw;
  vSeed = seed;

  // Fade cells out as they pass the lens instead of letting them clip through.
  float distanceToCamera = length(uCameraPos - centre);
  vFade = smoothstep(0.0, 2.2, distanceToCamera - radius * 0.4);

  gl_Position = uViewProjection * vec4(world, 1.0);
}
`,Gb=`${P}
${Gr}
${Ve}
${X}

in vec3 vNormal;
in vec3 vView;
in vec3 vTint;
in float vSeed;
in float vFade;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  float facing = clamp(dot(N, V), 0.0, 1.0);
  float rim = pow(1.0 - facing, 2.6);

  // Cells are mostly water: almost everything visible is the membrane's rim
  // and whatever light scatters back out of the interior.
  vec3 albedo = vTint * 0.55;
  vec3 lit = shadeMolecular(albedo, N, V, 0.42, 0.85, vec3(0.0));

  // Fake interior: organelle speckle that only shows where we look *through*
  // the cell, weighted by how face-on the surface is.
  float speckle = fbm(N * 5.5 + vec3(vSeed * 7.3, uTime * 0.09, vSeed), 3);
  vec3 interior = vTint * (0.35 + 0.65 * smoothstep(0.1, 0.8, speckle));
  lit += interior * facing * facing * 0.34;

  // Nucleus: a single bright core seen through the membrane.
  float core = pow(facing, 7.0);
  lit += mix(vec3(0.35, 0.72, 1.0), vTint, 0.35) * core * 0.5;

  lit += vec3(0.45, 0.86, 1.0) * rim * 0.5;

  // Low floor on purpose: with a couple of cells overlapping on most view
  // rays, a high constant term accumulates into a flat bright wash.
  float alpha = uAlpha * vFade * (0.12 + 0.62 * rim + 0.14 * facing);
  fragColor = vec4(lit * vFade, clamp(alpha, 0.0, 1.0));
}
`,Yi=class{id="tissue";label="Tissue";scale="10\u207B\xB3 m";caption="Roughly thirty trillion cells. Every one of them carries the same two metres of DNA, folded to fit inside a nucleus six micrometres across.";detail="Human tissue \xB7 ~20 \xB5m per cell";program=null;mesh=null;backdrop=new K;count=Qr;init(e){this.dispose(),this.program=new _(e,zb,Gb,"tissue:cells"),this.backdrop.init(e);let n=ot(2),r=U.fromData(e,n,{position:g.position}),o=new Float32Array(Qr*4),i=new Float32Array(Qr*4),s=ne(24301);for(let a=0;a<Qr;a++){let c=s()*Math.PI*2,l=1.1+Math.pow(s(),.7)*7.4;o[a*4]=Math.cos(c)*l,o[a*4+1]=Math.sin(c)*l*.78,o[a*4+2]=-22+s()*26,o[a*4+3]=.42+s()*.85;let u=s();i[a*4]=s()*40,i[a*4+1]=.24+u*.34,i[a*4+2]=.52+u*.24,i[a*4+3]=.86+(1-u)*.14}r.attribute("cell",g.instance0,o,4,1),r.attribute("traits",g.instance1,i,4,1),this.mesh=r}update(e){this.count=Math.max(60,Math.round(Qr*e.quality))}render(e){let{gl:n}=e;if(!this.program||!this.mesh)return;this.backdrop.render(n,{top:[.016,.035,.075],bottom:[.004,.008,.02],glow:[.1,.3,.62],density:.85,glowX:.18,glowY:.12},e.time,e.alpha,e.width/e.height),n.enable(n.BLEND),n.blendFunc(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA),n.depthMask(!1);let r=Math.pow(2,-.9+e.local*2.4);this.program.use().m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uTime",e.time).f("uAlpha",e.alpha).f("uZoom",r).f("uDepthOffset",-2+e.local*16).f("uWobble",.11),this.mesh.draw(this.count),n.depthMask(!0)}focus(e){return{distance:7.5-e.local*2,aperture:7}}dispose(){this.program?.dispose(),this.program=null,this.mesh?.dispose(),this.mesh=null,this.backdrop.dispose()}};var It=58,Wb=1e3,qb=9,ol=22,Zi=420,_p=.1,xp=ge.rise*_p,Qi=ge.backboneRadius*_p,il=`
uniform float uFork;
uniform float uBubbleWidth;
uniform float uOpenAmount;

float bubbleOpenness(float bp) {
  float d = (bp - uFork) / uBubbleWidth;
  return exp(-d * d) * uOpenAmount;
}
`,Yb=`${$}
${Qe}
${dn}
${il}

layout(location = ${g.param}) in vec2 aParam;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uBpCount;
uniform float uStrand;
uniform float uTubeRadius;

out vec3 vNormal;
out vec3 vView;
out float vBp;
out float vOpen;

vec3 strandPoint(float bp) {
  vec3 p = backbonePoint(bp, uStrand);
  // Inside the bubble the strands bow apart, template one way, coding the
  // other, which is what makes room for the polymerase to sit between them.
  float open = bubbleOpenness(bp);
  vec3 push = strandOutward(bp, uStrand) * open * 0.55;
  push.y += (uStrand * 2.0 - 1.0) * open * 0.10;
  return p + push;
}

void main() {
  float bp = (aParam.x - 0.5) * uBpCount;

  vec3 p = strandPoint(bp);
  vec3 n, bi;
  frameFromTangent(strandPoint(bp + 0.5) - strandPoint(bp - 0.5), n, bi);
  vec3 offset = n * cos(aParam.y) + bi * sin(aParam.y);

  vec4 world = uModel * vec4(p + offset * uTubeRadius, 1.0);
  vNormal = normalize(mat3(uModel) * offset);
  vView = uCameraPos - world.xyz;
  vBp = bp;
  vOpen = bubbleOpenness(bp);

  gl_Position = uViewProjection * world;
}
`,Zb=`${P}
${X}

in vec3 vNormal;
in vec3 vView;
in float vBp;
in float vOpen;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  vec3 albedo = vec3(0.30, 0.62, 0.80);
  // The open stretch runs hot: strained, unpaired, chemically reactive.
  albedo = mix(albedo, vec3(0.95, 0.55, 0.30), vOpen);

  float phase = vBp * 0.55 - uTime * 2.0;
  float pulse = pow(max(sin(phase) * 0.5 + 0.5, 0.0), 14.0);
  vec3 emissive = mix(vec3(0.3, 0.9, 1.0), vec3(1.0, 0.6, 0.25), vOpen) * (pulse * 0.7 + vOpen * 0.5);

  vec3 lit = shadeMolecular(albedo, N, V, 0.24, 0.2, emissive);
  fragColor = vec4(lit, uAlpha);
}
`,Qb=`${$}
${dn}
${il}

layout(location = ${g.position}) in vec3 aPosition;
layout(location = ${g.normal}) in vec3 aNormal;
layout(location = ${g.instance0}) in vec4 aBase;
layout(location = ${g.instance1}) in vec4 aColor;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uInnerRadius;
uniform float uThickness;
uniform float uWidth;

out vec3 vNormal;
out vec3 vView;
out vec3 vColor;
out float vOpen;
out float vSpan;

void main() {
  float bp = aBase.x;
  float strand = aBase.y;
  float open = bubbleOpenness(bp);

  vec3 axis = helixAxisPoint(bp);
  vec3 outward = strandOutward(bp, strand);
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 side = normalize(cross(up, outward));
  vec3 planeUp = normalize(cross(outward, side));

  float inner = mix(uInnerRadius * 1.32, uInnerRadius, aBase.z);

  // Unpaired bases swing up out of the stack and stop reaching across, which
  // is the whole point: the template face becomes readable.
  float reach = mix(uRadius - inner, (uRadius - inner) * 0.34, open);
  float swing = open * 1.1;

  float along = aPosition.x + 0.5;
  vec3 radial = outward * (uRadius + 0.55 * open - along * reach);
  vec3 lift = up * (along * swing * 0.42);

  vec3 local = axis + radial + lift
    + planeUp * (aPosition.y * uThickness)
    + side * (aPosition.z * uWidth);

  vec4 world = uModel * vec4(local, 1.0);
  vec3 nrm = outward * -aNormal.x + planeUp * aNormal.y + side * aNormal.z;

  vNormal = normalize(mat3(uModel) * nrm);
  vView = uCameraPos - world.xyz;
  vColor = aColor.rgb;
  vOpen = open;
  vSpan = along;

  gl_Position = uViewProjection * world;
}
`,Xb=`${P}
${X}

in vec3 vNormal;
in vec3 vView;
in vec3 vColor;
in float vOpen;
in float vSpan;

out vec4 fragColor;

uniform float uAlpha;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  float tip = smoothstep(0.35, 1.0, vSpan);
  vec3 emissive = vColor * (0.2 + tip * 0.7 + vOpen * 1.5);

  vec3 lit = shadeMolecular(vColor * 0.55, N, V, 0.3, 0.45, emissive);
  fragColor = vec4(lit, uAlpha);
}
`,Kb=`${$}
${Qe}
${dn}
${il}

layout(location = ${g.param}) in vec2 aParam;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform vec3 uCameraPos;
uniform float uBpCount;
uniform float uTubeRadius;
uniform float uTime;

out vec3 vNormal;
out vec3 vView;
out float vT;

/**
 * The growing transcript.
 *
 * It is copied off the template inside the bubble, then peels away from the
 * duplex as the polymerase moves on \u2014 so its shape is a function of how far
 * behind the fork each nucleotide is.
 */
vec3 mrnaPoint(float bp) {
  float behind = max(uFork - bp, 0.0);
  vec3 anchor = mix(helixAxisPoint(bp), backbonePoint(bp, 1.0), 0.55);

  float peel = smoothstep(0.0, 9.0, behind);
  float angle = bp * uTwist * 0.35 + 2.2;
  vec3 away = vec3(cos(angle), 0.0, sin(angle));

  vec3 p = anchor + away * peel * 1.35;
  p.y += peel * 0.55 + sin(behind * 0.4 + uTime * 1.3) * peel * 0.12;
  return p;
}

void main() {
  float start = -uBpCount * 0.5;
  float bp = mix(start, uFork, aParam.x);
  float step = max((uFork - start) * 0.004, 0.02);

  vec3 p = mrnaPoint(bp);
  vec3 n, bi;
  frameFromTangent(mrnaPoint(bp + step) - mrnaPoint(bp - step), n, bi);
  vec3 offset = n * cos(aParam.y) + bi * sin(aParam.y);

  vec4 world = uModel * vec4(p + offset * uTubeRadius, 1.0);
  vNormal = normalize(mat3(uModel) * offset);
  vView = uCameraPos - world.xyz;
  vT = aParam.x;

  gl_Position = uViewProjection * world;
}
`,Jb=`${P}
${X}

in vec3 vNormal;
in vec3 vView;
in float vT;

out vec4 fragColor;

uniform float uAlpha;
uniform float uTime;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  // RNA reads violet throughout the piece \u2014 uracil's colour, and a clear
  // signal that this is not the same molecule as the blue-green DNA.
  vec3 albedo = vec3(0.62, 0.36, 0.88);

  float flow = pow(max(sin(vT * 30.0 - uTime * 4.0) * 0.5 + 0.5, 0.0), 8.0);
  vec3 emissive = vec3(0.86, 0.45, 1.0) * (0.25 + flow * 0.9);

  vec3 lit = shadeMolecular(albedo, N, V, 0.3, 0.3, emissive);

  // Fade the newest end in, so nucleotides appear rather than pop.
  fragColor = vec4(lit, uAlpha * (1.0 - smoothstep(0.96, 1.0, vT)));
}
`,Xi=class{id="transcription";label="Transcription";scale="10\u207B\u2079 m";caption="RNA polymerase opens about fourteen base pairs at a time, copies the template strand into RNA \u2014 uracil in place of thymine \u2014 and lets the duplex close behind it.";detail="DNA \u2192 pre-mRNA \xB7 ~14 bp bubble";strandProgram=null;strandMesh=null;baseProgram=null;baseMesh=null;mrnaProgram=null;mrnaMesh=null;polymerase=new Ce(3);pool=new le;backdrop=new K;model=Z();blobWriter=new Me(new Float32Array(ol*ve));blobSeeds=[];fork=0;openAmount=0;init(e){this.dispose(),this.strandProgram=new _(e,Yb,Zb,"transcription:strands"),this.strandMesh=U.fromData(e,hn(Wb,qb),{param:g.param}),this.baseProgram=new _(e,Qb,Xb,"transcription:bases"),this.baseMesh=U.fromData(e,Ri(),{position:g.position,normal:g.normal}),this.mrnaProgram=new _(e,Kb,Jb,"transcription:mrna"),this.mrnaMesh=U.fromData(e,hn(600,7),{param:g.param});let n=new Float32Array(It*2*4),r=new Float32Array(It*2*4);for(let s=0;s<It;s++){let a=Te[s%Te.length],c=zn(a);for(let[l,u]of[[0,a],[1,c]]){let d=(s*2+l)*4;n[d]=s-It/2,n[d+1]=l,n[d+2]=u==="A"||u==="G"?1:0;let f=bt[u];r[d]=f[0],r[d+1]=f[1],r[d+2]=f[2],r[d+3]=1}}this.baseMesh.attribute("base",g.instance0,n,4,1),this.baseMesh.attribute("color",g.instance1,r,4,1),this.polymerase.init(e),this.pool.init(e),this.backdrop.init(e);let o=ne(2305);this.blobSeeds.length=0;for(let s=0;s<ol;s++)this.blobSeeds.push([(o()*2-1)*.62,(o()*2-1)*.5,(o()*2-1)*.62,.16+o()*.2]);let i=new Float32Array(Zi*W);for(let s=0;s<Zi;s++){let a=s*W;i[a]=(o()*2-1)*2.6,i[a+1]=(o()*2-1)*3.2,i[a+2]=(o()*2-1)*2.6,i[a+3]=.016+o()*.022;let c=bt[["A","U","G","C"][Math.floor(o()*4)]];i[a+4]=c[0],i[a+5]=c[1],i[a+6]=c[2],i[a+7]=o()*100}this.pool.upload(i,Zi)}update(e){this.openAmount=me(.02,.2,e.local)*(1-me(.88,1,e.local)),this.fork=gt(-It*.42,It*.46,me(.05,.95,e.local));let n=this.fork*xp,r=this.blobWriter;r.reset();for(let s=0;s<ol;s++){let[a,c,l,u]=this.blobSeeds[s],d=Math.sin(e.time*2.2+s*1.7)*.03;r.push(a*Qi*1.5+d,n+c*.55,l*Qi*1.5-d,u*(.9+.1*Math.sin(e.time*3+s)),[.58,.72,.86],.05)}this.polymerase.upload(r.data,r.count);let o=Math.pow(2,-.15+e.local*.75),i=-1+e.local*2.6;ce(this.model,0,-n*.55,i,e.time*.09+.6,o)}render(e){let{gl:n}=e;this.backdrop.render(n,{top:[.026,.024,.062],bottom:[.006,.005,.018],glow:[.36,.2,.62],density:.8,glowX:.3,glowY:-.2},e.time,e.alpha,e.width/e.height);let r=o=>o.m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",e.alpha).f("uTime",e.time).f("uRise",xp).f("uTwist",pn).f("uRadius",Qi).f("uStrandOffset",ge.strandOffset).f("uBend",.03).f("uFork",this.fork).f("uBubbleWidth",7).f("uOpenAmount",this.openAmount);if(this.strandProgram&&this.strandMesh){let o=r(this.strandProgram.use()).f("uBpCount",It).f("uTubeRadius",.082);for(let i of[0,1])o.f("uStrand",i),this.strandMesh.draw()}this.baseProgram&&this.baseMesh&&(r(this.baseProgram.use()).f("uInnerRadius",Qi*.2).f("uThickness",.055).f("uWidth",.16),this.baseMesh.draw(It*2)),this.mrnaProgram&&this.mrnaMesh&&(r(this.mrnaProgram.use()).f("uBpCount",It).f("uTubeRadius",.062),this.mrnaMesh.draw()),n.depthMask(!1),this.polymerase.draw(e,this.model,e.alpha*.42,{roughness:.55,translucency:.8}),n.depthMask(!0),this.pool.draw(e,this.model,e.alpha*.5,{drift:.22,swirl:.9},Math.round(Zi*e.quality))}focus(e){return{distance:6-e.local*.6,aperture:2.6}}dispose(){this.strandProgram?.dispose(),this.strandProgram=null,this.strandMesh?.dispose(),this.strandMesh=null,this.baseProgram?.dispose(),this.baseProgram=null,this.baseMesh?.dispose(),this.baseMesh=null,this.mrnaProgram?.dispose(),this.mrnaProgram=null,this.mrnaMesh?.dispose(),this.mrnaMesh=null,this.polymerase.dispose(),this.pool.dispose(),this.backdrop.dispose()}};var Zn=3.8,Np=[17,29];function al(t){let e=t+1;return e>=Np[0]&&e<=Np[1]?"helix":"coil"}function Rp(t=Vt,e=37137){let n=ne(e),r=[],o=[],i=[1,.18,0],s=[0,1,0];sl(i),Ap(i,s);let a=-14,c=0,l=0,u=0;for(let d=0;d<t.length;d++){let f=al(d);if(o.push(f),f==="helix"){u+=100*Math.PI/180;let h=eE(i,s),m=[s[0]*Math.cos(u)+h[0]*Math.sin(u),s[1]*Math.cos(u)+h[1]*Math.sin(u),s[2]*Math.cos(u)+h[2]*Math.sin(u)];a+=i[0]*1.5,c+=i[1]*1.5,l+=i[2]*1.5,r.push([a+m[0]*2.3,c+m[1]*2.3,l+m[2]*2.3]);continue}i[0]+=(n()*2-1)*.55,i[1]+=(n()*2-1)*.55,i[2]+=(n()*2-1)*.55;let p=.045;i[0]-=a*p,i[1]-=c*p,i[2]-=l*p,sl(i),Ap(i,s),u=0,a+=i[0]*Zn,c+=i[1]*Zn,l+=i[2]*Zn,r.push([a,c,l])}return tE(r),{positions:r,structure:o}}function Pp(t){let e=[];for(let n=0;n<t;n++)e.push([(n-t/2)*Zn*.92,Math.sin(n*1.9)*1.1,Math.cos(n*1.9)*.7]);return e}function sl(t){let e=Math.hypot(t[0],t[1],t[2])||1;t[0]/=e,t[1]/=e,t[2]/=e}function Ap(t,e){let n=t[0]*e[0]+t[1]*e[1]+t[2]*e[2];e[0]-=t[0]*n,e[1]-=t[1]*n,e[2]-=t[2]*n,Math.hypot(e[0],e[1],e[2])<1e-4&&(e[0]=t[1],e[1]=-t[2],e[2]=t[0]),sl(e)}function eE(t,e){return[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]]}function tE(t){let e=0,n=0,r=0;for(let o of t)e+=o[0],n+=o[1],r+=o[2];e/=t.length,n/=t.length,r/=t.length;for(let o of t)o[0]-=e,o[1]-=n,o[2]-=r}var mn=Vt.length,cl=46,Ki=320,Qn=.1,Ji=[0,-.55,0],es=class{id="translation";label="Translation";scale="10\u207B\u2079 m";caption="The ribosome reads three bases per amino acid. The chain leaves the exit tunnel and folds \u2014 here into one amphipathic helix on an otherwise disordered domain, the helix that MDM2 grips.";detail="60 codons \xB7 helix at residues 17\u201329 \xB7 F19 W23 L26";ribosome=new Ce(3);chain=new Ce(2);bonds=new ye(6);mrna=new ye(6);chaperones=new le;backdrop=new K;model=Z();folded=Rp();extended=Pp(mn);ribosomeWriter=new Me(new Float32Array(cl*ve));chainWriter=new Me(new Float32Array((mn+8)*ve));bondWriter=new be(new Float32Array((mn+12)*fe));mrnaWriter=new be(new Float32Array((mn*2+8)*fe));blobSeeds=[];synthesised=0;init(e){this.dispose(),this.ribosome.init(e),this.chain.init(e),this.bonds.init(e),this.mrna.init(e),this.chaperones.init(e),this.backdrop.init(e);let n=ne(6917);this.blobSeeds.length=0;for(let o=0;o<cl;o++){let i=o<cl*.62,s=i?.5:.38;this.blobSeeds.push([(n()*2-1)*s,(i?.16:-.24)+(n()*2-1)*(i?.3:.16),(n()*2-1)*s,(i?.17:.13)+n()*.12,i?0:1])}let r=new Float32Array(Ki*W);for(let o=0;o<Ki;o++){let i=o*W;r[i]=(n()*2-1)*2.4,r[i+1]=(n()*2-1)*2,r[i+2]=(n()*2-1)*2.4,r[i+3]=.012+n()*.02,r[i+4]=.45,r[i+5]=.72,r[i+6]=.95,r[i+7]=n()*120}this.chaperones.upload(r,Ki)}update(e){let n=me(.04,.82,e.local);this.synthesised=n*mn,this.buildRibosome(e),this.buildTranscript(e),this.buildChain(e);let r=Math.pow(2,-.1+e.local*.6);ce(this.model,0,.25,-.6+e.local*2.2,e.time*.11+.4,r)}buildRibosome(e){let n=this.ribosomeWriter;n.reset();let r=Math.sin(this.synthesised*Math.PI*2)*.012;for(let[o,i,s,a,c]of this.blobSeeds){let l=c?-r:r;n.push(o+l,i+Math.sin(e.time*1.6+o*8)*.006,s,a,c?[.52,.62,.78]:[.62,.68,.82],.04)}this.ribosome.upload(n.data,n.count)}buildTranscript(e){let n=this.mrnaWriter;n.reset();let r=this.synthesised,o=2.6;for(let i=0;i<mn;i++){let s=(i-r)*.115;if(s<-o||s>o)continue;let a=hp[i],c=s,l=-.42+Math.sin(s*1.4+e.time*.3)*.03;for(let u=0;u<3;u++){let d=a.codon[u],f=bt[d==="T"?"U":d],p=c+(u-1)*.032,h=1-un(Math.abs(s)/o),m=Math.abs(s)<.06?1:0;n.push(p,l,0,p,l,.055,.022,f,.35+m*1.2,h)}}this.mrna.upload(n.data,n.count)}buildChain(e){let n=this.chainWriter,r=this.bondWriter;n.reset(),r.reset();let o=Math.floor(this.synthesised),i=[],s=Ji[1]-.95,a=e.time*.35,c=Math.cos(a),l=Math.sin(a);for(let u=0;u<=o&&u<mn;u++){let d=this.synthesised-u,f=me(2,22,d),p=Fe(d,0,16)*Zn*Qn*.5,h=this.extended[u],m=[Ji[0]+h[1]*Qn*.5,Ji[1]-p,Ji[2]+h[2]*Qn*.5],v=this.folded.positions[u],y=v[0]*Qn,D=v[1]*Qn,b=v[2]*Qn,I=[y*c-b*l,s+D,y*l+b*c];i.push([gt(m[0],I[0],f),gt(m[1],I[1],f),gt(m[2],I[2],f)])}for(let u=0;u<i.length;u++){let d=Vt[u],f=fp[d],p=mp[f?.cls??"special"],[h,m,v]=i[u],y=pp.includes(u),D=al(u)==="helix",b=y?.055:D?.042:.036,I=y?1.1:D?.3:.08;if(n.push(h,m,v,b,p,I),u>0){let[k,N,z]=i[u-1];r.push(k,N,z,h,m,v,.016,p,D?.25:.05,1)}}this.chain.upload(n.data,n.count),this.bonds.upload(r.data,r.count)}render(e){let{gl:n}=e;this.backdrop.render(n,{top:[.03,.026,.058],bottom:[.008,.006,.018],glow:[.44,.26,.52],density:.8,glowX:-.26,glowY:.24},e.time,e.alpha,e.width/e.height),this.mrna.draw(e,this.model,e.alpha,{roughness:.35,translucency:.4}),this.bonds.draw(e,this.model,e.alpha,{roughness:.4,translucency:.3}),this.chain.draw(e,this.model,e.alpha,{roughness:.28,translucency:.4}),n.depthMask(!1),this.ribosome.draw(e,this.model,e.alpha*.4,{roughness:.6,translucency:.85}),n.depthMask(!0),this.chaperones.draw(e,this.model,e.alpha*.4,{drift:.3,swirl:.7},Math.round(Ki*e.quality))}focus(e){return{distance:6.1-e.local*.8,aperture:2.8}}dispose(){this.ribosome.dispose(),this.chain.dispose(),this.bonds.dispose(),this.mrna.dispose(),this.chaperones.dispose(),this.backdrop.dispose()}};function kp(){return[new Yi,new Li,new qi,new Vi,new Bi,new ki,new Xi,new es,new zi]}var Op=new Set(["helix","basepairs","transcription","translation"]);var nE=t=>[t];function rE(t,e){if(t&1&&(B(0,"p",6),R(1),F()),t&2){let n=he(2);x(),Le(" ",n.detail()," ")}}function oE(t,e){if(t&1&&(B(0,"div",0)(1,"div",1)(2,"span",2),R(3),F(),B(4,"h2",3),R(5),F(),B(6,"span",4),R(7),F()(),B(8,"p",5),R(9),F(),Rt(10,rE,2,1,"p",6),F()),t&2){let n=he();x(3),Le(" ",n.indexLabel()," "),x(2),Le(" ",n.title()," "),x(2),Le(" ",n.scale()," "),x(2),Le(" ",n.caption()," "),x(),Pt(n.detail()?10:-1)}}var ts=class t{stageId=ee.required();indexLabel=ee.required();title=ee.required();scale=ee.required();caption=ee.required();detail=ee(void 0);static \u0275fac=function(n){return new(n||t)};static \u0275cmp=Ye({type:t,selectors:[["dna-caption"]],hostAttrs:[1,"scrim-bottom","pointer-events-none","fixed","bottom-0","left-0","z-20","w-full","max-w-[34rem]","p-5","pt-16","md:pl-28","lg:pl-36","lg:pb-8"],inputs:{stageId:[1,"stageId"],indexLabel:[1,"indexLabel"],title:[1,"title"],scale:[1,"scale"],caption:[1,"caption"],detail:[1,"detail"]},decls:2,vars:2,consts:[[1,"animate-fade-up"],[1,"flex","items-baseline","gap-3"],[1,"font-mono","text-[10px]","tabular-nums","text-primary/80"],[1,"text-lg","font-medium","tracking-tight","text-foreground","md:text-xl"],[1,"font-mono","text-[10px]","tabular-nums","text-muted-foreground"],[1,"mt-2","max-w-prose","text-sm","leading-relaxed","text-muted-foreground"],[1,"mt-2","font-mono","text-[10px]","uppercase","tracking-[0.16em]","text-muted-foreground/60"]],template:function(n,r){n&1&&ht(0,oE,11,5,"div",0,Vc),n&2&&mt(Hc(0,nE,r.stageId()))},encapsulation:2,changeDetection:0})};function iE(t,e){if(t&1&&(B(0,"span"),R(1),F()),t&2){let n=e.$implicit,r=he(2);kt("color",r.colorFor(n)),x(),Oe(n)}}function sE(t,e){if(t&1&&(B(0,"div",0)(1,"div",3),R(2),F(),B(3,"div",4),ht(4,iE,2,3,"span",5,Fc),F()()),t&2){let n=he();x(2),Oe(n.sequenceLabel()),x(2),mt(n.window())}}function aE(t,e){if(t&1&&(B(0,"span",2),R(1),F()),t&2){let n=he();x(),Le("q",(n.quality()*100).toFixed(0))}}var cE={A:"var(--base-a)",T:"var(--base-t)",G:"var(--base-g)",C:"var(--base-c)",U:"var(--base-u)"},ns=class t{fps=ee.required();quality=ee.required();progress=ee.required();showSequence=ee(!1);sequenceLabel=ee("TP53 \xB7 coding sequence");sequenceStart=ee(0);depthLabel=rt(()=>`${(this.progress()*100).toFixed(0)}% depth`);window=rt(()=>{let e=Math.max(0,Math.min(this.sequenceStart(),Te.length-30));return Te.slice(e,e+30).split("")});colorFor(e){let n=cE[e];return n?`hsl(${n})`:`rgb(${bt[e].map(o=>Math.round(o*255)).join(",")})`}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=Ye({type:t,selectors:[["dna-hud"]],hostAttrs:[1,"scrim-bottom","pointer-events-none","fixed","bottom-0","right-0","z-20","hidden","p-5","pt-16","text-right","md:block","lg:pb-8"],inputs:{fps:[1,"fps"],quality:[1,"quality"],progress:[1,"progress"],showSequence:[1,"showSequence"],sequenceLabel:[1,"sequenceLabel"],sequenceStart:[1,"sequenceStart"]},decls:9,vars:6,consts:[[1,"mb-3","panel","px-3","py-2","text-left","animate-fade-in"],[1,"flex","items-center","justify-end","gap-4","font-mono","text-[10px]","tabular-nums","text-muted-foreground/70"],[1,"text-muted-foreground/40"],[1,"mono-label","mb-1.5"],[1,"font-mono","text-[11px]","leading-none","tracking-[0.08em]"],[3,"color"]],template:function(n,r){n&1&&(Rt(0,sE,6,1,"div",0),B(1,"div",1)(2,"span"),R(3),F(),B(4,"span",2),R(5,"\xB7"),F(),B(6,"span"),R(7),F(),Rt(8,aE,2,1,"span",2),F()),n&2&&(Pt(r.showSequence()?0:-1),x(3),Oe(r.depthLabel()),x(3),Ze("text-primary",r.fps()>=50),x(),Le("",r.fps().toFixed(0)," fps"),x(),Pt(r.quality()<.98?8:-1))},encapsulation:2,changeDetection:0})};var rs=class t{dismissed=ee.required();static \u0275fac=function(n){return new(n||t)};static \u0275cmp=Ye({type:t,selectors:[["dna-intro"]],hostAttrs:[1,"pointer-events-none","fixed","inset-0","z-30","flex","items-center","justify-center"],hostVars:4,hostBindings:function(n,r){n&2&&(kt("transition","opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)"),Ze("opacity-0",r.dismissed()))},inputs:{dismissed:[1,"dismissed"]},decls:13,vars:0,consts:[["aria-hidden","true",1,"absolute","inset-0","scrim-center"],[1,"relative","px-6","text-center"],[1,"mono-label","animate-fade-in"],[1,"mt-4","text-5xl","font-light","tracking-[-0.03em]","text-foreground","md:text-7xl"],[1,"mx-auto","mt-4","max-w-md","text-sm","leading-relaxed","text-muted-foreground"],[1,"mt-10","flex","flex-col","items-center","gap-2"],[1,"mono-label"],[1,"relative","block","h-6","w-px","overflow-hidden","bg-border/50"],[1,"absolute","inset-x-0","top-0","h-2","animate-scroll-hint","bg-primary"]],template:function(n,r){n&1&&(cn(0,"div",0),B(1,"div",1)(2,"p",2),R(3,"Angular 21 \xB7 WebGL2 \xB7 no 3D engine"),F(),B(4,"h1",3),R(5," Scale "),F(),B(6,"p",4),R(7," A continuous descent from living tissue to the double helix, and back out to the network a single gene holds together. "),F(),B(8,"div",5)(9,"span",6),R(10,"Scroll to descend"),F(),B(11,"span",7),cn(12,"span",8),F()()())},encapsulation:2,changeDetection:0})};var lE=(t,e)=>e.id;function uE(t,e){if(t&1){let n=kr();B(0,"button",2),bi("click",function(){let o=An(n).$index,i=he();return Rn(i.select.emit(o))}),cn(1,"span",3),B(2,"span",4)(3,"span",5),R(4),F(),B(5,"span",6),R(6),F()()()}if(t&2){let n=e.$implicit,r=e.$index,o=he();Ze("opacity-100",r===o.active())("opacity-45",r!==o.active()),vi("aria-current",r===o.active()?"true":null),x(),Ze("w-8",r===o.active())("w-4",r!==o.active())("bg-primary",r===o.active())("bg-border",r!==o.active()),x(2),Ze("text-primary",r===o.active())("text-muted-foreground",r!==o.active()),x(),Oe(n.label),x(),Ze("opacity-100",r===o.active())("opacity-0",r!==o.active()),x(),Oe(n.scale)}}var os=class t{items=ee.required();active=ee.required();select=Gf();static \u0275fac=function(n){return new(n||t)};static \u0275cmp=Ye({type:t,selectors:[["dna-scale-rail"]],hostAttrs:[1,"pointer-events-none","fixed","left-0","top-1/2","z-20","hidden","-translate-y-1/2","pl-5","md:block","lg:pl-8"],inputs:{items:[1,"items"],active:[1,"active"]},outputs:{select:"select"},decls:3,vars:0,consts:[["aria-label","Biological scales",1,"pointer-events-auto","flex","flex-col","gap-px"],["type","button",1,"group","flex","items-center","gap-3","py-1.5","text-left","transition-opacity","duration-300",3,"opacity-100","opacity-45"],["type","button",1,"group","flex","items-center","gap-3","py-1.5","text-left","transition-opacity","duration-300",3,"click"],[1,"h-px","transition-all","duration-500","ease-out"],[1,"flex","flex-col","leading-tight"],[1,"font-mono","text-[10px]","uppercase","tracking-[0.18em]","transition-colors","duration-300"],[1,"font-mono","text-[9px]","tabular-nums","text-muted-foreground/60","transition-opacity","duration-300"]],template:function(n,r){n&1&&(B(0,"nav",0),ht(1,uE,7,23,"button",1,lE),F()),n&2&&(x(),mt(r.items()))},encapsulation:2,changeDetection:0})};var dE=["canvas"],fE=(t,e)=>e.id;function pE(t,e){t&1&&(ae(0,"div",1)(1,"div",2)(2,"h1",3),R(3,"WebGL2 unavailable"),de(),ae(4,"p",4),R(5),de(),ae(6,"p",5),R(7," Try a current Chrome, Edge, Firefox or Safari with hardware acceleration on. "),de()()()),t&2&&(x(5),Oe(e))}function hE(t,e){if(t&1&&(ae(0,"li")(1,"h2"),R(2),de(),ae(3,"p"),R(4),de()()),t&2){let n=e.$implicit;x(2),wi("",n.label," (",n.scale,")"),x(2),Oe(n.caption)}}function mE(t,e){if(t&1){let n=kr();Pr(0,"canvas",6,0)(2,"div",7),ae(3,"header",8)(4,"div")(5,"p",9),R(6,"Scale"),de(),ae(7,"p",10),R(8,"A descent into DNA"),de()(),ae(9,"a",11),R(10,"Source"),de()(),ae(11,"dna-scale-rail",12),yi("select",function(o){An(n);let i=he();return Rn(i.goToStage(o))}),de(),Pr(12,"dna-caption",13)(13,"dna-hud",14)(14,"dna-intro",15),ae(15,"div",16)(16,"h1"),R(17,"Scale \u2014 a descent into DNA"),de(),ae(18,"ol"),ht(19,hE,5,3,"li",null,fE),de()()}if(t&2){let n=he();x(2),kt("height",n.trackHeight(),"vh"),x(9),an("items",n.railItems)("active",n.stageIndex()),x(),an("stageId",n.current().id)("indexLabel",n.indexLabel())("title",n.current().label)("scale",n.current().scale)("caption",n.current().caption)("detail",n.current().detail),x(),an("fps",n.fps())("quality",n.quality())("progress",n.progress())("showSequence",n.showSequence())("sequenceStart",n.sequenceStart()),x(),an("dismissed",n.introDismissed()),x(5),mt(n.stages)}}var is=class t{canvasRef=Wf("canvas");stages=kp();railItems=this.stages.map(({id:e,label:n,scale:r})=>({id:e,label:n,scale:r}));stageIndex=Ge(0);progress=Ge(0);fps=Ge(60);quality=Ge(1);introDismissed=Ge(!1);fatal=Ge(null);current=rt(()=>this.stages[this.stageIndex()]??this.stages[0]);indexLabel=rt(()=>`${String(this.stageIndex()+1).padStart(2,"0")} / ${String(this.stages.length).padStart(2,"0")}`);trackHeight=rt(()=>(this.stages.length+1)*100);showSequence=rt(()=>Op.has(this.current().id));sequenceStart=rt(()=>{let e=this.progress()*this.stages.length-this.stageIndex();return Math.round(e*60)});renderer=null;resizeObserver=null;lastPublishedProgress=-1;ngAfterViewInit(){let e=this.canvasRef()?.nativeElement;if(!e)return;try{this.renderer=new Ai(e,this.stages,{onStageChange:r=>this.stageIndex.set(r),onProgress:r=>{Math.abs(r-this.lastPublishedProgress)<8e-4||(this.lastPublishedProgress=r,this.progress.set(r))},onStats:(r,o)=>{this.fps.set(r),this.quality.set(o)}})}catch(r){this.fatal.set(r instanceof Error?r.message:String(r));return}this.syncSize(),this.resizeObserver=new ResizeObserver(()=>this.syncSize()),this.resizeObserver.observe(document.documentElement),window.addEventListener("scroll",this.handleScroll,{passive:!0}),window.addEventListener("pointermove",this.handlePointerMove,{passive:!0}),window.addEventListener("hashchange",this.handleHashChange),this.applyDeepLink();let n=this.scrollRange();this.renderer.snapProgress(n>0?window.scrollY/n:0),this.renderer.start()}ngOnDestroy(){window.removeEventListener("scroll",this.handleScroll),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("hashchange",this.handleHashChange),this.resizeObserver?.disconnect(),this.renderer?.dispose(),this.renderer=null}goToStage(e){let n=this.scrollRange();if(n<=0)return;let r=(e+.34)/this.stages.length*n;window.scrollTo({top:r,behavior:this.prefersReducedMotion()?"auto":"smooth"})}scrollRange(){return document.documentElement.scrollHeight-window.innerHeight}prefersReducedMotion(){return window.matchMedia("(prefers-reduced-motion: reduce)").matches}handleScroll=()=>{let e=this.scrollRange(),n=e>0?window.scrollY/e:0;this.renderer?.setProgress(n),window.scrollY>40&&!this.introDismissed()&&this.introDismissed.set(!0)};handlePointerMove=e=>{this.renderer?.setPointer(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight*2-1))};handleHashChange=()=>{this.applyDeepLink()};applyDeepLink(){let e=window.location.hash.replace("#","");if(!e)return;let n=this.stages.findIndex(o=>o.id===e);if(n<0)return;this.introDismissed.set(!0);let r=this.scrollRange();window.scrollTo({top:(n+.34)/this.stages.length*r,behavior:"auto"})}syncSize(){this.renderer?.resize(window.innerWidth,window.innerHeight,window.devicePixelRatio||1)}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=Ye({type:t,selectors:[["dna-root"]],viewQuery:function(n,r){n&1&&Ei(r.canvasRef,dE,5),n&2&&jc()},decls:2,vars:1,consts:[["canvas",""],[1,"fixed","inset-0","z-40","flex","items-center","justify-center","bg-background","p-6"],[1,"panel","max-w-md","p-6","text-center"],[1,"text-lg","font-medium"],[1,"mt-3","text-sm","leading-relaxed","text-muted-foreground"],[1,"mt-4","font-mono","text-[10px]","uppercase","tracking-[0.18em]","text-muted-foreground/60"],["aria-hidden","true",1,"fixed","inset-0","h-full","w-full"],["aria-hidden","true"],[1,"scrim-top","pointer-events-none","fixed","left-0","top-0","z-20","flex","w-full","items-start","justify-between","p-5","pb-16","lg:p-8","lg:pb-20"],[1,"font-mono","text-[11px]","uppercase","tracking-[0.3em]","text-foreground/80"],[1,"mono-label","mt-1"],["href","https://github.com/YuraTadevosyan/three-js-and-animations","target","_blank","rel","noopener noreferrer",1,"pointer-events-auto","mono-label","transition-colors","hover:text-primary"],[3,"select","items","active"],[3,"stageId","indexLabel","title","scale","caption","detail"],[3,"fps","quality","progress","showSequence","sequenceStart"],[3,"dismissed"],[1,"sr-only"]],template:function(n,r){if(n&1&&Rt(0,pE,8,1,"div",1)(1,mE,21,16),n&2){let o;Pt((o=r.fatal())?0:1,o)}},dependencies:[os,ts,ns,rs],encapsulation:2,changeDetection:0})};el(is,{providers:[Bc(),Na()]}).catch(t=>{console.error(t)});
