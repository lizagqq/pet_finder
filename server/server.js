const express = require('express');
const cors = require('cors');
const petRoutes = require('./routes/pets');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/pets', petRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));