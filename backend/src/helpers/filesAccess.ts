import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('AttachmentsAccess')

export class FilesAccess {
  constructor(
    private readonly s3Client = new XAWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly filesBucket = process.env.FILES_S3_BUCKET ||
      '',
    private readonly uploadUrlExpiration = parseInt(
      process.env.FILE_UPLOAD_URL_EXPIRATION || '300'
    ),
    private readonly downloadUrlExpiration = parseInt(
      process.env.FILE_DOWNLOAD_URL_EXPIRATION || '50000'
    )
  ) {}

  async fileExists(noteId: string): Promise<boolean> {
    try {
      logger.info('Checking if the file exists in', {
        Bucket: this.filesBucket,
        Key: noteId
      })
      const headObject = await this.s3Client
        .headObject({
          Bucket: this.filesBucket,
          Key: noteId
        })
        .promise()
      logger.info('Head object exists', { headObject })
      return true
    } catch (error) {
      logger.error('Head object does not exist', { error })
      return false
    }
  }

  getUploadUrl(noteId: string) {
    return this.s3Client.getSignedUrl('putObject', {
      Bucket: this.filesBucket,
      Key: noteId,
      Expires: this.uploadUrlExpiration
    })
  }

  getDownloadUrl(noteId: string) {
    return this.s3Client.getSignedUrl('getObject', {
      Bucket: this.filesBucket,
      Key: noteId,
      Expires: this.downloadUrlExpiration
    })
  }
}