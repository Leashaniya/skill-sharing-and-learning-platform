import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

function HomePage() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { auth } = useSelector((store) => store);
  useEffect(() => {
    setIsLoading(true);
    axios
      .get("http://localhost:5454/api/groups", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      })
      .then((res) => {
        setGroups(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  

  return (
    <div className=" mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-xl font-bold text-blue-500">Communities</h1>
        <button
          className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          onClick={() => navigate("/communities/add")}
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
          Create Community
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 ">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No communities found
          </h3>
          <p className="mt-1 text-gray-500">
            Get started by creating your first community.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {groups?.map((group) => (
            <div
              key={group.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={
                    group.groupImage || "/placeholder.svg?height=192&width=384"
                  }
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      group.isPublic
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {group.isPublic ? "🌎 Public" : "🔒 Private"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between h-48">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-indigo-700 mb-1 truncate">
                    {group.name}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {group.description || "No description provided"}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
                    onClick={() => navigate(`/community/${group.id}`)}
                  >
                    View
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
