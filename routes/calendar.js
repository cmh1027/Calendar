const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let dbconnected = false;
let model = null;
const Schema = mongoose.Schema({
  year: Number,
  month: Number,
  date: Number,
  schedule: String
});
mongoose.connect('mongodb://localhost/calendar');
const db = mongoose.connection;
db.on('error', function(err){
  console.log(err);
  throw err;
});
db.once('open', ()=>{
  dbconnected=true;
  model = mongoose.model('schedules', Schema);
})

router.get('/', function(req, res) {
  res.render('calendar', { title: 'Calendar' });
});

router.get('/getDaySchedule', function(req, res){
  if(!dbconnected){
    res.status(500).send('DB is not connected');
  }
  let year = req.query.year;
  let month = req.query.month;
  let date = req.query.date;
  let result = model.find({"year":year, "month":month, "date":date}, function(err, schedules){
    if(err){
      res.status(500).send('Error occured while executing a query');
      console.log(err);
      throw err;
    }
    let result = {};
    schedules.forEach(function(value){
      result[value._id] = value.schedule;
    })
    res.setHeader('Content-Type', 'application/json');
    res.json(result);
  });
});

router.get('/getMonthSchedule', function(req, res){
  if(!dbconnected){
    res.status(500).send('DB is not connected');
  }
  let year = req.query.year;
  let month = req.query.month;
  let result = model.find({"year":year, "month":month}, function(err, schedules){
    if(err){
      res.status(500).send('Error occured while executing a query');
      console.log(err);
      throw err;
    }
    let result = {};
    schedules.forEach(function(value){
      if(!result[value.date]){
        result[value.date] = [value.schedule];
      }
      else{
        result[value.date].push(value.schedule);
      }
    });
    res.setHeader('Content-Type', 'application/json');
    res.json(result);
  });
});

router.delete('/removeSchedule', function(req, res){
  if(!dbconnected){
    res.status(500).send('DB is not connected');
  }
  let scheduleID = req.body.id;
  let year = null, month=null, date=null;
  let result = model.find({"_id":scheduleID}, function(err, schedule){
    if(err){
      res.status(500).send('Error occured while executing a query');
      console.log(err);
      throw err;
    }
    else{
      if(schedule.length>0){
        year = schedule[0].year;
        month = schedule[0].month;
        date = schedule[0].date;
      }
    }
    model.deleteMany({"_id":scheduleID}, function(err){
      if(err){
        res.status(500).send('Error occured while executing a query');
        console.log(err);
        throw err;
      }
      model.find({"year":year, "month":month, "date":date}, {"schedule":1},function(err, schedules){
        if(err){
          res.status(500).send('Error occured while executing a query');
          console.log(err);
          throw err;
        }
        res.setHeader('Content-Type', 'application/json');
        res.json({"year":year, "month":month, "date":date, "schedules":schedules.map(element => element.schedule)});
      });
    })
  })
});

router.put('/addSchedule', function(req, res){
  if(!dbconnected){
    res.status(500).send('DB is not connected');
  }
  let year = Number(req.body.year);
  let month = Number(req.body.month);
  let date = Number(req.body.date);
  let schedule = req.body.schedule;
  new model(({"year":year, "month":month, "date":date, "schedule":schedule})).save(function(err, saved){
    if(err){
      res.status(500).send('Error occured while executing a query');
      console.log(err);
      throw err;
    }
    model.find({"year":year, "month":month, "date":date}, {"schedule":1},function(err, schedules){
      if(err){
        res.status(500).send('Error occured while executing a query');
        console.log(err);
        throw err;
      }
      res.setHeader('Content-Type', 'application/json');
      res.json({"year":year, "month":month, "date":date, "schedule":schedule, "id":saved.id,
      "schedules":schedules.map(element => element.schedule)});
    });
  })

});

router.patch('/modifySchedule', function(req, res){
  if(!dbconnected){
    res.status(500).send('DB is not connected');
  }
  let id = req.body.id;
  let schedule = req.body.schedule;
  model.findByIdAndUpdate(id, { $set: { "schedule": schedule }}, function (err, updated) {
    if(err){
      res.status(500).send('Error occured while executing a query');
      console.log(err);
      throw err;
    }
    let year = updated.year, month = updated.month, date = updated.date;
    model.find({"year":year, "month":month, "date":date},function(err, schedules){
      if(err){
        res.status(500).send('Error occured while executing a query');
        console.log(err);
        throw err;
      }
      res.setHeader('Content-Type', 'application/json');
      res.json({"year":year, "month":month, "date":date, "schedules":schedules.map(element => element.schedule)});
    });
  });
});

module.exports = router;