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

import { createnote, deletenote, getnotes, patchnote } from '../api/notes-api'
import Auth from '../auth/Auth'
import { note } from '../types/Note'

interface notesProps {
  auth: Auth
  history: History
}

interface notesState {
  notes: note[]
  newnoteName: string
  loadingnotes: boolean
}

export class notes extends React.PureComponent<notesProps, notesState> {
  state: notesState = {
    notes: [],
    newnoteName: '',
    loadingnotes: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newnoteName: event.target.value })
  }

  onEditButtonClick = (noteId: string) => {
    this.props.history.push(`/notes/${noteId}/edit`)
  }

  onNoteCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newnote = await createnote(this.props.auth.getIdToken(), {
        name: this.state.newnoteName,
        dueDate
      })
      this.setState({
        notes: [...this.state.notes, newnote],
        newnoteName: ''
      })
    } catch {
      alert('note creation failed')
    }
  }

  onnoteDelete = async (noteId: string) => {
    try {
      await deletenote(this.props.auth.getIdToken(), noteId)
      this.setState({
        notes: this.state.notes.filter(note => note.noteId !== noteId)
      })
    } catch {
      alert('note deletion failed')
    }
  }

  onnoteCheck = async (pos: number) => {
    try {
      const note = this.state.notes[pos]
      await patchnote(this.props.auth.getIdToken(), note.noteId, {
        title: note.title,
        description: note.description,
      })
      this.setState({
        notes: update(this.state.notes, {})
      })
    } catch {
      alert('note deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const notes = await getnotes(this.props.auth.getIdToken())
      this.setState({
        notes,
        loadingnotes: false
      })
    } catch (e) {
      alert(`Failed to fetch notes: ${e}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">notes</Header>

        {this.renderCreatenoteInput()}

        {this.rendernotes()}
      </div>
    )
  }

  renderCreatenoteInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onNoteCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  rendernotes() {
    if (this.state.loadingnotes) {
      return this.renderLoading()
    }

    return this.rendernotesList()
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

  rendernotesList() {
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
                  onClick={() => this.onnoteDelete(note.noteId)}
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

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
