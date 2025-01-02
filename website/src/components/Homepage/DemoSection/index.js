import React, {useState, useEffect} from 'react';
import Lottie from 'react-lottie';
import animationData from '../../../../static/img/demo/successLottie.json';
import styles from './styles.module.scss';

export default function DemoSection() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const StateEnum = {
    Idle: 'IDLE',
    Loading: 'LOADING',
    Success: 'SUCCESS',
  }

  const [state, setState] = useState(StateEnum.Idle);
  const [focusedField, setFocusedField] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const SuccessIcon = () => (
    <img
      src={require(`@site/static/img/demo/checkmark.svg`).default}
      alt="Success Icon"
      className={styles.successIcon}
    />
  );

  const SuccessModal = ({show}) => {
    if (!show) return null;
    return (
      <div className={styles.successModal}>
        <Lottie
          options={defaultOptions}
          height={250}
          width={250}
        />
      </div>
    );
  };


  const simulateTyping = async (text, setter) => {
    for (let i = 0; i <= text.length; i++) {
      setter(text.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const commands = [
    {
      commandText: "Type `testuser` in the username field",
      focusedField: 'username',
      commandCode: async () => {
        await simulateTyping('testuser', setUsername);
      },
    },
    {
      commandText: "Type `123456` in the password field",
      focusedField: 'password',
      commandCode:
        async () => {
          await simulateTyping('123456', setPassword);
        }
    },
    {
      commandText: "Press the login button",
      focusedField: 'login',
      commandCode:
        () => {
          setTimeout(() => {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1250);
            setUsername('');
            setPassword('');
          }, 1000);
        }
    }
  ];

  useEffect(() => {
    setFocusedField(commands[currentStep].focusedField);

    const animationTimer = setInterval(async () => {
      setState(StateEnum.Loading); // Show the spinner

      await commands[currentStep].commandCode();

      setTimeout(() => {
        setState(StateEnum.Success); // Show the "✔️"

        setTimeout(() => {
          setState(StateEnum.Idle); // Hide the "✔️"
          setCurrentStep((prev) => (prev + 1) % commands.length); // Proceed to the next step
        }, 600); // Pause after "✔️" appears
      }, 500); // Delay for the spinner to disappear
    }, 2100);

    return () => clearInterval(animationTimer);
  }, [currentStep]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };


  return (
    <div className={styles.demoContainer}>
      <div className={styles.demoCommands}>
        {commands.map((command, index) => (
          <div
            key={index}
            className={`${styles.command} ${
              currentStep === index ? styles.active : ''
            } ${state === StateEnum.Loading && currentStep === index ? styles.animating : ''}`}
          >
            {currentStep === index && state === StateEnum.Success && <SuccessIcon/>}
            {currentStep === index && state === StateEnum.Loading && (
              <span className={styles.spinner}></span>
            )}
            {command.commandText}
          </div>
        ))}
      </div>

      <div className={styles.demoInteractive}>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <SuccessModal show={showSuccess}/>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={username}
              readOnly
              placeholder="Username"
              className={`${styles.demoInput} ${focusedField === 'username' ? styles.focused : ''}`}
              tabIndex="-1"
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              value={password}
              readOnly
              placeholder="Password"
              className={`${styles.demoInput} ${focusedField === 'password' ? styles.focused : ''}`}
              tabIndex="-1"
            />
          </div>
          <button
            type="submit"
            className={`${styles.demoButton} ${focusedField === 'login' ? styles.focused : ''}`}
            tabIndex="-1"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
