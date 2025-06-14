import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const JWT_SECRET = "UpFJfpWKYteH5rMHSxst"; 

  console.log("JWT_SECRET:", JWT_SECRET); 

  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d", 
  });

  console.log("Generated Token:", token); 

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // Token expiration in milliseconds (7 days)
    httpOnly: true, // Prevent XSS attacks (cross-site scripting)
    sameSite: "strict", // Prevent CSRF (cross-site request forgery) attacks
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production (only over HTTPS)
  });

  return token; 
};