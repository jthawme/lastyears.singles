exports.up = function (knex) {
  return knex.schema
    .createTable("searched", (table) => {
      table.increments();
      table.integer("song_id").unsigned().references("song.id");
      table.string("title");
      table.string("artist");
      table.string("source");
      table.integer("position");
    })
    .createTable("song", (table) => {
      table.increments();
      table.string("spotify_id");
      table.string("youtube_link");
      table.string("title");
      table.string("artists");
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("searched").dropTable("song");
};
