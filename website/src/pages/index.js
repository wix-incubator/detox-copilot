import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import DemoSection from '@site/src/components/Homepage/DemoSection';
import styles from './index.module.scss';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <div className={styles.logoContainer}>
          <h1 className={styles.title}>{siteConfig.title}</h1>
          <p className={styles.subtitle}>By Detox</p>
        </div>
      </div>
    </header>
  );
}

function FeatureSection({ title, description, link, linkText, boxStyle }) {
  return (
    <div className={`${styles.featureSection} ${boxStyle ? styles[boxStyle] : ''}`}>
      <div className="container">
        <h2 className={styles.h2}>{title}</h2>
        <p>{description}</p>
        {link && (
          <Link
            className="button button--secondary button--lg"
            to={link}>
            {linkText}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Layout>
      <HomepageHeader />
      <main>
        <section className={styles.demoSection}>
          <div className="container">
            <h2>Experience the Power of Natural Language Testing</h2>
            <DemoSection />
          </div>
        </section>

        <FeatureSection
          title="Universal Testing Framework Support"
          description="Copilot is designed by Detox to work seamlessly with any testing framework, making your automation journey smoother than ever."
          link="/docs/guides/integrating-with-testing-frameworks"
          linkText="View Supported Frameworks"
          boxStyle="box-light-green"
        />

        <FeatureSection
          title="Open for Contributions"
          description="Join our community and help expand Copilot's capabilities. Integrate your favorite testing framework today."
          link="/docs/Guides/contributing-to-copilot-by-detox"
          linkText="Contribute Now"
          boxStyle="box-dark-green"
        />
      </main>
    </Layout>
  );
}
