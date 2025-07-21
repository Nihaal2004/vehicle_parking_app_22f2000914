class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True


class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI  = "sqlite:///vps.sqlite3"
    DEBUG = True
    SECRET_KEY = "this-is-a-key"
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = "password-salt-this-is"
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"