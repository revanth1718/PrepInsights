import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AnimateWrapper from '../common/PageAnimation'
import toast, { Toaster } from 'react-hot-toast'
import { EditorContext } from './Editor'
import EditorJS from '@editorjs/editorjs';
import { tools } from './Tools'
import axios from 'axios'
import { ThemeContext, UserContext } from '../App'

import lightLogo from '../imgs/Prep.png';
import darkLogo from '../imgs/darkPrep.png';
import darkBanner from '../imgs/blog-banner-dark.png';
import lightBanner from '../imgs/banner.png';

const BlogEditor = () => {

    let {blog,blog:{title,banner,content,tags,des},setBlog,textEditor,setTextEditor,setEditorState}=useContext(EditorContext)
    let {userAuth:{access_token}}=useContext(UserContext)

    let { theme } = useContext(ThemeContext);

    let {blog_id}=useParams()

    let navigate=useNavigate()

    useEffect(()=>{
        if(!textEditor.isReady){
            setTextEditor(new EditorJS({
                holderId:"textEditor",
                data:Array.isArray(content) ? content[0]:content,
                tools:tools,
                placeholder:"Let's write an awesome story"
          }))
        }
        
    },[])

    

   
    const handleBannerUpload=  (e)=>{
            let img=e.target.files[0]

            var reader=new FileReader()
             reader.onloadend = function(){
                setBlog({...blog,banner:reader.result})
             }
             reader.readAsDataURL(img)

            
           
        }

    const handleTitleKeyDown=(e)=>{
        if(e.keyCode==13){
            e.preventDefault()
        }
    }

    const handleTitleChange=(e)=>{
          let input=e.target;

          input.style.height='auto'

          input.style.height=input.scrollHeight+'px'
          setBlog({...blog,title:input.value})
    }

    const handleError = (e) => {
        let img = e.target;
        img.src = theme === 'light' ? lightBanner : darkBanner;
      };

    const handlePublishEvent=()=>{
        
        if(!banner.length){
           
            return toast.error("Upload a blog banner to publish")
        }
        if(!title.length){
            
            return toast.error("write blog title to publish it")
        }
        if(textEditor.isReady){
            textEditor.save()
            .then(data=>{
                if(data.blocks.length){
                    setBlog({...blog,content:data})
                    setEditorState("Publish")
                }else{
                    return toast.error("Write something in your blog to publish it")
                }
            })
            .catch((err)=>{
                console.log(err)
            })
        }
    }
    const handleSaveDraft = (e) => {
        if (e.target.className.includes('disable')) {
            return;
        }
        if (!title.length) {
            return toast.error("Write blog title before saving it as Draft");
        }
    
        let loadingToast = toast.loading("Saving Draft...");
    
        e.target.classList.add('disable');
    
        if (textEditor.isReady) {
            textEditor.save().then(content => {
                let blogObj = {
                    title,
                    banner, // This contains the base64 string from the `handleBannerUpload` function
                    des,
                    content,
                    tags,
                    draft: true
                };
    
                console.log(blogObj);
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/upload/create-blog", { ...blogObj, id: blog_id }, {
                    headers: {
                        "Authorization": `Bearer ${access_token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(() => {
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
                    toast.success("Saved");
                    setTimeout(() => {
                        navigate("/");
                    }, 500);
                })
                .catch((error) => {
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
    
                    if (error.response && error.response.status === 413) {
                        return toast.error("Payload too large. Please reduce the size of your content.");
                    }
    
                    return toast.error(error.response.data.error);
                });
            });
        }
    };
    

  return (
    <>
    <nav className='navbar'>
        <Link to="/" className='flex-none w-10'>
        <img
            src={theme === 'light' ? darkLogo : lightLogo}
            alt="logo"
            className="flex-none w-10"
          />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title ? title : 'New Blog'}
        </p>
        <div className='flex gap-4 ml-auto'>
            <button className='btn-dark py-2'
            onClick={handlePublishEvent}>
                Publish
            </button>
            <button className='btn-light py-2'
            onClick={handleSaveDraft}>
                Save Draft
            </button>
        </div>
    </nav>
    <Toaster />
    <AnimateWrapper>
        <section>
            
            <div className='mx-auto max-w-[900px] w-full'>
              <div className='relative aspect-video hover:opacity-80  border-4 border-grey '>
                <label htmlFor='image'>
                    <img 
                    src={banner} 
                    className='z-20'
                    onError={handleError}/>
                  <input 
                  id='image'
                  type='file'
                  accept='image/*'
                  hidden
                  onChange={handleBannerUpload}
                  />
                </label>
               
              </div>
              <p className='text-gray-500'>***image should be less 1mb</p>
              <textarea
              defaultValue={title}
              placeholder='Blog Title'
              className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white'
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}>
              </textarea>
              <hr className='w-full opacity-10 my-5' />
              <div id='textEditor' className='font-gelasio '>

              </div>
            </div>
        </section>
    </AnimateWrapper>
    </>
  )
}

export default BlogEditor