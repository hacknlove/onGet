const { ApolloServer, gql } = require('apollo-server');

const songs = [];

const typeDefs = gql`
    type Event {
        activeNotes: [Int],
        duration: Int
    }

    input EventInput {
        activeNotes: [Int],
        duration: Int
    }

    type Song {
        id: ID!
        title: String
        events: [Event]
    }

    type Query {
        songs: [Song]
    }

    type Mutation {
        addSong(title: String, events: [
            EventInput
        ]): Song
    }
`

const resolvers = {
    Query: {
        songs: () => songs,
    },
    Mutation: {
        addSong: (_, { title, events }) => {
            const newSong = {
                id: songs.length + 1,
                title,
                events
            };
            songs.push(newSong);

            return newSong;
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(`Apollo server running: ${url}`);
});
