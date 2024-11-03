import React, { useContext } from 'react'
import AnimateWrapper from '../common/PageAnimation'
import toast, { Toaster } from 'react-hot-toast'
import { EditorContext } from './Editor'
import axios from 'axios'
import { UserContext } from '../App'
import { useNavigate, useParams } from 'react-router-dom'

const PublishForm = () => {


  let {blog,blog:{banner,title,tags,des,content},setEditorState,setBlog}=useContext(EditorContext)
  let characterLimit=200
   let {userAuth}=useContext(UserContext)
   const access_token=userAuth?.access_token


   let {blog_id}=useParams()

 let navigate=useNavigate();

  const handleCloseEvent =()=>{
    setEditorState("editor")
  }

  const handleTitleChange =(e)=>{
    let title=e.target
    setBlog({...blog,title:title.value})
  }

  const handleTitleKeyDown=(e)=>{
    if(e.keyCode==13){
        e.preventDefault()
    }
   }

   const PublishBlog = (e) => {
    if (e.target.className.includes('disable')) {
        return;
    }
    if (!title.length) {
        return toast.error("Write blog title before publishing");
    }
    if (!des.length || des.length > characterLimit) {
        return toast.error(`Write a description about your blog within ${characterLimit} characters to publish`);
    }
    if (!tags.length) {
        return toast.error("Enter at least 1 tag to help us rank your blog");
    }

    let loadingToast = toast.loading("Publishing...");

    e.target.classList.add('disable');

    // Creating the blog object with base64 banner image
    let blogObj = {
        title,
        banner, // This contains the base64 string from the `handleBannerUpload` function
        des,
        content,
        tags,
        draft: false
    };


    console.log("tags in frontend",tags)    
    // Send blogObj directly
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/upload/create-blog", {...blogObj,id:blog_id}, {
        headers: {
            "Authorization": `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(() => {
        e.target.classList.add('disable');

        toast.dismiss(loadingToast);
        toast.success("Published");
        setTimeout(() => {
            navigate("/");
        }, 500);
    })
    .catch(({ response }) => {
        e.target.classList.remove('disable');
        toast.dismiss(loadingToast);
        return toast.error(response.data.error);
    });
};


  return (
    <AnimateWrapper >
      <section className='w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4'>

         <Toaster />
         <button className='w-12 h-12 absolute right-[5vw]  top-[5%] lg:top-[10%]'
         onClick={handleCloseEvent}
         >
         <i className="fi fi-br-cross" ></i>
         </button>
         <div className='max-w-[550px] center '>
          <p className='text-dark-grey mb-1'>Preview</p>
          <div className='w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4'>
            <img src={banner} />
          </div>
          <h1 className='text-4xl font-medium mt-2 leading-tight line-clamp-2 '>{title}</h1>
          <p className='font-gelasio line-clamp-2 text-xl leading-7 mt-4'>{des}</p>
         </div>
         <div className='border-grey lg:border-1 lg:pl-8'>
           <p className='text-dark-grey mb-2 mt-9'>Blog Title</p>
           <input type='text' placeholder='BlogTitle' 
           defaultValue={title} className='input-box pl-4'
           onChange={handleTitleChange}/>
         
         <p className='text-dark-grey mb-2 mt-9'>Short description about your blog</p>
           <textarea
           maxLength={characterLimit}
           defaultValue={des}
           className='h-40 resize-none leading-7 input-box pl-4'
           onChange={(e)=>{setBlog({...blog,des:e.target.value})}}
           onKeyDown={handleTitleKeyDown}>

           </textarea>
           <p className='mt-1 text-dark-grey text-sm text-right '>{characterLimit-des.length} characters left</p>

           <p className='text-dark-grey mb-2 mt-9'>Company Name-(Helps in Searching post )</p>
           <input type='text' placeholder='Company Name' 
           defaultValue={tags} className='input-box pl-4'
           onChange={(e)=>{setBlog({...blog,tags:e.target.value})}}/>
          <button className='btn-dark px-8 mt-3'
          onClick={PublishBlog}>
            Publish</button>
         </div>
        
      </section>
    </AnimateWrapper>
  )
}

export default PublishForm