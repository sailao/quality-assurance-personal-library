/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

require('dotenv').config()
var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB || 'mongodb://localhost:27017';
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, {useUnifiedTopology: true}, async(err, db)=>{
        if (err) throw err;
        let dbo = db.db('mydb');

        let books = await dbo.collection('books').find().toArray()
        res.json({
          code: 200,
          message: 'success',
          data: books
        })
        db.close()
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if(!title){
        return res.status(400).json({
          code: 400,
          message: `invalid params`
        })
      }
      let data = {title: title, commentcount: 0}
      //response will contain new book object including atleast _id and title
      MongoClient.connect(MONGODB_CONNECTION_STRING, {useUnifiedTopology: true}, (err, db)=>{
        if (err) throw err;
        let dbo = db.db('mydb');

        dbo.collection('books').insertOne(data, (err, result)=>{
          if(err) throw err;
          res.status(201).json({
            code: 201,
            message: 'created',
            data: result.ops[0]
          })
          db.close()
        })
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, {useUnifiedTopology: true}, async(err, db)=>{
        if(err) throw err;

        let dbo = db.db("mydb")
        let book = await dbo.collection('books').remove({});
        
        if(!book.result.ok){
          return res.status(400).json({
            code: 400,
            message: 'cannot delete',
          })
        }

        return res.json({
          code: 200,
          message: 'complete delete successful'
        })
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;

      if(!bookid || !ObjectId.isValid(bookid)){
        return res.status(400).json({
          code: 400,
          message: 'invalid params'
        })
      }

      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, {useUnifiedTopology: true}, async(err, db)=>{
        let dbo = db.db("mydb")
        let books = await dbo.collection('books').aggregate([
          {
            $match: {
              _id: ObjectId(bookid)
            }
          },
          {
            $project: {
              _id: {
                $toString: "$_id"
              },
              title: "$title",
              commentcount: "$commentcount",
            }
          },
          {
            $lookup: {
              localField: "_id",
              from: "comments",
              foreignField: "bookid",
              as: "comments"
            }
          },
        ] ).toArray()

        res.status(200).json({
          code: 200,
          message: 'success',
          data: books[0]
        })
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING, {useUnifiedTopology: true}, (err, db)=>{
        if (err) throw err;
        let dbo = db.db('mydb');

        dbo.collection('comments').insertOne({comment, bookid}, async(err, result)=>{
          if(err) throw err;
          let books = await dbo.collection('books').aggregate([
            {
              $match: {
                _id: ObjectId(bookid)
              }
            },
            {
              $project: {
                _id: {
                  $toString: "$_id"
                },
                title: "$title",
                commentcount: "$commentcount",
              }
            },
            {
              $lookup: {
                localField: "_id",
                from: "comments",
                foreignField: "bookid",
                as: "comments"
              }
            },
          ] ).toArray()
          res.status(201).json({
            code: 201,
            message: 'success',
            data: books[0]
          })
          db.close()
        })
      })
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, {useUnifiedTopology: true}, async(err, db)=>{
        if(err) throw err;

        let dbo = db.db("mydb")
        let book = await dbo.collection('books').findOneAndDelete({_id: ObjectId(bookid)});
        
        // if(!book.ok || !book.value.comments || !book.value.comments.length){
        if(!book.ok){
          return res.status(400).json({
            code: 400,
            message: 'cannot delete book'
          })
        }
        let comments = await dbo.collection('comments').remove({bookid: ObjectId(bookid)});

        if(!comments.result.ok){
          return res.status(400).json({
            code: 400,
            message: 'cannot delete comments'
          })
        }

        return res.json({
          code: 200,
          message: 'deleted'
        })
      })
    });
  
};
