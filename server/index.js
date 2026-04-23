const express = require('express');
const cors = require('cors');
const invoiceRoutes = require('./routes/invoice');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/invoice', invoiceRoutes);

app.listen(8080, () => console.log('Server running on http://localhost:8080'));
