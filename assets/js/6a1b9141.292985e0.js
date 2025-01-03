"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[114],{2511:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>p,contentTitle:()=>i,default:()=>c,frontMatter:()=>a,metadata:()=>r,toc:()=>l});const r=JSON.parse('{"id":"API/prompt-handler","title":"Prompt Handler","description":"In this section, we will cover how to implement a Prompt Handler to interact with AI services, such as OpenAI, in the context of Copilot by Detox.","source":"@site/docs/API/prompt-handler.md","sourceDirName":"API","slug":"/API/prompt-handler","permalink":"/detox-copilot/docs/API/prompt-handler","draft":false,"unlisted":false,"editUrl":"https://github.com/wix-incubator/detox-copilot/blob/copilot-doc-site/website/docs/API/prompt-handler.md","tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"id":"prompt-handler","title":"Prompt Handler","sidebar_label":"Prompt Handler","sidebar_position":2},"sidebar":"apiSidebar","previous":{"title":"Basic Interface Overview","permalink":"/detox-copilot/docs/API/basic-interface-overview"},"next":{"title":"Framework Driver","permalink":"/detox-copilot/docs/API/framework-driver"}}');var o=t(4848),s=t(8453);const a={id:"prompt-handler",title:"Prompt Handler",sidebar_label:"Prompt Handler",sidebar_position:2},i="Prompt Handler",p={},l=[{value:"What is a Prompt Handler?",id:"what-is-a-prompt-handler",level:2},{value:"How to Write a Prompt Handler",id:"how-to-write-a-prompt-handler",level:2},{value:"PromptHandler Interface",id:"prompthandler-interface",level:3},{value:"Example: Implementing the Prompt Handler for Sonnet",id:"example-implementing-the-prompt-handler-for-sonnet",level:3},{value:"Open Tasks For Contributors",id:"open-tasks-for-contributors",level:2}];function d(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.header,{children:(0,o.jsx)(n.h1,{id:"prompt-handler",children:"Prompt Handler"})}),"\n",(0,o.jsxs)(n.p,{children:["In this section, we will cover how to implement a ",(0,o.jsx)(n.strong,{children:"Prompt Handler"})," to interact with AI services, such as OpenAI, in the context of ",(0,o.jsx)(n.strong,{children:"Copilot by Detox"}),"."]}),"\n",(0,o.jsx)(n.h2,{id:"what-is-a-prompt-handler",children:"What is a Prompt Handler?"}),"\n",(0,o.jsxs)(n.p,{children:["A ",(0,o.jsx)(n.strong,{children:"Prompt Handler"})," is responsible for sending a prompt to an AI service and receiving the response. It may also handle the inclusion of additional context, such as a snapshot image, to enhance the AI's understanding of the app's UI state. Implementing a prompt handler allows ",(0,o.jsx)(n.strong,{children:"Copilot"})," to generate intelligent test scripts based on natural language commands."]}),"\n",(0,o.jsx)(n.h2,{id:"how-to-write-a-prompt-handler",children:"How to Write a Prompt Handler"}),"\n",(0,o.jsxs)(n.p,{children:["A ",(0,o.jsx)(n.strong,{children:"Prompt Handler"})," follows a defined interface, which ensures it can communicate with any AI service in a standardized way."]}),"\n",(0,o.jsx)(n.h3,{id:"prompthandler-interface",children:"PromptHandler Interface"}),"\n",(0,o.jsxs)(n.p,{children:["The ",(0,o.jsx)(n.code,{children:"PromptHandler"})," interface includes the following methods:"]}),"\n",(0,o.jsxs)(n.ul,{children:["\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.strong,{children:(0,o.jsx)(n.code,{children:"runPrompt"})}),": Sends a prompt to the AI service and returns the generated response."]}),"\n",(0,o.jsxs)(n.li,{children:[(0,o.jsx)(n.strong,{children:(0,o.jsx)(n.code,{children:"isSnapshotImageSupported"})}),": Checks if the AI service supports snapshot images to provide additional context."]}),"\n"]}),"\n",(0,o.jsxs)(n.p,{children:["Here\u2019s an example of the ",(0,o.jsx)(n.code,{children:"PromptHandler"})," interface:"]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-typescript",children:"/**\n * Interface for the prompt handler that will be used to interact with the AI service (e.g. OpenAI).\n */\nexport interface PromptHandler {\n    /**\n     * Sends a prompt to the AI service and returns the response.\n     * @param prompt The prompt to send to the AI service.\n     * @param image Optional path to the image to upload to the AI service that captures the current UI state.\n     * @returns The response from the AI service.\n     */\n    runPrompt: (prompt: string, image?: string) => Promise<string>;\n\n    /**\n     * Checks if the AI service supports snapshot images for context.\n     */\n    isSnapshotImageSupported: () => boolean;\n}\n"})}),"\n",(0,o.jsx)(n.h3,{id:"example-implementing-the-prompt-handler-for-sonnet",children:"Example: Implementing the Prompt Handler for Sonnet"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-typescript",children:"const axios = require('axios');\nconst fs = require('fs').promises;\n\nclass PromptHandler {\n  // Upload an image to the AI service\n  async uploadImage(imagePath) {\n    const image = await fs.readFile(imagePath);\n\n    try {\n      const response = await axios.post('https://bo.wix.com/mobile-infra-ai-services/v1/image-upload', {\n        image,\n      });\n\n      const imageUrl = response.data.url;\n      if (!imageUrl) {\n        throw new Error('Cannot find uploaded URL, got response:', response.data);\n      }\n\n      return imageUrl;\n    } catch (error) {\n      console.error('Error while uploading image:', error);\n      throw error;\n    }\n  }\n\n  // Run the prompt and return the generated text\n  async runPrompt(prompt, image) {\n    if (!image) {\n      throw new Error('Image is required');\n    }\n\n    const imageUrl = await this.uploadImage(image);\n\n    try {\n      const response = await axios.post('https://bo.wix.com/mobile-infra-ai-services/v1/prompt', {\n        prompt,\n        model: 'SONNET_3_5',\n        ownershipTag: 'Detox OSS',\n        project: 'Detox OSS',\n        images: [imageUrl]\n      });\n\n      const generatedText = response.data.generatedTexts[0];\n      if (!generatedText) {\n        throw new Error('Failed to generate text, got response:', response.data);\n      }\n\n      return generatedText;\n    } catch (error) {\n      console.error('Error running prompt:', error);\n      throw error;\n    }\n  }\n\n  // Check if snapshot images are supported\n  isSnapshotImageSupported() {\n    return true;\n  }\n}\n\nmodule.exports = PromptHandler;\n"})}),"\n",(0,o.jsx)(n.h2,{id:"open-tasks-for-contributors",children:"Open Tasks For Contributors"}),"\n",(0,o.jsxs)(n.p,{children:["If you're interested in contributing to Copilot by Detox and adding new prompt handlers or improving the existing ones, check out the open tasks on our ",(0,o.jsx)(n.a,{href:"https://github.com/wix-incubator/detox-copilot/issues",children:"GitHub repository"}),"."]})]})}function c(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>a,x:()=>i});var r=t(6540);const o={},s=r.createContext(o);function a(e){const n=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:a(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);