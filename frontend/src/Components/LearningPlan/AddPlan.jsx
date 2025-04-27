"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

function AddPlanPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState("");
  const [resources, setResources] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { auth } = useSelector((store) => store);

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (!topics.trim()) {
      newErrors.topics = "At least one topic is required";
    }

    if (!resources.trim()) {
      newErrors.resources = "At least one resource is required";
    }

    if (!deadline) {
      newErrors.deadline = "Deadline is required";
    } else {
      const selectedDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.deadline = "Deadline cannot be in the past";
      }
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
      await axios.post(
        "http://localhost:5454/api/learning-plans",
        {
          userId: auth.user.id,
          title,
          description,
          topics,
          resources,
          deadline,
          sharedPlans: [],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );

      navigate("/plans");
    } catch (error) {
      console.error("Failed to create learning plan:", error);
      setErrors({
        submit: "Failed to create learning plan. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

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
            Create Learning Plan
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
                placeholder="e.g., Learn JavaScript in 30 Days"
                className={`shadow-sm focus:ring-indigo-500 ring-2 h-10 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.title ? "border-red-300" : ""
                }`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <div className="mt-1 text-xs text-gray-400 text-right">
                {title.length}/100
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
                placeholder="Describe your learning goals and what you hope to achieve..."
                className={`shadow-sm focus:ring-indigo-500 ring-2 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.description ? "border-red-300" : ""
                }`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
              <div className="mt-1 text-xs text-gray-400 text-right">
                {description.length}/500
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
                placeholder="e.g., JavaScript, React, Node.js"
                className={`shadow-sm focus:ring-indigo-500 ring-2 h-10 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.topics ? "border-red-300" : ""
                }`}
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
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
                placeholder="e.g. https://www.freecodecamp.org/learn/"
                className={`shadow-sm focus:ring-indigo-500 ring-2 h-10 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.resources ? "border-red-300" : ""
                }`}
                value={resources}
                onChange={(e) => setResources(e.target.value)}
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
                className={`shadow-sm focus:ring-indigo-500 h-10 ring-2 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.deadline ? "border-red-300" : ""
                }`}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
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
                    Creating...
                  </span>
                ) : (
                  "Create Learning Plan"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPlanPage;
