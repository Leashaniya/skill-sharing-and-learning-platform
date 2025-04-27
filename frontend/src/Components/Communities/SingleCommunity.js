"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

function SingleCommunity() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const { auth } = useSelector((store) => store);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [refetch, setRefetch] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`http://localhost:5454/api/groups/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setGroup(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });

    axios
      .get(`http://localhost:5454/api/groups/${id}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setMembers(res.data);
        const isMember = res.data.some(
          (member) => member.userId === auth.user.id
        );
        setIsMember(isMember);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id, auth.user.id, refetch]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5454/api/groups/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          "Content-Type": "application/json",
        },
      });
      navigate("/communities");
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };
  const handleJoinGroup = async (id) => {
    try {
      await axios
        .post(
          `http://localhost:5454/api/groups/${id}/users/${auth?.user.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwt")}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          setRefetch((prev) => !prev);
          setIsMember(true);
        })
        .catch((err) => {
          console.error(err);
          setIsMember(false);
        });
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Community not found
        </h2>
        <p className="mt-2 text-gray-500">
          The community you're looking for doesn't exist or you don't have
          access.
        </p>
        <button
          onClick={() => navigate("/groups")}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue500text-blue-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Communities
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate("/communities")}
        className="inline-flex items-center text-sm font-medium text-blue-500 hover:text-indigo-500 mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to Communities
      </button>

      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8">
        <img
          src={group.groupImage || "/placeholder.svg?height=320&width=1024"}
          alt={group.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                group.isPublic
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {group.isPublic ? "Public Community" : "Private Community"}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {members?.length || 0} Members
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {group.name}
          </h1>
        </div>
      </div>
      <div className="flex justify-end py-2 items-center ">
        <button
          className={`inline-flex items-end justify-end px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isMember
              ? "bg-green-500 text-white cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          onClick={() => handleJoinGroup(group.id)}
          disabled={isMember}
        >
          {isMember ? (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Joined
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Join
            </>
          )}
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-indigo-700 ">
            📢 About this Community
          </h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {group.description ||
              "No description available for this community."}
          </p>
        </div>
      </div>

      {group.ownerId === auth.user.id && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h2 className=" font-semibold mb-4 text-blue-500">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate(`/community/edit/${id}`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white  bg-blue-500 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Community
            </button>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => setShowConfirmation(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Delete Community
            </button>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-center mb-2">
              Delete Community
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this community? This action cannot
              be undone and all data will be permanently removed.
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
                onClick={() => setShowConfirmation(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md flex items-center"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete Community"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SingleCommunity;
