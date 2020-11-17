'use strict';

const express = require('express');
const pg = require('pg');
const cors = require('cors');
const superagent = require('superagent');
const methodOverride = require('method-override');


require('dotenv').config();
 
const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true}));
const client = new pg.Client(process.env.DATABASE_URL);
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use('/public', express.static('public'));

app.get('/home', hnadleHome);
app.post('/facts', handleFact);
app.get('/facts', handlegettingFAV);
app.get('/facts/:id', handleFactDetails);
app.put('/facts/:id', handleUpdate);
app.delete('/facts/:id', handleDelete);

function hnadleHome(req, res){
  let dataArr = [];
  let url = 'https://cat-fact.herokuapp.com/facts';
  superagent.get(url).then(data =>{
      data.body.all.forEach(element =>{
        dataArr.push(new Fact(element));
       });
      res.render('home-page', {result: dataArr});
  });
}

function Fact(data){
    this.type = data.type;
    this.text = data.text;
}


function handleFact (req, res){

// adding the items to database 
let query = 'INSERT INTO fact (type, text) VALUES ($1,$2)';
let values = [req.body.type, req.body.text];
client.query(query,values).then(()=>{
res.redirect('/facts')
});


}


function handlegettingFAV (req, res){
    let query = 'SELECT * FROM fact;';
    client.query(query).then(data =>{
        res.render('fav-fact',{result:data.rows});
    });
}

function handleFactDetails (req, res){
    let query = 'SELECT * FROM fact where id=$1;';
    let values = [req.params.id];
    client.query(query, values).then(data=>{
        res.render('fact-details',{result: data.rows[0]});
    });
}

function handleUpdate(req, res){
    let query= 'UPDATE fact SET type = $1, text=$2 WHERE id=$3;';
    let values=[req.body.type, req.body.text, req.params.id];
    client.query(query,values).then(()=>{
        res.redirect(`/facts/${req.params.id}`);
    });
}

function handleDelete (req, res){
    let statement =`DELETE FROM fact WHERE id=$1;`;
    let values = [req.params.id];
    client.query(statement,values).then(data =>{
      res.redirect('/facts');
     
    }).catch((error) => {
      console.log('error happend when deleteing data...',error);
    });
  }



client.connect().then(()=>{
    app.listen(PORT, () => {
        console.log(`app listening on port ${PORT}`);
    });
});