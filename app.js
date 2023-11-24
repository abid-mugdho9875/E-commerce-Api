require('dotenv').config();
//instead of try catch in controllers
require('express-async-errors');


const express = require('express');
const app = express();
//others
var morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');

//connect db
const connectDB = require('./db/connect');

//routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');


// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
//others middlewares
app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static('./public'));
app.use(fileUpload());

app.get('/',(req, res)=>{
    res.send('ecommerce')
})
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);

//error middleware
//if the route does not exist then notfoundmiddleware invoke
app.use(notFoundMiddleware);
//this invoke after succesful routing
app.use(errorHandlerMiddleware);
//port define
const port = process.env.PORT|| 3000
const start = async () => {
    try {
      await connectDB(process.env.MONGO_URI);
      app.listen(port, () =>
        console.log(`Server is listening on port ${port}...`)
      );
    } catch (error) {
      console.log(error);
    }
  };
  
  start();