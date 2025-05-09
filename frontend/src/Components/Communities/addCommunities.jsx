"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createCommunity } from "@/lib/actions/community.actions";

export default function CreateCommunity() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({ name: "", description: "", image: "" });

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "duqafjjp");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dgk2vmorz/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { name: "", description: "", image: "" };

    if (!name.trim()) {
      errors.name = "Community name is required.";
      isValid = false;
    }

    if (!description.trim()) {
      errors.description = "Description is required.";
      isValid = false;
    }

    if (!image && !imageUrl) {
      errors.image = "Image is required.";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    let finalImageUrl = imageUrl;

    if (image && !imageUrl) {
      const uploadedUrl = await handleImageUpload(image);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
        setImageUrl(uploadedUrl);
      } else {
        setFormErrors((prev) => ({ ...prev, image: "Failed to upload image." }));
        setIsSubmitting(false);
        return;
      }
    }

    await createCommunity({
      name,
      description,
      image: finalImageUrl,
    });

    setIsSubmitting(false);
    router.push("/");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setFormErrors((prev) => ({ ...prev, image: "Only JPG, JPEG, PNG formats allowed." }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, image: "Image must be less than 5MB." }));
        return;
      }

      setImage(file);
      setFormErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  return (
    <section className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Create a Community</h1>
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div>
          <label htmlFor="name" className="block mb-2 font-medium text-gray-700">Community Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-describedby="name-error"
          />
          {formErrors.name && <p id="name-error" className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block mb-2 font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-describedby="description-error"
          />
          {formErrors.description && <p id="description-error" className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
        </div>

        <div>
          <label htmlFor="image" className="block mb-2 font-medium text-gray-700">Community Image</label>
          <input
            ref={imageInputRef}
            id="image"
            name="image"
            type="file"
            accept="image/png, image/jpeg"
            className="block w-full text-sm text-gray-500"
            onChange={handleImageChange}
            aria-describedby="image-error"
          />
          {formErrors.image && <p id="image-error" className="text-red-500 text-sm mt-1">{formErrors.image}</p>}
          {image && (
            <div className="mt-3">
              <img src={URL.createObjectURL(image)} alt="Preview" className="w-40 h-40 object-cover rounded-md" />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImageUrl("");
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
                className="mt-2 text-sm text-red-500"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Community"}
        </button>
      </form>
    </section>
  );
}
