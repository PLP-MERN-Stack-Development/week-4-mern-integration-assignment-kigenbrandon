import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Mail, 
  Save, 
  Upload, 
  Camera,
  Shield,
  Award,
  MapPin
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { uploadAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      specialization: user?.specialization || '',
      department: user?.department || '',
      licenseNumber: user?.licenseNumber || '',
      avatar: user?.avatar || ''
    }
  })

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await uploadAPI.uploadImage(formData)
      setAvatarPreview(response.data.url)
      setValue('avatar', response.data.url)
      toast.success('Avatar uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload avatar')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      await updateProfile(data)
    } catch (error) {
      console.error('Profile update error:', error)
    }
  }

  const departments = [
    { value: '', label: 'Select Department' },
    { value: 'general', label: 'General Medicine' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'emergency', label: 'Emergency Medicine' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'pathology', label: 'Pathology' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'ophthalmology', label: 'Ophthalmology' },
    { value: 'administration', label: 'Administration' }
  ]

  const roles = [
    { value: 'patient', label: 'Patient', icon: User },
    { value: 'doctor', label: 'Doctor', icon: Award },
    { value: 'nurse', label: 'Nurse', icon: Shield },
    { value: 'admin', label: 'Administrator', icon: Shield }
  ]

  const currentRole = roles.find(role => role.value === user?.role) || roles[0]
  const RoleIcon = currentRole.icon

  return (
    <>
      <Helmet>
        <title>Profile - MedCare Hospital</title>
        <meta name="description" content="Manage your MedCare Hospital profile and account settings" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account information and professional details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-body text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <img
                    src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.username}&background=3b82f6&color=fff&size=128`}
                    alt={user?.username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors shadow-lg"
                  >
                    {isUploading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {user?.username}
                </h2>
                
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <RoleIcon className="h-4 w-4 text-primary-600" />
                  <span className="text-sm text-gray-600 capitalize">
                    {currentRole.label}
                  </span>
                </div>

                {user?.specialization && (
                  <p className="text-sm text-gray-500 mb-2">{user.specialization}</p>
                )}

                {user?.department && (
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className="capitalize">{user.department} Department</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="card mt-6">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Status</span>
                    <span className="badge badge-success">Active</span>
                  </div>
                  
                  {user?.licenseNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">License</span>
                      <span className="badge badge-primary">Verified</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm text-gray-900">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                      </label>
                      <input
                        {...register('username', { 
                          required: 'Username is required',
                          minLength: { value: 3, message: 'Username must be at least 3 characters' }
                        })}
                        type="text"
                        className={`input w-full ${errors.username ? 'border-red-300' : ''}`}
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                        })}
                        type="email"
                        className={`input w-full ${errors.email ? 'border-red-300' : ''}`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              {(user?.role === 'doctor' || user?.role === 'nurse') && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>
                  </div>
                  <div className="card-body space-y-4">
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <input
                        {...register('specialization')}
                        type="text"
                        className="input w-full"
                        placeholder="e.g., Cardiologist, Pediatric Nurse"
                      />
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        {...register('department')}
                        className="input w-full"
                      >
                        {departments.map((dept) => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        License Number
                      </label>
                      <input
                        {...register('licenseNumber')}
                        type="text"
                        className="input w-full"
                        placeholder="Professional license number"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Your professional license number for verification
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="card">
                <div className="card-body">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Security & Privacy</h4>
                      <p className="text-sm text-gray-600">
                        Your personal information is protected and will only be used for hospital-related communications. 
                        Professional credentials are verified for medical staff accounts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile