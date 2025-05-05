function errorHandler(err, req, res, next) {

    console.log('error:::', {err})
    if (err.status === 404) {
        return res.status(404).json({ message: "Not Found" });
      }
      
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: "The user is not authorized" });
      }
    
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
      }

    
    return res.status(500).json({ message: err.message });
    
  }
  
  module.exports = errorHandler;
  