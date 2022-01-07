const isEmpty = (string) => {
  if(string.trim() === "") return true;
  else return false;
}
const isEmail = (email) => {
  const regx = "^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$";
  if(regx.match(email)) return true;
  else return false;
};

exports.validateSignupData = (data) => {
    let errors = {};
    if(isEmpty(data.email)){
      errors.email = "must not be empty";
    } else if(isEmail(data.email)){
      errors.email = "must be a valid email address";
    }
    if(isEmpty(data.password)) errors.password = "must not be empty";
    if(data.password != data.confirmPassword) errors.confirmPassword = "must be same as password";
    if(isEmpty(data.handle)) errors.handle = "must not be empty";
    if(isEmpty(data.fullname)) errors.fullname = "must not be empty";
  
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
};

exports.validateLoginData = (user) => {
    let errors = {};
    if(isEmpty(user.email)) errors.email = "must not be empty";
    if(isEmpty(user.password)) errors.password = "must not be empty";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    };
}

exports.eliminateEmptyData = (obj) => {
  const newObject = {};
  for (property in obj){
    if(!isEmpty(obj[property])) newObject[property] = obj[property];
  }
  return newObject;
}