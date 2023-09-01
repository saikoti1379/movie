const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3")
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    // role: dbObject.role,
  };
};

let db = null;

const initializeDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, (Request, Response) => {
      console.log("RUNNING SERVER");
    });
  } catch (error) {
    console.log(`error is ${error.message}`);
    process.exit(1);
  }
};

initializeDatabase();

// GET API 1

app.get("/movies/", async (Request, Response) => {
  const getMoviesQuery = `SELECT * FROM movie`;
  const getMovie = await db.all(getMoviesQuery);
  Response.send(
    getMovie.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
    // Response.send(getMovie);
});

// POST API 2

app.post("/movies/", async (Request, Response) => {
  const movieDetails = Request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieDetailsQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}' 
    )`;
  const dbResponse = await db.run(addMovieDetailsQuery);
  //   console.log(dbResponse);
  //   const movieID = dbResponse.lastID;
  Response.send("Movie Successfully Added");
});

// GET API 3

app.get("/movies/:movieId/", async (Request, Response) => {
  const { movieId } = Request.params;
  const getMovie = `SELECT * FROM movie WHERE movie_id=${movieId}`;
  const movie = await db.get(getMovie);
  Response.send(convertDbObjectToResponseObject(movie));
  //   Response.send(Movie);
});

// PUT API 4

app.put("/movies/:movieId/", async (Request, Response) => {
  const movieDetails = Request.body;
  const { movieId } = Request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetails = `
  UPDATE  movie 
  SET
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE 
  movie_id = ${movieId}
 `;
  const updateMovie = await db.run(updateMovieDetails);
  //   console.log(updateMovie);
  Response.send("Movie Details Updated");
});

// DELETE API 5

app.delete("/movies/:movieId/", async (Request, Response) => {
  const { movieId } = Request.params;
  const deleteMovie = `DELETE  FROM movie WHERE movie_id=${movieId}`;
  await db.get(deleteMovie);
  Response.send("Movie Removed");
});

// GET API 6

app.get("/directors/", async (Request, Response) => {
  const getDirectorQuery = `SELECT * FROM director`;
  const getDirectors = await db.all(getDirectorQuery);
  Response.send(
    getDirectors.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
  // Response.send(getDirectors);
});

// GET API 7

app.get("/directors/:directorId/movies/", async (Request, Response) => {
  const { directorId } = Request.params;
  const getMoviesQuery = `SELECT movie_name FROM movie WHERE director_id =${directorId}`;
  const getMovie = await db.all(getMoviesQuery);
  //   Response.send(
  //     getMovie.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  //   );
  Response.send(
    getMovie.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
  //   Response.send(getMovie);
});

module.exports = app;

