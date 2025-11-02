from mongoengine import connect

def init_db():
    connect(
        db="dell_forum",
        host="mongodb://localhost:27017/dell_forum",
        alias="default"
    )
    print("Database connected successfully.")
