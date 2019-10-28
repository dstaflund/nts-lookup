GCP_PROFILE=company
GCP_BUCKET_NAME=loading-bucket.nts-lookup.staflund.net
DATA_FILE=maps.json
FUNCTION_FILE=function.zip

# Activate the configuration we want to work with
gcloud config configurations activate ${GCP_PROFILE}

# Delete data file
gsutil rm gs://${GCP_BUCKET_NAME}/${FUNCTION_FILE}
gsutil rm gs://${GCP_BUCKET_NAME}/${DATA_FILE}

# Delete storage bucket
gsutil rb gs://${GCP_BUCKET_NAME}/