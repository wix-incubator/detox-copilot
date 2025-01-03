"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[574],{3500:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>a,default:()=>p,frontMatter:()=>s,metadata:()=>i,toc:()=>l});const i=JSON.parse('{"id":"API/basic-interface-overview","title":"Basic Interface Overview","description":"The Copilot class serves as the core of the testing process, allowing seamless interaction between natural language prompts and your testing framework. Below is an overview of its main lifecycle commands that help control the test flow:","source":"@site/docs/API/basic-interface-overview.md","sourceDirName":"API","slug":"/API/basic-interface-overview","permalink":"/detox-copilot/docs/API/basic-interface-overview","draft":false,"unlisted":false,"editUrl":"https://github.com/wix-incubator/detox-copilot/blob/copilot-doc-site/website/docs/API/basic-interface-overview.md","tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"id":"basic-interface-overview","title":"Basic Interface Overview","sidebar_label":"Basic Interface Overview","sidebar_position":1},"sidebar":"apiSidebar","next":{"title":"Prompt Handler","permalink":"/detox-copilot/docs/API/prompt-handler"}}');var o=n(4848),r=n(8453);const s={id:"basic-interface-overview",title:"Basic Interface Overview",sidebar_label:"Basic Interface Overview",sidebar_position:1},a="Basic Interface Overview",c={},l=[{value:"1. <code>init(config: Config): void</code>",id:"1-initconfig-config-void",level:2},{value:"2. <code>start(): void</code>",id:"2-start-void",level:2},{value:"3. <code>performStep(step: string): Promise&lt;any&gt;</code>",id:"3-performstepstep-string-promiseany",level:2},{value:"4. <code>end(saveToCache: boolean = true): void</code>",id:"4-endsavetocache-boolean--true-void",level:2},{value:"Error Handling",id:"error-handling",level:2}];function d(e){const t={code:"code",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(t.header,{children:(0,o.jsx)(t.h1,{id:"basic-interface-overview",children:"Basic Interface Overview"})}),"\n",(0,o.jsx)(t.p,{children:"The Copilot class serves as the core of the testing process, allowing seamless interaction between natural language prompts and your testing framework. Below is an overview of its main lifecycle commands that help control the test flow:"}),"\n",(0,o.jsxs)(t.h2,{id:"1-initconfig-config-void",children:["1. ",(0,o.jsx)(t.code,{children:"init(config: Config): void"})]}),"\n",(0,o.jsx)(t.p,{children:"The init method initializes the Copilot instance with the provided configuration. This must be called before using Copilot to ensure it is set up with the necessary framework drivers and prompt handlers."}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:"Copilot.init(config);\n"})}),"\n",(0,o.jsxs)(t.h2,{id:"2-start-void",children:["2. ",(0,o.jsx)(t.code,{children:"start(): void"})]}),"\n",(0,o.jsx)(t.p,{children:"The start method begins a new test flow, resetting previous steps and clearing any temporary cache. It must be called before performing any steps in the test."}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:"copilot.start();\n"})}),"\n",(0,o.jsx)(t.p,{children:"Note: Calling start after an active test flow has already been started will result in an error. Be sure to call end() before starting a new flow."}),"\n",(0,o.jsxs)(t.h2,{id:"3-performstepstep-string-promiseany",children:["3. ",(0,o.jsx)(t.code,{children:"performStep(step: string): Promise<any>"})]}),"\n",(0,o.jsx)(t.p,{children:"The performStep method allows Copilot to perform a test step based on a natural language prompt. The input step is parsed and evaluated by Copilot, interacting with the underlying framework to execute the corresponding action."}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:'const result = await copilot.performStep("Click the login button");\n'})}),"\n",(0,o.jsx)(t.p,{children:"If Copilot is not running (i.e., start() has not been called), an error will be thrown."}),"\n",(0,o.jsxs)(t.h2,{id:"4-endsavetocache-boolean--true-void",children:["4. ",(0,o.jsx)(t.code,{children:"end(saveToCache: boolean = true): void"})]}),"\n",(0,o.jsx)(t.p,{children:"The end method concludes the test flow. It can optionally save temporary data to the main cache, ensuring any relevant information is retained for future tests."}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-typescript",children:"copilot.end(true); // Save to cache\n"})}),"\n",(0,o.jsx)(t.p,{children:"Note: The end method should be called when the test flow is complete, and start() must be invoked again before starting a new test."}),"\n",(0,o.jsx)(t.h2,{id:"error-handling",children:"Error Handling"}),"\n",(0,o.jsx)(t.p,{children:"If any method is called out of sequence, such as trying to perform steps without starting Copilot, or attempting to start Copilot while it is already running, the class will throw a CopilotError. This ensures that the test flow is controlled and prevents inconsistent states."})]})}function p(e={}){const{wrapper:t}={...(0,r.R)(),...e.components};return t?(0,o.jsx)(t,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>a});var i=n(6540);const o={},r=i.createContext(o);function s(e){const t=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function a(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:s(e.components),i.createElement(r.Provider,{value:t},e.children)}}}]);