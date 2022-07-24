import { apiEndpoint } from '../config'
import { note } from '../types/note';
import { CreatenoteRequest } from '../types/CreatenoteRequest';
import Axios from 'axios'
import { UpdatenoteRequest } from '../types/UpdatenoteRequest';

export async function getnotes(idToken: string): Promise<note[]> {
  console.log('Fetching notes')

  const response = await Axios.get(`${apiEndpoint}/notes`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('notes:', response.data)
  return response.data.items
}

export async function createnote(
  idToken: string,
  newnote: CreatenoteRequest
): Promise<note> {
  const response = await Axios.post(`${apiEndpoint}/notes`,  JSON.stringify(newnote), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchnote(
  idToken: string,
  noteId: string,
  updatednote: UpdatenoteRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/notes/${noteId}`, JSON.stringify(updatednote), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deletenote(
  idToken: string,
  noteId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/notes/${noteId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  noteId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/notes/${noteId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
