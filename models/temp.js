import { MongoClient, ObjectId } from 'mongodb';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    '$match': {
      'product': new ObjectId('656015602cf3d172e12239cf')
    }
  }, {
    '$group': {
      '_id': null, 
      'averageRating': {
        '$avg': '$rating'
      }, 
      'numofReviews': {
        '$sum': 1
      }
    }
  }
];

const client = await MongoClient.connect(
  '',
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const coll = client.db('Ecommerce').collection('reviews');
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();