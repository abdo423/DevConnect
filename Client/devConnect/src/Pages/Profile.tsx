import ProfileComponent from '@/components/ProfileComponent.tsx';
import { RootState } from '@/app/store.ts';
import { useSelector } from 'react-redux';
import Navbar from '@/components/Navbar.tsx';

const UserProfilePage = () => {
  const { loading } = useSelector((state: RootState) => state.post);
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <ProfileComponent />
    </>
  );
};

export default UserProfilePage;
