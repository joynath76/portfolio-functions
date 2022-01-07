const { db } = require('../util/admin');
const { eliminateEmptyData } = require('../util/validators');

exports.getProjects = (req, res) => {
  const userhandle = req.params.userHandle;
  db
  .collection('Projects')
  .where('userHandle', '==', userhandle)
  .get()
  .then(data => {
      let projects = [];
      data.forEach(doc => {
          projects.push({
              projectId: doc.id,
              ...doc.data()
          }); 
      });
      return res.json(projects);
  })
  .catch(err => console.error(err));
};

exports.addProject = (req, res) => {
  let newProject = {userHandle : req.user.handle};
  for (properties in req.body){
    newProject[properties] = req.body[properties];
  }
  newProject = eliminateEmptyData(newProject);
  db
  .collection('Projects')
  .add(newProject)
  .then((doc) => {
    res.json({ projectId : doc.id})
  })
  .catch(err => {
    res.status(500).json({ error : `something went wrong`});
    console.log(err);
  });
}

exports.updateProject = (req, res) => {
  let updateProject = {};
  for (properties in req.body){
    updateProject[properties] = req.body[properties];
  }
  updateProject = eliminateEmptyData(updateProject);
  const projectId = req.params.projectId;
  const document = db.doc(`/Projects/${projectId}`);
  document.get()
  .then(doc => {
    if(!doc.exists){
      return res.status(404).json({error: "Not found"});
    }
    if(doc.data().userHandle !== req.user.handle){
      return res.status(403).json({error: "Unauthorised"});
    }
    else {
      document.update(updateProject)
      .then((doc) => {
        res.json({ message : `document ${doc.writeTime} created succesfully`})
      })
    }
  })  
  .catch(err => {
    res.status(500).json({ error : `something went wrong`});
    console.log(err);
  });
}


exports.deleteProject = (req, res) => {
  const projectId = req.params.projectId;
  const document = db.doc(`/Projects/${projectId}`);
  document
  .get()
  .then((doc) => {
    if(!doc.exists){
      return res.status(404).json({ error: "Project Not Found"});
    }
    if( doc.data().userHandle === req.user.handle ) {
      return document.delete();
    } else {
      return res.status(403).json({error: "Unauthorised"})
    }
  })
  .then(() => res.status(201).json({message: "Deleted project successfully"}))
  .catch(err => {
    console.error(err);
    res.status(404).json({error: err.code});
  })
}