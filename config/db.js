const mysql = require('mysql2')
const local_con = true
const LOCAL_URI = {
  host: "localhost",
  user: "root",
  password: "",
  database:"unreal_automation"
}
const Prod_URI = {

}
db = null;
if(local_con == true){
  db = mysql.createConnection(LOCAL_URI)
  // return db
} else{
  db = mysql.createConnection(Prod_URI)
  // return db
}

module.exports = db;