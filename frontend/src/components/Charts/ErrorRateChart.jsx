import React, { useMemo, useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ErrorRateChart({ data }) {
  const [history, setHistory] = useState([]);
  const maxHistory = 20;

  useEffect(() => {
    if (data?.errors !== undefined && data?.totalEvents !== undefined) {
      const rate = data.totalEvents > 0 ? (data.errors / data.totalEvents) * 100 : 0;
      setHistory(prev => [...prev, rate].slice(-maxHistory));
    }
  }, [data]);

  const chartData = useMemo(() => ({
    labels: history.map((_, i) => `t-${history.length - i}`),
    datasets: [{
      label: 'Error Rate (%)',
      data: history,
      borderColor: 'rgb(255, 159, 64)',
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        g.addColorStop(0, 'rgba(255, 159, 64, 0.35)');
        g.addColorStop(1, 'rgba(255, 159, 64, 0.05)');
        return g;
      },
      tension: 0.4,
      fill: true
    }]
  }), [history]);

  const options = { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, max: 100 } } };

  return (
    <div className="chart-300">
      <Line data={chartData} options={options} />
    </div>
  );
}


