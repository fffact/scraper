
var giuseppeTntAtKat = (function() {
  
  var rp = require('request-promise');
  var cheerio = require('cheerio');
  
  return {
    
    cache: {},
    
    getPage: function(i) {
      // console.log('GET PAGE');
      var opt = { uri: 'https://kat.cr/user/giuseppetnt/uploads/?page=' + i, 
                  gzip: true }
      return rp(opt)
      .then(function(html) {
        $ = cheerio.load(html);
        var value = [];
        $('table.data tr').each(function(index, element) {        
          var row = {};   
          if ( $(element).hasClass('even') || $(element).hasClass('odd') ) {
            row.$name         = $(element).find('a.cellMainLink').text();
            row.$uri          = $(element).find('a[data-nop]').attr('href');
            row.$size         = $(element).children().eq(1).text();
            row.$release_date = new Date( $(element).children().eq(3).attr('title') ).toISOString();
            row.$author       = 'giuseppe-tnt';
            row.$notify       = false;
            value.push(row);
          }
        });
        return value;
      }, function(error) {
        console.log(error);
      });
    }, // end getPage
    
    
    
    getElement: function(i) {
      // console.log('GET ELEMENT');
      var page = i / 25 | 0;
      var position = i % 25;
      if ( this.cache.hasOwnProperty(page) )  {
        return this.cache[page]
        .then(function(page) {
          return page[position];
        }, function(error) {
          console.log(error);
        });
      } else {
        var p = this.getPage(page);
        this.cache[page] = p;
        return p
        .then(function(page) {
          return page[position];
        }, function(error) {
          console.log(error);
        });
      }
    }, // end getElement
    
    
    
    buildChain: function(n, processElement) {
      return this.getElement(n)
      .bind(this)
      .then(function(element) {
        if ( processElement(n, element) ) {
          return this.buildChain(n + 1, processElement)
        }
      }, function(error) {
        console.log(error);
      });
    }, // end buildChain



    buildChainWithAccum: function(n, accum, fn) {
      return this.getElement(n)
      .bind(this)
      .then(function(element) {
        if ( fn(n, element) ) {
          accum.push(element);
          return this.buildChainWithAccum(n + 1, accum, fn);
        } else {
          return accum;
        }
      }, function(error) {
        console.log(error);
      });
    }, // end buildChainWithAccum



    each: function(fn) { 
      return this.buildChain(0, fn);
    },
    
    getElementsWhile: function(fn) {
      return this.buildChainWithAccum(0, [], fn);
    }
    
    
    
  } // end return {}
})(); // end (function)

module.exports = giuseppeTntAtKat;