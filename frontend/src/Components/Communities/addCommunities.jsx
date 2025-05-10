import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { uploadToCloudinary } from "../../Utils/UploadToCloudinary";
import { useSelector } from "react-redux";

function AddCommunities() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { auth } = useSelector((store) => store);

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

    if (!name.trim()) {
      newErrors.name = "Community name is required";
    } else if (name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (image) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(image.type)) {
        newErrors.image = "Only JPG, PNG, or GIF files are allowed";
      }
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      if (image.size > maxSizeInBytes) {
        newErrors.image = "Image size must be less than 10MB";
      }
    }

    return newErrors;
  };
  const [uploadingImage, setUploadingImage] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    let groupImage = "";

    if (image) {
      try {
        const uploadUrl = await uploadToCloudinary(image, "image");
        console.log("Image uploaded successfully:", uploadUrl);
        groupImage = uploadUrl;
      } catch (error) {
        console.error("Image upload failed:", error);
        setErrors({ image: "Image upload failed. Please try again." });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await axios.post(
        "http://localhost:5454/api/groups",
        {
          name,
          description,
          groupImage,
          isPublic,
          ownerId: auth.user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            "Content-Type": "application/json",
          },
        }
      );
      navigate("/communities");
    } catch (error) {
      console.error("Failed to create community:", error);
      setErrors({ submit: "Failed to create community. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/communities")}
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
          Back to Communities
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Community
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

          {/* Community Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Community Name*
            </label>
            <input
              type="text"
              className={`h-10 w-full ring-2 rounded-md px-3 text-sm ${
                errors.name ? "ring-red-400" : "ring-gray-300"
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description*
            </label>
            <textarea
              rows={4}
              className={`w-full ring-2 rounded-md px-3 text-sm ${
                errors.description ? "ring-red-400" : "ring-gray-300"
              }`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Community Image
            </label>
            <div className="mt-2 flex items-center space-x-4">
              {imagePreview ? (
                <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 p-1 bg-white rounded-bl-lg"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                  >
                    ❌
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  📷
                </div>
              )}
              <input type="file" onChange={handleImageChange} />
            </div>
            {errors.image && (
              <p className="text-sm text-red-600 mt-1">{errors.image}</p>
            )}
          </div>

          {/* Public/Private Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Visibility
            </label>
            <select
              value={isPublic}
              onChange={(e) => setIsPublic(e.target.value === "true")}
              className="mt-1 w-full border ring-2 ring-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="true">Public</option>
              <option value="false">Private</option>
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 ${
                isSubmitting && "opacity-50 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCommunities;
