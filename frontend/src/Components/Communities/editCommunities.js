"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { uploadToCloudinary } from "../../Utils/UploadToCloudinary";

function EditCommunity() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`http://localhost:5454/api/groups/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      })
      .then((res) => {
        const group = res.data;
        setName(group.name);
        setDescription(group.description);
        setIsPublic(group.isPublic);
        setExistingImageUrl(group.groupImage);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrors({ load: "Failed to load community data. Please try again." });
        setIsLoading(false);
      });
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Community name is required";
    if (name.length > 50)
      newErrors.name = "Name must be less than 50 characters";
    if (!description.trim()) newErrors.description = "Description is required";
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

    let groupImage = existingImageUrl;

    if (image) {
      try {
        const uploadUrl = await uploadToCloudinary(image, "image");
        groupImage = uploadUrl;
      } catch (error) {
        console.error("Image upload failed:", error);
        setErrors({ image: "Image upload failed. Please try again." });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await axios.put(
        `http://localhost:5454/api/groups/${id}`,
        {
          name,
          description,
          groupImage,
          isPublic,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            "Content-Type": "application/json",
          },
        }
      );
      navigate(`/community/${id}`);
    } catch (error) {
      console.error("Failed to update community:", error);
      setErrors({ submit: "Failed to update community. Please try again." });
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
              <div className="h-40 bg-gray-200 rounded w-1/3 mb-2"></div>
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/community/${id}`)}
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
          Back to Community
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Edit Community</h1>
        </div>

        {errors.load ? (
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
        ) : (
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
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Community Name*
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`shadow-sm focus:ring-indigo-500 ring-2 h-10 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.name ? "border-red-300" : ""
                  }`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
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
                  className={`shadow-sm focus:ring-indigo-500 ring-2 h-32 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.description ? "border-red-300" : ""
                  }`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Community Image
              </label>
              <div className="mt-1 space-y-4">
                {/* Current image display */}
                {existingImageUrl && !imagePreview && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Current image:</p>
                    <div className="relative inline-block">
                      <img
                        src={existingImageUrl || "/placeholder.svg"}
                        alt="Current community image"
                        className="h-40 w-auto object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 p-1 bg-white rounded-bl-lg shadow-sm"
                          onClick={() => {
                            setImage(null);
                            setImagePreview(null);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>
                          {existingImageUrl ? "Change image" : "Upload a file"}
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                    {errors.image && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.image}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="visibility"
                className="block text-sm font-medium text-gray-700"
              >
                Community Visibility
              </label>
              <div className="mt-1">
                <select
                  id="visibility"
                  name="visibility"
                  className="shadow-sm h-10 ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={isPublic.toString()}
                  onChange={(e) => setIsPublic(e.target.value === "true")}
                >
                  <option value="true">Public</option>
                  <option value="false">Private</option>
                </select>
                <p className="mt-1 text-xs text-gray-500"></p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                  onClick={() => navigate(`/community/${id}`)}
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
                    "Update Community"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


export default EditCommunity;
