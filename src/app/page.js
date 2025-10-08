import ProtectedLayout from '@/components/ProtectedLayout';

export default function Home() {
  return (
    <ProtectedLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Home
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome to your Contract Management System
        </p>
        
        {/* Home content */}
        <div className="mt-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md duration-200 animate-slideInUp">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Get Started
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all your contracts and documents efficiently in one centralized platform.
            </p>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}