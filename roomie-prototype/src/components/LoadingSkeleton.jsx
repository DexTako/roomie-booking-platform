// Reusable skeleton components for loading states

export function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-300"></div>
      
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        
        {/* Location */}
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        
        {/* Price and button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-gray-300 rounded w-24"></div>
          <div className="h-10 bg-gray-300 rounded w-28"></div>
        </div>
      </div>
    </div>
  )
}

export function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
      </div>
      
      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-5 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-5 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-5 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-5 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}

export function UserTableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </th>
            <th className="px-6 py-3 text-left">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </th>
            <th className="px-6 py-3 text-left">
              <div className="h-4 bg-gray-300 rounded w-12"></div>
            </th>
            <th className="px-6 py-3 text-left">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {[...Array(rows)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-6 bg-gray-300 rounded-full w-16"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-32"></div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
      <div className="flex items-start gap-6 mb-6">
        <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-gray-300 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export function ReviewSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
        ))}
      </div>
      
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gray-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.random() * 60 + 40}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Generic skeleton for any content area
export function ContentSkeleton({ lines = 5 }) {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(lines)].map((_, index) => (
        <div 
          key={index} 
          className="h-4 bg-gray-300 rounded"
          style={{ width: `${Math.random() * 30 + 70}%` }}
        ></div>
      ))}
    </div>
  )
}

export default {
  RoomCardSkeleton,
  BookingCardSkeleton,
  UserTableSkeleton,
  StatCardSkeleton,
  ProfileSkeleton,
  ReviewSkeleton,
  ChartSkeleton,
  ContentSkeleton
}
