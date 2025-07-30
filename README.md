# vehicle_parking_app_22f2000914
cd C:\Users\user 1\Documents\vehicle_parking_app_22f2000914
venv\Scripts\activate
python -m celery -A app.celery worker --loglevel=info -P solo

python -m celery -A app.celery beat --loglevel=info
