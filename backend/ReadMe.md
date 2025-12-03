Packages installed(Used)
express, cors, dotenv, helmet, morgan, compression

Here are the reason why i used these packages
1. express: it's a web server framework, it helps create fast api, supports middleware handling, manages http request and routing.
Why Use it instead of using Pure Nodejs HTTP Module: Basically you will suffer, because writing routes becomes complicated, no middleware support and it will be hard to build APIs quickly.

2. cors: cors stands for cross origin resource sharing. This package is to prevent cors error when frontend (React) and backend (Node) communicate.
Why Use is: It allows your frontend (http://localhost:3000) to call your backend (http://localhost:5000), it adds cors header automatically. That is If you don't add it, you will get "Access-Control-Allow-Origin" error. your frontend will not be able to call the api.

3. dotenv: This package is used to store and loads environment variable safely inside the env. If you don't use it, you will have to hardcode your secrets (sensitive information) in your code (very bad) and it is not safe for production.

4. helmet: This package is used to add security headers to your API. It helps prevent common attacks such as XSS, Clickjacking, Sniffing, therefore making API more secure automatically, so it is recommended for any production API.

5. morgan: This package is used to log ever request that hits your API. It helps in debugging and monitoring API Traffics. It's useful during development.

6. compression: This package as it name sounds, it's used to make your api faster, reduces response payload, improve performance, thereby saving bandwidth. 

7. sqlite3: This is the driver package that allows Node.js to communicate with an SQLite Database file (e.g., database.sqlite). This package helps creates or reads your .sqlite database file, runs SQL queries and also connect Sequelize to SQLite. Therefore SQLite needs this driver to function.

8. Sequelize: Sequelize is an ORM (Object-Relational Mapper) that simplifis working with SQL databases. This let's you write javascript code instead of raw SQL and thereby making databases cleaner and easier. Further more by using sequelize, you can switch between sqlite and postgres later with very minimal changes, sometimes by just changing the database configuration.

9. bcryptjs: This package is used to hashing password before storing them in the database. You know storing plain is a total disaster.

10. jsonwebtoken: This package is used for authentication using jwt tokens. It's used to generate tokens on login and verifies token on protected routes.

11. validator: This package is used to validate input such as email formats, phone, url, empty field and strong password. It prevent bad or corrupted data from entering your database.

12. rate-limiter-flexible: this package is used to prevent API abuse, spamming, brute-force login attempts and DDos-like behavior. it limites how many requests a user/IP can make, prevents attackers from using trying passwords repeatedly and also protect your server from overload.

13. nodemon: this package is used to automatically restarts your server everytime you change your code.

