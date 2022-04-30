'use babel'
import * as React from 'react'
import { useCallback } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
import classNames from 'classnames'
import removeMd from 'remove-markdown'
const matter = require('gray-matter')

dayjs.extend(relativeTime)
dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
  relativeTime: {
    past: "%s",
    s: "1s",
    ss: "%ss",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy"
  }
})

export default function ThumbnailNoteListItemView(props) {
  const NoteStatusIcon = inkdrop.components.getComponentClass('NoteStatusIcon')
  const NoteListItemShareStatusView = inkdrop.components.getComponentClass(
    'NoteListItemShareStatusView'
  )
  const TaskProgressView = inkdrop.components.getComponentClass(
    'TaskProgressView'
  )
  const TagList = inkdrop.components.getComponentClass('TagList')
  const NoteListItemSummaryView = inkdrop.components.getComponentClass('NoteListItemSummaryView')

  const { active, focused, note, onClick, onDblClick, onContextMenu } = props
  const {
    title,
    status,
    updatedAt,
    share,
    numOfTasks,
    numOfCheckedTasks,
    tags,
    body,
    _rev
  } = note

  const {content, data} = matter(body)
  const plainBodyTrim = removeMd(content).substring(0, 200);

  /*
    Rather than changing the existing regex, this hacky way was implemented
    Scan a copy of the body for a match, extract it, then remove that match from the copy.
    Keep scanning the copy and removing matches until we have three matches or there are no more matches
  */
  let continueLoop = true
  let imageUrls = [];
  let bodyCopy = body + "";

  while (continueLoop) {
    const match = bodyCopy.match(/.*<img .*src="(.*[^\"])".*>.*|\!\[.*]\( *([^ ]+) *(?:[ ]+"[^"]*")?\)/)

    let imageUrl = data[inkdrop.config.get('thumbnail-list.keyName') ?? "thumbnail"]

    if (imageUrls.length < 3) {
      if (!imageUrl && match && match.length > 2) {
        const url = match[1] ?? match[2]
        bodyCopy = bodyCopy.replaceAll(url, "")
        imageUrl = url.replace(/^inkdrop:\/\/file:/,'inkdrop-file://file:')
        imageUrls.push(imageUrl);
      }
      else {
        continueLoop = false;
      }
    }
    else {
      continueLoop = false;
    }
  }

  const ThumbnailView = () => {
    if (imageUrls.length > 0) {
      return (
        <div className="thumbnail">
          <div className="wrapper">
            {imageUrls.map((value, index) => {
              return <img className={`image cover`} src={value} />
            })}
          </div>
        </div>
      )
    }
  }
  const classes = classNames({
    'thumbnail-note-list-item-view': true,
    'note-list-item-view': true,
    active,
    focused,
    task: status !== 'none',
    'has-thumbnail': imageUrls.length > 0,
  })

  const date = dayjs(updatedAt).fromNow(true);

  const taskState = status ? `task-${status}` : ''
  const isTask = typeof numOfTasks === 'number' && numOfTasks > 0

  const handleClick = useCallback(
    e => {
      onClick && onClick(e, note)
      e.preventDefault()
      e.stopPropagation()
    },
    [onClick, note]
  )

  const handleDblClick = useCallback(
    e => {
      onDblClick && onDblClick(e, note)
      e.preventDefault()
      e.stopPropagation()
    },
    [onDblClick, note]
  )

  const handleContextMenu = useCallback(
    e => {
      onContextMenu && onContextMenu(e, note)
      e.preventDefault()
      e.stopPropagation()
    },
    [onContextMenu, note]
  )

  return (
    <div
      className={`${classes} ${taskState}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDblClick}
    >
      <div className="content">
      <section class="section-left"><span className="date">{date}</span></section>
      <section class="section-right"><div className="header">
          <NoteStatusIcon status={status} />
          <NoteListItemShareStatusView visibility={share} />
          {title || 'Untitled'}
        </div>
        <div className="description">
          <div className="meta">
            {isTask && (
              <TaskProgressView
                numOfTasks={numOfTasks || 0}
                numOfCheckedTasks={numOfCheckedTasks || 0}
              />
            )}
            <TagList tagIds={tags} />
          </div>
            {/* {showSummary && <NoteListItemSummaryView revId={_rev || ''} body={plainBodyTrim} />} */}
            <span className="text">{plainBodyTrim}</span>
        </div>

      {ThumbnailView()}
      </section>
      </div>
    </div>
  )
}

export function registerAsNoteListItemView() {
  inkdrop.components.registerClass(
    ThumbnailNoteListItemView,
    'CustomNoteListItemView'
  )
}

export function unregisterAsNoteListItemView() {
  inkdrop.components.deleteClass(
    ThumbnailNoteListItemView.default,
    'CustomNoteListItemView'
  )
}