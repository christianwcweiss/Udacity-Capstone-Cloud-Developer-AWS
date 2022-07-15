export interface TodoCreate{
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}