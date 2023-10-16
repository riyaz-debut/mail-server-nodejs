import { body } from "express-validator";

/* Validation during registration */

export const registrationValidation = [
  /*------------validation for Name--------------*/

  /*
     name cannot be null
     name cannot contain number or special characters
     name must have atleast 2 characters
    */

  body("name")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Enter name")
    .bail()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name cannot contain number or special characters")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Name must have atleast 2 characters")
    .bail(),

  /*------------validation for Email--------------*/
  /*
   email cannot be empty
   mail must be a valid mail id
   */

  body("email")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Enter Email")
    .bail()
    .matches(/^(?!\d+@)\w+([-+.']\w+)*@(?!\d+\.)\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .withMessage("Please Enter Valid Email")
    .bail(),
  /*------------validation for plan--------------*/
  /**
   * plan field cannot be empty
   * chose plan between available options only
   */

  body("plan")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Enter plan")
    .bail()
    .isIn(["basic", "intermediate", "enterprise"])
    .withMessage(
      "Invalid plan type. Please choose plan between basic, intermediate, or enterprise."
    )
    .bail(),
];

export const changePasswordValidation = [
  /*------------validation for Password--------------*/
  /*
     password cannot be empty
     Password must have atleast 4 characters
     */
  body("password")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Enter Password")
    .bail()
    .isLength({ min: 4 })
    .withMessage("Password must have atleast 4 characters ")
    .bail(),

  /*------------validation for Confirm Password--------------*/
  /**
   * confirm password field cannot be empty
   * must match with password field value
   */
  body("confirmPassword")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Enter confirmPassword")
    .bail()
    .custom(async (value, { req }) => {
      if (value != req.body.password) {
        throw new Error("Password and Confirm password must be same");
      }
    }),
];

export const userUpdationValidator = [
  /*------------validation for Name--------------*/

  /*
     check if name exists first
     name cannot be null
     name cannot contain number or special characters
     name must have atleast 2 characters
    */

  body("name")
    .if(body("name").exists())
    .not()
    .isEmpty()
    .trim()
    .withMessage("Enter name")
    .bail()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name cannot contain number or special characters")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Name must have atleast 2 characters")
    .bail(),

  /*------------validation for plan--------------*/
  /**
   * plan field cannot be empty
   * chose plan between available options only
   */

  body("plan")
    .if(body("plan").exists())
    .not()
    .bail()
    .isEmpty()
    .trim()
    .withMessage("Enter plan")
    .isIn(["basic", "intermediate", "enterprise"])
    .withMessage(
      "Invalid plan type. Please choose plan between basic, intermediate, or enterprise."
    )
    .bail(),
];


export const loginValidation = [
    /*------------validation for Email--------------*/
  /*
   email cannot be empty
   mail must be a valid mail id
   */

   body("email")
   .trim()
   .not()
   .isEmpty()
   .withMessage("Enter Email")
   .bail()
   .matches(/^(?!\d+@)\w+([-+.']\w+)*@(?!\d+\.)\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
   .withMessage("Please Enter Valid Email")
   .bail(),

   /*------------validation for Password--------------*/
  /*
     password cannot be empty
     Password must have atleast 4 characters
     */
  body("password")
  .not()
  .isEmpty()
  .trim()
  .withMessage("Enter Password")
  .bail()
  .isLength({ min: 4 })
  .withMessage("Password must have atleast 4 characters ")

]
  
