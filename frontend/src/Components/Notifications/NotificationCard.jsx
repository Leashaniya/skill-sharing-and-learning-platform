import { Avatar } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { api } from "../../Config/apiConfig";

export default function NotificationCard({
  id,
  user,
  type,
  post,
  isRead,
  trigger,
  setTrigger,
}) {
  console.log("post DEBUG", post);

  const markAsRead = async (id, e) => {
    
    try {
      const response = await api.put(`/notifications/${id}/read`);
        setTrigger(!trigger);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return (
    <Link onClick={(e) => markAsRead(id, e)} to={`/profile/${user?.id}`}>
    <div className={`w-full p-4 border rounded ${!isRead ? "bg-sky-50" : ""}`}>
      <div className="flex flex-col gap-2">
        <Avatar alt={user?.fullName} src={user?.image} />
        <div>
            <span className="font-bold">{user?.fullName || "John Harry"}</span>
          <span>
            {type && type === "follow"
              ? " followed you"
              : type === "like"
              ? " liked your post"
              : ""}
          </span>
        </div>
      </div>
      {post && post.content ? (
        <div className="mt-2 text-xs p-2 rounded border bg-white">
          {post?.content}
        </div>
      ) : null}
    </div>
    </Link>
  );
}
