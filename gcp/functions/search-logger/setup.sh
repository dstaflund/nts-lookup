gcloud --quiet functions deploy search-logger \
    --region=us-central1 \
    --entry-point=logSearchRequest \
    --runtime=nodejs10 \
    --trigger-topic=search-request-topic