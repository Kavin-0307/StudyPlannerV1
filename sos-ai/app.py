from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "SOS AI Service Running"}