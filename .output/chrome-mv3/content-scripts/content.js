var content=(function(){"use strict";var fe=Object.defineProperty;var ge=(x,S,v)=>S in x?fe(x,S,{enumerable:!0,configurable:!0,writable:!0,value:v}):x[S]=v;var c=(x,S,v)=>ge(x,typeof S!="symbol"?S+"":S,v);var j,z;function x(a){return a}class S{constructor(){c(this,"adapters",new Map)}register(e){if(!e.id||typeof e.id!="string")throw new Error("[ClearFrame] Invalid adapter: missing id");if(!e.name||typeof e.name!="string")throw new Error(`[ClearFrame] Invalid adapter ${e.id}: missing name`);if(!Array.isArray(e.matches)||e.matches.length===0)throw new Error(`[ClearFrame] Invalid adapter ${e.id}: matches must be a non-empty array`);this.adapters.has(e.id)&&console.warn(`[ClearFrame] Overwriting adapter for site: ${e.id}`),this.adapters.set(e.id,e)}get(e){return this.adapters.get(e)}getAll(){return Array.from(this.adapters.values())}matchByHostname(e){if(!e||typeof e!="string")return;const i=e.toLowerCase().trim();for(const t of this.adapters.values())for(const r of t.matches){const n=r.toLowerCase().trim();if(i===n)return t;let s=n;if(s.startsWith("*.")?s=s.slice(2):s.startsWith(".")&&(s=s.slice(1)),i===s||i.endsWith("."+s))return t}}matchByUrl(e){try{const i=new URL(e);return this.matchByHostname(i.hostname)}catch{return}}}const v=new S,y="clearframe_settings",q=1;function A(a,e){const i={};let t={};if(a&&typeof a=="object"&&!Array.isArray(a)){const r=a;typeof r.version=="number"&&r.sites&&typeof r.sites=="object"&&!Array.isArray(r.sites)?t=r.sites:t=r}for(const r of e){const n=t[r.id]&&typeof t[r.id]=="object"&&!Array.isArray(t[r.id])?t[r.id]:{},s={};for(const o of r.rules)typeof n[o.id]=="boolean"?s[o.id]=n[o.id]:s[o.id]=o.defaultEnabled;i[r.id]=s}return i}function _(a){if(!a||typeof a!="object"||Array.isArray(a))return[];const e=a;return(Array.isArray(e.customRules)?e.customRules:[]).filter(t=>typeof t=="object"&&t!==null).filter(t=>typeof t.id=="string"&&typeof t.selector=="string"&&typeof t.hostname=="string").map(t=>({id:String(t.id),name:typeof t.name=="string"?t.name:"Custom Rule",hostname:String(t.hostname).toLowerCase(),selector:String(t.selector),enabled:typeof t.enabled=="boolean"?t.enabled:!0,createdAt:typeof t.createdAt=="number"?t.createdAt:Date.now(),strategy:"hide",targetMode:t.targetMode==="single"?"single":"all",version:typeof t.version=="number"?t.version:1}))}function $(a,e=[]){return{version:q,sites:a,customRules:e}}function G(a){return A({},a)}class V{async get(e){var i;if(typeof chrome<"u"&&((i=chrome.storage)!=null&&i.local))return(await chrome.storage.local.get(e))[e];if(typeof localStorage<"u"){const t=localStorage.getItem(e);try{return t?JSON.parse(t):void 0}catch{return}}}async set(e,i){var t;if(typeof chrome<"u"&&((t=chrome.storage)!=null&&t.local)){await chrome.storage.local.set({[e]:i});return}typeof localStorage<"u"&&localStorage.setItem(e,JSON.stringify(i))}onChange(e){var i;if(typeof chrome<"u"&&((i=chrome.storage)!=null&&i.onChanged)){const t=(r,n)=>{n==="local"&&r[y]&&e(r[y].newValue)};return chrome.storage.onChanged.addListener(t),()=>chrome.storage.onChanged.removeListener(t)}if(typeof window<"u"){const t=r=>{if(r.key===y)try{e(r.newValue?JSON.parse(r.newValue):void 0)}catch{e(void 0)}};return window.addEventListener("storage",t),()=>window.removeEventListener("storage",t)}return()=>{}}}const w=new V;class W{constructor(){c(this,"queue",Promise.resolve())}async run(e){const i=this.queue.then(()=>e(),()=>e());return this.queue=i.catch(()=>{}),i}}const I=new W;async function Y(a,e=w){try{const i=await e.get(y);return A(i,a)}catch(i){return console.warn("[ClearFrame] Failed to read storage, fallback to defaults:",i),G(a)}}async function X(a=w){try{const e=await a.get(y);return _(e)}catch(e){return console.warn("[ClearFrame] Failed to read custom rules:",e),[]}}async function D(a,e=w){const i=await X(e),t=a.toLowerCase();return i.filter(r=>{const n=r.hostname.toLowerCase();return t===n||t.endsWith(`.${n}`)||n.endsWith(`.${t}`)})}async function B(a,e=w,i=[]){return I.run(async()=>{const t=await e.get(y),r=A(t,i),n=_(t),s=n.findIndex(u=>u.id===a.id);let o;s>=0?(o=[...n],o[s]={...a}):o=[...n,{...a}];const h=$(r,o);return await e.set(y,h),o})}async function J(a,e=w,i=[]){return I.run(async()=>{const t=await e.get(y),r=A(t,i),s=_(t).filter(h=>h.id!==a),o=$(r,s);return await e.set(y,o),s})}async function Q(a,e,i=w,t=[]){return I.run(async()=>{const r=await i.get(y),n=A(r,t),o=_(r).map(u=>u.id===a?{...u,enabled:e}:u),h=$(n,o);return await i.set(y,h),o})}const O="clearframe-rule-",U="clearframe-custom-";class Z{constructor(e,i={document:window.document}){c(this,"activeCleanups",new Map);c(this,"activeStyleElements",new Map);c(this,"activeCustomStyles",new Map);c(this,"observer",null);c(this,"isObserving",!1);c(this,"currentSettings",{});c(this,"customRules",[]);c(this,"currentUrl",null);c(this,"adapter");c(this,"doc");var t;this.adapter=e,this.doc=i.document;try{this.currentUrl=typeof window<"u"&&((t=window.location)!=null&&t.href)?new URL(window.location.href):null}catch{this.currentUrl=null}}setCurrentUrl(e){try{this.currentUrl=typeof e=="string"?new URL(e):e}catch{this.currentUrl=null}}isRuleApplicableOnRoute(e){return this.currentUrl&&e.isApplicable?e.isApplicable(this.currentUrl):!0}applySettings(e,i,t){this.currentSettings={...e},i&&this.setCurrentUrl(i),t!==void 0&&this.applyCustomRules(t);for(const r of this.adapter.rules){const n=e[r.id]??r.defaultEnabled,s=this.isRuleApplicableOnRoute(r),o=n&&s;if((r.selectors&&r.selectors.length>0||!!r.customCss)&&(o?this.applyCssRule(r.id,r.selectors||[],r.customCss):this.removeCssRule(r.id)),r.apply){const u=this.activeCleanups.has(r.id);if(o&&!u)try{const d=r.apply(this.doc);typeof d=="function"&&this.activeCleanups.set(r.id,d)}catch(d){console.error(`[ClearFrame] Error applying rule ${r.id}:`,d)}else if(!o&&u){const d=this.activeCleanups.get(r.id);if(this.activeCleanups.delete(r.id),d)try{d()}catch(E){console.error(`[ClearFrame] Error cleaning up rule ${r.id}:`,E)}}}}this.ensureObserver()}applyCustomRules(e){this.customRules=[...e],new Set(e.map(i=>i.id));for(const[i]of this.activeCustomStyles.entries()){const t=e.find(r=>r.id===i);(!t||!t.enabled)&&this.removeCustomCssRule(i)}for(const i of e)i.enabled&&i.selector?this.applyCustomCssRule(i):this.removeCustomCssRule(i.id)}applyCustomCssRule(e){const i=`${U}${e.id}`;let t=this.activeCustomStyles.get(e.id);if(!t||!this.doc.contains(t)){const n=this.doc.getElementById(i);n?t=n:(t=this.doc.createElement("style"),t.id=i,t.setAttribute("data-clearframe-custom",e.id),t.setAttribute("data-clearframe-hostname",e.hostname),(this.doc.head||this.doc.documentElement).appendChild(t)),this.activeCustomStyles.set(e.id,t)}const r=`/* [ClearFrame Custom Rule] ${e.name} (${e.id}) */
${e.selector} {
  display: none !important;
}`;t.textContent!==r&&(t.textContent=r)}removeCustomCssRule(e){const i=`${U}${e}`,t=this.activeCustomStyles.get(e)||this.doc.getElementById(i);t&&(t.parentNode&&t.parentNode.removeChild(t),this.activeCustomStyles.delete(e))}applyCssRule(e,i,t){const r=`${O}${e}`;let n=this.activeStyleElements.get(e);if(!n||!this.doc.contains(n)){const h=this.doc.getElementById(r);h?n=h:(n=this.doc.createElement("style"),n.id=r,n.setAttribute("data-clearframe-site",this.adapter.id),n.setAttribute("data-clearframe-rule",e),(this.doc.head||this.doc.documentElement).appendChild(n)),this.activeStyleElements.set(e,n)}const s=[`/* [ClearFrame] Site: ${this.adapter.id} | Rule: ${e} */`];i.length>0&&s.push(`${i.join(`,
`)} {
  display: none !important;
}`),t&&s.push(t);const o=s.join(`

`);n.textContent!==o&&(n.textContent=o)}removeCssRule(e){const i=`${O}${e}`,t=this.activeStyleElements.get(e)||this.doc.getElementById(i);t&&(t.parentNode&&t.parentNode.removeChild(t),this.activeStyleElements.delete(e))}ensureObserver(){if(!this.adapter.rules.some(r=>typeof r.apply=="function")||this.isObserving)return;let i=null;this.observer=new MutationObserver(()=>{i===null&&(i=window.setTimeout(()=>{i=null,this.reapplyDynamicRules()},100))});const t=this.doc.body||this.doc.documentElement;t&&(this.observer.observe(t,{childList:!0,subtree:!0}),this.isObserving=!0)}reapplyDynamicRules(){for(const e of this.adapter.rules){if(!e.apply)continue;const i=this.currentSettings[e.id]??e.defaultEnabled,t=this.isRuleApplicableOnRoute(e);if(i&&t)try{const r=e.apply(this.doc);typeof r=="function"&&this.activeCleanups.set(e.id,r)}catch(r){console.error(`[ClearFrame] Error during dynamic reapply of rule ${e.id}:`,r)}}}getAppliedRuleIds(){const e=[];for(const i of this.adapter.rules){const t=this.currentSettings[i.id]??i.defaultEnabled,r=this.isRuleApplicableOnRoute(i);t&&r&&e.push(i.id)}return e}getAppliedCustomRules(){return this.customRules.filter(e=>e.enabled)}destroy(){this.observer&&(this.observer.disconnect(),this.observer=null,this.isObserving=!1);for(const[e,i]of this.activeCleanups.entries())try{i()}catch(t){console.error(`[ClearFrame] Error cleaning up rule ${e}:`,t)}this.activeCleanups.clear();for(const e of this.adapter.rules)this.removeCssRule(e.id);this.activeStyleElements.clear();for(const e of this.customRules)this.removeCustomCssRule(e.id);this.activeCustomStyles.clear()}}const ee=new Set(["html","body","head","script","style","meta","link","title"]);function M(a){const e=a.tagName.toLowerCase();return ee.has(e)}function K(a){return!!(!a||a.trim().length===0||/^[:_]/.test(a)||/\d{4,}/.test(a)||/^[a-z0-9]{20,}$/i.test(a)||/ember\d+/i.test(a)||/mount_\d+/i.test(a))}function te(a){return!!(!a||a.trim().length===0||a.startsWith("clearframe-")||a.startsWith("cf-")||a.startsWith("min-")||/^[a-z]{2,5}[0-9a-z]{1,4}$/i.test(a)&&!/^(item|list|card|wrap|post|main|nav|menu|feed|btn|link|icon|text|title)$/i.test(a)||/^css-[a-z0-9]+/i.test(a)||/^sc-[a-z0-9]+/i.test(a)||/_[a-z0-9]{5,}/i.test(a))}function ie(a,e=a.ownerDocument){if(M(a))return[];const i=[],t=a.tagName.toLowerCase(),r=(p,b,l,m)=>{var g;try{const f=e.querySelectorAll(p);Array.from(f).includes(a)&&(i.some(me=>me.selector===p)||i.push({selector:p,matchCount:f.length,confidence:l,type:b,specificity:m,isSafe:!((g=f[0])!=null&&g.matches("html, body"))}))}catch{}},n=a.id;n&&!K(n)&&(r(`#${CSS.escape(n)}`,"id","high",100),r(`${t}#${CSS.escape(n)}`,"id","high",101));const s=["data-testid","data-view-name","data-component","data-item-type","data-ad-banner"];for(const p of s){const b=a.getAttribute(p);b&&!K(b)&&(r(`[${p}="${CSS.escape(b)}"]`,"data","high",80),r(`${t}[${p}="${CSS.escape(b)}"]`,"data","high",81))}const o=a.getAttribute("role"),h=a.getAttribute("aria-label");if(h&&h.trim().length>0&&h.length<50){const p=h.trim().replace(/"/g,'\\"');r(`[aria-label="${p}"]`,"aria","high",75),r(`${t}[aria-label="${p}"]`,"aria","high",76)}if(o&&h){const p=h.trim().replace(/"/g,'\\"');r(`[role="${CSS.escape(o)}"][aria-label="${p}"]`,"aria","high",85)}const u=Array.from(a.classList).filter(p=>!te(p));if(u.length>0){for(const p of u.slice(0,3))r(`.${CSS.escape(p)}`,"class","medium",50),r(`${t}.${CSS.escape(p)}`,"class","medium",51);if(u.length>=2){const p=`.${CSS.escape(u[0])}.${CSS.escape(u[1])}`;r(p,"class","medium",60),r(`${t}${p}`,"class","medium",61)}}const d=a.parentElement;if(d&&!M(d)){const p=d.tagName.toLowerCase(),b=d.getAttribute("role"),l=d.getAttribute("data-testid");l?r(`[data-testid="${CSS.escape(l)}"] > ${t}`,"structural","medium",45):b?r(`[role="${CSS.escape(b)}"] > ${t}`,"structural","medium",40):p!=="div"&&r(`${p} > ${t}`,"structural","low",30)}const E={high:3,medium:2,low:1};return i.sort((p,b)=>{const l=E[b.confidence]-E[p.confidence];if(l!==0)return l;const m=Math.abs(p.matchCount-1)-Math.abs(b.matchCount-1);return m!==0?m:b.specificity-p.specificity}),i}function ae(a,e=a.ownerDocument){const i=a.tagName.toLowerCase(),t=a.id?a.id:null,r=Array.from(a.classList).filter(g=>!g.startsWith("clearframe-")),n=a.getAttribute("role"),s=a.getAttribute("aria-label"),o=a.getBoundingClientRect(),h={width:Math.round(o.width),height:Math.round(o.height)},u=(a.textContent||"").replace(/\s+/g," ").trim(),d=u.length>60?u.substring(0,57)+"...":u,E=ie(a,e),p=E[0],b=p?p.selector:i;let l="Element",m=`${i.toUpperCase()} Component`;return n?(l=n.charAt(0).toUpperCase()+n.slice(1),m=`${l} Widget`):i==="aside"?(l="Sidebar",m="Side Panel / Bar"):i==="nav"?(l="Navigation",m="Navigation Bar"):i==="article"?(l="Card / Post",m="Post Card"):i==="header"?(l="Header",m="Header Section"):i==="footer"&&(l="Footer",m="Footer Section"),s?m=s:d.length>0&&d.length<35&&(m=d),{tag:i,id:t,classes:r,role:n,ariaLabel:s,sampleText:d,dimensions:h,candidates:E,bestSelector:b,suggestedName:m,componentType:l}}class re{constructor(e=window.document,i){c(this,"doc");c(this,"state","inactive");c(this,"callbacks");c(this,"containerEl",null);c(this,"highlightBox",null);c(this,"statusPill",null);c(this,"dialogEl",null);c(this,"previewStyleEl",null);c(this,"currentHoverTarget",null);c(this,"currentAnalysis",null);c(this,"isPreviewActive",!1);c(this,"handleMouseMove",e=>{if(this.state!=="selecting")return;const i=this.doc.elementFromPoint(e.clientX,e.clientY);if(!i||this.isInspectorOwnElement(i)||M(i)){this.highlightBox&&(this.highlightBox.style.display="none");return}this.currentHoverTarget=i;const t=i.getBoundingClientRect();this.highlightBox&&(this.highlightBox.style.display="block",this.highlightBox.style.top=`${t.top}px`,this.highlightBox.style.left=`${t.left}px`,this.highlightBox.style.width=`${t.width}px`,this.highlightBox.style.height=`${t.height}px`)});c(this,"handleClick",e=>{if(this.state!=="selecting")return;const i=this.currentHoverTarget||this.doc.elementFromPoint(e.clientX,e.clientY);!i||this.isInspectorOwnElement(i)||M(i)||(e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),this.state="selected",this.highlightBox&&(this.highlightBox.style.display="none"),this.currentAnalysis=ae(i,this.doc),this.showConfirmationDialog(this.currentAnalysis))});c(this,"handleKeyDown",e=>{e.key==="Escape"&&this.stop()});this.doc=e,this.callbacks=i}getState(){return this.state}start(){this.state==="inactive"&&(this.state="selecting",this.createDomNodes(),this.attachEventListeners(),this.updateStatusPill("Inspector Mode active. Hover and click any component to hide."))}stop(){this.state!=="inactive"&&(this.clearPreview(),this.detachEventListeners(),this.removeDomNodes(),this.state="inactive",this.currentHoverTarget=null,this.currentAnalysis=null,this.callbacks.onCancel())}createDomNodes(){this.containerEl=this.doc.createElement("div"),this.containerEl.id="clearframe-inspector-root",this.containerEl.setAttribute("data-clearframe-inspector","true");const e=this.doc.createElement("style");e.id="clearframe-inspector-styles",e.textContent=`
#clearframe-inspector-root * {
  box-sizing: border-box !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

.cf-inspect-pill {
  position: fixed !important;
  top: 16px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  background: #0a66c2 !important;
  color: #ffffff !important;
  padding: 8px 16px !important;
  border-radius: 24px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  box-shadow: 0 4px 16px rgba(10, 102, 194, 0.4) !important;
  z-index: 2147483647 !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  pointer-events: auto !important;
}

.cf-inspect-pill button {
  background: rgba(255, 255, 255, 0.25) !important;
  border: none !important;
  color: #ffffff !important;
  padding: 3px 10px !important;
  border-radius: 12px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: background 0.15s !important;
}

.cf-inspect-pill button:hover {
  background: rgba(255, 255, 255, 0.4) !important;
}

.cf-inspect-highlight {
  position: fixed !important;
  pointer-events: none !important;
  border: 2px solid #0a66c2 !important;
  background: rgba(10, 102, 194, 0.15) !important;
  border-radius: 4px !important;
  z-index: 2147483646 !important;
  transition: all 0.05s ease-out !important;
  display: none;
}

.cf-inspect-dialog {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  width: 360px !important;
  background: #ffffff !important;
  color: #1f2328 !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.08) !important;
  padding: 16px !important;
  z-index: 2147483647 !important;
  pointer-events: auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}

.cf-inspect-dialog-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border-bottom: 1px solid #e5e7eb !important;
  padding-bottom: 8px !important;
}

.cf-inspect-title {
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #0a66c2 !important;
}

.cf-inspect-badge {
  font-size: 11px !important;
  background: #f3f4f6 !important;
  color: #4b5563 !important;
  padding: 2px 8px !important;
  border-radius: 10px !important;
  font-weight: 500 !important;
}

.cf-inspect-field {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}

.cf-inspect-field label {
  font-size: 11.5px !important;
  font-weight: 500 !important;
  color: #6b7280 !important;
}

.cf-inspect-input, .cf-inspect-select {
  border: 1px solid #d1d5db !important;
  border-radius: 6px !important;
  padding: 6px 10px !important;
  font-size: 12.5px !important;
  color: #1f2328 !important;
  background: #ffffff !important;
}

.cf-inspect-meta-grid {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 8px !important;
  background: #f9fafb !important;
  padding: 8px 10px !important;
  border-radius: 6px !important;
  font-size: 11.5px !important;
  color: #4b5563 !important;
}

.cf-inspect-actions {
  display: flex !important;
  gap: 8px !important;
  margin-top: 4px !important;
}

.cf-btn-primary {
  flex: 1 !important;
  background: #0a66c2 !important;
  color: #ffffff !important;
  border: none !important;
  padding: 8px !important;
  border-radius: 6px !important;
  font-size: 12.5px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
}

.cf-btn-secondary {
  background: #f3f4f6 !important;
  color: #374151 !important;
  border: 1px solid #d1d5db !important;
  padding: 8px 12px !important;
  border-radius: 6px !important;
  font-size: 12.5px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
}
`,this.containerEl.appendChild(e),this.highlightBox=this.doc.createElement("div"),this.highlightBox.className="cf-inspect-highlight",this.containerEl.appendChild(this.highlightBox),this.statusPill=this.doc.createElement("div"),this.statusPill.className="cf-inspect-pill",this.containerEl.appendChild(this.statusPill),(this.doc.body||this.doc.documentElement).appendChild(this.containerEl)}removeDomNodes(){this.containerEl&&this.containerEl.parentNode&&this.containerEl.parentNode.removeChild(this.containerEl),this.containerEl=null,this.highlightBox=null,this.statusPill=null,this.dialogEl=null}updateStatusPill(e){if(!this.statusPill)return;this.statusPill.innerHTML=`
      <span>🎯 <strong>ClearFrame</strong> — ${e}</span>
      <button id="cf-inspect-exit-btn">Exit (Esc)</button>
    `;const i=this.statusPill.querySelector("#cf-inspect-exit-btn");i&&i.addEventListener("click",t=>{t.stopPropagation(),this.stop()})}attachEventListeners(){this.doc.addEventListener("mousemove",this.handleMouseMove,!0),this.doc.addEventListener("click",this.handleClick,!0),this.doc.addEventListener("keydown",this.handleKeyDown,!0)}detachEventListeners(){this.doc.removeEventListener("mousemove",this.handleMouseMove,!0),this.doc.removeEventListener("click",this.handleClick,!0),this.doc.removeEventListener("keydown",this.handleKeyDown,!0)}isInspectorOwnElement(e){var i;return this.containerEl&&(e===this.containerEl||this.containerEl.contains(e))?!0:!!((i=e.closest)!=null&&i.call(e,"#clearframe-inspector-root"))}showConfirmationDialog(e){this.dialogEl&&this.dialogEl.parentNode&&this.dialogEl.parentNode.removeChild(this.dialogEl),this.dialogEl=this.doc.createElement("div"),this.dialogEl.className="cf-inspect-dialog",this.dialogEl.setAttribute("data-testid","inspector-dialog");let i=e.bestSelector;e.candidates.find(r=>r.selector===i)||e.candidates[0];const t=()=>{const r=e.candidates.find(d=>d.selector===i)||{matchCount:1,confidence:"high"};this.dialogEl.innerHTML=`
        <div class="cf-inspect-dialog-header">
          <div class="cf-inspect-title">Create Custom Rule</div>
          <span class="cf-inspect-badge">${e.componentType}</span>
        </div>

        <div class="cf-inspect-field">
          <label>Rule Name</label>
          <input type="text" id="cf-rule-name" class="cf-inspect-input" value="${this.escapeHtml(e.suggestedName)}" />
        </div>

        <div class="cf-inspect-field">
          <label>Target Selector (${e.candidates.length} options)</label>
          <select id="cf-rule-selector" class="cf-inspect-select">
            ${e.candidates.map(d=>`<option value="${this.escapeHtml(d.selector)}" ${d.selector===i?"selected":""}>
                    ${this.escapeHtml(d.selector)} (${d.matchCount} match${d.matchCount===1?"":"es"} • ${d.confidence})
                  </option>`).join("")}
          </select>
        </div>

        <div class="cf-inspect-meta-grid">
          <div>Matches: <strong>${r.matchCount} element${r.matchCount===1?"":"s"}</strong></div>
          <div>Confidence: <strong>${r.confidence.toUpperCase()}</strong></div>
          <div>Size: <strong>${e.dimensions.width}×${e.dimensions.height}px</strong></div>
          <div>Scope: <strong>${window.location.hostname}</strong></div>
        </div>

        <div class="cf-inspect-actions">
          <button id="cf-preview-btn" class="cf-btn-secondary" type="button">
            ${this.isPreviewActive?"Restore":"Preview"}
          </button>
          <button id="cf-cancel-btn" class="cf-btn-secondary" type="button">Cancel</button>
          <button id="cf-save-btn" class="cf-btn-primary" type="button">Save Rule</button>
        </div>
      `;const n=this.dialogEl.querySelector("#cf-rule-name"),s=this.dialogEl.querySelector("#cf-rule-selector"),o=this.dialogEl.querySelector("#cf-preview-btn"),h=this.dialogEl.querySelector("#cf-cancel-btn"),u=this.dialogEl.querySelector("#cf-save-btn");s.addEventListener("change",()=>{i=s.value,this.isPreviewActive&&this.applyPreview(i),t()}),o.addEventListener("click",()=>{this.isPreviewActive=!this.isPreviewActive,this.isPreviewActive?(this.state="previewing",this.applyPreview(i)):(this.state="selected",this.clearPreview()),t()}),h.addEventListener("click",()=>{this.stop()}),u.addEventListener("click",async()=>{this.state="saving";const d=n.value.trim()||e.suggestedName,E={id:`custom-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,name:d,hostname:window.location.hostname.toLowerCase(),selector:i,enabled:!0,createdAt:Date.now(),strategy:"hide",targetMode:r.matchCount>1?"all":"single",version:1};this.clearPreview(),await this.callbacks.onSaveRule(E),this.stop()})};t(),this.containerEl.appendChild(this.dialogEl)}applyPreview(e){this.previewStyleEl||(this.previewStyleEl=this.doc.createElement("style"),this.previewStyleEl.id="clearframe-inspector-preview",(this.doc.head||this.doc.documentElement).appendChild(this.previewStyleEl)),this.previewStyleEl.textContent=`${e} { display: none !important; opacity: 0 !important; }`,this.callbacks.onPreviewToggle(e,!0)}clearPreview(){this.previewStyleEl&&this.previewStyleEl.parentNode&&this.previewStyleEl.parentNode.removeChild(this.previewStyleEl),this.previewStyleEl=null,this.isPreviewActive=!1,this.callbacks.onPreviewToggle("",!1)}escapeHtml(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}}const ne=[{id:"youtube",name:"YouTube",matches:["youtube.com","*.youtube.com"],rules:[{id:"yt-hide-shorts",label:"Hide Shorts",description:"Hides Shorts entry points, navigation tab, and recommendation reels across home and search.",defaultEnabled:!0,scope:"all",selectors:['ytd-guide-entry-renderer:has(a[title="Shorts"])','ytd-guide-entry-renderer:has(a[href^="/shorts"])','ytd-mini-guide-entry-renderer:has(a[title="Shorts"])','ytd-mini-guide-entry-renderer:has(a[href^="/shorts"])',"ytd-rich-shelf-renderer[is-shorts]","ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])","ytd-reel-shelf-renderer",'yt-tab-shape[tab-title="Shorts"]',"ytm-reel-shelf-renderer","ytm-pivot-bar-item-renderer:has(div.pivot-shorts)"]},{id:"yt-hide-sidebar",label:"Hide Left Sidebar",description:"Hides the guide navigation sidebar and cleanly centers the homepage video recommendations grid.",defaultEnabled:!1,scope:"all",selectors:["ytd-guide-renderer#guide-renderer","#guide-wrapper","tp-yt-app-drawer#guide","ytd-mini-guide-renderer","#guide-content"],customCss:`
/* Clear left margin/padding that YouTube reserves for the sidebar */
ytd-page-manager#page-manager {
  margin-left: 0 !important;
}
ytd-app[mini-guide-visible] ytd-page-manager#page-manager {
  margin-left: 0 !important;
}
/* Center the main rich grid container */
ytd-browse[page-subtype="home"] ytd-rich-grid-renderer {
  margin-left: auto !important;
  margin-right: auto !important;
  max-width: 1400px !important;
  justify-content: center !important;
}
ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer {
  justify-content: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
`},{id:"yt-hide-categories",label:"Hide Video Categories",description:"Hides the topic chip filter bar (All, Gaming, Music, Podcasts, etc.) above videos.",defaultEnabled:!1,scope:"home",isApplicable:a=>a.pathname==="/"||a.pathname==="",selectors:["ytd-feed-filter-chip-bar-renderer","#chips-wrapper","yt-chip-cloud-renderer","iron-selector#chips","ytm-feed-filter-chip-bar-renderer"]},{id:"yt-hide-header-buttons",label:"Hide Header Buttons",description:"Hides voice search (mic), Create button (+), notifications bell, and profile avatar in the top bar.",defaultEnabled:!1,scope:"all",selectors:["#voice-search-button","ytd-masthead #voice-search-button",'ytd-masthead ytd-button-renderer:has(a[href*="/upload"])','ytd-masthead ytd-button-renderer:has(button[aria-label*="Create"])','ytd-masthead ytd-button-renderer:has(button[aria-label*="Crear"])','ytd-masthead yt-icon-button:has(button[aria-label*="Create"])',"ytd-masthead #buttons ytd-button-renderer:first-child","ytd-masthead ytd-notification-topbar-button-renderer","ytd-masthead #notification-button","ytd-masthead ytd-topbar-menu-button-renderer:has(#avatar-btn)","ytd-masthead #avatar-btn"]},{id:"yt-clean-watch-actions",label:"Clean Video Action Buttons",description:"Keeps only Subscribe, Like, and Save to Playlist. Hides Share, Remix, Thanks, Clip, Download, and extra buttons.",defaultEnabled:!1,scope:"watch",isApplicable:a=>a.pathname==="/watch",selectors:['#actions button[aria-label*="Share" i]','#actions button[aria-label*="Compartir" i]','#actions ytd-button-renderer:has(button[aria-label*="Share" i])','#actions ytd-button-renderer:has(button[aria-label*="Compartir" i])','#actions button[aria-label*="Ask" i]','#actions button[aria-label*="Preguntar" i]','#actions ytd-button-renderer:has(button[aria-label*="Ask" i])','#actions yt-button-view-model:has(button[aria-label*="Ask" i])','#actions button[aria-label*="Remix" i]','#actions ytd-button-renderer:has(button[aria-label*="Remix" i])','#actions button[aria-label*="Thanks" i]','#actions button[aria-label*="Gracias" i]','#actions ytd-button-renderer:has(button[aria-label*="Thanks" i])','#actions button[aria-label*="Clip" i]','#actions ytd-button-renderer:has(button[aria-label*="Clip" i])','#actions button[aria-label*="Download" i]','#actions button[aria-label*="Descargar" i]',"#actions ytd-download-button-renderer",'#actions ytd-button-renderer:has(button[aria-label*="Download" i])',"#actions ytd-menu-renderer ytd-popup-button-renderer",'#actions yt-button-shape:has(button[aria-label*="More actions" i])','#actions yt-button-shape:has(button[aria-label*="Más acciones" i])']},{id:"yt-hide-video-description",label:"Hide Video Description",description:"Hides the description box and expandable details below the video title and actions.",defaultEnabled:!1,scope:"watch",isApplicable:a=>a.pathname==="/watch",selectors:["ytd-watch-metadata #description","ytd-watch-metadata #description-inner","#meta #description","ytd-expander.ytd-video-secondary-info-renderer","ytd-text-inline-expander",'ytm-item-section-renderer[section-identifier="video-description"]']},{id:"yt-center-watch-player",label:"Center Video Player & Minimalist Layout",description:"Centers the video player and watch content cleanly when recommendations are hidden or for a focused theater feel.",defaultEnabled:!1,scope:"watch",isApplicable:a=>a.pathname==="/watch",selectors:[],customCss:`
/* Center player and main watch columns cleanly */
ytd-watch-flexy[flexy] #columns {
  display: flex !important;
  justify-content: center !important;
  margin: 0 auto !important;
  max-width: 1400px !important;
}
ytd-watch-flexy[flexy] #primary {
  margin: 0 auto !important;
  float: none !important;
  max-width: 1200px !important;
}
ytd-watch-flexy[flexy] #primary-inner {
  margin: 0 auto !important;
}
ytd-watch-grid #primary {
  margin: 0 auto !important;
  max-width: 1200px !important;
}
`},{id:"yt-hide-related-videos",label:"Hide Related Videos on Watch Page",description:"Hides the secondary sidebar of recommended videos on video watch pages.",defaultEnabled:!1,scope:"watch",isApplicable:a=>a.pathname==="/watch",selectors:["ytd-watch-flexy #secondary #related","ytd-watch-grid #secondary #related","#related.ytd-watch-flexy",'ytm-item-section-renderer[section-identifier="related-items"]']},{id:"yt-hide-comments",label:"Hide Comments",description:"Hides the comments section on video watch pages.",defaultEnabled:!1,scope:"watch",isApplicable:a=>a.pathname==="/watch",selectors:["ytd-comments#comments","#comments.ytd-watch-flexy","#comments.ytd-watch-grid","ytm-comments-entry-point-teaser-renderer","ytm-comment-section-renderer"]}]},{id:"reddit",name:"Reddit",matches:["reddit.com","*.reddit.com"],rules:[{id:"reddit-hide-promoted",label:"Hide Promoted Posts & Ads",description:"Hides sponsored posts and promoted banner cards in subreddit and home feeds.",defaultEnabled:!0,scope:"all",selectors:["shreddit-ad-post","shreddit-dynamic-ad-link",'div[data-testid="ad-post"]','div[data-promoted="true"]',".promotedlink",".thing.promoted",".thing.sponsor"]},{id:"reddit-hide-sidebar-recommendations",label:"Hide Recent Posts & Recommendations",description:'Hides the "Recent Posts" drawer and algorithmic recommendation sidebars.',defaultEnabled:!1,scope:"feed",isApplicable:a=>!a.pathname.includes("/comments/"),selectors:["shreddit-recent-posts",'aside[aria-label="Recent Posts"]',"#recent-posts-card",'shreddit-feed-carousel[data-testid="recommended-carousel"]']}]},{id:"instagram",name:"Instagram",matches:["instagram.com","*.instagram.com"],rules:[{id:"ig-theme-modern-dark",label:"Neo-Dark Minimalist Theme",description:"Applies a sleek, dark slate & indigo aesthetic with rounded cards, custom stories glow, streamlined top bar, and modern typography.",defaultEnabled:!1,scope:"all",selectors:[],customCss:`
/* ============================================================
   ClearFrame — Instagram Neo-Dark Dashboard Theme
   ============================================================ */

:root {
  --cf-ig-bg: #1e1f28 !important;
  --cf-ig-surface: #272834 !important;
  --cf-ig-surface-hover: #313342 !important;
  --cf-ig-surface-card: #282a36 !important;
  --cf-ig-sidebar: #22232e !important;
  --cf-ig-border: #323545 !important;
  --cf-ig-text-main: #f0f2f5 !important;
  --cf-ig-text-muted: #8d92a3 !important;
  --cf-ig-accent: #ff5e62 !important;
  --cf-ig-accent-gradient: linear-gradient(135deg, #ff5e62, #ff9966) !important;
  --cf-ig-story-gradient: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) !important;
  --cf-ig-radius-card: 18px !important;
  --cf-ig-radius-btn: 12px !important;
}

/* Background & Main Body Canvas */
html,
body,
div#mount_0_0_*,
div[id^="mount_0_0"] {
  background-color: var(--cf-ig-bg) !important;
  color: var(--cf-ig-text-main) !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
}

/* Base text color overrides */
body *,
span,
p,
h1,
h2,
h3,
h4,
a {
  color: var(--cf-ig-text-main);
}

/* Navigation Left Rail (Neo-Dark Sidebar) */
div[role="navigation"],
nav[role="navigation"],
nav {
  background-color: var(--cf-ig-sidebar) !important;
  border-right: 1px solid var(--cf-ig-border) !important;
}

/* Sidebar navigation links */
nav a,
nav div[role="button"] {
  border-radius: var(--cf-ig-radius-btn) !important;
  transition: all 0.15s ease !important;
  color: var(--cf-ig-text-muted) !important;
}

nav a:hover,
nav div[role="button"]:hover {
  background-color: var(--cf-ig-surface-hover) !important;
  color: #ffffff !important;
}

/* Active or focused navigation item with coral accent indicator */
nav a[aria-current="page"],
nav a[href="/"]:not([href*="/explore"]):not([href*="/direct"]) {
  color: #ffffff !important;
  font-weight: 600 !important;
}

/* Main Content Container & Spacing */
main[role="main"] {
  background-color: var(--cf-ig-bg) !important;
  padding-top: 16px !important;
}

/* Post Cards & Articles (Neo-Dark Rounded Container) */
main[role="main"] article,
article[role="presentation"],
article {
  background-color: var(--cf-ig-surface-card) !important;
  border: 1px solid var(--cf-ig-border) !important;
  border-radius: var(--cf-ig-radius-card) !important;
  overflow: hidden !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25) !important;
  margin-bottom: 24px !important;
}

/* Article media rounded corners */
main[role="main"] article img,
main[role="main"] article video,
main[role="main"] article div[role="button"] img {
  border-radius: 12px !important;
}

/* Header inside article */
main[role="main"] article header {
  background-color: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  padding: 12px 16px !important;
}

/* Stories Tray: Modern Rounded Carousel Header */
main div[role="menu"],
main div:has(> ul li div[aria-label*="story" i]),
main div:has(> ul li div[aria-label*="historia" i]),
#stories-tray-wrapper,
#stories-tray {
  background-color: var(--cf-ig-surface) !important;
  border: 1px solid var(--cf-ig-border) !important;
  border-radius: var(--cf-ig-radius-card) !important;
  padding: 14px 18px !important;
  margin-bottom: 24px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
}

/* Story Rings Glow */
main div[role="menu"] canvas,
main div:has(> ul li div[aria-label*="story" i]) canvas {
  filter: drop-shadow(0 2px 8px rgba(255, 94, 98, 0.4)) !important;
}

/* Right Sidebar (Suggestions & Profile Widget) */
div[role="complementary"],
aside,
#right-sidebar {
  background-color: var(--cf-ig-surface) !important;
  border: 1px solid var(--cf-ig-border) !important;
  border-radius: var(--cf-ig-radius-card) !important;
  padding: 18px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
}

/* Input & Search Boxes */
input[type="text"],
input[type="search"],
input[placeholder*="Search" i],
input[placeholder*="Buscar" i] {
  background-color: var(--cf-ig-surface) !important;
  border: 1px solid var(--cf-ig-border) !important;
  border-radius: 20px !important;
  color: #ffffff !important;
  padding: 8px 16px !important;
}

input::placeholder {
  color: var(--cf-ig-text-muted) !important;
}

/* Modern Gradient Buttons ("Add photo" style) */
button[type="button"]:has(span:contains("Follow")),
button:has(div:contains("Follow")),
button:has(div:contains("Seguir")),
button[type="submit"] {
  background: var(--cf-ig-accent-gradient) !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: var(--cf-ig-radius-btn) !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 14px rgba(255, 94, 98, 0.35) !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease !important;
}

button[type="button"]:has(span:contains("Follow")):hover,
button:has(div:contains("Follow")):hover,
button[type="submit"]:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 18px rgba(255, 94, 98, 0.5) !important;
}

/* Floating Messages Neo-Dark Pill */
div[data-pagelet="IGDChatTabsRootContent"],
#floating-chat-widget {
  background-color: var(--cf-ig-surface) !important;
  border: 1px solid var(--cf-ig-border) !important;
  border-radius: 16px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4) !important;
}
`},{id:"ig-hide-floating-messages",label:"Hide Floating Messages Button",description:"Hides the floating chat / messages button in the bottom right corner.",defaultEnabled:!1,scope:"all",selectors:['[data-pagelet="IGDChatTabsRootContent"]','div:has(> [data-pagelet="IGDChatTabsRootContent"])','div[role="button"]:has(svg[aria-label*="Messages" i])','div[role="button"]:has(svg[aria-label*="Mensajes" i])','div:has(> div > div > svg[aria-label*="Direct" i]):not(nav div)']},{id:"ig-hide-right-sidebar",label:"Hide Right Sidebar (Suggestions & Profile)",description:"Hides the entire right-hand column with profile switch, suggested for you, and footer links, centering the main feed.",defaultEnabled:!1,scope:"home",isApplicable:a=>a.pathname==="/"||a.pathname==="",selectors:['div[role="complementary"]',"aside",'main ~ div:has(a[href*="/explore/people/"])','main > div > div > div > div ~ div:has(a[href*="/explore/people/"])','main > div > div > div ~ div:has(a[href*="/explore/people/"])'],customCss:`
/* Center main feed when right sidebar is hidden */
main[role="main"] {
  display: flex !important;
  justify-content: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
main[role="main"] > div {
  margin-left: auto !important;
  margin-right: auto !important;
  justify-content: center !important;
}
main[role="main"] section {
  margin-left: auto !important;
  margin-right: auto !important;
}
`},{id:"ig-hide-feed",label:"Hide Algorithmic Feed (Focus Mode)",description:"Hides the home feed posts to eliminate doomscrolling while keeping direct messages and profile accessible.",defaultEnabled:!1,scope:"home",isApplicable:a=>a.pathname==="/"||a.pathname==="",selectors:['main[role="main"] section article','main[role="main"] article[role="presentation"]','main[role="main"] div:has(> article)',"#feed-section"]},{id:"ig-hide-stories-tray",label:"Hide Stories Tray",description:"Hides the top horizontal stories panel (stories bubbles carousel) on the home feed.",defaultEnabled:!1,scope:"home",isApplicable:a=>a.pathname==="/"||a.pathname==="",selectors:['div[role="menu"][aria-label*="Stories" i]','div[role="menu"][aria-label*="Historias" i]','main div[role="menu"]','main div:has(> div > div > div > ul li div[aria-label*="story" i])','main div:has(> div > div > div > ul li div[aria-label*="historia" i])','main div:has(> div > ul > li > div[aria-label*="story" i])','main div:has(> div > ul > li > div[aria-label*="historia" i])',"#stories-tray-wrapper","#stories-tray"]},{id:"ig-hide-nav-buttons",label:"Simplify Navigation (Home, Messages & Profile Only)",description:"Keeps only Home, Messages, and Profile visible in the sidebar, hides all other items, and keeps labels permanently visible.",defaultEnabled:!1,scope:"all",selectors:['nav a[href^="/reels/"]','nav div:has(> a[href^="/reels/"])','a[href^="/reels/"]:has(svg)','nav div:has(> div > svg[aria-label*="Search" i])','nav div:has(> div > svg[aria-label*="Buscar" i])','nav a:has(svg[aria-label*="Search" i])','nav a:has(svg[aria-label*="Buscar" i])','nav div[role="button"]:has(svg[aria-label*="Search" i])','nav a[href^="/explore/"]','nav div:has(> a[href^="/explore/"])','nav a:has(svg[aria-label*="Explore" i])','nav a:has(svg[aria-label*="Explorar" i])','nav a:has(svg[aria-label*="Notifications" i])','nav a:has(svg[aria-label*="Notificaciones" i])','nav div:has(> div > svg[aria-label*="Notifications" i])','nav div:has(> div > svg[aria-label*="Notificaciones" i])','nav div[role="button"]:has(svg[aria-label*="Notifications" i])','nav div[role="button"]:has(svg[aria-label*="Notificaciones" i])','nav div:has(> div > svg[aria-label*="New post" i])','nav div:has(> div > svg[aria-label*="Create" i])','nav div:has(> div > svg[aria-label*="Crear" i])','nav div:has(> div > svg[aria-label*="Publicación nueva" i])','nav a:has(svg[aria-label*="New post" i])','nav a:has(svg[aria-label*="Create" i])','nav div[role="button"]:has(svg[aria-label*="New post" i])','nav div[role="button"]:has(svg[aria-label*="Create" i])','nav div:has(> div > svg[aria-label*="Settings" i])','nav div:has(> div > svg[aria-label*="More" i])','nav div:has(> div > svg[aria-label*="Más" i])','nav div:has(> div > svg[aria-label*="Opciones" i])','nav div[role="button"]:has(svg[aria-label*="Settings" i])','nav div[role="button"]:has(svg[aria-label*="More" i])','nav div[role="button"]:has(svg[aria-label*="Más" i])','nav a[href*="threads.net"]','nav div:has(> a[href*="threads.net"])','nav a:has(svg[aria-label*="Threads" i])','nav div:has(> div > svg[aria-label*="Threads" i])','nav div:has(> div > svg[aria-label*="Also from Meta" i])','nav div:has(> div > svg[aria-label*="De Meta" i])'],customCss:`
/* Force navigation sidebar width and keep text labels permanently visible */
div[role="navigation"],
nav[role="navigation"],
nav {
  width: 220px !important;
  min-width: 220px !important;
}

/* Ensure text spans inside sidebar are always displayed */
div[role="navigation"] span,
nav span {
  display: inline-block !important;
  opacity: 1 !important;
  visibility: visible !important;
}
`}]},{id:"linkedin",name:"Minimal LinkedIn",matches:["linkedin.com","*.linkedin.com"],rules:[{id:"li-clean-nav-header",label:"Simplify Navigation",description:"Hides Try Premium promotions, business shortcuts, and sub-labels under nav icons for a clean, minimal top bar.",defaultEnabled:!1,scope:"all",selectors:['header li:has(button[aria-label*="negocios" i])','header li:has(button[aria-label*="business" i])','header li:has(a[href*="/campaignmanager/"])','header li:has(a[href*="/premium/"])','header li:has(a[href*="/learning/"])',"header nav li button > span:nth-child(2)","header nav li a > span:nth-child(2)","header nav li button > span:has(> span:not(:has(svg)))","header nav li a > span:has(> span:not(:has(svg)))","header figure ~ div",'header [aria-label*="Yo" i] figure ~ div','header [aria-label*="Me" i] figure ~ div','header [aria-label*="Yo" i] p','header [aria-label*="Me" i] p',".global-nav__secondary-items .premium-upsell-link","a:has(.global-nav__premium-link)",'.global-nav__nav:has(a[href*="/premium/"]) a[href*="/premium/"]',".global-nav__app-launcher","li:has(.global-nav__app-launcher)",'.global-nav__secondary-items li:has(a[href*="/campaignmanager/"])',".global-nav__primary-link-text",".global-nav__item-text"],customCss:`
/* Keep nav items compact and icons vertically centered without the text labels */
header nav li button,
header nav li a {
  min-height: 48px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
}
`},{id:"li-hide-left-sidebar",label:"Hide Left Pane",description:"Hides the left sidebar profile summary card, analytics links, and saved items widget.",defaultEnabled:!1,scope:"home",isApplicable:a=>a.pathname==="/"||a.pathname===""||a.pathname.includes("/feed"),selectors:['aside[aria-label*="lateral" i]','aside[aria-label*="left" i]','aside:has(a[href*="/in/"][data-view-name*="profile" i])','aside:has(div[componentkey*="profile" i])',".scaffold-layout__sidebar","aside.scaffold-layout__sidebar",".feed-identity-module","div:has(> .feed-identity-module)"],customCss:`
/* Ensure main column stays centered if left rail is also removed */
.scaffold-layout__content {
  justify-content: center !important;
}
`},{id:"li-hide-right-sidebar",label:"Hide Right Pane",description:"Hides the right sidebar containing LinkedIn News, trending topics, and promoted widgets, and centers the main feed.",defaultEnabled:!1,scope:"home",isApplicable:a=>a.pathname==="/"||a.pathname===""||a.pathname.includes("/feed"),selectors:['aside[aria-label*="margen" i]','aside[aria-label*="right" i]',"aside:has(#feedRightNavGamesComponentRef)",'aside:has([componentkey*="feedRightNav" i])',"aside.scaffold-layout__aside",".scaffold-layout__aside",".news-module","aside:has(.news-module)","section:has(#feed-news-module)"],customCss:`
/* Modern LinkedIn CSS Grid centering when right sidebar is hidden */
div:has(> section[aria-label*="principal" i]),
div:has(> section[aria-label*="main" i]) {
  justify-content: center !important;
}

section[aria-label*="principal" i],
section[aria-label*="main" i] {
  grid-column-start: 5 !important;
  grid-column-end: 21 !important;
  max-width: 800px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

/* Classic scaffold layout centering */
.scaffold-layout__content {
  display: flex !important;
  justify-content: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.scaffold-layout__main {
  margin-left: auto !important;
  margin-right: auto !important;
  float: none !important;
}
`},{id:"li-hide-feed",label:"Simplify Feed",description:"Hides the infinite feed stream on the homepage to prevent doomscrolling while keeping messages and jobs accessible.",defaultEnabled:!1,scope:"home",isApplicable:a=>a.pathname==="/"||a.pathname===""||a.pathname.includes("/feed"),selectors:['div[componentkey="container-update-list_mainFeed-lazy-container"]','section[aria-label*="principal" i] div[role="list"]','section[aria-label*="main" i] div[role="list"]',"#voyager-feed",".scaffold-finite-scroll",'div[data-view-name="feed-full-feed"]',"main.scaffold-layout__main > div:has(.feed-shared-update-v2)","main.scaffold-layout__main .scaffold-finite-scroll__content","#feed-container"]},{id:"li-hide-floating-messages",label:"Hide Floating Messaging",description:"Hides the persistent messaging drawer / chat bubble overlay docked at the bottom right corner.",defaultEnabled:!1,scope:"all",selectors:["#msg-overlay",".msg-overlay-list-bubble",".msg-overlay-container",'aside[aria-label*="Messaging" i]','aside[aria-label*="Mensajes" i]'],apply:a=>((()=>{a.querySelectorAll('#interop-outlet, div[data-testid="interop-shadowdom"]').forEach(t=>{const r=t.shadowRoot;if(r){const n=r.querySelector('#msg-overlay, .msg-overlay-container, aside[aria-label*="Mensajes" i], aside[aria-label*="Messaging" i]');n&&(n.style.setProperty("display","none","important"),n.setAttribute("data-clearframe-hidden","true"))}})})(),()=>{a.querySelectorAll('#interop-outlet, div[data-testid="interop-shadowdom"]').forEach(t=>{const r=t.shadowRoot;r&&r.querySelectorAll('[data-clearframe-hidden="true"]').forEach(s=>{s.style.removeProperty("display"),s.removeAttribute("data-clearframe-hidden")})})})},{id:"li-hide-promoted",label:"Hide Promoted Posts & Sponsored Ads",description:"Hides sponsored updates, promoted employer posts, and promotional banner ads across the feed.",defaultEnabled:!0,scope:"all",selectors:[".ad-banner-container",".feed-shared-ad","div[data-ad-banner]","aside .ad-banner",".feed-shared-update-v2:has(.feed-shared-actor--promoted)",'.feed-shared-update-v2:has([data-tracking-control-name*="promoted" i])','.feed-shared-update-v2:has([data-tracking-control-name*="sponsored" i])','.feed-shared-update-v2:has([data-urn*="urn:li:sponsored" i])','.feed-shared-update-v2:has([data-urn*="urn:li:ad" i])',".feed-shared-update-v2[data-ad-banner]",".feed-shared-update-v2[data-ad]",'.feed-shared-update-v2[data-sponsored-post="true"]'],apply:a=>((()=>{a.querySelectorAll('.feed-shared-update-v2, div[data-view-name*="feed-item"], div[role="listitem"]').forEach(t=>{(t.textContent||"").trim().toLowerCase();const r=t.querySelector(".update-components-actor__sub-description, .feed-shared-actor__sub-description"),n=r?(r.textContent||"").trim().toLowerCase():"";(n.includes("promocionado")||n.includes("promoted")||n.includes("sponsored")||n.includes("patrocinado")||Array.from(t.querySelectorAll("div, p, span")).some(o=>{const h=(o.textContent||"").trim().toLowerCase();return h==="promocionado"||h==="promoted"||h==="sponsored"||h==="publicidad"}))&&(t.style.setProperty("display","none","important"),t.setAttribute("data-clearframe-sponsored","true"))})})(),()=>{a.querySelectorAll('[data-clearframe-sponsored="true"]').forEach(t=>{t.style.removeProperty("display"),t.removeAttribute("data-clearframe-sponsored")})})}]}];function se(a=v){for(const e of ne)a.register(e);return a}se(v);const oe={matches:["*://*.youtube.com/*","*://*.reddit.com/*","*://*.instagram.com/*","*://*.linkedin.com/*"],runAt:"document_start",main(){var b;const a=window.location.hostname,e=v.matchByHostname(a);if(!e)return;const i=new Z(e,{document:window.document});if(i.setCurrentUrl(window.location.href),e.onInit)try{e.onInit({document:window.document})}catch(l){console.error(`[ClearFrame] Adapter init failed for ${e.id}:`,l)}let t=[];const r=async()=>{try{i.setCurrentUrl(window.location.href);const[l,m]=await Promise.all([Y(v.getAll()),D(window.location.hostname)]);t=m;const g=l[e.id]||{};i.applySettings(g,window.location.href,m)}catch(l){console.error(`[ClearFrame] Failed to load/apply settings on ${e.id}:`,l)}};r();let n=null;const s=()=>(n||(n=new re(window.document,{onSaveRule:async l=>{await B(l,w,v.getAll()),await r()},onCancel:()=>{},onPreviewToggle:(l,m)=>{}})),n),o=w.onChange(()=>{r()});let h=null;typeof chrome<"u"&&((b=chrome.runtime)!=null&&b.onMessage)&&(h=(l,m,g)=>{if(!l||typeof l!="object")return!1;const f=l;if(f.type==="CLEARFRAME_SETTINGS_UPDATED"){if(f.siteId===e.id&&f.settings)try{i.applySettings(f.settings,window.location.href,t),g({type:"CLEARFRAME_ACK",success:!0,appliedCount:i.getAppliedRuleIds().length})}catch(C){g({type:"CLEARFRAME_ERROR",error:C instanceof Error?C.message:String(C)})}else g({type:"CLEARFRAME_ACK",success:!1});return!1}if(f.type==="CLEARFRAME_PING")return g({type:"CLEARFRAME_PONG",siteId:e.id,active:!0,appliedRules:i.getAppliedRuleIds(),currentUrl:window.location.href,customRulesCount:t.length}),!1;if(f.type==="CLEARFRAME_GET_STATE")return f.siteId===e.id?g({type:"CLEARFRAME_STATE_REPORT",siteId:e.id,active:!0,appliedRules:i.getAppliedRuleIds(),customRules:t}):g({type:"CLEARFRAME_ERROR",error:`Adapter ID mismatch (expected ${e.id}, got ${f.siteId})`}),!1;if(f.type==="CLEARFRAME_START_INSPECTOR"){try{s().start(),g({type:"CLEARFRAME_ACK",success:!0})}catch(C){g({type:"CLEARFRAME_ERROR",error:String(C)})}return!1}return f.type==="CLEARFRAME_CANCEL_INSPECTOR"?(n&&n.stop(),g({type:"CLEARFRAME_ACK",success:!0}),!1):f.type==="CLEARFRAME_GET_CUSTOM_RULES"?(D(window.location.hostname).then(C=>{t=C,g({type:"CLEARFRAME_CUSTOM_RULES_REPORT",customRules:C})}),!0):f.type==="CLEARFRAME_SAVE_CUSTOM_RULE"?(B(f.rule,w,v.getAll()).then(async()=>{await r(),g({type:"CLEARFRAME_ACK",success:!0})}),!0):f.type==="CLEARFRAME_DELETE_CUSTOM_RULE"?(J(f.ruleId,w,v.getAll()).then(async()=>{await r(),g({type:"CLEARFRAME_ACK",success:!0})}),!0):f.type==="CLEARFRAME_TOGGLE_CUSTOM_RULE"?(Q(f.ruleId,f.enabled,w,v.getAll()).then(async()=>{await r(),g({type:"CLEARFRAME_ACK",success:!0})}),!0):!1},chrome.runtime.onMessage.addListener(h));let u=window.location.pathname+window.location.search;const d=()=>{const l=window.location.pathname+window.location.search;l!==u&&(u=l,r())};window.addEventListener("yt-navigate-finish",d),window.addEventListener("popstate",d);const E=history.pushState;history.pushState=function(...l){const m=E.apply(this,l);return d(),m};const p=history.replaceState;history.replaceState=function(...l){const m=p.apply(this,l);return d(),m},window.addEventListener("unload",()=>{var l;n&&(n.stop(),n=null),h&&typeof chrome<"u"&&((l=chrome.runtime)!=null&&l.onMessage)&&chrome.runtime.onMessage.removeListener(h),o(),i.destroy(),e.onDestroy&&e.onDestroy()})}},L=((z=(j=globalThis.browser)==null?void 0:j.runtime)==null?void 0:z.id)==null?globalThis.chrome:globalThis.browser;function P(a,...e){}const le={debug:(...a)=>P(console.debug,...a),log:(...a)=>P(console.log,...a),warn:(...a)=>P(console.warn,...a),error:(...a)=>P(console.error,...a)},T=class T extends Event{constructor(e,i){super(T.EVENT_NAME,{}),this.newUrl=e,this.oldUrl=i}};c(T,"EVENT_NAME",F("wxt:locationchange"));let N=T;function F(a){var e;return`${(e=L==null?void 0:L.runtime)==null?void 0:e.id}:content:${a}`}function de(a){let e,i;return{run(){e==null&&(i=new URL(location.href),e=a.setInterval(()=>{let t=new URL(location.href);t.href!==i.href&&(window.dispatchEvent(new N(t,i)),i=t)},1e3))}}}const R=class R{constructor(e,i){c(this,"isTopFrame",window.self===window.top);c(this,"abortController");c(this,"locationWatcher",de(this));c(this,"receivedMessageIds",new Set);this.contentScriptName=e,this.options=i,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return L.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener("abort",e),()=>this.signal.removeEventListener("abort",e)}block(){return new Promise(()=>{})}setInterval(e,i){const t=setInterval(()=>{this.isValid&&e()},i);return this.onInvalidated(()=>clearInterval(t)),t}setTimeout(e,i){const t=setTimeout(()=>{this.isValid&&e()},i);return this.onInvalidated(()=>clearTimeout(t)),t}requestAnimationFrame(e){const i=requestAnimationFrame((...t)=>{this.isValid&&e(...t)});return this.onInvalidated(()=>cancelAnimationFrame(i)),i}requestIdleCallback(e,i){const t=requestIdleCallback((...r)=>{this.signal.aborted||e(...r)},i);return this.onInvalidated(()=>cancelIdleCallback(t)),t}addEventListener(e,i,t,r){var n;i==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),(n=e.addEventListener)==null||n.call(e,i.startsWith("wxt:")?F(i):i,t,{...r,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),le.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:R.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(e){var n,s,o;const i=((n=e.data)==null?void 0:n.type)===R.SCRIPT_STARTED_MESSAGE_TYPE,t=((s=e.data)==null?void 0:s.contentScriptName)===this.contentScriptName,r=!this.receivedMessageIds.has((o=e.data)==null?void 0:o.messageId);return i&&t&&r}listenForNewerScripts(e){let i=!0;const t=r=>{if(this.verifyScriptStartedEvent(r)){this.receivedMessageIds.add(r.data.messageId);const n=i;if(i=!1,n&&(e!=null&&e.ignoreFirstEvent))return;this.notifyInvalidated()}};addEventListener("message",t),this.onInvalidated(()=>removeEventListener("message",t))}};c(R,"SCRIPT_STARTED_MESSAGE_TYPE",F("wxt:content-script-started"));let H=R;const ce=Symbol("null");let pe=0;class he extends Map{constructor(...e){super(),this._objectHashes=new WeakMap,this._symbolHashes=new Map,this._publicKeys=new Map;const[i]=e;if(i!=null){if(typeof i[Symbol.iterator]!="function")throw new TypeError(typeof i+" is not iterable (cannot read property Symbol(Symbol.iterator))");for(const[t,r]of i)this.set(t,r)}}_getPublicKeys(e,i=!1){if(!Array.isArray(e))throw new TypeError("The keys parameter must be an array");const t=this._getPrivateKey(e,i);let r;return t&&this._publicKeys.has(t)?r=this._publicKeys.get(t):i&&(r=[...e],this._publicKeys.set(t,r)),{privateKey:t,publicKey:r}}_getPrivateKey(e,i=!1){const t=[];for(const r of e){const n=r===null?ce:r;let s;if(typeof n=="object"||typeof n=="function"?s="_objectHashes":typeof n=="symbol"?s="_symbolHashes":s=!1,!s)t.push(n);else if(this[s].has(n))t.push(this[s].get(n));else if(i){const o=`@@mkm-ref-${pe++}@@`;this[s].set(n,o),t.push(o)}else return!1}return JSON.stringify(t)}set(e,i){const{publicKey:t}=this._getPublicKeys(e,!0);return super.set(t,i)}get(e){const{publicKey:i}=this._getPublicKeys(e);return super.get(i)}has(e){const{publicKey:i}=this._getPublicKeys(e);return super.has(i)}delete(e){const{publicKey:i,privateKey:t}=this._getPublicKeys(e);return!!(i&&super.delete(i)&&this._publicKeys.delete(t))}clear(){super.clear(),this._symbolHashes.clear(),this._publicKeys.clear()}get[Symbol.toStringTag](){return"ManyKeysMap"}get size(){return super.size}}new he;function Ee(){}function k(a,...e){}const ue={debug:(...a)=>k(console.debug,...a),log:(...a)=>k(console.log,...a),warn:(...a)=>k(console.warn,...a),error:(...a)=>k(console.error,...a)};return(async()=>{try{const{main:a,...e}=oe,i=new H("content",e);return await a(i)}catch(a){throw ue.error('The content script "content" crashed on startup!',a),a}})()})();
content;
