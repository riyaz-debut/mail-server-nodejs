import { Schema as schema, model } from "mongoose";
const Schema = schema;

const mailSchema = new Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    fileUpload: {
      type: Array,
      default: [],
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    cc: {
      type: [
        {
          type: Schema.Types.ObjectId,
        },
      ],
      default: [],
    },
    bcc: {
      type: [
        {
          type: Schema.Types.ObjectId,
        },
      ],
      default: [],
    },
    deletedBy: {
      type: [
        {
          type: Schema.Types.ObjectId,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

mailSchema.index({ cc: 1});
mailSchema.index({ deletedBy: 1 });
mailSchema.index({ bcc: 1});

export default model("MailCollection",mailSchema);



