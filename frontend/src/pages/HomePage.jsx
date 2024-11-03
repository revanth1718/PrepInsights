import React, { useEffect, useState } from 'react'
import AnimateWrapper from '../common/PageAnimation'
import InPageNavigation from '../components/InPageNavigation'
import axios from 'axios'
import Loader from '../components/Loader'
import BlogPostCard from '../components/BlogPostCard'
import  MinimalBlogCard  from '../components/MinimalBlogCard'
import NoDataMessage from '../components/NoDataMessage'
import { FilterPagination } from '../common/FilterPagination'
import LoadMoreDataBtn from '../components/LoadMoreDataBtn'

const HomePage = () => {
  let [blogs,setBlog]=useState(null)
  let [trendingBlogs,setTrendingBlog]=useState(null)



  const fetchLatestBlogs = ({page=1})=>{
    axios.post(import.meta.env.VITE_SERVER_DOMAIN+"/blogs/latest-blog",{page})
    .then(async ({data})=>{
         let formateData=await FilterPagination({
          state:blogs,
          data:data.blogs,
          page,
          countRoute:"/blogs/all-latest-blogs-count"
         })
        setBlog(formateData)
    })
    .catch(err=>{
      console.log(err)
    })
  }
 
  const fetchTrendingBlogs = ()=>{
    axios.get(import.meta.env.VITE_SERVER_DOMAIN+"/blogs/trending-blogs")
    .then(({data})=>{
        setTrendingBlog(data.blogs)
    })
    .catch(err=>{
      console.log(err)
    })
  }


  useEffect(()=>{
     fetchLatestBlogs({page:1})
     fetchTrendingBlogs()
  },[])

  return (
    <AnimateWrapper>
        <section className='h-cover flex justify-center gap-10'>
             {/* latest blogs */}
             <div className='w-full'>
               <InPageNavigation routes={['home','trending blogs']} defaultHidden={['trending blogs']}>
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
                <LoadMoreDataBtn state={blogs} fetchMoreData={fetchLatestBlogs} />
                </>
                
                {
                  trendingBlogs==null ? <Loader />:
                  trendingBlogs.length ?
                  trendingBlogs.map((blog,i)=>{
                    return <AnimateWrapper transition={{duration:1,delay:i*.1}} key={i}>
                        <MinimalBlogCard blog={blog} index={i} />
                    </AnimateWrapper>
                  })
                  :
                  <NoDataMessage message="No Trending Blogs"/>
                }
                
               </InPageNavigation>
             </div>

             <div className='min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden'>
              <h1 className='font-medium text-xl mb-8'>Trending</h1>
              {
                  trendingBlogs==null ? <Loader />:
                  trendingBlogs.length?
                  trendingBlogs.map((blog,i)=>{
                    return <AnimateWrapper transition={{duration:1,delay:i*.1}} key={i}>
                        <MinimalBlogCard blog={blog} index={i} />
                    </AnimateWrapper>
                  })
                  :
                  <NoDataMessage message="No Trending Blogs"/>
                }
             </div>
        </section>
    </AnimateWrapper>
  )
}

export default HomePage