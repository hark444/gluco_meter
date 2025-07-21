from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


SQLALCHEMY_DATABASE_URI = 'sqlite:///./GlucoMeter.db'

engine = create_engine(SQLALCHEMY_DATABASE_URI, connect_args={"check_same_thread": False})

sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)