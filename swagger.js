const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecommerce API',
      version: '1.0.0',
      description: 'API documentation for the Eshop backend',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Change to your live URL after deployment
      },
    ],
  },
  apis: ['../routers/*.js'], // Path to API routes for documentation
};

const swaggerSpec = swaggerJsDoc(options);

function swaggerDocs(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger Docs available at http://localhost:3000/api-docs');
}

module.exports = swaggerDocs;
