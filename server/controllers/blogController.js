import { nanoid } from 'nanoid';
import Blog from '../models/Blog.js';
import User from '../models/User.js'; 
import { v2 as cloudinary } from 'cloudinary';
import Notification from '../models/Notification.js';
import Comment from '../models/Comment.js';

export const createBlog = async (req, res) => {
    let authorId = req.user;
    let { title, banner, des, content, tags, draft,id } = req.body;
    let bannerUpload=""    
   
    if (!title.length) {
        return res.status(403).json({ error: "You must provide a title " });
    }
    
    if(!draft){
        if (!banner) {
            return res.status(403).json({ error: "You must provide a blog banner to publish it" });
        }
    
        
        if (!des.length || des.length > 200) {
            return res.status(403).json({ error: "You must provide a blog description under 200 characters" });
        }

        if (!content.blocks.length) {
            return res.status(403).json({ error: "There must be some blog content to publish it" });
        }

        if (!tags.length) {
            return res.status(403).json({ error: "You must provide a company name to publish the blog" });
        }
        try {
             bannerUpload = await cloudinary.uploader.upload(banner, {
                folder: "cloudinary-demo",
                resource_type: "image"
            });
           
        } catch (error) {
            return res.status(500).json({ error: "Image upload failed" });
        }
    }

    
  

        tags = tags.toLowerCase();
        let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, '-').trim() + nanoid();
      
        if(id){
           Blog.findOneAndUpdate({blog_id},{title,des,banner,content,tags,draft:draft?draft:false})
           .then(()=>{
            return res.status(200).json({id:blog_id})
           })
           .catch(err => {
            return res.status(500).json({ error: err.message });
           });
        }
        else{
            let blog = new Blog({
                title,
                des,
                banner: bannerUpload.secure_url, 
                content,
                tags,
                author: authorId,
                blog_id,
                draft: Boolean(draft)
            });
    
             
            blog.save()
                .then(blog => {
                    let incrementalVal = draft ? 0 : 1;
    
                    User.findOneAndUpdate(
                        { _id: authorId },
                        { $inc: { "account_info.total_posts": incrementalVal }, $push: { "blogs": blog._id } }
                    )
                    .then(user => {
                        return res.status(200).json({ id: blog.blog_id });
                    })
                    .catch(err => {
                        return res.status(500).json({ error: "Failed to update total posts number" });
                    });
                })
                .catch(err => {
                    return res.status(500).json({ error: err.message });
                });
        }

         
       
   
};


export const getLatestBlog=(req,res)=>{

    let {page} = req.body

    let maxlimit=5
    Blog.find({draft:false})
    .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"publishedAt":-1})
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page-1)*maxlimit)
    .limit(maxlimit)
    .then(blogs=>{
        return res.status(200).json({blogs})
    })
    .catch(err=>{
        return res.status(500).json({error:err.message})
    })
}

export const getTrendingBlogs =(req,res)=>{

    Blog.find({draft:false})
    .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"activity.total_reads":-1,"activity.total_likes":-1,'publishedAt':-1})
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then(blogs=>{
        return res.status(200).json({blogs})
    })
    .catch(err=>{
        return res.status(500).json({error:err.message})
    })
}

export const getSearchBlog=(req,res)=>{
    let {tag,author,query,page,limit,eliminate_blog}=req.body;
    let findQuery 
   
    
    if(tag||query){
        findQuery ={draft:false,$or: [
            { title: new RegExp(query, 'i') }, 
            { tags: { $in: [query] } } 
        ],blog_id:{$ne:eliminate_blog}}
    }
    else if(author){
        findQuery={author,draft:false}
    }
    
    let maxLimit = limit? limit:2

    Blog.find(findQuery)
    .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"publishedAt":-1})
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page-1)*maxLimit)
    .limit(maxLimit)
    .then(blogs=>{
        return res.status(200).json({blogs})
    })
    .catch(err=>{
        return res.status(500).json({error:err.message})
    })

}

export const getAllLatestBlogs =(req,res)=>{
    Blog.countDocuments({draft:false})
    .then(count=>{
        return res.status(200).json({totalDocs:count})
    })
    .catch(err=>{
        console.log(err)
        return res.status(500).json({error:err.message})
    })
}


export const getSearchBlogCount=(req,res)=>{
    let {tag,author,query}=req.body
    let findQuery
    if(tag||query){
        findQuery ={draft:false,$or: [
            { title: new RegExp(query, 'i') }, 
            { tags: { $in: [query] } } 
        ]}
    }
    else if (author) {
        findQuery = { author, draft: false };
      }
    Blog.countDocuments(findQuery)
    .then(count=>{
        return res.status(200).json({totalDocs:count})
    })
    .catch(err=>{
        console.log(err)
        return res.status(500).json({error:err.message})
    })
}


export const getUers=(req,res)=>{
    let {query}=req.body

    User.find({"personal_info.username":new RegExp(query,'i')})
    .limit(50)
    .select("personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .then(users=>{
        return res.status(200).json({users})
    })
    .catch(err=>{
        console.log(err)
        return res.status(500).json({error:err.message})
    })
}

export const getBlog =(req,res)=>{
    let { blog_id, draft, mode } = req.body; //destructuring blog_id from d frontend

    let increamentVal = mode != 'edit' ? 1 : 0;
    
  
    Blog.findOneAndUpdate(
      { blog_id },
      { $inc: { 'activity.total_reads': increamentVal } }
    )
      
      .populate(
        'author',
        'personal_info.fullname personal_info.username personal_info.profile_img'
      )
      .select('title des content banner activity publishedAt blog_id tags')
      .then((blog) => {
        User.findOneAndUpdate(
          { 'personal_info.username': blog.author.personal_info.username }, //10 people have read the blog i posted
          { $inc: { 'account_info.total_reads': increamentVal } }
        ).catch((err) => {
          return res.status(500).json({ error: err.message });
        });
       
        
        if (blog.draft && !draft) {
          
          return res
            .status(500)
            .json({ error: 'you can not access draft blogs' });
        }
  
        return res.status(200).json({ blog });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
}

export const LikeBlog =(req,res)=>{
    let user_id = req.user;

    let { _id, isLikedByUser } = req.body;
  
    let increamentVal = !isLikedByUser ? 1 : -1;
  
    Blog.findOneAndUpdate(
      { _id },
      { $inc: { 'activity.total_likes': increamentVal } }
    ).then((blog) => {
      if (!isLikedByUser) {
        let like = new Notification({
          type: 'like',
          blog: _id,
          notification_for: blog.author,
          user: user_id,
        });
  
        like.save().then((notification) => {
          return res.status(200).json({ liked_by_user: true });
        });
      } else {
        //delete notification if blog is unliked by d user
        Notification.findOneAndDelete({ user: user_id, type: 'like', blog: _id })
          .then((data) => {
            
            return res.status(200).json({ liked_by_user: false });
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
        }
    });
}
export const getIsLiked=(req,res)=>{

    let user_id = req.user;

    let { _id } = req.body; // get d blog ID
  
    Notification.exists({ user: user_id, type: 'like', blog: _id })
      .then((result) => {
        return res.status(200).json({ result });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });

}

export const AddComment =(req,res)=>{
    let user_id = req.user;

    let { _id, comment, blog_author, replying_to, notification_id } = req.body;
   
  
    if (!comment.length) {
      return res
        .status(403)
        .json({ error: 'Write something to leave a comment...' });
    }
  
   
    let commentObj = {
      blog_id: _id,
      blog_author, 
      comment,
      commented_by: user_id, 
    };
  
    if (replying_to) {
      
      commentObj.parent = replying_to;
      commentObj.isReply = true; 
    }
  
    new Comment(commentObj).save().then(async (commentFile) => {
      

      let { comment, commentedAt, children } = commentFile;
  
      Blog.findOneAndUpdate(
        { _id },
        {
         
          $push: { comments: commentFile._id },
          $inc: {
            'activity.total_comments': 1,
            'activity.total_parent_comments': replying_to ? 0 : 1,
          },
        }
      ).then((blog) => {
        
        console.log('New comment created');
      });
   
      let notificationObj = {
        type: replying_to ? 'reply' : 'comment',
        blog: _id,
        notification_for: blog_author,
        user: user_id,
        comment: commentFile._id,
      };
  
      if (replying_to) {
        notificationObj.replied_on_comment = replying_to; // the comment i'm replying to
  
        await Comment.findOneAndUpdate(
          { _id: replying_to },
          { $push: { children: commentFile._id } }
          //children array contains all of the reply
          //comentFile._id is gtting added to the children cos it's a reply
        ).then((replyingToCommentDoc) => {
          notificationObj.notification_for = replyingToCommentDoc.commented_by;
        });
  
        if (notification_id) {
          //notification for reply
          Notification.findOneAndUpdate(
            { _id: notification_id },
            { reply: commentFile._id }
          ).then((notification) => {
            console.log('notification updated');
          });
        }
        /*
        _id of the comment document will equal to d comment ID
        */
      }
  
      new Notification(notificationObj).save().then((notification) => {
        console.log('new notification created');
      });
  
      return res.status(200).json({
        comment,
        commentedAt,
        _id: commentFile._id,
        user_id,
        children,
      });
    });
}

export const getBlogcomments =(req,res)=>{
    let { blog_id, skip } = req.body;

    let maxLimit = 5;
  

    Comment.find({ blog_id, isReply: false }) 
      .populate(
        'commented_by',
        'personal_info.username personal_info.fullname personal_info.profile_img'
      )
      .skip(skip)
      .limit(maxLimit)
      .sort({
        commentedAt: -1,
      })
      .then((comment) => {
        // console.log(comment, blog_id, skip);
        return res.status(200).json(comment);
      })
      .catch((err) => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
      });
}

export const getReplies=(req,res)=>{
  let { _id, skip } = req.body;

  let maxLimit = 5;

  // get the parent commet i want to get d replies
  Comment.findOne({ _id }) //this will find replies for this comment ID
    //find d comment and populate d children array
    .populate({
      path: 'children',
      options: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: -1 },
      },
      populate: {
        //this is populating all d data of the children array
        path: 'commented_by',
        select:
          'personal_info.profile_img personal_info.fullname personal_info.username',
      },
      select: '-blog_id -updatedAt',
    })
    .select('children')
    .then((doc) => {
      return res.status(200).json({ replies: doc.children });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
}

const deleteComments = (_id) => {
  Comment.findOneAndDelete({ _id })
    .then((comment) => {
      // delete d comment
      // check if the comment has a parent key
      //this means it's a reply if it has a parent
      if (comment.parent) {
        //find d comment parent and pull it's children
        Comment.findOneAndUpdate(
          { _id: comment.parent },
          { $pull: { children: _id } }
        ).then((data) => console.log('comment deleted from parent'));
      }

      //DELETE THE COMMENT FROM NOTIFICATION TOO
      Notification.findOneAndDelete({ comment: _id }).then((notification) =>
        console.log('comment notification deleted')
      );

      //DELETE THE REPLY FROM NOTIFICATION TOO
      Notification.findOneAndUpdate(
        { reply: _id },
        { $unset: { reply: 1 } }
      ).then((notification) => console.log('comment notification deleted'));

      //DELETE THE COMMENT FROM THE BLOG
      Blog.findOneAndUpdate(
        { _id: comment.blog_id }, //this refernce to the parent comment
        {
          $pull: { comments: _id },
          $inc: { 'activity.total_comments': -1 }, //remove 1
          'activity.total_parent_comments': comment.parent ? 0 : -1,
          //if i'm removing d parent Comment, there is no point in removing 1 from total_parent_comment cos it won't count again
        }
        //comment.parent ? 0 : -1   if the comment has a parent meaning it is reply i won't remove anythin from d parent comment
        // if it is a Comment, i will remove 1 from the total_parent_comment
      ).then((blog) => {
        if (comment.children.length) {
          //this comment is making reference to d comment i am deleting
          //if comment has some replies
          comment.children.map((replies) => {
            deleteComments(replies);
          }); //loop those replies and called the function again
          //if there is no reply, this function wont call itself
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });

  }
export const deleteComment = (req, res) => {
  let user_id = req.user; //get user who's deleting

  let { _id } = req.body;

  Comment.findOne({ _id }).then((comment) => {
    //find d comment i want to delete
    // console.log(comment.commented_by);
    // console.log(user_id);
    if (user_id == comment.commented_by || user_id == comment.blog_author) {
      //run this function if user log in user or d commented user
      deleteComments(_id); //this check all loops and nested loops

      return res.status(200).json({ status: 'done' });
    } else {
      return res.status(403).json({ error: 'You can not delete this comment' });
    }
  });
}

export const UserWrittenBlogs =(req,res)=>{

  let user_id = req.user;

  let { page, draft, query, deletedDocCount } = req.body;

  let maxLimit = 2;
  let skipDocs = (page - 1) * maxLimit;

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  Blog.find({ author: user_id, draft, title: new RegExp(query, 'i') })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select('title banner publishedAt blog_id activity des draft -_id')
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
}

export const UserWrittenBlogsCount = (req,res)=>{

  let user_id = req.user;

  let { draft, query } = req.body;

  Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, 'i') })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });

}

export const DeleteBlog =(req,res)=>{
  let user_id = req.user;
  let { blog_id } = req.body;

  Blog.findOneAndDelete({ blog_id })
    .then((blog) => {
      Notification.deleteMany({ blog: blog._id }).then((data) =>
        console.log('notifications deleted')
      );
      Comment.deleteMany({ blog: blog._id }).then((data) =>
        console.log('comment deleted')
      );

      User.findOneAndUpdate(
        { _id: user_id },
        { $pull: { blog: blog._id }, $inc: { 'account_info.total_posts': -1 } }
      ).then((user) => console.log('Blog deleted'));

      return res.status(200).json({ status: 'done' });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
}