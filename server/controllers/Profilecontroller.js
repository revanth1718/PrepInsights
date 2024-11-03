import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary';


export const getProfile=(req,res)=>{

    let {username}=req.body;

    User.findOne({'personal_info.username':username})
    .select('-personal_info.password -google_auth -updatedAt -blogs')
    .then(user=>{
        return res.status(200).json(user)
    })
    .catch(err=>{
        return res.status(500).json({error : err.message})
    })


}

export const generateImgLink = async (req,res)=>{
    let { img } = req.body;

    try {
      // Upload image to Cloudinary
      const imgUpload = await cloudinary.uploader.upload(img, {
        folder: 'cloudinary-demo', // This will store the image in the "cloudinary-demo" folder
        resource_type: 'image',
      });
  
      // Return the URL of the uploaded image
      return res.status(200).json({
        url: imgUpload.secure_url, // Send the image URL to the frontend
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
}

export const UpdateProfileImage=(req,res)=>{
  let { imageUrl } = req.body;

  User.findOneAndUpdate(
    { _id: req.user },
    { 'personal_info.profile_img': imageUrl }
  )
    .then(() => {
      return res.status(200).json({ profile_img: imageUrl });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
}

export const UpdateProfile=(req,res)=>{
  let { username, bio, social_links } = req.body;

  let bioLimit = 150;

  if (username.length < 3) {
    return res
      .status(403)
      .json({ error: 'username should be at least 3 letters long' });
  }

  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: `Bio should not be more than ${bioLimit} characters` });
  }

  //this gives array of social links
  let socialLinkArr = Object.keys(social_links);

  try {
    for (let i = 0; i < socialLinkArr.length; i++) {
      if (social_links[socialLinkArr[i]].length) {
        let hostname = new URL(social_links[socialLinkArr[i]]).hostname;

        if (
          !hostname.includes(`${socialLinkArr[i]}.com`) &&
          socialLinkArr[i] != 'website'
        ) {
          return res.status(403).json({
            error: `${socialLinkArr[i]} link is invalid. You must enter a full link`,
          });
        }
      }
    }
  } catch (err) {
    return res.status(500).json({
      error: 'You must provide full social links with http(s) included',
    });
  }

  let updateObj = {
    'personal_info.username': username,
    'personal_info.bio': bio,
    social_links,
  };
  User.findOneAndUpdate({ _id: req.user }, updateObj, {
    runValidators: true,
  })
    .then(() => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(409).json({ error: 'username already exist' });
      }
      //if it's not duplication error
      return res.status(500).json({ error: err.message });
    });
}

export const Notify=(req,res)=>{
  let user_id = req.user;

  Notification.exists({
    notification_for: user_id,
    seen: false,
    user: { $ne: user_id }, //don't include user
  })
    .then((result) => {
      if (result) {
        return res.status(200).json({ new_notification_available: true });
      } else {
        return res.status(200).json({ new_notification_available: false });
      }
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
}

export const getNotifications=(req,res)=>{
  let user_id = req.user; // middleware verifyJWT is setting req.id to longin user_id

  let { page, filter, deletedDocCount } = req.body;

  let maxLimit = 10;

  let findQuery = { notification_for: user_id, user: { $ne: user_id } };

  let skipDocs = (page - 1) * maxLimit;

  if (filter != 'all') {
    //filter is coming from the frontend
    findQuery.type = filter; // type is in the notification
  }

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
    //if any notification is deleted, subtract so as not to mess with d documents
  }

  Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate('blog', 'title blog_id') //populate blog key
    .populate(
      //populate user key
      'user',
      'personal_info.fullname personal_info.username personal_info.profile_img'
    )
    .populate('comment', 'comment')
    .populate('replied_on_comment', 'comment')
    .populate('reply', 'comment')
    .sort({ createdAt: -1 })
    .select('createdAt type seen reply')
    .then((notifications) => {
      Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then(() => {
          console.log('notification seen');
        });

      return res.status(200).json({ notifications });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });

}

export const getNotificationCount =(req,res)=>{
  let user_id = req.user;

  let { filter } = req.body;

  let findQuery = { notification_for: user_id, user: { $ne: user_id } };

  if (filter != 'all') {
    findQuery.type = filter;
  }

  Notification.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
}