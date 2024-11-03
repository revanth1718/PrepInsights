import React from 'react';
import { getDay } from '../common/date';
import { Link } from 'react-router-dom';

const MinimalBlogCard = ({ blog, index }) => {
  let { publishedAt, tags, title, banner,author:{ personal_info:{fullname,username,profile_img}}, blog_id: id } = blog;

  return (
    <Link to={`/blog/${id}`} className='flex gap-5 mb-8 ' >
        <h1 className='blog-index'>{index <10 ? "0"+(index+1):index} </h1>
      <div className='w-full'>
      <div className='flex gap-2 items-center mb-7'>
            <img src={profile_img} className='w-6 h-6 rounded-full' />
            <p className='line-clamp-1' >{fullname}</p>
            <p className='min-w-fit'>{getDay(publishedAt)} </p>
         </div>
        <h1 className='blog-title'>{title}</h1>
        </div>

    </Link>
  );
};

export default MinimalBlogCard;
