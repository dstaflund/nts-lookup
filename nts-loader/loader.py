import json
from google.cloud import firestore
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


#
# The following is an adaptation of code found at
# https://medium.com/@hmurari/cloud-firestore-batch-transactions-how-to-migrate-a-large-amounts-of-data-336e61efbe7c
#
class FirestorePush:
    def __init__(self):
        # Login with your Firestore credentials
        cred = credentials.Certificate('/home/dstaflund/security/gcp/nts-lookup/NTS Lookup-f0a8be882f3c.json')
        self.db_admin = firebase_admin.initialize_app(cred)
        self.db = firestore.client()

        # My sample DB
        with open('/home/dstaflund/PycharmProjects/loader/maps.json', 'r') as f:
            self.maps_db = json.load(f)

    # Method to push bulk records to Firestore
    def push(self):
        # Get a ref to Firestore database.
        maps_collection = self.db.collection('maps')

        # This is just for logging purposes.
        total = len(self.maps_db)
        idx = 0

        # Start a batch
        batch = self.db.batch()
        for nts_map in self.maps_db:

            # Commit the batch at every 500th record.
            if idx % 500 == 0:
                if idx > 0:
                    print('Committing..')
                    batch.commit()

                # Start a new batch for the next iteration.
                batch = self.db.batch()
            idx += 1
            print(str(idx) + str('/') + str(total) + ': ' + str(nts_map['name']))
            record_ref = maps_collection.document(nts_map['name'])
            # Include current record in batch
            batch.set(record_ref, nts_map)
        # Include current record in batch
        if idx % 500 != 0:
            print('Committing..')
            batch.commit()


if __name__ == '__main__':
    f = FirestorePush()
    f.push()