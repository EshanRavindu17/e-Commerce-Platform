import AWS from 'aws-sdk';
import config from './index.js';

AWS.config.update({
    region: config.COGNITO.REGION
});

const cognito = new AWS.CognitoIdentityServiceProvider({
    region: config.COGNITO.REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

export default cognito;