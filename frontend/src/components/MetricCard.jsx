import React from 'react';

const MetricCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
        {Icon && <Icon className="w-6 h-6 stroke-[2]" />}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h4 className="text-2xl font-extrabold text-gray-900 mt-1">{value}</h4>
      </div>
    </div>
  );
};

export default MetricCard;
