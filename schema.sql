create table Torrent (
  id integer primary key not null,
  name text,
  uri text,
  size text,
  release_date datetime,
  fetch_date datetime,
  author text,
  notify boolean,
  notify_date datetime
);