import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    userId: String,
    uniqueString: String,
    createAt: Date,
    expiresAt: Date,  
  }
);

const Verification = mongoose.model("Verification", verificationSchema);

export default Verification;