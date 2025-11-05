import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ActiveUsersChart({ data }) {
  const chartData = useMemo(() => {
    const value = data?.uniqueUsers || 0;
    const ts = data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '';
    return {
      labels: [ts],
      datasets: [{
        label: 'Active Users',
        data: [value],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, 'rgba(75, 192, 192, 0.35)');
          g.addColorStop(1, 'rgba(75, 192, 192, 0.05)');
          return g;
        },
        tension: 0.4,
        fill: true
      }]
    };
  }, [data]);

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  return (
    <div className="chart-300">
      <Line data={chartData} options={options} />
    </div>
  );
}


