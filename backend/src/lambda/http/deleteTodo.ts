import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { deleteTodoItem } from '../../logic/todoLogic'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')

export const deleteTodoHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Deletion of Todo started: ', event)

  const userId = getUserId(event)
  const todoId = event.pathParameters?.todoId
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid todo id' })
    }
  }

  await deleteTodoItem(userId, todoId)

  logger.info('Todo item was deleted successfully', { userId, todoId })

  return {
    statusCode: 200,
    body: ''
  }
}

export const handler = middy(deleteTodoHandler).use(cors({ credentials: true }))