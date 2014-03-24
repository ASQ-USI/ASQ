/** @module lib/forms/signupCampusFormMessages
    @description Messages for the campus signupForm
*/
module.exports = signupCampusFormMessages = {
  username : {
    tip : "This will appear on the URL of your assets",
    isaok:{
      ok: "Username is available."
    },
    error:{
      blank : "A username is required!",
      taken : "This username is already taken!",
      invalid  : "Alphanumerics only. At most 15 characters.",
    },
    checking : "validating"
  }
};
