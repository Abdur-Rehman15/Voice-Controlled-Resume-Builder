const geminiClient = {
  validateAnswer: async (prompt, answer) => {
    // Dummy logic: accept if answer is not empty
    if (answer && answer.trim().length > 0) {
      return { valid: true, message: 'جواب درست ہے' };
    } else {
      return { valid: false, message: 'جواب خالی ہے' };
    }
  }
};

export default geminiClient;
