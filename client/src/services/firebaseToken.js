import { auth } from '../config/firebase';

export const getFirebaseIdToken = async () => {
  if (!auth.currentUser && auth.authStateReady) {
    try {
      await auth.authStateReady();
    } catch {}
  }
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  return firebaseUser.getIdToken();
};
