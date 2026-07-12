import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // ഗൂഗിൾ ലോഗിൻ ഉള്ളതുകൊണ്ട് പാസ്‌വേഡ് നിർബന്ധമല്ല
    password: { type: String },
    googleId: { type: String },
    image: { type: String, default: "https://cdn-icons-png.flaticon.com/512/149/149071.png" },
    role: { type: String, default: "user" },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
