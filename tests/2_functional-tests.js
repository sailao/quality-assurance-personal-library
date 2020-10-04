/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', async()=>{
      (await chai.request(server)
      .post('/api/books')
      .send({title: 'new Book'}))

     let queryBook = await chai.request(server)
      .get('/api/books')
      
      assert.equal(queryBook.status, 200);
      assert.equal(queryBook.body.code, 200);
      assert.equal(queryBook.body.message, 'success');

      assert.isArray(queryBook.body.data, 'queryBookponse should be an array');
      assert.property(queryBook.body.data[0], 'commentcount', 'Books in array should contain commentcount');
      assert.property(queryBook.body.data[0], 'title', 'Books in array should contain title');
      assert.property(queryBook.body.data[0], '_id', 'Books in array should contain _id');
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({title: 'new Book'})
        .end((err, result)=>{
          if(err) done();
          assert.equal(result.status, 201);
          assert.equal(result.body.code, 201);
          assert.equal(result.body.message, 'created');
          assert.property(result.body.data, '_id')
          assert.property(result.body.data, 'title')
          assert.property(result.body.data, 'commentcount')
          done()
        })
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .post('/api/books')
        .end((err, result)=>{
          if(err) done();
          assert.equal(result.status, 400);
          assert.equal(result.body.code, 400);
          assert.equal(result.body.message, 'invalid params');
          done()
        })
      });
      
    });


    suite('GET /api/books => array of books', function(){

      
      test('Test GET /api/books',  async()=>{
        (await chai.request(server).post('/api/books').send({title: 'book 1'}));
        (await chai.request(server).post('/api/books').send({title: 'book 2'}));

        let getBook = await chai.request(server) .get('/api/books')

        assert.equal(getBook.status, 200);
        assert.equal(getBook.body.code, 200);
        assert.equal(getBook.body.message, 'success');

        assert.isArray(getBook.body.data)
        assert.property(getBook.body.data[0], '_id')
        assert.property(getBook.body.data[0], 'title')
        assert.property(getBook.body.data[0], 'commentcount')

        assert.property(getBook.body.data[1], '_id')
        assert.property(getBook.body.data[1], 'title')
        assert.property(getBook.body.data[1], 'commentcount')

      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', () =>{
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/invalidID')
        .end((err, result)=>{
          assert.equal(result.status, 400)
          assert.equal(result.body.code, 400)
          assert.equal(result.body.message, 'invalid params')
          done();
        })
      });
      
      test('Test GET /api/books/[id] with valid id in db',  async()=>{
        let newBook = await chai.request(server).post('/api/books').send({title: 'new book'});
        
        let getBook = await chai.request(server).get(`/api/books/${newBook.body.data._id}`)

        assert.equal(getBook.status, 200)
        assert.equal(getBook.body.code, 200)
        assert.equal(getBook.body.message, 'success')

        assert.property(getBook.body.data, '_id')
        assert.property(getBook.body.data, 'title')
        assert.property(getBook.body.data, 'commentcount')

        assert.equal(getBook.body.data._id, newBook.body.data._id)
        assert.equal(getBook.body.data.title, newBook.body.data.title)
        assert.equal(getBook.body.data.commentcount, 0)
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', async()=>{
        let newBook = await chai.request(server).post('/api/books').send({title: 'new book'});
        
        let deleteBook = await chai.request(server).delete(`/api/books/${newBook.body.data._id}`)

        assert.equal(deleteBook.status, 200)
        assert.equal(deleteBook.body.code, 200)
        assert.equal(deleteBook.body.message, 'deleted')
      });
      
    });

  });

});
