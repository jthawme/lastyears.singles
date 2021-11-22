exports.up = function (knex) {
  return knex.schema.table("song", (table) => {
    table.text("preview");
  });
};

exports.down = function (knex) {
  return knex.schema.table("song", (table) => {
    table.dropColumn("preview");
  });
};
