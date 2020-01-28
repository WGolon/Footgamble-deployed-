import jwt from 'jsonwebtoken';
import User from "../models/user";

export default async (req, res, next) => {

let decode = jwt.verify(req.headers.authorization, 'LdPQgZMB5wuet8q');
req.userId = decode.id;
try {
  let userDB = await User.findById({ _id: req.userId});
  req.isPro = userDB.isPro;
  req.isAdmin = userDB.isAdmin;
  req.invitations = userDB.invitations;
  req.firstName = userDB.firstName;
  req.lastName = userDB.lastName;
  req.username = userDB.username;
  req.groupParticipant = userDB.groupParticipant;
  }
 catch (err) {
   console.log('jwtError');
  res.status(500);
}
next();

}