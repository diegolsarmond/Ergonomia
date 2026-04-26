import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  sitting: number;
  standing: number;
  other: number;
  otherLabel?: string;
}

const COLORS = ['#0d9488', '#f59e0b', '#6366f1'];

export const PostureChart: React.FC<Props> = ({ sitting, standing, other, otherLabel }) => {
  const data = [
    { name: 'Sentada', value: sitting },
    { name: 'Em pé', value: standing },
  ];
  if (other > 0) data.push({ name: otherLabel || 'Outras', value: other });

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
