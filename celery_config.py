from celery.schedules import crontab

broker_url = "redis://127.0.0.1:6379/0"
result_backend = "redis://127.0.0.1:6379/1"
timezone = "UTC"

beat_schedule = {
    'daily-reminders-test': {
        'task': 'daily_reminders',
        'schedule': 120.0,  
    },
    
    'monthly-reports-test': {
        'task': 'monthly_reports', 
        'schedule': 120.0,  
    },
    
    'cleanup-temp-files': {
        'task': 'cleanup_temp_files',
        'schedule': crontab(hour=2, minute=0),
    },
}

task_serializer = 'json'
accept_content = ['json']
result_serializer = 'json'

result_expires = 3600


# from celery.schedules import crontab

# broker_url = "redis://127.0.0.1:6379/0"
# result_backend = "redis://127.0.0.1:6379/1"
# timezone = "UTC"

# # Celery Beat Schedule for periodic tasks
# beat_schedule = {
#     # Daily reminders at 9:00 AM every day
#     'daily-reminders': {
#         'task': 'daily_reminders',
#         'schedule': crontab(hour=9, minute=0),
#     },
    
#     # Monthly reports on 1st of every month at 10:00 AM
#     'monthly-reports': {
#         'task': 'monthly_reports',
#         'schedule': crontab(hour=10, minute=0, day_of_month=1),
#     },
    
#     # Cleanup temp files daily at 2:00 AM
#     'cleanup-temp-files': {
#         'task': 'cleanup_temp_files',
#         'schedule': crontab(hour=2, minute=0),
#     },
# }

# # Optional: Task serialization settings
# task_serializer = 'json'
# accept_content = ['json']
# result_serializer = 'json'

# # Task result expiration (in seconds)
# result_expires = 3600