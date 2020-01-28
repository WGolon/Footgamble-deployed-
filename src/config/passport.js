import passport from 'passport';
import User from '../models/user';

export default () => {
    passport.use(User.createStrategy());
}