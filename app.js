const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
// require('dotenv/config');
require('dotenv').config();
const api = process.env.API_URL
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const swaggerDocs = require('./swagger');
// swaggerDocs(app);

//Routers
const productsRoute = require('./routers/products');
const categoriesRoute = require('./routers/categories');
const ordersRoute = require('./routers/orders');
const usersRoute = require('./routers/users');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');



// Middleware
app.use(cors());
//options http request, *allows http to pass through diff origin
app.options('*', cors())


//middleware libraries
//middleware that helps read json comming from the data
//previously it is app.use(bodyParser)
app.use(express.json());
//used to log http request coming from the server
app.use(morgan('tiny'));
//make public folder static
app.use('/public/uploads', express.static(__dirname + '/public/uploads' ))

// Public routes (should be matched before auth middleware if you're testing)
app.use(`${api}/products`, productsRoute)
app.use(`${api}/users`, usersRoute)


// JWT Authentication
app.use(authJwt());

// Other protected routes
app.use(`${api}/categories`, categoriesRoute);
app.use(`${api}/orders`, ordersRoute);





app.use((req, res, next) => {
    res.status(404).json({
      data: null,
      message: 'Route not found',
    });
  });
  
//   // Global Error Handler (optional, for other types of errors)
//   app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({
//       data: null,
//       message: 'Not found!',
//     });
//   });

  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
  });

  

  app.use(errorHandler);
  

//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    //options
    // useUnifiedTopology: true, 
    dbName: 'Ecommerce'
})
.then(()=>{
    console.log('DataBase connection is ready...')
})
.catch((err)=>{
    console.log(err)
})

//server
//Development
app.listen(PORT, () => {
    console.log('server running on', PORT)

})

//Production
// var server = app.listen(PORT, function () {
//     var port = server.address().port;
//     console.log('Express is working on Port ' + port)
// }) 