const express = require('express');
const main = require('./config/db');

const app = express();

//Connect Database
main();

//Init Middleware
app.use(express.json({ extended: false }))

app.get('/', (req, res) => res.send('API Running'))

//Routes
app.use('/api/v3/app', require('./routes/api/v3/app'))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server started on port ' + PORT))