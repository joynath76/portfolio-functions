const { db } = require('../util/admin');
const { eliminateEmptyData } = require('../util/validators');

exports.getEducations = (req, res) => {
  const userhandle = req.params.userHandle;
  db
  .collection('Educations')
  .where('userHandle', '==', userhandle)
  .get()
  .then(data => {
      let educations = [];
      data.forEach(doc => {
          educations.push({
              educationId: doc.id,
              ...doc.data()
          }); 
      });
      return res.json(educations);
  })
  .catch(err => console.error(err));
};

exports.addEducation = (req, res) => {
  let newEducation = {userHandle : req.user.handle};
  for (properties in req.body){
    newEducation[properties] = req.body[properties];
  }
  newEducation = eliminateEmptyData(newEducation);
  db
  .collection('Educations')
  .add(newEducation)
  .then((doc) => {
    res.json({ educationId : doc.id})
  })
  .catch(err => {
    res.status(500).json({ error : `something went wrong`});
    console.log(err);
  });
}

exports.updateEducation = (req, res) => {
  let newEducation = {};
  for (properties in req.body){
    newEducation[properties] = req.body[properties];
  }
  newEducation = eliminateEmptyData(newEducation);
  const educationId = req.params.educationId;
  const document = db.doc(`/Educations/${educationId}`);
  document
  .get()
  .then((doc) => {
    if(!doc.exists){
      return res.status(404).json({ error: "Not Found"});
    }
    if( doc.data().userHandle === req.user.handle ) {
      return document.update(newEducation);
    } else {
      return res.status(403).json({error: "Unauthorised"})
    }
  })
  .then(() => res.status(201).json({message: "Updated Education successfully"}))
  .catch(err => {
    console.error(err);
    res.status(404).json({error: err.code});
  })
}


exports.deleteEducation = (req, res) => {
  const educationId = req.params.educationId;
  const document = db.doc(`/Educations/${educationId}`);
  document
  .get()
  .then((doc) => {
    if(!doc.exists){
      return res.status(404).json({ error: "Education Not Found"});
    }
    if( doc.data().userHandle === req.user.handle ) {
      return document.delete();
    } else {
      return res.status(403).json({error: "Unauthorised"})
    }
  })
  .then(() => res.status(201).json({message: "Deleted Education successfully"}))
  .catch(err => {
    console.error(err);
    res.status(404).json({error: err.code});
  })
}