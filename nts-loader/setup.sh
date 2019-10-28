GCP_PROFILE=company
GCP_PROJECT_ID=nts-lookup-257217
GCP_STORAGE_CLASS=standard
GCP_LOCATION=northamerica-northeast1
GCP_BUCKET_NAME=loading-bucket.nts-lookup.staflund.net
DATA_FILE=./maps.json
FUNCTION_FILE=function.zip

# Activate the configuration we want to work with
gcloud config configurations activate ${GCP_PROFILE}

# Create the storage bucket to upload the map data to
gsutil mb \
  -p ${GCP_PROJECT_ID} \
  -c ${GCP_STORAGE_CLASS} \
  -l ${GCP_LOCATION} \
  gs://${GCP_BUCKET_NAME}/
gsutil defacl ch -u AllUsers:R gs://${GCP_BUCKET_NAME}

# Create the function that will load the map data into the filestore when the data is loaded into the bucket
[ -f file ] && rm file
zip ${FUNCTION_FILE} index.js package.json
gsutil cp ${FUNCTION_FILE} gs://${GCP_BUCKET_NAME}
[ -f file ] && rm file

# Upload the mapa data into the newly-created bucket, triggering the above function to execute
gsutil cp ${DATA_FILE} gs://${GCP_BUCKET_NAME}/

