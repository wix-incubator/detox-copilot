import React, { useState, useEffect } from 'react';
import Lottie from 'react-lottie';
import animationData from '../../../../static/img/demo/successLottie.json';
import styles from './styles.module.scss';

const StateEnum = {
  Idle: 'IDLE',
  Loading: 'LOADING',
  Success: 'SUCCESS',
};

const TIMINGS = {
  CYCLE: 1000,
  LOADING: 2000,
  SUCCESS: 1800
};

const useTypingSimulator = () => {
  return async (text, setter) => {
    for (let i = 0; i <= text.length; i++) {
      setter(text.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };
};

const useCommandExecutor = (simulateTyping, setShowSuccess, setUsername, setPassword) => {
  return [
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
      commandCode: async () => {
        await simulateTyping('123456', setPassword);
      }
    },
    {
      commandText: "Press the login button",
      focusedField: 'login',
      commandCode: async () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1250);
        await new Promise(resolve => setTimeout(resolve, 700));
        setUsername('');
        setPassword('');
      }
    }
  ];
};

const useStateMachine = (commands, currentStep, setCurrentStep) => {
  const [state, setState] = useState(StateEnum.Idle);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    setFocusedField(commands[currentStep].focusedField);

    const executeStep = async () => {
      setState(StateEnum.Loading);
      await commands[currentStep].commandCode();
      setState(StateEnum.Success);

      setTimeout(() => {
        setState(StateEnum.Idle);
        setCurrentStep(prev => (prev + 1) % commands.length);
      }, TIMINGS.SUCCESS);
    };

    executeStep();
  }, [currentStep]);

  return { state, focusedField };
};

const SuccessModal = ({ show }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  if (!show) return null;
  return (
   <div className={styles.successModal}>
     <Lottie options={defaultOptions} height={250} width={250} />
   </div>
  );
};

const CommandList = ({ commands, currentStep, state }) => (
 <div className={styles.demoCommands}>
   {commands.map((command, index) => (
    <div
     key={index}
     className={`${styles.command} 
          ${currentStep === index ? styles.active : ''}
          ${state === StateEnum.Loading && currentStep === index ? styles.animating : ''}`}
    >
      {currentStep === index && state === StateEnum.Success && (
       <svg className={styles.checkmark} viewBox="0 0 52 52">
         <circle
          className={styles.checkmark__circle}
          cx="26"
          cy="26"
          r="25"
          fill="none"
         />
         <path
          className={styles.checkmark__check}
          fill="none"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
         />
       </svg>
      )}
      {currentStep === index && state === StateEnum.Loading && (
       <span className={styles.spinner}></span>
      )}
      {command.commandText}
    </div>
   ))}
 </div>
);

const LoginForm = ({username, password, focusedField, showSuccess, handleSubmit}) => (
 <form onSubmit={handleSubmit} className={styles.loginForm}>
   <SuccessModal show={showSuccess} />
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
);

export default function DemoSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const simulateTyping = useTypingSimulator();
  const commands = useCommandExecutor(simulateTyping, setShowSuccess, setUsername, setPassword);
  const { state, focusedField } = useStateMachine(commands, currentStep, setCurrentStep);

  const handleSubmit = (e) => e.preventDefault();

  return (
   <div className={styles.demoContainer}>
     <CommandList commands={commands} currentStep={currentStep} state={state} />
     <div className={styles.demoInteractive}>
       <LoginForm
        username={username}
        password={password}
        focusedField={focusedField}
        showSuccess={showSuccess}
        handleSubmit={handleSubmit}
       />
     </div>
   </div>
  );
}
