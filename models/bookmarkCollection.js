import { Schema as schema , model } from "mongoose";

const bookamrkCollection = new schema({
    mssgeid: {
        type: schema.Types.ObjectId,
        required: true,
      },
      usersId: {
        type:schema.Types.ObjectId,
        required:true,
      }

},
{ timestamps: true })

export default model("bookmark",bookamrkCollection);
