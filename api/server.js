const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const { mongoose } = require('mongoose');

const app = express();

mongoose.connect('mongodb://127.0.0.1/test');

app.use(cors());
app.use(bodyParser.json());

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
