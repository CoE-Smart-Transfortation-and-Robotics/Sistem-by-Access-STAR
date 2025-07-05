import Layout from '../../components/common/Layout';
import ProfileForm from '../../components/user/ProfileForm';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import '../../components/user/ProfileForm.css';

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