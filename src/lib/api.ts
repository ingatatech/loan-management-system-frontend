import axios from "axios"
import Cookies from "js-cookie"
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        // Unauthorized - token expired or invalid
        toast.error("Session expired. Please log in again.")
        // Redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      } else if (status === 403) {
        // Forbidden - insufficient permissions
        toast.error(data.message || "You do not have permission to perform this action.")
      } else if (status === 404) {
        // Not Found
        toast.error(data.message || "Resource not found.")
      } else if (status === 400) {
        // Bad Request - validation errors etc.
        toast.error(data.message || "Bad request.")
      } else if (status === 409) {
        // Conflict
        toast.error(data.message || "Conflict occurred.")
      } else {
        toast.error(data.message || "An unexpected error occurred.")
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error("No response from server. Please check your network connection.")
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error("Error setting up request: " + error.message)
    }
    return Promise.reject(error)
  },
)

export default api
