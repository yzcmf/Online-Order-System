/**
 * Created by zyx on 2/1/17.
 */
var express = require('express');
var MongoClient = require('mongodb').MongoClient;//node mongo driver
var ObjectId = require('mongodb').ObjectId;//node mongo driver
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs'); // only the user can remember their password
var jwt = require('jwt-simple');
var app = express();
app.use(express.static(__dirname + "/public"));
// app.use(express.static(__dirname + "/public"));
// app.use(bodyParser.json());

var JWT_SECRET = 'catsmeow'; // keep the users login in;
var db = null;

MongoClient.connect("mongodb://localhost:27017/zyx", function (err, dbconn) {
    if (!err) {
        console.log("we are connected");
        db = dbconn;
    }
});
var mongojs = require('mongojs');
var db2 = mongojs('zyx', ['contactlist']);


app.use(bodyParser.json());       // to support JSON-encoded bodies

app.use(express.static('public'));

var meows = [
    'Hello this is yuxuan\'s online order',
    'How are you doing today',
    'I love the pizza and coca',
    'I run a good business'
];

app.get('/meows', function (req, res, next) {
    db.collection('meows', function (err, meowsCollection) {
        meowsCollection.find().toArray(function (err, meows) {
            return res.json(meows);
        });
    });
});

app.post('/meows', function (req, res, next) {
    var token = req.headers.authorization;
    var user = jwt.decode(token, JWT_SECRET);

    db.collection('meows', function (err, meowsCollection) {
        var newMeow = {
            text: req.body.newMeow,
            user: user._id,
            username: user.username
        };

        meowsCollection.insert(newMeow, {w: 1}, function (err) {
            return res.send();
        });
    });
});

app.put('/meows/remove', function (req, res, next) {

    var token = req.headers.authorization;
    var user = jwt.decode(token, JWT_SECRET);

    db.collection('meows', function (err, meowsCollection) {
        var meowId = req.body.meow._id;
        meowsCollection.remove({_id: ObjectId(meowId), user: user._id}, {w: 1}, function (err) {
            return res.send();
        });
    });
});

app.post('/users', function (req, res, next) {
    db.collection('users', function (err, usersCollection) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(req.body.password, salt, function (err, hash) {
                var newUser = {
                    username: req.body.username,
                    password: hash
                };
                usersCollection.insert(newUser, {w: 1}, function (err) {
                    return res.send();
                })
            })
        })
    });
});

app.put('/users/signin', function (req, res, next) {
    db.collection('users', function (err, usersCollection) {

        usersCollection.findOne({
                username: req.body.username
            }, function (err, user) {
                bcrypt.compare(req.body.password, user.password, function (err, result) {
                    if (result) {
                        var token = jwt.encode(user, JWT_SECRET);
                        return res.json({token: token});
                    }
                    else {
                        return res.status(400).send();
                    }
                })
            }
        )
    })
})

app.get('/table', function (req, res, next) {
    console.log("Server Get success");
    db.collection('table', function (err, tableCollection) {
        tableCollection.find().toArray(function (err, table) {
            return res.json(table);
        });
    });
});

app.post('/table', function (req, res, next) {
    console.log("Server Post success");
    db.collection('table', function (err, tableCollection) {
        var table = {
            name: req.body.name,
            date: req.body.date,
            time: req.body.time,
            size: req.body.size,
            phone: req.body.phone,
            ConfirmationCode: ObjectId(req.body._id)
            //ObjectId(req.body._id)
        };
        tableCollection.insert(table, {w: 1}, function (err) {
            //console.log("Send back success");
            return res.send();
            //return res.send(table);
        });
    });
});

app.put('/table/remove', function (req, res, next) {
    db.collection('table', function (err, tableCollection) {
        var tableId = req.body.booking._id;
        tableCollection.remove({_id: ObjectId(tableId)}, {w: 1}, function (err) {
            return res.send();
        });
    });
});

app.get('/restaurant', function (req, res, next) {
    console.log("restaurant Server Get success");
    db.collection('restaurant', function (err, restaurantCollection) {
        restaurantCollection.find().toArray(function (err, restaurant) {
            return res.json(restaurant);
        });
    });
});

app.post('/restaurant', function (req, res, next) {
    console.log("restaurant Server Post success");
    db.collection('restaurant', function (err, restaurantCollection) {
        var restaurant = {
            name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            phone: req.body.phone,
            CustomerId: req.body.CustomerId,
            CustomerName:req.body.CustomerName,
            CustomerDate:req.body.CustomerDate,
            CustomerTime:req.body.CustomerTime,
            CustomerSize:req.body.CustomerSize,
            CustomerPhone:req.body.CustomerPhone
            //ObjectId(req.body._id)
        };
        restaurantCollection.insert(restaurant, {w: 1}, function (err) {
            //console.log("Send back success");
            return res.send();
            //return res.send(table);
        });
    });
});

app.put('/restaurant/remove', function (req, res, next) {
    db.collection('restaurant', function (err, restaurantCollection) {
        var restaurantId = req.body.restaurant._id;
        restaurantCollection.remove({_id: ObjectId(restaurantId)}, {w: 1}, function (err) {
            return res.send();
        });
    });
});

// app.put('/table/remove', function (req, res, next) {
//     db.collection('table', function (err, tableCollection) {
//         var tableId = req.body.booking._id;
//         tableCollection.remove({_id: ObjectId(tableId)}, {w: 1}, function (err) {
//             return res.send();
//         });
//     });
// });

//For the contacts' usage

app.get('/table', function (req, res) {
    console.log('I received a GET request');

    db2.table.find(function (err, docs) {
        console.log(docs);
        res.json(docs);
    });
});


app.post('/table', function (req, res) {
    console.log('I received a POST request');
    console.log(req.body);
    db2.table.insert(req.body, function(err, doc) {
        res.json(doc);
    });
});

app.delete('/table/:id', function (req, res) {
    var id = req.params.id;
    console.log(id);
    db2.table.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
        res.json(doc);
    });
});

app.get('/table/:id', function (req, res) {
    var id = req.params.id;
    console.log(id);
    db2.table.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
        res.json(doc);
    });
});

app.put('/table/:id', function (req, res) {
    var id = req.params.id;
    console.log(req.body.name);
    db2.table.findAndModify({
            query: {_id: mongojs.ObjectId(id)},
            update: {$set: {name: req.body.name, date: req.body.date, time: req.body.time
                ,size: req.body.size,phone: req.body.phone,ConfirmationCode: req.body._id}},
            new: true}, function (err, doc) {
            res.json(doc);
        }
    );
});

app.delete('/restaurant/:id', function (req, res) {
    var id = req.params.id;
    console.log(id);
    db2.restaurant.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
        res.json(doc);
    });
});

app.get('/restaurant/:id', function (req, res) {
    var id = req.params.id;
    console.log(id);
    db2.restaurant.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
        res.json(doc);
    });
});

app.put('/restaurant/:id', function (req, res) {
    var id = req.params.id;
    console.log(req.body.name);
    db2.restaurant.findAndModify({
            query: {_id: mongojs.ObjectId(id)},
            update: {$set: {name: req.body.name, email: req.body.email, address: req.body.address,phone: req.body.phone
                ,CustomerId: req.body.CustomerId,CustomerName: req.body.CustomerName,CustomerDate: req.body.CustomerDate
                ,CustomerTime: req.body.CustomerTime,CustomerSize: req.body.CustomerSize,CustomerPhone: req.body.CustomerPhone}},
            new: true}, function (err, doc) {
            res.json(doc);
        }
    );
});

app.listen(2000, function () {
    console.log('Example app listening on port 2000!');
});