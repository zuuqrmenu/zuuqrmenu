import { auth } from '../config/firebase';

export const getFirebaseIdToken = async () => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  return firebaseUser.getIdToken();
};
