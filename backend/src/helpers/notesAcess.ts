import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

import { NoteItem } from '../models/NoteItem'
import { NoteUpdate } from '../models/NoteUpdate'

export class NoteItemsAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly notesDynamoTable = process.env.NOTES_DYNAMO_TABLE || '',
    private readonly notesIdDynamoIndex = process.env.NOTES_ID_DYNAMO_INDEX || ''
  ) {}

  async getAllNoteItems(userId: string): Promise<NoteItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.notesDynamoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    return result.Items as NoteItem[]
  }

  async findItemById(userId: string, noteId: string): Promise<NoteItem | null> {
    const result = await this.docClient
      .query({
        TableName: this.notesDynamoTable,
        IndexName: this.notesIdDynamoIndex,
        ConsistentRead: true,
        KeyConditionExpression: 'userId = :userId and notesId = :noteId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':NoteId': noteId
        }
      })
      .promise()

    if (result.Count === 0 || !result.Items) {
      return null
    }

    return result.Items[0] as NoteItem
  }

  async createNoteItem(NotesItem: NoteItem): Promise<NoteItem> {
    await this.docClient
      .put({
        TableName: this.notesDynamoTable,
        Item: NotesItem
      })
      .promise()

    return NotesItem
  }

  async updateNoteItem(
    userId: string,
    NotesId: string,
    update: NoteUpdate
  ): Promise<boolean> {
    const NotesItem = await this.findItemById(userId, NotesId)
    if (!NotesItem) {
      return false
    }

    const createdAt = NotesItem.createdAt

    if (!update.title || update.title === "") {
      throw new Error()
    }

    await this.docClient
      .update({
        TableName: this.notesDynamoTable,
        Key: { userId, createdAt },
        UpdateExpression:
          'set #itemTitle = :itemTitle, description = :description',
        ExpressionAttributeValues: {
          ':itemTitle': update.title,
          ':description': update.description,
        },
        ExpressionAttributeNames: {
          '#itemName': 'name'
        }
      })
      .promise()

    return true
  }

  async deleteNoteItem(userId: string, NotesId: string): Promise<void> {
    const noteItem = await this.findItemById(userId, NotesId)

    if (!noteItem) {
      return
    }

    const createdAt = noteItem.createdAt
    await this.docClient
      .delete({
        TableName: this.notesDynamoTable,
        Key: { userId, createdAt }
      })
      .promise()
  }
}
