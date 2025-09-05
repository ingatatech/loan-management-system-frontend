"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createUser } from "@/lib/features/users/userSlice";
import { 
  UserPlus, 
  Mail, 
  Phone, 
  User, 
  Briefcase, 
  Loader2, 
  CheckCircle2,
  ArrowLeft,
  Shield
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CreateUserPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { isCreating, error } = useAppSelector((state) => state.user);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "loan_officer" as "loan_officer" | "board_director" | "senior_manager" | "managing_director",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPassword, setCreatedPassword] = useState("");

  // ✅ FIXED: Role options with correct values
  const roleOptions = [
    {
      value: "loan_officer",
      label: "Loan Officer",
      description: "Can perform initial loan reviews and forward to managers",
      color: "bg-green-50 border-green-200 text-green-700"
    },
    {
      value: "board_director",
      label: "Board Director",
      description: "Can review and approve loans at board level",
      color: "bg-blue-50 border-blue-200 text-blue-700"
    },
    {
      value: "senior_manager",
      label: "Senior Manager",
      description: "Can review and approve loans at senior management level",
      color: "bg-purple-50 border-purple-200 text-purple-700"
    },
    {
      value: "managing_director",
      label: "Managing Director",
      description: "Can review and give final approval on loans",
      color: "bg-indigo-50 border-indigo-200 text-indigo-700"
    }
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (!currentUser?.organizationId) {
      toast.error("Organization ID not found");
      return;
    }

    const result = await dispatch(
      createUser({
        organizationId: currentUser.organizationId,
        userData: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role,
        },
      })
    );

    if (result.type === "users/create/fulfilled") {
      setShowSuccess(true);
      setCreatedPassword(result.payload?.data?.temporaryPassword || "");
      toast.success("User created successfully!");
      
      setTimeout(() => {
        router.push("/dashboard/client/users");
      }, 3000);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (showSuccess) {
    const selectedRole = roleOptions.find(r => r.value === formData.role);
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/dashboard/client/users"
              className="inline-flex items-center text-[#5B7FA2] hover:text-blue-800 mb-4 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              User Created Successfully!
            </h3>
            <p className="text-gray-600 mb-2">
              {selectedRole?.label} account has been created.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Login credentials have been sent to the user's email.
            </p>
            {createdPassword && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Temporary Password:
                </p>
                <p className="text-lg font-mono font-bold text-blue-700">
                  {createdPassword}
                </p>
                <p className="text-xs text-[#5B7FA2] mt-2">
                  Save this password - it won't be shown again
                </p>
              </div>
            )}
            <div className="text-sm text-gray-500">
              Redirecting to users page...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/client/users"
            className="inline-flex items-center text-[#5B7FA2] hover:text-blue-800 mb-4 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
              <p className="text-gray-600 mt-1">
                Create a new staff member with appropriate role and permissions
              </p>
            </div>
            <div className="w-12 h-12 bg-[#5B7FA2] rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="john.doe@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Login credentials will be sent to this email
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+250 788 123 456"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Role Selection - Enhanced */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                User Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleOptions.map((roleOption) => (
                  <button
                    key={roleOption.value}
                    type="button"
                    onClick={() => handleChange("role", roleOption.value)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      formData.role === roleOption.value
                        ? `${roleOption.color} border-current`
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.role === roleOption.value
                          ? "border-current"
                          : "border-gray-300"
                      }`}>
                        {formData.role === roleOption.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-current" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <p className="font-medium">{roleOption.label}</p>
                        </div>
                        <p className="text-sm opacity-75 mt-1">
                          {roleOption.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                What happens next?
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ User account will be created instantly</li>
                <li>✓ Random secure password will be generated</li>
                <li>✓ Login credentials sent via email</li>
                <li>✓ User can change password on first login</li>
                <li>✓ Role-based permissions will be automatically assigned</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Link
                href="/dashboard/client/users"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 bg-[#5B7FA2] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}