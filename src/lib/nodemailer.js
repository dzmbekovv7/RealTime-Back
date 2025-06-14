import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io", // Хост
  port: 2525, // Порт
  auth: {
    user: "f1f9242180bb59", // Имя пользователя
    pass: "8475524cc619a2", // Пароль
  },
});

export const sendEmail = (to, subject, text, html) => {
  const mailOptions = {
    from: "f1f9242180bb59@sandbox.mailtrap.io", // Используйте адрес, который привязан к вашему Mailtrap аккаунту
    to,
    subject,
    text,
    html,
  };

  // Отправка письма с обработкой ошибок
  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return false;
    }
    console.log("Email sent successfully:", info.response);
    return true;
  });
};

