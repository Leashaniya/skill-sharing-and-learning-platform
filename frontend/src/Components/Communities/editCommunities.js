"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { uploadToCloudinary } from "../../Utils/UploadToCloudinary";
import { toast } from "react-toastify";

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      toast.error("Image preview failed");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Community name is required";
    if (name.length > 50) newErrors.name = "Name must be less than 50 characters";
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
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/community/${id}`)}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          ← Back to Community
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Community</h1>

        {errors.load && (
          <div className="text-red-600 mb-4">{errors.load}</div>
        )}

        {errors.submit && (
          <div className="text-red-600 mb-4">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Community Name*
            </label>
            <input
              type="text"
              className={`mt-1 block w-full border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description*
            </label>
            <textarea
              rows={4}
              className={`mt-1 block w-full border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Visibility
            </label>
            <select
              value={isPublic}
              onChange={(e) => setIsPublic(e.target.value === "true")}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            >
              <option value="true">Public</option>
              <option value="false">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Community Image
            </label>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded mb-2" />
            ) : existingImageUrl ? (
              <img src={existingImageUrl} alt="Current" className="h-32 w-32 object-cover rounded mb-2" />
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full"
            />
            {errors.image && (
              <p className="text-red-500 text-sm">{errors.image}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isSubmitting ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isSubmitting ? "Updating..." : "Update Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCommunity;
