//const {Client} = require('pg');
require('dotenv').config();
const express = require('express');
const app = express();
var cors = require('cors');
const pgp = require('pg-promise')();
const PORT = process.env.PORT || 5000;

const client = pgp({
    user: process.env.RDS_USERNAME,
    host: process.env.RDS_HOSTNAME,
    database: process.env.RDS_DBNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
  })
  

  var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
    // origin: 'http://localhost:8000',
    // optionsSuccessStatus: 200 ,// some legacy browsers (IE11, various SmartTVs) choke on 204
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['content-type', 'authorization','Access-Control-Allow-Origin','Access-Control-Allow-Headers']
  }

app.use(cors(corsOptions));
app.use(express.json())


app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));

console.log("My host is: "+process.env.RDS_HOSTNAME);
const database = false;

  app.get('/' , (req, res) => {
    res.send("Battleship server is up and running, and database is connected !");
  });

app.get('/api/checkForCookieIdExists' , async (req, res) => {
  let values = req.query;

  const sql = `select count(cookies) from game where cookies = ('${values.cookieId}')`;
  console.log("Calling:"+sql);

  await client.one(sql)
  .then(data => {
    res.status(200).json({success : true, result: data.count });
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });

});

app.get('/api/getGameState' , async(req, res) => {
  let values = req.query;

  const sql = `select game_state from game where cookies = ('${values.cookieId}')`;
  console.log("Calling:"+sql);

  await client.one(sql)
  .then(data => {
    res.status(200).json({success : true, result: data});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });

});

//GET => Players table
app.get('/api/getPlayersName' , async(req, res) => {
  let values = req.query;

  const sql = `SELECT COALESCE((SELECT player_name FROM players WHERE cookies =('${values.cookieId}') AND player_nr=${values.player_nr}), 'empty') AS player_name`;
  console.log("Calling:"+sql);
  
  await client.one(sql)
  .then(data => {
    res.status(200).json({ success: true, result: data.player_name });
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });

});


  // client.query(sql, (err, result) => {
  //   if (err) throw err;
  //   res.status(200).json({'success' : true, 'result': result.rows[0].player_name});
  // })

app.get('/api/getPlayerWinner' , async(req, res) => {
  let values = req.query;
  const sql = `SELECT COALESCE((SELECT player_nr FROM results WHERE cookies =('${values.cookieId}') AND winner = 1), 0)AS player_nr`;
  console.log("Calling:"+sql);

  await client.one(sql)
  .then(data => {
    res.status(200).json({success : true, result: data.rows[0].player_nr});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});

app.get('/api/checkForPlayers' , async(req, res) => {
  let values = req.query;

  const sql = `select count(cookies)as players from players where cookies = ('${values.cookieId}')`;
  console.log("Calling:"+sql);

  await client.one(sql)
  .then(data => {
    res.status(200).json({success: true, result: data.players,status:200});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});

app.get('/api/getPlayerTurn' , async(req, res) => {
  let values = req.query;

  const sql = `SELECT player_turn from players where cookies = ('${values.cookiesId}')`;
  console.log("Calling:"+sql);

  await client.any(sql)
  .then(data => {
    res.status(200).json({success: true, result: data});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});
//END OF GET => Players table


//GET => Results => TESTED WITH POSTMAN


app.get('/api/getAllResultsDB' , async(req, res) => {
  let values = req.query;
  const sql = `SELECT  hits,missed,wins,winner from results where cookies = ('${values.cookiesId}') AND player_nr = ${values.player_nr}`;

  await client.any(sql)
  .then(data => {
    const columns = data.map(({ total_shots, hits, missed, wins,winner }) => ({ total_shots, hits, missed, wins,winner }));
    res.status(200).json({success: true, result: columns});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});

app.get('/api/getPlayerTotalShots' , async(req, res) => {
  let values = req.query;
  const sql = `SELECT COALESCE((SELECT total_shots from results where cookies = ('${values.cookiesId}') AND player_nr=${values.player_nr}), -1)AS total_shots`;
  console.log("Calling:"+sql);

  await client.one(sql)
  .then(data => {
    res.status(200).json({success: true, result: data.total_shots});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});


app.get('/api/getPlayerHits' , async(req, res) => {
  let values = req.query;

  const sql = `SELECT COALESCE((SELECT hits from results where cookies = ('${values.cookieId}') AND player_nr=${values.player_nr}), 0)AS hits`;
  console.log("Calling:"+sql);

  await client.one(sql)
  .then(data => {
    res.status(200).json({'success' : true, 'result': data.rows[0].hits});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});


app.get('/api/getPlayerMissed' , async(req, res) => {
  let values = req.query;

  const sql = `SELECT COALESCE((SELECT missed from results where cookies = ('${values.cookieId}') AND player_nr=${values.player_nr}), 0)AS missed`;
  console.log("Calling:"+sql);

  await client.one(sql)
  .then(data => {
    res.status(200).json({success: true, result: data.rows[0].missed});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});

app.get('/api/getPlayerWins' , async(req, res) => {
  let values = req.query;

  const sql = `SELECT COALESCE((SELECT wins from results where cookies = ('${values.cookieId}') AND player_nr=${values.player_nr}), 0)AS wins`;
  console.log("Calling:"+sql);

  await client.one(sql)
  .then(data => {
    res.status(200).json({'success' : true, 'result': data.rows[0].wins});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});

app.get('/api/getGameWinner' , async(req, res) => {
  let values = req.query;

  const sql = `SELECT COALESCE((SELECT player_nr from results where cookies = ('${values.cookieId}') AND winner=1), 0)AS winner`;
  console.log("Calling:"+sql);

  await client.one(sql)
  .then(data => {
    res.status(200).json({success: true, result: data.rows[0].winner});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});
//END OF GET => RESULTS


//Get => Board => TESTED WITH POSTMAN

app.get('/api/getXYForShipType' , async(req, res) => {
  let values = req.query;

  const sql = `select x,y from board where cookies = ('${values.cookieId}') AND tile_value = ('${values.tile_value}')`;
  console.log("Calling:"+sql);

  await client.any(sql)
  .then(data => {
    res.status(200).json({success: true, result: data.rows});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });

});

app.get('/api/getXYForPlayer' , async(req, res) => {
  let values = req.query;

  const sql = `select x,y from board where cookies = ('${values.cookieId}') AND player_nr= ${values.player_nr}`;
  console.log("Calling:"+sql);

  await client.any(sql)
  .then(data => {
    res.status(200).json({success: true, result: data.rows});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });

});

app.get('/api/getShipTypeAtXY' , async(req, res) => {
  let values = req.query;

  const sql = `select tile_value from board where cookies = ('${values.cookieId}') AND player_nr= ${values.player_nr} AND x=${values.x} AND y=${values.y}`;

  await client.one(sql)
  .then(data => {
    res.status(200).json({'success' : true, 'result': data.tile_value, status:200});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message , status:500 });
  });
});

app.get('/api/getDataFromBoard' , async(req, res) => {
  let values = req.query;

  const sql = `select x, y,tile_value from board where cookies = ('${values.cookiesId}') AND player_nr=${values.player_nr}`;
  console.log("Calling: "+sql);
  await client.any(sql)
  .then(data => {
    const result = data.map(({ x, y, tile_value }) => ({ x, y, tile_value }));
    res.status(200).json({'success' : true, 'result': result, status:200});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});

app.get('/api/checkForCookieInBoard' , async(req, res) => {
  let values = req.query;

  const sql = `select count(cookies) from board where cookies = ('${values.cookieId}')`;

  await client.one(sql)
  .then(data => {
    res.status(200).json({'success' : true, 'result': data.count, status:200});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});

//END OF GET => Board 

//GET => SHIPS => TESTED WITH POSTMAN

app.get('/api/getAllShipsFromDB' , async(req, res) => {
  let values = req.query;

  const sql = `select ship_type, hits, ship_width, ship_height, ship_status from ships where cookies = ('${values.cookiesId}') AND player_nr=${values.player_nr}`;
  console.log("Calling: "+sql);
  await client.any(sql)
  .then(data => {
    const result = data.map(({ ship_type, hits, ship_width, ship_height, ship_status }) => ({ ship_type, hits, ship_width, ship_height, ship_status }));
    res.status(200).json({'success' : true, 'result': result, status:200});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});

app.get('/api/getShipStatus' , async(req, res) => {
  let values = req.query;

  const sql = `select ship_status from ships where cookies = ('${values.cookiesId}') AND player_nr= ${values.player_nr} AND ship_type= ('${values.ship_type}')`;
  console.log("Calling:"+sql);

  await client.one(sql)
  .then(data => {
    res.status(200).json({'success' : true, 'result': data.rows[0].ship_status});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});

app.get('/api/getAllShipsSank' , async(req, res) => {
  let values = req.query;

  const sql = `select ship_type from ships where cookies = ('${values.cookieId}') AND player_nr= ${values.player_nr} AND ship_status= ${values.ship_status}`;
  console.log("Calling:"+sql);

  await client.any(sql)
  .then(data => {
    res.status(200).json({success : true, result: data.rows});
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});

//END OF GET => SHIPS 

//=========================================END OF ALL GETS============================================================

//POST => GAME ==================================================================================================================================================================================================================

/*
*INSERT
*@game_state
*@cookiesId
*/
app.post('/api/addDataToGameDB' , async(req,res)=>{
  let values = req.body;

  let sql = `INSERT INTO game(game_state, cookies) VALUES ('${values.game_state}','${values.cookiesId}')`;
  console.log("My insert query is:"+sql);
  
  if(values.game_state!==undefined && values.cookiesId!==undefined){
   
    await client.none(sql)
    .then(data => {
      res.status(200).json({success : true, status:200});
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });

    // client.query(sql, (err, result) => {
    //   if (err) {
    //     console.log(err);
    //     res.status(500).json({error: err});
    //     return;
    //   }
    //   if (result) {
    //     res.status(200).json({success:true});
    //   } else {
    //     res.status(200).json({success:false});
    //   }
    // });
  }
});

/*
*UPDATE GAME_STATE
*@game_state
*@cookiesId
*/
app.post('/api/updateGameStateInGame' , async(req,res)=>{
  let values = req.body;

  let sql = `UPDATE game SET game_state = '${values.game_state}' where cookies = '${values.cookiesId}'`;
  console.log("My insert query is:"+sql);
  
  if(values.game_state!==undefined && values.cookiesId!==undefined){
    await client.none(sql)
    .then(data => {
      res.status(200).json({success : true, status:200});
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
  }
});

//POST => PLAYERS ==============================================================================================================================================================================================================
/*
*INSERT
*@player_name
*@player_turn
*@player_nr
*@cookiesId
*/
app.post('/api/addDataToPlayersDB' , async(req,res)=>{
  let values = req.body;

  let sql = `INSERT INTO players(player_name, player_turn, player_nr, cookies) VALUES ('${values.player_name}',${values.player_turn}, ${values.player_nr},'${values.cookiesId}')`;  
  console.log(sql);
  if(values.player_name!==undefined && 
    values.player_turn!==undefined && 
    values.player_nr!==undefined && 
    values.cookiesId!==undefined){
      await client.none(sql)
      .then(data => {
        res.status(200).json({success : true, status:200});
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: error.message });
      });
  }
});

/*
*UPDATE PLAYER_NAME
*@player_name
*@player_nr
*@cookiesId
*/
app.post('/api/updatePlayerNameInPlayers' , async(req,res)=>{
  let values = req.body;

  let sql = `UPDATE players SET player_name = '${values.player_name}' where player_nr=${values.player_nr} AND cookies = '${values.cookiesId}'`;
  console.log("My Update query is:"+sql);
  
  if(values.player_name!==undefined &&
     values.player_nr!==undefined &&
     values.cookiesId!==undefined){
     await client.none(sql)
      .then(data => {
        res.status(200).json({success : true, status:200});
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: error.message });
      });
  }
});

/*
*UPDATE PLAYER_TURN
*@player_turn 
*@cookiesId
*@player_nr
*/
app.post('/api/updatePlayerTurnInPlayers' , async(req,res)=>{
  let values = req.body;

  let sql = `UPDATE players SET player_turn = ${values.player_turn} where cookies = '${values.cookiesId}'`;
  console.log("My insert query is:"+sql);
  
  if(values.player_turn!==undefined &&
     values.cookiesId!==undefined){
      await client.none(sql)
      .then(data => {
        res.status(200).json({success : true, status:200});
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: error.message });
      });
  }
});

//POST => RESULTS =============================================================================================================================================================================================================

/*
*INSERT
*@total_shots
*@hits
*@missed
*@player_nr
*@cookiesId
*@winner
*/
app.post('/api/insertDataToResultsDB' , async(req,res)=>{
  let data = req.body.rows;
  console.log("My data received is: "+data.rows[0].hits);
  let insertPromise = [];
  let sql = `INSERT INTO results(total_shots, hits, missed, wins, winner, player_nr, cookies) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
  console.log("addDataToResultsDB Caling: "+sql);
  data.rows.forEach(async row => {
    console.log("Adding values: "+row.total_shots+" "+row.hits+" "+row.missed+" "+row.wins+" "+row.winner+" "+row.player_nr+" "+row.cookies);
   insertPromise.push(await client.none(sql, [row.total_shots, row.hits, row.missed, row.wins, row.winner, row.player_nr, row.cookies]));
  });
  await Promise.all(insertPromise)
    .then(data => {
      res.status(200).json({success : true, status:200});
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

/*
*UPDATE
*@hits
*@player_nr
*@cookiesId
*/
app.post('/api/updateHitsResults' , async(req,res)=>{
  let values = req.body;

  let sql = `UPDATE RESULTS set hits= ${values.hits} where player_nr= ${values.player_nr} and cookies = '${values.cookiesId}'`;
  if(values.player_nr!== undefined && values.cookiesId!== undefined && values.hits!== undefined){
    await client.none(sql)
    .then(data => {
      res.status(200).json({success : true, status:200});
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
  }else{
    res.status(500).json({ error: "player_nr or cookies or hits are undefined !!"});
  }  
});

/*
*UPDATE
*@hits
*@player_nr
*@cookiesId
*/

app.post('/api/updateHitsShips' , async(req,res)=>{
  let values = req.body;

  let sql = `update ships set hits= ${values.hits} where player_nr= ${values.player_nr} and cookies = '${values.cookiesId}' and ship_type = '${values.ship_type}'`;
  if(values.player_nr!== undefined && values.cookiesId!== undefined && values.hits!== undefined){
    await client.none(sql)
    .then(data => {
      res.status(200).json({success : true, status:200});
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
  }else{
    res.status(500).json({ error: "player_nr or cookies or hits are undefined !!"});
  }  
});

/*
*UPDATE
*@missed
*@player_nr
*@cookiesId
*/
app.post('/api/updateMissedResults' , async(req,res)=>{
  let values = req.body;

  let sql = `UPDATE RESULTS set missed= ${values.missed} where player_nr= ${values.player_nr} and cookies = '${values.cookiesId}'`;
  console.log("updateMissedResults -> calling "+sql);
  if(values.player_nr!== undefined && values.cookiesId!== undefined && values.missed!== undefined){
    await client.none(sql)
    .then(data => {
      res.status(200).json({success : true, status:200});
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
  }else{
    res.status(500).json({ error: "player_nr or cookies or hits are undefined !!"});
  }  
});

/*
*UPDATE
*@winner
*@player_nr
*@cookiesId
*/
app.post('/api/updateWinnerResults' , async(req,res)=>{
  let values = req.body;

  let sql = `UPDATE RESULTS set winner= ${values.winner} where player_nr= ${values.player_nr} and cookies = '${values.cookiesId}'`;
  if(values.player_nr!== undefined && values.cookiesId!== undefined && values.winner!== undefined){
    await client.none(sql)
    .then(data => {
      res.status(200).json({success : true, status:200});
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
  }else{
    res.status(500).json({ error: "player_nr or cookies or hits are undefined !!"});
  }  
});
//POST => BOARD ===============================================================================================================================================================================================================

/*
*UPDATE tile_value
*@x
*@y
*@tile_value
*@player_nr
*@cookiesId
*/
app.post('/api/updateTileValueInBoard' , async(req,res)=>{
  let values = req.body;

  let sql = `UPDATE board SET tile_value = '${values.tile_value}' where x=${values.x} AND y=${values.y} AND player_nr=${values.player_nr} AND cookies = '${values.cookiesId}'`;
  console.log("My insert query is:"+sql);
  
  if(values.x!==undefined &&
     values.y!==undefined &&
     values.tile_value!==undefined &&
     values.player_nr!==undefined &&
     values.cookiesId!==undefined){
     await client.none(sql)
      .then(data => {
        res.status(200).json({success : true, status:200});
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: error.message });
      });
  }
});

/*
*INSERT
*@x
*@y
*@tile_value
*@player_nr
*@cookiesId
*/
app.post('/api/addDataToBoardDB' , async(req,res)=>{
  const data = req.body;
  let insertPromise = [];
  let sql = `INSERT INTO board(x, y, tile_value, player_nr, cookies) VALUES ($1, $2, $3, $4, $5)`;
  console.log("My sql is: "+sql);
  data.rows.forEach(row => {
    console.log("Adding values: "+row.x+" "+row.y+" "+row.tile_value+" "+row.player_nr+" "+row.cookies)
    insertPromise.push(client.any(sql, [row.x, row.y, row.tile_value, row.player_nr,row.cookies]))
  });
  Promise.all(insertPromise)
.then(() => {
  res.status(200).json({ success: true, status: 200 });
})
.catch((error) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});
});

app.post('/api/updateBoardData' , async(req,res)=>{
  const rows = req.body.rows;
  let updatePromise = [];
  const sql = 'UPDATE board SET tile_value = $1 WHERE x = $2 AND y = $3 AND player_nr = $4 AND cookies = $5';
  rows.forEach(row => {
    updatePromise.push(client.any(sql, [row.tile_value, row.x, row.y, row.player_nr, row.cookies]))
  });
  await Promise.all(updatePromise)
    .then(() => {
      res.status(200).json({success : true, status:200});
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
});

//POST => SHIPS ===================================================================================================================================================================================================================

/*
*UPDATE status
*@player_nr
*@ship_type
*@ship_status
*@cookiesId
*/
app.post('/api/updateShipStatusInShips' , async(req,res)=>{
  let values = req.body;

  let sql = `UPDATE ships SET ship_status = '${values.ship_status}' where player_nr=${values.player_nr} AND ship_type='${values.ship_type}'  AND cookies = '${values.cookiesId}'`;
  console.log(sql);
  if(values.ship_status!==undefined &&
     values.ship_type!==undefined &&
     values.player_nr!==undefined &&
     values.cookiesId!==undefined){
      await client.any(sql)
      .then(data => {
        res.status(200).json({success : true, status:200});
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: error.message });
      });
  }
});

/*
*INSERT
*@player_nr
*@ship_type
*@ship_status
*@cookiesId
data:{rows:rowsToInsert},
*/
app.post('/api/addDataToShipsDB' , async(req,res)=>{
  const fleet= req.body;
  let insertPromise = [];

  fleet.rows.forEach((row) => {
    console.log( "My Ships in post call are: "+row.player_nr+" , "+row.ship_type+" , "+row.hits+" , "+row.ship_width+" , "+ row.ship_height+" , "+row.ship_status+" , "+row.cookies);
});

 let sql = `INSERT INTO ships(player_nr, ship_type, hits, ship_width, ship_height, ship_status, cookies) VALUES ($1, $2, $3, $4, $5, $6, $7)`;

   fleet.rows.forEach(async(row) => {
      insertPromise.push( await client.any(sql, [row.player_nr, row.ship_type, row.hits, row.ship_width, row.ship_height, row.ship_status, row.cookies]));
});

Promise.all(insertPromise)
.then(() => {
  res.status(200).json({ success: true, status: 200 });
})
.catch((error) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});
});


app.delete('/api/resetStateToZero' , async(req,res)=>{
  const values= req.query;

  let deletePromis=[];
  console.log("Receiving coookie:"+values.cookie);
  const tables =[ 
    {"table":"results",
     "cookie":values.cookie},
    {"table":"board",
     "cookie":values.cookie},
    {"table":"ships",
     "cookie":values.cookie}
    ];

  tables.map(async(_,i) => {
    let sql = `DELETE FROM ${tables[i].table} where cookies = '${values.cookie}'`;
    console.log(sql);
    deletePromis.push( await client.none(sql));
  });
  Promise.all(deletePromis)
  .then(() => {
    res.status(200).json({ success: true, status: 200 });
  })
  .catch((error) => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});



app.delete('/api/resetGamePlayersAndGameState' , async(req,res)=>{
  const values= req.query;

  let deletePromis=[];
  console.log("Receiving coookie:"+values.cookie);
  const tables =[ 
    {"table":"players",
     "cookie":values.cookie},
    {"table":"results",
     "cookie":values.cookie},
    {"table":"board",
     "cookie":values.cookie},
    {"table":"ships",
     "cookie":values.cookie}
    ];

  tables.map(async(_,i) => {
    let sql = `DELETE FROM ${tables[i].table} where cookies = '${values.cookie}'`;
    console.log(sql);
    deletePromis.push( await client.none(sql));
  });
  Promise.all(deletePromis)
  .then(() => {
    res.status(200).json({ success: true, status: 200 });
  })
  .catch((error) => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
});
