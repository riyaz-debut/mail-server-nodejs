import { Router } from 'express';
const router = Router();
import {composeController,replyController,bookmarkController,singleMailController, deleteController,forwardMailController,getForwardMailController,forwardedToUserController,inboxController,sentController,searchController}   from '../controllers/userMailController.js';
import mailValidation from '../../../middlewares/mailValidation.js'
import  {jwtAuthenticationMiddleware}  from '../../../middlewares/jwtAuthorization.js'
import {validateExpressValidatorResult} from '../../../helpers/valiadtionError.js';
import  upload  from '../../../middlewares/multerUpload.js';



/* validateExpressValidatorResult == to view express validator errors */


router.use(jwtAuthenticationMiddleware);
// compose a mail
router.post('/compose',upload,mailValidation,validateExpressValidatorResult,composeController);

//reply a mail
router.post('/reply/:id',upload,mailValidation,validateExpressValidatorResult,replyController);

//bookmark a mail
router.post('/bookmark/:id',bookmarkController);

//get single mail
router.get('/singlemail/:id',singleMailController);

//soft delete a mail
router.post('/delete/:id',deleteController);

//forward mail 
router.post('/forward/:id',forwardMailController);

//mails forwarded by users to others
router.get('/getforward',getForwardMailController);

//mails forwarded by others to user
router.get('/forwardedtouser',forwardedToUserController);


//get inbox mails
router.get('/inbox',inboxController);

//get sent box
router.get('/sent',sentController);

router.get('/search/:key',searchController);
export default router;