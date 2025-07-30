import os
from dotenv import load_dotenv
load_dotenv()
class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True
print(os.getenv('PASSWORD'))
class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI  = "sqlite:///vps.sqlite3"
    DEBUG = True
    SECRET_KEY = "this-is-a-key"
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = "password-salt-this-is"
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = 'smartparkingbot@gmail.com'
    MAIL_PASSWORD = os.getenv('PASSWORD')  # Use Gmail App Password
    MAIL_DEFAULT_SENDER = 'smartparkingbot@gmail.com'
    SMTP_SERVER       = "smtp.gmail.com"
    SMTP_PORT         = 587
    EMAIL_USER        = "smartparkingbot@gmail.com"
    EMAIL_APP_PASSWORD= os.getenv('PASSWORD')
    
    # Celery Configuration
    CELERY_BROKER_URL = 'redis://localhost:6379/0'
    CELERY_RESULT_BACKEND = 'redis://localhost:6379/1'