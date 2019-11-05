const { Firestore } = require('@google-cloud/firestore');

const DOCUMENT_COLLECTION = 'search-requests';

const firestore = new Firestore();


exports.logSearchRequest = (pubSubEvent, context) => {
    console.log('Entering logSearchRequest function');
    console.log('Data = ' + pubSubEvent.data);
    firestore
        .collection(DOCUMENT_COLLECTION)
        .doc()
        .create({ data: pubSubEvent.data })
        .then(result => console.log('Logged search request'));
};
