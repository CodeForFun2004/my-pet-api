const express = require('express');

const app = express();

app.get('/', (req, res)=>{
    res.send('My Pet say hiii');
})

app.listen(3000, ()=>{
    console.log('Server is running on http://localhost:3000');
})