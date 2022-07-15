import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import {TodoUpdate} from "../../models/TodoUpdate";
import {HEADERS} from "./statics";
import {updateTodo} from "../../helpers/todos";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const updateData: TodoUpdate = JSON.parse(event.body);

  try {
    await updateTodo(event, todoId, updateData);
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
