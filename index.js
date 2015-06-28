var express = require('express');
var app = express();

var bcrypt = require('bcrypt');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var validator = require('validator');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : 'hackathon',
    database : 'fixitnow'
});

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
    extended: false,
    limit: '50mb'
}));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    }
    else {
        next();
    }
});

app.post('/login', function(req, res) {
    var body         = req.body,
        user_name    = validator.toString(body.user_name),
        password     = validator.toString(body.password);

    connection.query("select user.user_id, password, role_id from user LEFT JOIN user_role on user.user_id = user_role.user_id where user_name=?", user_name, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(401).send('Bad username/pass.');
        } else {
            if (password == rows[0].password) {
                res.status(200).send({'user_id':rows[0].user_id, 'role': rows[0].role_id});
            } else {
                res.send(401, 'Bad username/pass');
            }
        }
    });
});

app.get('/users', function(req, res) {
    connection.query("select user_id, user_name from user", function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(409).send({'message':'no users.'});
        } else {
            res.status(200).send(rows);
        }
    });
});

app.get('/buildings/user/:user_id', function(req, res) {
    var user_id = req.params.user_id;
    connection.query("select building.building_id, building.address from building INNER JOIN building_user ON building_user.building_id = building.building_id AND building_user.user_id = ?", user_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(409).send({'message':'no buildings.'});
        } else {
            res.status(200).send(rows);
        }
    });
});

app.get('/building/:building_id', function(req, res) {
    var building_id = req.params.building_id;
    connection.query("select building.building_id, building.address from building WHERE building.building_id = ?", building_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(409).send({'message':'invalid building.'});
        } else {
            res.status(200).send(rows);
        }
    });
});

app.get('/incident/building/:building_id', function(req, res) {
    var building_id = req.params.building_id;
    connection.query("select incident.* from incident LEFT JOIN location on location.location_id = incident.location_id where location.building_id = ? ORDER BY incident.priority DESC, incident.date_reported DESC", building_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(409).send({'message':'No incident found associated with this building id.'});
        } else {
            res.status(200).send(rows);
        }
    });
});

app.get('/incident/all/:user_id', function(req, res) {
    var user_id = req.params.user_id;
    connection.query("select incident.incident_id, incident.description,DATE_FORMAT(incident.date_reported, '%l:%i %p on %c/%e/%Y ') as date_reported, COALESCE(incident.resolution_image, incident.image) as image, status.description as status, location.floor, location.space_name, building.address, (SELECT user.full_name FROM user WHERE user.user_id = incident.assignee_id) as assignee, incident.assignee_id from incident LEFT JOIN user on user.user_id = incident.reporter_id LEFT JOIN status on incident.status = status.status_id LEFT JOIN location on incident.location_id = location.location_id LEFT JOIN building on building.building_id = location.building_id LEFT JOIN building_user ON building_user.building_id = location.building_id where building_user.user_id = ? ORDER BY incident.priority DESC, incident.date_reported DESC", user_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(409).send({'message':'No incident found associated with this user id.'});
        } else {
            res.status(200).send(rows);
        }
    });
});

app.get('/incident/unassigned/:user_id', function(req, res) {
    var user_id = req.params.user_id;
    connection.query("select incident.incident_id, incident.description,DATE_FORMAT(incident.date_reported, '%l:%i %p on %c/%e/%Y ') as date_reported, COALESCE(incident.resolution_image, incident.image) as image, status.description as status, location.floor, location.space_name, building.address, (SELECT user.full_name FROM user WHERE user.user_id = incident.assignee_id) as assignee, incident.assignee_id from incident LEFT JOIN user on user.user_id = incident.reporter_id LEFT JOIN status on incident.status = status.status_id LEFT JOIN location on incident.location_id = location.location_id LEFT JOIN building on building.building_id = location.building_id LEFT JOIN building_user ON building_user.building_id = location.building_id where building_user.user_id = ? AND incident.assignee_id IS NULL AND incident.status IN (0,1) ORDER BY incident.priority DESC, incident.date_reported DESC", user_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).send(rows);
        }
    });
});

app.get('/incident/user/:user_id', function(req, res) {
    var user_id = req.params.user_id;
    connection.query("select incident.incident_id, incident.description,DATE_FORMAT(incident.date_reported, '%l:%i %p on %c/%e/%Y ') as date_reported, COALESCE(incident.resolution_image, incident.image) as image, status.description as status, location.floor, location.space_name, building.address, (SELECT user.full_name FROM user WHERE user.user_id = incident.assignee_id) as assignee, incident.assignee_id from incident LEFT JOIN user on user.user_id = incident.reporter_id LEFT JOIN status on incident.status = status.status_id LEFT JOIN location on incident.location_id = location.location_id LEFT JOIN building on building.building_id = location.building_id where incident.reporter_id = ? ORDER BY incident.priority DESC, incident.date_reported DESC;", user_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).send(rows);
        }
    });
});

app.get('/incident/worker/:user_id', function(req, res) {
    var user_id = req.params.user_id;
    connection.query("select incident.incident_id, incident.description,DATE_FORMAT(incident.date_reported, '%l:%i %p on %c/%e/%Y ') as date_reported, COALESCE(incident.resolution_image, incident.image) as image, status.description as status, location.floor, location.space_name, building.address, (SELECT user.full_name FROM user WHERE user.user_id = incident.assignee_id) as assignee, incident.assignee_id from incident LEFT JOIN user on user.user_id = incident.reporter_id LEFT JOIN status on incident.status = status.status_id LEFT JOIN location on incident.location_id = location.location_id LEFT JOIN building on building.building_id = location.building_id where incident.assignee_id = ? ORDER BY incident.priority DESC, incident.date_reported DESC;", user_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).send(rows);
        }
    });
});

app.get('/incident/:incident_id', function(req, res) {
    var incident_id = req.params.incident_id;
    connection.query("select incident.incident_id, incident.description,coalesce(DATE_FORMAT(incident.date_reported, '%l:%i %p on %c/%e/%Y '),'Not Set') as date_reported,coalesce(DATE_FORMAT(incident.date_expected, '%l:%i %p on %c/%e/%Y '), 'Not Set') as date_expected,coalesce(DATE_FORMAT(incident.date_resolved, '%l:%i %p on %c/%e/%Y '),'Not Set') as date_resolved, COALESCE(incident.resolution_image, incident.image) as image, status.description as status, status_id, location.floor, location.space_name, building.address, COALESCE((SELECT user.full_name FROM user WHERE user.user_id = incident.assignee_id),'Unassigned') as assignee, incident.assignee_id, COALESCE((SELECT user.full_name FROM user WHERE user.user_id = reporter_id),'Unknown') as reporter from incident LEFT JOIN user on user.user_id = incident.reporter_id LEFT JOIN status on incident.status = status.status_id LEFT JOIN location on incident.location_id = location.location_id LEFT JOIN building on building.building_id = location.building_id where incident.incident_id = ?", incident_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(409).send({'message':'No incident found associated with this incident id.'});
        } else {
            res.status(200).send(rows[0]);
        }
    });
});

app.post('/incident/:incident_id/assign/:user_id', function(req, res) {
    var incident_id = req.params.incident_id,
        user_id     = req.params.user_id;

    connection.query("UPDATE incident set assignee_id = ? where incident_id = ?;", [user_id, incident_id], function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else {
            if (!rows.affectedRows) {
                res.status(404).send('Incident could not be updated.');
            } else {
                res.status(200).send();
            }
        }
    });
});

app.post('/resolve/:incident_id', function(req, res) {
    var body        = req.body,
        status      = validator.toString(body.status),
        priority    = validator.toString(body.priority),
        image       = body.image,
        incident_id = req.params.incident_id;

    connection.query("UPDATE incident set status = COALESCE(?,status), priority = COALESCE(?,priority), resolution_image = COALESCE(?,resolution_image), date_resolved = NOW() where incident_id = ?;", [status, priority, image, incident_id], function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else {
            if (!rows.affectedRows) {
                res.status(404).send('Incident could not be updated.');
            } else {
                res.status(200).send();
            }
        }
    });
});

app.post('/devices', function(req, res) {
    var body         = req.body,
        device_name  = validator.toString(body.device_name),
        location_id  = validator.toString(body.location_id),
        x_pos        = body.x_pos,
        y_pos        = body.y_pos;

    connection.query("INSERT INTO device (device_name, location_id, x_pos, y_pos) VALUES (?,?,?,?);", [device_name, location_id, x_pos, y_pos], function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else {
            connection.query("SELECT LAST_INSERT_ID() as id;", function(err, rows) {
                if (err) {
                    res.status(400).send(err);
                } else if (!rows[0]) {
                    res.status(401).send('Unknown error occurred.');
                } else {
                    res.status(201).send({'device_id': rows[0].id});
                }
            });
        }
    });
});

app.get('/devices/building/:building_id', function(req, res) {
    var building_id = req.params.building_id;
    connection.query("SELECT device.device_id, device.device_name, device.location_id, device.x_pos, device.y_pos FROM device LEFT JOIN location ON location.location_id = device.location_id WHERE location.building_id = ?;", building_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(409).send({'message':'No devices found associated with this building id.'});
        } else {
            res.status(200).send(rows);
        }
    });
});

app.post('/incident', function(req, res) {
    var body         = req.body,
        description  = validator.toString(body.description),
        priority     = validator.toString(body.priority),
        status       = validator.toString(body.status),
        location_id  = validator.toString(body.location_id),
        image        = body.image,
        x_pos        = body.x_pos,
        y_pos        = body.y_pos,
        reporter_id  = validator.toString(body.reporter_id),
        assignee_id  = validator.toString(body.assignee_id);

    connection.query("INSERT INTO incident (description, priority, status, location_id, x_pos, y_pos, reporter_id, assignee_id, image) VALUES (?,?,?,?,?,?,?,?,?);", [description, priority, status, location_id, x_pos, y_pos, reporter_id, assignee_id, image], function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else {
            connection.query("SELECT LAST_INSERT_ID() as id;", function(err, rows) {
                if (err) {
                    res.status(400).send(err);
                } else if (!rows[0]) {
                    res.status(401).send('Unknown error occurred.');
                } else {
                    res.status(201).send({'incident': rows[0].id});
                }
            });
        }
    });
});

app.get('/devices/:device_id', function(req, res) {
    var device_id = req.params.device_id;
    connection.query("SELECT device_id, device_name, location_id, x_pos, y_pos FROM device WHERE device_id = ?;", device_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(409).send({'message':'No devices found associated with this device id.'});
        } else {
            res.status(200).send(rows[0]);
        }
    });
});

app.get('/devices/user/:user_id', function(req, res) {
    var user_id = req.params.user_id;
    connection.query("SELECT device.device_id, device.device_name, device.location_id, device.x_pos, device.y_pos FROM device LEFT JOIN location ON location.location_id = device.location_id LEFT JOIN building_user ON building_user.building_id = location.building_id LEFT JOIN user ON user.user_id = building_user.user_id WHERE building_user.user_id = ?;", user_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(409).send({'message':'No devices found associated with this user id.'});
        } else {
            res.status(200).send(rows);
        }
    });
});

app.get('/locations/building/:building_id', function(req, res) {
    var building_id = req.params.building_id;
    connection.query("SELECT location.location_id, location.building_id, location.floor, location.space_name, location.floor_plan FROM location WHERE location.building_id = ?;", building_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(409).send({'message':'No locations found associated with this building id.'});
        } else {
            res.status(200).send(rows);
        }
    });
});

app.get('/locations/building/:building_id/floor/:floor', function(req, res) {
    var building_id = req.params.building_id;
    var floor       = req.params.floor;
    connection.query("SELECT location.location_id, location.building_id, location.floor, location.space_name FROM location WHERE location.building_id = ? AND location.floor = ?;", [building_id, floor], function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else if (!rows[0]) {
            res.status(409).send({'message':'No locations found associated with this building id and floor id combination.'});
        } else {
            res.status(200).send(rows);
        }
    });
});

app.delete('/devices/:device_id', function(req, res) {
    var device_id    = req.params.device_id;
    connection.query("DELETE FROM device WHERE device_id = ?;", device_id, function(err, rows) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(204).send();
        }
    });
});

app.post('/alert', function(req, res) {
   var body         = req.body,
       device_id    = validator.toString(body.device_id),
       priority     = validator.toString(body.priority),
       description  = validator.toString(body.description);

   connection.query("INSERT INTO incident (description, priority, location_id, device_id) VALUES (?,?, (SELECT device.location_id FROM device WHERE device_id = ?),?);", [description, priority, device_id, device_id], function(err, rows) {
       if (err) {
           res.status(400).send(err);
       } else {
           connection.query("SELECT LAST_INSERT_ID() as id;", function(err, rows) {
               if (err) {
                   res.status(400).send(err);
               } else if (!rows[0]) {
                   res.status(401).send('Unknown error occurred.');
               } else {
                   res.status(201).send({'incident_id': rows[0].id});
               }
           });
       }
   });
});

var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);

});
