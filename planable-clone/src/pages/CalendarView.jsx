import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const scheduledPosts = [
  { id: 1, date: new Date(2024, 11, 18), platform: 'facebook', title: 'Product launch' },
  { id: 2, date: new Date(2024, 11, 18), platform: 'instagram', title: 'Behind the scenes' },
  { id: 3, date: new Date(2024, 11, 19), platform: 'twitter', title: 'Announcement' },
  { id: 4, date: new Date(2024, 11, 20), platform: 'linkedin', title: 'Industry insights' },
  { id: 5, date: new Date(2024, 11, 22), platform: 'facebook', title: 'Weekend vibes' },
  { id: 6, date: new Date(2024, 11, 25), platform: 'instagram', title: 'Holiday special' },
];

const platformColors = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#000000',
  linkedin: '#0A66C2',
};

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayPosts = scheduledPosts.filter((post) =>
          isSameDay(post.date, cloneDay)
        );

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] border border-gray-100 p-2 cursor-pointer transition-colors hover:bg-gray-50 ${
              !isSameMonth(day, monthStart) ? 'bg-gray-50' : 'bg-white'
            } ${isSameDay(day, selectedDate) ? 'ring-2 ring-purple-500 ring-inset' : ''}`}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-sm font-medium ${
                  isToday(day)
                    ? 'bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                    : isSameMonth(day, monthStart)
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {format(day, 'd')}
              </span>
              {isSameMonth(day, monthStart) && (
                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity">
                  <Plus className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
            <div className="space-y-1">
              {dayPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="text-xs px-2 py-1 rounded truncate text-white"
                  style={{ backgroundColor: platformColors[post.platform] }}
                >
                  {post.title}
                </div>
              ))}
              {dayPosts.length > 3 && (
                <div className="text-xs text-gray-500 px-2">
                  +{dayPosts.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
