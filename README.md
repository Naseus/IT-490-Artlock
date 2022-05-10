# IT-490-Artlock

## Midterm Deliverables

- [x] Site's Top albums
- [x] Sites Treding Albums
- [x] Reviews
  - [x] Comments on reviews
- [x] Album Pages
- [x] Targeted Recomendations

 
 ## Final Deliverables
- [x] Prod/Qa/Dev Clusters
- [x] Hot Standby / Failover
- [ ] Replicated Database
- [x] Deployment System
- [x] Custom Servers Managed by Systemd
- [x] Firewalls protecting our backend
- [x] Hashed Password in the Database
- [x] Responsive Websites for the front end
- [x] SSL (HTTPS) for all web pages  (DO NOT NEED 3rd party signed cert, self signed is ok)


 ## Server Documentation

 ### Database 
 #### 1. `cd IT-490-Artlock/database`
 #### 2. run `sudo mysql < db.sql`
 
 ### Backend
 #### 1. cd into the backend folder and run `npm install`
 #### 2. Create the secret files. Example files are provided below, but the files will be different depending on the deployment environment.

IT-490-Artlock//backend/model/db_conn.js
```
let db_conn = {
    "host":"localhost",
    "user":"username",
    "password":"password",
    "database":"ArtLock",
    "port": 3306,
    "multipleStatments": true,
    "socketPath": "/var/run/mysqld/mysqld.sock",
}

module.exports = db_conn;
```

IT-490-Artlock/backend/dmzrabbitMQ.js
```
let data = {
        BROKER_HOST:"127.0.0.1",
        BROKER_PORT:5672,
        USER:"test",
        PASSWORD:"test",
        VHOST: "testHost",
        EXCHANGE:"testExchange",
        QUEUE:"testQueue",
        AUTO_DELETE:true
}

module.exports = data;
```

IT-490-Artlock/backend/rabbitMQ.js
```
let data = {
        BROKER_HOST:"127.0.0.1",
        BROKER_PORT:5672,
        USER:"test",
        PASSWORD:"test",
        VHOST: "testHost",
        EXCHANGE:"dmzExchange",
        QUEUE:"dmzQueue",
        AUTO_DELETE:true
}

module.exports = data;
```

note: we ran into a common configuration issue with this db_conn.js, `ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server`. If you get the same issue a solution is available [here](https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server)

 #### 3. Set up the rabbitmq management panel and create an admin user with the following commands
- `sudo apt-get install rabbitmq-server`
- `sudo rabbitmq-plugins enable rabbitmq_management`
- `sudo rabbitmqctl add_user test test`
- `sudo rabbitmqctl set_user_tags test administrator`
- `sudo rabbitmqctl set_permissions -p / test ".*" ".*" ".*"`

Login to the management panel and create a virtual host testHost, dmzExchange(direct), and testExchange(direct). The server asserts the relevant queues so they do not have to be explicitly created.

  #### 4. run `node app.js` in IT-490-Artlock/backend/

 ### Frontend
 #### 1. cd into the frontend folder and run `npm install`
 #### 2. Add the rabbitmq config file
 frontend/rmq/rabbitMQ.js 
 ````
 data = {
"BROKER_HOST": "10.0.21.43", // Backend ip
"BROKER_PORT": 5672,
"USER": "test",
"PASSWORD": "test",
"VHOST": "testHost",
"EXCHANGE": "testExchange",
"QUEUE": "testQueue",
"AUTO_DELETE": true
}

module.exports = data;
 ````
 #### 3. run `node server.js` in in IT-490-Artlock/frontend/
 
  ### DMZ
 #### 1. cd into the dmz folder and run `npm install`
 #### 2. Add the rabbitmq config file
 dmz/dmzRabbitMQ.js 
 ````
 data = {
"BROKER_HOST": "10.0.21.43", // Backend ip
"BROKER_PORT": 5672,
"USER": "test",
"PASSWORD": "test",
"VHOST": "testHost",
"EXCHANGE": "dmzExchange",
"QUEUE": "dmzQueue",
"AUTO_DELETE": true
}

module.exports = data;
 ````
 #### 3. run `node server.js` in in IT-490-Artlock/dmz/
 
