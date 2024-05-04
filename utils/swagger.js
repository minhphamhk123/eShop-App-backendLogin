import { request, response } from "express";
import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "My API Description",
  },
};

const options = {
  swaggerDefinition: swaggerDefinition,
  apis: ["./src/index.js", "./src/routes/auth.route.js"], // files containing annotations as above
};


const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
