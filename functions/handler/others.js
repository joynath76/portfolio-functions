const { db } = require('../util/admin');
const { eliminateEmptyData } = require('../util/validators');

exports.getOthers = (req, res) => {
  const userhandle = req.params.userHandle;
  db
  .collection('Others')
  .where('userHandle', '==', userhandle)
  .get()
  .then(data => {
      let Others = [];
      data.forEach(doc => {
          Others.push({
              otherId: doc.id,
              ...doc.data()
          }); 
      });
      return res.json(Others);
  })
  .catch(err => console.error(err));
};

exports.addOther = (req, res) => {
  let newOther = {userHandle : req.user.handle};
  for (properties in req.body){
    newOther[properties] = req.body[properties];
  }
  newOther = eliminateEmptyData(newOther);
  db
  .collection('Others')
  .add(newOther)
  .then((doc) => {
    res.json({ otherId : doc.id})
  })
  .catch(err => {
    res.status(500).json({ error : `something went wrong`});
    console.log(err);
  });
}

exports.updateOther = (req, res) => {
  let updateOther = {};
  for (properties in req.body){
    updateOther[properties] = req.body[properties];
  }
  newOther = eliminateEmptyData(newOther);
  const otherId = req.params.otherId;
  const document = db.doc(`/Others/${otherId}`);
  document.get()
  .then(doc => {
    if(!doc.exists){
      return res.status(404).json({error: "Not found"});
    }
    if(doc.data().userHandle !== req.user.handle){
      return res.status(403).json({error: "Unauthorised"});
    }
    else {
      document.update(updateOther)
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


exports.deleteOther = (req, res) => {
  const otherId = req.params.otherId;
  const document = db.doc(`/Others/${otherId}`);
  document
  .get()
  .then((doc) => {
    if(!doc.exists){
      return res.status(404).json({ error: "Other Not Found"});
    }
    if( doc.data().userHandle === req.user.handle ) {
      return document.delete();
    } else {
      return res.status(403).json({error: "Unauthorised"})
    }
  })
  .then(() => res.status(201).json({message: "Deleted Other successfully"}))
  .catch(err => {
    console.error(err);
    res.status(404).json({error: err.code});
  })
}