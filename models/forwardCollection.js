import { Schema as schema, model } from "mongoose";

const forwardCollection = new schema(
  {
    mssgeid: {
      type: schema.Types.ObjectId,
      required: true,
    },
    senderid: {
      type: schema.Types.ObjectId,
      required: true,
    },
    receiverid: {
      type: [
        {
          type: schema.Types.ObjectId,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

forwardCollection.index({ receiverid: 1 });
export default model("forward", forwardCollection);
