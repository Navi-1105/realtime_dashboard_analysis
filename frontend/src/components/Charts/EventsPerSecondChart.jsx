import React, { useMemo, useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function EventsPerSecondChart({ data }) {
  const [history, setHistory] = useState([]);
  const maxHistory = 20;

  useEffect(() => {
    if (data?.eventsPerSecond !== undefined) setHistory(prev => [...prev, data.eventsPerSecond].slice(-maxHistory));
  }, [data]);

  const chartData = useMemo(() => ({
    labels: history.map((_, i) => `t-${history.length - i}`),
    datasets: [{
      label: 'Events/Second',
      data: history,
      borderColor: 'rgb(124, 58, 237)',
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        g.addColorStop(0, 'rgba(124, 58, 237, 0.35)');
        g.addColorStop(1, 'rgba(124, 58, 237, 0.05)');
        return g;
      },
      tension: 0.4,
      fill: true
    }]
  }), [history]);

  const options = { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } };

  return (
    <div className="chart-300">
      <Line data={chartData} options={options} />
    </div>
  );
}


