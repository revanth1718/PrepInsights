import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserContext } from '../App'
import { Navigate, useParams } from 'react-router-dom'
import BlogEditor from './BlogEditor'
import PublishForm from './PublishForm'
import Loader from './Loader'
import axios from 'axios'


const blogStucture = {
    title:"",
    banner:"",
    content : [],
    tags:"",
    des:"",
    author:{personal_info:{}}
}

export const EditorContext = createContext({});


const Editor = () => {
   let {blog_id}=useParams()

    const [blog,setBlog]=useState(blogStucture)
    const [editorState,setEditorState]=useState("editor")
    const [textEditor,setTextEditor]=useState({isReady:false})
    const [loading,setLoading]=useState(true)

    let {userAuth}=useContext(UserContext)
    const access_token = userAuth?.access_token;
    useEffect(()=>{
         if(!blog_id){
          return setLoading(false)
         }
        axios.post(import.meta.env.VITE_SERVER_DOMAIN+"/blogs/get-blog",{
          blog_id,draft:true,mode:"edit"
        })
        .then(({data:{blog}})=>{
          setBlog(blog)
          setLoading(false)
        })
        .catch(err=>{
          setBlog(null)
          setLoading(false)
        })
      
    },[])

  return (
    <EditorContext.Provider value={{blog,setBlog,editorState,setEditorState,textEditor,setTextEditor}}>
    {
    access_token==null ?
    <Navigate to="/signin" />
    :
    loading ? <Loader /> :
     editorState=="editor" ?
     <BlogEditor />
     :
     <PublishForm />
     }
     </EditorContext.Provider>
  )
}

export default Editor