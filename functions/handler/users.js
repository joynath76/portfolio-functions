const { db } = require('../util/admin');
const config = require('../util/config');
const firebase = require('firebase');
const { validateSignupData, validateLoginData } = require('../util/validators');

firebase.initializeApp(config);

exports.signup = (req, res) => {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle,
      fullname: req.body.fullname
    };
    
    const { errors, valid} = validateSignupData(newUser);
    if(!valid){
        return res.status(400).json(errors);
    }
  
    db.doc(`/Users/${newUser.handle}`).get()
    .then(doc => {
      if(doc.exists){
        return res.status(400).json({handle: `this handle is already exist`})
      } else {
        firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data => {
          return {
            userId: data.user.uid,
            idToken: data.user.getIdToken()
          }
        })
        .then(data => {
          const userCredential = {
            handle: newUser.handle,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            userId: data.userId,
            fullname: newUser.fullname,
            backgroundImageUrl: "https://firebasestorage.googleapis.com/v0/b/portfolio-app-d2190.appspot.com/o/Photos%2FdefaultBackgroundImage.jpg?alt=media",
            profileImageUrl: "https://firebasestorage.googleapis.com/v0/b/portfolio-app-d2190.appspot.com/o/Photos%2FdefaultProfileImage.jpg?alt=media"
          }
          db.doc(`Users/${newUser.handle}`).set(userCredential)
          .then(() => {
            return res.status(201).json({token : data.idToken.i})
          })
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({ error: err.code});
        })
      }
    })
    .catch(err => {
      if(err.code === 'auth/email-already-in-use')
        return res.status(400).json({ error: "email already in use"});
      return res.status(500).json({ error: err.code});
    })
  
  };

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }
  const { errors, valid} = validateLoginData(user);
  if(!valid){
    return res.status(400).json(errors);
  }

  firebase.auth()
  .signInWithEmailAndPassword(user.email, user.password)
  .then(data => {
    return data.user.getIdToken();
  })
  .then(token => {
    return res.status(201).json({token});
  })
  .catch(err => {
    console.log(err);
    if(err.code === 'auth/wrong-password')
      return res.status(403).json({general : "wrong credentials, please try again"})
    return res.status(500).json({error : err.code});
  })
};

exports.getAllUserData = (req, res) => {
  const userData = {};
  const userhandle = Object.keys(req.params).length === 0 ? req.user.handle : req.params.userHandle;
  db
  .collection('Users')
  .where('handle', '==', userhandle)
  .get()
  .then(data => {
    userData.credentail = [];
    data.forEach(doc => {
      userData.credentail.push(doc.data());
    })
  })
  .then(() => {
    db
      .collection('Projects')
      .where('userHandle', '==', userhandle)
      .get()
      .then(data => {
        userData.Projects = [];
        data.forEach(doc => {
          userData.Projects.push({
            projectId: doc.id,
            ...doc.data()
        });
      })
    })
    .then(() => {
      db
      .collection('Educations')
      .where('userHandle', '==', userhandle)
      .get()
      .then(data => {
        userData.Educations = [];
        data.forEach(doc => {
          userData.Educations.push({
            educationId: doc.id,
            ...doc.data()
          });
        })
      })
      .then(() => {
        db
        .collection('Experiences')
        .where('userHandle', '==', userhandle)
        .get()
        .then(data => {
          userData.Experiences = [];
          data.forEach(doc => {
            userData.Experiences.push({
              experienceId: doc.id,
              ...doc.data()
            });
          })
        })
        .then(() => {
          db
          .collection('Others')
          .where('userHandle', '==', userhandle)
          .get()
          .then(data => {
            userData.Others = [];
            data.forEach(doc => {
              userData.Others.push({
                otherId: doc.id,
                ...doc.data()
              });
            })
          })
          .then(() => {
            return res.status(201).json(userData);
          })
        })
      })
    })
  })
  .catch(err => {
    console.error(err);
    return res.status(500).json({error: err.code});
  })
}

exports.addUserData = (req, res) => {
  let data = {};
  for (properties in req.body){
    data[properties] = req.body[properties];
  }
  data = eliminateEmptyData(data);
  const userHandle = req.user.handle;
  const document = db.doc(`/Users/${userHandle}`);
  document
  .get()
  .then((doc) => {
    if(!doc.exists){
      return res.status(404).json({ error: "Not Found"});
    }
    if( doc.data().userHandle === req.user.handle ) {
      return document.update(data);
    } else {
      return res.status(403).json({error: "Unauthorised"})
    }
  })
  .then(() => res.status(201).json({message: `Updated User ${userHandle} successfully`}))
  .catch(err => {
    console.error(err);
    res.status(404).json({error: err.code});
  })
}