import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../App';
import { Toaster } from 'react-hot-toast';
import { FilterPagination } from '../common/FilterPagination';
import InPageNavigation from '../components/InPageNavigation';
import NoDataMessage from '../components/NoDataMessage';
import LoadMoreDataBtn from '../components/LoadMoreDataBtn';
import AnimateWrapper from '../common/PageAnimation';
import Loader from '../components/Loader';
import {ManageBlogCard , ManageDraftPost } from '../components/ManageBlogCard';
import { useSearchParams } from 'react-router-dom';


const ManageBlogs = () => {
  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [query, setQuery] = useState('');

  let activeTab = useSearchParams()[0].get('tab');

  let {
    userAuth,
    setUserAuth,
  } = useContext(UserContext);
  const access_token=userAuth?.access_token
  const new_notification_available=userAuth?.new_notification_available



  const handleSearch = (e) => {
    let searchQuery = e.target.value;

    setQuery(searchQuery);

    if (e.keyCode == 13 && setQuery.length) {
      setBlogs(null);
      setDrafts(null);
    }
  };
  const handleChange = (e) => {
    if (!e.target.value.length) {
      setQuery('');
      setBlogs(null);
      setDrafts(null);
    }
  };

  const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + '/blogs/user-written-blogs',
        {
          page,
          draft,
          query,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formatedData = await FilterPagination({
          state: draft ? drafts : blogs,
          data: data.blogs,
          page,
          user: access_token,
          countRoute: '/blogs/user-written-blogs-count',
          data_to_send: { draft, query },
        });
        // console.log(formatedData);
        if (draft) {
          setDrafts(formatedData);
        } else {
          setBlogs(formatedData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (access_token) {
      if (blogs === null) {
        getBlogs({ page: 1, draft: false });
      }
      if (drafts === null) {
        getBlogs({ page: 1, draft: true });
      }
    }
  }, [access_token, blogs, drafts, query]);

  return (
    <>
      <h1 className="max-md:hidden">Manage Blogs</h1>
      <div className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          type="search"
          className="w-full bg-grey p-4 pl-12 p-4 pr-6 rounded-full placeholder:text-dark-grey"
          placeholder="search Blogs"
          onChange={handleChange}
          onKeyDown={handleSearch}
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
      </div>
      <InPageNavigation
        routes={['Published Blogs', 'Drafts']}
        defaultActiveTabIndex={activeTab != 'draft' ? 0 : 1}
      >
        {blogs === null ? (
          <Loader />
        ) : blogs.result.length ? (
          <>
            {blogs.result.map((blog, i) => {
              return (
                <AnimateWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManageBlogCard
                    blog={{ ...blog, index: i, setStateFunc: setBlogs }}
                  />
                </AnimateWrapper>
              );
            })}

            <LoadMoreDataBtn
              state={blogs}
              fetchMoreData={getBlogs}
              additionalParams={{
                draft: false,
                deletedDocCount: blogs.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No published blogs" />
        )}

        {/* draft */}
        {drafts === null ? (
          <Loader />
        ) : drafts.result.length ? (
          <>
            {drafts.result.map((blog, i) => {
              return (
                <AnimateWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManageDraftPost
                    blog={{ ...blog, index: i, setStateFunc: setDrafts }}
                  />
                  
                </AnimateWrapper>
              );
            })}
            <LoadMoreDataBtn
              state={drafts}
              fetchMoreData={getBlogs}
              additionalParams={{
                draft: true,
                deletedDocCount: drafts.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No draft blogs" />
        )}
      </InPageNavigation>
    </>
  );
};

export default ManageBlogs;