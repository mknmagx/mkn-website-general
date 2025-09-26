export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-white/20 rounded mx-auto mb-2 w-32"></div>
            <div className="h-4 bg-white/10 rounded mx-auto w-48"></div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-slate-300 dark:bg-slate-600 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-lg"></div>
                  <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-lg"></div>
                </div>
              </div>
            ))}
            
            {/* Action Buttons Skeleton */}
            <div className="flex space-x-3 pt-4">
              <div className="flex-1 h-12 bg-slate-300 dark:bg-slate-600 rounded-xl"></div>
              <div className="flex-1 h-12 bg-slate-300 dark:bg-slate-600 rounded-xl"></div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded mx-auto w-48 mb-2"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded mx-auto w-36"></div>
        </div>
      </div>
    </div>
  );
}