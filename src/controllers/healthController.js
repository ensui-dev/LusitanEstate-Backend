const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { checkAWSConfig } = require('../middleware/upload');

// @desc    Get system health status
// @route   GET /api/health
// @access  Public
exports.getHealthStatus = async (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                api: {
                    status: 'online',
                    uptime: process.uptime(),
                    message: 'API server is running'
                },
                database: {
                    status: 'disconnected',
                    message: 'Database connection status unknown'
                },
                aws: {
                    s3: {
                        status: 'unknown',
                        message: 'S3 configuration not checked'
                    },
                    ses: {
                        status: 'unknown',
                        message: 'SES configuration not checked'
                    }
                }
            }
        };

        // Check MongoDB connection
        const dbState = mongoose.connection.readyState;
        if (dbState === 1) {
            health.services.database.status = 'connected';
            health.services.database.message = 'MongoDB connected successfully';
        } else if (dbState === 2) {
            health.services.database.status = 'connecting';
            health.services.database.message = 'MongoDB connecting...';
        } else if (dbState === 0) {
            health.services.database.status = 'disconnected';
            health.services.database.message = 'MongoDB disconnected';
            health.status = 'degraded';
        }

        // Check AWS S3 configuration
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET_NAME) {
            health.services.aws.s3.status = 'configured';
            health.services.aws.s3.message = `S3 bucket: ${process.env.AWS_S3_BUCKET_NAME}`;
        } else {
            health.services.aws.s3.status = 'not_configured';
            health.services.aws.s3.message = 'S3 credentials not configured';
        }

        // Check AWS SES configuration
        if (process.env.AWS_SES_REGION && process.env.AWS_SES_FROM_EMAIL) {
            health.services.aws.ses.status = 'configured';
            health.services.aws.ses.message = `SES region: ${process.env.AWS_SES_REGION}`;
        } else {
            health.services.aws.ses.status = 'not_configured';
            health.services.aws.ses.message = 'SES credentials not configured';
        }

        res.status(200).json({
            success: true,
            data: health
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            message: error.message
        });
    }
};

module.exports = { getHealthStatus };
