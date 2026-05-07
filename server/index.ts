import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import { pool } from './db.js';
import companiesRouter from './routes/companies.js';
import unitsRouter from './routes/units.js';
import sectorsRouter from './routes/sectors.js';
import jobRolesRouter from './routes/jobRoles.js';
import episRouter from './routes/epis.js';
import equipmentRouter from './routes/equipment.js';
import surveyQuestionsRouter from './routes/surveyQuestions.js';
import pausesRouter from './routes/pauses.js';
import shiftsRouter from './routes/shifts.js';
import riskClassificationsRouter from './routes/riskClassifications.js';
import reportTextsRouter from './routes/reportTexts.js';
import scientificMethodsRouter from './routes/scientificMethods.js';
import checklistQuestionsRouter from './routes/checklistQuestions.js';
import biomechanicalFactorsRouter from './routes/biomechanicalFactors.js';
import illuminanceParamsRouter from './routes/illuminanceParams.js';
import projectsRouter from './routes/projects.js';
import clientsRouter from './routes/clients.js';
import ocupacoesRouter from './routes/ocupacoes.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json({ limit: '50mb' }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// Health check + teste de conexão
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: String(err) });
  }
});

// Catálogo / Parâmetros
app.use('/api/companies',              companiesRouter);
app.use('/api/units',                  unitsRouter);
app.use('/api/sectors',                sectorsRouter);
app.use('/api/job-roles',              jobRolesRouter);
app.use('/api/epis',                   episRouter);
app.use('/api/equipment',              equipmentRouter);
app.use('/api/survey-questions',       surveyQuestionsRouter);
app.use('/api/pauses',                 pausesRouter);
app.use('/api/shifts',                 shiftsRouter);
app.use('/api/risk-classifications',   riskClassificationsRouter);
app.use('/api/report-texts',           reportTextsRouter);
app.use('/api/scientific-methods',     scientificMethodsRouter);
app.use('/api/checklist-questions',    checklistQuestionsRouter);
app.use('/api/biomechanical-factors',  biomechanicalFactorsRouter);
app.use('/api/illuminance-params',     illuminanceParamsRouter);

// Autenticação e Usuários
app.use('/api/auth',                   authRouter);
app.use('/api/users',                  usersRouter);

// Projetos e Clientes (JSONB)
app.use('/api/projects',               projectsRouter);
app.use('/api/clients',                clientsRouter);
app.use('/api/ocupacoes',              ocupacoesRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
