var sh=Object.defineProperty,ah=Object.defineProperties;var ch=Object.getOwnPropertyDescriptors;var Al=Object.getOwnPropertySymbols;var lh=Object.prototype.hasOwnProperty,uh=Object.prototype.propertyIsEnumerable;var Rl=(t,e,n)=>e in t?sh(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,Y=(t,e)=>{for(var n in e||={})lh.call(e,n)&&Rl(t,n,e[n]);if(Al)for(var n of Al(e))uh.call(e,n)&&Rl(t,n,e[n]);return t},J=(t,e)=>ah(t,ch(e));var fe=null,fo=!1,Rs=1,dh=null,pe=Symbol("SIGNAL");function T(t){let e=fe;return fe=t,e}function ho(){return fe}var Mn={version:0,lastCleanEpoch:0,dirty:!1,producers:void 0,producersTail:void 0,consumers:void 0,consumersTail:void 0,recomputing:!1,consumerAllowSignalWrites:!1,consumerIsAlwaysLive:!1,kind:"unknown",producerMustRecompute:()=>!1,producerRecomputeValue:()=>{},consumerMarkedDirty:()=>{},consumerOnSignalRead:()=>{}};function fr(t){if(fo)throw new Error("");if(fe===null)return;fe.consumerOnSignalRead(t);let e=fe.producersTail;if(e!==void 0&&e.producer===t)return;let n,r=fe.recomputing;if(r&&(n=e!==void 0?e.nextProducer:fe.producers,n!==void 0&&n.producer===t)){fe.producersTail=n,n.lastReadVersion=t.version;return}let o=t.consumersTail;if(o!==void 0&&o.consumer===fe&&(!r||ph(o,fe)))return;let i=xn(fe),s={producer:t,consumer:fe,nextProducer:n,prevConsumer:o,lastReadVersion:t.version,nextConsumer:void 0};fe.producersTail=s,e!==void 0?e.nextProducer=s:fe.producers=s,i&&Ll(t,s)}function Pl(){Rs++}function Ps(t){if(!(xn(t)&&!t.dirty)&&!(!t.dirty&&t.lastCleanEpoch===Rs)){if(!t.producerMustRecompute(t)&&!hr(t)){As(t);return}t.producerRecomputeValue(t),As(t)}}function ks(t){if(t.consumers===void 0)return;let e=fo;fo=!0;try{for(let n=t.consumers;n!==void 0;n=n.nextConsumer){let r=n.consumer;r.dirty||fh(r)}}finally{fo=e}}function Os(){return fe?.consumerAllowSignalWrites!==!1}function fh(t){t.dirty=!0,ks(t),t.consumerMarkedDirty?.(t)}function As(t){t.dirty=!1,t.lastCleanEpoch=Rs}function Sn(t){return t&&kl(t),T(t)}function kl(t){t.producersTail=void 0,t.recomputing=!0}function pr(t,e){T(e),t&&Ol(t)}function Ol(t){t.recomputing=!1;let e=t.producersTail,n=e!==void 0?e.nextProducer:t.producers;if(n!==void 0){if(xn(t))do n=Ls(n);while(n!==void 0);e!==void 0?e.nextProducer=void 0:t.producers=void 0}}function hr(t){for(let e=t.producers;e!==void 0;e=e.nextProducer){let n=e.producer,r=e.lastReadVersion;if(r!==n.version||(Ps(n),r!==n.version))return!0}return!1}function Xt(t){if(xn(t)){let e=t.producers;for(;e!==void 0;)e=Ls(e)}t.producers=void 0,t.producersTail=void 0,t.consumers=void 0,t.consumersTail=void 0}function Ll(t,e){let n=t.consumersTail,r=xn(t);if(n!==void 0?(e.nextConsumer=n.nextConsumer,n.nextConsumer=e):(e.nextConsumer=void 0,t.consumers=e),e.prevConsumer=n,t.consumersTail=e,!r)for(let o=t.producers;o!==void 0;o=o.nextProducer)Ll(o.producer,o)}function Ls(t){let e=t.producer,n=t.nextProducer,r=t.nextConsumer,o=t.prevConsumer;if(t.nextConsumer=void 0,t.prevConsumer=void 0,r!==void 0?r.prevConsumer=o:e.consumersTail=o,o!==void 0)o.nextConsumer=r;else if(e.consumers=r,!xn(e)){let i=e.producers;for(;i!==void 0;)i=Ls(i)}return n}function xn(t){return t.consumerIsAlwaysLive||t.consumers!==void 0}function Fs(t){dh?.(t)}function ph(t,e){let n=e.producersTail;if(n!==void 0){let r=e.producers;do{if(r===t)return!0;if(r===n)break;r=r.nextProducer}while(r!==void 0)}return!1}function Vs(t,e){return Object.is(t,e)}function mr(t,e){let n=Object.create(hh);n.computation=t,e!==void 0&&(n.equal=e);let r=()=>{if(Ps(n),fr(n),n.value===po)throw n.error;return n.value};return r[pe]=n,Fs(n),r}var _s=Symbol("UNSET"),Ns=Symbol("COMPUTING"),po=Symbol("ERRORED"),hh=J(Y({},Mn),{value:_s,dirty:!0,error:null,equal:Vs,kind:"computed",producerMustRecompute(t){return t.value===_s||t.value===Ns},producerRecomputeValue(t){if(t.value===Ns)throw new Error("");let e=t.value;t.value=Ns;let n=Sn(t),r,o=!1;try{r=t.computation(),T(null),o=e!==_s&&e!==po&&r!==po&&t.equal(e,r)}catch(i){r=po,t.error=i}finally{pr(t,n)}if(o){t.value=e;return}t.value=r,t.version++}});function mh(){throw new Error}var Fl=mh;function Vl(t){Fl(t)}function js(t){Fl=t}var gh=null;function Hs(t,e){let n=Object.create(mo);n.value=t,e!==void 0&&(n.equal=e);let r=()=>jl(n);return r[pe]=n,Fs(n),[r,s=>gr(n,s),s=>Hl(n,s)]}function jl(t){return fr(t),t.value}function gr(t,e){Os()||Vl(t),t.equal(t.value,e)||(t.value=e,vh(t))}function Hl(t,e){Os()||Vl(t),gr(t,e(t.value))}var mo=J(Y({},Mn),{equal:Vs,value:void 0,kind:"signal"});function vh(t){t.version++,Pl(),ks(t),gh?.(t)}var Bs=J(Y({},Mn),{consumerIsAlwaysLive:!0,consumerAllowSignalWrites:!0,dirty:!0,kind:"effect"});function $s(t){if(t.dirty=!1,t.version>0&&!hr(t))return;t.version++;let e=Sn(t);try{t.cleanup(),t.fn()}finally{pr(t,e)}}function De(t){return typeof t=="function"}function go(t){let n=t(r=>{Error.call(r),r.stack=new Error().stack});return n.prototype=Object.create(Error.prototype),n.prototype.constructor=n,n}var vo=go(t=>function(n){t(this),this.message=n?`${n.length} errors occurred during unsubscription:
${n.map((r,o)=>`${o+1}) ${r.toString()}`).join(`
  `)}`:"",this.name="UnsubscriptionError",this.errors=n});function vr(t,e){if(t){let n=t.indexOf(e);0<=n&&t.splice(n,1)}}var be=class t{constructor(e){this.initialTeardown=e,this.closed=!1,this._parentage=null,this._finalizers=null}unsubscribe(){let e;if(!this.closed){this.closed=!0;let{_parentage:n}=this;if(n)if(this._parentage=null,Array.isArray(n))for(let i of n)i.remove(this);else n.remove(this);let{initialTeardown:r}=this;if(De(r))try{r()}catch(i){e=i instanceof vo?i.errors:[i]}let{_finalizers:o}=this;if(o){this._finalizers=null;for(let i of o)try{Bl(i)}catch(s){e=e??[],s instanceof vo?e=[...e,...s.errors]:e.push(s)}}if(e)throw new vo(e)}}add(e){var n;if(e&&e!==this)if(this.closed)Bl(e);else{if(e instanceof t){if(e.closed||e._hasParent(this))return;e._addParent(this)}(this._finalizers=(n=this._finalizers)!==null&&n!==void 0?n:[]).push(e)}}_hasParent(e){let{_parentage:n}=this;return n===e||Array.isArray(n)&&n.includes(e)}_addParent(e){let{_parentage:n}=this;this._parentage=Array.isArray(n)?(n.push(e),n):n?[n,e]:e}_removeParent(e){let{_parentage:n}=this;n===e?this._parentage=null:Array.isArray(n)&&vr(n,e)}remove(e){let{_finalizers:n}=this;n&&vr(n,e),e instanceof t&&e._removeParent(this)}};be.EMPTY=(()=>{let t=new be;return t.closed=!0,t})();var Us=be.EMPTY;function yo(t){return t instanceof be||t&&"closed"in t&&De(t.remove)&&De(t.add)&&De(t.unsubscribe)}function Bl(t){De(t)?t():t.unsubscribe()}var Qe={onUnhandledError:null,onStoppedNotification:null,Promise:void 0,useDeprecatedSynchronousErrorHandling:!1,useDeprecatedNextContext:!1};var _n={setTimeout(t,e,...n){let{delegate:r}=_n;return r?.setTimeout?r.setTimeout(t,e,...n):setTimeout(t,e,...n)},clearTimeout(t){let{delegate:e}=_n;return(e?.clearTimeout||clearTimeout)(t)},delegate:void 0};function $l(t){_n.setTimeout(()=>{let{onUnhandledError:e}=Qe;if(e)e(t);else throw t})}function zs(){}var Ul=Gs("C",void 0,void 0);function zl(t){return Gs("E",void 0,t)}function Gl(t){return Gs("N",t,void 0)}function Gs(t,e,n){return{kind:t,value:e,error:n}}var Kt=null;function Nn(t){if(Qe.useDeprecatedSynchronousErrorHandling){let e=!Kt;if(e&&(Kt={errorThrown:!1,error:null}),t(),e){let{errorThrown:n,error:r}=Kt;if(Kt=null,n)throw r}}else t()}function ql(t){Qe.useDeprecatedSynchronousErrorHandling&&Kt&&(Kt.errorThrown=!0,Kt.error=t)}var Jt=class extends be{constructor(e){super(),this.isStopped=!1,e?(this.destination=e,yo(e)&&e.add(this)):this.destination=Eh}static create(e,n,r){return new An(e,n,r)}next(e){this.isStopped?Ws(Gl(e),this):this._next(e)}error(e){this.isStopped?Ws(zl(e),this):(this.isStopped=!0,this._error(e))}complete(){this.isStopped?Ws(Ul,this):(this.isStopped=!0,this._complete())}unsubscribe(){this.closed||(this.isStopped=!0,super.unsubscribe(),this.destination=null)}_next(e){this.destination.next(e)}_error(e){try{this.destination.error(e)}finally{this.unsubscribe()}}_complete(){try{this.destination.complete()}finally{this.unsubscribe()}}},yh=Function.prototype.bind;function qs(t,e){return yh.call(t,e)}var Ys=class{constructor(e){this.partialObserver=e}next(e){let{partialObserver:n}=this;if(n.next)try{n.next(e)}catch(r){bo(r)}}error(e){let{partialObserver:n}=this;if(n.error)try{n.error(e)}catch(r){bo(r)}else bo(e)}complete(){let{partialObserver:e}=this;if(e.complete)try{e.complete()}catch(n){bo(n)}}},An=class extends Jt{constructor(e,n,r){super();let o;if(De(e)||!e)o={next:e??void 0,error:n??void 0,complete:r??void 0};else{let i;this&&Qe.useDeprecatedNextContext?(i=Object.create(e),i.unsubscribe=()=>this.unsubscribe(),o={next:e.next&&qs(e.next,i),error:e.error&&qs(e.error,i),complete:e.complete&&qs(e.complete,i)}):o=e}this.destination=new Ys(o)}};function bo(t){Qe.useDeprecatedSynchronousErrorHandling?ql(t):$l(t)}function bh(t){throw t}function Ws(t,e){let{onStoppedNotification:n}=Qe;n&&_n.setTimeout(()=>n(t,e))}var Eh={closed:!0,next:zs,error:bh,complete:zs};var Wl=typeof Symbol=="function"&&Symbol.observable||"@@observable";function Yl(t){return t}function Zl(t){return t.length===0?Yl:t.length===1?t[0]:function(n){return t.reduce((r,o)=>o(r),n)}}var Rn=(()=>{class t{constructor(n){n&&(this._subscribe=n)}lift(n){let r=new t;return r.source=this,r.operator=n,r}subscribe(n,r,o){let i=Ih(n)?n:new An(n,r,o);return Nn(()=>{let{operator:s,source:a}=this;i.add(s?s.call(i,a):a?this._subscribe(i):this._trySubscribe(i))}),i}_trySubscribe(n){try{return this._subscribe(n)}catch(r){n.error(r)}}forEach(n,r){return r=Ql(r),new r((o,i)=>{let s=new An({next:a=>{try{n(a)}catch(c){i(c),s.unsubscribe()}},error:i,complete:o});this.subscribe(s)})}_subscribe(n){var r;return(r=this.source)===null||r===void 0?void 0:r.subscribe(n)}[Wl](){return this}pipe(...n){return Zl(n)(this)}toPromise(n){return n=Ql(n),new n((r,o)=>{let i;this.subscribe(s=>i=s,s=>o(s),()=>r(i))})}}return t.create=e=>new t(e),t})();function Ql(t){var e;return(e=t??Qe.Promise)!==null&&e!==void 0?e:Promise}function wh(t){return t&&De(t.next)&&De(t.error)&&De(t.complete)}function Ih(t){return t&&t instanceof Jt||wh(t)&&yo(t)}function Dh(t){return De(t?.lift)}function Xl(t){return e=>{if(Dh(e))return e.lift(function(n){try{return t(n,this)}catch(r){this.error(r)}});throw new TypeError("Unable to lift unknown Observable type")}}function Kl(t,e,n,r,o){return new Zs(t,e,n,r,o)}var Zs=class extends Jt{constructor(e,n,r,o,i,s){super(e),this.onFinalize=i,this.shouldUnsubscribe=s,this._next=n?function(a){try{n(a)}catch(c){e.error(c)}}:super._next,this._error=o?function(a){try{o(a)}catch(c){e.error(c)}finally{this.unsubscribe()}}:super._error,this._complete=r?function(){try{r()}catch(a){e.error(a)}finally{this.unsubscribe()}}:super._complete}unsubscribe(){var e;if(!this.shouldUnsubscribe||this.shouldUnsubscribe()){let{closed:n}=this;super.unsubscribe(),!n&&((e=this.onFinalize)===null||e===void 0||e.call(this))}}};var Jl=go(t=>function(){t(this),this.name="ObjectUnsubscribedError",this.message="object unsubscribed"});var gt=(()=>{class t extends Rn{constructor(){super(),this.closed=!1,this.currentObservers=null,this.observers=[],this.isStopped=!1,this.hasError=!1,this.thrownError=null}lift(n){let r=new Eo(this,this);return r.operator=n,r}_throwIfClosed(){if(this.closed)throw new Jl}next(n){Nn(()=>{if(this._throwIfClosed(),!this.isStopped){this.currentObservers||(this.currentObservers=Array.from(this.observers));for(let r of this.currentObservers)r.next(n)}})}error(n){Nn(()=>{if(this._throwIfClosed(),!this.isStopped){this.hasError=this.isStopped=!0,this.thrownError=n;let{observers:r}=this;for(;r.length;)r.shift().error(n)}})}complete(){Nn(()=>{if(this._throwIfClosed(),!this.isStopped){this.isStopped=!0;let{observers:n}=this;for(;n.length;)n.shift().complete()}})}unsubscribe(){this.isStopped=this.closed=!0,this.observers=this.currentObservers=null}get observed(){var n;return((n=this.observers)===null||n===void 0?void 0:n.length)>0}_trySubscribe(n){return this._throwIfClosed(),super._trySubscribe(n)}_subscribe(n){return this._throwIfClosed(),this._checkFinalizedStatuses(n),this._innerSubscribe(n)}_innerSubscribe(n){let{hasError:r,isStopped:o,observers:i}=this;return r||o?Us:(this.currentObservers=null,i.push(n),new be(()=>{this.currentObservers=null,vr(i,n)}))}_checkFinalizedStatuses(n){let{hasError:r,thrownError:o,isStopped:i}=this;r?n.error(o):i&&n.complete()}asObservable(){let n=new Rn;return n.source=this,n}}return t.create=(e,n)=>new Eo(e,n),t})(),Eo=class extends gt{constructor(e,n){super(),this.destination=e,this.source=n}next(e){var n,r;(r=(n=this.destination)===null||n===void 0?void 0:n.next)===null||r===void 0||r.call(n,e)}error(e){var n,r;(r=(n=this.destination)===null||n===void 0?void 0:n.error)===null||r===void 0||r.call(n,e)}complete(){var e,n;(n=(e=this.destination)===null||e===void 0?void 0:e.complete)===null||n===void 0||n.call(e)}_subscribe(e){var n,r;return(r=(n=this.source)===null||n===void 0?void 0:n.subscribe(e))!==null&&r!==void 0?r:Us}};var yr=class extends gt{constructor(e){super(),this._value=e}get value(){return this.getValue()}_subscribe(e){let n=super._subscribe(e);return!n.closed&&e.next(this._value),n}getValue(){let{hasError:e,thrownError:n,_value:r}=this;if(e)throw n;return this._throwIfClosed(),r}next(e){super.next(this._value=e)}};function Qs(t,e){return Xl((n,r)=>{let o=0;n.subscribe(Kl(r,i=>{r.next(t.call(e,i,o++))}))})}var Xs;function wo(){return Xs}function lt(t){let e=Xs;return Xs=t,e}var eu=Symbol("NotFound");function Pn(t){return t===eu||t?.name==="\u0275NotFound"}var da="https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss",N=class extends Error{code;constructor(e,n){super(Tr(e,n)),this.code=e}};function Th(t){return`NG0${Math.abs(t)}`}function Tr(t,e){return`${Th(t)}${e?": "+e:""}`}function j(t){for(let e in t)if(t[e]===j)return e;throw Error("")}function _o(t){if(typeof t=="string")return t;if(Array.isArray(t))return`[${t.map(_o).join(", ")}]`;if(t==null)return""+t;let e=t.overriddenName||t.name;if(e)return`${e}`;let n=t.toString();if(n==null)return""+n;let r=n.indexOf(`
`);return r>=0?n.slice(0,r):n}function No(t,e){return t?e?`${t} ${e}`:t:e||""}var Ch=j({__forward_ref__:j});function Ao(t){return t.__forward_ref__=Ao,t}function Re(t){return iu(t)?t():t}function iu(t){return typeof t=="function"&&t.hasOwnProperty(Ch)&&t.__forward_ref__===Ao}function ee(t){return{token:t.token,providedIn:t.providedIn||null,factory:t.factory,value:void 0}}function Ro(t){return Mh(t,Po)}function Mh(t,e){return t.hasOwnProperty(e)&&t[e]||null}function Sh(t){let e=t?.[Po]??null;return e||null}function Js(t){return t&&t.hasOwnProperty(Do)?t[Do]:null}var Po=j({\u0275prov:j}),Do=j({\u0275inj:j}),O=class{_desc;ngMetadataName="InjectionToken";\u0275prov;constructor(e,n){this._desc=e,this.\u0275prov=void 0,typeof n=="number"?this.__NG_ELEMENT_ID__=n:n!==void 0&&(this.\u0275prov=ee({token:this,providedIn:n.providedIn||"root",factory:n.factory}))}get multi(){return this}toString(){return`InjectionToken ${this._desc}`}};function fa(t){return t&&!!t.\u0275providers}var pa=j({\u0275cmp:j}),ha=j({\u0275dir:j}),ma=j({\u0275pipe:j});var ea=j({\u0275fac:j}),on=j({__NG_ELEMENT_ID__:j}),tu=j({__NG_ENV_ID__:j});function sn(t){return va(t,"@Component"),t[pa]||null}function ga(t){return va(t,"@Directive"),t[ha]||null}function su(t){return va(t,"@Pipe"),t[ma]||null}function va(t,e){if(t==null)throw new N(-919,!1)}function Lt(t){return typeof t=="string"?t:t==null?"":String(t)}var au=j({ngErrorCode:j}),xh=j({ngErrorMessage:j}),_h=j({ngTokenPath:j});function ya(t,e){return cu("",-200,e)}function ko(t,e){throw new N(-201,!1)}function cu(t,e,n){let r=new N(e,t);return r[au]=e,r[xh]=t,n&&(r[_h]=n),r}function Nh(t){return t[au]}var ta;function lu(){return ta}function Ae(t){let e=ta;return ta=t,e}function ba(t,e,n){let r=Ro(t);if(r&&r.providedIn=="root")return r.value===void 0?r.value=r.factory():r.value;if(n&8)return null;if(e!==void 0)return e;ko(t,"")}var Ah={},en=Ah,Rh="__NG_DI_FLAG__",na=class{injector;constructor(e){this.injector=e}retrieve(e,n){let r=tn(n)||0;try{return this.injector.get(e,r&8?null:en,r)}catch(o){if(Pn(o))return o;throw o}}};function Ph(t,e=0){let n=wo();if(n===void 0)throw new N(-203,!1);if(n===null)return ba(t,void 0,e);{let r=kh(e),o=n.retrieve(t,r);if(Pn(o)){if(r.optional)return null;throw o}return o}}function H(t,e=0){return(lu()||Ph)(Re(t),e)}function A(t,e){return H(t,tn(e))}function tn(t){return typeof t>"u"||typeof t=="number"?t:0|(t.optional&&8)|(t.host&&1)|(t.self&&2)|(t.skipSelf&&4)}function kh(t){return{optional:!!(t&8),host:!!(t&1),self:!!(t&2),skipSelf:!!(t&4)}}function ra(t){let e=[];for(let n=0;n<t.length;n++){let r=Re(t[n]);if(Array.isArray(r)){if(r.length===0)throw new N(900,!1);let o,i=0;for(let s=0;s<r.length;s++){let a=r[s],c=Oh(a);typeof c=="number"?c===-1?o=a.token:i|=c:o=a}e.push(H(o,i))}else e.push(H(r))}return e}function Oh(t){return t[Rh]}function On(t,e){let n=t.hasOwnProperty(ea);return n?t[ea]:null}function uu(t,e,n){if(t.length!==e.length)return!1;for(let r=0;r<t.length;r++){let o=t[r],i=e[r];if(n&&(o=n(o),i=n(i)),i!==o)return!1}return!0}function du(t){return t.flat(Number.POSITIVE_INFINITY)}function Oo(t,e){t.forEach(n=>Array.isArray(n)?Oo(n,e):e(n))}function Ea(t,e,n){e>=t.length?t.push(n):t.splice(e,0,n)}function Cr(t,e){return e>=t.length-1?t.pop():t.splice(e,1)[0]}function fu(t,e,n,r){let o=t.length;if(o==e)t.push(n,r);else if(o===1)t.push(r,t[0]),t[0]=n;else{for(o--,t.push(t[o-1],t[o]);o>e;){let i=o-2;t[o]=t[i],o--}t[e]=n,t[e+1]=r}}function Lo(t,e,n){let r=Ln(t,e);return r>=0?t[r|1]=n:(r=~r,fu(t,r,e,n)),r}function Fo(t,e){let n=Ln(t,e);if(n>=0)return t[n|1]}function Ln(t,e){return Lh(t,e,1)}function Lh(t,e,n){let r=0,o=t.length>>n;for(;o!==r;){let i=r+(o-r>>1),s=t[i<<n];if(e===s)return i<<n;s>e?o=i:r=i+1}return~(o<<n)}var an={},Xe=[],Fn=new O(""),wa=new O("",-1),Ia=new O(""),Er=class{get(e,n=en){if(n===en){let o=cu("",-201);throw o.name="\u0275NotFound",o}return n}};function Mr(t){return{\u0275providers:t}}function pu(t){return Mr([{provide:Fn,multi:!0,useValue:t}])}function hu(...t){return{\u0275providers:Da(!0,t),\u0275fromNgModule:!0}}function Da(t,...e){let n=[],r=new Set,o,i=s=>{n.push(s)};return Oo(e,s=>{let a=s;To(a,i,[],r)&&(o||=[],o.push(a))}),o!==void 0&&mu(o,i),n}function mu(t,e){for(let n=0;n<t.length;n++){let{ngModule:r,providers:o}=t[n];Ta(o,i=>{e(i,r)})}}function To(t,e,n,r){if(t=Re(t),!t)return!1;let o=null,i=Js(t),s=!i&&sn(t);if(!i&&!s){let c=t.ngModule;if(i=Js(c),i)o=c;else return!1}else{if(s&&!s.standalone)return!1;o=t}let a=r.has(o);if(s){if(a)return!1;if(r.add(o),s.dependencies){let c=typeof s.dependencies=="function"?s.dependencies():s.dependencies;for(let l of c)To(l,e,n,r)}}else if(i){if(i.imports!=null&&!a){r.add(o);let l;Oo(i.imports,u=>{To(u,e,n,r)&&(l||=[],l.push(u))}),l!==void 0&&mu(l,e)}if(!a){let l=On(o)||(()=>new o);e({provide:o,useFactory:l,deps:Xe},o),e({provide:Ia,useValue:o,multi:!0},o),e({provide:Fn,useValue:()=>H(o),multi:!0},o)}let c=i.providers;if(c!=null&&!a){let l=t;Ta(c,u=>{e(u,l)})}}else return!1;return o!==t&&t.providers!==void 0}function Ta(t,e){for(let n of t)fa(n)&&(n=n.\u0275providers),Array.isArray(n)?Ta(n,e):e(n)}var Fh=j({provide:String,useValue:j});function gu(t){return t!==null&&typeof t=="object"&&Fh in t}function Vh(t){return!!(t&&t.useExisting)}function jh(t){return!!(t&&t.useFactory)}function Co(t){return typeof t=="function"}var Sr=new O(""),Io={},nu={},Ks;function xr(){return Ks===void 0&&(Ks=new Er),Ks}var je=class{},nn=class extends je{parent;source;scopes;records=new Map;_ngOnDestroyHooks=new Set;_onDestroyHooks=[];get destroyed(){return this._destroyed}_destroyed=!1;injectorDefTypes;constructor(e,n,r,o){super(),this.parent=n,this.source=r,this.scopes=o,ia(e,s=>this.processProvider(s)),this.records.set(wa,kn(void 0,this)),o.has("environment")&&this.records.set(je,kn(void 0,this));let i=this.records.get(Sr);i!=null&&typeof i.value=="string"&&this.scopes.add(i.value),this.injectorDefTypes=new Set(this.get(Ia,Xe,{self:!0}))}retrieve(e,n){let r=tn(n)||0;try{return this.get(e,en,r)}catch(o){if(Pn(o))return o;throw o}}destroy(){br(this),this._destroyed=!0;let e=T(null);try{for(let r of this._ngOnDestroyHooks)r.ngOnDestroy();let n=this._onDestroyHooks;this._onDestroyHooks=[];for(let r of n)r()}finally{this.records.clear(),this._ngOnDestroyHooks.clear(),this.injectorDefTypes.clear(),T(e)}}onDestroy(e){return br(this),this._onDestroyHooks.push(e),()=>this.removeOnDestroy(e)}runInContext(e){br(this);let n=lt(this),r=Ae(void 0),o;try{return e()}finally{lt(n),Ae(r)}}get(e,n=en,r){if(br(this),e.hasOwnProperty(tu))return e[tu](this);let o=tn(r),i,s=lt(this),a=Ae(void 0);try{if(!(o&4)){let l=this.records.get(e);if(l===void 0){let u=zh(e)&&Ro(e);u&&this.injectableDefInScope(u)?l=kn(oa(e),Io):l=null,this.records.set(e,l)}if(l!=null)return this.hydrate(e,l,o)}let c=o&2?xr():this.parent;return n=o&8&&n===en?null:n,c.get(e,n)}catch(c){let l=Nh(c);throw l===-200||l===-201?new N(l,null):c}finally{Ae(a),lt(s)}}resolveInjectorInitializers(){let e=T(null),n=lt(this),r=Ae(void 0),o;try{let i=this.get(Fn,Xe,{self:!0});for(let s of i)s()}finally{lt(n),Ae(r),T(e)}}toString(){return"R3Injector[...]"}processProvider(e){e=Re(e);let n=Co(e)?e:Re(e&&e.provide),r=Bh(e);if(!Co(e)&&e.multi===!0){let o=this.records.get(n);o||(o=kn(void 0,Io,!0),o.factory=()=>ra(o.multi),this.records.set(n,o)),n=e,o.multi.push(e)}this.records.set(n,r)}hydrate(e,n,r){let o=T(null);try{if(n.value===nu)throw ya("");return n.value===Io&&(n.value=nu,n.value=n.factory(void 0,r)),typeof n.value=="object"&&n.value&&Uh(n.value)&&this._ngOnDestroyHooks.add(n.value),n.value}finally{T(o)}}injectableDefInScope(e){if(!e.providedIn)return!1;let n=Re(e.providedIn);return typeof n=="string"?n==="any"||this.scopes.has(n):this.injectorDefTypes.has(n)}removeOnDestroy(e){let n=this._onDestroyHooks.indexOf(e);n!==-1&&this._onDestroyHooks.splice(n,1)}};function oa(t){let e=Ro(t),n=e!==null?e.factory:On(t);if(n!==null)return n;if(t instanceof O)throw new N(-204,!1);if(t instanceof Function)return Hh(t);throw new N(-204,!1)}function Hh(t){if(t.length>0)throw new N(-204,!1);let n=Sh(t);return n!==null?()=>n.factory(t):()=>new t}function Bh(t){if(gu(t))return kn(void 0,t.useValue);{let e=vu(t);return kn(e,Io)}}function vu(t,e,n){let r;if(Co(t)){let o=Re(t);return On(o)||oa(o)}else if(gu(t))r=()=>Re(t.useValue);else if(jh(t))r=()=>t.useFactory(...ra(t.deps||[]));else if(Vh(t))r=(o,i)=>H(Re(t.useExisting),i!==void 0&&i&8?8:void 0);else{let o=Re(t&&(t.useClass||t.provide));if($h(t))r=()=>new o(...ra(t.deps));else return On(o)||oa(o)}return r}function br(t){if(t.destroyed)throw new N(-205,!1)}function kn(t,e,n=!1){return{factory:t,value:e,multi:n?[]:void 0}}function $h(t){return!!t.deps}function Uh(t){return t!==null&&typeof t=="object"&&typeof t.ngOnDestroy=="function"}function zh(t){return typeof t=="function"||typeof t=="object"&&t.ngMetadataName==="InjectionToken"}function ia(t,e){for(let n of t)Array.isArray(n)?ia(n,e):n&&fa(n)?ia(n.\u0275providers,e):e(n)}function Vo(t,e){let n;t instanceof nn?(br(t),n=t):n=new na(t);let r,o=lt(n),i=Ae(void 0);try{return e()}finally{lt(o),Ae(i)}}function yu(){return lu()!==void 0||wo()!=null}var Je=0,C=1,x=2,re=3,Be=4,$e=5,Vn=6,jn=7,X=8,Et=9,ut=10,W=11,Hn=12,Ca=13,cn=14,Ue=15,Ft=16,ln=17,dt=18,wt=19,Ma=20,yt=21,jo=22,kt=23,Pe=24,Ho=25,Vt=26,ue=27,bu=1,Sa=6,jt=7,_r=8,un=9,Z=10;function Ht(t){return Array.isArray(t)&&typeof t[bu]=="object"}function et(t){return Array.isArray(t)&&t[bu]===!0}function xa(t){return(t.flags&4)!==0}function Bt(t){return t.componentOffset>-1}function Bo(t){return(t.flags&1)===1}function dn(t){return!!t.template}function Bn(t){return(t[x]&512)!==0}function fn(t){return(t[x]&256)===256}var _a="svg",Eu="math";function ze(t){for(;Array.isArray(t);)t=t[Je];return t}function Na(t,e){return ze(e[t])}function tt(t,e){return ze(e[t.index])}function $o(t,e){return t.data[e]}function ft(t,e){let n=e[t];return Ht(n)?n:n[Je]}function Uo(t){return(t[x]&128)===128}function wu(t){return et(t[re])}function pt(t,e){return e==null?null:t[e]}function Aa(t){t[ln]=0}function Ra(t){t[x]&1024||(t[x]|=1024,Uo(t)&&$n(t))}function Iu(t,e){for(;t>0;)e=e[cn],t--;return e}function Nr(t){return!!(t[x]&9216||t[Pe]?.dirty)}function zo(t){t[ut].changeDetectionScheduler?.notify(8),t[x]&64&&(t[x]|=1024),Nr(t)&&$n(t)}function $n(t){t[ut].changeDetectionScheduler?.notify(0);let e=Ot(t);for(;e!==null&&!(e[x]&8192||(e[x]|=8192,!Uo(e)));)e=Ot(e)}function Pa(t,e){if(fn(t))throw new N(911,!1);t[yt]===null&&(t[yt]=[]),t[yt].push(e)}function Du(t,e){if(t[yt]===null)return;let n=t[yt].indexOf(e);n!==-1&&t[yt].splice(n,1)}function Ot(t){let e=t[re];return et(e)?e[re]:e}function ka(t){return t[jn]??=[]}function Oa(t){return t.cleanup??=[]}function Tu(t,e,n,r){let o=ka(e);o.push(n),t.firstCreatePass&&Oa(t).push(r,o.length-1)}var _={lFrame:ju(null),bindingsEnabled:!0,skipHydrationRootTNode:null};var sa=!1;function Cu(){return _.lFrame.elementDepthCount}function Mu(){_.lFrame.elementDepthCount++}function La(){_.lFrame.elementDepthCount--}function Su(){return _.bindingsEnabled}function xu(){return _.skipHydrationRootTNode!==null}function Fa(t){return _.skipHydrationRootTNode===t}function Va(){_.skipHydrationRootTNode=null}function R(){return _.lFrame.lView}function Ee(){return _.lFrame.tView}function ke(t){return _.lFrame.contextLView=t,t[X]}function Oe(t){return _.lFrame.contextLView=null,t}function Ge(){let t=ja();for(;t!==null&&t.type===64;)t=t.parent;return t}function ja(){return _.lFrame.currentTNode}function _u(){let t=_.lFrame,e=t.currentTNode;return t.isParent?e:e.parent}function Un(t,e){let n=_.lFrame;n.currentTNode=t,n.isParent=e}function Ha(){return _.lFrame.isParent}function Nu(){_.lFrame.isParent=!1}function Ba(){return sa}function wr(t){let e=sa;return sa=t,e}function Au(){let t=_.lFrame,e=t.bindingRootIndex;return e===-1&&(e=t.bindingRootIndex=t.tView.bindingStartIndex),e}function $a(){return _.lFrame.bindingIndex}function Ru(t){return _.lFrame.bindingIndex=t}function pn(){return _.lFrame.bindingIndex++}function Ar(t){let e=_.lFrame,n=e.bindingIndex;return e.bindingIndex=e.bindingIndex+t,n}function Pu(){return _.lFrame.inI18n}function ku(t,e){let n=_.lFrame;n.bindingIndex=n.bindingRootIndex=t,Go(e)}function Ou(){return _.lFrame.currentDirectiveIndex}function Go(t){_.lFrame.currentDirectiveIndex=t}function Lu(t){let e=_.lFrame.currentDirectiveIndex;return e===-1?null:t[e]}function Fu(){return _.lFrame.currentQueryIndex}function qo(t){_.lFrame.currentQueryIndex=t}function Gh(t){let e=t[C];return e.type===2?e.declTNode:e.type===1?t[$e]:null}function Ua(t,e,n){if(n&4){let o=e,i=t;for(;o=o.parent,o===null&&!(n&1);)if(o=Gh(i),o===null||(i=i[cn],o.type&10))break;if(o===null)return!1;e=o,t=i}let r=_.lFrame=Vu();return r.currentTNode=e,r.lView=t,!0}function Wo(t){let e=Vu(),n=t[C];_.lFrame=e,e.currentTNode=n.firstChild,e.lView=t,e.tView=n,e.contextLView=t,e.bindingIndex=n.bindingStartIndex,e.inI18n=!1}function Vu(){let t=_.lFrame,e=t===null?null:t.child;return e===null?ju(t):e}function ju(t){let e={currentTNode:null,isParent:!0,lView:null,tView:null,selectedIndex:-1,contextLView:null,elementDepthCount:0,currentNamespace:null,currentDirectiveIndex:-1,bindingRootIndex:-1,bindingIndex:-1,currentQueryIndex:0,parent:t,child:null,inI18n:!1};return t!==null&&(t.child=e),e}function Hu(){let t=_.lFrame;return _.lFrame=t.parent,t.currentTNode=null,t.lView=null,t}var za=Hu;function Yo(){let t=Hu();t.isParent=!0,t.tView=null,t.selectedIndex=-1,t.contextLView=null,t.elementDepthCount=0,t.currentDirectiveIndex=-1,t.currentNamespace=null,t.bindingRootIndex=-1,t.bindingIndex=-1,t.currentQueryIndex=0}function Bu(t){return(_.lFrame.contextLView=Iu(t,_.lFrame.contextLView))[X]}function nt(){return _.lFrame.selectedIndex}function $t(t){_.lFrame.selectedIndex=t}function Zo(){let t=_.lFrame;return $o(t.tView,t.selectedIndex)}function Qo(){_.lFrame.currentNamespace=_a}function Xo(){qh()}function qh(){_.lFrame.currentNamespace=null}function Ga(){return _.lFrame.currentNamespace}var $u=!0;function Ko(){return $u}function Jo(t){$u=t}function aa(t,e=null,n=null,r){let o=Uu(t,e,n,r);return o.resolveInjectorInitializers(),o}function Uu(t,e=null,n=null,r,o=new Set){let i=[n||Xe,hu(t)],s;return new nn(i,e||xr(),s||null,o)}var bt=class t{static THROW_IF_NOT_FOUND=en;static NULL=new Er;static create(e,n){if(Array.isArray(e))return aa({name:""},n,e,"");{let r=e.name??"";return aa({name:r},e.parent,e.providers,r)}}static \u0275prov=ee({token:t,providedIn:"any",factory:()=>H(wa)});static __NG_ELEMENT_ID__=-1},qe=new O(""),Ut=(()=>{class t{static __NG_ELEMENT_ID__=Wh;static __NG_ENV_ID__=n=>n}return t})(),Mo=class extends Ut{_lView;constructor(e){super(),this._lView=e}get destroyed(){return fn(this._lView)}onDestroy(e){let n=this._lView;return Pa(n,e),()=>Du(n,e)}};function Wh(){return new Mo(R())}var zu=!1,Gu=new O(""),zn=(()=>{class t{taskId=0;pendingTasks=new Set;destroyed=!1;pendingTask=new yr(!1);debugTaskTracker=A(Gu,{optional:!0});get hasPendingTasks(){return this.destroyed?!1:this.pendingTask.value}get hasPendingTasksObservable(){return this.destroyed?new Rn(n=>{n.next(!1),n.complete()}):this.pendingTask}add(){!this.hasPendingTasks&&!this.destroyed&&this.pendingTask.next(!0);let n=this.taskId++;return this.pendingTasks.add(n),this.debugTaskTracker?.add(n),n}has(n){return this.pendingTasks.has(n)}remove(n){this.pendingTasks.delete(n),this.debugTaskTracker?.remove(n),this.pendingTasks.size===0&&this.hasPendingTasks&&this.pendingTask.next(!1)}ngOnDestroy(){this.pendingTasks.clear(),this.hasPendingTasks&&this.pendingTask.next(!1),this.destroyed=!0,this.pendingTask.unsubscribe()}static \u0275prov=ee({token:t,providedIn:"root",factory:()=>new t})}return t})(),ca=class extends gt{__isAsync;destroyRef=void 0;pendingTasks=void 0;constructor(e=!1){super(),this.__isAsync=e,yu()&&(this.destroyRef=A(Ut,{optional:!0})??void 0,this.pendingTasks=A(zn,{optional:!0})??void 0)}emit(e){let n=T(null);try{super.next(e)}finally{T(n)}}subscribe(e,n,r){let o=e,i=n||(()=>null),s=r;if(e&&typeof e=="object"){let c=e;o=c.next?.bind(c),i=c.error?.bind(c),s=c.complete?.bind(c)}this.__isAsync&&(i=this.wrapInTimeout(i),o&&(o=this.wrapInTimeout(o)),s&&(s=this.wrapInTimeout(s)));let a=super.subscribe({next:o,error:i,complete:s});return e instanceof be&&e.add(a),a}wrapInTimeout(e){return n=>{let r=this.pendingTasks?.add();setTimeout(()=>{try{e(n)}finally{r!==void 0&&this.pendingTasks?.remove(r)}})}}},vt=ca;function So(...t){}function qa(t){let e,n;function r(){t=So;try{n!==void 0&&typeof cancelAnimationFrame=="function"&&cancelAnimationFrame(n),e!==void 0&&clearTimeout(e)}catch{}}return e=setTimeout(()=>{t(),r()}),typeof requestAnimationFrame=="function"&&(n=requestAnimationFrame(()=>{t(),r()})),()=>r()}function qu(t){return queueMicrotask(()=>t()),()=>{t=So}}var Wa="isAngularZone",Ir=Wa+"_ID",Yh=0,He=class t{hasPendingMacrotasks=!1;hasPendingMicrotasks=!1;isStable=!0;onUnstable=new vt(!1);onMicrotaskEmpty=new vt(!1);onStable=new vt(!1);onError=new vt(!1);constructor(e){let{enableLongStackTrace:n=!1,shouldCoalesceEventChangeDetection:r=!1,shouldCoalesceRunChangeDetection:o=!1,scheduleInRootZone:i=zu}=e;if(typeof Zone>"u")throw new N(908,!1);Zone.assertZonePatched();let s=this;s._nesting=0,s._outer=s._inner=Zone.current,Zone.TaskTrackingZoneSpec&&(s._inner=s._inner.fork(new Zone.TaskTrackingZoneSpec)),n&&Zone.longStackTraceZoneSpec&&(s._inner=s._inner.fork(Zone.longStackTraceZoneSpec)),s.shouldCoalesceEventChangeDetection=!o&&r,s.shouldCoalesceRunChangeDetection=o,s.callbackScheduled=!1,s.scheduleInRootZone=i,Xh(s)}static isInAngularZone(){return typeof Zone<"u"&&Zone.current.get(Wa)===!0}static assertInAngularZone(){if(!t.isInAngularZone())throw new N(909,!1)}static assertNotInAngularZone(){if(t.isInAngularZone())throw new N(909,!1)}run(e,n,r){return this._inner.run(e,n,r)}runTask(e,n,r,o){let i=this._inner,s=i.scheduleEventTask("NgZoneEvent: "+o,e,Zh,So,So);try{return i.runTask(s,n,r)}finally{i.cancelTask(s)}}runGuarded(e,n,r){return this._inner.runGuarded(e,n,r)}runOutsideAngular(e){return this._outer.run(e)}},Zh={};function Ya(t){if(t._nesting==0&&!t.hasPendingMicrotasks&&!t.isStable)try{t._nesting++,t.onMicrotaskEmpty.emit(null)}finally{if(t._nesting--,!t.hasPendingMicrotasks)try{t.runOutsideAngular(()=>t.onStable.emit(null))}finally{t.isStable=!0}}}function Qh(t){if(t.isCheckStableRunning||t.callbackScheduled)return;t.callbackScheduled=!0;function e(){qa(()=>{t.callbackScheduled=!1,la(t),t.isCheckStableRunning=!0,Ya(t),t.isCheckStableRunning=!1})}t.scheduleInRootZone?Zone.root.run(()=>{e()}):t._outer.run(()=>{e()}),la(t)}function Xh(t){let e=()=>{Qh(t)},n=Yh++;t._inner=t._inner.fork({name:"angular",properties:{[Wa]:!0,[Ir]:n,[Ir+n]:!0},onInvokeTask:(r,o,i,s,a,c)=>{if(Kh(c))return r.invokeTask(i,s,a,c);try{return ru(t),r.invokeTask(i,s,a,c)}finally{(t.shouldCoalesceEventChangeDetection&&s.type==="eventTask"||t.shouldCoalesceRunChangeDetection)&&e(),ou(t)}},onInvoke:(r,o,i,s,a,c,l)=>{try{return ru(t),r.invoke(i,s,a,c,l)}finally{t.shouldCoalesceRunChangeDetection&&!t.callbackScheduled&&!Jh(c)&&e(),ou(t)}},onHasTask:(r,o,i,s)=>{r.hasTask(i,s),o===i&&(s.change=="microTask"?(t._hasPendingMicrotasks=s.microTask,la(t),Ya(t)):s.change=="macroTask"&&(t.hasPendingMacrotasks=s.macroTask))},onHandleError:(r,o,i,s)=>(r.handleError(i,s),t.runOutsideAngular(()=>t.onError.emit(s)),!1)})}function la(t){t._hasPendingMicrotasks||(t.shouldCoalesceEventChangeDetection||t.shouldCoalesceRunChangeDetection)&&t.callbackScheduled===!0?t.hasPendingMicrotasks=!0:t.hasPendingMicrotasks=!1}function ru(t){t._nesting++,t.isStable&&(t.isStable=!1,t.onUnstable.emit(null))}function ou(t){t._nesting--,Ya(t)}var Dr=class{hasPendingMicrotasks=!1;hasPendingMacrotasks=!1;isStable=!0;onUnstable=new vt;onMicrotaskEmpty=new vt;onStable=new vt;onError=new vt;run(e,n,r){return e.apply(n,r)}runGuarded(e,n,r){return e.apply(n,r)}runOutsideAngular(e){return e()}runTask(e,n,r,o){return e.apply(n,r)}};function Kh(t){return Wu(t,"__ignore_ng_zone__")}function Jh(t){return Wu(t,"__scheduler_tick__")}function Wu(t,e){return!Array.isArray(t)||t.length!==1?!1:t[0]?.data?.[e]===!0}var Ke=class{_console=console;handleError(e){this._console.error("ERROR",e)}},hn=new O("",{factory:()=>{let t=A(He),e=A(je),n;return r=>{t.runOutsideAngular(()=>{e.destroyed&&!n?setTimeout(()=>{throw r}):(n??=e.get(Ke),n.handleError(r))})}}}),Yu={provide:Fn,useValue:()=>{let t=A(Ke,{optional:!0})},multi:!0},em=new O("",{factory:()=>{let t=A(qe).defaultView;if(!t)return;let e=A(hn),n=i=>{e(i.reason),i.preventDefault()},r=i=>{i.error?e(i.error):e(new Error(i.message,{cause:i})),i.preventDefault()},o=()=>{t.addEventListener("unhandledrejection",n),t.addEventListener("error",r)};typeof Zone<"u"?Zone.root.run(o):o(),A(Ut).onDestroy(()=>{t.removeEventListener("error",r),t.removeEventListener("unhandledrejection",n)})}});function Za(){return Mr([pu(()=>{A(em)})])}function he(t,e){let[n,r,o]=Hs(t,e?.equal),i=n,s=i[pe];return i.set=r,i.update=o,i.asReadonly=Qa.bind(i),i}function Qa(){let t=this[pe];if(t.readonlyFn===void 0){let e=()=>this();e[pe]=t,t.readonlyFn=e}return t.readonlyFn}var ei=(()=>{class t{view;node;constructor(n,r){this.view=n,this.node=r}static __NG_ELEMENT_ID__=tm}return t})();function tm(){return new ei(R(),Ge())}var rn=class{},Rr=new O("",{factory:()=>!0});var Xa=new O("");var ti=(()=>{class t{static \u0275prov=ee({token:t,providedIn:"root",factory:()=>new ua})}return t})(),ua=class{dirtyEffectCount=0;queues=new Map;add(e){this.enqueue(e),this.schedule(e)}schedule(e){e.dirty&&this.dirtyEffectCount++}remove(e){let n=e.zone,r=this.queues.get(n);r.has(e)&&(r.delete(e),e.dirty&&this.dirtyEffectCount--)}enqueue(e){let n=e.zone;this.queues.has(n)||this.queues.set(n,new Set);let r=this.queues.get(n);r.has(e)||r.add(e)}flush(){for(;this.dirtyEffectCount>0;){let e=!1;for(let[n,r]of this.queues)n===null?e||=this.flushQueue(r):e||=n.run(()=>this.flushQueue(r));e||(this.dirtyEffectCount=0)}}flushQueue(e){let n=!1;for(let r of e)r.dirty&&(this.dirtyEffectCount--,n=!0,r.run());return n}},xo=class{[pe];constructor(e){this[pe]=e}destroy(){this[pe].destroy()}};function ni(t,e){let n=e?.injector??A(bt),r=e?.manualCleanup!==!0?n.get(Ut):null,o,i=n.get(ei,null,{optional:!0}),s=n.get(rn);return i!==null?(o=om(i.view,s,t),r instanceof Mo&&r._lView===i.view&&(r=null)):o=im(t,n.get(ti),s),o.injector=n,r!==null&&(o.onDestroyFns=[r.onDestroy(()=>o.destroy())]),new xo(o)}var Zu=J(Y({},Bs),{cleanupFns:void 0,zone:null,onDestroyFns:null,run(){let t=wr(!1);try{$s(this)}finally{wr(t)}},cleanup(){if(!this.cleanupFns?.length)return;let t=T(null);try{for(;this.cleanupFns.length;)this.cleanupFns.pop()()}finally{this.cleanupFns=[],T(t)}}}),nm=J(Y({},Zu),{consumerMarkedDirty(){this.scheduler.schedule(this),this.notifier.notify(12)},destroy(){if(Xt(this),this.onDestroyFns!==null)for(let t of this.onDestroyFns)t();this.cleanup(),this.scheduler.remove(this)}}),rm=J(Y({},Zu),{consumerMarkedDirty(){this.view[x]|=8192,$n(this.view),this.notifier.notify(13)},destroy(){if(Xt(this),this.onDestroyFns!==null)for(let t of this.onDestroyFns)t();this.cleanup(),this.view[kt]?.delete(this)}});function om(t,e,n){let r=Object.create(rm);return r.view=t,r.zone=typeof Zone<"u"?Zone.current:null,r.notifier=e,r.fn=Qu(r,n),t[kt]??=new Set,t[kt].add(r),r.consumerMarkedDirty(r),r}function im(t,e,n){let r=Object.create(nm);return r.fn=Qu(r,t),r.scheduler=e,r.notifier=n,r.zone=typeof Zone<"u"?Zone.current:null,r.scheduler.add(r),r.notifier.notify(12),r}function Qu(t,e){return()=>{e(n=>(t.cleanupFns??=[]).push(n))}}function Sd(t){return{toString:t}.toString()}function gm(t){return typeof t=="function"}function xd(t,e,n,r){e!==null?e.applyValueToInputSignal(e,r):t[n]=r}var li=class{previousValue;currentValue;firstChange;constructor(e,n,r){this.previousValue=e,this.currentValue=n,this.firstChange=r}isFirstChange(){return this.firstChange}};function vm(t){return t.type.prototype.ngOnChanges&&(t.setInput=bm),ym}function ym(){let t=Nd(this),e=t?.current;if(e){let n=t.previous;if(n===an)t.previous=e;else for(let r in e)n[r]=e[r];t.current=null,this.ngOnChanges(e)}}function bm(t,e,n,r,o){let i=this.declaredInputs[r],s=Nd(t)||Em(t,{previous:an,current:null}),a=s.current||(s.current={}),c=s.previous,l=c[i];a[i]=new li(l&&l.currentValue,n,c===an),xd(t,e,o,n)}var _d="__ngSimpleChanges__";function Nd(t){return t[_d]||null}function Em(t,e){return t[_d]=e}var Xu=[];var B=function(t,e=null,n){for(let r=0;r<Xu.length;r++){let o=Xu[r];o(t,e,n)}},L=(function(t){return t[t.TemplateCreateStart=0]="TemplateCreateStart",t[t.TemplateCreateEnd=1]="TemplateCreateEnd",t[t.TemplateUpdateStart=2]="TemplateUpdateStart",t[t.TemplateUpdateEnd=3]="TemplateUpdateEnd",t[t.LifecycleHookStart=4]="LifecycleHookStart",t[t.LifecycleHookEnd=5]="LifecycleHookEnd",t[t.OutputStart=6]="OutputStart",t[t.OutputEnd=7]="OutputEnd",t[t.BootstrapApplicationStart=8]="BootstrapApplicationStart",t[t.BootstrapApplicationEnd=9]="BootstrapApplicationEnd",t[t.BootstrapComponentStart=10]="BootstrapComponentStart",t[t.BootstrapComponentEnd=11]="BootstrapComponentEnd",t[t.ChangeDetectionStart=12]="ChangeDetectionStart",t[t.ChangeDetectionEnd=13]="ChangeDetectionEnd",t[t.ChangeDetectionSyncStart=14]="ChangeDetectionSyncStart",t[t.ChangeDetectionSyncEnd=15]="ChangeDetectionSyncEnd",t[t.AfterRenderHooksStart=16]="AfterRenderHooksStart",t[t.AfterRenderHooksEnd=17]="AfterRenderHooksEnd",t[t.ComponentStart=18]="ComponentStart",t[t.ComponentEnd=19]="ComponentEnd",t[t.DeferBlockStateStart=20]="DeferBlockStateStart",t[t.DeferBlockStateEnd=21]="DeferBlockStateEnd",t[t.DynamicComponentStart=22]="DynamicComponentStart",t[t.DynamicComponentEnd=23]="DynamicComponentEnd",t[t.HostBindingsUpdateStart=24]="HostBindingsUpdateStart",t[t.HostBindingsUpdateEnd=25]="HostBindingsUpdateEnd",t})(L||{});function wm(t,e,n){let{ngOnChanges:r,ngOnInit:o,ngDoCheck:i}=e.type.prototype;if(r){let s=vm(e);(n.preOrderHooks??=[]).push(t,s),(n.preOrderCheckHooks??=[]).push(t,s)}o&&(n.preOrderHooks??=[]).push(0-t,o),i&&((n.preOrderHooks??=[]).push(t,i),(n.preOrderCheckHooks??=[]).push(t,i))}function Im(t,e){for(let n=e.directiveStart,r=e.directiveEnd;n<r;n++){let i=t.data[n].type.prototype,{ngAfterContentInit:s,ngAfterContentChecked:a,ngAfterViewInit:c,ngAfterViewChecked:l,ngOnDestroy:u}=i;s&&(t.contentHooks??=[]).push(-n,s),a&&((t.contentHooks??=[]).push(n,a),(t.contentCheckHooks??=[]).push(n,a)),c&&(t.viewHooks??=[]).push(-n,c),l&&((t.viewHooks??=[]).push(n,l),(t.viewCheckHooks??=[]).push(n,l)),u!=null&&(t.destroyHooks??=[]).push(n,u)}}function oi(t,e,n){Ad(t,e,3,n)}function ii(t,e,n,r){(t[x]&3)===n&&Ad(t,e,n,r)}function Ka(t,e){let n=t[x];(n&3)===e&&(n&=16383,n+=1,t[x]=n)}function Ad(t,e,n,r){let o=r!==void 0?t[ln]&65535:0,i=r??-1,s=e.length-1,a=0;for(let c=o;c<s;c++)if(typeof e[c+1]=="number"){if(a=e[c],r!=null&&a>=r)break}else e[c]<0&&(t[ln]+=65536),(a<i||i==-1)&&(Dm(t,n,e,c),t[ln]=(t[ln]&4294901760)+c+2),c++}function Ku(t,e){B(L.LifecycleHookStart,t,e);let n=T(null);try{e.call(t)}finally{T(n),B(L.LifecycleHookEnd,t,e)}}function Dm(t,e,n,r){let o=n[r]<0,i=n[r+1],s=o?-n[r]:n[r],a=t[s];o?t[x]>>14<t[ln]>>16&&(t[x]&3)===e&&(t[x]+=16384,Ku(a,i)):Ku(a,i)}var qn=-1,Lr=class{factory;name;injectImpl;resolving=!1;canSeeViewProviders;multi;componentProviders;index;providerFactory;constructor(e,n,r,o){this.factory=e,this.name=o,this.canSeeViewProviders=n,this.injectImpl=r}};function Tm(t){return(t.flags&8)!==0}function Cm(t){return(t.flags&16)!==0}function Mm(t,e,n){let r=0;for(;r<n.length;){let o=n[r];if(typeof o=="number"){if(o!==0)break;r++;let i=n[r++],s=n[r++],a=n[r++];t.setAttribute(e,s,a,i)}else{let i=o,s=n[++r];xm(i)?t.setProperty(e,i,s):t.setAttribute(e,i,s),r++}}return r}function Sm(t){return t===3||t===4||t===6}function xm(t){return t.charCodeAt(0)===64}function Ii(t,e){if(!(e===null||e.length===0))if(t===null||t.length===0)t=e.slice();else{let n=-1;for(let r=0;r<e.length;r++){let o=e[r];typeof o=="number"?n=o:n===0||(n===-1||n===2?Ju(t,n,o,null,e[++r]):Ju(t,n,o,null,null))}}return t}function Ju(t,e,n,r,o){let i=0,s=t.length;if(e===-1)s=-1;else for(;i<t.length;){let a=t[i++];if(typeof a=="number"){if(a===e){s=-1;break}else if(a>e){s=i-1;break}}}for(;i<t.length;){let a=t[i];if(typeof a=="number")break;if(a===n){o!==null&&(t[i+1]=o);return}i++,o!==null&&i++}s!==-1&&(t.splice(s,0,e),i=s+1),t.splice(i++,0,n),o!==null&&t.splice(i++,0,o)}function Rd(t){return t!==qn}function ui(t){return t&32767}function _m(t){return t>>16}function di(t,e){let n=_m(t),r=e;for(;n>0;)r=r[cn],n--;return r}var ic=!0;function ed(t){let e=ic;return ic=t,e}var Nm=256,Pd=Nm-1,kd=5,Am=0,ht={};function Rm(t,e,n){let r;typeof n=="string"?r=n.charCodeAt(0)||0:n.hasOwnProperty(on)&&(r=n[on]),r==null&&(r=n[on]=Am++);let o=r&Pd,i=1<<o;e.data[t+(o>>kd)]|=i}function Od(t,e){let n=Ld(t,e);if(n!==-1)return n;let r=e[C];r.firstCreatePass&&(t.injectorIndex=e.length,Ja(r.data,t),Ja(e,null),Ja(r.blueprint,null));let o=kc(t,e),i=t.injectorIndex;if(Rd(o)){let s=ui(o),a=di(o,e),c=a[C].data;for(let l=0;l<8;l++)e[i+l]=a[s+l]|c[s+l]}return e[i+8]=o,i}function Ja(t,e){t.push(0,0,0,0,0,0,0,0,e)}function Ld(t,e){return t.injectorIndex===-1||t.parent&&t.parent.injectorIndex===t.injectorIndex||e[t.injectorIndex+8]===null?-1:t.injectorIndex}function kc(t,e){if(t.parent&&t.parent.injectorIndex!==-1)return t.parent.injectorIndex;let n=0,r=null,o=e;for(;o!==null;){if(r=Bd(o),r===null)return qn;if(n++,o=o[cn],r.injectorIndex!==-1)return r.injectorIndex|n<<16}return qn}function Pm(t,e,n){Rm(t,e,n)}function Fd(t,e,n){if(n&8||t!==void 0)return t;ko(e,"NodeInjector")}function Vd(t,e,n,r){if(n&8&&r===void 0&&(r=null),(n&3)===0){let o=t[Et],i=Ae(void 0);try{return o?o.get(e,r,n&8):ba(e,r,n&8)}finally{Ae(i)}}return Fd(r,e,n)}function jd(t,e,n,r=0,o){if(t!==null){if(e[x]&2048&&!(r&2)){let s=Fm(t,e,n,r,ht);if(s!==ht)return s}let i=Hd(t,e,n,r,ht);if(i!==ht)return i}return Vd(e,n,r,o)}function Hd(t,e,n,r,o){let i=Om(n);if(typeof i=="function"){if(!Ua(e,t,r))return r&1?Fd(o,n,r):Vd(e,n,r,o);try{let s;if(s=i(r),s==null&&!(r&8))ko(n);else return s}finally{za()}}else if(typeof i=="number"){let s=null,a=Ld(t,e),c=qn,l=r&1?e[Ue][$e]:null;for((a===-1||r&4)&&(c=a===-1?kc(t,e):e[a+8],c===qn||!nd(r,!1)?a=-1:(s=e[C],a=ui(c),e=di(c,e)));a!==-1;){let u=e[C];if(td(i,a,u.data)){let d=km(a,e,n,s,r,l);if(d!==ht)return d}c=e[a+8],c!==qn&&nd(r,e[C].data[a+8]===l)&&td(i,a,e)?(s=u,a=ui(c),e=di(c,e)):a=-1}}return o}function km(t,e,n,r,o,i){let s=e[C],a=s.data[t+8],c=r==null?Bt(a)&&ic:r!=s&&(a.type&3)!==0,l=o&1&&i===a,u=si(a,s,n,c,l);return u!==null?fi(e,s,u,a,o):ht}function si(t,e,n,r,o){let i=t.providerIndexes,s=e.data,a=i&1048575,c=t.directiveStart,l=t.directiveEnd,u=i>>20,d=r?a:a+u,f=o?a+u:l;for(let p=d;p<f;p++){let h=s[p];if(p<c&&n===h||p>=c&&h.type===n)return p}if(o){let p=s[c];if(p&&dn(p)&&p.type===n)return c}return null}function fi(t,e,n,r,o){let i=t[n],s=e.data;if(i instanceof Lr){let a=i;if(a.resolving)throw ya("");let c=ed(a.canSeeViewProviders);a.resolving=!0;let l=s[n].type||s[n],u,d=a.injectImpl?Ae(a.injectImpl):null,f=Ua(t,r,0);try{i=t[n]=a.factory(void 0,o,s,t,r),e.firstCreatePass&&n>=r.directiveStart&&wm(n,s[n],e)}finally{d!==null&&Ae(d),ed(c),a.resolving=!1,za()}}return i}function Om(t){if(typeof t=="string")return t.charCodeAt(0)||0;let e=t.hasOwnProperty(on)?t[on]:void 0;return typeof e=="number"?e>=0?e&Pd:Lm:e}function td(t,e,n){let r=1<<t;return!!(n[e+(t>>kd)]&r)}function nd(t,e){return!(t&2)&&!(t&1&&e)}var mn=class{_tNode;_lView;constructor(e,n){this._tNode=e,this._lView=n}get(e,n,r){return jd(this._tNode,this._lView,e,tn(r),n)}};function Lm(){return new mn(Ge(),R())}function Fm(t,e,n,r,o){let i=t,s=e;for(;i!==null&&s!==null&&s[x]&2048&&!Bn(s);){let a=Hd(i,s,n,r|2,ht);if(a!==ht)return a;let c=i.parent;if(!c){let l=s[Ma];if(l){let u=l.get(n,ht,r&-5);if(u!==ht)return u}c=Bd(s),s=s[cn]}i=c}return o}function Bd(t){let e=t[C],n=e.type;return n===2?e.declTNode:n===1?t[$e]:null}function Vm(){return Qn(Ge(),R())}function Qn(t,e){return new zr(tt(t,e))}var zr=(()=>{class t{nativeElement;constructor(n){this.nativeElement=n}static __NG_ELEMENT_ID__=Vm}return t})();function jm(t){return t instanceof zr?t.nativeElement:t}function Hm(){return this._results[Symbol.iterator]()}var pi=class{_emitDistinctChangesOnly;dirty=!0;_onDirty=void 0;_results=[];_changesDetected=!1;_changes=void 0;length=0;first=void 0;last=void 0;get changes(){return this._changes??=new gt}constructor(e=!1){this._emitDistinctChangesOnly=e}get(e){return this._results[e]}map(e){return this._results.map(e)}filter(e){return this._results.filter(e)}find(e){return this._results.find(e)}reduce(e,n){return this._results.reduce(e,n)}forEach(e){this._results.forEach(e)}some(e){return this._results.some(e)}toArray(){return this._results.slice()}toString(){return this._results.toString()}reset(e,n){this.dirty=!1;let r=du(e);(this._changesDetected=!uu(this._results,r,n))&&(this._results=r,this.length=r.length,this.last=r[this.length-1],this.first=r[0])}notifyOnChanges(){this._changes!==void 0&&(this._changesDetected||!this._emitDistinctChangesOnly)&&this._changes.next(this)}onDirty(e){this._onDirty=e}setDirty(){this.dirty=!0,this._onDirty?.()}destroy(){this._changes!==void 0&&(this._changes.complete(),this._changes.unsubscribe())}[Symbol.iterator]=Hm};function $d(t){return(t.flags&128)===128}var Oc=(function(t){return t[t.OnPush=0]="OnPush",t[t.Eager=1]="Eager",t[t.Default=1]="Default",t})(Oc||{}),Ud=new Map,Bm=0;function $m(){return Bm++}function Um(t){Ud.set(t[wt],t)}function sc(t){Ud.delete(t[wt])}var rd="__ngContext__";function Wn(t,e){Ht(e)?(t[rd]=e[wt],Um(e)):t[rd]=e}function zd(t){return qd(t[Hn])}function Gd(t){return qd(t[Be])}function qd(t){for(;t!==null&&!et(t);)t=t[Be];return t}var zm;function Lc(t){zm=t}var Di=new O("",{factory:()=>Gm}),Gm="ng";var Ti=new O(""),Gr=new O("",{providedIn:"platform",factory:()=>"unknown"});var Ci=new O("",{factory:()=>A(qe).body?.querySelector("[ngCspNonce]")?.getAttribute("ngCspNonce")||null});var Wd="r";var Yd="di";var Zd=!1,Qd=new O("",{factory:()=>Zd});var od=new WeakMap;function qm(t,e){if(t==null||typeof t!="object")return;let n=od.get(t);n||(n=new WeakSet,od.set(t,n)),n.add(e)}var Wm=(t,e,n,r)=>{};function Ym(t,e,n,r){Wm(t,e,n,r)}function Fc(t){return(t.flags&32)===32}var Zm=()=>null;function Xd(t,e,n=!1){return Zm(t,e,n)}function Kd(t,e){let n=t.contentQueries;if(n!==null){let r=T(null);try{for(let o=0;o<n.length;o+=2){let i=n[o],s=n[o+1];if(s!==-1){let a=t.data[s];qo(i),a.contentQueries(2,e[s],s)}}}finally{T(r)}}}function ac(t,e,n){qo(0);let r=T(null);try{e(t,n)}finally{T(r)}}function Jd(t,e,n){if(xa(e)){let r=T(null);try{let o=e.directiveStart,i=e.directiveEnd;for(let s=o;s<i;s++){let a=t.data[s];if(a.contentQueries){let c=n[s];a.contentQueries(1,c,s)}}}finally{T(r)}}}var it=(function(t){return t[t.Emulated=0]="Emulated",t[t.None=2]="None",t[t.ShadowDom=3]="ShadowDom",t[t.ExperimentalIsolatedShadowDom=4]="ExperimentalIsolatedShadowDom",t})(it||{});var cc=class{changingThisBreaksApplicationSecurity;constructor(e){this.changingThisBreaksApplicationSecurity=e}toString(){return`SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${da})`}};function Vc(t){return t instanceof cc?t.changingThisBreaksApplicationSecurity:t}function Qm(t,e){return t.createText(e)}function Xm(t,e,n){t.setValue(e,n)}function ef(t,e,n){return t.createElement(e,n)}function hi(t,e,n,r,o){t.insertBefore(e,n,r,o)}function tf(t,e,n){t.appendChild(e,n)}function id(t,e,n,r,o){r!==null?hi(t,e,n,r,o):tf(t,e,n)}function nf(t,e,n,r){t.removeChild(null,e,n,r)}function Km(t,e,n){t.setAttribute(e,"style",n)}function Jm(t,e,n){n===""?t.removeAttribute(e,"class"):t.setAttribute(e,"class",n)}function rf(t,e,n){let{mergedAttrs:r,classes:o,styles:i}=n;r!==null&&Mm(t,e,r),o!==null&&Jm(t,e,o),i!==null&&Km(t,e,i)}function eg(t,e,n){let r=t.length;for(;;){let o=t.indexOf(e,n);if(o===-1)return o;if(o===0||t.charCodeAt(o-1)<=32){let i=e.length;if(o+i===r||t.charCodeAt(o+i)<=32)return o}n=o+1}}var of="ng-template";function tg(t,e,n,r){let o=0;if(r){for(;o<e.length&&typeof e[o]=="string";o+=2)if(e[o]==="class"&&eg(e[o+1].toLowerCase(),n,0)!==-1)return!0}else if(jc(t))return!1;if(o=e.indexOf(1,o),o>-1){let i;for(;++o<e.length&&typeof(i=e[o])=="string";)if(i.toLowerCase()===n)return!0}return!1}function jc(t){return t.type===4&&t.value!==of}function ng(t,e,n){let r=t.type===4&&!n?of:t.value;return e===r}function rg(t,e,n){let r=4,o=t.attrs,i=o!==null?sg(o):0,s=!1;for(let a=0;a<e.length;a++){let c=e[a];if(typeof c=="number"){if(!s&&!rt(r)&&!rt(c))return!1;if(s&&rt(c))continue;s=!1,r=c|r&1;continue}if(!s)if(r&4){if(r=2|r&1,c!==""&&!ng(t,c,n)||c===""&&e.length===1){if(rt(r))return!1;s=!0}}else if(r&8){if(o===null||!tg(t,o,c,n)){if(rt(r))return!1;s=!0}}else{let l=e[++a],u=og(c,o,jc(t),n);if(u===-1){if(rt(r))return!1;s=!0;continue}if(l!==""){let d;if(u>i?d="":d=o[u+1].toLowerCase(),r&2&&l!==d){if(rt(r))return!1;s=!0}}}}return rt(r)||s}function rt(t){return(t&1)===0}function og(t,e,n,r){if(e===null)return-1;let o=0;if(r||!n){let i=!1;for(;o<e.length;){let s=e[o];if(s===t)return o;if(s===3||s===6)i=!0;else if(s===1||s===2){let a=e[++o];for(;typeof a=="string";)a=e[++o];continue}else{if(s===4)break;if(s===0){o+=4;continue}}o+=i?1:2}return-1}else return ag(e,t)}function ig(t,e,n=!1){for(let r=0;r<e.length;r++)if(rg(t,e[r],n))return!0;return!1}function sg(t){for(let e=0;e<t.length;e++){let n=t[e];if(Sm(n))return e}return t.length}function ag(t,e){let n=t.indexOf(4);if(n>-1)for(n++;n<t.length;){let r=t[n];if(typeof r=="number")return-1;if(r===e)return n;n++}return-1}function sd(t,e){return t?":not("+e.trim()+")":e}function cg(t){let e=t[0],n=1,r=2,o="",i=!1;for(;n<t.length;){let s=t[n];if(typeof s=="string")if(r&2){let a=t[++n];o+="["+s+(a.length>0?'="'+a+'"':"")+"]"}else r&8?o+="."+s:r&4&&(o+=" "+s);else o!==""&&!rt(s)&&(e+=sd(i,o),o=""),r=s,i=i||!rt(r);n++}return o!==""&&(e+=sd(i,o)),e}function lg(t){return t.map(cg).join(",")}function ug(t){let e=[],n=[],r=1,o=2;for(;r<t.length;){let i=t[r];if(typeof i=="string")o===2?i!==""&&e.push(i,t[++r]):o===8&&n.push(i);else{if(!rt(o))break;o=i}r++}return n.length&&e.push(1,...n),e}var me={};function Hc(t,e,n,r,o,i,s,a,c,l,u){let d=ue+r,f=d+o,p=dg(d,f),h=typeof l=="function"?l():l;return p[C]={type:t,blueprint:p,template:n,queries:null,viewQuery:a,declTNode:e,data:p.slice().fill(null,d),bindingStartIndex:d,expandoStartIndex:f,hostBindingOpCodes:null,firstCreatePass:!0,firstUpdatePass:!0,staticViewQueries:!1,staticContentQueries:!1,preOrderHooks:null,preOrderCheckHooks:null,contentHooks:null,contentCheckHooks:null,viewHooks:null,viewCheckHooks:null,destroyHooks:null,cleanup:null,contentQueries:null,components:null,directiveRegistry:typeof i=="function"?i():i,pipeRegistry:typeof s=="function"?s():s,firstChild:null,schemas:c,consts:h,incompleteFirstPass:!1,ssrId:u}}function dg(t,e){let n=[];for(let r=0;r<e;r++)n.push(r<t?null:me);return n}function fg(t){let e=t.tView;return e===null||e.incompleteFirstPass?t.tView=Hc(1,null,t.template,t.decls,t.vars,t.directiveDefs,t.pipeDefs,t.viewQuery,t.schemas,t.consts,t.id):e}function Bc(t,e,n,r,o,i,s,a,c,l,u){let d=e.blueprint.slice();return d[Je]=o,d[x]=r|4|128|8|64|1024,(l!==null||t&&t[x]&2048)&&(d[x]|=2048),Aa(d),d[re]=d[cn]=t,d[X]=n,d[ut]=s||t&&t[ut],d[W]=a||t&&t[W],d[Et]=c||t&&t[Et]||null,d[$e]=i,d[wt]=$m(),d[Vn]=u,d[Ma]=l,d[Ue]=e.type==2?t[Ue]:d,d}function pg(t,e,n){let r=tt(e,t),o=fg(n),i=t[ut].rendererFactory,s=$c(t,Bc(t,o,null,sf(n),r,e,null,i.createRenderer(r,n),null,null,null));return t[e.index]=s}function sf(t){let e=16;return t.signals?e=4096:t.onPush&&(e=64),e}function af(t,e,n,r){if(n===0)return-1;let o=e.length;for(let i=0;i<n;i++)e.push(r),t.blueprint.push(r),t.data.push(null);return o}function $c(t,e){return t[Hn]?t[Ca][Be]=e:t[Hn]=e,t[Ca]=e,e}function v(t=1){cf(Ee(),R(),nt()+t,!1)}function cf(t,e,n,r){if(!r)if((e[x]&3)===3){let i=t.preOrderCheckHooks;i!==null&&oi(e,i,n)}else{let i=t.preOrderHooks;i!==null&&ii(e,i,0,n)}$t(n)}var Mi=(function(t){return t[t.None=0]="None",t[t.SignalBased=1]="SignalBased",t[t.HasDecoratorInputTransform=2]="HasDecoratorInputTransform",t})(Mi||{});function lc(t,e,n,r){let o=T(null);try{let[i,s,a]=t.inputs[n],c=null;(s&Mi.SignalBased)!==0&&(c=e[i][pe]),c!==null&&c.transformFn!==void 0?r=c.transformFn(r):a!==null&&(r=a.call(e,r)),t.setInput!==null?t.setInput(e,c,r,n,i):xd(e,c,i,r)}finally{T(o)}}var It=(function(t){return t[t.Important=1]="Important",t[t.DashCase=2]="DashCase",t})(It||{}),hg;function Uc(t,e){return hg(t,e)}var MD=typeof document<"u"&&typeof document?.documentElement?.getAnimations=="function";var uc=new WeakMap,Pr=new WeakSet;function mg(t,e){let n=uc.get(t);if(!n||n.length===0)return;let r=e.parentNode,o=e.previousSibling;for(let i=n.length-1;i>=0;i--){let s=n[i],a=s.parentNode;s===e?(n.splice(i,1),Pr.add(s),s.dispatchEvent(new CustomEvent("animationend",{detail:{cancel:!0}}))):(o&&s===o||a&&r&&a!==r)&&(n.splice(i,1),s.dispatchEvent(new CustomEvent("animationend",{detail:{cancel:!0}})),s.parentNode?.removeChild(s))}}function gg(t,e){let n=uc.get(t);n?n.includes(e)||n.push(e):uc.set(t,[e])}var gn=new Set,zc=(function(t){return t[t.CHANGE_DETECTION=0]="CHANGE_DETECTION",t[t.AFTER_NEXT_RENDER=1]="AFTER_NEXT_RENDER",t})(zc||{}),Xn=new O(""),ad=new Set;function bn(t){ad.has(t)||(ad.add(t),performance?.mark?.("mark_feature_usage",{detail:{feature:t}}))}var lf=(()=>{class t{impl=null;execute(){this.impl?.execute()}static \u0275prov=ee({token:t,providedIn:"root",factory:()=>new t})}return t})();var uf=new O("",{factory:()=>({queue:new Set,isScheduled:!1,scheduler:null,injector:A(je)})});function df(t,e,n){let r=t.get(uf);if(Array.isArray(e))for(let o of e)r.queue.add(o),n?.detachedLeaveAnimationFns?.push(o);else r.queue.add(e),n?.detachedLeaveAnimationFns?.push(e);r.scheduler&&r.scheduler(t)}function vg(t,e){let n=t.get(uf);if(e.detachedLeaveAnimationFns){for(let r of e.detachedLeaveAnimationFns)n.queue.delete(r);e.detachedLeaveAnimationFns=void 0}}function yg(t,e){for(let[n,r]of e)df(t,r.animateFns)}function cd(t,e,n,r){let o=t?.[Vt]?.enter;e!==null&&o&&o.has(n.index)&&yg(r,o)}function Gn(t,e,n,r,o,i,s,a){if(o!=null){let c,l=!1;et(o)?c=o:Ht(o)&&(l=!0,o=o[Je]);let u=ze(o);t===0&&r!==null?(cd(a,r,i,n),s==null?tf(e,r,u):hi(e,r,u,s||null,!0)):t===1&&r!==null?(cd(a,r,i,n),hi(e,r,u,s||null,!0),mg(i,u)):t===2?(a?.[Vt]?.leave?.has(i.index)&&gg(i,u),Pr.delete(u),ld(a,i,n,d=>{if(Pr.has(u)){Pr.delete(u);return}nf(e,u,l,d)})):t===3&&(Pr.delete(u),ld(a,i,n,()=>{e.destroyNode(u)})),c!=null&&Ag(e,t,n,c,i,r,s)}}function bg(t,e){ff(t,e),e[Je]=null,e[$e]=null}function Eg(t,e,n,r,o,i){r[Je]=o,r[$e]=e,xi(t,r,n,1,o,i)}function ff(t,e){e[ut].changeDetectionScheduler?.notify(9),xi(t,e,e[W],2,null,null)}function wg(t){let e=t[Hn];if(!e)return ec(t[C],t);for(;e;){let n=null;if(Ht(e))n=e[Hn];else{let r=e[Z];r&&(n=r)}if(!n){for(;e&&!e[Be]&&e!==t;)Ht(e)&&ec(e[C],e),e=e[re];e===null&&(e=t),Ht(e)&&ec(e[C],e),n=e&&e[Be]}e=n}}function Gc(t,e){let n=t[un],r=n.indexOf(e);n.splice(r,1)}function Si(t,e){if(fn(e))return;let n=e[W];n.destroyNode&&xi(t,e,n,3,null,null),wg(e)}function ec(t,e){if(fn(e))return;let n=T(null);try{e[x]&=-129,e[x]|=256,e[Pe]&&Xt(e[Pe]),Tg(t,e),Dg(t,e),e[C].type===1&&e[W].destroy();let r=e[Ft];if(r!==null&&et(e[re])){r!==e[re]&&Gc(r,e);let o=e[dt];o!==null&&o.detachView(t)}sc(e)}finally{T(n)}}function ld(t,e,n,r){let o=t?.[Vt];if(o==null||o.leave==null||!o.leave.has(e.index))return r(!1);t&&gn.add(t[wt]),df(n,()=>{if(o.leave&&o.leave.has(e.index)){let s=o.leave.get(e.index),a=[];if(s){for(let c=0;c<s.animateFns.length;c++){let l=s.animateFns[c],{promise:u}=l();a.push(u)}o.detachedLeaveAnimationFns=void 0}o.running=Promise.allSettled(a),Ig(t,r)}else t&&gn.delete(t[wt]),r(!1)},o)}function Ig(t,e){let n=t[Vt]?.running;if(n){n.then(()=>{t[Vt].running=void 0,gn.delete(t[wt]),e(!0)});return}e(!1)}function Dg(t,e){let n=t.cleanup,r=e[jn];if(n!==null)for(let s=0;s<n.length-1;s+=2)if(typeof n[s]=="string"){let a=n[s+3];a>=0?r[a]():r[-a].unsubscribe(),s+=2}else{let a=r[n[s+1]];n[s].call(a)}r!==null&&(e[jn]=null);let o=e[yt];if(o!==null){e[yt]=null;for(let s=0;s<o.length;s++){let a=o[s];a()}}let i=e[kt];if(i!==null){e[kt]=null;for(let s of i)s.destroy()}}function Tg(t,e){let n;if(t!=null&&(n=t.destroyHooks)!=null)for(let r=0;r<n.length;r+=2){let o=e[n[r]];if(!(o instanceof Lr)){let i=n[r+1];if(Array.isArray(i))for(let s=0;s<i.length;s+=2){let a=o[i[s]],c=i[s+1];B(L.LifecycleHookStart,a,c);try{c.call(a)}finally{B(L.LifecycleHookEnd,a,c)}}else{B(L.LifecycleHookStart,o,i);try{i.call(o)}finally{B(L.LifecycleHookEnd,o,i)}}}}}function Cg(t,e,n){return Mg(t,e.parent,n)}function Mg(t,e,n){let r=e;for(;r!==null&&r.type&168;)e=r,r=e.parent;if(r===null)return n[Je];if(Bt(r)){let{encapsulation:o}=t.data[r.directiveStart+r.componentOffset];if(o===it.None||o===it.Emulated)return null}return tt(r,n)}function Sg(t,e,n){return _g(t,e,n)}function xg(t,e,n){return t.type&40?tt(t,n):null}var _g=xg,ud;function qc(t,e,n,r){let o=Cg(t,r,e),i=e[W],s=r.parent||e[$e],a=Sg(s,r,e);if(o!=null)if(Array.isArray(n))for(let c=0;c<n.length;c++)id(i,o,n[c],a,!1);else id(i,o,n,a,!1);ud!==void 0&&ud(i,r,e,n,o)}function kr(t,e){if(e!==null){let n=e.type;if(n&3)return tt(e,t);if(n&4)return dc(-1,t[e.index]);if(n&8){let r=e.child;if(r!==null)return kr(t,r);{let o=t[e.index];return et(o)?dc(-1,o):ze(o)}}else{if(n&128)return kr(t,e.next);if(n&32)return Uc(e,t)()||ze(t[e.index]);{let r=pf(t,e);if(r!==null){if(Array.isArray(r))return r[0];let o=Ot(t[Ue]);return kr(o,r)}else return kr(t,e.next)}}}return null}function pf(t,e){if(e!==null){let r=t[Ue][$e],o=e.projection;return r.projection[o]}return null}function dc(t,e){let n=Z+t+1;if(n<e.length){let r=e[n],o=r[C].firstChild;if(o!==null)return kr(r,o)}return e[jt]}function Wc(t,e,n,r,o,i,s){for(;n!=null;){let a=r[Et];if(n.type===128){n=n.next;continue}let c=r[n.index],l=n.type;if(s&&e===0&&(c&&Wn(ze(c),r),n.flags|=2),!Fc(n))if(l&8)Wc(t,e,n.child,r,o,i,!1),Gn(e,t,a,o,c,n,i,r);else if(l&32){let u=Uc(n,r),d;for(;d=u();)Gn(e,t,a,o,d,n,i,r);Gn(e,t,a,o,c,n,i,r)}else l&16?Ng(t,e,r,n,o,i):Gn(e,t,a,o,c,n,i,r);n=s?n.projectionNext:n.next}}function xi(t,e,n,r,o,i){Wc(n,r,t.firstChild,e,o,i,!1)}function Ng(t,e,n,r,o,i){let s=n[Ue],c=s[$e].projection[r.projection];if(Array.isArray(c))for(let l=0;l<c.length;l++){let u=c[l];Gn(e,t,n[Et],o,u,r,i,n)}else{let l=c,u=s[re];$d(r)&&(l.flags|=128),Wc(t,e,l,u,o,i,!0)}}function Ag(t,e,n,r,o,i,s){let a=r[jt],c=ze(r);a!==c&&Gn(e,t,n,i,a,o,s);for(let l=Z;l<r.length;l++){let u=r[l];xi(u[C],u,t,e,i,a)}}function Rg(t,e,n,r,o){if(e)o?t.addClass(n,r):t.removeClass(n,r);else{let i=r.indexOf("-")===-1?void 0:It.DashCase;o==null?t.removeStyle(n,r,i):(typeof o=="string"&&o.endsWith("!important")&&(o=o.slice(0,-10),i|=It.Important),t.setStyle(n,r,o,i))}}function hf(t,e,n,r,o){let i=nt(),s=r&2;try{$t(-1),s&&e.length>ue&&cf(t,e,ue,!1);let a=s?L.TemplateUpdateStart:L.TemplateCreateStart;B(a,o,n),n(r,o)}finally{$t(i);let a=s?L.TemplateUpdateEnd:L.TemplateCreateEnd;B(a,o,n)}}function mf(t,e,n){jg(t,e,n),(n.flags&64)===64&&Hg(t,e,n)}function Yc(t,e,n=tt){let r=e.localNames;if(r!==null){let o=e.index+1;for(let i=0;i<r.length;i+=2){let s=r[i+1],a=s===-1?n(e,t):t[s];t[o++]=a}}}function Pg(t,e,n,r){let i=r.get(Qd,Zd)||n===it.ShadowDom||n===it.ExperimentalIsolatedShadowDom,s=t.selectRootElement(e,i);return kg(s),s}function kg(t){Og(t)}var Og=()=>null;function Lg(t){return t==="class"?"className":t==="for"?"htmlFor":t==="formaction"?"formAction":t==="innerHtml"?"innerHTML":t==="readonly"?"readOnly":t==="tabindex"?"tabIndex":t}function Fg(t,e,n,r,o,i){let s=e[C];if(Zc(t,s,e,n,r)){Bt(t)&&Vg(e,t.index);return}t.type&3&&(n=Lg(n)),gf(t,e,n,r,o,i)}function gf(t,e,n,r,o,i){if(t.type&3){let s=tt(t,e);r=i!=null?i(r,t.value||"",n):r,o.setProperty(s,n,r)}else t.type&12}function Vg(t,e){let n=ft(e,t);n[x]&16||(n[x]|=64)}function jg(t,e,n){let r=n.directiveStart,o=n.directiveEnd;Bt(n)&&pg(e,n,t.data[r+n.componentOffset]),t.firstCreatePass||Od(n,e);let i=n.initialInputs;for(let s=r;s<o;s++){let a=t.data[s],c=fi(e,t,s,n);if(Wn(c,e),i!==null&&Gg(e,s-r,c,a,n,i),dn(a)){let l=ft(n.index,e);l[X]=fi(e,t,s,n)}}}function Hg(t,e,n){let r=n.directiveStart,o=n.directiveEnd,i=n.index,s=Ou();try{$t(i);for(let a=r;a<o;a++){let c=t.data[a],l=e[a];Go(a),(c.hostBindings!==null||c.hostVars!==0||c.hostAttrs!==null)&&Bg(c,l)}}finally{$t(-1),Go(s)}}function Bg(t,e){t.hostBindings!==null&&t.hostBindings(1,e)}function $g(t,e){let n=t.directiveRegistry,r=null;if(n)for(let o=0;o<n.length;o++){let i=n[o];ig(e,i.selectors,!1)&&(r??=[],dn(i)?r.unshift(i):r.push(i))}return r}function Ug(t,e,n,r,o,i){let s=tt(t,e);zg(e[W],s,i,t.value,n,r,o)}function zg(t,e,n,r,o,i,s){if(i==null)t.removeAttribute(e,o,n);else{let a=s==null?Lt(i):s(i,r||"",o);t.setAttribute(e,o,a,n)}}function Gg(t,e,n,r,o,i){let s=i[e];if(s!==null)for(let a=0;a<s.length;a+=2){let c=s[a],l=s[a+1];lc(r,n,c,l)}}function vf(t,e,n,r,o){let i=ue+n,s=e[C],a=o(s,e,t,r,n);e[i]=a,Un(t,!0);let c=t.type===2;return c?(rf(e[W],a,t),(Cu()===0||Bo(t))&&Wn(a,e),Mu()):Wn(a,e),Ko()&&(!c||!Fc(t))&&qc(s,e,a,t),t}function yf(t){let e=t;return Ha()?Nu():(e=e.parent,Un(e,!1)),e}function qg(t,e){let n=t[Et];if(!n)return;let r;try{r=n.get(hn,null)}catch{r=null}r?.(e)}function Zc(t,e,n,r,o){let i=t.inputs?.[r],s=t.hostDirectiveInputs?.[r],a=!1;if(s)for(let c=0;c<s.length;c+=2){let l=s[c],u=s[c+1],d=e.data[l];lc(d,n[l],u,o),a=!0}if(i)for(let c of i){let l=n[c],u=e.data[c];lc(u,l,r,o),a=!0}return a}function Wg(t,e){let n=ft(e,t),r=n[C];Yg(r,n);let o=n[Je];o!==null&&n[Vn]===null&&(n[Vn]=Xd(o,n[Et])),B(L.ComponentStart);try{Qc(r,n,n[X])}finally{B(L.ComponentEnd,n[X])}}function Yg(t,e){for(let n=e.length;n<t.blueprint.length;n++)e.push(t.blueprint[n])}function Qc(t,e,n){Wo(e);try{let r=t.viewQuery;r!==null&&ac(1,r,n);let o=t.template;o!==null&&hf(t,e,o,1,n),t.firstCreatePass&&(t.firstCreatePass=!1),e[dt]?.finishViewCreation(t),t.staticContentQueries&&Kd(t,e),t.staticViewQueries&&ac(2,t.viewQuery,n);let i=t.components;i!==null&&Zg(e,i)}catch(r){throw t.firstCreatePass&&(t.incompleteFirstPass=!0,t.firstCreatePass=!1),r}finally{e[x]&=-5,Yo()}}function Zg(t,e){for(let n=0;n<e.length;n++)Wg(t,e[n])}function _i(t,e,n,r){let o=T(null);try{let i=e.tView,a=t[x]&4096?4096:16,c=Bc(t,i,n,a,null,e,null,null,r?.injector??null,r?.embeddedViewInjector??null,r?.dehydratedView??null),l=t[e.index];c[Ft]=l;let u=t[dt];return u!==null&&(c[dt]=u.createEmbeddedView(i)),Qc(i,c,n),c}finally{T(o)}}function Fr(t,e){return!e||e.firstChild===null||$d(t)}function Vr(t,e,n,r,o=!1){for(;n!==null;){if(n.type===128){n=o?n.projectionNext:n.next;continue}let i=e[n.index];i!==null&&r.push(ze(i)),et(i)&&bf(i,r);let s=n.type;if(s&8)Vr(t,e,n.child,r);else if(s&32){let a=Uc(n,e),c;for(;c=a();)r.push(c)}else if(s&16){let a=pf(e,n);if(Array.isArray(a))r.push(...a);else{let c=Ot(e[Ue]);Vr(c[C],c,a,r,!0)}}n=o?n.projectionNext:n.next}return r}function bf(t,e){for(let n=Z;n<t.length;n++){let r=t[n],o=r[C].firstChild;o!==null&&Vr(r[C],r,o,e)}t[jt]!==t[Je]&&e.push(t[jt])}function Ef(t){if(t[Ho]!==null){for(let e of t[Ho])e.impl.addSequence(e);t[Ho].length=0}}var wf=[];function Qg(t){return t[Pe]??Xg(t)}function Xg(t){let e=wf.pop()??Object.create(Jg);return e.lView=t,e}function Kg(t){t.lView[Pe]!==t&&(t.lView=null,wf.push(t))}var Jg=J(Y({},Mn),{consumerIsAlwaysLive:!0,kind:"template",consumerMarkedDirty:t=>{$n(t.lView)},consumerOnSignalRead(){this.lView[Pe]=this}});function ev(t){let e=t[Pe]??Object.create(tv);return e.lView=t,e}var tv=J(Y({},Mn),{consumerIsAlwaysLive:!0,kind:"template",consumerMarkedDirty:t=>{let e=Ot(t.lView);for(;e&&!If(e[C]);)e=Ot(e);e&&Ra(e)},consumerOnSignalRead(){this.lView[Pe]=this}});function If(t){return t.type!==2}function Df(t){if(t[kt]===null)return;let e=!0;for(;e;){let n=!1;for(let r of t[kt])r.dirty&&(n=!0,r.zone===null||Zone.current===r.zone?r.run():r.zone.run(()=>r.run()));e=n&&!!(t[x]&8192)}}var nv=100;function Tf(t,e=0){let r=t[ut].rendererFactory,o=!1;o||r.begin?.();try{rv(t,e)}finally{o||r.end?.()}}function rv(t,e){let n=Ba();try{wr(!0),fc(t,e);let r=0;for(;Nr(t);){if(r===nv)throw new N(103,!1);r++,fc(t,1)}}finally{wr(n)}}function ov(t,e,n,r){if(fn(e))return;let o=e[x],i=!1,s=!1;Wo(e);let a=!0,c=null,l=null;i||(If(t)?(l=Qg(e),c=Sn(l)):ho()===null?(a=!1,l=ev(e),c=Sn(l)):e[Pe]&&(Xt(e[Pe]),e[Pe]=null));try{Aa(e),Ru(t.bindingStartIndex),n!==null&&hf(t,e,n,2,r);let u=(o&3)===3;if(!i)if(u){let p=t.preOrderCheckHooks;p!==null&&oi(e,p,null)}else{let p=t.preOrderHooks;p!==null&&ii(e,p,0,null),Ka(e,0)}if(s||iv(e),Df(e),Cf(e,0),t.contentQueries!==null&&Kd(t,e),!i)if(u){let p=t.contentCheckHooks;p!==null&&oi(e,p)}else{let p=t.contentHooks;p!==null&&ii(e,p,1),Ka(e,1)}av(t,e);let d=t.components;d!==null&&Sf(e,d,0);let f=t.viewQuery;if(f!==null&&ac(2,f,r),!i)if(u){let p=t.viewCheckHooks;p!==null&&oi(e,p)}else{let p=t.viewHooks;p!==null&&ii(e,p,2),Ka(e,2)}if(t.firstUpdatePass===!0&&(t.firstUpdatePass=!1),e[jo]){for(let p of e[jo])p();e[jo]=null}i||(Ef(e),e[x]&=-73)}catch(u){throw i||$n(e),u}finally{l!==null&&(pr(l,c),a&&Kg(l)),Yo()}}function Cf(t,e){for(let n=zd(t);n!==null;n=Gd(n))for(let r=Z;r<n.length;r++){let o=n[r];Mf(o,e)}}function iv(t){for(let e=zd(t);e!==null;e=Gd(e)){if(!(e[x]&2))continue;let n=e[un];for(let r=0;r<n.length;r++){let o=n[r];Ra(o)}}}function sv(t,e,n){B(L.ComponentStart);let r=ft(e,t);try{Mf(r,n)}finally{B(L.ComponentEnd,r[X])}}function Mf(t,e){Uo(t)&&fc(t,e)}function fc(t,e){let r=t[C],o=t[x],i=t[Pe],s=!!(e===0&&o&16);if(s||=!!(o&64&&e===0),s||=!!(o&1024),s||=!!(i?.dirty&&hr(i)),s||=!1,i&&(i.dirty=!1),t[x]&=-9217,s)ov(r,t,r.template,t[X]);else if(o&8192){let a=T(null);try{Df(t),Cf(t,1);let c=r.components;c!==null&&Sf(t,c,1),Ef(t)}finally{T(a)}}}function Sf(t,e,n){for(let r=0;r<e.length;r++)sv(t,e[r],n)}function av(t,e){let n=t.hostBindingOpCodes;if(n!==null)try{for(let r=0;r<n.length;r++){let o=n[r];if(o<0)$t(~o);else{let i=o,s=n[++r],a=n[++r];ku(s,i);let c=e[i];B(L.HostBindingsUpdateStart,c);try{a(2,c)}finally{B(L.HostBindingsUpdateEnd,c)}}}}finally{$t(-1)}}function Xc(t,e){let n=Ba()?64:1088;for(t[ut].changeDetectionScheduler?.notify(e);t;){t[x]|=n;let r=Ot(t);if(Bn(t)&&!r)return t;t=r}return null}function xf(t,e,n,r){return[t,!0,0,e,null,r,null,n,null,null]}function _f(t,e){let n=Z+e;if(n<t.length)return t[n]}function Ni(t,e,n,r=!0){let o=e[C];if(cv(o,e,t,n),r){let s=dc(n,t),a=e[W],c=a.parentNode(t[jt]);c!==null&&Eg(o,t[$e],a,e,c,s)}let i=e[Vn];i!==null&&i.firstChild!==null&&(i.firstChild=null)}function Nf(t,e){let n=jr(t,e);return n!==void 0&&Si(n[C],n),n}function jr(t,e){if(t.length<=Z)return;let n=Z+e,r=t[n];if(r){let o=r[Ft];o!==null&&o!==t&&Gc(o,r),e>0&&(t[n-1][Be]=r[Be]);let i=Cr(t,Z+e);bg(r[C],r);let s=i[dt];s!==null&&s.detachView(i[C]),r[re]=null,r[Be]=null,r[x]&=-129}return r}function cv(t,e,n,r){let o=Z+r,i=n.length;r>0&&(n[o-1][Be]=e),r<i-Z?(e[Be]=n[o],Ea(n,Z+r,e)):(n.push(e),e[Be]=null),e[re]=n;let s=e[Ft];s!==null&&n!==s&&Af(s,e);let a=e[dt];a!==null&&a.insertView(t),zo(e),e[x]|=128}function Af(t,e){let n=t[un],r=e[re];if(Ht(r))t[x]|=2;else{let o=r[re][Ue];e[Ue]!==o&&(t[x]|=2)}n===null?t[un]=[e]:n.push(e)}var Yn=class{_lView;_cdRefInjectingView;_appRef=null;_attachedToViewContainer=!1;exhaustive;get rootNodes(){let e=this._lView,n=e[C];return Vr(n,e,n.firstChild,[])}constructor(e,n){this._lView=e,this._cdRefInjectingView=n}get context(){return this._lView[X]}set context(e){this._lView[X]=e}get destroyed(){return fn(this._lView)}destroy(){if(this._appRef)this._appRef.detachView(this);else if(this._attachedToViewContainer){let e=this._lView[re];if(et(e)){let n=e[_r],r=n?n.indexOf(this):-1;r>-1&&(jr(e,r),Cr(n,r))}this._attachedToViewContainer=!1}Si(this._lView[C],this._lView)}onDestroy(e){Pa(this._lView,e)}markForCheck(){Xc(this._cdRefInjectingView||this._lView,4)}detach(){this._lView[x]&=-129}reattach(){zo(this._lView),this._lView[x]|=128}detectChanges(){this._lView[x]|=1024,Tf(this._lView)}checkNoChanges(){}attachToViewContainerRef(){if(this._appRef)throw new N(902,!1);this._attachedToViewContainer=!0}detachFromAppRef(){this._appRef=null;let e=Bn(this._lView),n=this._lView[Ft];n!==null&&!e&&Gc(n,this._lView),ff(this._lView[C],this._lView)}attachToAppRef(e){if(this._attachedToViewContainer)throw new N(902,!1);this._appRef=e;let n=Bn(this._lView),r=this._lView[Ft];r!==null&&!n&&Af(r,this._lView),zo(this._lView)}};var Hr=(()=>{class t{_declarationLView;_declarationTContainer;elementRef;static __NG_ELEMENT_ID__=lv;constructor(n,r,o){this._declarationLView=n,this._declarationTContainer=r,this.elementRef=o}get ssrId(){return this._declarationTContainer.tView?.ssrId||null}createEmbeddedView(n,r){return this.createEmbeddedViewImpl(n,r)}createEmbeddedViewImpl(n,r,o){let i=_i(this._declarationLView,this._declarationTContainer,n,{embeddedViewInjector:r,dehydratedView:o});return new Yn(i)}}return t})();function lv(){return Kc(Ge(),R())}function Kc(t,e){return t.type&4?new Hr(e,t,Qn(t,e)):null}function Ai(t,e,n,r,o){let i=t.data[e];if(i===null)i=uv(t,e,n,r,o),Pu()&&(i.flags|=32);else if(i.type&64){i.type=n,i.value=r,i.attrs=o;let s=_u();i.injectorIndex=s===null?-1:s.injectorIndex}return Un(i,!0),i}function uv(t,e,n,r,o){let i=ja(),s=Ha(),a=s?i:i&&i.parent,c=t.data[e]=fv(t,a,n,e,r,o);return dv(t,c,i,s),c}function dv(t,e,n,r){t.firstChild===null&&(t.firstChild=e),n!==null&&(r?n.child==null&&e.parent!==null&&(n.child=e):n.next===null&&(n.next=e,e.prev=n))}function fv(t,e,n,r,o,i){let s=e?e.injectorIndex:-1,a=0;return xu()&&(a|=128),{type:n,index:r,insertBeforeIndex:null,injectorIndex:s,directiveStart:-1,directiveEnd:-1,directiveStylingLast:-1,componentOffset:-1,controlDirectiveIndex:-1,customControlIndex:-1,propertyBindings:null,flags:a,providerIndexes:0,value:o,namespace:Ga(),attrs:i,mergedAttrs:null,localNames:null,initialInputs:null,inputs:null,hostDirectiveInputs:null,outputs:null,hostDirectiveOutputs:null,directiveToIndex:null,tView:null,next:null,prev:null,projectionNext:null,child:null,parent:e,projection:null,styles:null,stylesWithoutHost:null,residualStyles:void 0,classes:null,classesWithoutHost:null,residualClasses:void 0,classBindings:0,styleBindings:0}}function pv(t){let e=t[Sa]??[],r=t[re][W],o=[];for(let i of e)i.data[Yd]!==void 0?o.push(i):hv(i,r);t[Sa]=o}function hv(t,e){let n=0,r=t.firstChild;if(r){let o=t.data[Wd];for(;n<o;){let i=r.nextSibling;nf(e,r,!1),r=i,n++}}}var mv=()=>null,gv=()=>null;function pc(t,e){return mv(t,e)}function Rf(t,e,n){return gv(t,e,n)}var Pf=class{},Ri=class{},hc=class{resolveComponentFactory(e){throw new N(917,!1)}},Pi=class{static NULL=new hc},vn=class{};var kf=(()=>{class t{static \u0275prov=ee({token:t,providedIn:"root",factory:()=>null})}return t})();var ai={},mc=class{injector;parentInjector;constructor(e,n){this.injector=e,this.parentInjector=n}get(e,n,r){let o=this.injector.get(e,ai,r);return o!==ai||n===ai?o:this.parentInjector.get(e,n,r)}};function mi(t,e,n){let r=n?t.styles:null,o=n?t.classes:null,i=0;if(e!==null)for(let s=0;s<e.length;s++){let a=e[s];if(typeof a=="number")i=a;else if(i==1)o=No(o,a);else if(i==2){let c=a,l=e[++s];r=No(r,c+": "+l+";")}}n?t.styles=r:t.stylesWithoutHost=r,n?t.classes=o:t.classesWithoutHost=o}function Of(t,e=0){let n=R();if(n===null)return H(t,e);let r=Ge();return jd(r,n,Re(t),e)}function vv(t,e,n,r,o){let i=r===null?null:{"":-1},s=o(t,n);if(s!==null){let a=s,c=null,l=null;for(let u of s)if(u.resolveHostDirectives!==null){[a,c,l]=u.resolveHostDirectives(s);break}Ev(t,e,n,a,i,c,l)}i!==null&&r!==null&&yv(n,r,i)}function yv(t,e,n){let r=t.localNames=[];for(let o=0;o<e.length;o+=2){let i=n[e[o+1]];if(i==null)throw new N(-301,!1);r.push(e[o],i)}}function bv(t,e,n){e.componentOffset=n,(t.components??=[]).push(e.index)}function Ev(t,e,n,r,o,i,s){let a=r.length,c=null;for(let f=0;f<a;f++){let p=r[f];c===null&&dn(p)&&(c=p,bv(t,n,f)),Pm(Od(n,e),t,p.type)}Mv(n,t.data.length,a),c?.viewProvidersResolver&&c.viewProvidersResolver(c);for(let f=0;f<a;f++){let p=r[f];p.providersResolver&&p.providersResolver(p)}let l=!1,u=!1,d=af(t,e,a,null);a>0&&(n.directiveToIndex=new Map);for(let f=0;f<a;f++){let p=r[f];if(n.mergedAttrs=Ii(n.mergedAttrs,p.hostAttrs),Iv(t,n,e,d,p),Cv(d,p,o),s!==null&&s.has(p)){let[m,y]=s.get(p);n.directiveToIndex.set(p.type,[d,m+n.directiveStart,y+n.directiveStart])}else(i===null||!i.has(p))&&n.directiveToIndex.set(p.type,d);p.contentQueries!==null&&(n.flags|=4),(p.hostBindings!==null||p.hostAttrs!==null||p.hostVars!==0)&&(n.flags|=64);let h=p.type.prototype;!l&&(h.ngOnChanges||h.ngOnInit||h.ngDoCheck)&&((t.preOrderHooks??=[]).push(n.index),l=!0),!u&&(h.ngOnChanges||h.ngDoCheck)&&((t.preOrderCheckHooks??=[]).push(n.index),u=!0),d++}wv(t,n,i)}function wv(t,e,n){for(let r=e.directiveStart;r<e.directiveEnd;r++){let o=t.data[r];if(n===null||!n.has(o))dd(0,e,o,r),dd(1,e,o,r),pd(e,r,!1);else{let i=n.get(o);fd(0,e,i,r),fd(1,e,i,r),pd(e,r,!0)}}}function dd(t,e,n,r){let o=t===0?n.inputs:n.outputs;for(let i in o)if(o.hasOwnProperty(i)){let s;t===0?s=e.inputs??={}:s=e.outputs??={},s[i]??=[],s[i].push(r),Lf(e,i)}}function fd(t,e,n,r){let o=t===0?n.inputs:n.outputs;for(let i in o)if(o.hasOwnProperty(i)){let s=o[i],a;t===0?a=e.hostDirectiveInputs??={}:a=e.hostDirectiveOutputs??={},a[s]??=[],a[s].push(r,i),Lf(e,s)}}function Lf(t,e){e==="class"?t.flags|=8:e==="style"&&(t.flags|=16)}function pd(t,e,n){let{attrs:r,inputs:o,hostDirectiveInputs:i}=t;if(r===null||!n&&o===null||n&&i===null||jc(t)){t.initialInputs??=[],t.initialInputs.push(null);return}let s=null,a=0;for(;a<r.length;){let c=r[a];if(c===0){a+=4;continue}else if(c===5){a+=2;continue}else if(typeof c=="number")break;if(!n&&o.hasOwnProperty(c)){let l=o[c];for(let u of l)if(u===e){s??=[],s.push(c,r[a+1]);break}}else if(n&&i.hasOwnProperty(c)){let l=i[c];for(let u=0;u<l.length;u+=2)if(l[u]===e){s??=[],s.push(l[u+1],r[a+1]);break}}a+=2}t.initialInputs??=[],t.initialInputs.push(s)}function Iv(t,e,n,r,o){t.data[r]=o;let i=o.factory||(o.factory=On(o.type,!0)),s=new Lr(i,dn(o),Of,null);t.blueprint[r]=s,n[r]=s,Dv(t,e,r,af(t,n,o.hostVars,me),o)}function Dv(t,e,n,r,o){let i=o.hostBindings;if(i){let s=t.hostBindingOpCodes;s===null&&(s=t.hostBindingOpCodes=[]);let a=~e.index;Tv(s)!=a&&s.push(a),s.push(n,r,i)}}function Tv(t){let e=t.length;for(;e>0;){let n=t[--e];if(typeof n=="number"&&n<0)return n}return 0}function Cv(t,e,n){if(n){if(e.exportAs)for(let r=0;r<e.exportAs.length;r++)n[e.exportAs[r]]=t;dn(e)&&(n[""]=t)}}function Mv(t,e,n){t.flags|=1,t.directiveStart=e,t.directiveEnd=e+n,t.providerIndexes=e}function Ff(t,e,n,r,o,i,s,a){let c=e[C],l=c.consts,u=pt(l,s),d=Ai(c,t,n,r,u);return i&&vv(c,e,d,pt(l,a),o),d.mergedAttrs=Ii(d.mergedAttrs,d.attrs),d.attrs!==null&&mi(d,d.attrs,!1),d.mergedAttrs!==null&&mi(d,d.mergedAttrs,!0),c.queries!==null&&c.queries.elementStart(c,d),d}function Vf(t,e){Im(t,e),xa(e)&&t.queries.elementEnd(e)}function Sv(t,e,n,r,o,i){let s=e.consts,a=pt(s,o),c=Ai(e,t,n,r,a);if(c.mergedAttrs=Ii(c.mergedAttrs,c.attrs),i!=null){let l=pt(s,i);c.localNames=[];for(let u=0;u<l.length;u+=2)c.localNames.push(l[u],-1)}return c.attrs!==null&&mi(c,c.attrs,!1),c.mergedAttrs!==null&&mi(c,c.mergedAttrs,!0),e.queries!==null&&e.queries.elementStart(e,c),c}function xv(t,e,n){return t[e]=n}function We(t,e,n){if(n===me)return!1;let r=t[e];return Object.is(r,n)?!1:(t[e]=n,!0)}function jf(t,e,n,r){let o=We(t,e,n);return We(t,e+1,r)||o}function _v(t,e,n,r,o){let i=jf(t,e,n,r);return We(t,e+2,o)||i}function ci(t,e,n){return function r(o){let i=r.__ngNativeEl__;i!==void 0&&qm(o,i);let s=Bt(t)?ft(t.index,e):e;Xc(s,5);let a=e[X],c=hd(e,a,n,o),l=r.__ngNextListenerFn__;for(;l;)c=hd(e,a,l,o)&&c,l=l.__ngNextListenerFn__;return c}}function hd(t,e,n,r){let o=T(null);try{return B(L.OutputStart,e,n),n(r)!==!1}catch(i){return qg(t,i),!1}finally{B(L.OutputEnd,e,n),T(o)}}function Hf(t,e,n,r,o,i,s,a){let c=Bo(t),l=!1,u=null;if(!r&&c&&(u=Av(e,n,i,t.index)),u!==null){let d=u.__ngLastListenerFn__||u;d.__ngNextListenerFn__=s,u.__ngLastListenerFn__=s,l=!0}else{let d=tt(t,n),f=r?r(d):d;Ym(n,f,i,a),r||(a.__ngNativeEl__=d);let p=o.listen(f,i,a);if(!Nv(i)){let h=r?m=>r(ze(m[t.index])):t.index;Bf(h,e,n,i,a,p,!1)}}return l}function Nv(t){return t.startsWith("animation")||t.startsWith("transition")}function Av(t,e,n,r){let o=t.cleanup;if(o!=null)for(let i=0;i<o.length-1;i+=2){let s=o[i];if(s===n&&o[i+1]===r){let a=e[jn],c=o[i+2];return a&&a.length>c?a[c]:null}typeof s=="string"&&(i+=2)}return null}function Bf(t,e,n,r,o,i,s){let a=e.firstCreatePass?Oa(e):null,c=ka(n),l=c.length;c.push(o,i),a&&a.push(r,t,l,(l+1)*(s?-1:1))}function md(t,e,n,r,o,i){let s=e[n],a=e[C],l=a.data[n].outputs[r],d=s[l].subscribe(i);Bf(t.index,a,e,o,i,d,!0)}var gc=Symbol("BINDING");function $f(t){return t.debugInfo?.className||t.type.name||null}var vc=class extends Pi{ngModule;constructor(e){super(),this.ngModule=e}resolveComponentFactory(e){let n=sn(e);return new Br(n,this.ngModule)}};function Rv(t){return Object.keys(t).map(e=>{let[n,r,o]=t[e],i={propName:n,templateName:e,isSignal:(r&Mi.SignalBased)!==0};return o&&(i.transform=o),i})}function Pv(t){return Object.keys(t).map(e=>({propName:t[e],templateName:e}))}function kv(t,e,n){let r=e instanceof je?e:e?.injector;return r&&t.getStandaloneInjector!==null&&(r=t.getStandaloneInjector(r)||r),r?new mc(n,r):n}function Ov(t){let e=t.get(vn,null);if(e===null)throw new N(407,!1);let n=t.get(kf,null),r=t.get(rn,null),o=t.get(Xn,null,{optional:!0});return{rendererFactory:e,sanitizer:n,changeDetectionScheduler:r,ngReflect:!1,tracingService:o}}function Lv(t,e){let n=Uf(t);return ef(e,n,n==="svg"?_a:n==="math"?Eu:null)}function Fv(t){if(t?.toLowerCase()==="script")throw new N(905,!1)}function Uf(t){return(t.selectors[0][0]||"div").toLowerCase()}var Br=class extends Ri{componentDef;ngModule;selector;componentType;ngContentSelectors;isBoundToModule;cachedInputs=null;cachedOutputs=null;get inputs(){return this.cachedInputs??=Rv(this.componentDef.inputs),this.cachedInputs}get outputs(){return this.cachedOutputs??=Pv(this.componentDef.outputs),this.cachedOutputs}constructor(e,n){super(),this.componentDef=e,this.ngModule=n,this.componentType=e.type,this.selector=lg(e.selectors),this.ngContentSelectors=e.ngContentSelectors??[],this.isBoundToModule=!!n}create(e,n,r,o,i,s){B(L.DynamicComponentStart);let a=T(null);try{let c=this.componentDef,l=kv(c,o||this.ngModule,e),u=Ov(l),d=u.tracingService;return d&&d.componentCreate?d.componentCreate($f(c),()=>this.createComponentRef(u,l,n,r,i,s)):this.createComponentRef(u,l,n,r,i,s)}finally{T(a)}}createComponentRef(e,n,r,o,i,s){let a=this.componentDef,c=Vv(o,a,s,i),l=e.rendererFactory.createRenderer(null,a),u=o?Pg(l,o,a.encapsulation,n):Lv(a,l);Fv(u?.tagName);let d=s?.some(gd)||i?.some(h=>typeof h!="function"&&h.bindings.some(gd)),f=Bc(null,c,null,512|sf(a),null,null,e,l,n,null,Xd(u,n,!0));f[ue]=u,Wo(f);let p=null;try{let h=Ff(ue,f,2,"#host",()=>c.directiveRegistry,!0,0);rf(l,u,h),Wn(u,f),mf(c,f,h),Jd(c,h,f),Vf(c,h),r!==void 0&&Hv(h,this.ngContentSelectors,r),p=ft(h.index,f),f[X]=p[X],Qc(c,f,null)}catch(h){throw p!==null&&sc(p),sc(f),h}finally{B(L.DynamicComponentEnd),Yo()}return new gi(this.componentType,f,!!d)}};function Vv(t,e,n,r){let o=t?["ng-version","21.2.20"]:ug(e.selectors[0]),i=null,s=null,a=0;if(n)for(let u of n)a+=u[gc].requiredVars,u.create&&(u.targetIdx=0,(i??=[]).push(u)),u.update&&(u.targetIdx=0,(s??=[]).push(u));if(r)for(let u=0;u<r.length;u++){let d=r[u];if(typeof d!="function")for(let f of d.bindings){a+=f[gc].requiredVars;let p=u+1;f.create&&(f.targetIdx=p,(i??=[]).push(f)),f.update&&(f.targetIdx=p,(s??=[]).push(f))}}let c=[e];if(r)for(let u of r){let d=typeof u=="function"?u:u.type,f=ga(d);c.push(f)}return Hc(0,null,jv(i,s),1,a,c,null,null,null,[o],null)}function jv(t,e){return!t&&!e?null:n=>{if(n&1&&t)for(let r of t)r.create();if(n&2&&e)for(let r of e)r.update()}}function gd(t){let e=t[gc].kind;return e==="input"||e==="twoWay"}var gi=class extends Pf{_rootLView;_hasInputBindings;instance;hostView;changeDetectorRef;componentType;location;previousInputValues=null;_tNode;constructor(e,n,r){super(),this._rootLView=n,this._hasInputBindings=r,this._tNode=$o(n[C],ue),this.location=Qn(this._tNode,n),this.instance=ft(this._tNode.index,n)[X],this.hostView=this.changeDetectorRef=new Yn(n,void 0),this.componentType=e}setInput(e,n){this._hasInputBindings;let r=this._tNode;if(this.previousInputValues??=new Map,this.previousInputValues.has(e)&&Object.is(this.previousInputValues.get(e),n))return;let o=this._rootLView,i=Zc(r,o[C],o,e,n);this.previousInputValues.set(e,n);let s=ft(r.index,o);Xc(s,1)}get injector(){return new mn(this._tNode,this._rootLView)}destroy(){this.hostView.destroy()}onDestroy(e){this.hostView.onDestroy(e)}};function Hv(t,e,n){let r=t.projection=[];for(let o=0;o<e.length;o++){let i=n[o];r.push(i!=null&&i.length?Array.from(i):null)}}var ki=(()=>{class t{static __NG_ELEMENT_ID__=Bv}return t})();function Bv(){let t=Ge();return zf(t,R())}var yc=class t extends ki{_lContainer;_hostTNode;_hostLView;constructor(e,n,r){super(),this._lContainer=e,this._hostTNode=n,this._hostLView=r}get element(){return Qn(this._hostTNode,this._hostLView)}get injector(){return new mn(this._hostTNode,this._hostLView)}get parentInjector(){let e=kc(this._hostTNode,this._hostLView);if(Rd(e)){let n=di(e,this._hostLView),r=ui(e),o=n[C].data[r+8];return new mn(o,n)}else return new mn(null,this._hostLView)}clear(){for(;this.length>0;)this.remove(this.length-1)}get(e){let n=vd(this._lContainer);return n!==null&&n[e]||null}get length(){return this._lContainer.length-Z}createEmbeddedView(e,n,r){let o,i;typeof r=="number"?o=r:r!=null&&(o=r.index,i=r.injector);let s=pc(this._lContainer,e.ssrId),a=e.createEmbeddedViewImpl(n||{},i,s);return this.insertImpl(a,o,Fr(this._hostTNode,s)),a}createComponent(e,n,r,o,i,s,a){let c=e&&!gm(e),l;if(c)l=n;else{let y=n||{};l=y.index,r=y.injector,o=y.projectableNodes,i=y.environmentInjector||y.ngModuleRef,s=y.directives,a=y.bindings}let u=c?e:new Br(sn(e)),d=r||this.parentInjector;if(!i&&u.ngModule==null){let I=(c?d:this.parentInjector).get(je,null);I&&(i=I)}let f=sn(u.componentType??{}),p=pc(this._lContainer,f?.id??null),h=p?.firstChild??null,m=u.create(d,o,h,i,s,a);return this.insertImpl(m.hostView,l,Fr(this._hostTNode,p)),m}insert(e,n){return this.insertImpl(e,n,!0)}insertImpl(e,n,r){let o=e._lView;if(wu(o)){let a=this.indexOf(e);if(a!==-1)this.detach(a);else{let c=o[re],l=new t(c,c[$e],c[re]);l.detach(l.indexOf(e))}}let i=this._adjustIndex(n),s=this._lContainer;return Ni(s,o,i,r),e.attachToViewContainerRef(),Ea(tc(s),i,e),e}move(e,n){return this.insert(e,n)}indexOf(e){let n=vd(this._lContainer);return n!==null?n.indexOf(e):-1}remove(e){let n=this._adjustIndex(e,-1),r=jr(this._lContainer,n);r&&(Cr(tc(this._lContainer),n),Si(r[C],r))}detach(e){let n=this._adjustIndex(e,-1),r=jr(this._lContainer,n);return r&&Cr(tc(this._lContainer),n)!=null?new Yn(r):null}_adjustIndex(e,n=0){return e??this.length+n}};function vd(t){return t[_r]}function tc(t){return t[_r]||(t[_r]=[])}function zf(t,e){let n,r=e[t.index];return et(r)?n=r:(n=xf(r,e,null,t),e[t.index]=n,$c(e,n)),Uv(n,e,t,r),new yc(n,t,e)}function $v(t,e){let n=t[W],r=n.createComment(""),o=tt(e,t),i=n.parentNode(o);return hi(n,i,r,n.nextSibling(o),!1),r}var Uv=qv,zv=()=>!1;function Gv(t,e,n){return zv(t,e,n)}function qv(t,e,n,r){if(t[jt])return;let o;n.type&8?o=ze(r):o=$v(e,n),t[jt]=o}var bc=class t{queryList;matches=null;constructor(e){this.queryList=e}clone(){return new t(this.queryList)}setDirty(){this.queryList.setDirty()}},Ec=class t{queries;constructor(e=[]){this.queries=e}createEmbeddedView(e){let n=e.queries;if(n!==null){let r=e.contentQueries!==null?e.contentQueries[0]:n.length,o=[];for(let i=0;i<r;i++){let s=n.getByIndex(i),a=this.queries[s.indexInDeclarationView];o.push(a.clone())}return new t(o)}return null}insertView(e){this.dirtyQueriesWithMatches(e)}detachView(e){this.dirtyQueriesWithMatches(e)}finishViewCreation(e){this.dirtyQueriesWithMatches(e)}dirtyQueriesWithMatches(e){for(let n=0;n<this.queries.length;n++)Wf(e,n).matches!==null&&this.queries[n].setDirty()}},wc=class{flags;read;predicate;constructor(e,n,r=null){this.flags=n,this.read=r,typeof e=="string"?this.predicate=Jv(e):this.predicate=e}},Ic=class t{queries;constructor(e=[]){this.queries=e}elementStart(e,n){for(let r=0;r<this.queries.length;r++)this.queries[r].elementStart(e,n)}elementEnd(e){for(let n=0;n<this.queries.length;n++)this.queries[n].elementEnd(e)}embeddedTView(e){let n=null;for(let r=0;r<this.length;r++){let o=n!==null?n.length:0,i=this.getByIndex(r).embeddedTView(e,o);i&&(i.indexInDeclarationView=r,n!==null?n.push(i):n=[i])}return n!==null?new t(n):null}template(e,n){for(let r=0;r<this.queries.length;r++)this.queries[r].template(e,n)}getByIndex(e){return this.queries[e]}get length(){return this.queries.length}track(e){this.queries.push(e)}},Dc=class t{metadata;matches=null;indexInDeclarationView=-1;crossesNgTemplate=!1;_declarationNodeIndex;_appliesToNextNode=!0;constructor(e,n=-1){this.metadata=e,this._declarationNodeIndex=n}elementStart(e,n){this.isApplyingToNode(n)&&this.matchTNode(e,n)}elementEnd(e){this._declarationNodeIndex===e.index&&(this._appliesToNextNode=!1)}template(e,n){this.elementStart(e,n)}embeddedTView(e,n){return this.isApplyingToNode(e)?(this.crossesNgTemplate=!0,this.addMatch(-e.index,n),new t(this.metadata)):null}isApplyingToNode(e){if(this._appliesToNextNode&&(this.metadata.flags&1)!==1){let n=this._declarationNodeIndex,r=e.parent;for(;r!==null&&r.type&8&&r.index!==n;)r=r.parent;return n===(r!==null?r.index:-1)}return this._appliesToNextNode}matchTNode(e,n){let r=this.metadata.predicate;if(Array.isArray(r))for(let o=0;o<r.length;o++){let i=r[o];this.matchTNodeWithReadOption(e,n,Wv(n,i)),this.matchTNodeWithReadOption(e,n,si(n,e,i,!1,!1))}else r===Hr?n.type&4&&this.matchTNodeWithReadOption(e,n,-1):this.matchTNodeWithReadOption(e,n,si(n,e,r,!1,!1))}matchTNodeWithReadOption(e,n,r){if(r!==null){let o=this.metadata.read;if(o!==null)if(o===zr||o===ki||o===Hr&&n.type&4)this.addMatch(n.index,-2);else{let i=si(n,e,o,!1,!1);i!==null&&this.addMatch(n.index,i)}else this.addMatch(n.index,r)}}addMatch(e,n){this.matches===null?this.matches=[e,n]:this.matches.push(e,n)}};function Wv(t,e){let n=t.localNames;if(n!==null){for(let r=0;r<n.length;r+=2)if(n[r]===e)return n[r+1]}return null}function Yv(t,e){return t.type&11?Qn(t,e):t.type&4?Kc(t,e):null}function Zv(t,e,n,r){return n===-1?Yv(e,t):n===-2?Qv(t,e,r):fi(t,t[C],n,e)}function Qv(t,e,n){if(n===zr)return Qn(e,t);if(n===Hr)return Kc(e,t);if(n===ki)return zf(e,t)}function Gf(t,e,n,r){let o=e[dt].queries[r];if(o.matches===null){let i=t.data,s=n.matches,a=[];for(let c=0;s!==null&&c<s.length;c+=2){let l=s[c];if(l<0)a.push(null);else{let u=i[l];a.push(Zv(e,u,s[c+1],n.metadata.read))}}o.matches=a}return o.matches}function Tc(t,e,n,r){let o=t.queries.getByIndex(n),i=o.matches;if(i!==null){let s=Gf(t,e,o,n);for(let a=0;a<i.length;a+=2){let c=i[a];if(c>0)r.push(s[a/2]);else{let l=i[a+1],u=e[-c];for(let d=Z;d<u.length;d++){let f=u[d];f[Ft]===f[re]&&Tc(f[C],f,l,r)}if(u[un]!==null){let d=u[un];for(let f=0;f<d.length;f++){let p=d[f];Tc(p[C],p,l,r)}}}}}return r}function qf(t,e){return t[dt].queries[e].queryList}function Xv(t,e,n){let r=new pi((n&4)===4);return Tu(t,e,r,r.destroy),(e[dt]??=new Ec).queries.push(new bc(r))-1}function Kv(t,e,n){let r=Ee();return r.firstCreatePass&&(ey(r,new wc(t,e,n),-1),(e&2)===2&&(r.staticViewQueries=!0)),Xv(r,R(),e)}function Jv(t){return t.split(",").map(e=>e.trim())}function ey(t,e,n){t.queries===null&&(t.queries=new Ic),t.queries.track(new Dc(e,n))}function Wf(t,e){return t.queries.getByIndex(e)}function ty(t,e){let n=t[C],r=Wf(n,e);return r.crossesNgTemplate?Tc(n,t,e,[]):Gf(n,t,r,e)}function Yf(t,e,n){let r,o=mr(()=>{r._dirtyCounter();let i=ry(r,t);if(e&&i===void 0)throw new N(-951,!1);return i});return r=o[pe],r._dirtyCounter=he(0),r._flatValue=void 0,o}function Zf(t){return Yf(!0,!1,t)}function Qf(t){return Yf(!0,!0,t)}function ny(t,e){let n=t[pe];n._lView=R(),n._queryIndex=e,n._queryList=qf(n._lView,e),n._queryList.onDirty(()=>n._dirtyCounter.update(r=>r+1))}function ry(t,e){let n=t._lView,r=t._queryIndex;if(n===void 0||r===void 0||n[x]&4)return e?void 0:Xe;let o=qf(n,r),i=ty(n,r);return o.reset(i,jm),e?o.first:o._changesDetected||t._flatValue===void 0?t._flatValue=o.toArray():t._flatValue}var vi=class{};var $r=class extends vi{injector;componentFactoryResolver=new vc(this);instance=null;constructor(e){super();let n=new nn([...e.providers,{provide:vi,useValue:this},{provide:Pi,useValue:this.componentFactoryResolver}],e.parent||xr(),e.debugName,new Set(["environment"]));this.injector=n,e.runEnvironmentInitializers&&n.resolveInjectorInitializers()}destroy(){this.injector.destroy()}onDestroy(e){this.injector.onDestroy(e)}};function Xf(t,e,n=null){return new $r({providers:t,parent:e,debugName:n,runEnvironmentInitializers:!0}).injector}var oy=(()=>{class t{_injector;cachedInjectors=new Map;constructor(n){this._injector=n}getOrCreateStandaloneInjector(n){if(!n.standalone)return null;if(!this.cachedInjectors.has(n)){let r=Da(!1,n.type),o=r.length>0?Xf([r],this._injector,""):null;this.cachedInjectors.set(n,o)}return this.cachedInjectors.get(n)}ngOnDestroy(){try{for(let n of this.cachedInjectors.values())n!==null&&n.destroy()}finally{this.cachedInjectors.clear()}}static \u0275prov=ee({token:t,providedIn:"environment",factory:()=>new t(H(je))})}return t})();function Le(t){return Sd(()=>{let e=cy(t),n=J(Y({},e),{decls:t.decls,vars:t.vars,template:t.template,consts:t.consts||null,ngContentSelectors:t.ngContentSelectors,onPush:t.changeDetection===Oc.OnPush,directiveDefs:null,pipeDefs:null,dependencies:e.standalone&&t.dependencies||null,getStandaloneInjector:e.standalone?o=>o.get(oy).getOrCreateStandaloneInjector(n):null,getExternalStyles:null,signals:t.signals??!1,data:t.data||{},encapsulation:t.encapsulation||it.Emulated,styles:t.styles||Xe,_:null,schemas:t.schemas||null,tView:null,id:""});e.standalone&&bn("NgStandalone"),ly(n);let r=t.dependencies;return n.directiveDefs=yd(r,iy),n.pipeDefs=yd(r,su),n.id=uy(n),n})}function iy(t){return sn(t)||ga(t)}function sy(t,e){if(t==null)return an;let n={};for(let r in t)if(t.hasOwnProperty(r)){let o=t[r],i,s,a,c;Array.isArray(o)?(a=o[0],i=o[1],s=o[2]??i,c=o[3]||null):(i=o,s=o,a=Mi.None,c=null),n[i]=[r,a,c],e[i]=s}return n}function ay(t){if(t==null)return an;let e={};for(let n in t)t.hasOwnProperty(n)&&(e[t[n]]=n);return e}function cy(t){let e={};return{type:t.type,providersResolver:null,viewProvidersResolver:null,factory:null,hostBindings:t.hostBindings||null,hostVars:t.hostVars||0,hostAttrs:t.hostAttrs||null,contentQueries:t.contentQueries||null,declaredInputs:e,inputConfig:t.inputs||an,exportAs:t.exportAs||null,standalone:t.standalone??!0,signals:t.signals===!0,selectors:t.selectors||Xe,viewQuery:t.viewQuery||null,features:t.features||null,setInput:null,resolveHostDirectives:null,hostDirectives:null,controlDef:null,inputs:sy(t.inputs,e),outputs:ay(t.outputs),debugInfo:null}}function ly(t){t.features?.forEach(e=>e(t))}function yd(t,e){return t?()=>{let n=typeof t=="function"?t():t,r=[];for(let o of n){let i=e(o);i!==null&&r.push(i)}return r}:null}function uy(t){let e=0,n=typeof t.consts=="function"?"":t.consts,r=[t.selectors,t.ngContentSelectors,t.hostVars,t.hostAttrs,n,t.vars,t.decls,t.encapsulation,t.standalone,t.signals,t.exportAs,JSON.stringify(t.inputs),JSON.stringify(t.outputs),Object.getOwnPropertyNames(t.type.prototype),!!t.contentQueries,!!t.viewQuery];for(let i of r.join("|"))e=Math.imul(31,e)+i.charCodeAt(0)<<0;return e+=2147483648,"c"+e}function dy(t,e,n,r,o,i,s,a){if(n.firstCreatePass){t.mergedAttrs=Ii(t.mergedAttrs,t.attrs);let u=t.tView=Hc(2,t,o,i,s,n.directiveRegistry,n.pipeRegistry,null,n.schemas,n.consts,null);n.queries!==null&&(n.queries.template(n,t),u.queries=n.queries.embeddedTView(t))}a&&(t.flags|=a),Un(t,!1);let c=fy(n,e,t,r);Ko()&&qc(n,e,c,t),Wn(c,e);let l=xf(c,e,c,t);e[r+ue]=l,$c(e,l),Gv(l,t,e)}function yi(t,e,n,r,o,i,s,a,c,l,u){let d=n+ue,f;if(e.firstCreatePass){if(f=Ai(e,d,4,s||null,a||null),l!=null){let p=pt(e.consts,l);f.localNames=[];for(let h=0;h<p.length;h+=2)f.localNames.push(p[h],-1)}}else f=e.data[d];return dy(f,t,e,n,r,o,i,c),l!=null&&Yc(t,f,u),f}var fy=py;function py(t,e,n,r){return Jo(!0),e[W].createComment("")}var Jc=new O("");function el(t){return!!t&&typeof t.then=="function"}function Kf(t){return!!t&&typeof t.subscribe=="function"}var Jf=new O("");var tl=(()=>{class t{resolve;reject;initialized=!1;done=!1;donePromise=new Promise((n,r)=>{this.resolve=n,this.reject=r});appInits=A(Jf,{optional:!0})??[];injector=A(bt);constructor(){}runInitializers(){if(this.initialized)return;let n=[];for(let o of this.appInits){let i=Vo(this.injector,o);if(el(i))n.push(i);else if(Kf(i)){let s=new Promise((a,c)=>{i.subscribe({complete:a,error:c})});n.push(s)}}let r=()=>{this.done=!0,this.resolve()};Promise.all(n).then(()=>{r()}).catch(o=>{this.reject(o)}),n.length===0&&r(),this.initialized=!0}static \u0275fac=function(r){return new(r||t)};static \u0275prov=ee({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})(),ep=new O("");function tp(){js(()=>{let t="";throw new N(600,t)})}function np(t){return t.isBoundToModule}var hy=10;var Oi=(()=>{class t{_runningTick=!1;_destroyed=!1;_destroyListeners=[];_views=[];internalErrorHandler=A(hn);afterRenderManager=A(lf);zonelessEnabled=A(Rr);rootEffectScheduler=A(ti);dirtyFlags=0;tracingSnapshot=null;allTestViews=new Set;autoDetectTestViews=new Set;includeAllTestViews=!1;afterTick=new gt;get allViews(){return[...(this.includeAllTestViews?this.allTestViews:this.autoDetectTestViews).keys(),...this._views]}get destroyed(){return this._destroyed}componentTypes=[];components=[];internalPendingTask=A(zn);get isStable(){return this.internalPendingTask.hasPendingTasksObservable.pipe(Qs(n=>!n))}constructor(){A(Xn,{optional:!0})}whenStable(){let n;return new Promise(r=>{n=this.isStable.subscribe({next:o=>{o&&r()}})}).finally(()=>{n.unsubscribe()})}_injector=A(je);_rendererFactory=null;get injector(){return this._injector}bootstrap(n,r){return this.bootstrapImpl(n,r)}bootstrapImpl(n,r,o=bt.NULL){return this._injector.get(He).run(()=>{B(L.BootstrapComponentStart);let s=n instanceof Ri;if(!this._injector.get(tl).done){let h="";throw new N(405,h)}let c;s?c=n:c=this._injector.get(Pi).resolveComponentFactory(n),this.componentTypes.push(c.componentType);let l=np(c)?void 0:this._injector.get(vi),u=r||c.selector,d=c.create(o,[],u,l),f=d.location.nativeElement,p=d.injector.get(Jc,null);return p?.registerApplication(f),d.onDestroy(()=>{this.detachView(d.hostView),Or(this.components,d),p?.unregisterApplication(f)}),this._loadComponent(d),B(L.BootstrapComponentEnd,d),d})}tick(){this.zonelessEnabled||(this.dirtyFlags|=1),this._tick()}_tick(){B(L.ChangeDetectionStart),this.tracingSnapshot!==null?this.tracingSnapshot.run(zc.CHANGE_DETECTION,this.tickImpl):this.tickImpl()}tickImpl=()=>{if(this._runningTick)throw B(L.ChangeDetectionEnd),new N(101,!1);let n=T(null);try{this._runningTick=!0,this.synchronize()}finally{this._runningTick=!1,this.tracingSnapshot?.dispose(),this.tracingSnapshot=null,T(n),this.afterTick.next(),B(L.ChangeDetectionEnd)}};synchronize(){this._rendererFactory===null&&!this._injector.destroyed&&(this._rendererFactory=this._injector.get(vn,null,{optional:!0}));let n=0;for(;this.dirtyFlags!==0&&n++<hy;){B(L.ChangeDetectionSyncStart);try{this.synchronizeOnce()}finally{B(L.ChangeDetectionSyncEnd)}}}synchronizeOnce(){this.dirtyFlags&16&&(this.dirtyFlags&=-17,this.rootEffectScheduler.flush());let n=!1;if(this.dirtyFlags&7){let r=!!(this.dirtyFlags&1);this.dirtyFlags&=-8,this.dirtyFlags|=8;for(let{_lView:o}of this.allViews){if(!r&&!Nr(o))continue;let i=r&&!this.zonelessEnabled?0:1;Tf(o,i),n=!0}if(this.dirtyFlags&=-5,this.syncDirtyFlagsWithViews(),this.dirtyFlags&23)return}n||(this._rendererFactory?.begin?.(),this._rendererFactory?.end?.()),this.dirtyFlags&8&&(this.dirtyFlags&=-9,this.afterRenderManager.execute()),this.syncDirtyFlagsWithViews()}syncDirtyFlagsWithViews(){if(this.allViews.some(({_lView:n})=>Nr(n))){this.dirtyFlags|=2;return}else this.dirtyFlags&=-8}attachView(n){let r=n;this._views.push(r),r.attachToAppRef(this)}detachView(n){let r=n;Or(this._views,r),r.detachFromAppRef()}_loadComponent(n){this.attachView(n.hostView);try{this.tick()}catch(o){this.internalErrorHandler(o)}this.components.push(n),this._injector.get(ep,[]).forEach(o=>o(n))}ngOnDestroy(){if(!this._destroyed)try{this._destroyListeners.forEach(n=>n()),this._views.slice().forEach(n=>n.destroy())}finally{this._destroyed=!0,this._views=[],this._destroyListeners=[]}}onDestroy(n){return this._destroyListeners.push(n),()=>Or(this._destroyListeners,n)}destroy(){if(this._destroyed)throw new N(406,!1);let n=this._injector;n.destroy&&!n.destroyed&&n.destroy()}get viewCount(){return this._views.length}static \u0275fac=function(r){return new(r||t)};static \u0275prov=ee({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function Or(t,e){let n=t.indexOf(e);n>-1&&t.splice(n,1)}function Li(t,e,n,r){let o=R(),i=pn();if(We(o,i,e)){let s=Ee(),a=Zo();Ug(a,o,t,e,n,r)}return Li}var Cc=class{destroy(e){}updateValue(e,n){}swap(e,n){let r=Math.min(e,n),o=Math.max(e,n),i=this.detach(o);if(o-r>1){let s=this.detach(r);this.attach(r,i),this.attach(o,s)}else this.attach(r,i)}move(e,n){this.attach(n,this.detach(e))}};function nc(t,e,n,r,o){return t===n&&Object.is(e,r)?1:Object.is(o(t,e),o(n,r))?-1:0}function my(t,e,n,r){let o,i,s=0,a=t.length-1,c=void 0;if(Array.isArray(e)){T(r);let l=e.length-1;for(T(null);s<=a&&s<=l;){let u=t.at(s),d=e[s],f=nc(s,u,s,d,n);if(f!==0){f<0&&t.updateValue(s,d),s++;continue}let p=t.at(a),h=e[l],m=nc(a,p,l,h,n);if(m!==0){m<0&&t.updateValue(a,h),a--,l--;continue}let y=n(s,u),I=n(a,p),M=n(s,d);if(Object.is(M,I)){let D=n(l,h);Object.is(D,y)?(t.swap(s,a),t.updateValue(a,h),l--,a--):t.move(a,s),t.updateValue(s,d),s++;continue}if(o??=new bi,i??=Ed(t,s,a,n),Mc(t,o,s,M))t.updateValue(s,d),s++,a++;else if(i.has(M))o.set(y,t.detach(s)),a--;else{let D=t.create(s,e[s]);t.attach(s,D),s++,a++}}for(;s<=l;)bd(t,o,n,s,e[s]),s++}else if(e!=null){T(r);let l=e[Symbol.iterator]();T(null);let u=l.next();for(;!u.done&&s<=a;){let d=t.at(s),f=u.value,p=nc(s,d,s,f,n);if(p!==0)p<0&&t.updateValue(s,f),s++,u=l.next();else{o??=new bi,i??=Ed(t,s,a,n);let h=n(s,f);if(Mc(t,o,s,h))t.updateValue(s,f),s++,a++,u=l.next();else if(!i.has(h))t.attach(s,t.create(s,f)),s++,a++,u=l.next();else{let m=n(s,d);o.set(m,t.detach(s)),a--}}}for(;!u.done;)bd(t,o,n,t.length,u.value),u=l.next()}for(;s<=a;)t.destroy(t.detach(a--));o?.forEach(l=>{t.destroy(l)})}function Mc(t,e,n,r){return e!==void 0&&e.has(r)?(t.attach(n,e.get(r)),e.delete(r),!0):!1}function bd(t,e,n,r,o){if(Mc(t,e,r,n(r,o)))t.updateValue(r,o);else{let i=t.create(r,o);t.attach(r,i)}}function Ed(t,e,n,r){let o=new Set;for(let i=e;i<=n;i++)o.add(r(i,t.at(i)));return o}var bi=class{kvMap=new Map;_vMap=void 0;has(e){return this.kvMap.has(e)}delete(e){if(!this.has(e))return!1;let n=this.kvMap.get(e);return this._vMap!==void 0&&this._vMap.has(n)?(this.kvMap.set(e,this._vMap.get(n)),this._vMap.delete(n)):this.kvMap.delete(e),!0}get(e){return this.kvMap.get(e)}set(e,n){if(this.kvMap.has(e)){let r=this.kvMap.get(e);this._vMap===void 0&&(this._vMap=new Map);let o=this._vMap;for(;o.has(r);)r=o.get(r);o.set(r,n)}else this.kvMap.set(e,n)}forEach(e){for(let[n,r]of this.kvMap)if(e(r,n),this._vMap!==void 0){let o=this._vMap;for(;o.has(r);)r=o.get(r),e(r,n)}}};function ae(t,e,n,r,o,i,s,a){bn("NgControlFlow");let c=R(),l=Ee(),u=pt(l.consts,i);return yi(c,l,t,e,n,r,o,u,256,s,a),nl}function nl(t,e,n,r,o,i,s,a){bn("NgControlFlow");let c=R(),l=Ee(),u=pt(l.consts,i);return yi(c,l,t,e,n,r,o,u,512,s,a),nl}function ce(t,e){bn("NgControlFlow");let n=R(),r=pn(),o=n[r]!==me?n[r]:-1,i=o!==-1?Ei(n,ue+o):void 0,s=0;if(We(n,r,t)){let a=T(null);try{if(i!==void 0&&Nf(i,s),t!==-1){let c=ue+t,l=Ei(n,c),u=Nc(n[C],c),d=Rf(l,u,n),f=_i(n,u,e,{dehydratedView:d});Ni(l,f,s,Fr(u,d))}}finally{T(a)}}else if(i!==void 0){let a=_f(i,s);a!==void 0&&(a[X]=e)}}var Sc=class{lContainer;$implicit;$index;constructor(e,n,r){this.lContainer=e,this.$implicit=n,this.$index=r}get $count(){return this.lContainer.length-Z}};function Kn(t){return t}function rl(t,e){return e}var xc=class{hasEmptyBlock;trackByFn;liveCollection;constructor(e,n,r){this.hasEmptyBlock=e,this.trackByFn=n,this.liveCollection=r}};function Te(t,e,n,r,o,i,s,a,c,l,u,d,f){bn("NgControlFlow");let p=R(),h=Ee(),m=c!==void 0,y=R(),I=a?s.bind(y[Ue][X]):s,M=new xc(m,I);y[ue+t]=M,yi(p,h,t+1,e,n,r,o,pt(h.consts,i),256),m&&yi(p,h,t+2,c,l,u,d,pt(h.consts,f),512)}var _c=class extends Cc{lContainer;hostLView;templateTNode;operationsCounter=void 0;needsIndexUpdate=!1;constructor(e,n,r){super(),this.lContainer=e,this.hostLView=n,this.templateTNode=r}get length(){return this.lContainer.length-Z}at(e){return this.getLView(e)[X].$implicit}attach(e,n){let r=n[Vn];this.needsIndexUpdate||=e!==this.length,Ni(this.lContainer,n,e,Fr(this.templateTNode,r)),gy(this.lContainer,e)}detach(e){return this.needsIndexUpdate||=e!==this.length-1,vy(this.lContainer,e),yy(this.lContainer,e)}create(e,n){let r=pc(this.lContainer,this.templateTNode.tView.ssrId);return _i(this.hostLView,this.templateTNode,new Sc(this.lContainer,n,e),{dehydratedView:r})}destroy(e){Si(e[C],e)}updateValue(e,n){this.getLView(e)[X].$implicit=n}reset(){this.needsIndexUpdate=!1}updateIndexes(){if(this.needsIndexUpdate)for(let e=0;e<this.length;e++)this.getLView(e)[X].$index=e}getLView(e){return by(this.lContainer,e)}};function Ce(t){let e=T(null),n=nt();try{let r=R(),o=r[C],i=r[n],s=n+1,a=Ei(r,s);if(i.liveCollection===void 0){let l=Nc(o,s);i.liveCollection=new _c(a,r,l)}else i.liveCollection.reset();let c=i.liveCollection;if(my(c,t,i.trackByFn,e),c.updateIndexes(),i.hasEmptyBlock){let l=pn(),u=c.length===0;if(We(r,l,u)){let d=n+2,f=Ei(r,d);if(u){let p=Nc(o,d),h=Rf(f,p,r),m=_i(r,p,void 0,{dehydratedView:h});Ni(f,m,0,Fr(p,h))}else o.firstUpdatePass&&pv(f),Nf(f,0)}}}finally{T(e)}}function Ei(t,e){return t[e]}function gy(t,e){if(t.length<=Z)return;let n=Z+e,r=t[n],o=r?r[Vt]:void 0;if(r&&o&&o.detachedLeaveAnimationFns&&o.detachedLeaveAnimationFns.length>0){let i=r[Et];vg(i,o),gn.delete(r[wt]),o.detachedLeaveAnimationFns=void 0}}function vy(t,e){if(t.length<=Z)return;let n=Z+e,r=t[n],o=r?r[Vt]:void 0;o&&o.leave&&o.leave.size>0&&(o.detachedLeaveAnimationFns=[])}function yy(t,e){return jr(t,e)}function by(t,e){return _f(t,e)}function Nc(t,e){return $o(t,e)}function zt(t,e,n){let r=R(),o=pn();if(We(r,o,e)){let i=Ee(),s=Zo();Fg(s,r,t,e,r[W],n)}return zt}function Ac(t,e,n,r,o){Zc(e,t,n,o?"class":"style",r)}function se(t,e,n,r){let o=R(),i=o[C],s=t+ue,a=i.firstCreatePass?Ff(s,o,2,e,$g,Su(),n,r):i.data[s];if(Bt(a)){let c=o[ut].tracingService;if(c&&c.componentCreate){let l=i.data[a.directiveStart+a.componentOffset];return c.componentCreate($f(l),()=>(wd(t,e,o,a,r),se))}}return wd(t,e,o,a,r),se}function wd(t,e,n,r,o){if(vf(r,n,t,e,rp),Bo(r)){let i=n[C];mf(i,n,r),Jd(i,r,n)}o!=null&&Yc(n,r)}function de(){let t=Ee(),e=Ge(),n=yf(e);return t.firstCreatePass&&Vf(t,n),Fa(n)&&Va(),La(),n.classesWithoutHost!=null&&Tm(n)&&Ac(t,n,R(),n.classesWithoutHost,!0),n.stylesWithoutHost!=null&&Cm(n)&&Ac(t,n,R(),n.stylesWithoutHost,!1),de}function Jn(t,e,n,r){return se(t,e,n,r),de(),Jn}function E(t,e,n,r){let o=R(),i=o[C],s=t+ue,a=i.firstCreatePass?Sv(s,i,2,e,n,r):i.data[s];return vf(a,o,t,e,rp),r!=null&&Yc(o,a),E}function b(){let t=Ge(),e=yf(t);return Fa(e)&&Va(),La(),b}function Dt(t,e,n,r){return E(t,e,n,r),b(),Dt}var rp=(t,e,n,r,o)=>(Jo(!0),ef(e[W],r,Ga()));function Gt(){return R()}function Fi(t,e,n){let r=R(),o=pn();if(We(r,o,e)){let i=Ee(),s=Zo();gf(s,r,t,e,r[W],n)}return Fi}var qr="en-US";var Ey=qr;function op(t){typeof t=="string"&&(Ey=t.toLowerCase().replace(/_/g,"-"))}function er(t,e,n){let r=R(),o=Ee(),i=Ge();return wy(o,r,r[W],i,t,e,n),er}function Tt(t,e,n){let r=R(),o=Ee(),i=Ge();return(i.type&3||n)&&Hf(i,o,r,n,r[W],t,e,ci(i,r,e)),Tt}function wy(t,e,n,r,o,i,s){let a=!0,c=null;if((r.type&3||s)&&(c??=ci(r,e,i),Hf(r,t,e,s,n,o,i,c)&&(a=!1)),a){let l=r.outputs?.[o],u=r.hostDirectiveOutputs?.[o];if(u&&u.length)for(let d=0;d<u.length;d+=2){let f=u[d],p=u[d+1];c??=ci(r,e,i),md(r,e,f,p,o,c)}if(l&&l.length)for(let d of l)c??=ci(r,e,i),md(r,e,d,o,o,c)}}function V(t=1){return Bu(t)}function tr(t,e,n,r){return ny(t,Kv(e,n,r)),tr}function Wr(t=1){qo(Fu()+t)}function ri(t,e){return t<<17|e<<2}function yn(t){return t>>17&32767}function Iy(t){return(t&2)==2}function Dy(t,e){return t&131071|e<<17}function Rc(t){return t|2}function Zn(t){return(t&131068)>>2}function rc(t,e){return t&-131069|e<<2}function Ty(t){return(t&1)===1}function Pc(t){return t|1}function Cy(t,e,n,r,o,i){let s=i?e.classBindings:e.styleBindings,a=yn(s),c=Zn(s);t[r]=n;let l=!1,u;if(Array.isArray(n)){let d=n;u=d[1],(u===null||Ln(d,u)>0)&&(l=!0)}else u=n;if(o)if(c!==0){let f=yn(t[a+1]);t[r+1]=ri(f,a),f!==0&&(t[f+1]=rc(t[f+1],r)),t[a+1]=Dy(t[a+1],r)}else t[r+1]=ri(a,0),a!==0&&(t[a+1]=rc(t[a+1],r)),a=r;else t[r+1]=ri(c,0),a===0?a=r:t[c+1]=rc(t[c+1],r),c=r;l&&(t[r+1]=Rc(t[r+1])),Id(t,u,r,!0),Id(t,u,r,!1),My(e,u,t,r,i),s=ri(a,c),i?e.classBindings=s:e.styleBindings=s}function My(t,e,n,r,o){let i=o?t.residualClasses:t.residualStyles;i!=null&&typeof e=="string"&&Ln(i,e)>=0&&(n[r+1]=Pc(n[r+1]))}function Id(t,e,n,r){let o=t[n+1],i=e===null,s=r?yn(o):Zn(o),a=!1;for(;s!==0&&(a===!1||i);){let c=t[s],l=t[s+1];Sy(c,e)&&(a=!0,t[s+1]=r?Pc(l):Rc(l)),s=r?yn(l):Zn(l)}a&&(t[n+1]=r?Rc(o):Pc(o))}function Sy(t,e){return t===null||e==null||(Array.isArray(t)?t[1]:t)===e?!0:Array.isArray(t)&&typeof e=="string"?Ln(t,e)>=0:!1}var ot={textEnd:0,key:0,keyEnd:0,value:0,valueEnd:0};function xy(t){return t.substring(ot.key,ot.keyEnd)}function _y(t){return Ny(t),ip(t,sp(t,0,ot.textEnd))}function ip(t,e){let n=ot.textEnd;return n===e?-1:(e=ot.keyEnd=Ay(t,ot.key=e,n),sp(t,e,n))}function Ny(t){ot.key=0,ot.keyEnd=0,ot.value=0,ot.valueEnd=0,ot.textEnd=t.length}function sp(t,e,n){for(;e<n&&t.charCodeAt(e)<=32;)e++;return e}function Ay(t,e,n){for(;e<n&&t.charCodeAt(e)>32;)e++;return e}function st(t,e,n){return ap(t,e,n,!1),st}function we(t,e){return ap(t,e,null,!0),we}function ol(t){Py(jy,Ry,t,!0)}function Ry(t,e){for(let n=_y(e);n>=0;n=ip(e,n))Lo(t,xy(e),!0)}function ap(t,e,n,r){let o=R(),i=Ee(),s=Ar(2);if(i.firstUpdatePass&&lp(i,t,s,r),e!==me&&We(o,s,e)){let a=i.data[nt()];up(i,a,o,o[W],t,o[s+1]=By(e,n),r,s)}}function Py(t,e,n,r){let o=Ee(),i=Ar(2);o.firstUpdatePass&&lp(o,null,i,r);let s=R();if(n!==me&&We(s,i,n)){let a=o.data[nt()];if(dp(a,r)&&!cp(o,i)){let c=r?a.classesWithoutHost:a.stylesWithoutHost;c!==null&&(n=No(c,n||"")),Ac(o,a,s,n,r)}else Hy(o,a,s,s[W],s[i+1],s[i+1]=Vy(t,e,n),r,i)}}function cp(t,e){return e>=t.expandoStartIndex}function lp(t,e,n,r){let o=t.data;if(o[n+1]===null){let i=o[nt()],s=cp(t,n);dp(i,r)&&e===null&&!s&&(e=!1),e=ky(o,i,e,r),Cy(o,i,e,n,s,r)}}function ky(t,e,n,r){let o=Lu(t),i=r?e.residualClasses:e.residualStyles;if(o===null)(r?e.classBindings:e.styleBindings)===0&&(n=oc(null,t,e,n,r),n=Ur(n,e.attrs,r),i=null);else{let s=e.directiveStylingLast;if(s===-1||t[s]!==o)if(n=oc(o,t,e,n,r),i===null){let c=Oy(t,e,r);c!==void 0&&Array.isArray(c)&&(c=oc(null,t,e,c[1],r),c=Ur(c,e.attrs,r),Ly(t,e,r,c))}else i=Fy(t,e,r)}return i!==void 0&&(r?e.residualClasses=i:e.residualStyles=i),n}function Oy(t,e,n){let r=n?e.classBindings:e.styleBindings;if(Zn(r)!==0)return t[yn(r)]}function Ly(t,e,n,r){let o=n?e.classBindings:e.styleBindings;t[yn(o)]=r}function Fy(t,e,n){let r,o=e.directiveEnd;for(let i=1+e.directiveStylingLast;i<o;i++){let s=t[i].hostAttrs;r=Ur(r,s,n)}return Ur(r,e.attrs,n)}function oc(t,e,n,r,o){let i=null,s=n.directiveEnd,a=n.directiveStylingLast;for(a===-1?a=n.directiveStart:a++;a<s&&(i=e[a],r=Ur(r,i.hostAttrs,o),i!==t);)a++;return t!==null&&(n.directiveStylingLast=a),r}function Ur(t,e,n){let r=n?1:2,o=-1;if(e!==null)for(let i=0;i<e.length;i++){let s=e[i];typeof s=="number"?o=s:o===r&&(Array.isArray(t)||(t=t===void 0?[]:["",t]),Lo(t,s,n?!0:e[++i]))}return t===void 0?null:t}function Vy(t,e,n){if(n==null||n==="")return Xe;let r=[],o=Vc(n);if(Array.isArray(o))for(let i=0;i<o.length;i++)t(r,o[i],!0);else if(o instanceof Set)for(let i of o)t(r,i,!0);else if(typeof o=="object")for(let i in o)o.hasOwnProperty(i)&&t(r,i,o[i]);else typeof o=="string"&&e(r,o);return r}function jy(t,e,n){let r=String(e);r!==""&&!r.includes(" ")&&Lo(t,r,n)}function Hy(t,e,n,r,o,i,s,a){o===me&&(o=Xe);let c=0,l=0,u=0<o.length?o[0]:null,d=0<i.length?i[0]:null;for(;u!==null||d!==null;){let f=c<o.length?o[c+1]:void 0,p=l<i.length?i[l+1]:void 0,h=null,m;u===d?(c+=2,l+=2,f!==p&&(h=d,m=p)):d===null||u!==null&&u<d?(c+=2,h=u):(l+=2,h=d,m=p),h!==null&&up(t,e,n,r,h,m,s,a),u=c<o.length?o[c]:null,d=l<i.length?i[l]:null}}function up(t,e,n,r,o,i,s,a){if(!(e.type&3))return;let c=t.data,l=c[a+1],u=Ty(l)?Dd(c,e,n,o,Zn(l),s):void 0;if(!wi(u)){wi(i)||Iy(l)&&(i=Dd(c,null,n,o,a,s));let d=Na(nt(),n);Rg(r,s,d,o,i)}}function Dd(t,e,n,r,o,i){let s=e===null,a;for(;o>0;){let c=t[o],l=Array.isArray(c),u=l?c[1]:c,d=u===null,f=n[o+1];f===me&&(f=d?Xe:void 0);let p=d?Fo(f,r):u===r?f:void 0;if(l&&!wi(p)&&(p=Fo(c,r)),wi(p)&&(a=p,s))return a;let h=t[o+1];o=s?yn(h):Zn(h)}if(e!==null){let c=i?e.residualClasses:e.residualStyles;c!=null&&(a=Fo(c,r))}return a}function wi(t){return t!==void 0}function By(t,e){return t==null||t===""||(typeof e=="string"?t=t+e:typeof t=="object"&&(t=_o(Vc(t)))),t}function dp(t,e){return(t.flags&(e?8:16))!==0}function w(t,e=""){let n=R(),r=Ee(),o=t+ue,i=r.firstCreatePass?Ai(r,o,1,e,null):r.data[o],s=$y(r,n,i,e);n[o]=s,Ko()&&qc(r,n,s,i),Un(i,!1)}var $y=(t,e,n,r)=>(Jo(!0),Qm(e[W],r));function Uy(t,e,n,r=""){return We(t,pn(),n)?e+Lt(n)+r:me}function zy(t,e,n,r,o,i=""){let s=$a(),a=jf(t,s,n,o);return Ar(2),a?e+Lt(n)+r+Lt(o)+i:me}function Gy(t,e,n,r,o,i,s,a=""){let c=$a(),l=_v(t,c,n,o,s);return Ar(3),l?e+Lt(n)+r+Lt(o)+i+Lt(s)+a:me}function ge(t){return z("",t),ge}function z(t,e,n){let r=R(),o=Uy(r,t,e,n);return o!==me&&il(r,nt(),o),z}function Vi(t,e,n,r,o){let i=R(),s=zy(i,t,e,n,r,o);return s!==me&&il(i,nt(),s),Vi}function ji(t,e,n,r,o,i,s){let a=R(),c=Gy(a,t,e,n,r,o,i,s);return c!==me&&il(a,nt(),c),ji}function il(t,e,n){let r=Na(e,t);Xm(t[W],r,n)}function sl(t,e,n){return Wy(R(),Au(),t,e,n)}function qy(t,e){let n=t[e];return n===me?void 0:n}function Wy(t,e,n,r,o,i){let s=e+n;return We(t,s,o)?xv(t,s+1,i?r.call(i,o):r(o)):qy(t,s+1)}var fp=(()=>{class t{applicationErrorHandler=A(hn);appRef=A(Oi);taskService=A(zn);ngZone=A(He);zonelessEnabled=A(Rr);tracing=A(Xn,{optional:!0});zoneIsDefined=typeof Zone<"u"&&!!Zone.root.run;schedulerTickApplyArgs=[{data:{__scheduler_tick__:!0}}];subscriptions=new be;angularZoneId=this.zoneIsDefined?this.ngZone._inner?.get(Ir):null;scheduleInRootZone=!this.zonelessEnabled&&this.zoneIsDefined&&(A(Xa,{optional:!0})??!1);cancelScheduledCallback=null;useMicrotaskScheduler=!1;runningTick=!1;pendingRenderTaskId=null;constructor(){this.subscriptions.add(this.appRef.afterTick.subscribe(()=>{let n=this.taskService.add();if(!this.runningTick&&(this.cleanup(),!this.zonelessEnabled||this.appRef.includeAllTestViews)){this.taskService.remove(n);return}this.switchToMicrotaskScheduler(),this.taskService.remove(n)})),this.subscriptions.add(this.ngZone.onUnstable.subscribe(()=>{this.runningTick||this.cleanup()}))}switchToMicrotaskScheduler(){this.ngZone.runOutsideAngular(()=>{let n=this.taskService.add();this.useMicrotaskScheduler=!0,queueMicrotask(()=>{this.useMicrotaskScheduler=!1,this.taskService.remove(n)})})}notify(n){if(!this.zonelessEnabled&&n===5)return;switch(n){case 0:{this.appRef.dirtyFlags|=2;break}case 3:case 2:case 4:case 5:case 1:{this.appRef.dirtyFlags|=4;break}case 6:{this.appRef.dirtyFlags|=2;break}case 12:{this.appRef.dirtyFlags|=16;break}case 13:{this.appRef.dirtyFlags|=2;break}case 11:break;default:this.appRef.dirtyFlags|=8}if(this.appRef.tracingSnapshot=this.tracing?.snapshot(this.appRef.tracingSnapshot)??null,!this.shouldScheduleTick())return;let r=this.useMicrotaskScheduler?qu:qa;this.pendingRenderTaskId=this.taskService.add(),this.scheduleInRootZone?this.cancelScheduledCallback=Zone.root.run(()=>r(()=>this.tick())):this.cancelScheduledCallback=this.ngZone.runOutsideAngular(()=>r(()=>this.tick()))}shouldScheduleTick(){return!(this.appRef.destroyed||this.pendingRenderTaskId!==null||this.runningTick||this.appRef._runningTick||!this.zonelessEnabled&&this.zoneIsDefined&&Zone.current.get(Ir+this.angularZoneId))}tick(){if(this.runningTick||this.appRef.destroyed)return;if(this.appRef.dirtyFlags===0){this.cleanup();return}!this.zonelessEnabled&&this.appRef.dirtyFlags&7&&(this.appRef.dirtyFlags|=1);let n=this.taskService.add();try{this.ngZone.run(()=>{this.runningTick=!0,this.appRef._tick()},void 0,this.schedulerTickApplyArgs)}catch(r){this.applicationErrorHandler(r)}finally{this.taskService.remove(n),this.cleanup()}}ngOnDestroy(){this.subscriptions.unsubscribe(),this.cleanup()}cleanup(){if(this.runningTick=!1,this.cancelScheduledCallback?.(),this.cancelScheduledCallback=null,this.pendingRenderTaskId!==null){let n=this.pendingRenderTaskId;this.pendingRenderTaskId=null,this.taskService.remove(n)}}static \u0275fac=function(r){return new(r||t)};static \u0275prov=ee({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function al(){return bn("NgZoneless"),Mr([...cl(),[]])}function cl(){return[{provide:rn,useExisting:fp},{provide:He,useClass:Dr},{provide:Rr,useValue:!0}]}function Yy(){return typeof $localize<"u"&&$localize.locale||qr}var ll=new O("",{factory:()=>A(ll,{optional:!0,skipSelf:!0})||Yy()});var Hi=class{destroyed=!1;listeners=null;errorHandler=A(Ke,{optional:!0});destroyRef=A(Ut);constructor(){this.destroyRef.onDestroy(()=>{this.destroyed=!0,this.listeners=null})}subscribe(e){if(this.destroyed)throw new N(953,!1);return(this.listeners??=[]).push(e),{unsubscribe:()=>{let n=this.listeners?.indexOf(e);n!==void 0&&n!==-1&&this.listeners?.splice(n,1)}}}emit(e){if(this.destroyed){console.warn(Tr(953,!1));return}if(this.listeners===null)return;let n=T(null);try{for(let r of this.listeners)try{r(e)}catch(o){this.errorHandler?.handleError(o)}}finally{T(n)}}};function oe(t,e){return mr(t,e?.equal)}var mp=Symbol("InputSignalNode#UNSET"),eb=J(Y({},mo),{transformFn:void 0,applyValueToInputSignal(t,e){gr(t,e)}});function gp(t,e){let n=Object.create(eb);n.value=t,n.transformFn=e?.transform;function r(){if(fr(n),n.value===mp){let o=null;throw new N(-950,o)}return n.value}return r[pe]=n,r}function rr(t){return new Hi}function pp(t,e){return gp(t,e)}function tb(t){return gp(mp,t)}var G=(pp.required=tb,pp);function hp(t,e){return Zf(e)}function nb(t,e){return Qf(e)}var $i=(hp.required=nb,hp);var ul=new O(""),rb=new O("");function Yr(t){return!t.moduleRef}function ob(t){let e=Yr(t)?t.r3Injector:t.moduleRef.injector,n=e.get(He);return n.run(()=>{Yr(t)?t.r3Injector.resolveInjectorInitializers():t.moduleRef.resolveInjectorInitializers();let r=e.get(hn),o;if(n.runOutsideAngular(()=>{o=n.onError.subscribe({next:r})}),Yr(t)){let i=()=>e.destroy(),s=t.platformInjector.get(ul);s.add(i),e.onDestroy(()=>{o.unsubscribe(),s.delete(i)})}else{let i=()=>t.moduleRef.destroy(),s=t.platformInjector.get(ul);s.add(i),t.moduleRef.onDestroy(()=>{Or(t.allPlatformModules,t.moduleRef),o.unsubscribe(),s.delete(i)})}return sb(r,n,()=>{let i=e.get(zn),s=i.add(),a=e.get(tl);return a.runInitializers(),a.donePromise.then(()=>{let c=e.get(ll,qr);if(op(c||qr),!e.get(rb,!0))return Yr(t)?e.get(Oi):(t.allPlatformModules.push(t.moduleRef),t.moduleRef);if(Yr(t)){let u=e.get(Oi);return t.rootComponent!==void 0&&u.bootstrap(t.rootComponent),u}else return ib?.(t.moduleRef,t.allPlatformModules),t.moduleRef}).finally(()=>{i.remove(s)})})})}var ib;function sb(t,e,n){try{let r=n();return el(r)?r.catch(o=>{throw e.runOutsideAngular(()=>t(o)),o}):r}catch(r){throw e.runOutsideAngular(()=>t(r)),r}}var Bi=null;function ab(t=[],e){return bt.create({name:e,providers:[{provide:Sr,useValue:"platform"},{provide:ul,useValue:new Set([()=>Bi=null])},...t]})}function cb(t=[]){if(Bi)return Bi;let e=ab(t);return Bi=e,tp(),lb(e),e}function lb(t){let e=t.get(Ti,null);Vo(t,()=>{e?.forEach(n=>n())})}var ub=1e4;var CN=ub-1e3;function vp(t){let{rootComponent:e,appProviders:n,platformProviders:r,platformRef:o}=t;B(L.BootstrapApplicationStart);try{let i=o?.injector??cb(r),s=[cl(),Yu,...n||[]],a=new $r({providers:s,parent:i,debugName:"",runEnvironmentInitializers:!1});return ob({r3Injector:a.injector,platformInjector:i,rootComponent:e})}catch(i){return Promise.reject(i)}finally{B(L.BootstrapApplicationEnd)}}var yp=null;function Qr(){return yp}function dl(t){yp??=t}var Zr=class{};function fl(t,e){e=encodeURIComponent(e);for(let n of t.split(";")){let r=n.indexOf("="),[o,i]=r==-1?[n,""]:[n.slice(0,r),n.slice(r+1)];if(o.trim()===e)return decodeURIComponent(i)}return null}var Xr=class{};var bp="browser";var Kr=class{_doc;constructor(e){this._doc=e}manager},Ui=(()=>{class t extends Kr{constructor(n){super(n)}supports(n){return!0}addEventListener(n,r,o,i){return n.addEventListener(r,o,i),()=>this.removeEventListener(n,r,o,i)}removeEventListener(n,r,o,i){return n.removeEventListener(r,o,i)}static \u0275fac=function(r){return new(r||t)(H(qe))};static \u0275prov=ee({token:t,factory:t.\u0275fac})}return t})(),qi=new O(""),gl=(()=>{class t{_zone;_plugins;_eventNameToPlugin=new Map;constructor(n,r){this._zone=r,n.forEach(s=>{s.manager=this});let o=n.filter(s=>!(s instanceof Ui));this._plugins=o.slice().reverse();let i=n.find(s=>s instanceof Ui);i&&this._plugins.push(i)}addEventListener(n,r,o,i){return this._findPluginFor(r).addEventListener(n,r,o,i)}getZone(){return this._zone}_findPluginFor(n){let r=this._eventNameToPlugin.get(n);if(r)return r;if(r=this._plugins.find(i=>i.supports(n)),!r)throw new N(5101,!1);return this._eventNameToPlugin.set(n,r),r}static \u0275fac=function(r){return new(r||t)(H(qi),H(He))};static \u0275prov=ee({token:t,factory:t.\u0275fac})}return t})(),pl="ng-app-id";function Ep(t){for(let e of t)e.remove()}function wp(t,e){let n=e.createElement("style");return n.textContent=t,n}function db(t,e,n,r){let o=t.head?.querySelectorAll(`style[${pl}="${e}"],link[${pl}="${e}"]`);if(o)for(let i of o)i.removeAttribute(pl),i instanceof HTMLLinkElement?r.set(i.href.slice(i.href.lastIndexOf("/")+1),{usage:0,elements:[i]}):i.textContent&&n.set(i.textContent,{usage:0,elements:[i]})}function ml(t,e){let n=e.createElement("link");return n.setAttribute("rel","stylesheet"),n.setAttribute("href",t),n}var vl=(()=>{class t{doc;appId;nonce;inline=new Map;external=new Map;hosts=new Set;constructor(n,r,o,i={}){this.doc=n,this.appId=r,this.nonce=o,db(n,r,this.inline,this.external),this.hosts.add(n.head)}addStyles(n,r){for(let o of n)this.addUsage(o,this.inline,wp);r?.forEach(o=>this.addUsage(o,this.external,ml))}removeStyles(n,r){for(let o of n)this.removeUsage(o,this.inline);r?.forEach(o=>this.removeUsage(o,this.external))}addUsage(n,r,o){let i=r.get(n);i?i.usage++:r.set(n,{usage:1,elements:[...this.hosts].map(s=>this.addElement(s,o(n,this.doc)))})}removeUsage(n,r){let o=r.get(n);o&&(o.usage--,o.usage<=0&&(Ep(o.elements),r.delete(n)))}ngOnDestroy(){for(let[,{elements:n}]of[...this.inline,...this.external])Ep(n);this.hosts.clear()}addHost(n){this.hosts.add(n);for(let[r,{elements:o}]of this.inline)o.push(this.addElement(n,wp(r,this.doc)));for(let[r,{elements:o}]of this.external)o.push(this.addElement(n,ml(r,this.doc)))}removeHost(n){this.hosts.delete(n)}addElement(n,r){return this.nonce&&r.setAttribute("nonce",this.nonce),n.appendChild(r)}static \u0275fac=function(r){return new(r||t)(H(qe),H(Di),H(Ci,8),H(Gr))};static \u0275prov=ee({token:t,factory:t.\u0275fac})}return t})(),hl={svg:"http://www.w3.org/2000/svg",xhtml:"http://www.w3.org/1999/xhtml",xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/",math:"http://www.w3.org/1998/Math/MathML"},yl=/%COMP%/g;var Dp="%COMP%",fb=`_nghost-${Dp}`,pb=`_ngcontent-${Dp}`,hb=!0,mb=new O("",{factory:()=>hb});function gb(t){return pb.replace(yl,t)}function vb(t){return fb.replace(yl,t)}function Tp(t,e){return e.map(n=>n.replace(yl,t))}var bl=(()=>{class t{eventManager;sharedStylesHost;appId;removeStylesOnCompDestroy;doc;ngZone;nonce;tracingService;rendererByCompId=new Map;defaultRenderer;constructor(n,r,o,i,s,a,c=null,l=null){this.eventManager=n,this.sharedStylesHost=r,this.appId=o,this.removeStylesOnCompDestroy=i,this.doc=s,this.ngZone=a,this.nonce=c,this.tracingService=l,this.defaultRenderer=new Jr(n,s,a,this.tracingService)}createRenderer(n,r){if(!n||!r)return this.defaultRenderer;let o=this.getOrCreateRenderer(n,r);return o instanceof Gi?o.applyToHost(n):o instanceof eo&&o.applyStyles(),o}getOrCreateRenderer(n,r){let o=this.rendererByCompId,i=o.get(r.id);if(!i){let s=this.doc,a=this.ngZone,c=this.eventManager,l=this.sharedStylesHost,u=this.removeStylesOnCompDestroy,d=this.tracingService;switch(r.encapsulation){case it.Emulated:i=new Gi(c,l,r,this.appId,u,s,a,d);break;case it.ShadowDom:return new zi(c,n,r,s,a,this.nonce,d,l);case it.ExperimentalIsolatedShadowDom:return new zi(c,n,r,s,a,this.nonce,d);default:i=new eo(c,l,r,u,s,a,d);break}o.set(r.id,i)}return i}ngOnDestroy(){this.rendererByCompId.clear()}componentReplaced(n){this.rendererByCompId.delete(n)}static \u0275fac=function(r){return new(r||t)(H(gl),H(vl),H(Di),H(mb),H(qe),H(He),H(Ci),H(Xn,8))};static \u0275prov=ee({token:t,factory:t.\u0275fac})}return t})(),Jr=class{eventManager;doc;ngZone;tracingService;data=Object.create(null);throwOnSyntheticProps=!0;constructor(e,n,r,o){this.eventManager=e,this.doc=n,this.ngZone=r,this.tracingService=o}destroy(){}destroyNode=null;createElement(e,n){return n?this.doc.createElementNS(hl[n]||n,e):this.doc.createElement(e)}createComment(e){return this.doc.createComment(e)}createText(e){return this.doc.createTextNode(e)}appendChild(e,n){(Ip(e)?e.content:e).appendChild(n)}insertBefore(e,n,r){e&&(Ip(e)?e.content:e).insertBefore(n,r)}removeChild(e,n){n.remove()}selectRootElement(e,n){let r=typeof e=="string"?this.doc.querySelector(e):e;if(!r)throw new N(-5104,!1);return n||(r.textContent=""),r}parentNode(e){return e.parentNode}nextSibling(e){return e.nextSibling}setAttribute(e,n,r,o){if(o){n=o+":"+n;let i=hl[o];i?e.setAttributeNS(i,n,r):e.setAttribute(n,r)}else e.setAttribute(n,r)}removeAttribute(e,n,r){if(r){let o=hl[r];o?e.removeAttributeNS(o,n):e.removeAttribute(`${r}:${n}`)}else e.removeAttribute(n)}addClass(e,n){e.classList.add(n)}removeClass(e,n){e.classList.remove(n)}setStyle(e,n,r,o){o&(It.DashCase|It.Important)?e.style.setProperty(n,r,o&It.Important?"important":""):e.style[n]=r}removeStyle(e,n,r){r&It.DashCase?e.style.removeProperty(n):e.style[n]=""}setProperty(e,n,r){e!=null&&(e[n]=r)}setValue(e,n){e.nodeValue=n}listen(e,n,r,o){if(typeof e=="string"&&(e=Qr().getGlobalEventTarget(this.doc,e),!e))throw new N(5102,!1);let i=this.decoratePreventDefault(r);return this.tracingService?.wrapEventListener&&(i=this.tracingService.wrapEventListener(e,n,i)),this.eventManager.addEventListener(e,n,i,o)}decoratePreventDefault(e){return n=>{if(n==="__ngUnwrap__")return e;e(n)===!1&&n.preventDefault()}}};function Ip(t){return t.tagName==="TEMPLATE"&&t.content!==void 0}var zi=class extends Jr{hostEl;sharedStylesHost;shadowRoot;constructor(e,n,r,o,i,s,a,c){super(e,o,i,a),this.hostEl=n,this.sharedStylesHost=c,this.shadowRoot=n.attachShadow({mode:"open"}),this.sharedStylesHost&&this.sharedStylesHost.addHost(this.shadowRoot);let l=r.styles;l=Tp(r.id,l);for(let d of l){let f=document.createElement("style");s&&f.setAttribute("nonce",s),f.textContent=d,this.shadowRoot.appendChild(f)}let u=r.getExternalStyles?.();if(u)for(let d of u){let f=ml(d,o);s&&f.setAttribute("nonce",s),this.shadowRoot.appendChild(f)}}nodeOrShadowRoot(e){return e===this.hostEl?this.shadowRoot:e}appendChild(e,n){return super.appendChild(this.nodeOrShadowRoot(e),n)}insertBefore(e,n,r){return super.insertBefore(this.nodeOrShadowRoot(e),n,r)}removeChild(e,n){return super.removeChild(null,n)}parentNode(e){return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(e)))}destroy(){this.sharedStylesHost&&this.sharedStylesHost.removeHost(this.shadowRoot)}},eo=class extends Jr{sharedStylesHost;removeStylesOnCompDestroy;styles;styleUrls;constructor(e,n,r,o,i,s,a,c){super(e,i,s,a),this.sharedStylesHost=n,this.removeStylesOnCompDestroy=o;let l=r.styles;this.styles=c?Tp(c,l):l,this.styleUrls=r.getExternalStyles?.(c)}applyStyles(){this.sharedStylesHost.addStyles(this.styles,this.styleUrls)}destroy(){this.removeStylesOnCompDestroy&&gn.size===0&&this.sharedStylesHost.removeStyles(this.styles,this.styleUrls)}},Gi=class extends eo{contentAttr;hostAttr;constructor(e,n,r,o,i,s,a,c){let l=o+"-"+r.id;super(e,n,r,i,s,a,c,l),this.contentAttr=gb(l),this.hostAttr=vb(l)}applyToHost(e){this.applyStyles(),this.setAttribute(e,this.hostAttr,"")}createElement(e,n){let r=super.createElement(e,n);return super.setAttribute(r,this.contentAttr,""),r}};var Wi=class t extends Zr{supportsDOMEvents=!0;static makeCurrent(){dl(new t)}onAndCancel(e,n,r,o){return e.addEventListener(n,r,o),()=>{e.removeEventListener(n,r,o)}}dispatchEvent(e,n){e.dispatchEvent(n)}remove(e){e.remove()}createElement(e,n){return n=n||this.getDefaultDocument(),n.createElement(e)}createHtmlDocument(){return document.implementation.createHTMLDocument("fakeTitle")}getDefaultDocument(){return document}isElementNode(e){return e.nodeType===Node.ELEMENT_NODE}isShadowRoot(e){return e instanceof DocumentFragment}getGlobalEventTarget(e,n){return n==="window"?window:n==="document"?e:n==="body"?e.body:null}getBaseHref(e){let n=yb();return n==null?null:bb(n)}resetBaseElement(){to=null}getUserAgent(){return window.navigator.userAgent}getCookie(e){return fl(document.cookie,e)}},to=null;function yb(){return to=to||document.head.querySelector("base"),to?to.getAttribute("href"):null}function bb(t){return new URL(t,document.baseURI).pathname}var Eb=(()=>{class t{build(){return new XMLHttpRequest}static \u0275fac=function(r){return new(r||t)};static \u0275prov=ee({token:t,factory:t.\u0275fac})}return t})(),Cp=["alt","control","meta","shift"],wb={"\b":"Backspace","	":"Tab","\x7F":"Delete","\x1B":"Escape",Del:"Delete",Esc:"Escape",Left:"ArrowLeft",Right:"ArrowRight",Up:"ArrowUp",Down:"ArrowDown",Menu:"ContextMenu",Scroll:"ScrollLock",Win:"OS"},Ib={alt:t=>t.altKey,control:t=>t.ctrlKey,meta:t=>t.metaKey,shift:t=>t.shiftKey},Mp=(()=>{class t extends Kr{constructor(n){super(n)}supports(n){return t.parseEventName(n)!=null}addEventListener(n,r,o,i){let s=t.parseEventName(r),a=t.eventCallback(s.fullKey,o,this.manager.getZone());return this.manager.getZone().runOutsideAngular(()=>Qr().onAndCancel(n,s.domEventName,a,i))}static parseEventName(n){let r=n.toLowerCase().split("."),o=r.shift();if(r.length===0||!(o==="keydown"||o==="keyup"))return null;let i=t._normalizeKey(r.pop()),s="",a=r.indexOf("code");if(a>-1&&(r.splice(a,1),s="code."),Cp.forEach(l=>{let u=r.indexOf(l);u>-1&&(r.splice(u,1),s+=l+".")}),s+=i,r.length!=0||i.length===0)return null;let c={};return c.domEventName=o,c.fullKey=s,c}static matchEventFullKeyCode(n,r){let o=wb[n.key]||n.key,i="";return r.indexOf("code.")>-1&&(o=n.code,i="code."),o==null||!o?!1:(o=o.toLowerCase(),o===" "?o="space":o==="."&&(o="dot"),Cp.forEach(s=>{if(s!==o){let a=Ib[s];a(n)&&(i+=s+".")}}),i+=o,i===r)}static eventCallback(n,r,o){return i=>{t.matchEventFullKeyCode(i,n)&&o.runGuarded(()=>r(i))}}static _normalizeKey(n){return n==="esc"?"escape":n}static \u0275fac=function(r){return new(r||t)(H(qe))};static \u0275prov=ee({token:t,factory:t.\u0275fac})}return t})();async function El(t,e,n){let r=Y({rootComponent:t},Db(e,n));return vp(r)}function Db(t,e){return{platformRef:e?.platformRef,appProviders:[...xb,...t?.providers??[]],platformProviders:Sb}}function Tb(){Wi.makeCurrent()}function Cb(){return new Ke}function Mb(){return Lc(document),document}var Sb=[{provide:Gr,useValue:bp},{provide:Ti,useValue:Tb,multi:!0},{provide:qe,useFactory:Mb}];var xb=[{provide:Sr,useValue:"root"},{provide:Ke,useFactory:Cb},{provide:qi,useClass:Ui,multi:!0},{provide:qi,useClass:Mp,multi:!0},bl,vl,gl,{provide:vn,useExisting:bl},{provide:Xr,useClass:Eb},[]];var wl={TTT:"F",TTC:"F",TTA:"L",TTG:"L",CTT:"L",CTC:"L",CTA:"L",CTG:"L",ATT:"I",ATC:"I",ATA:"I",ATG:"M",GTT:"V",GTC:"V",GTA:"V",GTG:"V",TCT:"S",TCC:"S",TCA:"S",TCG:"S",CCT:"P",CCC:"P",CCA:"P",CCG:"P",ACT:"T",ACC:"T",ACA:"T",ACG:"T",GCT:"A",GCC:"A",GCA:"A",GCG:"A",TAT:"Y",TAC:"Y",TAA:"*",TAG:"*",CAT:"H",CAC:"H",CAA:"Q",CAG:"Q",AAT:"N",AAC:"N",AAA:"K",AAG:"K",GAT:"D",GAC:"D",GAA:"E",GAG:"E",TGT:"C",TGC:"C",TGA:"*",TGG:"W",CGT:"R",CGC:"R",CGA:"R",CGG:"R",AGT:"S",AGC:"S",AGA:"R",AGG:"R",GGT:"G",GGC:"G",GGA:"G",GGG:"G"},_b={F:"TTC",L:"CTG",I:"ATC",M:"ATG",V:"GTG",S:"AGC",P:"CCC",T:"ACC",A:"GCC",Y:"TAC",H:"CAC",Q:"CAG",N:"AAC",K:"AAG",D:"GAC",E:"GAG",C:"TGC",W:"TGG",R:"CGG",G:"GGC","*":"TGA"},no={A:{code:"A",abbr:"Ala",name:"Alanine",cls:"hydrophobic",hydropathy:1.8},R:{code:"R",abbr:"Arg",name:"Arginine",cls:"positive",hydropathy:-4.5},N:{code:"N",abbr:"Asn",name:"Asparagine",cls:"polar",hydropathy:-3.5},D:{code:"D",abbr:"Asp",name:"Aspartate",cls:"negative",hydropathy:-3.5},C:{code:"C",abbr:"Cys",name:"Cysteine",cls:"polar",hydropathy:2.5},Q:{code:"Q",abbr:"Gln",name:"Glutamine",cls:"polar",hydropathy:-3.5},E:{code:"E",abbr:"Glu",name:"Glutamate",cls:"negative",hydropathy:-3.5},G:{code:"G",abbr:"Gly",name:"Glycine",cls:"special",hydropathy:-.4},H:{code:"H",abbr:"His",name:"Histidine",cls:"positive",hydropathy:-3.2},I:{code:"I",abbr:"Ile",name:"Isoleucine",cls:"hydrophobic",hydropathy:4.5},L:{code:"L",abbr:"Leu",name:"Leucine",cls:"hydrophobic",hydropathy:3.8},K:{code:"K",abbr:"Lys",name:"Lysine",cls:"positive",hydropathy:-3.9},M:{code:"M",abbr:"Met",name:"Methionine",cls:"hydrophobic",hydropathy:1.9},F:{code:"F",abbr:"Phe",name:"Phenylalanine",cls:"hydrophobic",hydropathy:2.8},P:{code:"P",abbr:"Pro",name:"Proline",cls:"special",hydropathy:-1.6},S:{code:"S",abbr:"Ser",name:"Serine",cls:"polar",hydropathy:-.8},T:{code:"T",abbr:"Thr",name:"Threonine",cls:"polar",hydropathy:-.7},W:{code:"W",abbr:"Trp",name:"Tryptophan",cls:"hydrophobic",hydropathy:-.9},Y:{code:"Y",abbr:"Tyr",name:"Tyrosine",cls:"polar",hydropathy:-1.3},V:{code:"V",abbr:"Val",name:"Valine",cls:"hydrophobic",hydropathy:4.2}},En="MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGP";function Wt(t){switch(t){case"A":return"T";case"T":return"A";case"U":return"A";case"G":return"C";case"C":return"G"}}function Nb(t){let e="";for(let n of t)e+=_b[n]??"NNN";return e}var or=Nb(En),Sp=Array.from({length:En.length},(t,e)=>({codon:or.slice(e*3,e*3+3),residue:En[e]})),Ct={A:[1,.66,.24],T:[1,.34,.47],G:[.28,1,.62],C:[.32,.68,1],U:[.86,.45,1]},xp={hydrophobic:[1,.74,.36],polar:[.52,.92,.98],positive:[.44,.62,1],negative:[1,.42,.52],special:[.74,.78,.86]},wn={C:[.62,.66,.72],N:[.36,.55,1],O:[1,.36,.38],P:[1,.62,.22],H:[.9,.94,1]},Me={rise:3.4,bpPerTurn:10.5,backboneRadius:10,strandOffset:3.93},In=Math.PI*2/Me.bpPerTurn;var Dl=600,ir=Math.floor(Dl/3),Ab=10;function Rb(t){let e=t.split(`
`).filter(i=>!i.trimStart().startsWith(">")).join(""),n="",r=0;for(let i of e.toUpperCase())i==="U"?n+="T":i==="A"||i==="C"||i==="G"||i==="T"?n+=i:/\s/.test(i)||r++;let o=n.length>Dl;return{dna:o?n.slice(0,Dl):n,rejected:r,truncated:o}}function Pb(t){if(t.length===0)return 0;let e=0;for(let n of t)(n==="G"||n==="C")&&e++;return e/t.length}function kb(t){if(t.length===0)return null;let e=0;for(let n of t)(n==="G"||n==="C")&&e++;return t.length<14?(t.length-e)*2+e*4:64.9+41*(e-16.4)/t.length}function Ob(t){let e="";for(let n=t.length-1;n>=0;n--)e+=Wt(t[n]);return e}function Il(t){let e=[];for(let n=0;n+3<=t.length;n+=3){let r=t.slice(n,n+3),o=wl[r];if(!o||o==="*")break;e.push({codon:r,residue:o})}return e}function Lb(t,e=Ab){let n=[];for(let r=0;r<3;r++){let o=r;for(;o+3<=t.length;){if(t.slice(o,o+3)!=="ATG"){o+=3;continue}let i="",s=o,a=!1;for(;s+3<=t.length;){let c=wl[t.slice(s,s+3)];if(s+=3,!c)break;if(c==="*"){a=!0;break}i+=c}i.length>=e&&n.push({start:o,end:s,frame:r,peptide:i,terminated:a}),o=s}}return n.sort((r,o)=>o.peptide.length-r.peptide.length)}function Tl(t){let{dna:e,rejected:n,truncated:r}=Rb(t),o=Lb(e),i=o[0],s=i?{dna:e.slice(i.start,i.end),peptide:i.peptide,codons:Il(e.slice(i.start,i.end)),start:i.start,frame:i.frame,fromOrf:!0}:{dna:e,peptide:Il(e).map(a=>a.residue).join(""),codons:Il(e),start:0,frame:0,fromOrf:!1};return{dna:e,length:e.length,gcFraction:Pb(e),meltingTemp:kb(e),reverseComplement:Ob(e),orfs:o,coding:s,rejected:n,truncated:r}}var Yi=class{_raw;_analysis;_version=0;constructor(e=or){this._raw=e,this._analysis=Tl(e)}get raw(){return this._raw}get analysis(){return this._analysis}get version(){return this._version}get isDefault(){return this._analysis.dna===or}get renderDna(){return this._analysis.dna.length>0?this._analysis.dna:or}get isFallback(){return this._analysis.dna.length===0}set(e){this._raw=e;let n=Tl(e),r=n.dna!==this._analysis.dna;this._analysis=n,r&&this._version++}reset(){this.set(or)}randomise(e=180){let n="ACGT",r="ATG";for(;r.length<e;)r+=n[Math.floor(Math.random()*4)];this.set(r)}};function K(){let t=new Float32Array(16);return t[0]=t[5]=t[10]=t[15]=1,t}function _p(t,e,n,r,o){let i=1/Math.tan(e/2);return t.fill(0),t[0]=i/n,t[5]=i,t[10]=(o+r)/(r-o),t[11]=-1,t[14]=2*o*r/(r-o),t}function Np(t,e,n,r){let o=e[0]-n[0],i=e[1]-n[1],s=e[2]-n[2],a=Math.hypot(o,i,s);a<1e-8?(o=0,i=0,s=1):(o/=a,i/=a,s/=a);let c=r[1]*s-r[2]*i,l=r[2]*o-r[0]*s,u=r[0]*i-r[1]*o;a=Math.hypot(c,l,u),a<1e-8?(c=1,l=0,u=0):(c/=a,l/=a,u/=a);let d=i*u-s*l,f=s*c-o*u,p=o*l-i*c;return t[0]=c,t[1]=d,t[2]=o,t[3]=0,t[4]=l,t[5]=f,t[6]=i,t[7]=0,t[8]=u,t[9]=p,t[10]=s,t[11]=0,t[12]=-(c*e[0]+l*e[1]+u*e[2]),t[13]=-(d*e[0]+f*e[1]+p*e[2]),t[14]=-(o*e[0]+i*e[1]+s*e[2]),t[15]=1,t}function Ap(t,e,n){let r=e[0],o=e[1],i=e[2],s=e[3],a=e[4],c=e[5],l=e[6],u=e[7],d=e[8],f=e[9],p=e[10],h=e[11],m=e[12],y=e[13],I=e[14],M=e[15];for(let D=0;D<4;D++){let S=n[D*4],F=n[D*4+1],U=n[D*4+2],ie=n[D*4+3];t[D*4]=S*r+F*a+U*d+ie*m,t[D*4+1]=S*o+F*c+U*f+ie*y,t[D*4+2]=S*i+F*l+U*p+ie*I,t[D*4+3]=S*s+F*u+U*h+ie*M}return t}function ve(t,e,n,r,o,i){let s=Math.cos(o)*i,a=Math.sin(o)*i;return t[0]=s,t[1]=0,t[2]=-a,t[3]=0,t[4]=0,t[5]=i,t[6]=0,t[7]=0,t[8]=a,t[9]=0,t[10]=s,t[11]=0,t[12]=e,t[13]=n,t[14]=r,t[15]=1,t}var yA=K();var Ye=(t,e,n)=>t<e?e:t>n?n:t,Dn=t=>Ye(t,0,1),Mt=(t,e,n)=>t+(e-t)*n;function Se(t,e,n){let r=Dn((n-t)/(e-t||1e-8));return r*r*(3-2*r)}function St(t,e,n,r){return Mt(e,t,Math.exp(-n*r))}function le(t){let e=t>>>0;return()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var Zi=class{position=[0,0,6];target=[0,0,0];up=[0,1,0];fov=46*Math.PI/180;near=.05;far=260;view=K();projection=K();viewProjection=K();parallaxX=0;parallaxY=0;update(e,n,r,o,i){this.parallaxX=St(this.parallaxX,n*.16,3.5,i),this.parallaxY=St(this.parallaxY,r*.1,3.5,i);let s=Math.sin(o*.11)*.022,a=Math.sin(o*.083)*.017,c=this.parallaxX+s,l=this.parallaxY+a,u=6;this.position[0]=Math.sin(c)*Math.cos(l)*u,this.position[1]=Math.sin(l)*u,this.position[2]=Math.cos(c)*Math.cos(l)*u,_p(this.projection,this.fov,e,this.near,this.far),Np(this.view,this.position,this.target,this.up),Ap(this.viewProjection,this.projection,this.view)}};var q=`#version 300 es
precision highp float;
precision highp int;
`,k=`#version 300 es
precision highp float;
precision highp int;
`,ro=`
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
`,Ze=`
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
`,at=`
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
`,Tn=`
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
`,te=`
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
`,Rp=`
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
`,xt=`${q}
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;var P=class{constructor(e,n,r,o){this.gl=e;this.label=o;let i=Pp(e,e.VERTEX_SHADER,n,`${o}:vertex`),s=Pp(e,e.FRAGMENT_SHADER,r,`${o}:fragment`),a=e.createProgram();if(!a)throw new Error(`[${o}] createProgram failed`);if(e.attachShader(a,i),e.attachShader(a,s),e.linkProgram(a),e.deleteShader(i),e.deleteShader(s),!e.getProgramParameter(a,e.LINK_STATUS)){let c=e.getProgramInfoLog(a);throw e.deleteProgram(a),new Error(`[${o}] link failed:
${c}`)}this.program=a}gl;label;program;locations=new Map;use(){return this.gl.useProgram(this.program),this}loc(e){let n=this.locations.get(e);return n===void 0&&(n=this.gl.getUniformLocation(this.program,e),this.locations.set(e,n)),n}f(e,n){return this.gl.uniform1f(this.loc(e),n),this}i(e,n){return this.gl.uniform1i(this.loc(e),n),this}v2(e,n,r){return this.gl.uniform2f(this.loc(e),n,r),this}v3(e,n,r,o){return this.gl.uniform3f(this.loc(e),n,r,o),this}v3a(e,n){return this.gl.uniform3f(this.loc(e),n[0],n[1],n[2]),this}v4(e,n,r,o,i){return this.gl.uniform4f(this.loc(e),n,r,o,i),this}m4(e,n){return this.gl.uniformMatrix4fv(this.loc(e),!1,n),this}m3(e,n){return this.gl.uniformMatrix3fv(this.loc(e),!1,n),this}tex(e,n,r){let o=this.gl;return o.activeTexture(o.TEXTURE0+n),o.bindTexture(o.TEXTURE_2D,r),o.uniform1i(this.loc(e),n),this}dispose(){this.gl.deleteProgram(this.program),this.locations.clear()}toString(){return`Program(${this.label})`}};function Pp(t,e,n,r){let o=t.createShader(e);if(!o)throw new Error(`[${r}] createShader failed`);if(t.shaderSource(o,n),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)??"";throw t.deleteShader(o),new Error(`[${r}] compile failed:
${i}

${Fb(i,n)}`)}return o}function Fb(t,e){let n=e.split(`
`),r=new Set;for(let a of t.matchAll(/ERROR:\s*\d+:(\d+)/g))r.add(Number(a[1]));let o=new Set;for(let a of r)for(let c=a-4;c<=a+4;c++)c>=1&&c<=n.length&&o.add(c);if(o.size===0)return n.map((a,c)=>`${kp(c+1)}| ${a}`).join(`
`);let i=[],s=0;for(let a of[...o].sort((c,l)=>c-l))a!==s+1&&i.push("    \u22EF"),i.push(`${kp(a)}|${r.has(a)?">":" "} ${n[a-1]}`),s=a;return i.join(`
`)}var kp=t=>String(t).padStart(4," ");function oo(t){let e=!!t.getExtension("EXT_color_buffer_half_float")||!!t.getExtension("EXT_color_buffer_float"),n=!!t.getExtension("OES_texture_float_linear")||e;return{halfFloat:e,halfFloatLinear:n,maxSamples:t.getParameter(t.MAX_SAMPLES)}}var ct=class{constructor(e,n,r={}){this.gl=e;this.options=r;let o=!!r.hdr&&n.halfFloat;this.internalFormat=o?e.RGBA16F:e.RGBA8,this.type=o?e.HALF_FLOAT:e.UNSIGNED_BYTE;let i=r.filter!=="nearest";this.filter=i&&(!o||n.halfFloatLinear)?e.LINEAR:e.NEAREST,this.wrap=r.wrap??e.CLAMP_TO_EDGE;let s=e.createFramebuffer(),a=e.createTexture();if(!s||!a)throw new Error("render target allocation failed");this.framebuffer=s,this.texture=a}gl;options;framebuffer;texture;depth=null;width=0;height=0;internalFormat;type;filter;wrap;resize(e,n){if(e=Math.max(1,e|0),n=Math.max(1,n|0),e===this.width&&n===this.height)return;this.width=e,this.height=n;let r=this.gl;r.bindTexture(r.TEXTURE_2D,this.texture),r.texImage2D(r.TEXTURE_2D,0,this.internalFormat,e,n,0,r.RGBA,this.type,null),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,this.filter),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,this.filter),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,this.wrap),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,this.wrap),r.bindFramebuffer(r.FRAMEBUFFER,this.framebuffer),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,this.texture,0),this.options.depth&&(this.options.depthTexture?(this.depth instanceof WebGLTexture||(this.depth&&r.deleteRenderbuffer(this.depth),this.depth=r.createTexture()),r.bindTexture(r.TEXTURE_2D,this.depth),r.texImage2D(r.TEXTURE_2D,0,r.DEPTH_COMPONENT24,e,n,0,r.DEPTH_COMPONENT,r.UNSIGNED_INT,null),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,this.depth,0)):(this.depth||(this.depth=r.createRenderbuffer()),r.bindRenderbuffer(r.RENDERBUFFER,this.depth),r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_COMPONENT24,e,n),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.RENDERBUFFER,this.depth))),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindTexture(r.TEXTURE_2D,null)}bind(){let e=this.gl;e.bindFramebuffer(e.FRAMEBUFFER,this.framebuffer),e.viewport(0,0,this.width,this.height)}dispose(){let e=this.gl;e.deleteFramebuffer(this.framebuffer),e.deleteTexture(this.texture),this.depth instanceof WebGLTexture?e.deleteTexture(this.depth):this.depth&&e.deleteRenderbuffer(this.depth),this.depth=null}};var Qi=6,Vb=`${k}
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
`,jb=`${k}
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
`,Hb=`${k}
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
`,Bb=`${k}
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
`,$b=`${k}
${ro}
${Rp}

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
uniform float uFocusRange;
uniform float uAperture;
uniform float uMaxBlur;
uniform float uBackdropBlur;
uniform float uNear;
uniform float uFar;
uniform vec2 uResolution;

void main() {
  vec2 uv = vUv;
  vec2 centred = uv - 0.5;
  float r2 = dot(centred, centred);

  // Circle of confusion: a sharp zone either side of the focus plane, then a
  // ramp out to uAperture, capped at uMaxBlur.
  //
  // The dead zone is the important part. Every subject in this app is a few
  // units deep and sits about six units from the lens, so a CoC that starts
  // ramping at the focus plane blurs a subject's own near and far faces while
  // leaving a thin slab through its middle sharp \u2014 which reads as a soft
  // image, not as depth. The sharp zone has to be wider than the subject.
  float rawDepth = texture(uDepth, uv).r;
  float viewZ = linearizeDepth(rawDepth, uNear, uFar);

  float defocus = max(abs(viewZ - uFocusDistance) - uFocusRange, 0.0);
  float coc = smoothstep(0.0, 1.0, clamp(defocus / max(uAperture, 1e-3), 0.0, 1.0)) * uMaxBlur;

  // Unwritten depth means "leave this alone", NOT "this is far away".
  //
  // Plenty of visible content never writes depth here: every additive particle
  // field, the translucent membranes, the ribosome and polymerase, the network
  // labels \u2014 and the whole tissue stage, which draws its cells depth-write-off
  // so they blend. All of it sits at the cleared far value. Feeding that into
  // the ramp put those pixels at maximum blur, which is why the opening scale
  // and every particle in the piece came out soft.
  //
  // The backdrop is smooth noise and needs no help looking soft, so the
  // default here is zero; the uniform stays as a knob.
  coc = rawDepth >= 0.9999 ? uBackdropBlur : coc;

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
`,io=class{constructor(e,n){this.gl=e;this.prefilter=new P(e,xt,Vb,"post:prefilter"),this.downsample=new P(e,xt,jb,"post:downsample"),this.upsample=new P(e,xt,Hb,"post:upsample"),this.blur=new P(e,xt,Bb,"post:blur"),this.composite=new P(e,xt,$b,"post:composite");for(let r=0;r<Qi;r++)this.mips.push(new ct(e,n,{hdr:!0,filter:"linear"}));this.blurA=new ct(e,n,{hdr:!0,filter:"linear"}),this.blurB=new ct(e,n,{hdr:!0,filter:"linear"})}gl;prefilter;downsample;upsample;blur;composite;mips=[];blurA;blurB;width=1;height=1;resize(e,n){this.width=e,this.height=n;for(let r=0;r<Qi;r++){let o=2<<r;this.mips[r].resize(Math.max(1,Math.floor(e/o)),Math.max(1,Math.floor(n/o)))}this.blurA.resize(Math.max(1,e>>1),Math.max(1,n>>1)),this.blurB.resize(Math.max(1,e>>1),Math.max(1,n>>1))}render(e,n){let r=this.gl;r.disable(r.DEPTH_TEST),r.disable(r.BLEND),r.depthMask(!1),this.mips[0].bind(),this.prefilter.use().f("uThreshold",n.bloomThreshold).f("uKnee",.55).tex("uScene",0,e.texture),_t(r);for(let i=1;i<Qi;i++){let s=this.mips[i-1];this.mips[i].bind(),this.downsample.use().v2("uTexel",1/s.width,1/s.height).tex("uSource",0,s.texture),_t(r)}r.enable(r.BLEND),r.blendFunc(r.ONE,r.ONE);for(let i=Qi-1;i>0;i--){let s=this.mips[i];this.mips[i-1].bind(),this.upsample.use().v2("uTexel",1/s.width,1/s.height).f("uRadius",1).tex("uSource",0,s.texture),_t(r)}r.disable(r.BLEND),this.blurA.bind(),this.blur.use().v2("uDirection",1/this.blurA.width,0).tex("uSource",0,e.texture),_t(r),this.blurB.bind(),this.blur.use().v2("uDirection",0,1/this.blurB.height).tex("uSource",0,this.blurA.texture),_t(r),r.bindFramebuffer(r.FRAMEBUFFER,null),r.viewport(0,0,this.width,this.height),this.composite.use().f("uTime",n.time).f("uBloomIntensity",n.bloomIntensity).f("uExposure",n.exposure).f("uAberration",n.aberration).f("uVignette",n.vignette).f("uGrain",n.grain).f("uFocusDistance",n.focusDistance).f("uFocusRange",n.focusRange).f("uAperture",n.aperture).f("uMaxBlur",n.maxBlur).f("uBackdropBlur",n.backdropBlur).f("uNear",n.near).f("uFar",n.far).v2("uResolution",this.width,this.height).tex("uScene",0,e.texture).tex("uBloom",1,this.mips[0].texture).tex("uBlurred",2,this.blurB.texture).tex("uDepth",3,e.depth instanceof WebGLTexture?e.depth:null),_t(r),r.depthMask(!0),r.enable(r.DEPTH_TEST)}dispose(){this.prefilter.dispose(),this.downsample.dispose(),this.upsample.dispose(),this.blur.dispose(),this.composite.dispose();for(let e of this.mips)e.dispose();this.blurA.dispose(),this.blurB.dispose()}};function _t(t){t.drawArrays(t.TRIANGLES,0,3)}var Xi=class{constructor(e,n,r={}){this.canvas=e;this.stages=n;this.callbacks=r;let o=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!0,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1,desynchronized:!0});if(!o)throw new Error("WebGL2 is not available in this browser.");this.gl=o,this.caps=oo(o),this.sceneTarget=new ct(o,this.caps,{hdr:!0,depth:!0,depthTexture:!0,filter:"linear"}),this.post=new io(o,this.caps),e.addEventListener("webglcontextlost",this.handleContextLost),e.addEventListener("webglcontextrestored",this.handleContextRestored)}canvas;stages;callbacks;gl;caps;camera=new Zi;post;sceneTarget;initialised=new Set;rafHandle=0;running=!1;lastFrameTime=0;elapsed=0;targetProgress=0;smoothProgress=0;pointerX=0;pointerY=0;smoothPointerX=0;smoothPointerY=0;dpr=0;maxDpr=2;width=1;height=1;quality=1;frameMs=16.7;statsTimer=0;currentStage=-1;focusDistance=6;aperture=9;contextLost=!1;get stageCount(){return this.stages.length}get progress(){return this.smoothProgress}setProgress(e){this.targetProgress=Ye(e,0,1)}snapProgress(e){this.targetProgress=Ye(e,0,1),this.smoothProgress=this.targetProgress}setPointer(e,n){this.pointerX=Ye(e,-1,1),this.pointerY=Ye(n,-1,1)}resize(e,n,r){this.maxDpr=Ye(r,1,2),this.dpr=this.dpr===0?this.maxDpr:Math.min(this.dpr,this.maxDpr),this.applySize(e,n)}cssWidth=1;cssHeight=1;applySize(e,n){this.cssWidth=Math.max(1,e),this.cssHeight=Math.max(1,n);let r=Math.max(1,Math.round(this.cssWidth*this.dpr)),o=Math.max(1,Math.round(this.cssHeight*this.dpr));r===this.width&&o===this.height||(this.width=r,this.height=o,this.canvas.width=r,this.canvas.height=o,this.sceneTarget.resize(r,o),this.post.resize(r,o))}start(){this.running||(this.running=!0,this.lastFrameTime=performance.now(),this.rafHandle=requestAnimationFrame(this.frame))}stop(){this.running=!1,this.rafHandle&&cancelAnimationFrame(this.rafHandle),this.rafHandle=0}dispose(){this.stop(),this.canvas.removeEventListener("webglcontextlost",this.handleContextLost),this.canvas.removeEventListener("webglcontextrestored",this.handleContextRestored);for(let e of this.initialised)e.dispose();this.initialised.clear(),this.post.dispose(),this.sceneTarget.dispose()}handleContextLost=e=>{e.preventDefault(),this.contextLost=!0,this.stop(),this.initialised.clear(),this.callbacks.onContextLost?.()};handleContextRestored=()=>{this.contextLost=!1,this.post.dispose(),this.sceneTarget.dispose(),this.caps=oo(this.gl),this.sceneTarget=new ct(this.gl,this.caps,{hdr:!0,depth:!0,depthTexture:!0,filter:"linear"}),this.post=new io(this.gl,this.caps),this.width=0,this.height=0,this.applySize(this.cssWidth,this.cssHeight),this.callbacks.onContextRestored?.(),this.start()};frame=e=>{if(!this.running||this.contextLost)return;this.rafHandle=requestAnimationFrame(this.frame);let n=(e-this.lastFrameTime)/1e3;this.lastFrameTime=e;let r=Ye(n,5e-4,.05);this.elapsed+=r,this.trackPerformance(n*1e3,r),this.render(r)};trackPerformance(e,n){this.frameMs=Mt(this.frameMs,Ye(e,1,100),.08),this.frameMs>26?(this.quality=Math.max(.45,this.quality-n*.6),this.quality<=.46&&this.frameMs>32&&this.dpr>1&&(this.dpr=Math.max(1,this.dpr-n*.35),this.applySize(this.cssWidth,this.cssHeight))):this.frameMs<18&&(this.dpr<this.maxDpr?(this.dpr=Math.min(this.maxDpr,this.dpr+n*.4),this.applySize(this.cssWidth,this.cssHeight)):this.quality=Math.min(1,this.quality+n*.25)),this.statsTimer+=n,this.statsTimer>.4&&(this.statsTimer=0,this.callbacks.onStats?.(1e3/Math.max(this.frameMs,.001),this.quality,this.dpr))}render(e){let n=this.gl;this.smoothProgress=St(this.smoothProgress,this.targetProgress,4.2,e),this.smoothPointerX=St(this.smoothPointerX,this.pointerX,6,e),this.smoothPointerY=St(this.smoothPointerY,this.pointerY,6,e),this.camera.update(this.width/this.height,this.smoothPointerX,this.smoothPointerY,this.elapsed,e);let r=this.stages.length,o=this.smoothProgress*r,i=Ye(Math.floor(o),0,r-1);i!==this.currentStage&&(this.currentStage=i,this.callbacks.onStageChange?.(i)),this.callbacks.onProgress?.(this.smoothProgress),this.sceneTarget.bind(),n.clearColor(.006,.011,.024,1),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT);let s=0,a=0,c=0;for(let l=r-1;l>=0;l--){let u=this.stages[l],d=o-l;if(d<-.5||d>1.55)continue;let f=l===0?1:Se(-.45,-.02,d),p=l===r-1?1:1-Se(1.02,1.5,d),h=f*p;if(h<=.002)continue;this.initialised.has(u)||(u.init(n),this.initialised.add(u));let m={gl:n,camera:this.camera,time:this.elapsed,dt:e,local:d,alpha:h,progress:this.smoothProgress,pointerX:this.smoothPointerX,pointerY:this.smoothPointerY,quality:this.quality,width:this.width,height:this.height,target:this.sceneTarget.framebuffer};this.resetDrawState(),n.clear(n.DEPTH_BUFFER_BIT),u.update(m),u.render(m);let y=u.focus?.(m);y&&(s+=y.distance*h,a+=y.aperture*h,c+=h)}c>.001&&(this.focusDistance=St(this.focusDistance,s/c,5,e),this.aperture=St(this.aperture,a/c,5,e)),this.resetDrawState(),this.post.render(this.sceneTarget,{time:this.elapsed,exposure:.92,bloomIntensity:.46,bloomThreshold:.88,aberration:.0013,vignette:.65,grain:.022,focusDistance:this.focusDistance,focusRange:2.6,aperture:this.aperture,maxBlur:.6,backdropBlur:0,near:this.camera.near,far:this.camera.far})}resetDrawState(){let e=this.gl;e.viewport(0,0,this.width,this.height),e.enable(e.DEPTH_TEST),e.depthFunc(e.LEQUAL),e.depthMask(!0),e.enable(e.BLEND),e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA),e.enable(e.CULL_FACE),e.cullFace(e.BACK)}};function sr(t,e,n,r){let o=e[0]-t[0],i=e[1]-t[1],s=Math.hypot(o,i),a=s/2/Math.tan(Math.PI/n),c=r?-1:1,l=-i/s*c,u=o/s*c,d=(t[0]+e[0])/2+l*a,f=(t[1]+e[1])/2+u*a,p=Math.hypot(t[0]-d,t[1]-f),h=Math.atan2(t[1]-f,t[0]-d),m=Math.atan2(e[1]-f,e[0]-d)-h;for(;m>Math.PI;)m-=Math.PI*2;for(;m<-Math.PI;)m+=Math.PI*2;let y=Math.sign(m)*(Math.PI*2/n),I=[];for(let M=0;M<n;M++)I.push([d+p*Math.cos(h+y*M),f+p*Math.sin(h+y*M)]);return I}function so(t){let e=0,n=0;for(let r of t)e+=r[0],n+=r[1];return[e/t.length,n/t.length]}function Yt(t,e,n){let r=t[0]-e[0],o=t[1]-e[1],i=Math.hypot(r,o)||1;return[t[0]+r/i*n,t[1]+o/i*n]}function Ub(){let t=[1.39*Math.cos(-Math.PI/3),1.39*Math.sin(-Math.PI/3)];return sr([0,0],t,6,!1)}function zb(){let t=[1.39*Math.cos(-Math.PI*.4),1.39*Math.sin(-Math.PI*.4)],e=sr([0,0],t,5,!1),n=e[2],r=e[3],o=e[4],i=so(e),s=sr(o,r,6,!1);return Op(so(s),i)<Op(so(sr(o,r,6,!0)),i)&&(s=sr(o,r,6,!0)),[e[0],e[1],n,r,o,s[2],s[3],s[4],s[5]]}function Op(t,e){return Math.hypot(t[0]-e[0],t[1]-e[1])}function Gb(t){let e=[Math.cos(t)*1.47,Math.sin(t)*1.47],n=[e[0]+Math.cos(t-1.2)*1.53,e[1]+Math.sin(t-1.2)*1.53],r=sr(e,n,5,!1),o=["C1'","C2'","C3'","C4'","O4'"],i=["C","C","C","C","O"];return{atoms:r.map((c,l)=>({x:c[0],y:c[1],element:i[l],name:o[l]})),bonds:[[0,1],[1,2],[2,3],[3,4],[4,0]]}}function Lp(t){let e=[],n=[],r=[],o=(l,u,d)=>(e.push({x:l[0],y:l[1],element:u,name:d}),e.length-1);if(t==="A"||t==="G"){let l=zb(),u=["N9","C8","N7","C5","C4","C6","N1","C2","N3"],d=["N","C","N","C","C","C","N","C","N"],f={};l.forEach((h,m)=>{f[u[m]]=o(h,d[m],u[m])});for(let[h,m]of[["N9","C8"],["C8","N7"],["N7","C5"],["C5","C4"],["C4","N9"],["C5","C6"],["C6","N1"],["N1","C2"],["C2","N3"],["N3","C4"]])n.push([f[h],f[m]]);let p=so(l);if(t==="A"){let h=o(Yt(l[5],p,1.28),"N","N6");n.push([f.C6,h]),r.push(h,f.N1)}else{let h=o(Yt(l[5],p,1.28),"O","O6"),m=o(Yt(l[7],p,1.28),"N","N2");n.push([f.C6,h],[f.C2,m]),r.push(h,f.N1,m)}}else{let l=Ub(),u=["N1","C2","N3","C4","C5","C6"],d=["N","C","N","C","C","C"],f={};l.forEach((h,m)=>{f[u[m]]=o(h,d[m],u[m])});for(let h=0;h<6;h++)n.push([h,(h+1)%6]);let p=so(l);if(t==="T"){let h=o(Yt(l[3],p,1.28),"O","O4"),m=o(Yt(l[1],p,1.28),"O","O2"),y=o(Yt(l[4],p,1.5),"C","C7");n.push([f.C4,h],[f.C2,m],[f.C5,y]),r.push(h,f.N3)}else{let h=o(Yt(l[3],p,1.28),"N","N4"),m=o(Yt(l[1],p,1.28),"O","O2");n.push([f.C4,h],[f.C2,m]),r.push(h,f.N3,m)}}let{atoms:s,bonds:a}=Gb(Math.PI),c=e.length;e.push(...s);for(let[l,u]of a)n.push([c+l,c+u]);return n.push([0,c]),{atoms:e,bonds:n,hbondAtoms:r,glycosidic:0}}function Fp(t,e){let n=Lp(t),r=Lp(e),o=p=>p.hbondAtoms.reduce((h,m)=>h+p.atoms[m].x,0)/p.hbondAtoms.length,i=10.5/2,s=i-2.9/2-o(n),a=i+2.9/2+o(r),c=[],l=[];for(let p of n.atoms)c.push(J(Y({},p),{x:p.x+s,strand:0}));for(let[p,h]of n.bonds)l.push([p,h]);let u=c.length;for(let p of r.atoms)c.push(J(Y({},p),{x:a-p.x,y:-p.y,strand:1}));for(let[p,h]of r.bonds)l.push([u+p,u+h]);let d=[],f=Math.min(n.hbondAtoms.length,r.hbondAtoms.length);for(let p=0;p<f;p++)d.push([n.hbondAtoms[p],u+r.hbondAtoms[p]]);return{atoms:c,bonds:l,hbonds:d,senseBase:t,antiBase:e}}var Vp=4,qb=`${k}
${Ze}

in vec2 vUv;
out vec4 fragColor;

uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uGlow;
uniform float uTime;
uniform float uDensity;
uniform float uAspect;
uniform vec2 uGlowPos;

void main() {
  vec2 uv = vUv;
  vec3 base = mix(uBottom, uTop, smoothstep(0.0, 1.0, uv.y));

  // Two noise layers drifting at different rates: the slow one gives large
  // soft masses, the fast one keeps the field from ever looking static.
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
  float slow = fbm(vec3(p * 1.6, uTime * 0.014), 3);
  float fast = fbm(vec3(p * 4.1 + 11.3, uTime * 0.041), 2);
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

  fragColor = vec4(base, 1.0);
}
`,Wb=`${k}
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uAlpha;

void main() {
  fragColor = vec4(texture(uSource, vUv).rgb, uAlpha);
}
`,ne=class{program=null;upscale=null;target=null;init(e){this.dispose(),this.program=new P(e,xt,qb,"backdrop"),this.upscale=new P(e,xt,Wb,"backdrop:upscale"),this.target=new ct(e,oo(e),{hdr:!0,filter:"linear"})}render(e,n){let{gl:r}=e;!this.program||!this.upscale||!this.target||(r.disable(r.DEPTH_TEST),r.depthMask(!1),this.target.resize(Math.max(4,Math.floor(e.width/Vp)),Math.max(4,Math.floor(e.height/Vp))),this.target.bind(),r.disable(r.BLEND),this.program.use().v3a("uTop",n.top).v3a("uBottom",n.bottom).v3a("uGlow",n.glow).f("uDensity",n.density).v2("uGlowPos",n.glowX,n.glowY).f("uTime",e.time).f("uAspect",e.width/e.height),_t(r),r.bindFramebuffer(r.FRAMEBUFFER,e.target),r.viewport(0,0,e.width,e.height),r.enable(r.BLEND),r.blendFunc(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA),this.upscale.use().f("uAlpha",e.alpha).tex("uSource",0,this.target.texture),_t(r),r.enable(r.DEPTH_TEST),r.depthMask(!0))}dispose(){this.program?.dispose(),this.program=null,this.upscale?.dispose(),this.upscale=null,this.target?.dispose(),this.target=null}};function ao(t,e){return e>65535?new Uint32Array(t):new Uint16Array(t)}function mt(t=2){let e=(1+Math.sqrt(5))/2,n=[[-1,e,0],[1,e,0],[-1,-e,0],[1,-e,0],[0,-1,e],[0,1,e],[0,-1,-e],[0,1,-e],[e,0,-1],[e,0,1],[-e,0,-1],[-e,0,1]].map(jp),r=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]],o=new Map,i=(a,c)=>{let l=a<c?a*100003+c:c*100003+a,u=o.get(l);if(u!==void 0)return u;let d=n[a],f=n[c];n.push(jp([d[0]+f[0],d[1]+f[1],d[2]+f[2]]));let p=n.length-1;return o.set(l,p),p};for(let a=0;a<t;a++){let c=[];for(let[l,u,d]of r){let f=i(l,u),p=i(u,d),h=i(d,l);c.push([l,f,h],[u,p,f],[d,h,p],[f,p,h])}r=c}let s=new Float32Array(n.length*3);for(let a=0;a<n.length;a++)s[a*3]=n[a][0],s[a*3+1]=n[a][1],s[a*3+2]=n[a][2];return{positions:s,normals:s.slice(),indices:ao(r.flat(),n.length)}}function Hp(t=12,e=!1){let n=[],r=[],o=[];for(let s=0;s<=1;s++)for(let a=0;a<=t;a++){let c=a/t*Math.PI*2,l=Math.cos(c),u=Math.sin(c);n.push(l,s,u),r.push(l,0,u)}let i=t+1;for(let s=0;s<t;s++){let a=s,c=s+1,l=s+i,u=s+i+1;o.push(a,l,c,c,l,u)}if(e)for(let s=0;s<=1;s++){let a=n.length/3;n.push(0,s,0),r.push(0,s===0?-1:1,0);let c=n.length/3;for(let l=0;l<=t;l++){let u=l/t*Math.PI*2;n.push(Math.cos(u),s,Math.sin(u)),r.push(0,s===0?-1:1,0)}for(let l=0;l<t;l++)s===0?o.push(a,c+l+1,c+l):o.push(a,c+l,c+l+1)}return{positions:new Float32Array(n),normals:new Float32Array(r),indices:ao(o,n.length/3)}}function Cn(t,e){let n=[],r=[];for(let s=0;s<=t;s++){let a=s/t;for(let c=0;c<=e;c++)n.push(a,c/e*Math.PI*2)}let o=e+1;for(let s=0;s<t;s++)for(let a=0;a<e;a++){let c=s*o+a,l=c+1,u=c+o,d=u+1;r.push(c,l,u,l,d,u)}let i=n.length/2;return{positions:new Float32Array(0),normals:new Float32Array(0),params:new Float32Array(n),indices:ao(r,i)}}function Bp(t=1,e=.25,n=32,r=10){let o=[],i=[],s=[];for(let c=0;c<=n;c++){let l=c/n*Math.PI*2,u=Math.cos(l),d=Math.sin(l);for(let f=0;f<=r;f++){let p=f/r*Math.PI*2,h=Math.cos(p),m=Math.sin(p);o.push((t+e*h)*u,e*m,(t+e*h)*d),i.push(h*u,m,h*d)}}let a=r+1;for(let c=0;c<n;c++)for(let l=0;l<r;l++){let u=c*a+l,d=u+1,f=u+a,p=f+1;s.push(u,d,f,d,p,f)}return{positions:new Float32Array(o),normals:new Float32Array(i),indices:ao(s,o.length/3)}}function Ki(){let t=[],e=[],n=[],r=[[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]],[[1,0,0],[0,0,-1],[0,1,0]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[1,0,0],[0,0,-1]],[[0,-1,0],[1,0,0],[0,0,1]]];for(let[o,i,s]of r){let a=t.length/3;for(let[c,l]of[[-1,-1],[1,-1],[1,1],[-1,1]])t.push((o[0]+c*i[0]+l*s[0])*.5,(o[1]+c*i[1]+l*s[1])*.5,(o[2]+c*i[2]+l*s[2])*.5),e.push(o[0],o[1],o[2]);n.push(a,a+1,a+2,a,a+2,a+3)}return{positions:new Float32Array(t),normals:new Float32Array(e),indices:ao(n,t.length/3)}}function jp(t){let e=Math.hypot(t[0],t[1],t[2])||1;return[t[0]/e,t[1]/e,t[2]/e]}var $=class t{constructor(e){this.gl=e;let n=e.createVertexArray();if(!n)throw new Error("createVertexArray failed");this.vao=n,this.indexType=e.UNSIGNED_SHORT}gl;vao;attributes=new Map;indexBuffer=null;indexCount=0;indexType;static fromData(e,n,r){let o=new t(e);return r.position!==void 0&&n.positions.length&&o.attribute("position",r.position,n.positions,3),r.normal!==void 0&&n.normals.length&&o.attribute("normal",r.normal,n.normals,3),r.param!==void 0&&n.params?.length&&o.attribute("param",r.param,n.params,2),o.indices(n.indices),o}attribute(e,n,r,o,i=0,s){let a=this.gl;a.bindVertexArray(this.vao);let c=this.attributes.get(e);if(!c){let l=a.createBuffer();if(!l)throw new Error(`createBuffer failed for attribute "${e}"`);c={buffer:l,location:n,size:o,divisor:i,capacity:0},this.attributes.set(e,c)}return a.bindBuffer(a.ARRAY_BUFFER,c.buffer),a.bufferData(a.ARRAY_BUFFER,r,s??(i?a.DYNAMIC_DRAW:a.STATIC_DRAW)),c.capacity=r.length,a.enableVertexAttribArray(n),a.vertexAttribPointer(n,o,a.FLOAT,!1,0,0),a.vertexAttribDivisor(n,i),a.bindVertexArray(null),this}update(e,n){let r=this.attributes.get(e);if(!r)throw new Error(`unknown attribute "${e}"`);let o=this.gl;return o.bindBuffer(o.ARRAY_BUFFER,r.buffer),n.length<=r.capacity?o.bufferSubData(o.ARRAY_BUFFER,0,n):(o.bufferData(o.ARRAY_BUFFER,n,o.DYNAMIC_DRAW),r.capacity=n.length),this}indices(e){let n=this.gl;if(n.bindVertexArray(this.vao),!this.indexBuffer&&(this.indexBuffer=n.createBuffer(),!this.indexBuffer))throw new Error("createBuffer failed for indices");return n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,this.indexBuffer),n.bufferData(n.ELEMENT_ARRAY_BUFFER,e,n.STATIC_DRAW),this.indexCount=e.length,this.indexType=e instanceof Uint32Array?n.UNSIGNED_INT:n.UNSIGNED_SHORT,n.bindVertexArray(null),this}draw(e=0){if(this.indexCount===0||e<0)return;let n=this.gl;n.bindVertexArray(this.vao),e===0?n.drawElements(n.TRIANGLES,this.indexCount,this.indexType,0):n.drawElementsInstanced(n.TRIANGLES,this.indexCount,this.indexType,0,e),n.bindVertexArray(null)}dispose(){let e=this.gl;for(let{buffer:n}of this.attributes.values())e.deleteBuffer(n);this.attributes.clear(),this.indexBuffer&&e.deleteBuffer(this.indexBuffer),e.deleteVertexArray(this.vao)}},g={position:0,normal:1,param:2,instance0:3,instance1:4,instance2:5,instance3:6};var xe=8,Ie=12,Yb=`${q}
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
`,Zb=`${k}
${te}

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
`,Qb=`${q}
${at}

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
`,Xb=`${k}
${te}

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
`,Fe=class{constructor(e=2){this.subdivisions=e}subdivisions;program=null;mesh=null;count=0;init(e){this.dispose(),this.program=new P(e,Yb,Zb,"molecule:atoms"),this.mesh=$.fromData(e,mt(this.subdivisions),{position:g.position}),this.mesh.attribute("sphere",g.instance0,new Float32Array(4),4,1),this.mesh.attribute("color",g.instance1,new Float32Array(4),4,1),this.count=0}spheres=new Float32Array(0);colors=new Float32Array(0);upload(e,n){if(!this.mesh)return;let r=n*4>this.spheres.length;r&&(this.spheres=new Float32Array(n*4),this.colors=new Float32Array(n*4));let o=this.spheres,i=this.colors;for(let s=0;s<n;s++){let a=s*xe;o[s*4]=e[a],o[s*4+1]=e[a+1],o[s*4+2]=e[a+2],o[s*4+3]=e[a+3],i[s*4]=e[a+4],i[s*4+1]=e[a+5],i[s*4+2]=e[a+6],i[s*4+3]=e[a+7]}r||this.count===0?(this.mesh.attribute("sphere",g.instance0,o,4,1),this.mesh.attribute("color",g.instance1,i,4,1)):(this.mesh.update("sphere",o),this.mesh.update("color",i)),this.count=n}draw(e,n,r,o={}){!this.program||!this.mesh||this.count===0||(this.program.use().m4("uModel",n).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",r).f("uRoughness",o.roughness??.34).f("uTranslucency",o.translucency??.35),this.mesh.draw(this.count))}dispose(){this.program?.dispose(),this.program=null,this.mesh?.dispose(),this.mesh=null,this.count=0}},_e=class{constructor(e=8){this.radialSegments=e}radialSegments;program=null;mesh=null;count=0;init(e){this.dispose(),this.program=new P(e,Qb,Xb,"molecule:bonds"),this.mesh=$.fromData(e,Hp(this.radialSegments,!1),{position:g.position,normal:g.normal}),this.mesh.attribute("start",g.instance0,new Float32Array(4),4,1),this.mesh.attribute("end",g.instance1,new Float32Array(4),4,1),this.mesh.attribute("color",g.instance2,new Float32Array(4),4,1),this.count=0}starts=new Float32Array(0);ends=new Float32Array(0);colors=new Float32Array(0);upload(e,n){if(!this.mesh)return;let r=n*4>this.starts.length;r&&(this.starts=new Float32Array(n*4),this.ends=new Float32Array(n*4),this.colors=new Float32Array(n*4));let o=this.starts,i=this.ends,s=this.colors;for(let a=0;a<n;a++){let c=a*Ie;o[a*4]=e[c],o[a*4+1]=e[c+1],o[a*4+2]=e[c+2],o[a*4+3]=e[c+3],i[a*4]=e[c+4],i[a*4+1]=e[c+5],i[a*4+2]=e[c+6],i[a*4+3]=e[c+7],s[a*4]=e[c+8],s[a*4+1]=e[c+9],s[a*4+2]=e[c+10],s[a*4+3]=e[c+11]}r||this.count===0?(this.mesh.attribute("start",g.instance0,o,4,1),this.mesh.attribute("end",g.instance1,i,4,1),this.mesh.attribute("color",g.instance2,s,4,1)):(this.mesh.update("start",o),this.mesh.update("end",i),this.mesh.update("color",s)),this.count=n}draw(e,n,r,o={}){!this.program||!this.mesh||this.count===0||(this.program.use().m4("uModel",n).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",r).f("uRoughness",o.roughness??.4).f("uTranslucency",o.translucency??.25),this.mesh.draw(this.count))}dispose(){this.program?.dispose(),this.program=null,this.mesh?.dispose(),this.mesh=null,this.count=0}},Ve=class{constructor(e){this.data=e}data;cursor=0;get count(){return this.cursor/xe}reset(){this.cursor=0}push(e,n,r,o,i,s=0){if(this.cursor+xe>this.data.length)return;let a=this.data;a[this.cursor++]=e,a[this.cursor++]=n,a[this.cursor++]=r,a[this.cursor++]=o,a[this.cursor++]=i[0],a[this.cursor++]=i[1],a[this.cursor++]=i[2],a[this.cursor++]=s}},Ne=class{constructor(e){this.data=e}data;cursor=0;get count(){return this.cursor/Ie}reset(){this.cursor=0}push(e,n,r,o,i,s,a,c,l=0,u=1){if(this.cursor+Ie>this.data.length)return;let d=this.data;d[this.cursor++]=e,d[this.cursor++]=n,d[this.cursor++]=r,d[this.cursor++]=a,d[this.cursor++]=o,d[this.cursor++]=i,d[this.cursor++]=s,d[this.cursor++]=l,d[this.cursor++]=c[0],d[this.cursor++]=c[1],d[this.cursor++]=c[2],d[this.cursor++]=u}};var Q=8,Kb=`${q}
${Ze}

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
`,Jb=`${k}

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
`;function e0(){return{positions:new Float32Array([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0]),normals:new Float32Array(12),indices:new Uint16Array([0,1,2,0,2,3])}}var ye=class{program=null;mesh=null;count=0;init(e){this.dispose(),this.program=new P(e,Kb,Jb,"particles"),this.mesh=$.fromData(e,e0(),{position:g.position}),this.mesh.attribute("home",g.instance0,new Float32Array(4),4,1),this.mesh.attribute("style",g.instance1,new Float32Array(4),4,1)}upload(e,n){if(!this.mesh)return;this.count=n;let r=new Float32Array(n*4),o=new Float32Array(n*4);for(let i=0;i<n;i++){let s=i*Q;r[i*4]=e[s],r[i*4+1]=e[s+1],r[i*4+2]=e[s+2],r[i*4+3]=e[s+3],o[i*4]=e[s+4],o[i*4+1]=e[s+5],o[i*4+2]=e[s+6],o[i*4+3]=e[s+7]}this.mesh.attribute("home",g.instance0,r,4,1),this.mesh.attribute("style",g.instance1,o,4,1)}draw(e,n,r,o={},i=-1){if(!this.program||!this.mesh||this.count===0)return;let s=e.gl;s.enable(s.BLEND),s.blendFunc(s.SRC_ALPHA,s.ONE),s.depthMask(!1),s.disable(s.CULL_FACE),this.program.use().m4("uModel",n).m4("uView",e.camera.view).m4("uViewProjection",e.camera.viewProjection).f("uTime",e.time).f("uAlpha",r).f("uDrift",o.drift??.35).f("uSwirl",o.swirl??.35),this.mesh.draw(i<0?this.count:Math.min(i,this.count)),s.depthMask(!0),s.enable(s.CULL_FACE),s.blendFunc(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA)}dispose(){this.program?.dispose(),this.program=null,this.mesh?.dispose(),this.mesh=null,this.count=0}};var ar=7,Ji=500,cr=.1,n0={C:.3,N:.3,O:.29,P:.36},es=class{constructor(e){this.store=e}store;id="basepairs";label="Base pairs";scale="10\u207B\xB9\u2070 m";caption="A pairs with T across two hydrogen bonds; G pairs with C across three. A purine always faces a pyrimidine, which is why the duplex stays exactly 20 \xE5ngstr\xF6m wide whatever the sequence says.";detail="C \xB7 N \xB7 O coloured by element \xB7 H-bonds dashed";atoms=new Fe(2);bonds=new _e(7);hbonds=new _e(5);water=new ye;backdrop=new ne;model=K();sequenceVersion=-1;init(e){this.dispose(),this.atoms.init(e),this.bonds.init(e),this.hbonds.init(e),this.water.init(e),this.backdrop.init(e),this.buildPairs();let n=le(684514),r=new Float32Array(Ji*Q);for(let o=0;o<Ji;o++){let i=(n()-.5)*ar,s=n()*Math.PI*2,a=Me.backboneRadius*cr*(.9+n()*1.1),c=o*Q;r[c]=Math.cos(s)*a,r[c+1]=i*Me.rise*cr,r[c+2]=Math.sin(s)*a,r[c+3]=.014+n()*.016,r[c+4]=.45,r[c+5]=.8,r[c+6]=1,r[c+7]=n()*70}this.water.upload(r,Ji)}buildPairs(){let e=this.store.renderDna,n=new Ve(new Float32Array(ar*64*xe)),r=new Ne(new Float32Array(ar*72*Ie)),o=new Ne(new Float32Array(ar*12*Ie)),i=Math.floor(ar/2);for(let s=0;s<ar;s++){let a=e[(s+12)%e.length],c=Wt(a),l=Fp(a,c),u=s-i,d=u*In,f=u*Me.rise*cr,p=(s%2===0?1:-1)*11*Math.PI/180,h=(m,y)=>{let I=(m-10.5/2)*cr,M=y*cr,D=M*Math.cos(p),S=M*Math.sin(p);return[I*Math.cos(d)-S*Math.sin(d),f+D,I*Math.sin(d)+S*Math.cos(d)]};for(let m of l.atoms){let[y,I,M]=h(m.x,m.y),D=wn[m.element]??wn.C,S=(n0[m.element]??.3)*cr*2.4,F=m.element==="N"||m.element==="O"?.28:.08;n.push(y,I,M,S,D,F)}for(let[m,y]of l.bonds){let I=l.atoms[m],M=l.atoms[y],[D,S,F]=h(I.x,I.y),[U,ie,uo]=h(M.x,M.y),Qt=wn[I.element]??wn.C,Pt=wn[M.element]??wn.C;r.push(D,S,F,U,ie,uo,.026,[(Qt[0]+Pt[0])/2,(Qt[1]+Pt[1])/2,(Qt[2]+Pt[2])/2],.05,1)}for(let[m,y]of l.hbonds){let I=l.atoms[m],M=l.atoms[y],[D,S,F]=h(I.x,I.y),[U,ie,uo]=h(M.x,M.y),Qt=4;for(let Pt=0;Pt<Qt;Pt++){let Ss=Pt/Qt+.06,xs=(Pt+1)/Qt-.06;o.push(D+(U-D)*Ss,S+(ie-S)*Ss,F+(uo-F)*Ss,D+(U-D)*xs,S+(ie-S)*xs,F+(uo-F)*xs,.011,[.72,.94,1],.85,.9)}}}this.atoms.upload(n.data,n.count),this.bonds.upload(r.data,r.count),this.hbonds.upload(o.data,o.count),this.sequenceVersion=this.store.version}update(e){this.sequenceVersion!==this.store.version&&this.buildPairs();let n=Math.pow(2,.4+e.local*1.2),r=-.6+e.local*3.2;ve(this.model,0,0,r,e.time*.1+e.local*.8,n)}render(e){this.backdrop.render(e,{top:[.016,.026,.058],bottom:[.003,.006,.016],glow:[.1,.3,.55],density:.6,glowX:-.3,glowY:-.1}),this.bonds.draw(e,this.model,e.alpha,{roughness:.42,translucency:.15}),this.atoms.draw(e,this.model,e.alpha,{roughness:.24,translucency:.3}),this.hbonds.draw(e,this.model,e.alpha,{roughness:.6,translucency:.6}),this.water.draw(e,this.model,e.alpha*.4,{drift:.04,swirl:1.4},Math.round(Ji*e.quality))}focus(e){return{distance:6-e.local*.9,aperture:5}}dispose(){this.atoms.dispose(),this.bonds.dispose(),this.hbonds.dispose(),this.water.dispose(),this.backdrop.dispose()}};var $p=170,Up=84,ts=1100,r0=`${q}
${Ze}

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
`,o0=`${k}
${Ze}
${te}

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
`,ns=class{id="cell";label="Cell";scale="10\u207B\u2075 m";caption="Inside the membrane: mitochondria generating ATP, vesicles in transit along the cytoskeleton, and the nucleus holding the genome apart from all of it.";detail="Eukaryotic cell \xB7 organelles and cytoskeleton";membraneProgram=null;membraneMesh=null;backdrop=new ne;organelles=new Fe(2);filaments=new _e(6);motes=new ye;model=K();init(e){this.dispose(),this.membraneProgram=new P(e,r0,o0,"cell:membrane"),this.membraneMesh=$.fromData(e,mt(4),{position:g.position}),this.backdrop.init(e),this.organelles.init(e),this.filaments.init(e),this.motes.init(e);let n=le(52753),r=new Ve(new Float32Array($p*xe));r.push(0,0,0,.34,[.42,.66,1],.55),r.push(.08,.05,.04,.11,[.75,.86,1],.9);for(let s=2;s<$p;s++){let[a,c,l]=co(n,.42,.94),u=n();u<.18?r.push(a,c,l,.035+n()*.022,[1,.62,.34],.12):u<.34?r.push(a,c,l,.022+n()*.014,[.68,1,.72],.1):r.push(a,c,l,.015+n()*.02,[.55,.82,1],.06)}this.organelles.upload(r.data,r.count);let o=new Ne(new Float32Array(Up*Ie));for(let s=0;s<26;s++){let[a,c,l]=co(n,.46,.88),u=co(n,1,1),d=.06+n()*.05;o.push(a-u[0]*d,c-u[1]*d,l-u[2]*d,a+u[0]*d,c+u[1]*d,l+u[2]*d,.028+n()*.012,[1,.72,.42],.35,1)}for(let s=26;s<Up;s++){let a=co(n,.36,.44),c=2+n()*.35;o.push(a[0],a[1],a[2],a[0]*c,a[1]*c,a[2]*c,.0035+n()*.0025,[.46,.78,.96],.06,.55)}this.filaments.upload(o.data,o.count);let i=new Float32Array(ts*Q);for(let s=0;s<ts;s++){let[a,c,l]=co(n,.38,.97),u=s*Q;i[u]=a,i[u+1]=c,i[u+2]=l,i[u+3]=.012+n()*.022;let d=n()<.35;i[u+4]=d?.95:.38,i[u+5]=d?.72:.78,i[u+6]=d?.45:1,i[u+7]=n()*80}this.motes.upload(i,ts)}update(e){let n=Math.pow(2,-1.7+e.local*3.6),r=-6+e.local*9.4;ve(this.model,0,0,r,e.time*.045+e.local*.5,n)}render(e){let{gl:n}=e;this.backdrop.render(e,{top:[.02,.042,.082],bottom:[.006,.012,.028],glow:[.14,.34,.7],density:1,glowX:-.22,glowY:.06}),this.organelles.draw(e,this.model,e.alpha,{roughness:.3,translucency:.5}),this.filaments.draw(e,this.model,e.alpha,{roughness:.45,translucency:.2});let r=Math.round(ts*e.quality);this.motes.draw(e,this.model,e.alpha*.75,{drift:.05,swirl:1.7},r),this.membraneProgram&&this.membraneMesh&&(n.disable(n.CULL_FACE),n.depthMask(!1),this.membraneProgram.use().m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uTime",e.time).f("uAlpha",e.alpha),this.membraneMesh.draw(),n.depthMask(!0),n.enable(n.CULL_FACE))}focus(e){return{distance:6-e.local*.8,aperture:7}}dispose(){this.membraneProgram?.dispose(),this.membraneProgram=null,this.membraneMesh?.dispose(),this.membraneMesh=null,this.backdrop.dispose(),this.organelles.dispose(),this.filaments.dispose(),this.motes.dispose()}};function co(t,e,n){let r=t()*2-1,o=Math.sqrt(Math.max(0,1-r*r)),i=t()*Math.PI*2,s=e+(n-e)*Math.cbrt(t());return[o*Math.cos(i)*s,o*Math.sin(i)*s,r*s]}var rs=120,i0=2600,s0=6,zp=`
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
`,a0=`${q}
${zp}

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
`,c0=`${k}
${te}

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
`,l0=`${q}
${at}
${zp}

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
`,u0=`${k}
${te}

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
`,os=class{id="chromatin";label="Chromatin";scale="10\u207B\u2078 m";caption="DNA does not float free. Every 147 bases wind 1.65 turns around a histone octamer, and those beads coil again into the fibre that condenses into a chromosome.";detail="Nucleosome \xB7 147 bp per histone core";beadProgram=null;beadMesh=null;tubeProgram=null;tubeMesh=null;backdrop=new ne;model=K();open=0;init(e){this.dispose(),this.beadProgram=new P(e,a0,c0,"chromatin:beads"),this.beadMesh=$.fromData(e,mt(2),{position:g.position});let n=new Float32Array(rs);for(let r=0;r<rs;r++)n[r]=r;this.beadMesh.attribute("index",g.instance0,n,1,1),this.tubeProgram=new P(e,l0,u0,"chromatin:dna"),this.tubeMesh=$.fromData(e,Cn(i0,s0),{param:g.param}),this.backdrop.init(e)}update(e){this.open=Se(.12,.78,e.local);let n=Math.pow(2,-.6+e.local*2.3),r=-3.4+e.local*6.2;ve(this.model,0,0,r,e.time*.06+e.local*.9,n)}render(e){this.backdrop.render(e,{top:[.028,.03,.078],bottom:[.008,.008,.026],glow:[.3,.24,.72],density:.9,glowX:-.18,glowY:.2});let n=r=>r.m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",e.alpha).f("uTime",e.time).f("uCount",rs).f("uOpen",this.open).f("uSpacing",.075).f("uCoilRadius",.16).f("uSuperRadius",.3);this.tubeProgram&&this.tubeMesh&&(n(this.tubeProgram.use()).f("uTubeRadius",.009).f("uWrapRadius",.041).f("uTurnsPerBead",1.65),this.tubeMesh.draw()),this.beadProgram&&this.beadMesh&&(n(this.beadProgram.use()).f("uBeadRadius",.032),this.beadMesh.draw(rs))}focus(e){return{distance:6.2-e.local*1.4,aperture:6}}dispose(){this.beadProgram?.dispose(),this.beadProgram=null,this.beadMesh?.dispose(),this.beadMesh=null,this.tubeProgram?.dispose(),this.tubeProgram=null,this.tubeMesh?.dispose(),this.tubeMesh=null,this.backdrop.dispose()}};var Nt=46,d0=900,f0=10,is=900,Gp=.1,Cl=Me.rise*Gp,ss=Me.backboneRadius*Gp,p0=`${q}
${at}
${Tn}

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
`,h0=`${k}
${te}

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
`,m0=`${q}
${Tn}

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
`,g0=`${k}
${te}

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
`,as=class{constructor(e){this.store=e}store;id="helix";label="Double helix";scale="10\u207B\u2079 m";caption="B-DNA: ten and a half base pairs per turn, rising 3.4 \xE5ngstr\xF6m each. The two backbones run antiparallel and sit 225\xB0 apart, cutting one wide groove and one narrow one.";get detail(){let{length:e}=this.store.analysis;return this.store.isDefault?"TP53 coding sequence \xB7 A\u2013T and G\u2013C":this.store.isFallback?"Awaiting a sequence \xB7 showing TP53":`Your sequence \xB7 ${e} nt \xB7 A\u2013T and G\u2013C`}backboneProgram=null;backboneMesh=null;baseProgram=null;baseMesh=null;backdrop=new ne;hydration=new ye;model=K();readHead=0;sequenceVersion=-1;init(e){this.dispose(),this.backboneProgram=new P(e,p0,h0,"helix:backbone"),this.backboneMesh=$.fromData(e,Cn(d0,f0),{param:g.param}),this.baseProgram=new P(e,m0,g0,"helix:bases"),this.baseMesh=$.fromData(e,Ki(),{position:g.position,normal:g.normal}),this.uploadSequence(),this.backdrop.init(e),this.hydration.init(e);let n=le(3402),r=new Float32Array(is*Q);for(let o=0;o<is;o++){let i=(n()-.5)*Nt,s=n()*Math.PI*2,a=ss*(1.15+n()*1.5),c=o*Q;r[c]=Math.cos(s)*a,r[c+1]=i*Cl,r[c+2]=Math.sin(s)*a,r[c+3]=.012+n()*.02;let l=n()<.18;r[c+4]=l?1:.35,r[c+5]=l?.78:.72,r[c+6]=l?.42:1,r[c+7]=n()*90}this.hydration.upload(r,is)}uploadSequence(){if(!this.baseMesh)return;let e=this.store.renderDna,n=new Float32Array(Nt*2*4),r=new Float32Array(Nt*2*4);for(let o=0;o<Nt;o++){let i=e[o%e.length],s=Wt(i);for(let[a,c]of[[0,i],[1,s]]){let l=(o*2+a)*4;n[l]=o-Nt/2,n[l+1]=a,n[l+2]=c==="A"||c==="G"?1:0,n[l+3]=0;let u=Ct[c];r[l]=u[0],r[l+1]=u[1],r[l+2]=u[2],r[l+3]=1}}this.baseMesh.attribute("base",g.instance0,n,4,1),this.baseMesh.attribute("color",g.instance1,r,4,1),this.sequenceVersion=this.store.version}update(e){this.sequenceVersion!==this.store.version&&this.uploadSequence(),this.readHead=(e.local*1.25-.15)*Nt-Nt/2;let n=Math.pow(2,-.35+e.local*1.5),r=-1.8+e.local*4.4;ve(this.model,0,0,r,e.time*.14+e.local*1.2,n)}render(e){this.backdrop.render(e,{top:[.02,.032,.07],bottom:[.004,.008,.02],glow:[.12,.36,.62],density:.75,glowX:.28,glowY:.18});let n=.035;if(this.backboneProgram&&this.backboneMesh){let r=this.backboneProgram.use().m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",e.alpha).f("uTime",e.time).f("uRise",Cl).f("uTwist",In).f("uRadius",ss).f("uStrandOffset",Me.strandOffset).f("uBend",n).f("uBpCount",Nt).f("uTubeRadius",.085);for(let o of[0,1])r.f("uStrand",o),this.backboneMesh.draw()}this.baseProgram&&this.baseMesh&&(this.baseProgram.use().m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",e.alpha).f("uTime",e.time).f("uRise",Cl).f("uTwist",In).f("uRadius",ss).f("uStrandOffset",Me.strandOffset).f("uBend",n).f("uInnerRadius",ss*.2).f("uThickness",.055).f("uWidth",.16).f("uReadHead",this.readHead),this.baseMesh.draw(Nt*2)),this.hydration.draw(e,this.model,e.alpha*.55,{drift:.06,swirl:1.1},Math.round(is*e.quality))}focus(e){return{distance:6-e.local*1.2,aperture:5.5}}dispose(){this.backboneProgram?.dispose(),this.backboneProgram=null,this.backboneMesh?.dispose(),this.backboneMesh=null,this.baseProgram?.dispose(),this.baseProgram=null,this.baseMesh?.dispose(),this.baseMesh=null,this.backdrop.dispose(),this.hydration.dispose()}};var cs=44,v0=8,qp='600 24px "IBM Plex Sans", system-ui, -apple-system, sans-serif',y0=`${q}
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
`,b0=`${k}
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
`;function E0(){return{positions:new Float32Array([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0]),normals:new Float32Array(12),indices:new Uint16Array([0,1,2,0,2,3])}}var ls=class{constructor(e){this.labels=e}labels;program=null;mesh=null;texture=null;entries=new Map;count=0;atlasWidth=1;atlasHeight=1;textureOwner=null;init(e){this.dispose(),this.textureOwner=e,this.program=new P(e,y0,b0,"labels"),this.mesh=$.fromData(e,E0(),{position:g.position}),this.mesh.attribute("anchor",g.instance0,new Float32Array(4),4,1),this.mesh.attribute("rect",g.instance1,new Float32Array(4),4,1),this.mesh.attribute("style",g.instance2,new Float32Array(4),4,1),this.buildAtlas(e)}buildAtlas(e){let n=document.createElement("canvas"),r=n.getContext("2d");if(!r)return;r.font=qp;let o=this.labels.map(c=>Math.ceil(r.measureText(c).width)+v0*2),i=Math.max(64,...o);n.width=Wp(i),n.height=Wp(cs*this.labels.length),this.atlasWidth=n.width,this.atlasHeight=n.height;let s=n.getContext("2d");if(!s)return;s.clearRect(0,0,n.width,n.height),s.font=qp,s.textBaseline="middle",s.textAlign="center",s.fillStyle="#ffffff",this.entries.clear(),this.labels.forEach((c,l)=>{let u=l*cs,d=o[l];s.fillText(c,n.width/2,u+cs/2),this.entries.set(c,{rect:[(n.width/2-d/2)/n.width,u/n.height,d/n.width,cs/n.height]})});let a=e.createTexture();a&&(e.bindTexture(e.TEXTURE_2D,a),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.generateMipmap(e.TEXTURE_2D),this.texture=a)}aspectOf(e){let n=this.entries.get(e);return n?n.rect[2]*this.atlasWidth/(n.rect[3]*this.atlasHeight):1}place(e){if(!this.mesh)return;let n=new Float32Array(e.length*4),r=new Float32Array(e.length*4),o=new Float32Array(e.length*4),i=0;for(let s of e){let a=this.entries.get(s.label);if(!a)continue;let c=i++;n[c*4]=s.x,n[c*4+1]=s.y,n[c*4+2]=s.z,n[c*4+3]=s.size,r.set(a.rect,c*4),o[c*4]=s.color[0],o[c*4+1]=s.color[1],o[c*4+2]=s.color[2],o[c*4+3]=s.opacity}this.count=i,this.mesh.attribute("anchor",g.instance0,n,4,1),this.mesh.attribute("rect",g.instance1,r,4,1),this.mesh.attribute("style",g.instance2,o,4,1)}draw(e,n){if(!this.program||!this.mesh||!this.texture||this.count===0)return;let r=e.gl;r.enable(r.BLEND),r.blendFunc(r.SRC_ALPHA,r.ONE),r.depthMask(!1),r.disable(r.CULL_FACE),this.program.use().m4("uModel",n).m4("uView",e.camera.view).m4("uViewProjection",e.camera.viewProjection).f("uAtlasAspect",this.atlasWidth/this.atlasHeight).tex("uAtlas",0,this.texture),this.mesh.draw(this.count),r.depthMask(!0),r.enable(r.CULL_FACE),r.blendFunc(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA)}dispose(){this.program?.dispose(),this.program=null,this.mesh?.dispose(),this.mesh=null,this.texture&&(this.textureOwner?.deleteTexture(this.texture),this.texture=null),this.entries.clear(),this.count=0,this.textureOwner=null}};function Wp(t){let e=1;for(;e<t;)e*=2;return e}var At=[{id:"TP53",role:"hub",note:"the transcription factor itself"},{id:"ATM",role:"sensor",note:"senses double-strand breaks"},{id:"ATR",role:"sensor",note:"senses replication stress"},{id:"CHEK2",role:"sensor",note:"kinase relaying the damage signal"},{id:"TP53BP1",role:"sensor",note:"damage-site adaptor"},{id:"MDM2",role:"regulator",note:"ubiquitin ligase, marks p53 for destruction"},{id:"MDM4",role:"regulator",note:"blocks p53 transactivation"},{id:"USP7",role:"regulator",note:"deubiquitinase, rescues both"},{id:"CREBBP",role:"regulator",note:"acetylates and activates"},{id:"SIRT1",role:"regulator",note:"deacetylates and quiets"},{id:"CDKN1A",role:"effector",note:"p21 \u2014 halts the cell cycle"},{id:"GADD45A",role:"effector",note:"growth arrest and repair"},{id:"SFN",role:"effector",note:"14-3-3\u03C3 \u2014 holds the G2 arrest"},{id:"BAX",role:"effector",note:"punches holes in mitochondria"},{id:"BBC3",role:"effector",note:"PUMA \u2014 commits to apoptosis"},{id:"PTEN",role:"effector",note:"dampens survival signalling"}],lr=[["ATM","TP53","activates"],["ATM","CHEK2","activates"],["ATR","TP53","activates"],["ATR","CHEK2","activates"],["CHEK2","TP53","activates"],["TP53BP1","TP53","activates"],["ATM","TP53BP1","activates"],["ATM","MDM2","inhibits"],["MDM2","TP53","inhibits"],["MDM4","TP53","inhibits"],["MDM2","MDM4","inhibits"],["USP7","MDM2","activates"],["USP7","TP53","activates"],["CREBBP","TP53","activates"],["SIRT1","TP53","inhibits"],["TP53","MDM2","transcribes"],["TP53","CDKN1A","transcribes"],["TP53","GADD45A","transcribes"],["TP53","SFN","transcribes"],["TP53","BAX","transcribes"],["TP53","BBC3","transcribes"],["TP53","PTEN","transcribes"],["CDKN1A","GADD45A","activates"],["BBC3","BAX","activates"],["PTEN","MDM2","inhibits"]],Yp={hub:[1,.78,.34],sensor:[.42,.86,1],regulator:[1,.44,.56],effector:[.4,1,.7]},Zp={activates:[.36,.78,1],inhibits:[1,.4,.52],transcribes:[.44,1,.72]},Ml=3,us=class{id="interactome";label="Connections";scale="10\u207B\u2078 m";caption="One gene never acts alone. Damage sensors switch p53 on, p53 switches on the genes that arrest or kill the cell \u2014 and one of them, MDM2, switches p53 back off.";detail="p53 network \xB7 sensors, regulators, effectors";nodes=new Fe(3);edges=new _e(6);pulses=new ye;labels=new ls(At.map(e=>e.id));backdrop=new ne;model=K();positions=[];degree=new Map;nodeWriter=new Ve(new Float32Array(At.length*xe));edgeWriter=new Ne(new Float32Array(lr.length*Ie));pulseData=new Float32Array(lr.length*Ml*Q);init(e){this.dispose(),this.nodes.init(e),this.edges.init(e),this.pulses.init(e),this.labels.init(e),this.backdrop.init(e),this.layout()}layout(){let e=le(40509),n=At.length,r=[];for(let c=0;c<n;c++){if(At[c].role==="hub"){r.push([0,0,0]);continue}let l=1-c/(n-1)*2,u=Math.sqrt(Math.max(0,1-l*l)),d=c*2.399963229728653;r.push([Math.cos(d)*u*1.4+(e()-.5)*.1,l*1.4+(e()-.5)*.1,Math.sin(d)*u*1.4+(e()-.5)*.1])}let o=new Map;At.forEach((c,l)=>o.set(c.id,l));for(let[c,l]of lr)this.degree.set(c,(this.degree.get(c)??0)+1),this.degree.set(l,(this.degree.get(l)??0)+1);let i=r.map(()=>[0,0,0]);for(let c=0;c<400;c++){let l=1-c/400;for(let u=0;u<n;u++){let d=i[u],f=r[u];for(let m=u+1;m<n;m++){let y=r[m],I=f[0]-y[0],M=f[1]-y[1],D=f[2]-y[2],S=I*I+M*M+D*D;S<1e-4&&(I=e()-.5,M=e()-.5,D=e()-.5,S=.01);let F=.55/S,U=Math.sqrt(S),ie=i[m];d[0]+=I/U*F,d[1]+=M/U*F,d[2]+=D/U*F,ie[0]-=I/U*F,ie[1]-=M/U*F,ie[2]-=D/U*F}let p=Math.hypot(f[0],f[1],f[2]),h=.06*p;p>1e-5&&(d[0]-=f[0]/p*h,d[1]-=f[1]/p*h,d[2]-=f[2]/p*h)}for(let[u,d]of lr){let f=o.get(u),p=o.get(d),h=r[f],m=r[p],y=m[0]-h[0],I=m[1]-h[1],M=m[2]-h[2],D=Math.hypot(y,I,M)||1e-4,S=(D-1.25)*.09,F=i[f],U=i[p];F[0]+=y/D*S,F[1]+=I/D*S,F[2]+=M/D*S,U[0]-=y/D*S,U[1]-=I/D*S,U[2]-=M/D*S}for(let u=0;u<n;u++){let d=i[u],f=r[u],p=At[u].role==="hub"?.06:1;f[0]+=d[0]*.055*l*p,f[1]+=d[1]*.055*l*p,f[2]+=d[2]*.055*l*p,d[0]*=.72,d[1]*=.72,d[2]*=.72}}let s=0;for(let c of r)s=Math.max(s,Math.hypot(c[0],c[1],c[2]));let a=s>1e-4?1.85/s:1;for(let c of r)c[0]*=a,c[1]*=a,c[2]*=a;this.positions.length=0,this.positions.push(...r)}nodePosition(e,n){let r=this.positions[e];return[r[0]+Math.sin(n*.5+e*1.7)*.03,r[1]+Math.sin(n*.43+e*2.3)*.03,r[2]+Math.cos(n*.47+e*1.1)*.03]}update(e){let n=Se(0,.45,e.local),r=new Map;At.forEach((l,u)=>r.set(l.id,u));let o=this.nodeWriter;o.reset(),At.forEach((l,u)=>{let[d,f,p]=this.nodePosition(u,e.time),h=this.degree.get(l.id)??1,m=.05+Math.sqrt(h)*.026,y=l.role==="hub"?.5+.35*Math.sin(e.time*1.6):.22,I=Dn((n-u*.02)*4);o.push(d,f,p,m*I,Yp[l.role],y)}),this.nodes.upload(o.data,o.count);let i=this.edgeWriter;i.reset(),lr.forEach(([l,u,d],f)=>{let p=r.get(l),h=r.get(u),m=this.nodePosition(p,e.time),y=this.nodePosition(h,e.time),I=Dn((n-.12-f*.012)*3.5);I<=.001||i.push(m[0],m[1],m[2],m[0]+(y[0]-m[0])*I,m[1]+(y[1]-m[1])*I,m[2]+(y[2]-m[2])*I,d==="transcribes"?.0075:.006,Zp[d],.35,.5*I)}),this.edges.upload(i.data,i.count);let s=this.pulseData,a=0;lr.forEach(([l,u,d],f)=>{let p=r.get(l),h=r.get(u),m=this.nodePosition(p,e.time),y=this.nodePosition(h,e.time),I=Zp[d];for(let M=0;M<Ml;M++){let D=(e.time*.32+f*.17+M/Ml)%1,S=a*Q;s[S]=m[0]+(y[0]-m[0])*D,s[S+1]=m[1]+(y[1]-m[1])*D,s[S+2]=m[2]+(y[2]-m[2])*D,s[S+3]=.03*Math.sin(D*Math.PI)*n,s[S+4]=I[0],s[S+5]=I[1],s[S+6]=I[2],s[S+7]=f*3.1+M,a++}}),this.pulses.upload(s,a),this.labels.place(At.map((l,u)=>{let[d,f,p]=this.nodePosition(u,e.time),h=this.degree.get(l.id)??1;return{label:l.id,x:d,y:f+.05+Math.sqrt(h)*.026,z:p,size:l.role==="hub"?.115:.082,color:Yp[l.role],opacity:Dn((n-.25-u*.015)*4)*.95}}));let c=Math.pow(2,-.1+e.local*.55);ve(this.model,0,0,-.4+e.local*1.6,e.time*.08,c)}render(e){this.backdrop.render(e,{top:[.016,.03,.07],bottom:[.003,.007,.02],glow:[.16,.34,.64],density:.7,glowX:0,glowY:0}),this.edges.draw(e,this.model,e.alpha,{roughness:.55,translucency:.6}),this.nodes.draw(e,this.model,e.alpha,{roughness:.26,translucency:.45}),this.pulses.draw(e,this.model,e.alpha*.9,{drift:0,swirl:.1}),this.labels.draw(e,this.model)}focus(){return{distance:6,aperture:8}}dispose(){this.nodes.dispose(),this.edges.dispose(),this.pulses.dispose(),this.labels.dispose(),this.backdrop.dispose(),this.degree.clear()}};var ur=23,ds=150,fs=2600,Qp=640,w0=`${q}
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
`,I0=`${k}
${Ze}
${te}

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
`,D0=`${q}
${at}

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
`,T0=`${k}
${te}

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
`,ps=class{id="nucleus";label="Nucleus";scale="10\u207B\u2076 m";caption="Two metres of DNA folded into six micrometres. Each chromosome keeps to its own territory, and every molecule entering or leaving passes through one of a few thousand nuclear pores.";detail="23 chromosome territories \xB7 nuclear pore complexes";envelopeProgram=null;envelopeMesh=null;poreProgram=null;poreMesh=null;backdrop=new ne;chromatin=new ye;strands=new _e(5);model=K();init(e){this.dispose(),this.envelopeProgram=new P(e,w0,I0,"nucleus:envelope"),this.envelopeMesh=$.fromData(e,mt(3),{position:g.position}),this.poreProgram=new P(e,D0,T0,"nucleus:pores"),this.poreMesh=$.fromData(e,Bp(1,.34,14,7),{position:g.position,normal:g.normal}),this.backdrop.init(e),this.chromatin.init(e),this.strands.init(e);let n=le(6060),r=new Float32Array(ds*4);for(let l=0;l<ds;l++){let u=1-l/(ds-1)*2,d=Math.sqrt(Math.max(0,1-u*u)),f=l*2.399963229728653;r[l*4]=Math.cos(f)*d,r[l*4+1]=u,r[l*4+2]=Math.sin(f)*d,r[l*4+3]=.032+n()*.012}this.poreInstances=r;let o=new Float32Array(fs*Q),i=[],s=[];for(let l=0;l<ur;l++){let u=1-l/(ur-1)*2,d=Math.sqrt(Math.max(0,1-u*u)),f=l*2.399963229728653,p=.34+n()*.38;i.push([Math.cos(f)*d*p,u*p,Math.sin(f)*d*p]),s.push(C0(l/ur))}for(let l=0;l<fs;l++){let u=l%ur,d=i[u],f=s[u],p=.11+n()*.14,h=l*Q;o[h]=d[0]+(n()*2-1)*p,o[h+1]=d[1]+(n()*2-1)*p,o[h+2]=d[2]+(n()*2-1)*p,o[h+3]=.008+n()*.017,o[h+4]=f[0],o[h+5]=f[1],o[h+6]=f[2],o[h+7]=n()*60}this.chromatin.upload(o,fs);let a=new Ne(new Float32Array(Qp*Ie)),c=Math.floor(Qp/ur);for(let l=0;l<ur;l++){let u=i[l],d=s[l],f=u[0],p=u[1],h=u[2],m=n()*2-1,y=n()*2-1,I=n()*2-1;for(let M=0;M<c;M++){m+=(n()*2-1)*.7,y+=(n()*2-1)*.7,I+=(n()*2-1)*.7;let D=Math.hypot(m,y,I)||1,S=.045,F=f+m/D*S,U=p+y/D*S,ie=h+I/D*S;a.push(f,p,h,F,U,ie,.006,d,.25,.85),f=F,p=U,h=ie,m+=(u[0]-f)*2.4,y+=(u[1]-p)*2.4,I+=(u[2]-h)*2.4}}this.strands.upload(a.data,a.count)}poreInstances=null;poreMeshReady=!1;update(e){let n=Math.pow(2,-1.4+e.local*3.2),r=-5.2+e.local*8.6;ve(this.model,0,0,r,e.time*.035-e.local*.4,n)}render(e){let{gl:n}=e;this.backdrop.render(e,{top:[.024,.036,.088],bottom:[.006,.01,.03],glow:[.2,.28,.76],density:1.1,glowX:.24,glowY:-.14}),this.strands.draw(e,this.model,e.alpha*.9,{roughness:.5,translucency:.4});let r=Math.round(fs*e.quality);this.chromatin.draw(e,this.model,e.alpha*.62,{drift:.035,swirl:2.4},r),this.poreProgram&&this.poreMesh&&this.poreInstances&&(this.poreMeshReady||(this.poreMesh.attribute("pore",g.instance0,this.poreInstances,4,1),this.poreMeshReady=!0),this.poreProgram.use().m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uRadius",1).f("uAlpha",e.alpha),this.poreMesh.draw(ds)),this.envelopeProgram&&this.envelopeMesh&&(n.disable(n.CULL_FACE),n.depthMask(!1),this.envelopeProgram.use().m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uTime",e.time).f("uAlpha",e.alpha),this.envelopeMesh.draw(),n.depthMask(!0),n.enable(n.CULL_FACE))}focus(e){return{distance:5.8-e.local*.7,aperture:6.5}}dispose(){this.envelopeProgram?.dispose(),this.envelopeProgram=null,this.envelopeMesh?.dispose(),this.envelopeMesh=null,this.poreProgram?.dispose(),this.poreProgram=null,this.poreMesh?.dispose(),this.poreMesh=null,this.poreMeshReady=!1,this.poreInstances=null,this.backdrop.dispose(),this.chromatin.dispose(),this.strands.dispose()}};function C0(t){let e=t*Math.PI*2;return[.45+.4*Math.sin(e),.6+.3*Math.sin(e+2.1),.8+.2*Math.sin(e+4.2)]}var lo=260,M0=`${q}
${ro}
${Ze}

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
`,S0=`${k}
${ro}
${Ze}
${te}

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
`,hs=class{id="tissue";label="Tissue";scale="10\u207B\xB3 m";caption="Roughly thirty trillion cells. Every one of them carries the same two metres of DNA, folded to fit inside a nucleus six micrometres across.";detail="Human tissue \xB7 ~20 \xB5m per cell";program=null;mesh=null;backdrop=new ne;count=lo;init(e){this.dispose(),this.program=new P(e,M0,S0,"tissue:cells"),this.backdrop.init(e);let n=mt(2),r=$.fromData(e,n,{position:g.position}),o=new Float32Array(lo*4),i=new Float32Array(lo*4),s=le(24301);for(let a=0;a<lo;a++){let c=s()*Math.PI*2,l=1.1+Math.pow(s(),.7)*7.4;o[a*4]=Math.cos(c)*l,o[a*4+1]=Math.sin(c)*l*.78,o[a*4+2]=-22+s()*26,o[a*4+3]=.42+s()*.85;let u=s();i[a*4]=s()*40,i[a*4+1]=.24+u*.34,i[a*4+2]=.52+u*.24,i[a*4+3]=.86+(1-u)*.14}r.attribute("cell",g.instance0,o,4,1),r.attribute("traits",g.instance1,i,4,1),this.mesh=r}update(e){this.count=Math.max(60,Math.round(lo*e.quality))}render(e){let{gl:n}=e;if(!this.program||!this.mesh)return;this.backdrop.render(e,{top:[.016,.035,.075],bottom:[.004,.008,.02],glow:[.1,.3,.62],density:.85,glowX:.18,glowY:.12}),n.enable(n.BLEND),n.blendFunc(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA),n.depthMask(!1);let r=Math.pow(2,-.9+e.local*2.4);this.program.use().m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uTime",e.time).f("uAlpha",e.alpha).f("uZoom",r).f("uDepthOffset",-2+e.local*16).f("uWobble",.11),this.mesh.draw(this.count),n.depthMask(!0)}focus(e){return{distance:7.5-e.local*2,aperture:9}}dispose(){this.program?.dispose(),this.program=null,this.mesh?.dispose(),this.mesh=null,this.backdrop.dispose()}};var Rt=58,x0=1e3,_0=9,Sl=22,ms=420,Kp=.1,Xp=Me.rise*Kp,gs=Me.backboneRadius*Kp,xl=`
uniform float uFork;
uniform float uBubbleWidth;
uniform float uOpenAmount;

float bubbleOpenness(float bp) {
  float d = (bp - uFork) / uBubbleWidth;
  return exp(-d * d) * uOpenAmount;
}
`,N0=`${q}
${at}
${Tn}
${xl}

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
`,A0=`${k}
${te}

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
`,R0=`${q}
${Tn}
${xl}

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
`,P0=`${k}
${te}

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
`,k0=`${q}
${at}
${Tn}
${xl}

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
`,O0=`${k}
${te}

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
`,vs=class{constructor(e){this.store=e}store;id="transcription";label="Transcription";scale="10\u207B\u2079 m";caption="RNA polymerase opens about fourteen base pairs at a time, copies the template strand into RNA \u2014 uracil in place of thymine \u2014 and lets the duplex close behind it.";get detail(){return this.store.isDefault||this.store.isFallback?"DNA \u2192 pre-mRNA \xB7 ~14 bp bubble":`Your sequence \xB7 ${this.store.analysis.length} nt \xB7 ~14 bp bubble`}strandProgram=null;strandMesh=null;baseProgram=null;baseMesh=null;mrnaProgram=null;mrnaMesh=null;polymerase=new Fe(3);pool=new ye;backdrop=new ne;model=K();blobWriter=new Ve(new Float32Array(Sl*xe));blobSeeds=[];fork=0;sequenceVersion=-1;openAmount=0;init(e){this.dispose(),this.strandProgram=new P(e,N0,A0,"transcription:strands"),this.strandMesh=$.fromData(e,Cn(x0,_0),{param:g.param}),this.baseProgram=new P(e,R0,P0,"transcription:bases"),this.baseMesh=$.fromData(e,Ki(),{position:g.position,normal:g.normal}),this.mrnaProgram=new P(e,k0,O0,"transcription:mrna"),this.mrnaMesh=$.fromData(e,Cn(600,7),{param:g.param}),this.uploadSequence(),this.polymerase.init(e),this.pool.init(e),this.backdrop.init(e);let n=le(2305);this.blobSeeds.length=0;for(let o=0;o<Sl;o++)this.blobSeeds.push([(n()*2-1)*.62,(n()*2-1)*.5,(n()*2-1)*.62,.16+n()*.2]);let r=new Float32Array(ms*Q);for(let o=0;o<ms;o++){let i=o*Q;r[i]=(n()*2-1)*2.6,r[i+1]=(n()*2-1)*3.2,r[i+2]=(n()*2-1)*2.6,r[i+3]=.016+n()*.022;let s=Ct[["A","U","G","C"][Math.floor(n()*4)]];r[i+4]=s[0],r[i+5]=s[1],r[i+6]=s[2],r[i+7]=n()*100}this.pool.upload(r,ms)}uploadSequence(){if(!this.baseMesh)return;let e=this.store.renderDna,n=new Float32Array(Rt*2*4),r=new Float32Array(Rt*2*4);for(let o=0;o<Rt;o++){let i=e[o%e.length],s=Wt(i);for(let[a,c]of[[0,i],[1,s]]){let l=(o*2+a)*4;n[l]=o-Rt/2,n[l+1]=a,n[l+2]=c==="A"||c==="G"?1:0;let u=Ct[c];r[l]=u[0],r[l+1]=u[1],r[l+2]=u[2],r[l+3]=1}}this.baseMesh.attribute("base",g.instance0,n,4,1),this.baseMesh.attribute("color",g.instance1,r,4,1),this.sequenceVersion=this.store.version}update(e){this.sequenceVersion!==this.store.version&&this.uploadSequence(),this.openAmount=Se(.02,.2,e.local)*(1-Se(.88,1,e.local)),this.fork=Mt(-Rt*.42,Rt*.46,Se(.05,.95,e.local));let n=this.fork*Xp,r=this.blobWriter;r.reset();for(let s=0;s<Sl;s++){let[a,c,l,u]=this.blobSeeds[s],d=Math.sin(e.time*2.2+s*1.7)*.03;r.push(a*gs*1.5+d,n+c*.55,l*gs*1.5-d,u*(.9+.1*Math.sin(e.time*3+s)),[.58,.72,.86],.05)}this.polymerase.upload(r.data,r.count);let o=Math.pow(2,-.15+e.local*.75),i=-1+e.local*2.6;ve(this.model,0,-n*.55,i,e.time*.09+.6,o)}render(e){let{gl:n}=e;this.backdrop.render(e,{top:[.026,.024,.062],bottom:[.006,.005,.018],glow:[.36,.2,.62],density:.8,glowX:.3,glowY:-.2});let r=o=>o.m4("uModel",this.model).m4("uViewProjection",e.camera.viewProjection).v3a("uCameraPos",e.camera.position).f("uAlpha",e.alpha).f("uTime",e.time).f("uRise",Xp).f("uTwist",In).f("uRadius",gs).f("uStrandOffset",Me.strandOffset).f("uBend",.03).f("uFork",this.fork).f("uBubbleWidth",7).f("uOpenAmount",this.openAmount);if(this.strandProgram&&this.strandMesh){let o=r(this.strandProgram.use()).f("uBpCount",Rt).f("uTubeRadius",.082);for(let i of[0,1])o.f("uStrand",i),this.strandMesh.draw()}this.baseProgram&&this.baseMesh&&(r(this.baseProgram.use()).f("uInnerRadius",gs*.2).f("uThickness",.055).f("uWidth",.16),this.baseMesh.draw(Rt*2)),this.mrnaProgram&&this.mrnaMesh&&(r(this.mrnaProgram.use()).f("uBpCount",Rt).f("uTubeRadius",.062),this.mrnaMesh.draw()),n.depthMask(!1),this.polymerase.draw(e,this.model,e.alpha*.42,{roughness:.55,translucency:.8}),n.depthMask(!0),this.pool.draw(e,this.model,e.alpha*.5,{drift:.22,swirl:.9},Math.round(ms*e.quality))}focus(e){return{distance:6-e.local*.6,aperture:5.5}}dispose(){this.strandProgram?.dispose(),this.strandProgram=null,this.strandMesh?.dispose(),this.strandMesh=null,this.baseProgram?.dispose(),this.baseProgram=null,this.baseMesh?.dispose(),this.baseMesh=null,this.mrnaProgram?.dispose(),this.mrnaProgram=null,this.mrnaMesh?.dispose(),this.mrnaMesh=null,this.polymerase.dispose(),this.pool.dispose(),this.backdrop.dispose()}};var Zt=3.8,Jp=[17,29],L0=[18,22,25],F0={E:1.51,M:1.45,A:1.42,L:1.21,K:1.16,F:1.13,Q:1.11,W:1.08,I:1.08,V:1.06,D:1.01,H:1,R:.98,T:.83,S:.77,C:.7,Y:.69,N:.67,P:.57,G:.57};function V0(t){let e=t.length,n=new Array(e).fill("coil");if(e<6)return n;let r=i=>F0[t[i]??""]??1,o=i=>{let s=0,a=0;for(let c=i;c<i+4&&c<e;c++)s+=r(c),a++;return a>0?s/a:0};for(let i=0;i+6<=e;i++){let s=0;for(let l=i;l<i+6;l++)r(l)>1&&s++;if(s<4)continue;let a=i,c=i+6;for(;a-4>=0&&o(a-4)>1;)a-=1;for(;c+1<=e&&o(Math.max(0,c-3))>1;)c+=1;if(c=Math.min(c,e),c-a>=5)for(let l=a;l<c;l++)n[l]="helix"}return n}function j0(t){return t!==En?null:Array.from({length:t.length},(e,n)=>n+1>=Jp[0]&&n+1<=Jp[1]?"helix":"coil")}function th(t){let e=j0(t);return e?{structure:e,predicted:!1,highlights:L0}:{structure:V0(t),predicted:!0,highlights:[]}}function nh(t,e,n=37137){let r=le(n),o=[],i=[1,.18,0],s=[0,1,0];_l(i),eh(i,s);let a=-14,c=0,l=0,u=0;for(let d=0;d<t.length;d++){if((e[d]??"coil")==="helix"){u+=100*Math.PI/180;let h=B0(i,s),m=[s[0]*Math.cos(u)+h[0]*Math.sin(u),s[1]*Math.cos(u)+h[1]*Math.sin(u),s[2]*Math.cos(u)+h[2]*Math.sin(u)];a+=i[0]*1.5,c+=i[1]*1.5,l+=i[2]*1.5,o.push([a+m[0]*2.3,c+m[1]*2.3,l+m[2]*2.3]);continue}i[0]+=(r()*2-1)*.55,i[1]+=(r()*2-1)*.55,i[2]+=(r()*2-1)*.55;let p=.045;i[0]-=a*p,i[1]-=c*p,i[2]-=l*p,_l(i),eh(i,s),u=0,a+=i[0]*Zt,c+=i[1]*Zt,l+=i[2]*Zt,o.push([a,c,l])}return H0(o),$0(o),{positions:o}}function H0(t){for(let e=1;e<t.length;e++){let n=t[e-1],r=t[e],o=r[0]-n[0],i=r[1]-n[1],s=r[2]-n[2],a=Math.hypot(o,i,s);if(a<1e-6){r[0]=n[0]+Zt;continue}let c=Zt/a;r[0]=n[0]+o*c,r[1]=n[1]+i*c,r[2]=n[2]+s*c}}function rh(t){let e=[];for(let n=0;n<t;n++)e.push([(n-t/2)*Zt*.92,Math.sin(n*1.9)*1.1,Math.cos(n*1.9)*.7]);return e}function _l(t){let e=Math.hypot(t[0],t[1],t[2])||1;t[0]/=e,t[1]/=e,t[2]/=e}function eh(t,e){let n=t[0]*e[0]+t[1]*e[1]+t[2]*e[2];e[0]-=t[0]*n,e[1]-=t[1]*n,e[2]-=t[2]*n,Math.hypot(e[0],e[1],e[2])<1e-4&&(e[0]=t[1],e[1]=-t[2],e[2]=t[0]),_l(e)}function B0(t,e){return[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]]}function $0(t){let e=0,n=0,r=0;for(let o of t)e+=o[0],n+=o[1],r+=o[2];e/=t.length,n/=t.length,r/=t.length;for(let o of t)o[0]-=e,o[1]-=n,o[2]-=r}var Nl=46,ys=320,dr=.1,U0=En,z0=Sp,bs=[0,-.55,0],Es=class{constructor(e){this.store=e}store;id="translation";label="Translation";scale="10\u207B\u2079 m";get caption(){return this.predicted?"The ribosome reads three bases per amino acid. The chain leaves the exit tunnel and collapses into whatever shape its side chains favour \u2014 here a Chou\u2013Fasman prediction, not a solved structure.":"The ribosome reads three bases per amino acid. The chain leaves the exit tunnel and folds \u2014 here into one amphipathic helix on an otherwise disordered domain, the helix that MDM2 grips."}get detail(){if(!this.predicted)return"60 codons \xB7 helix at residues 17\u201329 \xB7 F19 W23 L26";let e=this.structure.filter(n=>n==="helix").length;return`${this.codons.length} codons \xB7 ${this.peptide.length} aa \xB7 ${e} predicted helical`}ribosome=new Fe(3);chain=new Fe(2);bonds=new _e(6);mrna=new _e(6);chaperones=new ye;backdrop=new ne;model=K();ribosomeWriter=new Ve(new Float32Array(Nl*xe));chainWriter=new Ve(new Float32Array((ir+8)*xe));bondWriter=new Ne(new Float32Array((ir+12)*Ie));mrnaWriter=new Ne(new Float32Array((ir*3+8)*Ie));blobSeeds=[];synthesised=0;peptide="";codons=[];structure=[];highlights=[];predicted=!1;folded=[];extended=[];sequenceVersion=-1;init(e){this.dispose(),this.ribosome.init(e),this.chain.init(e),this.bonds.init(e),this.mrna.init(e),this.chaperones.init(e),this.backdrop.init(e);let n=le(6917);this.blobSeeds.length=0;for(let o=0;o<Nl;o++){let i=o<Nl*.62,s=i?.5:.38;this.blobSeeds.push([(n()*2-1)*s,(i?.16:-.24)+(n()*2-1)*(i?.3:.16),(n()*2-1)*s,(i?.17:.13)+n()*.12,i?0:1])}let r=new Float32Array(ys*Q);for(let o=0;o<ys;o++){let i=o*Q;r[i]=(n()*2-1)*2.4,r[i+1]=(n()*2-1)*2,r[i+2]=(n()*2-1)*2.4,r[i+3]=.012+n()*.02,r[i+4]=.45,r[i+5]=.72,r[i+6]=.95,r[i+7]=n()*120}this.chaperones.upload(r,ys),this.rebuild()}rebuild(){let{coding:e}=this.store.analysis,n=(this.store.isFallback?"":e.peptide).slice(0,ir),r=this.store.isFallback||n.length===0;this.peptide=r?U0:n,this.codons=r?z0:e.codons.slice(0,ir);let o=th(this.peptide);this.structure=o.structure,this.highlights=o.highlights,this.predicted=o.predicted,this.folded=nh(this.peptide,this.structure).positions,this.extended=rh(this.peptide.length),this.sequenceVersion=this.store.version}update(e){this.sequenceVersion!==this.store.version&&this.rebuild();let n=Se(.04,.82,e.local);this.synthesised=n*this.peptide.length,this.buildRibosome(e),this.buildTranscript(e),this.buildChain(e);let r=Math.pow(2,-.1+e.local*.6);ve(this.model,0,.25,-.6+e.local*2.2,e.time*.11+.4,r)}buildRibosome(e){let n=this.ribosomeWriter;n.reset();let r=Math.sin(this.synthesised*Math.PI*2)*.012;for(let[o,i,s,a,c]of this.blobSeeds){let l=c?-r:r;n.push(o+l,i+Math.sin(e.time*1.6+o*8)*.006,s,a,c?[.52,.62,.78]:[.62,.68,.82],.04)}this.ribosome.upload(n.data,n.count)}buildTranscript(e){let n=this.mrnaWriter;n.reset();let r=this.synthesised,o=2.6;for(let i=0;i<this.codons.length;i++){let s=(i-r)*.115;if(s<-o||s>o)continue;let a=this.codons[i],c=s,l=-.42+Math.sin(s*1.4+e.time*.3)*.03;for(let u=0;u<3;u++){let d=a.codon[u],f=Ct[d==="T"?"U":d],p=c+(u-1)*.032,h=1-Dn(Math.abs(s)/o),m=Math.abs(s)<.06?1:0;n.push(p,l,0,p,l,.055,.022,f,.35+m*1.2,h)}}this.mrna.upload(n.data,n.count)}buildChain(e){let n=this.chainWriter,r=this.bondWriter;n.reset(),r.reset();let o=Math.floor(this.synthesised),i=[],s=bs[1]-.95,a=e.time*.35,c=Math.cos(a),l=Math.sin(a);for(let u=0;u<=o&&u<this.peptide.length;u++){let d=this.synthesised-u,f=Se(2,22,d),p=Ye(d,0,16)*Zt*dr*.5,h=this.extended[u],m=[bs[0]+h[1]*dr*.5,bs[1]-p,bs[2]+h[2]*dr*.5],y=this.folded[u],I=y[0]*dr,M=y[1]*dr,D=y[2]*dr,S=[I*c-D*l,s+M,I*l+D*c];i.push([Mt(m[0],S[0],f),Mt(m[1],S[1],f),Mt(m[2],S[2],f)])}for(let u=0;u<i.length;u++){let d=this.peptide[u],f=no[d],p=xp[f?.cls??"special"],[h,m,y]=i[u],I=this.highlights.includes(u),M=this.structure[u]==="helix",D=I?.055:M?.042:.036,S=I?1.1:M?.3:.08;if(n.push(h,m,y,D,p,S),u>0){let[F,U,ie]=i[u-1];r.push(F,U,ie,h,m,y,.016,p,M?.25:.05,1)}}this.chain.upload(n.data,n.count),this.bonds.upload(r.data,r.count)}render(e){let{gl:n}=e;this.backdrop.render(e,{top:[.03,.026,.058],bottom:[.008,.006,.018],glow:[.44,.26,.52],density:.8,glowX:-.26,glowY:.24}),this.mrna.draw(e,this.model,e.alpha,{roughness:.35,translucency:.4}),this.bonds.draw(e,this.model,e.alpha,{roughness:.4,translucency:.3}),this.chain.draw(e,this.model,e.alpha,{roughness:.28,translucency:.4}),n.depthMask(!1),this.ribosome.draw(e,this.model,e.alpha*.4,{roughness:.6,translucency:.85}),n.depthMask(!0),this.chaperones.draw(e,this.model,e.alpha*.4,{drift:.3,swirl:.7},Math.round(ys*e.quality))}focus(e){return{distance:6.1-e.local*.8,aperture:5.5}}dispose(){this.ribosome.dispose(),this.chain.dispose(),this.bonds.dispose(),this.mrna.dispose(),this.chaperones.dispose(),this.backdrop.dispose()}};function oh(t){return[new hs,new ns,new ps,new os,new as(t),new es(t),new vs(t),new Es(t),new us]}var ih=new Set(["helix","basepairs","transcription","translation"]);var G0=t=>[t];function q0(t,e){if(t&1&&(E(0,"p",6),w(1),b()),t&2){let n=V(2);v(),z(" ",n.detail()," ")}}function W0(t,e){if(t&1&&(E(0,"div",0)(1,"div",1)(2,"span",2),w(3),b(),E(4,"h2",3),w(5),b(),E(6,"span",4),w(7),b()(),E(8,"p",5),w(9),b(),ae(10,q0,2,1,"p",6),b()),t&2){let n=V();v(3),z(" ",n.indexLabel()," "),v(2),z(" ",n.title()," "),v(2),z(" ",n.scale()," "),v(2),z(" ",n.caption()," "),v(),ce(n.detail()?10:-1)}}var ws=class t{stageId=G.required();indexLabel=G.required();title=G.required();scale=G.required();caption=G.required();detail=G(void 0);static \u0275fac=function(n){return new(n||t)};static \u0275cmp=Le({type:t,selectors:[["dna-caption"]],hostAttrs:[1,"scrim-bottom","pointer-events-none","fixed","bottom-0","left-0","z-20","w-full","max-w-[34rem]","p-5","pt-16","md:pl-28","lg:pl-36","lg:pb-8"],inputs:{stageId:[1,"stageId"],indexLabel:[1,"indexLabel"],title:[1,"title"],scale:[1,"scale"],caption:[1,"caption"],detail:[1,"detail"]},decls:2,vars:2,consts:[[1,"animate-fade-up"],[1,"flex","items-baseline","gap-3"],[1,"font-mono","text-[10px]","tabular-nums","text-primary/80"],[1,"text-lg","font-medium","tracking-tight","text-foreground","md:text-xl"],[1,"font-mono","text-[10px]","tabular-nums","text-muted-foreground"],[1,"mt-2","max-w-prose","text-sm","leading-relaxed","text-muted-foreground"],[1,"mt-2","font-mono","text-[10px]","uppercase","tracking-[0.16em]","text-muted-foreground/60"]],template:function(n,r){n&1&&Te(0,W0,11,5,"div",0,rl),n&2&&Ce(sl(0,G0,r.stageId()))},encapsulation:2,changeDetection:0})};function Y0(t,e){if(t&1&&(E(0,"span"),w(1),b()),t&2){let n=e.$implicit,r=V(2);st("color",r.colorFor(n)),v(),ge(n)}}function Z0(t,e){if(t&1&&(E(0,"div",0)(1,"div",3),w(2),b(),E(3,"div",4),Te(4,Y0,2,3,"span",5,Kn),b()()),t&2){let n=V();v(2),ge(n.sequenceLabel()),v(2),Ce(n.window())}}function Q0(t,e){if(t&1&&(E(0,"span",2),w(1),b()),t&2){let n=V();v(),z("q",(n.quality()*100).toFixed(0))}}var X0={A:"var(--base-a)",T:"var(--base-t)",G:"var(--base-g)",C:"var(--base-c)",U:"var(--base-u)"},Is=class t{fps=G.required();quality=G.required();progress=G.required();renderScale=G(1);showSequence=G(!1);sequenceLabel=G("TP53 \xB7 coding sequence");sequenceStart=G(0);sequence=G("");depthLabel=oe(()=>`${(this.progress()*100).toFixed(0)}% depth`);window=oe(()=>{let e=this.sequence();if(e.length===0)return[];let n=Math.min(30,e.length),r=Math.max(0,Math.min(this.sequenceStart(),e.length-n));return e.slice(r,r+n).split("")});colorFor(e){let n=X0[e];return n?`hsl(${n})`:`rgb(${Ct[e].map(o=>Math.round(o*255)).join(",")})`}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=Le({type:t,selectors:[["dna-hud"]],hostAttrs:[1,"scrim-bottom","pointer-events-none","fixed","bottom-0","right-0","z-20","hidden","p-5","pt-16","text-right","md:block","lg:pb-8"],inputs:{fps:[1,"fps"],quality:[1,"quality"],progress:[1,"progress"],renderScale:[1,"renderScale"],showSequence:[1,"showSequence"],sequenceLabel:[1,"sequenceLabel"],sequenceStart:[1,"sequenceStart"],sequence:[1,"sequence"]},decls:11,vars:7,consts:[[1,"mb-3","panel","px-3","py-2","text-left","animate-fade-in"],[1,"flex","items-center","justify-end","gap-4","font-mono","text-[10px]","tabular-nums","text-muted-foreground/70"],[1,"text-muted-foreground/40"],[1,"mono-label","mb-1.5"],[1,"font-mono","text-[11px]","leading-none","tracking-[0.08em]"],[3,"color"]],template:function(n,r){n&1&&(ae(0,Z0,6,1,"div",0),E(1,"div",1)(2,"span"),w(3),b(),E(4,"span",2),w(5,"\xB7"),b(),E(6,"span"),w(7),b(),E(8,"span",2),w(9),b(),ae(10,Q0,2,1,"span",2),b()),n&2&&(ce(r.showSequence()?0:-1),v(3),ge(r.depthLabel()),v(3),we("text-primary",r.fps()>=50),v(),z("",r.fps().toFixed(0)," fps"),v(2),z("",r.renderScale().toFixed(2),"\xD7"),v(),ce(r.quality()<.98?10:-1))},encapsulation:2,changeDetection:0})};var Ds=class t{dismissed=G.required();static \u0275fac=function(n){return new(n||t)};static \u0275cmp=Le({type:t,selectors:[["dna-intro"]],hostAttrs:[1,"pointer-events-none","fixed","inset-0","z-30","flex","items-center","justify-center"],hostVars:4,hostBindings:function(n,r){n&2&&(st("transition","opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)"),we("opacity-0",r.dismissed()))},inputs:{dismissed:[1,"dismissed"]},decls:13,vars:0,consts:[["aria-hidden","true",1,"absolute","inset-0","scrim-center"],[1,"relative","px-6","text-center"],[1,"mono-label","animate-fade-in"],[1,"mt-4","text-5xl","font-light","tracking-[-0.03em]","text-foreground","md:text-7xl"],[1,"mx-auto","mt-4","max-w-md","text-sm","leading-relaxed","text-muted-foreground"],[1,"mt-10","flex","flex-col","items-center","gap-2"],[1,"mono-label"],[1,"relative","block","h-6","w-px","overflow-hidden","bg-border/50"],[1,"absolute","inset-x-0","top-0","h-2","animate-scroll-hint","bg-primary"]],template:function(n,r){n&1&&(Dt(0,"div",0),E(1,"div",1)(2,"p",2),w(3,"Angular 21 \xB7 WebGL2 \xB7 no 3D engine"),b(),E(4,"h1",3),w(5," Scale "),b(),E(6,"p",4),w(7," A continuous descent from living tissue to the double helix, and back out to the network a single gene holds together. "),b(),E(8,"div",5)(9,"span",6),w(10,"Scroll to descend"),b(),E(11,"span",7),Dt(12,"span",8),b()()())},encapsulation:2,changeDetection:0})};var K0=(t,e)=>e.id;function J0(t,e){if(t&1){let n=Gt();E(0,"button",2),Tt("click",function(){let o=ke(n).$index,i=V();return Oe(i.select.emit(o))}),Dt(1,"span",3),E(2,"span",4)(3,"span",5),w(4),b(),E(5,"span",6),w(6),b()()()}if(t&2){let n=e.$implicit,r=e.$index,o=V();we("opacity-100",r===o.active())("opacity-45",r!==o.active()),Li("aria-current",r===o.active()?"true":null),v(),we("w-8",r===o.active())("w-4",r!==o.active())("bg-primary",r===o.active())("bg-border",r!==o.active()),v(2),we("text-primary",r===o.active())("text-muted-foreground",r!==o.active()),v(),ge(n.label),v(),we("opacity-100",r===o.active())("opacity-0",r!==o.active()),v(),ge(n.scale)}}var Ts=class t{items=G.required();active=G.required();select=rr();static \u0275fac=function(n){return new(n||t)};static \u0275cmp=Le({type:t,selectors:[["dna-scale-rail"]],hostAttrs:[1,"pointer-events-none","fixed","left-0","top-1/2","z-20","hidden","-translate-y-1/2","pl-5","md:block","lg:pl-8"],inputs:{items:[1,"items"],active:[1,"active"]},outputs:{select:"select"},decls:3,vars:0,consts:[["aria-label","Biological scales",1,"pointer-events-auto","flex","flex-col","gap-px"],["type","button",1,"group","flex","items-center","gap-3","py-1.5","text-left","transition-opacity","duration-300",3,"opacity-100","opacity-45"],["type","button",1,"group","flex","items-center","gap-3","py-1.5","text-left","transition-opacity","duration-300",3,"click"],[1,"h-px","transition-all","duration-500","ease-out"],[1,"flex","flex-col","leading-tight"],[1,"font-mono","text-[10px]","uppercase","tracking-[0.18em]","transition-colors","duration-300"],[1,"font-mono","text-[9px]","tabular-nums","text-muted-foreground/60","transition-opacity","duration-300"]],template:function(n,r){n&1&&(E(0,"nav",0),Te(1,J0,7,23,"button",1,K0),b()),n&2&&(v(),Ce(r.items()))},encapsulation:2,changeDetection:0})};var eE=["input"],tE=(t,e)=>e.id,nE=(t,e)=>e.start;function rE(t,e){if(t&1&&(E(0,"span",11),w(1,"\xB7"),b(),E(2,"span"),w(3),b()),t&2){let n=V();v(3),z("Tm \u2248 ",n.analysis().meltingTemp.toFixed(0),"\xB0C")}}function oE(t,e){t&1&&(E(0,"p",12),w(1),b()),t&2&&(v(),ge(e))}function iE(t,e){if(t&1){let n=Gt();E(0,"button",19),Tt("click",function(){let o=ke(n).$implicit,i=V();return Oe(i.preset.emit(o.id))}),w(1),b()}if(t&2){let n=e.$implicit;v(),z(" ",n.label," ")}}function sE(t,e){if(t&1&&(E(0,"span"),w(1),b()),t&2){let n=e.$implicit,r=V(2);st("color",r.baseColor(n)),v(),ge(n)}}function aE(t,e){if(t&1&&(E(0,"section")(1,"p",20),w(2),b(),E(3,"p",21),Te(4,sE,2,3,"span",22,Kn),b()()),t&2){let n=V();v(2),z("First ",n.strip().length," bases"),v(2),Ce(n.strip())}}function cE(t,e){t&1&&(E(0,"p",17),w(1," No ORF of ten codons or more. The scales read frame 1 from the start instead. "),b())}function lE(t,e){t&1&&(E(0,"span",27),w(1,"\xB7no stop"),b())}function uE(t,e){if(t&1&&(E(0,"li",26)(1,"span"),w(2),b(),E(3,"span"),w(4),ae(5,lE,2,0,"span",27),b()()),t&2){let n=e.$implicit,r=e.$index;ol(r===0?"border-primary/60 text-primary":"border-border/40 text-muted-foreground"),v(2),ji("frame ",n.frame+1," \xB7 ",n.start+1,"\u2013",n.end),v(2),z(" ",n.peptide.length," aa "),v(),ce(n.terminated?-1:5)}}function dE(t,e){if(t&1&&(E(0,"p",25),w(1),b()),t&2){let n=V(2);v(),z(" +",n.analysis().orfs.length-n.visibleOrfs().length," shorter ")}}function fE(t,e){if(t&1&&(E(0,"ul",23),Te(1,uE,6,7,"li",24,nE),b(),ae(3,dE,2,1,"p",25)),t&2){let n=V();v(),Ce(n.visibleOrfs()),v(2),ce(n.analysis().orfs.length>n.visibleOrfs().length?3:-1)}}function pE(t,e){t&1&&(E(0,"span",27),w(1,"(frame 1)"),b())}function hE(t,e){if(t&1&&(E(0,"span",29),w(1),b()),t&2){let n=e.$implicit,r=V(2);st("color",r.residueColor(n)),Fi("title",r.residueName(n)),v(),ge(n)}}function mE(t,e){if(t&1&&(E(0,"section")(1,"p",20),w(2),ae(3,pE,2,0,"span",27),b(),E(4,"p",21),Te(5,hE,2,4,"span",28,Kn),b()()),t&2){let n=V();v(2),z(" Peptide \xB7 ",n.peptide().length," aa "),v(),ce(n.analysis().coding.fromOrf?-1:3),v(2),Ce(n.peptide())}}function gE(t,e){if(t&1){let n=Gt();E(0,"section")(1,"div",15)(2,"p",3),w(3,"Reverse complement 5'\u21923'"),b(),E(4,"button",30),Tt("click",function(){ke(n);let o=V();return Oe(o.copyReverseComplement())}),w(5),b()(),E(6,"p",31),w(7),b()()}if(t&2){let n=V();v(5),z(" ",n.copied()?"copied":"copy"," "),v(2),z(" ",n.analysis().reverseComplement," ")}}var vE={A:"var(--base-a)",T:"var(--base-t)",G:"var(--base-g)",C:"var(--base-c)",U:"var(--base-u)"},yE={hydrophobic:"var(--res-hydrophobic)",polar:"var(--res-polar)",positive:"var(--res-positive)",negative:"var(--res-negative)",special:"var(--res-special)"},bE=90,Cs=class t{open=G.required();raw=G.required();analysis=G.required();textarea=$i("input");syncTextarea=ni(()=>{let e=this.raw(),n=this.textarea()?.nativeElement;n&&n.value!==e&&(n.value=e)});changed=rr();closed=rr();preset=rr();presets=[{id:"default",label:"p53"},{id:"random",label:"Random"},{id:"clear",label:"Clear"}];gcPercent=oe(()=>(this.analysis().gcFraction*100).toFixed(0));peptide=oe(()=>this.analysis().coding.peptide.split(""));strip=oe(()=>this.analysis().dna.slice(0,bE).split(""));visibleOrfs=oe(()=>this.analysis().orfs.slice(0,4));notice=oe(()=>{let{rejected:e,truncated:n,length:r}=this.analysis();return r===0?"Empty \u2014 the scales are showing the default p53 sequence.":n?"Longer than 600 bases; the rest was trimmed.":e>0?`${e} non-nucleotide character${e===1?"":"s"} ignored.`:null});copied=he(!1);copiedTimer=null;debounceTimer=null;onInput(e){let n=e.target.value;this.debounceTimer&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.changed.emit(n),220)}async copyReverseComplement(){try{await navigator.clipboard.writeText(this.analysis().reverseComplement),this.copied.set(!0),this.copiedTimer&&clearTimeout(this.copiedTimer),this.copiedTimer=setTimeout(()=>this.copied.set(!1),1400)}catch{}}baseColor(e){return`hsl(${vE[e]??"var(--foreground)"})`}residueColor(e){let n=no[e]?.cls??"special";return`hsl(${yE[n]})`}residueName(e){let n=no[e];return n?`${n.name} (${n.abbr}) \xB7 ${n.cls}`:e}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=Le({type:t,selectors:[["dna-sequence-panel"]],viewQuery:function(n,r){n&1&&tr(r.textarea,eE,5),n&2&&Wr()},hostAttrs:[1,"pointer-events-none","fixed","inset-y-0","right-0","z-30","flex","w-full","max-w-[26rem]","flex-col","p-4","lg:p-5"],hostVars:2,hostBindings:function(n,r){n&2&&we("hidden",!r.open())},inputs:{open:[1,"open"],raw:[1,"raw"],analysis:[1,"analysis"]},outputs:{changed:"changed",closed:"closed",preset:"preset"},decls:39,vars:9,consts:[["input",""],["role","dialog","aria-label","Sequence editor",1,"panel","pointer-events-auto","flex","min-h-0","flex-col","overflow-hidden"],[1,"flex","items-center","justify-between","border-b","border-border/40","px-4","py-3"],[1,"mono-label"],[1,"mt-0.5","text-[11px]","text-muted-foreground/70"],["type","button","aria-label","Close sequence editor",1,"rounded","px-2","py-1","text-muted-foreground","transition-colors","hover:text-primary",3,"click"],["viewBox","0 0 24 24","width","16","height","16","fill","none","stroke","currentColor","stroke-width","2"],["d","M6 6l12 12M18 6L6 18"],[1,"flex","min-h-0","flex-1","flex-col","gap-4","overflow-y-auto","overscroll-contain","px-4","py-4"],["spellcheck","false","autocomplete","off","placeholder","Paste DNA or RNA \u2014 FASTA headers and whitespace are ignored","aria-label","DNA sequence",1,"h-24","w-full","resize-none","rounded-md","border","border-border/45","bg-background/60","p-2.5","font-mono","text-[11px]","leading-relaxed","tracking-[0.06em]","text-foreground","outline-none","transition-colors","focus:border-primary/60",3,"input"],[1,"mt-2","flex","flex-wrap","items-center","gap-x-3","gap-y-1","font-mono","text-[10px]","tabular-nums","text-muted-foreground"],[1,"text-muted-foreground/40"],[1,"mt-2","text-[11px]","leading-relaxed","text-primary/80"],[1,"flex","gap-2"],["type","button",1,"flex-1","rounded-md","border","border-border/45","px-2","py-1.5","font-mono","text-[10px]","uppercase","tracking-[0.14em]","text-muted-foreground","transition-colors","hover:border-primary/50","hover:text-primary"],[1,"mb-1.5","flex","items-baseline","justify-between"],[1,"font-mono","text-[10px]","tabular-nums","text-muted-foreground/60"],[1,"text-[11px]","leading-relaxed","text-muted-foreground"],[1,"border-t","border-border/30","pt-3","text-[10px]","leading-relaxed","text-muted-foreground/60"],["type","button",1,"flex-1","rounded-md","border","border-border/45","px-2","py-1.5","font-mono","text-[10px]","uppercase","tracking-[0.14em]","text-muted-foreground","transition-colors","hover:border-primary/50","hover:text-primary",3,"click"],[1,"mono-label","mb-1.5"],[1,"break-all","font-mono","text-[11px]","leading-[1.5]","tracking-[0.09em]"],[3,"color"],[1,"flex","flex-col","gap-1"],[1,"flex","items-center","justify-between","rounded","border","px-2","py-1","font-mono","text-[10px]","tabular-nums","transition-colors",3,"class"],[1,"mt-1","font-mono","text-[10px]","text-muted-foreground/50"],[1,"flex","items-center","justify-between","rounded","border","px-2","py-1","font-mono","text-[10px]","tabular-nums","transition-colors"],[1,"text-muted-foreground/50"],[3,"color","title"],[3,"title"],["type","button",1,"font-mono","text-[10px]","uppercase","tracking-[0.14em]","text-muted-foreground","transition-colors","hover:text-primary",3,"click"],[1,"max-h-20","overflow-y-auto","overscroll-contain","break-all","font-mono","text-[11px]","leading-[1.5]","tracking-[0.09em]","text-muted-foreground"]],template:function(n,r){if(n&1&&(E(0,"div",1)(1,"header",2)(2,"div")(3,"p",3),w(4,"Sequence"),b(),E(5,"p",4),w(6," Drives four of the nine scales "),b()(),E(7,"button",5),Tt("click",function(){return r.closed.emit()}),Qo(),E(8,"svg",6),Dt(9,"path",7),b()()(),Xo(),E(10,"div",8)(11,"div")(12,"textarea",9,0),Tt("input",function(i){return r.onInput(i)}),b(),E(14,"div",10)(15,"span"),w(16),b(),E(17,"span",11),w(18,"\xB7"),b(),E(19,"span"),w(20),b(),ae(21,rE,4,1),b(),ae(22,oE,2,1,"p",12),b(),E(23,"div",13),Te(24,iE,2,1,"button",14,tE),b(),ae(26,aE,6,1,"section"),E(27,"section")(28,"div",15)(29,"p",3),w(30,"Open reading frames"),b(),E(31,"span",16),w(32),b()(),ae(33,cE,2,0,"p",17)(34,fE,4,1),b(),ae(35,mE,7,2,"section"),ae(36,gE,8,2,"section"),E(37,"p",18),w(38," Tm is the textbook approximation (Wallace below 14 nt, GC formula above) and ignores salt and strand concentration. Secondary structure for a custom peptide is a Chou\u2013Fasman prediction, not a solved structure. "),b()()()),n&2){let o;v(16),z("",r.analysis().length," nt"),v(4),z("",r.gcPercent(),"% GC"),v(),ce(r.analysis().meltingTemp!==null?21:-1),v(),ce((o=r.notice())?22:-1,o),v(2),Ce(r.presets),v(2),ce(r.strip().length?26:-1),v(6),z(" ",r.analysis().orfs.length," "),v(),ce(r.analysis().orfs.length===0?33:34),v(2),ce(r.peptide().length?35:-1),v(),ce(r.analysis().reverseComplement.length?36:-1)}},encapsulation:2,changeDetection:0})};var EE=["canvas"],wE=(t,e)=>e.id;function IE(t,e){t&1&&(se(0,"div",1)(1,"div",2)(2,"h1",3),w(3,"WebGL2 unavailable"),de(),se(4,"p",4),w(5),de(),se(6,"p",5),w(7," Try a current Chrome, Edge, Firefox or Safari with hardware acceleration on. "),de()()()),t&2&&(v(5),ge(e))}function DE(t,e){if(t&1&&(se(0,"li")(1,"h2"),w(2),de(),se(3,"p"),w(4),de()()),t&2){let n=e.$implicit;v(2),Vi("",n.label," (",n.scale,")"),v(2),ge(n.caption)}}function TE(t,e){if(t&1){let n=Gt();Jn(0,"canvas",6,0)(2,"div",7),se(3,"header",8)(4,"div")(5,"p",9),w(6,"Scale"),de(),se(7,"p",10),w(8,"A descent into DNA"),de()(),se(9,"div",11)(10,"button",12),er("click",function(){ke(n);let o=V();return Oe(o.togglePanel())}),w(11," Sequence "),de(),se(12,"a",13),w(13,"Source"),de()()(),se(14,"dna-scale-rail",14),er("select",function(o){ke(n);let i=V();return Oe(i.goToStage(o))}),de(),Jn(15,"dna-caption",15)(16,"dna-hud",16),se(17,"dna-sequence-panel",17),er("changed",function(o){ke(n);let i=V();return Oe(i.onSequenceChanged(o))})("preset",function(o){ke(n);let i=V();return Oe(i.onSequencePreset(o))})("closed",function(){ke(n);let o=V();return Oe(o.panelOpen.set(!1))}),de(),Jn(18,"dna-intro",18),se(19,"div",19)(20,"h1"),w(21,"Scale \u2014 a descent into DNA"),de(),se(22,"ol"),Te(23,DE,5,3,"li",null,wE),de()()}if(t&2){let n=V();v(2),st("height",n.trackHeight(),"vh"),v(8),we("text-primary",n.panelOpen()),v(4),zt("items",n.railItems)("active",n.stageIndex()),v(),zt("stageId",n.current().id)("indexLabel",n.indexLabel())("title",n.current().label)("scale",n.current().scale)("caption",n.current().caption)("detail",n.current().detail),v(),zt("fps",n.fps())("quality",n.quality())("progress",n.progress())("renderScale",n.renderScale())("showSequence",n.showSequence())("sequenceStart",n.sequenceStart())("sequence",n.renderedSequence()),v(),zt("open",n.panelOpen())("raw",n.rawSequence())("analysis",n.analysis()),v(),zt("dismissed",n.introDismissed()),v(5),Ce(n.stages)}}var Ms=class t{canvasRef=$i("canvas");sequence=new Yi;stages=oh(this.sequence);railItems=this.stages.map(({id:e,label:n,scale:r})=>({id:e,label:n,scale:r}));stageIndex=he(0);progress=he(0);fps=he(60);quality=he(1);renderScale=he(1);introDismissed=he(!1);panelOpen=he(!1);sequenceVersion=he(0);fatal=he(null);current=oe(()=>(this.sequenceVersion(),this.stages[this.stageIndex()]??this.stages[0]));analysis=oe(()=>(this.sequenceVersion(),this.sequence.analysis));rawSequence=oe(()=>(this.sequenceVersion(),this.sequence.raw));renderedSequence=oe(()=>(this.sequenceVersion(),this.sequence.renderDna));indexLabel=oe(()=>`${String(this.stageIndex()+1).padStart(2,"0")} / ${String(this.stages.length).padStart(2,"0")}`);trackHeight=oe(()=>(this.stages.length+1)*100);showSequence=oe(()=>ih.has(this.current().id));sequenceStart=oe(()=>{let e=this.progress()*this.stages.length-this.stageIndex();return Math.round(e*60)});renderer=null;resizeObserver=null;lastPublishedProgress=-1;ngAfterViewInit(){let e=this.canvasRef()?.nativeElement;if(!e)return;try{this.renderer=new Xi(e,this.stages,{onStageChange:r=>this.stageIndex.set(r),onProgress:r=>{Math.abs(r-this.lastPublishedProgress)<8e-4||(this.lastPublishedProgress=r,this.progress.set(r))},onStats:(r,o,i)=>{this.fps.set(r),this.quality.set(o),this.renderScale.set(i)}})}catch(r){this.fatal.set(r instanceof Error?r.message:String(r));return}this.syncSize(),this.resizeObserver=new ResizeObserver(()=>this.syncSize()),this.resizeObserver.observe(document.documentElement),window.addEventListener("scroll",this.handleScroll,{passive:!0}),window.addEventListener("pointermove",this.handlePointerMove,{passive:!0}),window.addEventListener("hashchange",this.handleHashChange),this.applyDeepLink();let n=this.scrollRange();this.renderer.snapProgress(n>0?window.scrollY/n:0),this.renderer.start()}ngOnDestroy(){window.removeEventListener("scroll",this.handleScroll),window.removeEventListener("pointermove",this.handlePointerMove),window.removeEventListener("hashchange",this.handleHashChange),this.resizeObserver?.disconnect(),this.renderer?.dispose(),this.renderer=null}togglePanel(){this.panelOpen.update(e=>!e),this.panelOpen()&&this.introDismissed.set(!0)}onSequenceChanged(e){this.sequence.set(e),this.sequenceVersion.update(n=>n+1)}onSequencePreset(e){e==="default"?this.sequence.reset():e==="random"?this.sequence.randomise():this.sequence.set(""),this.sequenceVersion.update(n=>n+1)}goToStage(e){let n=this.scrollRange();if(n<=0)return;let r=(e+.34)/this.stages.length*n;window.scrollTo({top:r,behavior:this.prefersReducedMotion()?"auto":"smooth"})}scrollRange(){return document.documentElement.scrollHeight-window.innerHeight}prefersReducedMotion(){return window.matchMedia("(prefers-reduced-motion: reduce)").matches}handleScroll=()=>{let e=this.scrollRange(),n=e>0?window.scrollY/e:0;this.renderer?.setProgress(n),window.scrollY>40&&!this.introDismissed()&&this.introDismissed.set(!0)};handlePointerMove=e=>{this.renderer?.setPointer(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight*2-1))};handleHashChange=()=>{this.applyDeepLink()};applyDeepLink(){let e=window.location.hash.replace("#","");if(!e)return;let n=this.stages.findIndex(o=>o.id===e);if(n<0)return;this.introDismissed.set(!0);let r=this.scrollRange();window.scrollTo({top:(n+.34)/this.stages.length*r,behavior:"auto"})}syncSize(){this.renderer?.resize(window.innerWidth,window.innerHeight,window.devicePixelRatio||1)}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=Le({type:t,selectors:[["dna-root"]],viewQuery:function(n,r){n&1&&tr(r.canvasRef,EE,5),n&2&&Wr()},decls:2,vars:1,consts:[["canvas",""],[1,"fixed","inset-0","z-40","flex","items-center","justify-center","bg-background","p-6"],[1,"panel","max-w-md","p-6","text-center"],[1,"text-lg","font-medium"],[1,"mt-3","text-sm","leading-relaxed","text-muted-foreground"],[1,"mt-4","font-mono","text-[10px]","uppercase","tracking-[0.18em]","text-muted-foreground/60"],["aria-hidden","true",1,"fixed","inset-0","h-full","w-full"],["aria-hidden","true"],[1,"scrim-top","pointer-events-none","fixed","left-0","top-0","z-20","flex","w-full","items-start","justify-between","p-5","pb-16","lg:p-8","lg:pb-20"],[1,"font-mono","text-[11px]","uppercase","tracking-[0.3em]","text-foreground/80"],[1,"mono-label","mt-1"],[1,"flex","items-center","gap-4"],["type","button",1,"pointer-events-auto","mono-label","transition-colors","hover:text-primary",3,"click"],["href","https://github.com/YuraTadevosyan/three-js-and-animations","target","_blank","rel","noopener noreferrer",1,"pointer-events-auto","mono-label","transition-colors","hover:text-primary"],[3,"select","items","active"],[3,"stageId","indexLabel","title","scale","caption","detail"],[3,"fps","quality","progress","renderScale","showSequence","sequenceStart","sequence"],[3,"changed","preset","closed","open","raw","analysis"],[3,"dismissed"],[1,"sr-only"]],template:function(n,r){if(n&1&&ae(0,IE,8,1,"div",1)(1,TE,25,23),n&2){let o;ce((o=r.fatal())?0:1,o)}},dependencies:[Ts,ws,Is,Ds,Cs],encapsulation:2,changeDetection:0})};El(Ms,{providers:[al(),Za()]}).catch(t=>{console.error(t)});
