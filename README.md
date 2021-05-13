# Cloud Phony
#### Connect to people on their phone numbers via the internet

Cloud Phony is a web application built for a person to connect to the other with their phone while doing internet.

### Prerequisites
- Install npm(via nvm): https://linuxize.com/post/how-to-install-node-js-on-ubuntu-20-04/
- Install Postgres: https://www.postgresqltutorial.com/install-postgresql-linux/
- Create database and credentials: 
 ```
 {
    database: 'cloud_phony',
    username: 'cloudphonyadmins',
    password: 'password'
}
 ```
### Start Web Server
```
./start-web.sh
```

### Start Backend Server
```
./start-backend.sh
```