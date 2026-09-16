import User from '../models/User.js';

const emailMismatchMessage = 'Firebase hesabının e-posta adresi mevcut hesapla eşleşmiyor.';
const alreadyLinkedMessage = 'Bu Firebase hesabı başka bir kullanıcıya bağlı.';
const existingLinkMessage = 'Bu kullanıcı farklı bir Firebase hesabına bağlı.';

const isSameUser = (left, right) => left && right && String(left) === String(right);

const successResponse = (res, authProvider) => res.json({
  success: true,
  message: 'Firebase hesabı başarıyla bağlandı.',
  authProvider,
  firebaseLinked: true,
});

export const linkFirebaseAccount = async (req, res, next) => {
  try {
    const firebaseUser = req.firebaseUser;
    if (!firebaseUser?.uid) return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş Firebase oturumu.' });
    if (!firebaseUser.email) return res.status(400).json({ error: 'Firebase hesabında e-posta adresi bulunamadı.' });

    const user = await User.findById(req.user.userId).select('email role firebaseUid authProvider');
    if (!user) return res.status(401).json({ error: 'Kullanıcı bulunamadı.' });
    if (user.role !== 'RESTAURANT_USER') return res.status(403).json({ error: 'Bu işlem yalnızca restoran hesapları için kullanılabilir.' });

    const firebaseUid = firebaseUser.uid;
    const firebaseEmail = firebaseUser.email.trim().toLowerCase();
    const existingOwner = await User.findOne({ firebaseUid }).select('_id');
    if (existingOwner && !isSameUser(existingOwner._id, user._id)) {
      return res.status(409).json({ error: alreadyLinkedMessage });
    }

    if (user.email.trim().toLowerCase() !== firebaseEmail) {
      return res.status(409).json({ error: emailMismatchMessage });
    }

    if (user.firebaseUid) {
      if (user.firebaseUid === firebaseUid) return successResponse(res, user.authProvider || 'MULTIPLE');
      return res.status(409).json({ error: existingLinkMessage });
    }

    const nextProvider = user.authProvider === 'PASSWORD' ? 'MULTIPLE' : (user.authProvider || 'MULTIPLE');
    const linkedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        $or: [{ firebaseUid: { $exists: false } }, { firebaseUid: null }],
      },
      { $set: { firebaseUid, authProvider: nextProvider } },
      { new: true, runValidators: true },
    ).select('authProvider firebaseUid');

    if (linkedUser) return successResponse(res, linkedUser.authProvider);

    const currentUser = await User.findById(user._id).select('firebaseUid authProvider');
    if (currentUser?.firebaseUid === firebaseUid) return successResponse(res, currentUser.authProvider || nextProvider);
    return res.status(409).json({ error: existingLinkMessage });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.firebaseUid) {
      return res.status(409).json({ error: alreadyLinkedMessage });
    }
    return next(error);
  }
};
