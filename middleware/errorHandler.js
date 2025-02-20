const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Authentication Error',
            message: 'Please log in to continue'
        });
    }

    if (err.name === 'AIProcessingError') {
        return res.status(422).json({
            error: 'AI Processing Error',
            message: 'Failed to process image. Please try again.'
        });
    }

    res.status(500).json({
        error: 'Server Error',
        message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred'
            : err.message
    });
};

module.exports = errorHandler; 