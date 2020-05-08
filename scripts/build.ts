import { prompt } from "inquirer";
import { promises as fs } from "fs";
import { join } from "path";
import got from "got";

const build = async () => {
  const baseUrl: string = JSON.parse(
    (await fs.readFile(join(".", "package.json"))).toString()
  ).bulwark.apiUrl;

  const episodes = (
    await got.get<any[]>(`${baseUrl}/episodes/index.json`, {
      responseType: "json",
    })
  ).body;
  for await (const episode of episodes) {
    const title = episode.title;
    const description = episode.description;
    console.log("Generate page for", title);
    const date = new Date(episode.pubDate).toISOString();
    await fs.writeFile(
      join(".", "content", "episodes", `${title}.md`),
      `---\ntitle: "${title}"\nlayout: page---\n\n# ${title}\n\n${description}`
    );
  }
};

build();
