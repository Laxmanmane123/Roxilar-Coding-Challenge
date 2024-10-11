import React, { useState } from 'react';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import PriceRangeBarChart from './components/PriceRangeBarChart';
import CategoryPieChart from './components/CategoryPieChart';
import './App.css';

const App = () => {
  const [month, setMonth] = useState(3);  // Default: March
  const [search, setSearch] = useState('');

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  return (
    <div className="container">
      <h1>Transactions Dashboard</h1>
      <div className="controls">
        <select value={month} onChange={handleMonthChange}>
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((monthName, index) => (
            <option key={index} value={index + 1}>{monthName}</option>
          ))}
        </select>
        <input 
          type="text" 
          placeholder="Search Transactions"
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>
      
      <TransactionsTable month={month} search={search} />
      <Statistics month={month} />
      <PriceRangeBarChart month={month} />
      <CategoryPieChart month={month} />
    </div>
  );
};

export default App;
