import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChartComponent = ({ historicalData = [] }) => {
  // Create default empty data if historicalData is not provided
  const defaultData = Array(7).fill().map((_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: 0,
    shipped: 0,
    delivered: 0
  }));

  // Use provided data or default empty data
  const chartData = historicalData?.length ? historicalData : defaultData;

  // Prepare data for the chart
  const labels = chartData.map(item => item.date);
  const totalOrdersData = chartData.map(item => item.total);
  const shippedOrdersData = chartData.map(item => item.shipped);
  const deliveredOrdersData = chartData.map(item => item.delivered);

  const data = {
    labels,
    datasets: [
      {
        label: 'Total Orders',
        data: totalOrdersData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Shipped Orders',
        data: shippedOrdersData,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Delivered Orders',
        data: deliveredOrdersData,
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Orders Trend (Last 7 Days)',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Orders'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Line data={data} options={options} />
    </div>
  );
};

export default ChartComponent;