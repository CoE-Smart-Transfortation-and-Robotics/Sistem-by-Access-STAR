import RegisterForm from '../../components/auth/RegisterForm';
import BackgroundAnimation from '../../components/auth/BackgroundAnimation';
import '../../styles/auth.css';

const RegisterPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-background">
        <BackgroundAnimation />
      </div>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;