/** @module lib/forms/completeRegistration/messages
    @description Messages for the complete registration form
*/
module.exports = {
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
