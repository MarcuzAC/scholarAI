import React, { useState, useEffect } from 'react';
import './App.css';
import ResultGraph from './ResultGraph';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [inputData, setInputData] = useState({
    gender: '',
    parentedu: '',
    lunch: '',
    testprep: '',
    mathscore: '',
    physicsscore: '',
    chemscore: '',
    studytimeweekly: '',
    absences: '',
  });

  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [graphData, setGraphData] = useState({
    labels: ['Math', 'Physics', 'Chemistry'],
    values: [0, 0, 0]
  });

  const [averageScore, setAverageScore] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  // Test server connection on component mount
  useEffect(() => {
    fetch("https://scholaraibackend.onrender.com/predict", { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          console.log("Server connection successful.");
        } else {
          console.error("Server reachable, but error response:", response.statusText);
        }
      })
      .catch(error => console.error("Error connecting to server:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedValue = ['mathscore', 'physicsscore', 'chemscore', 'studytimeweekly', 'absences'].includes(name) 
      ? parseInt(value, 10) 
      : value;

    setInputData({ ...inputData, [name]: updatedValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const mathScore = inputData.mathscore || 0;
    const physicsScore = inputData.physicsscore || 0;
    const chemScore = inputData.chemscore || 0;
    const average = (mathScore + physicsScore + chemScore) / 3;

    const updatedInputData = { ...inputData, average };

    setLoading(true);

    fetch("http://127.0.0.1:5000/predict", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedInputData),
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {
            console.error(`Network response was not ok: ${text}`);
            throw new Error(`Network response was not ok: ${text}`);
          });
        }
        return res.json();
      })
      .then(data => {
        if (data.error) {
          console.error(`Error from server: ${data.error}\nDetails: ${data.details}`);
          alert(`Error: ${data.error}\nDetails: ${data.details}`);
        } else {
          setPrediction(data.prediction);
          setRecommendations(data.recommendations);
          setAverageScore(average);

          setGraphData({
            labels: ['Math', 'Physics', 'Chemistry'],
            values: [mathScore, physicsScore, chemScore],
          });
        }
      })
      .catch(error => {
        console.error("Error during prediction:", error);
        alert("An error occurred while making the prediction.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">ScholarAI</h1>

      <div className="row">
        <div className="col-md-6">
          <h2 className="text-center mb-3">Make a Prediction:</h2>
          <form onSubmit={handleSubmit} className="form-container bg-light p-4 rounded shadow">
            <input type="text" name="gender" className="form-control mb-3" placeholder="Gender (Male/Female)" value={inputData.gender} onChange={handleChange} required />
            <input type="text" name="parentedu" className="form-control mb-3" placeholder="Parental Education Level" value={inputData.parentedu} onChange={handleChange} required />
            <input type="text" name="lunch" className="form-control mb-3" placeholder="Lunch Type (Standard/Free)" value={inputData.lunch} onChange={handleChange} required />
            <input type="text" name="testprep" className="form-control mb-3" placeholder="Test Preparation Course (None/Completed)" value={inputData.testprep} onChange={handleChange} required />
            <input type="number" name="mathscore" className="form-control mb-3" placeholder="Math Score" value={inputData.mathscore} onChange={handleChange} min="0" max="100" required />
            <input type="number" name="physicsscore" className="form-control mb-3" placeholder="Physics Score" value={inputData.physicsscore} onChange={handleChange} min="0" max="100" required />
            <input type="number" name="chemscore" className="form-control mb-3" placeholder="Chemistry Score" value={inputData.chemscore} onChange={handleChange} min="0" max="100" required />
            <input type="number" name="studytimeweekly" className="form-control mb-3" placeholder="Study Time Weekly (hours)" value={inputData.studytimeweekly} onChange={handleChange} min="0" required />
            <input type="number" name="absences" className="form-control mb-3" placeholder="Absences" value={inputData.absences} onChange={handleChange} min="0" required />
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Loading...' : 'Predict'}
            </button>
          </form>

          {prediction && (
            <div className="mt-4">
              <h3 className="text-center text-success">Prediction Result: {prediction}</h3>
            </div>
          )}
        </div>

        <div className="col-md-6">
          <h2 className="text-center mb-3">Student Scores Graph</h2>
          <div className="bg-light p-4 rounded shadow">
            <ResultGraph data={graphData} />
          </div>

          {averageScore !== null && (
            <div className="mt-3">
              <h4 className="text-center">Average Score: {averageScore.toFixed(2)}</h4>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="text-center">Recommendations:</h4>
              <ul className="list-group">
                {recommendations.map((rec, index) => (
                  <li key={index} className="list-group-item">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
