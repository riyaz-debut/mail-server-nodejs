import { Router } from 'express';
const router = Router();
import {signupController,loginController, changePasswordController, userUpdationController}   from '../controllers/userController.js';
import  {registrationValidation  ,changePasswordValidation,userUpdationValidator,loginValidation}  from '../../../middlewares/UserValidation.js';
import { jwtAuthenticationMiddleware } from '../../../middlewares/jwtAuthorization.js'
import {validateExpressValidatorResult} from '../../../helpers/valiadtionError.js';
// import {validatePlanUpdate, validateNameUpdate } from '../../../middlewares/'




/* validateExpressValidatorResult == to view express validator errors */

// register user
/* route, name , plan and  email validation, password validation ,to view express validator errors, controller*/
router.post('/signup',registrationValidation,changePasswordValidation,validateExpressValidatorResult,signupController);

// login or signin for user
router.post('/login',loginValidation,validateExpressValidatorResult,loginController);

//change password
router.post('/changePassword',changePasswordValidation,validateExpressValidatorResult,jwtAuthenticationMiddleware,changePasswordController);

//update user information
router.post('/update',userUpdationValidator,validateExpressValidatorResult,jwtAuthenticationMiddleware,userUpdationController);




export default router;