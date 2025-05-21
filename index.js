const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 7000;



app.use(cors());
app.use(express.json());

app.get('/', (req,res) =>{
    res.send('HobbyHub is getting to started')
});

app.listen(port, () => {
    console.log(`Hobby Hub is running on port ${port}`)
})