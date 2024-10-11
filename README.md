# MERN Stack Coding Challenge

## Overview
This project is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application that interacts with a third-party API to fetch product transactions and provides multiple endpoints to display, search, and visualize the data. The frontend displays a table and charts based on API responses.

### Backend

#### 1. Initialize Database API
**Endpoint:** `/api/init-db`  
**Method:** `GET`  
Fetches the product transaction data from a third-party API and seeds the MongoDB database.

#### 2. List All Transactions
**Endpoint:** `/api/transactions`  
**Method:** `GET`  
**Parameters:**
- `month` (required): Month of the transactions to fetch.
- `search` (optional): Search text for product title, description, or price.
- `page` (optional): Pagination page (default is 1).
- `perPage` (optional): Items per page (default is 10).

Returns a paginated list of transactions for the selected month, supporting search on product title, description, and price.

#### 3. Transaction Statistics
**Endpoint:** `/api/statistics`  
**Method:** `GET`  
**Parameters:**
- `month` (required): Month of the transactions to fetch statistics for.

Returns:
- Total sale amount for the month.
- Total number of sold items.
- Total number of unsold items.

#### 4. Bar Chart Data
**Endpoint:** `/api/bar-chart`  
**Method:** `GET`  
**Parameters:**
- `month` (required): Month of the transactions to fetch.

Returns a list of price ranges and the number of items in each range:
- 0 - 100
- 101 - 200
- 201 - 300
- 301 - 400
- 401 - 500
- 501 - 600
- 601 - 700
- 701 - 800
- 801 - 900
- 901 - above

#### 5. Pie Chart Data
**Endpoint:** `/api/pie-chart`  
**Method:** `GET`  
**Parameters:**
- `month` (required): Month of the transactions to fetch.

Returns unique product categories and the number of items in each category for the selected month.

#### 6. Combined API
**Endpoint:** `/api/combined-data`  
**Method:** `GET`  
**Parameters:**
- `month` (required): Month of the transactions to fetch.

Fetches data from the List All Transactions, Statistics, and Bar Chart APIs, combines them, and returns a single response.

### Frontend

#### Transactions Table
- Displays a list of transactions for a selected month (default: March).
- Allows searching by product title, description, or price.
- Supports pagination (Next and Previous buttons).
- Dynamically updates based on search input or month selection.

#### Transactions Statistics
Displays the following data for the selected month:
- Total sale amount.
- Total sold items.
- Total unsold items.

#### Transactions Bar Chart
Visualizes the price ranges of sold items for the selected month using a bar chart.

#### Transactions Pie Chart
Displays unique product categories and the number of items in each category for the selected month using a pie chart.

### How to Run

#### Prerequisites
- Node.js
- MongoDB

#### Installation
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd <project_directory>
