import express, { Request, Response } from 'express';
import path from 'path';
import database from "./config/db"
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './core/infrastructure/rest/routes/users.routes';
import loginRouter from './core/infrastructure/rest/routes/login.route';
import roleRouter from './core/infrastructure/rest/routes/roles.route';
import attendaceRouter from './core/infrastructure/rest/routes/attendaces.route';
import toolsRouter from './core/infrastructure/rest/routes/tools_catalog.route';
import materialsRouter from './core/infrastructure/rest/routes/materials_catalog.route';
import projectsRouter from './core/infrastructure/rest/routes/projects_catalog.route';
import categoriesRouter from './core/infrastructure/rest/routes/categories.route';
import subcategoriesRouter from './core/infrastructure/rest/routes/subcategories.route';
import employeesRouter from './core/infrastructure/rest/routes/employees.route';
import requestRouter from './core/infrastructure/rest/routes/request_details.route';
import requestRouter1 from './core/infrastructure/rest/routes/request_headers.route';
import requestsAdditionalRouter from './core/infrastructure/rest/routes/requests_additional.route';
import laborRelationsRouter from './core/infrastructure/rest/routes/labor-relations.route';
import employeeDocumentsRouter from './core/infrastructure/rest/routes/employee-documents.route';

import jobDescriptionRouter from './core/infrastructure/rest/routes/job-description.route';
import uploadRouter from './core/infrastructure/rest/routes/upload.route';
import terminationRouter from './core/infrastructure/rest/routes/terminations.route';

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

database.initialize()
  .then(() => console.log("Database connected"))
  .catch(console.error);

// Rutas
app.use('/api', userRouter);
app.use('/api', loginRouter);
app.use('/api', roleRouter);
app.use('/api', attendaceRouter);
app.use('/api', toolsRouter);
app.use('/api', materialsRouter);
app.use('/api', projectsRouter);
app.use('/api', categoriesRouter);
app.use('/api', subcategoriesRouter);
app.use('/api', employeesRouter);
app.use('/api', requestRouter);
app.use('/api', requestRouter1);
app.use('/api', requestsAdditionalRouter);
app.use('/api', laborRelationsRouter);
app.use('/api', employeeDocumentsRouter);
app.use('/api', jobDescriptionRouter);
app.use('/api', uploadRouter);
app.use('/api', terminationRouter);





// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


