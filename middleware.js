module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash('error','you must be Signed In');
        return res.redirect('/login');
    }
    next();
}