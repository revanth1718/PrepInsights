import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { nanoid } from 'nanoid';
import { getFirebaseAdmin } from '../config/firebaseConfig.js';

const admin = getFirebaseAdmin();

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const formatDataSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);
    return {
        access_token: access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
    };
};

const generateUsername = async (email) => {
    let username = email.split("@")[0];
    let isUsernameUnique = await User.exists({ "personal_info.username": username }).then((result) => result);
    isUsernameUnique ? username += nanoid().substring(0, 5) : "";
    return username;
};

export const signup = (req, res) => {
    let { fullname, email, password } = req.body;

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUsername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        });
        user.save()
            .then((u) => {
                return res.status(200).json(formatDataSend(u));
            })
            .catch(err => {
                if (err.code == 11000) {
                    return res.status(500).json({ "error": "Email already exists" });
                }
                return res.status(500).json({ "error": err.message });
            });
    });
};

export const signin = (req, res) => {
    let { email, password } = req.body;

    User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ "error": "Email not found" });
            }
            if (!user.google_auth) {
                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err) {
                        return res.status(500).json({ "error": "Error occurred while logging in, please try again" });
                    }
                    if (!result) {
                        return res.status(403).json({ "error": "Incorrect password" });
                    }

                    return res.status(200).json(formatDataSend(user));
                });
            } else {
                return res.status(403).json({ "error": "Account was created using Google. Try logging in with Google." });
            }
        })
        .catch((err) => {
            return res.status(500).json({ "error": err.message });
        });
};

export const googleAuth = async (req, res) => {
    let { access_token } = req.body;

    admin.auth()
        .verifyIdToken(access_token)
        .then(async (decodedUser) => {
            let { email, name, picture } = decodedUser;
            picture = picture.replace("s96-c", "s384-c");

            let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
                .then((u) => {
                    return u || null;
                })
                .catch(err => {
                    return res.status(500).json({ "error": err.message });
                });
            if (user) {
              console.log(user)
                if (!user.google_auth) {
                    return res.status(403).json({ "error": "This email was signed up without Google. Please log in with a password to access the account." });
                }
            } else {
                let username = await generateUsername(email);
                user = new User({
                    personal_info: { fullname: name, email, profile_img: picture, username },
                    google_auth: true
                });

                await user.save().then((u) => {
                    user = u;
                })
                .catch(err => {
                    return res.status(500).json({ "error": err.message });
                });
            }
            return res.status(200).json(formatDataSend(user));
        })
        .catch(err => {
            return res.status(500).json({ "error": "Failed to authenticate you with Google. Try with another Google account." });
        });
};

export const ChangePassword=(req,res)=>{
    let { currentPassword, newPassword } = req.body;

    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return res.status(403).json({
        error:
          'Password should be 6 or 20 character long with numeric, 1 lowercase and 1 uppercase letters',
      });
    }
    if (!req.user) {
        return res.status(403).json({ error: 'User not authenticated' });
    } 
    User.findOne({ _id: req.user })
    
      .then((user) => {
        
        //if user log in with google , you can't change password
        if (user.google_auth) {
          return res.status(403).json({
            error:
              "You can't change account's password because you logged in with google",
          });
        }
  
        // compare password
        bcrypt.compare(
          currentPassword,
          user.personal_info.password,
          (err, result) => {
            if (err) {
              return res.status(500).json({
                error:
                  'Some error occurs while changing password, please try again later',
              });
            }
            //if the current password is wrong
            if (!result) {
              return res.status(403).json({
                error: 'Incorrect current password',
              });
            }
  
            //comapare d password and hash it, if current password is correct
            bcrypt.hash(newPassword, 10, (err, hashed_password) => {
              User.findOneAndUpdate(
                { _id: req.user },
                { 'personal_info.password': hashed_password }
              )
                .then((u) => {
                  return res.status(200).json({
                    status: 'Password changed',
                  });
                })
                .catch((err) => {
                  return res.status(403).json({
                    error: err.message,
                  });
                });
            });
          }
        );
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: 'User not found' });
      });
}