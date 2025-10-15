from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

# Serve the main frontend page
@app.route("/")
def index():
    return render_template("index.html")

# Example: Proxy request to project-service API to list projects
@app.route("/api/projects")
def get_projects():
    try:
        resp = requests.get("http://127.0.0.1:8001/api/projects")
        resp.raise_for_status()
        projects = resp.json()
    except requests.RequestException as e:
        return jsonify({"error": "Failed to fetch projects", "details": str(e)}), 500
    return jsonify(projects)

# Health check endpoint
@app.route("/health")
def health():
    return jsonify({"status": "healthy", "service": "dashboard"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
