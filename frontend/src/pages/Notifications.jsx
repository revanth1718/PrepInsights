import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../App';
import Loader from '../components/Loader';
import AnimateWrapper from '../common/PageAnimation';
import NoDataMessage from '../components/NoDataMessage';
import LoadMoreDataBtn from '../components/LoadMoreDataBtn';
import { FilterPagination } from '../common/FilterPagination';
import NotificationCard from '../components/notificationCard';

const Notifications = () => {
  let {
    userAuth,
    
    setUserAuth,
  } = useContext(UserContext);
  
  const access_token=userAuth?.access_token
  const new_notification_available=userAuth?.new_notification_available
  

  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState(null);

  let filters = ['all', 'like', 'comment', 'reply'];

  const fetchNotification = ({ page, deletedDocCount = 0 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + '/profile/notifications',
        { page, filter, deletedDocCount },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      .then(async ({ data: { notifications: data } }) => {
        if (new_notification_available) {
          setUserAuth({ ...userAuth, new_notification_available: false });
        }
        let formatedData = await FilterPagination({
          state: notifications,
          data,
          page,
          countRoute: '/profile/all-notifications-count',
          data_to_send: { filter },
          user: access_token,
        });
        setNotifications(formatedData);
         
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (access_token) {
      //call notionfition whenever d page is changed/reload, or filter is change, or access_token is change
      fetchNotification({ page: 1 });
    }
  }, [access_token, filter]);

  const handleFilterFunc = (e) => {
    let btn = e.target;

    setFilter(btn.textContent);
    setNotifications(null); //first set to null, then reload by useEffect
  };

  return (
    <div>
      <h1 className="max-md:hidden">Recent Notifications</h1>

      <div className="my-8 flex gap-6">
        {filters.map((filterName, i) => {
          return (
            <button
              className={`py-2 ${
                filter === filterName ? 'btn-dark' : 'btn-light'
              }`}
              key={i}
              onClick={handleFilterFunc}
            >
              {filterName}
            </button>
          );
        })}
      </div>
      {notifications === null ? (
        <Loader />
      ) : (
        <div>
          {notifications.result.length ? (
            notifications.result.map((notification, i) => {
              return (
                <AnimateWrapper key={i} transition={{ delay: i * 0.08 }}>
                  <NotificationCard
                    data={notification}
                    index={i}
                    notificationState={{ notifications, setNotifications }}
                  />
                </AnimateWrapper>
              );
            })
          ) : (
            <NoDataMessage message={'Nothing available'} />
          )}

          <LoadMoreDataBtn
            state={notifications}
            fetchMoreData={fetchNotification}
            additionalParams={{
              deletedDocCount: notifications.deletedDocCount,
            }}
          />
        </div>
      )}
    </div>
  );
};
export default Notifications; 