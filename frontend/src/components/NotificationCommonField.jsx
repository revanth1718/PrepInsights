import toast, { Toaster } from 'react-hot-toast';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../App';
import axios from 'axios';

const NotificationCommentField = ({
  _id,
  blog_author,
  index = undefined,
  replyingTo = undefined,
  setRelying,
  notification_id,
  notificationData,
}) => {
  let [comment, setComment] = useState('');

  let { _id: user_id } = blog_author;

  let {
    userAuth
  } = useContext(UserContext);
  const access_token=userAuth?.access_token


  let {
    notifications,
    notifications: { result },
    setNotifications,
  } = notificationData;

  const handleComment = () => {
    if (!comment.length) {
      return toast.error('write something to leave a comment...');
    } 

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + '/blogs/add-comment',
        /*
          Tell d server if d comment is a reply or parentComment
          - replying_to => this will equal to d -ID of the comment i want reply on
          //check replyingTo if it is undefined or not
          */
        {
          _id,
          blog_author: user_id,
          comment,
          replying_to: replyingTo,
          notification_id,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setRelying(false);
        result[index].reply = { comment, _id: data._id };
        setNotifications({ ...notifications, result });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)} //get value from d text area
        placeholder="Leave a reply..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button onClick={handleComment} className="btn-dark mt-5 px-10">
        Reply
      </button>
    </>
  );
};
export default NotificationCommentField;