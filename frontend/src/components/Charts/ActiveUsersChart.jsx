import React, { useMemo, useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ActiveUsersChart({ data }) {
  const [history, setHistory] = useState([]);
  const maxHistory = 20;

  useEffect(() => {
    if (data?.uniqueUsers !== undefined) {
      setHistory(prev => {
        const newHistory = [...prev, data.uniqueUsers];
        return newHistory.slice(-maxHistory);
      });
    }
  }, [data]);

  const chartData = useMemo(() => {
    return {
      labels: history.map((_, i) => `t-${history.length - i}`),
      datasets: [{
        label: 'Active Users',
        data: history,
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
  }, [history]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="chart-300">
      <Line data={chartData} options={options} />
    </div>
  );
}


