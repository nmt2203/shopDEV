const mysql = require('mysql2');

//create connection to pool server
const pool = mysql.createPool({
  host: 'localhost',
  port: 3333,
  user: 'root',
  password: '123456',
  database: 'shopDEV',
});

const batchSize = 100000;
const totalSize = 1000000;

let current_id = 1;
const insertBatch = async () => {
  const values = [];
  for (let i = 0; i < batchSize && current_id < totalSize; i++) {
    const name = `name-${current_id}`
    const age = current_id;
    const address = `address-${current_id}`
    values.push([current_id, name, age, address])
    current_id++;
  }

  if(!values.length) {
    pool.end(err => {
      if(err) console.log(`error occurred while run batch`);
      else console.log(`Connection pool close successfully`);
    })
    return;
  }

  const sql = `INSERT INTO test_table(id, name, age, address) VALUES ?`

  pool.query(sql, [values], async function(err, results) {
    if (err) throw err;
    console.log(`Inserted ${results.affectedRows} records`);
    await insertBatch()
  })
}

insertBatch().catch(console.error)