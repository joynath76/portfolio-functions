const { db } = require('../util/admin');
const { eliminateEmptyData } = require('../util/validators');

exports.getExperiences = (req, res) => {
  const userhandle = req.params.userHandle;
  db
  .collection('Experiences')
  .where('userHandle', '==', userhandle)
  .get()
  .then(data => {
      let experiences = [];
      data.forEach(doc => {
          experiences.push({
              experienceId: doc.id,
              ...doc.data()
          }); 
      });
      return res.json(experiences);
  })
  .catch(err => console.error(err));
};

exports.addExperience = (req, res) => {
  let newExperience = {userHandle : req.user.handle};
  for (properties in req.body){
    newExperience[properties] = req.body[properties];
  }
  newExperience = eliminateEmptyData(newExperience);
  db
  .collection('Experiences')
  .add(newExperience)
  .then((doc) => {
    res.json({ experienceId : doc.id})
  })
  .catch(err => {
    res.status(500).json({ error : `something went wrong`});
    console.log(err);
  });
}

exports.updateExperience = (req, res) => {
  let newExperience = {};
  for (properties in req.body){
    newExperience[properties] = req.body[properties];
  }
  newExperience = eliminateEmptyData(newExperience);
  newExperience = eliminateEmptyData(newExperience);
  const experienceId = req.params.experienceId;
  const document = db.doc(`/Experiences/${experienceId}`);
  document
  .get()
  .then((doc) => {
    if(!doc.exists){
      return res.status(404).json({ error: "Not Found"});
    }
    if( doc.data().userHandle === req.user.handle ) {
      return document.update(newExperience);
    } else {
      return res.status(403).json({error: "Unauthorised"})
    }
  })
  .then(() => res.status(201).json({message: "Experience updated successfully"}))
  .catch(err => {
    console.error(err);
    res.status(404).json({error: err.code});
  })
}

exports.deleteExperience = (req, res) => {
  const experienceId = req.params.experienceId;
  const document = db.doc(`/Experiences/${experienceId}`);
  document
  .get()
  .then((doc) => {
    if(!doc.exists){
      return res.status(404).json({ error: "Experience Not Found"});
    }
    if( doc.data().userHandle === req.user.handle ) {
      return document.delete();
    } else {
      return res.status(403).json({error: "Unauthorised"})
    }
  })
  .then(() => res.status(201).json({message: "Deleted Experience successfully"}))
  .catch(err => {
    console.error(err);
    res.status(404).json({error: err.code});
  })
}