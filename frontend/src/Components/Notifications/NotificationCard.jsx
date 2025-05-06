import { Avatar } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

export default function NotificationCard({ user, type, post }) {
  console.log("post DEBUG", post);

  return (
    <Link to={`/profile/${user.id}`}>
      <div className="w-full p-4 border-b">
        <div className="flex flex-col gap-2">
          <Avatar alt={user?.fullName} src={user?.image} />
          <div>
            <span className="font-bold">{user?.fullName || "John Harry"}</span>
            <span>
              {type && type == "follow"
                ? " followed you"
                : type == "like"
                ? " liked your post"
                : ""}
            </span>
          </div>
        </div>
        {post && post.content ? <div className="mt-2 text-xs p-2 rounded border">{post?.content}</div> : <></>}
      </div>
    </Link>
  );
}
