import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import './styles/TransactionsTable.css';

const TransactionsTable = ({ month, search }) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/transactions', {
          params: { month, page, search }
        });
        console.log(response.data.transactions)
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [month, page, search]);

  return (
    <div className="transactions-table">
      {loading ? <CircularProgress /> : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Date of Sale</TableCell>
                <TableCell>Sold</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.title}</TableCell>
                  <TableCell>{transaction.price}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{new Date(transaction.dateOfSale).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.sold ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="pagination-btns">
            <Button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
            <Button onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionsTable;
