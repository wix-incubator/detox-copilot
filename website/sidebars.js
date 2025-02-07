// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  // Sidebar for guides section
  guideSidebar: [
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/integrating-with-testing-frameworks',
        'guides/technical-overview',
        'guides/pilot-best-practices' ,
        'guides/implementing-custom-testing-framework-driver',
        'guides/contributing-to-pilot',
      ],
    },
  ],

  // Sidebar for API section (adjust to your needs)
  apiSidebar: [
    {
      type: 'category',
      label: 'API',
      items: [
        'API/basic-interface-overview',
        'API/prompt-handler',
        'API/framework-driver',

      ],
    },
  ],
};

export default sidebars;
