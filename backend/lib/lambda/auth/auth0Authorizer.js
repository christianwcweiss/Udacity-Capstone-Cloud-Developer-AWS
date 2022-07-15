import 'source-map-support/register';
import JwksRsa from 'jwks-rsa';
import { verify } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
const logger = createLogger('auth');
// Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-1x060-89.us.auth0.com/.well-known/jwks.json';
export const handler = async (event) => {
    logger.info('Authorizing a user', event.authorizationToken);
    try {
        const jwtToken = await verifyToken(event.authorizationToken);
        logger.info('User was authorized', jwtToken);
        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        };
    }
    catch (e) {
        logger.error('User not authorized', { error: e.message });
        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        };
    }
};
export async function verifyToken(authHeader) {
    const token = getToken(authHeader);
    // Auth0 certificate to verify JWT token signature
    // Auth0: Advanced Settings: Endpoints: JSON Web Key Set
    const client = JwksRsa({ jwksUri: jwksUrl });
    const clientId = '99QNnMS9DQykQVvz0VDmaQA3kEaxbhcs';
    const certSigningKey = (await client.getSigningKey(clientId));
    return verify(token, certSigningKey.publicKey, { algorithms: ['RS256'] });
}
export function getToken(authHeader) {
    if (!authHeader)
        throw new Error('No authentication header');
    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header');
    const split = authHeader.split(' ');
    const token = split[1];
    return token;
}
export async function checkForExpiration(authHeader) {
    const verifiedToken = await verifyToken(authHeader);
    if (verifiedToken.exp > Date.now()) {
        return true;
    }
    throw new Error("Token expired");
}
//# sourceMappingURL=auth0Authorizer.js.map