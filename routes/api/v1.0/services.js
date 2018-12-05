var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var _ = require("underscore");

/* Coneccion Antigua
 *  var Home = require("../../../database/collections/homes");
 *  var Img = require("../../../database/collections/img");
 */

//Nueva Coneccion
var RESTAURANT = require("../../../database/collections/restaurant");
var MENUS = require("../../../database/collections/menu");
var CLIENT = require("../../../database/collections/client");

var jwt = require("jsonwebtoken");

//Libreria para subir imagenes MULTER

var storage = multer.diskStorage({
  destination: "./public/restaurants",
  filename: function (req, file, cb) {
    console.log("-------------------------");
    console.log(file);
    cb(null, "IMG_" + Date.now() + ".jpg");
  }
});
var upload = multer({
  storage: storage
}).single("img");;

/*
Login USER
*/

router.post("/loginhome", (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;
  var result = Home.findOne({name: username,password: password}).exec((err, doc) => {
    if (err) {
      res.status(200).json({
        msn : "No se puede concretar con la peticion "
      });
      return;
    }
    if (doc) {
      //res.status(200).json(doc);
      jwt.sign({name: doc.name, password: doc.password}, "secretkey123", (err, token) => {
          console.log(err);
          res.status(200).json({
            token : token
          });
      })
    } else {
      res.status(200).json({
        msn : "El usuario no existe ne la base de datos"
      });
    }
  });
});

/*
 *
 *Middelware para verificación del token
 *esta funcion se usa en la API de restaurantes
 *
 */
function verifytoken (req, res, next) {
  //Recuperar el header
  const header = req.headers["authorization"];
  if (header  == undefined) {
      res.status(403).json({
        msn: "No autotizado"
      })
  } else {
      req.token = header.split(" ")[1];
      jwt.verify(req.token, "semilla", (err, authData) => {
        if (err) {
          res.status(403).json({
            msn: "No autotizado"
          })
        } else {
          next();
        }
      });
  }
}

//CRUD Create, Read, Update, Delete
//Creation of users
router.post(/homeimg\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  upload(req, res, (err) => {
    if (err) {
      res.status(500).json({
        "msn" : "No se ha podido subir la imagen"
      });
    } else {
      var ruta = req.file.path.substr(6, req.file.path.length);
      console.log(ruta);
      var img = {
        idhome: id,
        name : req.file.originalname,
        physicalpath: req.file.path,
        relativepath: "http://localhost:7777" + ruta
      };
      var imgData = new Img(img);
      imgData.save().then( (infoimg) => {
        //content-type
        //Update User IMG
        var home = {
          gallery: new Array()
        }
        Home.findOne({_id:id}).exec( (err, docs) =>{
          //console.log(docs);
          var data = docs.gallery;
          var aux = new  Array();
          if (data.length == 1 && data[0] == "") {
            home.gallery.push("/api/v1.0/homeimg/" + infoimg._id)
          } else {
            aux.push("/api/v1.0/homeimg/" + infoimg._id);
            data = data.concat(aux);
            home.gallery = data;
          }
          Home.findOneAndUpdate({_id : id}, home, (err, params) => {
              if (err) {
                res.status(500).json({
                  "msn" : "error en la actualizacion del usuario"
                });
                return;
              }
              res.status(200).json(
                req.file
              );
              return;
          });
        });
      });
    }
  });
});
router.get(/homeimg\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  console.log(id)
  Img.findOne({_id: id}).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn": "Sucedio algun error en el servicio"
      });
      return;
    }
    //regresamos la imagen deseada
    var img = fs.readFileSync("./" + docs.physicalpath);
    //var img = fs.readFileSync("./public/avatars/img.jpg");
    res.contentType('image/jpeg');
    res.status(200).send(img);
  });
});
router.post("/home", (req, res) => {
  //Ejemplo de validacion
  if (req.body.name == "" && req.body.email == "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }
  var home = {
    street : req.body.street,
    descripcion : req.body.descripcion,
    price : req.body.price,
    lat : req.body.lat,
    lon : req.body.lon,
    neighborhood : req.body.neighborhood,
    city : req.body.city,
    gallery: "",
    contact: req.body.contact
  };
  var homeData = new Home(home);

  homeData.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "usuario Registrado con exito "
    });
  });
});

// READ all users
router.get("/home", (req, res, next) => {
  var params = req.query;
  console.log(params);
  var price = params.price;
  var over = params.over;

  if (price == undefined && over == undefined) {
    // filtra los datos que tengan en sus atributos lat y lon null;
    Home.find({lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
    return;
  }
  if (over == "equals") {
    console.log("--------->>>>>>>")
    Home.find({price:price, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
    return;
  } else if ( over == "true") {
    Home.find({price: {$gt:price}, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
  } else if (over == "false") {
    Home.find({price: {$lt:price}, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
  }
});
// Read only one user
router.get(/home\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  User.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({
      "msn" : "No existe el recurso "
    });
  })
});

router.delete(/home\/[a-z0-9]{1,}$/, verifytoken, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  User.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});
router.patch(/home\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var home = {};
  for (var i = 0; i < keys.length; i++) {
    home[keys[i]] = req.body[keys[i]];
  }
  console.log(home);
  Home.findOneAndUpdate({_id: id}, home, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
router.put(/home\/[a-z0-9]{1,}$/, verifytoken,(req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['name', 'altura', 'peso', 'edad', 'sexo', 'email'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var user = {
    name : req.body.name,
    altura : req.body.altura,
    peso : req.body.peso,
    edad : req.body.edad,
    sexo : req.body.sexo,
    email : req.body.email
  };
  Home.findOneAndUpdate({_id: id}, user, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});


/*
 *
 *
 * Aqui empieza la API del restaurant
 *
 *
 */

//registro de ususarios
router.post("/client", (req, res) => {
  var client = req.body;

  //completar la validación IMPORTANTE!!

  client["registerdate"] = new Date();
  var cli = new CLIENT(client);
  cli.save().then((docs) => {
    res.status(200).json(docs);
  });
});

//login del cliente
router.post("/login", (req, res, next) => {
  var email    = req.body.email;
  var password = req.body.password;

  var result = CLIENT.findOne({email: email, password: password}).exec((err, doc) => {
    if (err) {
      res.status(200).json({
        "msn" : "Petición rechazada."
      });
      return;
    }
    if (doc) {
      jwt.sign({name: doc.email, password: doc.password}, "semilla", (err, token) => {
        console.log(err);
        res.status(200).json({
          token : token
        });
      });
    } else {
      res.status(500).json({
        "msn" : "El usuario no existe en la base de datos."
      });
    }
  });
});

//añadir restaurante
router.post("/restaurant", verifytoken, (req, res) =>{
  var data = req.body;

  //validacion IMPORTANTE!!
  if (req.body.name == "" && req.body.nit == "" && req.body.street == "") {
    res.status(400).json({
      "msn" : "Formato incorrecto"
    });
    return;
  }

  data["registerdate"] = new Date();

  var newrestaurant = new RESTAURANT(data);
  newrestaurant.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "Restaurante agregado con exito."
    });
  });
});

//Mostrar todos los Restaurantes
router.get("/restaurant", verifytoken, (req, res) => {
  var skip  = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }
  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  RESTAURANT.find({}).skip(skip).limit(limit).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Error en la base de datos."
      });
      return;
    }
    res.status(200).json(docs);
  });
});

//Mostrar un solo restaurante
router.get(/\/restaurant\/[a-z0-9]{1,}$/, verifytoken, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  RESTAURANT.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }
    res.status(404).json({
      "msn" : "No existe el recurso "
    });
  })
});

//Eliminar restaurante
router.delete(/\/restaurant\/[a-z0-9]{1,}$/, verifytoken, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  RESTAURANT.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});

//Actualizar todo un objeto restaurante
router.put(/restaurant\/[a-z0-9]{1,}$/, verifytoken,(req, res) => {
  var url         = req.url;
  var id          = url.split("/")[2];
  var keys        = Object.keys(req.body);
  var oficialkeys = ['name', 'nit', 'property', 'street', 'phone', 'log', 'lat'];
  var result      = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato, use patch si desea editar solo un fragmento de la informacion."
    });
    return;
  }
  var user = {
    name     : req.body.name,
    nit      : req.body.nit,
    property : req.body.property,
    street   : req.body.street,
    phone    : req.body.phone,
    log      : req.body.log,
    lat      : req.body.lat
  };
  RESTAURANT.findOneAndUpdate({_id: id}, user, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});

//Actualizar Restaurant
router.patch("/restaurant", verifytoken, (req, res) => {
  url = req.url;
  var params = req.body;
  var id     = req.query.id;
  //Collection data
  var keys       = Object.keys(params);
  var updatekeys = ["name", "nit", "property", "street", "phone", "log", "lat", "logo", "picture"];
  var newkeys    = [];
  var values     = [];
  //seguridad
  for (var i = 0; i < updatekeys.length; i++) {
    var index = keys.indexOf(updatekeys[i]);
    if (index != -1) {
      newkeys.push(keys[index]);
      values.push(params[keys[index]]);
    }
  }
  var objupdate = {}
  for (var i = 0; i < newkeys.length; i++) {
    objupdate[newkeys[i]] = values[i];
  }
  console.log(objupdate);
  RESTAURANT.findOneAndUpdate({_id: id}, objupdate, (err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Existe un error en la base de datos."
      });
      return;
    }
    var id = docs._id
    res.status(200).json({
      "msn" : id
    });
  });
});

//subir imagen del restaurante
router.post("/imgrestaurant", verifytoken, (req, res) => {
  var params = req.query;
  var id     = params.id;
  RESTAURANT.findOne({_id: id}).exec((err, docs) =>{
    if (err) {
      res.status(501).json({
        "msn" : "Problema con la base de datos."
      });
      return;
    }
    if (docs != undefined) {
      /*res.status(200).json({
       *"msn" : "Imagen Guardada."
       *});
       */
      upload(req, res, (err) => {
        if (err) {
          res.status(500).json({
            "msn" : "Error al subir la imagen."
          });
        }
        var url = req.file.path.replace(/public/g, "");

        RESTAURANT.update({_id: id}, {$set:{picture:url}}, (err, docs) => {
          if(err) {
            res.status(200).json({
              "msn" : err
            });
          }
          res.status(200).json(docs);
        });
      });
    }
  });
});

module.exports = router;
