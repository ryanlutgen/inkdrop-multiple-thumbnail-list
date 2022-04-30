'use babel'
import * as ThumbnailNoteListItemView from './ThumbnailNoteListItemView'

module.exports = {
  config: {
  },

  activate: () => {
    ThumbnailNoteListItemView.registerAsNoteListItemView()
  },

  deactivate: () => {
    ThumbnailNoteListItemView.unregisterAsNoteListItemView()
  }
}