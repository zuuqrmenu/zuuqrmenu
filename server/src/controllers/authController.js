import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Menu from '../models/Menu.js';
import { generateToken } from '../config/jwt.js';

const normalizeUsername = (value) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[ıİ]/g, 'i')
  .replace(/[ğĞ]/g, 'g')
  .replace(/[üÜ]/g, 'u')
  .replace(/[şŞ]/g, 's')
  .replace(/[öÖ]/g, 'o')
  .replace(/[çÇ]/g, 'c')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 40)
  .replace(/-+$/g, '');

export const setAuthCookie = (res, user) => {
  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
  });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      restaurantName,
      businessType,
      city,
      address,
      website,
      instagram,
      restaurantPhone,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      phone,
      role: 'RESTAURANT_USER',
    });

    // Create restaurant
    const restaurant = await Restaurant.create({
      name: restaurantName,
      slug: restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ownerId: user._id,
      status: 'PENDING',
      businessType,
      city,
      address,
      website,
      instagram,
      phone: restaurantPhone,
    });

    await Menu.create({
      restaurantId: restaurant._id,
      name: 'Ana Menü',
    });

    // Link restaurant to user
    user.restaurantId = restaurant._id;
    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    });

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(201).json({
      message: 'Registration successful. Your account is pending approval.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username || '',
        firebaseLinked: Boolean(user.firebaseUid),
        role: user.role,
        restaurantId: user.restaurantId,
      },
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        status: restaurant.status,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const identifier = email?.trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/identifier and password are required' });
    }

    // Find user with password
    const user = await User.findOne({ email: identifier }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    const restaurant = user.restaurantId ? await Restaurant.findById(user.restaurantId) : null;
    if (user.role === 'RESTAURANT_USER' && restaurant?.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Hesabınız henüz yönetici tarafından onaylanmadı. Onaylandıktan sonra giriş yapabilirsiniz.' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    setAuthCookie(res, user);

    // Get restaurant if exists
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username || '',
        firebaseLinked: Boolean(user.firebaseUid),
        role: user.role,
        restaurantId: user.restaurantId,
      },
      restaurant: restaurant ? {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        status: restaurant.status,
      } : null,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const firebaseSession = async (req, res, next) => {
  try {
    const firebaseUid = req.firebaseUser?.uid;
    if (!firebaseUid) return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş Firebase oturumu.' });
    const user = await User.findOne({ firebaseUid }).select('-password');
    if (!user || user.role !== 'RESTAURANT_USER' || !user.isActive) {
      return res.status(409).json({ error: 'Bu Firebase hesabı henüz bir ZuuLab QR hesabıyla eşleştirilmemiş.' });
    }

    const restaurant = user.restaurantId ? await Restaurant.findById(user.restaurantId) : null;
    if (!restaurant) return res.status(409).json({ error: 'Bu Firebase hesabı henüz bir ZuuLab QR hesabıyla eşleştirilmemiş.' });

    if (restaurant.status !== 'ACTIVE') {
      return res.status(403).json({ error: restaurant.status === 'PENDING'
        ? 'Hesabınız henüz yönetici tarafından onaylanmadı. Onaylandıktan sonra giriş yapabilirsiniz.'
        : 'Hesabınız şu anda restoran paneline erişemiyor.' });
    }

    setAuthCookie(res, user);
    res.json({
      message: 'Firebase uygulama oturumu oluşturuldu.',
      user: { id: user._id, email: user.email, name: user.name, username: user.username || '', role: user.role, restaurantId: user.restaurantId },
      restaurant: { id: restaurant._id, name: restaurant.name, slug: restaurant.slug, status: restaurant.status, menuStatus: restaurant.menuStatus },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get restaurant if exists
    let restaurant = null;
    if (user.restaurantId) {
      restaurant = await Restaurant.findById(user.restaurantId);
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        username: user.username || '',
        role: user.role,
        restaurantId: user.restaurantId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
      restaurant: restaurant ? {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        status: restaurant.status,
        menuStatus: restaurant.menuStatus,
      } : null,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie('token');
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    const unset = {};
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || !req.body.name.trim()) return res.status(400).json({ error: 'Ad soyad zorunludur.' });
      updates.name = req.body.name.trim();
    }
    if (req.body.username !== undefined) {
      if (typeof req.body.username !== 'string') return res.status(400).json({ error: 'Geçersiz kullanıcı adı.' });
      const existingUser = await User.findById(req.user.userId).select('username');
      if (existingUser?.username && req.body.username.trim() !== existingUser.username) return res.status(409).json({ error: 'Menü adresi oluşturulduktan sonra kullanıcı adı değiştirilemez.' });
      const username = req.body.username.trim();
      if (username && !/^[a-zA-Z0-9._-]{3,40}$/.test(username)) return res.status(400).json({ error: 'Kullanıcı adı 3-40 karakter olmalı ve yalnızca harf, rakam, nokta, alt çizgi veya tire içermelidir.' });
      if (username) updates.username = username;
      else unset.username = 1;
    }
    if (req.body.phone !== undefined) {
      if (typeof req.body.phone !== 'string' || req.body.phone.trim().length > 40) return res.status(400).json({ error: 'Geçerli bir telefon girin.' });
      updates.phone = req.body.phone.trim();
    }

    const update = {};
    if (Object.keys(updates).length) update.$set = updates;
    if (Object.keys(unset).length) update.$unset = unset;
    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json({ message: 'Hesap bilgileri güncellendi.', user: { id: user._id, email: user.email, name: user.name, username: user.username || '', phone: user.phone || '', role: user.role, restaurantId: user.restaurantId, isActive: user.isActive } });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.username) return res.status(409).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
    next(error);
  }
};

export const createMenuIdentity = async (req, res, next) => {
  try {
    if (req.user.role !== 'RESTAURANT_USER') return res.status(403).json({ error: 'Bu işlem yalnızca restoran hesapları için kullanılabilir.' });
    const user = await User.findById(req.user.userId).select('username role restaurantId');
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    if (user.username) return res.status(409).json({ error: 'Menü adresi zaten oluşturulmuş.', user: { username: user.username } });
    if (typeof req.body.username !== 'string') return res.status(400).json({ error: 'Kullanıcı adı zorunludur.' });
    const username = normalizeUsername(req.body.username);
    if (!/^[a-z0-9-]{3,40}$/.test(username)) return res.status(400).json({ error: 'Kullanıcı adı 3-40 karakter olmalı ve yalnızca harf, rakam veya tire içermelidir.' });
    const taken = await User.exists({ username });
    if (taken) return res.status(409).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
    user.username = username;
    await user.save();
    if (user.restaurantId) await Restaurant.updateOne({ _id: user.restaurantId, ownerId: user._id }, { $set: { menuStatus: 'PUBLISHED', publishedAt: new Date() } });
    res.json({ message: 'Menünüz başarıyla oluşturuldu.', user: { id: user._id, username: user.username, role: user.role, restaurantId: user.restaurantId } });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.username) return res.status(409).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
    next(error);
  }
};

export const reauthenticate = async (req, res, next) => {
  try {
    const { currentEmail, currentPassword } = req.body;
    if (!currentEmail || !currentPassword) return res.status(400).json({ error: 'E-posta veya şifre hatalı.' });
    const user = await User.findById(req.user.userId).select('+password');
    if (!user || user.email !== currentEmail.trim().toLowerCase() || !(await user.comparePassword(currentPassword))) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const updateEmail = async (req, res, next) => {
  try {
    if (req.user.role !== 'RESTAURANT_USER') return res.status(403).json({ error: 'Bu işlem yalnızca restoran hesapları için kullanılabilir.' });
    const { currentEmail, currentPassword, newEmail } = req.body;
    if (!currentEmail || !currentPassword || !newEmail || !/^\S+@\S+\.\S+$/.test(newEmail.trim())) return res.status(400).json({ error: 'E-posta veya şifre hatalı.' });
    const user = await User.findById(req.user.userId).select('+password');
    if (!user || user.email !== currentEmail.trim().toLowerCase() || !(await user.comparePassword(currentPassword))) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    if (user.firebaseUid) return res.status(409).json({ error: 'Firebase bağlantılı hesaplarda e-posta değişikliği Firebase hesabı üzerinden yapılmalıdır.' });
    const normalizedEmail = newEmail.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } }).select('_id');
    if (existing) return res.status(409).json({ error: 'Bu e-posta adresi zaten kullanılıyor.' });
    user.email = normalizedEmail;
    await user.save();
    setAuthCookie(res, user);
    res.json({ message: 'E-posta adresiniz başarıyla güncellendi.', user: { id: user._id, email: user.email, name: user.name, username: user.username || '' } });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: 'Bu e-posta adresi zaten kullanılıyor.' });
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentEmail, currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentEmail || !currentPassword || !newPassword || !confirmPassword) return res.status(400).json({ error: 'E-posta veya şifre hatalı.' });
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Yeni şifreler eşleşmiyor.' });
    if (!/(?=.*[A-Za-z])(?=.*\d).{8,}/.test(newPassword)) return res.status(400).json({ error: 'Şifre en az 8 karakter olmalı ve en az bir harf ile bir rakam içermelidir.' });

    const user = await User.findById(req.user.userId).select('+password');
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    if (user.email !== currentEmail.trim().toLowerCase() || !(await user.comparePassword(currentPassword))) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Şifreniz başarıyla değiştirildi.' });
  } catch (error) {
    next(error);
  }
};
