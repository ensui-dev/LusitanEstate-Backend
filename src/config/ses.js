const { SESClient } = require('@aws-sdk/client-ses');

// Validate required environment variables
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.warn(`Warning: Missing AWS environment variables: ${missingVars.join(', ')}`);
  console.warn('Email functionality will be disabled');
}

// SES Client Configuration
const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Email configuration defaults
const emailConfig = {
  fromEmail: process.env.AWS_SES_FROM_EMAIL || 'noreply@lusitanestate.com',
  fromName: process.env.AWS_SES_FROM_NAME || 'LusitanEstate',
  replyToEmail: process.env.AWS_SES_REPLY_TO_EMAIL || 'suporte@lusitanestate.com',
  verificationTokenExpiry: process.env.EMAIL_VERIFICATION_EXPIRES || '24h',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

// Check if SES is properly configured
const isSESConfigured = () => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_SES_FROM_EMAIL
  );
};

module.exports = {
  sesClient,
  emailConfig,
  isSESConfigured
};
