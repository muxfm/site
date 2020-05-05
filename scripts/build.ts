import { prompt } from "inquirer";
import { promises as fs } from "fs";
import { join } from "path";
import got from "got";

const build = async () => {
  const baseUrl: string = JSON.parse(
    (await fs.readFile(join(".", "package-example.json"))).toString()
  ).bulwark.apiUrl;

  const episodes = (
    await got.get<any[]>(`${baseUrl}/episodes/index.json`, {
      responseType: "json",
    })
  ).body;
  for await (const episode of episodes) {
    const title = episode.title["!"];
    const description = Array.isArray(episode.description)
      ? episode.description[1]
      : episode.description["!"];
    const date = new Date(episode.pubDate).toISOString();
    await fs.mkdir(join(".", "content", "episodes"), { recursive: true });
    await fs.writeFile(join(".", "content", "episodes"), "");
  }
};

build();
