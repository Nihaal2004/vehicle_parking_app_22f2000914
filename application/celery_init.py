from celery import Celery, Task

class FlaskTask(Task):
    abstract = True
    def __call__(self, *args, **kwargs):

        with self.app.flask_app.app_context():
            return self.run(*args, **kwargs)

def celery_init_app(app):
    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object('celery_config')
    celery_app.flask_app = app       
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app
