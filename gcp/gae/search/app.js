'use strict';

const { Firestore } = require('@google-cloud/firestore');

const express = require('express')();
const crypto = require('crypto');
const firestore = new Firestore();

const DEFAULT_LIMIT = 256;


/****************************************************************
 *
 * Logging methods
 *
 ****************************************************************/
const createLogEntry = (req, searchType) => {
    return {
        timestamp: new Date().toJSON(),
        userIp: crypto
            .createHash('sha256')
            .update(req.ip)
            .digest('hex')
            .substr(0, 7),
        searchType: searchType,
        searchParameters: JSON.stringify(req.params)
    }
};

const insertLogEntry = async(accessRecord) => {
    return firestore
        .collection('searches')
        .doc()
        .create({ data: accessRecord });
};

const logAccessAttempt = async(req, res, next) => {
    const searchType = getSearchType(req);
    const visit = await createLogEntry(req, searchType);
    await insertLogEntry(visit);
};

const getSearchType = req => {
    if (req.params.name) return 'name';
    if (req.params.title) return 'title';
    if (req.params.parent) return 'parent';
    if (req.params.north && req.params.south && req.params.east && req.params.west) return 'bounds';
    return 'error';
};


/****************************************************************
 *
 * API methods
 *
 ****************************************************************/
express.get('/name/:name', logAccessAttempt, async(req, res, next) => {
    await logAccessAttempt(req, 'name');
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

express.get('/title/:title', logAccessAttempt, async(req, res, next) => {
    await logAccessAttempt(req, 'title');
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

express.get('/parent/:parent', logAccessAttempt, async(req, res, next) => {
    await logAccessAttempt(req, 'parent');
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

express.get('/bounds/:north/:south/:east/:west', logAccessAttempt, async(req, res, next) => {
    await logAccessAttempt(req, 'bounds');
    firestore
        .collection('maps')
        .where('north', '<=', req.params.north)
        .where('south', '>=', req.params.south)
        .where('east', '<=', req.params.east)
        .where('west', '>=', req.params.west)
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


/****************************************************************
 *
 * Bootstream code
 *
 ****************************************************************/
const PORT = process.env.PORT || 8080;
express.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = express;