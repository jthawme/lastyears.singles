exports.up = function (knex) {
  return knex.schema.table("searched", (table) => {
    table.integer("year");
  });
};

exports.down = function (knex) {
  return knex.schema.table("searched", (table) => {
    table.dropColumn("year");
  });
};
