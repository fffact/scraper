
var g          = require('./giuseppeTntAtKat');
var sqlite3    = require('sqlite3').verbose();
var db         = new sqlite3.Database('/home/fffact/code/scraper/scraper.db');
var filters    = require('./config').filters;
// var PushBullet = require('pushbullet');
// var pusher     = new PushBullet('o.9Fe95cPaHYzRzAtwBTB5ZdSbwumh1SoG');
 


function getHead() {
  return new Promise(function(resolve, reject) {
    db.serialize(function() {
      db.get("SELECT * FROM Torrent WHERE id = (SELECT MAX(id) FROM Torrent)", function(error, row) {
        if (error) reject(error);
        resolve(row);
      });
    });
  });
}

function getNewElements() {
  return getHead()
  .then(function(head) {
    return g.getElementsWhile(function(i, e) {
      return (head.uri != e.$uri) ? true : false;
    });
  })
}

function write(array) {
  db.serialize(function() {
    var statement = db.prepare("INSERT INTO Torrent(name, uri, size, release_date, fetch_date, author, notify) \
                                VALUES ($name, $uri, $size, datetime($release_date), datetime('now'), $author, $notify)");
    for (var i = 0; i < array.length; i++) {
      statement.run(array[i]);
    }
    statement.finalize();
  });
}

function evalFilter(str, filter) {
  for (var i = 0; i < filter.length; i++) {
    if (!str.match( filter[i] )) return false;
  }
  return true;
}

function evalFilters(str) {
  for (var i = 0; i < filters.length; i++) {
    if ( evalFilter(str, filters[i]) ) {
      // console.log(str);
      // console.log(filters[i]);
      return true;
    }
  }
  return false;
}

function applyNotification(array) {
  // console.dir(array);
  for (var i = 0; i < array.length; i++) {
    if (evalFilters(array[i].$name)) {
      array[i].$notify = true;
    }
  }
  return array;
}

function bootstrapDB() {
  return g.getPage(0)
  .then(function(array) {
    // write(array);
    write( applyNotification( array.slice(10).reverse() ) );
  });
}

function updateDB() {
  return getNewElements()
  .then(function(array) {
    write( applyNotification( array.reverse() ) );
  }, function() {});
}




updateDB().then(function() {
  db.close();
});








