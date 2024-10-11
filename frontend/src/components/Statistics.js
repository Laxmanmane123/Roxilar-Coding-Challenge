import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/Statistics.css';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';

const Statistics = ({ month }) => {
  const [stats, setStats] = useState({ totalSale: 0, soldCount: 0, unsoldCount: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/statistics`, { params: { month } });
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
      setLoading(false);
    };

    fetchStatistics();
  }, [month]);

  return (
    <div className="statistics-cards">
      {loading ? <CircularProgress /> : (
        <>
          <Card className="statistics-card">
            <CardContent>
              <Typography>Total Sale Amount</Typography>
              <Typography variant="h6">${stats.totalSale}</Typography>
            </CardContent>
          </Card>
          <Card className="statistics-card">
            <CardContent>
              <Typography>Total Sold Items</Typography>
              <Typography variant="h6">{stats.soldCount}</Typography>
            </CardContent>
          </Card>
          <Card className="statistics-card">
            <CardContent>
              <Typography>Total Unsold Items</Typography>
              <Typography variant="h6">{stats.unsoldCount}</Typography>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Statistics;
