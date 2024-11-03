import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UserContext } from "../App";
import AnimateWrapper from "../common/PageAnimation";
import Loader from "../components/Loader";
import { FilterPagination } from "../common/FilterPagination";
import AboutUser from "../components/AboutUser";
import InPageNavigation from "../components/InPageNavigation";
import NoDataMessage from "../components/NoDataMessage";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import PageNotFound from "../components/PageNotFound";
import BlogPostCard from "../components/BlogPostCard";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: {},
  joinedAt: "",
};

const Profile = () => {
  const { id: profileId } = useParams();

  const [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState(null);
  let [profileLoaded, setProfileLoaded] = useState("");

  let {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  let {
    userAuth
  } = useContext(UserContext);
  const username=userAuth?.username



  const fetchUserProfile = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/profile/get-profile`, {
        username: profileId,
      })
      .then(({ data: user }) => {
        if (user != null) {
          setProfile(user);
        }
        setProfileLoaded(profileId);
        getBlogs({ user_id: user._id });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(true);
      });
  };


  const getBlogs = ({ page = 1, user_id }) => {
    user_id = user_id === undefined ? blogs.user_id : user_id;
    //update users
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/blogs/search-blogs`, {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        let formatData = await FilterPagination({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: '/blogs/search-blogs-count',
          data_to_send: { author: user_id },
        });

        formatData.user_id = user_id;
        console.log(formatData);
        setBlogs(formatData);
      });
  };

  const resetState = () => {
    setProfile(profileDataStructure);
    setLoading(true);
    setProfileLoaded('');
  };

  useEffect(() => {
    if (profileId != profileLoaded) {
      setBlogs(null);
    }

    if (blogs === null) {
      resetState();
      fetchUserProfile();
    }
  }, [profileId,blogs]);

  return (
    <AnimateWrapper>
      {loading ? (
        <Loader />
      ) : 
         profile_username.length ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
          <div
            className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:min-[50%] md:pl-8 md:border-1
            border-grey md:sticky md:top-[100px] md:py-10"
          >
            <img
              src={profile_img}
              className="md:w-32 md:h-32 h-48 w-48 bg-grey rounded-full"
            />
            <h1 className="text-2xl font-medium">@{profile_username}</h1>
            <p className="text-xl capitalize h-6">{fullname}</p>

            <p>
              {total_posts.toLocaleString()} Blogs{" "}
              {total_reads.toLocaleString()} Reads
            </p>
            <div className="flex gap-4 mt-2">
              {profileId === username ? (
                <Link
                  to={"/settings/edit-profile"}
                  className="btn-light rounded-md"
                >
                  Edit Profile
                </Link>
              ) : (
                ""
            )}
            </div>
            <AboutUser
              className={'max-md:hidden'}
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
            />
          </div>
          <div className="max-md:mt-12 w-full">
            <InPageNavigation
              //   pageState holds value of home and other target from category
              routes={['Blogs published', 'About']}
              defaultHidden={['About']}
            >
              <>
                {blogs === null ? (
                  <Loader />
                ) : blogs.result.length ? (
                  blogs.result.map((blog, i) => {
                    return (
                      <AnimateWrapper
                        transition={{ duration: 1, delay: i * 0.1 }}
                        key={i}
                      >
                        <BlogPostCard
                          content={blog}
                          author={blog.author.personal_info}
                        />
                      </AnimateWrapper>
                    );
                  })
                ) : (
                  <NoDataMessage message={'No blogs published'} />
                )}
                <LoadMoreDataBtn state={blogs} fetchMoreData={getBlogs} />
              </>
              <AboutUser
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </InPageNavigation>
          </div>
          </section>
        ): (
        <PageNotFound />
      )}
    </AnimateWrapper>
  );
};

export default Profile;
