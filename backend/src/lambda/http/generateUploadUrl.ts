import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getAttachmentUploadUrl } from '../../logic/noteLogic'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const generateUploadUrlHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Generating of upload URL started', event)

  const userId = getUserId(event)
  const noteId = event.pathParameters?.noteId

  if (!noteId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid note id' })
    }
  }

  const uploadUrl = await getAttachmentUploadUrl(userId, noteId)
  if (!uploadUrl) {
    logger.info('The note item does not exist', { userId, noteId })
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'The note item does not exist'
      })
    }
  }

  logger.info('File upload url generated', { userId, noteId, uploadUrl })

  return {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl })
  }
}

export const handler = middy(generateUploadUrlHandler).use(
  cors({
    credentials: true
  })
)