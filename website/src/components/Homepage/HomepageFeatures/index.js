import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './HomepageFeatures.module.scss';

const FeatureList = [
  {
    title: 'Write Tests, Naturally',
    Svg: require('@site/static/img/homepage/cross-platform.svg').default, // taken from: https://uxwing.com/magic-icon/
    description: <>Create cross-platform end-to-end tests using natural language, making testing as simple as describing your app's behavior.</>
  },
  {
    title: 'Debuggable',
    Svg: require('@site/static/img/homepage/debug.svg').default, // taken from: https://uxwing.com/bug-icon/
    description: <>Modern async-await API allows breakpoints in asynchronous tests to work as expected.</>
  },
  {
    title: 'Automatically Synchronized',
    Svg: require('@site/static/img/homepage/sync.svg').default, // taken from: https://uxwing.com/wait-sandclock-icon/
    description: <>Stops flakiness at the core by monitoring asynchronous operations in your app.</>
  },
  {
    title: 'Made For CI',
    Svg: require('@site/static/img/homepage/ci.svg').default, // taken from: https://iconarchive.com/show/flatastic-9-icons-by-custom-icon-design/Semi-success-icon.html
    description: <>Execute your E2E tests on CI platforms like Travis CI, CircleCI or Jenkins without grief.</>
  },
  {
    title: 'Runs on Devices',
    Svg: require('@site/static/img/homepage/devices.svg').default, // taken from: https://uxwing.com/mobile-phone-icon/
    description: <>Gain confidence to ship by testing your app on a device/simulator just like a real user (not yet supported on iOS).</>
  },
  {
    title: 'Framework Agnostic',
    Svg: require('@site/static/img/homepage/test-runner.svg').default, // taken from: https://uxwing.com/testing-icon/
    description: (
      <>Use Copilot with any testing framework to write natural language tests freely and flexibly.</>
    )
  }
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
        <Svg className={styles.featureImage} alt={title}/>
      <div>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureText}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section>
      <div className={clsx('container', styles.benefitsHeader)}>
        <div className="row">
          <div className="col">
            <h1 className={styles.benefitsTitle}>Copilot benefits</h1>
          </div>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
