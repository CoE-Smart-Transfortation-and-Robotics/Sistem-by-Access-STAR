import LoginForm from '../../components/auth/LoginForm';
import BackgroundAnimation from '../../components/auth/BackgroundAnimation';


const LoginPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-background">
        <BackgroundAnimation />
      </div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;