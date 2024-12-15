import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/Homepage/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.scss';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <h1 className={styles.title}>{siteConfig.title}</h1>
        <h2 className={styles.tagline}>{siteConfig.tagline}</h2>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/guides/integrating-with-testing-frameworks">
            Getting started with Copilot
          </Link>
          {/* Add an img for the gif */}
          <img
            src="/img/homepage/copilot-demo.gif"
            alt="Demo Gif"
            className={styles.bottomRightGif}
          />
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <>
    <Layout>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
    </>
  );
}
