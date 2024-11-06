// src/ResultGraph.js
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

function ResultGraph({ data }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    // Register all components (including scales)
    Chart.register(...registerables);

    const ctx = chartRef.current.getContext('2d');

    if (chartRef.current) {
      // Destroy previous chart instance
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Scores',
              data: data.values,
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)'
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Subjects'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Scores'
              }
            },
          },
        },
      });
    }
  }, [data]);

  return <canvas ref={chartRef} />;
}

export default ResultGraph;
