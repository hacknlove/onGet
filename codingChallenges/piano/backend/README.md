# Apollo Server

This is a sample server implementation to store/retrieve songs using [GraphQL](https://graphql.org/) with [Apollo](https://www.apollographql.com/).

## Run the server
- `cd apollo-server` and `npm install`
- `npm start`

## Run sample queries
Start the server & access the [GraphQL Playground IDE](https://github.com/prismagraphql/graphql-playground), e.g. on `localhost:4000`.

To query songs:
```
query {
    songs {
        id
        title
       events{
        activeNotes
        duration
      }
    }
}
```
To add a song:
```
mutation {
    addSong(title: "Some new song", keysPlayed: ["D", "E", "F"]) {
        title
        events
    }
}
```
