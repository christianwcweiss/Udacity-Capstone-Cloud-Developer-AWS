import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import {HEADERS} from "./statics";
import {deleteTodo} from "../../helpers/todos";
import {checkForExpiration} from "../auth/auth0Authorizer";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;

  try {
    await checkForExpiration(event.headers.Authorization)
    await deleteTodo(event, todoId);
    return {
      statusCode: 204,
            headers: HEADERS,
      body: undefined
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error })
    };
  }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
