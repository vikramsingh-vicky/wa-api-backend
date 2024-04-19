const express = require("express")
const db = require('../config/db')


const createUserTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT,
            uuid VARCHAR(255) NOT NULL,
            name VARCHAR(30) NOT NULL,
            username VARCHAR(255) PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            mobile VARCHAR(10) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            avatar BLOB,
            source TEXT(25) DEFAULT 'Manual',
            mem_type VARCHAR(10) DEFAULT 'Subscriber',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX(id)
        );    
    `;
  
    db.query(createTableQuery, (err, results) => {
      if (err) {
        console.error('Error creating table:', err);
        return;
      }
    //   console.log('Table created successfully!');
    //   db.end(); // Close connection after creating the table
    });
  };

module.exports = { createUserTable };