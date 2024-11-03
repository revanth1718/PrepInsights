import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import InPageNavigation from '../components/InPageNavigation'
import LoadMoreDataBtn from '../components/LoadMoreDataBtn'
import BlogPostCard from '../components/BlogPostCard'
import AnimateWrapper from '../common/PageAnimation'
import NoDataMessage from '../components/NoDataMessage'
import Loader from '../components/Loader'
import axios from 'axios'
import { FilterPagination } from '../common/FilterPagination'
import UserCard from '../components/UserCard'

const Search = () => {
    let {query}=useParams()
    let [blogs,setBlog]=useState(null)
    let [users,setUsers]=useState(null)

    const searchBlog=({page=1,create_new_arr=false})=>{
        axios.post(import.meta.env.VITE_SERVER_DOMAIN+'/blogs/search-blogs',{query,page})
        .then(async ({data})=>{
            let formateData=await FilterPagination({
             state:blogs,
             data:data.blogs,
             page,
             countRoute:"/blogs/search-blogs-count",
             data_to_send:{query},
             create_new_arr
            })
           setBlog(formateData)
       })
       .catch(err=>{
         console.log(err)
       })
    }

    const fetchUsers =()=>{
        axios.post(import.meta.env.VITE_SERVER_DOMAIN+'/blogs/search-users',{query})
        .then(({data:{users}})=>{
            setUsers(users)
        })

    }

    useEffect(()=>{
        resetState() 
        searchBlog({page:1,create_new_arr:true})
        fetchUsers();
    },[query])

    const resetState=()=>{
        setBlog(null)
        setUsers(null)
    }

    const UserCardWrapper =()=>{
        return(
            <>
            { 
                users==null?<Loader />:
                users.length? 
                users.map((user,i)=>{
                    return <AnimateWrapper key={i} transition={{duration:1,delay:i*0.08}} >
                        <UserCard user={user} />
                    </AnimateWrapper>
                })
                :<NoDataMessage message="No User found" />


            }
            </>
        )
    }

  return (
    <section className='h-cover flex justify-center gap-10'>
        <div className='w-full'>
            <InPageNavigation routes={[`Search results from "${query}"` , "Accounts Hatched"]}
             defaultHidden={['Accounts Hatched']} >
               <>
               {
                  blogs==null ? <Loader />:
                 blogs.result.length ?
                 blogs.result.map((blog,i)=>{
                  return <AnimateWrapper transition={{duration:1,delay:i*.1}} key={i}>
                      <BlogPostCard content={blog} author={blog.author.personal_info} />
                  </AnimateWrapper>
                })
                :
                <NoDataMessage message="No Blogs"/>
                }
                <LoadMoreDataBtn state={blogs} fetchMoreData={searchBlog} />
               
               </>

               <UserCardWrapper />

             
            </InPageNavigation>

        </div>

        <div className='min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden'>
        <h1 className='font-medium text-xl mb-8'>Users realated to search</h1>
        <UserCardWrapper />
        </div>
    </section>
  )
}

export default Search