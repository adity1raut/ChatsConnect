import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/architecture">
            View Project Architecture 🚀
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Documentation for AI-Powered Real-Time Chat & Group Video Communication Application">
      <HomepageHeader />
      <main>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Comprehensive documentation for developers to understand the AI real-time chat stack.</h2>
          <p>Click the button above to explore the core architecture, backend, frontend, AI microservices, and deployment strategies.</p>
        </div>
      </main>
    </Layout>
  );
}
