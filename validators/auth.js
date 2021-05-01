exports.userRegisterValidator = (req,res,next) => {
    console.log(req.body)
    req.check("name")   
            .notEmpty().withMessage("Name is required")  
            .matches(/^[a-z-_\s]+$/i).withMessage("Name must contain only alphabets and space")
            .trim();

    req.check("phone_no")
            .notEmpty().withMessage("Phone number is required")
            .isNumeric().withMessage("Phone must be numeric")
            .isLength(10).withMessage("Phone not valid")
            .trim();

    req.check("email")
            .notEmpty().withMessage("Email is required")                
            .isEmail().withMessage("Email not valid")
            .trim()
            .normalizeEmail();
    
    req.check("password")
            .notEmpty().withMessage("Password is required")
            .isLength({min:6}).withMessage("Password must contain atleast six characters")
            .matches(/\d/).withMessage("Password must contain a number")
            .trim();

    req.check("acq_email")
            .notEmpty().withMessage("Acquaintance Email is required")                
            .isEmail().withMessage("Acquaintance Email not valid")
            .trim()
            .normalizeEmail();

    req.check("acq_name")
            .notEmpty().withMessage("Acquaintance name required")
            .matches(/^[a-z-_\s]+$/i).withMessage("cquaintance name must contain only alphabets and space")
            .trim();

    req.check("acq_phone")
            .notEmpty().withMessage("Acquaintance Phone number is required")
            .isNumeric().withMessage("Acquaintance Phone must be numeric")
            .isLength(10).withMessage("Phone not valid")
            .trim();

    const errors = req.validationErrors()
    if (errors){
            const firstError = errors.map(error => error.msg)[0]
            return res.status(400).json({error: firstError})
    }
    next();
}

exports.userSigninValidator = (req,res,next) => {

    req.check("email")
            .notEmpty().withMessage("Email is required")                
            .isEmail().withMessage("Email not valid")
            .trim()
            .normalizeEmail();
    
    req.check("password")
            .notEmpty().withMessage("Password is required")
            .isLength({min:6}).withMessage("Password must contain atleast six characters")
            .matches(/\d/).withMessage("Password must contain a number")
            .trim();

    const errors = req.validationErrors()
    if (errors){
            const firstError = errors.map(error => error.msg)[0]
            return res.status(400).json({error: firstError})
    }
    next();
}
