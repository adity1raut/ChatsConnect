// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ChatsConnect',
  tagline: 'Mini Project Report — Real-Time Chat, Video & AI Platform',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'adity1raut',
  projectName: 'MiniProject-',

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/adity1raut/MiniProject-/tree/main/docs/',
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
            'https://github.com/adity1raut/MiniProject-/tree/main/docs/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'ChatsConnect Docs',
        logo: {
          alt: 'ChatsConnect Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Project Report',
          },
          {
            href: '/ChatsConnect-Report.docx',
            label: '⬇ Export .docx',
            position: 'right',
          },
          {
            href: 'https://github.com/adity1raut/MiniProject-',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Problem Definition',
                to: '/docs/problem-definition',
              },
              {
                label: 'Literature Survey',
                to: '/docs/literature-survey',
              },
              {
                label: 'Requirements',
                to: '/docs/requirements',
              },
              {
                label: 'System Design',
                to: '/docs/system-design',
              },
              {
                label: 'Implementation',
                to: '/docs/implementation',
              },
            ],
          },
          {
            title: 'Download',
            items: [
              {
                label: '⬇ Export Full Report (.docx)',
                href: '/ChatsConnect-Report.docx',
              },
            ],
          },
          {
            title: 'Live',
            items: [
              {
                label: 'ChatsConnect App',
                href: 'https://www.chatsconnect.tech',
              },
              {
                label: 'GitHub Repository',
                href: 'https://github.com/adity1raut/MiniProject-',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ChatsConnect. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
