import React, { useMemo, useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function EventsPerSecondChart({ data }) {
  const [history, setHistory] = useState([]);
  const maxHistory = 20;

  useEffect(() => {
    if (data && typeof data === 'object') {
      const eventsPerSecond = data.eventsPerSecond;
      console.log('EventsPerSecondChart - data received:', data, 'eventsPerSecond:', eventsPerSecond);
      if (eventsPerSecond !== undefined && eventsPerSecond !== null) {
        const value = typeof eventsPerSecond === 'number' ? eventsPerSecond : 0;
        console.log('EventsPerSecondChart - adding value:', value);
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
          label: 'Events/Second',
          data: [0],
          borderColor: 'rgb(124, 58, 237)',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    }
    return {
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
    };
  }, [history]);

  const options = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: { enabled: history.length > 0 }
    }, 
    scales: { 
      y: { beginAtZero: true },
      x: { display: history.length > 0 }
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


