import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { deleteNoteItem } from '../../logic/noteLogic'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteNote')

export const deleteNoteHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Deletion of Note started: ', event)

  const userId = getUserId(event)
  const noteId = event.pathParameters?.noteId
  if (!noteId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid note id' })
    }
  }

  await deleteNoteItem(userId, noteId)

  logger.info('Note item was deleted successfully', { userId, noteId })

  return {
    statusCode: 200,
    body: ''
  }
}

export const handler = middy(deleteNoteHandler).use(cors({ credentials: true }))