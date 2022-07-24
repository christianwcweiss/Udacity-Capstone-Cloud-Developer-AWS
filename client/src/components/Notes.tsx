import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createNote, deleteNote, getNotes, patchNote } from '../api/notes-api'
import Auth from '../auth/Auth'
import { Note } from '../types/Note'

interface NotesProps {
  auth: Auth
  history: History
}

interface NotesState {
  notes: Note[]
  newNoteTitle: string
  newNoteDescription: string
  loadingNotes: boolean
}

export class Notes extends React.PureComponent<NotesProps, NotesState> {
  state: NotesState = {
    notes: [],
    newNoteTitle: '',
    newNoteDescription: '',
    loadingNotes: true
  }

  onEditButtonClick = (noteId: string) => {
    this.props.history.push(`/notes/${noteId}/edit`)
  }

  onNoteCreate = async () => {
    try {
      const newNote = await createNote(this.props.auth.getIdToken(), {
        title: this.state.newNoteTitle,
        description: this.state.newNoteDescription
      })
      this.setState({
        notes: [...this.state.notes, newNote],
        newNoteTitle: ''
      })
    } catch {
      alert('note creation failed')
    }
  }

  onNoteDelete = async (noteId: string) => {
    try {
      await deleteNote(this.props.auth.getIdToken(), noteId)
      this.setState({
        notes: this.state.notes.filter(note => note.noteId !== noteId)
      })
    } catch {
      alert('note deletion failed')
    }
  }


  async componentDidMount() {
    try {
      const notes = await getNotes(this.props.auth.getIdToken())
      this.setState({
        notes,
        loadingNotes: false
      })
    } catch (e) {
      alert(`Failed to fetch notes: ${e}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">notes</Header>

        {this.renderCreateNoteInput()}

        {this.renderNotes()}
      </div>
    )
  }

  handleTitleChange= (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newNoteTitle: event.target.value })
  }

    handleDescriptionChange= (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newNoteDescription: event.target.value })
  }

  renderCreateNoteInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            fluid
            actionPosition="left"
            placeholder="Your title..."
            onChange={this.handleTitleChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Input
            fluid
            actionPosition="left"
            placeholder="Your description..."
            onChange={this.handleDescriptionChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Button onClick={() =>this.onNoteCreate()} >{"Submit new Note"}</Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderNotes() {
    if (this.state.loadingNotes) {
      return this.renderLoading()
    }

    return this.renderNotesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading notes
        </Loader>
      </Grid.Row>
    )
  }

  renderNotesList() {
    return (
      <Grid padded>
        {this.state.notes.map((note, pos) => {
          return (
            <Grid.Row key={note.noteId}>
              <Grid.Column width={10} verticalAlign="middle">
                {note.title}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {note.description}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(note.noteId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onNoteDelete(note.noteId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {note.attachmentUrl && (
                <Image src={note.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

}
