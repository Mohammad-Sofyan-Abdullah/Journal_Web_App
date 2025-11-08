from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
import pymongo
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json
from bson import ObjectId

app = FastAPI()

# MongoDB Connection
MONGODB_URL = "mongodb://mongo:27017"
client = pymongo.MongoClient(MONGODB_URL)
db = client.journal_db
collection = db.journals

# Custom JSON encoder to handle ObjectId
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)

# Static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Journal(BaseModel):
    title: str
    content: str
    date: str = None

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/journals")
def create_journal(journal: Journal):
    journal.date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    collection.insert_one(journal.dict())
    return {"message": "Journal created successfully"}

@app.get("/api/journals")
def get_journals():
    journals = list(collection.find({}).sort("date", -1))
    # Convert ObjectId to string using our custom encoder
    return json.loads(json.dumps(journals, cls=CustomJSONEncoder))

@app.delete("/api/journals/{journal_id}")
def delete_journal(journal_id: str):
    try:
        result = collection.delete_one({"_id": ObjectId(journal_id)})
        if result.deleted_count == 1:
            return {"message": "Journal deleted successfully"}
        return JSONResponse(status_code=404, content={"message": "Journal not found"})
    except Exception as e:
        return JSONResponse(status_code=400, content={"message": str(e)})

@app.put("/api/journals/{journal_id}")
def update_journal(journal_id: str, journal: Journal):
    try:
        journal_dict = journal.dict()
        journal_dict["date"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        result = collection.update_one(
            {"_id": ObjectId(journal_id)},
            {"$set": journal_dict}
        )
        if result.modified_count == 1:
            return {"message": "Journal updated successfully"}
        return JSONResponse(status_code=404, content={"message": "Journal not found"})
    except Exception as e:
        return JSONResponse(status_code=400, content={"message": str(e)})