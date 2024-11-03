import { Link } from 'react-router-dom';
import { getDay } from '../common/date';
import { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../App';

const BlogStat = ({ stat }) => {
  return (
    <div className="flex gap-2 max-lg:col max-lg:border-b mb-6 pb-6 border-grey">
      {Object.keys(stat).map((key, i) => {
        return !key.includes('parent') ? (
          <div
            key={i}
            className={`flex flex-col items-center w-full 
                h-full justify-center p-4 px-6 ${
                  i != 0 ? 'border-grey border-l' : ''
                }`}
          >
            <h1 className="mx-lg:text-dark-grey capitalize">
              {stat[key].toLocaleString()}
            </h1>
            <p>{key.split('_')[1]}</p>
          </div>
        ) : (
          ''
        );
      })}
    </div>
  );
};

export const ManageBlogCard = ({ blog }) => {
  let { banner, blog_id, title, publishedAt, activity } = blog;
  let {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  let [showStat, setShowStat] = useState(false);

  // console.log(showStat);

  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey p-6 items-center">
        <img
          src={banner}
          className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover"
        />
        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div>
            <Link
              to={`/blog/${blog_id}`}
              className="blog-title mb-4 hover:underline"
            >
              {title}
            </Link>
            <p className="line-clamp-1">Published on {getDay(publishedAt)}</p>
          </div>
          <div className="flex gap-6 mt-3">
            <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">
              Edit
            </Link>
            <button
              className="lg:hidden pr-4 py-2 underline"
              onClick={() => setShowStat((preVal) => !preVal)}
            >
              Stats
            </button>
            <button
              className="pr-4 py-2 underline text-red"
              onClick={(e) => deleteBlog(blog, access_token, e.target)}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="max-lg:hidden">
          <BlogStat stat={activity} />
        </div>
      </div>
      {showStat ? (
        <div className="lg:hidden">
          <BlogStat stat={activity} />
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export const ManageDraftPost = ({ blog }) => {
  let { title, des, blog_id, index } = blog;
  let {
    userAuth,
    setUserAuth,
  } = useContext(UserContext);
  const access_token=userAuth?.access_token

  index++;

  return (
    <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
      <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">
        {index < 10 ? '0' + index : index}
      </h1>
      <div>
        <h1 className="blog-title mb-3">{title}</h1>
        <p className="line-clamp-2">{des.length ? des : 'No Description'}</p>

        <div className="flex gap-6 mt-3">
          <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">
            Edit
          </Link>
          <button
            onClick={(e) => deleteBlog(blog, access_token, e.target)}
            className="pr-4 py-2 underline text-red"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const deleteBlog = (blog, access_token, target) => {
  let { index, blog_id, setStateFunc } = blog;

  target.setAttribute('disabled', true);

  axios
    .post(
      import.meta.env.VITE_SERVER_DOMAIN + '/blogs/delete-blog',
      {
        blog_id,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )
    .then(({ data }) => {
      target.removeAttribute('disabled');
      setStateFunc((preVal) => {
        let { deletedDocCount, totalDocs, result } = preVal;

        result.splice(index, 1);

        if (!result.length && totalDocs - 1 > 0) {
          return null;
        }

        if (!deletedDocCount) {
          deletedDocCount = 0;
        }
        console.log({
          ...preVal,
          totalDocs: totalDocs - 1,
          deletedDocCount: deletedDocCount + 1,
        });
        return {
          ...preVal,
          totalDocs: totalDocs - 1,
          deletedDocCount: deletedDocCount + 1,
        };
      });
    })
    .catch((err) => {
      console.log(err);
    });
};