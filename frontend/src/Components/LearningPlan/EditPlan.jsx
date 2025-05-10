"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`http://localhost:5454/api/learning-plans/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      })
      .then((res) => {
        setPlan(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch plan:", err);
        setErrors({ load: "Failed to load learning plan. Please try again." });
        setIsLoading(false);
      });
  }, [id]);

  const validateForm = () => {
    const newErrors = {};

    if (!plan) return newErrors;

    if (!plan.title?.trim()) {
      newErrors.title = "Title is required";
    } else if (plan.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!plan.description?.trim()) {
      newErrors.description = "Description is required";
    } else if (plan.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (!plan.topics?.trim()) {
      newErrors.topics = "At least one topic is required";
    }

    if (!plan.resources?.trim()) {
      newErrors.resources = "At least one resource is required";
    }

    if (!plan.deadline) {
      newErrors.deadline = "Deadline is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await axios.put(`http://localhost:5454/api/learning-plans/${id}`, plan, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      navigate("/plans");
    } catch (error) {
      console.error("Failed to update learning plan:", error);
      setErrors({
        submit: "Failed to update learning plan. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-6">
            <div>
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-32 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (errors.load) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <p className="text-sm text-red-700">{errors.load}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 text-center">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Learning plan not found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The learning plan you're looking for doesn't exist.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/plans")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Learning Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/plans")}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
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
          Back to Learning Plans
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Learning Plan
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Plan Title*
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                name="title"
                className={`shadow-sm focus:ring-indigo-500 ring-2 h-10 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.title ? "border-red-300" : ""
                }`}
                value={plan.title || ""}
                onChange={(e) => setPlan({ ...plan, title: e.target.value })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <div className="mt-1 text-xs text-gray-400 text-right">
                {(plan.title || "").length}/100
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description*
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                className={`shadow-sm focus:ring-indigo-500 ring-2 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.description ? "border-red-300" : ""
                }`}
                value={plan.description || ""}
                onChange={(e) =>
                  setPlan({ ...plan, description: e.target.value })
                }
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
              <div className="mt-1 text-xs text-gray-400 text-right">
                {(plan.description || "").length}/500
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="topics"
              className="block text-sm font-medium text-gray-700"
            >
              Topics*
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="topics"
                name="topics"
                className={`shadow-sm focus:ring-indigo-500 h-10 ring-2 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.topics ? "border-red-300" : ""
                }`}
                value={plan.topics || ""}
                onChange={(e) => setPlan({ ...plan, topics: e.target.value })}
              />
              {errors.topics && (
                <p className="mt-1 text-sm text-red-600">{errors.topics}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="resources"
              className="block text-sm font-medium text-gray-700"
            >
              Resources*
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="resources"
                name="resources"
                className={`shadow-sm ring-2 h-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.resources ? "border-red-300" : ""
                }`}
                value={plan.resources || ""}
                onChange={(e) =>
                  setPlan({ ...plan, resources: e.target.value })
                }
              />
              {errors.resources && (
                <p className="mt-1 text-sm text-red-600">{errors.resources}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-gray-700"
            >
              Target Completion Date*
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="deadline"
                name="deadline"
                className={`shadow-sm ring-2 h-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.deadline ? "border-red-300" : ""
                }`}
                value={plan.deadline || ""}
                onChange={(e) => setPlan({ ...plan, deadline: e.target.value })}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                onClick={() => navigate("/plans")}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
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
                    Updating...
                  </span>
                ) : (
                  "Update Learning Plan"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


