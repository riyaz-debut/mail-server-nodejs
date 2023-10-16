import { validationResult } from "express-validator";
// display express validator errors 
 export const validateExpressValidatorResult = (req, res, next) => {

    const errors = validationResult(req)    
    console.log(errors,'errors');     

    if (!errors.isEmpty()) {
        console.log("errr");
        return res.status(400).json({ errors: errors.array() });
        
    }

    next();
}

