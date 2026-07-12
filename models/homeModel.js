import mongoose from "mongoose";

const homeSchema = new mongoose.Schema(
  {
    mainTitle: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Home = mongoose.model("Home", homeSchema);

export default Home;
