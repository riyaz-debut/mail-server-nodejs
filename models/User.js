import { Schema as schema, model } from "mongoose";
const Schema = schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      required: true,
      enum: {
        values: ["basic", "intermediate", "enterprise"],
        message:
          "Invalid plan type. Please choose plan between basic, intermediate, or enterprise.",
      },
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin:{
      type:Number,
      default:0
    }
  },
  { timestamps: true }
);

export default model("User", userSchema);
