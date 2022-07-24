import { v4 as uuidv4 } from 'uuid'

import { NoteItem } from '../models/NoteItem'
import { NoteItemsAccess } from '../helpers/notesAcess'
import { FilesAccess } from '../helpers/filesAccess'
import { CreateNoteRequest } from '../requests/CreateNoteRequest'
import { UpdateNoteRequest } from '../requests/UpdateNoteRequest'

const noteItemsAccess = new NoteItemsAccess()
const filesAccess = new FilesAccess()

export async function getAllNoteItems(userId: string): Promise<NoteItem[]> {
  const items = await noteItemsAccess.getAllNoteItems(userId)
  for (const item of items) {
    const noteId = item.noteId
    if (noteId && (await filesAccess.fileExists(noteId))) {
      item.attachmentUrl = filesAccess.getDownloadUrl(noteId)
    }
  }
  return items
}

export async function createNoteItem(
  userId: string,
  createNoteRequest: CreateNoteRequest
): Promise<NoteItem> {
  const noteId = uuidv4()

  if (!createNoteRequest.title || createNoteRequest.title === "") {
    throw new Error()
  }

  return await noteItemsAccess.createNoteItem({
    userId: userId,
    noteId,
    createdAt: new Date().toISOString(),
    title: createNoteRequest.title,
    description: createNoteRequest.description,
  })
}

export async function updateNoteItem(
  userId: string,
  noteId: string,
  updateNoteRequest: UpdateNoteRequest
): Promise<boolean> {
  return await noteItemsAccess.updateNoteItem(userId, noteId, updateNoteRequest)
}

export async function deleteNoteItem(
  userId: string,
  noteId: string
): Promise<void> {
  await noteItemsAccess.deleteNoteItem(userId, noteId)
}

export async function getAttachmentUploadUrl(
  userId: string,
  noteId: string
): Promise<string | null> {
  const noteItem = await noteItemsAccess.findItemById(userId, noteId)
  if (!noteItem) {
    return null
  }

  return filesAccess.getUploadUrl(noteId)
}