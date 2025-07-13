import Layout from '../../components/common/Layout';
import ProfileForm from '../../components/common/ProfileForm';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import '../../styles/user/ProfileForm.css';

const ProfilePage = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <ProfileForm />
      </Layout>
    </ProtectedRoute>
  );
};

export default ProfilePage;