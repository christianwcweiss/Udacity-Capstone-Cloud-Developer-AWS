import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { UpdateNoteRequest } from '../../requests/UpdateNoteRequest'
import { updateNoteItem } from '../../logic/noteLogic'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updatenote')

const updateNoteHandler: APIGatewayProxyHandler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  logger.info('Update of note started:', event)

  const userId = getUserId(event)
  const noteId = event.pathParameters?.noteId
  const updateNoteRequest = JSON.parse(event.body || '') as UpdateNoteRequest

  if (!noteId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid note id' })
    }
  }

  const updated = await updateNoteItem(userId, noteId, updateNoteRequest)
  if (!updated) {
    logger.info('Note item does not exist', { userId, noteId })
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Note item does not exist'
      })
    }
  }

  logger.info('Note item was updated', { userId, noteId })

  return {
    statusCode: 200,
    body: ''
  }
}

export const handler = middy(updateNoteHandler).use(cors({ credentials: true }))