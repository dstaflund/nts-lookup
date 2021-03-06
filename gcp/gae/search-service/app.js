'use strict';

if (process.env.NODE_ENV === 'production') {
    require('@google-cloud/debug-agent').start({ allowExpressions: true });
}

const { Firestore } = require('@google-cloud/firestore');
const { PubSub } = require('@google-cloud/pubsub');

const express = require('express')();
const firestore = new Firestore();
const pubsub = new PubSub();
const crypto = require('crypto');
const geohash = require('ngeohash');

const HASH_ALGORITHM = 'sha256';
const HASH_ENCODING = 'hex';
const HASH_LENGTH = 7;
const DEFAULT_LIMIT = 1000;


/****************************************************************
 *
 * Pub/sub topic methods
 *
 ****************************************************************/
const publishSearchRequest = (req, res, next) => {
    const searchType = getSearchType(req)
    const searchRequest = {
        timestamp: new Date().toJSON(),
        userIp: crypto
            .createHash(HASH_ALGORITHM)
            .update(req.ip)
            .digest(HASH_ENCODING)
            .substr(0, HASH_LENGTH),
        searchType: searchType,
        searchParameters: JSON.stringify(req.params)
    };

    const jsonRequest = JSON.stringify(searchRequest);
    const messageData = Buffer.from(jsonRequest);
    pubsub
        .topic('search-request-topic')
        .publish(messageData)
        .then(messageId => console.log('Message ' + messageId + ' published'));
};

const getSearchType = req => {
    if (req.params.name) return 'name';
    if (req.params.title) return 'title';
    if (req.params.parent) return 'parent';
    if (req.params.north && req.params.south && req.params.east && req.params.west) return 'bounds';
    return 'error';
};

const addHeaders = (res, maps) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
};


/****************************************************************
 *
 * API methods
 *
 ****************************************************************/
express.get('/name/:name', async(req, res, next) => {
    publishSearchRequest(req, res, next);
    addHeaders(res);
    firestore
        .collection('maps')
        .where('name', '==', req.params.name)
        .limit(DEFAULT_LIMIT)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.data()))
        .then(maps => {
            res
                .status(200)
                .set('Content-Type', 'text/json')
                .send(JSON.stringify(maps))
                .end();
        })
        .catch(error => next(error));
});

express.get('/title/:title', async(req, res, next) => {
    publishSearchRequest(req, res, next);
    addHeaders(res);
    firestore
        .collection('maps')
        .where('title', '==', req.params.title)
        .limit(DEFAULT_LIMIT)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.data()))
        .then(maps => {
            res
                .status(200)
                .set('Content-Type', 'text/json')
                .send(JSON.stringify(maps))
                .end();
        })
        .catch(error => next(error));
});

express.get('/parent/:parent', async(req, res, next) => {
    publishSearchRequest(req, res, next);
    addHeaders(res);
    firestore
        .collection('maps')
        .where('parent', '==', req.params.parent)
        .limit(DEFAULT_LIMIT)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.data()))
        .then(maps => {
            res
                .status(200)
                .set('Content-Type', 'text/json')
                .send(JSON.stringify(maps))
                .end();
        })
        .catch(error => next(error));
});

express.get('/type/:mapType', async(req, res, next) => {
    publishSearchRequest(req, res, next);
    addHeaders(res);
    firestore
        .collection('maps')
        .where('map_type', '==', req.params.mapType)
        .limit(DEFAULT_LIMIT)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.data()))
        .then(maps => {
            res
                .status(200)
                .set('Content-Type', 'text/json')
                .send(JSON.stringify(maps))
                .end();
        })
        .catch(error => next(error));
});

express.get('/bounds/:north/:south/:east/:west', async(req, res, next) => {
    publishSearchRequest(req, res, next);
    addHeaders(res);

    const swCornerHash = geohash.encode(req.params.south, req.params.west);
    const neCornerHash = geohash.encode(req.params.north, req.params.east);

    firestore
        .collection('maps')
        .where('geohash', '>=', swCornerHash)
        .where('geohash', '<=', neCornerHash)
        .limit(DEFAULT_LIMIT)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.data()))

        // Do some post-search filtering to dispose of unwanted search results
        .then(maps => maps.filter(
                map => map.north <= req.params.north
                    && map.south >= req.params.south
                    && map.east <= req.params.east
                    && map.west >= req.params.west
         ))
        .then(maps => {
            res
                .status(200)
                .set('Content-Type', 'text/json')
                .send(JSON.stringify(maps))
                .end();
        })
        .catch(error => next(error));
});


/****************************************************************
 *
 * Bootstrap code
 *
 ****************************************************************/
const PORT = process.env.PORT || 8080;
express.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = express;