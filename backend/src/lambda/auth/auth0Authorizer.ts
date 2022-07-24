import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { decode, verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
import { Jwt } from '../../auth/Jwt'
import Axios from 'axios';

const logger = createLogger('auth')

const jwksUrl = 'https://dev-1x060-89.us.auth0.com/.well-known/jwks.json'

// With help from https://github.com/yesenarman/udacity-serverless-note-app/blob/761ece226d941bfd8af369c6f22c64e3be48704e/backend/src/lambda/auth/auth0Authorizer.ts
export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing the user starting', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    logger.info('User successfully authorized', jwtToken)
 
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
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

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
    }
  }
}

export async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const { header } = jwt;

  let key = await getSigningKey(jwksUrl, header.kid)
  return verify(token, key.publicKey, { algorithms: ['RS256'] }) as JwtPayload}

export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('There is no authentication header set')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header. Please provide a Bearer token.')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

const getSigningKey = async (jwkurl, kid) => {
  let res = await Axios.get(jwkurl, {
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      'Access-Control-Allow-Credentials': true,
    }
  });
  let keys  = res.data.keys;
  const signingKeys = keys.filter(key => key.use === 'sig'
      && key.kty === 'RSA'
      && key.kid
      && key.x5c && key.x5c.length
    ).map(key => {
      return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
    });
  const signingKey = signingKeys.find(key => key.kid === kid);
  if(!signingKey){
    logger.error("No signing keys found")
    throw new Error('Invalid signing keys')
  }

  logger.info("Signing keys created successfully ", signingKey)
  return signingKey

};

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}
