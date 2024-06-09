import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    userId: String,
    resetString: String,
    createAt: Date,
    expiresAt: Date,  
  }
);

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;