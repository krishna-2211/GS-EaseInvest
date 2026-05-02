How to run the backend:

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
Create a .env file with ANTHROPIC_API_KEY=your_key_here
uvicorn main:app --reload

Endpoints:

GET http://localhost:8000/users
GET http://localhost:8000/portfolio/user_001
GET http://localhost:8000/portfolio/user_002
GET http://localhost:8000/health-score/user_001
GET http://localhost:8000/health-score/user_002
POST http://localhost:8000/rebalance
GET http://localhost:8000/docs (interactive API docs)

Test users: user_001 = Pralay (YOLO), user_002 = Krishna (Careful)
