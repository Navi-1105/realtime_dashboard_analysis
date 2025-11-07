import React, { useMemo, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TopRoutesChart({ data }) {
  // Debug: Log data received
  useEffect(() => {
    console.log('TopRoutesChart - data received:', data);
    console.log('TopRoutesChart - routes:', data?.routes);
    console.log('TopRoutesChart - routes type:', typeof data?.routes);
    console.log('TopRoutesChart - routes keys:', data?.routes ? Object.keys(data.routes) : 'none');
  }, [data]);

  const chartData = useMemo(() => {
    console.log('TopRoutesChart - computing chartData with:', data);
    
    if (!data || !data.routes) {
      console.log('TopRoutesChart - No data or routes');
      return { 
        labels: ['No data'], 
        datasets: [{ 
          label: 'Route Visits', 
          data: [0], 
          backgroundColor: 'rgba(54, 162, 235, 0.6)' 
        }] 
      };
    }
    
    const routesObj = data.routes;
    const routeKeys = Object.keys(routesObj);
    
    if (routeKeys.length === 0) {
      console.log('TopRoutesChart - Routes object is empty');
      return { 
        labels: ['No data'], 
        datasets: [{ 
          label: 'Route Visits', 
          data: [0], 
          backgroundColor: 'rgba(54, 162, 235, 0.6)' 
        }] 
      };
    }
    
    console.log('TopRoutesChart - Processing routes:', routeKeys);
    const routes = Object.entries(routesObj)
      .map(([route, count]) => [route, typeof count === 'number' ? count : parseInt(count) || 0])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    console.log('TopRoutesChart - Sorted routes:', routes);
    
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

  const options = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: { enabled: chartData.labels[0] !== 'No data' }
    }, 
    scales: { 
      y: { beginAtZero: true, ticks: { stepSize: 1 } } 
    } 
  };

  return (
    <div className="chart-300">
      <Bar 
        key={JSON.stringify(chartData.labels)} 
        data={chartData} 
        options={options}
        updateMode="active"
      />
    </div>
  );
}


