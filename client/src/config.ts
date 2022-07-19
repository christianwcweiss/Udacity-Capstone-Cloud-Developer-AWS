// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'm24f0k5wcg'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev
`

export const authConfig = {
  domain: 'dev-1x060-89.us.auth0.com',            // Auth0 domain
  clientId: 'jc8TnZOBYR5CtB0eBgaMp1RXOWODe6U6',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
