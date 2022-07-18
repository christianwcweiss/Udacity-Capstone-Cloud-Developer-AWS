// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '6oftelxyzg'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/development`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-1x060-89.us.auth0.com',            // Auth0 domain
  clientId: 'jc8TnZOBYR5CtB0eBgaMp1RXOWODe6U6',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
