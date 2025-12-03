// Basic template for an admin-server entry point file. 
// It sets up an Express server, enables CORS, configures middleware, mounts
// the admin routes, ensures the database table exists, and starts listening on a port.
// WILL NEED TO CHANGE, COPIED BASIC SERVER FROM PROVIDED TEMPLATE
// ADMIN SERVER

const express = require('express');
const cors = require('cors');
const cookierParser = require('cookie-parser');
const app = express();

const ollama = require('ollama')
const { createDatabaseTable } = require('./admin-service/models/adminModel');

const adminRoutes = require('./admin-service/routes/adminRoutes');
const clientRoutes = require('./client-service/routes/clientRoutes');
const llmRoutes = require('./llm-driven-booking/routes/llmRoutes');
const uaRoutes = require('./user-authentication/routes/uaRoutes');



// app.use(cors());
app.use(cors({
    // origin: "http://localhost:3000", // CHANGE
    origin: "https://cpsc-3720-project-byqe.vercel.app",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookierParser());


app.use('/api/admin', adminRoutes);
app.use('/api', clientRoutes);
app.use('/api', llmRoutes);
app.use('/api/authentication', uaRoutes);


module.exports = app;

const PORT = process.env.PORT || 5001;

// Ensure database table exists (only run if not testing)
if (process.env.NODE_ENV !== 'test') {
  createDatabaseTable();
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}



// // Client-service runs on port 7001
// if (require.main === module) {
//   const PORT = 7001;
//   app.listen(PORT, () =>
//     console.log(`Server running at http://localhost:${PORT}`)
//   );
// }
