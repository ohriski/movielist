export default async function handler(req, res) {
  const { endpoint, ...params } = req.query;
  const searchParams = new URLSearchParams(params).toString();
  const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.TMDB_KEY}&${searchParams}`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
}
