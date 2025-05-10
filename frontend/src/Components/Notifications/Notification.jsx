import React, { useEffect, useState } from "react";
import NotificationCard from "./NotificationCard";
import { api } from "../../Config/apiConfig";

export default function Notification({
  notificationCount,
  setNotificationCount,
}) {
  const [notifications, setNotifications] = useState(null);
  const [trigger, setTrigger] = useState(false);

  const getNotifications = () => {
    api
      .get("/notifications")
      .then((res) => {
        const unreadNotifications = res.data.filter(
          (notification) => !notification.isRead
        );

        setNotifications(res.data);
        setNotificationCount(unreadNotifications.length);
        console.log("Get Notifications", res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getNotifications();
  }, [trigger]);

  return (
    <div className="w-full flex flex-col pt-5 gap-3">
      {notifications && notifications.length ? (
        notifications.map((notification) => (
          <NotificationCard
            id={notification.id}
            user={notification.from}
            type={notification.type}
            isRead={notification.isRead}
            post={{
              id: notification?.postId,
              content: notification?.postContent,
            }}
            trigger={trigger}
            setTrigger={setTrigger}
          />
        ))
      ) : (
        <></>
      )}
    </div>
  );
}
