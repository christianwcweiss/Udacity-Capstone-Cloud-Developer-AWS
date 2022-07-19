import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodoItem } from '../../logic/todoLogic'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

const createTodoHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Create of Todo in Progress:', event)

  const userId = getUserId(event)
  const createTodoRequest = JSON.parse(event.body || '') as CreateTodoRequest
  const item = await createTodoItem(userId, createTodoRequest)

  logger.info('Todo item was created successfully', { userId, todoId: item.todoId })

  return {
    statusCode: 201,
    body: JSON.stringify({ item })
  }
}

export const handler = middy(createTodoHandler).use(cors({ credentials: true }))