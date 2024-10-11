import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './styles/CategoryPieChart.css';
import { Box, Typography, CircularProgress } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF'];

const CategoryPieChart = ({ month }) => {
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPieChartData = async () => {
      setLoading(true);
      try {
        // Fetch data from the API
        const response = await axios.get(`http://localhost:5000/api/pie-chart`, { params: { month } });

        // Transform the object into an array of objects suitable for PieChart
        const formattedData = Object.keys(response.data).map((category, index) => ({
          name: category, // Use the category name as the label
          value: response.data[category], // Use the count as the value
          color: COLORS[index % COLORS.length], // Assign a color to each slice
        }));

        setPieData(formattedData); // Set the transformed data to the pieData state
      } catch (error) {
        console.error('Error fetching pie chart data', error);
      }
      setLoading(false);
    };

    fetchPieChartData();
  }, [month]);

  return (
    <Box className="pie-chart-container">
      <Typography variant="h6">Category Distribution</Typography>
      {loading ? <CircularProgress /> : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default CategoryPieChart;
