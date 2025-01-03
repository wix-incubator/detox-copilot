// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Copilot',
  tagline: 'Simplify your mobile app testing with intuitive, natural language commands, making automation faster and more efficient.',
  favicon: '/img/favicon.ico',

  // Set the production url of your site here
  url: 'https://wix-incubator.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/detox-copilot/',
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'wix-incubator', // Usually your GitHub org/user name.
  projectName: 'detox-copilot', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: ['docusaurus-plugin-sass'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/wix-incubator/detox-copilot/blob/copilot-doc-site/website/',
        },
        theme: {
          customCss: './src/css/custom.scss',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: 'Detox Copilot Logo',
          src: 'img/homepage/detox-logo.png',
          srcDark: 'img/homepage/detox-logo.png',
        },
        style: 'dark',
        items: [
          {
            type: 'doc',
            docId: 'guides/integrating-with-testing-frameworks',
            label: 'Guides',
            position: 'right',
          },
          {
            type: 'doc',
            docId: 'API/basic-interface-overview',
            label: 'API',
            position: 'right'
          },
          {
            type: 'doc',
            label: 'Supported Frameworks',
            docId: 'pages/supported-frameworks',
            position: 'right',
          },
          {
            to: 'https://github.com/wix-incubator/detox-copilot',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository'
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Guides',
            items: [
              {
                label: 'Best Practices',
                to: 'docs/guides/copilot-best-practices'
              },
              {
                label: 'Contributing to Copilot',
                to: 'docs/guides/contributing-to-copilot-by-detox'
              }
            ]
          },
          {
            title: 'Support',
            items: [
              {
                label: 'Ask a question on Stack Overflow',
                to: 'https://stackoverflow.com/questions/tagged/detox',
                target: '_self'
              },
              {
                label: 'Create new issue on Github',
                to: 'https://github.com/wix-incubator/detox-copilot/issues',
                target: '_self'
              }
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                to: 'https://github.com/wix-incubator/detox-copilot',
                className: 'footer__link-item footer__link-item_git-hub',
              },
              {
                label: 'Twitter',
                to: 'https://twitter.com/detoxe2e/',
                className: 'footer__link-item footer__link-item_twitter',
              },
              {
                label: 'Discord',
                to: 'https://discord.gg/CkD5QKheF5',
                className: 'footer__link-item footer__link-item_discord',
              }
            ]
          }
        ]
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
