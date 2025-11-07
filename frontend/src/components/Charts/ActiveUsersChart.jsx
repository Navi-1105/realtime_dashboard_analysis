import React, { useMemo, useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ActiveUsersChart({ data }) {
  const [history, setHistory] = useState([]);
  const maxHistory = 20;

  useEffect(() => {
    if (data && typeof data === 'object') {
      const uniqueUsers = data.uniqueUsers;
      if (uniqueUsers !== undefined && uniqueUsers !== null) {
        const value = typeof uniqueUsers === 'number' ? uniqueUsers : 0;
        setHistory(prev => {
          const newHistory = [...prev, value];
          return newHistory.slice(-maxHistory);
        });
      }
    }
  }, [data]);

  const chartData = useMemo(() => {
    if (history.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{
          label: 'Active Users',
          data: [0],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    }
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
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: history.length > 0,
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      },
      x: {
        display: history.length > 0
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
      <Line 
        key={history.length} 
        data={chartData} 
        options={options}
        updateMode="active"
      />
    </div>
  );
}


