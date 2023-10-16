import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import connectDb from './config/dbConnection.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerDefinition} from './swaggerDefination.js';

const app = express();

// database connection
connectDb();

// importing routes
import authRoute from './modules/user/routes/userRoutes.js';
import userMailRoute from './modules/user/routes/userMailRoutes.js'


app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());



app.use(
    '/api-docs',
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDefinition)
  );

//Routes defination
app.use('/auth',authRoute);
app.use('/mail',userMailRoute);





app.listen(3000,()=>{
console.log("Listening at port 3000");
})

export default app;
