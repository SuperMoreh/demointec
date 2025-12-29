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

import { RoleEntity } from './core/infrastructure/entity/roles.entity';
import { UserEntity } from './core/infrastructure/entity/users.entity';
import bcrypt from 'bcrypt';

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

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../public')));
app.get('/seed', async (req, res) => {
  try {
    if (!database.isInitialized) {
      await database.initialize();
      console.log("Database initialized for seeding");
    }

    const roleRepo = database.getRepository(RoleEntity);
    const userRepo = database.getRepository(UserEntity);

    // 1. Create Admin Role if not exists
    let adminRole = await roleRepo.findOne({ where: { name_role: 'Admin' } });
    if (!adminRole) {
      adminRole = roleRepo.create({ name_role: 'Admin', status: true });
      await roleRepo.save(adminRole);
      console.log('Role Admin created');
    }

    // 2. Create Admin User if not exists
    let adminUser = await userRepo.findOne({ where: { email: 'admin@intec.com' } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      adminUser = userRepo.create({
        name_user: 'Admin',
        email: 'admin@intec.com',
        password: hashedPassword,
        phone: '0000000000',
        status: true,
        role_id: adminRole
      });
      await userRepo.save(adminUser);
      console.log('User Admin created');
    }

    res.send('Seeding completed! User: admin@intec.com / Pass: 123456');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error seeding database: ' + error);
  }
});

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});





// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


