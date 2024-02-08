const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

//routes
const authRouter = require('./src/routes/authRouter');
    const pictureRouter = require('./src/routes/pictureRouter');
    const userRouter = require('./src/routes/userRouter');
    const gallaryRouter = require('./src/routes/gallaryRouter');

    const app = express();
    const PORT = process.env.PORT || 4001;

    app.use(express.urlencoded({extended: true}));
    app.use(fileUpload({useTempFiles: true}));
    app.use(express.json());
    app.use(cors());


// routes use 
app.use('/api/auth', authRouter);
app.use('/api/gallary', gallaryRouter);
app.use('/api/picture', pictureRouter);
app.use('/api/user', userRouter);



const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, {})
.then(() => {
    app.listen(PORT, () => console.log(`Server stared on port: ${PORT}`));
})
.catch(error => console.log(error));

