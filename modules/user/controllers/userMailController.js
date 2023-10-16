import User from "../../../models/User.js";
import mailCollection from "../../../models/mailCollection.js";
import {
  messages,
  responseStatus,
  statusCode,
} from "../../../core/constant/constant.js";
import bookmarkCollection from "../../../models/bookmarkCollection.js";
import forwardCollection from "../../../models/forwardCollection.js";
import mongoose from "mongoose";
import plans from "../../../helpers/plans.js";
// mailCollection.collection.createIndex({ cc: 1 });

//custom plans made


export const composeController = async (req, res) => {
  try {
    // taking sender id from jwt token
    req.body.sender = req.userId;
    let mailData = new mailCollection(req.body);

    // to upload single or multiple files
    if (req.files) {
      // storing files in array
      let array = [];
      req.files.forEach(function (files, index, arr) {
        // just providing some fake link at start of files path
        array.push("https://unsplash.com/" + files.path);
      });
      //storing length or number of files uploaded by user
      var userFileUploaded = array.length;
      mailData.fileUpload = array;
    }
     var ccarray = [];
     var bccarray = [];


    if(req.body.cc)
    {
      const ccData = req.body.cc;
       ccarray = ccData.split(',');
      console.log(ccarray.length,"ccarr");
      console.log(ccarray);
    }
    else{
      ccarray = []
    }

   if(req.body.bcc)
   {
    const bccData = req.body.bcc;
     bccarray = bccData.split(',');
    console.log(bccarray,"bccarr");
    console.log(bccarray);
   }
    else{
      bccarray = []
    }

    const userData = await User.findById(req.userId);
    if (!userData) {
      res.status(statusCode.Bad_request).json({
        messages: messages.UnauthorizedUser,
        ResponseStatus: responseStatus.failure,
      });
    } else {
      // get user plan from database
      const UserPlan = userData.plan;

      //now filter user plan according to requirement from variable plans or custom plan made by us
      const filteredPlan = plans.find((plan) => plan.name == UserPlan);

      //check only for these 2 plans as other plan is unlimited
      if (UserPlan == "basic" || UserPlan == "intermediate") {
        const userMessage = req.body.message;

        //function to check number of users in cc and bcc
        
        const UserCountBcc = bccarray.length;
        const UserCountCc = ccarray.length;
       

        //when user message character limit get exceeds
        if (userMessage.length > filteredPlan.characterlimit) {
          res.status(statusCode.Unauthorized).json({
            messages: messages.messageError,
            ResponseStatus: responseStatus.failure,
          });
          // when user fileUpload limit get exceeds
        } else if (userFileUploaded > filteredPlan.fileUpload) {
          res.status(statusCode.Unauthorized).json({
            messages: messages.fileError,
            ResponseStatus: responseStatus.failure,
          });
        }
        // when user CC Count limit get exceeds
        else if (UserCountCc > filteredPlan.ccCount) {
          res.status(statusCode.Unauthorized).json({
            messages: messages.ccError,
            ResponseStatus: responseStatus.failure,
          });
        }
        //when user bcc limit get exceeds
        else if (UserCountBcc > filteredPlan.bccCount) {
          res.status(statusCode.Unauthorized).json({
            messages: messages.bccError,
            ResponseStatus: responseStatus.failure,
          });
          // else save in db if all okay
        } else {
          mailData.cc = ccarray;
          console.log(mailData.cc,"maildata.cc");
          mailData.bcc = bccarray;
          await mailData.save();
          // const indexes = await mailCollection.collection.indexes();
          // console.log(indexes, "indexes");

          res.status(statusCode.Created).json({
            messages: messages.mailComposed,
            ResponseStatus: responseStatus.success,
          });
        }
      }
      // for enterprise plan simply save in db without validating as he has unlimited supply
      else {
         mailData.cc = ccarray;
          console.log(mailData.cc,"maildata.cc");
          mailData.bcc = bccarray;
        await mailData.save();
        // const indexes = await mailCollection.collection.indexes();
        // console.log(indexes, "indexes");
        res.status(statusCode.Created).json({
          messages: messages.mailComposed,
          ResponseStatus: responseStatus.success,
        });
      }
    }
  } catch (error) {
    console.log(error.message, "error");
    res.status(statusCode.Bad_request).json({
      messages: messages.composeError,
      ResponseStatus: responseStatus.failure,
    });
  }
};

export const replyController = async (req, res) => {
  try {
    console.log(req.userId, "userId");
    const mssge_id = req.params.id;
    const user_id = req.userId;

    const userData = await mailCollection.findById(mssge_id);

    //check if that message or mail exists in database
    if (!userData) {
      res.status(statusCode.Bad_request).json({
        messages: messages.mssgeIdError,
        ResponseStatus: responseStatus.failure,
      });
    } else {
      //if mail exists
      const userId = await User.findById(user_id);
      //check if user exists in database with userid we have from token
      if (!userId) {
        res.status(statusCode.Bad_request).json({
          messages: messages.UnauthorizedUser,
          ResponseStatus: responseStatus.failure,
        });
      } else {
        //check if mail is already deleted before user reply
        const isDeleted = userData.deletedBy.find((id) => id == user_id);
        if (isDeleted) {
          res.status(statusCode.Bad_request).json({
            messages: messages.mssgeDeletedError,
            ResponseStatus: responseStatus.failure,
          });
        } else {
          // check if user who want to reply exists in cc,bcc and receiver end
          const ccUser = userData.cc.find((plan) => plan == user_id);
          const bccUser = userData.bcc.find((plan) => plan == user_id);

          // //check if user who want to reply exists in cc,bcc,sender and receiver end
          if (
            ccUser ||
            bccUser ||
            userData.receiver == user_id ||
            userData.sender == user_id
          ) {
            //if user exists compose mail same as done above
            // now compose mail a/c to plan alloted  as done above in compose controller

            composeController(req, res);
          } else {
            res.status(statusCode.Unauthorized).json({
              messages: messages.replyError,
              ResponseStatus: responseStatus.failure,
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message, "error");
    res.status(statusCode.Bad_request).json({
      messages: messages.ErrorReply,
      ResponseStatus: responseStatus.failure,
    });
  }
};

export const bookmarkController = async (req, res) => {
  try {
    // console.log(req.userId, "userId");
    const mssge_id = req.params.id;
    const user_id = req.userId;

    const userData = await mailCollection.findById(mssge_id);

    //check if that message or mail exists in database
    if (!userData) {
      res.status(statusCode.Bad_request).json({
        messages: messages.mssgeIdError,
        ResponseStatus: responseStatus.failure,
      });
    } else {
      //if mail exists
      const userId = await User.findById(user_id);
      //check if user exists in database with userid we have from token
      if (!userId) {
        res.status(statusCode.Bad_request).json({
          messages: messages.UnauthorizedUser,
          ResponseStatus: responseStatus.failure,
        });
      } else {
        //check if mail is already deleted before user bookemark a mail
        const isDeleted = userData.deletedBy.find((id) => id == req.userId);
        if (isDeleted) {
          res.status(statusCode.Bad_request).json({
            messages: messages.mssgeDeletedError,
            ResponseStatus: responseStatus.failure,
          });
        } else {
          //check if user who want to bookmark exists in cc,bcc and receiver end
          const ccUser = userData.cc.find((plan) => plan == user_id);
          const bccUser = userData.bcc.find((plan) => plan == user_id);

          //check if user who want to bookmark exists in cc,bcc , receiver and sender end
          if (
            ccUser ||
            bccUser ||
            userData.receiver == user_id ||
            userData.sender == user_id
          ) {
            // to check if already bookmarked the mail
            const userExists = await bookmarkCollection.find({
              usersId: user_id,
              mssgeid: mssge_id,
            });
            //when alredy bookmarked the mail
            if (userExists.length > 0) {
              res.status(statusCode.Bad_request).json({
                messages: messages.alreadyBookmarked,
                ResponseStatus: responseStatus.failure,
              });
            } else {
              //create bookmark collection abd than bookmark the mail
              await bookmarkCollection.create({
                mssgeid: mssge_id,
                usersId: user_id,
              });

              res.status(statusCode.Created).json({
                messages: messages.bookmarked,
                ResponseStatus: responseStatus.success,
              });
            }
          } else {
            res.status(statusCode.Unauthorized).json({
              messages: messages.bookmarkError,
              ResponseStatus: responseStatus.failure,
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message, "error");
    res.status(statusCode.Bad_request).json({
      messages: messages.BookmarkError,
      ResponseStatus: responseStatus.failure,
    });
  }
};

export const singleMailController = async (req, res) => {
  try {
    const mssge_id = req.params.id;
    const user_id = req.userId;
    console.log(user_id, "useridd");

    const userData = await mailCollection
      .findById(mssge_id)
      .select({ createdAt: 0, updatedAt: 0, _id: 0, __v: 0 });

    //check if that message or mail exists in database
    if (!userData) {
      res.status(statusCode.Bad_request).json({
        messages: messages.mssgeIdError,
        ResponseStatus: responseStatus.failure,
      });
    } else {
      const userId = await User.findById(user_id);
      console.log(userId, "userinfo");
      //check if user exists in database with userid we have from token
      if (!userId) {
        res.status(statusCode.Bad_request).json({
          messages: messages.UnauthorizedUser,
          ResponseStatus: responseStatus.failure,
        });
      } else {
        //check if mail is already deleted before user get the mail
        const isDeleted = userData.deletedBy.find((id) => id == req.userId);
        console.log(isDeleted, "deleted id");
        if (isDeleted) {
          res.status(statusCode.Bad_request).json({
            messages: messages.mssgeDeletedError,
            ResponseStatus: responseStatus.failure,
          });
        } else {
          //check if user who want to get particular mail exists in cc,bcc,receiver and sender end
          const ccUser = userData.cc.find((id) => id == user_id);
          const bccUser = userData.bcc.find((id) => id == user_id);

          if (
            ccUser ||
            bccUser ||
            userData.receiver == user_id ||
            userData.sender == user_id
          ) {
            // SO that user cannot see bcc and deletedBy data
            userData.bcc = [];
            userData.deletedBy = [];

            res.status(statusCode.Ok).json({
              messages: messages.successMail,
              ResponseStatus: responseStatus.success,
              Mail: userData,
            });
          } else {
            res.status(statusCode.Unauthorized).json({
              messages: messages.getMailError,
              ResponseStatus: responseStatus.failure,
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error, "err");
    res.status(statusCode.Bad_request).json({
      messages: messages.mailError,
      ResponseStatus: responseStatus.failure,
    });
  }
};

export const deleteController = async (req, res) => {
  try {
    const mssge_id = req.params.id;
    const user_id = req.userId;
    console.log(user_id, "useridd");

    const userData = await mailCollection.findById(mssge_id);

    //check if that message or mail exists in database
    if (!userData) {
      res.status(statusCode.Bad_request).json({
        messages: messages.mssgeIdError,
        ResponseStatus: responseStatus.failure,
      });
    } else {
      const userId = await User.findById(user_id);
      console.log(userId, "userinfo");
      //check if user exists in database with userid we have from token
      if (!userId) {
        res.status(statusCode.Bad_request).json({
          messages: messages.UnauthorizedUser,
          ResponseStatus: responseStatus.failure,
        });
      } else {
        const ccUser = userData.cc.find((id) => id == user_id);
        const bccUser = userData.bcc.find((id) => id == user_id);

        if (
          ccUser ||
          bccUser ||
          userData.receiver == user_id ||
          userData.sender == user_id
        ) {
          //check if mail is already deleted
          const isdeleted = userData.deletedBy.find((id) => id == user_id);
          if (!isdeleted) {
            const updateddata = await mailCollection.findByIdAndUpdate(
              mssge_id,
              { $push: { deletedBy: user_id } },
              { new: true }
            );


            console.log(updateddata, "updateddata");
            res.status(statusCode.Ok).json({
              messages: messages.successDelete,
              ResponseStatus: responseStatus.success,
            });
          } else {
            //when mail alredy deleted
            res.status(statusCode.Bad_request).json({
              messages: messages.alreadyDeleted,
              ResponseStatus: responseStatus.failure,
            });
          }
        }

        
        //admin  can  delete any mail
        else if (userId.isAdmin == 1) {
          const isdeleted = userData.deletedBy.find((id) => id == user_id);
          if (!isdeleted) {
            const updateddata = await mailCollection.findByIdAndUpdate(
              mssge_id,
              { $push: { deletedBy: user_id } },
              { new: true }
            );
          }
          res.status(statusCode.Ok).json({
            messages: messages.successDelete,
            ResponseStatus: responseStatus.success,
          });
        } else {
          res.status(statusCode.Unauthorized).json({
            messages: messages.deleteMailError,
            ResponseStatus: responseStatus.failure,
          });
        }
      }
    }
  } catch (error) {
    console.log(error.message, "error");
    res.status(statusCode.Bad_request).json({
      messages: messages.deleteError,
      ResponseStatus: responseStatus.failure,
    });
  }
};

export const forwardMailController = async (req, res) => {
  try {
    const mssge_id = req.params.id;
    const user_id = req.userId;
    console.log(user_id, "useridd");

    const userData = await mailCollection.findById(mssge_id);
    // console.log(userData,"userdataaa");

    //check if that message or mail exists in database
    if (!userData) {
      res.status(statusCode.Bad_request).json({
        messages: messages.mssgeIdError,
        ResponseStatus: responseStatus.failure,
      });
    } else {
      const userId = await User.findById(user_id);
      // console.log(userId, "userinfo");
      //check if user exists in database with userid we have from token
      if (!userId) {
        res.status(statusCode.Bad_request).json({
          messages: messages.UnauthorizedUser,
          ResponseStatus: responseStatus.failure,
        });
      } else {
        // check if mail is already deleted before user forward it
        const isDeleted = userData.deletedBy.find((id) => id == req.userId);
        console.log(isDeleted, "deleted id");
        if (isDeleted) {
          res.status(statusCode.Bad_request).json({
            messages: messages.mssgeDeletedError,
            ResponseStatus: responseStatus.failure,
          });
        } else {
          //user must exist in either cc,bcc,receiver or sender before he forward a mail
          const ccUser = userData.cc.find((id) => id == user_id);
          const bccUser = userData.bcc.find((id) => id == user_id);

          if (
            ccUser ||
            bccUser ||
            userData.receiver == user_id ||
            userData.sender == user_id
          ) {
            const newCollection = new mailCollection({
              subject: userData.subject,
              message: userData.message,
              fileUpload: userData.fileUpload,
              sender: userData.sender,
              receiver: userData.receiver,
              cc: userData.cc,
              bcc: userData.bcc,
              deletedBy: userData.deletedBy,
            });

            await newCollection.save();

            //push all user in cc and bcc in userData
            const receiverArray = [];
            userData.cc.forEach((val) => {
              receiverArray.push(val);
            });

            userData.bcc.forEach((val) => {
              receiverArray.push(val);
            });

            receiverArray.push(userData.receiver);

            const newForwardCollection = new forwardCollection({
              mssgeid: mssge_id,
              senderid: user_id,
              receiverid: receiverArray,
            });

            // console.log(newForwardCollection, "forwardTable");

            await newForwardCollection.save();
            res.status(statusCode.Ok).json({
              messages: messages.forwarded,
              ResponseStatus: responseStatus.success,
            });
          } else {
            res.status(statusCode.Unauthorized).json({
              messages: messages.forwardError,
              ResponseStatus: responseStatus.failure,
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message, "error");
    res.status(statusCode.Bad_request).json({
      messages: messages.forwardMailError,
      ResponseStatus: responseStatus.failure,
    });
  }
};

export const getForwardMailController = async (req, res) => {
  try {
    const user_id = req.userId;
    const userId = await User.findById(user_id);
    console.log(user_id, "userinfo");

    //check if user exists in database with userid we have from token
    if (!userId) {
      res.status(statusCode.Bad_request).json({
        messages: messages.UnauthorizedUser,
        ResponseStatus: responseStatus.failure,
      });
    } else {
      //convert user_id type to ObjectId from string to perform match query
      const newuserId = new mongoose.Types.ObjectId(user_id);

      //aggregation to look into mailcollection from forwards collection
      const data = await forwardCollection.aggregate([
        {
          $match: {
            senderid: newuserId,
          },
        },
        {
          $lookup: {
            from: "mailcollections",
            localField: "mssgeid",
            foreignField: "_id",
            as: "messagesField",
          },
        },
        {
          $project: {
            _id: 0,
            sendersid: "$senderid",
            message: "$messagesField.message",
            MailForwardedTo: "$receiverid",
          },
        },
        // if messge is empty which is when it is deleted than show custom message rather than empty message
        {
          $addFields: {
            message: {
              $cond: {
                if: { $eq: [{ $size: "$message" }, 0] },
                then: "Cannot list message as message is deleted by you",
                else: "$message",
              },
            },
          },
        },
      ]);

      res.status(statusCode.Ok).json({
        Messages: messages.forwardeduser,
        MailsForwarded: data,
        ResponseStatus: responseStatus.success,
      });
    }
  } catch (error) {
    console.log(error, "err");
    res.status(statusCode.Bad_request).json({
      messages: messages.forwardMailError,
      ResponseStatus: responseStatus.failure,
    });
  }
};

export const forwardedToUserController = async (req, res) => {
  try {
    const user_id = req.userId;
    const userId = await User.findById(user_id);
    console.log(userId, "userinfo");
    //check if user exists in database with userid we have from token
    if (!userId) {
      res.status(statusCode.Bad_request).json({
        messages: messages.UnauthorizedUser,
        ResponseStatus: responseStatus.failure,
      });
    } else {
      //convert user_id type to ObjectId from string to perform match query
      const newuserId = new mongoose.Types.ObjectId(user_id);

      //aggregation to look into mailcollection from forwards collection
      const data = await forwardCollection.aggregate([
        {
          $match: {
            receiverid: newuserId,
          },
        },
        {
          $lookup: {
            from: "mailcollections",
            localField: "mssgeid",
            foreignField: "_id",
            as: "messagesField",
          },
        },
        {
          $project: {
            _id: 0,
            sendersid: "$senderid",
            subject: "$messagesField.message",
            message: "$messagesField.message",
            cc: "$messagesField.cc",
          },
        },
        // if messge is empty which is when it is deleted than show custom message rather than empty message
        {
          $addFields: {
            message: {
              $cond: {
                if: { $eq: [{ $size: "$message" }, 0] },
                then: "Cannot list message as mail is deleted by you",
                else: "$message",
              },
            },
            subject: {
              $cond: {
                if: { $eq: [{ $size: "$message" }, 0] },
                then: "Cannot list subject as mail is deleted by you",
                else: "$subject",
              },
            },
            cc: {
              $cond: {
                if: { $eq: [{ $size: "$message" }, 0] },
                then: "Cannot list cc as mail is deleted by you",
                else: "$cc",
              },
            },
          },
        },
      ]);

      res.status(statusCode.Ok).json({
        Messages: messages.forwardTouser,
        MailsForwarded: data,
        ResponseStatus: responseStatus.success,
      });
    }
  } catch (error) {
    console.log(error, "err");
    res.status(statusCode.Bad_request).json({
      messages: messages.forwardMailError,
      ResponseStatus: responseStatus.failure,
    });
  }
};

export const inboxController = async (req, res) => {
  try {
    const user_id = req.userId;
    const userId = await User.findById(user_id);
    console.log(user_id, "id");
    //check if user exists in database with userid we have from token
    if (!userId) {
      res.status(statusCode.Not_Found).json({
        messages: messages.UnauthorizedUser,
        ResponseStatus: responseStatus.failure,
      });
    } else {
      // search in db when user exists in receiver or cc or bcc but must not exists in deletedBy field
      const inboxdata = await mailCollection
        .find({
          $and: [
            {
              $or: [
                { receiver: user_id },
                { cc: { $in: [user_id] } },
                { bcc: { $in: [user_id] } },
              ],
            },
            { deletedBy: { $nin: [userId] } },
          ],
        },{
          _id: 0,
          bcc: 0,
          deletedBy: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        }) 
    


      // console.log(inboxdata, "inboxdataa");

      //to make id type objectId which was string before
      const newuserId = new mongoose.Types.ObjectId(user_id);

      //also get mail from forward db(mails which were forwarded to user by others)
      const data = await forwardCollection.aggregate([
        {
          $match: {
            receiverid: newuserId,
          },
        },
        {
          $lookup: {
            from: "mailcollections",
            localField: "mssgeid",
            foreignField: "_id",
            as: "messagesField",
          },
        },
        {
          $project: {
            // mssgeid:"$mssgeid",
            _id: 0,
            subject: "$messagesField.subject",
            message: "$messagesField.message",
            fileUpload: "$messagesField.fileUpload",
            sender: "$senderid",
            cc: "$messagesField.cc",
          },
        },
        // if messge is empty which is when it is deleted than show custom message rather than empty message
        {
          $addFields: {
            message: {
              $cond: {
                if: { $eq: [{ $size: "$message" }, 0] },
                then: "Cannot list message as mail is deleted by you",
                else: "$message",
              },
            },
            subject: {
              $cond: {
                if: { $eq: [{ $size: "$message" }, 0] },
                then: "Cannot list subject as mail is deleted by you",
                else: "$subject",
              },
            },
            cc: {
              $cond: {
                if: { $eq: [{ $size: "$message" }, 0] },
                then: "Cannot list cc as mail is deleted by you",
                else: "$cc",
              },
            },
          },
        },
      ]);

      // console.log(data,"data2");
      res.status(statusCode.Ok).json({
        messages: messages.inbox,
        Inbox: {
          mailReceived: inboxdata,
          forwardedMailToUser: data,
        },
        ResponseStatus: responseStatus.success,
      });
    }
  } catch (error) {
    console.log(error, "err");
    res.status(statusCode.Bad_request).json({
      messages: error.message,
      ResponseStatus: responseStatus.failure,
    });
  }
};

export const sentController = async (req, res) => {
  try {
    const user_id = req.userId;
    console.log(user_id, "useridd");
    const userId = await User.findById(user_id);

    //check if user exists in database with userid we have from token
    if (!userId) {
      res.status(statusCode.Bad_request).json({
        messages: messages.UnauthorizedUser,
        ResponseStatus: responseStatus.failure,
      });
    } else {
      const sentData = await mailCollection
        .find({
          $and: [
            {
              sender: user_id,
            },
            { deletedBy: { $nin: [user_id] } },
          ],
        },{
          bcc: 0,
          _id: 0,
          deletedBy: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        })
       

      //to make id type objectId which was string before
      const newuserId = new mongoose.Types.ObjectId(user_id);

      //also get mail from forward db(mails which were forwarded to user by others)
      const data = await forwardCollection.aggregate([
        {
          $match: {
            senderid: newuserId,
          },
        },
        {
          $lookup: {
            from: "mailcollections",
            localField: "mssgeid",
            foreignField: "_id",
            as: "messagesField",
          },
        },
        {
          $project: {
            _id: 0,
            subject: "$messagesField.subject",
            message: "$messagesField.message",
            fileUpload: "$messagesField.fileUpload",
            sender: "$senderid",
            cc: "$messagesField.cc",
          },
        },
        // if messge is empty which is when it is deleted than show custom message rather than empty values
        {
          $addFields: {
            message: {
              $cond: {
                if: { $eq: [{ $size: "$message" }, 0] },
                then: "Cannot list message as mail is deleted by you",
                else: "$message",
              },
            },
            subject: {
              $cond: {
                if: { $eq: [{ $size: "$message" }, 0] },
                then: "Cannot list subject as mail is deleted by you",
                else: "$subject",
              },
            },
            cc: {
              $cond: {
                if: { $eq: [{ $size: "$message" }, 0] },
                then: "Cannot list cc as mail is deleted by you",
                else: "$cc",
              },
            },
          },
        },
      ]);

      res.status(statusCode.Ok).json({
        messages: messages.sent,
        SentBox: {
          Sent: sentData,
          forwardedMail: data,
        },
        ResponseStatus: responseStatus.success,
      });
    }
  } catch (error) {
    console.log(error, "err");
    res.status(statusCode.Bad_request).json({
      messages: messages.senterror,
      ResponseStatus: responseStatus.failure,
    });
  }
};

export const searchController = async (req, res) => {
  try {
    const user_id = req.userId;
    console.log(user_id, "useridd");
    const userId = await User.findById(user_id);

    //check if user exists in database with userid we have from token
    if (!userId) {
      res.status(statusCode.Bad_request).json({
        messages: messages.UnauthorizedUser,
        ResponseStatus: responseStatus.failure,
      });
    } else {
      console.log(req.params.key, "iddd");

      // first check if user must be either in one out of sender,receiver,cc or bcc than search for query and must not be deleted mail
      let data = await mailCollection
        .find({
          $and: [
            {
              $or: [
                { sender: user_id },
                { receiver: user_id },
                { cc: { $in: [user_id] } },
                { bcc: { $in: [user_id] } },
              ],
            },
            { message: { $regex: req.params.key } },
            {
              deletedBy: { $nin: [user_id] },
            },
          ],
        },{ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, deletedBy: 0,bcc:0 })
        
      console.log(data.length, "length");

      //if  match is found
      if (data.length > 0) {
        res.status(statusCode.Ok).json({
          messages: messages.search,
          data: data,
          ResponseStatus: responseStatus.success,
        });
      }
      //when no  match is found
      else {
        res.status(statusCode.Ok).json({
          messages: messages.mismatch,
          data: data,
          ResponseStatus: responseStatus.success,
        });
      }
    }
  } catch (error) {
    console.log(error, "err");
    res.status(statusCode.Bad_request).json({
      messages: messages.searcherror,
      ResponseStatus: responseStatus.failure,
    });
  }
};
