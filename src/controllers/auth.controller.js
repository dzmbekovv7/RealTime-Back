import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
const JWT_SECRET = "UpFJfpWKYteH5rMHSxst"; // Secret for email verification JWT
import { sendEmail } from "../lib/nodemailer.js";
// Генерация случайного кода подтверждения
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Генерируем 6-значный код
};

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Генерация кода подтверждения
    const verificationCode = generateVerificationCode();
    const codeExpiry = Date.now() + 3600000; // Код действует 1 час

    // Сохраняем код и его срок действия
    newUser.verificationCode = verificationCode;
    newUser.verificationCodeExpiry = codeExpiry;

    await newUser.save();

    // Отправка email с кодом подтверждения
    const subject = "Your email verification code";
    const html = `<p>Your verification code is: <strong>${verificationCode}</strong></p>`;
    await sendEmail(newUser.email, subject, "Email Verification", html);

    res.status(201).json({
      message: "Account created successfully. Please check your email for the verification code.",
    });

  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const verifyCode = async (req, res) => {
  const { email, code } = req.body; // Получаем email и код от пользователя

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Проверка срока действия кода
    if (user.verificationCodeExpiry < Date.now()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Проверка совпадения кода
    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Код подтверждения успешен, обновляем статус пользователя
    user.isVerified = true;
    user.verificationCode = null; // Удаляем код после подтверждения
    user.verificationCodeExpiry = null; // Удаляем срок действия

    await user.save();

    res.status(200).json({ message: "Email confirmed successfully. You can now log in." });
  } catch (error) {
    console.log("Error in verifyCode controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Проверка, подтвержден ли email
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please confirm your email before logging in." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      token,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Генерируем 6-значный код
};

// Запрос на сброс пароля
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Генерация кода сброса
    const resetPasswordCode = generateResetCode();
    const resetPasswordExpiry = Date.now() + 3600000; // Код действует 1 час

    user.resetPasswordCode = resetPasswordCode;
    user.resetPasswordExpiry = resetPasswordExpiry;

    await user.save();

    // Отправка email с кодом сброса
    const subject = "Password Reset Code";
    const html = `<p>Your password reset code is: <strong>${resetPasswordCode}</strong></p>`;
    await sendEmail(user.email, subject, "Password Reset", html);

    res.status(200).json({ message: "Password reset code sent to your email." });
  } catch (error) {
    console.log("Error in requestPasswordReset controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Сброс пароля
export const resetPassword = async (req, res) => {
  const { email, resetCode, newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Проверка срока действия кода
    if (user.resetPasswordExpiry < Date.now()) {
      return res.status(400).json({ message: "Reset code has expired" });
    }

    // Проверка совпадения кода
    if (user.resetPasswordCode !== resetCode) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    // Проверка, что пароли совпадают
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Хэширование нового пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordCode = null; // Удаляем код сброса
    user.resetPasswordExpiry = null; // Удаляем срок действия

    await user.save();

    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    console.log("Error in resetPassword controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};