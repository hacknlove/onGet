import React from 'react'
import { useOnGet, set, refresh, get } from 'onget'

function useOnReddit (url) {
  const json = useOnGet(url, {
    firstIfUrlChanges: true
  })

  return json
    ? {
      isFetching: json.isFetching,
      posts: json.data.children.map(child => child.data),
      receivedAt: Date.now()
    } : {
      isFetching: true
    }
}

function refreshSubReddit (url) {
  set(url, {
    ...get(url),
    isFetching: true
  })
  refresh(url, true)
}

export default function Posts ({ url }) {
  const { isFetching, posts, receivedAt } = useOnReddit(url)
  return (
    <>
      <p>
        {receivedAt &&
          <span>
            Last updated at {new Date(receivedAt).toLocaleTimeString()}.
          </span>
        }
        {!isFetching &&
          <button onClick={() => refreshSubReddit(url)}>
            Refresh
          </button>
        }
      </p>
      {!posts
        ? (isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
        : (
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            <ul>
              {posts.map((post, i) =>
                <li key={i}>{post.title}</li>
              )}
            </ul>
          </div>
        )
      }
    </>
  )
}
