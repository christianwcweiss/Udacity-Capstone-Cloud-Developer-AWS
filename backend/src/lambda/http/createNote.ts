import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateNoteRequest } from '../../requests/CreateNoteRequest'
import { createNoteItem } from '../../logic/noteLogic'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createnote')

const createNoteHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Create of note in Progress:', event)

  const userId = getUserId(event)
  const createNoteRequest = JSON.parse(event.body || '') as CreateNoteRequest
  const item = await createNoteItem(userId, createNoteRequest)

  logger.info('Note item was created successfully', { userId, noteId: item.noteId })

  return {
    statusCode: 201,
    body: JSON.stringify({ item })
  }
}

export const handler = middy(createNoteHandler).use(cors({ credentials: true }))