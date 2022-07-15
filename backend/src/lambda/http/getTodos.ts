import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import {getTodos} from "../../helpers/todos";
import {TodoItem} from "../../models/TodoItem";
import {HEADERS} from "./statics";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      try {
          const todoList: TodoItem[] = await getTodos(event);
          return {
              statusCode: 200,
              headers: HEADERS,
              body: JSON.stringify({todoList})
          };
      } catch (error) {
          return {
              statusCode: 500,
              headers: HEADERS,
              body: JSON.stringify({error})
          };
      }
  })

handler.use(
  cors({
    credentials: true
  })
)
