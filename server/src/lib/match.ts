const clean = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const makeMatchKey = (artists: string, title: string) =>
  { const artist = artists.split(",")[0] ?? "";

  return `${clean(artist)}|${clean(title)}`}; 