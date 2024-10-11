import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './styles/PriceRangeBarChart.css';
import { Box, Typography, CircularProgress } from '@mui/material';

const PriceRangeBarChart = ({ month }) => {
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBarChartData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/bar-chart`, { params: { month } });
        const formattedData = Object.keys(response.data).map(range => ({
          range,
          count: response.data[range]
        }));
        setBarData(formattedData);
      } catch (error) {
        console.error("Error fetching bar chart data", error);
      }
      setLoading(false);
    };

    fetchBarChartData();
  }, [month]);

  return (
    <Box className="bar-chart-container">
      <Typography variant="h6">Price Range Distribution</Typography>
      {loading ? <CircularProgress /> : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default PriceRangeBarChart;
