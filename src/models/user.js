import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

let validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

let validatePass = function(password, cb) {
  let re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  //Minimum eight characters, at least one letter and one number
  if (re.test(password)) {
    return cb(null);
  }
  return cb(
    new Error(
      "Password must be minimum 8 characters long and have at least one number and letter"
    )
  );
};

let validateUsername = function(username) {
  let re = /^([a-zA-Z0-9_-]){4,15}$/;
  //Alphanumeric minimum 
    return re.test(username);
};

const userSchema = mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    username: {
      type: String,
      minlength: 5,
      trim: true,
      validate: [validateUsername, "Username must be at least 4 characters long, but no longer than 15"]
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      validate: [validateEmail, "Please enter a valid email adress"]
    },
    isPro: {
      type: Boolean,
      default: false
    },

    isAdmin: {
      type: Boolean,
      default: false
    },

    groupParticipant: {
      type: String,
      default: null
    },

    invitations: {
      invIN: [{
        fName:'',
        lName:'',
        username:'',
        groupName:'',
      }],
      invOUT: [{
        fName:'',
        lName:'',
        username:'',
        groupName:'',
      }],
    }
  },

  {
    timestamps: true // mongoose samo dodaje created_at i updated_at
  }
);

userSchema.plugin(passportLocalMongoose, {
  errorMessages: {
    IncorrectPasswordError: "Password incorrect",
    IncorrectUsernameError: "There is no account registered with that email",
    UserExistsError: "A user with the given username is already registered"
  },
  passwordValidator: validatePass
});

export default mongoose.model("User", userSchema);
