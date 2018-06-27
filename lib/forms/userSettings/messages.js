/** @module lib/forms/userSettings/messages
    @description Messages for the userSettings form
*/
module.exports = {

  firstname : {
    tip :"Enter your first name.",
    isaok : {
      ok: "First name looks great."
    },
    error:{
      blank : "A first name is required!",
      invalid : "The first name should at most 20 characters long."
    }
  },

  lastname : {
    tip : "Enter your last name.",
    isaok:{
      ok: "Last name looks great."
    },
    error:{
      blank : "A last name is required!",
      invalid : "The last name should at most 20 characters long."
    }
  },

  username : {
    tip : "This will appear on the URL of your assets",
    isaok:{
      ok: "Username is available."
    },
    error:{
      blank : "A username is required!",
      taken : "This username is already taken!",
      invalid  : "Letters, numbers and \"~\",\".\",\"_\" and \"-\" are allowed only. At most 64 characters.",
    },
    checking : "validating"
  },

  email : {
    tip : "What’s your email address?",
    isaok:{
      ok : "Email looks good."
    },
    error:{
      blank : "An email is required!",
      invalid  : "Doesn't look like a valid email.",
      taken : "This email is already registered. Want to <a href=\"/login\">login</a>?",
      len      : "The email should between 6 and 64 characters long."
    },
    checking : "validating"
  },

  currentPassword : {
    tip : "Enter you current password to verify it's you whose making the changes",
    isaok:{
      ok : "cool",
    },
    error:{
      blank : "Current Password cannot be blank!",
      invalid    : "Wrong password! "
    }
  },

  password : {
    tip : "8 characters or more! Be tricky.",
    isaok:{
      ok : "Password is perfect!",
    },
    error:{
      blank : "Password cannot be blank!",
      invalid    : ["Password must be between 8 and 30 characters, with lower ",
                "case, upper case and digits. The following characters are ",
                "allowed: ! @ # % : _ ( ) $ ^ & * - . ?"].join("")
    }
  },

  passwordRepeat : {
    tip : "Renter your password.",
    isaok:{
      ok : "Passwords match."
    },
    error:{
      blank    : "Password cannot be blank!",
      mismatch : "Passwords do not match!"
    }
  }
};
