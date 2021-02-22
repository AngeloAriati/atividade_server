const express = require('express');
const exphbs  = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('oloquinho');
const port = 3000;

db.serialize(function () {
  const sql = `
    CREATE TABLE IF NOT EXISTS employee(
      id INTEGER PRIMARY KEY,
      name TEXT,
      cpf TEXT,
      address TEXT,
      number TEXT,
      neighborhood TEXT,
      city TEXT,
      state TEXT,
      mother_name TEXT,
      birth_date TEXT,
      pis TEXT,
      salary TEXT,
      photo TEXT
    )
  `;
  db.run(sql);
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.get('/', (req, res) => {

  return db.serialize(function() {
    return db.all('SELECT * from employee', [], (err, employees) => {
      if (err) {
        throw err;
      }
      return res.render('home', {
        employees,
      });
    });
  });
});

app.get('/create', (req, res) => {
  return res.render('create');
});

app.post('/create', (req, res) => {
  const { name, cpf, address, number, neighborhood, city, state, mother_name, birth_date, pis, salary, photo } = req.body;
  const sql = `
    INSERT INTO employee(
      name,
      cpf,
      address,
      number,
      neighborhood,
      city,
      state,
      mother_name,
      birth_date,
      pis,
      salary,
      photo
    ) values (?,?,?,?,?,?,?,?,?,?,?,?)
  `;
  return db.run(sql, [
    name,
    cpf,
    address,
    number,
    neighborhood,
    city,
    state,
    mother_name,
    birth_date,
    pis,
    salary,
    photo
  ], (err) => {
    if (err) {
      throw err;
    }

    return res.render('created');
  });
});

app.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  return db.all('SELECT * from employee where id = ?', [id], (err, rows) => {
    if (err) {
      throw err;
    }
    const employee = rows[0];
    if (!employee) {
      return res.status(404).send("ERRROU!");
    }
    return res.render('edit', {
      employee,
    });
  });
});

app.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const { name, cpf, address, number, neighborhood, city, state, mother_name, birth_date, pis, salary, photo } = req.body;
  const sql = `
    UPDATE employee
    SET name = ?,
    cpf = ?
    address = ?,
    number = ?,
    neighborhood = ?,
    city = ?,
    state = ?,
    mother_name = ?,
    birth_date = ?,
    pis = ?,
    salary = ?,
    photo = ?
    WHERE id = ?
  `
  return db.run('UPDATE employee SET name = ?, cpf = ?,  = ? WHERE id = ?', [
    name,
    cpf,
    address,
    number,
    neighborhood,
    city,
    state,
    mother_name,
    birth_date,
    pis,
    salary,
    photo,
    id
  ], (err) => {
    if (err) {
      throw err;
    }

    return res.render('edited');
  });
});

app.get('/delete/:id', (req, res) => {
  const id = req.params.id;
  return db.run("DELETE from employee where id = ?", [id], (err) => {
    if (err) {
      throw err;
    }

    return res.render('deleted');
  });
});

app.get('/:id', (req, res) => {
  const id = req.params.id;

  return db.all('SELECT * from employee where id = ?', [id], (err, rows) => {
    if (err) {
      throw err;
    }
    const employee = rows[0];
    if (!employee) {
      return res.status(404).send("ERRROU!");
    }
    return res.render('view', {
      employee,
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
