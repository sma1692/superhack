from mongoengine import Document, StringField, BooleanField, DateTimeField, ListField, ReferenceField
from datetime import datetime

class ThreadURL(Document):
    title = StringField(required=True)
    href = StringField(required=True, unique=True)  # avoid duplicates
    scraped_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "thread_urls"}


class Answer(Document):
    answer_id = StringField(required=True, unique=True)
    question_id = StringField(required=True)
    author = StringField()
    content = StringField()
    posted_date = StringField()
    like_count = StringField()
    is_accepted = BooleanField(default=False)
    scraped_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "answers"}


class Question(Document):
    question_id = StringField(required=True, unique=True)
    title = StringField()
    description = StringField()
    author = StringField()
    view_count = StringField()
    like_count = StringField()
    posted_date = StringField()
    url = StringField()
    # answers = ListField(ReferenceField('Answer')) 
    scraped_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "questions"}