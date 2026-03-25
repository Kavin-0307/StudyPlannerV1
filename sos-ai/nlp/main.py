from fastapi import FastAPI
from pydantic import BaseModel
from nlp_pipeline import process_text
 
app=FastAPI()
class LectureRequest(BaseModel):
    text:str
@app.get("/")
def home():
    return{"Message":"SOS AI Service running"}
@app.post("/process_text")
def procesds_lecture(request:LectureRequest):
    result=process_text(request.text)
    return result