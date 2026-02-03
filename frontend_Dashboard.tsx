import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FileText, User, Plus } from 'lucide-react';

function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600">Manage your profile and create tailored resumes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Master Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Master Profile</h2>
          <p className="text-gray-600 mb-6">
            Store all your experiences, skills, and education in one place
          </p>
          <Link
            to="/profile/edit"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </Link>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: Not yet created
          </div>
        </div>

        {/* My Resumes Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Resumes</h2>
          <p className="text-gray-600 mb-6">
            View and manage your generated resumes
          </p>
          <div className="space-y-3 mb-6">
            <p className="text-gray-500 italic">No resumes created yet</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            to="/resume/new"
            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors"
          >
            <Plus className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Generate New Resume</h3>
              <p className="text-sm text-blue-100">Create a role-specific resume</p>
            </div>
          </Link>
          <Link
            to="/profile/edit"
            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors"
          >
            <User className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Update Profile</h3>
              <p className="text-sm text-blue-100">Add more experiences and skills</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
        <ol className="space-y-4">
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">Create Your Master Profile</h3>
              <p className="text-gray-600">
                Add all your work experiences, education, skills, and achievements
              </p>
            </div>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">Generate a Resume</h3>
              <p className="text-gray-600">
                Paste a job description and let our AI select the most relevant content
              </p>
            </div>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">Download & Apply</h3>
              <p className="text-gray-600">
                Export your ATS-optimized resume as PDF or DOCX
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default Dashboard;
