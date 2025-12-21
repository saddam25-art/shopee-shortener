import { Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, Users, Eye } from 'lucide-react';

const stats = [
  { label: 'Scheduled Posts', value: '24', icon: Clock, color: 'bg-blue-500' },
  { label: 'Published', value: '156', icon: CheckCircle, color: 'bg-green-500' },
  { label: 'Pending Approval', value: '8', icon: AlertCircle, color: 'bg-yellow-500' },
  { label: 'Total Reach', value: '45.2K', icon: TrendingUp, color: 'bg-purple-500' },
];

const upcomingPosts = [
  {
    id: 1,
    content: 'Check out our new product launch! 🚀 #NewProduct #Launch',
    platform: 'facebook',
    scheduledFor: '2024-12-18 10:00 AM',
    status: 'scheduled',
  },
  {
    id: 2,
    content: 'Behind the scenes of our latest photoshoot 📸',
    platform: 'instagram',
    scheduledFor: '2024-12-18 2:00 PM',
    status: 'pending',
  },
  {
    id: 3,
    content: 'Big announcement coming soon! Stay tuned...',
    platform: 'twitter',
    scheduledFor: '2024-12-19 9:00 AM',
    status: 'scheduled',
  },
];

const recentActivity = [
  { user: 'Sarah', action: 'approved a post', time: '5 min ago' },
  { user: 'Mike', action: 'scheduled 3 posts', time: '1 hour ago' },
  { user: 'Anna', action: 'commented on a draft', time: '2 hours ago' },
  { user: 'John', action: 'published to Instagram', time: '3 hours ago' },
];

const platformColors = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#000000',
  linkedin: '#0A66C2',
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Posts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Upcoming Posts</h3>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingPosts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <span
                    className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: platformColors[post.platform] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.scheduledFor}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          post.status === 'scheduled'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-4 space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-purple-600">
                    {activity.user[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center">
            <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Schedule Post</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center">
            <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Invite Team</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center">
            <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Preview Feed</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center">
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
}
