
fetch("http://127.0.0.1:5000/api/health")
  .then(response => response.json())
  .then(data => {
    console.log("HelpHub backend connected:", data);
  })
  .catch(error => {
    console.error("Backend connection failed:", error);
  });
