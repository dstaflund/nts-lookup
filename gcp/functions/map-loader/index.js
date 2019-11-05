const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');

const PROJECT_ID = 'nts-lookup-257217';
const BUCKET_NAME = 'loading-bucket.nts-lookup.staflund.net';
const DATA_FILE = 'maps.json';
const COLLECTION_NAME = 'maps';
const NAME_KEY = 'name';


/**
 * Triggered from a change to a Cloud Storage bucket.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.loadMaps = (event, context) => {
    readMapsFromBucket();
};

readMapsFromBucket = () => {
    const storage = new Storage({ projectId: PROJECT_ID });
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(DATA_FILE);

    let contents = '';
    file.createReadStream()
        .on('error', function(err) {
            console.log(err);
        })
        .on('data', function(data) {
            contents += data;
        })
        .on('end', function() {
            writeMapsToFirestore(contents);
        });
};

writeMapsToFirestore = (contents) => {
    const firestore = new Firestore();
    const collection = firestore.collection(COLLECTION_NAME);
    const ntsMaps = JSON.parse(contents);

    let batch = firestore.batch();
    for(let i = 0;  i < ntsMaps.length;  i++){
        const ntsMap = ntsMaps[i];
        const document = collection.doc(ntsMap[NAME_KEY]);
        batch.set(document, ntsMap);

        const currentBatchSize = i % 500;
        if (i > 0 && (currentBatchSize === 0 || i === ntsMaps.length)){
            batch.commit().then(() => console.log('Committed batch of ' + currentBatchSize + ' maps'));
            batch = firestore.batch();
        }
    }

    console.log('Done.  A total of ' + ntsMaps.length + ' maps were written to Firestore');
};

this.loadMaps({}, {});