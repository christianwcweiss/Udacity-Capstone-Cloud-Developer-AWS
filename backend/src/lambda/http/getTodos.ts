import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { NoteItem } from '../../models/noteItem'
import { getAllNoteItems } from '../../logic/noteLogic'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getnotes')

const getNotesHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Getting of notes started', event)

  const userId = getUserId(event)
  const items: NoteItem[] = await getAllNoteItems(userId)

  logger.info('Note items fetched', { userId, count: items.length })

  return {
    statusCode: 200,
    body: JSON.stringify({ items })
  }
}

export const handler = middy(getNotesHandler).use(cors({ credentials: true }))