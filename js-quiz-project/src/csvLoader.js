let csvLoader = {
  loadCSV: function(filePath) {
    return fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => this.parseCSV(data))
      .catch(error => console.error('Error loading CSV:', error));
  },

  parseCSV: function(data) {
    const lines = data.split('\n');
    const questions = [];

    for (let line of lines) {
      const [question, ...options] = line.split(',');
      const answer = options.pop(); // Assume the last option is the correct answer
      questions.push({ question, options, answer });
    }

    return questions;
  }
};

export default csvLoader;