import React, { useEffect, useState } from "react";
import NotificationCard from "./NotificationCard";
import { api } from "../../Config/apiConfig";

export default function Notification() {
  const [notifications, setNotifications] = useState(null);

  const getNotifications = () => {
    api
      .get("/notifications")
      .then((res) => {
        setNotifications(res.data);
        console.log(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getNotifications();
  }, []);

  return (
    <div className="w-full">
      {notifications && notifications.length ? (
        notifications.map((notification) => (
          <NotificationCard user={notification.from} type={notification.type} post={ {id : notification?.postId, content: notification?.postContent} } />
        ))
      ) : (
        <></>
      )}
    </div>
  );
}
