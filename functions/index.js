const functions = require('firebase-functions');
const app = require('express')();

const { signup, login, getAllUserData, addUserData } = require('./handler/users');
const userAuth = require('./util/userAuth');
const { getProjects, addProject, updateProject, deleteProject } = require('./handler/projects');
const { getExperiences, addExperience, updateExperience, deleteExperience } = require('./handler/experiences');
const { getEducations, addEducation, updateEducation, deleteEducation } = require('./handler/educations');
const uploadFiles = require('./handler/uploadFiles');
const { getOthers, addOther, updateOther, deleteOther } = require('./handler/others');

//Project handle Routes
app.get('/Projects/:userHandle', getProjects);
app.post('/Projects', userAuth , addProject);
app.post('/Projects/update/:projectId', userAuth , updateProject);
app.delete('/Projects/:projectId', userAuth, deleteProject);
//Experiences handle routes
app.get('/Experiences', getExperiences);
app.post('/Experiences', userAuth , addExperience);
app.post('/Experiences/update/:experienceId', userAuth , updateExperience);
app.delete('/Experiences/:experienceId', userAuth , deleteExperience);
//Educations handle routes
app.get('/Educations', getEducations);
app.post('/Educations', userAuth , addEducation);
app.post('/Educations/update/:educationId', userAuth , updateEducation);
app.delete('/Educations/:educationId', userAuth , deleteEducation);
//Others handle routes
app.get('/Others', getOthers);
app.post('/Others', userAuth , addOther);
app.post('/Others/update/:otherId', userAuth , updateOther);
app.delete('/Others/:otherId', userAuth , deleteOther);
//user authentication and handle routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/addDetails', userAuth, addUserData);
app.get('/user/:userHandle', getAllUserData);
app.get('/user', userAuth, getAllUserData);
//Upload files
app.post('/upload/files',userAuth, uploadFiles);


exports.api = functions.region('asia-south1').https.onRequest(app);
