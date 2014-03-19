/** @module lib/forms/signupFormMessages
    @description Messages for the signupForm
*/
module.exports = signupFormMessages = {

  firstname : {
    tip :"Enter your first name.",
    isaok : {
      ok: "First name looks great."
    },
    error:{
      blank : "A first name is required!",
      invalid : "The first name should between 6 and 64 characters long."
    }
  },

  lastname : {
    tip : "Enter your last name.",
    isaok:{
      ok: "Last name looks great."
    },
    error:{
      blank : "A last name is required!",
      invalid : "The last name should between 6 and 64 characters long."
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
      invalid  : "Invalid username! Alphanumerics only. 3 to 12 characters.",
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

  password : {
    tip : "8 characters or more! Be tricky.",
    isaok:{
      perfect : "Password is perfect!",
      ok : "Password is ok.",
      weak : "Password could be more secure.",
    },
    error:{
      blank : "Password cannot be blank!",
      obvious : "Password is too obvious.",
      weak  : "Password is not secure enough.",
      invalid    : ["Password must be between 8 and 30 characters,",
                " with at least a lower and a an upper ",
                "case character and a digit. The following characters are ",
                "allowed: ! @ # % : _ ( ) $ ^ & * - . ?"].join("")
    }
  },

  passwordConfirm : {
    tip : "Renter your password.",
    isaok:{
      ok : "Passwords match."
    },
    error:{
      mismatch : "Passwords do not match!"
    }
  }
};
