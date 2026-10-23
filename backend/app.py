from flask_cors import CORS
from flask import Flask, jsonify,request
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite:///" + os.path.join(basedir, "helphub.db")
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
with app.app_context():
    db.create_all()

    from sqlalchemy import inspect, text

    columns = [
        column["name"]
        for column in inspect(db.engine).get_columns("user")
    ]

    if "phone" not in columns:
        db.session.execute(
            text("ALTER TABLE user ADD COLUMN phone VARCHAR(20)")
        )
        db.session.commit()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="customer")


class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=False
    )
    service = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="pending")

class Quote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(
        db.Integer, db.ForeignKey("service_request.id"), nullable=False
    )
    provider_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=False
    )
    amount = db.Column(db.Float, nullable=False)
    message = db.Column(db.Text)

@app.route("/api/requests", methods=["POST"])
def create_request():
    data = request.get_json(silent=True) or {}

    customer_id = data.get("customer_id")
    service = (data.get("category") or "").strip()
    description = (data.get("description") or "").strip()
    location = (data.get("area") or "").strip()

    if not customer_id or not service or not description or not location:
        return jsonify({
            "status": "error",
            "message": "Please fill in all required fields."
        }), 400

    customer = db.session.get(User, customer_id)

    if not customer or customer.role != "customer":
        return jsonify({
            "status": "error",
            "message": "Please log in with a customer account."
        }), 401

    new_request = ServiceRequest(
        customer_id=customer.id,
        service=service,
        description=description,
        location=location
    )

    db.session.add(new_request)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Service request saved!",
        "request": {
            "id": new_request.id,
            "service": new_request.service,
            "description": new_request.description,
            "location": new_request.location,
            "status": new_request.status
        }
    }), 201


@app.route("/api/requests", methods=["GET"])
def get_requests():
    customer_id = request.args.get("customer_id")

    if not customer_id:
        return jsonify({
            "status": "error",
            "message": "Customer ID is required."
        }), 400

    customer = db.session.get(User, int(customer_id))

    if not customer or customer.role != "customer":
        return jsonify({
            "status": "error",
            "message": "Customer not found."
        }), 404

    requests_list = ServiceRequest.query.filter_by(
        customer_id=customer.id
    ).order_by(ServiceRequest.id.desc()).all()

    return jsonify({
        "status": "success",
        "requests": [
            {
                "id": item.id,
                "category": item.service,
                "title": item.description.split("\n")[0],
                "description": item.description,
                "area": item.location,
                "status": item.status
            }
            for item in requests_list
        ]
    })

@app.route("/")
def home():
    return jsonify({
        "project": "HelpHub",
        "message": "HelpHub backend is running!"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "status": "success",
        "database": "configured"
    })

@app.route("/api/db-check")
def db_check():
    try:
        with app.app_context():
            db.create_all()
        return jsonify({
            "status": "success",
            "message": "HelpHub database and tables created!"
        })
    except Exception:
        app.logger.exception("Database initialization failed")
        return jsonify({
            "status": "error",
            "message": "Database initialization failed."
        }), 500

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""
    role = data.get("role") or "customer"

    if not name or not email or not phone or len(password) < 8:
        return jsonify({
            "status": "error",
            "message": "Please provide all required fields and a password of at least 8 characters."
        }), 400

    if role not in ("customer", "provider"):
        return jsonify({
            "status": "error",
            "message": "Invalid role."
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({
            "status": "error",
            "message": "An account with this email already exists."
        }), 409

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        role=role
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Registration successful!"
    }), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Please enter your email and password."
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(
        user.password_hash, password
    ):
        return jsonify({
            "status": "error",
            "message": "Invalid email or password."
        }), 401

    return jsonify({
        "status": "success",
        "message": "Login successful!",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200

if __name__ == "__main__":
    app.run(debug=True, port=5001)
