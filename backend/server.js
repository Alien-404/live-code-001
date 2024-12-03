require('dotenv').config();
const express = require('express');
const config = require('./src/config/config.js');
const routes = require('./src/routes/agen.js');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(cors({
    origin: ['http://localhost:3001']
}));
app.use(morgan('common'));

app.use('/v1', routes);


app.listen(config.PORT, () => {
    console.log(`running on port ${config.PORT}`);
});

