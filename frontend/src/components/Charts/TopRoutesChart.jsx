import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TopRoutesChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || !data.routes || Object.keys(data.routes).length === 0) {
      return { labels: ['No data'], datasets: [{ label: 'Route Visits', data: [0], backgroundColor: 'rgba(54, 162, 235, 0.6)' }] };
    }
    const routes = Object.entries(data.routes).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
      labels: routes.map(([r]) => r),
      datasets: [{
        label: 'Route Visits',
        data: routes.map(([, c]) => c),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  }, [data]);

  const options = { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };

  return (
    <div className="chart-300">
      <Bar data={chartData} options={options} />
    </div>
  );
}


