"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

function ViewPlansPage() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareId, setShareId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { auth } = useSelector((store) => store);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:5454/api/learning-plans`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      setPlans(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      setError("Failed to load learning plans. Please try again.");
      setIsLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:5454/api/learning-plans/${deleteId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
        }
      );
      setShowDeleteModal(false);
      setIsDeleting(false);
      setDeleteId(null);
      fetchPlans();
    } catch (err) {
      console.error("Failed to delete plan:", err);
      setIsDeleting(false);
    }
  };

  const shareConfirm = (id) => {
    setShareId(id);
    setShowShareModal(true);
  };
  console.log(auth.user);
  const handleShare = async () => {
    if (!shareId) return;

    setIsDeleting(true);
    try {
      await axios.post(
        `http://localhost:5454/api/learning-plans/${shareId}/share?userId=${auth.user.id}&userName=${auth.user.fullName}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
        }
      );
      setShowShareModal(false);
      setShareId(null);
      fetchPlans();
    } catch (err) {
      console.error("Failed to delete plan:", err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold text-blue-500">My Learning Plans</h1>
        </div>
        <button
          className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          onClick={() => navigate("/plans/add")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create New Plan
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
              <div className="flex gap-3">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-2">
                <button
                  className="text-sm font-medium text-red-700 hover:text-red-600"
                  onClick={() => fetchPlans()}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No learning plans yet
          </h3>
          <p className="mt-1 text-gray-500 max-w-sm mx-auto">
            Get started by creating your first learning plan.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/plans/add")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create New Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1  gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 line-clamp-1">
                    {plan.title}
                  </h2>
                </div>

                <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                  {plan.description}
                </p>

                <div className="flex items-center text-sm text-gray-700 mb-2">
                  <span className="font-semibold mr-2">📚 Topics:</span>{" "}
                  {plan.topics || "Not specified"}
                </div>

                <div className="flex items-center text-sm text-gray-700 mb-2">
                  <span className="font-semibold  mr-2">
                    🔗 Resources:
                  </span>{" "}
                  {plan.resources ? (
                    <a
                      href={plan.resources}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {plan.resources}
                    </a>
                  ) : (
                    "No resources"
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-700 mb-2">
                  <span className="font-semibold mr-2">📅 Deadline:</span>{" "}
                  {plan.deadline || "No deadline"}
                </div>

                <div className="flex items-center text-sm text-gray-700 mb-6">
                  <span className="font-semibold mr-2">👥 Shared With:</span>
                  {plan.sharedPlans ? plan.sharedPlans.length : 0}{" "}
                  {plan.sharedPlans?.length === 1 ? "User" : "Users"}
                </div>
                <div
                  className={
                    plan.userId === auth.user.id
                      ? `flex items-center justify-between`
                      : "flex items-center justify-end"
                  }
                >
                  {plan.userId === auth.user.id && (
                    <div className="flex space-x-2">
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => navigate(`/plans/edit/${plan.id}`)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={() => confirmDelete(plan.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={() => shareConfirm(plan.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 16 16"
                    >
                      <rect
                        width="9.434"
                        height="2"
                        x="3.283"
                        y="4.5"
                        fill="#00b569"
                        transform="rotate(-32 8 5.5)"
                      ></rect>
                      <rect
                        width="2"
                        height="9.434"
                        x="7"
                        y="5.783"
                        fill="#00b569"
                        transform="rotate(-58.008 8 10.5)"
                      ></rect>
                      <circle cx="12" cy="3" r="3" fill="#13f24e"></circle>
                      <circle cx="4" cy="8" r="3" fill="#13f24e"></circle>
                      <circle cx="12" cy="13" r="3" fill="#13f24e"></circle>
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
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
              Delete Learning Plan
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this learning plan? This action
              cannot be undone and all associated data will be permanently
              removed.
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
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
                  "Delete Plan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                className="h-4 w-4 mr-1"
                viewBox="0 0 16 16"
              >
                <rect
                  width="9.434"
                  height="2"
                  x="3.283"
                  y="4.5"
                  fill="#00b569"
                  transform="rotate(-32 8 5.5)"
                ></rect>
                <rect
                  width="2"
                  height="9.434"
                  x="7"
                  y="5.783"
                  fill="#00b569"
                  transform="rotate(-58.008 8 10.5)"
                ></rect>
                <circle cx="12" cy="3" r="3" fill="#13f24e"></circle>
                <circle cx="4" cy="8" r="3" fill="#13f24e"></circle>
                <circle cx="12" cy="13" r="3" fill="#13f24e"></circle>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-center mb-2">
              Share Learning Plan
            </h3>

            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
                onClick={() => {
                  setShowShareModal(false);
                  setShareId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md flex items-center"
                onClick={handleShare}
              >
                Share Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewPlansPage;
