// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Copilot by Detox',
  tagline: 'Simplify your mobile app testing with intuitive, natural language commands, making automation faster and more efficient.',
  favicon: '/img/homepage/detox-logo.png',

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'wix', // Usually your GitHub org/user name.
  projectName: 'Copilot by Detox', // Usually your repo name.

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
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
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
        title: 'Copilot',
        logo: {
          alt: 'My Site Logo',
          src: '/img/homepage/detox-logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'guides/integrating-with-testing-frameworks',
            position: 'left',
            label: 'Guides',
          },
          {
            type: 'doc',
            docId: 'API/basic-interface-overview',
            label: 'API',
            position: 'left'
          },
          {
            type: 'doc',
            label: 'Use Cases',
            docId: 'use cases/detox-case',
            position: 'left',
          },
          {
            href: 'https://github.com/wix-incubator/detox-copilot',
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
